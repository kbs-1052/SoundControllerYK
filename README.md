# 🎵 SoundControllerYK (미디어 스케줄러)

본 프로젝트는 특정 요일과 시간에 유튜브 영상 및 로컬 MP3 파일을 자동으로 재생해 주는 **Electron 기반 미디어 스케줄러**입니다. 헬스장, 카페, 상점 등 음악이나 영상 스케줄링이 필요한 곳에서 사용하기에 적합하도록 설계되었습니다.

## 주요 기능
- **📅 스마트 스케줄러**: 요일별, 시간별로 재생 목록을 관리하고 자동으로 실행합니다. (1초 단위 정밀 분석)
- **🎬 YouTube Cinema**: 유튜브 IFrame API의 제약을 우회하는 **WebView 직접 방문 방식**을 도입하여 모든 영상을 끊김 없이 재생합니다. (차단된 영상, 도메인 제한 오류 해결)
- **🎶 MP3 브로드캐스터**: 로컬 MP3 파일을 IndexedDB에 안전하게 보관하고 지정된 시간에 고음질로 송출합니다.
- **🔄 자동 재개(Resumption)**: 긴 유튜브 영상 도중에 짧은 오디오 공지가 끼어들 경우, 공지가 끝나면 자동으로 유튜브가 멈춘 지점부터 이어집니다.
- **🛠 실시간 진단 도구**: 시스템 하단 대시보드를 통해 스케줄러 작동 여부와 로그를 한눈에 모니터링할 수 있습니다.
- **📦 시스템 트레이**: 백그라운드에서도 완벽하게 동작하며 트레이 아이콘을 통해 관리 창을 끄고 켤 수 있습니다.

## 기술 스택
- **Framework**: [Electron](https://www.electronjs.org/) (Desktop App)
- **Frontend**: [Vue 3](https://v3.vuejs.org/) (Vite Build System)
- **Storage**: Browser LocalStorage & IndexedDB (Serverless Architecture)
- **Engine**: Chrome/Chromium WebView Logic

## 설치 및 빌드 방법 (개발자용)

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 모드 실행
```bash
npm run dev
```

### 3. 배포용 빌드 (dist 생성)
```bash
npm run build
```

### 4. 실행 (배포 테스트)
`run_app.bat` 혹은 `npm start`를 통해 로컬 서버 기반의 안정적인 미디어 엔진이 구동됩니다.

## 스크린샷 및 영상
프로그램 실행 후 하단의 **[시스템 시작하기]** 버튼을 클릭하면 미디어 엔진이 활성화됩니다.

---
**개발 및 유지보수**: kbs-1052
**최종 업데이트**: 2026-03-27
