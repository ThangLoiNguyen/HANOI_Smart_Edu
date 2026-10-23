const path = require('node:path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { Client } = require('pg')

const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@test.local'
const ADMIN_PASSWORD = 'Test123456!'

const posts = [
  {
    title: 'Khai giảng khóa Toán 10 - Tháng 11/2026',
    slug: 'khai-giang-toan-10-2026',
    type: 'tin-tuc',
    status: 'published',
    publishedAt: new Date().toISOString(),
    excerpt: 'Thông báo khai giảng khóa Toán 10 cho học sinh lớp 10.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: null,
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Trung tâm thông báo khai giảng khóa Toán 10.',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Hội thảo hướng nghiệp 2026',
    slug: 'hoi-thao-huong-nghiep-2026',
    type: 'su-kien',
    status: 'published',
    publishedAt: new Date().toISOString(),
    excerpt: 'Hội thảo dành cho học sinh lớp 11-12.',
  },
  {
    title: 'Báo Hà Nội đưa tin về trung tâm',
    slug: 'bao-ha-noi-dua-tin',
    type: 'bao-chi',
    status: 'published',
    publishedAt: new Date().toISOString(),
    excerpt: 'Bài báo về trung tâm.',
    source: 'Báo Hà Nội',
    sourceUrl: 'https://example.com',
  },
]

const courses = [
  {
    title: 'Toán 10 cơ bản',
    slug: 'toan-10-co-ban',
    status: 'published',
    grade: 'lop-10',
    subject: 'toan',
    description: 'Khóa học Toán 10 nền tảng.',
    duration: '3 tháng',
    schedule: 'Tối 2-4-6',
    tuition: 1500000,
  },
  {
    title: 'Toán 11 nâng cao',
    slug: 'toan-11-nang-cao',
    status: 'published',
    grade: 'lop-11',
    subject: 'toan',
    tuition: 2000000,
  },
  {
    title: 'Luyện thi đại học',
    slug: 'luyen-thi-dai-hoc',
    status: 'published',
    grade: 'lop-12',
    subject: 'toan',
    tuition: null,
  },
]

const exams = [
  {
    title: 'Ôn thi Chuyên Toán lớp 9',
    slug: 'olympic-toan-2026',
    status: 'published',
    year: 2026,
    level: 'thcs',
    grade: '9',
    category: 'on-thi-chuyen-toan',
    isPremium: false,
    examStatus: 'sap-dien-ra',
    audience: 'Học sinh lớp 9',
    schedule: [
      {
        label: 'Vòng 1',
        datetime: '2026-11-15T08:00:00.000Z',
        location: 'Cơ sở 1',
      },
    ],
    location: 'Hà Nội',
  },
  {
    title: 'Đề thi thử Toán 9 miễn phí',
    slug: 'de-thi-thu-toan-9-mien-phi',
    status: 'published',
    year: 2026,
    level: 'thcs',
    grade: '9',
    category: 'on-thi-chuyen-toan',
    isPremium: false,
    durationMinutes: 15,
    examContent: [
      {
        question: 'Một tam giác có đáy 10 cm và chiều cao 8 cm. Diện tích tam giác là bao nhiêu?',
        answers: [{ answer: '18 cm²' }, { answer: '40 cm²' }, { answer: '80 cm²' }, { answer: '36 cm²' }],
        correctIndex: '1',
      },
      {
        question: 'Phân số nào bằng 3/4?',
        answers: [{ answer: '6/8' }, { answer: '6/10' }, { answer: '9/16' }, { answer: '12/20' }],
        correctIndex: '0',
      },
    ],
    examStatus: 'sap-dien-ra',
    audience: 'Học sinh lớp 9 muốn trải nghiệm đề thi thử',
  },
  {
    title: 'Đề thi thử Toán 9 Premium',
    slug: 'de-thi-thu-toan-9-premium',
    status: 'published',
    year: 2026,
    level: 'thcs',
    grade: '9',
    category: 'on-thi-chuyen-toan',
    isPremium: true,
    price: 20000,
    durationMinutes: 45,
    examContent: [
      {
        question: 'Một tam giác có đáy 10 cm và chiều cao 8 cm. Diện tích tam giác là bao nhiêu?',
        answers: [
          { answer: '18 cm²' },
          { answer: '40 cm²' },
          { answer: '80 cm²' },
          { answer: '36 cm²' },
        ],
        correctIndex: '1',
      },
      {
        question: 'Phân số nào bằng 3/4?',
        answers: [
          { answer: '6/8' },
          { answer: '6/10' },
          { answer: '9/16' },
          { answer: '12/20' },
        ],
        correctIndex: '0',
      },
      {
        question: 'Giá trị của 2³ + 4 là bao nhiêu?',
        answers: [
          { answer: '10' },
          { answer: '12' },
          { answer: '16' },
          { answer: '24' },
        ],
        correctIndex: '1',
      },
    ],
    examStatus: 'sap-dien-ra',
    audience: 'Học sinh lớp 9 chuẩn bị thi chuyên Toán',
    schedule: [
      {
        label: 'Buổi 1',
        datetime: '2026-11-20T09:00:00.000Z',
        location: 'Cơ sở Cầu Giấy',
      },
    ],
    location: 'Cơ sở Cầu Giấy',
  },
  {
    title: 'Kiểm tra giữa kỳ 1 Toán lớp 6',
    slug: 'hsg-cap-truong-2025',
    status: 'published',
    year: 2025,
    level: 'thcs',
    grade: '6',
    category: 'gk1',
    isPremium: false,
    examStatus: 'da-ket-thuc',
    schedule: [
      {
        label: 'Chung kết',
        datetime: '2025-05-20T08:00:00.000Z',
        location: 'Cơ sở 1',
      },
    ],
    location: 'Hà Nội',
    results: { description: 'Đã có kết quả, xem file đính kèm.' },
  },
]

const placementQuestions = [
  {
    topic: 'Diện tích tam giác',
    question: 'Một tam giác có đáy 10 cm và chiều cao 8 cm. Diện tích tam giác là bao nhiêu?',
    answers: ['18 cm²', '40 cm²', '80 cm²', '36 cm²'],
    correctAnswerIndex: 1,
    hint: 'Diện tích tam giác bằng đáy nhân chiều cao rồi chia 2.',
    explanation: 'Diện tích là 10 × 8 ÷ 2 = 40 cm².',
    difficulty: 'de',
  },
  {
    topic: 'Diện tích tam giác',
    question: 'Tam giác có đáy 14 cm, chiều cao 6 cm. Diện tích là bao nhiêu?',
    answers: ['42 cm²', '84 cm²', '40 cm²', '20 cm²'],
    correctAnswerIndex: 0,
    hint: 'Nhân 14 với 6 rồi chia cho 2.',
    explanation: 'Diện tích là 14 × 6 ÷ 2 = 42 cm².',
    difficulty: 'de',
  },
  {
    topic: 'Diện tích tam giác',
    question: 'Tam giác có diện tích 54 cm² và đáy 12 cm. Chiều cao tương ứng là bao nhiêu?',
    answers: ['6 cm', '8 cm', '9 cm', '12 cm'],
    correctAnswerIndex: 2,
    hint: 'Từ công thức S = đáy × chiều cao ÷ 2, hãy tìm chiều cao.',
    explanation: 'Chiều cao là 54 × 2 ÷ 12 = 9 cm.',
    difficulty: 'trung-binh',
  },
  {
    topic: 'Diện tích tam giác',
    question: 'Một tam giác có đáy 16 cm và chiều cao 7 cm. Diện tích là bao nhiêu?',
    answers: ['56 cm²', '112 cm²', '46 cm²', '23 cm²'],
    correctAnswerIndex: 0,
    hint: 'Đừng quên chia tích đáy và chiều cao cho 2.',
    explanation: 'Diện tích là 16 × 7 ÷ 2 = 56 cm².',
    difficulty: 'trung-binh',
  },
  {
    topic: 'Đổi đơn vị',
    question: '3 m 25 cm bằng bao nhiêu xăng-ti-mét?',
    answers: ['325 cm', '3025 cm', '35 cm', '320 cm'],
    correctAnswerIndex: 0,
    hint: '1 m = 100 cm.',
    explanation: '3 m = 300 cm; 300 cm + 25 cm = 325 cm.',
    difficulty: 'de',
  },
  {
    topic: 'Đổi đơn vị',
    question: '2,5 km bằng bao nhiêu mét?',
    answers: ['250 m', '2.050 m', '2.500 m', '25.000 m'],
    correctAnswerIndex: 2,
    hint: '1 km = 1.000 m.',
    explanation: '2,5 × 1.000 = 2.500 m.',
    difficulty: 'trung-binh',
  },
  {
    topic: 'Đổi đơn vị',
    question: '1,2 kg bằng bao nhiêu gam?',
    answers: ['120 g', '1.020 g', '1.200 g', '12.000 g'],
    correctAnswerIndex: 2,
    hint: '1 kg = 1.000 g.',
    explanation: '1,2 × 1.000 = 1.200 g.',
    difficulty: 'trung-binh',
  },
  {
    topic: 'Tỉ số phần trăm',
    question: '25% của 200 là bao nhiêu?',
    answers: ['25', '40', '50', '75'],
    correctAnswerIndex: 2,
    hint: '25% bằng một phần tư.',
    explanation: '200 × 25 ÷ 100 = 50.',
    difficulty: 'de',
  },
  {
    topic: 'Tỉ số phần trăm',
    question: '18 học sinh trong lớp có 24 học sinh. Tỉ số phần trăm là bao nhiêu?',
    answers: ['60%', '70%', '75%', '80%'],
    correctAnswerIndex: 2,
    hint: 'Tính 18 ÷ 24 rồi nhân với 100%.',
    explanation: '18 ÷ 24 × 100% = 75%.',
    difficulty: 'kho',
  },
  {
    topic: 'Tỉ số phần trăm',
    question: 'Một món đồ giá 350.000 đồng được giảm 20%. Giá sau giảm là bao nhiêu?',
    answers: ['70.000 đồng', '280.000 đồng', '300.000 đồng', '330.000 đồng'],
    correctAnswerIndex: 1,
    hint: 'Tính số tiền giảm trước, rồi trừ khỏi giá ban đầu.',
    explanation: 'Số tiền giảm là 350.000 × 20% = 70.000 đồng. Giá mới là 350.000 - 70.000 = 280.000 đồng.',
    difficulty: 'kho',
  },
]

const admissions = [
  {
    title: 'Tuyển sinh khóa Hè 2026',
    slug: 'tuyen-sinh-he-2026',
    status: 'published',
    admissionStatus: 'dang-mo',
    deadline: '2026-06-30T23:59:59.000Z',
    content: lexicalParagraph('Tuyển sinh khóa Hè 2026 tại trung tâm.'),
  },
  {
    title: 'Tuyển sinh khóa Đông 2025',
    slug: 'tuyen-sinh-dong-2025',
    status: 'published',
    admissionStatus: 'da-dong',
    deadline: '2025-12-31T23:59:59.000Z',
  },
]

const schedules = [
  {
    title: 'Khóa Toán 10 - Khai giảng 2026',
    course: null,
    startDate: '2026-11-02T00:00:00.000Z',
    scheduleDetails: 'Thứ 2, 4, 6 - 18:30 đến 20:30',
    location: null,
    maxStudents: 24,
    currentStudents: 12,
    status: 'dang-mo',
  },
  {
    title: 'Khóa Toán 11 - Lớp nâng cao',
    course: null,
    startDate: '2026-11-05T00:00:00.000Z',
    scheduleDetails: 'Thứ 3, 5, 7 - 19:00 đến 21:00',
    location: null,
    maxStudents: 20,
    currentStudents: 9,
    status: 'sap-mo',
  },
  {
    title: 'Luyện thi Đại học - Nhóm 12',
    course: null,
    startDate: '2026-10-28T00:00:00.000Z',
    scheduleDetails: 'Thứ 2, 4, 6 - 17:30 đến 19:30',
    location: null,
    maxStudents: 30,
    currentStudents: 28,
    status: 'dang-mo',
  },
]

const achievements = [
  {
    title: 'Nguyễn Mai Anh - Giải nhất Toán',
    slug: 'nguyen-mai-anh-giai-nhat-toan',
    status: 'published',
    studentName: 'Nguyễn Mai Anh',
    school: 'Trường THPT Hà Nội - Amsterdam',
    className: '10A1',
    award: 'Giải nhất Toán cấp thành phố',
    examName: 'Kỳ thi HSG Toán Hà Nội',
    year: 2026,
    awardLevel: 'nhat',
    note: 'Nỗ lực học tập bền bỉ và đạt thành tích xuất sắc.',
  },
  {
    title: 'Trần Minh Quân - Giải nhì Vật lý',
    slug: 'tran-minh-quan-giai-nhi-vat-ly',
    status: 'published',
    studentName: 'Trần Minh Quân',
    school: 'Trường THPT Chu Văn An',
    className: '11A2',
    award: 'Giải nhì Vật lý cấp thành phố',
    examName: 'Kỳ thi HSG Vật lý Hà Nội',
    year: 2026,
    awardLevel: 'nhi',
  },
  {
    title: 'Lê Phương Linh - Giải ba Ngữ văn',
    slug: 'le-phuong-linh-giai-ba-ngu-van',
    status: 'published',
    studentName: 'Lê Phương Linh',
    school: 'Trường THPT Kim Liên',
    className: '10C1',
    award: 'Giải ba Ngữ văn cấp quận',
    examName: 'Kỳ thi HSG Ngữ văn Đống Đa',
    year: 2025,
    awardLevel: 'ba',
  },
  {
    title: 'Phạm Đức Huy - Giải khuyến khích Tiếng Anh',
    slug: 'pham-duc-huy-giai-khuyen-khich-tieng-anh',
    status: 'published',
    studentName: 'Phạm Đức Huy',
    school: 'Trường THPT Trần Phú',
    className: '12A3',
    award: 'Giải khuyến khích Tiếng Anh cấp thành phố',
    examName: 'Kỳ thi HSG Tiếng Anh Hà Nội',
    year: 2025,
    awardLevel: 'khuyen-khich',
  },
  {
    title: 'Vũ Khánh Ngọc - Giải khác cấp trường',
    slug: 'vu-khanh-ngoc-giai-khac-cap-truong',
    status: 'published',
    studentName: 'Vũ Khánh Ngọc',
    school: 'Trường THPT Đống Đa',
    className: '11A4',
    award: 'Giải sáng tạo cấp trường',
    examName: 'Ngày hội sáng tạo trẻ',
    year: 2025,
    awardLevel: 'giai-khac',
  },
]

const albums = [
  {
    title: 'Ngày hội khai giảng 2026',
    slug: 'ngay-hoi-khai-giang-2026',
    status: 'published',
    takenAt: '2026-09-05T00:00:00.000Z',
    photos: [
      { key: 'khai-giang-2026-1', alt: 'Ngày hội khai giảng 2026 - Ảnh 1', caption: 'Đón học sinh trong ngày khai giảng' },
      { key: 'khai-giang-2026-2', alt: 'Ngày hội khai giảng 2026 - Ảnh 2', caption: 'Phát biểu chào mừng năm học mới' },
      { key: 'khai-giang-2026-3', alt: 'Ngày hội khai giảng 2026 - Ảnh 3', caption: 'Học sinh tham gia hoạt động tập thể' },
    ],
  },
  {
    title: 'Hoạt động ngoại khóa mùa hè 2025',
    slug: 'ngoai-khoa-mua-he-2025',
    status: 'published',
    takenAt: '2025-07-12T00:00:00.000Z',
    photos: [
      { key: 'ngoai-khoa-2025-1', alt: 'Ngoại khóa mùa hè 2025 - Ảnh 1', caption: 'Khởi động chương trình ngoại khóa' },
      { key: 'ngoai-khoa-2025-2', alt: 'Ngoại khóa mùa hè 2025 - Ảnh 2', caption: 'Trò chơi đồng đội' },
      { key: 'ngoai-khoa-2025-3', alt: 'Ngoại khóa mùa hè 2025 - Ảnh 3', caption: 'Các nhóm cùng hoàn thành thử thách' },
      { key: 'ngoai-khoa-2025-4', alt: 'Ngoại khóa mùa hè 2025 - Ảnh 4', caption: 'Kết thúc hoạt động trong ngày' },
    ],
  },
]

const documents = [
  {
    title: 'Đề Toán lớp 1 - Giữa kỳ 1',
    slug: 'tai-lieu-on-tap-toan-10',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'tieu-hoc',
    grade: '1',
    category: 'gk1',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/de-toan-lop-1-gk1',
  },
  {
    title: 'Đề Toán lớp 1 - Cuối kỳ 1',
    slug: 'de-thi-thu-toan-11',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'tieu-hoc',
    grade: '1',
    category: 'ck1',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/de-toan-lop-1-ck1',
  },
  {
    title: 'Tài liệu ôn thi Trường Chuyên lớp 5',
    slug: 'dap-an-tieng-anh-12',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'tai-lieu',
    level: 'tieu-hoc',
    grade: '5',
    category: 'on-thi-truong-chon',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/on-thi-truong-chuyen-lop-5',
  },
  {
    title: 'Đề Toán lớp 2 - Giữa kỳ 2',
    slug: 'de-toan-lop-2-gk2',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'tieu-hoc',
    grade: '2',
    category: 'gk2',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/de-toan-lop-2-gk2',
  },
  {
    title: 'Đề Tiếng Anh lớp 3 - Cuối kỳ 2',
    slug: 'de-tieng-anh-lop-3-ck2',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'tieu-hoc',
    grade: '3',
    category: 'ck2',
    subject: 'tieng-anh',
    year: 2026,
    externalLink: 'https://example.com/de-tieng-anh-lop-3-ck2',
  },
  {
    title: 'Tài liệu ôn tập Ngữ văn lớp 4 - Giữa kỳ 1',
    slug: 'tai-lieu-ngu-van-lop-4-gk1',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'tai-lieu',
    level: 'tieu-hoc',
    grade: '4',
    category: 'gk1',
    subject: 'ngu-van',
    year: 2026,
    externalLink: 'https://example.com/tai-lieu-ngu-van-lop-4-gk1',
  },
  {
    title: 'Đề Toán lớp 5 - Giữa kỳ 1',
    slug: 'de-toan-lop-5-gk1',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'tieu-hoc',
    grade: '5',
    category: 'gk1',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/de-toan-lop-5-gk1',
  },
  {
    title: 'Đề Toán lớp 6 - Giữa kỳ 1',
    slug: 'de-toan-lop-6-gk1',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'thcs',
    grade: '6',
    category: 'gk1',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/de-toan-lop-6-gk1',
  },
  {
    title: 'Đề Ngữ văn lớp 7 - Cuối kỳ 1',
    slug: 'de-ngu-van-lop-7-ck1',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'de-thi',
    level: 'thcs',
    grade: '7',
    category: 'ck1',
    subject: 'ngu-van',
    year: 2026,
    externalLink: 'https://example.com/de-ngu-van-lop-7-ck1',
  },
  {
    title: 'Tài liệu ôn thi Chuyên Toán lớp 9',
    slug: 'tai-lieu-on-thi-chuyen-toan-lop-9',
    status: 'published',
    publishedAt: new Date().toISOString(),
    type: 'tai-lieu',
    level: 'thcs',
    grade: '9',
    category: 'on-thi-chuyen-toan',
    subject: 'toan',
    year: 2026,
    externalLink: 'https://example.com/on-thi-chuyen-toan-lop-9',
  },
]

const branches = [
  {
    title: 'Cơ sở Cầu Giấy',
    slug: 'co-so-cau-giay',
    status: 'published',
    publishedAt: new Date().toISOString(),
    order: 1,
    address: 'Số 10 phố Duy Tân, quận Cầu Giấy, Hà Nội',
    phone: '0912.345.678',
    workingHours: '08:00–20:00, Thứ 2–Chủ nhật',
    googleMapsUrl: 'https://maps.google.com/?q=Cau+Giay+Ha+Noi',
  },
  {
    title: 'Cơ sở Đống Đa',
    slug: 'co-so-dong-da',
    status: 'published',
    publishedAt: new Date().toISOString(),
    order: 2,
    address: 'Số 20 phố Tây Sơn, quận Đống Đa, Hà Nội',
    phone: '0913.456.789',
    workingHours: '08:00–20:00, Thứ 2–Chủ nhật',
    googleMapsUrl: 'https://maps.google.com/?q=Dong+Da+Ha+Noi',
  },
]

const pages = [
  {
    title: 'Giới thiệu HANOI SMART EDU',
    slug: 'gioi-thieu',
    status: 'published',
    publishedAt: new Date().toISOString(),
    layout: [
      {
        blockType: 'textBlock',
        heading: 'Đồng hành cùng học sinh',
        body: lexicalParagraph('HANOI SMART EDU xây dựng môi trường học tập tích cực, giúp mỗi học sinh phát huy tiềm năng.'),
      },
      {
        blockType: 'statsBlock',
        items: [
          { label: 'Năm đồng hành', value: '10+' },
          { label: 'Học viên', value: '2.000+' },
          { label: 'Cơ sở', value: '2' },
        ],
      },
      {
        blockType: 'teamBlock',
        members: [
          { name: 'Nguyễn Minh Anh', role: 'Giám đốc chuyên môn', bio: 'Đồng hành cùng đội ngũ giáo viên và học sinh.' },
          { name: 'Trần Thu Hà', role: 'Giáo viên Toán', bio: 'Tập trung xây dựng nền tảng kiến thức vững chắc.' },
        ],
      },
      {
        blockType: 'ctaBlock',
        heading: 'Sẵn sàng bắt đầu?',
        description: 'Liên hệ với trung tâm để được tư vấn lộ trình phù hợp.',
        buttonLabel: 'Xem các khóa học',
        buttonLink: '/khoa-hoc',
      },
    ],
  },
]

const introductionImage = {
  key: 'gioi-thieu',
  alt: 'Cơ sở vật chất trung tâm',
  caption: 'Cơ sở vật chất trung tâm',
}

const mediaDatabase = new Client({
  connectionString: process.env.DATABASE_URI_UNPOOLED || process.env.DATABASE_URI,
})
let mediaDatabaseConnected = false

function lexicalParagraph(text) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: null,
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

function getCookieHeader(response) {
  const cookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean)

  return cookies
    .map((cookie) => cookie.split(';', 1)[0])
    .filter(Boolean)
    .join('; ')
}

