# ⚡ k6 Performance Testing Framework

Enterprise-grade performance testing built on **[k6](https://k6.io)** — smoke, load, stress, spike & soak testing with environment-aware config and GitHub Actions CI.

## 🧪 Test Suites

| Suite | File | Purpose | VUs | Duration |
|---|---|---|---|---|
| **Smoke** | `tests/smoke/smoke.test.js` | Confirms system is alive | 1 | ~30s |
| **Load** | `tests/load/load.test.js` | Expected peak traffic | 20 | ~8m |
| **Stress** | `tests/stress/stress.test.js` | Find the breaking point | 200 | ~16m |
| **Spike** | `tests/spike/spike.test.js` | Sudden traffic surge | 200 | ~7m |
| **Soak** | `tests/soak/soak.test.js` | Long-duration endurance | 10 | 2h |

## 🚀 Quick Start

```bash
# Install k6 (macOS)
brew install k6

# Install k6 (Linux)
sudo gpg --keyserver hkp://pool.sks-keyservers.net:80 --recv-keys 305BEAA57B02984B
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Run smoke test first
k6 run tests/smoke/smoke.test.js

# Run load test
k6 run tests/load/load.test.js

# Target staging environment
ENV=staging k6 run tests/load/load.test.js

# Short soak (10min instead of 2h)
SOAK_DURATION=10m k6 run tests/soak/soak.test.js
```

## 📁 Structure

```
k6-performance/
├── .github/workflows/perf.yml   # CI: smoke on push, load on main, stress nightly
├── config/environments.js        # env-aware baseUrl + SLA thresholds
├── lib/
│   ├── helpers.js                # checkResponse, thinkTime, custom metrics
│   └── auth.js                   # login/session helpers
├── tests/
│   ├── smoke/smoke.test.js       # sanity
│   ├── load/load.test.js         # steady state
│   ├── stress/stress.test.js     # breaking point
│   ├── spike/spike.test.js       # traffic burst
│   └── soak/soak.test.js         # endurance
└── reports/                      # k6 JSON/HTML output
```

## ⚙️ Configuration

Edit `config/environments.js` for per-environment SLA thresholds:

```js
production: {
  baseUrl: "https://your-app.com",
  apiUrl: "https://api.your-app.com",
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.01"],
  },
}
```

## 📊 Output Options

```bash
k6 run tests/load/load.test.js --out json=reports/results.json
k6 run tests/load/load.test.js --out csv=reports/results.csv
k6 run tests/load/load.test.js --out influxdb=http://localhost:8086/k6
```

## 🤖 CI/CD Pipeline

- **Smoke** — every push and PR
- **Load** — every push to `main`
- **Stress/Spike** — manual trigger or nightly schedule

## 📜 Licence

MIT
