import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`agent_runs_sources_checked\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`source_id\` text NOT NULL,
  	\`cursor\` text,
  	\`status\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agent_runs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`agent_runs_sources_checked_order_idx\` ON \`agent_runs_sources_checked\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`agent_runs_sources_checked_parent_id_idx\` ON \`agent_runs_sources_checked\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`agent_runs_review_items_evidence\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`url\` text NOT NULL,
  	\`says\` text NOT NULL,
  	\`retrieved_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agent_runs_review_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`agent_runs_review_items_evidence_order_idx\` ON \`agent_runs_review_items_evidence\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`agent_runs_review_items_evidence_parent_id_idx\` ON \`agent_runs_review_items_evidence\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`agent_runs_review_items_flags\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`agent_runs_review_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`agent_runs_review_items_flags_order_idx\` ON \`agent_runs_review_items_flags\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`agent_runs_review_items_flags_parent_idx\` ON \`agent_runs_review_items_flags\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`agent_runs_review_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text NOT NULL,
  	\`target_collection\` text,
  	\`target_id\` numeric,
  	\`external_id\` text,
  	\`summary\` text NOT NULL,
  	\`source_url\` text NOT NULL,
  	\`reported_at\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`agent_runs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`agent_runs_review_items_order_idx\` ON \`agent_runs_review_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`agent_runs_review_items_parent_id_idx\` ON \`agent_runs_review_items\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`agent_runs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`agent_id\` integer,
  	\`run_id\` text NOT NULL,
  	\`agent_name\` text NOT NULL,
  	\`pipeline_version\` numeric NOT NULL,
  	\`repo_commit\` text NOT NULL,
  	\`started_at\` text NOT NULL,
  	\`finished_at\` text,
  	\`status\` text NOT NULL,
  	\`counts_seen\` numeric DEFAULT 0,
  	\`counts_proposed\` numeric DEFAULT 0,
  	\`counts_updates\` numeric DEFAULT 0,
  	\`counts_rejected\` numeric DEFAULT 0,
  	\`counts_duplicates\` numeric DEFAULT 0,
  	\`counts_needs_review\` numeric DEFAULT 0,
  	\`cost_input_tokens\` numeric DEFAULT 0,
  	\`cost_output_tokens\` numeric DEFAULT 0,
  	\`cost_usd\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`agent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`agent_runs_agent_idx\` ON \`agent_runs\` (\`agent_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`agent_runs_run_id_idx\` ON \`agent_runs\` (\`run_id\`);`)
  await db.run(sql`CREATE INDEX \`agent_runs_updated_at_idx\` ON \`agent_runs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_runs_created_at_idx\` ON \`agent_runs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`agent_runs_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`agent_runs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`agent_runs_texts_order_parent\` ON \`agent_runs_texts\` (\`order\`,\`parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`payload_mcp_api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`label\` text,
  	\`description\` text,
  	\`events_find\` integer DEFAULT false,
  	\`posts_find\` integer DEFAULT false,
  	\`categories_find\` integer DEFAULT false,
  	\`agent_runs_find\` integer DEFAULT false,
  	\`agent_runs_create\` integer DEFAULT false,
  	\`agent_runs_update\` integer DEFAULT false,
  	\`payload_mcp_tool_submit_suggestion\` integer DEFAULT true,
  	\`payload_mcp_tool_report_item\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_user_idx\` ON \`payload_mcp_api_keys\` (\`user_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_updated_at_idx\` ON \`payload_mcp_api_keys\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_created_at_idx\` ON \`payload_mcp_api_keys\` (\`created_at\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`agent_runs_id\` integer REFERENCES agent_runs(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_agent_runs_id_idx\` ON \`payload_locked_documents_rels\` (\`agent_runs_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_preferences_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_payload_mcp_api_keys_id_idx\` ON \`payload_preferences_rels\` (\`payload_mcp_api_keys_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`agent_runs_sources_checked\`;`)
  await db.run(sql`DROP TABLE \`agent_runs_review_items_evidence\`;`)
  await db.run(sql`DROP TABLE \`agent_runs_review_items_flags\`;`)
  await db.run(sql`DROP TABLE \`agent_runs_review_items\`;`)
  await db.run(sql`DROP TABLE \`agent_runs\`;`)
  await db.run(sql`DROP TABLE \`agent_runs_texts\`;`)
  await db.run(sql`DROP TABLE \`payload_mcp_api_keys\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`events_id\` integer,
  	\`team_members_id\` integer,
  	\`resources_id\` integer,
  	\`faq_id\` integer,
  	\`media_id\` integer,
  	\`categories_id\` integer,
  	\`users_id\` integer,
  	\`email_confirmations_id\` integer,
  	\`redirects_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	\`search_id\` integer,
  	\`payload_folders_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`team_members_id\`) REFERENCES \`team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resources_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faq_id\`) REFERENCES \`faq\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`email_confirmations_id\`) REFERENCES \`email_confirmations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`search_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_folders_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "posts_id", "events_id", "team_members_id", "resources_id", "faq_id", "media_id", "categories_id", "users_id", "email_confirmations_id", "redirects_id", "forms_id", "form_submissions_id", "search_id", "payload_folders_id") SELECT "id", "order", "parent_id", "path", "pages_id", "posts_id", "events_id", "team_members_id", "resources_id", "faq_id", "media_id", "categories_id", "users_id", "email_confirmations_id", "redirects_id", "forms_id", "form_submissions_id", "search_id", "payload_folders_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_team_members_id_idx\` ON \`payload_locked_documents_rels\` (\`team_members_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_resources_id_idx\` ON \`payload_locked_documents_rels\` (\`resources_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_faq_id_idx\` ON \`payload_locked_documents_rels\` (\`faq_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_email_confirmations_id_idx\` ON \`payload_locked_documents_rels\` (\`email_confirmations_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_search_id_idx\` ON \`payload_locked_documents_rels\` (\`search_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_folders_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_folders_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__new_payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_preferences_rels\`("id", "order", "parent_id", "path", "users_id") SELECT "id", "order", "parent_id", "path", "users_id" FROM \`payload_preferences_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_preferences_rels\` RENAME TO \`payload_preferences_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`,
  )
}
