const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, overrides = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', source)((name) => overrides[name] ?? require(name), compiled, compiled.exports);
  return compiled.exports;
}
const shared = load('lib/events/shared.ts');
const admin = load('lib/events/admin-shared.ts', { './shared': shared });
const cover = load('lib/events/cover.ts');
const permissions = load('lib/permissions/shared.ts');
const valid = { title: 'AI Workshop', chapter: 'CS', description: 'Learn AI', cover_image: '/images/ai.jpg', start_date: '2026-12-01T09:00:00+05:30', end_date: '2026-12-01T13:00:00+05:30', mode: 'PHYSICAL', venue: 'Auditorium', contact_email: 'events@example.com', contact_phone: '+94770000000', status: 'DRAFT', max_participants: 100, is_registration_open: false, is_oc_open: false };
function handler({ codes = ['CREATE_EVENT'], profileStatus = 200, backendStatus = 201, backendBody = { message: 'Created', data: { id: 7, slug: 'ai-workshop-1' } } } = {}) {
  const requests = [];
  const server = load('lib/events/admin-server.ts', {
    '@/lib/auth/profile': { currentUserResponse: async () => Response.json({ id: 1, chapter: 'CS', status: 'active', effective_permissions: codes }, { status: profileStatus }) },
    '@/lib/auth/server': { json: (body, status = 200) => Response.json(body, { status }), sameOrigin: (request) => request.headers.get('origin') === new URL(request.url).origin, protectedBackendRequest: async (path, options) => { requests.push({ path, options }); return Response.json(backendBody, { status: backendStatus }); } },
    '@/lib/permissions/shared': permissions, './shared': shared, './cover': cover, './admin-shared': admin,
  });
  return { ...server, requests };
}
function request(method, body, query = '', origin = 'http://localhost:3000') { return new Request('http://localhost:3000/api/events' + query, { method, headers: { origin, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); }
test('create event converts Sri Lanka inputs to UTC independently of browser timezone', () => {
  assert.equal(admin.colomboInputToUTC('2026-12-01T09:00'), '2026-12-01T03:30:00.000Z');
  assert.equal(admin.colomboInputToUTC('2026-12-01T01:00'), '2026-11-30T19:30:00.000Z');
  for (const date of ['', 'invalid', '2026-02-31T09:00', '2026-12-01T25:00']) assert.equal(admin.colomboInputToUTC(date), '');
});
test('create validation normalizes documented payload and preserves false flags', () => {
  const data = admin.validateCreateEvent({ ...valid, title: ' AI Workshop ', slug: 'untrusted-client-slug' });
  assert.equal(data.title, 'AI Workshop'); assert.equal(data.start_date, '2026-12-01T03:30:00.000Z');
  assert.equal(data.end_date, '2026-12-01T07:30:00.000Z'); assert.equal(data.is_registration_open, false);
  assert.equal(data.slug, undefined);
  const defaults = admin.validateCreateEvent({ title: 'Minimal', chapter: 'CS', start_date: valid.start_date, end_date: valid.end_date, mode: 'ONLINE' });
  assert.equal(defaults.status, 'DRAFT'); assert.equal(defaults.max_participants, null); assert.equal(defaults.venue, null);
  assert.equal(defaults.is_oc_open, false);
  assert.equal(admin.validateCreateEvent({ ...valid, status: 'PUBLISHED' }).status, 'PUBLISHED');
});
test('create validation rejects invalid fields, dates, capacity and unsafe covers', () => {
  for (const changes of [{ title: '' }, { title: 'x'.repeat(256) }, { chapter: 'OTHER' }, { mode: 'VIRTUAL' }, { status: 'ARCHIVED' }, { start_date: '2026-12-01T09:00' }, { end_date: '2020-01-01T00:00:00Z' }, { contact_email: 'invalid' }, { contact_phone: 'x'.repeat(51) }, { max_participants: 0 }, { max_participants: 1.5 }, { max_participants: '100' }, { is_registration_open: null }, { is_oc_open: 'false' }, { cover_image: 'javascript:alert(1)' }, { cover_image: '//unknown.example/image' }]) assert.throws(() => admin.validateCreateEvent({ ...valid, ...changes }), admin.EventValidationError);
});
test('POST proxy forwards numeric capacity, boolean flags and UTC body to /events', async () => {
  const api = handler(); const response = await api.handleAdminEvents(request('POST', valid));
  assert.equal(response.status, 201); assert.equal((await response.json()).data.slug, 'ai-workshop-1');
  assert.equal(api.requests.length, 1); assert.equal(api.requests[0].path, '/events');
  assert.equal(api.requests[0].options.method, 'POST'); assert.deepEqual(api.requests[0].options.data, admin.validateCreateEvent(valid));
});
test('POST rejects missing CREATE_EVENT, anonymous profiles and cross-origin writes before backend call', async () => {
  for (const options of [{ codes: [] }, { profileStatus: 401 }]) {
    const api = handler(options); const response = await api.handleAdminEvents(request('POST', valid));
    assert.equal(response.status, options.profileStatus ?? 403); assert.equal(api.requests.length, 0);
  }
  const api = handler(); assert.equal((await api.handleAdminEvents(request('POST', valid, '', 'https://external.example'))).status, 403); assert.equal(api.requests.length, 0);
});
test('server rejects malformed create input with field validation errors', async () => {
  const api = handler(); const response = await api.handleAdminEvents(request('POST', { ...valid, title: '', max_participants: -1 }));
  assert.equal(response.status, 422); const result = await response.json(); assert.ok(result.errors.title); assert.ok(result.errors.max_participants); assert.equal(api.requests.length, 0);
  assert.equal((await api.handleAdminEvents(request('POST', null))).status, 422);
});
test('backend field errors and chapter restrictions reach the form; internal failures remain friendly', async () => {
  const validation = handler({ backendStatus: 422, backendBody: { message: 'Validation failed', errors: { title: ['Title already exists.'] } } });
  const response = await validation.handleAdminEvents(request('POST', valid)); assert.equal(response.status, 422); assert.deepEqual((await response.json()).errors, { title: ['Title already exists.'] });
  const forbidden = handler({ backendStatus: 403, backendBody: { error: 'Forbidden', message: 'You can only create events for your assigned chapter (CS).' } });
  assert.match((await (await forbidden.handleAdminEvents(request('POST', valid))).json()).error, /assigned chapter/);
  const unavailable = handler({ backendStatus: 500, backendBody: { message: 'SQL database details' } });
  assert.doesNotMatch((await (await unavailable.handleAdminEvents(request('POST', valid))).json()).error, /SQL/);
});
test('admin GET includes drafts, preserves filters, and relies on backend chapter scope', async () => {
  const api = handler({ codes: [], backendStatus: 200, backendBody: { data: [] } });
  const response = await api.handleAdminEvents(request('GET', undefined, '?page=2&per_page=15&chapter=CS&status=DRAFT&search=AI'));
  assert.equal(response.status, 200); assert.deepEqual(api.requests[0], { path: '/events', options: { method: 'GET', params: { page: '2', per_page: '15', chapter: 'CS', status: 'DRAFT', search: 'AI' } } });
  for (const query of ['?page=-1', '?per_page=1000', '?chapter=INVALID', '?status=other']) assert.equal((await api.handleAdminEvents(request('GET', undefined, query))).status, 422);
  assert.equal(api.requests.length, 1);
});
test('admin catalogue accepts draft events that public catalogue rejects', () => {
  const event = { ...valid, id: 7, slug: 'ai-workshop', status: 'DRAFT' };
  assert.equal(admin.parseAdminEvent(event).status, 'DRAFT');
  assert.throws(() => shared.parsePublicEvent(event));
  assert.throws(() => admin.parseAdminEvent({ ...event, status: 'INVALID' }));
  assert.equal(admin.parseAdminEventPage({ current_page: 1, last_page: 1, per_page: 15, total: 1, from: 1, to: 1, data: [event] }, 1).data[0].status, 'DRAFT');
});
test('admin client sends POST JSON and exposes field validation errors', async () => {
  const requests = [];
  const client = load('lib/events/admin-client.ts', { '@/lib/auth/client': { protectedFetch: async (path, options) => { requests.push({ path, options }); return Response.json({ errors: { title: ['Required.'] }, error: 'Check details.' }, { status: 422 }); } }, './cover': cover, './admin-shared': admin });
  const body = admin.validateCreateEvent(valid);
  await assert.rejects(client.adminEventRequest('', body), (error) => error.fields.title === 'Required.');
  assert.equal(requests[0].path, '/api/events'); assert.equal(requests[0].options.method, 'POST'); assert.deepEqual(JSON.parse(requests[0].options.body), body);
});

test('create proxy uses the configured backend URL and server cookie bearer token', async () => {
  const previousBase = process.env.AUTH_API_BASE_URL;
  const requests = [];
  const auth = load('lib/auth/server.ts', {
    axios: { default: { request: async (options) => { requests.push(options); return { status: 201, data: { message: 'Created', data: { id: 7, slug: 'backend-slug' } } }; } }, AxiosHeaders: require('axios').AxiosHeaders },
    'next/headers': { cookies: async () => ({ get: () => ({ value: JSON.stringify({ token: 'test-server-token', expiresAt: Date.now() + 60000 }) }) }) },
  });
  const api = load('lib/events/admin-server.ts', {
    '@/lib/auth/profile': { currentUserResponse: async () => Response.json({ id: 1, chapter: 'CS', status: 'active', effective_permissions: ['CREATE_EVENT'] }) },
    '@/lib/auth/server': auth, '@/lib/permissions/shared': permissions, './shared': shared, './cover': cover, './admin-shared': admin,
  });
  try {
    process.env.AUTH_API_BASE_URL = 'https://configured.example.test/v2/api/';
    const response = await api.handleAdminEvents(request('POST', valid));
    assert.equal(response.status, 201);
    assert.equal(requests[0].url, 'https://configured.example.test/v2/api/events');
    assert.equal(requests[0].headers.get('Authorization'), 'Bearer test-server-token');
    assert.equal(requests[0].headers.get('Accept'), 'application/json');
    assert.equal(requests[0].data.chapter, 'CS'); assert.equal(requests[0].data.is_registration_open, false);
    assert.equal((await response.json()).data.slug, 'backend-slug');
  } finally { if (previousBase === undefined) delete process.env.AUTH_API_BASE_URL; else process.env.AUTH_API_BASE_URL = previousBase; }
});
test('create validation rejects impossible calendar days on the server', () => {
  assert.throws(() => admin.validateCreateEvent({ ...valid, start_date: '2026-02-31T09:00:00Z' }), (error) => Boolean(error.fields.start_date));
});
test('authenticated profile exposes actual group name independently of group ID', () => {
  const users = load('lib/auth/user.ts');
  const user = users.parseAuthUser({ id: 1, first_name: 'Test', last_name: 'Admin', email: 'admin@example.com', enrollment_number: 'TEST/1', chapter: 'SB', user_group_id: 91, user_group: { group_name: 'WebMaster' }, status: 'active', effective_permissions: ['CREATE_EVENT'] });
  assert.equal(user.user_group_name, 'WebMaster');
});

test('multipart encodes booleans and nulls, includes file bytes, and omits response-only fields', async () => {
  const file = new File([Buffer.from('image bytes')], 'cover.png', { type: 'image/png' });
  const form = cover.eventMultipart({ ...valid, cover_image: 'events/covers/7/old.png', cover_image_url: 'https://cdn.example.test/old.png', created_by: 1, is_registration_open: true, max_participants: null }, { file, remove: false }, true);
  assert.equal(form.get('_method'), 'PUT'); assert.equal(form.get('is_registration_open'), '1'); assert.equal(form.get('is_oc_open'), '0'); assert.equal(form.get('max_participants'), '');
  for (const key of ['cover_image', 'cover_image_url', 'status', 'created_by']) assert.equal(form.has(key), false);
  assert.equal(form.get('cover_image_file').name, 'cover.png');
  assert.equal(await form.get('cover_image_file').text(), 'image bytes');
  assert.throws(() => cover.eventMultipart({}, { file, remove: true }), /either/);
});
test('cover validation rejects unsupported MIME, empty and oversized files', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.doesNotThrow(() => cover.validateCoverFile({ type, size: 5 * 1024 * 1024 }));
  for (const file of [{ type: 'image/svg+xml', size: 20 }, { type: 'image/gif', size: 20 }, { type: 'application/pdf', size: 20 }, { type: 'image/png', size: 0 }, { type: 'image/png', size: 5 * 1024 * 1024 + 1 }]) assert.throws(() => cover.validateCoverFile(file));
});
test('browser image validation checks dimensions and releases object URLs on success and failure', async () => {
  const previousImage = global.Image; const originalCreate = URL.createObjectURL; const originalRevoke = URL.revokeObjectURL;
  const revoked = [];
  URL.createObjectURL = () => 'blob:test-preview'; URL.revokeObjectURL = (url) => revoked.push(url);
  let width = 6000; let decodeFails = false;
  global.Image = class { constructor() { this.naturalWidth = width; this.naturalHeight = 6000; } async decode() { if (decodeFails) throw Error('bad image'); } };
  try {
    const file = new File(['bytes'], 'image.png', { type: 'image/png' });
    await cover.validateCover(file); width = 6001;
    await assert.rejects(cover.validateCover(file), /6000/);
    decodeFails = true; await assert.rejects(cover.validateCover(file), /could not be read/);
    assert.deepEqual(revoked, ['blob:test-preview', 'blob:test-preview', 'blob:test-preview']);
  } finally { if (previousImage === undefined) delete global.Image; else global.Image = previousImage; URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke; }
});
test('multipart create and update proxy preserve uploads and Laravel method override', async () => {
  const api = handler({ codes: ['CREATE_EVENT', 'UPDATE_EVENT'] });
  const file = new File(['binary bytes'], 'cover.webp', { type: 'image/webp' });
  for (const id of [undefined, '7']) {
    const fields = admin.validateCreateEvent(valid); if (id) delete fields.status;
    const form = cover.eventMultipart(fields, { file, remove: false }, Boolean(id));
    const response = await api.handleAdminEvents(new Request('http://localhost:3000/api/events' + (id ? '/7' : ''), { method: 'POST', headers: { origin: 'http://localhost:3000' }, body: form }), id);
    assert.equal(response.status, 201);
    const sent = api.requests.at(-1); assert.equal(sent.path, id ? '/events/7' : '/events'); assert.equal(sent.options.method, 'POST');
    assert.ok(sent.options.data instanceof FormData); assert.equal(sent.options.headers, undefined);
    assert.equal(sent.options.data.get('is_registration_open'), '0'); assert.equal(sent.options.data.get('_method'), id ? 'PUT' : null);
    assert.equal(await sent.options.data.get('cover_image_file').text(), 'binary bytes');
  }
});
test('JSON metadata edit preserves cover and removal uses explicit flag with UPDATE_EVENT', async () => {
  const api = handler({ codes: ['UPDATE_EVENT'], backendStatus: 200 });
  const fields = { description: 'Updated', start_date: valid.start_date, end_date: valid.end_date };
  assert.equal((await api.handleAdminEvents(request('PUT', fields), '7')).status, 200);
  assert.equal(api.requests[0].options.method, 'PUT'); assert.equal(Object.hasOwn(api.requests[0].options.data, 'cover_image'), false);
  assert.equal((await api.handleAdminEvents(request('PUT', { remove_cover_image: true }), '7')).status, 200);
  assert.deepEqual(api.requests[1].options.data, { remove_cover_image: true });
  const forbidden = handler({ codes: ['CREATE_EVENT'] });
  assert.equal((await forbidden.handleAdminEvents(request('PUT', { remove_cover_image: true }), '7')).status, 403); assert.equal(forbidden.requests.length, 0);
  assert.equal((await api.handleAdminEvents(request('GET'), '../bad')).status, 422);
  assert.equal((await api.handleAdminEvents(request('GET'), '7')).status, 200);
  assert.equal(api.requests.at(-1).path, '/events/7');
});
test('server rejects image conflicts, malformed files, reserved legacy paths, and status edits', async () => {
  const api = handler({ codes: ['CREATE_EVENT', 'UPDATE_EVENT'] });
  const file = new File(['bytes'], 'image.png', { type: 'image/png' });
  const form = cover.eventMultipart({}, { file, remove: false }, true); form.set('remove_cover_image', '1');
  assert.equal((await api.handleAdminEvents(new Request('http://localhost:3000/api/events/7', { method: 'POST', headers: { origin: 'http://localhost:3000' }, body: form }), '7')).status, 422);
  for (const body of [{ cover_image_file: {} }, { remove_cover_image: 'true' }, { status: 'PUBLISHED' }, { start_date: valid.start_date }, { cover_image: 'events/covers/7/old.png' }, { cover_image: '/storage/events/covers/7/old.png' }]) assert.equal((await api.handleAdminEvents(request('PUT', body), '7')).status, 422);
  assert.equal(api.requests.length, 0);
});
test('client chooses multipart POST for uploads, JSON PUT for removal, and omits stored paths', async () => {
  const calls = [];
  const client = load('lib/events/admin-client.ts', { '@/lib/auth/client': { protectedFetch: async (path, options) => { calls.push({ path, options }); return Response.json({ data: { cover_image_url: 'https://cdn.example.test/new.png' } }); } }, './admin-shared': admin, './cover': cover });
  const file = new File(['image'], 'cover.png', { type: 'image/png' });
  await client.saveAdminEvent(valid, { file, remove: false });
  await client.saveAdminEvent({ title: 'Edited', cover_image: 'events/covers/7/old.png', status: 'DRAFT' }, { file, remove: false }, 7);
  assert.equal(calls[0].options.method, 'POST'); assert.ok(calls[0].options.body instanceof FormData); assert.equal(calls[0].options.headers, undefined);
  assert.equal(calls[1].path, '/api/events/7'); assert.equal(calls[1].options.method, 'POST'); assert.equal(calls[1].options.body.get('_method'), 'PUT'); assert.equal(calls[1].options.body.has('status'), false);
  await client.saveAdminEvent({ title: 'Edited', cover_image: 'events/covers/7/old.png' }, { file: null, remove: false }, 7);
  assert.deepEqual(JSON.parse(calls[2].options.body), { title: 'Edited' }); assert.equal(calls[2].options.method, 'PUT');
  await client.saveAdminEvent({}, { file: null, remove: true }, 7);
  assert.deepEqual(JSON.parse(calls[3].options.body), { remove_cover_image: true });
});
test('upload body-limit and storage failures preserve useful error messages', async () => {
  for (const status of [413, 503]) {
    const api = handler({ codes: ['UPDATE_EVENT'], backendStatus: status, backendBody: null });
    const response = await api.handleAdminEvents(request('PUT', { remove_cover_image: true }), '7');
    assert.equal(response.status, status); assert.match((await response.json()).error, status === 413 ? /limit/ : /stored/);
  }
  const client = load('lib/events/admin-client.ts', { '@/lib/auth/client': { protectedFetch: async () => new Response('<html>too large</html>', { status: 413 }) }, './admin-shared': admin, './cover': cover });
  await assert.rejects(client.adminEventRequest('', valid), /too large/);
});
test('public event parser retains returned cover_image_url and safe image sources reject unsafe schemes', () => {
  const url = 'https://cdn.example.test/storage/events/covers/7/new.png';
  assert.equal(admin.parseAdminEvent({ ...valid, id: 7, slug: 'event', cover_image_url: url }).cover_image_url, url);
  assert.equal(cover.safeCoverSource(url), url); assert.equal(cover.safeCoverSource('blob:preview'), 'blob:preview');
  for (const source of ['javascript:alert(1)', '//unknown.example/a', 'https://user:pass@example.test/a']) assert.equal(cover.safeCoverSource(source), '/photos/robotics-arm.jpg');
});

test('native FormData reaches an HTTP backend with a generated boundary, bearer auth and unchanged file bytes', async () => {
  const http = require('node:http');
  const previousBase = process.env.AUTH_API_BASE_URL;
  const received = [];
  const backend = http.createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    received.push({ method: req.method, path: req.url, headers: req.headers, bytes: Buffer.concat(chunks) });
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ data: { cover_image_url: 'https://cdn.example.test/new.png' } }));
  });
  await new Promise((resolve) => backend.listen(0, '127.0.0.1', resolve));
  const auth = load('lib/auth/server.ts', { 'next/headers': { cookies: async () => ({ get: () => ({ value: JSON.stringify({ token: 'upload-test-token', expiresAt: Date.now() + 60000 }) }) }) } });
  try {
    process.env.AUTH_API_BASE_URL = 'http://127.0.0.1:' + backend.address().port + '/api';
    const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFZkAAAAASUVORK5CYII=', 'base64');
    const file = new File([bytes], 'cover.png', { type: 'image/png' });
    const data = cover.eventMultipart({ title: 'Edited', is_registration_open: false }, { file, remove: false }, true);
    const response = await auth.protectedBackendRequest('/events/7', { method: 'POST', data });
    assert.equal(response.status, 200); assert.equal(received.length, 1);
    assert.equal(received[0].method, 'POST'); assert.equal(received[0].path, '/api/events/7');
    assert.equal(received[0].headers.authorization, 'Bearer upload-test-token');
    assert.match(received[0].headers['content-type'], /^multipart\/form-data; boundary=/);
    assert.ok(received[0].bytes.includes(bytes));
    const wire = received[0].bytes.toString('latin1');
    assert.match(wire, /name="_method"\r\n\r\nPUT/); assert.match(wire, /name="is_registration_open"\r\n\r\n0/);
    assert.match(wire, /name="cover_image_file"; filename="cover.png"/);
  } finally {
    await new Promise((resolve) => backend.close(resolve));
    if (previousBase === undefined) delete process.env.AUTH_API_BASE_URL; else process.env.AUTH_API_BASE_URL = previousBase;
  }
});
