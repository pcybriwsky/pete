const fs = require('fs');
const path = require('path');

// --- Configuration ---
const sketchesDir = path.join(__dirname, '../personal-site/src/Pages/Components/Sketches');
const templateFile = path.join(sketchesDir, 'Sketch3DTemplate.js');
const sketch3DComponentFile = path.join(sketchesDir, 'Sketch3DComponent.js');
const sketchCarouselFile = path.join(sketchesDir, 'SketchCarousel.js');
const sketchPageFile = path.join(__dirname, '../personal-site/src/Pages/SketchPage.js');
const sketchGalleryFile = path.join(__dirname, '../personal-site/src/Pages/SketchGallery.js');
// --- End Configuration ---


// --- Helper Functions ---

// Converts a string to PascalCase (e.g., my-sketch -> MySketch)
const toPascalCase = (str) => {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
};

// Converts a string to camelCase (e.g., MySketch -> mySketch)
const toCamelCase = (str) => {
  return str.replace(/^./, (c) => c.toLowerCase());
};

// Capitalizes the first letter of each word (e.g., my new sketch -> My New Sketch)
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// --- Main Script Logic ---

const sketchNameRaw = process.argv[2];

if (!sketchNameRaw) {
  console.error('❌ Error: Please provide a name for the new 3D sketch.');
  console.log('Usage: node scripts/add-3d-sketch.js <NewSketchName>');
  process.exit(1);
}

const sketchNamePascal = toPascalCase(sketchNameRaw);
const sketchNameCamel = toCamelCase(sketchNamePascal);
const sketchFileName = `${sketchNamePascal}.js`;
const newSketchFilePath = path.join(sketchesDir, sketchFileName);
const sketchDisplayName = toTitleCase(sketchNameRaw.replace(/[-_]/g, ' ')); // Make a readable display name

console.log(`✨ Creating 3D sketch: ${sketchNamePascal}`);
console.log(`   File: ${newSketchFilePath}`);

// 1. Check if template exists
if (!fs.existsSync(templateFile)) {
  console.error(`❌ Error: 3D Template file not found at ${templateFile}`);
  process.exit(1);
}

// 2. Check if sketch file already exists
if (fs.existsSync(newSketchFilePath)) {
  console.error(`❌ Error: Sketch file already exists at ${newSketchFilePath}`);
  process.exit(1);
}

// 3. Copy and modify the template file
try {
  let templateContent = fs.readFileSync(templateFile, 'utf8');
  // Replace placeholder function name and export
  let newContent = templateContent.replace(/Sketch3DTemplate/g, sketchNamePascal);
  fs.writeFileSync(newSketchFilePath, newContent, 'utf8');
  console.log(`✅ Copied and modified 3D template to ${sketchFileName}`);
} catch (error) {
  console.error(`❌ Error creating 3D sketch file: ${error.message}`);
  process.exit(1);
}

