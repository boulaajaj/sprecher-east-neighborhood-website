import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`resources_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resources_links_order_idx\` ON \`resources_links\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`resources_links_parent_id_idx\` ON \`resources_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_resources_v_version_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resources_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_resources_v_version_links_order_idx\` ON \`_resources_v_version_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_resources_v_version_links_parent_id_idx\` ON \`_resources_v_version_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`resources\` ADD \`photo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`photo_credit\` text;`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`photo_source_url\` text;`)
  await db.run(sql`CREATE INDEX \`resources_photo_idx\` ON \`resources\` (\`photo_id\`);`)
  await db.run(
    sql`ALTER TABLE \`_resources_v\` ADD \`version_photo_id\` integer REFERENCES media(id);`,
  )
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_photo_credit\` text;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_photo_source_url\` text;`)
  await db.run(
    sql`CREATE INDEX \`_resources_v_version_version_photo_idx\` ON \`_resources_v\` (\`version_photo_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`resources_links\`;`)
  await db.run(sql`DROP TABLE \`_resources_v_version_links\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_resources\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`url\` text,
  	\`phone\` text,
  	\`category\` text,
  	\`order\` numeric DEFAULT 99,
  	\`published_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_resources\`("id", "title", "description", "url", "phone", "category", "order", "published_at", "updated_at", "created_at", "_status") SELECT "id", "title", "description", "url", "phone", "category", "order", "published_at", "updated_at", "created_at", "_status" FROM \`resources\`;`,
  )
  await db.run(sql`DROP TABLE \`resources\`;`)
  await db.run(sql`ALTER TABLE \`__new_resources\` RENAME TO \`resources\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`resources_updated_at_idx\` ON \`resources\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`resources_created_at_idx\` ON \`resources\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`resources__status_idx\` ON \`resources\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__resources_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_description\` text,
  	\`version_url\` text,
  	\`version_phone\` text,
  	\`version_category\` text,
  	\`version_order\` numeric DEFAULT 99,
  	\`version_published_at\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__resources_v\`("id", "parent_id", "version_title", "version_description", "version_url", "version_phone", "version_category", "version_order", "version_published_at", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version_title", "version_description", "version_url", "version_phone", "version_category", "version_order", "version_published_at", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_resources_v\`;`,
  )
  await db.run(sql`DROP TABLE \`_resources_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__resources_v\` RENAME TO \`_resources_v\`;`)
  await db.run(sql`CREATE INDEX \`_resources_v_parent_idx\` ON \`_resources_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_resources_v_version_version_updated_at_idx\` ON \`_resources_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_resources_v_version_version_created_at_idx\` ON \`_resources_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_resources_v_version_version__status_idx\` ON \`_resources_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_resources_v_created_at_idx\` ON \`_resources_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_resources_v_updated_at_idx\` ON \`_resources_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_resources_v_latest_idx\` ON \`_resources_v\` (\`latest\`);`)
}
