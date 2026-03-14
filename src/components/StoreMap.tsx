'use client';

interface StoreMapProps {
  route: number[];
}

// ── Layout constants ──────────────────────────────────────────────
const SHELF_W = 26;
const SHELF_GAP = 48;
const SHELF_UNIT = SHELF_W + SHELF_GAP;

const LEFT_MARGIN = 55;
const SHELF_X = [0, 1, 2, 3, 4].map(i => LEFT_MARGIN + i * SHELF_UNIT);

// Aisle centers (between each pair of shelves)
const AISLE_X = [0, 1, 2, 3].map(i => SHELF_X[i] + SHELF_W + SHELF_GAP / 2);

// Vertical positions
const TOP_CORRIDOR_Y = 58;
const ROW1_TOP = 80;
const ROW1_BOTTOM = 218;
const MID_CORRIDOR_Y = 240;
const ROW2_TOP = 262;
const ROW2_BOTTOM = 400;
const BOT_CORRIDOR_Y = 422;

const LEFT_CORRIDOR_X = 35;
const RIGHT_CORRIDOR_X = SHELF_X[4] + SHELF_W + 18;

// Kiosk is wall-mounted near aisle 8, bottom-right — this is the fixed start point
const KIOSK = { x: RIGHT_CORRIDOR_X, y: 370 };
const ENTRANCE = { x: 210, y: 472 };
// Checkout is near entrance, bottom-right of store
const CHECKOUT = { x: RIGHT_CORRIDOR_X, y: 462 };
const BATHROOMS = { x: 390, y: 26 };

const AISLE_DATA: { num: number; name: string; row: 1 | 2; col: number }[] = [
  { num: 1, name: 'PET FOOD', row: 1, col: 0 },
  { num: 2, name: 'TANKS', row: 1, col: 1 },
  { num: 3, name: 'FILTERS', row: 1, col: 2 },
  { num: 4, name: 'HEALTH', row: 1, col: 3 },
  { num: 5, name: 'DECOR', row: 2, col: 0 },
  { num: 6, name: 'TOYS', row: 2, col: 1 },
  { num: 7, name: 'GROOMING', row: 2, col: 2 },
  { num: 8, name: 'LEASHES', row: 2, col: 3 },
];

// ── Path computation — follows route order, exits toward next stop ──
interface Pt { x: number; y: number }

function aisleX(aisleNum: number): number {
  return aisleNum <= 4 ? AISLE_X[aisleNum - 1] : AISLE_X[aisleNum - 5];
}

function aisleEnds(aisleNum: number): { top: number; bot: number } {
  if (aisleNum <= 4) return { top: TOP_CORRIDOR_Y, bot: MID_CORRIDOR_Y };
  return { top: MID_CORRIDOR_Y, bot: BOT_CORRIDOR_Y };
}

// Find corridor Y values shared by two aisles' ends
function sharedCorridors(a: number, b: number): number[] {
  const ea = aisleEnds(a);
  const eb = aisleEnds(b);
  const shared: number[] = [];
  for (const y of [ea.top, ea.bot]) {
    if (y === eb.top || y === eb.bot) shared.push(y);
  }
  return shared;
}

// Navigate between two corridor points, routing via side corridors when needed
function corridorNav(path: Pt[], fromX: number, fromY: number, toX: number, toY: number) {
  if (fromY === toY) {
    if (fromX !== toX) path.push({ x: toX, y: toY });
  } else {
    const leftCost = Math.abs(fromX - LEFT_CORRIDOR_X) + Math.abs(toX - LEFT_CORRIDOR_X);
    const rightCost = Math.abs(fromX - RIGHT_CORRIDOR_X) + Math.abs(toX - RIGHT_CORRIDOR_X);
    const sideX = leftCost <= rightCost ? LEFT_CORRIDOR_X : RIGHT_CORRIDOR_X;

    if (fromX !== sideX) path.push({ x: sideX, y: fromY });
    path.push({ x: sideX, y: toY });
    if (toX !== sideX) path.push({ x: toX, y: toY });
  }
}

