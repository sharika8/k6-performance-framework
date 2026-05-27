// lib/helpers.js - shared utilities
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

export const errorRate = new Rate("errors");
export const apiDuration = new Trend("api_duration", true);
export const requestCount = new Counter("requests_total");

export function checkResponse(res, checks, label = "") {
  const success = check(res, checks);
  errorRate.add(!success);
  requestCount.add(1);
  if (label) apiDuration.add(res.timings.duration);
  return success;
}

export function thinkTime(min = 0.5, max = 2.0) {
  sleep(min + Math.random() * (max - min));
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomString(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function jsonParams(token = null) {
  const headers = { "Content-Type": "application/json", "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return { headers };
}
