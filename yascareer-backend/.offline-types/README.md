# Offline type stub

`prisma-stub.d.ts` is a hand-written `@prisma/client` declaration used ONLY to
type-check this project in an environment without network access (where
`prisma generate` cannot download engine binaries).

In a normal environment you do NOT need it:
1. Run `npx prisma generate` — the real, fully-typed client is produced.
2. This folder is excluded from `tsconfig.json`, so it never interferes.

To type-check offline, temporarily add `.offline-types` to tsconfig `include`.
