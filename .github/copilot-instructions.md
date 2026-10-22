# Copilot Instructions — Website trung tâm giáo dục

## Dự án
Website giới thiệu trung tâm giáo dục. Next.js (App Router) + Payload CMS 3 + Postgres (Neon)
+ Tailwind + shadcn/ui. Deploy Vercel. Trang public static/ISR.
Khách chỉ xem, không tài khoản. Chỉ nhân viên đăng nhập /admin.
KHÔNG có: LMS, thanh toán, tra cứu điểm, học online. Chỉ tiếng Việt (chưa đa ngôn ngữ).

## Đọc trước khi code (theo thứ tự)
1. `docs/project/00-overview.md`
2. `docs/project/01-tech-stack.md`
3. `docs/project/02-architecture.md`
4. `docs/project/03-data-model.md`
5. `docs/project/04-sitemap-routes.md`
6. `docs/project/05-permissions.md`
7. `docs/conventions/coding-style.md`
8. Task hiện tại trong `docs/tasks/`

## Luật bất di bất dịch
- KHÔNG tự đổi schema trong `03-data-model.md`. Muốn đổi → cập nhật doc trước, báo user.
- Mọi collection nội dung có: title, slug, status (draft|published), publishedAt, ảnh đại diện, SEO block.
- Hook afterChange/afterDelete phải theo đúng bảng revalidate trong `02-architecture.md`.
- `submissions` TUYỆT ĐỐI không public read.
- TypeScript strict, không `any` (trừ khi có comment giải thích).
- Không commit `.env`, secret, dữ liệu seed thật.
- Import tuyệt đối qua alias `@/`.
- Hook revalidate để trong `src/lib/revalidate.ts`, không viết inline.
- Text tiếng Việt để trong constant/label, không hardcode rải rác.

## Khi không chắc
Dừng, hỏi user. Không đoán schema, không đoán route, không đoán business rule.

## Cấu trúc thư mục
/src/app/(frontend)/... # route public
/src/app/(payload)/... # admin + api
/src/collections/ # Payload collections
/src/globals/ # Payload globals
/src/components/ # UI
/src/lib/ # utils, revalidate
/src/payload.config.ts
/scripts/ # seed, cleanup
/docs/ # tài liệu dự án (nguồn sự thật)