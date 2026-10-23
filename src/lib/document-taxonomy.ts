import { DOCUMENTS_LABELS } from '@/lib/labels'

export const DOCUMENT_BASE_CATEGORIES = ['gk1', 'ck1', 'gk2', 'ck2'] as const
export const DOCUMENT_SPECIAL_CATEGORIES = ['on-thi-truong-chon', 'on-thi-chuyen-toan'] as const
export const DOCUMENT_CATEGORY_VALUES = [
  ...DOCUMENT_BASE_CATEGORIES,
  ...DOCUMENT_SPECIAL_CATEGORIES,
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORY_VALUES)[number]
export type DocumentLevel = 'tieu-hoc' | 'thcs'
export type DocumentGrade = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export const DOCUMENT_LEVELS = [
  {
    value: 'tieu-hoc',
    label: DOCUMENTS_LABELS.levels['tieu-hoc'],
    grades: ['1', '2', '3', '4', '5'] as const,
  },
  {
    value: 'thcs',
    label: DOCUMENTS_LABELS.levels.thcs,
    grades: ['6', '7', '8', '9'] as const,
  },
] as const

export const DOCUMENT_GRADE_OPTIONS: { label: string; value: DocumentGrade }[] =
  DOCUMENT_LEVELS.flatMap((level) =>
    level.grades.map((grade) => ({ label: DOCUMENTS_LABELS.grades[grade], value: grade })),
  )

export const DOCUMENT_CATEGORY_OPTIONS: { label: string; value: DocumentCategory }[] = [
  { label: DOCUMENTS_LABELS.taxonomyCategories.gk1, value: 'gk1' },
  { label: DOCUMENTS_LABELS.taxonomyCategories.ck1, value: 'ck1' },
  { label: DOCUMENTS_LABELS.taxonomyCategories.gk2, value: 'gk2' },
  { label: DOCUMENTS_LABELS.taxonomyCategories.ck2, value: 'ck2' },
  {
    label: DOCUMENTS_LABELS.taxonomyCategories['on-thi-truong-chon'],
    value: 'on-thi-truong-chon',
  },
  {
    label: DOCUMENTS_LABELS.taxonomyCategories['on-thi-chuyen-toan'],
    value: 'on-thi-chuyen-toan',
  },
]

export function getDocumentCategories(level: unknown, grade: unknown): DocumentCategory[] {
  if (!getDocumentGradeValues(level).includes(grade as DocumentGrade)) return []

  const categories: DocumentCategory[] = [...DOCUMENT_BASE_CATEGORIES]
  if (level === 'tieu-hoc' && grade === '5') categories.push('on-thi-truong-chon')
  if (level === 'thcs' && grade === '9') categories.push('on-thi-chuyen-toan')
  return categories
}

export function isValidDocumentCategory(
  level: unknown,
  grade: unknown,
  category: unknown,
): category is DocumentCategory {
  return (
    getDocumentGradeValues(level).includes(grade as DocumentGrade) &&
    getDocumentCategories(level, grade).includes(category as DocumentCategory)
  )
}

export function getDocumentGradeValues(level: unknown): DocumentGrade[] {
  const levelConfig = DOCUMENT_LEVELS.find((entry) => entry.value === level)
  return levelConfig ? [...levelConfig.grades] : []
}

export function getDocumentTaxonomySiblingData(siblingData: unknown) {
  if (typeof siblingData !== 'object' || siblingData === null) {
    return { level: undefined, grade: undefined }
  }

  const data = siblingData as Record<string, unknown>
  return { level: data.level, grade: data.grade }
}

export function getDocumentTaxonomyParams() {
  return DOCUMENT_LEVELS.flatMap((level) =>
    level.grades.flatMap((grade) =>
      getDocumentCategories(level.value, grade).map((category) => ({
        level: level.value,
        grade,
        category,
      })),
    ),
  )
}

export function getDocumentTaxonomyPath(
  level: DocumentLevel,
  grade: DocumentGrade,
  category: DocumentCategory,
) {
  return `/tai-lieu/${level}/${grade}/${category}`
}
