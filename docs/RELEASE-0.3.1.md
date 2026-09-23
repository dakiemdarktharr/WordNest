# WordNest 0.3.1 — luyện đến khi đúng tất cả

- **Luyện tập và Luyện gõ:** trả lời sai vẫn được sang câu khác; câu sai quay lại cuối lượt. Chỉ hoàn thành sau khi đã trả lời đúng **100% câu trong lượt học đã chọn**. Nếu chỉ còn một câu sai, bấm **Thử lại câu này**.
- **Ít thao tác hơn:** câu có một đáp án được chấm ngay khi chọn. Câu có nhiều đáp án và luyện gõ vẫn có nút **Kiểm tra đáp án**. Ba lựa chọn chính là Luyện tập, Luyện gõ, Kiểm tra; số câu, trộn câu và hướng gõ nằm trong **Tùy chọn lượt học**.
- **Tiến độ rõ ràng:** kết quả phân biệt hoàn thành 100% với điểm lần đầu. Lịch ôn dựa trên lần trả lời đầu, không tăng điểm vì vừa xem đáp án.
- **Lưu và tiếp tục:** hàng đợi và phản hồi được lưu; lỗi lưu không cho tiến độ chuyển sang trạng thái chưa lưu. Bài cũ đang dở tiếp tục từ câu sai/chưa trả lời; lịch sử hoàn thành giữ nguyên.

Chế độ **Kiểm tra** vẫn là bài thi: được chuyển câu và nộp bài để xem điểm, không áp dụng vòng luyện lại. Bản sao lưu chứa lượt luyện mới cần WordNest 0.3.1 trở lên để khôi phục.

## Tải và cập nhật app

- Windows 10/11 x64: `WordNest-Setup-0.3.1-x64.exe`.
- Mac Apple Silicon (M1/M2/M3/M4…): `WordNest-0.3.1-arm64.dmg`.
- Mac Intel: `WordNest-0.3.1-x64.dmg`.

Xuất sao lưu JSON, đóng app rồi chạy bộ cài mới. Trên Mac, kéo WordNest vào Applications và chọn Replace. Không xóa hồ sơ dữ liệu của app. Không cần Node.js, localhost hay trình duyệt để chạy app desktop.

Windows chưa ký số; macOS ký ad-hoc, chưa có Apple Developer ID/notarization. Hệ điều hành có thể yêu cầu xác nhận nhà phát triển. Chức năng học và dữ liệu vẫn ngoại tuyến; không có đồng bộ tự động giữa máy hoặc với bản web.

Quy trình phát hành chỉ công bố bộ cài sau khi Windows chạy kiểm thử app đã cài, và Mac ARM64/Intel kiểm thử cả DMG lẫn ZIP trên runner native. Các kiểm thử gồm nhập TXT, flashcard, vòng luyện lại, gõ, nhiều đáp án, lỗi lưu, SRS và mở lại app.
