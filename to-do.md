# What's Your Type? — Implementation To-Do List

> Work through phases in order. Most tasks in a later phase depend on something in the phase before it.
> Anything marked 🔑 is a blocker for the next phase — don't skip them.

---

## Phase 1 — Project Scaffolding
*Get both apps running and talking to each other before writing any real logic.*

### Repo & Config
- [x] 🔑 `git init` in project root, create `client/` and `server/` folders
- [x] Create root `.gitignore`:
  - Add `node_modules/`
  - Add `.env`
  - Add `client/dist/`
- [x] Create `server/.env`:
  - Add `PORT=3001`
  - Add `DB_PATH=./pokesmash.db`
- [x] Write a `README.md` placeholder — just the project name and "setup instructions coming soon"

### Server Bootstrap
- [x] 🔑 `cd server && npm init -y`
- [x] 🔑 Install dependencies: `npm install express cors dotenv`
- [x] 🔑 `server/index.js`:
  - Import and call `dotenv.config()`
  - Create Express app
  - Register `express.json()` middleware
  - Register `cors()` middleware
  - Add `GET /api/health` route that returns `{ ok: true }`
  - Call `app.listen(process.env.PORT)`
- [ ] Run `node index.js` and confirm `GET /api/health` returns `{ ok: true }`

### Database Setup
- [x] 🔑 Install `better-sqlite3`: `npm install better-sqlite3`
- [x] 🔑 `server/db.js`:
  - Import `better-sqlite3` and open connection to `process.env.DB_PATH`
  - Write and run `CREATE TABLE IF NOT EXISTS pokemon` with all columns: `id`, `name`, `sprite_url`, `type_1`, `type_2`, `generation`, `is_legendary`, `is_mythical`
  - Write and run `CREATE TABLE IF NOT EXISTS sessions` with columns: `id` (TEXT, UUID), `created_at`, `last_active_at`
  - Write and run `CREATE TABLE IF NOT EXISTS votes` with columns: `id` (autoincrement), `session_id` (FK), `pokemon_id` (FK), `decision`, `voted_at`
  - Export the `db` instance
- [x] Import `db.js` in `server/index.js` so tables are created on every server start
- [ ] Confirm no errors on startup — check that the `.db` file appears on disk

### Client Bootstrap
- [x] 🔑 `cd client && npm create vite@latest . -- --template react`
- [x] 🔑 `npm install react-router-dom`
- [x] `src/main.jsx`:
  - Import `BrowserRouter` from `react-router-dom`
  - Wrap `<App />` in `<BrowserRouter>`
- [x] `src/App.jsx`:
  - Import `Routes` and `Route` from `react-router-dom`
  - Add placeholder `<Route>` for `/` → `<Home />`
  - Add placeholder `<Route>` for `/vote` → `<Vote />`
  - Add placeholder `<Route>` for `/results/:sessionId` → `<Results />`
  - Add placeholder `<Route>` for `/my-pokemon/:sessionId` → `<MyPokemon />`
  - Add placeholder `<Route>` for `/leaderboard` → `<LeaderboardPage />`
  - Create stub components inline for now (just return a `<div>` with the page name)
- [x] `vite.config.js`:
  - Add a `server.proxy` entry so `/api` requests in dev forward to `http://localhost:3001`
- [ ] Run `npm run dev` and confirm the client loads with no console errors

---

## Phase 2 — Seed Script
*Must be done before any voting features — the database needs Pokémon data first.*

### `server/seed.js`
- [x] 🔑 Write `sleep(ms)` helper — returns a `Promise` that resolves after `ms` milliseconds, used to add delays between batches
- [x] 🔑 Write `fetchWithRetry(url, retries = 3)` helper:
  - Call `fetch(url)`
  - If the response is not `ok`, wait 1 second and retry
  - After `retries` failures, log the URL and throw
- [x] 🔑 Fetch the master Pokémon list:
  - Call `fetchWithRetry('https://pokeapi.co/api/v2/pokemon?limit=2000')`
  - Parse JSON and extract the `results` array
  - Map to an array of numeric IDs by parsing the ID from the end of each result's `url` string (e.g. `.../pokemon/25/` → `25`)
