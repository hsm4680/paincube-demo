# PainCube ICU CDSS Demo — PRD (v2)

작성일: 2026-09-18
대상: 투자 유치·임상 파트너 시연용 데모 (Investor / Clinical-facing demo)
기존 버전: v1 (단일 환자 화면, `src/main.jsx` 710줄 단일 파일)

---

## 0. 이번 버전의 목표

v1은 "생체신호를 수집하고 통증을 예측해 의료진 판단을 지원한다"는 구성은 보여줬으나,
**PainCube의 핵심인 '통증 변화 예측'보다 원시 파형이 더 크게 보이는 문제**가 있었다.

v2의 목표는 하나다.

> **"현재 상태 → 앞으로의 변화 → 판단 근거 → 확인할 행동"이 한눈에 이어지게 한다.**

이를 위해 두 가지를 바꾼다.

1. **화면 위계 역전** — 해석 결과(추세·예측 그래프)를 주인공으로, 원시 파형은 근거 영역으로.
2. **병동 대시보드 신설** — 6개 병상 중 "지금 눈에 보이는 가장 아픈 환자"가 아니라
   "15분 뒤 문제가 생길 환자"를 PainCube가 먼저 지목하는 장면을 만든다.

---

## 1. 화면 구성

데모는 **2개 화면**으로 구성된다. 라우터 없이 React 상태로 전환한다.

| 화면 | 역할 |
|---|---|
| **Ward Dashboard** | 초기 화면. ICU 6개 병상을 3×2 그리드로 표시 |
| **Patient Detail** | 단일 환자 상세. 추세 그래프 + 파형 + AI-CDSS |

---

## 2. 용어 및 지표 정의 (전 화면 공통)

### 2.1 표기 규칙
- **UI 문구는 영어 전용.** 한글은 화면에 일절 등장하지 않는다.
- 지표 정식 명칭: **`Pain Score(CPI)`**
  - 최초 노출되는 곳(카드 헤더, 게이지 하단)에는 `Pain Score(CPI)` 전체 표기
  - 좁은 공간(모니터 바 라벨)에서는 `PAIN SCORE`
- 척도 표기: `1.4 / 10` 형식 유지

### 2.2 핵심 지표

| 지표 | 표기 | 정의 |
|---|---|---|
| Current Pain Score | `1.4 / 10` | 현재 통증 지수 (0–10) |
| Predicted Pain Score | `Predicted Pain Score in 15 min` | 15분 후 예측값 |
| **Time to Threshold** | `12 min` | **예측 곡선이 임계값 5.0에 도달하기까지 남은 시간** |
| Personal baseline | `24h adaptive` | 개인 기준선 산출 방식 |

### 2.3 임계값
- **Pain Score ≥ 5.0** — 위험 사건의 기준값
- 그래프에 임계선은 **그리지 않는다** (계산에만 사용)

### 2.4 Probability 지표 제거
v1의 `RISK 12%` / `Pain probability` / `Low probability of severe pain, 12%` 세 가지 표기는
**전부 삭제한다.** 보정된 확률은 검증 데이터로 뒷받침해야 방어 가능하므로,
같은 자리에 **Time to Threshold**를 넣는다.

- 안정 상태 표기: `No breach predicted`

### 2.5 상태어 (Status word)

| 상태어 | 의미 | 색상 토큰 |
|---|---|---|
| `STABLE` | 안정 | `--status-stable` |
| `RISING` | 상승 추세 감지 | `--status-caution` |
| `ACTION REQUIRED` | 개입 권고, 승인 대기 | `--status-critical` |
| `TREATING` | 오더 실행, 반응 추적 중 | `--status-caution` |
| `STABILIZED` | 안정화 확인 | `--status-stable` |

- **설명문(sub-copy)은 넣지 않는다.** 상태어 단독 노출.
- 상태어는 항상 **아이콘 + 텍스트와 함께** 표시한다. 색상만으로 상태를 전달하지 않는다.

---

## 3. 색상 시스템

로고에서 추출한 정확한 값 기준. 색약 대비 검증을 통과한 조합만 사용한다.

### 3.1 브랜드·구조 계층 (데이터·상태 표현에 절대 사용 금지)

