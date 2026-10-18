import { handlePermissionRequest } from "@/lib/permissions/server";
export const runtime = "nodejs";
export const GET = (request: Request) => handlePermissionRequest(request);
export const POST = (request: Request) => handlePermissionRequest(request);