# Staff Directory

A searchable user directory built with Vite, React, TypeScript, Tailwind CSS, and React Router.
Data comes from [JSONPlaceholder](https://jsonplaceholder.typicode.com/users).

- Browse all users in a responsive grid
- Real-time, case-insensitive search by name, username, or email
- A–Z / Z–A sort toggle
- Deep-linkable profile pages at `/users/:id`
- Search and sort are mirrored into the URL, so a filtered view survives a reload, can be shared, and comes back intact when you return from a profile
- Light and dark themes
- Loading, error, and empty states for every request

---

## Running it locally

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

The app starts on <http://localhost:5173>.

### Scripts

| Command              | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Start the dev server                              |
| `npm run build`      | Typecheck, then build for production into `dist/` |
| `npm run preview`    | Serve the production build locally                |
| `npm test`           | Run the test suite once                           |
| `npm run test:watch` | Run tests in watch mode                           |
| `npm run typecheck`  | Typecheck without emitting                        |
| `npm run lint`       | Run ESLint                                        |
| `npm run format`     | Format with Prettier                              |

### Configuration

The API base URL is read from `VITE_API_BASE_URL` and falls back to JSONPlaceholder when unset.
Copy `.env.example` to `.env` to point the app at a different backend.

---

## Project structure

The app uses a feature-driven layout. Code is grouped by what it is _for_, not by what
kind of file it is, so everything about users lives in one directory.

```
src/
├── app/                        # Application shell
│   ├── router.tsx              # The full route table, in one readable place
│   └── RootLayout.tsx          # Header, footer, skip link, content well
│
├── components/                 # Shared, feature-agnostic UI
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── NotFoundPage.tsx
│   ├── RouteErrorBoundary.tsx
│   └── ThemeToggle.tsx
│
├── features/
│   └── users/
│       ├── index.ts            # The feature's public API — see note below
│       ├── api/
│       │   ├── usersApi.ts     # The only module that knows the endpoints
│       │   └── usersCache.ts   # Session cache so Back doesn't refetch the list
│       ├── components/         # SearchBar, SortToggle, UserCard, skeletons
│       ├── hooks/              # useUsers, useUser
│       ├── pages/              # UserListPage, UserDetailPage
│       ├── types/user.ts       # Domain types + runtime guards
│       └── utils/format.ts     # Initials, addresses, tel/website hrefs
│
├── lib/http.ts                 # Shared fetch wrapper and error mapping
├── test/                       # Vitest setup and fixtures
├── App.tsx
├── main.tsx
└── index.css                   # Tailwind theme tokens and base styles
```

Tests sit next to the code they cover (`useUsers.test.ts` beside `useUsers.ts`) rather than in a
mirrored `__tests__` tree. When a file moves, its test moves with it, and it is immediately
obvious which modules have no coverage.

---

## Architectural decisions

### Why a feature-driven structure

A `components/` + `hooks/` + `pages/` split scales by file type, which means one feature's code
ends up scattered across three directories. Grouping by feature means adding a second domain —
teams, say — is a new folder rather than edits in five existing ones, and deleting a feature is
deleting a directory.

Each feature exposes a barrel (`features/users/index.ts`). Everything outside the feature imports
from that barrel, never from a deep path. The boundary is enforceable and reviewable in one file,
and the internals stay free to move.

### Why native state management instead of Redux, Zustand, or TanStack Query

This was the decision I spent the most time on, and I want to be straight about the tradeoff
rather than present it as obvious.

The app has two endpoints, no mutations, no cache invalidation, no cross-feature shared state, and
no optimistic updates. All the state is either server data owned by one hook or UI state owned by
one page. A global store would add a provider, actions, and indirection to solve a coordination
problem that does not exist here.

TanStack Query is the closest call, and it is the right answer for most production apps of this
shape — it would give caching, deduplication, and background refetching for roughly 13 kB. I left
it out because the brief is a 48-hour exercise assessing how I build from primitives, and because
`useUsers` reaches ~120 lines including its abort handling and retry logic. If this were going to
production with more endpoints, I would add it on day one.

The core of the decision is how `useUsers` derives state:

```ts
const users = useMemo(() => {
  const filtered = query ? allUsers.filter(...) : allUsers;
  return filtered.slice().sort(...);
}, [allUsers, query, sortOrder, searchFields]);
```

Filtering and sorting are **derived**, not stored. Keeping a separate `filteredUsers` in state
would create a second source of truth that has to be kept in sync on every keystroke, sort toggle,
and refetch — the classic source of "the list shows the wrong thing" bugs. With one source of
truth (`allUsers` + `query` + `sortOrder`), the displayed list cannot drift.

### Why components hold no fetching logic

Pages read from hooks and render. `UserListPage` has no `fetch`, no `useEffect` for data, and no
error parsing. That makes the hook testable without a DOM and the page testable without a network,
which is why the suite splits cleanly into hook unit tests and page integration tests.

### Why the detail page fetches its own record

`UserDetailPage` calls `/users/:id` rather than reading from a list in memory. It costs one extra
request, and it means `/users/3` works as a pasted link, a bookmark, or a hard refresh. A profile
page that only works if you arrived from the list is not really a route.

### Why the list is cached outside the component tree

`UserListPage` unmounts when the router navigates to `/users/:id` and remounts when the user
presses Back — that is how React Router's route swapping works, not a bug. Without something
outside the component tree to remember the result, that remount re-ran `useUsers`' effect from
scratch: a fresh loading state and a fresh network request for data that had not changed.

`usersCache.ts` is one module-level variable holding the resolved list, plus a de-duper so
concurrent callers (including React 18 StrictMode's mount → unmount → mount replay in development)
share one in-flight request instead of firing two. `useUsers` seeds its initial state from the
cache via a lazy initializer, so a warm remount renders the real list on the first frame — no
loading flash, no second request. `refetch()` invalidates the cache before re-fetching, so the
retry button on the error state still reaches the network.

This is deliberately not a general-purpose cache — no TTL, no per-id keys, no invalidation policy.
It solves the one coordination problem this app has: share one fetch's result across every mount of
one hook. It is the same reasoning as the "why native state management" section above, applied one
layer lower — reach for the smallest thing that closes the actual gap, not the general solution to
a problem the app doesn't have.

### Why search and sort live in the URL

The requirement was that "Back to Directory" preserves the previous state. Router state would do
it, but mirroring `?q=` and `?sort=` into the URL gets the same result plus shareable filtered
views and state that survives a refresh. Hook state stays the single source of truth; the URL is a
mirror written with `replace: true` so typing does not fill the history stack.

### Runtime validation at the network boundary

`response.json()` is typed `any`. Without a guard, a malformed payload becomes a render-time crash
somewhere deep in a component. `isUser` / `isUserArray` check the shape in `usersApi.ts`, so a bad
response surfaces as a normal, retryable error state and every consumer can treat `User` as a
guarantee.

### Styling

Tailwind v4 with a small token layer in `index.css` — semantic names (`canvas`, `surface`, `ink`,
`muted`, `line`, `accent`) rather than raw palette values. Dark mode re-points the same tokens, so
no component carries a `dark:` variant for color, and the theme is switched by a data attribute
set before first paint to avoid a flash.

---

## Testing

53 tests across 5 files, run with Vitest and React Testing Library.

```bash
npm test
```

| File                        | Covers                                                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useUsers.test.ts`          | Fetch lifecycle, A–Z/Z–A sorting, case-insensitive and partial search, whitespace handling, empty state, HTTP and network failures, malformed payloads, retry recovery, session-cache reuse, concurrent-mount de-duplication, and the unmount-before-resolve safety net |
| `UserCard.test.tsx`         | Rendered fields, profile link, search params carried into the link, accessible name, single tab stop, initials derivation including honorifics                    |
| `UserListPage.test.tsx`     | Loading → loaded flow, live filtering, empty state and recovery (including a zero-users-from-the-API result, distinct from a no-matches search), sort toggle, query and sort restored from the URL, error state with working retry |
| `UserDetailPage.test.tsx`   | All required fields, correct endpoint, `mailto:`/`tel:` link generation, both back-navigation paths, 404 handling, non-numeric id guard                            |
| `UserNavigation.test.tsx`   | List → profile → Back with both routes mounted together: the list is not refetched, renders immediately from cache, and the search filter survives the round trip |

Tests assert on what a user perceives — roles, labels, visible text — rather than on component
internals, so they survive refactors. `fetch` is stubbed per test via helpers in
`src/test/fixtures.ts`.

Two accessibility bugs were found by writing these tests, not by reading the code:

1. The result count rendered twice — once visibly, once in a screen-reader-only live region — so
   assistive tech announced it twice. Collapsed into one always-mounted `role="status"` region.
   (Live regions must exist in the DOM _before_ their content changes to announce reliably, which
   is why it is rendered unconditionally rather than only once results load.)
2. Two buttons shared the accessible name "Clear search". The empty-state CTA is now "Show
   everyone", which is also clearer about what pressing it does.

---

## Accessibility

- Every interactive element has a visible focus ring, defined once in `index.css`
- Each card is a single link, so the grid is one tab stop per person
- Result counts are announced via a polite live region
- Errors use `role="alert"` so failures are announced when they replace the loading state
- A skip link jumps past the header
- `prefers-reduced-motion` disables all animation
- Icons are `aria-hidden`; their meaning is carried by adjacent text or an accessible name

---

## Assumptions

1. **The dataset is small and unpaginated.** JSONPlaceholder returns exactly 10 users with no
   pagination parameters, so filtering and sorting run client-side over the full list. This is the
   assumption most likely to be wrong in a real system — see the first improvement below.
2. **Search should cover username and email, not just name.** The brief specified name. Someone
   who remembers only an email address is a real case, so `useUsers` matches all three by default
   and exposes a `searchFields` option to narrow it. A test pins the name-only behaviour.
3. **Sorting is by full name, not surname.** The API provides one `name` string containing
   honorifics and suffixes. Parsing surnames out of it reliably is not possible, so the sort is on
   the whole string and uses `localeCompare` with base sensitivity so case and accents do not
   affect ordering.
4. **No authentication.** The API is public; there is no login, no authorization, and no
   per-user data.
5. **Phone numbers carry extensions.** Values like `1-770-736-8031 x56442` are displayed intact
   but stripped to a dialable number for the `tel:` link.
6. **Websites arrive without a scheme.** `hildegard.org` gets `https://` prepended for the link.
7. **`prefers-color-scheme` is a sensible default theme**, with an explicit override persisted to
   `localStorage`.

---

## What I would do with more time

**Pagination and virtualization.** Ten records means the whole list fits in memory and renders in
one pass. At a few hundred, filtering client-side is still fine but rendering is not — I would add
`@tanstack/react-virtual` to the grid. At a few thousand, search has to move server-side, which
changes `useUsers` from a filter-in-memory hook to a debounced query hook. I designed the hook's
return shape with that migration in mind, but did not build for a scale the API cannot produce.

**Debounced input, once search is server-side.** Right now filtering ten in-memory records is
instant and a debounce would only add perceived lag. The moment a keystroke costs a request, it
becomes necessary.

**Extend the cache to the detail endpoint.** The list is cached (`usersCache.ts`), so navigating
back to it is free after the first load — but opening the same profile twice still fetches it
twice, since `useUser` has no cache of its own. The pattern is proven; it's a matter of applying it
to a second, keyed-by-id dataset. TanStack Query would replace both hand-rolled caches with one
well-tested one, at the bundle-size cost discussed above.

**End-to-end tests.** The current suite mocks `fetch`. Playwright covering search → open profile →
back-with-state-preserved would test the real router, the real network layer, and the real browser
back button, which is exactly where the current tests are weakest.

**Trim the bundle.** The build is 146 kB gzipped and Framer Motion is roughly a third of it, for
one stagger and one page fade. The brief asked for it, but honestly CSS transitions would have
covered this scope. `LazyMotion` with `domAnimation` would cut it substantially, or dropping the
dependency entirely would cut it further.

**Visual regression testing.** The design relies on a token system across two themes. Chromatic or
Playwright screenshots would catch contrast and layout regressions that unit tests cannot see.

**Keyboard shortcuts.** `/` to focus search and arrow-key navigation through the grid would make
the directory noticeably faster to use for anyone who lives in it.
