const axios = require('axios');
const { axiosCircuitBreaker, CircuitBreakerOpenError } = require('axios-circuit-breaker');

// Create a dedicated axios instance for a given backend
const api = axios.create({
  baseURL: 'https://my-api.example.com',
  timeout: 5000,
});

// Attach circuit breaker
axiosCircuitBreaker(api, {
  // optional config: adjust thresholds/timeouts
  threshold: 5,               // number of failures before opening
  thresholdPeriodMs: 10000,   // time window (ms) for counting failures
  numRequestsToCloseCircuit: 2, // how many successful calls needed to close
  resetPeriodMs: 30000,       // how long to wait before moving from OPEN → HALF-OPEN
  // isFault: (error) => error.response?.status >= 500,  // (optional) decide what counts as a failure
});

async function callApi() {
  try {
    const response = await api.get('/some-endpoint');
    console.log('Data:', response.data);
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      console.error('Circuit is open — skipping request');
    } else {
      console.error('Request failed:', err.message);
    }
  }
}

callApi();