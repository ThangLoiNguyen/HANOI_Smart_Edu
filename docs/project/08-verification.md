# 08 — Verification log

## 2026-10-23 — Revalidate end-to-end PASS (posts)

- Seed: 3 posts (tin-tuc, su-kien, bao-chi) qua scripts/seed-test.cjs.
- Test: PATCH title bài 1 → chờ 3s → curl lại trang danh sách + chi tiết.
- Kết quả: title mới xuất hiện ở cả metadata `<title>` trang chi tiết VÀ HTML
  danh sách.
- Kết luận: tag-based revalidate chain (Posts hook → payload helper → revalidate
  helper) hoạt động đúng spec 02-architecture.md.
- Script: scripts/seed-test.cjs (idempotent, dùng slug làm fallback key).

## 2026-10-23 — Revalidate end-to-end PASS (courses)

- Seed: 3 khóa học test qua scripts/seed-test.cjs.
- Test: đổi title khóa Toán 10 qua REST API, chờ 3 giây rồi tải lại danh sách
  và chi tiết.
- Kết quả: title mới xuất hiện ở cả /khoa-hoc và /khoa-hoc/toan-10-co-ban.

## 2026-10-23 — Achievements client filter + revalidate PASS

- Seed: 5 thành tích test trải năm 2025 và 2026, bao phủ đủ 5 cấp giải.
- Browser filter: chọn năm 2026 giảm số card từ 4 xuống 2.
- Filter cấp giải hiển thị đủ 5 lựa chọn cố định.
- Revalidate: đổi tên học sinh qua REST API, chờ 3 giây; tên mới xuất hiện ở
  trang danh sách và metadata/title trang chi tiết.

## 2026-10-23 — Albums list + gallery PASS

- Seed: 2 album với 3 và 4 ảnh SVG placeholder cục bộ; không dùng ảnh thật.
- Kết quả: list, chi tiết và caption ảnh hiển thị; browser xác nhận thumbnail tải
  thành công, lightbox mở được, phím mũi tên chuyển ảnh và Escape đóng hộp thoại.
- Ghi chú: Blob store hiện chưa khả dụng; media test dùng data URL placeholder,
  cần thay bằng ảnh thật khi storage được cấu hình.

## TODO verify sau khi có data

- [x] Courses: verify render list + detail với data thật (grade/subject badge,
      tuition format, branches link, related courses).
- [ ] Exams: verify examStatus badge, schedule timeline, results download.
- [ ] Admissions: verify admissionStatus badge, deadline + cảnh báo hết hạn.
- [x] Achievements: filter client-side (năm/kỳ thi/cấp giải).
- [x] Albums: gallery + lightbox (đã verify với SVG placeholder).
- [ ] Documents: filter client-side.
- [ ] Pages: blocks render (textBlock, imageBlock, statsBlock, teamBlock, ctaBlock).
- [ ] Form liên hệ: submit + honeypot + rate limit.