- [x] 🔑 For each Pokémon ID, fetch and merge both endpoints:
  - `fetchWithRetry('https://pokeapi.co/api/v2/pokemon/:id')` → extract:
    - `name`
    - `sprites.other['official-artwork'].front_default` as `sprite_url`
    - `types[0].type.name` as `type_1`
    - `types[1]?.type.name ?? null` as `type_2`
  - `fetchWithRetry('https://pokeapi.co/api/v2/pokemon-species/:id')` → extract:
    - `generation.url` — parse the number from the URL (e.g. `.../generation/1/` → `1`) as `generation`
    - `is_legendary` (boolean)
    - `is_mythical` (boolean)
- [x] 🔑 Insert each Pokémon into the database:
  - Use `INSERT OR IGNORE INTO pokemon VALUES (...)` so re-runs are safe
  - Include all 8 fields: `id`, `name`, `sprite_url`, `type_1`, `type_2`, `generation`, `is_legendary`, `is_mythical`
- [x] Process in batches of 20:
  - Slice the full ID array into chunks of 20
  - After each batch, call `sleep(500)` to avoid hammering PokéAPI
  - Log progress after each batch: `console.log('Seeded 200 / 1025...')`
- [x] Wrap each individual Pokémon fetch in a `try/catch` — on error, log the failed ID and continue to the next rather than stopping the whole script
- [ ] Run `node seed.js` and confirm:
  - All ~1025 rows appear in the `pokemon` table
  - No row is missing `sprite_url`, `type_1`, or `generation`
- [x] Add `"seed": "node seed.js"` to `scripts` in `server/package.json`

---

## Phase 3 — Core API Routes
*Build and manually test every endpoint before touching the frontend.*

### `server/routes/pokemon.js`
- [x] 🔑 `GET /api/pokemon/session`:
  - Query `SELECT id FROM pokemon` to get all IDs as an array
  - Shuffle the array in place using a Fisher-Yates shuffle
  - Return `{ pokemon: [id, id, ...] }` — IDs only, not full rows (the client fetches each card individually on demand)
- [x] `GET /api/pokemon/:id`:
  - Query `SELECT * FROM pokemon WHERE id = ?`
  - Return `404` with `{ error: 'Not found' }` if no row matches
  - Otherwise return the full Pokémon row as JSON

### `server/routes/votes.js`
- [x] 🔑 `POST /api/votes`:
  - Read `{ sessionId, pokemonId, decision }` from `req.body`
  - Return `400` if `sessionId` or `pokemonId` is missing
  - Return `400` if `decision` is not one of `['smash', 'snuggle', 'pass', 'skip']`
  - Upsert session row: `INSERT OR IGNORE INTO sessions (id, created_at, last_active_at) VALUES (?, datetime('now'), datetime('now'))`
  - Update session activity: `UPDATE sessions SET last_active_at = datetime('now') WHERE id = ?`
  - Insert vote: `INSERT INTO votes (session_id, pokemon_id, decision, voted_at) VALUES (?, ?, ?, datetime('now'))`
  - Return `{ ok: true }`

### `server/routes/results.js`
- [x] 🔑 `GET /api/results/:sessionId` — build the aggregation in three steps:

  **Step 1 — top type per decision:**
  ```sql
  SELECT v.decision, p.type_1 AS type, COUNT(*) AS count
  FROM votes v
  JOIN pokemon p ON v.pokemon_id = p.id
  WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
  GROUP BY v.decision, p.type_1
  ORDER BY count DESC
  ```
  - In JavaScript, loop the results and pick the first (highest-count) `type` for each decision

  **Step 2 — top generation per decision:**
  ```sql
  SELECT v.decision, p.generation, COUNT(*) AS count
  FROM votes v
  JOIN pokemon p ON v.pokemon_id = p.id
  WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
  GROUP BY v.decision, p.generation
  ORDER BY count DESC
  ```
  - Same pattern — pick the first `generation` per decision

  **Step 3 — legendary rate per decision:**
  ```sql
  SELECT v.decision,
    SUM(CASE WHEN p.is_legendary = 1 OR p.is_mythical = 1 THEN 1 ELSE 0 END) AS legendary_count,
    COUNT(*) AS total
  FROM votes v
  JOIN pokemon p ON v.pokemon_id = p.id
  WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
  GROUP BY v.decision
  ```
  - Divide `legendary_count / total` per decision to get a rate between 0 and 1

