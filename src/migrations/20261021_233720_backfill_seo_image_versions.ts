import { type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Data only (#196). While the SEO plugin added its own `meta` group, the SEO image was saved on
 * each document but never in its versions. Pages, Posts and Events have drafts, so the admin and
 * every update load the latest version: without this, the first edit would clear the image.
 * Copy each document's image into its versions that have none.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    UPDATE \`_pages_v\` SET \`version_meta_image_id\` =
      (SELECT \`meta_image_id\` FROM \`pages\` WHERE \`pages\`.\`id\` = \`_pages_v\`.\`parent_id\`)
    WHERE \`version_meta_image_id\` IS NULL;
  `)
  await db.run(sql`
    UPDATE \`_posts_v\` SET \`version_meta_image_id\` =
      (SELECT \`meta_image_id\` FROM \`posts\` WHERE \`posts\`.\`id\` = \`_posts_v\`.\`parent_id\`)
    WHERE \`version_meta_image_id\` IS NULL;
  `)
  await db.run(sql`
    UPDATE \`_events_v\` SET \`version_meta_image_id\` =
      (SELECT \`meta_image_id\` FROM \`events\` WHERE \`events\`.\`id\` = \`_events_v\`.\`parent_id\`)
    WHERE \`version_meta_image_id\` IS NULL;
  `)
}

// Nothing to undo: the old plugin setup never reads these columns.
export async function down(): Promise<void> {}
