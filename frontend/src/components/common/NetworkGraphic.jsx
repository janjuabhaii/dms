import { motion } from "framer-motion";

/**
 * Signature visual for the login screen: an animated node-and-route graphic
 * representing the distribution network itself (warehouse -> routes -> shops)
 * rather than a generic abstract gradient blob. Lines draw themselves in on
 * mount, nodes pulse in staggered after — a small, deliberate moment rather
 * than decorative motion for its own sake.
 */
const NetworkGraphic = () => {
  const nodes = [
    { x: 60, y: 200, r: 7 }, // warehouse / hub
    { x: 180, y: 90, r: 4 },
    { x: 220, y: 220, r: 4 },
    { x: 320, y: 60, r: 4 },
    { x: 340, y: 170, r: 4 },
    { x: 300, y: 280, r: 4 },
    { x: 420, y: 120, r: 4 },
    { x: 440, y: 240, r: 4 },
  ];

  const routes = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [4, 6],
    [4, 7],
    [3, 6],
  ];

  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {routes.map(([a, b], i) => {
        const from = nodes[a];
        const to = nodes[b];
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="hsl(var(--primary))"
            strokeOpacity={0.35}
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.08, ease: "easeInOut" }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: i === 0 ? 1 : 0.6 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.09 }}
        />
      ))}
    </svg>
  );
};

export default NetworkGraphic;
