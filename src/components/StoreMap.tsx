'use client';

interface StoreMapProps {
  route: number[];
}

// ── Layout constants ──────────────────────────────────────────────
// Shelving units are vertical rectangles; aisles are the gaps between them.
// Two rows of 4 aisles each. Corridors connect the rows.

const SHELF_W = 26;
const SHELF_GAP = 48; // aisle width between shelves
const SHELF_UNIT = SHELF_W + SHELF_GAP; // 74px per unit

const LEFT_MARGIN = 55;
const SHELF_X = [0, 1, 2, 3, 4].map(i => LEFT_MARGIN + i * SHELF_UNIT); // 5 shelves per row
// Shelves at x: 55, 129, 203, 277, 351

// Aisle centers (between each pair of shelves)
const AISLE_X = [0, 1, 2, 3].map(i => SHELF_X[i] + SHELF_W + SHELF_GAP / 2);
// Centers at x: 105, 179, 253, 327

// Vertical positions
const TOP_CORRIDOR_Y = 50;
const ROW1_TOP = 72;
const ROW1_BOTTOM = 210;
const MID_CORRIDOR_Y = 232;
const ROW2_TOP = 254;
const ROW2_BOTTOM = 392;
const BOT_CORRIDOR_Y = 414;

const LEFT_CORRIDOR_X = 35;
const RIGHT_CORRIDOR_X = SHELF_X[4] + SHELF_W + 18; // ~395

const ENTRANCE = { x: 210, y: 460 };
const CHECKOUT = { x: 48, y: 22 };

const AISLE_DATA: { num: number; name: string; row: 1 | 2; col: number }[] = [
  { num: 1, name: 'Pet Food', row: 1, col: 0 },
  { num: 2, name: 'Tanks', row: 1, col: 1 },
  { num: 3, name: 'Filters', row: 1, col: 2 },
  { num: 4, name: 'Health', row: 1, col: 3 },
  { num: 5, name: 'Decor', row: 2, col: 0 },
  { num: 6, name: 'Toys', row: 2, col: 1 },
  { num: 7, name: 'Grooming', row: 2, col: 2 },
  { num: 8, name: 'Leashes', row: 2, col: 3 },
];

// ── Serpentine path computation ───────────────────────────────────
interface Pt { x: number; y: number }

function computePath(route: number[]): Pt[] {
  if (route.length === 0) return [ENTRANCE, CHECKOUT];

  const row2 = route.filter(a => a >= 5).sort((a, b) => a - b);
  const row1 = route.filter(a => a <= 4).sort((a, b) => b - a); // right-to-left toward checkout

  const path: Pt[] = [ENTRANCE];

  // Drop to bottom corridor
  path.push({ x: ENTRANCE.x, y: BOT_CORRIDOR_Y });

  let currentY = BOT_CORRIDOR_Y;

  // Serpentine through row 2 (aisles 5-8)
  for (const aisleNum of row2) {
    const ax = AISLE_X[aisleNum - 5];
    path.push({ x: ax, y: currentY });
    const nextY = currentY === BOT_CORRIDOR_Y ? MID_CORRIDOR_Y : BOT_CORRIDOR_Y;
    path.push({ x: ax, y: nextY });
    currentY = nextY;
  }

  // Get to middle corridor for row 1
  if (row1.length > 0 && currentY !== MID_CORRIDOR_Y) {
    path.push({ x: LEFT_CORRIDOR_X, y: currentY });
    path.push({ x: LEFT_CORRIDOR_X, y: MID_CORRIDOR_Y });
    currentY = MID_CORRIDOR_Y;
  } else if (row2.length === 0 && row1.length > 0) {
    path.push({ x: LEFT_CORRIDOR_X, y: BOT_CORRIDOR_Y });
    path.push({ x: LEFT_CORRIDOR_X, y: MID_CORRIDOR_Y });
    currentY = MID_CORRIDOR_Y;
  }

  // Serpentine through row 1 (aisles 1-4, right to left)
  for (const aisleNum of row1) {
    const ax = AISLE_X[aisleNum - 1];
    path.push({ x: ax, y: currentY });
    const nextY = currentY === MID_CORRIDOR_Y ? TOP_CORRIDOR_Y : MID_CORRIDOR_Y;
    path.push({ x: ax, y: nextY });
    currentY = nextY;
  }

  // Navigate to checkout
  if (row1.length === 0 && row2.length > 0) {
    // Only row 2 aisles visited — go up to checkout
    if (currentY === BOT_CORRIDOR_Y) {
      path.push({ x: LEFT_CORRIDOR_X, y: BOT_CORRIDOR_Y });
      path.push({ x: LEFT_CORRIDOR_X, y: TOP_CORRIDOR_Y });
    } else {
      path.push({ x: LEFT_CORRIDOR_X, y: MID_CORRIDOR_Y });
      path.push({ x: LEFT_CORRIDOR_X, y: TOP_CORRIDOR_Y });
    }
  } else if (currentY !== TOP_CORRIDOR_Y) {
    path.push({ x: LEFT_CORRIDOR_X, y: currentY });
    path.push({ x: LEFT_CORRIDOR_X, y: TOP_CORRIDOR_Y });
  }

  path.push({ x: CHECKOUT.x, y: TOP_CORRIDOR_Y });
  path.push(CHECKOUT);

  return path;
}

