# What's Your Type? — File Structure Design

---

## Project Root

```
pokesmash/
├── client/
├── server/
├── .env
├── .gitignore
└── README.md
```

- `.env` — Stores environment variables like `PORT` and `DATABASE_URL`. Never committed to GitHub.
- `.gitignore` — Ignores `node_modules`, `.env`, and build artifacts.
- `README.md` — Project overview, setup instructions, and screenshots for the portfolio.

---

## Client (React SPA)

```
client/
├── public/
│   └── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── theme.css
│   ├── components/
│   │   ├── PokemonCard.jsx
│   │   ├── VoteButtons.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ResultsPanel.jsx
│   │   ├── TypeBadge.jsx
│   │   └── Leaderboard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Vote.jsx
│   │   ├── Results.jsx
│   │   ├── MyPokemon.jsx
│   │   └── LeaderboardPage.jsx
│   ├── hooks/
│   │   ├── useSession.js
│   │   └── useResults.js
│   └── utils/
│       └── api.js
└── package.json
```

### `public/index.html`
The single HTML file the React app mounts into. Contains the `<div id="root">` and nothing else of substance — React handles the rest.

### `src/main.jsx`
Entry point. Mounts the React app into `#root` and wraps it with React Router's `<BrowserRouter>`.

### `src/App.jsx`
Defines all client-side routes using React Router. Maps URL paths to page components (e.g. `/` → `Home`, `/vote` → `Vote`, `/results/:sessionId` → `Results`, `/my-pokemon/:sessionId` → `MyPokemon`, `/leaderboard` → `LeaderboardPage`).

### `src/index.css`
Global base styles — font, resets, and layout defaults. Kept minimal.

### `src/theme.css`
The dual-theme system. Defines CSS custom properties for both the Smash theme (bold red, sharp edges) and the Snuggle theme (soft pink, rounded corners). A data attribute on the root element (e.g. `data-theme="smash"`) swaps the active variable set. All themed components reference these variables.

---

### Components

#### `components/PokemonCard.jsx`
Displays a single Pokémon — official artwork, name, and type badges. Reads the active theme from context and applies the appropriate CSS class. Animates in when a new Pokémon loads (CSS transition).

#### `components/VoteButtons.jsx`
Renders the three action buttons: Smash, Snuggle, and Pass, plus a Skip option. Each button has distinct styling pulled from `theme.css`. On hover, the Smash button shifts the active theme to red; Snuggle shifts it to pink. On click, fires the vote to the API and triggers the next Pokémon.

#### `components/ProgressBar.jsx`
Shows the user's progress through the full Pokédex (e.g. "142 / 1025 seen"). Always visible during a voting session.

#### `components/ResultsPanel.jsx`
A slide-in panel accessible at any time during voting. Displays the live Smash Profile and Snuggle Profile side by side — top type, top generation, legendary preference. Fetches from `/api/results/:sessionId` on open and updates in real time as votes are cast.

#### `components/TypeBadge.jsx`
A small, color-coded pill displaying a Pokémon type (e.g. Fire, Water, Psychic). Used inside `PokemonCard` and the results views. Each type has a fixed color defined in CSS.

#### `components/Leaderboard.jsx`
A reusable table/list component for displaying ranked Pokémon. Used on the leaderboard page with separate tabs or sections for most Smashed, most Snuggled, and most Passed.

---

### Pages

#### `pages/Home.jsx`
The landing page. Introduces the app, shows a global vote counter, and provides a button to start a new session. Sets the session ID in localStorage on session creation.

#### `pages/Vote.jsx`
The core voting experience. Manages the ordered list of Pokémon for the session, tracks which Pokémon is currently shown, and renders `PokemonCard`, `VoteButtons`, `ProgressBar`, and the toggle to open `ResultsPanel`. All vote interactions happen here.

#### `pages/Results.jsx`
The profile summary page, reachable at any time via a link or after finishing a session. Displays the Smash Profile and Snuggle Profile side by side — top type, top generation, and legendary preference for each — using aggregated data from `/api/results/:sessionId`. Links to `MyPokemon` for users who want to browse the full list of their picks.

#### `pages/MyPokemon.jsx`
A dedicated page listing every Pokémon the user smashed or snuggled this session. Fetches from `/api/my-pokemon/:sessionId` and renders each Pokémon with its sprite, name, and type badges. Includes filter controls to toggle between showing Smash picks, Snuggle picks, or both.

