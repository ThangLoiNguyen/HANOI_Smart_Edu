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
| documents | /tai-lieu/[level]/[grade]/[category] | loại tài liệu, cấp học (`tieu-hoc`/`thcs`), khối 1-9, loại bài, môn, năm, file hoặc link ngoài | cấp học, khối, loại bài |
| exams | /ky-thi/[slug] | tên, năm, cấp học, khối 1-9, loại bài, premium, đối tượng, thể lệ, lịch thi, địa điểm, kết quả (file/bảng), tài liệu (rel) | năm, trạng thái, cấp học, khối, loại bài |
| transactions | (không public) | học sinh, SĐT, email, đề thi (rel), số tiền, trạng thái, phương thức thanh toán, ghi chú, chứng từ, thời điểm xác nhận | admin only |
| albums | /album/[slug] | thư viện ảnh (nhiều ảnh + chú thích), ngày chụp, sự kiện (rel) | năm |
| pages | /[slug] | khối nội dung linh hoạt (văn bản, ảnh, số liệu, đội ngũ) | — |
| branches | /co-so | tên, địa chỉ, SĐT, giờ làm việc, Google Maps, ảnh, thứ tự | — |
| submissions | (không public) | họ tên, SĐT, email (tùy chọn), nội dung, khóa quan tâm, ca học (rel), cơ sở, trạng thái xử lý | admin only |

## 5 collection hỗ trợ
- **media**: ảnh/file, alt text, lưu Vercel Blob hoặc R2.
- **users**: nhân viên, role = admin | editor.
- **categories**: danh mục dùng chung (tin tức, tài liệu, thành tích), thêm bớt trong admin.
- **schedules**: lịch khai giảng theo khóa học, ngày bắt đầu, lịch học, cơ sở, sĩ số và trạng thái (`sap-mo`, `dang-mo`, `da-day`).
- **placement-questions**: ngân hàng câu hỏi Toán lớp 5, đáp án, chỉ số đáp án đúng, gợi ý, lời giải và độ khó; đọc qua server actions để không lộ đáp án trước khi trả lời.

## 3 global
| Global | Nội dung | Hiển thị |
|---|---|---|
| siteSettings | tên, logo, favicon, hotline, email, Zalo/FB/YT, giờ làm việc, GA, SEO mặc định, footer, popup thông báo | header, footer, popup |
| navigation | menu chính nhiều cấp + menu footer (trỏ trang / collection / URL ngoài) | header, footer |
| homepage | banner trượt, số liệu, khóa/tin/thành tích nổi bật (rel), CTA tư vấn | trang chủ |

## Ghi chú
- Relationship (rel) = trường quan hệ, không nhập lại dữ liệu.
- Nổi bật trên homepage chọn bằng relationship tới collection gốc.
- `documents` và `exams` dùng category `gk1`, `ck1`, `gk2`, `ck2`; `on-thi-truong-chon` chỉ hợp lệ ở Tiểu học khối 5 và `on-thi-chuyen-toan` chỉ hợp lệ ở THCS khối 9.
- `exams.isPremium` mặc định `false`; `exams.price` chỉ cần khi premium bật. `exams.examContent` là danh sách câu hỏi dùng cho cả đề Free/Premium; mỗi câu có nội dung, đúng 4 lựa chọn và `correctIndex` (0-3). `durationMinutes` mặc định 45. `transactions` dùng để lưu giao dịch Premium và mở khóa quyền làm bài.
- `submissions.scheduleId` là relationship tùy chọn tới `schedules`; test đầu vào có thể lưu submission không có email và ghi điểm vào `message`.
- `placement-questions` chỉ nhân viên đọc/ghi trực tiếp; server actions chỉ trả đáp án và lời giải sau khi học sinh chọn đáp án.

## Cập nhật thanh toán đề thi thử
- `siteSettings.bankInfo` gồm `bankId`, `accountNo`, `accountName` để hiển thị thông tin chuyển khoản.
- `transactions.status` có các giá trị `cho-xac-nhan`, `da-thanh-toan`, `tu-choi`, `da-mo-khoa`.
- `transactions.paymentMethod` hỗ trợ `chuyen-khoan`, `vietqr`, `khac`.
