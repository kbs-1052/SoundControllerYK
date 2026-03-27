import { app, BrowserWindow, Tray, Menu, nativeImage, session } from 'electron';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 자동 재생 정책 완화
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process');

let logPath;
function log(msg) {
  const time = new Date().toLocaleString();
  console.log(msg);
  try {
    if (!logPath && app.isReady()) {
      logPath = path.join(app.getPath('userData'), 'electron_log.txt');
    }
    if (logPath) {
      fs.appendFileSync(logPath, `[${time}] ${msg}\n`);
    }
  } catch (e) {}
}

// 예상치 못한 에러 캡처
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}`);
  log(err.stack);
});

let mainWindow;
let tray;
let isQuiting = false;
let localServer = null;
let serverPort = 18234; // 로컬 HTTP 서버 포트

// ─── MIME 타입 매핑 ───
const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.mp4':  'video/mp4',
  '.webp': 'image/webp',
};

// ─── 로컬 HTTP 서버 시작 (배포 버전 전용 - file:// 프로토콜 문제 해결의 핵심) ───
function startLocalServer(distPath) {
  return new Promise((resolve, reject) => {
    localServer = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0]; // 쿼리 파라미터 제거
      if (urlPath === '/') urlPath = '/index.html';
      
      const filePath = path.join(distPath, urlPath);
      
      // 보안: distPath 밖으로 나가지 못하게 방어
      if (!filePath.startsWith(distPath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          // SPA 라우팅 지원: 파일이 없으면 index.html로 폴백
          fs.readFile(path.join(distPath, 'index.html'), (err2, fallbackData) => {
            if (err2) {
              res.writeHead(404);
              res.end('Not Found');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallbackData);
          });
          return;
        }
        
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      });
    });
    
    localServer.listen(serverPort, '127.0.0.1', () => {
      log(`Local HTTP server started on http://127.0.0.1:${serverPort}`);
      resolve(serverPort);
    });
    
    localServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // 포트가 이미 사용 중이면 다음 포트 시도
        serverPort++;
        log(`Port in use, trying ${serverPort}...`);
        localServer.close();
        startLocalServer(distPath).then(resolve).catch(reject);
      } else {
        log(`Server error: ${err.message}`);
        reject(err);
      }
    });
  });
}

async function createWindow() {
  log('Window creating...');
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      webviewTag: true, // YouTube를 webview로 직접 재생하기 위한 설정
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
  });

  // 유저 에이전트 설정 (Electron 시그니처 제거)
  mainWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36');

  // 유튜브 관련 응답 헤더 수정 (X-Frame-Options, CSP 제거)
  const filter = {
    urls: [
      'https://www.youtube.com/*',
      'https://*.youtube.com/*',
      'https://*.googlevideo.com/*',
      'https://*.ytimg.com/*',
      'https://www.youtube-nocookie.com/*',
      'https://*.google.com/*',
      'https://*.doubleclick.net/*'
    ]
  };

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    
    // 임베드 차단 관련 보안 헤더 제거
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['Content-Security-Policy'];
    delete responseHeaders['content-security-policy-report-only'];

    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    
    callback({ responseHeaders });
  });

  // ─── 페이지 로드 (핵심 변경: 배포 버전에서 로컬 HTTP 서버 사용) ───
  if (app.isPackaged) {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      // 로컬 HTTP 서버로 서빙 → file:// 대신 http://127.0.0.1 사용
      // 이렇게 하면 유튜브 IFrame API가 정상적인 웹 사이트로 인식하여 152-4/153 에러 방지
      await startLocalServer(distPath);
      log(`Loading from local server: http://127.0.0.1:${serverPort}`);
      await mainWindow.loadURL(`http://127.0.0.1:${serverPort}`);
    } else {
      // dist 폴더가 없을 경우 폴백 (루트 index.html)
      const rootPath = path.join(__dirname, 'index.html');
      log(`Loading from root fallback: ${rootPath}`);
      await mainWindow.loadFile(rootPath);
    }
  } else {
    log('Loading from dev server: http://localhost:3000');
    await mainWindow.loadURL('http://localhost:3000');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log('Window shown.');
  });

  mainWindow.on('close', (e) => {
    if (!isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'icon.png');
    if (!fs.existsSync(iconPath)) {
       log('WARNING: icon.png not found for tray');
    }
    
    // 네이티브 이미지 사용 및 리사이징 (윈도우 트레이에 적합한 크기 16x16)
    let image = nativeImage.createFromPath(iconPath);
    if (!image.isEmpty()) {
       image = image.resize({ width: 16, height: 16 });
    } else {
       log('WARNING: Failed to load tray icon image from path');
    }

    tray = new Tray(image);
    const menu = Menu.buildFromTemplate([
      { label: '열기', click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        } 
      },
      { type: 'separator' },
      { label: '종료', click: () => { isQuiting = true; app.quit(); } }
    ]);

    tray.setToolTip('SoundControlYK');
    tray.setContextMenu(menu);

    // 트레이 아이콘 클릭 시 창 표시/숨기기 토글
    tray.on('click', () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    log('Tray created successfully.');
  } catch (e) {
    log(`Tray creation failed: ${e.message}`);
  }
}

app.whenReady().then(async () => {
  log('App Ready.');
  createTray();
  await createWindow();
}).catch(err => {
  log(`App ready error: ${err.message}`);
});

app.on('window-all-closed', () => {
  // 트레이에 유지
});

// 앱 종료 시 로컬 서버도 정리
app.on('before-quit', () => {
  isQuiting = true;
  if (localServer) {
    localServer.close();
    log('Local server closed.');
  }
});
