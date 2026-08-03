export default function BidAskCathedralLogo({
  size = 180,
  stroke = "#F2C66D",
  bid = "#42D85A",
  ask = "#E53935",
  background = "transparent",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {background !== "transparent" && (
        <rect width="200" height="200" rx="16" fill={background} />
      )}

      {/* Outer Gothic Arch */}
      <path
        d="M40 170
           L40 82
           Q100 18 160 82
           L160 170"
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Inner Arch */}
      <path
        d="M58 170
           L58 90
           Q100 42 142 90
           L142 170"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        opacity=".75"
      />

      {/* Rose Window */}
      <circle
        cx="100"
        cy="48"
        r="12"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
      />

      <path
        d="
          M100 36 L100 60
          M88 48 L112 48
          M92 40 L108 56
          M108 40 L92 56
        "
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Cathedral Columns */}
      <line
        x1="72"
        y1="80"
        x2="72"
        y2="170"
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        x1="128"
        y1="80"
        x2="128"
        y2="170"
        stroke={stroke}
        strokeWidth="2"
      />

      {/* BUY Candles */}
      <rect x="74" y="108" width="10" height="40" rx="2" fill={bid} />
      <line x1="79" y1="98" x2="79" y2="160" stroke={bid} strokeWidth="2" />

      <rect x="88" y="92" width="10" height="50" rx="2" fill={bid} />
      <line x1="93" y1="82" x2="93" y2="154" stroke={bid} strokeWidth="2" />

      {/* Neutral Candle */}
      <rect x="101" y="100" width="10" height="34" rx="2" fill={stroke} />
      <line x1="106" y1="90" x2="106" y2="145" stroke={stroke} strokeWidth="2" />

      {/* SELL Candles */}
      <rect x="115" y="95" width="10" height="46" rx="2" fill={ask} />
      <line x1="120" y1="84" x2="120" y2="154" stroke={ask} strokeWidth="2" />

      <rect x="129" y="110" width="10" height="36" rx="2" fill={ask} />
      <line x1="134" y1="100" x2="134" y2="158" stroke={ask} strokeWidth="2" />

      {/* Floor */}
      <path
        d="M28 170 Q100 178 172 170"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        opacity=".65"
      />
    </svg>
  );
}