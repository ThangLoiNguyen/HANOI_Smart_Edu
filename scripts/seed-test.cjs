const path = require('node:path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

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
}

main().catch((error) => {
  console.error('Seed failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
