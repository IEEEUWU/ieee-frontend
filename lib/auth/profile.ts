import { parseAuthUser } from "@/lib/auth/user";
import { backendError, clearSession, json, protectedBackendRequest } from "@/lib/auth/server";

export async function currentUserResponse() {
  try {
    const response = await protectedBackendRequest("/auth/me", { method: "GET" });
    let data = await response.json();
    if (!response.ok) return response.status === 401 || response.status === 403 ? clearSession(backendError(data, response.status)) : backendError(data, response.status);
    const identity = parseAuthUser(data);
    if (!identity) return json({ error: "The account service returned an invalid profile." }, 502);
    if (identity.status !== "active") return clearSession(json({ error: "Your account is not active." }, 403));
    // The current backend /auth/me exits before serializing permissions.
    // Resolve only this authenticated user's details; never accept a client ID.
    if (!Array.isArray(data.effective_permissions)) {
      const details = await protectedBackendRequest(`/get-user/${identity.id}`, { method: "GET" });
      const detailData = await details.json();
      if (!details.ok) return details.status === 401 ? clearSession(backendError(detailData, details.status)) : backendError(detailData, details.status);
      if (detailData.id !== identity.id || !Array.isArray(detailData.effective_permissions)) return json({ error: "Unable to resolve your account permissions." }, 502);
      data = { ...data, effective_permissions: detailData.effective_permissions };
    }
    return json(parseAuthUser(data));
  } catch { return json({ error: "Unable to load your account. Please try again." }, 502); }
}