```
--brand-navy        #1B1B52   로고, 주요 제목, 헤더 텍스트
--brand-panel       #102C5E   대시보드 헤더 바, 강조 패널
--brand-light       #77A0D5   아이콘, 활성 상태, 액센트 (텍스트 금지: 흰 배경 대비 2.7:1)
--page-bg           #EBF0F6   전체 페이지 배경
--card-surface      #FFFFFF   카드 표면
--hairline          #D7E0EC   카드 테두리, 구분선
--text-primary      #0F172A   본문 값
--text-label        #475569   라벨 (대비 강화)
--text-muted        #8A93A6   보조 텍스트
```

### 3.2 상태 계층 (상태 표현 전용)

```
--status-stable     #118C6E   STABLE / STABILIZED
--status-caution    #D9631A   RISING / TREATING
--status-critical   #B01C3E   ACTION REQUIRED
--status-nodata     #8A93A6   예약 (현재 미사용)

--status-stable-tint    #E2F1EE   상태 카드 배경 (흰 카드 위)
--status-caution-tint   #FAECE4
--status-critical-tint  #F6E4E8
```

**틴트는 배경 전용이다.** 텍스트·테두리·아이콘에는 원래 상태색을 쓴다.
틴트 위의 본문은 `--text-primary`로 두며 대비 14:1 이상이 나온다.

> **검증 결과**: 색약(deutan) 구분도 ΔE 8.2, 일반 시야 ΔE 17.0, 흰 카드 대비 전부 3:1 이상 — 전 항목 통과.
> **금지**: 순수 초록 `#0CA30C`는 오렌지와 색약 구분도 ΔE 2.9로 실패한다. 반드시 위 틸그린을 사용할 것.
> **금지**: 브랜드 라이트블루 `#77A0D5`를 상태색으로 쓰지 말 것 (시안 계열 상태색과 구분도 ΔE 10.7로 실패).

### 3.3 파형 계층 (신호 종류 구분 전용)

```
--signal-eeg        #8B5CF6
--signal-ecg        #3FA834   (v1의 #48B83E에서 톤다운)
--signal-ppg        #2E86C1
--monitor-bg        #0A1730   (v1의 중성 블랙 #161818에서 네이비로 변경)
--monitor-grid      rgba(255,255,255,0.055)
--monitor-bar       #14203A   모니터 상단 바 / Vitals Rail 셀 배경
--monitor-ink       rgba(255,255,255,0.86)   모니터 내부 기본 텍스트
--monitor-ink-dim   rgba(255,255,255,0.45)   모니터 내부 라벨
--monitor-alert     #F5A03C   모니터 내부 임계 초과 값 (네이비 대비 7.7:1)
```

**Vitals Rail 숫자 색상 — 파형과 짝을 맞춘다**

v1은 HR에 형광 초록 `#69F24C`를 썼다. 네이비 배경에서 눈이 아프고, 6개 숫자가 제각각
다른 색이라 통일감이 없었다. v2는 **숫자를 그 값이 유래한 파형의 색과 일치**시킨다.

| 항목 | 색 토큰 | 근거 |
|---|---|---|
| HR | `--signal-ecg` | 심박수는 ECG에서 산출된다 |
| SpO2 | `--signal-ppg` | 산소포화도는 PPG에서 산출된다 |
| BIS | `--signal-eeg` | BIS는 EEG 유래 지표다 |
| **NIBP / RR / BT** | **`--monitor-ink`** | 파형에서 유래하지 않는 값. 새 색을 만들지 않는다 |

이렇게 하면 "이 숫자가 저 파형에서 나온다"가 색으로 읽히고 임상적으로도 정확하다.
파형과 짝이 없는 세 항목에 색을 부여하면 화면에 의미 없는 색이 늘어날 뿐이므로,
기본 텍스트색으로 둔다. v1의 빨강·노랑·주황은 버린다.

**이 색들은 신호 계층이며 상태 계층이 아니다.** 상태색 금지 규칙(순수 초록)은 여기 적용되지 않는다.

**모니터 내부에는 상태색 3종(stable/caution/critical)을 쓰지 않는다.**
네이비 배경에서 밝기를 올려 3색을 만들면 색약 구분도가 ΔE 2.5로 실패한다.
모니터 내부에서 필요한 것은 "정상 / 임계 초과" 2단계뿐이므로 단일 경고색으로 해결한다.

- 평상시: `--monitor-ink`
- 임계 초과: `--monitor-alert` + 값 옆에 `▲` 아이콘 (색 단독 전달 금지 규칙 충족)
- 적용 대상: 모니터 상단 바의 `PRED_15M` 한 칸만. 나머지 칸과 Vitals는 적용하지 않는다.

