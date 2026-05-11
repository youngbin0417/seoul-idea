# 🎨 ECO App Design System (Toss Style)

본 문서는 토스(Toss)와 같은 깔끔하고 직관적인 한국형 프리미엄 앱 디자인을 구현하기 위한 가이드라인입니다.

## 1. Design Principles (토스풍 핵심 원칙)
- **Extreme Simplicity**: 불필요한 라인, 복잡한 그라데이션을 제거하고 여백과 면으로 구분합니다.
- **Clarity**: 사용자가 다음 행동을 고민하지 않게 핵심 정보(OAI 점수)를 가장 크고 선명하게 노출합니다.
- **Softness**: 24px 이상의 큰 border-radius와 매우 부드러운 그림자를 사용하여 친근감을 줍니다.
- **Meaningful Color**: 색상은 정보를 전달하는 용도로만 제한적으로 사용합니다 (상태 표시 등).

## 2. Color Palette (Toss Standard)
| 항목 | 색상 코드 | 용도 |
|------|-----------|------|
| **Background** | `#F2F4F6` | 전체 화면 배경 (회색빛) |
| **Surface** | `#FFFFFF` | 카드, 바텀 시트 배경 |
| **Primary** | `#3182F6` | 토스 블루 (또는 ECO용 `#00D082` 추천) |
| **Text Primary** | `#191F28` | 제목, 강조 텍스트 |
| **Text Secondary** | `#4E5968` | 설명, 본문 |
| **Text Tertiary** | `#8B95A1` | 비활성, 보조 정보 |
| **Status Green** | `#2ECC71` | 최적 (OAI 80-100) |
| **Status Yellow** | `#FBC02D` | 좋음 (OAI 60-79) |
| **Status Orange** | `#FF9800` | 보통 (OAI 40-59) |
| **Status Red** | `#FF4D4D` | 나쁨 (OAI 0-39) |

## 3. Image Generation Prompts
발표용 고퀄리티 에셋 생성을 위한 프롬프트입니다.

### Logo
> "Premium minimalist app icon for 'ECO'. A single, perfectly balanced organic leaf shape integrated with a subtle efficiency gauge line. High-quality vector style, vibrant mint green (#00D082) on a soft white background. Toss-style aesthetics, simple and iconic."

### Hero/Activity Images
> "High-end lifestyle photography of [Activity Name, e.g., Golf Course/Running Path]. Captured in soft, natural morning light. Shallow depth of field, minimalist composition. Clean and professional look for a premium mobile app background."

## 4. UI Component Prompts (CSS/HTML)
- **Card**: `background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);`
- **Button**: `height: 56px; border-radius: 16px; font-weight: 600; font-size: 17px;`
- **Typography**: `Pretendard, -apple-system, sans-serif;`

---
이 가이드를 바탕으로 현재의 '엉성한' 디자인을 전면 개편하겠습니다.
