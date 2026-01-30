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
    if (!filepath.match(/\.(tsx|ts|js|jsx)$/)) return;
    // Skip potentially root layout/page if they are ours (layout.tsx/page.tsx in app root)
    // Actually, checking exact path is better.
    if (filepath === path.join(appDir, 'layout.tsx')) return;
    if (filepath === path.join(appDir, 'page.tsx')) return;
    if (filepath === path.join(appDir, 'Providers.tsx')) return; // already has it
    if (filepath === path.join(appDir, 'ClientLayout.tsx')) return; // already has it

    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;

    // 1. Env Vars
    content = content.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');
    content = content.replace(/\(import\.meta as any\)\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');
    // content = content.replace(/import\.meta\.env/g, 'process.env'); // risky if just checking dev

    // 2. React Router DOM -> Next
    if (content.includes('react-router-dom')) {
        let imports = [];
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"]/;
        const match = content.match(importRegex);

        let nextLinkImport = '';
        let nextNavImport = [];

        if (match) {
            imports = match[1].split(',').map(s => s.trim());

            if (imports.includes('Link') || imports.includes('NavLink')) {
                nextLinkImport = "import Link from 'next/link';";
            }

            if (imports.includes('useNavigate')) {
                nextNavImport.push('useRouter');
                // Replace usage
                content = content.replace(/useNavigate/g, 'useRouter');
                content = content.replace(/const\s+navigate\s+=\s+useRouter\(\)/g, 'const router = useRouter()');
                // Replace navigate(...) calls. 
                // Simple case: navigate('/path') -> router.push('/path')
                // Complex case: navigate(-1) -> router.back()
                // Complex case: navigate('/path', { replace: true }) -> router.replace('/path')

                content = content.replace(/navigate\s*\(\s*-1\s*\)/g, 'router.back()');
                // Look for navigate(path)
                content = content.replace(/navigate\s*\(([^,)]+)\)/g, 'router.push($1)');
                // Look for replace
                content = content.replace(/navigate\s*\(([^,]+),\s*\{\s*replace:\s*true\s*\}\)/g, 'router.replace($1)');
            }

            if (imports.includes('useLocation')) {
                nextNavImport.push('usePathname');
                nextNavImport.push('useSearchParams');

                // Replace usage
                // const location = useLocation() -> const pathname = usePathname(); const searchParams = useSearchParams();
                // But usage varies.
                // If they use location.pathname -> pathname
                // If they use location.search -> searchParams.toString()?

                content = content.replace(/useLocation/g, 'usePathname');
                content = content.replace(/const\s+location\s+=\s+usePathname\(\)/g, 'const pathname = usePathname(); const searchParams = useSearchParams();');

                content = content.replace(/location\.pathname/g, 'pathname');
                // location.search is tricky. Next.js searchParams is ReadonlyURLSearchParams.
                // Replacing location.search with searchParams.toString() might work if prefixed with ?.
                // But if they use URLSearchParams(location.search), it expects string. 
                // searchParams.toString() returns "key=val". location.search returns "?key=val".
                // I will replace `location.search` with `('?' + searchParams.toString())`.
                content = content.replace(/location\.search/g, "('?' + searchParams.toString())");
            }

            if (imports.includes('useParams')) {
                nextNavImport.push('useParams');
            }

            let nextNavImportStr = nextNavImport.length > 0 ? `import { ${nextNavImport.join(', ')} } from 'next/navigation';` : '';

            // Handle Link replacement
            content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link $1href=');
            content = content.replace(/<NavLink\s+([^>]*?)to=/g, '<Link $1href=');
            content = content.replace(/NavLink/g, 'Link'); // Rename component usage

            // Replace the import line
            content = content.replace(importRegex, `${nextLinkImport}\n${nextNavImportStr}`);
        } else {
            // Maybe single import
            if (content.match(/import\s+.*UseNavigate.*\s+from/)) {
                // Manual fallback for specific cases not matched by regex
            }
        }
    }

    // 3. "use client"
    if (content.match(/use(State|Effect|Context|Reducer|Callback|Memo|Ref|LayoutEffect|Router|Pathname|Params)/) || content.includes('createContext')) {
        if (!content.includes('"use client"') && !content.includes("'use client'")) {
            content = '"use client";\n' + content;
        }
    }

    // 4. Fix Imports
    // Fix imports that point to 'pages' folder which is now '_pages' or relative siblings
    // Example: import ... from '../pages/CheckoutPage' -> import ... from '@/app/_pages/CheckoutPage'
    content = content.replace(/from\s+['"]\.\.\/pages\/([^'"]+)['"]/g, "from '@/app/_pages/$1'");
    content = content.replace(/from\s+['"]\.\/pages\/([^'"]+)['"]/g, "from '@/app/_pages/$1'");

    // Fix imports that use @/pages (if any aliases existed, though unlikely in Vite default)

    // Fix components imports if they were somehow absolute? No, mostly relative.

    // 5. Fix Shared Folder Imports (types, constants, utils, etc)
    // imports like ../../../types -> @/app/types
    // Match any number of ../ and then the folder name
    const sharedFolders = ['types', 'constants', 'utils', 'services', 'store', 'hooks', 'components', 'data'];
    // specific patterns
    sharedFolders.forEach(folder => {
        // Match '../types' or '../../types' or '../components/Foo'
        const regex = new RegExp(`from\\s+['"](\\.\\.\\/)+${folder}(\\/.*)?['"]`, 'g');
        content = content.replace(regex, (match, p1, p2) => {
            // p1 is ../, p2 is /suffix or undefined
            return `from '@/app/${folder}${p2 || ''}'`;
        });

        // Also match './types' if in same dir but not likely for deep shared
        const regex2 = new RegExp(`from\\s+['"]\\.\\/${folder}(\\/.*)?['"]`, 'g');
        // This is risky if it's a local folder with same name.
        // But shared folders are top level app/. 
        // If a page has local components folder, we might want to keep it relative?
        // 'components' is generic.
        // 'types' is usually global.
        // 'store' is global.
        // 'hooks' is global.
        // 'utils', 'services', 'data'.
        // 'constants'.

        // Only replace if we are sure it's the global one.
        // The global ones were at source root or moved to app/
        // Simplest heuristic: If it was ../something, it refers to parent.
    });

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${filepath}`);
    }
});
