# Thiết kế ứng dụng học từ TXT

## Kết luận thiết kế

Ứng dụng phục vụ một quy trình: giáo viên soạn và gửi TXT qua kênh riêng; học viên tự nhập file vào trình duyệt để tạo bộ quiz và flashcard. Không cần tài khoản, lớp học trên máy chủ hay chức năng giao file. Cùng một bộ nội dung cần dùng được trong nhiều cách học, và tiến độ được giữ trên thiết bị của học viên.

Nghiên cứu đối chiếu tài liệu trợ giúp chính thức được truy cập ngày 09/09/2026. Phần mô tả sản phẩm bên dưới là các tính năng đã có tài liệu; phần đề xuất là quyết định thiết kế riêng cho ứng dụng. Không xem mọi tính năng của sản phẩm tham khảo là miễn phí hoặc có ở mọi gói.

## Đối chiếu ba sản phẩm

| Sản phẩm | Điểm mạnh phù hợp | Áp dụng cho app TXT |
|---|---|---|
| Quizizz / Wayground | Nhiều cách tổ chức quiz; tùy chọn luyện tập và báo cáo | Trộn câu, trộn đáp án, giải thích sau câu trả lời, ôn lỗi sai, thống kê từng câu |
| Quizlet | Một bộ thẻ phục vụ nhiều cách ôn; học theo mức độ nhớ | Lật thẻ, đánh dấu, ôn cách quãng, ghép cặp, kiểm tra |
| Kahoot! | Tương tác trong lớp và phản hồi nhanh | Chế độ trình chiếu nếu cần, phản hồi rõ ràng, điểm theo độ chính xác, đồng hồ tùy chọn |

### Quizizz / Wayground

Tài liệu tạo assessment của Wayground mô tả 18 loại câu hỏi, nội dung đa phương tiện, giải thích đáp án, tổ chức trực tiếp và giao bài. Với đầu vào TXT có đáp án đánh dấu, chuyển đổi xác định bằng parser phù hợp hơn việc nhờ AI đoán lại đáp án. [1]

Các thiết lập gồm trộn câu/đáp án, kiểm soát thời điểm hiện đáp án, câu hỏi làm lại, mục tiêu thành thạo, đồng hồ và bảng xếp hạng. Những lựa chọn này có thể tách thành cấu hình tự học đơn giản. Không nên bật tất cả cùng lúc. [2]

Báo cáo có độ chính xác, hoàn thành, điểm và thời gian trả lời; có góc nhìn theo học viên và từng câu. Trong app không tài khoản, phiên bản phù hợp là lịch sử của chính học viên và danh sách câu thường sai trên thiết bị đó. Không thể suy ra thống kê toàn lớp nếu chưa thu thập kết quả từ các máy. [3]

### Quizlet

Flashcards hỗ trợ lật thẻ, xáo trộn, phân loại mức độ nhớ, đổi mặt trước và đọc văn bản. App TXT có thể lấy câu hỏi làm mặt trước, đáp án đúng cùng giải thích làm mặt sau. Đảo mặt là lựa chọn bổ sung; với câu hỏi dài, hướng câu hỏi → đáp án thường rõ hơn. [4]

Learn cá nhân hóa đường học theo mục tiêu và mức quen thuộc. Nó cho chọn dạng câu hỏi, luyện thẻ đánh dấu và nhập lại đáp án đã sai. Thiết kế riêng được đề xuất là hàng đợi câu cần ôn và phản hồi sau từng câu, không tuyên bố tái tạo thuật toán của Quizlet. [5]

Tài liệu hiện tại có Spaced Repetition trên web: người học tự đánh giá khả năng nhớ, hệ thống xếp thời điểm gặp lại thẻ; có giới hạn thẻ mới mỗi ngày. App nên có lịch ôn minh bạch, thẻ đến hạn và bốn mức tự đánh giá. Chỉ đánh dấu đã xem chưa đủ để gọi là ôn cách quãng. [6]

Match tạo hoạt động ghép thuật ngữ–định nghĩa. Với TXT trắc nghiệm, có thể ghép câu hỏi với đáp án đúng. Cần tránh đưa các cặp có cùng nội dung gây mơ hồ vào một vòng, và không bật ghép cặp khi bộ dữ liệu không đủ cặp phân biệt. [7]

Test cho chọn số lượng và loại câu, nộp bài để xem điểm và in kết quả. App nên lưu bài đang làm để học viên có thể tiếp tục sau khi đóng trang; đây là đề xuất riêng, vì tài liệu Test nói tiến độ bài chưa hoàn thành không được lưu. [8]

Progress tổng hợp lịch sử đúng/sai qua các hoạt động, phân nhóm nội dung và đồng bộ một số tiến độ. Tài liệu Flashcards lại ghi hạn chế đồng bộ phiên học trên thiết bị di động. Hai mô tả nói về các dạng tiến độ khác nhau; không nên khái quát thành “Quizlet đồng bộ mọi thứ”. App này chỉ hứa lưu tại trình duyệt đang dùng. [4][9]

