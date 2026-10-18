import { handleUserGroupRequest } from "@/lib/usergroups/server";
export const runtime = "nodejs";
export const POST = (request: Request) => handleUserGroupRequest(request, undefined, true);
