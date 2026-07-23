# 실험 04: Memory vs Disk 체감 차이 측정

## 배경

실험 03에서 확인했듯이, MySQL/MariaDB(InnoDB)는 데이터를 디스크에서 바로 읽지 않고
먼저 buffer pool(page 단위 메모리 캐시)을 조회한다.

처음에는 buffer pool을 비활성화해서 메모리/디스크 차이를 직접 비교하려 했지만,
설정 기준으로 사실상 비활성화가 불가능했고 최소 크기 제한(128MB)을 확인했다.

즉 이 실험의 핵심은 "buffer pool OFF"가 아니라,
"첫 요청(cold)"과 "이후 요청(steady-state)"의 체감 차이를 정량화하는 것이다.

## 1. 실험 목표

- 동일 endpoint 기준 first-hit latency(첫 요청) 측정
- 동일 endpoint 연속 요청의 steady-state latency 분포(p50/p95/p99) 측정
- first-hit / steady-state 비율로 cold start 수치 정량화

## 2. 실험 설계

"처음 요청"과 "이후 요청"의 차이를 분리해서 측정했다.
이 비교는 메모리/디스크뿐 아니라 연결 재사용, 런타임 워밍업 효과까지 함께 드러낸다.

1. 테스트 직전 상태를 cold로 맞춘다 (DB 재시작, buffer pool dump/load 옵션 OFF)
2. 동일 endpoint에 단일 요청 1회만 보내서 first-hit latency 기록
3. 같은 endpoint를 연속 요청(100회)으로 보내 steady-state latency 분포 기록
4. 위 과정을 5회 반복

실행 명령:

```bash
npm run loadtest:fvsst
```

## 3. 부하테스트 결과 (k6)

첨부한 5회 실행 스크린샷에서 first-hit과 steady-state 지표를 추출해 비교했다.

| 회차 | first-hit (ms) | steady med (ms) | steady p95 (ms) | steady p99 (ms) | first/steady 비율 |
|---|---:|---:|---:|---:|---:|
| 1 | 43.51 | 10.24 | 15.82 | 19.49 | 4.25x |
| 2 | 42.00 | 10.11 | 14.25 | 15.91 | 4.15x |
| 3 | 25.83 | 9.79 | 12.93 | 14.16 | 2.64x |
| 4 | 26.80 | 9.97 | 13.53 | 15.24 | 2.69x |
| 5 | 34.21 | 10.10 | 13.17 | 14.32 | 3.39x |

요약:

- first-hit 평균: 34.47ms
- steady-state 중앙값 평균: 10.04ms
- first-hit / steady-state 비율: 약 3.43x
- 모든 회차에서 checks_failed 0%, http_req_failed 0%

관측 포인트:

- steady-state 중앙값은 약 9.8~10.2ms로 매우 안정적
- first-hit은 25.8~43.5ms로 변동폭이 더 큼
- 즉 성능 꼬리는 steady-state보다 "첫 요청"에서 크게 발생

## 4. InnoDB 상태 카운터 (전/후)

- `Innodb_buffer_pool_reads`
	- buffer pool miss로 실제 디스크 페이지를 읽은 횟수
- `Innodb_buffer_pool_read_requests`
	- buffer pool에 대한 전체 읽기 요청 수

전/후 측정값:

| 지표 | 테스트 전 | 테스트 후 | 델타 |
|---|---:|---:|---:|
| Innodb_buffer_pool_read_requests | 19 | 61,633 | 61,614 |
| Innodb_buffer_pool_reads | 148 | 158 | 10 |

델타 기준 해석:

첫 first-hit동안에는 Innodb_buffer_pool_reads가 10만큼 증가하다가, 이후 steady-state일 동안에는 더이상 증가하지 않음

- miss rate = 10 / 61,614 = 0.0162%
- hit rate = 99.9838%

즉 이 실험 구간의 대부분 읽기는 실제 디스크 I/O가 아니라 buffer pool hit로 처리됐다.

## 5. 결론

첫 요청은 steady-state 대비 일관되게 느렸고(약 2.64x~4.25x),
steady-state 구간은 p95/p99까지 안정적으로 유지됐다.

이 두 측정값들의 평균의 차가 약 15~20ms인 것을 보아, 실제 메모리와 디스크간의 간극, mysql의 buffer pool의 역할을 체감할 수 있었다.

이 실험에서는 단순 조회 api로 한 실험이었기 때문에 큰 문제가 되진 않았지만, cold 상태에서의 초기 로딩/워밍업 비용이 더 크고 복잡한 production 환경에서는 사용자에게 체감 지연을 느끼게 하는 원인 중 하나일 것이 될 수 있겠다고 생각되었다.

## 6. 그 외에 고려할 점

- "buffer pool 비활성화" 자체는 현실적으로 쓸 수 있는 방법이 아님
- 애플리케이션 캐시(Redis) 실험과 섞이지 않게, 해당 실험에서는 Redis를 끄거나 우회함

## 8. 재현 절차

1. cold 상태로 맞추기
- DB 재시작 후 50-server.cnf파일의 설정에 다음과 같이 추가
- `innodb_buffer_pool_dump_at_shutdown=OFF`
- `innodb_buffer_pool_load_at_startup=OFF`
2. 테스트 전 상태 확인
- SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';
3. 시나리오 k6 테스트 실행
4. 테스트 후 상태 확인
5. 같은 과정을 5~10회 반복 후 비교
- first-hit / steady-state 비율
- steady-state p95/p99 안정성
- `reads`, `read_requests` 델타 기반 hit/miss 비율

