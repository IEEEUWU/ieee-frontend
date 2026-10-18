import { handleUserGroupRequest } from "@/lib/usergroups/server";
export const runtime = "nodejs";
export const GET = (request: Request) => handleUserGroupRequest(request);
export const POST = (request: Request) => handleUserGroupRequest(request);
