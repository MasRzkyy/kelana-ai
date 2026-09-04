export function getApiBaseUrl(): string {
  let envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  envUrl = envUrl.trim().replace(/\/+$/, "");
  if (!envUrl.endsWith("/api/v1")) {
    envUrl = `${envUrl}/api/v1`;
  }
  return envUrl;
}
