import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const rootsToScan = ['src', 'index.html', 'package.json', 'README.md'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.html', '.md', '.css']);
const previousAcronym = ['PG', 'PEE'].join('');
const previousName = ['Plataforma de Gestion de Proyectos ', 'Escolares en Equipos'].join('');
const previousLeaderLabel = ['lider de ', 'proyecto'].join('');
const previousProfessorLabel = ['docente ', 'tecnico'].join('');
const previousEndUserContext = ['universitari', '[oa]s?'].join('');
const historicalMigrationPath = ['docs/fase-2/migracion-', 'pg', 'pee', '-a-pgpte.md'].join('');
const forbidden = [
  { pattern: new RegExp(`\\b${previousAcronym}\\b`, 'iu'), label: 'acronimo anterior' },
  { pattern: new RegExp(previousName, 'iu'), label: 'nombre anterior' },
  { pattern: new RegExp(`\\b${previousEndUserContext}\\b`, 'iu'), label: 'contexto anterior de usuarios finales' },
  { pattern: new RegExp(previousLeaderLabel, 'iu'), label: 'actor anterior' },
  { pattern: new RegExp(previousProfessorLabel, 'iu'), label: 'terminologia anterior' },
];

async function collect(path) {
  const absolute = join(root, path);
  if (extname(path)) return [path];
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.name !== 'node_modules' && entry.name !== 'dist')
      .map((entry) => collect(join(path, entry.name))),
  );
  return nested.flat();
}

const files = (await Promise.all(rootsToScan.map(collect)))
  .flat()
  .filter((file) => textExtensions.has(extname(file)));
const findings = [];

for (const file of files) {
  const content = await readFile(join(root, file), 'utf8');
  const lines = content.split(/\r?\n/u);
  for (const { pattern, label } of forbidden) {
    lines.forEach((line, index) => {
      const searchableLine = line.replaceAll(historicalMigrationPath, '');
      if (pattern.test(searchableLine)) findings.push(`${relative(root, file)}:${index + 1} ${label}`);
    });
  }
}

if (findings.length) {
  console.error(`Lint PGPTE encontro ${findings.length} referencia(s) incompatible(s):`);
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Lint PGPTE correcto: ${files.length} archivos funcionales revisados.`);
}
