import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`_verified\` integer;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`_verificationtoken\` text;`)
  // Accounts from before \`auth.verify\` (#187) are verified, so turning it on locks nobody out
  // and their forgot-password emails keep working. Only accounts created after this need a link.
  await db.run(sql`UPDATE \`users\` SET \`_verified\` = 1;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`_verified\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`_verificationtoken\`;`)
}
