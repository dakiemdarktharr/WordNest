# Cài đặt và sử dụng WordNest trên Windows và macOS

WordNest là **ứng dụng desktop**, không phải website localhost. Người dùng Windows cài bằng file `.exe`; người dùng macOS cài bằng file `.dmg` hoặc `.zip`. Người học không cần Node.js, Git, terminal, tài khoản, trình duyệt hay máy chủ localhost để sử dụng app đã cài. Internet chỉ cần để tải bộ cài; chức năng học dùng dữ liệu trên máy.

## 1. Tải đúng bộ cài

1. Mở [WordNest 0.2.2 trên GitHub Releases](https://github.com/dakiemdarktharr/quizziz_clone/releases/tag/v0.2.2).
2. Mở phần **Assets** nếu danh sách đang thu gọn.
3. Chọn đúng file theo máy:
   - `WordNest-Setup-0.2.2-x64.exe` cho Windows 10/11 x64.
   - `WordNest-0.2.2-x64.dmg` cho Mac Intel.
   - `WordNest-0.2.2-arm64.dmg` cho Mac Apple Silicon.
   - File `.zip` tương ứng là lựa chọn thay thế cho macOS.
4. Chờ tải xong, rồi mở thư mục Downloads / Tải xuống.

[Tải bộ cài từ GitHub Release v0.2.2](https://github.com/dakiemdarktharr/quizziz_clone/releases/tag/v0.2.2)

File **Source code (zip)** và **Source code (tar.gz)** là mã nguồn dành cho lập trình viên, không phải bộ cài. Linux và Windows ARM64 chưa được kiểm chứng.

## 2. Cài app trên Windows

1. Nhấp đúp vào `WordNest-Setup-0.2.2-x64.exe`.
2. Bộ cài chưa có chữ ký số nên Windows có thể hiện SmartScreen. Chỉ khi file đúng từ release nêu trên và bạn tin tưởng nguồn, chọn **More info → Run anyway** nếu tùy chọn này xuất hiện. Không tắt phần mềm bảo vệ.
3. Làm theo hướng dẫn, chọn thư mục cài đặt nếu cần, rồi nhấn **Install**.
4. Mở WordNest từ Desktop hoặc Start Menu.

## 3. Cài app trên macOS

1. Chọn `x64.dmg` nếu máy dùng Intel hoặc `arm64.dmg` nếu máy dùng Apple Silicon. Xem tại **Apple menu → About This Mac**; dòng **Chip** là Apple Silicon, còn **Processor** thường là Intel.
2. Mở file `.dmg` đã tải.
3. Kéo biểu tượng **WordNest** vào thư mục **Applications**.
4. Mở **Applications → WordNest** hoặc dùng Spotlight tìm WordNest.
5. Vì gói chưa được Apple notarize, macOS có thể cảnh báo lần đầu. Chọn **Open**; nếu bị chặn, vào **System Settings → Privacy & Security → Open Anyway**, sau đó mở lại WordNest.

Không cần cài Node.js, chạy terminal, mở localhost hoặc giữ trình duyệt hoạt động.

## 4. Nhập TXT và bắt đầu học

1. Nhận file TXT từ giáo viên, hoặc tải [file mẫu](https://github.com/dakiemdarktharr/quizziz_clone/releases/download/v0.2.2/wordnest-demo.txt) trong Assets của release.
2. Trong WordNest, nhấn **Nhập file TXT** và chọn file trên máy.
3. Xem phần xem trước, kiểm tra nội dung và hoàn tất tạo bộ học. Nếu app báo sai định dạng, sửa TXT rồi nhập lại.
4. Mở bộ học, chọn **Flashcard**, lật thẻ rồi tự đánh giá mức độ nhớ.
5. Chọn **Quiz**, trả lời và nộp bài. Kết quả cập nhật lịch ôn.
6. Mở phần tiến độ để xem kết quả. Đóng và mở lại WordNest vẫn giữ dữ liệu đã lưu thành công.

File từ vựng lưu dưới dạng **UTF-8**, mỗi dòng một cặp:

```text
resilient :: kiên cường
curious :: tò mò
thoughtful :: chu đáo
consistent :: nhất quán
```

[Chi tiết định dạng TXT](TXT-FORMAT.md). Giáo viên gửi TXT qua hình thức riêng; app không tải nội dung từ tài khoản giáo viên hay đồng bộ giữa các máy.

## 5. Học khi mất mạng và sao lưu

- Sau khi cài app và có TXT trên máy, có thể ngắt mạng rồi tiếp tục học flashcard, quiz và lưu tiến độ.
- Dữ liệu thuộc hồ sơ người dùng trên máy hiện tại. Muốn chuyển sang máy khác, dùng **Xuất sao lưu** để lưu JSON, chuyển file rồi dùng chức năng nhập sao lưu trên máy đích.
- Nên xuất sao lưu trước khi cập nhật, chuyển máy hoặc dọn dữ liệu.
- Phát âm desktop dùng giọng hệ điều hành cài trên máy; nếu máy thiếu giọng phù hợp thì tính năng phát âm có thể không dùng được.

## 6. Cập nhật và gỡ cài đặt

- Cập nhật thủ công: xuất sao lưu, đóng WordNest, tải bộ cài phiên bản mới rồi chạy bộ cài.
- Windows: gỡ tại **Windows Settings → Apps → Installed apps → WordNest → Uninstall**.
- macOS: đóng WordNest rồi kéo **WordNest** khỏi Applications vào Trash. Hãy xuất sao lưu trước nếu muốn giữ dữ liệu.

## 7. Chia sẻ cho học viên

Repo hiện public. Giáo viên có thể gửi liên kết GitHub Release, chọn đúng `.exe` cho Windows hoặc `.dmg` cho macOS, rồi gửi TXT qua kênh đang dùng. Mỗi học viên cài app trên máy của mình rồi nhập TXT riêng; không cần máy giáo viên chạy liên tục và không cần kết nối vào phòng localhost.

## Kiểm tra file tải xuống (tùy chọn)

Release có `SHA256SUMS.txt`. Dùng checksum tương ứng với file đã tải để kiểm tra tính toàn vẹn. Các gói được phát hành chưa ký số hoặc notarize.
