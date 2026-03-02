import { useState, useEffect } from "react";
import { usePokemonList } from "./hooks/usePokemonList";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import SearchBar from "./components/SearchBar";

const PAGE_SIZE = 14;
const FAV_KEY = "pokefavs";

function PokeBackground() {
  const balls = [
    { size:150, left:"3%",  delay:"0s",  dur:"22s", c:"#00d4ff" },
    { size:95,  left:"20%", delay:"6s",  dur:"28s", c:"#ff2d78" },
    { size:180, left:"50%", delay:"2s",  dur:"32s", c:"#f5e642" },
    { size:70,  left:"70%", delay:"9s",  dur:"20s", c:"#39ff14" },
    { size:120, left:"88%", delay:"1s",  dur:"25s", c:"#00d4ff" },
    { size:60,  left:"36%", delay:"13s", dur:"18s", c:"#ff2d78" },
  ];
  return (
    <div className="poke-bg">
      {balls.map((b, i) => (
        <div key={i} className="pokeball-float" style={{
          width:b.size, height:b.size, left:b.left, bottom:-220,
          borderColor:b.c, animationDelay:b.delay, animationDuration:b.dur,
        }}>
          <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2, background:b.c, opacity:0.35 }}/>
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:b.size*0.22, height:b.size*0.22,
            borderRadius:"50%", border:`2px solid ${b.c}`,
          }}/>
        </div>
      ))}
    </div>
  );
}

