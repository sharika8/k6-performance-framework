// lib/auth.js - authentication helpers
import http from "k6/http";
import { check } from "k6";

export function loginAndGetSession(baseUrl, username = "tomsmith", password = "SuperSecretPassword!") {
  const loginPage = http.get(`${baseUrl}/login`);
  check(loginPage, { "login page loads": (r) => r.status === 200 });
  const loginRes = http.post(`${baseUrl}/login`, { username, password }, { redirects: 0 });
  return { success: loginRes.status === 302 || loginRes.status === 200, cookies: loginRes.cookies };
}

export function bearerHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" } };
}
