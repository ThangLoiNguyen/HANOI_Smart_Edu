# 01 — Tech stack & quyết định kỹ thuật

## Stack
| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Framework | Next.js (App Router) | ISR/static, draft mode |
| CMS | Payload CMS 3 | chạy trong Next.js |
| DB | Postgres (Neon) | serverless, branch cho dev |
| Storage | Vercel Blob **hoặc** Cloudflare R2 | chốt sau — xem open-questions |
| UI | Tailwind + shadcn/ui | |
| Deploy | Vercel | |

## Cấu trúc thư mục dự kiến
/src
/app
/(frontend) # route public
/tin-tuc/...
/khoa-hoc/...
...
/(payload) # route admin + api
/admin/...
/api/...
/collections # định nghĩa Payload collection
/globals # định nghĩa global
/components # UI components
/lib # utils, hooks, revalidate helpers
/payload.config.ts
/scripts # seed, cleanup
/docs
CLAUDE.md

## Quyết định đã chốt
- Gộp tin tức/sự kiện/báo chí vào `posts` + trường `type`.
- Tách `achievements` riêng (lọc năm/kỳ thi, render lưới).
- `documents` lưu file hoặc link ngoài; courses/exams quan hệ tới documents.
- Trang chủ chọn nội dung nổi bật bằng relationship.
- Trang danh sách phân trang static; filter documents/achievements chạy client-side.

## Quyết định chưa chốt
Xem `07-open-questions.md`.