// Circular icon button for the header
function IconBtn({ onClick, title, color, active, badge, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? `${color}22` : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
        borderRadius: 999,
        width: 42, height: 42, flexShrink: 0,
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: active ? color : "var(--text-muted)",
        transition: "all 0.18s",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}22`;
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? `${color}22` : "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = active ? color : "rgba(255,255,255,0.08)";
        e.currentTarget.style.color = active ? color : "var(--text-muted)";
      }}
    >
      {children}
      {badge > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          background: color, color: "#080c14",
          borderRadius: 999, minWidth: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.58rem", fontWeight: 900, fontFamily: "'Rajdhani',sans-serif",
          padding: "0 3px",
        }}>{badge}</span>
      )}
    </button>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showFavs, setShowFavs] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY)||"[]")); } catch { return new Set(); }
  });

  const {
    filtered, suggestions,
    query, setQuery,
    loading, loadingProgress,
    selectedTypes, toggleType, clearAll,
  } = usePokemonList();

  useEffect(() => { setCurrentPage(0); }, [query, selectedTypes]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  }, [favs]);

  function toggleFav(id) {
    setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const baseList = showFavs ? filtered.filter(p => favs.has(p.id)) : filtered;
  const totalPages = Math.max(1, Math.ceil(baseList.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageItems = baseList.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function goPage(n) {
    setCurrentPage(Math.max(0, Math.min(n, totalPages - 1)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const loadPct = loadingProgress > 0 ? Math.round((loadingProgress / 1025) * 100) : 0;

  return (
    <div style={{ position:"relative", minHeight:"100vh" }}>
      <PokeBackground />

      {/* Loading progress bar */}
      {loading && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:3, background:"rgba(0,212,255,0.15)" }}>
          <div style={{
            height:"100%", background:"linear-gradient(90deg, var(--neon-blue), var(--neon-pink))",
            width:`${loadPct}%`, transition:"width 0.3s ease",
            boxShadow:"0 0 10px var(--neon-blue)",
          }}/>
        </div>
      )}

      {/* Header */}
      <header style={{
        position:"sticky", top:0, zIndex:40,
        background: dark ? "rgba(8,12,20,0.95)" : "rgba(238,242,255,0.95)",
        backdropFilter:"blur(20px)",
        borderBottom:"1px solid var(--border-glow)",
        borderTop:"3px solid #ff2d78",
      }}>
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.7rem 1.25rem", gap:"0.5rem" }}>

          {/* Logo Icon and Title*/}
          <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", flex:1, minWidth:0 }}>
            <svg style={{ flexShrink:0 }} width="36" height="36" viewBox="0 0 60 60" fill="none">
              <rect x="2" y="2" width="56" height="56" rx="10" fill="#cc0033" stroke="#ff2d78" strokeWidth="2"/>
              <circle cx="16" cy="16" r="9" fill="#88ccff" stroke="#fff" strokeWidth="2"/>
              <circle cx="16" cy="16" r="4" fill="#0044cc"/>
              <line x1="28" y1="10" x2="52" y2="10" stroke="#ff8899" strokeWidth="3" strokeLinecap="round"/>
              <line x1="28" y1="18" x2="52" y2="18" stroke="#ff8899" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
              <line x1="8" y1="34" x2="52" y2="34" stroke="#ffffff" strokeWidth="1.5" opacity="0.15"/>
              <rect x="8" y="40" width="44" height="12" rx="4" fill="rgba(0,0,0,0.3)" stroke="#ff8899" strokeWidth="1"/>
              <line x1="14" y1="46" x2="46" y2="46" stroke="#ff8899" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <div style={{ minWidth:0 }}>
              <span style={{ fontFamily:"'Exo 2',sans-serif", fontWeight:900, fontSize:"clamp(0.9rem, 3.5vw, 1.6rem)", letterSpacing:"0.04em", textTransform:"uppercase", lineHeight:1, whiteSpace:"nowrap", display:"block" }}>
                <span style={{ color:"#ff2d78" }}>Pokémon</span>
                <span style={{ color:"var(--text-primary)", marginLeft:6 }}>Explorer</span>
              </span>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:"clamp(0.48rem, 1.2vw, 0.62rem)", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--text-muted)", marginTop:"0.1rem", display:"block" }}>Gotta catch 'em all</span>
            </div>
          </div>

          {/* Right: icon buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.35rem", flexShrink:0 }}>

            {/* Favourites heart */}
            <IconBtn
              onClick={() => { setShowFavs(v=>!v); setCurrentPage(0); }}
              title={showFavs ? "Show all" : "Favourites"}
              color="#ff2d78"
              active={showFavs}
              badge={favs.size || null}
            >
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill={showFavs ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </IconBtn>

            {/* Divider */}
            <div style={{ width:1, height:22, background:"var(--border-glow)", margin:"0 0.2rem" }}/>

            {/* Dark / light toggle */}
            <IconBtn
              onClick={() => setDark(v=>!v)}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              color={dark ? "#f5e642" : "#5a7a99"}
            >
              {dark
                ? /* Sun */
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                : /* Moon */
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
              }
            </IconBtn>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-pad" style={{ maxWidth:1400, margin:"0 auto", padding:"1.75rem 1.5rem", position:"relative", zIndex:1 }}>

        {/* Search bar */}
        <div style={{ marginBottom:"1.25rem" }}>
          <SearchBar
            value={query} onChange={setQuery}
            suggestions={suggestions}
            onPick={p => { setQuery(p.name); setSelected(p); }}
            selectedTypes={selectedTypes}
            toggleType={toggleType}
            clearAll={clearAll}
            dark={dark}
          />
        </div>

        {/* Active filter chips */}
        {selectedTypes.size > 0 && (
          <div style={{ display:"flex", gap:"0.45rem", flexWrap:"wrap", marginBottom:"1rem", alignItems:"center" }}>
            <span style={{ fontSize:"0.68rem", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>Filtering:</span>
            {[...selectedTypes].map(t => (
              <button key={t} onClick={() => toggleType(t)}
                className={`type-pill t-${t}`}
                style={{ cursor:"pointer", border:"none" }}
              >{t} ✕</button>
            ))}
            <button onClick={clearAll} style={{ fontSize:"0.7rem", color:"var(--neon-pink)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>
              Clear all
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="stats-row" style={{ display:"flex", gap:"1.5rem", marginBottom:"1.5rem", fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.07em", textTransform:"uppercase", fontWeight:700, alignItems:"center", justifyContent:"center" }}>
          <span>Pokémon: <b style={{ color:"var(--neon-yellow)" }}>{baseList.length}</b></span>
          {baseList.length > 0 && <span>Page: <b style={{ color:"var(--neon-green)" }}>{safePage + 1} / {totalPages}</b></span>}
          {loading && (
            <span style={{ color:"var(--neon-blue)", display:"flex", alignItems:"center", gap:"0.4rem" }}>
              <span className="spin" style={{ display:"inline-block", width:11, height:11, border:"2px solid rgba(0,212,255,0.3)", borderTopColor:"var(--neon-blue)", borderRadius:"50%" }}/>
              Loading {loadingProgress} / 1025…
            </span>
          )}
        </div>

        {/* Empty state */}
        {baseList.length === 0 && !loading && (
          <div style={{ textAlign:"center", padding:"6rem 0", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"3.5rem" }}>{showFavs ? "☆" : "🔍"}</div>
            <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1.2rem", fontWeight:800, marginTop:"0.75rem" }}>
              {showFavs ? "No favourites yet — ☆ a Pokémon to save it!" : "No Pokémon match. Try a different search."}
            </p>
          </div>
        )}

        {/* Grid */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",
          gap:"0.85rem",
        }}>
          {pageItems.map((p, i) => (
            <div key={p.id} className="card-in" style={{ animationDelay:`${i * 40}ms` }}>
              <PokemonCard
                pokemon={p}
                onClick={() => setSelected(p)}
                isFav={favs.has(p.id)}
                onToggleFav={e => { e.stopPropagation(); toggleFav(p.id); }}
                dark={dark}
              />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {baseList.length > PAGE_SIZE && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"0.6rem", marginTop:"2.5rem", flexWrap:"wrap" }}>
            <button className="btn-neon" onClick={() => goPage(0)} disabled={safePage === 0}
              style={{ padding:"0.45rem 0.8rem", opacity: safePage===0 ? 0.35 : 1 }}>«</button>

            <button className="btn-neon" onClick={() => goPage(safePage - 1)} disabled={safePage === 0}
              style={{ padding:"0.45rem 1rem", opacity: safePage===0 ? 0.35 : 1 }}>← Prev</button>

            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(i => Math.abs(i - safePage) <= 2 || i === 0 || i === totalPages - 1)
              .reduce((acc, i, idx, arr) => {
                if (idx > 0 && i - arr[idx-1] > 1) acc.push("…");
                acc.push(i);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…"
                  ? <span key={`g${idx}`} style={{ color:"var(--text-muted)", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, padding:"0 0.2rem" }}>…</span>
                  : (
                    <button key={item} onClick={() => goPage(item)} style={{
                      fontFamily:"'Rajdhani',sans-serif", fontWeight:800, fontSize:"0.82rem",
                      width:34, height:34, borderRadius:8,
                      border: item===safePage ? "2px solid var(--neon-blue)" : "1px solid var(--border-glow)",
                      background: item===safePage ? "rgba(0,212,255,0.15)" : "transparent",
                      color: item===safePage ? "var(--neon-blue)" : "var(--text-muted)",
                      cursor:"pointer", transition:"all 0.15s",
                      boxShadow: item===safePage ? "0 0 12px rgba(0,212,255,0.25)" : "none",
                    }}>{item + 1}</button>
                  )
              )
            }

            <button className="btn-neon" onClick={() => goPage(safePage + 1)} disabled={safePage >= totalPages - 1}
              style={{ padding:"0.45rem 1rem", opacity: safePage>=totalPages-1 ? 0.35 : 1 }}>Next →</button>

            <button className="btn-neon" onClick={() => goPage(totalPages - 1)} disabled={safePage >= totalPages - 1}
              style={{ padding:"0.45rem 0.8rem", opacity: safePage>=totalPages-1 ? 0.35 : 1 }}>»</button>
          </div>
        )}

        {baseList.length > 0 && (
          <p style={{ textAlign:"center", marginTop:"0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.72rem", color:"var(--text-muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>
            Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, baseList.length)} of {baseList.length} Pokémon
          </p>
        )}
      </main>

      {/* Modal */}
      {selected && (
        <PokemonModal
          pokemon={selected}
          onClose={() => setSelected(null)}
          dark={dark}
          isFav={favs.has(selected.id)}
          onToggleFav={() => toggleFav(selected.id)}
          onSelect={p => setSelected(p)}
        />
      )}
    </div>
  );
}