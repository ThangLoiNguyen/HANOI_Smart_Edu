# 05 — Phân quyền admin

| Hành động | Quản trị viên | Biên tập viên |
|---|---|---|
| Tạo/sửa nội dung (10 collection) | ✅ | ✅ |
| Xuất bản/gỡ bài | ✅ | ✅ |
| Xóa nội dung | Mọi nội dung | Chỉ nội dung do mình tạo |
| Tải lên/quản lý media | ✅ | ✅ |
| Xem/xử lý liên hệ, tư vấn | ✅ | ✅ |
| Sửa homepage | ✅ | ✅ |
| Sửa siteSettings, navigation | ✅ | ❌ |
| Tạo/khóa tài khoản nhân viên | ✅ | ❌ |

## Thiết lập kèm
- Bật lịch sử phiên bản + lưu nháp (Payload có sẵn).
- Khóa tài khoản tạm thời sau nhiều lần đăng nhập sai.
- (Làm sau) Vai trò Cộng tác viên chỉ lưu nháp nếu khách cần duyệt bài.

## Kỹ thuật
- `delete` access control của editor phải đọc `createdBy` để so sánh.