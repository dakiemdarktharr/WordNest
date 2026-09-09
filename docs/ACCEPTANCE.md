# Phạm vi và kiểm chứng

Yêu cầu đã chốt:
- Giáo viên dạy từ vựng tiếng Anh, gửi TXT qua kênh khác.
- Học viên nhập TXT, học độc lập trên trình duyệt.
- Không tài khoản, không phòng đồng bộ hoặc giao bài qua máy chủ.
- Dữ liệu cục bộ; mã nguồn được đưa lên GitHub riêng tư.

Bản triển khai có: parser trắc nghiệm và cặp từ–nghĩa, xem trước và báo lỗi, thư viện cục bộ, flashcard, lịch ôn cách quãng, luyện gõ đảo chiều, ghép cặp, luyện tập, kiểm tra có đồng hồ tùy chọn, tiếp tục bài đã lưu, lịch sử và ôn câu sai, phát âm, xuất TXT/kết quả/sao lưu JSON.

Đã kiểm tra tự động:
- 20 kiểm thử trong tests/learning.test.ts.
- TypeScript toàn bộ mã dự án.
- Oxlint mã ứng dụng; loại trừ primitive và hook vendored của scaffold.
- Vite production build.
- npm audit không có cảnh báo tại thời điểm bàn giao.

Chưa xác minh:
- Tương tác trình duyệt thực, đọc giọng trên thiết bị di động và trợ năng với screen reader.
- WebMCP trên trình duyệt hỗ trợ chuẩn này.
- Hoạt động offline hoàn toàn: không có service worker.

Thực hiện trước khi dùng trong lớp: thử file thật trên điện thoại của một học viên, kiểm tra loa, nhập/xuất sao lưu và làm trọn một lượt quiz. Số liệu chỉ thuộc thiết bị đang dùng, không tổng hợp lớp.

