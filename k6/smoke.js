import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '20s', target: 220 },
    { duration: '30s', target: 220 },
    { duration: '20s', target: 240 },
    { duration: '30s', target: 240 },
    { duration: '20s', target: 260 },
    { duration: '30s', target: 260 },
    { duration: '20s', target: 280 },
    { duration: '30s', target: 280 },
    { duration: '10s', target: 0 },
  ],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
  const forumId = randomInt(1,1000);
  const page = randomInt(1, 10);
  const res = http.get(`${BASE_URL}/posts?forumId=${forumId}&page=${page}&limit=10`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}