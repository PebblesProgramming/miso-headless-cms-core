#!/usr/bin/env node

// src/cli/index.ts
import fs from "fs";
import path from "path";
var args = process.argv.slice(2);
var command = args[0];
var CONFIG_TEMPLATE = `{
  "api": {
    "baseUrl": "https://your-cms-api.com/api",
    "apiKey": "YOUR_API_KEY"
  },
  "components": {
    "hero_section": {
      "label": "Hero Sectie",
      "fields": [
        { "name": "title", "type": "text", "label": "Hoofdtitel" },
        { "name": "subtitle", "type": "textarea", "label": "Subtitel" },
        { "name": "image", "type": "media", "label": "Achtergrond foto" }
      ]
    },
    "text_area": {
      "label": "Tekst Blok",
      "fields": [{ "name": "content", "type": "richtext", "label": "Inhoud" }]
    }
  },
  "pages": [
    {
      "slug": "home",
      "title": "Homepagina",
      "allowed_blocks": ["hero_section", "text_area"]
    }
  ]
}
`;
function showHelp() {
  console.log(`
cms - Headless CMS CLI

Commands:
  cms init     Create cms-config.json in project root
  cms sync     Sync config (components & pages) to CMS server
  cms help     Show this help message

Options:
  --config     Path to config file (default: ./cms-config.json)
`);
}
function getConfigPath() {
  const configIndex = args.indexOf("--config");
  if (configIndex !== -1 && args[configIndex + 1]) {
    return path.resolve(process.cwd(), args[configIndex + 1]);
  }
  return path.join(process.cwd(), "cms-config.json");
}
async function init() {
  const target = getConfigPath();
  if (fs.existsSync(target)) {
    console.error("cms-config.json already exists");
    process.exit(1);
  }
  fs.writeFileSync(target, CONFIG_TEMPLATE, "utf-8");
  console.log("cms-config.json created");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Update api.baseUrl with your CMS API URL");
  console.log("  2. Update api.apiKey with your project API key");
  console.log("  3. Define your components and pages");
  console.log('  4. Run "npx cms sync" to sync with the server');
}
async function sync() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    console.error('cms-config.json not found. Run "npx cms init" first.');
    process.exit(1);
  }
  let config;
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    config = JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse cms-config.json:", err);
    process.exit(1);
  }
  if (!config.api?.baseUrl || config.api.baseUrl === "https://your-cms-api.com/api") {
    console.error("Please configure api.baseUrl in cms-config.json");
    process.exit(1);
  }
  if (!config.api?.apiKey || config.api.apiKey === "YOUR_API_KEY") {
    console.error("Please configure api.apiKey in cms-config.json");
    process.exit(1);
  }
  const baseUrl = config.api.baseUrl.replace(/\/$/, "");
  const syncUrl = `${baseUrl}/sync`;
  console.log(`Syncing to ${syncUrl}...`);
  try {
    const response = await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.api.apiKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        components: config.components,
        pages: config.pages
      })
    });
    if (!response.ok) {
      const error = await response.text();
      console.error(`Sync failed (${response.status}): ${error}`);
      process.exit(1);
    }
    const result = await response.json();
    console.log("Sync successful");
    if (result.message) {
      console.log(result.message);
    }
  } catch (err) {
    console.error("Sync failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
if (!command || command === "help" || command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}
if (command === "init") {
  init();
} else if (command === "sync") {
  sync();
} else {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}