- [x] Assemble and return the response object:
  ```json
  {
    "smashProfile":   { "topType": "Fire",  "topGeneration": 1, "legendaryRate": 0.12 },
    "snuggleProfile": { "topType": "Fairy", "topGeneration": 6, "legendaryRate": 0.40 }
  }
  ```
- [x] If no smash votes exist for the session, set `smashProfile: null` — do not error
- [x] If no snuggle votes exist for the session, set `snuggleProfile: null` — do not error

### `server/routes/myPokemon.js`
- [x] `GET /api/my-pokemon/:sessionId`:
  - Read optional `?decision=` from `req.query`
  - If `decision` query param is present:
    ```sql
    SELECT p.*, v.decision FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.session_id = ? AND v.decision = ?
    ORDER BY v.voted_at ASC
    ```
  - If no `decision` param:
    ```sql
    SELECT p.*, v.decision FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.session_id = ? AND v.decision IN ('smash', 'snuggle')
    ORDER BY v.voted_at ASC
    ```
  - Return the array of rows — each row includes all `pokemon` fields plus the `decision` field

### `server/routes/leaderboard.js`
- [x] `GET /api/leaderboard`:
  - Build the base query dynamically:
    ```sql
    SELECT p.id, p.name, p.sprite_url, p.type_1, p.type_2,
           v.decision, COUNT(*) AS vote_count
    FROM votes v
    JOIN pokemon p ON v.pokemon_id = p.id
    WHERE v.decision IN ('smash', 'snuggle', 'pass')
    [AND (p.type_1 = ? OR p.type_2 = ?)]   -- only if ?type= is present
    [AND p.generation = ?]                  -- only if ?generation= is present
    GROUP BY p.id, v.decision
    ORDER BY vote_count DESC
    ```
  - Push params into an array as optional clauses are added — don't concatenate user input directly into the SQL string
  - In JavaScript, split the flat results into three arrays by `decision`
  - Slice each to the top 10
  - Return:
    ```json
    {
      "smash":   [{ "id": 6, "name": "charizard", "vote_count": 412, "sprite_url": "...", ... }],
      "snuggle": [...],
      "pass":    [...]
    }
    ```

### Mount Routes & Error Handler
- [x] `server/middleware/errorHandler.js`:
  - Export a function with signature `(err, req, res, next)`
  - Log `err.message` to the console
  - Return `res.status(err.status || 500).json({ error: err.message || 'Internal server error' })`
- [x] In `server/index.js`:
  - Import and mount `pokemonRouter` at `/api/pokemon`
  - Import and mount `votesRouter` at `/api/votes`
  - Import and mount `resultsRouter` at `/api/results`
  - Import and mount `myPokemonRouter` at `/api/my-pokemon`
  - Import and mount `leaderboardRouter` at `/api/leaderboard`
  - Register `errorHandler` as the very last `app.use()` call
- [ ] Manually test every endpoint before moving on:
  - [ ] `GET /api/pokemon/session` returns a shuffled array of ~1025 IDs
  - [ ] `GET /api/pokemon/25` returns Pikachu's full data
  - [ ] `POST /api/votes` with a valid body returns `{ ok: true }`
  - [ ] `POST /api/votes` with an invalid `decision` returns `400`
  - [ ] `GET /api/results/:sessionId` returns both profiles after casting a few test votes
  - [ ] `GET /api/results/:sessionId` returns `smashProfile: null` when no smash votes exist
  - [ ] `GET /api/my-pokemon/:sessionId` returns the smashed/snuggled Pokémon list
  - [ ] `GET /api/my-pokemon/:sessionId?decision=smash` returns only smash votes
  - [ ] `GET /api/leaderboard` returns three ranked arrays
  - [ ] `GET /api/leaderboard?type=fire` returns only Fire-type Pokémon rankings

---

## Phase 4 — Theme System & Shared UI
*Build the visual foundation before any pages — everything else depends on it.*

### `src/theme.css`
- [x] 🔑 Define base CSS custom properties on `:root` (neutral/default state):
  - `--color-primary: #888`
  - `--color-primary-light: #eeeeee`
  - `--btn-radius: 8px`
  - `--btn-font-weight: 400`
  - `--card-radius: 12px`
  - `--transition-speed: 150ms`
