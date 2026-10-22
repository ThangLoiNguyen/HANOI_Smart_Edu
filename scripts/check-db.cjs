const { createRequire } = require('node:module')
const path = require('node:path')

const rootRequire = createRequire(path.join(__dirname, '..', 'package.json'))
rootRequire('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { Client } = rootRequire('pg')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI_UNPOOLED })

  try {
    await client.connect()

    const tables = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'payload_%' ORDER BY tablename",
    )
    console.log('=== TABLES ===')
    console.log(tables.rows.map((row) => row.tablename).join('\n'))

    const users = await client.query('SELECT id, email, role FROM users ORDER BY id')
    console.log('\n=== USERS ===')
    console.log(JSON.stringify(users.rows, null, 2))

    const migrations = await client.query('SELECT * FROM payload_migrations')
    console.log('\n=== MIGRATIONS ===')
    console.log(JSON.stringify(migrations.rows, null, 2))

    const tableCount = await client.query(
      "SELECT count(*)::int AS count FROM pg_tables WHERE schemaname = 'public'",
    )
    console.log('\n=== PUBLIC TABLE COUNT ===')
    console.log(tableCount.rows[0].count)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  const connectionString = process.env.DATABASE_URI_UNPOOLED
  const message =
    error instanceof Error ? error.message : 'Unknown database check error'
  console.error('ERROR:', connectionString ? message.replace(connectionString, '[redacted]') : message)
  process.exitCode = 1
})
