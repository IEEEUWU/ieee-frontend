import { handleAdminEvents } from "@/lib/events/admin-server";
export function GET(request: Request) { return handleAdminEvents(request); }
export function POST(request: Request) { return handleAdminEvents(request); }
