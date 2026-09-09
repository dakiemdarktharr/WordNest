# WordNest

Ứng dụng học từ vựng tiếng Anh từ file TXT, lấy cảm hứng từ Quizizz, Quizlet và Kahoot!. Dành cho học viên tự học độc lập: giáo viên gửi file qua kênh riêng, học viên nhập vào app.

**Không cần tài khoản hay backend.** TXT được đọc trong trình duyệt; bộ từ, lịch ôn và kết quả lưu ở localStorage trên thiết bị.

## Sử dụng

1. Mở WordNest, bấm **Nhập file TXT**.
2. Chọn file hoặc dán nội dung, nhập tên bộ từ.
3. Kiểm tra bản xem trước và sửa các lỗi định dạng nếu có.
4. Chọn Flashcard, Ghép cặp, Luyện tập, Luyện gõ hoặc Kiểm tra.
5. Dùng **Xuất sao lưu** khi cần chuyển dữ liệu sang thiết bị khác.

## Định dạng TXT

Một câu mới bắt đầu bằng số và dấu chấm ở đầu dòng. Dấu * đánh dấu đáp án đúng:

~~~text
1. câu hỏi 1? [1] A [2] B [3*] C [4] D

2. curious
[1] buồn ngủ
[2*] tò mò
[3] lo lắng
[4] tức giận
Giải thích: Stay curious and keep learning.
~~~

Mẫu đầu tiên tạo một câu có bốn lựa chọn và C là đáp án đúng. Cũng chấp nhận dạng [3\*] có dấu gạch chéo trước dấu sao. Nếu nhiều đáp án được đánh dấu, học viên phải chọn đúng và đủ để được tính đúng.

Với từ vựng, có thể dùng cách ngắn hơn, mỗi dòng một cặp:

~~~text
apple :: quả táo
curious :: tò mò
resilient :: kiên cường
thoughtful :: chu đáo
~~~

App tự lấy nghĩa của các từ khác làm lựa chọn khi tạo quiz từ cặp từ–nghĩa. Cần ít nhất hai nghĩa khác nhau. Lựa chọn tự sinh chỉ phục vụ luyện tập; giáo viên có thể dùng dạng trắc nghiệm để tự kiểm soát phương án nhiễu.

- File UTF-8, có hoặc không BOM; hỗ trợ CRLF/LF.
- Tối đa 1 MB và 1.000 câu mỗi bộ; tối đa 200 bộ trong thư viện.
- Dùng một định dạng trong mỗi file; không trộn dạng đánh số và dạng cặp.
- Câu trắc nghiệm có 2–10 đáp án. Có thể xuống dòng trong nội dung.
- Dòng Giải thích: hoặc Explanation: nằm sau các đáp án và là tùy chọn.
- Không dùng số + dấu chấm ở đầu dòng trong phần nội dung phụ; dùng (1) để tránh nhầm câu mới.
- Ký hiệu [số] được dành cho lựa chọn.
- File mẫu có tại [examples](examples).

## Các chế độ học

| Chế độ | Hoạt động |
|---|---|
| Flashcard | Lật, đảo chiều, trộn, nghe từ tiếng Anh, đánh dấu và lọc thẻ |
| Ôn cách quãng | Tự đánh giá Chưa nhớ / Khó / Đã nhớ / Rất dễ, lưu thời điểm ôn tiếp |
| Luyện tập | Chọn đáp án, nhận phản hồi ngay, xem giải thích từ TXT |
| Luyện gõ | Hiện nghĩa để gõ tiếng Anh hoặc đổi chiều; bỏ qua hoa/thường và khoảng trắng thừa |
| Kiểm tra | Chọn số câu, trộn, đồng hồ tùy chọn, chuyển giữa các câu, nộp mới xem đáp án |
| Ghép cặp | Ghép từ–nghĩa bằng chạm hoặc bàn phím, tối đa 6 cặp mỗi vòng |
| Tiến độ | Lịch sử 30 phiên gần nhất, độ chính xác, từ đã sai, ôn lại câu sai, tải kết quả TXT |

Luyện gõ dùng câu có một đáp án đúng. Chiều nghĩa → tiếng Anh phù hợp nhất khi phần câu hỏi là từ tiếng Anh, chẳng hạn curious. Dấu và dấu câu vẫn phải khớp nội dung bộ từ; ứng dụng không chấm tương đương ngữ nghĩa bằng AI.

Lịch ôn là thuật toán xác định đơn giản: thẻ mới được hẹn lại sau 1 phút, 10 phút, 1 ngày hoặc 4 ngày tùy đánh giá; những lần nhớ tiếp theo tăng khoảng cách. Không gửi thông báo nền: học viên mở app và chọn **Đến hạn ôn**.

