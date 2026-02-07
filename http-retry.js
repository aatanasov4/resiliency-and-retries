const axios = require('axios');
const axiosRetry = require('axios-retry');

// Create axios instance
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

// Attach retry interceptor
axiosRetry(api, {
  retries: 3,                       // number of retries
  retryDelay: axiosRetry.exponentialDelay, // exponential backoff
  retryCondition: error => {
    // retry on network errors or 5xx errors by default
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  }
});

// Example GET
async function run() {
  try {
    const res = await api.get('/users/1');
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Final error:', err.message);
  }
}

run();