- [x] 🔑 Define Smash theme overrides on `[data-theme="smash"]`:
  - `--color-primary: #cc2200`
  - `--color-primary-light: #ffe5e0`
  - `--btn-radius: 4px`
  - `--btn-font-weight: 700`
  - `--card-radius: 4px`
- [x] 🔑 Define Snuggle theme overrides on `[data-theme="snuggle"]`:
  - `--color-primary: #e8619a`
  - `--color-primary-light: #fde8f2`
  - `--btn-radius: 20px`
  - `--btn-font-weight: 400`
  - `--card-radius: 20px`
- [x] Add `transition: background-color var(--transition-speed), border-radius var(--transition-speed)` to any element that reads these variables so the theme shift animates smoothly
- [x] Create `src/ThemeContext.jsx`:
  - Create a context with `createContext`
  - `ThemeProvider` component: holds `theme` in `useState('neutral')`, sets `document.body.dataset.theme = theme` in a `useEffect` whenever `theme` changes, wraps children in the context provider
  - Export `useTheme()` hook that returns `{ theme, setTheme }`
- [x] Wrap `<App />` in `<ThemeProvider>` in `main.jsx`
- [ ] Smoke test: temporarily add two buttons to `Home.jsx` that call `setTheme('smash')` and `setTheme('snuggle')` — confirm the CSS variables swap and animate

### `src/utils/api.js`
- [x] 🔑 Write `apiFetch(path, options = {})`:
  - Prepend `/api` to `path`
  - Default headers to `{ 'Content-Type': 'application/json' }`
  - Call `fetch`, check `response.ok`, throw an `Error` with the status if not ok
  - Parse and return the JSON body
- [x] `getSession()` → calls `apiFetch('/pokemon/session')`, returns the `pokemon` ID array
- [x] `castVote(sessionId, pokemonId, decision)` → calls `apiFetch('/votes', { method: 'POST', body: JSON.stringify({...}) })`
- [x] `getResults(sessionId)` → calls `apiFetch('/results/${sessionId}')`, returns `{ smashProfile, snuggleProfile }`
- [x] `getMyPokemon(sessionId, decision = null)`:
  - Builds query string: `decision ? '?decision=' + decision : ''`
  - Calls `apiFetch('/my-pokemon/${sessionId}' + queryString)`
- [x] `getLeaderboard(filters = {})`:
  - Builds query string from `filters.type` and `filters.generation` if present using `URLSearchParams`
  - Calls `apiFetch('/leaderboard?' + params.toString())`

### `src/hooks/useSession.js`
- [x] On mount, read `pokesmash_session_id` from `localStorage` and set as initial `sessionId` state
- [x] On mount, read and `JSON.parse` `pokesmash_pokemon_list` from `localStorage` and set as initial `pokemonList` state
- [x] `createSession()`:
  - Generate a UUID using `crypto.randomUUID()`
  - Call `getSession()` to fetch the shuffled ID list from the server
  - Save UUID to `localStorage` as `pokesmash_session_id`
  - Save ID list to `localStorage` as `pokesmash_pokemon_list` (JSON stringified)
  - Update both state values so consumers re-render
- [x] `clearSession()`:
  - Remove `pokesmash_session_id` and `pokesmash_pokemon_list` from `localStorage`
  - Reset `sessionId` to `null` and `pokemonList` to `[]`
- [x] Expose `{ sessionId, pokemonList, createSession, clearSession }`

### `src/hooks/useResults.js`
- [x] Accept `sessionId` as a parameter
- [x] On mount (and whenever `sessionId` changes), call `getResults(sessionId)` and store the result in state
- [x] Track `loading` boolean — `true` before fetch resolves, `false` after
- [x] Track `error` state — set the caught error object if the fetch throws
- [x] `refresh()`: re-call `getResults(sessionId)` and update state — does NOT reset `loading` to `true` to avoid the panel flickering blank on each vote
- [x] Expose `{ smashProfile, snuggleProfile, loading, error, refresh }`

### Shared Components
- [x] 🔑 `components/TypeBadge.jsx`:
  - Accept a `type` prop (lowercase string, e.g. `"fire"`)
  - Define a `TYPE_COLORS` object mapping all 18 types to `{ bg, text }` hex values
  - Render a `<span>` with inline `backgroundColor` and `color` from the map
  - Apply consistent padding and border-radius to make it look like a pill
  - Fall back to gray `bg` and white `text` if the type is not found in the map