**모니터 바의 Time to Threshold 축약 표기**
좁은 칸에서 `No breach predicted`는 두 줄이 되어 바 높이를 밀어낸다.
모니터 바에서만 **`NO BREACH`**로 축약한다. 상단 KPI 3칸에서는 전체 표기를 쓴다.

### 3.4 추세 그래프

```
--chart-observed    #1C3F7C   관측 구간 실선
--chart-now         #8A93A6   현재 시점 세로선
--chart-grid        #E3E9F2   그리드
```

- **예측 구간 점선의 색은 고정하지 않는다.** 도달할 상태의 색을 그대로 사용한다.
  - 예측이 임계값 미만 → `--status-stable`
  - 예측이 임계값 이상 → `--status-critical`
- 이유: 범례 없이도 "미래 선의 색 = 미래의 상태"로 읽힌다.

---

## 4. Ward Dashboard (초기 화면)

### 4.1 레이아웃
- 상단 헤더: 로고 / `ICU Ward A · 6 beds` / `Demo Start` 버튼 / Reset 버튼
- 본문: **3열 × 2행** 환자 카드 그리드
- **좌측 사이드바는 도입하지 않는다.** (화면이 2개뿐이므로 내비게이션 불필요)

### 4.2 환자 카드 구성

```
┌──────────────────────────────┐
│ ICU Bed 03          #1468    │
│                              │
│         1.4  / 10            │   ← 큰 숫자
│                              │
│   → 6.8 in 15 min            │   ← 예측값 (작게)
│                              │
│   ● ACTION REQUIRED          │   ← 아이콘 + 상태어
└──────────────────────────────┘
```

- 카드 테두리 색상은 상태 색상을 따른다.
- 카드 클릭 시 해당 환자의 Patient Detail로 이동한다.

### 4.3 정렬

- **정렬 기준: 예측값(Predicted Pain Score) 내림차순**
- 정렬은 **실시간으로 갱신**되며, 순서가 바뀔 때 카드가 애니메이션으로 자리를 이동한다.
- 이 동작이 이 데모의 핵심 장면이다. 현재 통증이 가장 낮은 환자가
  예측 때문에 맨 아래에서 맨 위로 올라온다.

### 4.4 환자 데이터

| # | 병상 | ID | 환자 | 수술 | 현재 | 예측 | 상태 |
|---|---|---|---|---|---|---|---|
| 1 | ICU Bed 01 | #1452 | F / 58 | Mitral valve repair, POD 2 | 2.1 | 2.3 | STABLE |
| 2 | ICU Bed 02 | #1455 | M / 64 | VATS lobectomy, POD 1 | 3.0 | 2.8 | STABLE |
| 3 | **ICU Bed 03** | **#1468** | **M / 69** | **CABG, POD 0** | **1.4** | **1.5 → 6.8** | **주인공** |
| 4 | ICU Bed 04 | #1471 | F / 41 | Craniotomy, tumor resection, POD 0 | 4.2 | 4.4 | STABLE |
| 5 | ICU Bed 05 | #1473 | M / 55 | Aneurysm clipping (SAH), POD 1 | 2.6 | 2.9 | STABLE |
| 6 | ICU Bed 06 | #1477 | F / 47 | Posterior lumbar fusion, POD 1 | **4.6** | 4.3 | STABLE |

**설계 의도**
- Bed 06은 현재값이 가장 높지만(4.6) 예측은 하강한다(4.3). "함정" 역할.
- Bed 03(주인공)은 현재값이 가장 낮지만(1.4) 예측이 임계를 넘는다(6.8).
- 시연 멘트: *"지금 눈으로 보면 6번이 제일 아픕니다. 그런데 PainCube는 3번을 가리킵니다."*

### 4.5 정렬 변화

```
데모 시작 전:  Bed04(4.4) → Bed06(4.3) → Bed05(2.9) → Bed02(2.8) → Bed01(2.3) → Bed03(1.5)
데모 시작 후:  Bed03(6.8) → Bed04(4.4) → Bed06(4.3) → Bed05(2.9) → Bed02(2.8) → Bed01(2.3)
```

### 4.6 나머지 5명의 거동
- 데모 진행 중 **현재값만 ±0.3 범위에서 소폭 자연 변동**한다.
- **예측값은 고정한다.** 정렬 기준이 예측값이므로, 예측값을 흔들면
  Bed 04(4.4)와 Bed 06(4.3)의 0.1 차이가 뒤집혀 카드가 계속 자리를 바꾼다.
  주인공 카드의 이동이 묻히면 데모의 핵심 장면이 죽는다.

