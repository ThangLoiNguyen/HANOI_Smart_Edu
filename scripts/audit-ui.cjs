const fs = require('node:fs')
const path = require('node:path')
const { chromium, expect } = require('@playwright/test')

const BASE_URL = process.env.AUDIT_BASE_URL || 'http://localhost:3000'
const EXPECT_TIMEOUT_MS = 1000
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]
const ROUTES = [
  { path: '/khoa-hoc', detail: '/khoa-hoc/toan-10-co-ban' },
  { path: '/tuyen-sinh', detail: '/tuyen-sinh/tuyen-sinh-he-2026' },
  { path: '/thanh-tich', detail: '/thanh-tich/nguyen-mai-anh-giai-nhat-toan' },
  { path: '/ky-thi', detail: '/ky-thi/olympic-toan-2026' },
  { path: '/tin-tuc', detail: '/tin-tuc/khai-giang-toan-10-2026' },
  { path: '/album', detail: '/album/ngay-hoi-khai-giang-2026' },
].flatMap(({ path: listPath, detail }) => [listPath, detail])

const SCREENSHOT_DIR = path.join(process.cwd(), '.audit', 'screenshots')
const failures = []
const results = []
expect.configure({ timeout: EXPECT_TIMEOUT_MS })

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

function countGridTracks(value) {
  if (!value || value === 'none') return 0
  let depth = 0
  let tracks = 0
  let inTrack = false

  for (const character of value.trim()) {
    if (character === '(') depth += 1
    if (character === ')') depth = Math.max(0, depth - 1)
    if (/\s/.test(character) && depth === 0) {
      if (inTrack) tracks += 1
      inTrack = false
    } else {
      inTrack = true
    }
  }

  return tracks + Number(inTrack)
}

function expectedGridColumns(route, width) {
  if (route === '/album/ngay-hoi-khai-giang-2026') {
    if (width < 640) return 2
    if (width < 1024) return 3
    return 4
  }

  if (width < 640) return 1
  if (width < 1024) return 2
  return 3
}

async function check(description, action) {
  try {
    await action()
  } catch (error) {
    failures.push({ check: description, error: messageOf(error) })
  }
}

async function auditRoute(browser, route, viewport) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  const entry = {
    route,
    viewport: `${viewport.width}x${viewport.height}`,
    status: null,
    documentWidth: null,
    viewportWidth: viewport.width,
    overflow: null,
    gridColumns: null,
    images: {
      total: 0,
      broken: [],
      missingAlt: [],
      missingSizes: [],
    },
    buttonsBelow44px: [],
    mobileButtonCount: null,
    pageErrors,
  }

  try {
    let response
    await check(`${route} (${entry.viewport}) navigates`, async () => {
      response = await page.goto(new URL(route, BASE_URL).toString(), {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
      expect(response, 'navigation should return a response').not.toBeNull()
      expect(response.status(), 'route should return HTTP 200').toBe(200)
    })
    entry.status = response?.status() ?? null

    await page.locator('body').waitFor({ state: 'attached', timeout: 10_000 }).catch(() => {})
    await page.evaluate(() => {
      for (const image of document.images) image.loading = 'eager'
    }).catch(() => {})
    await page.waitForFunction(
      () => [...document.images].every((image) => image.complete),
      { timeout: 10_000 },
    ).catch(() => {})
    await page.evaluate(() => document.fonts?.ready).catch(() => {})

    const metrics = await page.evaluate(() => {
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      )
      const visible = (element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }
      const grids = [...(document.querySelector('main') || document).querySelectorAll('.grid')]
        .filter(
          (element) =>
            visible(element) &&
            getComputedStyle(element).display === 'grid' &&
            element.children.length > 1,
        )
      const primaryGrid = grids.find((element) => {
        const childTags = [...element.children].map((child) => child.tagName.toLowerCase())
        return childTags.every((tag) => tag === 'article') ||
          (element.closest('section[aria-label]') && childTags.every((tag) => tag === 'button'))
      })
      const images = [...document.images].map((image) => ({
        src: image.currentSrc || image.src,
        naturalWidth: image.naturalWidth,
        alt: image.alt.trim(),
        sizes: image.getAttribute('sizes')?.trim() || '',
      }))
      const buttons = [...document.querySelectorAll('button, [role="button"]')]
        .filter(visible)
        .map((button) => {
          const rect = button.getBoundingClientRect()
          return {
            label:
              button.getAttribute('aria-label') ||
              button.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
              '(unlabeled)',
            height: rect.height,
          }
        })

      return {
        documentWidth,
        viewportWidth: window.innerWidth,
        gridTemplate: primaryGrid ? getComputedStyle(primaryGrid).gridTemplateColumns : null,
        images,
        buttons,
      }
    })

    entry.documentWidth = metrics.documentWidth
    entry.overflow = metrics.documentWidth > metrics.viewportWidth + 2
    entry.gridColumns =
      metrics.gridTemplate === null ? null : countGridTracks(metrics.gridTemplate)
    entry.images = {
      total: metrics.images.length,
      broken: metrics.images.filter((image) => image.naturalWidth <= 0),
      missingAlt: metrics.images.filter((image) => !image.alt),
      missingSizes: metrics.images.filter((image) => !image.sizes),
    }
    if (viewport.width === 375) {
      entry.mobileButtonCount = metrics.buttons.length
      entry.buttonsBelow44px = metrics.buttons.filter((button) => button.height < 44)
    }

    if (entry.overflow) {
      failures.push({
        check: `${route} (${entry.viewport}) horizontal overflow`,
        error: `document width ${entry.documentWidth}px exceeds viewport ${entry.viewportWidth}px by more than 2px`,
      })
    }
    if (
      entry.gridColumns !== null &&
      entry.gridColumns !== expectedGridColumns(route, viewport.width)
    ) {
      failures.push({
        check: `${route} (${entry.viewport}) grid columns`,
        error: `expected ${expectedGridColumns(route, viewport.width)}, got ${entry.gridColumns}`,
      })
    }
    for (const issue of [
      ['broken', entry.images.broken, 'image(s) have naturalWidth <= 0'],
      ['missingAlt', entry.images.missingAlt, 'image(s) have empty alt text'],
      ['missingSizes', entry.images.missingSizes, 'image(s) have no sizes attribute'],
    ]) {
      if (issue[1].length > 0) {
        failures.push({
          check: `${route} (${entry.viewport}) ${issue[2]}`,
          error: issue[1]
            .map((image) => `${image.src.slice(0, 120)} (alt="${image.alt}", sizes="${image.sizes}")`)
            .join('; '),
        })
      }
    }
    if (entry.buttonsBelow44px.length > 0) {
      failures.push({
        check: `${route} (${entry.viewport}) mobile button minimum height`,
        error: entry.buttonsBelow44px
          .map((button) => `${button.label}: rendered height ${button.height}px`)
          .join('; '),
      })
    }
    for (const error of pageErrors) {
      failures.push({ check: `${route} (${entry.viewport}) page error`, error })
    }

    const filename = `${route.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home'}-${entry.viewport}.png`
    await check(`${route} (${entry.viewport}) screenshot`, async () => {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, filename),
        fullPage: true,
        animations: 'disabled',
      })
    })

    if (route === '/album/ngay-hoi-khai-giang-2026' && viewport.width === 375) {
      await auditLightbox(page)
    }
  } finally {
    await context.close()
  }

  results.push(entry)
}

