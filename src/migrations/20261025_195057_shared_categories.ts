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

export async function up({ db }: MigrateUpArgs): Promise<void> {
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
  // `down` keeps this column (see there), so a second `up` finds it already in place
  const categoryColumns = (await db.all(
    sql`SELECT name FROM pragma_table_info('categories')`,
  )) as Row[]
  if (!categoryColumns.some(({ name }) => name === 'default_image_id')) {
    await db.run(
      sql`ALTER TABLE \`categories\` ADD \`default_image_id\` integer REFERENCES media(id) ON DELETE SET NULL ON UPDATE NO ACTION;`,
    )
  }
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`categories_default_image_idx\` ON \`categories\` (\`default_image_id\`);`,
  )
  await linkEventsToCategories({ db })
  await db.run(sql`ALTER TABLE \`events\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`_events_v\` DROP COLUMN \`version_category\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Put back each event's first linked category that is one of the old values (none: null),
  // before the links go. No table is rebuilt, so this is safe with foreign keys enforced in a
  // transaction: a rebuild of `categories` there would cascade-delete every post's links.
  const legacy = sql.join(
    Object.keys(LEGACY_EVENT_CATEGORIES).map((slug) => sql`${slug}`),
    sql`, `,
  )
  await db.run(sql`ALTER TABLE \`events\` ADD \`category\` text DEFAULT 'community';`)
  await db.run(sql`ALTER TABLE \`_events_v\` ADD \`version_category\` text DEFAULT 'community';`)
  await db.run(sql`UPDATE events SET category = (
    SELECT c.slug FROM events_rels r JOIN categories c ON c.id = r.categories_id
    WHERE r.parent_id = events.id AND r.path = 'categories' AND c.slug IN (${legacy})
    ORDER BY r."order", r.id LIMIT 1)`)
  await db.run(sql`UPDATE _events_v SET version_category = (
    SELECT c.slug FROM _events_v_rels r JOIN categories c ON c.id = r.categories_id
    WHERE r.parent_id = _events_v.id AND r.path = 'version.categories' AND c.slug IN (${legacy})
    ORDER BY r."order", r.id LIMIT 1)`)
  await db.run(sql`DROP TABLE \`events_rels\`;`)
  await db.run(sql`DROP TABLE \`_events_v_rels\`;`)
  // `categories.default_image_id` stays, emptied: SQLite can't drop a column that has a foreign
  // key, and rebuilding the table would cascade-delete the links to it. The old schema ignores it.
  await db.run(sql`UPDATE categories SET default_image_id = NULL`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`credit\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`license\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`source_url\`;`)
}
