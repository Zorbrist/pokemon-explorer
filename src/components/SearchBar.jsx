import { useState, useRef, useEffect } from "react";
import { ALL_TYPES } from "../hooks/usePokemonList";

const TYPE_COLORS = {
  normal:"#888",fire:"#ff4500",water:"#0099ff",electric:"#f5e642",
  grass:"#2db52d",ice:"#00ccee",fighting:"#cc2200",poison:"#aa44cc",
  ground:"#cc8833",flying:"#6677ee",psychic:"#ff2d78",bug:"#88aa00",
  rock:"#887755",ghost:"#663399",dragon:"#5555ff",dark:"#555577",
  steel:"#6699aa",fairy:"#ff79c6",
};
const TYPE_TEXT = { electric:"#111",ice:"#111",fairy:"#111",normal:"#fff" };

export default function SearchBar({ value, onChange, suggestions, onPick, selectedTypes, toggleType, clearAll, dark }) {
  const [showTypes, setShowTypes] = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowTypes(false); setShowSugg(false);
      }
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeCount = selectedTypes?.size || 0;
  const popBg = dark ? "rgba(10,16,28,0.98)" : "rgba(255,255,255,0.99)";
  const border = `1px solid var(--border-glow)`;

  return (
    <div ref={ref} style={{ position:"relative", width:"100%" }}>
      {/* Input row */}
      <div style={{
        display:"flex", alignItems:"center",
        background: dark ? "rgba(15,22,36,0.95)" : "rgba(255,255,255,0.97)",
        border, borderRadius:14,
        boxShadow: dark ? "0 0 0 1px rgba(0,212,255,0.08), 0 6px 24px rgba(0,0,0,0.45)" : "0 4px 20px rgba(0,0,0,0.1)",
        overflow:"hidden",
        transition:"box-shadow 0.2s",
      }}>
        <span style={{ padding:"0 0.75rem 0 1.1rem", color:"var(--text-muted)", flexShrink:0, display:"flex", alignItems:"center" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>

        <input
          type="text"
          placeholder="Search Pokémon…"
          value={value}
          onChange={e => { onChange(e.target.value); setShowSugg(true); }}
          onFocus={() => setShowSugg(true)}
          style={{
            flex:1, background:"transparent", border:"none", outline:"none",
            color:"var(--text-primary)", fontSize:"1rem",
            fontFamily:"'Rajdhani',sans-serif", fontWeight:600,
            padding:"0.85rem 0", letterSpacing:"0.02em",
          }}
        />

        {value && (
          <button onClick={() => onChange("")}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"0 0.6rem", fontSize:"0.9rem" }}>✕
          </button>
        )}

        <div style={{ width:1, height:26, background:"var(--border-glow)", margin:"0 0.2rem", flexShrink:0 }}/>

        {/* Filter button */}
        <button
          onClick={() => { setShowTypes(v=>!v); setShowSugg(false); }}
          style={{
            background: activeCount > 0
              ? (dark ? "rgba(0,212,255,0.12)" : "rgba(37,99,235,0.1)")
              : "transparent",
            border:"none", cursor:"pointer",
            padding:"0.6rem 1.1rem",
            color: activeCount > 0 ? "var(--neon-blue)" : "var(--text-muted)",
            fontFamily:"'Rajdhani',sans-serif", fontWeight:800,
            fontSize:"0.78rem", letterSpacing:"0.08em", textTransform:"uppercase",
            display:"flex", alignItems:"center", gap:"0.4rem",
            transition:"all 0.18s", whiteSpace:"nowrap", flexShrink:0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
          {activeCount > 0 && (
            <span style={{
              background:"var(--neon-blue)", color:"#080c14",
              borderRadius:999, width:18, height:18,
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              fontSize:"0.65rem", fontWeight:900,
            }}>{activeCount}</span>
          )}
        </button>
      </div>

      {/* Autocomplete */}
      {showSugg && suggestions.length > 0 && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:200,
          background: popBg, border, borderRadius:14,
          boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.7)" : "0 8px 28px rgba(0,0,0,0.14)",
          overflow:"hidden",
        }}>
          {suggestions.map(p => {
            const img = p.sprites?.other?.["official-artwork"]?.front_default || p.sprites?.front_default;
            const type = p.types?.[0]?.type?.name || "normal";
            return (
              <button key={p.id}
                onClick={() => { onPick(p); setShowSugg(false); }}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:"0.85rem",
                  background:"transparent", border:"none", cursor:"pointer",
                  padding:"0.6rem 1.1rem", textAlign:"left",
                  borderBottom:"1px solid var(--border-glow)",
                  color:"var(--text-primary)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(0,212,255,0.06)" : "rgba(37,99,235,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {img && <img src={img} alt={p.name} style={{ width:40, height:40, objectFit:"contain" }}/>}
                <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"1rem", textTransform:"capitalize" }}>{p.name}</span>
                <span style={{ marginLeft:"auto", fontSize:"0.7rem", color:"var(--text-muted)", fontFamily:"'Rajdhani',sans-serif" }}>#{String(p.id).padStart(3,"0")}</span>
                <span className={`type-pill t-${type}`}>{type}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Type filter popup */}
      {showTypes && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:200,
          width:360, maxWidth:"96vw",
          background: popBg, border, borderRadius:16,
          padding:"1.1rem",
          boxShadow: dark ? "0 12px 48px rgba(0,0,0,0.8)" : "0 8px 32px rgba(0,0,0,0.16)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.85rem" }}>
            <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:800, fontSize:"0.82rem", textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--text-muted)" }}>
              Filter by Type
            </span>
            {activeCount > 0 && (
              <button onClick={clearAll} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--neon-pink)", fontSize:"0.72rem", fontFamily:"'Rajdhani',sans-serif", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:800 }}>
                Clear all
              </button>
            )}
          </div>

          {/* Pokemon Types */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"0.45rem" }}>
            {ALL_TYPES.map(type => {
              const active = selectedTypes?.has(type);
              const bg = TYPE_COLORS[type] || "#777";
              const tc = TYPE_TEXT[type] || "#fff";
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  style={{
                    background: active ? bg : (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
                    color: active ? tc : (dark ? "#aac4d8" : "#555"),
                    border: `1px solid ${active ? "transparent" : (dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)")}`,
                    borderRadius:8, padding:"0.42rem 0.3rem",
                    fontSize:"0.78rem", fontWeight:800, textTransform:"capitalize",
                    cursor:"pointer", transition:"all 0.14s",
                    fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.04em",
                    textAlign:"center", boxShadow:"none",
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}