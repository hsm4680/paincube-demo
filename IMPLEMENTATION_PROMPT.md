# 통합 실행 프롬프트

## 사전 준비 — 스킬 설치 (최초 1회)

Claude Code를 띄운 뒤 아래 두 줄을 먼저 실행한다.

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

설치 후 `/plugin` 으로 `ui-ux-pro-max`가 목록에 보이는지 확인한다.
스킬 검색 스크립트는 Python 3를 요구한다. `python3 --version`으로 확인한다.

이 스킬의 사용 범위와 금지 사항은 `CLAUDE.md` 11절에 정의되어 있다.
**색상·폰트·시각 스타일은 이미 확정된 값이 우선하며 스킬 제안으로 덮어쓰지 않는다.**

---

아래 블록 전체를 복사해 Claude Code에 붙여넣는다.

---

```
이 저장소는 PainCube ICU CDSS 데모다. v2로 전면 개편한다.

먼저 PRD.md와 CLAUDE.md를 정독해라. 두 문서가 이 작업의 유일한 사양이다.
PRD.md는 무엇을 만들지, CLAUDE.md는 어떤 제약을 절대 어기면 안 되는지를 담고 있다.
작업 중 판단이 필요하면 두 문서를 먼저 다시 확인하고, 그래도 불명확하면 나에게 물어라.
문서에 없는 기능을 임의로 추가하지 마라.

ui-ux-pro-max 스킬이 설치되어 있다. CLAUDE.md 11절의 사용 규칙을 반드시 지켜라.
요약하면, 레이아웃·접근성·인터랙션·반응형 품질에만 쓰고,
색상·폰트·시각 스타일에는 쓰지 마라. --design-system 모드를 실행하지 마라.
스킬 권고가 PRD.md / CLAUDE.md와 어긋나면 두 문서가 항상 우선한다.

현재 상태: src/main.jsx 단일 파일 710줄. 환자 1명, 단일 화면.
목표 상태: 화면 2개(Ward Dashboard → Patient Detail), 컴포넌트 분리, 추세·예측 그래프 신설.

## 작업 순서

아래 순서대로 진행하되, 각 단계가 끝나면 npm run build를 돌려 통과를 확인하고 다음으로 넘어가라.

### 1단계 — 기반 정리
- src/styles.css에 PRD 3절의 CSS custom property를 전부 정의한다.
  토큰명을 PRD에 적힌 그대로 쓴다. 컴포넌트에서 hex를 직접 쓰지 않는다.
- src/data/patients.js — PRD 4.4절의 환자 6명 데이터
- src/data/phases.js — PRD 6절의 Bed 03 단계별 데이터 (5단계)
- src/main.jsx를 PRD 11절의 파일 구조대로 컴포넌트 파일로 분리한다.
  이 단계에서는 기능을 바꾸지 말고 분리만 한다. 분리 후 기존 화면이 그대로 뜨는지 확인한다.

### 2단계 — TrendChart (이번 버전의 핵심, 가장 공들여라)
- src/components/TrendChart.jsx를 SVG로 직접 작성한다. 차트 라이브러리를 쓰지 마라.
- 사양은 PRD 5.3절. 특히 다음을 지켜라:
  - 가로축 -60min ~ Now ~ +15min, 눈금 15분 단위
  - 세로축 0~10 고정 (자동 스케일 금지)
  - 과거는 실선, 미래는 점선, 현재 시점에 세로 기준선
  - 미래 점선의 색은 도달할 상태에 따라 동적으로 바뀐다 (5.0 미만이면 stable, 이상이면 critical)
  - 신뢰구간 음영과 임계선은 그리지 않는다
  - 시간이 흐르며 좌측으로 이동하는 실시간 렌더
- 과거 60분 데이터는 단계별로 자연스럽게 이어지도록 생성한다.
  idle에서는 평탄하다가 warning부터 상승하는 형태여야 한다.

### 3단계 — Ward Dashboard
- 3열 x 2행 환자 카드 그리드. 사양은 PRD 4절.
- 정렬 기준은 예측값 내림차순이며 실시간으로 갱신된다.
- 순서가 바뀔 때 카드가 애니메이션으로 자리를 이동해야 한다.
  이 동작이 데모의 핵심 장면이다. CSS transform transition으로 구현하고,
  카드가 순간이동하지 않고 부드럽게 미끄러지도록 해라.
- 나머지 5명은 현재값이 ±0.3 범위에서 소폭 변동하되,
  정렬 순서가 뒤집히지 않도록 변동폭을 제한한다.

### 4단계 — 화면 전환과 데모 흐름
- react-router를 쓰지 마라. React 상태로 전환한다.
- 흐름은 PRD 7절 그대로 구현한다.
- Reset 버튼은 어느 화면에서 눌러도 Ward Dashboard 초기 상태로 되돌리고
  진행 중인 모든 타이머를 정리해야 한다. 반드시 동작을 확인해라.
- Demo Start는 두 화면 모두에 표시한다.

### 5단계 — 경고 모달
- 화면 중앙, 배경 60% Dimmed. 사양은 PRD 8절.
- 우측 상단 x 버튼, 액션 버튼 1개.
- Dashboard에서는 View patient, Patient Detail에서는 Continue.
- 알람음을 넣지 마라.

### 6단계 — Patient Detail 재구성
- 레이아웃은 PRD 5.1절. 위에서 아래로: 헤더 → 상태어 → KPI 3칸 → 좌(그래프+파형) 우(게이지+CDSS+EMR).
- 좌우 비율 1.4 : 1.
- 노트북 화면에서 스크롤 없이 한 화면에 들어와야 한다. 이게 안 되면 여백부터 줄이지 말고
  나에게 어떤 요소를 줄일지 물어봐라.
- KPI 3칸: Current Pain Score / Predicted 15 min / Time to Threshold.
- 상태어는 아이콘과 함께 표시하고 설명문은 붙이지 않는다.

### 7단계 — 파형 패널
- 높이를 240px로 줄인다.
- 배경을 --monitor-bg (#0A1730) 네이비로 바꾼다.
- ECG 색상을 #3FA834로 톤다운한다.
- 중요: 버퍼를 0으로 초기화하지 마라. nextSample()을 버퍼 길이만큼 미리 돌려
  생리학적 파형으로 채운 상태에서 렌더를 시작해라.
  화면 전환으로 캔버스가 재마운트될 때 직선이 보이면 안 된다. 실제로 전환해보고 확인해라.
- 모니터 상단 바 4칸을 PAIN SCORE / PRED_15M / TIME TO THRESHOLD / AI STATUS로 바꾼다.

### 8단계 — 게이지와 CDSS
- 게이지: 현재값은 실선 호, 현재값 끝점에서 예측값까지는 점선 확장 호 + 화살표.
  기존처럼 두 링을 같은 반지름에 겹쳐 그려서 덮이게 하지 마라. 사양은 PRD 5.5절.
- 게이지 카드의 텍스트 3줄 중 Predicted와 Probability 줄은 삭제하고
  Personal baseline 한 줄만 남긴다. KPI 3칸과 중복되기 때문이다.
- CDSS 카드: PRD 5.6절. 안전성 뱃지는 한 줄, recommendation 단계에서만.
- 버튼 3개: Dismiss(그냥 닫힘) / Modify(용량 선택 팝업 후 Approve 흐름) / Approve.
- 승인 후 카드 내부 최하단에 감사추적 한 줄.
- CDSS 카드의 모든 수치는 데이터에서 읽어와라. 문자열에 숫자를 박지 마라.
  기존 코드는 이 부분이 하드코딩이라 좌측 모니터와 숫자가 어긋날 수 있었다.

### 9단계 — 마감
- EMR 카드 헤더에 HL7 FHIR R4 뱃지 추가. 6개 항목은 그대로 유지. Sedation은 RASS -4.
- 우측 하단 고정 disclaimer 추가.
- 가독성 기준 적용: PRD 9절의 폰트·여백 값.
- 환자 헤더 맥락 정보: #1468 · M/69 · ICU Bed 03 / CABG · POD 0 · Intubated, RASS -4

### 10단계 — 디자인 QA (ui-ux-pro-max 스킬 활용)

구현이 끝난 뒤 스킬을 검증 도구로 사용해 다음 항목만 점검하고 개선안을 보고해라.

스킬은 UI 작업에서 자동 활성화된다. 검색 스크립트를 직접 돌려야 하면
${CLAUDE_PLUGIN_ROOT}를 쓰지 말고 (Bash 도구에는 전달되지 않는다) 경로를 먼저 찾아라.

```bash
SEARCH=$(find ~/Library/Application\ Support/claude/plugins -path "*ui-ux-pro-max/scripts/search.py" 2>/dev/null | head -1)
python3 "$SEARCH" "clinical dashboard layout hierarchy" --domain ux
python3 "$SEARCH" "accessibility contrast focus keyboard" --domain ux
python3 "$SEARCH" "animation transition timing reduced motion" --domain ux
```

경로를 못 찾으면 스크립트 없이 SKILL.md 내용만으로 진행해라. 작업을 멈추지 마라.

점검 항목
- 접근성: 대비, 키보드 내비게이션, aria-label, 포커스 링 제거 여부
- 인터랙션: 버튼 최소 크기, 상태 전환 피드백, 로딩 표시
- 레이아웃: 브레이크포인트, 가로 스크롤 발생 여부, 고정 px 폭
- 애니메이션: 카드 재정렬 전환 타이밍, prefers-reduced-motion 대응

색상·폰트·시각 스타일에 대한 스킬 권고는 무시해라. 이미 확정된 값이다.
개선안 중 PRD.md / CLAUDE.md와 충돌하는 것이 있으면 적용하지 말고 나에게 보고만 해라.

## 마지막에 반드시 할 것

CLAUDE.md 14절의 자가 점검 목록을 하나씩 실제로 확인하고 결과를 보고해라.
특히 다음 네 가지는 코드 전체를 검색해서 확인해라.
- 화면에 표시되는 문자열에 한글이 없는지
- CPI 단독 표기, "30 min", "7.0", "probability"가 남아 있지 않은지
- 컴포넌트에 hex 값 직접 사용이 없는지
- 화면에 보이는 수치 중 하드코딩된 것이 없는지

그리고 npm run build 통과를 확인한 뒤, 개발 서버를 띄워
Ward Dashboard → Demo Start → 카드 재정렬 → 모달 → 환자 진입 → Approve → 회복까지
전체 흐름을 한 번 돌려보고 이상이 있으면 보고해라.
```

---

## 단계별로 나눠 실행하고 싶을 때

위 프롬프트가 한 번에 돌리기 부담스러우면 아래처럼 잘라서 넣는다.

| 회차 | 지시 |
|---|---|
| 1 | `PRD.md와 CLAUDE.md를 읽고, 1단계(기반 정리)만 수행해라. 끝나면 보고하고 멈춰라.` |
| 2 | `2단계 TrendChart를 구현해라. PRD 5.3절 사양을 그대로 따라라.` |
| 3 | `3~5단계(Ward Dashboard, 화면 전환, 모달)를 구현해라.` |
| 4 | `6~10단계(Patient Detail 재구성, 파형, 게이지·CDSS, 마감, 디자인 QA)를 구현해라.` |
| 5 | `CLAUDE.md 14절 자가 점검을 수행하고 전체 흐름을 검증해라.` |

## 수정 요청 시 쓸 문장

작업 후 고칠 부분이 생기면 전체 재작성을 시키지 말고 이렇게 지시한다.

```
CLAUDE.md의 제약은 그대로 유지한 채, <해당 부분>만 수정해라.
다른 파일과 다른 컴포넌트는 건드리지 마라.
```
