import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import Admissions from '@/collections/admissions'
import Achievements from '@/collections/achievements'
import Albums from '@/collections/albums'
import Branches from '@/collections/branches'
import Categories from '@/collections/categories'
import Courses from '@/collections/courses'
import Documents from '@/collections/documents'
import Exams from '@/collections/exams'
import Media from '@/collections/media'
import Pages from '@/collections/pages'
import Posts from '@/collections/Posts'
import Submissions from '@/collections/submissions'
import Users from '@/collections/users'
import Homepage from '@/globals/homepage'
import Navigation from '@/globals/navigation'
import SiteSettings from '@/globals/siteSettings'

const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()

if (!blobToken) {
  throw new Error('Thiếu BLOB_READ_WRITE_TOKEN. Set trong .env hoặc .env.local.')
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Posts,
    Categories,
    Documents,
    Courses,
    Exams,
    Branches,
    Admissions,
    Achievements,
    Albums,
    Pages,
    Submissions,
  ],
  editor: lexicalEditor(),
  globals: [SiteSettings, Navigation, Homepage],
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
  }),
  // Payload's SharpDependency resolves sharp 0.34.5 while the direct dependency is 0.35.5.
  sharp: sharp as unknown as NonNullable<Parameters<typeof buildConfig>[0]['sharp']>,
  plugins: [
    // TODO: Replace with the S3 storage adapter if Cloudflare R2 is selected.
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: blobToken,
    }),
  ],
})
