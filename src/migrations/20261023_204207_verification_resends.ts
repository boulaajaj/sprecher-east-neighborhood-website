import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`verification_resends\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`verification_resends_since\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`verification_resends\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`verification_resends_since\`;`)
}
