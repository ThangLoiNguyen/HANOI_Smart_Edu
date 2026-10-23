# 05 — Phân quyền admin

| Hành động | Quản trị viên | Biên tập viên |
|---|---|---|
| Tạo/sửa nội dung (10 collection) | ✅ | ✅ |
| Xuất bản/gỡ bài | ✅ | ✅ |
| Xóa nội dung | Mọi nội dung | Chỉ nội dung do mình tạo |
| Tải lên/quản lý media | ✅ | ✅ |
| Xem/xử lý liên hệ, tư vấn | ✅ | ✅ |
| Tạo/sửa lịch khai giảng | ✅ | ✅ |
| Tạo/sửa ngân hàng câu hỏi đầu vào | ✅ | ✅ |
| Sửa homepage | ✅ | ✅ |
| Sửa siteSettings, navigation | ✅ | ❌ |
| Tạo/khóa tài khoản nhân viên | ✅ | ❌ |

## Thiết lập kèm
- Bật lịch sử phiên bản + lưu nháp (Payload có sẵn).
- Khóa tài khoản tạm thời sau nhiều lần đăng nhập sai.
- (Làm sau) Vai trò Cộng tác viên chỉ lưu nháp nếu khách cần duyệt bài.

## Kỹ thuật
- `delete` access control của editor phải đọc `createdBy` để so sánh.
- Lịch khai giảng public-read; tạo/sửa cần nhân viên, editor chỉ xóa lịch do mình tạo.
- `placement-questions` không public-read qua Payload API; server actions chỉ công khai câu hỏi và đánh giá đáp án sau khi trả lời.
- Submissions (kể cả đăng ký từ test đầu vào) vẫn tuyệt đối không public read.