---

## 5. Patient Detail (환자 상세 화면)

### 5.1 레이아웃 (위에서 아래로)

```
┌─ HEADER ─────────────────────────────────────────────────────────┐
│ [← Ward]  PainCube 로고 │ #1468 · M/69 · ICU Bed 03               │
│                         │ CABG · POD 0 · Intubated, RASS −4       │
│                                        [Demo Start]  [Reset]      │
└──────────────────────────────────────────────────────────────────┘
┌─ 상태어 ─────────────────────────────────────────────────────────┐
│ ● ACTION REQUIRED                                                 │
└──────────────────────────────────────────────────────────────────┘
┌─ KPI 3칸 ────────────────────────────────────────────────────────┐
│ Current Pain Score │ Predicted · 15 min │ Time to Threshold       │
│      2.6 / 10      │       6.8          │        8 min            │
└──────────────────────────────────────────────────────────────────┘
┌─ 좌측 (1.4) ──────────────────────┬─ 우측 (1.0) ─────────────────┐
│ ■ Pain Score Trend & Forecast     │ ■ Pain Forecast (게이지)      │
│   −60min ─ Now ─ +15min           │ ■ AI-CDSS                     │
│                                   │   권고 / 안전성 뱃지 / 3버튼   │
│ ■ Patient Signal Monitoring       │   감사추적 (승인 후)           │
│   EEG / ECG / PPG + Vitals Rail   │ ■ EMR Context                 │
└───────────────────────────────────┴───────────────────────────────┘
                                          For investigational use only ↘
```

- **한 화면에 스크롤 없이 완결**되어야 한다 (노트북 프레젠테이션 기준).

**세로 높이 예산 (1440×900 노트북 기준, 가용 약 780px)**

| 영역 | 배정 |
|---|---|
| 헤더 (환자 정보 2줄) | 84px |
| 상태어 + KPI 3칸 | 96px |
| 추세 그래프 카드 | **250px** (그래프 본체 180px) |
| 모니터 패널 (바 + 파형 + Vitals) | **280px** (파형 본체 180px) |
| 세로 간격 3 × 16 + 페이지 패딩 | 72px |
| **합계** | **782px** |

**6단계 착수 전에 이 예산으로 먼저 계산하고, 실제 캡처로 검증한다.**
초과하면 그래프와 파형에서 **균등하게** 뺀다. 한쪽만 줄이면 위계가 무너진다.
그래프 본체는 어떤 경우에도 파형 본체보다 작아지지 않는다.

높이가 부족하면 마지막 수단으로 상태어를 KPI 행 좌측에 통합해 한 행을 없앨 수 있다.
이 경우 상태어는 전체 너비 행이 아니라 KPI 행의 첫 칸이 된다. 적용 전에 확인을 받는다.
- 기존 반응형 동작은 그대로 유지한다.

### 5.2 상단 KPI 3칸
1. `Current Pain Score` — `2.6 / 10`
2. `Predicted · 15 min` — `6.8`
3. `Time to Threshold` — `8 min` (안정 시 `No breach predicted`)

### 5.3 추세·예측 그래프 (신규, 최우선 구현)

- **가로축**: `−60min ~ Now ~ +15min`, 눈금 **15분 단위** (−60 / −45 / −30 / −15 / Now / +15)
- **세로축**: `0 ~ 10` **고정** (자동 스케일 금지)
- **과거 60분**: 실선, `--chart-observed`
- **현재 시점**: 세로 기준선, `--chart-now`
- **미래 15분**: 점선, 색상은 도달 상태에 따라 동적 (3.4 참조)
- **신뢰구간 음영: 표시하지 않는다**
- **임계선: 표시하지 않는다**
- **실시간 흐름**: 시간이 흐르며 좌측으로 이동한다

**시간 압축 (중요)**

60분 축을 실제 시간으로 흘리면 데모 15초 동안 아무 움직임도 보이지 않는다.

- **시작 시 과거 60분 구간이 이미 채워진 상태**로 렌더한다. (환자가 이미 입원해 있으므로 자연스럽다)
- **압축비는 실제 1초 = 차트상 1분**으로 한다. 15초 데모 동안 차트상 15분이 흐른다.
- 파형 캔버스는 압축하지 않고 실시간으로 흐른다. 실제 환자 모니터도 파형은 초 단위 스윕,
  트렌드는 시간 단위로 서로 다른 스케일을 쓰므로 문제가 되지 않는다.
