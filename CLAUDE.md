# CLAUDE.md — PainCube ICU CDSS Demo

이 저장소에서 작업할 때 반드시 지켜야 할 규칙이다.
상세 사양은 `PRD.md`를 참조한다. 이 문서는 **어떤 작업에서든 깨지면 안 되는 제약**만 담는다.

---

## 1. 이 프로젝트의 성격

투자 유치·임상 파트너 시연용 **데모**다. 실제 의료기기 소프트웨어가 아니다.

- 모든 데이터는 합성 데이터(synthetic)다.
- 실제 환자 데이터를 연결하거나, 실제 환자처럼 보이게 하는 표기를 추가하지 않는다.
- 화면 우측 하단의 `For investigational use only` 문구를 제거하지 않는다.

---

## 2. 언어 규칙 (절대 규칙)

- **UI에 표시되는 모든 문구는 영어다. 한글을 넣지 않는다.**
  - 라벨, 버튼, 상태어, 툴팁, 에러 문구, `aria-label`, `alt` 전부 해당된다.
- 코드 주석과 커밋 메시지는 한글을 써도 된다.
- 문서(`PRD.md`, `CLAUDE.md`)는 한글이다.

---

## 3. 용어 규칙 (절대 규칙)

| 쓸 것 | 쓰지 말 것 |
|---|---|
| `Pain Score(CPI)` (정식 표기) | `CPI` 단독 |
| `PAIN SCORE` (좁은 공간) | `Calculated Pain Index` |
| `PRED_15M` / `Predicted · 15 min` | `PRED_30M`, `predicted in 30 min` |
| `Time to Threshold` | `RISK %`, `Pain probability`, `probability of severe pain` |
| `Threshold 5.0` | `7.0` |

- **예측 지평은 15분이다.** 30분 표기가 남아 있으면 안 된다.
- **임계값은 5.0이다.** 7.0이 남아 있으면 안 된다.
- **확률(probability) 지표는 이 제품 화면에 존재하지 않는다.** 되살리지 않는다.

---

## 4. 색상 규칙 (절대 규칙)

색상은 `src/styles.css`의 CSS custom property로만 사용한다.
컴포넌트에 hex 값을 직접 쓰지 않는다. Tailwind 임의 색상 클래스도 쓰지 않는다.

### 3계층 분리 — 계층을 섞지 않는다

```
브랜드·구조 계층 → 화면의 뼈대. 데이터나 상태를 나타내는 데 절대 쓰지 않는다.
  --brand-navy    #1B1B52
  --brand-panel   #102C5E
  --brand-light   #77A0D5   아이콘·액센트 전용. 텍스트에 쓰지 말 것 (대비 2.7:1)
  --page-bg       #EBF0F6
  --card-surface  #FFFFFF
  --hairline      #D7E0EC
  --text-primary  #0F172A
  --text-label    #475569
  --text-muted    #8A93A6

상태 계층 → 상태 표현 전용.
  --status-stable    #118C6E
  --status-caution   #D9631A
  --status-critical  #B01C3E
  --status-nodata    #8A93A6
  --status-stable-tint   #E2F1EE   (배경 전용)
  --status-caution-tint  #FAECE4
  --status-critical-tint #F6E4E8

파형 계층 → 신호 종류 구분 전용. (모니터 내부의 Vitals 숫자 색도 여기에 속한다)
  --signal-eeg    #8B5CF6      EEG 파형, BIS 숫자
  --signal-ecg    #3FA834      ECG 파형, HR 숫자
  --signal-ppg    #2E86C1      PPG 파형, SpO2 숫자
  --monitor-bg    #0A1730
  --monitor-bar   #14203A
  --monitor-ink   rgba(255,255,255,0.86)   NIBP / RR / BT 숫자, 모니터 기본 텍스트
  --monitor-ink-dim rgba(255,255,255,0.45) 모니터 내부 라벨
  --monitor-alert #F5A03C   모니터 내부 임계 초과 값 (▲ 아이콘과 함께)
  --monitor-grid  rgba(255,255,255,0.055)

차트 계층
  --chart-observed  #1C3F7C
  --chart-now       #8A93A6
  --chart-grid      #E3E9F2
```

### Tailwind 설정

`theme.colors`를 토큰으로 통째로 교체해 기본색을 차단한다.
단 `white` / `black` / `transparent` / `current` / `inherit` 다섯 개는 반드시 남긴다.
이걸 지우면 `text-white` 같은 필수 유틸리티가 사라져 엉뚱한 토큰을 대신 쓰게 된다.

### 모니터 내부 색

모니터(네이비 영역) 안에서는 상태색 3종을 쓰지 않는다. 네이비 위에서 3색을 만들면
색약 구분도가 ΔE 2.5로 실패한다. `--monitor-ink`(평상시)와 `--monitor-alert`(임계 초과, ▲ 아이콘 동반)
2단계로만 처리한다. 상태색 3종은 흰 카드 영역 전용이다.

### 금지 사항