- [x] `components/ProgressBar.jsx`:
  - Accept `seen` and `total` props
  - Render label: `"{seen} / {total} seen"`
  - Render a bar container with a filled inner div whose `width` is `${(seen / total) * 100}%`
  - Use `--color-primary` for the fill color so it inherits the active theme
  - Add `transition: width 200ms ease` so the bar fills smoothly after each vote

---

## Phase 5 — Voting UI
*The core loop. Depends on Phase 3 (API routes) and Phase 4 (theme system).*

### `components/PokemonCard.jsx`
- [x] Accept a `pokemon` prop with shape `{ id, name, sprite_url, type_1, type_2 }`
- [x] Render `<img src={pokemon.sprite_url} alt={pokemon.name} />`
- [x] Render `pokemon.name` as a heading (capitalize the first letter)
- [x] Render `<TypeBadge type={pokemon.type_1} />`
- [x] If `pokemon.type_2` is not null, render a second `<TypeBadge type={pokemon.type_2} />`
- [x] Add a CSS `@keyframes` entry animation — `opacity: 0 → 1` and `transform: translateY(12px) → translateY(0)` over 200ms
- [x] Apply `key={pokemon.id}` on the component in `Vote.jsx` (not here) so React unmounts and remounts it — triggering the animation — on each new Pokémon
- [x] Style the card container using `var(--card-radius)` and `var(--color-primary-light)` as background so it visually responds to the active theme

### `components/VoteButtons.jsx`
- [x] Accept `onVote(decision)` and `onSkip()` as props
- [x] Call `useTheme()` to get `setTheme`
- [x] Smash button:
  - `onMouseEnter` → `setTheme('smash')`
  - `onMouseLeave` → `setTheme('neutral')`
  - `onClick` → `onVote('smash')`
  - Style uses `var(--color-primary)`, `var(--btn-radius)`, `var(--btn-font-weight)` — these animate when the theme changes
- [x] Snuggle button:
  - `onMouseEnter` → `setTheme('snuggle')`
  - `onMouseLeave` → `setTheme('neutral')`
  - `onClick` → `onVote('snuggle')`
- [x] Pass button:
  - No theme change on hover
  - `onClick` → `onVote('pass')`
  - Always neutral/muted styling regardless of active theme
- [x] Skip button:
  - Ghost/outline style, always neutral
  - `onClick` → `onSkip()` — does NOT call `onVote`, no API call is made

### `components/ResultsPanel.jsx`
- [x] Accept `sessionId`, `isOpen`, and `onClose` as props
- [x] Call `useResults(sessionId)` internally
- [x] When `isOpen` transitions from `false` to `true`, call `refresh()` to pull fresh data
- [x] Render as a fixed overlay panel:
  - `transform: translateX(100%)` when closed
  - `transform: translateX(0)` when open
  - `transition: transform 200ms ease`
- [x] When open, render two columns:
  - **Smash Profile**: heading, `<TypeBadge>` for `topType`, "Favourite Generation: Gen N", "N% legendary"
  - **Snuggle Profile**: same fields, styled with pink accents
- [x] If `smashProfile` is `null`, render a soft empty state message in the Smash column: *"Vote on more Pokémon to see your Smash profile"*
- [x] If `snuggleProfile` is `null`, render the same for the Snuggle column
- [x] Render a close button that calls `onClose` — does not navigate away or reset voting position

### `pages/Vote.jsx`
- [x] 🔑 On mount, call `useSession()` to get `sessionId` and `pokemonList`
- [x] If `sessionId` is `null` on mount, call `useNavigate` and redirect to `/`
- [x] Track `currentIndex` with `useState`:
  - Initialize from `localStorage` key `pokesmash_current_index` (default `0`) so a page refresh resumes position
  - On every increment, update `localStorage`
- [x] Fetch current Pokémon: call `apiFetch('/pokemon/${pokemonList[currentIndex]}')` when `currentIndex` changes, store result in `currentPokemon` state
- [x] Track `isPanelOpen` with `useState(false)` for the Results panel toggle
- [x] Track `voteError` with `useState(null)` for failed vote feedback
- [x] `handleVote(decision)`:
  - Call `castVote(sessionId, pokemonList[currentIndex], decision)`
  - On success: clear `voteError`, increment `currentIndex`, update `localStorage`
  - On error: set `voteError` message, do NOT increment `currentIndex`
