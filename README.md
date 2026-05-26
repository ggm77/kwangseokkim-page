# 다시 부르기 : 아날로그

> 故 김광석 님의 정규 앨범 1~4집을 아날로그 감성으로 재현한 비영리 팬/포트폴리오 프로젝트입니다.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev/)

**개발 기간**: 2026.05.22 ~

---

## 소개

**다시 부르기 : 아날로그**는 한국 포크의 전설 김광석(1964~1996)의 정규 1~4집 앨범을 LP 플레이어와 카세트 플레이어 형태로 체험할 수 있는 인터랙티브 웹 프로젝트입니다.

앨범 커버를 둘러보고, 수록곡을 선택하여, YouTube 연동으로 실제 음원을 감상할 수 있습니다. 아날로그 레코드 플레이어의 감성을 UI로 구현하는 데 초점을 맞췄습니다.

---

## 주요 기능

- **앨범 캐러셀** — 정규 1~4집 앨범 커버를 3D 카드 형식으로 탐색
- **LP 플레이어** — 바이닐 레코드를 재현한 UI, Side A / Side B 수록곡 선택 및 재생
- **카세트 플레이어** — 카세트 테이프를 재현한 UI로 동일한 앨범 감상
- **YouTube 연동** — 백그라운드에서 유튜브 음원을 재생 (IFrame Player API)
- **플레이어 배경** — 재생 중인 앨범의 색상 팔레트로 동적으로 변하는 배경 애니메이션
- **스크롤 감지 헤더** — 스크롤시 헤더가 자연스럽게 나타남

---

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | React 19 |
| 언어 | TypeScript 6 |
| 빌드 도구 | Vite 8 |
| 라우팅 | React Router DOM v7 |
| 스타일링 | Vanilla CSS |

---

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 프로젝트 구조

```
src/
├── components/
│   ├── AlbumCarousel.tsx    # 앨범 탐색 캐러셀
│   ├── AlbumSleeve.tsx      # 앨범 슬리브(케이스) 컴포넌트
│   ├── LPPlayer.tsx         # LP 플레이어 UI
│   ├── CassettePlayer.tsx   # 카세트 플레이어 UI
│   ├── PlayerBackground.tsx # 동적 배경 애니메이션
│   ├── YoutubeBackground.tsx # YouTube IFrame 래퍼
│   ├── YTPlayerStore.tsx    # 전역 플레이어 상태 (Context)
│   └── TrackListSleeve.tsx  # 트랙 목록 슬리브
└── data/
    └── albums.ts            # 앨범 및 트랙 데이터
```

---

## 라이선스 및 저작권 고지

본 웹사이트는 **비영리 팬/포트폴리오 프로젝트**로, 어떠한 상업적 목적으로도 사용되지 않습니다.

수록된 음원, 영상, 앨범 이미지의 모든 저작권 및 수익권은 원작자 및 관련 권리자에게 귀속됩니다.

문의 및 피드백: [shm040806@gmail.com](mailto:shm040806@gmail.com)
