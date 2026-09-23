# Cài đặt và sử dụng WordNest trên Windows và macOS

WordNest là **ứng dụng desktop**, không phải website localhost. Người dùng Windows cài bằng file `.exe`; người dùng macOS cài bằng file `.dmg` hoặc `.zip`. Người học không cần Node.js, Git, terminal, tài khoản, trình duyệt hay máy chủ localhost để sử dụng app đã cài. Internet chỉ cần để tải bộ cài; chức năng học dùng dữ liệu trên máy.

## 1. Tải đúng bộ cài

1. Mở [WordNest 0.3.3 trên GitHub Releases](https://github.com/dakiemdarktharr/WordNest/releases/tag/v0.3.3).
2. Mở phần **Assets** nếu danh sách đang thu gọn.
3. Chọn đúng file theo máy:
   - `WordNest-Setup-0.3.3-x64.exe` cho Windows 10/11 x64.
   - `WordNest-0.3.3-x64.dmg` cho Mac Intel.
   - `WordNest-0.3.3-arm64.dmg` cho Mac Apple Silicon.
   - File `.zip` tương ứng là lựa chọn thay thế cho macOS.
4. Chờ tải xong, rồi mở thư mục Downloads / Tải xuống.

[Tải bộ cài từ GitHub Release v0.3.3](https://github.com/dakiemdarktharr/WordNest/releases/tag/v0.3.3)

File **Source code (zip)** và **Source code (tar.gz)** là mã nguồn dành cho lập trình viên, không phải bộ cài. Linux và Windows ARM64 chưa được kiểm chứng.

## 2. Cài app trên Windows

1. Nhấp đúp vào `WordNest-Setup-0.3.3-x64.exe`.
2. Bộ cài chưa có chữ ký số nên Windows có thể hiện SmartScreen. Chỉ khi file đúng từ release nêu trên và bạn tin tưởng nguồn, chọn **More info → Run anyway** nếu tùy chọn này xuất hiện. Không tắt phần mềm bảo vệ.
3. Làm theo hướng dẫn, chọn thư mục cài đặt nếu cần, rồi nhấn **Install**.
4. Mở WordNest từ Desktop hoặc Start Menu.

## 3. Cài app trên macOS

1. Chọn `x64.dmg` nếu máy dùng Intel hoặc `arm64.dmg` nếu máy dùng Apple Silicon. Xem tại **Apple menu → About This Mac**; dòng **Chip** là Apple Silicon, còn **Processor** thường là Intel.
2. Mở file `.dmg` đã tải.
3. Kéo biểu tượng **WordNest** vào thư mục **Applications**.
4. Mở **Applications → WordNest** hoặc dùng Spotlight tìm WordNest.
5. Bản 0.3.3 được ký ad-hoc, chưa có Developer ID/notarization của Apple. Nếu thông báo nói không xác minh được nhà phát triển và bạn tin tưởng nguồn, vào **System Settings → Privacy & Security → Open Anyway**.

Nếu đang gặp “WordNest is damaged” ở 0.2.2: đóng app, tải DMG 0.3.3 đúng loại chip, kéo vào Applications và chọn **Replace** để thay app cũ. Eject DMG rồi mở WordNest từ Applications. Không xóa thư mục dữ liệu WordNest trong Library; thao tác thay app giữ hồ sơ học. Nếu vẫn báo “damaged”, giữ nguyên thông báo để báo lỗi, không tắt Gatekeeper hoặc chạy lệnh xóa quarantine hàng loạt.

Không cần cài Node.js, chạy terminal, mở localhost hoặc giữ trình duyệt hoạt động.

## 4. Nhập TXT và bắt đầu học

1. Nhận file TXT từ giáo viên, hoặc tải [file mẫu](https://github.com/dakiemdarktharr/WordNest/releases/download/v0.3.3/wordnest-demo.txt) trong Assets của release.
2. Trong WordNest, nhấn **Nhập file TXT** và chọn file trên máy.
3. Xem phần xem trước, kiểm tra nội dung và hoàn tất tạo bộ học. Nếu app báo sai định dạng, sửa TXT rồi nhập lại.
4. Mở bộ học, chọn **Flashcard**, lật thẻ rồi tự đánh giá mức độ nhớ.
5. Chọn **Luyện tập** và bắt đầu. Bấm một đáp án để xem phản hồi, rồi **Câu tiếp theo**. Câu sai quay lại cuối lượt; chỉ có **Hoàn thành lượt học** khi đã làm đúng tất cả câu. Kết quả cập nhật lịch ôn.
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

Release có `SHA256-Windows.txt`, `SHA256-macOS-arm64.txt` và `SHA256-macOS-x64.txt`. Dùng checksum tương ứng với file đã tải để kiểm tra tính toàn vẹn. Windows chưa ký số. macOS được ký ad-hoc, chưa có chứng nhận Developer ID/notarization của Apple. Giọng phát âm Mac dùng Samantha; máy thiếu giọng này cần cài giọng tiếng Anh trong cài đặt hệ thống.

## Tính năng mới ở 0.3.3

1. **Thêm bộ từ trực tiếp:** ở thư viện nhấn **Tạo bộ từ**, nhập tên, từ và nghĩa; nhấn **Thêm từ** để thêm dòng, rồi **Lưu bộ từ**. Bộ này dùng được như bộ nhập từ TXT.
2. **Sáng/tối:** bấm nút mặt trăng hoặc mặt trời ở góc trên bên phải. App nhớ lựa chọn sau khi đóng và mở lại.
3. **Lặp câu sai:** mở bộ từ, chọn **Luyện tập** hoặc **Luyện gõ** rồi bắt đầu. Chọn một đáp án là app chấm ngay; câu nhiều đáp án hoặc luyện gõ có nút **Kiểm tra đáp án**. Đọc phản hồi rồi **Câu tiếp theo**. Câu sai quay lại sau các câu còn lại; khi chỉ còn một câu sai, bấm **Thử lại câu này**. Chỉ được hoàn thành khi đã làm đúng 100% câu trong lượt đã chọn. Nút **Tạm nghỉ** cho phép học tiếp sau.
4. **Tùy chọn lượt học:** mở mục này để đổi số câu, trộn thứ tự, hướng luyện gõ hoặc thời gian kiểm tra. Chế độ **Kiểm tra** vẫn cho nộp bài tự do để đo điểm, không bắt luyện lại.

Màn hình kết quả phân biệt **đã luyện đúng 100%** với **điểm lần đầu**; câu từng sai vẫn được hẹn ôn sớm. Luyện tập và luyện gõ không giới hạn thời gian. Hãy dùng app 0.3.3 trở lên khi khôi phục bản sao lưu có lượt luyện mới. Tùy chọn sáng/tối không nằm trong bản sao lưu thư viện.
