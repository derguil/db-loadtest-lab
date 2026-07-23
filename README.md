# DB Loadtest Lab

이 레포는 부하 테스트와 성능 개선 실험을 기록하는 Lab입니다.
각 실험은 독립 디렉토리로 관리하고, 이 문서는 요약과 링크만 제공합니다.

## 실험 인덱스

| 실험 | 주제 | 핵심 결론 |
|---|---|---|
| [실험 01](experiments/01-pool-size/README.md) | DB pool 크기 비교 | 평소 트래픽 영향은 작고, 피크에서 병목 완화 효과가 큼 |
| [실험 02](experiments/02-query-optimization/README.md) | 쿼리 최적화 전/후 | pool 튜닝보다 쿼리 최적화의 성능 개선 폭이 훨씬 큼 |
| [실험 03](experiments/03-cache-implement/README.md) | Redis 캐싱 도입 전/후 | 특정 경우에는 디스크 I/O보다 요청당 JS 연산(쿼리 인터프리팅/역직렬화) 비용이 핵심 병목일수도 있음 |
| [실험 04](experiments/04-memory-vs-disk/README.md) | 첫 요청(cold) vs 이후 요청(steady-state) 비교 | 첫 요청 1회만 디스크 I/O로 지연되고(~20ms 수준), steady-state 이후는 버퍼풀 히트로 수렴 |

## 공통 환경

| 항목 | 내용 |
|---|---|
| OS | WSL Ubuntu |
| DB | MariaDB (local, mysqld) |
| ORM | Prisma + @prisma/adapter-mariadb |
| 부하 도구 | k6 |
| 시나리오 파일 | k6/smoke.js |

## 실행 순서

1. 서버 실행
- npm run start:dev

2. 부하 테스트 실행
- npm run loadtest:smoke

3. 실험별 README에 결과 기록
- 각 실험 폴더의 README를 업데이트
