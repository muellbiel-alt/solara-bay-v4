// Solara Bay: Neon Dynasty (V6) — Deterministic Dossier & Offline Output Bundler (Node 22, stdlib only)
// Bundles static offline WebGL 3D game files (game/) and verified real browser captures (screenshots/)
// into /output (or MAKEFUN_OUTPUT_DIR), strictly excluding tests/ and dev-only files, verifying zero
// external URLs across bundled game assets, and generating byte-identical dossier.json output.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

export const BUNDLE_METADATA = {
  title: 'Solara Bay: Neon Dynasty',
  version: '6.0.0',
  competition: 'gta6-01',
  engine: 'three-r128-offline',
  seed: 42,
};

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg']);

function hasValidImageHeader(filePath: string): boolean {
  const buf = readFileSync(filePath);
  if (buf.length < 16) return false;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  return isPng || isJpeg;
}

function shouldIncludeGamePath(sourceRoot: string, candidatePath: string): boolean {
  const rel = relative(sourceRoot, candidatePath);
  if (!rel) return true;
  const segments = rel.split(sep);
  for (const seg of segments) {
    if (seg === 'tests' || seg === '__tests__' || seg === 'node_modules' || seg.startsWith('.')) {
      return false;
    }
  }
  const base = segments[segments.length - 1];
  if (base.endsWith('.test.mjs') || base.endsWith('.test.js') || base.endsWith('.spec.js')) {
    return false;
  }
  return true;
}

function auditBundledGameOffline(gameRoot: string): { fileCount: number; totalBytes: number } {
  let fileCount = 0;
  let totalBytes = 0;

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relPath = relative(gameRoot, fullPath);
      if (entry.isDirectory()) {
        if (entry.name === 'tests') {
          throw new Error(`Bundled game directory must not contain tests/: ${relPath}`);
        }
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) {
        throw new Error(`Non-regular file found in bundled game output: ${relPath}`);
      }
      const info = statSync(fullPath);
      fileCount += 1;
      totalBytes += info.size;

      const isVendor = relPath.startsWith(`vendor${sep}`);
      if (!isVendor && TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        const text = readFileSync(fullPath, 'utf8');
        if (/https?:\/\//i.test(text)) {
          throw new Error(`External URL detected in offline game asset: ${relPath}`);
        }
      }
    }
  }

  walk(gameRoot);

  if (fileCount === 0 || fileCount > DOSSIER_LIMITS.game_max_files) {
    throw new Error(`Bundled game file count out of bounds: ${fileCount}`);
  }
  if (totalBytes <= 0 || totalBytes > DOSSIER_LIMITS.game_max_bytes) {
    throw new Error(`Bundled game byte size out of bounds: ${totalBytes}`);
  }
  return { fileCount, totalBytes };
}

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
    const fullPath = join(shotsDir, file);
    const info = statSync(fullPath);
    if (!info.isFile() || info.size <= 0 || info.size > DOSSIER_LIMITS.screenshots.max_bytes) {
      throw new Error(`Screenshot ${file} invalid size (${info.size} bytes; max 262144).`);
    }
    if (!hasValidImageHeader(fullPath)) {
      throw new Error(`Screenshot ${file} is not a valid PNG or JPEG binary.`);
    }
  }
  return validFiles;
}

function prepareOutputDirectory(targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  const gameTarget = join(targetDir, 'game');
  const shotsTarget = join(targetDir, 'screenshots');
  const testsTarget = join(targetDir, 'tests');
  if (existsSync(gameTarget)) rmSync(gameTarget, { recursive: true, force: true });
  if (existsSync(shotsTarget)) rmSync(shotsTarget, { recursive: true, force: true });
  if (existsSync(testsTarget)) rmSync(testsTarget, { recursive: true, force: true });
  mkdirSync(gameTarget, { recursive: true });
  mkdirSync(shotsTarget, { recursive: true });
}

function bundleEntryAssets(sourceRoot: string, targetDir: string): void {
  const gameSource = join(sourceRoot, 'game');
  const gameTarget = join(targetDir, 'game');
  const shotsSource = join(sourceRoot, 'screenshots');

  cpSync(gameSource, gameTarget, {
    recursive: true,
    filter: (src) => shouldIncludeGamePath(gameSource, src),
  });

  auditBundledGameOffline(gameTarget);

  const shotFiles = verifyScreenshotsCompliance(shotsSource);
  for (const file of shotFiles) {
    cpSync(join(shotsSource, file), join(targetDir, 'screenshots', file));
  }
}

prepareOutputDirectory(outputDir);
bundleEntryAssets(rootDir, outputDir);

const dossierBytes = buildDossier(outputDir, DOSSIER_LIMITS);
writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
