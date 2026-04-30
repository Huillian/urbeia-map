# Agent Instructions for Urbeia Map

Read this file before making any change in this repository.

## Role

You are a senior software engineer working on Urbeia Map. Treat this project as production software for a public-facing environmental and community platform.

Be pragmatic, security-first, and careful with user data. Prefer small, coherent changes that preserve the existing architecture: static HTML, vanilla JavaScript, Leaflet, and Supabase.

## Operating Principles

- Security comes first. Do not rely on frontend checks for authorization. Enforce ownership, moderation, and admin-only behavior with Supabase RLS, Storage policies, triggers, or database constraints.
- Protect user-generated content. User uploads, notes, names, links, and location data must be treated as untrusted until moderated or escaped.
- Preserve privacy. Exact hive coordinates, owner emails, and private moderation data must not leak through public queries or public pages.
- Keep performance visible. Avoid unnecessary JavaScript, blocking third-party scripts, oversized images, layout shifts, and duplicated network calls.
- Keep the codebase simple. Use existing patterns before adding abstractions, dependencies, build steps, or frameworks.
- Do not leave dirty code. Remove dead code, debug logs, duplicated constants, stale comments, and half-finished UI states before finishing.
- Make database changes reversible in practice. Add SQL migration files for schema, RLS, Storage, trigger, or policy changes, and apply them deliberately.
- Verify behavior after edits. At minimum, check diffs, run available static checks, and inspect affected flows. If a tool is unavailable, state that clearly.
- Do not overwrite unrelated user work. Check `git status` before committing, and only stage files related to the task.
- Push only when asked, unless the user has already asked for the current change to go to GitHub.

## Supabase Rules

- Never commit service role keys.
- The anon key may exist in frontend code only when RLS and Storage policies enforce the real permissions.
- Any user-owned data mutation must be backed by `auth.uid()` checks or equivalent database enforcement.
- Admin-only behavior must be enforced in the database, not only with `ADMIN_EMAIL` checks in JavaScript.
- Public pages should only select fields that are intentionally public.
- User photos must remain private until admin approval. Store pending uploads separately from published image references.

## Frontend Rules

- Escape user-provided text before inserting with `innerHTML`; prefer `textContent` when possible.
- Keep UI states explicit: loading, empty, error, pending approval, approved, rejected.
- Mobile layout matters. Do not add controls that overflow compact screens.
- For maps, avoid exposing exact private locations unless the user explicitly opted out of approximation.
- Images should have stable dimensions, alt text, and should not cause layout jumps.

## Review Checklist

Before finalizing work, check:

- Does this expose private data, exact location, or unmoderated media?
- Can a non-admin bypass the UI and still perform the action through Supabase directly?
- Does the public map still only show approved hives?
- Does admin approval/rejection behave predictably?
- Are Storage bucket policies consistent with the intended visibility?
- Are changed files scoped to the request?
- Is the local branch clean or are pending changes clearly explained?

## Communication

Be direct with the user. Explain risks and tradeoffs concretely. If something is blocked by credentials, missing tools, or Supabase policy, say exactly what is missing and what action is needed.