- 과거 60분 데이터는 단계에 맞게 생성한다. idle 구간은 개인 기준선 근처에서 평탄하고,
  warning 진입 지점부터 상승이 시작되어야 한다.
- 배경: 흰색 카드 (`--card-surface`)

### 5.4 파형 패널

- **높이를 180px로 축소한다** (v1은 372px). 추세 그래프가 주인공이다.
  5.1절 높이 예산의 값이 기준이다. 화면에 여유가 있으면 최대 240px까지 늘릴 수 있으나,
  **어떤 경우에도 추세 그래프 본체보다 커지지 않는다.**
- 배경을 `--monitor-bg` (#0A1730) 네이비로 변경한다.
- ECG 색상을 `#3FA834`로 톤다운한다.

**작업 분할**: 버퍼 초기화 수정(아래)은 **화면 전환 구현 전에 먼저 처리한다.**
높이·배치 변경은 6단계 레이아웃 재구성과 함께 한다. 둘을 같은 시점에 하지 않는다.

**중요 — 버퍼 초기화 문제 (필수 수정)**

v1은 파형 버퍼를 `Array(n).fill(0)`으로 초기화해 화면 좌측이 직선으로 시작한다.
v2에서는 화면 전환으로 캔버스가 재마운트되므로,
**알람을 받고 환자 화면에 진입한 바로 그 순간 심전도가 평탄선으로 보이게 된다.**

→ 버퍼를 0이 아닌 **생리학적 파형 값으로 미리 채운 상태에서 시작**할 것.
   (초기화 시 `nextSample()`을 버퍼 길이만큼 미리 돌려 채우는 방식)

**모니터 상단 바 (4칸)**

| v1 | v2 |
|---|---|
| `CPI` | `PAIN SCORE` |
| `PRED_30M` | `PRED_15M` |
| `RISK` | `TIME TO THRESHOLD` |
| `AI STATUS` | `AI STATUS` (유지) |

**Vitals Rail** (우측 세로 6칸): HR / NIBP / SpO2 / RR / BIS / BT — v1 유지

### 5.5 Pain Forecast 게이지

- 원형 게이지는 **유지**하되, v1의 이중 링 로직 오류를 수정한다.
- v1 문제: 예측 링과 현재 링을 같은 반지름에 겹쳐 그리고 현재 링이 예측 링을 덮어,
  예측 상승분이 시각적으로 거의 보이지 않았다.
- v2 수정: **현재값 링을 실선 호로 그리고, 현재값 끝점에서 예측값까지를 점선 확장 호 + 화살표로 표현**한다.
- 게이지 중앙: 현재값 + `Pain Score(CPI) / 10`
- **KPI 3칸과 중복되는 텍스트 3줄(Predicted / Probability / Baseline)은 삭제한다.**
  게이지 + `Personal baseline · 24h adaptive` 한 줄만 남긴다.

### 5.6 AI-CDSS 카드

**상태별 표시**

| 단계 | 헤드라인 | 본문 |
|---|---|---|
| `idle` | `Safe range` / `Maintain current analgesic plan` | Pain Score, Time to Threshold, Recommendation |
| `warning` | `Elevated risk under review` / `Recalculating treatment window` | Pain Score, Signal change, Next action |
| `recommendation` | `Preemptive analgesic recommendation` / `Fentanyl 25 mcg IV Bolus` | Trigger, Rationale + 안전성 뱃지 + 3버튼 |
| `administering` | `Order in progress` | 반응 추적 중 |
| `recovered` | `Response confirmed` | 안정화 결과 |

**중요**: 모든 수치는 `PHASES` 데이터에서 읽어온다.
v1처럼 `"CPI 1.2 / 10"` 같은 **문자열 하드코딩을 절대 하지 않는다.**
(v1은 좌측 모니터는 데이터 참조, 우측 카드는 하드코딩이라 수치가 어긋날 수 있었다)

**안전성 검증 뱃지** — `recommendation` 단계에서만 노출, **한 줄**

뱃지의 RR·SpO₂ 값은 **recommendation 단계 vitals에서 읽는다.** 다른 단계 값을 쓰지 않는다.

```
✓ Safety check passed — RR 20 · SpO₂ 97% · 24h fentanyl 25 mcg
```

**액션 버튼 3개**

| 버튼 | 동작 |
|---|---|
| `Dismiss` | 권고 카드를 닫는다. 별도 팝업·기록 없음 |
| `Modify` | 용량 선택 팝업 (12.5 / 25 / 50 mcg) → 선택 시 Approve와 동일 흐름. 권고 헤드라인은 `Fentanyl 25 mcg`로 고정하고, 선택한 용량은 Last analgesic과 감사추적에 반영한다 |
| `Approve` | 로딩 2.2초 → `administering` → `recovered` |

**감사추적** — 승인 완료 후 CDSS 카드 **내부 최하단**에 한 줄 등장

```
09:14:32 · Approved by Dr. J. Kim (ID 3391) · Sent to EMR — Ack 09:14:35
```

용량을 수정해 승인한 경우에는 권고값과 실제 투여값을 **둘 다** 남긴다.

```
09:14:32 · Approved by Dr. J. Kim (ID 3391) · Recommended 25 mcg · Administered 50 mcg (modified)
```

AI가 권고한 값과 임상의가 실제로 결정한 값이 화면에 나란히 남는 것이
"임상의가 최종 결정권자"라는 규제 서사를 가장 직접적으로 증명한다.

### 5.7 EMR Context 카드

- **6개 항목 그대로 유지**, 2열 배치
- 카드 헤더 옆 뱃지: `HL7 FHIR R4 · Epic / Cerner compatible`

| 항목 | 값 |
|---|---|
| Procedure | `CABG, POD 0` |
| Pain report | `Unable to self-report` |
| Last analgesic | 단계별 상이 |
| Active medication | `Propofol 35 mcg/kg/min, Cefazolin 1g q8h` |
| Sedation | **`RASS −4`** (v1의 RASS −2는 자가보고 불가와 임상적으로 모순이었음) |
| Renal function | `eGFR 74` |

---

## 6. 단계별 데이터 (Patient Detail — Bed 03)

| 단계 | 상태어 | Pain Score | Pred +15m | Time to Threshold | AI Status |
|---|---|---|---|---|---|
| `idle` | STABLE | 1.4 | 1.5 | `No breach predicted` | Baseline locked |
| `warning` | RISING | 1.8 | 6.2 | `12 min` | Rising sympathetic response |
| `recommendation` | ACTION REQUIRED | 2.6 | 6.8 | `8 min` | Intervention recommended |
| `administering` | TREATING | 3.1 | 3.6 | `No breach predicted` | Medication response tracking |
| `recovered` | STABILIZED | 1.7 | 1.6 | `No breach predicted` | Pain response stabilized |

**Vitals**

| 단계 | HR | NIBP | SpO2 | RR | BIS | BT |
|---|---|---|---|---|---|---|
| idle | 72 | 118/72 | 99 | 14 | 42 | 36.4 |
| warning | 88 | 142/86 | 98 | 18 | 51 | 36.6 |
| recommendation | 93 | 150/91 | 97 | 20 | 55 | 36.7 |
| administering | 86 | 136/82 | 98 | 17 | 48 | 36.6 |
| recovered | 74 | 122/76 | 99 | 14 | 43 | 36.4 |

**Last analgesic (단계별)**

| 단계 | 값 |
|---|---|
| idle / warning / recommendation | `Acetaminophen 1g IV, 08:10` |
| administering | `Fentanyl 25 mcg IV, now` |
| recovered | `Fentanyl 25 mcg IV, 1 min ago` |

**v1의 `Fentanyl 25 mcg IV, 06:45` 항목은 삭제한다.** 08:10의 Acetaminophen보다 이른 06:45가
"마지막 진통제"로 표시되는 시간 역전 오류였다. 임상 파트너가 바로 알아챈다.

서사 정합성: POD 0 환자이므로 수술실에서 투여된 fentanyl 25 mcg가 24시간 누적량이고,
ICU 도착 후 08:10에 Acetaminophen을 투여했다. 안전성 뱃지의 `24h fentanyl 25 mcg`와 일치한다.

---

## 7. 데모 시나리오 흐름

**타이머 기준점은 "모달을 닫는 시점"이다.** 시연자가 말이 길어져도 흐름이 먼저 나가지 않는다.

```
[Ward Dashboard 초기 상태]
  6개 카드, 예측값 내림차순, Bed 03은 6번째(예측 1.5)
        │
        │  Demo Start 클릭
        ▼
  T+2.0s   Bed 03 → warning 단계
           상태어 RISING, 현재 1.8 / 예측 6.2 / Time to Threshold 12 min
           카드가 6번째 → 1번째로 애니메이션 이동 (6.2 > 4.4)
        │
  T+3.5s   화면 중앙 경고 모달 + 배경 60% Dim
           모달 수치는 warning 단계에서 읽는다 (Current 1.8 → Predicted 6.2)
        │
        │  [View patient] 클릭
        ▼
[Patient Detail — Bed 03]  (warning 단계 유지)
  진입 즉시 동일 모달 재표시. 버튼 라벨은 [Continue]
        │
        │  모달 닫기 (Continue 또는 ×)
        ▼
  닫은 시점 +2.0s → recommendation 단계
           상태어 ACTION REQUIRED, 현재 2.6 / 예측 6.8 / Time to Threshold 8 min
           AI-CDSS에 Fentanyl 25 mcg IV Bolus 권고 + 안전성 뱃지 + 3버튼 등장
        │
        ├─ [Dismiss]  → 권고 카드를 닫는다. 단계는 recommendation 유지,
        │               상태어도 ACTION REQUIRED 유지.
        │               CDSS 영역에는 `Recommendation dismissed` 한 줄만 남긴다.
        │               (되돌리려면 Reset)
        │
        ├─ [Modify]   → 용량 선택 팝업 (12.5 / 25 / 50 mcg) → 선택 시 Approve와 동일 흐름
        │
        └─ [Approve]  → 2.2초 로딩 → administering → recovered
                        감사추적 한 줄 표시
        │
        ▼
  [정지] 자동 복귀 없음. Reset 또는 [← Ward]로 이동.
```

**설계 의도**: 대시보드에서 경고를 받고(`12 min`), 환자 화면에 들어가니 AI가 권고를 준비해두었으며
남은 시간이 `8 min`으로 줄어 있다. 시간이 줄어드는 대비가 긴장감을 만든다.

**Time to Threshold는 초 단위로 실시간 감소시키지 않는다.** 단계 전환 시에만 값이 바뀐다.
실시간 카운트다운은 화면을 산만하게 만들고 구현 복잡도만 올린다.

**Patient Detail의 Demo Start 동작**
- 이미 진행 중이면 아무 것도 하지 않는다.
- 진행 중이 아니면(초기 상태 또는 Reset 직후) 같은 화면에 머문 채
  위와 동일한 타이머 흐름(warning → 모달 → recommendation)을 시작한다.

**Ward Dashboard로 돌아갔을 때**: Bed 03 카드는 해당 시점 단계의 값과 상태어를 표시한다.
승인 완료 후라면 `1.7` / `STABILIZED`.

---

## 8. 경고 모달

### 8.1 동작
- **두 화면 모두에서 표시**된다 (Dashboard 진입 시, Patient Detail 진입 시)
- 화면 **중앙**에 표시, 배경은 **60% Dimmed**
- **알람음 없음**

### 8.2 구성

```
┌───────────────────────────────────────────────── [×] ┐
│                                                       │
│   ⚠   PRE-PAIN ALERT              ICU Bed 03 · #1468  │
│                                                       │
│       Pain Score predicted to exceed 5.0              │
│       within 15 minutes                               │
│                                                       │
│       Current 1.8        →        Predicted 6.2       │
│                                                       │
│                  [  View patient  ]                   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

- 우측 상단 `×` 버튼으로 닫을 수 있다.
- 액션 버튼은 **하나만** 둔다.
  - Dashboard: `View patient` → 해당 환자 상세로 이동
  - Patient Detail: `Continue` → 모달만 닫음
- **Probability 표기는 넣지 않는다.**
- 모달의 모든 수치는 **현재 단계의 phases 데이터에서 읽는다.** 하드코딩하지 않는다.
  위 예시는 warning 단계 기준값이다.

---

## 9. 가독성 개선

v1의 문제: 라벨 대비 약함 / 여백 좁음 / 정보 밀도 높음

| 항목 | v1 | v2 |
|---|---|---|
| 라벨 폰트 | 11px | **12px** |
| 라벨 색상 | `#64748B` | **`#475569`** |
| 라벨 자간 | `0.12em` | **`0.06em`** |
| 카드 padding | 20px | **24px** |
| 항목 간 gap | 8px | **12px** |
| 값 폰트 | 14px | **15px** |
| 좌우 비율 | 1.55 : 0.85 | **1.4 : 1** (우측 확대) |

---

## 10. 기타

### 10.1 Disclaimer
- 화면 **우측 하단 고정**, 두 화면 모두 표시
- 문구: `For investigational use only — not for clinical decision-making`

### 10.2 Reset 버튼
- **어느 화면에서 눌러도 Ward Dashboard 초기 상태로 되돌아간다.**
- 진행 중이던 모든 타이머를 정리한다.
- 데모 중 질문이 들어왔을 때 되돌릴 유일한 수단이므로 반드시 동작해야 한다.

### 10.3 Demo Start 버튼
- **두 화면 모두에 표시**한다.

---

## 11. 기술 스펙

| 항목 | 결정 |
|---|---|
| 프레임워크 | React + Vite + Tailwind CSS (기존 유지) |
| 파일 구조 | **단일 파일에서 컴포넌트별 파일로 분리** |
| 화면 전환 | **React 상태로 처리** (react-router 도입하지 않음) |
| 그래프 | **SVG 직접 작성** (차트 라이브러리 도입하지 않음) |
| 파형 | Canvas (기존 방식 유지) |
| 색상 관리 | **CSS custom properties로 토큰화** — 3절의 토큰명을 그대로 사용 |
| 배포 | Vercel, 기존 URL 유지 |
| 브랜치 | 기존 브랜치에서 작업 |
| 반응형 | 기존 동작 유지. 데스크톱/노트북 프레젠테이션 우선 최적화 |
| 의존성 버전 | **`package.json`의 `"latest"`를 전부 실제 버전으로 고정한다** |
| 폰트 | **시스템 산세리프.** styles.css의 Google Fonts Inter import를 제거한다 |
| 문서 언어 | **`index.html`의 `lang="ko"`를 `lang="en"`으로 바꾼다** |

### 권장 파일 구조

```
src/
  main.jsx                  진입점, 화면 전환 상태 관리
  data/
    patients.js             6명 환자 데이터
    phases.js               Bed 03 단계별 데이터
  components/
    WardDashboard.jsx
    PatientCard.jsx
    PatientDetail.jsx
    TrendChart.jsx          ← 신규, 최우선
    WaveformCanvas.jsx
    VitalsRail.jsx
    PainGauge.jsx
    CdssPanel.jsx
    EmrPanel.jsx
    AlertModal.jsx
    StatusBadge.jsx
    KpiRow.jsx
  styles.css                CSS 토큰 정의
```

---

## 12. 구현 우선순위

| 순위 | 항목 |
|---|---|
| 1 | CSS 토큰 정의 + 색상 시스템 전면 적용 |
| 2 | 컴포넌트 파일 분리, 데이터 파일 분리 |
| 3 | **TrendChart (추세·예측 그래프)** — 이번 버전의 핵심 |
| 4 | Ward Dashboard + 정렬 애니메이션 |
| 5 | 화면 전환 + Reset 동작 |
| 6 | 경고 모달 (중앙 + Dim) |
| 7 | CDSS 3버튼 + 안전성 뱃지 + 감사추적 |
| 8 | 파형 버퍼 초기화 수정, 높이 축소 |
| 9 | 게이지 이중 링 수정 |
| 10 | 가독성·여백 조정, Disclaimer |

---

## 13. 완료 확인 항목

- [ ] 화면에 한글이 하나도 없다
- [ ] `CPI` 단독 표기가 없다 (`Pain Score(CPI)` 형태만 존재)
- [ ] `probability` / `RISK %` 표기가 화면에서 사라졌다
- [ ] 임계값이 전부 5.0으로 통일되어 있다
- [ ] 예측 지평이 전부 15분으로 통일되어 있다 (30분 표기 잔존 없음)
- [ ] CDSS 카드의 모든 수치가 데이터에서 읽혀온다 (하드코딩 문자열 없음)
- [ ] 화면 전환 후 파형이 직선으로 시작하지 않는다
- [ ] Demo Start 시 Bed 03 카드가 맨 아래에서 맨 위로 이동한다
- [ ] Reset이 두 화면 모두에서 초기 상태로 되돌린다
- [ ] 순수 초록(`#0CA30C` 계열)이 상태색으로 쓰이지 않았다
- [ ] 상태 표시에 아이콘과 텍스트가 함께 있다
- [ ] 노트북 화면에서 스크롤 없이 한 화면에 들어온다
- [ ] Last analgesic 시각이 시간순으로 앞뒤가 맞는다
- [ ] 안전성 뱃지 수치가 recommendation 단계 vitals와 일치한다
- [ ] 예측값 변동으로 카드 순서가 흔들리지 않는다
- [ ] `package.json`에 `"latest"`가 남아 있지 않다
- [ ] Google Fonts import가 제거되었다
- [ ] `index.html`이 `lang="en"`이다
