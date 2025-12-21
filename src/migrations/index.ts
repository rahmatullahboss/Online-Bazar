import * as migration_20251221_072544_baseline_schema from './20251221_072544_baseline_schema';

export const migrations = [
  {
    up: migration_20251221_072544_baseline_schema.up,
    down: migration_20251221_072544_baseline_schema.down,
    name: '20251221_072544_baseline_schema'
  },
];
