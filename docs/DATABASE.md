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

## Defence one: development gets its own Neon branch

Neon branches are copy-on-write. A branch is created from production in a second or two,
costs almost nothing while it is small, and gets **its own endpoint host**, which is what
makes the second defence possible.

These steps are in the Neon console. They cannot be done from this repository, because
there is no Neon API key here and no `neonctl` installed. If you would rather they were
scriptable, create a key in the Neon console under **Account settings, API keys**, put it
in `.env` as `NEON_API_KEY`, and say so: the whole of this section becomes one command.

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

## Defence two: destructive commands check the host

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

## Migrations, which is the real cost of splitting

Vercel's build command is `prisma generate && next build`. It does not run migrations, and
it should not: a deploy that silently changes the database schema is a worse problem than
this one. While the two shared a database, running `prisma migrate dev` locally migrated
production as a side effect. **After the split it does not**, and a schema change that is
deployed but not migrated is a production outage.

So the order is always:

1. `npm run db:migrate` on the development branch, which writes the migration file.
2. Commit it, review it, and get the app green against development.
3. Before or immediately after the deploy, apply it to production:

```
DATABASE_URL="<production pooled>" DIRECT_URL="<production direct>" npm run db:deploy
```

`prisma migrate deploy` only applies migrations that already exist. It never generates,
never resets and never drops, so it is the one command that is meant to be pointed at
production, and the guard does not block it.

Two habits make forgetting harder. Read the deployment log for the migration you expect,
and open the live link once after every deploy that carried a schema change. Both of those
are what would have caught the September outage in under a minute.

## The commands

| Command | What it does |
|---|---|
| `npm run db:where` | Names the database, the host, and whether the guard is armed. Writes nothing. |
| `npm run db:seed` | Seeds the card and the staff. Refuses to run against production. |
| `npm run db:migrate` | `prisma migrate dev`. Development branch only. |
| `npm run db:deploy` | `prisma migrate deploy`. The one command meant for production. |

`prisma migrate reset` is not wrapped, because it is Prisma's own command and this
repository cannot hook it. It drops every table. Run `npm run db:where` first, every time.

## If the branch is not workable

If the Neon plan will not carry a second branch, or the two connection strings become more
trouble than they are worth, the fallback rule is:

**Nothing seeds or migrates against production except a deliberate, announced release
step, and `PRODUCTION_DB_HOST` stays set so the seed refuses by default.** The override
phrase exists for exactly that release step. This is weaker than two databases, because it
depends on a person rather than on a boundary, but it is not nothing: the failure in
September was an unguarded command run without thinking, and the guard stops that one.
