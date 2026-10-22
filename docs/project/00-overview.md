# 00 — Tổng quan dự án

## Mục tiêu
Website công bố thông tin cho một trung tâm giáo dục: giới thiệu, khóa học, tuyển sinh,
thành tích, tài liệu & đề thi, thông tin kỳ thi, tin tức, album ảnh, cơ sở, liên hệ.

## Đối tượng người dùng
- **Khách truy cập** (phụ huynh, học sinh): chỉ xem, không tài khoản.
- **Nhân viên trung tâm**: đăng nhập `/admin` để đăng bài, xử lý form liên hệ.

## Phạm vi (IN)
- 10 collection nội dung, 3 collection hỗ trợ, 3 global.
- Trang public dựng sẵn (static/ISR), tự làm mới khi Xuất bản.
- Form liên hệ + đăng ký tư vấn (lưu họ tên, SĐT, email).
- SEO: meta title/description/ảnh chia sẻ, sitemap.xml, robots.txt, 404.

## Phạm vi (OUT) — KHÔNG làm
- Tra cứu điểm, thanh toán, học online, LMS.
- Tài khoản cho phụ huynh/học sinh.
- Đa ngôn ngữ (giai đoạn này — xem open-questions).
- Quy trình duyệt bài nhiều bước (làm sau nếu khách cần).

## Dữ liệu cá nhân
Tối thiểu: chỉ họ tên, số điện thoại, email từ 2 form. Không lưu gì khác.

## Tiêu chí thành công
- Khách mở link thấy web "như thật" (có dữ liệu seed).
- Nhân viên tự đăng bài, bấm Xuất bản, web cập nhật vài giây, không cần deploy.
- Trang tải nhanh (static), điểm Lighthouse tốt.
- Bàn giao: admin trống (giữ users + globals), có tài liệu hướng dẫn.