# 02 — Kiến trúc & luồng xuất bản

## Luồng xuất bản (quan trọng nhất)
1. Nhân viên lưu nháp → bấm Xem trước (Next.js draft mode) → xem đúng giao diện thật.
2. Bấm Xuất bản → Payload ghi Postgres.
3. Hook `afterChange` của collection gọi `revalidatePath` / `revalidateTag`.
4. Request kế tiếp nhận HTML mới.

## Bảng revalidate (nguồn sự thật — hook phải theo đúng)
| Sửa gì | Trang được làm mới |
|---|---|
| posts, courses, admissions, achievements, exams, albums | trang chi tiết, trang danh sách của mục đó, trang chủ |
| documents | /tai-lieu |
| schedules | /khoa-hoc/[slug] |
| pages | trang đó |
| homepage | trang chủ |
| siteSettings, navigation, branches | toàn site (header, footer, trang cơ sở) |

## Quy ước tag
- `posts`, `post:{slug}` — tương tự cho mọi collection; `schedules` dùng tag collection để làm mới các trang khóa học liên quan.
- `homepage`, `site` (header/footer), `branches`.
- `afterDelete` **cũng phải revalidate** (bài biến mất khỏi list + sitemap).

## Draft preview
- Route handler xác thực session admin trước khi bật draft mode.
- Không lộ bản nháp cho khách.

## Sitemap & SEO
- sitemap.xml + robots.txt sinh động từ dữ liệu published.
- Loại trừ draft và `submissions`.

## Bảo mật form submissions
- Chặn public read. Rate-limit + honeypot/recaptcha tối thiểu. Giới hạn độ dài field.