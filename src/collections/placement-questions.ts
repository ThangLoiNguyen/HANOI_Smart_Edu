import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  TypeWithID,
} from 'payload'
import { ValidationError } from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'

type StaffRole = 'admin' | 'editor'
type StaffUser = { id: number | string; role: StaffRole }
type PlacementQuestionDocument = TypeWithID & {
  answers?: { answer?: string | null }[] | null
  correctAnswerIndex?: number | null
  createdBy?: number | string | { id: number | string } | null
}

function isStaffUser(user: unknown): user is StaffUser {
  if (typeof user !== 'object' || user === null || !('role' in user) || !('id' in user)) return false
  return (
    (user.role === 'admin' || user.role === 'editor') &&
    (typeof user.id === 'number' || typeof user.id === 'string')
  )
}

const staffAccess: Access = ({ req }) => isStaffUser(req.user)
const readQuestions: Access = ({ req }) => isStaffUser(req.user)
const deleteQuestions: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setQuestionCreator: CollectionBeforeChangeHook<PlacementQuestionDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const validateCorrectAnswerIndex: CollectionBeforeValidateHook<PlacementQuestionDocument> = ({
  data,
  originalDoc,
  req,
}) => {
  const answers = data?.answers ?? originalDoc?.answers
  const correctAnswerIndex = data?.correctAnswerIndex ?? originalDoc?.correctAnswerIndex
  if (
    answers &&
    correctAnswerIndex != null &&
    (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= answers.length)
  ) {
    throw new ValidationError({
      collection: 'placement-questions',
      errors: [{ path: 'correctAnswerIndex', message: FIELD_LABELS.placementQuestions.invalidAnswerIndex }],
      req,
    })
  }
  return data
}

const PlacementQuestions: CollectionConfig = {
  slug: 'placement-questions',
  admin: {
    defaultColumns: ['topic', 'difficulty', 'updatedAt'],
    group: FIELD_LABELS.placementQuestions.adminGroup,
    useAsTitle: 'topic',
  },
  access: {
    read: readQuestions,
    create: staffAccess,
    update: staffAccess,
    delete: deleteQuestions,
  },
  hooks: {
    beforeValidate: [validateCorrectAnswerIndex],
    beforeChange: [setQuestionCreator],
  },
  fields: [
    {
      name: 'topic',
      type: 'text',
      label: FIELD_LABELS.placementQuestions.topic,
      required: true,
    },
    {
      name: 'question',
      type: 'textarea',
      label: FIELD_LABELS.placementQuestions.question,
      required: true,
    },
    {
      name: 'answers',
      type: 'array',
      label: FIELD_LABELS.placementQuestions.answers,
      minRows: 2,
      maxRows: 4,
      required: true,
      fields: [
        {
          name: 'answer',
          type: 'text',
          label: FIELD_LABELS.placementQuestions.answer,
          required: true,
        },
      ],
    },
    {
      name: 'correctAnswerIndex',
      type: 'number',
      label: FIELD_LABELS.placementQuestions.correctAnswerIndex,
      min: 0,
      max: 3,
      required: true,
    },
    {
      name: 'hint',
      type: 'text',
      label: FIELD_LABELS.placementQuestions.hint,
    },
    {
      name: 'explanation',
      type: 'textarea',
      label: FIELD_LABELS.placementQuestions.explanation,
    },
    {
      name: 'difficulty',
      type: 'select',
      label: FIELD_LABELS.placementQuestions.difficulty,
      defaultValue: 'de',
      options: [
        { label: FIELD_LABELS.placementQuestions.easy, value: 'de' },
        { label: FIELD_LABELS.placementQuestions.medium, value: 'trung-binh' },
        { label: FIELD_LABELS.placementQuestions.hard, value: 'kho' },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: FIELD_LABELS.placementQuestions.createdBy,
      admin: { hidden: true, readOnly: true },
      access: { update: () => false },
    },
  ],
}

export default PlacementQuestions
