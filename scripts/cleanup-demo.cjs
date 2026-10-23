#!/usr/bin/env node

const { createRequire } = require('node:module')
const path = require('node:path')

const rootRequire = createRequire(path.join(__dirname, '..', 'package.json'))
rootRequire('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { Client } = rootRequire('pg')

const args = process.argv.slice(2)
const allowedArgs = new Set(['--dry-run', '--all', '--force'])
const unknownArgs = args.filter((arg) => !allowedArgs.has(arg))

if (unknownArgs.length) {
  console.error(`Unknown argument: ${unknownArgs.join(', ')}`)
  process.exit(1)
}

const isDryRun = args.includes('--dry-run')
const includeMedia = args.includes('--all')
const force = args.includes('--force')

if (process.env.NODE_ENV === 'production' && !force) {
  console.error('Từ chối chạy trên production. Thêm --force nếu chắc chắn.')
  process.exit(1)
}

const contentTables = [
  'submissions',
  'posts',
  'courses',
  'exams',
  'admissions',
  'achievements',
  'albums',
  'pages',
  'branches',
  'documents',
  'categories',
]
const tables = includeMedia ? [...contentTables, 'media'] : contentTables

async function getCount(client, table) {
  const result = await client.query(`SELECT count(*)::int AS count FROM "${table}"`)
  return result.rows[0].count
}

async function cleanTable(client, table) {
  if (isDryRun) {
    const count = await getCount(client, table)
    console.log(`${table}: trước=${count}, sau=${count} (dry-run, không xóa)`)
    return { before: count, after: count }
  }

  await client.query('BEGIN')
  try {
    const before = await getCount(client, table)
    await client.query(`DELETE FROM "${table}"`)
    const after = await getCount(client, table)
    await client.query('COMMIT')
    console.log(`${table}: trước=${before}, sau=${after}`)
    return { before, after }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function main() {
  if (!process.env.DATABASE_URI_UNPOOLED) {
    throw new Error('DATABASE_URI_UNPOOLED is required for cleanup.')
  }

  const client = new Client({ connectionString: process.env.DATABASE_URI_UNPOOLED })
  try {
    await client.connect()
    console.log(
      isDryRun
        ? 'Dry-run: thống kê dữ liệu demo, không xóa.'
        : 'Đang xóa dữ liệu demo qua SQL trực tiếp (không chạy hook revalidate).',
    )
    if (!isDryRun) {
      console.log('Sau khi xóa, hãy restart dev hoặc xóa .next để làm mới cache.')
    }

    const summary = []
    for (const table of tables) {
      summary.push({ table, ...(await cleanTable(client, table)) })
    }

    const removed = summary.reduce((total, row) => total + row.before - row.after, 0)
    console.log(
      `${isDryRun ? 'Dry-run hoàn tất' : 'Cleanup hoàn tất'}: ${summary.length} bảng, ${removed} bản ghi đã xóa.`,
    )
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(
    'Cleanup thất bại:',
    error instanceof Error ? error.message : 'Unknown cleanup error',
  )
  process.exitCode = 1
})
