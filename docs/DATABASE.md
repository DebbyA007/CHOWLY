# The database, and why development has its own branch

## What went wrong once

On 6 September 2026 development and production shared one Neon database. Reseeding it
from a feature branch replaced the eleven dish card with the ninety two dish one
everywhere at once. The deployed app was still running the old code, which selected
dishes by a hardcoded list of the old ids, so the live menu dropped to six rows with four
of them marked sold out. Nothing was corrupt and no order lost its lines, but the live
link was degraded for about half an hour and only merging the branch fixed it.

The lesson is not "be careful with the seed". It is that **with one database, a data
change on a branch is a production change**, and no amount of care makes that untrue. So
there are two defences, and the second one holds even when the first has not been set up.

## The split was considered and declined

Neon branches are copy-on-write: a second database, created from production in a second or
two, with its own endpoint host. Giving development its own branch is the textbook fix for
what happened above, and it was worked out in full, priced, and **declined**.

The reasoning, recorded so this file does not read as an unfinished task:

- **The guard below already refuses the thing that actually went wrong.** The outage was a
  reseed pointed at production. `npm run db:seed` now refuses that outright, and refusing
  is the default rather than something to remember.
- **The split has a running cost that lands on every schema change.** With one database,
  `prisma migrate dev` reaches production as a side effect of developing. With two, it does
  not, so every migration becomes a second deliberate step against the live database. That
  is a new way to ship a deployment whose schema is behind its code, traded for a way to
  reseed the wrong database that is already blocked.
- **It is not proportionate to this project.** One restaurant, one deployment, one person
  working on it, and a graded submission days away. Two connection strings and a release
  ritual is the right answer for a team; it is complexity without a reader here.

So there is one database, and the guard is what stands between it and a careless command.

### What that leaves unprotected, stated plainly

The guard covers `npm run db:seed`, which is the command that caused the outage. It does
**not** cover Prisma's own CLI, because this repository cannot hook it. `prisma migrate
dev` and `prisma migrate reset` are pointed at whatever `DATABASE_URL` says, and against
the live database `migrate reset` drops every table. There is no code here that stops it.

What stands in for that is a habit and a command: **run `npm run db:where` before anything
that writes**, and prefer `npm run db:deploy`, which only applies migrations that already
exist and never generates, resets or drops.

### If the split is ever wanted after all

The steps, kept because the decision above may not survive contact with a second developer.
They are in the Neon console; there is no Neon API key in this repository to do them from
here.

1. Open the Neon console and pick the CHOWLY project.
2. **Branches**, then **Create branch**.
   - Name it `development`.
   - Parent: `production` (or `main`, whichever the current default is called).
   - Include data: yes. Starting from a copy of production means the dev menu, the staff
     and the historical orders are all there.
3. On the new branch, open **Connection details** and copy both strings:
   - the **pooled** one, the host with `-pooler` in it, and
   - the **direct** one, the same host without `-pooler`.
4. In your local `.env`, and only there:
   - `DATABASE_URL` = the pooled string from `development`
   - `DIRECT_URL` = the direct string from `development`
   - `PRODUCTION_DB_HOST` = the host of the **production** branch, either form
5. **Leave Vercel alone.** Its `DATABASE_URL` and `DIRECT_URL` already point at
   production and must keep doing so. Nothing in this change touches the deployment.
6. Check it: `npm run db:where`. It should name the development host and say
   `writes allowed`.

## The guard: destructive commands check the host

`lib/db-target.ts` compares the host in `DATABASE_URL` against `PRODUCTION_DB_HOST` and
refuses if they are the same Neon endpoint. The pooled and direct hosts of one branch
differ only by `-pooler`, so either form works as the guard value.

`npm run db:seed` runs the guard before it opens a connection:

```
$ npm run db:seed
Seeding neondb at ep-ancient-sun-...-pooler.c-6.eu-central-1.aws.neon.tech (guard armed)

Refused.
This would write to the production database (ep-ancient-sun-...), which is the one the live link reads.
Point DATABASE_URL and DIRECT_URL at the development branch instead. docs/DATABASE.md has the steps.
If you really do mean production, set ALLOW_PRODUCTION_WRITE=yes-i-mean-the-live-database for that one command.
```

Three things about that override are deliberate. It is a phrase rather than a boolean, so
it cannot be set by habit or by copying a `true` from another line. It is compared
exactly, so `YES-I-MEAN-THE-LIVE-DATABASE` and a version with a stray space both fail. And
it is meant for one command at a time, never for a shell you keep open.

If `PRODUCTION_DB_HOST` is empty, nothing is guarded. The commands say so on the line
before they start, because a guard that is silently off is worse than no guard: it gets
trusted. `lib/db-target.test.mts` covers every shape of that.

The guard is armed **today**, before the Neon branch exists. With `.env` still pointing at
production it fails closed: the seed refuses to run at all. That is the correct state to
be in while the branch is being created.

## Migrations

Vercel's build command is `prisma generate && next build`. It does not run migrations, and
it should not: a deploy that silently changes the database schema is a worse problem than
the one it solves.

With a single database, `prisma migrate dev` applies a migration to the live database as
it writes the migration file. That is convenient and it is the sharp edge of the decision
above, so the order that keeps it safe is:

1. `npm run db:where`, and read it. It names the host and says whether the guard is armed.
2. `npm run db:migrate` to write and apply the migration.
3. Deploy, and open the live link once afterwards. A schema change that is applied but not
   deployed is invisible until someone hits the route that needs it.

`npm run db:deploy` runs `prisma migrate deploy`, which only applies migrations that
already exist and never generates, resets or drops. It is the safe one to point anywhere.

## The commands

| Command | What it does |
|---|---|
| `npm run db:where` | Names the database, the host, and whether the guard is armed. Writes nothing. |
| `npm run db:seed` | Seeds the card and the staff. Refuses to run against production. |
| `npm run db:migrate` | `prisma migrate dev`. Development branch only. |
| `npm run db:deploy` | `prisma migrate deploy`. The one command meant for production. |

`prisma migrate reset` is not wrapped, because it is Prisma's own command and this
repository cannot hook it. It drops every table. Run `npm run db:where` first, every time.

## The rule, since there is one database

**Nothing seeds or resets against the live database except as a deliberate, announced
step.** `PRODUCTION_DB_HOST` stays set so the seed refuses by default, and the override
phrase exists for the rare case where reseeding the live menu is genuinely what is wanted.

This is weaker than two databases, because it leans on a person for `prisma migrate` and
on code only for the seed. It is not nothing: the failure in September was an unguarded
command run without thinking, and that exact command is now blocked.