- **순수 초록(`#0CA30C`, `green-500`, `emerald-500`, `#69F24C` 등)을 상태색으로 쓰지 말 것.**
  오렌지와의 색약 구분도가 ΔE 2.9로 실패한다. 반드시 `--status-stable` (#118C6E)을 쓴다.
  단 이 금지는 **상태 계층에만** 적용된다. 모니터 내부 Vitals 숫자는 신호 계층이므로
  `--signal-ecg` 등을 쓰는 것이 정상이다(PRD 3.3절 참조).
- **`--brand-light` (#77A0D5)를 상태색·데이터색으로 쓰지 말 것.**
  시안 계열 상태색과 구분도 ΔE 10.7로 실패한다. 구조·액센트 전용이다.
- **상태를 색상만으로 전달하지 말 것.** 항상 아이콘 + 텍스트를 함께 둔다.

### 예측선 색상만 예외적으로 동적이다

추세 그래프의 미래 구간 점선은 도달할 상태의 색을 따른다.
- 예측 < 5.0 → `--status-stable`
- 예측 ≥ 5.0 → `--status-critical`

---

## 5. 데이터 규칙 (절대 규칙)

- **화면에 보이는 모든 수치는 데이터 파일에서 읽어온다.**
  `src/data/patients.js`, `src/data/phases.js`가 유일한 출처다.
- **문자열 안에 숫자를 하드코딩하지 않는다.**
  - 나쁜 예: `value="CPI 1.2 / 10, predicted 2.1 in 30 min"`
  - 좋은 예: `` value={`Pain Score ${m.painScore.toFixed(1)} / 10, predicted ${m.predicted.toFixed(1)} in 15 min`} ``
- 이유: v1은 좌측 모니터가 데이터를 참조하고 우측 CDSS 카드는 하드코딩이라,
  수치를 조정하면 같은 화면 안에서 숫자가 어긋났다. 데모 중 치명적이다.

---

## 6. 파형 캔버스 규칙

- **버퍼를 `0`으로 초기화하지 않는다.**
  반드시 생리학적 파형 값으로 미리 채운 상태에서 렌더를 시작한다.
  (초기화 시 `nextSample()`을 버퍼 길이만큼 미리 돌려 채운다)
- 이유: 화면 전환 시 캔버스가 재마운트되는데, 버퍼가 0이면
  **알람을 받고 환자 화면에 진입한 순간 심전도가 평탄선으로 보인다.**
  데모의 클라이맥스에서 심정지처럼 보이는 화면이 나온다.
- 파형 높이는 240px다. 늘리지 않는다. 추세 그래프가 화면의 주인공이다.

---

## 7. 레이아웃 규칙

- **Patient Detail은 노트북 화면에서 스크롤 없이 한 화면에 들어와야 한다.**
  요소를 추가할 때 이 제약을 먼저 확인한다.
- 좌우 비율은 1.4 : 1 (좌측 그래프·파형 / 우측 CDSS)이다.
- 반응형 동작은 기존 것을 유지한다. 데스크톱 우선이되 좁은 화면에서 깨지지 않게 한다.
- 좌측 사이드바는 도입하지 않는다.

---

## 8. 가독성 기준

| 항목 | 값 |
|---|---|
| 라벨 | 12px · `--text-label` · 자간 0.06em · 대문자 |
| 값 | 15px 이상 |
| 카드 padding | 24px |
| 카드 내 항목 간 gap | 12px |

---

## 9. 데모 운영 규칙

- **Reset 버튼은 어느 화면에서 눌러도 Ward Dashboard 초기 상태로 되돌린다.**
  진행 중인 모든 타이머를 정리한다. 데모 중 되돌릴 유일한 수단이므로 반드시 동작해야 한다.
- `Demo Start`는 두 화면 모두에 표시한다.
- 알람음을 추가하지 않는다.

---

## 10. 임상 정확성 규칙

- `Sedation`은 **RASS −4**다. `−2`로 되돌리지 않는다.
  RASS −2는 자가보고와 CPOT 평가가 가능한 구간이라 `Unable to self-report`와 모순된다.
- 주인공 환자는 **CABG, POD 0**이다.
- 약물 권고는 `Fentanyl 25 mcg IV Bolus` 하나만 쓴다. 다른 약물·용량을 임의로 추가하지 않는다.
- 안전성 뱃지의 수치(RR, SpO₂, 누적 fentanyl)는 해당 단계의 vitals와 일치해야 한다.

---

## 11. 외부 스킬 사용 규칙 (ui-ux-pro-max)

이 프로젝트는 `ui-ux-pro-max` 플러그인 스킬을 **보조 도구로만** 사용한다.

### 쓸 것 — 품질 검증 용도

- 접근성 (대비, 키보드 내비게이션, aria-label, 포커스 링)
- 터치·인터랙션 (최소 크기, 상태 전환 피드백, 로딩 표시)
- 레이아웃·반응형 (브레이크포인트, 가로 스크롤 방지, 고정 px 폭 회피)
- 애니메이션 (전환 타이밍, `prefers-reduced-motion` 대응)
- 컴포넌트 구조와 여백 체계

### 쓰지 말 것 — 이미 확정된 영역

- **색상.** 이 프로젝트의 팔레트는 PainCube 로고에서 추출하고 색약 대비 검증을
  통과시킨 값이다(4절). 스킬이 제안하는 팔레트로 **절대 교체하지 않는다.**
- **타이포그래피 조합.** 시스템 산세리프를 유지한다. Google Fonts를 도입하지 않는다.
- **UI 스타일 변경.** glassmorphism, neon, 3D 등 스킬이 제안하는 시각 스타일을
  적용하지 않는다. 임상 소프트웨어의 톤을 유지한다.
- **`--design-system` 모드를 실행하지 않는다.** 이 모드는 팔레트·폰트·스타일을
  통째로 새로 생성하므로 위 결정을 덮어쓴다.

### 충돌이 생기면

스킬의 권고와 `PRD.md` / `CLAUDE.md`가 어긋나면 **항상 이 두 문서가 우선한다.**
스킬 권고를 따르고 싶으면 먼저 나에게 근거와 함께 물어라. 임의로 바꾸지 마라.

### 스킬 호출 방법

스킬은 UI 관련 작업에서 **자동으로 활성화된다.** 별도 호출 없이 동작하는 것이 기본이다.

검색 스크립트를 직접 실행해야 할 때는 **`${CLAUDE_PLUGIN_ROOT}`를 쓰지 마라.**
이 변수는 Bash 도구로 실행하는 명령에는 전달되지 않아 경로를 찾지 못한다.
아래처럼 경로를 먼저 찾아 절대경로로 실행한다.

```bash
SEARCH=$(find ~/.claude/plugins ~/Library/Application\ Support/claude/plugins -path "*ui-ux-pro-max/scripts/search.py" 2>/dev/null | head -1)
python3 "$SEARCH" "clinical dashboard layout hierarchy" --domain ux
python3 "$SEARCH" "accessibility contrast focus keyboard" --domain ux
python3 "$SEARCH" "animation transition timing reduced motion" --domain ux
```

경로를 못 찾으면 스크립트 실행을 포기하고 스킬의 SKILL.md 내용만 활용해라.
스크립트가 없다고 작업을 멈추지 마라.

`--domain color`, `--domain typography`, `--design-system`은 사용하지 않는다.

---

## 12. UI_References 폴더 사용 규칙

`UI_References/`에 참고용 대시보드 이미지가 들어 있다.

**참고할 것 — 구조와 여백만**
- Ref_01 (BioSync): KPI 카드 구조. 큰 숫자 + 작은 라벨 + 우측 상태 뱃지 배치
- Ref_03 (GeneX): 네이비/화이트 톤 분리, 카드 그리드 밀도
- Ref_04 (ZenVibe): 넓은 여백, 큰 수치 타이포, 카드 간 호흡

**참고하지 말 것 — 색상**
- Ref_01의 무지개 그라디언트 게이지와 히트맵을 따라 하지 마라.
  색상만으로 의미를 전달하는 안티패턴이며 4절 색상 규칙 위반이다.
- 어떤 레퍼런스의 색상값도 추출해 쓰지 마라. 팔레트는 4절이 유일한 출처다.
- Ref_03의 좌측 사이드바를 도입하지 마라. 미도입으로 결정되었다.

레퍼런스는 **"이 정도 여백과 밀도"**를 잡는 용도다. 시각 스타일을 복제하는 용도가 아니다.

---

## 13. 작업 방식

- 기존 브랜치에서 작업한다. 새 브랜치를 만들지 않는다.
- 배포는 Vercel, 기존 URL을 유지한다. 배포 설정을 바꾸지 않는다.
- 의존성을 새로 추가하지 않는다. (차트 라이브러리, 라우터, 애니메이션 라이브러리 모두 불필요)
  기존 의존성: react, react-dom, vite, tailwindcss, lucide-react
- 작업 후 `npm run build`가 통과하는지 확인한다.

---

## 14. 변경 후 자가 점검

- [ ] 화면에 한글이 없다
- [ ] `CPI` 단독 표기, `30 min`, `7.0`, `probability`가 없다
- [ ] 컴포넌트에 hex 값 직접 사용이 없다
- [ ] 순수 초록이 상태색으로 쓰이지 않았다
- [ ] 상태 표시에 아이콘과 텍스트가 함께 있다
- [ ] 화면에 보이는 수치가 전부 데이터 파일에서 온다
- [ ] 화면 전환 후 파형이 직선으로 시작하지 않는다
- [ ] Patient Detail이 노트북 화면에서 스크롤 없이 들어온다
- [ ] Reset이 두 화면 모두에서 동작한다
- [ ] `npm run build` 통과
- [ ] 스킬 권고 때문에 팔레트·폰트·스타일이 바뀐 곳이 없다
