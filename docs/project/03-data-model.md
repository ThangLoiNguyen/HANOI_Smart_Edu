# 03 — Data model

## Trường chung mọi collection nội dung
`title, slug, status (draft|published), publishedAt, ảnh đại diện, SEO block (metaTitle, metaDescription, shareImage)`

## 10 collection nội dung
| Collection | URL | Trường riêng | Lọc |
|---|---|---|---|
| posts | /tin-tuc/[slug] | richText, tóm tắt, type (tin tức/sự kiện/báo chí), nguồn báo + link gốc (báo chí), nổi bật | type, năm |
| courses | /khoa-hoc/[slug] | cấp lớp, môn, mô tả, lộ trình, đối tượng, thời lượng, lịch học, học phí (tùy chọn), cơ sở (rel), nội dung chi tiết | cấp lớp, môn, cơ sở |
| admissions | /tuyen-sinh/[slug] | nội dung, hạn đăng ký, trạng thái (mở/đóng), khóa học (rel), file đính kèm | trạng thái, năm |
| achievements | /thanh-tich + /thanh-tich/[slug] | tên HS, trường, lớp, giải thưởng, kỳ thi, năm, ảnh, ghi chú | năm, kỳ thi, cấp độ giải |
| documents | /tai-lieu | loại (tài liệu/đề thi/đáp án), cấp lớp, môn, năm, file hoặc link ngoài | loại, cấp lớp, môn, năm |
| exams | /ky-thi/[slug] | tên, năm, đối tượng, thể lệ, lịch thi, địa điểm, kết quả (file/bảng), tài liệu (rel) | năm, trạng thái |
| albums | /album/[slug] | thư viện ảnh (nhiều ảnh + chú thích), ngày chụp, sự kiện (rel) | năm |
| pages | /[slug] | khối nội dung linh hoạt (văn bản, ảnh, số liệu, đội ngũ) | — |
| branches | /co-so | tên, địa chỉ, SĐT, giờ làm việc, Google Maps, ảnh, thứ tự | — |
| submissions | (không public) | họ tên, SĐT, email, nội dung, khóa quan tâm, cơ sở, trạng thái xử lý | admin only |

## 3 collection hỗ trợ
- **media**: ảnh/file, alt text, lưu Vercel Blob hoặc R2.
- **users**: nhân viên, role = admin | editor.
- **categories**: danh mục dùng chung (tin tức, tài liệu, thành tích), thêm bớt trong admin.

## 3 global
| Global | Nội dung | Hiển thị |
|---|---|---|
| siteSettings | tên, logo, favicon, hotline, email, Zalo/FB/YT, giờ làm việc, GA, SEO mặc định, footer, popup thông báo | header, footer, popup |
| navigation | menu chính nhiều cấp + menu footer (trỏ trang / collection / URL ngoài) | header, footer |
| homepage | banner trượt, số liệu, khóa/tin/thành tích nổi bật (rel), CTA tư vấn | trang chủ |

## Ghi chú
- Relationship (rel) = trường quan hệ, không nhập lại dữ liệu.
- Nổi bật trên homepage chọn bằng relationship tới collection gốc.
