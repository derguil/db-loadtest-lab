import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = __ENV.ENDPOINT || '/posts';
const FORUM_ID = Number(__ENV.FORUM_ID || 500);
const PAGE = Number(__ENV.PAGE || 1);
const LIMIT = Number(__ENV.LIMIT || 100);
const STEADY_ITERATIONS = Number(__ENV.STEADY_ITERATIONS || 100);

const firstHitLatency = new Trend('first_hit_latency', true);
const steadyStateLatency = new Trend('steady_state_latency', true);

export const options = {
  scenarios: {
    first_hit_once: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'firstHitOnce',
    },
    steady_state_many: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: STEADY_ITERATIONS,
      startTime: '2s',
      exec: 'steadyStateMany',
    },
  },
  summaryTrendStats: ['min', 'avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

function requestTarget(tags) {
  const res = http.get(`${BASE_URL}${ENDPOINT}?forumId=${FORUM_ID}&page=${PAGE}&limit=${LIMIT}`, {
    tags,
  });
  check(res, { 'status is 200': (r) => r.status === 200 });
  return res;
}

export function firstHitOnce() {
  const res = requestTarget({ phase: 'first-hit' });
  firstHitLatency.add(res.timings.duration);
}

export function steadyStateMany() {
  const res = requestTarget({ phase: 'steady-state' });
  steadyStateLatency.add(res.timings.duration);
  sleep(0.1);
}

export default function () {}
