---
applyTo: "src/app/(frontend)/**/*.tsx,src/components/**/*.tsx"
---
# Luật riêng cho frontend

- Server Component mặc định; chỉ `"use client"` khi cần state/effect/event.
- Data fetch qua Payload local API (không gọi REST nội bộ).
- Metadata qua `generateMetadata`, không hardcode `<head>`.
- Ảnh dùng `next/image`, có alt.
- Component shadcn/ui trước, custom sau.
- Text tiếng Việt lấy từ constant/label file.
- Route danh sách có phân trang static: dùng `generateStaticParams`.