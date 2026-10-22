# 04 — Sitemap & routes

## Menu chính (10 mục)
Giới thiệu · Khóa học · Tuyển sinh · Thành tích · Tài liệu & đề thi · Kỳ thi · Tin tức · Album · Cơ sở · Liên hệ

## URL map
| Route | Loại | Nguồn |
|---|---|---|
| / | trang chủ | homepage global + rel |
| /gioi-thieu | trang đơn | pages |
| /khoa-hoc, /khoa-hoc/[slug] | list + detail | courses |
| /tuyen-sinh, /tuyen-sinh/[slug] | list + detail | admissions |
| /thanh-tich, /thanh-tich/[slug] | list + detail | achievements |
| /tai-lieu | trang đơn + filter client | documents |
| /ky-thi, /ky-thi/[slug] | list + detail | exams |
| /tin-tuc, /tin-tuc/[slug], /tin-tuc/trang/[n] | list + detail + phân trang | posts |
| /album, /album/[slug] | list + detail | albums |
| /co-so | trang đơn | branches |
| /lien-he | trang đơn + form | pages + submissions |

## Tự động
- sitemap.xml, robots.txt, trang 404.