import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`verification_resends\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`verification_resends_since\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`verification_sets_password\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`verification_resends\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`verification_resends_since\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`verification_sets_password\`;`)
}
