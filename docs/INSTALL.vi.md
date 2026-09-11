# Cài đặt và sử dụng WordNest trên Windows

WordNest là **ứng dụng desktop Windows**, cài bằng file `.exe` và mở từ Desktop hoặc Start Menu. Người học không cần Node.js, Git, terminal, tài khoản, trình duyệt hay máy chủ localhost để sử dụng app đã cài. Internet chỉ cần để tải bộ cài; chức năng học dùng dữ liệu trên máy.

## 1. Tải đúng bộ cài

1. Mở [WordNest 0.2.1 trên GitHub Releases](https://github.com/dakiemdarktharr/quizziz_clone/releases/tag/v0.2.1).
2. Mở phần **Assets** nếu danh sách đang thu gọn.
3. Nhấn **WordNest-Setup-0.2.1-x64.exe** (khoảng 106,47 MiB).
4. Chờ tải xong, rồi mở thư mục **Downloads / Tải xuống** trên máy.

[Tải trực tiếp bộ cài Windows](https://github.com/dakiemdarktharr/quizziz_clone/releases/download/v0.2.1/WordNest-Setup-0.2.1-x64.exe)

File **Source code (zip)** và **Source code (tar.gz)** là mã nguồn dành cho lập trình viên, không phải bộ cài. Không cần tải các file này để học. Phiên bản này dành cho **Windows 10/11 x64**; chưa kiểm chứng bộ cài cho macOS, Linux hay Windows ARM64.

## 2. Cài app

1. Nhấp đúp vào `WordNest-Setup-0.2.1-x64.exe` đã tải.
2. Bộ cài chưa có chữ ký số nên Windows có thể hiện SmartScreen. Chỉ khi file đúng từ release nêu trên và bạn tin tưởng nguồn, chọn **More info / Thông tin khác → Run anyway / Vẫn chạy** nếu tùy chọn này xuất hiện. Không tắt phần mềm bảo vệ. Máy do trường quản lý có thể cần quản trị viên cho phép.
3. Làm theo hướng dẫn trong cửa sổ cài đặt. Giữ thư mục mặc định hoặc chọn thư mục bạn có quyền ghi; bộ cài cài cho người dùng Windows hiện tại.
4. Nhấn **Install / Cài đặt**, chờ hoàn tất rồi nhấn **Finish / Hoàn tất**.
5. Mở biểu tượng **WordNest** trên Desktop, hoặc nhấn phím Windows, gõ **WordNest** và mở app trong Start Menu.

Không cần mở `localhost`, chạy `npm` hoặc để một cửa sổ terminal hoạt động. Electron và toàn bộ giao diện cần thiết đã nằm trong bộ cài.

## 3. Nhập TXT và bắt đầu học

1. Nhận file TXT từ giáo viên, hoặc tải [file mẫu](https://github.com/dakiemdarktharr/quizziz_clone/releases/download/v0.2.1/wordnest-demo.txt) trong Assets của release.
2. Trong WordNest, nhấn **Nhập file TXT** và chọn file trên máy.
3. Xem phần xem trước, kiểm tra nội dung và hoàn tất tạo bộ học bằng nút trong app. Nếu app báo sai định dạng, sửa TXT rồi nhập lại.
4. Mở bộ học, chọn **Flashcard**, lật thẻ rồi tự đánh giá mức độ nhớ.
5. Chọn **Quiz**, trả lời và nộp bài. Kết quả cập nhật lịch ôn: câu đúng tăng khoảng cách ôn theo quy tắc của app; câu sai hoặc bỏ trống được đưa về ôn sớm.
6. Mở phần tiến độ để xem kết quả. Đóng và mở lại WordNest vẫn giữ dữ liệu đã lưu thành công.

File từ vựng lưu dưới dạng **UTF-8**, mỗi dòng một cặp:

```text
resilient :: kiên cường
curious :: tò mò
thoughtful :: chu đáo
consistent :: nhất quán
```

Hoặc dùng câu hỏi có đáp án đánh dấu `*`:

```text
1. “Resilient” nghĩa là gì? [1] tò mò [2] chu đáo [3*] kiên cường [4] nhất quán
```

[Chi tiết định dạng TXT](TXT-FORMAT.md). Giáo viên gửi TXT qua hình thức riêng; app không tải nội dung từ tài khoản giáo viên hay đồng bộ giữa các máy.

## 4. Học khi mất mạng và sao lưu

- Sau khi cài app và có TXT trên máy, có thể ngắt mạng rồi tiếp tục học flashcard, quiz và lưu tiến độ.
- Dữ liệu thuộc hồ sơ người dùng trên máy hiện tại. Muốn chuyển sang máy khác, dùng **Xuất sao lưu** để lưu JSON, chuyển file rồi dùng chức năng nhập sao lưu trên máy đích.
- Nên xuất sao lưu trước khi cập nhật, chuyển máy hoặc dọn dữ liệu. Nếu app báo không lưu được do hết dung lượng/quyền truy cập, xử lý lỗi trước khi tiếp tục dựa vào tiến độ đó.
- Phát âm desktop dùng giọng Windows cài trên máy; nếu máy thiếu giọng phù hợp thì tính năng phát âm có thể không dùng được.

## 5. Cập nhật và gỡ cài đặt

- Cập nhật thủ công: xuất sao lưu, đóng WordNest, tải bộ cài phiên bản mới từ GitHub Releases rồi chạy bộ cài. App chưa tự cập nhật.
- Gỡ cài đặt tại **Windows Settings → Apps → Installed apps / Apps & features → WordNest → Uninstall**. Bộ gỡ cài đặt được cấu hình giữ dữ liệu người dùng; vẫn nên sao lưu trước.

## 6. Chia sẻ cho học viên

Repo hiện public. Giáo viên có thể gửi liên kết tải `.exe` ở trên, hoặc gửi chính bộ cài và TXT qua kênh đang dùng. Mỗi học viên cài app trên máy Windows của mình rồi nhập TXT riêng; không cần máy giáo viên chạy liên tục và không cần kết nối vào phòng localhost.

## Kiểm tra file tải xuống (tùy chọn)

Release có `SHA256SUMS.txt`. Trong PowerShell tại thư mục chứa bộ cài:

```powershell
Get-FileHash '.\WordNest-Setup-0.2.1-x64.exe' -Algorithm SHA256
```

SHA256 của bộ cài 0.2.1 được kiểm thử và phát hành:

```text
74c892e9738acdb976935213ce95a2b0d8026edcd995f581e8f4957f67be9bf7
```
