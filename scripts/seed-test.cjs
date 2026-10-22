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
    title: 'Kỳ thi Olympic Toán 2026',
    slug: 'olympic-toan-2026',
    status: 'published',
    year: 2026,
    examStatus: 'sap-dien-ra',
    audience: 'Học sinh lớp 10-11',
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
    title: 'Kỳ thi HSG cấp trường 2025',
    slug: 'hsg-cap-truong-2025',
    status: 'published',
    year: 2025,
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
  const query = new URLSearchParams({
    'where[slug][equals]': record.slug,
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
  const exists = Boolean(current && typeof current === 'object' && current.siteName)
  const values = {
    siteName: 'Trung tâm Hà Nội Smart Edu',
    defaultSeo: {
      metaTitle: 'Trung tâm Hà Nội Smart Edu',
      metaDescription: 'Trung tâm luyện thi uy tín tại Hà Nội',
    },
  }
  const isCurrent =
    exists &&
    current.siteName === values.siteName &&
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

async function main() {
  await waitForServer()
  await login()

  const settings = await ensureSiteSettings()
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
  const savedAdmissions = []
  for (const admission of admissions) {
    savedAdmissions.push(await ensureRecord('admissions', admission))
  }
  const savedAchievements = []
  for (const achievement of achievements) {
    savedAchievements.push(await ensureRecord('achievements', achievement))
  }

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
  for (const admission of savedAdmissions) {
    console.log(`admission id: ${admission.id}, slug: ${admission.slug}`)
  }
  for (const achievement of savedAchievements) {
    console.log(`achievement id: ${achievement.id}, slug: ${achievement.slug}`)
  }

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
}

main()
  .catch((error) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mediaDatabaseConnected) await mediaDatabase.end()
  })
