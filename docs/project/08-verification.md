# 08 — Verification log

## 2026-10-23 — Revalidate end-to-end PASS (posts)

- Seed: 3 posts (tin-tuc, su-kien, bao-chi) qua scripts/seed-test.cjs.
- Test: PATCH title bài 1 → chờ 3s → curl lại trang danh sách + chi tiết.
- Kết quả: title mới xuất hiện ở cả metadata `<title>` trang chi tiết VÀ HTML
  danh sách.
- Kết luận: tag-based revalidate chain (Posts hook → payload helper → revalidate
  helper) hoạt động đúng spec 02-architecture.md.
- Script: scripts/seed-test.cjs (idempotent, dùng slug làm fallback key).

## TODO verify sau khi có data

- [ ] Courses: verify render list + detail với data thật (grade/subject badge,
      tuition format, branches link, related courses).
- [ ] Exams: verify examStatus badge, schedule timeline, results download.
- [ ] Admissions: verify admissionStatus badge, deadline + cảnh báo hết hạn.
- [ ] Achievements: filter client-side (năm/kỳ thi/cấp giải).
- [ ] Albums: gallery + lightbox.
- [ ] Documents: filter client-side.
- [ ] Pages: blocks render (textBlock, imageBlock, statsBlock, teamBlock, ctaBlock).
- [ ] Form liên hệ: submit + honeypot + rate limit.
