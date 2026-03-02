# Pokémon Explorer

A responsive web application using React and Tailwind CSS that allows users to explore Pokémon using the public PokéAPI (https://pokeapi.co).

---

## How to Run

Make sure you have Node.js installed, then:

```bash
git clone https://github.com/Zorbrist/pokemon-explorer.git
cd pokemon-explorer
npm install
npm start
```

Open http://localhost:3000 in your browser.

> On first load the app fetches all 1,025 Pokémon which takes around 5 - 10 seconds. A progress bar at the top shows how far along it is.

---

## Features

- Browse all 1,025 Pokémon with their official artwork
- Search by name with an autocomplete dropdown
- Filter by type
- Click any Pokémon to see their stats, abilities, and evolution chain
- Pagination — 14 Pokémon per page
- Favourite Pokémon by clicking the star, saved between sessions
- Dark and light mode toggle
- Works on mobile and desktop

---

## A Few Things I Did Differently

**Loading all Pokémon upfront** — I fetch everything on load rather than page by page. It takes longer initially but means search and filters work across all Pokémon straight away, not just the ones loaded so far.

**Type-themed cards and modals** — Each card and modal header takes on a colour based on the Pokémon's primary type. It's a small touch but I think it makes it feel more alive.

**Dark neon theme** — I went with a dark UI inspired by the electric/battle feel of Pokémon rather than the typical light UI, with a toggle to switch to light mode if preferred.
