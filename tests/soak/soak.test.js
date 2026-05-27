/**
 * tests/soak/soak.test.js - Soak: 10 VUs for 2 hours (endurance)
 * Run: SOAK_DURATION=10m k6 run tests/soak/soak.test.js
 */
import http from "k6/http";
import { group, sleep } from "k6";
import { checkResponse, thinkTime, randomItem, jsonParams } from "../../lib/helpers.js";
import { getConfig } from "../../config/environments.js";

const cfg = getConfig();
const DURATION = __ENV.SOAK_DURATION || "2h";
const POST_IDS = Array.from({ length: 100 }, (_, i) => i + 1);

export const options = {
  stages: [
    { duration: "5m", target: 10 }, { duration: DURATION, target: 10 }, { duration: "5m", target: 0 },
  ],
  thresholds: { ...cfg.thresholds, "errors": ["rate<0.02"], "http_req_duration": ["p(99)<3000"] },
};

export default function () {
  group("Soak: API", function () {
    checkResponse(http.get(`${cfg.apiUrl}/posts`, jsonParams()), { "list posts 200": (r) => r.status === 200 });
    thinkTime(0.5, 1.5);
    checkResponse(http.get(`${cfg.apiUrl}/posts/${randomItem(POST_IDS)}`, jsonParams()), { "get post 200": (r) => r.status === 200 });
    thinkTime(0.5, 1.5);
  });
  group("Soak: UI", function () {
    checkResponse(http.get(cfg.baseUrl), { "homepage 200": (r) => r.status === 200 });
    thinkTime(1, 3);
  });
  sleep(1);
}

export function handleSummary(data) {
  console.log(`\n=== SOAK SUMMARY (${DURATION}) === Total: ${data.metrics.http_reqs?.values?.count || 0} | p99: ${(data.metrics.http_req_duration?.values?.["p(99)"] || 0).toFixed(0)}ms | Errors: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%`);
  return {};
}
