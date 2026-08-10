# Engineering standards

Portable practices. Nothing here depends on a particular design, brand, or
layout — carry this file into the new build as-is.

Every rule exists because something specific went wrong or was about to. Where a
rule is violated, justify it in the commit message rather than deleting it.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19.2 | `ref` as a prop, native document metadata, Suspense |
| Build | Vite 8 | Rolldown, fast HMR |
| Language | TypeScript 6, `strict` | Non-negotiable on anything that ships publicly |
| Styling | Tailwind 4 via `@tailwindcss/vite` | CSS-first config through `@theme`, no JS config file |
| Rendering | React prerendered with `renderToString`, then hydrated | Every URL is a complete document that renders without JavaScript; the bundle only upgrades it |
| Lint | oxlint, react rules **explicitly enabled** | They are off by default. Assuming otherwise is silently false |
| Host | Static files — GitHub Pages, Cloudflare, anywhere | Output is plain HTML; the host is not a dependency |
| Forms | Web3Forms — native HTML `POST`, with `fetch` layered over it | The POST works with JavaScript disabled; the fetch only removes the need for an absolute redirect URL |

**Dependency rule:** every new dependency is justified in writing, once, at the
point it is added. Prefer the platform.

### Keep a corrections log

When research or reality contradicts an earlier decision, record the correction
in this file rather than silently editing the old line. Otherwise the same wrong
assumption gets reintroduced by the next person — or by you, in three weeks.

Real examples from this project's log:

- React Router **v8**, not v7 — v7 is security-updates-only.
- `eslint-plugin-react-hooks` is at **v7**, not v6.
- oxlint's react rules are **off by default**.
- Cloudflare steers new static projects to **Workers**, not Pages.
- React 19's **function form actions cannot be used on a page that must work
  without JavaScript.** `<form action={fn}>` server-renders as
  `action="javascript:throw new Error('React form unexpectedly submitted.')"`
  and drops `method` and `encType` outright, so the form does nothing at all
  with the bundle off. `useFormStatus` and `useActionState` only report pending
  for a function action, so they go with it. §2.3 lists all three; the form in
  `sections/InvolvedForm.tsx` uses `onSubmit` + `preventDefault()` instead, and
  says so at the top of the file.
- **`CSS.supports('selector(:has(*))')` does not tell you a rule applied.** It
  asks whether the engine can parse `:has()`, which is true in every current
  browser whether or not the stylesheet ever arrived. An earlier version of
  `InvolvedForm.tsx` gated its `disabled` attributes on it; with the `<link>`
  removed from the built page — a 404 on the hashed asset, Firefox's
  View ▸ Page Style ▸ No Style, a user stylesheet — the hydrated page showed
  `#drop-address` and `#question` fully visible and refusing input. Reproduced,
  not theorised. **If behaviour depends on what CSS did, read `getComputedStyle`;
  do not infer it from a feature test.**
- **Web3Forms takes `Reply-To` from a field named `email`, lowercase, and the
  form's human-readable naming scheme has exactly one reserved name — that one.**
  The field shipped as `name="Email"` to match its siblings, which are written as
  the labels the campaign reads in its inbox. Every reply-to passage in the
  vendor's docs writes lowercase `` `email` ``, and there is not one
  `name="Email"` anywhere in their corpus. The single capital-`Email` sentence
  they publish is on the **Pro autoresponder** page — recipient selection, not
  header construction — and was added two years after the reply-to page was last
  edited. Nothing states the match is case-insensitive; HTML control names are
  case-sensitive strings by spec. **When a vendor reserves a name, spell it their
  way and take the cosmetic loss.** `src/components/sections/InvolvedForm.tsx`
  now carries the exception in its docblock so it does not get tidied back.

---

## 2. React practices

### 2.1 No hand-written memoization

The React Compiler is not enabled here. Do not reach for `useMemo`,
`useCallback`, or `React.memo` anyway — on a content site there is no render
pressure to relieve, so they are pure cost: more code, more dependency arrays to
get wrong, no user-visible gain.

The only justification is a **profiler trace** showing a real problem. Attach it
to the review.

### 2.2 You probably don't need an effect

`useEffect` synchronizes with systems **outside** React. It is not a
general-purpose "run some code" hook.

| You want to… | Use |
|---|---|
| Derive a value from props/state | Compute it during render |
| Respond to a user action | An event handler |
| Reset state when a prop changes | A `key` on the component |
| Sync `document.title` | Render `<title>` — React 19 hoists it |
| Subscribe to an external store | `useSyncExternalStore` |

An effect whose only job is `setState` from other state is a bug. Any effect
that survives review must name the external system it synchronizes with.

### 2.3 Use React 19's API, don't polyfill it

- **`ref` is a normal prop.** No `forwardRef`.
- **Document metadata is native.** `<title>`, `<meta>`, `<link rel="canonical">`
  hoist to `<head>` from anywhere in the tree. No `react-helmet`.
- **Form primitives:** `useActionState`, `useFormStatus`, `useOptimistic` —
  **except on a form that must submit without JavaScript.** See the corrections
  log in §1: a function action replaces the form's `action` with a `javascript:`
  URL and discards its `method`.
- **`<Suspense>` + error boundaries** are the loading and failure pattern — not
  `isLoading`/`error` triplets threaded through props.

### 2.4 Content is data, not JSX

All user-facing copy lives in typed modules under `src/content/`. Components map
over it. Nothing is hardcoded in markup.

This is the single highest-leverage rule in the file. It is why page components
stay at 40 lines instead of 800, why a non-developer can find the sentence they
want changed, and why a design rebuild does not put the copy at risk.

