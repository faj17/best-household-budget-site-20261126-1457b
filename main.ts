// Hearth & Ledger — the hand-in program (Node 22, standard library only).
// The site itself is the app/ folder beside this file: plain static files a
// browser opens at app/index.html (ES modules, CSS, no build step), with
// nothing it runs, styles or shows loaded over the network. This program
// hands the entry in: it copies app/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json — the summary the judge reads
// (the screenshots, the first load's files and bytes, and the source) — with
// the vendored make.fun library. Leave vendor/makefun-frontend.ts exactly as
// the kit handed it out: the scorer requires dossier.json to be byte for byte
// what its own copy of that library writes.
//
// Run it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  cpSync(join(repoRoot, from), join(outputDir, to), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree('app', 'app');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTree('screenshots', 'screenshots');
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the other caps refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files, with app/ counting beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Hearth & Ledger handed in: app/ + screenshots/ + dossier.json (${dossier.length} bytes) in ${outputDir}`);
