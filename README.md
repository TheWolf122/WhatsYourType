# What's Your Type?

*Smash, snuggle, or pass your way through every Pokémon — and find out what your choices say about you.*

---

## Setup

You'll need two terminals running simultaneously.

**1. Install and seed the server**

```bash
cd server
npm install
npm run seed      # fetches all ~1025 Pokémon from PokéAPI — takes a few minutes
```

**2. Install the client**

```bash
cd client
npm install
```

**3. Run both dev servers**

Terminal 1 (server):
```bash
cd server
node index.js
```

Terminal 2 (client):
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** The seed script makes two API calls per Pokémon and processes in batches of 20 with 500ms delays to respect PokéAPI's fair-use policy. The full run takes 3–5 minutes. Re-running it is safe — already-seeded rows are skipped.

---

## How It Works

Start a session and you'll be shown every Pokémon in the Pokédex, one at a time, in a random order. For each one you can:

- **Smash** — hover the button to see the app shift to a bold red theme
- **Snuggle** — hover to shift to a soft pink theme
- **Pass** — a neutral vote, still counted on the leaderboard
- **Skip** — no vote recorded, just moves to the next Pokémon

After voting, your **Smash Profile** and **Snuggle Profile** are computed from your votes: the type you picked most, the generation you gravitate toward, and how often you went for legendary or mythical Pokémon.

---

## Origin Story

This project started as a year-long running joke among friends — debating which Pokémon were dateable, huggable, or just a hard pass. After the bit had outlasted most of our other group chat topics, it seemed only right to actually build it.

What started as a joke became a full-stack portfolio project: a React SPA backed by an Express + SQLite API, with live profile aggregation, a global leaderboard, and a theme system that physically changes the UI based on which button you're hovering.

---

## Screenshots

| Voting — Smash theme | Voting — Snuggle theme |
|---|---|
| *(screenshot)* | *(screenshot)* |

| Results page | My Pokémon grid |
|---|---|
| *(screenshot)* | *(screenshot)* |

| Leaderboard | |
|---|---|
| *(screenshot)* | |

---

## Tech Stack

- **Client:** React 19, Vite, React Router v7, CSS Modules
- **Server:** Node.js, Express 5, better-sqlite3
- **Data:** PokéAPI (seeded locally — no runtime dependency on the external API)

