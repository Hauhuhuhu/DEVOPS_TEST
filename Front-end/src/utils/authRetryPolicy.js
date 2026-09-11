const AUTH_ENDPOINTS = ["/login", "/auth/refresh", "/auth/logout"];

function isAuthEndpoint(config) {
  const requestUrl = String(config?.url || "").split("?", 1)[0];
  return AUTH_ENDPOINTS.some(
    (endpoint) => requestUrl === endpoint || requestUrl.endsWith(endpoint),
  );
}

export function shouldRefreshRequest(error) {
  const originalRequest = error?.config;
  return Boolean(
    error?.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && !originalRequest.skipAuthRefresh
      && !isAuthEndpoint(originalRequest),
  );
}
