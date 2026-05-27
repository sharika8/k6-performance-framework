/**
 * tests/stress/stress.test.js - Stress: ramp to 200 VUs to find breaking point
 * Run: k6 run tests/stress/stress.test.js
 */
import http from "k6/http";
import { group, sleep } from "k6";
import { checkResponse, thinkTime, randomItem, jsonParams } from "../../lib/helpers.js";
import { getConfig } from "../../config/environments.js";

const cfg = getConfig();
const ENDPOINTS = ["/posts", "/posts/1", "/users", "/users/1", "/todos", "/todos/1", "/albums"];

export const options = {
  stages: [
    { duration: "2m", target: 20 }, { duration: "3m", target: 50 },
    { duration: "3m", target: 100 }, { duration: "3m", target: 150 },
    { duration: "2m", target: 200 }, { duration: "3m", target: 0 },
  ],
  thresholds: { http_req_failed: ["rate<0.15"], http_req_duration: ["p(95)<5000"], "errors": ["rate<0.15"] },
};

export default function () {
  group("Stress: API", function () {
    const endpoint = randomItem(ENDPOINTS);
    checkResponse(http.get(`${cfg.apiUrl}${endpoint}`, { ...jsonParams(), timeout: "10s" }),
      { "responds": (r) => r.status < 500, "has body": (r) => r.body.length > 0 });
    thinkTime(0.1, 0.5);
  });
  group("Stress: POSTs", function () {
    checkResponse(http.post(`${cfg.apiUrl}/posts`,
      JSON.stringify({ title: `stress-${Date.now()}`, body: "stress", userId: Math.ceil(Math.random() * 10) }),
      { ...jsonParams(), timeout: "10s" }), { "POST responds": (r) => r.status < 500 });
  });
  sleep(0.2);
}

export function handleSummary(data) {
  console.log(`\n=== STRESS SUMMARY === Peak VUs: ${data.metrics.vus_max?.values?.max || 0} | p95: ${(data.metrics.http_req_duration?.values?.["p(95)"] || 0).toFixed(0)}ms | Errors: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%`);
  return {};
}
