const fs = require('fs');
const path = require('path');

const files = fs.readFileSync('dynamic_pages_node.txt', 'utf8').split('\n').filter(Boolean);

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if it already has generateStaticParams
  if (content.includes('export function generateStaticParams')) {
    console.log(`Skipping ${file} - already has generateStaticParams`);
    continue;
  }

  // Find the dynamic parameter name from the path, e.g., [id] -> id
  const match = file.match(/\[(.*?)\]/);
  if (!match) continue;

  const paramName = match[1];

  // We are creating a dummy static param, and relying on client-side data fetching or fallback. 
  // In `output: 'export'`, dynamic params must have at least one static path.
  const staticParamsCode = `
export function generateStaticParams() {
  return [{ ${paramName}: '1' }]; // Fallback ID for static export
}
`;

  // Append it to the file
  fs.writeFileSync(fullPath, content + '\n' + staticParamsCode);
  console.log(`Updated ${file} with static params for [${paramName}]`);
}
