import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`payload_jobs_stats\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`stats\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`form_submissions\` ADD \`retention_hold\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`form_submissions\` ADD \`retention_hold_reason\` text;`)
  await db.run(sql`ALTER TABLE \`payload_jobs\` ADD \`meta\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`payload_jobs_stats\`;`)
  await db.run(sql`ALTER TABLE \`form_submissions\` DROP COLUMN \`retention_hold\`;`)
  await db.run(sql`ALTER TABLE \`form_submissions\` DROP COLUMN \`retention_hold_reason\`;`)
  await db.run(sql`ALTER TABLE \`payload_jobs\` DROP COLUMN \`meta\`;`)
}
