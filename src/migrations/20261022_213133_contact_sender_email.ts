import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`form_submissions\` ADD \`sender_email\` text;`)
  await db.run(sql`ALTER TABLE \`form_submissions\` ADD \`email_confirmed\` integer DEFAULT false;`)
  await db.run(
    sql`CREATE INDEX \`form_submissions_sender_email_idx\` ON \`form_submissions\` (\`sender_email\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`form_submissions_sender_email_idx\`;`)
  await db.run(sql`ALTER TABLE \`form_submissions\` DROP COLUMN \`sender_email\`;`)
  await db.run(sql`ALTER TABLE \`form_submissions\` DROP COLUMN \`email_confirmed\`;`)
}
