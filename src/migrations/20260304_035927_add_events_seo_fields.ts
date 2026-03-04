import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // Backfill NULL alt values before copying into NOT NULL column
  await db.run(sql`UPDATE \`media\` SET \`alt\` = '' WHERE \`alt\` IS NULL;`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`folder_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_square_url\` text,
  	\`sizes_square_width\` numeric,
  	\`sizes_square_height\` numeric,
  	\`sizes_square_mime_type\` text,
  	\`sizes_square_filesize\` numeric,
  	\`sizes_square_filename\` text,
  	\`sizes_small_url\` text,
  	\`sizes_small_width\` numeric,
  	\`sizes_small_height\` numeric,
  	\`sizes_small_mime_type\` text,
  	\`sizes_small_filesize\` numeric,
  	\`sizes_small_filename\` text,
  	\`sizes_medium_url\` text,
  	\`sizes_medium_width\` numeric,
  	\`sizes_medium_height\` numeric,
  	\`sizes_medium_mime_type\` text,
  	\`sizes_medium_filesize\` numeric,
  	\`sizes_medium_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text,
  	\`sizes_xlarge_url\` text,
  	\`sizes_xlarge_width\` numeric,
  	\`sizes_xlarge_height\` numeric,
  	\`sizes_xlarge_mime_type\` text,
  	\`sizes_xlarge_filesize\` numeric,
  	\`sizes_xlarge_filename\` text,
  	\`sizes_og_url\` text,
  	\`sizes_og_width\` numeric,
  	\`sizes_og_height\` numeric,
  	\`sizes_og_mime_type\` text,
  	\`sizes_og_filesize\` numeric,
  	\`sizes_og_filename\` text,
  	FOREIGN KEY (\`folder_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_media\`("id", "alt", "caption", "folder_id", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_square_url", "sizes_square_width", "sizes_square_height", "sizes_square_mime_type", "sizes_square_filesize", "sizes_square_filename", "sizes_small_url", "sizes_small_width", "sizes_small_height", "sizes_small_mime_type", "sizes_small_filesize", "sizes_small_filename", "sizes_medium_url", "sizes_medium_width", "sizes_medium_height", "sizes_medium_mime_type", "sizes_medium_filesize", "sizes_medium_filename", "sizes_large_url", "sizes_large_width", "sizes_large_height", "sizes_large_mime_type", "sizes_large_filesize", "sizes_large_filename", "sizes_xlarge_url", "sizes_xlarge_width", "sizes_xlarge_height", "sizes_xlarge_mime_type", "sizes_xlarge_filesize", "sizes_xlarge_filename", "sizes_og_url", "sizes_og_width", "sizes_og_height", "sizes_og_mime_type", "sizes_og_filesize", "sizes_og_filename") SELECT "id", "alt", "caption", "folder_id", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_square_url", "sizes_square_width", "sizes_square_height", "sizes_square_mime_type", "sizes_square_filesize", "sizes_square_filename", "sizes_small_url", "sizes_small_width", "sizes_small_height", "sizes_small_mime_type", "sizes_small_filesize", "sizes_small_filename", "sizes_medium_url", "sizes_medium_width", "sizes_medium_height", "sizes_medium_mime_type", "sizes_medium_filesize", "sizes_medium_filename", "sizes_large_url", "sizes_large_width", "sizes_large_height", "sizes_large_mime_type", "sizes_large_filesize", "sizes_large_filename", "sizes_xlarge_url", "sizes_xlarge_width", "sizes_xlarge_height", "sizes_xlarge_mime_type", "sizes_xlarge_filesize", "sizes_xlarge_filename", "sizes_og_url", "sizes_og_width", "sizes_og_height", "sizes_og_mime_type", "sizes_og_filesize", "sizes_og_filename" FROM \`media\`;`,
  )
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__new_media\` RENAME TO \`media\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`media_folder_idx\` ON \`media\` (\`folder_id\`);`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(
    sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_square_sizes_square_filename_idx\` ON \`media\` (\`sizes_square_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_small_sizes_small_filename_idx\` ON \`media\` (\`sizes_small_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_medium_sizes_medium_filename_idx\` ON \`media\` (\`sizes_medium_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_xlarge_sizes_xlarge_filename_idx\` ON \`media\` (\`sizes_xlarge_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`,
  )
  await db.run(sql`ALTER TABLE \`events\` ADD \`meta_title\` text;`)
  await db.run(
    sql`ALTER TABLE \`events\` ADD \`meta_image_id\` integer REFERENCES media(id) ON DELETE SET NULL ON UPDATE NO ACTION;`,
  )
  await db.run(sql`ALTER TABLE \`events\` ADD \`meta_description\` text;`)
  await db.run(sql`CREATE INDEX \`events_meta_meta_image_idx\` ON \`events\` (\`meta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_meta_title\` text;`)
  await db.run(
    sql`ALTER TABLE \`_events_v\` ADD \`version_meta_image_id\` integer REFERENCES media(id) ON DELETE SET NULL ON UPDATE NO ACTION;`,
  )
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_meta_description\` text;`)
  await db.run(
    sql`CREATE INDEX \`_events_v_version_meta_version_meta_image_idx\` ON \`_events_v\` (\`version_meta_image_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`date\` text,
  	\`time_start\` text,
  	\`time_end\` text,
  	\`category\` text DEFAULT 'community',
  	\`featured\` integer DEFAULT false,
  	\`location_type\` text DEFAULT 'in-person',
  	\`location_name\` text,
  	\`location_address\` text,
  	\`maps_url\` text,
  	\`registration_url\` text,
  	\`hero_image_id\` integer,
  	\`description\` text,
  	\`content\` text,
  	\`published_at\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_events\`("id", "title", "date", "time_start", "time_end", "category", "featured", "location_type", "location_name", "location_address", "maps_url", "registration_url", "hero_image_id", "description", "content", "published_at", "generate_slug", "slug", "updated_at", "created_at", "_status") SELECT "id", "title", "date", "time_start", "time_end", "category", "featured", "location_type", "location_name", "location_address", "maps_url", "registration_url", "hero_image_id", "description", "content", "published_at", "generate_slug", "slug", "updated_at", "created_at", "_status" FROM \`events\`;`,
  )
  await db.run(sql`DROP TABLE \`events\`;`)
  await db.run(sql`ALTER TABLE \`__new_events\` RENAME TO \`events\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`events_hero_image_idx\` ON \`events\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`events_slug_idx\` ON \`events\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`events__status_idx\` ON \`events\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__events_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_date\` text,
  	\`version_time_start\` text,
  	\`version_time_end\` text,
  	\`version_category\` text DEFAULT 'community',
  	\`version_featured\` integer DEFAULT false,
  	\`version_location_type\` text DEFAULT 'in-person',
  	\`version_location_name\` text,
  	\`version_location_address\` text,
  	\`version_maps_url\` text,
  	\`version_registration_url\` text,
  	\`version_hero_image_id\` integer,
  	\`version_description\` text,
  	\`version_content\` text,
  	\`version_published_at\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__events_v\`("id", "parent_id", "version_title", "version_date", "version_time_start", "version_time_end", "version_category", "version_featured", "version_location_type", "version_location_name", "version_location_address", "version_maps_url", "version_registration_url", "version_hero_image_id", "version_description", "version_content", "version_published_at", "version_generate_slug", "version_slug", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave") SELECT "id", "parent_id", "version_title", "version_date", "version_time_start", "version_time_end", "version_category", "version_featured", "version_location_type", "version_location_name", "version_location_address", "version_maps_url", "version_registration_url", "version_hero_image_id", "version_description", "version_content", "version_published_at", "version_generate_slug", "version_slug", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave" FROM \`_events_v\`;`,
  )
  await db.run(sql`DROP TABLE \`_events_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__events_v\` RENAME TO \`_events_v\`;`)
  await db.run(sql`CREATE INDEX \`_events_v_parent_idx\` ON \`_events_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_hero_image_idx\` ON \`_events_v\` (\`version_hero_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_slug_idx\` ON \`_events_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_updated_at_idx\` ON \`_events_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version_created_at_idx\` ON \`_events_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_events_v_version_version__status_idx\` ON \`_events_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_events_v_created_at_idx\` ON \`_events_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_updated_at_idx\` ON \`_events_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_latest_idx\` ON \`_events_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_events_v_autosave_idx\` ON \`_events_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`caption\` text,
  	\`folder_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_square_url\` text,
  	\`sizes_square_width\` numeric,
  	\`sizes_square_height\` numeric,
  	\`sizes_square_mime_type\` text,
  	\`sizes_square_filesize\` numeric,
  	\`sizes_square_filename\` text,
  	\`sizes_small_url\` text,
  	\`sizes_small_width\` numeric,
  	\`sizes_small_height\` numeric,
  	\`sizes_small_mime_type\` text,
  	\`sizes_small_filesize\` numeric,
  	\`sizes_small_filename\` text,
  	\`sizes_medium_url\` text,
  	\`sizes_medium_width\` numeric,
  	\`sizes_medium_height\` numeric,
  	\`sizes_medium_mime_type\` text,
  	\`sizes_medium_filesize\` numeric,
  	\`sizes_medium_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text,
  	\`sizes_xlarge_url\` text,
  	\`sizes_xlarge_width\` numeric,
  	\`sizes_xlarge_height\` numeric,
  	\`sizes_xlarge_mime_type\` text,
  	\`sizes_xlarge_filesize\` numeric,
  	\`sizes_xlarge_filename\` text,
  	\`sizes_og_url\` text,
  	\`sizes_og_width\` numeric,
  	\`sizes_og_height\` numeric,
  	\`sizes_og_mime_type\` text,
  	\`sizes_og_filesize\` numeric,
  	\`sizes_og_filename\` text,
  	FOREIGN KEY (\`folder_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_media\`("id", "alt", "caption", "folder_id", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_square_url", "sizes_square_width", "sizes_square_height", "sizes_square_mime_type", "sizes_square_filesize", "sizes_square_filename", "sizes_small_url", "sizes_small_width", "sizes_small_height", "sizes_small_mime_type", "sizes_small_filesize", "sizes_small_filename", "sizes_medium_url", "sizes_medium_width", "sizes_medium_height", "sizes_medium_mime_type", "sizes_medium_filesize", "sizes_medium_filename", "sizes_large_url", "sizes_large_width", "sizes_large_height", "sizes_large_mime_type", "sizes_large_filesize", "sizes_large_filename", "sizes_xlarge_url", "sizes_xlarge_width", "sizes_xlarge_height", "sizes_xlarge_mime_type", "sizes_xlarge_filesize", "sizes_xlarge_filename", "sizes_og_url", "sizes_og_width", "sizes_og_height", "sizes_og_mime_type", "sizes_og_filesize", "sizes_og_filename") SELECT "id", "alt", "caption", "folder_id", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_square_url", "sizes_square_width", "sizes_square_height", "sizes_square_mime_type", "sizes_square_filesize", "sizes_square_filename", "sizes_small_url", "sizes_small_width", "sizes_small_height", "sizes_small_mime_type", "sizes_small_filesize", "sizes_small_filename", "sizes_medium_url", "sizes_medium_width", "sizes_medium_height", "sizes_medium_mime_type", "sizes_medium_filesize", "sizes_medium_filename", "sizes_large_url", "sizes_large_width", "sizes_large_height", "sizes_large_mime_type", "sizes_large_filesize", "sizes_large_filename", "sizes_xlarge_url", "sizes_xlarge_width", "sizes_xlarge_height", "sizes_xlarge_mime_type", "sizes_xlarge_filesize", "sizes_xlarge_filename", "sizes_og_url", "sizes_og_width", "sizes_og_height", "sizes_og_mime_type", "sizes_og_filesize", "sizes_og_filename" FROM \`media\`;`,
  )
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__new_media\` RENAME TO \`media\`;`)
  await db.run(sql`CREATE INDEX \`media_folder_idx\` ON \`media\` (\`folder_id\`);`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(
    sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_square_sizes_square_filename_idx\` ON \`media\` (\`sizes_square_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_small_sizes_small_filename_idx\` ON \`media\` (\`sizes_small_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_medium_sizes_medium_filename_idx\` ON \`media\` (\`sizes_medium_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_xlarge_sizes_xlarge_filename_idx\` ON \`media\` (\`sizes_xlarge_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`,
  )
}