#### `pages/LeaderboardPage.jsx`
Renders the global leaderboard. Fetches from `/api/leaderboard` and displays rankings for most Smashed, Snuggled, and Passed. Includes type and generation filter controls.

---

### Hooks

#### `hooks/useSession.js`
Custom hook that reads and writes the session ID from `localStorage`. Exposes `sessionId` and `createSession()`. Used by `Home` and `Vote` to ensure a consistent session across page refreshes.

#### `hooks/useResults.js`
Custom hook that fetches and caches the results for the current session from `/api/results/:sessionId`. Exposes a `refresh()` function called after each vote so the live panel stays up to date without a full page reload.

---

### Utils

#### `utils/api.js`
A thin wrapper around `fetch` that sets the base URL and handles JSON parsing. Exports named functions for every API call used by the frontend (e.g. `getSession()`, `castVote()`, `getResults()`, `getMyPokemon()`, `getLeaderboard()`). Keeps API logic out of components.

---

## Server (Express API)

```
server/
├── index.js
├── db.js
├── seed.js
├── routes/
│   ├── pokemon.js
│   ├── votes.js
│   ├── results.js
│   ├── myPokemon.js
│   └── leaderboard.js
├── middleware/
│   └── errorHandler.js
└── package.json
```

### `server/index.js`
The Express app entry point. Registers middleware (JSON parsing, CORS), mounts all route files under `/api`, and starts the server. Calls the database connection on startup.

### `server/db.js`
Initializes and exports the database connection (e.g. a `better-sqlite3` or `pg` client). All route files import from here to run queries. Keeps the database setup in one place.

### `server/seed.js`
A one-time startup script that bulk-fetches all 1,025+ Pokémon from PokéAPI and populates the `pokemon` table. Makes two requests per Pokémon (base endpoint + species endpoint) to get types, sprite, generation, and legendary/mythical status. Runs in batches with delays to respect PokéAPI's fair use policy. Skips Pokémon already in the database so it can be re-run safely.

---

### Routes

#### `routes/pokemon.js`
Handles `GET /api/pokemon/session` — returns a shuffled list of all Pokémon IDs for a new session. Also handles `GET /api/pokemon/:id` — returns cached data for a single Pokémon from the database.

#### `routes/votes.js`
Handles `POST /api/votes` — accepts a vote payload (`sessionId`, `pokemonId`, `decision`) and inserts a row into the `votes` table. Creates the session row if it does not already exist.

#### `routes/results.js`
Handles `GET /api/results/:sessionId` — queries the `votes` table joined with `pokemon`, groups by decision and then by type/generation/legendary status, and returns separate Smash and Snuggle profiles. Runs on demand so the live results panel always reflects the latest votes.

#### `routes/myPokemon.js`
Handles `GET /api/my-pokemon/:sessionId` — returns the full list of Pokémon a user smashed or snuggled, joined with their name, sprite, and type data. Supports an optional `decision` query parameter (`smash` or `snuggle`) for filtering.

#### `routes/leaderboard.js`
Handles `GET /api/leaderboard` — aggregates all votes globally, groups by Pokémon and decision, and returns ranked lists for most Smashed, Snuggled, and Passed. Supports optional `type` and `generation` query parameters for filtering.

---

### Middleware

#### `middleware/errorHandler.js`
A global Express error handler. Catches unhandled errors from any route and returns a consistent JSON error response. Prevents the server from crashing on bad requests or database errors.

---

## Database Schema

```
pokemon
├── id          INTEGER PRIMARY KEY   (PokéAPI national dex number)
├── name        TEXT
├── sprite_url  TEXT
├── type_1      TEXT
├── type_2      TEXT    (nullable)
├── generation  INTEGER
├── is_legendary BOOLEAN
└── is_mythical  BOOLEAN

sessions
├── id            TEXT PRIMARY KEY   (UUID)
├── created_at    DATETIME
└── last_active_at DATETIME

votes
├── id          INTEGER PRIMARY KEY AUTOINCREMENT
├── session_id  TEXT     REFERENCES sessions(id)
├── pokemon_id  INTEGER  REFERENCES pokemon(id)
├── decision    TEXT     ('smash' | 'snuggle' | 'pass' | 'skip')
└── voted_at    DATETIME
```

- `pokemon` is populated once by `seed.js` and read-only after that.
- `sessions` gets one row per user device session, keyed by a UUID stored in the browser's `localStorage`.
- `votes` is the central table — every interaction is recorded here, and all results and leaderboard data are derived from it via aggregation queries.