## Lưu trữ

- Bộ từ và các câu trả lời đã xác nhận được lưu trên trình duyệt. Bài kiểm tra có thể tiếp tục sau khi tải lại.
- Đồng hồ bài kiểm tra tiếp tục chạy khi đóng trang; khi quay lại sau hạn, bài được nộp.
- Thống kê đếm các lượt đã nộp, không phải điểm của toàn lớp. Lịch sử từng phiên giữ tối đa 30 lượt; tổng số lần đúng/sai theo từ được tích lũy riêng.
- Ghép cặp và duyệt thẻ là hoạt động luyện nhớ, không cộng vào điểm quiz.
- Flashcard được coi là đã nhớ khi lịch ôn đã giãn tới ít nhất một ngày; đây là tự đánh giá.
- Trình duyệt có giới hạn lưu trữ. Khi ghi thất bại, app báo rõ và không báo lưu thành công.
- Xóa dữ liệu trang, dùng cửa sổ riêng tư, đổi thiết bị hoặc đổi địa chỉ hosting có thể làm mất quyền truy cập dữ liệu cũ. Xuất JSON trước khi di chuyển.
- Nhập JSON có xác nhận vì sẽ thay thế dữ liệu hiện tại. TXT trùng nội dung được mở lại để giữ tiến độ.
- Chỉnh sửa nội dung bằng trình soạn TXT rồi nhập thành bộ mới; xuất TXT không chứa tiến độ.

## Chạy trên máy

Cài Node.js 24 LTS và npm, sau đó:

~~~bash
npm ci
npm run dev
~~~

Mở địa chỉ được in ở terminal, mặc định http://127.0.0.1:3000.

~~~bash
npm test
npm run lint
npm run typecheck
npm run build
npm start
~~~

Bản production nằm trong **dist/**. Bản này dùng được trên dịch vụ hosting tĩnh; không cần biến môi trường hay API key. Đường dẫn tài nguyên tương đối hỗ trợ triển khai trong thư mục con. Dùng máy chủ HTTP để chạy, không mở index.html bằng giao thức file://.

**Cách đưa cho học viên:** đưa thư mục dist lên hosting tĩnh, gửi đường dẫn app một lần; gửi các file TXT qua kênh quen dùng. Repo GitHub riêng tư lưu mã nguồn, tự nó không phải đường dẫn chạy app công khai. Bản Sites riêng tư, nếu được tạo, chỉ dành cho chủ sở hữu xem thử.

App không đăng ký service worker hoặc cam kết hoạt động ngoại tuyến sau khi đóng trình duyệt. Phát âm dùng Web Speech API; giọng và khả năng đọc ngoại tuyến tùy thiết bị.

## Cấu trúc mã

- app/page.tsx: thư viện, điều hướng và thiết lập học.
- components/: các hoạt động học và hộp thoại nhập.
- components/ui/: các primitive Shadcn/Base UI đi kèm scaffold.
- lib/learning.ts: parser, chấm điểm, tạo quiz và lịch ôn.
- lib/storage.ts: xác thực bản sao lưu, lưu nguyên tử và phát hiện tab khác ghi dữ liệu.
- tests/learning.test.ts: các kiểm thử logic và ranh giới dữ liệu.
- docs/RESEARCH.vi.md: nghiên cứu nguồn chính thức và quyết định tính năng.

Bản dựng cuối dùng React + TypeScript + Vite thuần trình duyệt. Phần máy chủ của scaffold đã được bỏ vì không cần cho yêu cầu này và bước kết thúc prerender gặp lỗi trên Windows.

## Kiểm tra và giới hạn

Đã kiểm tra mẫu đầu vào ban đầu, BOM/CRLF, dấu sao có escape, nhiều đáp án đúng, dữ liệu không hợp lệ, giới hạn câu, phương án nhiễu, chấm gõ, lịch ôn, bản sao lưu và xung đột ghi giữa các tab. CI chạy test, lint, TypeScript và production build.

Chưa có kiểm thử tương tác trên trình duyệt hoặc thiết bị di động thực. WebMCP là phần hỗ trợ tùy chọn, tự phát hiện API; chưa xác minh trên trình duyệt có hỗ trợ. Hai công cụ chỉ đọc danh sách bộ từ hoặc mở hộp thoại nhập, không tự xuất dữ liệu ra bên ngoài.

Tài liệu tham khảo và phân tích tính năng: [Nghiên cứu Quizizz, Quizlet, Kahoot!](docs/RESEARCH.vi.md). WordNest dùng tên và giao diện riêng, không liên kết với các sản phẩm tham khảo.

