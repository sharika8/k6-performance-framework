/**
 * tests/smoke/smoke.test.js - Smoke: 1 VU confirms system is alive
 * Run: k6 run tests/smoke/smoke.test.js
 */
import http from "k6/http";
import { group, sleep } from "k6";
import { checkResponse, jsonParams } from "../../lib/helpers.js";
import { getConfig } from "../../config/environments.js";

const cfg = getConfig();

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
  },
};

export default function () {
  group("UI: Homepage", () => {
    const res = http.get(cfg.baseUrl);
    checkResponse(res, { "homepage 200": (r) => r.status === 200, "has content": (r) => r.body.length > 100 }, "homepage");
  });
  sleep(0.5);

  group("UI: Login Page", () => {
    const res = http.get(`${cfg.baseUrl}/login`);
    checkResponse(res, { "login page 200": (r) => r.status === 200, "has form": (r) => r.body.includes("username") }, "login_page");
  });
  sleep(0.5);

  group("API: Posts", () => {
    const res = http.get(`${cfg.apiUrl}/posts/1`, jsonParams());
    checkResponse(res, {
      "GET /posts/1 200": (r) => r.status === 200,
      "has id": (r) => JSON.parse(r.body).id === 1,
      "has title": (r) => !!JSON.parse(r.body).title,
    }, "api_post");
  });
  sleep(0.5);

  group("API: Users", () => {
    const res = http.get(`${cfg.apiUrl}/users`, jsonParams());
    checkResponse(res, { "GET /users 200": (r) => r.status === 200, "10 users": (r) => JSON.parse(r.body).length === 10 }, "api_users");
  });
  sleep(0.5);

  group("API: Todos", () => {
    const res = http.get(`${cfg.apiUrl}/todos/1`, jsonParams());
    checkResponse(res, { "GET /todos/1 200": (r) => r.status === 200, "has completed": (r) => "completed" in JSON.parse(r.body) }, "api_todo");
  });
}

export function handleSummary(data) {
  const passed = data.metrics.checks?.values?.passes || 0;
  const failed = data.metrics.checks?.values?.fails || 0;
  const avg = (data.metrics.http_req_duration?.values?.avg || 0).toFixed(0);
  const errRate = ((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2);
  console.log(`\n=== SMOKE SUMMARY === Checks: ${passed} passed, ${failed} failed | Avg: ${avg}ms | Errors: ${errRate}%`);
  return {};
}
