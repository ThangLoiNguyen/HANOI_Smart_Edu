import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_documents_level" AS ENUM('tieu-hoc', 'thcs');
  CREATE TYPE "public"."enum_documents_category" AS ENUM('gk1', 'ck1', 'gk2', 'ck2', 'on-thi-truong-chon', 'on-thi-chuyen-toan');
  CREATE TYPE "public"."enum_exams_exam_content_correct_index" AS ENUM('0', '1', '2', '3');
  CREATE TYPE "public"."enum_exams_level" AS ENUM('tieu-hoc', 'thcs');
  CREATE TYPE "public"."enum_exams_grade" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9');
  CREATE TYPE "public"."enum_exams_category" AS ENUM('gk1', 'ck1', 'gk2', 'ck2', 'on-thi-truong-chon', 'on-thi-chuyen-toan');
  CREATE TYPE "public"."enum_placement_questions_difficulty" AS ENUM('de', 'trung-binh', 'kho');
  CREATE TYPE "public"."enum_schedules_status" AS ENUM('sap-mo', 'dang-mo', 'da-day');
  CREATE TYPE "public"."enum_transactions_payment_method" AS ENUM('chuyen-khoan', 'vietqr', 'khac');
  CREATE TYPE "public"."enum_transactions_status" AS ENUM('cho-xac-nhan', 'da-thanh-toan', 'tu-choi', 'da-mo-khoa');
  CREATE TABLE "exams_exam_content_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"answer" varchar
  );
  
  CREATE TABLE "exams_exam_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"correct_index" "enum_exams_exam_content_correct_index"
  );
  
  CREATE TABLE "placement_questions_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "placement_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL,
  	"question" varchar NOT NULL,
  	"correct_answer_index" numeric NOT NULL,
  	"hint" varchar,
  	"explanation" varchar,
  	"difficulty" "enum_placement_questions_difficulty" DEFAULT 'de',
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "schedules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"course_id" integer NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"schedule_details" varchar,
  	"location_id" integer,
  	"max_students" numeric DEFAULT 20,
  	"current_students" numeric DEFAULT 0,
  	"status" "enum_schedules_status" NOT NULL,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_name" varchar NOT NULL,
  	"student_phone" varchar NOT NULL,
  	"student_email" varchar,
  	"exam_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"payment_method" "enum_transactions_payment_method" DEFAULT 'chuyen-khoan' NOT NULL,
  	"transfer_note" varchar,
  	"payment_proof_id" integer,
  	"status" "enum_transactions_status" DEFAULT 'cho-xac-nhan' NOT NULL,
  	"verified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "documents" ALTER COLUMN "grade" SET DATA TYPE text;
  DROP TYPE "public"."enum_documents_grade";
  CREATE TYPE "public"."enum_documents_grade" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9');
  ALTER TABLE "documents" ALTER COLUMN "grade" SET DATA TYPE "public"."enum_documents_grade" USING "grade"::"public"."enum_documents_grade";
  ALTER TABLE "submissions" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "documents" ADD COLUMN "level" "enum_documents_level" NOT NULL;
  ALTER TABLE "documents" ADD COLUMN "category" "enum_documents_category" NOT NULL;
  ALTER TABLE "exams" ADD COLUMN "level" "enum_exams_level" NOT NULL;
  ALTER TABLE "exams" ADD COLUMN "grade" "enum_exams_grade" NOT NULL;
  ALTER TABLE "exams" ADD COLUMN "category" "enum_exams_category" NOT NULL;
  ALTER TABLE "exams" ADD COLUMN "is_premium" boolean DEFAULT false;
  ALTER TABLE "exams" ADD COLUMN "price" numeric;
  ALTER TABLE "exams" ADD COLUMN "duration_minutes" numeric DEFAULT 45;
  ALTER TABLE "submissions" ADD COLUMN "schedule_id_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "placement_questions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "schedules_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "transactions_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "bank_info_bank_id" varchar NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "bank_info_account_no" varchar NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "bank_info_account_name" varchar NOT NULL;
  ALTER TABLE "exams_exam_content_answers" ADD CONSTRAINT "exams_exam_content_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exams_exam_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exams_exam_content" ADD CONSTRAINT "exams_exam_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "placement_questions_answers" ADD CONSTRAINT "placement_questions_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."placement_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "placement_questions" ADD CONSTRAINT "placement_questions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedules" ADD CONSTRAINT "schedules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedules" ADD CONSTRAINT "schedules_location_id_branches_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_proof_id_media_id_fk" FOREIGN KEY ("payment_proof_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "exams_exam_content_answers_order_idx" ON "exams_exam_content_answers" USING btree ("_order");
  CREATE INDEX "exams_exam_content_answers_parent_id_idx" ON "exams_exam_content_answers" USING btree ("_parent_id");
  CREATE INDEX "exams_exam_content_order_idx" ON "exams_exam_content" USING btree ("_order");
  CREATE INDEX "exams_exam_content_parent_id_idx" ON "exams_exam_content" USING btree ("_parent_id");
  CREATE INDEX "placement_questions_answers_order_idx" ON "placement_questions_answers" USING btree ("_order");
  CREATE INDEX "placement_questions_answers_parent_id_idx" ON "placement_questions_answers" USING btree ("_parent_id");
  CREATE INDEX "placement_questions_created_by_idx" ON "placement_questions" USING btree ("created_by_id");
  CREATE INDEX "placement_questions_updated_at_idx" ON "placement_questions" USING btree ("updated_at");
  CREATE INDEX "placement_questions_created_at_idx" ON "placement_questions" USING btree ("created_at");
  CREATE INDEX "schedules_course_idx" ON "schedules" USING btree ("course_id");
  CREATE INDEX "schedules_location_idx" ON "schedules" USING btree ("location_id");
  CREATE INDEX "schedules_created_by_idx" ON "schedules" USING btree ("created_by_id");
  CREATE INDEX "schedules_updated_at_idx" ON "schedules" USING btree ("updated_at");
  CREATE INDEX "schedules_created_at_idx" ON "schedules" USING btree ("created_at");
  CREATE INDEX "transactions_exam_idx" ON "transactions" USING btree ("exam_id");
  CREATE INDEX "transactions_payment_proof_idx" ON "transactions" USING btree ("payment_proof_id");
  CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
  CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_schedule_id_id_schedules_id_fk" FOREIGN KEY ("schedule_id_id") REFERENCES "public"."schedules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_placement_questions_fk" FOREIGN KEY ("placement_questions_id") REFERENCES "public"."placement_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_schedules_fk" FOREIGN KEY ("schedules_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "submissions_schedule_id_idx" ON "submissions" USING btree ("schedule_id_id");
  CREATE INDEX "payload_locked_documents_rels_placement_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("placement_questions_id");
  CREATE INDEX "payload_locked_documents_rels_schedules_id_idx" ON "payload_locked_documents_rels" USING btree ("schedules_id");
  CREATE INDEX "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "exams_exam_content_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exams_exam_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "placement_questions_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "placement_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "schedules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "exams_exam_content_answers" CASCADE;
  DROP TABLE "exams_exam_content" CASCADE;
  DROP TABLE "placement_questions_answers" CASCADE;
  DROP TABLE "placement_questions" CASCADE;
  DROP TABLE "schedules" CASCADE;
  DROP TABLE "transactions" CASCADE;
  ALTER TABLE "submissions" DROP CONSTRAINT "submissions_schedule_id_id_schedules_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_placement_questions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_schedules_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_transactions_fk";
  
  ALTER TABLE "documents" ALTER COLUMN "grade" SET DATA TYPE text;
  DROP TYPE "public"."enum_documents_grade";
  CREATE TYPE "public"."enum_documents_grade" AS ENUM('lop-10', 'lop-11', 'lop-12');
  ALTER TABLE "documents" ALTER COLUMN "grade" SET DATA TYPE "public"."enum_documents_grade" USING "grade"::"public"."enum_documents_grade";
  DROP INDEX "submissions_schedule_id_idx";
  DROP INDEX "payload_locked_documents_rels_placement_questions_id_idx";
  DROP INDEX "payload_locked_documents_rels_schedules_id_idx";
  DROP INDEX "payload_locked_documents_rels_transactions_id_idx";
  ALTER TABLE "submissions" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "documents" DROP COLUMN "level";
  ALTER TABLE "documents" DROP COLUMN "category";
  ALTER TABLE "exams" DROP COLUMN "level";
  ALTER TABLE "exams" DROP COLUMN "grade";
  ALTER TABLE "exams" DROP COLUMN "category";
  ALTER TABLE "exams" DROP COLUMN "is_premium";
  ALTER TABLE "exams" DROP COLUMN "price";
  ALTER TABLE "exams" DROP COLUMN "duration_minutes";
  ALTER TABLE "submissions" DROP COLUMN "schedule_id_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "placement_questions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "schedules_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "transactions_id";
  ALTER TABLE "site_settings" DROP COLUMN "bank_info_bank_id";
  ALTER TABLE "site_settings" DROP COLUMN "bank_info_account_no";
  ALTER TABLE "site_settings" DROP COLUMN "bank_info_account_name";
  DROP TYPE "public"."enum_documents_level";
  DROP TYPE "public"."enum_documents_category";
  DROP TYPE "public"."enum_exams_exam_content_correct_index";
  DROP TYPE "public"."enum_exams_level";
  DROP TYPE "public"."enum_exams_grade";
  DROP TYPE "public"."enum_exams_category";
  DROP TYPE "public"."enum_placement_questions_difficulty";
  DROP TYPE "public"."enum_schedules_status";
  DROP TYPE "public"."enum_transactions_payment_method";
  DROP TYPE "public"."enum_transactions_status";`)
}
