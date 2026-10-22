# Tech debt — dọn sau

- [ ] TD-01: categories không có revalidate riêng. Nếu frontend thấy stale tên category sau khi sửa → thêm hook revalidate cho categories.
- [ ] TD-02: branches.phone regex có thể từ chối +84912345678 (không khoảng trắng). Nới lỏng nếu khách phàn nàn.
- [ ] TD-03: saveToJWT cho users.role — khi hạ quyền, JWT cũ vẫn giữ role cũ tới khi expire. Document cho khách hoặc force logout khi đổi role.

## Tech debt — dọn sau
- [x] TD-04: pg@8.23.1 cảnh báo tương lai của sslmode=require. ĐÃ SỬA:
      dùng sslmode=verify-full trong .env.local.