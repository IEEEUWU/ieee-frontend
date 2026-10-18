const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const { NextResponse } = require("next/server");
let cookie;
let calls;
function load(file, overrides) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const compiled = { exports: {} };
  new Function("require", "module", "exports", source)((name) => overrides[name] ?? require(name), compiled, compiled.exports);
  return compiled.exports;
}
const axiosMock = {
  async request(config) {
    const result = await global.fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data === undefined ? undefined : JSON.stringify(config.data),
    });
    return { status: result.status, data: await result.json() };
  },
  post(url, data, config) { return this.request({ ...config, url, data, method: "POST" }); },
};
const axiosModule = { default: axiosMock, AxiosHeaders: require("axios").AxiosHeaders };
const server = load("lib/auth/server.ts", { axios: axiosModule, "next/headers": { cookies: async () => ({ get: () => cookie ? { value: cookie } : undefined }) }, "next/server": { NextResponse } });
const users = load("lib/auth/user.ts", {});
const profile = load("lib/auth/profile.ts", { "@/lib/auth/server": server, "@/lib/auth/user": users });
const permissionShared = load("lib/permissions/shared.ts", {});
const permissionStore = load("lib/permissions/store.ts", {});
const permissionServer = load("lib/permissions/server.ts", { "@/lib/auth/server": server, "@/lib/auth/profile": profile, "./shared": permissionShared });
const userGroupShared = load("lib/usergroups/shared.ts", { "@/lib/permissions/shared": permissionShared });
function groupClient(fetcher, loader = async () => ({ data: [], last_page: 1 })) {
  return load("lib/usergroups/client.ts", { "@/lib/auth/client": { protectedFetch: fetcher }, "@/lib/permissions/client": { loadPermissionCatalogue: loader } });
}
test("group selection loads all permissions and sends numeric IDs", async () => {
  const pages = [];
  const client = groupClient(null, async (page) => { pages.push(page); return { last_page: 2, data: [{ id: page, permission_code: `CODE_${page}`, description: null }] }; });
  const permissions = await client.loadSelectablePermissions();
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(client.permissionValues([1, 2, 1]), [1, 2]);
  assert.deepEqual(permissions.map((permission) => permission.id), [1, 2]);
  assert.deepEqual(client.permissionValues([]), []);
});
test("group parser preserves assignments from IDs, codes, and relation records", () => {
  const client = groupClient(null);
  const base = { id: 1, group_name: "Treasurer", group_description: null };
  assert.deepEqual(client.parseUserGroup({ ...base, permissions: [1, "CODE", { id: 2, permission_code: "CODE_2" }] }).permissions, [1, "CODE", 2]);
  assert.equal(client.parseUserGroup(base).permissions, null);
  assert.deepEqual(client.parseUserGroup({ ...base, permissions: [] }).permissions, []);
  assert.throws(() => client.parseUserGroup({ ...base, permissions: [{}] }), /invalid permissions/);
});
test("group catalogue supports arrays and backend pagination", async () => {
  const group = { id: 1, group_name: "Treasurer", group_description: "Chapter treasurer", permissions: [1] };
  let payload = [group];
  const client = groupClient(async (url) => { assert.equal(url, "/api/usergroups?page=1"); return Response.json(payload); });
  assert.equal((await client.loadUserGroups()).total, 1);
  payload = { current_page: 1, last_page: 2, total: 25, from: 1, to: 15, data: [group] };
  assert.equal((await client.loadUserGroups()).last_page, 2);
  payload = { data: "invalid" };
  await assert.rejects(client.loadUserGroups(), /invalid catalogue/);
});
function groupHandler(codes, requests) {
  return load("lib/usergroups/server.ts", {
    "@/lib/auth/server": { ...server, protectedBackendRequest: async (path, options) => { requests.push({ path, options }); return Response.json({ message: "Saved" }); } },
    "@/lib/auth/profile": { currentUserResponse: async () => Response.json(permissionProfile(codes)) },
    "@/lib/permissions/shared": permissionShared,
  });
}
function groupRequest(path = "", method = "GET", body, origin = "http://localhost:3000") {
  return new Request(`http://localhost:3000/api/usergroups${path}`, { method, headers: { origin, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
}
test("group proxy maps all endpoints and preserves numeric permission IDs", async () => {
  const requests = [];
  const handler = groupHandler([...userGroupShared.USERGROUP_ACTIONS], requests);
  const create = { group_name: "Treasurer", group_description: "Chapter treasurer", permissions: [1, 2] };
  const update = { ...create, permissions: [2, 3] };
  assert.equal((await handler.handleUserGroupRequest(groupRequest("?page=2"))).status, 200);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("", "POST", create))).status, 200);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/7", "PUT", update), "7")).status, 200);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/7", "DELETE"), "7")).status, 200);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/assign-permissions", "POST", { user_group_id: 7, permissions: [1, 2] }), undefined, true)).status, 200);
  assert.deepEqual(requests.map((request) => [request.path, request.options.method]), [["/get-usergroups", "GET"], ["/create-usergroup", "POST"], ["/update-usergroup/7", "PUT"], ["/delete-usergroup/7", "DELETE"], ["/assign-usergroup-permissions", "POST"]]);
  assert.deepEqual(requests[0].options.params, { page: "2" });
  assert.deepEqual(requests[1].options.data, create);
  assert.deepEqual(requests[2].options.data, update);
  assert.deepEqual(requests[4].options.data, { user_group_id: 7, permissions: [1, 2] });
});
test("group proxy enforces action permissions before contacting backend", async () => {
  const requests = [];
  const handler = groupHandler([], requests);
  const body = { group_name: "Treasurer", group_description: null, permissions: [] };
  for (const [method, id] of [["GET"], ["POST"], ["PUT", "7"], ["DELETE", "7"]]) assert.equal((await handler.handleUserGroupRequest(groupRequest(id ? `/${id}` : "", method, ["POST", "PUT"].includes(method) ? body : undefined), id)).status, 403);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/assign-permissions", "POST", { user_group_id: 7, permissions: [] }), undefined, true)).status, 403);
  assert.equal(requests.length, 0);
  assert.equal(userGroupShared.canManageUserGroups(permissionProfile([])), false);
  assert.equal(userGroupShared.canManageUserGroups(permissionProfile(["ASSIGN_USERGROUP_PERMISSIONS"])), true);
});
test("group proxy rejects permission codes, invalid IDs, and cross-origin writes", async () => {
  const requests = [];
  const handler = groupHandler([...userGroupShared.USERGROUP_ACTIONS], requests);
  const body = { group_name: "Treasurer", group_description: null, permissions: ["CODE"] };
  assert.equal((await handler.handleUserGroupRequest(groupRequest("", "POST", body))).status, 422);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/7", "PUT", body), "7")).status, 422);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/assign-permissions", "POST", { user_group_id: 0, permissions: [] }), undefined, true)).status, 422);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/bad", "DELETE"), "bad")).status, 422);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("?page=-1"))).status, 422);
  assert.equal((await handler.handleUserGroupRequest(groupRequest("/7", "DELETE", undefined, "https://other.example"), "7")).status, 403);
  assert.equal(requests.length, 0);
});
test("permission catalogue loads only the requested page and preserves pagination metadata", async () => {
  const requests = [];
  const signal = new AbortController().signal;
  const client = load("lib/permissions/client.ts", { "@/lib/auth/client": { protectedFetch: async (url, options) => {
    requests.push(url);
    assert.equal(options.signal, signal);
    const page = Number(new URL(url, "http://localhost:3000").searchParams.get("page"));
    return Response.json({ current_page: page, last_page: 2, per_page: 15, total: 25, from: page === 1 ? 1 : 16, to: page === 1 ? 15 : 25, data: [{ id: page, permission_code: `CODE_${page}`, description: null }] });
  } } });
  const first = await client.loadPermissionCatalogue(1, signal);
  assert.deepEqual(first.data.map((item) => item.id), [1]);
  assert.equal(first.total, 25);
  assert.equal(first.last_page, 2);
  assert.deepEqual(requests, ["/api/permissions?page=1"]);
  const second = await client.loadPermissionCatalogue(2, signal);
  assert.equal(second.current_page, 2);
  assert.equal(second.from, 16);
  assert.equal(second.to, 25);
  assert.deepEqual(requests, ["/api/permissions?page=1", "/api/permissions?page=2"]);
});
test("permission catalogue accepts empty pages and rejects malformed pagination", async () => {
  let payload = { current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null, data: [] };
  const client = load("lib/permissions/client.ts", { "@/lib/auth/client": { protectedFetch: async () => Response.json(payload) } });
  assert.deepEqual(await client.loadPermissionCatalogue(), payload);
  payload = { current_page: 1, last_page: 2, data: "invalid" };
  await assert.rejects(client.loadPermissionCatalogue(), /invalid catalogue/);
  payload = { current_page: 2, last_page: 2, data: [] };
  await assert.rejects(client.loadPermissionCatalogue(), /invalid catalogue/);
  payload = { current_page: 2, last_page: 1, per_page: 15, total: 15, from: null, to: null, data: [] };
  assert.equal((await client.loadPermissionCatalogue(2)).last_page, 1);
});
test("permission proxy forwards validated catalogue page numbers", async () => {
  const requests = [];
  const handler = load("lib/permissions/server.ts", {
    "@/lib/auth/server": { ...server, protectedBackendRequest: async (path, options) => { requests.push({ path, options }); return Response.json({ data: [] }); } },
    "@/lib/auth/profile": { currentUserResponse: async () => Response.json(permissionProfile(["VIEW_PERMISSIONS"])) },
    "./shared": permissionShared,
  });
  const result = await handler.handlePermissionRequest(new Request("http://localhost:3000/api/permissions?page=2"));
  assert.equal(result.status, 200);
  assert.deepEqual(requests[0].options.params, { page: "2" });
  assert.equal(requests[0].path, "/get-permissions");
  assert.equal((await handler.handlePermissionRequest(new Request("http://localhost:3000/api/permissions?page=-1"))).status, 422);
  assert.equal(requests.length, 1);
});
const route = load("app/api/auth/[action]/route.ts", { "@/lib/auth/server": server, "@/lib/auth/profile": profile });
const context = (action) => ({ params: Promise.resolve({ action }) });
const request = (action, body, origin = "http://localhost:3000") => new Request(`http://localhost:3000/api/auth/${action}`, { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
beforeEach(() => {
  process.env.AUTH_API_BASE_URL = "https://backend.example.test/api/";
  cookie = undefined;
  calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ access_token: "test-secret-token", token_type: "bearer", expires_in: 3600 });
  };
});
test("login sends credentials, sets HttpOnly cookie, and never exposes token in JSON", async () => {
  const response = await route.POST(request("login", { email: "admin@example.com", password: "test-password" }), context("login"));
  assert.equal(response.status, 200);
  assert.equal(calls[0].url, "https://backend.example.test/api/auth/login");
  const data = await response.json();
  assert.equal(data.authenticated, true);
  assert.ok(data.expiresAt > Date.now());
  assert.equal(data.access_token, undefined);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(response.headers.get("set-cookie"), /SameSite=lax/i);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: "admin@example.com", password: "test-password" });
});
test("login preserves backend invalid credential and suspended errors", async () => {
  for (const status of [401, 403, 422]) {
    global.fetch = async () => Response.json({ error: "Backend error" }, { status });
    const response = await route.POST(request("login", { email: "admin@example.com", password: "x" }), context("login"));
    assert.equal(response.status, status);
    assert.equal((await response.json()).error, "Backend error");
    assert.equal(response.headers.get("set-cookie"), null);
  }
});
test("refresh rotates token with bearer authorization and no body", async () => {
  cookie = JSON.stringify({ token: "old-token", expiresAt: Date.now() + 60000 });
  const response = await route.POST(request("refresh"), context("refresh"));
  assert.equal(response.status, 200);
  assert.equal(calls[0].init.headers.Authorization, "Bearer old-token");
  assert.equal(calls[0].init.body, undefined);
  assert.match(response.headers.get("set-cookie"), /test-secret-token/);
});
test("expired sessions cannot refresh and 401 refresh clears the cookie", async () => {
  cookie = JSON.stringify({ token: "old-token", expiresAt: Date.now() - 1 });
  let response = await route.POST(request("refresh"), context("refresh"));
  assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
  cookie = JSON.stringify({ token: "old-token", expiresAt: Date.now() + 60000 });
  global.fetch = async () => Response.json({ error: "Unauthenticated" }, { status: 401 });
  response = await route.POST(request("refresh"), context("refresh"));
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});
test("logout clears cookie even when backend fails", async () => {
  cookie = JSON.stringify({ token: "old-token", expiresAt: Date.now() + 60000 });
  global.fetch = async () => { throw new Error("offline"); };
  const response = await route.POST(request("logout"), context("logout"));
  assert.equal(response.status, 502);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});
