const fs = require('fs');
const path = require('path');

const filesToFixed = [
  'src/screens/DashboardScreen.tsx',
  'src/screens/MemorizationScreen.tsx',
  'src/screens/OnboardingScreen.tsx',
  'src/screens/ProgressScreen.tsx',
  'src/screens/ReviewScreen.tsx',
  'src/screens/SettingsScreen.tsx',
  'src/components/CircularProgress.tsx',
  'src/components/FortressCard.tsx',
  'src/components/StreakBadge.tsx'
];

for (const file of filesToFixed) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Fix the import
  content = content.replace(/import\s+\{(.*?)\}\s+from\s+['"]\.\.\/theme['"]/g, (match, imports) => {
    let cleanImports = imports.replace(/\bColors\b,?\s*/, '').trim();
    if (cleanImports.endsWith(',')) cleanImports = cleanImports.slice(0, -1);
    
    // Add useTheme if not present
    if (!cleanImports.includes('useTheme')) {
        cleanImports = `useTheme${cleanImports ? ', ' + cleanImports : ''}`;
    }
    return `import { ${cleanImports} } from '../theme'`;
  });

  // 2. Rename StyleSheet.create to getStyles if it's not already
  if (content.includes('const styles = StyleSheet.create')) {
      content = content.replace(/const\s+styles\s*=\s*StyleSheet\.create\(\{/g, 'const getStyles = (Colors: any) => StyleSheet.create({');
  }

  // 3. Inject useTheme and getStyles into the component
  // Find component signature
  const componentRegex = /(export\s+(?:default\s+)?(?:function|const)\s+[A-Za-z0-9_]+\s*(?:=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>|\([^)]*\))\s*\{)([\s\S]*?)return/g;
  
  content = content.replace(componentRegex, (match, signature, body) => {
      // If it already has Colors and styles defined by us, clear them to avoid duplicates
      let newBody = body.replace(/^\s*const Colors = useTheme\(\);\s*$/gm, '');
      newBody = newBody.replace(/^\s*const styles = React\.useMemo\([\s\S]*?\);\s*$/gm, '');
      newBody = newBody.replace(/^\s*const styles = getStyles\(Colors\);\s*$/gm, '');
      
      return `${signature}\n  const Colors = useTheme();\n  const styles = getStyles(Colors);${newBody}return`;
  });

  fs.writeFileSync(fullPath, content);
  console.log('Fixed', file);
}
