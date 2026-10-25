import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * #362: events move from a fixed `category` select to the category tree they share with posts.
 * Each old value becomes a category with the same slug (an existing one is reused), and every
 * event and event version is linked to it before the old columns are dropped.
 */
const LEGACY_EVENT_CATEGORIES: Record<string, string> = {
  meeting: 'Meeting',
  social: 'Social',
  volunteer: 'Volunteer',
  workshop: 'Workshop',
  sports: 'Sports & Recreation',
  community: 'Community',
  other: 'Other',
}

type Row = Record<string, unknown>

async function linkEventsToCategories({ db }: Pick<MigrateUpArgs, 'db'>): Promise<void> {
  const used = (await db.all(
    sql`SELECT category AS value FROM events WHERE category IS NOT NULL
        UNION SELECT version_category AS value FROM _events_v WHERE version_category IS NOT NULL`,
  )) as Row[]
  for (const { value } of used) {
    if (typeof value !== 'string' || value === '') continue
    const title = LEGACY_EVENT_CATEGORIES[value] ?? value
    const existing = (await db.all(
      sql`SELECT id FROM categories WHERE slug = ${value} LIMIT 1`,
    )) as Row[]
    let id = existing[0]?.id
    if (id === undefined) {
      await db.run(
        sql`INSERT INTO categories (title, generate_slug, slug) VALUES (${title}, 0, ${value})`,
      )
      const created = (await db.all(
        sql`SELECT id FROM categories WHERE slug = ${value} LIMIT 1`,
      )) as Row[]
      id = created[0]?.id
    }
    await db.run(sql`INSERT INTO events_rels ("order", parent_id, path, categories_id)
      SELECT 1, id, 'categories', ${id} FROM events WHERE category = ${value}`)
    await db.run(sql`INSERT INTO _events_v_rels ("order", parent_id, path, categories_id)
      SELECT 1, id, 'version.categories', ${id} FROM _events_v WHERE version_category = ${value}`)
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`events_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`events_rels_order_idx\` ON \`events_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`events_rels_parent_idx\` ON \`events_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`events_rels_path_idx\` ON \`events_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`events_rels_categories_id_idx\` ON \`events_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_events_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_events_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_events_v_rels_order_idx\` ON \`_events_v_rels\` (\`order\`);`)
  await db.run(
    sql`CREATE INDEX \`_events_v_rels_parent_idx\` ON \`_events_v_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_events_v_rels_path_idx\` ON \`_events_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_events_v_rels_categories_id_idx\` ON \`_events_v_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`media\` ADD \`credit\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`license\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`source_url\` text;`)
  await db.run(
    sql`ALTER TABLE \`categories\` ADD \`default_image_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`categories_default_image_idx\` ON \`categories\` (\`default_image_id\`);`,
  )
  await linkEventsToCategories({ db })
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_category\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Put back each event's first category slug that is one of the old values, before the links go
  await db.run(sql`ALTER TABLE \`events\` ADD \`category\` text DEFAULT 'community';`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_category\` text DEFAULT 'community';`)
  for (const slug of Object.keys(LEGACY_EVENT_CATEGORIES)) {
    await db.run(sql`UPDATE events SET category = ${slug} WHERE id IN (
      SELECT r.parent_id FROM events_rels r JOIN categories c ON c.id = r.categories_id
      WHERE r.path = 'categories' AND c.slug = ${slug})`)
    await db.run(sql`UPDATE _events_v SET version_category = ${slug} WHERE id IN (
      SELECT r.parent_id FROM _events_v_rels r JOIN categories c ON c.id = r.categories_id
      WHERE r.path = 'version.categories' AND c.slug = ${slug})`)
  }
  await db.run(sql`DROP TABLE \`events_rels\`;`)
  await db.run(sql`DROP TABLE \`_events_v_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`parent_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_categories\`("id", "title", "generate_slug", "slug", "parent_id", "updated_at", "created_at") SELECT "id", "title", "generate_slug", "slug", "parent_id", "updated_at", "created_at" FROM \`categories\`;`,
  )
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`ALTER TABLE \`__new_categories\` RENAME TO \`categories\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_parent_idx\` ON \`categories\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`credit\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`license\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`source_url\`;`)
}
