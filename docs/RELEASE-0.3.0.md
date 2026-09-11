# WordNest 0.3.0 — bộ từ riêng, sáng/tối, học đến khi đúng

- **Tạo bộ từ:** bấm “Tạo bộ từ” trong thư viện, đặt tên và nhập từng cặp từ/nghĩa. Bộ mới dùng được với flashcard, ghép cặp, luyện gõ và quiz. Vẫn nhận TXT như trước; có thể tải TXT của bộ vừa tạo.
- **Giao diện sáng/tối:** nút ở góc trên bên phải; tùy chọn được nhớ trên máy. Lần đầu dùng theo giao diện hệ điều hành.
- **Học đến khi đúng:** mở bộ từ → Cách học → “Học đến khi đúng · lặp lại câu sai” → Bắt đầu. Chọn đáp án, bấm “Kiểm tra đáp án”, đọc phản hồi rồi tiếp tục. Câu sai về cuối hàng đợi đến khi trả lời đúng; có thể tạm nghỉ, đóng app và học tiếp.
- **Điểm trung thực:** điểm và lịch ôn dùng lần trả lời đầu. Lượt luyện chỉ hoàn thành khi mọi câu đều được chọn đúng; việc xem đáp án rồi sửa đúng không xóa lần sai.

## Chọn installer

- Windows 10/11 x64: **WordNest-Setup-0.3.0-x64.exe**.
- Mac Apple Silicon (M1/M2/M3/M4…): **WordNest-0.3.0-arm64.dmg**.
- Mac Intel: **WordNest-0.3.0-x64.dmg**.
- Mac ZIP là lựa chọn thay thế. Source code ZIP không phải app cài đặt.

Thoát app cũ rồi cài bản mới. Mac: kéo WordNest vào Applications và chọn Replace. Giữ nguyên dữ liệu ứng dụng; nên xuất JSON sao lưu trước khi nâng cấp. Không cần Node.js, terminal hoặc localhost để dùng app.

## Kiểm thử và giới hạn

Quy trình phát hành chạy logic/lint/build và hành trình app thực tế trên Windows x64, macOS ARM64 và Intel. Mac DMG lẫn ZIP được tải về máy CI mới, kiểm chữ ký rồi mở app và kiểm tra luồng học. Quy trình chỉ xuất bản khi các job này thành công.

37 kiểm thử logic/lưu trữ và 6 kiểm thử Electron/giọng đọc. Bộ mới cần ít nhất 2 nghĩa khác nhau để tạo quiz, từ 4 nghĩa cho 4 lựa chọn. Tối đa 1.000 từ/bộ và 200 bộ, tùy dung lượng bộ nhớ. Trình tạo bộ nhập từng từ chưa hỗ trợ sửa bộ đã lưu; có thể xuất, chỉnh và nhập TXT thành bộ mới.

Tùy chọn giao diện được lưu riêng trên máy, không nằm trong JSON sao lưu thư viện. Các bản cũ trước 0.3.0 không đọc được phiên “Học đến khi đúng”; dùng 0.3.0 trở lên để mở bản sao lưu có chế độ này.

Windows chưa có chứng thư ký số; Mac có chữ ký ad-hoc, chưa có Apple Developer ID/notarization. macOS có thể yêu cầu Open Anyway cho nhà phát triển chưa xác minh. Không tắt Gatekeeper nếu gặp thông báo app bị hỏng. Kiểm thử chạy trên máy CI, không bảo đảm mọi phiên bản hệ điều hành và cấu hình phần cứng. Cập nhật app thủ công.
