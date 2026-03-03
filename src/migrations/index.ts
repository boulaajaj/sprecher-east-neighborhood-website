import * as migration_20260303_010747_initial from './20260303_010747_initial'

export const migrations = [
  {
    up: migration_20260303_010747_initial.up,
    down: migration_20260303_010747_initial.down,
    name: '20260303_010747_initial',
  },
]