test("cross-origin mutations and malformed login requests are rejected", async () => {
  assert.equal((await route.POST(request("login", {}, "http://other.example"), context("login"))).status, 403);
  assert.equal((await route.POST(request("login", { email: "invalid", password: "x" }), context("login"))).status, 422);
  assert.equal(calls.length, 0);
});
test("protected backend requests inject bearer and clear cookie on 401", async () => {
  cookie = JSON.stringify({ token: "old-token", expiresAt: Date.now() + 60000 });
  global.fetch = async (_url, init) => {
    assert.equal(init.headers.get("Authorization"), "Bearer old-token");
    return Response.json({ error: "Unauthenticated" }, { status: 401 });
  };
  const response = await server.protectedBackendRequest("/protected");
  assert.equal(response.status, 401);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});
test("session endpoint returns expiry without token", async () => {
  cookie = JSON.stringify({ token: "old-token", expiresAt: Date.now() + 60000 });
  const response = await route.GET(new Request("http://localhost:3000/api/auth/session"), context("session"));
  const data = await response.json();
  assert.equal(data.authenticated, true);
  assert.equal(data.token, undefined);
});

test("all backend requests use the configured base URL", async () => {
  process.env.AUTH_API_BASE_URL = "https://configured.example.test/v2/api///";
  await server.backendAuth("login", undefined, { email: "admin@example.com", password: "x" });
  await server.backendAuth("refresh", "test-token");
  await server.backendAuth("logout", "test-token");
  cookie = JSON.stringify({ token: "test-token", expiresAt: Date.now() + 60000 });
  await server.protectedBackendRequest("/events");
  assert.deepEqual(calls.map((call) => call.url), [
    "https://configured.example.test/v2/api/auth/login",
    "https://configured.example.test/v2/api/auth/refresh",
    "https://configured.example.test/v2/api/auth/logout",
    "https://configured.example.test/v2/api/events",
  ]);
});
test("missing or invalid backend configuration never falls back to localhost", async () => {
  for (const value of [undefined, "", "   ", "file:///api", "https://example.test/api?key=value"]) {
    if (value === undefined) delete process.env.AUTH_API_BASE_URL;
    else process.env.AUTH_API_BASE_URL = value;
    await assert.rejects(() => server.backendAuth("login"));
  }
  assert.equal(calls.length, 0);
});
test("me fetches the backend profile with cookie bearer authorization", async () => {
  cookie = JSON.stringify({ token: "profile-token", expiresAt: Date.now() + 60000 });
  global.fetch = async (url, init) => {
    assert.equal(url, "https://backend.example.test/api/auth/me");
    assert.equal(init.method, "GET");
    assert.equal(init.headers.get("Authorization"), "Bearer profile-token");
    return Response.json({ id: 1, first_name: "Sanjeewa", last_name: "Liyanage", enrollment_number: "UWU/IIT/22/021", email: "admin@example.com", chapter: "SB", user_group_id: 1, status: "active", effective_permissions: [], access_token: "must-not-be-forwarded" });
  };
  const response = await route.GET(new Request("http://localhost:3000/api/auth/me"), context("me"));
  assert.equal(response.status, 200);
  const profile = await response.json();
  assert.equal(profile.first_name, "Sanjeewa");
  assert.equal(profile.chapter, "SB");
  assert.equal(profile.role, "webmaster");
  assert.equal(profile.access_token, undefined);
});
test("all three roles resolve correctly for all five chapters", () => {
  for (const chapter of ["SB", "IAS", "CS", "WIE", "RAS"]) {
    for (const [groupId, role] of [[1, "webmaster"], [2, "chair"], [3, "secretary"]]) {
      const profile = users.parseAuthUser({ id: 7, first_name: "Test", last_name: "User", enrollment_number: "UWU/TEST", email: "test@example.com", chapter, user_group_id: groupId, status: "active" });
      assert.equal(profile.role, role);
      assert.equal(profile.chapter, chapter);
    }
  }
  assert.equal(users.resolveDashboardRole(99), null);
  assert.equal(users.parseAuthUser({ chapter: "INVALID" }), null);
});
test("me rejects expired, backend-rejected, suspended, and malformed accounts", async () => {
  let response = await route.GET(new Request("http://localhost:3000/api/auth/me"), context("me"));
  assert.equal(response.status, 401);
  cookie = JSON.stringify({ token: "profile-token", expiresAt: Date.now() + 60000 });
  global.fetch = async () => Response.json({ error: "Unauthenticated" }, { status: 401 });
  response = await route.GET(new Request("http://localhost:3000/api/auth/me"), context("me"));
  assert.equal(response.status, 401);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
  global.fetch = async () => Response.json({ id: 1, first_name: "Test", last_name: "User", enrollment_number: "UWU/TEST", email: "test@example.com", chapter: "CS", user_group_id: 1, status: "suspended" });
  response = await route.GET(new Request("http://localhost:3000/api/auth/me"), context("me"));
  assert.equal(response.status, 403);
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
  global.fetch = async () => Response.json({ unexpected: true });
  response = await route.GET(new Request("http://localhost:3000/api/auth/me"), context("me"));
  assert.equal(response.status, 502);
});
test("anonymous session checks do not delete a cookie set by concurrent login", async () => {
  const response = await route.GET(new Request("http://localhost:3000/api/auth/session"), context("session"));
  assert.equal((await response.json()).authenticated, false);
  assert.equal(response.headers.get("set-cookie"), null);
});
test("delayed session bootstrap cannot overwrite login, logout, or pending login", () => {
  const auth = load("lib/auth/store.ts", { "@/lib/permissions/store": permissionStore });
  const store = auth.makeStore();
  store.dispatch(auth.pendingChanged(true));
  store.dispatch(auth.sessionInitialized({ authenticated: false }));
  assert.equal(store.getState().auth.status, "loading");
  store.dispatch(auth.sessionReceived({ authenticated: true, expiresAt: Date.now() + 3600000 }));
  store.dispatch(auth.pendingChanged(false));
  store.dispatch(auth.sessionInitialized({ authenticated: false }));
  assert.equal(store.getState().auth.status, "authenticated");
  store.dispatch(auth.sessionCleared());
  store.dispatch(auth.sessionInitialized({ authenticated: true, expiresAt: Date.now() + 3600000 }));
  assert.equal(store.getState().auth.status, "anonymous");
});
function permissionProfile(codes, group = 1, chapter = "SB") {
  return { id: 1, first_name: "Test", last_name: "User", enrollment_number: "UWU/TEST", email: "admin@example.com", chapter, user_group_id: group, status: "active", effective_permissions: codes };
}
function permissionReq(method = "GET", id, body, origin = "http://localhost:3000") {
  return new Request(`http://localhost:3000/api/permissions${id ? "/" + id : ""}`, { method, headers: { origin, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}
test("permission access follows backend codes, never role or chapter", () => {
  const webmaster = users.parseAuthUser(permissionProfile([]));
  assert.equal(permissionShared.canManagePermissions(webmaster), false);
  assert.equal(permissionShared.hasPermission(webmaster, "DELETE_PERMISSION"), false);
  const chair = users.parseAuthUser(permissionProfile(["VIEW_PERMISSIONS"], 2, "WIE"));
  assert.equal(permissionShared.canManagePermissions(chair), true);
  assert.equal(permissionShared.hasPermission(chair, "VIEW_PERMISSIONS"), true);
  assert.equal(permissionShared.hasPermission(chair, "UPDATE_PERMISSION"), false);
});
test("current-user permission fallback uses only the authenticated user ID", async () => {
  cookie = JSON.stringify({ token: "test-token", expiresAt: Date.now() + 60000 });
  const paths = [];
  global.fetch = async (url, init) => {
    paths.push(url);
    assert.equal(init.headers.get("Authorization"), "Bearer test-token");
    if (url.endsWith("/auth/me")) { const data = permissionProfile([]); delete data.effective_permissions; return Response.json(data); }
    assert.ok(url.endsWith("/get-user/1"));
    return Response.json(permissionProfile(["CREATE_PERMISSION", "VIEW_PERMISSIONS"]));
  };
  const result = await profile.currentUserResponse();
  assert.deepEqual((await result.json()).effective_permissions, ["CREATE_PERMISSION", "VIEW_PERMISSIONS"]);
  assert.equal(paths.length, 2);
});
test("all CRUD routes send the matching method, payload, and bearer header", async () => {
  cookie = JSON.stringify({ token: "test-token", expiresAt: Date.now() + 60000 });
  const actions = [];
  global.fetch = async (url, init) => {
    assert.equal(init.headers.get("Authorization"), "Bearer test-token");
    if (url.endsWith("/auth/me")) return Response.json(permissionProfile([...permissionShared.PERMISSION_ACTIONS]));
    actions.push({ url, method: init.method, body: init.body });
    return Response.json({ message: "Success" });
  };
  const body = { permission_code: "EXAMPLE_PERMISSION", description: "Example" };
  for (const [method, id] of [["GET", undefined], ["GET", "7"], ["POST", undefined], ["PUT", "7"], ["DELETE", "7"]]) {
    const result = await permissionServer.handlePermissionRequest(permissionReq(method, id, ["POST", "PUT"].includes(method) ? body : undefined), id);
    assert.equal(result.status, 200);
  }
  assert.deepEqual(actions.map(({ url, method }) => [url.split("/api")[1], method]), [["/get-permissions", "GET"], ["/get-permission/7", "GET"], ["/create-permission", "POST"], ["/update-permission/7", "PUT"], ["/delete-permission/7", "DELETE"]]);
  assert.deepEqual(JSON.parse(actions[2].body), body);
  assert.deepEqual(JSON.parse(actions[3].body), body);
  assert.equal(actions[4].body, undefined);
});
test("server rejects each missing permission before issuing CRUD requests", async () => {
  cookie = JSON.stringify({ token: "test-token", expiresAt: Date.now() + 60000 });
  global.fetch = async (url) => { assert.ok(url.endsWith("/auth/me")); return Response.json(permissionProfile([])); };
  const body = { permission_code: "EXAMPLE", description: "Example" };
  for (const [method, id] of [["GET", undefined], ["POST", undefined], ["PUT", "7"], ["DELETE", "7"]]) {
    const result = await permissionServer.handlePermissionRequest(permissionReq(method, id, ["POST", "PUT"].includes(method) ? body : undefined), id);
    assert.equal(result.status, 403);
    assert.equal(result.headers.get("set-cookie"), null);
  }
});
test("permission routes reject cross-origin mutations, invalid IDs, and empty codes", async () => {
  assert.equal((await permissionServer.handlePermissionRequest(permissionReq("DELETE", "7", undefined, "https://other.example"), "7")).status, 403);
  assert.equal((await permissionServer.handlePermissionRequest(permissionReq("GET", "bad"), "bad")).status, 422);
  cookie = JSON.stringify({ token: "test-token", expiresAt: Date.now() + 60000 });
  global.fetch = async () => Response.json(permissionProfile(["CREATE_PERMISSION"]));
  assert.equal((await permissionServer.handlePermissionRequest(permissionReq("POST", undefined, { permission_code: " ", description: "Example" }))).status, 422);
});
test("permission validation errors are shown and failed delete preserves the session", async () => {
  cookie = JSON.stringify({ token: "test-token", expiresAt: Date.now() + 60000 });
  global.fetch = async (url) => url.endsWith("/auth/me") ? Response.json(permissionProfile([...permissionShared.PERMISSION_ACTIONS])) : Response.json({ errors: { permission_code: ["Code already exists."] } }, { status: 422 });
  let result = await permissionServer.handlePermissionRequest(permissionReq("POST", undefined, { permission_code: "EXAMPLE", description: "Example" }));
  assert.equal((await result.json()).error, "Code already exists.");
  global.fetch = async (url) => url.endsWith("/auth/me") ? Response.json(permissionProfile([...permissionShared.PERMISSION_ACTIONS])) : Response.json({ message: "Permission is in use." }, { status: 403 });
  result = await permissionServer.handlePermissionRequest(permissionReq("DELETE", "7"), "7");
  assert.equal(result.status, 403);
  assert.equal(result.headers.get("set-cookie"), null);
});
test("permission 403 responses do not log the client out", async () => {
  const client = load("lib/auth/client.ts", { axios: axiosModule });
  const oldWindow = global.window;
  let expired = false;
  global.window = { location: { origin: "http://localhost:3000" }, dispatchEvent: () => { expired = true; } };
  global.fetch = async (url) => url === "/api/auth/session" ? Response.json({ authenticated: true, expiresAt: Date.now() + 3600000 }) : Response.json({ error: "Forbidden" }, { status: 403 });
  try { const result = await client.protectedFetch("/api/permissions"); assert.equal(result.status, 403); assert.equal(expired, false); }
  finally { global.window = oldWindow; }
});

test("edit requests resolve permission codes to IDs before sending", async () => {
  const requests = [];
  const client = groupClient(async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return Response.json({ message: "Saved" });
  }, async () => ({ last_page: 1, data: [
    { id: 7, permission_code: "VIEW_USERS", description: null },
    { id: 12, permission_code: "VIEW_EVENTS", description: null },
  ] }));
  const body = { group_name: "Secretary", group_description: "Secretary rights", permissions: ["VIEW_USERS", "VIEW_EVENTS", "VIEW_USERS"] };
  await client.userGroupRequest("/3", "PUT", body);
  assert.deepEqual(requests[0], { url: "/api/usergroups/3", body: { ...body, permissions: [7, 12] } });
  await client.userGroupRequest("/3", "PUT", { ...body, permissions: [7, 12] });
  assert.deepEqual(requests[1].body.permissions, [7, 12]);
  await assert.rejects(client.userGroupRequest("/3", "PUT", { ...body, permissions: ["UNKNOWN_CODE"] }), /unavailable/);
  assert.equal(requests.length, 2);
});
