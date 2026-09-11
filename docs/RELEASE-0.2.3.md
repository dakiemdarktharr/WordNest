# WordNest 0.2.3 — sửa bản macOS

Bản 0.2.2 bỏ qua ký ứng dụng macOS, có thể hiện “damaged and can't be opened”. Bản này ký ad-hoc cả ứng dụng và thành phần Electron, kiểm tra chữ ký rồi chạy bộ học từ DMG/ZIP trên máy CI độc lập với máy build.

- Mac Apple Silicon: tải `WordNest-0.2.3-arm64.dmg`.
- Mac Intel: tải `WordNest-0.2.3-x64.dmg`.
- Windows: tải `WordNest-Setup-0.2.3-x64.exe`.

Đóng WordNest cũ, mở DMG mới và kéo WordNest vào Applications, chọn Replace để thay ứng dụng. Không xóa thư mục dữ liệu người dùng. Mở từ Applications sau khi eject DMG. App học ngoại tuyến, không cần localhost.

Sửa thêm: phát âm dùng giọng Samantha trên macOS, menu ứng dụng và Cmd+Q/Cmd+W, mở lại cửa sổ từ Dock, kiểm tra sao lưu và tiến độ sau khi thoát/mở lại. Release chỉ được xuất bản sau khi kiểm tra chữ ký và luồng học của cả DMG/ZIP đạt trên Apple Silicon và Intel.

**Giới hạn chữ ký:** đây là chữ ký ad-hoc để đảm bảo bundle hợp lệ, chưa có Developer ID hoặc notarization của Apple. Gatekeeper có thể yêu cầu bạn vào System Settings → Privacy & Security → Open Anyway nếu tin tưởng nguồn tải. Nếu macOS vẫn nói “damaged” hoặc cảnh báo mã độc, dừng lại và gửi nguyên văn thông báo; không tắt Gatekeeper hay xóa quarantine hàng loạt.

Checksum riêng cho Windows, macOS arm64 và macOS x64 nằm trong Assets. [Hướng dẫn cài đặt](https://github.com/dakiemdarktharr/quizziz_clone/blob/codex/wordnest/docs/INSTALL.vi.md).
