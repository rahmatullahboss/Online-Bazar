---
description: sync-db
---

# Database Migration Guide

## Quick Reference

| Command                                 | Purpose                               |
| --------------------------------------- | ------------------------------------- |
| `npm run dev`                           | Dev mode - auto-pushes schema changes |
| `npm run payload migrate:create <name>` | Create migration file                 |
| `npm run payload migrate`               | Run pending migrations                |
| `npm run payload migrate:fresh`         | Drop DB & run all migrations          |

---

## Development Workflow

### Auto Schema Sync (Dev Mode)

```bash
npm run dev
```

- Schema changes auto-push to DB
- Interactive prompts for column/enum conflicts
- No migration file needed during development

---

## Production Workflow

### 1. Create Migration File

After making collection/field changes:

```bash
npm run payload migrate:create my_new_feature
```

Creates:

- `src/migrations/YYYYMMDD_HHMMSS_my_new_feature.ts`
- `src/migrations/YYYYMMDD_HHMMSS_my_new_feature.json`

### 2. Run Migrations

```bash
npm run payload migrate
```

---

## Seeding Database

### Via Admin Panel

1. Login at `/admin`
2. Click "Seed your database" button

### Creates:

- **Admin**: admin@onlinebazar.com / admin123
- **Customer**: customer@example.com / customer123
- **6 Sample Products** with images
- **Sample Orders** (all statuses)

---

## Troubleshooting

### Schema Conflicts

If conflicts arise during dev mode:

- Choose "create column/enum" for new fields
- Choose "rename" only if migrating existing data

### Fresh Start

```bash
rm -rf src/migrations/*
npm run payload migrate:fresh
npm run payload migrate:create baseline
```

---

## Current Migration

| File                                 | Description                                              |
| ------------------------------------ | -------------------------------------------------------- |
| `20251221_072544_baseline_schema.ts` | Full schema including Wishlist, Inventory, Variants, SEO |
