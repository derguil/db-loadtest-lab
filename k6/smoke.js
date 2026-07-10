import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '20s', target: 2200 },
    { duration: '30s', target: 2200 },
    { duration: '20s', target: 2400 },
    { duration: '30s', target: 2400 },
    { duration: '20s', target: 2600 },
    { duration: '30s', target: 2600 },
    { duration: '20s', target: 2800 },
    { duration: '30s', target: 2800 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const res = http.get(`${BASE_URL}/forums?page=1&limit=10`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}