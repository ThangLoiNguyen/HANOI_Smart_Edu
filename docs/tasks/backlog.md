# Tech debt — dọn sau

- [ ] TD-01: categories không có revalidate riêng. Nếu frontend thấy stale tên category sau khi sửa → thêm hook revalidate cho categories.
- [ ] TD-02: branches.phone regex có thể từ chối +84912345678 (không khoảng trắng). Nới lỏng nếu khách phàn nàn.
- [ ] TD-03: saveToJWT cho users.role — khi hạ quyền, JWT cũ vẫn giữ role cũ tới khi expire. Document cho khách hoặc force logout khi đổi role.

## Tech debt — dọn sau
- [x] TD-04: pg@8.23.1 cảnh báo tương lai của sslmode=require. ĐÃ SỬA:
      dùng sslmode=verify-full trong .env.local.


# 08 — Verification log

## 2026-10-23 — Revalidate end-to-end PASS

- Seed: 3 posts (tin-tuc, su-kien, bao-chi) qua REST API.
- Test: PATCH title bài 1 → chờ 3s → curl lại.
- Kết quả: title mới xuất hiện ở cả `/tin-tuc/[slug]` (metadata `<title>`) và `/tin-tuc` (HTML list).
- Kết luận: tag-based revalidate chain (collection hook → payload helper → revalidate helper) hoạt động đúng spec.
- Script: `scripts/seed-test.cjs` (idempotent, có thể chạy lại).

## Tech debt — dọn sau
- [ ] TD-05: /gioi-thieu thiếu imageBlock — seed P20a không include. Fix ở P23
      cleanup demo (thêm imageBlock vào seed data page 'gioi-thieu').
- [ ] TD-06: siteName trong DB vẫn "HANOI SMART EDU" thay vì "Trung tâm Hà Nội
      Smart Edu". Seed hiện không force update nếu record đã tồn tại. Fix ở P23
      (thêm logic upsert trong seed hoặc xóa record rồi seed lại).
- [ ] TD-07: Rate limit Map in-memory ở submit-contact.ts. Production nhiều
      instance → không chính xác. Cần Upstash Redis/Vercel KV trước khi deploy.
- [ ] TD-08: Public read submissions đã chặn (403) — verify thêm khi deploy
      production với env thật.
- [ ] TD-09: 404 custom d�ng experimental.globalNotFound. Theo d�i Next.js changelog khi upgrade. Fallback: [catchAll]/page.tsx v?i notFound() n?u feature b? b?.