### 2.5 Composition over configuration

```tsx
// No
<Section variant="hero" size="lg" theme="dark" hasImage imagePos="right" cta />

// Yes
<Section>
  <Section.Media>…</Section.Media>
  <Section.Body>…</Section.Body>
</Section>
```

More than ~6 props, or any two mutually exclusive booleans, means split it.

### 2.6 TypeScript

`strict` plus `noUncheckedIndexedAccess`. No `any` — `unknown` at boundaries,
then narrow. Type the boundary; let inference handle the interior. Discriminated
unions over optional-field soup.

---

## 3. Architecture

```
src/
  entry-server.tsx     # build-time render entry
  pages/               # one file per page; thin, composes sections
  components/
    ui/                # dumb, reusable, zero domain knowledge
    layout/            # Header, Footer, Page shell
    sections/          # composed from ui/
  content/             # typed copy and data — the source of truth
  styles/
scripts/
  prerender.mjs        # writes the static HTML
```

**Dependency direction is one-way:**

```
pages → sections → ui
   ↓        ↓
     content / lib
```

`ui/` imports from nothing but utilities. It never knows what the site is about.
Nothing imports upward. No sibling reaches into another feature's internals.

**Hard limits:** a component file over ~150 lines gets split. Tests colocate
with source. No barrel files — they defeat tree-shaking and hide the graph.

---

## 4. Anti-bloat

1. **Rule of three.** No abstraction until the third real repetition. Two
   similar blocks are a coincidence.
2. **No UI kit** unless 3+ components genuinely need it.
3. **No animation library** for what CSS transitions already do.
4. **No state manager** on a content site.
5. **No premature config** — no theming system, no i18n, no CMS abstraction
   until there is a second theme, a second language, or an actual CMS.
6. **Delete, don't comment out.** Git remembers.

---

## 5. Accessibility and performance are gate conditions

Not follow-up work. A build that fails these does not ship.

- Semantic landmarks, one `<h1>` per page, headings in order.
- Everything keyboard-reachable with a **visible** focus ring. Never
  `outline: none` without a replacement.
- Contrast: **4.5:1** body text, **3:1** large text and UI boundaries.
  Measure it. Do not eyeball it — see §7.
- Real `<label>` elements. `<fieldset>`/`<legend>` for grouped inputs — a
  `<label>` cannot label a group.
- Native `required` and browser validation before hand-rolled error handling.
- Respect `prefers-reduced-motion`.
- Budget: LCP < 2.0s, CLS < 0.1, JS < 150 KB gzipped. Images get explicit
  `width`/`height` so layout cannot shift.

---

## 6. Verification patterns

These are the mechanisms that caught real problems. They generalize.

### Visible placeholders, never plausible ones

Unknown legally- or factually-significant values render as a conspicuous
`INSERT HERE` — bold, marked, and announced to screen readers.

The failure mode this prevents: a realistic-looking dummy value **survives a
proofread**. A fake phone number in the `555` range and an email at an
unregistered domain both look real enough to ship. `INSERT HERE` cannot.

### Approval gates in the render path

Content the client has not personally approved sits behind an exported boolean:

```ts
export const PRIORITIES_APPROVED_BY_CANDIDATE = false
```

It renders in development behind a loud banner — an invisible section cannot be
reviewed — and the production build refuses to run while the flag is false.

### The forbidden-strings scan

The build hard-fails if any of these appear in the output. It is the only
mechanism that actually prevents regression, because a rule living in a comment
gets re-broken by the next person who reads the original source instead of the
corrected module.

Include: every value known to be wrong, every placeholder, `href="#"`, and any
phrasing established as harmful.

### Measure before you rule something out

A scrimmed gradient was rejected here as "covering up a contrast problem." When
actually computed it measured **8.13:1** — comfortably passing. The rejection
was wrong and cost a rebuild.

Compute the ratio. Do not reason about it.

---

## 7. Review protocol

Nothing advances without passing its gate. **Reviewers are instructed to find
problems, not to grant approval.** A review returning "LGTM" with no findings
and no record of what was attacked is a failed review and gets re-run.

Every reviewer outputs either findings — each with `file:line`, a concrete
failure scenario, and a severity — or an explicit negative result naming what
was attacked and why it held.

Reviewers run **independently** so they do not anchor on each other. Reviewers
report; a separate pass fixes; the gate re-runs on the diff.

| Gate | When | Focus |
|---|---|---|
| **0 — Architecture** | Before any code | Is this the simplest thing that works? What does it make hard to change in three months? |
| **1 — Implementation** | Per feature, on the diff | Correctness including empty/one/many. Dependency direction. Accessibility. Is there a simpler version that is not worse? |
| **2 — Adversarial** | Before deploy | Independent reviewers, distinct lenses: correctness, accessibility, performance, SEO, responsive, **content integrity** |
| **3 — Pre-launch** | Final | All findings resolved or accepted in writing. Budgets hold. Built output verified with `curl`, not devtools |

### Two hard-won lessons about running reviews

**Do not let reviewers race a moving repo.** Three architecture proposals were
generated here while content modules were being written concurrently. All three
were authored against a repo state that no longer existed, and all three
proposed deleting verified work. Freeze the tree, then review it.

**Content integrity deserves its own lens.** Generated drafts produce
confident-sounding statistics with authoritative-looking source labels. In this
project, three of four cited figures were wrong and one comparison was measured
against a year with no data at all. Verify every number against a primary
source before it ships under someone's name.

---

## 8. Definition of done

Reviewed at its gate, findings resolved, tests pass, budgets hold, and the
**built output** — not the dev server — verified.
