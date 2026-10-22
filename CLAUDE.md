# CLAUDE.md — Luật dự án cho AI

> File này được AI tool (Claude Code, Cursor...) tự nạp. Đọc kỹ trước khi code.

## Dự án là gì
Website giới thiệu trung tâm giáo dục (static, ISR) dùng Next.js App Router + Payload CMS 3 + Postgres.
Khách chỉ xem, không tài khoản. Chỉ nhân viên đăng nhập /admin.
KHÔNG có: LMS, thanh toán, tra cứu điểm, học online, đa ngôn ngữ (giai đoạn này).

## Đọc trước khi làm bất cứ gì
1. `docs/project/00-overview.md` — mục tiêu & phạm vi
2. `docs/project/01-tech-stack.md` — stack & quyết định
3. `docs/project/02-architecture.md` — kiến trúc & revalidate
4. `docs/project/03-data-model.md` — schema chi tiết
5. `docs/conventions/coding-style.md` — quy ước code
6. Task hiện tại trong `docs/tasks/`

## Nguyên tắc bất di bất dịch
- **Không tự ý đổi schema** trong `03-data-model.md` mà không cập nhật doc + báo user.
- **Mọi collection nội dung** phải có: title, slug, status, publishedAt, ảnh đại diện, SEO block.
- **Revalidate**: mọi hook afterChange/afterDelete phải theo bảng trong `02-architecture.md`.
- **submissions** tuyệt đối không public read.
- **TypeScript strict**, không dùng `any` trừ khi có comment giải thích.
- **Không commit** file `.env`, secret, hay dữ liệu seed thật.
- Khi tạo file mới, theo đúng cấu trúc thư mục trong `01-tech-stack.md`.

## Khi không chắc
Dừng lại, hỏi user. Không đoán schema, không đoán route, không đoán business rule.