import { PLACES, PLACE_IDS, type PlaceId, type Weather } from "@/lib/world";

// The painted world behind the characters: sky, hills, path and five places.
// Everything is drawn in code, so no image files are needed.

function Trail() {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full">
      <path d="M30 120 L55 40 L80 120 Z" fill="#2F6B4F" />
      <path d="M38 95 L55 25 L72 95 Z" fill="#3B8061" />
      <path d="M85 122 L112 30 L139 122 Z" fill="#2F6B4F" />
      <path d="M94 95 L112 15 L130 95 Z" fill="#46916E" />
      <rect x="52" y="118" width="6" height="10" fill="#6B4F36" />
      <rect x="109" y="120" width="6" height="8" fill="#6B4F36" />
      <rect x="10" y="88" width="5" height="40" fill="#8B6B4A" />
      <path d="M2 86 h28 l6 6 -6 6 h-28 z" fill="#C9A26B" />
    </svg>
  );
}

function Home() {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full">
      <rect x="28" y="58" width="104" height="70" rx="4" fill="#F3E3C7" />
      <path d="M18 62 L80 14 L142 62 Z" fill="#C8553D" />
      <rect x="104" y="22" width="12" height="26" fill="#A3402D" />
      <rect x="68" y="88" width="24" height="40" rx="12" fill="#7C4A2D" />
      <circle cx="87" cy="108" r="2" fill="#F5C26B" />
      <rect x="38" y="74" width="22" height="20" rx="3" fill="#9FD3E8" stroke="#fff" strokeWidth="3" />
      <rect x="100" y="74" width="22" height="20" rx="3" fill="#F5D98B" stroke="#fff" strokeWidth="3" />
      <ellipse cx="48" cy="126" rx="14" ry="5" fill="#7FB36A" />
    </svg>
  );
}