function computePath(route: number[]): Pt[] {
  if (route.length === 0) return [KIOSK, CHECKOUT];

  const path: Pt[] = [KIOSK];
  let cx = KIOSK.x;
  let cy = BOT_CORRIDOR_Y;
  path.push({ x: cx, y: cy });

  for (let i = 0; i < route.length; i++) {
    const aisleNum = route[i];
    const ax = aisleX(aisleNum);
    const ends = aisleEnds(aisleNum);

    // Decide which end to EXIT from — this is the key decision.
    // Exit toward the corridor shared with the NEXT aisle so the
    // transition is a direct corridor walk with no side-corridor detour.
    let exitY: number;

    if (i < route.length - 1) {
      const nextAisle = route[i + 1];
      const shared = sharedCorridors(aisleNum, nextAisle);

      if (shared.length === 1) {
        // One shared corridor (cross-row) — exit there
        exitY = shared[0];
      } else if (shared.length === 2) {
        // Two shared corridors (same row) — look ahead to break the tie.
        // Pick the corridor also shared with the stop AFTER next,
        // so the next aisle can also make a clean transition.
        if (i + 2 < route.length) {
          const futureShared = sharedCorridors(nextAisle, route[i + 2]);
          const preferred = shared.find(c => futureShared.includes(c));
          exitY = preferred ?? shared[0];
        } else {
          // This is the second-to-last stop — exit toward checkout (BOT)
          exitY = shared.reduce((best, c) =>
            Math.abs(c - BOT_CORRIDOR_Y) < Math.abs(best - BOT_CORRIDOR_Y) ? c : best
          );
        }
      } else {
        // No shared corridor (shouldn't happen) — exit toward next aisle center
        const ne = aisleEnds(nextAisle);
        const nextCenter = (ne.top + ne.bot) / 2;
        exitY = Math.abs(ends.top - nextCenter) < Math.abs(ends.bot - nextCenter)
          ? ends.top : ends.bot;
      }
    } else {
      // Last aisle — enter from closest end, exit from the other
      const distTop = Math.abs(cy - ends.top);
      const distBot = Math.abs(cy - ends.bot);
      exitY = distTop <= distBot ? ends.bot : ends.top;
    }

    const entryY = exitY === ends.top ? ends.bot : ends.top;

    // Navigate to entry, walk through aisle
    corridorNav(path, cx, cy, ax, entryY);
    path.push({ x: ax, y: exitY });
    cx = ax;
    cy = exitY;
  }

  // Navigate to checkout
  corridorNav(path, cx, cy, CHECKOUT.x, BOT_CORRIDOR_Y);
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

    const bx = curr.x - (dx1 / len1) * r;
    const by = curr.y - (dy1 / len1) * r;
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

  // Measure total path length for the traveling-light animation
  const pathLen = pathPoints.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = pathPoints[i - 1];
    return sum + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);

  // The "traveling light" is a bright segment that sweeps along the path.
  // Longer segment so you can clearly see the trail, slow animation for readability.
  const lightLen = Math.min(160, pathLen * 0.25); // visible segment length
  const gapLen = pathLen; // gap covers the rest
  const animDur = `${Math.max(8, Math.round(pathLen / 100))}s`; // ~100px per second

  return (
    <div className="bg-gray-800 rounded-xl p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Store Map & Your Route</h3>
      <svg viewBox="0 0 420 500" className="w-full max-w-md mx-auto" style={{ minWidth: 300 }}>
        <defs>
          <linearGradient id="shelfGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="50%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arrowhead marker for the traveling light */}
          <marker id="pathArrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 0 0 L 10 4 L 0 8 Z" fill="#fbbf24" />
          </marker>
          {/* Pulsing animation for "You Are Here" */}
          <radialGradient id="kioskPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Store floor ── */}
        <rect x="8" y="8" width="404" height="484" rx="10" fill="#111827" stroke="#374151" strokeWidth="1.5" />

        {/* ── Corridors (walkable areas) ── */}
        <rect x="20" y="42" width="380" height="32" rx="3" fill="#1e293b" opacity="0.6" />
        <rect x="20" y="226" width="380" height="32" rx="3" fill="#1e293b" opacity="0.6" />
        <rect x="20" y="408" width="380" height="32" rx="3" fill="#1e293b" opacity="0.6" />
        <rect x="20" y="42" width="28" height="398" rx="3" fill="#1e293b" opacity="0.4" />
        <rect x={RIGHT_CORRIDOR_X - 10} y="42" width="28" height="398" rx="3" fill="#1e293b" opacity="0.4" />

        {/* ── Checkout lanes (bottom-right, near entrance) ── */}
        <g>
          {/* Counter */}
          <rect x={RIGHT_CORRIDOR_X - 14} y="446" width="28" height="38" rx="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
          {/* Lane dividers */}
          <rect x={RIGHT_CORRIDOR_X - 10} y="455" width="20" height="3" rx="1" fill="#6b7280" />
          <rect x={RIGHT_CORRIDOR_X - 10} y="465" width="20" height="3" rx="1" fill="#6b7280" />
          <rect x={RIGHT_CORRIDOR_X - 10} y="475" width="20" height="3" rx="1" fill="#6b7280" />
          {/* Register icons */}
          <rect x={RIGHT_CORRIDOR_X - 6} y="449" width="8" height="4" rx="1" fill="#22c55e" opacity="0.7" />
          <rect x={RIGHT_CORRIDOR_X - 6} y="459" width="8" height="4" rx="1" fill="#22c55e" opacity="0.7" />
          <rect x={RIGHT_CORRIDOR_X - 6} y="469" width="8" height="4" rx="1" fill="#22c55e" opacity="0.7" />
          {/* Label */}
          <text x={RIGHT_CORRIDOR_X} y="443" textAnchor="middle" fill="#86efac" fontSize="7" fontWeight="bold" letterSpacing="0.5">
            CHECKOUT
          </text>
        </g>

        {/* ── Bathrooms (top-right) ── */}
        <g>
          <rect x="355" y="14" width="48" height="24" rx="4" fill="#1e3a5f" stroke="#2563eb" strokeWidth="0.8" opacity="0.8" />
          <text x="379" y="23" textAnchor="middle" fill="#60a5fa" fontSize="12">
            🚻
          </text>
          <text x="379" y="34" textAnchor="middle" fill="#60a5fa" fontSize="6" fontWeight="bold">
            WC
          </text>
        </g>

        {/* ── Shelving units ── Row 1 (top) ── */}
        {SHELF_X.map((sx, i) => (
          <g key={`r1-shelf-${i}`}>
            <rect x={sx} y={ROW1_TOP} width={SHELF_W} height={ROW1_BOTTOM - ROW1_TOP} rx="3" fill="url(#shelfGrad)" stroke="#4b5563" strokeWidth="0.5" />
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

              {/* Aisle number — large and bold */}
              <text
                x={ax}
                y={midY - 6}
                textAnchor="middle"
                fill={isActive ? '#ffffff' : '#9ca3af'}
                fontSize="16"
                fontWeight="bold"
              >
                {aisle.num}
              </text>

              {/* Aisle name — readable */}
              <text
                x={ax}
                y={midY + 10}
                textAnchor="middle"
                fill={isActive ? '#c4b5fd' : '#6b7280'}
                fontSize="7"
                fontWeight="600"
                letterSpacing="0.5"
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
            {/* Faint static path — always visible so you see the full route */}
            <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.18" strokeLinecap="round" strokeLinejoin="round" />

            {/* Glow around the traveling light */}
            <path
              d={pathD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${lightLen},${gapLen}`}
              opacity="0.1"
            >
              <animate
                attributeName="stroke-dashoffset"
                from={lightLen}
                to={-(pathLen)}
                dur={animDur}
                repeatCount="indefinite"
              />
            </path>

            {/* Traveling light — bright trail segment */}
            <path
              d={pathD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${lightLen},${gapLen}`}
              opacity="0.9"
            >
              <animate
                attributeName="stroke-dashoffset"
                from={lightLen}
                to={-(pathLen)}
                dur={animDur}
                repeatCount="indefinite"
              />
            </path>

            {/* Leading dot — pinned to the front of the light using the same dash trick */}
            <path
              d={pathD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`1,${gapLen + lightLen - 1}`}
              opacity="0.95"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to={-(pathLen + lightLen)}
                dur={animDur}
                repeatCount="indefinite"
              />
            </path>

            {/* End dot at checkout */}
            <circle cx={CHECKOUT.x} cy={CHECKOUT.y} r="5" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx={CHECKOUT.x} cy={CHECKOUT.y} r="2" fill="white" />
          </>
        )}

        {/* ── "You Are Here" kiosk marker (always visible) ── */}
        <g>
          {/* Pulsing ring */}
          <circle cx={KIOSK.x} cy={KIOSK.y} r="18" fill="url(#kioskPulse)">
            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Solid dot */}
          <circle cx={KIOSK.x} cy={KIOSK.y} r="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          <circle cx={KIOSK.x} cy={KIOSK.y} r="3" fill="white" />
          {/* Label — offset left so it doesn't clip the edge */}
          <rect x={KIOSK.x - 72} y={KIOSK.y - 7} width="60" height="14" rx="3" fill="#1d4ed8" />
          <text x={KIOSK.x - 42} y={KIOSK.y + 3} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" letterSpacing="0.5">
            YOU ARE HERE
          </text>
        </g>

        {/* ── Entrance marker ── */}
        <g>
          <rect x={ENTRANCE.x - 28} y={ENTRANCE.y - 2} width="56" height="18" rx="4" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
          <text x={ENTRANCE.x} y={ENTRANCE.y + 11} textAnchor="middle" fill="#d1d5db" fontSize="8" fontWeight="bold" letterSpacing="0.5">
            ENTRANCE
          </text>
          {/* Door indicators */}
          <line x1={ENTRANCE.x - 12} y1={ENTRANCE.y - 2} x2={ENTRANCE.x - 12} y2={ENTRANCE.y - 6} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          <line x1={ENTRANCE.x + 12} y1={ENTRANCE.y - 2} x2={ENTRANCE.x + 12} y2={ENTRANCE.y - 6} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* ── Legend ── */}
        <g transform="translate(15, 456)">
          <line x1="0" y1="6" x2="18" y2="6" stroke="#fbbf24" strokeWidth="2.5" opacity="0.7" />
          <text x="24" y="10" fill="#9ca3af" fontSize="7">Your route</text>
          <circle cx="9" cy="22" r="5" fill="#3b82f6" opacity="0.7" />
          <text x="24" y="25" fill="#9ca3af" fontSize="7">You are here</text>
          <rect x="3" y="33" width="12" height="7" rx="2" fill="url(#shelfGrad)" stroke="#4b5563" strokeWidth="0.5" />
          <text x="24" y="40" fill="#9ca3af" fontSize="7">Shelving</text>
        </g>
      </svg>
    </div>
  );
}
