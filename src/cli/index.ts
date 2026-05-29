#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);
const command = args[0];

const CONFIG_TEMPLATE = `{
  "api": {
    "baseUrl": "https://your-cms-api.com/api",
    "apiKey": "YOUR_API_KEY"
  },
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

function showHelp() {
  console.log(`
cms - Headless CMS CLI

Commands:
  cms init     Create cms-config.json in project root
  cms sync     Sync components & pages to CMS server

Options:
  --config     Path to config file (default: ./cms-config.json)
  --blocks     Path to cms-blocks file to read component schemas from code
               (e.g. --blocks ./app/lib/cms-blocks.tsx)
               Requires tsx in node_modules/.bin
`);
}

function getConfigPath(): string {
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    return path.resolve(process.cwd(), args[configIndex + 1]);
  }
  return path.join(process.cwd(), 'cms-config.json');
}

function getBlocksPath(): string | null {
  const blocksIndex = args.indexOf('--blocks');
  if (blocksIndex !== -1 && args[blocksIndex + 1]) {
    return path.resolve(process.cwd(), args[blocksIndex + 1]);
  }
  return null;
}

async function init() {
  const target = getConfigPath();

  if (fs.existsSync(target)) {
    console.error('cms-config.json already exists');
    process.exit(1);
  }

  fs.writeFileSync(target, CONFIG_TEMPLATE, 'utf-8');
  console.log('cms-config.json created');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Update api.baseUrl with your CMS API URL');
  console.log('  2. Update api.apiKey with your project API key');
  console.log('  3. Define your blocks with defineBlock() in your cms-blocks file');
  console.log('  4. Run "npx cms sync --blocks ./app/lib/cms-blocks.tsx"');
}

function getSchemasFromBlocksFile(blocksPath: string): Record<string, unknown> | never {
  const tsxBin = path.join(process.cwd(), 'node_modules/.bin/tsx');

  if (!fs.existsSync(tsxBin)) {
    console.error(
      'Error: tsx not found at node_modules/.bin/tsx\n' +
      'Add tsx as a devDependency: npm install -D tsx'
    );
    process.exit(1);
  }

  const sdkUiPath = path.join(
    process.cwd(),
    'node_modules/@miso-software/headless-cms-core/dist/ui.js'
  );

  if (!fs.existsSync(sdkUiPath)) {
    console.error('Error: @miso-software/headless-cms-core not found in node_modules');
    process.exit(1);
  }

  const outputFile = path.join(os.tmpdir(), `_cms_schemas_${Date.now()}.json`);
  const tempScript = path.join(os.tmpdir(), `_cms_extract_${Date.now()}.mts`);

  fs.writeFileSync(tempScript, [
    `import '${blocksPath.replace(/\\/g, '/')}';`,
    `import { getRegisteredSchemas } from '${sdkUiPath.replace(/\\/g, '/')}';`,
    `import { writeFileSync } from 'fs';`,
    `writeFileSync('${outputFile.replace(/\\/g, '/')}', JSON.stringify(getRegisteredSchemas()));`,
  ].join('\n'));

  let result: Record<string, unknown>;
  try {
    execFileSync(tsxBin, [tempScript], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    result = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error reading schemas from blocks file:\n${msg}`);
    process.exit(1);
    throw new Error('unreachable');
  } finally {
    try { fs.unlinkSync(tempScript); } catch {}
    try { fs.unlinkSync(outputFile); } catch {}
  }
  return result;
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
  components?: Record<string, unknown>;
  pages: CmsPageConfig[];
}

async function sync() {
  const configPath = getConfigPath();
  const blocksPath = getBlocksPath();

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

  // Get component schemas — from blocks file (v0.2) or cms-config.json (fallback)
  let components: Record<string, unknown>;
  if (blocksPath) {
    console.log(`Reading component schemas from ${path.relative(process.cwd(), blocksPath)}...`);
    components = getSchemasFromBlocksFile(blocksPath);
    console.log(`Found ${Object.keys(components).length} component(s): ${Object.keys(components).join(', ')}`);
  } else if (config.components) {
    console.log('Using components from cms-config.json (legacy mode)');
    components = config.components;
  } else {
    console.error(
      'No components found. Either:\n' +
      '  - Use --blocks ./app/lib/cms-blocks.tsx to read from defineBlock() calls\n' +
      '  - Or add a "components" section to cms-config.json'
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