function Park() {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full">
      <circle cx="112" cy="52" r="32" fill="#5FA36F" />
      <circle cx="92" cy="66" r="22" fill="#6DB37C" />
      <rect x="108" y="76" width="9" height="52" fill="#7C5A3A" />
      {[10, 30, 50, 70, 90, 130, 150].map((x) => (
        <rect key={x} x={x} y="98" width="5" height="30" rx="2" fill="#F7F1E3" />
      ))}
      <rect x="6" y="104" width="150" height="4" fill="#F7F1E3" />
      <rect x="6" y="116" width="150" height="4" fill="#F7F1E3" />
      <circle cx="44" cy="124" r="6" fill="#E85D75" />
      <path d="M38 124 h12" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function Cafe() {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full">
      <rect x="26" y="50" width="108" height="78" rx="4" fill="#FCEFD9" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${26 + i * 18} 50 h18 v14 a9 9 0 0 1 -18 0 z`} fill={i % 2 ? "#FFFFFF" : "#E07A5F"} />
      ))}
      <rect x="20" y="40" width="120" height="12" rx="3" fill="#B5543A" />
      <rect x="40" y="80" width="36" height="28" rx="3" fill="#9FD3E8" stroke="#fff" strokeWidth="3" />
      <rect x="90" y="84" width="24" height="44" rx="3" fill="#7C4A2D" />
      <circle cx="58" cy="30" r="10" fill="#fff" stroke="#B5543A" strokeWidth="3" />
      <path d="M53 28 h10 v6 a5 5 0 0 1 -10 0 z" fill="#7C4A2D" />
    </svg>
  );
}

function Beach({ closed }: { closed: boolean }) {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full">
      <path d="M0 96 Q40 88 80 96 T160 96 V130 H0 Z" fill="#5BB8D6" />
      <path d="M0 104 Q40 96 80 104 T160 104" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" />
      <path d="M0 116 Q60 108 160 118 V130 H0 Z" fill="#F2D49B" />
      <rect x="62" y="44" width="4" height="74" fill="#8B6B4A" />
      <path d="M24 50 Q64 10 104 50 Z" fill="#F28C6B" />
      <path d="M44 50 Q64 22 84 50 Z" fill="#FFFFFF" opacity="0.9" />
      {closed && (
        <g>
          <rect x="96" y="70" width="5" height="50" fill="#6B4F36" />
          <rect x="74" y="56" width="50" height="22" rx="3" fill="#D64545" />
          <text x="99" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">CLOSED</text>
        </g>
      )}
    </svg>
  );
}

const LANDMARK: Record<PlaceId, (p: { closed: boolean }) => JSX.Element> = {
  trail: Trail,
  home: Home,
  park: Park,
  cafe: Cafe,
  beach: Beach,
};

export default function World({
  weather,
  closed,
  sunset,
  focus,
}: {
  weather: Weather;
  closed?: PlaceId;
  sunset: boolean;
  focus?: PlaceId | null;
}) {
  const sky = sunset
    ? "linear-gradient(to bottom, #3B2F63 0%, #C2577A 45%, #F6A65A 75%)"
    : weather === "rain"
      ? "linear-gradient(to bottom, #8A96A3 0%, #B7C2CC 70%)"
      : weather === "heat"
        ? "linear-gradient(to bottom, #F4B860 0%, #FCE3A6 70%)"
        : "linear-gradient(to bottom, #7EC8F0 0%, #CDEBFA 70%)";

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: sky, transition: "background 1.5s" }}>
      {/* Sun */}
      {weather !== "rain" && (
        <div
          className={`absolute rounded-full ${weather === "heat" ? "heat-pulse" : ""}`}
          style={{
            right: sunset ? "8%" : "10%",
            top: sunset ? "38%" : "9%",
            width: weather === "heat" ? 110 : 70,
            height: weather === "heat" ? 110 : 70,
            background: sunset ? "#FF8A4C" : weather === "heat" ? "#FF9F1C" : "#FFD84D",
            boxShadow: `0 0 ${weather === "heat" ? 80 : 40}px ${sunset ? "#FF8A4C" : "#FFD84D"}`,
            transition: "all 2s ease-in-out",
          }}
        />
      )}

      {/* Clouds drift across */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="cloud absolute"
          style={{
            top: `${8 + i * 9}%`,
            animationDuration: `${55 + i * 18}s`,
            animationDelay: `${-i * 17}s`,
            opacity: weather === "rain" ? 0.95 : 0.85,
          }}
        >
          <svg width="150" height="60" viewBox="0 0 150 60">
            <g fill={weather === "rain" ? "#8C97A3" : "#FFFFFF"}>
              <ellipse cx="45" cy="38" rx="35" ry="18" />
              <ellipse cx="80" cy="28" rx="32" ry="24" />
              <ellipse cx="110" cy="40" rx="30" ry="16" />
            </g>
          </svg>
        </div>
      ))}

      {/* Rolling hills */}
      <svg className="absolute inset-x-0 bottom-[24%] h-[34%] w-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0 120 Q150 20 320 110 T650 90 T1000 100 V200 H0 Z" fill={sunset ? "#6E7F5A" : "#9CCB86"} />
        <path d="M0 160 Q200 90 420 150 T800 130 T1000 150 V200 H0 Z" fill={sunset ? "#5E714D" : "#82BC6E"} />
      </svg>

      {/* Ground and the path that connects every place */}
      <div className="absolute inset-x-0 bottom-0 h-[26%]" style={{ background: sunset ? "#5C7A45" : "#76B35F" }} />
      <div className="absolute inset-x-0 bottom-[13%] h-[7%] rounded-full" style={{ background: "#E3C58E" }} />

      {/* The five places */}
      {PLACE_IDS.map((id) => {
        const L = LANDMARK[id];
        const p = PLACES[id];
        return (
          <div
            key={id}
            className="absolute bottom-[24%] flex flex-col items-center"
            style={{ left: `${p.x}%`, transform: "translateX(-50%)", width: "clamp(90px, 15%, 150px)" }}
          >
            <div className="aspect-[160/130] w-full">
              <L closed={closed === id} />
            </div>
            <div
              className={`-mt-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold shadow transition-all duration-500 ${
                focus === id ? "scale-110 bg-yellow-300 text-stone-900" : "bg-white/85 text-stone-700"
              }`}
            >
              {p.name}
            </div>
          </div>
        );
      })}

      {/* Weather overlays */}
      {weather === "rain" && !sunset && <div className="rain pointer-events-none absolute inset-0" />}
      {weather === "heat" && !sunset && <div className="heat-haze pointer-events-none absolute inset-0" />}
    </div>
  );
}