- [x] `handleSkip()`:
  - Increment `currentIndex` and update `localStorage`
  - Does not call `castVote`
- [x] Render `<PokemonCard key={currentIndex} pokemon={currentPokemon} />` — the `key` prop causes remount and triggers the entry animation
- [x] Render `<VoteButtons onVote={handleVote} onSkip={handleSkip} />`
- [x] If `voteError` is set, render a small error message below the buttons
- [x] Render `<ProgressBar seen={currentIndex} total={pokemonList.length} />`
- [x] Render a "My Results" button that toggles `isPanelOpen`
- [x] Render `<ResultsPanel sessionId={sessionId} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />`
- [x] When `currentIndex >= pokemonList.length`, replace the card area with an end state:
  - Message: "You've seen every Pokémon!"
  - Button: "See Full Results" → navigate to `/results/${sessionId}`

---

## Phase 6 — Results, My Pokémon & Leaderboard Pages
*Depends on Phase 3 (API) and Phase 4 (shared components).*

### `pages/Results.jsx`
- [x] Read `sessionId` from `useParams()` — fall back to `useSession().sessionId` if param is absent
- [x] On mount, call `getResults(sessionId)` — track `loading` state and show a spinner while fetching
- [x] Render Smash Profile column:
  - Section heading: "Your Smash Type"
  - `<TypeBadge type={smashProfile.topType} />` with the type name beside it
  - "Favourite Generation: Gen {N}"
  - "You smashed {X}% legendary Pokémon"
- [x] Render Snuggle Profile column with the same three fields, styled with pink accents from the Snuggle theme colors
- [x] If `smashProfile` is `null`, render an empty-state card: "No Smash votes yet — keep going!"
- [x] If `snuggleProfile` is `null`, render an empty-state card: "No Snuggle votes yet — keep going!"
- [x] Render a "See All My Pokémon" button → navigate to `/my-pokemon/${sessionId}`
- [x] Render a "Keep Voting" button → navigate to `/vote`

### `pages/MyPokemon.jsx`
- [x] Read `sessionId` from `useParams()`
- [x] Track `activeFilter` in state — one of `'all'`, `'smash'`, `'snuggle'`, default `'all'`
- [x] On mount, call `getMyPokemon(sessionId)` with no filter and store the result
- [x] When `activeFilter` changes, call `getMyPokemon(sessionId, filter === 'all' ? null : filter)` and update the displayed list
- [x] Render three filter buttons: "All", "Smash ❤️‍🔥", "Snuggle 🩷"
  - Style the active filter button differently (underline or filled background)
- [x] Render results as a responsive CSS grid (3–4 columns on desktop, 2 on mobile):
  - Each cell: Pokémon sprite image, name, `<TypeBadge>` for each type, and a small pill showing "Smash" or "Snuggle"
- [x] If the list is empty after filtering, render: "No Pokémon here yet — go vote!"
- [x] Add a "Back to Results" link → `/results/${sessionId}`

### `pages/LeaderboardPage.jsx`
- [x] On mount, call `getLeaderboard()` with no filters — track `loading` state
- [x] Track `typeFilter` and `generationFilter` in state (both default to `''`)
- [x] When either filter changes, re-call `getLeaderboard({ type: typeFilter, generation: generationFilter })` and update state
- [x] Render three sections: "Most Smashed", "Most Snuggled", "Most Passed"
- [x] Each section renders a ranked list of 10:
  - Rank number, Pokémon sprite, name, type badges, vote count
  - Make positions 1–3 visually distinct (larger, bolder, or accented)
- [x] Render a type `<select>` dropdown — options: "All Types" + all 18 type names
- [x] Render a generation `<select>` dropdown — options: "All Generations" + "Gen 1" through "Gen 9"
- [x] Both filters apply simultaneously

---

## Phase 7 — Home Page & Navigation
*Build last — it links to everything else and needs all pages to exist first.*

### `server/routes/stats.js`
- [x] `GET /api/stats`:
  - Query: `SELECT COUNT(*) AS total FROM votes WHERE decision IN ('smash', 'snuggle', 'pass')`
  - Return `{ totalVotes: N }`
