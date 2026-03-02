/**
 * sync-to-map.js
 * ──────────────────────────────────────────────────────────────────────────
 * Reads every problem file in judge/src/problems/, finds the ones that have
 * a `conquestId` field, and patches the corresponding entry in the React
 * conquest map so that `judgeId` is set automatically.
 *
 * Run once after dropping new problem files into judge/src/problems/:
 *
 *   node sync-to-map.js          (from the judge/ directory)
 *
 * Safe to run multiple times — already-linked entries are updated in place.
 * ──────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const PROBLEMS_DIR  = path.join(__dirname, 'src', 'problems');
const CONQUEST_MAP  = path.join(__dirname, '..', 'reactapp', 'src', 'data', 'dsa-conquest-map.js');

// ── Helper: recursively collect all .js files under a directory ───────────

function collectJsFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── 1. Collect all problem files that declare a conquestId ────────────────

const linked = [];

for (const fullPath of collectJsFiles(PROBLEMS_DIR)) {
  const relName = path.relative(PROBLEMS_DIR, fullPath);
  try {
    // Clear require cache so re-runs always pick up fresh content
    delete require.cache[require.resolve(fullPath)];
    const problem = require(fullPath);

    if (problem.conquestId && problem.id) {
      linked.push({ conquestId: problem.conquestId, judgeId: problem.id, file: relName });
    } else {
      console.warn(`⚠  ${relName} — no conquestId field, skipping`);
    }
  } catch (err) {
    console.error(`✗  Failed to load ${relName}:`, err.message);
  }
}

if (linked.length === 0) {
  console.log('Nothing to sync (no problem files with conquestId found).');
  process.exit(0);
}

// ── 2. Patch dsa-conquest-map.js line by line ─────────────────────────────

let mapSource = fs.readFileSync(CONQUEST_MAP, 'utf8');
const lines   = mapSource.split('\n');
let changed   = 0;

for (const { conquestId, judgeId, file } of linked) {
  let patched = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match lines like:  { id: 'stage1-1', ...  or  { id: "stage1-1", ...
    if (!line.includes(`id: '${conquestId}'`) && !line.includes(`id: "${conquestId}"`)) continue;

    if (line.includes('judgeId:')) {
      // Update existing judgeId value
      lines[i] = line.replace(/judgeId:\s*['"][^'"]*['"]/, `judgeId: '${judgeId}'`);
    } else {
      // Insert judgeId before the closing }
      lines[i] = line.replace(/(\s*\})(,?\s*)$/, `, judgeId: '${judgeId}'$1$2`);
    }

    patched = true;
    changed++;
    console.log(`✅  ${file}  →  ${conquestId}  (judgeId: '${judgeId}')`);
    break;
  }

  if (!patched) {
    console.warn(`⚠  conquestId '${conquestId}' not found in conquest map — skipping ${file}`);
  }
}

fs.writeFileSync(CONQUEST_MAP, lines.join('\n'), 'utf8');
console.log(`\nDone. ${changed} entr${changed === 1 ? 'y' : 'ies'} updated in dsa-conquest-map.js`);
console.log('Restart the React dev server for changes to take effect.\n');
