import { useState, useEffect } from "react";

// Maps API stat names to short display labels and bar colours
const statMeta = {
  hp:              { label:"HP",  color:"linear-gradient(90deg,#ff2d78,#ff6b9d)" },
  attack:          { label:"ATK", color:"linear-gradient(90deg,#ff6600,#ffaa44)" },
  defense:         { label:"DEF", color:"linear-gradient(90deg,#f5e642,#ffe066)" },
  "special-attack":{ label:"SpA", color:"linear-gradient(90deg,#00d4ff,#66e8ff)" },
  "special-defense":{ label:"SpD",color:"linear-gradient(90deg,#39ff14,#88ff55)" },
  speed:           { label:"SPE", color:"linear-gradient(90deg,#ff79c6,#ffb3e0)" },
};

// Header gradient for different pokemon types
const typeGradHeader = {
  fire:"linear-gradient(135deg,#ff4500,#ff7700)",
  water:"linear-gradient(135deg,#0055cc,#0099ff)",
  grass:"linear-gradient(135deg,#1a7a1a,#2db52d)",
  electric:"linear-gradient(135deg,#b8a800,#f5e642)",
  psychic:"linear-gradient(135deg,#cc004c,#ff2d78)",
  ice:"linear-gradient(135deg,#0099aa,#00ccee)",
  dragon:"linear-gradient(135deg,#2200cc,#5555ff)",
  dark:"linear-gradient(135deg,#1a1a33,#333355)",
  fairy:"linear-gradient(135deg,#cc3399,#ff79c6)",
  fighting:"linear-gradient(135deg,#880000,#cc2200)",
  poison:"linear-gradient(135deg,#660099,#aa44cc)",
  ground:"linear-gradient(135deg,#885500,#cc8833)",
  rock:"linear-gradient(135deg,#554433,#887755)",
  bug:"linear-gradient(135deg,#557700,#88aa00)",
  ghost:"linear-gradient(135deg,#330066,#663399)",
  steel:"linear-gradient(135deg,#445566,#6699aa)",
  flying:"linear-gradient(135deg,#3344aa,#6677ee)",
  normal:"linear-gradient(135deg,#444,#777)",
};

// Returns names in order
function extractChain(node) {
  const out = [];
  function walk(n) {
    if (!n) return;
    out.push(n.species.name);
    n.evolves_to?.forEach(walk);
  }
  walk(node);
  return out;
}

