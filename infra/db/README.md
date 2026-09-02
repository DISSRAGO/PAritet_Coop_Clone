# HomoNet database lifecycle

## Rules

- `infra/db/migrations/` is the source of truth for forward database changes.
- Migration files are append-only: do not edit an applied file.
- Migrations use `DATABASE_DDL_URL` and the `homonet_owner` role.
- The application uses `DATABASE_URL` and `homonet_app_auth`; it must not have DDL permissions.
- A schema-only snapshot bootstraps a new empty database; it does not update an existing database.
- Passwords and database credentials must never be committed to Git.

## Planned commands

```bash
python infra/db/scripts/migrate.py
python infra/db/scripts/verify.py
python infra/db/scripts/bootstrap_system.py
```

## Rollout order

1. Add and review migrations.
2. Test on dev.
3. Apply the same Git revision on stend.
4. Run smoke checks.
5. Promote the same revision to production.