async function readResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(new URL(endpoint, BASE_URL), {
    method,
    headers: {
      ...authHeaders,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await readResponse(response)

  if (!response.ok) {
    const detail =
      typeof data === 'object' && data !== null && 'errors' in data
        ? JSON.stringify(data.errors)
        : typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : `HTTP ${response.status}`
    throw new Error(`${method} ${endpoint} failed: ${response.status} ${detail}`)
  }

  return data
}

let authHeaders = {}

async function waitForServer() {
  const deadline = Date.now() + 30_000
  let lastError

  while (Date.now() < deadline) {
    try {
      await fetch(`${BASE_URL}/api/users`)
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error(
    `Dev server did not respond within 30 seconds: ${
      lastError instanceof Error ? lastError.message : 'connection failed'
    }`,
  )
}

async function login() {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = await readResponse(response)

  if (!response.ok) {
    throw new Error(`Admin login failed: HTTP ${response.status}`)
  }

  if (typeof data === 'object' && data !== null && typeof data.token === 'string') {
    authHeaders = { Authorization: `JWT ${data.token}` }
  } else {
    const cookie = getCookieHeader(response)
    if (!cookie) {
      throw new Error('Admin login succeeded but returned neither a token nor a session cookie')
    }
    authHeaders = { Cookie: cookie }
  }
}

function extractDocument(response) {
  if (typeof response !== 'object' || response === null) return response
  if ('doc' in response && typeof response.doc === 'object' && response.doc !== null) {
    return response.doc
  }
  return response
}

function extractDocs(response) {
  return typeof response === 'object' &&
    response !== null &&
    'docs' in response &&
    Array.isArray(response.docs)
    ? response.docs
    : []
}

async function findPost(post) {
  const byTitle = new URLSearchParams({
    'where[title][equals]': post.title,
    limit: '1',
  })
  const titleResult = await request(`/api/posts?${byTitle}`)
  const titleMatch = extractDocs(titleResult)[0]
  if (titleMatch) return titleMatch

  const bySlug = new URLSearchParams({
    'where[slug][equals]': post.slug,
    limit: '1',
  })
  const slugResult = await request(`/api/posts?${bySlug}`)
  return extractDocs(slugResult)[0] ?? null
}

async function ensurePost(post) {
  const existing = await findPost(post)
  if (existing) {
    const result = await request(`/api/posts/${existing.id}`, {
      method: 'PATCH',
      body: { status: 'published' },
    })
    return extractDocument(result)
  }

  const result = await request('/api/posts', {
    method: 'POST',
    body: post,
  })
  return extractDocument(result)
}

async function ensureRecord(collection, record) {
  const lookupField = typeof record.slug === 'string' && record.slug ? 'slug' : 'title'
  const query = new URLSearchParams({
    [`where[${lookupField}][equals]`]: record[lookupField],
    limit: '1',
  })
  const result = await request(`/api/${collection}?${query}`)
  const existing = extractDocs(result)[0]

  if (existing) {
    const updated = await request(`/api/${collection}/${existing.id}`, {
      method: 'PATCH',
      body: record,
    })
    return extractDocument(updated)
  }

  const created = await request(`/api/${collection}`, {
    method: 'POST',
    body: record,
  })
  return extractDocument(created)
}

async function ensurePlaceholderMedia(photo) {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">',
    '<rect width="1200" height="800" fill="#e0f2fe"/>',
    '<circle cx="600" cy="400" r="190" fill="#fff7ed"/>',
    '<text x="600" y="430" text-anchor="middle" font-family="Arial,sans-serif" font-size="92" font-weight="700" fill="#1e3a8a">HSE</text>',
    '</svg>',
  ].join('')
  if (!mediaDatabaseConnected) {
    await mediaDatabase.connect()
    mediaDatabaseConnected = true
  }
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`
  const existing = await mediaDatabase.query(
    'SELECT id FROM media WHERE alt = $1 LIMIT 1',
    [photo.alt],
  )
  const filename = `test-placeholder-${photo.key}.svg`
  const media =
    existing.rowCount > 0
      ? await mediaDatabase.query(
          `UPDATE media
           SET caption = $2, url = $3, filename = $4, mime_type = 'image/svg+xml',
             filesize = $5, width = 1200, height = 800, updated_at = NOW()
           WHERE id = $1
           RETURNING id`,
          [existing.rows[0].id, photo.caption, dataUrl, filename, Buffer.byteLength(svg)],
        )
      : await mediaDatabase.query(
          `INSERT INTO media (alt, caption, url, filename, mime_type, filesize, width, height)
           VALUES ($1, $2, $3, $4, 'image/svg+xml', $5, 1200, 800)
           RETURNING id`,
          [photo.alt, photo.caption, dataUrl, filename, Buffer.byteLength(svg)],
        )
  return request(`/api/media/${media.rows[0].id}`)
}

async function ensureSiteSettings() {
  const current = await request('/api/globals/siteSettings')
  const values = {
    siteName: 'HANOI Smart Edu',
    bankInfo: {
      bankId: 'Vietcombank',
      accountNo: '0123456789',
      accountName: 'TRUNG TÂM HANOI SMART EDU',
    },
    defaultSeo: {
      metaTitle: 'HANOI Smart Edu',
      metaDescription: 'Trung tâm luyện thi uy tín tại Hà Nội',
    },
  }
  const isCurrent =
    current.siteName === values.siteName &&
    current.bankInfo?.bankId === values.bankInfo.bankId &&
    current.bankInfo?.accountNo === values.bankInfo.accountNo &&
    current.bankInfo?.accountName === values.bankInfo.accountName &&
    current.defaultSeo?.metaTitle === values.defaultSeo.metaTitle &&
    current.defaultSeo?.metaDescription === values.defaultSeo.metaDescription
  if (isCurrent) return current

  // Payload's global REST update endpoint accepts POST; PATCH returns 404.
  const result = await request('/api/globals/siteSettings', {
    method: 'POST',
    body: values,
  })

  return extractDocument(result)
}

async function ensureNavigation() {
  const current = await request('/api/globals/navigation')
  const mainMenu = [
    {
      label: 'Về chúng tôi',
      type: 'external',
      url: '#',
      children: [
        { label: 'Giới thiệu', type: 'external', url: '/gioi-thieu' },
        { label: 'Cơ sở', type: 'external', url: '/co-so' },
        { label: 'Liên hệ', type: 'external', url: '/lien-he' },
      ],
    },
    {
      label: 'Chương trình học',
      type: 'external',
      url: '#',
      children: [
        { label: 'Khóa học', type: 'external', url: '/khoa-hoc' },
        { label: 'Tài liệu & Đề thi', type: 'external', url: '/tai-lieu' },
        { label: 'Thi thử', type: 'external', url: '/thi-thu' },
        { label: 'Kiểm tra đầu vào', type: 'external', url: '/kiem-tra-dau-vao' },
      ],
    },
    {
      label: 'Góc Học sinh',
      type: 'external',
      url: '#',
      children: [
        { label: 'Tin tức', type: 'external', url: '/tin-tuc' },
        { label: 'Thành tích', type: 'external', url: '/thanh-tich' },
        { label: 'Tuyển sinh', type: 'external', url: '/tuyen-sinh' },
        { label: 'Kỳ thi', type: 'external', url: '/ky-thi' },
        { label: 'Album', type: 'external', url: '/album' },
      ],
    },
  ]
  const footerMenu = [
    { label: 'Giới thiệu', type: 'external', url: '/gioi-thieu' },
    { label: 'Khóa học', type: 'external', url: '/khoa-hoc' },
    { label: 'Kiểm tra đầu vào', type: 'external', url: '/kiem-tra-dau-vao' },
    { label: 'Tuyển sinh', type: 'external', url: '/tuyen-sinh' },
    { label: 'Thành tích', type: 'external', url: '/thanh-tich' },
    { label: 'Tài liệu & Đề thi', type: 'external', url: '/tai-lieu' },
    { label: 'Thi thử', type: 'external', url: '/thi-thu' },
    { label: 'Kỳ thi', type: 'external', url: '/ky-thi' },
    { label: 'Tin tức', type: 'external', url: '/tin-tuc' },
    { label: 'Album', type: 'external', url: '/album' },
    { label: 'Cơ sở', type: 'external', url: '/co-so' },
    { label: 'Liên hệ', type: 'external', url: '/lien-he' },
  ]

  const currentMenu = Array.isArray(current.mainMenu) ? current.mainMenu : []
  const currentFooterMenu = Array.isArray(current.footerMenu) ? current.footerMenu : []
  const mainMenuMatches =
    currentMenu.length === mainMenu.length &&
    mainMenu.every((item, index) => {
      const currentItem = currentMenu[index]
      return (
        currentItem?.label === item.label &&
        currentItem?.url === item.url &&
        Array.isArray(currentItem.children) &&
        currentItem.children.length === item.children.length &&
        item.children.every(
          (child, childIndex) =>
            currentItem.children[childIndex]?.label === child.label &&
            currentItem.children[childIndex]?.url === child.url,
        )
      )
    })
  const footerMenuMatches =
    currentFooterMenu.length === footerMenu.length &&
    footerMenu.every(
      (item, index) =>
        currentFooterMenu[index]?.label === item.label &&
        currentFooterMenu[index]?.url === item.url,
    )

  if (mainMenuMatches && footerMenuMatches) return current

  const result = await request('/api/globals/navigation', {
    method: 'POST',
    body: { mainMenu, footerMenu },
  })
  return extractDocument(result)
}

async function main() {
  await waitForServer()
  await login()

  const settings = await ensureSiteSettings()
  await ensureNavigation()
  const savedPosts = []
  for (const post of posts) {
    savedPosts.push(await ensurePost(post))
  }
  const savedCourses = []
  for (const course of courses) {
    savedCourses.push(await ensureRecord('courses', course))
  }
  const savedExams = []
  for (const exam of exams) {
    savedExams.push(await ensureRecord('exams', exam))
  }
  const savedSchedules = []
  for (const [index, schedule] of schedules.entries()) {
    savedSchedules.push(
      await ensureRecord('schedules', {
        ...schedule,
        course: savedCourses[index].id,
        location: undefined,
      }),
    )
  }
  const savedAdmissions = []
  for (const admission of admissions) {
    savedAdmissions.push(await ensureRecord('admissions', admission))
  }
  const savedAchievements = []
  for (const achievement of achievements) {
    savedAchievements.push(await ensureRecord('achievements', achievement))
  }
  const savedDocuments = await seedDocuments()
  const savedPlacementQuestions = await seedPlacementQuestions()
  const savedBranches = await seedBranches()
  const savedPages = await seedPages()

  console.log(
    `siteSettings id: ${
      settings && typeof settings === 'object' && 'id' in settings
        ? settings.id
        : 'n/a (Payload global does not expose an id)'
    }`,
  )
  for (const post of savedPosts) {
    console.log(`post id: ${post.id}`)
  }
  console.log(`Bài 1 title hiện tại: ${savedPosts[0].title}`)
  for (const course of savedCourses) {
    console.log(`course id: ${course.id}, slug: ${course.slug}`)
  }
  for (const exam of savedExams) {
    console.log(`exam id: ${exam.id}, slug: ${exam.slug}`)
  }
  for (const schedule of savedSchedules) {
    console.log(`schedule id: ${schedule.id}, title: ${schedule.title}`)
  }
  for (const admission of savedAdmissions) {
    console.log(`admission id: ${admission.id}, slug: ${admission.slug}`)
  }
  for (const achievement of savedAchievements) {
    console.log(`achievement id: ${achievement.id}, slug: ${achievement.slug}`)
  }
  console.log(`placement questions seeded: ${savedPlacementQuestions.length}`)

  const savedAlbums = []
  for (const album of albums) {
    const photos = []
    for (const photo of album.photos) {
      const media = await ensurePlaceholderMedia(photo)
      photos.push({ image: media.id, caption: photo.caption })
    }
    const cover = photos[0]?.image
    savedAlbums.push(await ensureRecord('albums', { ...album, cover, photos }))
  }

  for (const album of savedAlbums) {
    console.log(`album id: ${album.id}, slug: ${album.slug}`)
  }
  for (const document of savedDocuments) {
    console.log(`document id: ${document.id}, slug: ${document.slug}`)
  }
  for (const branch of savedBranches) {
    console.log(`branch id: ${branch.id}, slug: ${branch.slug}`)
  }
  for (const page of savedPages) {
    console.log(`page id: ${page.id}, slug: ${page.slug}`)
  }
}

async function seedDocuments() {
  const saved = []
  for (const document of documents) {
    saved.push(await ensureRecord('documents', document))
  }
  return saved
}

async function seedPlacementQuestions() {
  const saved = []
  for (const question of placementQuestions) {
    const query = new URLSearchParams({
      'where[question][equals]': question.question,
      limit: '1',
    })
    const existingResult = await request(`/api/placement-questions?${query}`)
    const existing = extractDocs(existingResult)[0]
    const data = {
      ...question,
      answers: question.answers.map((answer) => ({ answer })),
    }
    const result = existing
      ? await request(`/api/placement-questions/${existing.id}`, { method: 'PATCH', body: data })
      : await request('/api/placement-questions', { method: 'POST', body: data })
    saved.push(extractDocument(result))
  }
  return saved
}

async function seedBranches() {
  const saved = []
  for (const branch of branches) {
    saved.push(await ensureRecord('branches', branch))
  }
  return saved
}

async function seedPages() {
  if (!mediaDatabaseConnected) {
    await mediaDatabase.connect()
    mediaDatabaseConnected = true
  }

  const existingMedia = await mediaDatabase.query('SELECT id FROM media LIMIT 1')
  const media = existingMedia.rowCount
    ? await request(`/api/media/${existingMedia.rows[0].id}`)
    : await ensurePlaceholderMedia(introductionImage)

  const saved = []
  for (const page of pages) {
    if (page.slug !== 'gioi-thieu') {
      saved.push(await ensureRecord('pages', page))
      continue
    }

    const layout = page.layout.filter((block) => block.blockType !== 'imageBlock')
    const textBlockIndex = layout.findIndex((block) => block.blockType === 'textBlock')
    if (textBlockIndex < 0) {
      throw new Error('The gioi-thieu page seed requires a textBlock before its imageBlock')
    }

    layout.splice(textBlockIndex + 1, 0, {
      blockType: 'imageBlock',
      image: media.id,
      caption: introductionImage.caption,
    })
    saved.push(await ensureRecord('pages', { ...page, layout }))
  }
  return saved
}

main()
  .catch((error) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mediaDatabaseConnected) await mediaDatabase.end()
  })
