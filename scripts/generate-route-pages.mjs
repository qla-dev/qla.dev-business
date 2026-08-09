import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');
const origin = 'https://business.qla.dev';

const pages = [
  ['privacy', 'Politika privatnosti · Putni nalozi', 'Kako Putni nalozi obrađuju i štite podatke koje unesete.'],
  ['terms', 'Uslovi korištenja · Putni nalozi', 'Pravila korištenja aplikacije Putni nalozi.'],
  ['cookies', 'Politika kolačića · Putni nalozi', 'Kako qla.dev Business koristi kolačiće.'],
  ['help', 'Pravilnik i pomoć · Putni nalozi', 'Kratko uputstvo za rad u aplikaciji Putni nalozi.'],
];

const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const pageHtml = (template, slug, title, description) => {
  const url = `${origin}/putni-nalozi/${slug}`;
  return template
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
};

const template = await readFile(templatePath, 'utf8');
await Promise.all(pages.map(async ([slug, title, description]) => {
  const outputDir = path.join(distDir, 'putni-nalozi', slug);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), pageHtml(template, slug, title, description), 'utf8');
}));
