import * as migration_20260303_010747_initial from './20260303_010747_initial'
import * as migration_20260304_035927_add_events_seo_fields from './20260304_035927_add_events_seo_fields'
import * as migration_20260304_205039 from './20260304_205039'

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
]
