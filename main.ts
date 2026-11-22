// Solara Bay: Neon Dynasty (V4) — Deterministic Dossier & Output Bundler (Node 22, stdlib only)
// Copies static offline WebGL 3D game files (game/) and verified real browser captures (screenshots/)
// into /output (or MAKEFUN_OUTPUT_DIR) and generates /output/dossier.json via vendor/makefun-game.ts.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function verifyScreenshotsCompliance(shotsDir: string): string[] {
  if (!existsSync(shotsDir)) {
    throw new Error(`Missing screenshots directory at ${shotsDir}`);
  }
  const validFiles = readdirSync(shotsDir)
    .filter((name) => !name.startsWith('.') && /\.(png|jpe?g)$/i.test(name))
    .sort();
  if (validFiles.length < 3 || validFiles.length > DOSSIER_LIMITS.screenshots.max) {
    throw new Error(`Invalid screenshot count (${validFiles.length}); expected 3..4 files.`);
  }
  for (const file of validFiles) {
    const info = statSync(join(shotsDir, file));
    if (!info.isFile() || info.size <= 0 || info.size > DOSSIER_LIMITS.screenshots.max_bytes) {
      throw new Error(`Screenshot ${file} invalid size (${info.size} bytes; max 262144).`);
    }
  }
  return validFiles;
}

function prepareOutputDirectory(targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  const gameTarget = join(targetDir, 'game');
  const shotsTarget = join(targetDir, 'screenshots');
  if (existsSync(gameTarget)) rmSync(gameTarget, { recursive: true, force: true });
  if (existsSync(shotsTarget)) rmSync(shotsTarget, { recursive: true, force: true });
  mkdirSync(gameTarget, { recursive: true });
  mkdirSync(shotsTarget, { recursive: true });
}

function bundleEntryAssets(sourceRoot: string, targetDir: string): void {
  const gameSource = join(sourceRoot, 'game');
  const shotsSource = join(sourceRoot, 'screenshots');
  cpSync(gameSource, join(targetDir, 'game'), { recursive: true });
  const shotFiles = verifyScreenshotsCompliance(shotsSource);
  for (const file of shotFiles) {
    cpSync(join(shotsSource, file), join(targetDir, 'screenshots', file));
  }
}

prepareOutputDirectory(outputDir);
bundleEntryAssets(rootDir, outputDir);

const dossierBytes = buildDossier(outputDir, DOSSIER_LIMITS);
writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