- [x] Mount at `/api/stats` in `server/index.js`

### `pages/Home.jsx`
- [x] On mount, fetch `GET /api/stats` and display total vote count (e.g. "X votes cast globally")
- [x] Call `useSession()` to read `sessionId`
- [x] If `sessionId` is `null`:
  - Render a single "Start Voting" button
  - On click: call `createSession()`, then `navigate('/vote')`
- [x] If `sessionId` exists:
  - Render "Continue Session" button → `navigate('/vote')`
  - Render "Start New Session" button → call `clearSession()`, then `createSession()`, then `navigate('/vote')`
- [x] Add a link to `/leaderboard`
- [x] Style the home page with the app name as a large heading and a short tagline

### Navigation (`src/App.jsx`)
- [x] Add a `<nav>` rendered above `<Routes>`:
  - `<NavLink to="/">` Home
  - `<NavLink to="/vote">` Vote
  - `<NavLink to="/results/${sessionId}">` Results — only render if `sessionId` is not null
  - `<NavLink to="/my-pokemon/${sessionId}">` My Pokémon — only render if `sessionId` is not null
  - `<NavLink to="/leaderboard">` Leaderboard
- [x] Use `NavLink`'s `className` prop with a callback to apply an `active` style to the currently matched route

---

## Phase 8 — Polish & Portfolio Prep
*Only after all pages are working end-to-end.*

### UI Polish
- [x] Tune theme transition timing — test `100ms`, `150ms`, `200ms` and commit to one value across `theme.css`
- [x] `PokemonCard`: add a quick fade-out `@keyframes` on the exiting card before the new one fades in (requires temporarily rendering both cards or using a CSS `animation-fill-mode` trick)
- [x] Test the full app at 375px viewport width — fix any overflow, wrapping, or tap-target issues in `VoteButtons` and the card grid on `MyPokemon`
- [x] Style leaderboard top 3 entries with a gold/silver/bronze visual treatment
- [x] Add a `loading` skeleton state to `PokemonCard` — a gray animated pulse `div` that shows while `currentPokemon` is being fetched, replacing the image and name

### Error Handling
- [x] `VoteButtons`: if `castVote` throws, display a small `voteError` message below the buttons and do not advance to the next Pokémon (already wired in `Vote.jsx` — confirm it renders correctly)
- [x] `Vote.jsx`: if the initial `getSession()` call fails, show a "Couldn't load Pokémon — tap to retry" button that re-calls `createSession()`
- [x] `App.jsx`: add `<Route path="*">` catch-all that renders a minimal 404 page with a "Go Home" link
- [x] `seed.js`: log all failed Pokémon IDs to a `failed_ids.txt` file at the end of the run so they can be investigated or re-seeded individually

### README
- [x] Write setup instructions:
  - `cd server && npm install`
  - `npm run seed` (and note this takes a few minutes on first run)
  - `cd client && npm install`
  - Open two terminals: `npm run dev` in `server/` and `npm run dev` in `client/`
  - Or document a root-level `concurrently` script if added
- [x] Add the project origin story — the year-long joke with friends, now in the portfolio
- [ ] Take and embed screenshots:
  - Voting view with Smash theme active (red, sharp)
  - Voting view with Snuggle theme active (pink, soft)
  - Results page showing both profiles
  - My Pokémon grid
  - Leaderboard page

---

## Stretch Goals
*Only attempt once Phase 8 is complete and committed to git.*

- [ ] **Shareable results card** — render a fixed-size `<div>` with the user's top type, generation, and legendary rate styled for screenshotting; add a "Copy as image" button using the Canvas API (`html2canvas` library)
- [ ] **Personality label** — after computing `topType` from combined smash + snuggle votes, map it to a fun trainer archetype (e.g. Fire → "The Hot-Head", Fairy → "The Softie", Psychic → "The Overthinker") and display it as a headline on the Results page
- [ ] **Session comparison** — a `/compare` page with two session ID inputs; fetch both results, display side-by-side profiles, and compute an agreement rate (% of Pokémon voted the same way)
- [ ] **Username** — add an optional `name` column to the `sessions` table; prompt for a display name on `Home.jsx` before creating a session; store in `localStorage` and display on Results and My Pokémon pages
