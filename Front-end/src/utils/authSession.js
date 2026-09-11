let accessToken = null;
let session = null;

export function getAccessToken() {
  return accessToken;
}

export function getSession() {
  return session;
}

export function setSession(authResponse) {
  accessToken = authResponse?.token || null;
  session = accessToken
    ? {
        token: accessToken,
        email: authResponse.email,
        role: authResponse.role,
        name: authResponse.name || null,
      }
    : null;
  return session;
}

export function clearSession() {
  accessToken = null;
  session = null;
}
