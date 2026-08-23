const fs = require('fs');
const path = require('path');

const filePath = 'app/dashboard/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Update generateGridPositions function
const gridPosPattern = /const generateGridPositions = \(prefix, cols, rows\) => \{[\s\S]*?\}/;
const newGridPos = `const generateGridPositions = (prefix, cols, rows) => {
    const positions = []
    if (cols === 2) { 
      // For 2 columns: L1-L11, R1-R11, then M
      for (let i = 1; i <= rows; i++) { positions.push(\`L\${i}\`); } 
      for (let i = 1; i <= rows; i++) { positions.push(\`R\${i}\`); } 
      positions.push('M') 
    } else if (cols === 1) { 
      for (let i = 1; i <= rows; i++) positions.push(\`\${prefix}\${i}\`) 
    } else { 
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
      for (let r = 1; r <= rows; r++) for (let c = 0; c < cols; c++) positions.push(\`\${prefix}\${letters[c]}\${r}\`) 
    }
    return positions
  }`;

content = content.replace(gridPosPattern, newGridPos);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated location generation logic');
