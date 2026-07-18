const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Missing access token in authentication response.");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