export default function PokemonModal({ pokemon, onClose, dark, isFav, onToggleFav, onSelect }) {
  const [tab, setTab] = useState("stats");
  const [evo, setEvo] = useState(null);
  const [evoSprites, setEvoSprites] = useState({});
  const [evoLoading, setEvoLoading] = useState(false);
  const [evoErr, setEvoErr] = useState("");
  const [evoData, setEvoData] = useState({});

  // Reset state whenever a different Pokémon is opened
  useEffect(() => { setTab("stats"); setEvo(null); setEvoSprites({}); setEvoData({}); setEvoErr(""); }, [pokemon?.id]);

  if (!pokemon) return null;

  const img = pokemon?.sprites?.other?.["official-artwork"]?.front_default || pokemon?.sprites?.front_default;
  const primaryType = pokemon?.types?.[0]?.type?.name || "normal";
  const headerGrad = typeGradHeader[primaryType] || typeGradHeader.normal;
  const total = pokemon.stats.reduce((a,s) => a + s.base_stat, 0);

  // Fetches the evolution chain 
  async function loadEvo() {
    if (evo || evoLoading) return;
    setEvoLoading(true); setEvoErr("");
    try {
      // The evolution chain URL is nested two levels deep: pokemon → species → evolution_chain
      const sp = await (await fetch(pokemon.species.url)).json();
      const ec = await (await fetch(sp.evolution_chain.url)).json();
      const names = extractChain(ec.chain);
      setEvo(names);

      // Fetch full Pokémon data for each evolution
      const sprites = {};
      const evoDataMap = {};
      await Promise.all(names.map(async name => {
        try {
          const d = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)).json();
          sprites[name] = d.sprites?.other?.["official-artwork"]?.front_default || d.sprites?.front_default;
          evoDataMap[name] = d;
        } catch {}
      }));
      setEvoSprites(sprites);
      setEvoData(evoDataMap);
    } catch { setEvoErr("Could not load evolution chain."); }
    finally { setEvoLoading(false); }
  }

  function handleTab(t) { setTab(t); if (t==="evolution") loadEvo(); }

  const cardBg = dark ? "#0f1624" : "#fff";
  const typeAccentMap = {
    fire:"#ff4500",water:"#0099ff",grass:"#2db52d",electric:"#f5e642",
    psychic:"#ff2d78",ice:"#00ccee",dragon:"#5555ff",dark:"#8888aa",
    fairy:"#ff79c6",fighting:"#cc2200",poison:"#aa44cc",ground:"#cc8833",
    rock:"#887755",bug:"#88aa00",ghost:"#9944cc",steel:"#6699aa",
    flying:"#6677ee",normal:"#888888",
  };
  const typeAccent = typeAccentMap[primaryType] || "#00d4ff";

  return (

    <div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(8px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
    >
      <div className="modal-box" style={{
        background: cardBg, borderRadius:20, maxWidth:500, width:"100%", margin:"0 0.5rem",
        maxHeight:"90vh", display:"flex", flexDirection:"column",
        border:"1px solid var(--border-glow)",
        boxShadow: dark ? "0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,212,255,0.1)" : "0 20px 60px rgba(0,0,0,0.2)",
        overflow:"hidden",
      }}>

    
        <div style={{ background: headerGrad, padding:"1.25rem 1.25rem 1rem", position:"relative", overflow:"hidden" }}>

          <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
          <div style={{ position:"absolute", right:10, bottom:-50, width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>

          <div style={{ position:"absolute", top:10, right:10, display:"flex", gap:"0.4rem", zIndex:2 }}>
            <button onClick={onToggleFav} style={{ background:"rgba(0,0,0,0.25)", border:"none", borderRadius:999, width:30, height:30, cursor:"pointer", fontSize:"0.9rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isFav ? "⭐" : "☆"}
            </button>
            <button onClick={onClose} style={{ background:"rgba(0,0,0,0.25)", border:"none", borderRadius:999, width:30, height:30, cursor:"pointer", color:"#fff", fontSize:"0.9rem", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>✕</button>
          </div>

          {/* Pokémon image, number, name and type badges */}
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", position:"relative", zIndex:1 }}>
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:14, padding:"0.4rem", backdropFilter:"blur(4px)" }}>
              <img src={img} alt={pokemon.name} style={{ width:"min(90px, 18vw)", height:"min(90px, 18vw)", objectFit:"contain", filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}/>
            </div>
            <div>
              <p style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", fontWeight:800, color:"rgba(255,255,255,0.9)", letterSpacing:"0.12em", textShadow:"0 0 12px rgba(255,255,255,0.3)" }}>#{String(pokemon.id).padStart(3,"0")}</p>
              <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"1.7rem", color:"#fff", textTransform:"capitalize", lineHeight:1.1, textShadow:"0 2px 8px rgba(0,0,0,0.4)" }}>{pokemon.name}</h2>
              <div style={{ display:"flex", gap:"0.35rem", marginTop:"0.4rem", flexWrap:"wrap" }}>
                {pokemon.types.map(t => (
                  <span key={t.type.name} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:999, padding:"0.15rem 0.6rem", fontSize:"0.7rem", fontWeight:700, textTransform:"capitalize", fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.04em", backdropFilter:"blur(4px)" }}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", borderBottom:"1px solid var(--border-glow)" }}>
          {["stats","abilities","evolution"].map(t => (
            <button key={t} onClick={() => handleTab(t)}
              style={{
                flex:1, padding:"0.75rem", background:"none", border:"none", cursor:"pointer",
                fontFamily:"'Rajdhani',sans-serif", fontWeight:800, fontSize:"0.8rem",
                textTransform:"uppercase", letterSpacing:"0.1em",
                color: tab===t ? typeAccent : "var(--text-muted)",
                borderBottom: tab===t ? `2px solid ${typeAccent}` : "2px solid transparent",
                transition:"all 0.15s",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Tab content area */}
        <div style={{ overflowY:"auto", flex:1, padding:"1.25rem" }}>

          {/* Stats tab — shows a bar for each base stat plus the total */}
          {tab==="stats" && (
            <div>
              {pokemon.stats.map(s => {
                const meta = statMeta[s.stat.name] || { label: s.stat.name, color:"linear-gradient(90deg,#888,#aaa)" };
                const pct = Math.min(100, (s.base_stat/200)*100);
                return (
                  <div key={s.stat.name} style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.65rem" }}>
                    <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"0.68rem", color:"var(--text-muted)", textTransform:"uppercase", width:28, letterSpacing:"0.04em", flexShrink:0 }}>{meta.label}</span>
                    <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"0.85rem", color:"var(--text-primary)", width:28, textAlign:"right", flexShrink:0 }}>{s.base_stat}</span>
                    <div style={{ flex:1, height:8, borderRadius:999, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`, height:"100%", borderRadius:999, background:meta.color, boxShadow:`0 0 8px rgba(0,212,255,0.3)`, transition:"width 0.6s ease" }}/>
                    </div>
                  </div>
                );
              })}
              {/* Total base stat sum */}
              <div style={{ borderTop:"1px solid var(--border-glow)", marginTop:"0.75rem", paddingTop:"0.75rem", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"0.72rem", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Total</span>
                <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:900, fontSize:"1.1rem", color:typeAccent }}>{total}</span>
              </div>
            </div>
          )}

          {/* Abilities tab */}
          {tab==="abilities" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {pokemon.abilities.map(a => (
                <div key={a.ability.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.75rem 1rem", background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius:10, border:"1px solid var(--border-glow)" }}>
                  <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:"0.95rem", textTransform:"capitalize", color:"var(--text-primary)" }}>{a.ability.name}</span>
                  {a.is_hidden && (
                    <span style={{ background:"rgba(170,68,204,0.2)", color:"#cc66ff", border:"1px solid #aa44cc44", borderRadius:999, padding:"0.15rem 0.6rem", fontSize:"0.65rem", fontWeight:700, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.05em" }}>HIDDEN</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Evolution tab  */}
          {tab==="evolution" && (
            <div style={{ textAlign:"center" }}>
              {evoLoading && (
                <div style={{ padding:"3rem 0" }}>
                  <div className="spin" style={{ width:32, height:32, border:"3px solid rgba(0,212,255,0.2)", borderTopColor:"var(--neon-blue)", borderRadius:"50%", margin:"0 auto" }}/>
                </div>
              )}
              {evoErr && <p style={{ color:"var(--neon-pink)", fontFamily:"'Rajdhani',sans-serif" }}>{evoErr}</p>}
              {evo && (
                <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"0.5rem", alignItems:"center" }}>
                  {evo.map((name, i) => (
                    <div key={name} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      {i > 0 && <span style={{ color:"var(--neon-blue)", fontSize:"1.2rem" }}>→</span>}
                      <button
                        onClick={() => evoData[name] && onSelect && onSelect(evoData[name])}
                        title={`View ${name}`}
                        style={{
                          padding:"0.75rem", borderRadius:14, minWidth:80, textAlign:"center",
                          background: name === pokemon.name
                            ? (dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)")
                            : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                          border: name === pokemon.name
                            ? `1px solid ${typeAccent}`
                            : "1px solid var(--border-glow)",
                          cursor: evoData[name] ? "pointer" : "default",
                          transition:"all 0.18s",
                        }}
                        onMouseEnter={e => { if (name !== pokemon.name) e.currentTarget.style.border = `1px solid ${typeAccent}`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.border = name === pokemon.name ? `1px solid ${typeAccent}` : "1px solid var(--border-glow)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {evoSprites[name]
                          ? <img src={evoSprites[name]} alt={name} style={{ width:64, height:64, objectFit:"contain", filter:"drop-shadow(0 0 6px rgba(0,212,255,0.3))" }}/>
                          : <div style={{ width:64, height:64, background:"rgba(255,255,255,0.05)", borderRadius:10, margin:"0 auto" }}/>
                        }
                        <p style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:"0.78rem", textTransform:"capitalize", color: name === pokemon.name ? typeAccent : "var(--text-muted)", marginTop:"0.35rem" }}>{name}</p>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}