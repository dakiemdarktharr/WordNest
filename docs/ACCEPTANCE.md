# Phạm vi và kiểm chứng WordNest 0.2.0

## Yêu cầu

- App desktop Windows, có installer EXE, icon riêng lấy cảm hứng từ thẻ xếp chồng người dùng gửi.
- Giáo viên gửi TXT qua kênh khác; học viên nhập file và học độc lập.
- Tập trung từ vựng tiếng Anh, không tài khoản hoặc máy chủ lưu dữ liệu lớp.
- Giữ flashcard, ôn cách quãng, luyện gõ, ghép cặp, quiz, lịch sử và sao lưu của bản trước.

## Kiểm tra tự động

- 20 kiểm thử parser, chấm điểm, lịch ôn, xác thực sao lưu và ghi dữ liệu.
- 2 kiểm thử giao thức tài nguyên desktop: đúng origin, ngăn truy cập bên ngoài và đường dẫn vượt thư mục.
- TypeScript, Oxlint và Vite production build.
- Playwright mở trực tiếp WordNest.exe với hồ sơ thử nghiệm riêng: nhập file TXT có bốn đáp án và C đúng; chọn C và chấm đúng; đóng/mở app, kiểm tra phiên học còn nguyên; lật thẻ, đánh dấu, lên lịch ôn; xuất JSON và xác minh nội dung file trên đĩa.
- Xác minh renderer sandbox, context isolation, không có Node.js, chặn kết nối Internet.
- Phát âm desktop qua IPC giới hạn: tạo WAV thật với giọng tiếng Anh Windows, kiểm tra RIFF và dữ liệu âm thanh; từ chối văn bản quá giới hạn.
- Cài EXE vào thư mục thử nghiệm trong outputs, kiểm tra shortcut Desktop và Start Menu, chạy kiểm thử trên app đã cài, gỡ bản cài thử và xác minh file chạy đã được xóa.

Chạy `npm run desktop:dist` rồi `./scripts/installer-smoke.ps1` để kiểm chứng installer. Script từ chối nếu máy đã cài WordNest để tránh thay thế bản đang dùng. Kiểm thử thường chỉ cần `npm run test:desktop` trên bản đóng gói. Bằng chứng cục bộ được lưu trong outputs/installer-result.json và outputs/desktop-smoke-*/result.json; CI Windows lưu artifact kiểm thử.

Kiểm thử âm thanh dùng file WAV để không phát tiếng qua loa trong lúc chạy tự động. Đã kiểm tra ảnh chụp giao diện quiz từ Electron; chưa đánh giá âm thanh bằng tai, mọi cấu hình Windows, screen reader, macOS hoặc Linux.

## Giới hạn bàn giao

- Bản phát hành là Windows x64; chưa cung cấp installer macOS/Linux/ARM64.
- Installer chưa ký chứng chỉ, có thể xuất hiện Windows SmartScreen. Không tự cập nhật; cài bản mới thủ công.
- Dữ liệu desktop nằm trong hồ sơ WordNest của người dùng Windows. Bản web cũ có kho dữ liệu khác; chuyển bằng JSON. Gỡ app giữ dữ liệu để cài lại vẫn dùng được.
- Giọng đọc phụ thuộc giọng tiếng Anh Windows và quyền chạy PowerShell trên máy trường; app báo lỗi nếu không khả dụng. Không cần Internet để học hoặc dùng giọng Windows đã cài.
- Kho localStorage có hạn mức; khi đầy, app báo lỗi và không báo lưu thành công. Sao lưu thường xuyên.
- Repo và release GitHub hiện riêng tư; giáo viên có thể gửi EXE qua kênh phân phối riêng cho học viên.
- Không tổng hợp điểm toàn lớp hoặc phòng đồng bộ. Không có service worker cho bản web; bản desktop chứa toàn bộ giao diện trong installer.
