/**
 * Generate simple monogram SVGs for team chips when remote logos can't be fetched.
 * These are lettermarks, not official brand marks.
 */
import fs from "fs";
import path from "path";

const OUT = "public/images/teams";

const teams = [
  { file: "team-spirit.svg", letter: "S", bg: "#F15A29", fg: "#fff" },
  { file: "vitality.svg", letter: "V", bg: "#FFD100", fg: "#111" },
  { file: "falcons.svg", letter: "F", bg: "#00A651", fg: "#fff" },
  { file: "g2-esports.svg", letter: "G2", bg: "#000", fg: "#fff", size: 11 },
  { file: "navi.svg", letter: "N", bg: "#FFEE00", fg: "#111" },
  { file: "faze.svg", letter: "Fz", bg: "#E03C31", fg: "#fff", size: 11 },
  { file: "liquid.svg", letter: "L", bg: "#0A54FF", fg: "#fff" },
  { file: "mouz.svg", letter: "M", bg: "#E4002B", fg: "#fff" },
  { file: "furia.svg", letter: "F", bg: "#111", fg: "#fff" },
  { file: "astralis.svg", letter: "A", bg: "#EF3340", fg: "#fff" },
  { file: "cloud9.svg", letter: "C9", bg: "#1AA3FF", fg: "#fff", size: 11 },
  { file: "fnatic.svg", letter: "Fn", bg: "#FF5900", fg: "#fff", size: 11 },
  { file: "mongolz.svg", letter: "M", bg: "#C9A227", fg: "#111" },
  { file: "heroic.svg", letter: "H", bg: "#E30613", fg: "#fff" },
  { file: "mibr.svg", letter: "M", bg: "#1B3A5F", fg: "#fff" },
  { file: "sentinels.svg", letter: "S", bg: "#CE0E2D", fg: "#fff" },
  { file: "t1.svg", letter: "T1", bg: "#E2012D", fg: "#fff", size: 11 },
  { file: "nrg.svg", letter: "N", bg: "#1A1A1A", fg: "#fff" },
  { file: "100-thieves.svg", letter: "1", bg: "#EF233C", fg: "#fff" },
  { file: "loud.svg", letter: "L", bg: "#39FF14", fg: "#111" },
  { file: "karmine-corp.svg", letter: "K", bg: "#1B4DFF", fg: "#fff" },
  { file: "heretics.svg", letter: "H", bg: "#8B5CF6", fg: "#fff" },
  { file: "paper-rex.svg", letter: "PR", bg: "#00FF87", fg: "#111", size: 10 },
  { file: "geng.svg", letter: "G", bg: "#AA8B56", fg: "#fff" },
  { file: "edward-gaming.svg", letter: "E", bg: "#C8102E", fg: "#fff" },
  { file: "w7m.svg", letter: "W", bg: "#00AEEF", fg: "#fff" },
];

function svg({ letter, bg, fg, size = 13 }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" role="img">
  <rect width="40" height="40" rx="8" fill="${bg}"/>
  <text x="20" y="21" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui,Segoe UI,sans-serif" font-weight="700"
    font-size="${size}" fill="${fg}">${letter}</text>
</svg>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const t of teams) {
  fs.writeFileSync(path.join(OUT, t.file), svg(t));
  console.log("wrote", t.file);
}
console.log("done", teams.length);
