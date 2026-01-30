const fs = require('fs');
const path = require('path');

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

const appDir = path.join(__dirname, 'app');

walk(appDir, (filepath) => {
    if (!filepath.endsWith('.tsx') && !filepath.endsWith('.ts')) return;

    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    // Replace double semicolons
    content = content.replace(/;;/g, ';');

    // Also remove tripple or more if any
    content = content.replace(/;;+/g, ';');

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Cleaned ;; in ${filepath}`);
    }
});
