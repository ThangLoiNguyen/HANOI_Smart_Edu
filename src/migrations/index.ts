import * as migration_20261022_190031 from './20261022_190031';
import * as migration_20261023_065512_exam_question_timing from './20261023_065512_exam_question_timing';

export const migrations = [
  {
    up: migration_20261022_190031.up,
    down: migration_20261022_190031.down,
    name: '20261022_190031',
  },
  {
    up: migration_20261023_065512_exam_question_timing.up,
    down: migration_20261023_065512_exam_question_timing.down,
    name: '20261023_065512_exam_question_timing'
  },
];
