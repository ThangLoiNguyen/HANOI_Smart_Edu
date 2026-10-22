import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_type" AS ENUM('tin-tuc', 'su-kien', 'bao-chi');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_documents_type" AS ENUM('tai-lieu', 'de-thi', 'dap-an');
  CREATE TYPE "public"."enum_documents_grade" AS ENUM('lop-10', 'lop-11', 'lop-12');
  CREATE TYPE "public"."enum_documents_subject" AS ENUM('toan', 'ngu-van', 'tieng-anh');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_courses_grade" AS ENUM('lop-10', 'lop-11', 'lop-12');
  CREATE TYPE "public"."enum_courses_subject" AS ENUM('toan', 'ngu-van', 'tieng-anh');
  CREATE TYPE "public"."enum_exams_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_exams_exam_status" AS ENUM('sap-dien-ra', 'dang-dien-ra', 'da-ket-thuc');
  CREATE TYPE "public"."enum_branches_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_admissions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_admissions_admission_status" AS ENUM('dang-mo', 'da-dong');
  CREATE TYPE "public"."enum_achievements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_achievements_award_level" AS ENUM('nhat', 'nhi', 'ba', 'khuyen-khich', 'giai-khac');
  CREATE TYPE "public"."enum_albums_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_submissions_process_status" AS ENUM('moi', 'da-lien-he', 'da-tu-van', 'dong');
  CREATE TYPE "public"."enum_navigation_main_menu_children_type" AS ENUM('page', 'collection', 'external');
  CREATE TYPE "public"."enum_navigation_main_menu_children_collection" AS ENUM('posts', 'courses', 'admissions', 'achievements', 'documents', 'exams', 'albums', 'branches');
  CREATE TYPE "public"."enum_navigation_main_menu_type" AS ENUM('page', 'collection', 'external');
  CREATE TYPE "public"."enum_navigation_main_menu_collection" AS ENUM('posts', 'courses', 'admissions', 'achievements', 'documents', 'exams', 'albums', 'branches');
  CREATE TYPE "public"."enum_navigation_footer_menu_type" AS ENUM('page', 'collection', 'external');
  CREATE TYPE "public"."enum_navigation_footer_menu_collection" AS ENUM('posts', 'courses', 'admissions', 'achievements', 'documents', 'exams', 'albums', 'branches');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_posts_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"content" jsonb,
  	"excerpt" varchar,
  	"type" "enum_posts_type" NOT NULL,
  	"source" varchar,
  	"source_url" varchar,
  	"featured" boolean DEFAULT false,
  	"featured_image_id" integer,
  	"created_by_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_documents_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"type" "enum_documents_type" NOT NULL,
  	"grade" "enum_documents_grade" NOT NULL,
  	"subject" "enum_documents_subject" NOT NULL,
  	"year" numeric NOT NULL,
  	"featured_image_id" integer,
  	"created_by_id" integer,
  	"file_id" integer,
  	"external_link" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_courses_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"grade" "enum_courses_grade" NOT NULL,
  	"subject" "enum_courses_subject" NOT NULL,
  	"description" varchar,
  	"roadmap" jsonb,
  	"content" jsonb,
  	"created_by_id" integer,
  	"audience" varchar,
  	"duration" varchar,
  	"schedule" varchar,
  	"tuition" numeric,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"branches_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "exams_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"datetime" timestamp(3) with time zone NOT NULL,
  	"location" varchar
  );
  
  CREATE TABLE "exams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_exams_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"year" numeric NOT NULL,
  	"audience" varchar,
  	"rules" jsonb,
  	"exam_status" "enum_exams_exam_status" DEFAULT 'sap-dien-ra' NOT NULL,
  	"created_by_id" integer,
  	"location" varchar,
  	"results_file_id" integer,
  	"results_description" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "exams_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer
  );
  
  CREATE TABLE "branches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_branches_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"order" numeric DEFAULT 0,
  	"created_by_id" integer,
  	"address" varchar NOT NULL,
  	"phone" varchar,
  	"working_hours" varchar,
  	"google_maps_url" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "admissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_admissions_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"content" jsonb,
  	"created_by_id" integer,
  	"deadline" timestamp(3) with time zone NOT NULL,
  	"admission_status" "enum_admissions_admission_status" DEFAULT 'dang-mo' NOT NULL,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "admissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "achievements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_achievements_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"student_name" varchar NOT NULL,
  	"school" varchar,
  	"class_name" varchar,
  	"created_by_id" integer,
  	"award" varchar NOT NULL,
  	"exam_name" varchar NOT NULL,
  	"year" numeric NOT NULL,
  	"award_level" "enum_achievements_award_level" NOT NULL,
  	"note" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "achievements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "albums_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_albums_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"cover_id" integer,
  	"taken_at" timestamp(3) with time zone,
  	"created_by_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "albums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "pages_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_stats_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_block_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"photo_id" integer,
  	"bio" varchar
  );
  
  CREATE TABLE "pages_blocks_team_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"button_label" varchar,
  	"button_link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"featured_image_id" integer,
  	"created_by_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_share_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"message" varchar,
  	"interested_course_id" integer,
  	"branch_id" integer,
  	"process_status" "enum_submissions_process_status" DEFAULT 'moi',
  	"website" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"documents_id" integer,
  	"courses_id" integer,
  	"exams_id" integer,
  	"branches_id" integer,
  	"admissions_id" integer,
  	"achievements_id" integer,
  	"albums_id" integer,
  	"pages_id" integer,
  	"submissions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"hotline" varchar,
  	"email" varchar,
  	"zalo_url" varchar,
  	"facebook_url" varchar,
  	"youtube_url" varchar,
  	"working_hours" varchar,
  	"google_analytics_id" varchar,
  	"default_seo_meta_title" varchar,
  	"default_seo_meta_description" varchar,
  	"default_seo_share_image_id" integer,
  	"footer_content" jsonb,
  	"notification_popup_enabled" boolean,
  	"notification_popup_image_id" integer,
  	"notification_popup_link" varchar,
  	"notification_popup_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_main_menu_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_main_menu_children_type" NOT NULL,
  	"page_id" integer,
  	"collection" "enum_navigation_main_menu_children_collection",
  	"url" varchar
  );
  
  CREATE TABLE "navigation_main_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_main_menu_type" NOT NULL,
  	"page_id" integer,
  	"collection" "enum_navigation_main_menu_collection",
  	"url" varchar
  );
  
  CREATE TABLE "navigation_footer_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_footer_menu_type" NOT NULL,
  	"page_id" integer,
  	"collection" "enum_navigation_footer_menu_collection",
  	"url" varchar
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "homepage_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_block_heading" varchar,
  	"cta_block_description" varchar,
  	"cta_block_button_label" varchar,
  	"cta_block_button_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"posts_id" integer,
  	"achievements_id" integer
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_branches_fk" FOREIGN KEY ("branches_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exams_schedule" ADD CONSTRAINT "exams_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exams" ADD CONSTRAINT "exams_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exams" ADD CONSTRAINT "exams_results_file_id_media_id_fk" FOREIGN KEY ("results_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exams" ADD CONSTRAINT "exams_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exams_rels" ADD CONSTRAINT "exams_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exams_rels" ADD CONSTRAINT "exams_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "branches" ADD CONSTRAINT "branches_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "branches" ADD CONSTRAINT "branches_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admissions" ADD CONSTRAINT "admissions_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admissions" ADD CONSTRAINT "admissions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admissions" ADD CONSTRAINT "admissions_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admissions_rels" ADD CONSTRAINT "admissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admissions_rels" ADD CONSTRAINT "admissions_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admissions_rels" ADD CONSTRAINT "admissions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "achievements" ADD CONSTRAINT "achievements_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "achievements" ADD CONSTRAINT "achievements_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "achievements" ADD CONSTRAINT "achievements_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "achievements_rels" ADD CONSTRAINT "achievements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "achievements_rels" ADD CONSTRAINT "achievements_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_photos" ADD CONSTRAINT "albums_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_photos" ADD CONSTRAINT "albums_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_block" ADD CONSTRAINT "pages_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_block" ADD CONSTRAINT "pages_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_block" ADD CONSTRAINT "pages_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_block_items" ADD CONSTRAINT "pages_blocks_stats_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_block" ADD CONSTRAINT "pages_blocks_stats_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_block_members" ADD CONSTRAINT "pages_blocks_team_block_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_block_members" ADD CONSTRAINT "pages_blocks_team_block_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_block" ADD CONSTRAINT "pages_blocks_team_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_share_image_id_media_id_fk" FOREIGN KEY ("seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_interested_course_id_courses_id_fk" FOREIGN KEY ("interested_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exams_fk" FOREIGN KEY ("exams_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_branches_fk" FOREIGN KEY ("branches_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admissions_fk" FOREIGN KEY ("admissions_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_achievements_fk" FOREIGN KEY ("achievements_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_seo_share_image_id_media_id_fk" FOREIGN KEY ("default_seo_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_notification_popup_image_id_media_id_fk" FOREIGN KEY ("notification_popup_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_children" ADD CONSTRAINT "navigation_main_menu_children_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_children" ADD CONSTRAINT "navigation_main_menu_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu" ADD CONSTRAINT "navigation_main_menu_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_main_menu" ADD CONSTRAINT "navigation_main_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_menu" ADD CONSTRAINT "navigation_footer_menu_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_menu" ADD CONSTRAINT "navigation_footer_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_banners" ADD CONSTRAINT "homepage_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_banners" ADD CONSTRAINT "homepage_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_stats" ADD CONSTRAINT "homepage_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_achievements_fk" FOREIGN KEY ("achievements_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_created_by_idx" ON "posts" USING btree ("created_by_id");
  CREATE INDEX "posts_seo_seo_share_image_idx" ON "posts" USING btree ("seo_share_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_slug_idx" ON "documents" USING btree ("slug");
  CREATE INDEX "documents_featured_image_idx" ON "documents" USING btree ("featured_image_id");
  CREATE INDEX "documents_created_by_idx" ON "documents" USING btree ("created_by_id");
  CREATE INDEX "documents_file_idx" ON "documents" USING btree ("file_id");
  CREATE INDEX "documents_seo_seo_share_image_idx" ON "documents" USING btree ("seo_share_image_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE INDEX "documents_rels_order_idx" ON "documents_rels" USING btree ("order");
  CREATE INDEX "documents_rels_parent_idx" ON "documents_rels" USING btree ("parent_id");
  CREATE INDEX "documents_rels_path_idx" ON "documents_rels" USING btree ("path");
  CREATE INDEX "documents_rels_categories_id_idx" ON "documents_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_featured_image_idx" ON "courses" USING btree ("featured_image_id");
  CREATE INDEX "courses_created_by_idx" ON "courses" USING btree ("created_by_id");
  CREATE INDEX "courses_seo_seo_share_image_idx" ON "courses" USING btree ("seo_share_image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_branches_id_idx" ON "courses_rels" USING btree ("branches_id");
  CREATE INDEX "courses_rels_documents_id_idx" ON "courses_rels" USING btree ("documents_id");
  CREATE INDEX "exams_schedule_order_idx" ON "exams_schedule" USING btree ("_order");
  CREATE INDEX "exams_schedule_parent_id_idx" ON "exams_schedule" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "exams_slug_idx" ON "exams" USING btree ("slug");
  CREATE INDEX "exams_featured_image_idx" ON "exams" USING btree ("featured_image_id");
  CREATE INDEX "exams_created_by_idx" ON "exams" USING btree ("created_by_id");
  CREATE INDEX "exams_results_results_file_idx" ON "exams" USING btree ("results_file_id");
  CREATE INDEX "exams_seo_seo_share_image_idx" ON "exams" USING btree ("seo_share_image_id");
  CREATE INDEX "exams_updated_at_idx" ON "exams" USING btree ("updated_at");
  CREATE INDEX "exams_created_at_idx" ON "exams" USING btree ("created_at");
  CREATE INDEX "exams_rels_order_idx" ON "exams_rels" USING btree ("order");
  CREATE INDEX "exams_rels_parent_idx" ON "exams_rels" USING btree ("parent_id");
  CREATE INDEX "exams_rels_path_idx" ON "exams_rels" USING btree ("path");
  CREATE INDEX "exams_rels_documents_id_idx" ON "exams_rels" USING btree ("documents_id");
  CREATE UNIQUE INDEX "branches_slug_idx" ON "branches" USING btree ("slug");
  CREATE INDEX "branches_featured_image_idx" ON "branches" USING btree ("featured_image_id");
  CREATE INDEX "branches_created_by_idx" ON "branches" USING btree ("created_by_id");
  CREATE INDEX "branches_seo_seo_share_image_idx" ON "branches" USING btree ("seo_share_image_id");
  CREATE INDEX "branches_updated_at_idx" ON "branches" USING btree ("updated_at");
  CREATE INDEX "branches_created_at_idx" ON "branches" USING btree ("created_at");
  CREATE UNIQUE INDEX "admissions_slug_idx" ON "admissions" USING btree ("slug");
  CREATE INDEX "admissions_featured_image_idx" ON "admissions" USING btree ("featured_image_id");
  CREATE INDEX "admissions_created_by_idx" ON "admissions" USING btree ("created_by_id");
  CREATE INDEX "admissions_seo_seo_share_image_idx" ON "admissions" USING btree ("seo_share_image_id");
  CREATE INDEX "admissions_updated_at_idx" ON "admissions" USING btree ("updated_at");
  CREATE INDEX "admissions_created_at_idx" ON "admissions" USING btree ("created_at");
  CREATE INDEX "admissions_rels_order_idx" ON "admissions_rels" USING btree ("order");
  CREATE INDEX "admissions_rels_parent_idx" ON "admissions_rels" USING btree ("parent_id");
  CREATE INDEX "admissions_rels_path_idx" ON "admissions_rels" USING btree ("path");
  CREATE INDEX "admissions_rels_courses_id_idx" ON "admissions_rels" USING btree ("courses_id");
  CREATE INDEX "admissions_rels_media_id_idx" ON "admissions_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "achievements_slug_idx" ON "achievements" USING btree ("slug");
  CREATE INDEX "achievements_featured_image_idx" ON "achievements" USING btree ("featured_image_id");
  CREATE INDEX "achievements_created_by_idx" ON "achievements" USING btree ("created_by_id");
  CREATE INDEX "achievements_seo_seo_share_image_idx" ON "achievements" USING btree ("seo_share_image_id");
  CREATE INDEX "achievements_updated_at_idx" ON "achievements" USING btree ("updated_at");
  CREATE INDEX "achievements_created_at_idx" ON "achievements" USING btree ("created_at");
  CREATE INDEX "achievements_rels_order_idx" ON "achievements_rels" USING btree ("order");
  CREATE INDEX "achievements_rels_parent_idx" ON "achievements_rels" USING btree ("parent_id");
  CREATE INDEX "achievements_rels_path_idx" ON "achievements_rels" USING btree ("path");
  CREATE INDEX "achievements_rels_categories_id_idx" ON "achievements_rels" USING btree ("categories_id");
  CREATE INDEX "albums_photos_order_idx" ON "albums_photos" USING btree ("_order");
  CREATE INDEX "albums_photos_parent_id_idx" ON "albums_photos" USING btree ("_parent_id");
  CREATE INDEX "albums_photos_image_idx" ON "albums_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "albums_slug_idx" ON "albums" USING btree ("slug");
  CREATE INDEX "albums_cover_idx" ON "albums" USING btree ("cover_id");
  CREATE INDEX "albums_created_by_idx" ON "albums" USING btree ("created_by_id");
  CREATE INDEX "albums_seo_seo_share_image_idx" ON "albums" USING btree ("seo_share_image_id");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums_rels_order_idx" ON "albums_rels" USING btree ("order");
  CREATE INDEX "albums_rels_parent_idx" ON "albums_rels" USING btree ("parent_id");
  CREATE INDEX "albums_rels_path_idx" ON "albums_rels" USING btree ("path");
  CREATE INDEX "albums_rels_posts_id_idx" ON "albums_rels" USING btree ("posts_id");
  CREATE INDEX "pages_blocks_text_block_order_idx" ON "pages_blocks_text_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_block_parent_id_idx" ON "pages_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_block_path_idx" ON "pages_blocks_text_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_block_order_idx" ON "pages_blocks_image_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_block_parent_id_idx" ON "pages_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_block_path_idx" ON "pages_blocks_image_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_block_image_idx" ON "pages_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "pages_blocks_stats_block_items_order_idx" ON "pages_blocks_stats_block_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_block_items_parent_id_idx" ON "pages_blocks_stats_block_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_block_order_idx" ON "pages_blocks_stats_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_block_parent_id_idx" ON "pages_blocks_stats_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_block_path_idx" ON "pages_blocks_stats_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_block_members_order_idx" ON "pages_blocks_team_block_members" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_block_members_parent_id_idx" ON "pages_blocks_team_block_members" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_block_members_photo_idx" ON "pages_blocks_team_block_members" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_team_block_order_idx" ON "pages_blocks_team_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_block_parent_id_idx" ON "pages_blocks_team_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_block_path_idx" ON "pages_blocks_team_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_block_order_idx" ON "pages_blocks_cta_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_block_parent_id_idx" ON "pages_blocks_cta_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_block_path_idx" ON "pages_blocks_cta_block" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_featured_image_idx" ON "pages" USING btree ("featured_image_id");
  CREATE INDEX "pages_created_by_idx" ON "pages" USING btree ("created_by_id");
  CREATE INDEX "pages_seo_seo_share_image_idx" ON "pages" USING btree ("seo_share_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "submissions_interested_course_idx" ON "submissions" USING btree ("interested_course_id");
  CREATE INDEX "submissions_branch_idx" ON "submissions" USING btree ("branch_id");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_exams_id_idx" ON "payload_locked_documents_rels" USING btree ("exams_id");
  CREATE INDEX "payload_locked_documents_rels_branches_id_idx" ON "payload_locked_documents_rels" USING btree ("branches_id");
  CREATE INDEX "payload_locked_documents_rels_admissions_id_idx" ON "payload_locked_documents_rels" USING btree ("admissions_id");
  CREATE INDEX "payload_locked_documents_rels_achievements_id_idx" ON "payload_locked_documents_rels" USING btree ("achievements_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_default_seo_default_seo_share_image_idx" ON "site_settings" USING btree ("default_seo_share_image_id");
  CREATE INDEX "site_settings_notification_popup_notification_popup_imag_idx" ON "site_settings" USING btree ("notification_popup_image_id");
  CREATE INDEX "navigation_main_menu_children_order_idx" ON "navigation_main_menu_children" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_children_parent_id_idx" ON "navigation_main_menu_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_children_page_idx" ON "navigation_main_menu_children" USING btree ("page_id");
  CREATE INDEX "navigation_main_menu_order_idx" ON "navigation_main_menu" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_parent_id_idx" ON "navigation_main_menu" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_page_idx" ON "navigation_main_menu" USING btree ("page_id");
  CREATE INDEX "navigation_footer_menu_order_idx" ON "navigation_footer_menu" USING btree ("_order");
  CREATE INDEX "navigation_footer_menu_parent_id_idx" ON "navigation_footer_menu" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_menu_page_idx" ON "navigation_footer_menu" USING btree ("page_id");
  CREATE INDEX "homepage_banners_order_idx" ON "homepage_banners" USING btree ("_order");
  CREATE INDEX "homepage_banners_parent_id_idx" ON "homepage_banners" USING btree ("_parent_id");
  CREATE INDEX "homepage_banners_image_idx" ON "homepage_banners" USING btree ("image_id");
  CREATE INDEX "homepage_stats_order_idx" ON "homepage_stats" USING btree ("_order");
  CREATE INDEX "homepage_stats_parent_id_idx" ON "homepage_stats" USING btree ("_parent_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_courses_id_idx" ON "homepage_rels" USING btree ("courses_id");
  CREATE INDEX "homepage_rels_posts_id_idx" ON "homepage_rels" USING btree ("posts_id");
  CREATE INDEX "homepage_rels_achievements_id_idx" ON "homepage_rels" USING btree ("achievements_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_rels" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "exams_schedule" CASCADE;
  DROP TABLE "exams" CASCADE;
  DROP TABLE "exams_rels" CASCADE;
  DROP TABLE "branches" CASCADE;
  DROP TABLE "admissions" CASCADE;
  DROP TABLE "admissions_rels" CASCADE;
  DROP TABLE "achievements" CASCADE;
  DROP TABLE "achievements_rels" CASCADE;
  DROP TABLE "albums_photos" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "albums_rels" CASCADE;
  DROP TABLE "pages_blocks_text_block" CASCADE;
  DROP TABLE "pages_blocks_image_block" CASCADE;
  DROP TABLE "pages_blocks_stats_block_items" CASCADE;
  DROP TABLE "pages_blocks_stats_block" CASCADE;
  DROP TABLE "pages_blocks_team_block_members" CASCADE;
  DROP TABLE "pages_blocks_team_block" CASCADE;
  DROP TABLE "pages_blocks_cta_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_main_menu_children" CASCADE;
  DROP TABLE "navigation_main_menu" CASCADE;
  DROP TABLE "navigation_footer_menu" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "homepage_banners" CASCADE;
  DROP TABLE "homepage_stats" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum_posts_type";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum_documents_type";
  DROP TYPE "public"."enum_documents_grade";
  DROP TYPE "public"."enum_documents_subject";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum_courses_grade";
  DROP TYPE "public"."enum_courses_subject";
  DROP TYPE "public"."enum_exams_status";
  DROP TYPE "public"."enum_exams_exam_status";
  DROP TYPE "public"."enum_branches_status";
  DROP TYPE "public"."enum_admissions_status";
  DROP TYPE "public"."enum_admissions_admission_status";
  DROP TYPE "public"."enum_achievements_status";
  DROP TYPE "public"."enum_achievements_award_level";
  DROP TYPE "public"."enum_albums_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_submissions_process_status";
  DROP TYPE "public"."enum_navigation_main_menu_children_type";
  DROP TYPE "public"."enum_navigation_main_menu_children_collection";
  DROP TYPE "public"."enum_navigation_main_menu_type";
  DROP TYPE "public"."enum_navigation_main_menu_collection";
  DROP TYPE "public"."enum_navigation_footer_menu_type";
  DROP TYPE "public"."enum_navigation_footer_menu_collection";`)
}
