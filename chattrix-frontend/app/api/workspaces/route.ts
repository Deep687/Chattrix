import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(
    request: Request 
){
// Multipart, not JSON — the avatar is a binary file. The FormData is forwarded as-is and
// `proxyToBackend` deliberately does not set a Content-Type for it, so fetch can generate
// a fresh multipart boundary. Setting one by hand here would corrupt the upload.
const body = await request.formData();

return proxyToBackend(API_ROUTES.workspaces.base, {
      method: "POST",
      body,
      errorLabel: "Workspace Create Route"
})
}