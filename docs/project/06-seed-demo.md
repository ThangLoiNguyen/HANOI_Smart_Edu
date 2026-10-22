# 06 — Seed & cleanup

## Số bản ghi mẫu
| Collection | Số lượng | Ghi chú |
|---|---|---|
| posts | 12 | 6 tin, 3 sự kiện, 3 báo chí |
| courses | 9 | 3 khóa mỗi nhóm cấp lớp |
| admissions | 2 | 1 mở, 1 đóng |
| achievements | 12 | 2 năm, nhiều cấp giải |
| documents | 15 | trộn tài liệu/đề/đáp án |
| exams | 3 | 1 sắp, 2 có kết quả |
| albums | 4 | ảnh minh họa dùng chung |
| pages | 2 | Giới thiệu, Liên hệ |
| branches | 3 | địa chỉ giả, có map |
| users | 2 | 1 admin, 1 editor (để khách thử) |

## Nguyên tắc
- Logo/tên lấy từ khách; tên HS, SĐT, địa chỉ trong demo là dữ liệu GIẢ.
- Script: `seed.ts` (tạo) và `cleanup-demo.ts` (xóa dữ liệu mẫu, GIỮ users + globals).
- Chạy cleanup trước bàn giao → admin trống.
