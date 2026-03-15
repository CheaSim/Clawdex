export function resolvePublicAppOrigin(headers: Headers, requestUrl: string) {
  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const configuredPublicUrl = process.env.APP_PUBLIC_URL?.trim() || process.env.NEXTAUTH_URL?.trim();

  if (configuredPublicUrl) {
    return configuredPublicUrl.replace(/\/$/, "");
  }

  return new URL(requestUrl).origin;
}