Quizlet Live cho tham gia bằng mã và chơi cá nhân hoặc nhóm. Khả năng đồng bộ nhiều thiết bị khác với việc mỗi người mở cùng một TXT; nếu cần, phải bổ sung lớp kết nối mạng. [10]

### Kahoot!

Accuracy experience cho chấm theo câu đúng và có tùy chọn bỏ đồng hồ. Đây là gợi ý tốt cho học viên cần thời gian suy nghĩ. App nên mặc định điểm theo độ chính xác; thời gian chỉ là lựa chọn luyện tập, không mặc định đánh đồng tốc độ với hiểu bài. [11]

Assignments hỗ trợ tự học theo nhịp riêng, hạn nộp và tham gia bằng PIN/link/QR không cần tài khoản. Tuy nhiên mô hình này vẫn dùng hệ thống của Kahoot! để lưu và đồng bộ. App TXT không cần sao chép chức năng giao bài vì giáo viên đã gửi tài liệu bên ngoài. [12]

Báo cáo Kahoot! nhận diện câu khó, người cần hỗ trợ và bài chưa xong; có thể tạo lại nội dung ôn từ câu khó. Ứng dụng riêng nên có nút ôn câu sai sau khi nộp, lịch sử phiên và xuất kết quả để học viên chủ động gửi cho giáo viên. [13]

## Phạm vi đề xuất

### Luồng nhập nội dung

Nút Nhập TXT hiện rõ ngay khi mở ứng dụng. Người học có thể chọn file hoặc dán nội dung. Trước khi lưu, ứng dụng hiển thị câu đã nhận diện, đáp án đúng và lỗi kèm số dòng. Không tự chọn đáp án khi thiếu dấu sao, không âm thầm bỏ câu sai định dạng.

Hỗ trợ tiếng Việt UTF-8, BOM, xuống dòng Windows/Unix, đáp án cùng dòng hoặc mỗi đáp án một dòng. Dấu `[3*]` và dạng có dấu gạch chéo `[3\*]` cùng được hiểu là đánh dấu đúng. Nội dung được hiển thị dạng văn bản, không thực thi HTML hay mã trong TXT.

Một câu có nhiều đáp án đánh dấu sẽ trở thành câu chọn nhiều đáp án. Học viên phải chọn đủ tập đáp án đúng để được tính đúng; quy tắc này được hiển thị trước khi làm bài. Câu không có đáp án đúng hoặc có số lựa chọn trùng phải được sửa trước khi nhập.

### Chuẩn TXT đề xuất

```text
1. Câu hỏi 1?
[1] A
[2] B
[3*] C
[4] D
Giải thích: C là đáp án đúng theo nội dung bài học.

2. Chọn các số chẵn.
[1*] 2
[2] 3
[3*] 4
[4] 5

3. Thủ đô của Việt Nam là gì? [1] Huế [2*] Hà Nội [3] Đà Nẵng
```

Mỗi câu mới bắt đầu bằng số và dấu chấm ở đầu dòng. Đánh số trong phần nội dung nhiều dòng cần dùng cách viết khác, chẳng hạn `(1)`, để không nhầm ranh giới câu. Dấu dạng `[số]` được dành cho đáp án. Dòng `Giải thích:` là phần giải thích tùy chọn, đặt sau các đáp án.

Bổ sung định dạng thẻ thuần `thuật ngữ :: định nghĩa` cho bộ từ vựng không có lựa chọn, phù hợp với yêu cầu dạy tiếng Anh. Không trộn hai chuẩn vào cùng file nếu chưa có quy tắc xác định rõ ràng.

### Các cách học

1. **Flashcard:** lật thẻ; phím tắt; đánh dấu; chọn đã nhớ/chưa nhớ; ôn đến hạn.
2. **Luyện tập:** hiện phản hồi sau từng câu, giải thích từ TXT, tiếp tục luyện câu sai.
3. **Kiểm tra:** cấu hình số câu, trộn nội dung, đồng hồ tùy chọn; nộp mới hiện đáp án; lưu bài đang làm.
4. **Ghép cặp:** dùng cặp câu hỏi–đáp án đủ ngắn và không mơ hồ; chọn bằng chạm để dùng được trên điện thoại.
5. **Thống kê cá nhân:** số lượt học, kết quả từng bài, câu khó và kết quả có thể tải xuống.

Điểm trò chơi, nếu có, tách khỏi phần trăm đúng. Câu ôn lại không được cộng nhiều lần vào điểm lần kiểm tra đầu. Khi trộn đáp án, chấm bằng ID lựa chọn, không bằng vị trí A/B/C/D sau khi trộn.

### Lưu trữ và nội dung

Bộ bài và tiến độ lưu cục bộ. Cần có xuất bản sao lưu, nhập lại và thông báo rõ khi bộ nhớ đầy hoặc trình duyệt không cho lưu. Xóa dữ liệu trình duyệt hoặc đổi thiết bị không tự mang theo tiến độ; bản sao lưu giải quyết nhu cầu di chuyển chủ động.