async function auditLightbox(page) {
  const firstCaption = 'Đón học sinh trong ngày khai giảng'
  const secondCaption = 'Phát biểu chào mừng năm học mới'
  const dialog = page.getByRole('dialog')

  await check('album lightbox opens on photo click', async () => {
    await page
      .getByRole('button', { name: firstCaption, exact: true })
      .first()
      .click()
    await expect(dialog).toBeVisible({ timeout: EXPECT_TIMEOUT_MS })
    await expect(dialog.getByText(firstCaption, { exact: true })).toBeVisible({
      timeout: EXPECT_TIMEOUT_MS,
    })
  })
  await check('album lightbox ArrowRight changes caption', async () => {
    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByText(secondCaption, { exact: true })).toBeVisible({
      timeout: EXPECT_TIMEOUT_MS,
    })
  })
  await check('album lightbox closes with Escape', async () => {
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden({ timeout: EXPECT_TIMEOUT_MS })
  })
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (const route of ROUTES) {
      for (const viewport of VIEWPORTS) {
        await auditRoute(browser, route, viewport)
      }
    }
  } finally {
    await browser.close()
  }

  console.log(`UI audit: ${results.length} route/viewport checks, ${failures.length} failure(s).`)
  for (const result of results) {
    const gridSummary = result.gridColumns ?? 'none'
    console.log(
      `${result.route.padEnd(48)} ${result.viewport.padEnd(10)} ` +
        `HTTP ${result.status ?? 'ERR'} overflow=${result.overflow ?? 'n/a'} ` +
        `grid-cols=${gridSummary} images=${result.images.total}` +
        ` broken=${result.images.broken.length} no-alt=${result.images.missingAlt.length}` +
        ` no-sizes=${result.images.missingSizes.length}` +
        (result.mobileButtonCount === null
          ? ''
          : ` mobile-buttons=${result.mobileButtonCount} under44=${result.buttonsBelow44px.length}`),
    )
  }
  const lightboxFailures = failures.filter((failure) => failure.check.startsWith('album lightbox'))
  console.log(`Lightbox click/ArrowRight/Escape: ${lightboxFailures.length === 0 ? 'PASS' : 'FAIL'}`)
  if (failures.length > 0) {
    console.error('\nFailures:')
    for (const failure of failures) {
      console.error(`- ${failure.check}: ${failure.error}`)
    }
    process.exitCode = 1
  }
  console.log(`Screenshots: ${SCREENSHOT_DIR}`)
}

main().catch((error) => {
  console.error('UI audit could not complete:', messageOf(error))
  process.exitCode = 1
})
