#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const args = process.argv.slice(2);
const command = args[0];

const CONFIG_TEMPLATE = `{
  "api": {
    "baseUrl": "https://your-cms-api.com/api",
    "apiKey": "YOUR_API_KEY"
  },
  "blocks": "./app/lib/cms-blocks.tsx",
  "pages": [
    {
      "slug": "home",
      "title": "Homepagina",
      "allowed_blocks": ["hero_section", "text_area"],
      "group": "Marketing",
      "order": 1
    }
  ]
}
`;

const BLOCKS_TEMPLATE = `import { defineBlock } from "@miso-software/headless-cms-core/ui";

// Define your CMS blocks here using defineBlock().
// Each call registers the block schema (for \`npx cms sync\`) and renderer (for CmsBlock/preview).
//
// defineBlock({
//   slug: 'hero_section',
//   label: 'Hero Sectie',
//   fields: [
//     { name: 'title', type: 'text', label: 'Titel' },
//     { name: 'image', type: 'media', label: 'Afbeelding' },
//   ] as const,
//   render: ({ content }) => (
//     <section>
//       <h1>{content.title}</h1>
//     </section>
//   ),
// });
`;

function showHelp() {
  console.log(`
cms - Headless CMS CLI

Commands:
  cms init     Create cms-config.json and cms-blocks.tsx in the project
  cms sync     Sync components & pages to CMS server

Options:
  --config     Path to config file (default: ./cms-config.json)
  --blocks     Path to blocks file, overrides "blocks" in cms-config.json
`);
}

function getConfigPath(): string {
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    return path.resolve(process.cwd(), args[configIndex + 1]);
  }
  return path.join(process.cwd(), 'cms-config.json');
}

function getBlocksArgPath(): string | null {
  const blocksIndex = args.indexOf('--blocks');
  if (blocksIndex !== -1 && args[blocksIndex + 1]) {
    return path.resolve(process.cwd(), args[blocksIndex + 1]);
  }
  return null;
}

async function init() {
  const configTarget = getConfigPath();

  if (fs.existsSync(configTarget)) {
    console.error('cms-config.json already exists');
    process.exit(1);
  }

  fs.writeFileSync(configTarget, CONFIG_TEMPLATE, 'utf-8');
  console.log('Created cms-config.json');

  const blocksRelPath = './app/lib/cms-blocks.tsx';
  const blocksTarget = path.resolve(process.cwd(), blocksRelPath);

  if (!fs.existsSync(blocksTarget)) {
    fs.mkdirSync(path.dirname(blocksTarget), { recursive: true });
    fs.writeFileSync(blocksTarget, BLOCKS_TEMPLATE, 'utf-8');
    console.log(`Created ${blocksRelPath}`);
  }

  console.log('');
  console.log('Next steps:');
  console.log('  1. Update api.baseUrl with your CMS API URL');
  console.log('  2. Update api.apiKey with your project API key');
  console.log('  3. Define your blocks in app/lib/cms-blocks.tsx using defineBlock()');
  console.log('  4. Run "npx cms sync"');
}

function parseSchemasFromBlocksFile(blocksPath: string): Record<string, unknown> {
  const tsModulePath = path.join(process.cwd(), 'node_modules/typescript');
  if (!fs.existsSync(tsModulePath)) {
    console.error('Error: typescript not found in node_modules. Add typescript as a devDependency.');
    process.exit(1);
    throw new Error('unreachable');
  }

  // Load TypeScript compiler from the project's node_modules
  const projectRequire = createRequire(path.join(process.cwd(), 'package.json'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ts = projectRequire('typescript') as typeof import('typescript');

  const content = fs.readFileSync(blocksPath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    path.basename(blocksPath),
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const schemas: Record<string, { label: string; fields: unknown[] }> = {};

  function extractValue(node: import('typescript').Node): unknown {
    if (ts.isStringLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isAsExpression(node)) return extractValue(node.expression);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(extractValue);
    if (ts.isObjectLiteralExpression(node)) {
      const obj: Record<string, unknown> = {};
      for (const prop of node.properties) {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          obj[prop.name.text] = extractValue(prop.initializer);
        }
      }
      return obj;
    }
    return null;
  }

  function visit(node: import('typescript').Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'defineBlock' &&
      node.arguments.length > 0
    ) {
      const arg = node.arguments[0];
      if (ts.isObjectLiteralExpression(arg)) {
        let slug: string | null = null;
        let label: string | null = null;
        let fields: unknown[] | null = null;

        for (const prop of arg.properties) {
          if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
          const key = prop.name.text;
          if (key === 'slug') slug = extractValue(prop.initializer) as string;
          else if (key === 'label') label = extractValue(prop.initializer) as string;
          else if (key === 'fields') fields = extractValue(prop.initializer) as unknown[];
        }

        if (typeof slug === 'string' && typeof label === 'string' && Array.isArray(fields)) {
          schemas[slug] = { label, fields };
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return schemas;
}

interface CmsPageConfig {
  slug: string;
  title: string;
  allowed_blocks: string[];
  order?: number;
  group?: string;
}

interface CmsConfig {
  api: {
    baseUrl: string;
    apiKey: string;
  };
  blocks?: string;
  components?: Record<string, unknown>;
  pages: CmsPageConfig[];
}

async function sync() {
  const configPath = getConfigPath();
  const blocksArgPath = getBlocksArgPath();

  if (!fs.existsSync(configPath)) {
    console.error('cms-config.json not found. Run "npx cms init" first.');
    process.exit(1);
  }

  let config: CmsConfig;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse cms-config.json:', err);
    process.exit(1);
  }

  if (!config.api?.baseUrl || config.api.baseUrl === 'https://your-cms-api.com/api') {
    console.error('Please configure api.baseUrl in cms-config.json');
    process.exit(1);
  }

  if (!config.api?.apiKey || config.api.apiKey === 'YOUR_API_KEY') {
    console.error('Please configure api.apiKey in cms-config.json');
    process.exit(1);
  }

  const blocksPath = blocksArgPath
    ?? (config.blocks ? path.resolve(process.cwd(), config.blocks) : null);

  let components: Record<string, unknown>;
  if (blocksPath) {
    if (!fs.existsSync(blocksPath)) {
      console.error(`Blocks file not found: ${blocksPath}`);
      process.exit(1);
    }
    console.log(`Reading component schemas from ${path.relative(process.cwd(), blocksPath)}...`);
    components = parseSchemasFromBlocksFile(blocksPath);
    console.log(`Found ${Object.keys(components).length} component(s): ${Object.keys(components).join(', ')}`);
  } else if (config.components) {
    console.log('Using components from cms-config.json (legacy mode)');
    components = config.components;
  } else {
    console.error(
      'No components found. Add a "blocks" path to cms-config.json or run "npx cms init".'
    );
    process.exit(1);
  }

  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const syncUrl = `${baseUrl}/v1/sync-structure`;

  console.log(`Syncing to ${syncUrl}...`);

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.api.apiKey,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ components, pages: config.pages }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Sync failed (${response.status}): ${error}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log('Sync successful');
    if (result.message) console.log(result.message);
  } catch (err) {
    console.error('Sync failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (command === 'init') {
  init();
} else if (command === 'sync') {
  sync();
} else {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}
