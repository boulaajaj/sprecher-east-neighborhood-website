import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`posts_audience\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_audience_order_idx\` ON \`posts_audience\` (\`order\`);`)
  await db.run(
    sql`CREATE INDEX \`posts_audience_parent_idx\` ON \`posts_audience\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_posts_v_version_audience\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_posts_v_version_audience_order_idx\` ON \`_posts_v_version_audience\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_version_audience_parent_idx\` ON \`_posts_v_version_audience\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`events_audience\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`events_audience_order_idx\` ON \`events_audience\` (\`order\`);`)
  await db.run(
    sql`CREATE INDEX \`events_audience_parent_idx\` ON \`events_audience\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_events_v_version_audience\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_events_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_events_v_version_audience_order_idx\` ON \`_events_v_version_audience\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_audience_parent_idx\` ON \`_events_v_version_audience\` (\`parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`posts\` ADD \`moderation_status\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`source_name\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`source_url\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`external_id\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`content_hash\` text;`)
  await db.run(
    sql`CREATE INDEX \`posts_moderation_status_idx\` ON \`posts\` (\`moderation_status\`);`,
  )
  await db.run(sql`CREATE UNIQUE INDEX \`posts_external_id_idx\` ON \`posts\` (\`external_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_content_hash_idx\` ON \`posts\` (\`content_hash\`);`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_moderation_status\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_source_name\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_source_url\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_external_id\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_content_hash\` text;`)
  await db.run(
    sql`CREATE INDEX \`_posts_v_version_version_moderation_status_idx\` ON \`_posts_v\` (\`version_moderation_status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_version_version_external_id_idx\` ON \`_posts_v\` (\`version_external_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_version_version_content_hash_idx\` ON \`_posts_v\` (\`version_content_hash\`);`,
  )
  await db.run(sql`ALTER TABLE \`events\` ADD \`cancelled\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`moderation_status\` text;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`source_name\` text;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`source_url\` text;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`external_id\` text;`)
  await db.run(sql`ALTER TABLE \`events\` ADD \`content_hash\` text;`)
  await db.run(
    sql`CREATE INDEX \`events_moderation_status_idx\` ON \`events\` (\`moderation_status\`);`,
  )
  await db.run(sql`CREATE UNIQUE INDEX \`events_external_id_idx\` ON \`events\` (\`external_id\`);`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`events_content_hash_idx\` ON \`events\` (\`content_hash\`);`,
  )
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_cancelled\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_moderation_status\` text;`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_source_name\` text;`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_source_url\` text;`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_external_id\` text;`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_content_hash\` text;`)
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_moderation_status_idx\` ON \`_events_v\` (\`version_moderation_status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_external_id_idx\` ON \`_events_v\` (\`version_external_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_content_hash_idx\` ON \`_events_v\` (\`version_content_hash\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`posts_audience\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_version_audience\`;`)
  await db.run(sql`DROP TABLE \`events_audience\`;`)
  await db.run(sql`DROP TABLE \`_events_v_version_audience\`;`)
  await db.run(sql`DROP INDEX \`posts_moderation_status_idx\`;`)
  await db.run(sql`DROP INDEX \`posts_external_id_idx\`;`)
  await db.run(sql`DROP INDEX \`posts_content_hash_idx\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`moderation_status\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`source_name\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`source_url\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`external_id\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`content_hash\`;`)
  await db.run(sql`DROP INDEX \`_posts_v_version_version_moderation_status_idx\`;`)
  await db.run(sql`DROP INDEX \`_posts_v_version_version_external_id_idx\`;`)
  await db.run(sql`DROP INDEX \`_posts_v_version_version_content_hash_idx\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_moderation_status\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_source_name\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_source_url\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_external_id\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_content_hash\`;`)
  await db.run(sql`DROP INDEX \`events_moderation_status_idx\`;`)
  await db.run(sql`DROP INDEX \`events_external_id_idx\`;`)
  await db.run(sql`DROP INDEX \`events_content_hash_idx\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`cancelled\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`moderation_status\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`source_name\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`source_url\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`external_id\`;`)
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`content_hash\`;`)
  await db.run(sql`DROP INDEX \`_events_v_version_version_moderation_status_idx\`;`)
  await db.run(sql`DROP INDEX \`_events_v_version_version_external_id_idx\`;`)
  await db.run(sql`DROP INDEX \`_events_v_version_version_content_hash_idx\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_cancelled\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_moderation_status\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_source_name\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_source_url\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_external_id\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_content_hash\`;`)
}