// Function to update a file by adding lines based on markers
const updateFile = (filePath, importMarker, mapMarker, newImportLine, newMapEntry) => {
  console.log(`   Updating ${path.basename(filePath)}...`);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');

    const importIndex = lines.findIndex(line => line.includes(importMarker));
    const mapIndex = lines.findIndex(line => line.includes(mapMarker));

    if (importIndex === -1 || mapIndex === -1) {
      console.warn(`   ⚠️ Warning: Could not find markers in ${path.basename(filePath)}. Skipping update.`);
      return;
    }

    // Add import statement if needed
    if (newImportLine) {
        lines.splice(importIndex + 1, 0, newImportLine);
    }

    // Find the closing brace/bracket of the map/array by searching downwards from the mapMarker
    let markerLine = lines[mapIndex + (newImportLine ? 1 : 0)]; // Adjust index if import was added
    let openChar = markerLine.includes('{') ? '{' : '[';
    let closeChar = markerLine.includes('{') ? '}' : ']';
    let braceCount = 0;
    let endMapIndex = -1;
    let startIndex = mapIndex + (newImportLine ? 1 : 0); // Adjust index if import was added

    for (let i = startIndex; i < lines.length; i++) {
        // Count braces/brackets on the current line
        for (let char of lines[i]) {
            if (char === openChar) braceCount++;
            if (char === closeChar) braceCount--;
        }
        // Check if this line contains the final closing brace/bracket
        if (braceCount === 0 && lines[i].includes(closeChar)) {
            endMapIndex = i;
            break;
        }
        // Handle case where map/array definition spans multiple lines but count is incorrect
        if (i > startIndex && braceCount <= 0 && !lines[i].trim().endsWith(',')){ // Likely malformed or simple array end
             if (lines[i].includes(closeChar)){
                endMapIndex = i;
                break;
             }
        }
    }

    if (endMapIndex === -1) {
       console.warn(`   ⚠️ Warning: Could not reliably find closing marker '${closeChar}' for map/array starting near line ${mapIndex + 1} in ${path.basename(filePath)}. Skipping update.`);
       return;
    }

    // Add map entry before the closing brace/bracket line
    // Ensure the previous line ends with a comma if it's not the opening line
     if (endMapIndex > startIndex && !lines[endMapIndex-1].trim().endsWith(',') && !lines[endMapIndex-1].trim().endsWith(openChar) ) {
        lines[endMapIndex-1] += ',';
     }

    // Add the new entry with proper indentation (assuming 2 spaces)
    const indentMatch = lines[endMapIndex-1] ? lines[endMapIndex-1].match(/^\s*/) : ['  ']; // Get indent from prev line or default
    const indent = indentMatch ? indentMatch[0] : '  '; // Default indent
    const newEntryLines = newMapEntry.split('\n').map(l => `${indent}${l}`); // Indent new entry lines
    lines.splice(endMapIndex, 0, ...newEntryLines);

    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`   ✅ Successfully updated ${path.basename(filePath)}`);

  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}: ${error.message}`);
    // Continue to next file if one fails
  }
};

// 4. Update Sketch3DComponent.js
updateFile(
  sketch3DComponentFile,
  '// Import all 3D sketches here', // Marker for last import
  'const sketch3DMap = {', // Marker for map start
  `import ${sketchNamePascal} from './${sketchNamePascal}';`,
  `${sketchNamePascal}` // Update map entry format
);

// 5. Update SketchCarousel.js
updateFile(
  sketchCarouselFile,
  'import Sketch3DWrapper from \'./Sketch3DComponent\';', // Marker for last import
  'const sketches = [', // Marker for array start
  null, // No new import needed here
  `{
    name: '${sketchDisplayName}',
    component: '${sketchNameCamel}',
    description: 'A new creative 3D sketch.',
    instructions: 'Interact with the 3D sketch.',
    type: '3d'
  }`
);

// 6. Update SketchPage.js
updateFile(
  sketchPageFile,
  '} from \'react-router-dom\';', // Use a stable line before the map as the first marker
  'const sketchMap = {', // Marker for map start
  null, // No new import needed here
  `'${sketchNameCamel}': {
    component: '${sketchNamePascal}',
    displayName: '${sketchDisplayName}',
    type: '3d'
  }` // Key is camelCase string
);

// 7. Update SketchGallery.js
updateFile(
  sketchGalleryFile,
  '} from \'react-router-dom\';', // Marker for last import
  'const sketches = [', // Marker for array start
  null, // No new import needed
  `{
    id: '${sketchNameCamel}',
    title: '${sketchDisplayName}',
    description: 'A new creative 3D sketch description.',
    instructions: 'Instructions for the new 3D sketch.',
    type: '3d'
  }`
);

console.log(`
🎉 3D Sketch '${sketchNamePascal}' created and integrated successfully!`);
console.log(`   Remember to fill in the 3D sketch logic in 'personal-site/src/Pages/Components/Sketches/${sketchFileName}'`);
console.log(`   Review added details in SketchPage.js, SketchCarousel.js, and SketchGallery.js.`);
console.log(`   The sketch will appear with a '3D' label in the gallery.`); 