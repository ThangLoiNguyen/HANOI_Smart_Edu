# 04 — Sitemap & routes

## Menu chính (11 mục)
Giới thiệu · Khóa học · Kiểm tra đầu vào · Tuyển sinh · Thành tích · Tài liệu & đề thi · Kỳ thi · Tin tức · Album · Cơ sở · Liên hệ

## URL map
| Route | Loại | Nguồn |
|---|---|---|
| / | trang chủ | homepage global + rel |
| /gioi-thieu | trang đơn | pages |
| /khoa-hoc, /khoa-hoc/[slug] | list + detail + lịch khai giảng | courses + schedules |
| /tuyen-sinh, /tuyen-sinh/[slug] | list + detail | admissions |
| /thanh-tich, /thanh-tich/[slug] | list + detail | achievements |
| /tai-lieu | trang chọn cấp học/khối/loại bài | documents |
| /tai-lieu/[level]/[grade]/[category] | danh sách tài liệu theo taxonomy, URL indexable | documents |
| /ky-thi, /ky-thi/[slug] | list + detail | exams |
| /tin-tuc, /tin-tuc/[slug], /tin-tuc/trang/[n] | list + detail + phân trang | posts |
| /album, /album/[slug] | list + detail | albums |
| /co-so | trang đơn | branches |
| /lien-he | trang đơn + form | pages + submissions |
| /kiem-tra-dau-vao | trắc nghiệm 10 câu từ ngân hàng + form tư vấn kết quả | placement-questions + submissions |

## Tự động
- sitemap.xml, robots.txt, trang 404.