/**
 * tests/load/load.test.js - Load: ramp to 20 VUs, hold 5min
 * Run: k6 run tests/load/load.test.js
 * ENV=staging k6 run tests/load/load.test.js
 */
import http from "k6/http";
import { group, sleep } from "k6";
import { checkResponse, thinkTime, randomItem, jsonParams } from "../../lib/helpers.js";
import { getConfig } from "../../config/environments.js";

const cfg = getConfig();
const POST_IDS = Array.from({ length: 100 }, (_, i) => i + 1);

export const options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "5m", target: 20 },
    { duration: "1m", target: 0 },
  ],
  thresholds: { ...cfg.thresholds, "errors": ["rate<0.05"] },
};

export default function () {
  group("UI Journey", function () {
    checkResponse(http.get(cfg.baseUrl, { tags: { scenario: "ui" } }), { "homepage 200": (r) => r.status === 200 });
    thinkTime(0.5, 1.5);
    checkResponse(http.get(`${cfg.baseUrl}/login`, { tags: { scenario: "ui" } }), { "login page 200": (r) => r.status === 200 });
    thinkTime(1, 2);
  });

  group("API: Browse Posts", function () {
    checkResponse(http.get(`${cfg.apiUrl}/posts`, { ...jsonParams(), tags: { scenario: "api" } }),
      { "list posts 200": (r) => r.status === 200, "is array": (r) => Array.isArray(JSON.parse(r.body)) });
    thinkTime(0.3, 1);
    const postId = randomItem(POST_IDS);
    checkResponse(http.get(`${cfg.apiUrl}/posts/${postId}`, { ...jsonParams(), tags: { scenario: "api" } }),
      { "get post 200": (r) => r.status === 200, "has id": (r) => JSON.parse(r.body).id === postId });
    thinkTime(0.5, 1.5);
  });

  group("API: CRUD", function () {
    checkResponse(http.post(`${cfg.apiUrl}/posts`, JSON.stringify({ title: "Load test post", body: "test", userId: 1 }),
      { ...jsonParams(), tags: { scenario: "api" } }), { "create 201": (r) => r.status === 201 });
    thinkTime(0.5, 1);
    checkResponse(http.put(`${cfg.apiUrl}/posts/1`, JSON.stringify({ id: 1, title: "Updated", body: "updated", userId: 1 }),
      { ...jsonParams(), tags: { scenario: "api" } }), { "update 200": (r) => r.status === 200 });
  });

  sleep(1);
}

export function handleSummary(data) {
  const p95 = (data.metrics.http_req_duration?.values?.["p(95)"] || 0).toFixed(0);
  const errRate = ((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2);
  const rps = (data.metrics.http_reqs?.values?.rate || 0).toFixed(2);
  console.log(`\n=== LOAD SUMMARY === p95: ${p95}ms | Errors: ${errRate}% | RPS: ${rps}`);
  return {};
}
