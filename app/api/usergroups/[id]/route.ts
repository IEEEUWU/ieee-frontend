import { handleUserGroupRequest } from "@/lib/usergroups/server";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) { return handleUserGroupRequest(request, (await context.params).id); }
export async function DELETE(request: Request, context: Context) { return handleUserGroupRequest(request, (await context.params).id); }
