---
applyTo: "src/collections/**/*.ts,src/globals/**/*.ts,src/payload.config.ts"
---
# Luật riêng cho Payload

- Mỗi collection 1 file, export default CollectionConfig.
- Dùng helper chung cho trường lặp lại (title, slug, SEO, status) — đặt trong `src/lib/fields/`.
- Access control viết rõ ràng, không dùng `() => true` cho collection nhạy cảm.
- `submissions`: `read: isAdmin`, `create: public`, `update: isAdmin`, `delete: isAdmin`.
- Editor xóa chỉ nội dung mình tạo → access `delete` đọc `req.user` + `doc.createdBy`.
- Hook revalidate gọi helper trong `src/lib/revalidate.ts`.
- Không import từ `(frontend)` vào collection.