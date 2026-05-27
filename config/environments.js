// config/environments.js
export const environments = {
  development: {
    baseUrl: "https://the-internet.herokuapp.com",
    apiUrl: "https://jsonplaceholder.typicode.com",
    thresholds: {
      http_req_duration: ["p(95)<2000", "p(99)<5000"],
      http_req_failed: ["rate<0.05"],
    },
  },
  staging: {
    baseUrl: "https://the-internet.herokuapp.com",
    apiUrl: "https://jsonplaceholder.typicode.com",
    thresholds: {
      http_req_duration: ["p(95)<1500", "p(99)<3000"],
      http_req_failed: ["rate<0.02"],
    },
  },
  production: {
    baseUrl: "https://the-internet.herokuapp.com",
    apiUrl: "https://jsonplaceholder.typicode.com",
    thresholds: {
      http_req_duration: ["p(95)<1000", "p(99)<2000"],
      http_req_failed: ["rate<0.01"],
    },
  },
};

export function getConfig() {
  const env = __ENV.ENV || "development";
  const config = environments[env];
  if (!config) throw new Error(`Unknown environment: ${env}`);
  return { ...config, env };
}
