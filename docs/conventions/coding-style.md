# Coding style

- TypeScript strict, không `any` (trừ khi có comment).
- Naming: file `kebab-case`, component `PascalCase`, biến `camelCase`, hằng `UPPER_SNAKE`.
- Import tuyệt đối qua alias `@/`.
- Collection Payload: mỗi collection 1 file trong `/src/collections`, export default.
- Hook revalidate: helper trong `/src/lib/revalidate.ts`, không viết inline.
- Component UI: shadcn/ui trước, chỉ custom khi cần.
- Không hardcode text tiếng Việt trong component — đưa vào constant/label file.
- Comment giải thích "tại sao", không giải thích "cái gì".