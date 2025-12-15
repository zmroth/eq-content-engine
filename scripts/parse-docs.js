#!/usr/bin/env node
/**
 * Parse EQEmu docs HTML files and extract text content
 * Outputs organized markdown files for use as context
 */

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.join(__dirname, '..', 'docs-eqemu-dev website', 'eqemu docs', 'docs.eqemu.dev');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs');

// Simple HTML to text extraction
function htmlToText(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove navigation, header, footer
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  // Try to extract main content (article or main tag)
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const contentMatch = text.match(/class="md-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/main>/i);

  if (articleMatch) {
    text = articleMatch[1];
  } else if (contentMatch) {
    text = contentMatch[1];
  } else if (mainMatch) {
    text = mainMatch[1];
  }

  // Convert headers
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');

  // Convert code blocks
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Convert lists
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<ul[^>]*>/gi, '\n');
  text = text.replace(/<\/ul>/gi, '\n');
  text = text.replace(/<ol[^>]*>/gi, '\n');
  text = text.replace(/<\/ol>/gi, '\n');

  // Convert paragraphs and breaks
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Convert tables (simplified)
  text = text.replace(/<table[^>]*>/gi, '\n');
  text = text.replace(/<\/table>/gi, '\n');
  text = text.replace(/<tr[^>]*>/gi, '');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, '| $1 ');
  text = text.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, '| $1 ');

  // Convert links - extract text
  text = text.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // Convert bold/italic
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#(\d+);/g, (m, code) => String.fromCharCode(code));

  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.trim();

  return text;
}

function getTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match) {
    return match[1].replace(/ - EverQuest Emulator Docs$/, '').trim();
  }
  return 'Untitled';
}

function walkDir(dir, callback, basePath = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback, relativePath);
    } else if (file.endsWith('.html')) {
      callback(filePath, relativePath);
    }
  }
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error('Docs root not found:', DOCS_ROOT);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Organize content by category
  const categories = {
    'quest-api': { title: 'Quest API', files: [] },
    'server': { title: 'Server', files: [] },
    'developer': { title: 'Developer', files: [] },
    'client': { title: 'Client', files: [] },
    'schema': { title: 'Database Schema', files: [] },
    'configuration': { title: 'Configuration', files: [] },
    'other': { title: 'Other', files: [] }
  };

  let totalFiles = 0;
  let processedFiles = 0;

  // Count files first
  walkDir(DOCS_ROOT, () => totalFiles++);

  console.log(`Found ${totalFiles} HTML files to process...`);

  // Process each HTML file
  walkDir(DOCS_ROOT, (filePath, relativePath) => {
    try {
      const html = fs.readFileSync(filePath, 'utf-8');
      const title = getTitle(html);
      const text = htmlToText(html);

      // Skip empty or very short content
      if (text.length < 100) {
        return;
      }

      // Determine category from path
      let category = 'other';
      const pathLower = relativePath.toLowerCase();
      if (pathLower.includes('quest-api')) category = 'quest-api';
      else if (pathLower.includes('server')) category = 'server';
      else if (pathLower.includes('developer')) category = 'developer';
      else if (pathLower.includes('client')) category = 'client';
      else if (pathLower.includes('schema')) category = 'schema';
      else if (pathLower.includes('configuration') || pathLower.includes('config')) category = 'configuration';

      categories[category].files.push({
        title,
        path: relativePath,
        content: text
      });

      processedFiles++;
      if (processedFiles % 50 === 0) {
        console.log(`Processed ${processedFiles}/${totalFiles} files...`);
      }
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  });

  console.log(`\nProcessed ${processedFiles} files with content.`);

  // Write category files
  let grandTotal = 0;
  for (const [key, cat] of Object.entries(categories)) {
    if (cat.files.length === 0) continue;

    const outputPath = path.join(OUTPUT_DIR, `eqemu-docs-${key}.md`);

    let content = `# EQEmu Documentation: ${cat.title}\n\n`;
    content += `> Extracted from docs.eqemu.dev - ${cat.files.length} pages\n\n`;
    content += `---\n\n`;

    for (const file of cat.files) {
      content += `## ${file.title}\n\n`;
      content += `*Source: ${file.path}*\n\n`;
      content += file.content;
      content += '\n\n---\n\n';
    }

    fs.writeFileSync(outputPath, content);
    const sizeKB = Math.round(content.length / 1024);
    grandTotal += content.length;
    console.log(`Wrote ${outputPath} (${cat.files.length} pages, ${sizeKB}KB)`);
  }

  // Write a combined file for quick reference
  const allContent = [];
  for (const cat of Object.values(categories)) {
    for (const file of cat.files) {
      allContent.push(`## ${file.title}\n\n${file.content}`);
    }
  }

  const combinedPath = path.join(OUTPUT_DIR, 'eqemu-docs-all.md');
  const combined = `# EQEmu Documentation (Complete)\n\n> All documentation extracted from docs.eqemu.dev\n\n---\n\n` + allContent.join('\n\n---\n\n');
  fs.writeFileSync(combinedPath, combined);

  console.log(`\nWrote combined file: ${combinedPath} (${Math.round(combined.length / 1024)}KB)`);
  console.log(`Total extracted content: ${Math.round(grandTotal / 1024)}KB`);
}

main();
