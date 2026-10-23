import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  TypeWithID,
} from 'payload'

import { FIELD_LABELS } from '@/lib/fields/labels'
import { revalidateCollection } from '@/lib/revalidate'

type StaffUser = { id: number | string; role: 'admin' | 'editor' }
type ScheduleDocument = TypeWithID & {
  createdBy?: number | string | { id: number | string } | null
}

function isStaffUser(user: unknown): user is StaffUser {
  if (typeof user !== 'object' || user === null || !('role' in user) || !('id' in user)) return false
  return (
    (user.role === 'admin' || user.role === 'editor') &&
    (typeof user.id === 'number' || typeof user.id === 'string')
  )
}

const readSchedules: Access = () => true
const staffAccess: Access = ({ req }) => isStaffUser(req.user)
const deleteSchedules: Access = ({ req }) => {
  if (!isStaffUser(req.user)) return false
  if (req.user.role === 'admin') return true
  return { createdBy: { equals: req.user.id } }
}

const setScheduleCreator: CollectionBeforeChangeHook<ScheduleDocument> = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user) data.createdBy = req.user.id
  else if (operation === 'update' && originalDoc) data.createdBy = originalDoc.createdBy
  return data
}

const revalidateChangedSchedule: CollectionAfterChangeHook<ScheduleDocument> = ({ doc }) => {
  revalidateCollection('schedules', null, null, ['/khoa-hoc/[slug]'])
  return doc
}

const revalidateDeletedSchedule: CollectionAfterDeleteHook<ScheduleDocument> = ({ doc }) => {
  revalidateCollection('schedules', null, null, ['/khoa-hoc/[slug]'])
  return doc
}

const Schedules: CollectionConfig = {
  slug: 'schedules',
  admin: {
    defaultColumns: ['title', 'course', 'startDate', 'location', 'currentStudents', 'maxStudents', 'status'],
    group: FIELD_LABELS.schedules.adminGroup,
    useAsTitle: 'title',
  },
  access: {
    read: readSchedules,
    create: staffAccess,
    update: staffAccess,
    delete: deleteSchedules,
  },
  hooks: {
    beforeChange: [setScheduleCreator],
    afterChange: [revalidateChangedSchedule],
    afterDelete: [revalidateDeletedSchedule],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: FIELD_LABELS.schedules.title,
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      label: FIELD_LABELS.schedules.course,
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      label: FIELD_LABELS.schedules.startDate,
      required: true,
    },
    {
      name: 'scheduleDetails',
      type: 'text',
      label: FIELD_LABELS.schedules.scheduleDetails,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'branches',
      label: FIELD_LABELS.schedules.location,
    },
    {
      name: 'maxStudents',
      type: 'number',
      label: FIELD_LABELS.schedules.maxStudents,
      min: 1,
      defaultValue: 20,
    },
    {
      name: 'currentStudents',
      type: 'number',
      label: FIELD_LABELS.schedules.currentStudents,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'status',
      type: 'select',
      label: FIELD_LABELS.schedules.status,
      required: true,
      options: [
        { label: FIELD_LABELS.schedules.openingSoon, value: 'sap-mo' },
        { label: FIELD_LABELS.schedules.open, value: 'dang-mo' },
        { label: FIELD_LABELS.schedules.full, value: 'da-day' },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: FIELD_LABELS.schedules.createdBy,
      admin: { hidden: true, readOnly: true },
      access: { update: () => false },
    },
  ],
}

export default Schedules
