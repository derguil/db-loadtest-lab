# 실험 01: DB Pool 크기 비교

## 목적
같은 API 요청 패턴에서 Prisma MariaDB adapter의 connectionLimit 변화가 응답시간과 처리량에 어떤 영향을 주는지 확인한다.

## 조건
- 애플리케이션: Nest + Prisma
- DB: MariaDB (local)
- 부하 도구: k6
- 부하 스크립트: k6/smoke.js
- 비교 항목: pool=1 vs pool=10
- 부하 강도: 평소(max 280 VUs) / 10배(max 2800 VUs)

## 결과 요약
- 평소 트래픽(max 280): pool=1과 pool=10의 차이가 작았다.
- 고부하(max 2800): pool=1은 직렬화 병목이 두드러졌고, pool=10이 더 높은 처리량과 낮은 지연을 보였다.
- 결론: pool 증설은 피크 구간 완화에는 효과가 있지만, 시스템의 근본 처리 한계를 없애지는 못한다.

## 핵심 수치
| 구분 | Pool=1 (평소) | Pool=10 (평소) | Pool=1 (10배 부하) | Pool=10 (10배 부하) |
|---|---:|---:|---:|---:|
| Max VUs | 280 | 280 | 2,800 | 2,800 |
| 처리량 (req/s) | 229.87 | 230.02 | 1,138.73 | 1,604.45 |
| 평균 응답시간 (avg) | 3.78ms | 4.21ms | 1.03s | 440.89ms |
| p95 | 10.32ms | 10.64ms | 1.41s | 801.69ms |

## 재현 절차
1. pool 설정값 변경
- DB_POOL_LIMIT
- DB_POOL_MIN_IDLE

2. 서버 실행
- npm run start:dev

3. 부하 실행
- npm run loadtest:smoke

4. 결과 비교
- avg, p90, p95, req/s 중심으로 비교

## 노트
- 고부하에서 응답시간이 증가하면, pool 수치뿐 아니라 쿼리 지연/락/인덱스/캐시 전략을 함께 점검해야 한다.
