const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');
const consolidatedCssPath = path.join(appDir, 'component-styles.css');

// Start empty or append if exists? better recreate.
fs.writeFileSync(consolidatedCssPath, '/* Consolidated Component Styles */\n');

const walk = (dir, callback) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile()) {
            callback(filepath);
        }
    });
};

const cssFiles = [];

// 1. Find CSS Files
walk(appDir, (filepath) => {
    if (filepath.endsWith('.css')) {
        const relativePath = path.relative(appDir, filepath);
        // Exclude root/global styles
        if (relativePath === 'globals.css' || relativePath === 'styles.css' || relativePath === 'component-styles.css') return;

        console.log(`Found CSS: ${relativePath}`);
        cssFiles.push(filepath);

        // Append content
        const content = fs.readFileSync(filepath, 'utf8');
        fs.appendFileSync(consolidatedCssPath, `\n/* from ${relativePath} */\n` + content);
    }
});

// 2. Remove Imports
walk(appDir, (filepath) => {
    if (!filepath.endsWith('.tsx') && !filepath.endsWith('.ts') && !filepath.endsWith('.js') && !filepath.endsWith('.jsx')) return;

    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;

    // Remove import './Something.css' or `import '../Something.css'`
    // Regex for import ending in .css
    // Be careful not to remove 'globals.css' or 'styles.css' if imported (in layout.tsx)

    // Regex: import any CSS file path
    // Exclude globals/styles/component-styles later
    const regex = /import\s+['"]([^'"]+\.css)['"](?:;)?\s*(\r?\n)?/g;
    content = content.replace(regex, (match, pathGroup, newline) => {
        if (pathGroup.includes('globals.css') || pathGroup.includes('styles.css') || pathGroup.includes('component-styles.css')) return match;
        console.log(`Removing CSS import in ${path.relative(appDir, filepath)}: ${match.trim()}`);
        return '';
    });

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
    }
});
