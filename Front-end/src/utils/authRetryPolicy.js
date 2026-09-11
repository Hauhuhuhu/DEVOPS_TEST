export function shouldRefreshRequest(error) {
  const originalRequest = error?.config;
  return Boolean(
    error?.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && !originalRequest.skipAuthRefresh,
  );
}
