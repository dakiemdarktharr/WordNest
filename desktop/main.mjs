import { speakText, stopSpeech } from './speech.mjs';
import {
  app,
  BrowserWindow,
  Menu,
  protocol,
  session,
  dialog,
  ipcMain,
} from 'electron';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAsset, contentType, CSP } from './security.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const smoke = process.argv.includes('--wordnest-smoke');
if (smoke && process.env.WORDNEST_TEST_USER_DATA)
  app.setPath('userData', path.resolve(process.env.WORDNEST_TEST_USER_DATA));
app.setName('WordNest');
app.setAppUserModelId('vn.wordnest.desktop');
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'wordnest',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
let window;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.show();
      window.focus();
    }
  });
  app
    .whenReady()
    .then(async () => {
      ipcMain.handle('wordnest:speak', (event, text) => {
        if (
          event.sender !== window?.webContents ||
          event.senderFrame !== event.sender.mainFrame ||
          event.senderFrame.url !== 'wordnest://app/'
        )
          return { ok: false, error: 'denied' };
        return speakText(
          text,
          smoke
            ? path.join(app.getPath('userData'), 'speech-test.wav')
            : undefined,
        );
      });
      protocol.handle('wordnest', async (request) => {
        const asset = resolveAsset(request.url, path.join(here, '../dist'));
        if (!asset || !['GET', 'HEAD'].includes(request.method))
          return new Response('Not found', { status: 404 });
        try {
          const body = await readFile(asset);
          return new Response(request.method === 'HEAD' ? null : body, {
            headers: {
              'Content-Type': contentType(asset),
              'Content-Security-Policy': CSP,
              'X-Content-Type-Options': 'nosniff',
            },
          });
        } catch {
          return new Response('Not found', { status: 404 });
        }
      });
      session.defaultSession.setPermissionRequestHandler(
        (_webContents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      session.defaultSession.webRequest.onBeforeRequest((details, callback) =>
        callback({
          cancel: !/^(wordnest:|blob:|data:|devtools:)/.test(details.url),
        }),
      );
      session.defaultSession.on('will-download', (_event, item) => {
        item.setSaveDialogOptions({
          title: 'Lưu file từ WordNest',
          defaultPath: path.join(
            app.getPath('downloads'),
            path.basename(item.getFilename()),
          ),
        });
      });
      const createWindow = () => {
        window = new BrowserWindow({
          width: 1240,
          height: 850,
          minWidth: 760,
          minHeight: 620,
          title: 'WordNest',
          backgroundColor: '#f8f9fc',
          show: !smoke,
          icon: path.join(here, '../dist/wordnest-icon.png'),
          webPreferences: {
            preload: path.join(here, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            spellcheck: false,
            devTools: !app.isPackaged || smoke,
          },
        });
        window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        window.webContents.on('will-navigate', (event, url) => {
          if (url !== 'wordnest://app/') event.preventDefault();
        });
        window.webContents.on('will-attach-webview', (event) =>
          event.preventDefault(),
        );
        window.on('closed', () => {
          window = undefined;
        });
        void window.loadURL('wordnest://app/');
      };
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: 'Tệp',
            submenu: [
              {
                label: 'Nhập file TXT…',
                accelerator: 'CmdOrCtrl+O',
                click: () => window?.webContents.send('wordnest:import'),
              },
              { type: 'separator' },
              { label: 'Thoát', role: 'quit' },
            ],
          },
          {
            label: 'Chỉnh sửa',
            submenu: [
              { label: 'Hoàn tác', role: 'undo' },
              { label: 'Làm lại', role: 'redo' },
              { type: 'separator' },
              { label: 'Cắt', role: 'cut' },
              { label: 'Sao chép', role: 'copy' },
              { label: 'Dán', role: 'paste' },
              { label: 'Chọn tất cả', role: 'selectAll' },
            ],
          },
          {
            label: 'Hiển thị',
            submenu: [
              { label: 'Phóng to', role: 'zoomIn' },
              { label: 'Thu nhỏ', role: 'zoomOut' },
              { label: 'Kích thước gốc', role: 'resetZoom' },
              { type: 'separator' },
              { label: 'Toàn màn hình', role: 'togglefullscreen' },
            ],
          },
          {
            label: 'Trợ giúp',
            submenu: [
              {
                label: 'Giới thiệu WordNest',
                click: () => {
                  void dialog.showMessageBox(window, {
                    type: 'info',
                    title: 'WordNest',
                    message: `WordNest ${app.getVersion()}`,
                    detail:
                      'Học từ vựng từ file TXT.\nDữ liệu và tiến độ được lưu trên máy này.\n\nDùng Sao lưu để chuyển dữ liệu sang máy khác.\nPhát âm phụ thuộc giọng tiếng Anh có trên Windows.',
                  });
                },
              },
            ],
          },
        ]),
      );
      createWindow();
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    })
    .catch((error) => {
      dialog.showErrorBox('Không thể mở WordNest', error.message);
      app.quit();
    });
}
app.on('window-all-closed', () => app.quit());

app.on('before-quit', stopSpeech);
