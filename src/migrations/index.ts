import * as migration_20260303_010747_initial from './20260303_010747_initial'
import * as migration_20260304_035927_add_events_seo_fields from './20260304_035927_add_events_seo_fields'
import * as migration_20260304_205039 from './20260304_205039'
import * as migration_20261018_044131_payload_3_91_upgrade from './20261018_044131_payload_3_91_upgrade'
import * as migration_20261021_233720_backfill_seo_image_versions from './20261021_233720_backfill_seo_image_versions'
import * as migration_20261022_211619_email_confirmations from './20261022_211619_email_confirmations'
import * as migration_20261022_213133_contact_sender_email from './20261022_213133_contact_sender_email'
import * as migration_20261023_183632_account_verification from './20261023_183632_account_verification'
import * as migration_20261023_211151_verification_resends from './20261023_211151_verification_resends'
import * as migration_20261023_214345_held_form_emails from './20261023_214345_held_form_emails'
import * as migration_20261024_141700_contact_retention from './20261024_141700_contact_retention'
import * as migration_20261024_164157_review_queue from './20261024_164157_review_queue'
import * as migration_20261024_180000_cancel_missed_scheduled_publishes from './20261024_180000_cancel_missed_scheduled_publishes'
import * as migration_20261024_194426_agent_mcp_access from './20261024_194426_agent_mcp_access'

export const migrations = [
  {
    up: migration_20260303_010747_initial.up,
    down: migration_20260303_010747_initial.down,
    name: '20260303_010747_initial',
  },
  {
    up: migration_20260304_035927_add_events_seo_fields.up,
    down: migration_20260304_035927_add_events_seo_fields.down,
    name: '20260304_035927_add_events_seo_fields',
  },
  {
    up: migration_20260304_205039.up,
    down: migration_20260304_205039.down,
    name: '20260304_205039',
  },
  {
    up: migration_20261018_044131_payload_3_91_upgrade.up,
    down: migration_20261018_044131_payload_3_91_upgrade.down,
    name: '20261018_044131_payload_3_91_upgrade',
  },
  {
    up: migration_20261021_233720_backfill_seo_image_versions.up,
    down: migration_20261021_233720_backfill_seo_image_versions.down,
    name: '20261021_233720_backfill_seo_image_versions',
  },
  {
    up: migration_20261022_211619_email_confirmations.up,
    down: migration_20261022_211619_email_confirmations.down,
    name: '20261022_211619_email_confirmations',
  },
  {
    up: migration_20261022_213133_contact_sender_email.up,
    down: migration_20261022_213133_contact_sender_email.down,
    name: '20261022_213133_contact_sender_email',
  },
  {
    up: migration_20261023_183632_account_verification.up,
    down: migration_20261023_183632_account_verification.down,
    name: '20261023_183632_account_verification',
  },
  {
    up: migration_20261023_211151_verification_resends.up,
    down: migration_20261023_211151_verification_resends.down,
    name: '20261023_211151_verification_resends',
  },
  {
    up: migration_20261023_214345_held_form_emails.up,
    down: migration_20261023_214345_held_form_emails.down,
    name: '20261023_214345_held_form_emails',
  },
  {
    up: migration_20261024_141700_contact_retention.up,
    down: migration_20261024_141700_contact_retention.down,
    name: '20261024_141700_contact_retention',
  },
  {
    up: migration_20261024_164157_review_queue.up,
    down: migration_20261024_164157_review_queue.down,
    name: '20261024_164157_review_queue',
  },
  {
    up: migration_20261024_180000_cancel_missed_scheduled_publishes.up,
    down: migration_20261024_180000_cancel_missed_scheduled_publishes.down,
    name: '20261024_180000_cancel_missed_scheduled_publishes',
  },
  {
    up: migration_20261024_194426_agent_mcp_access.up,
    down: migration_20261024_194426_agent_mcp_access.down,
    name: '20261024_194426_agent_mcp_access',
  },
]
