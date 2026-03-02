import { useEffect, useMemo, useState, useRef } from "react";

// Pokemon Types for Filtering
export const ALL_TYPES = [
  "normal","fire","water","electric","grass","ice",
  "fighting","poison","ground","flying","psychic","bug",
  "rock","ghost","dragon","dark","steel","fairy",
];

const CONCURRENT = 20; // parallel detail requests per batch

export function usePokemonList() {
  const [pokemon, setPokemon] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    async function fetchAll() {
      setLoading(true);
      try {
        // Get full list of 1025 in one request
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0");
        const data = await res.json();
        const urls = data.results.map(p => p.url);

        // Fetch details in concurrent batches, updating UI progressively
        let done = 0;
        for (let i = 0; i < urls.length; i += CONCURRENT) {
          const batch = urls.slice(i, i + CONCURRENT);
          const results = await Promise.all(batch.map(url => fetch(url).then(r => r.json())));
          done += results.length;
          setPokemon(prev => {
            const ids = new Set(prev.map(p => p.id));
            return [...prev, ...results.filter(p => !ids.has(p.id))].sort((a, b) => a.id - b.id);
          });
          setLoadingProgress(done);
        }
      } catch (e) {
        console.error("Failed to load Pokémon:", e);
      } finally {
        setLoading(false);
        setLoadingProgress(0);
      }
    }

    fetchAll();
  }, []);

  function toggleType(type) {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  function clearAll() { setSelectedTypes(new Set()); }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pokemon.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q);
      const matchT = selectedTypes.size === 0 || p.types.some(t => selectedTypes.has(t.type.name));
      return matchQ && matchT;
    });
  }, [pokemon, query, selectedTypes]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pokemon.filter(p => p.name.toLowerCase().startsWith(q)).slice(0, 6);
  }, [pokemon, query]);

  return {
    pokemon, filtered, suggestions,
    query, setQuery,
    loading, loadingProgress,
    selectedTypes, toggleType, clearAll,
  };
}