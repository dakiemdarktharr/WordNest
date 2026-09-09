# WordNest

Ứng dụng học từ vựng tiếng Anh từ file TXT, lấy cảm hứng từ Quizizz, Quizlet và Kahoot!. Dành cho học viên tự học độc lập: giáo viên gửi file qua kênh riêng, học viên nhập vào app.

**Bản chính là ứng dụng desktop Windows 10/11 (64-bit).** Không cần tài khoản, Node.js hoặc kết nối mạng để nhập TXT và học. Bộ từ, lịch ôn và kết quả lưu trong hồ sơ riêng của WordNest trên máy.

## Cài đặt Windows

1. Tải **WordNest-Setup-0.2.0-x64.exe** từ [GitHub Releases](https://github.com/dakiemdarktharr/quizziz_clone/releases/tag/v0.2.0) hoặc file giáo viên gửi. Repo hiện riêng tư: học viên không có quyền repo cần nhận file EXE qua kênh khác.
2. Mở bộ cài, chọn thư mục và cài cho tài khoản Windows hiện tại. Không cần quyền quản trị.
3. Mở **WordNest** từ Desktop hoặc Start Menu. Nhấn **Ctrl+O** để nhập TXT.
4. Gỡ qua **Settings → Apps → WordNest → Uninstall**. Hồ sơ học được giữ lại để cài lại không mất tiến độ.

Bộ cài chưa ký chứng chỉ nhà phát hành, nên Windows có thể hiện cảnh báo SmartScreen. Chỉ dùng file từ nguồn giáo viên cung cấp và có thể đối chiếu SHA-256 trong release. Bản mới được cài thủ công bằng bộ cài mới; app chưa tự cập nhật.

Dữ liệu desktop nằm ở **%APPDATA%\WordNest** (Chromium localStorage). Không sửa file nội bộ trực tiếp; dùng **Xuất sao lưu** / **Nhập sao lưu**. Để chuyển từ bản web cũ, xuất JSON trên web rồi nhập JSON vào desktop.

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

- Bộ từ và các câu trả lời đã xác nhận được lưu trong hồ sơ thiết bị. Bài kiểm tra có thể tiếp tục sau khi tải lại.
- Đồng hồ bài kiểm tra tiếp tục chạy khi đóng trang; khi quay lại sau hạn, bài được nộp.
- Thống kê đếm các lượt đã nộp, không phải điểm của toàn lớp. Lịch sử từng phiên giữ tối đa 30 lượt; tổng số lần đúng/sai theo từ được tích lũy riêng.
- Ghép cặp và duyệt thẻ là hoạt động luyện nhớ, không cộng vào điểm quiz.
- Flashcard được coi là đã nhớ khi lịch ôn đã giãn tới ít nhất một ngày; đây là tự đánh giá.
- Kho dữ liệu cục bộ có giới hạn lưu trữ. Khi ghi thất bại, app báo rõ và không báo lưu thành công.
- Xóa dữ liệu trang, dùng cửa sổ riêng tư, đổi thiết bị hoặc đổi địa chỉ hosting có thể làm mất quyền truy cập dữ liệu cũ. Xuất JSON trước khi di chuyển.
- Nhập JSON có xác nhận vì sẽ thay thế dữ liệu hiện tại. TXT trùng nội dung được mở lại để giữ tiến độ.
- Chỉnh sửa nội dung bằng trình soạn TXT rồi nhập thành bộ mới; xuất TXT không chứa tiến độ.

## Phát triển và tạo installer

Cần Node.js 24 và npm. Trên Windows:

~~~bash
npm ci
npm run desktop
~~~

Tạo bộ cài và kiểm thử file chạy:

~~~bash
npm test
npm run test:security
npm run lint
npm run desktop:dist
npm run test:desktop
~~~

Bộ cài xuất vào **release/WordNest-Setup-0.2.0-x64.exe**; file chạy đã đóng gói tại **release/win-unpacked/WordNest.exe**. Lệnh build cần mạng để tải dependency và runtime Electron; app đã cài không cần các dependency bên ngoài. **npm run icon:build** chuyển icon nguồn thành PNG và ICO nhiều kích thước.

Electron chỉ phục vụ tài nguyên đóng gói qua origin ổn định **wordnest://app/**. Renderer có sandbox, context isolation, không có Node.js; chặn điều hướng và kết nối Internet. TXT không được thực thi như HTML hoặc mã. File xuất dùng hộp thoại lưu của Windows.

Bản desktop phát âm ngoại tuyến qua System.Speech và giọng tiếng Anh cài sẵn của Windows, tối đa 500 ký tự mỗi lần. Nếu máy chưa có giọng tiếng Anh hoặc bị chính sách máy trường chặn PowerShell, app sẽ báo rõ. Bản web dùng Web Speech API. Việc nhập TXT, flashcard, quiz, ghép cặp và sao lưu đều hoạt động offline.

Có thể tiếp tục phát triển giao diện qua **npm run dev** và tạo bản web bằng **npm run build**. Bản web cần máy chủ HTTP và không có service worker; giới hạn này không áp dụng cho bản desktop đóng gói.

## Cấu trúc mã

- app/page.tsx: thư viện, điều hướng và thiết lập học.
- components/: các hoạt động học và hộp thoại nhập.
- components/ui/: các primitive Shadcn/Base UI đi kèm scaffold.
- lib/learning.ts: parser, chấm điểm, tạo quiz và lịch ôn.
- lib/storage.ts: xác thực bản sao lưu, lưu nguyên tử và phát hiện tab khác ghi dữ liệu.
- tests/learning.test.ts: các kiểm thử logic và ranh giới dữ liệu.
- docs/RESEARCH.vi.md: nghiên cứu nguồn chính thức và quyết định tính năng.

Giao diện dùng React + TypeScript + Vite, vỏ desktop dùng Electron. Thư mục desktop/ chứa main process, preload giới hạn và bộ xử lý tài nguyên; electron-builder.config.mjs cấu hình NSIS. scripts/desktop-smoke.mjs kiểm thử trực tiếp app đã đóng gói.

## Kiểm tra và giới hạn

Đã kiểm tra mẫu đầu vào ban đầu, BOM/CRLF, dấu sao có escape, nhiều đáp án đúng, dữ liệu không hợp lệ, giới hạn câu, phương án nhiễu, chấm gõ, lịch ôn, bản sao lưu và xung đột ghi giữa các tab. CI chạy test, lint, TypeScript và production build.

Kiểm thử desktop dùng Playwright để mở app đã đóng gói, nhập TXT, chấm đáp án, mở lại hồ sơ, lật thẻ và xuất sao lưu. Chưa kiểm chứng trên mọi cấu hình Windows hoặc thiết bị di động. WebMCP là phần hỗ trợ tùy chọn, tự phát hiện API; chưa xác minh trên trình duyệt có hỗ trợ. Hai công cụ chỉ đọc danh sách bộ từ hoặc mở hộp thoại nhập, không tự xuất dữ liệu ra bên ngoài.

Tài liệu tham khảo và phân tích tính năng: [Nghiên cứu Quizizz, Quizlet, Kahoot!](docs/RESEARCH.vi.md). WordNest dùng tên và giao diện riêng, không liên kết với các sản phẩm tham khảo.


Nguồn kỹ thuật desktop: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security), [Electron custom protocol](https://www.electronjs.org/docs/latest/api/protocol), [NSIS installer](https://www.electron.build/nsis/), [Microsoft SpeechSynthesizer](https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer?view=netframework-4.8.1).