Không cần gửi TXT lên máy chủ để phân tích. Không cần API AI cho luồng cốt lõi; điều này giữ nguyên đáp án do giáo viên đánh dấu và tránh phát sinh phí xử lý. Tên, màu sắc, biểu tượng và nội dung mẫu của ứng dụng được thiết kế riêng.

### Phạm vi đã chốt

“Chơi trong lớp” có thể là tự làm trên từng máy, chiếu một màn hình hoặc phòng nhiều thiết bị đồng bộ. Hai cách đầu phù hợp với app cục bộ. Cách thứ ba cần kết nối và thiết kế phiên chơi riêng, kể cả khi không dùng tài khoản. Môn học và độ tuổi sẽ quyết định nhu cầu công thức, phát âm và cách trình bày.

## Tiêu chí nghiệm thu

| Tình huống | Kết quả cần đạt |
|---|---|
| Nhập đúng mẫu một dòng ban đầu | Một câu, bốn lựa chọn, C đúng |
| File nhiều câu, BOM, CRLF và tiếng Việt | Không mất ký tự hoặc gộp nhầm câu |
| Thiếu dấu sao hoặc lựa chọn trùng | Báo lỗi số dòng, chưa lưu bộ bài |
| Nhiều dấu sao | Giao diện chọn nhiều, chấm đúng tập đáp án |
| Trộn câu và đáp án | Không thay đổi đáp án đúng |
| Flashcard | Mặt trước là câu hỏi, mặt sau đúng nội dung |
| Làm sai rồi ôn lại | Lịch sử lần đầu và lần ôn không bị trộn điểm |
| Tải lại trang | Bộ bài và tiến độ đã lưu vẫn còn |
| Bộ nhớ không cho ghi | Thông báo thất bại, không báo đã lưu |
| Xuất/nhập sao lưu | Khôi phục đúng dữ liệu, kiểm tra cấu trúc trước khi nhập |
| Màn hình nhỏ và bàn phím | Các thao tác chính vẫn truy cập được |

## Nguồn

Các nguồn không có ngày công bố rõ được ghi theo ngày truy cập, không suy ra ngày phát hành từ thời điểm máy tìm kiếm thu thập.

1. Wayground. [Create an Assessment/Quiz](https://help.wayground.com/support/solutions/articles/158000462332-create-an-assessment-quiz). Cập nhật 19/08/2026.
2. Wayground. [Navigate Session Settings](https://help.wayground.com/support/solutions/articles/158000404930-navigate-session-settings). Cập nhật 03/02/2026.
3. Wayground. [Reports on Wayground](https://help.wayground.com/support/solutions/articles/158000404058-reports-on-wayground). Cập nhật 05/02/2026.
4. Quizlet. [Studying with Flashcards](https://help.quizlet.com/hc/en-us/articles/360030988091-Studying-with-Flashcards). Truy cập 09/09/2026.
5. Quizlet. [Studying with Learn](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn-mode). Truy cập 09/09/2026.
6. Quizlet. [Studying with Spaced Repetition](https://help.quizlet.com/hc/en-us/articles/48324742264077-Studying-with-Spaced-Repetition). Truy cập 09/09/2026.
7. Quizlet. [Playing Match](https://help.quizlet.com/hc/en-us/articles/360031183611-Playing-Match). Truy cập 09/09/2026.
8. Quizlet. [Studying with Test](https://help.quizlet.com/hc/en-us/articles/360030642972-Studying-with-Test). Truy cập 09/09/2026.
9. Quizlet. [Using Progress for targeted studying](https://help.quizlet.com/hc/en-us/articles/360048803491-Using-Progress-for-targeted-studying). Truy cập 09/09/2026.
10. Quizlet. [Starting a game of Classic Quizlet Live in teams mode](https://help.quizlet.com/hc/en-us/articles/360030985431-Starting-a-game-of-Classic-Quizlet-Live-in-teams-mode). Truy cập 09/09/2026.
11. Kahoot! [New Kahoot! features and updates](https://support.kahoot.com/hc/en-us/articles/32601683697053-New-Kahoot-features-and-updates). Truy cập 09/09/2026.
12. Kahoot! [How to assign a kahoot in web platform](https://support.kahoot.com/hc/en-us/articles/360039411334-How-to-assign-a-kahoot-in-web-platform). Cập nhật 01/08/2026.
13. Kahoot! [Kahoot! quiz reports](https://support.kahoot.com/hc/en-us/articles/360035063054-Kahoot-quiz-reports). Cập nhật 04/08/2026.

## Quyết định triển khai cuối cùng

Học viên học độc lập từ TXT; nội dung chủ yếu là từ vựng tiếng Anh. Không triển khai phòng chơi, tài khoản, giao bài hay báo cáo toàn lớp. Đã bổ sung dạng từ :: nghĩa, luyện gõ đảo chiều và phát âm qua giọng trình duyệt. Kiểm chứng và giới hạn thực tế được ghi trong [ACCEPTANCE.md](ACCEPTANCE.md).
