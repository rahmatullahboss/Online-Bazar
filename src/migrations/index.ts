import * as migration_20251221_072544_baseline_schema from './20251221_072544_baseline_schema';
import * as migration_20251222_172358 from './20251222_172358';

export const migrations = [
  {
    up: migration_20251221_072544_baseline_schema.up,
    down: migration_20251221_072544_baseline_schema.down,
    name: '20251221_072544_baseline_schema',
  },
  {
    up: migration_20251222_172358.up,
    down: migration_20251222_172358.down,
    name: '20251222_172358'
  },
];
