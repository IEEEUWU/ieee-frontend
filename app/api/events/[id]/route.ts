import { handleAdminEvents } from "@/lib/events/admin-server";
type Context = { params: Promise<{ id: string }> };
async function handle(request: Request, context: Context) { return handleAdminEvents(request, (await context.params).id); }
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
