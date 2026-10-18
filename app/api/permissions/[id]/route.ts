import { handlePermissionRequest } from "@/lib/permissions/server";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
async function handle(request: Request, context: Context) {
  return handlePermissionRequest(request, (await context.params).id);
}
export { handle as GET, handle as PUT, handle as DELETE };