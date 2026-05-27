/**
 * tests/spike/spike.test.js - Spike: sudden surge to 200 VUs
 * Run: k6 run tests/spike/spike.test.js
 */
import http from "k6/http";
import { group, sleep } from "k6";
import { checkResponse, jsonParams } from "../../lib/helpers.js";
import { getConfig } from "../../config/environments.js";

const cfg = getConfig();

export const options = {
  stages: [
    { duration: "10s", target: 5 }, { duration: "10s", target: 200 },
    { duration: "3m", target: 200 }, { duration: "10s", target: 5 },
    { duration: "3m", target: 5 },
  ],
  thresholds: { http_req_failed: ["rate<0.20"], http_req_duration: ["p(95)<8000"] },
};

export default function () {
  group("Spike: Critical path", function () {
    checkResponse(http.get(`${cfg.apiUrl}/posts`, { ...jsonParams(), timeout: "15s" }),
      { "posts under spike": (r) => r.status < 500 });
    sleep(0.1);
    checkResponse(http.get(`${cfg.apiUrl}/users/1`, { ...jsonParams(), timeout: "15s" }),
      { "user under spike": (r) => r.status < 500 });
  });
  sleep(0.1);
}

export function handleSummary(data) {
  console.log(`\n=== SPIKE SUMMARY === Error rate: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}% | p95: ${(data.metrics.http_req_duration?.values?.["p(95)"] || 0).toFixed(0)}ms`);
  return {};
}