// Build SVG path with rounded corners
function buildSmoothPath(points: Pt[]): string {
  if (points.length < 2) return '';
  const radius = 10;
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Direction vectors
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 === 0 || len2 === 0) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const r = Math.min(radius, len1 / 2, len2 / 2);

    // Point before the corner
    const bx = curr.x - (dx1 / len1) * r;
    const by = curr.y - (dy1 / len1) * r;
    // Point after the corner
    const ax = curr.x + (dx2 / len2) * r;
    const ay = curr.y + (dy2 / len2) * r;

    d += ` L ${bx} ${by}`;
    d += ` Q ${curr.x} ${curr.y} ${ax} ${ay}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

// ── Component ─────────────────────────────────────────────────────
export default function StoreMap({ route }: StoreMapProps) {
  const pathPoints = computePath(route);
  const pathD = buildSmoothPath(pathPoints);

  // Measure path length for dash animation
  const pathLen = pathPoints.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = pathPoints[i - 1];
    return sum + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);

  // Place direction arrows along the path
  const arrows: { x: number; y: number; angle: number }[] = [];
  for (let i = 1; i < pathPoints.length; i++) {
    const a = pathPoints[i - 1];
    const b = pathPoints[i];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const angle = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
    const segLen = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    if (segLen > 30) {
      arrows.push({ x: mx, y: my, angle });
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Store Map & Your Route</h3>
      <svg viewBox="0 0 420 490" className="w-full max-w-md mx-auto" style={{ minWidth: 300 }}>
        <defs>
          {/* Arrow marker */}
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
          </marker>
          {/* Shelf gradient */}
          <linearGradient id="shelfGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="50%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
          {/* Active aisle glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Store floor ── */}
        <rect x="8" y="8" width="404" height="474" rx="10" fill="#111827" stroke="#374151" strokeWidth="1.5" />

        {/* ── Corridors (walkable areas) ── */}
        {/* Top corridor */}
        <rect x="20" y="36" width="380" height="32" rx="3" fill="#1e293b" opacity="0.6" />
        {/* Middle corridor */}
        <rect x="20" y="218" width="380" height="32" rx="3" fill="#1e293b" opacity="0.6" />
        {/* Bottom corridor */}
        <rect x="20" y="400" width="380" height="32" rx="3" fill="#1e293b" opacity="0.6" />
        {/* Left corridor */}
        <rect x="20" y="36" width="28" height="396" rx="3" fill="#1e293b" opacity="0.4" />
        {/* Right corridor */}
        <rect x={RIGHT_CORRIDOR_X - 10} y="36" width="28" height="396" rx="3" fill="#1e293b" opacity="0.4" />

        {/* ── Shelving units ── Row 1 (top) ── */}
        {SHELF_X.map((sx, i) => (
          <g key={`r1-shelf-${i}`}>
            <rect x={sx} y={ROW1_TOP} width={SHELF_W} height={ROW1_BOTTOM - ROW1_TOP} rx="3" fill="url(#shelfGrad)" stroke="#4b5563" strokeWidth="0.5" />
            {/* Shelf section lines */}
            {[0.2, 0.4, 0.6, 0.8].map(frac => (
              <line key={frac} x1={sx} y1={ROW1_TOP + (ROW1_BOTTOM - ROW1_TOP) * frac} x2={sx + SHELF_W} y2={ROW1_TOP + (ROW1_BOTTOM - ROW1_TOP) * frac} stroke="#374151" strokeWidth="0.5" />
            ))}
          </g>
        ))}

        {/* ── Shelving units ── Row 2 (bottom) ── */}
        {SHELF_X.map((sx, i) => (
          <g key={`r2-shelf-${i}`}>
            <rect x={sx} y={ROW2_TOP} width={SHELF_W} height={ROW2_BOTTOM - ROW2_TOP} rx="3" fill="url(#shelfGrad)" stroke="#4b5563" strokeWidth="0.5" />
            {[0.2, 0.4, 0.6, 0.8].map(frac => (
              <line key={frac} x1={sx} y1={ROW2_TOP + (ROW2_BOTTOM - ROW2_TOP) * frac} x2={sx + SHELF_W} y2={ROW2_TOP + (ROW2_BOTTOM - ROW2_TOP) * frac} stroke="#374151" strokeWidth="0.5" />
            ))}
          </g>
        ))}

        {/* ── Aisle labels & highlights ── */}
        {AISLE_DATA.map(aisle => {
          const ax = AISLE_X[aisle.col];
          const isRow1 = aisle.row === 1;
          const topY = isRow1 ? ROW1_TOP : ROW2_TOP;
          const botY = isRow1 ? ROW1_BOTTOM : ROW2_BOTTOM;
          const midY = (topY + botY) / 2;
          const isActive = route.includes(aisle.num);
          const stopNum = route.indexOf(aisle.num) + 1;

          return (
            <g key={aisle.num}>
              {/* Aisle floor highlight */}
              {isActive && (
                <rect
                  x={ax - SHELF_GAP / 2 + 4}
                  y={topY}
                  width={SHELF_GAP - 8}
                  height={botY - topY}
                  rx="4"
                  fill="#7c3aed"
                  opacity="0.15"
                  filter="url(#glow)"
                />
              )}

              {/* Aisle number */}
              <text
                x={ax}
                y={midY - 8}
                textAnchor="middle"
                fill={isActive ? '#c4b5fd' : '#6b7280'}
                fontSize="13"
                fontWeight="bold"
              >
                {aisle.num}
              </text>

              {/* Aisle name */}
              <text
                x={ax}
                y={midY + 8}
                textAnchor="middle"
                fill={isActive ? '#a78bfa' : '#4b5563'}
                fontSize="7"
              >
                {aisle.name}
              </text>

              {/* Stop number badge */}
              {isActive && (
                <>
                  <circle cx={ax} cy={topY + 14} r={9} fill="#f59e0b" />
                  <text x={ax} y={topY + 18} textAnchor="middle" fill="#1a1a2e" fontSize="10" fontWeight="bold">
                    {stopNum}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ── Route path ── */}
        {route.length > 0 && (
          <>
            {/* Shadow */}
            <path d={pathD} fill="none" stroke="#000" strokeWidth="6" opacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Background line */}
            <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3.5" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Animated dashed line */}
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12,6"
            >
              <animate attributeName="stroke-dashoffset" from={pathLen} to="0" dur="3s" repeatCount="indefinite" />
            </path>

            {/* Direction arrows */}
            {arrows.map((a, i) => (
              <g key={i} transform={`translate(${a.x},${a.y}) rotate(${a.angle})`}>
                <polygon points="-4,-3.5 4,0 -4,3.5" fill="#fbbf24" opacity="0.9" />
              </g>
            ))}

            {/* Start dot */}
            <circle cx={ENTRANCE.x} cy={ENTRANCE.y} r="6" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx={ENTRANCE.x} cy={ENTRANCE.y} r="2.5" fill="white" />

            {/* End dot */}
            <circle cx={CHECKOUT.x} cy={CHECKOUT.y} r="6" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx={CHECKOUT.x} cy={CHECKOUT.y} r="2.5" fill="white" />
          </>
        )}

        {/* ── Entrance marker ── */}
        <g>
          <rect x={ENTRANCE.x - 30} y={ENTRANCE.y - 4} width="60" height="20" rx="4" fill="#22c55e" />
          <text x={ENTRANCE.x} y={ENTRANCE.y + 10} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
            ENTRANCE
          </text>
        </g>

        {/* ── Checkout marker ── */}
        <g>
          <rect x="16" y="12" width="64" height="20" rx="4" fill="#ef4444" />
          <text x="48" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
            CHECKOUT
          </text>
        </g>

        {/* ── Legend ── */}
        <g transform="translate(310, 452)">
          <line x1="0" y1="6" x2="20" y2="6" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,3" />
          <text x="26" y="10" fill="#9ca3af" fontSize="8">Your route</text>
          <rect x="0" y="18" width="12" height="8" rx="2" fill="url(#shelfGrad)" stroke="#4b5563" strokeWidth="0.5" />
          <text x="26" y="26" fill="#9ca3af" fontSize="8">Shelving</text>
        </g>
      </svg>
    </div>
  );
}
