const TYPE_GRADIENTS = {
  fire:    "linear-gradient(135deg,#ff450018,#ff450005)",
  water:   "linear-gradient(135deg,#0099ff18,#0099ff05)",
  grass:   "linear-gradient(135deg,#2db52d18,#2db52d05)",
  electric:"linear-gradient(135deg,#f5e64218,#f5e64205)",
  psychic: "linear-gradient(135deg,#ff2d7818,#ff2d7805)",
  ice:     "linear-gradient(135deg,#00ccee18,#00ccee05)",
  dragon:  "linear-gradient(135deg,#5555ff18,#5555ff05)",
  dark:    "linear-gradient(135deg,#33335518,#33335505)",
  fairy:   "linear-gradient(135deg,#ff79c618,#ff79c605)",
  fighting:"linear-gradient(135deg,#cc220018,#cc220005)",
  poison:  "linear-gradient(135deg,#aa44cc18,#aa44cc05)",
  ground:  "linear-gradient(135deg,#cc883318,#cc883305)",
  rock:    "linear-gradient(135deg,#88775518,#88775505)",
  bug:     "linear-gradient(135deg,#88aa0018,#88aa0005)",
  ghost:   "linear-gradient(135deg,#66339918,#66339905)",
  steel:   "linear-gradient(135deg,#6699aa18,#6699aa05)",
  flying:  "linear-gradient(135deg,#6677ee18,#6677ee05)",
  normal:  "linear-gradient(135deg,#77777718,#77777705)",
};

const TYPE_GLOW = {
  fire:"#ff4500",water:"#0099ff",grass:"#2db52d",electric:"#f5e642",
  psychic:"#ff2d78",ice:"#00ccee",dragon:"#5555ff",dark:"#555577",
  fairy:"#ff79c6",fighting:"#cc2200",poison:"#aa44cc",ground:"#cc8833",
  rock:"#887755",bug:"#88aa00",ghost:"#663399",steel:"#6699aa",
  flying:"#6677ee",normal:"#777777",
};

export default function PokemonCard({ pokemon, onClick, isFav, onToggleFav, dark }) {
  const img =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default;

  const primaryType = pokemon?.types?.[0]?.type?.name || "normal";
  const grad = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;
  const glow = TYPE_GLOW[primaryType] || "#777";
  const id = String(pokemon.id).padStart(3, "0");

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{ backgroundImage: grad, padding:"1.25rem 1.1rem 1rem", userSelect:"none", cursor:"pointer" }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
        <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:900, fontSize:"0.88rem", color:"var(--text-primary)", letterSpacing:"0.1em", opacity:0.7 }}>#{id}</span>
        <button
          onClick={onToggleFav}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
          style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:"1.15rem", lineHeight:1, transition:"transform 0.15s",
            color: isFav ? "#f5e642" : "var(--text-muted)",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {isFav ? "⭐" : "☆"}
        </button>
      </div>

      {/* Sprite */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:"0.75rem" }}>
        <div style={{
          width:"min(140px, 100%)", height:"auto", aspectRatio:"1/1", maxWidth:140, borderRadius:16,
          background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative",
          boxShadow: `inset 0 0 30px ${glow}18`,
        }}>
          {img ? (
            <img
              src={img} alt={pokemon.name}
              style={{
                width:"80%", height:"80%", objectFit:"contain", position:"relative", zIndex:1,
                filter:`drop-shadow(0 4px 16px ${glow}88)`,
                transition:"transform 0.28s cubic-bezier(0.34,1.4,0.64,1)",
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.12)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
              loading="lazy"
            />
          ) : (
            <div style={{ width:"80%", height:"80%", background:"rgba(255,255,255,0.04)", borderRadius:12 }}/>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 style={{
        fontFamily:"'Rajdhani',sans-serif", fontWeight:900,
        fontSize:"clamp(0.9rem, 3vw, 1.2rem)", textTransform:"capitalize",
        textAlign:"center", letterSpacing:"0.04em",
        color:"var(--text-primary)", marginBottom:"0.6rem", lineHeight:1.1,
      }}>
        {pokemon.name}
      </h3>

      {/* Type badges */}
      <div style={{ display:"flex", justifyContent:"center", gap:"0.4rem", flexWrap:"wrap" }}>
        {pokemon.types.map(t => (
          <span key={t.type.name} className={`type-pill t-${t.type.name}`}
            style={{ fontSize:"0.75rem", padding:"0.22rem 0.75rem" }}
          >{t.type.name}</span>
        ))}
      </div>
    </div>
  );
}