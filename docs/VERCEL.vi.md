# Đưa WordNest lên Vercel

WordNest có thể dùng dưới dạng website HTTPS và app desktop Windows/macOS. Bản web dùng chung chức năng nhập TXT, tạo bộ từ, flashcard, quiz, học đến khi đúng, lịch ôn và giao diện sáng/tối.

## Website đã triển khai

- Link chia sẻ cho học viên: **https://wordnest-eta.vercel.app**.
- Project: **wordnest**, workspace **ACNE (`acne-a6cd`)**.
- Ngày kiểm tra: **23/09/2026**. Link công khai trả HTTP 200, file không tồn tại trả 404; 14 nhóm kiểm thử trình duyệt trên website thật đều qua. [Bằng chứng](evidence/vercel-2026-09-23.json).
- Hiện triển khai bằng CLI. Vercel chưa kết nối thành công repo GitHub, nên push Git chưa tự cập nhật website. Trong project Vercel, mở **Settings → Git**, kết nối `dakiemdarktharr/quizziz_clone`, cấp quyền repo khi được yêu cầu, rồi đặt Production Branch là `codex/wordnest`. Chưa cần làm bước này để học viên dùng link trên.

## Tạo website khác từ GitHub

1. Đăng nhập [Vercel](https://vercel.com/new), chọn **Add New → Project**.
2. Import repository `dakiemdarktharr/quizziz_clone`.
3. Chọn nhánh **codex/wordnest** làm Production Branch. Giữ Root Directory ở thư mục gốc của repo.
4. Framework Preset: **Vite**; Node.js: **24.x**. File `vercel.json` đã đặt Build Command là `npm run build`, Output Directory là `dist`.
5. Install Command trong cấu hình là `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci`. Lệnh này chạy trên máy build Linux của Vercel, bỏ tải Electron vì website không cần bộ runtime desktop. Cách cài/build desktop thông thường không thay đổi.
6. Không cần API key, database hoặc biến môi trường ứng dụng. Nhấn **Deploy**.
7. Mở Production URL mà Vercel cấp. Nếu website yêu cầu đăng nhập Vercel, kiểm tra **Settings → Deployment Protection** và quyền truy cập production để học viên mở được link công khai.

Khi kết nối GitHub, các lần push vào Production Branch sẽ tạo bản production mới; nhánh khác có thể tạo preview. Giữ một domain production cố định để học viên sử dụng.

## Triển khai bằng CLI

Trong thư mục repo, với Node.js 24 và npm:

```powershell
npx vercel@59.25.4 login
npx vercel@59.25.4 link --yes --project wordnest --scope acne-a6cd
npx vercel@59.25.4 deploy --prod --scope acne-a6cd
```

Các lệnh trên cập nhật project hiện tại và giữ nguyên domain cho học viên. Nếu dùng tài khoản/team khác, đổi `--scope` và `--project` cho đúng. Vercel cài dependencies và build trên máy chủ; không cần chạy `npm run dev` trên máy của giáo viên. `.vercelignore` loại các installer, hồ sơ kiểm thử, file môi trường và cấu hình hosting khác khỏi gói upload CLI. Liên kết tài khoản/project trong `.vercel/` không được commit vào Git.

## Kiểm tra sau triển khai

Mở link bằng cửa sổ riêng tư để xác nhận học viên không cần đăng nhập Vercel. Nhập file `examples/wordnest-demo.txt`, lật flashcard, làm quiz, thử **Học đến khi đúng**, chuyển sáng/tối rồi tải lại trang để xác nhận dữ liệu được giữ.

Có thể chạy hành trình tự động trên URL đã triển khai bằng Playwright:

```powershell
npm ci
$env:WORDNEST_WEB_URL = 'https://wordnest-eta.vercel.app'
npm run test:journey
Remove-Item Env:WORDNEST_WEB_URL
```

Kịch bản mặc định dùng Microsoft Edge. Máy không có Edge có thể cài Chromium bằng `npx playwright install chromium` và đặt `WORDNEST_BROWSER_CHANNEL=chromium`. Kịch bản dùng hồ sơ trình duyệt kiểm thử riêng, không dùng dữ liệu học của người đang mở app.

## Dữ liệu và giới hạn

- TXT được đọc trong trình duyệt; không gửi nội dung bộ từ lên Vercel. Tiến độ và tùy chọn giao diện lưu cục bộ, không đồng bộ giữa học viên hoặc thiết bị.
- Dữ liệu của bản web, bản desktop, domain tùy chỉnh và các URL preview là các vùng lưu riêng. Dùng **Xuất sao lưu / Nhập sao lưu** để chuyển thư viện. Xóa dữ liệu website có thể xóa tiến độ; nên giữ bản sao lưu.
- Bản web cần mạng để mở hoặc tải lại. Sau khi trang tải xong, có thể học khi mất mạng nhưng không bảo đảm tải lại ngoại tuyến. Bản desktop vẫn có thể khởi động khi không có mạng.
- Phát âm trên web dùng giọng của trình duyệt/hệ điều hành, tùy thiết bị. Vercel không chạy Electron hay cung cấp giọng Windows/macOS native của bản desktop.
- App hiện dùng URL gốc `/`; các màn hình học được chuyển trong app, chưa có link riêng cho mỗi bộ từ. Không cấu hình rewrite mọi URL để tránh che lỗi file tài nguyên không tồn tại.
- Vercel phục vụ website; bộ cài `.exe`/`.dmg` tiếp tục được tải qua GitHub Releases.

Tham khảo: [Vite trên Vercel](https://vercel.com/docs/frameworks/frontend/vite), [cấu hình vercel.json](https://vercel.com/docs/project-configuration/vercel-json), [Vercel CLI deploy](https://vercel.com/docs/cli/deploy).
