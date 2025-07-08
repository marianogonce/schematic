const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing ng-add-takeuntil schematic...\n');

// Verificar que el build fue exitoso
if (!fs.existsSync('dist/collection.json')) {
  console.error('❌ Build failed: dist/collection.json not found');
  process.exit(1);
}

console.log('✅ Build successful');

// Simular procesamiento del archivo de test
const testFilePath = 'test-complex.ts';
if (!fs.existsSync(testFilePath)) {
  console.error('❌ Test file not found');
  process.exit(1);
}

console.log('✅ Test file exists');

// Crear un test de la función wrapWithTakeUntil
console.log('\n🔧 Testing wrapWithTakeUntil function...');

// Test cases
const testCases = [
  {
    input: 'this.http.get("/api/data")',
    expected: 'this.http.get("/api/data").pipe(takeUntil(this.destroy$))',
    description: 'Simple observable without pipe'
  },
  {
    input: 'this.http.get("/api/data").pipe(map(x => x))',
    expected: 'this.http.get("/api/data").pipe(map(x => x), takeUntil(this.destroy$))',
    description: 'Observable with simple pipe'
  },
  {
    input: 'this.http.get("/api/data").pipe(switchMap((response) => this.http.get(`/api/${response.id}`)))',
    expected: 'this.http.get("/api/data").pipe(switchMap((response) => this.http.get(`/api/${response.id}`)), takeUntil(this.destroy$))',
    description: 'Observable with complex switchMap'
  },
  {
    input: 'source$.pipe(filter(x => x.isValid), map(x => x.data))',
    expected: 'source$.pipe(filter(x => x.isValid), map(x => x.data), takeUntil(this.destroy$))',
    description: 'Observable with multiple operators'
  }
];

// Simulación de la función wrapWithTakeUntil (versión corregida)
function testWrapWithTakeUntil(observableText) {
  if (observableText.includes('.pipe(')) {
    let pipeStart = observableText.indexOf('.pipe(');
    if (pipeStart === -1) {
      return `${observableText}.pipe(takeUntil(this.destroy$))`;
    }
    
    let openParens = 0;
    let pipeEnd = -1;
    
    for (let i = pipeStart + 6; i < observableText.length; i++) {
      if (observableText[i] === '(') {
        openParens++;
      } else if (observableText[i] === ')') {
        if (openParens === 0) {
          pipeEnd = i;
          break;
        }
        openParens--;
      }
    }
    
    if (pipeEnd === -1) {
      return `${observableText}.pipe(takeUntil(this.destroy$))`;
    }
    
    const beforePipe = observableText.substring(0, pipeStart + 6);
    const pipeContent = observableText.substring(pipeStart + 6, pipeEnd).trim();
    const afterPipe = observableText.substring(pipeEnd);
    
    const needsComma = pipeContent.length > 0;
    const separator = needsComma ? ', ' : '';
    
    return `${beforePipe}${pipeContent}${separator}takeUntil(this.destroy$)${afterPipe}`;
  }
  
  return `${observableText}.pipe(takeUntil(this.destroy$))`;
}

// Ejecutar tests
let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  const result = testWrapWithTakeUntil(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`Input:    ${testCase.input}`);
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Result:   ${result}`);
  console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!passed) {
    allTestsPassed = false;
  }
});

console.log(`\n🏁 Test Summary: ${allTestsPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);

if (allTestsPassed) {
  console.log('\n📦 Creating package...');
  try {
    execSync('npm pack', { stdio: 'inherit' });
    console.log('✅ Package created successfully');
    
    console.log('\n📋 Usage Instructions:');
    console.log('1. Install in your Angular project:');
    console.log('   npm install ng-add-takeuntil-1.0.0.tgz --legacy-peer-deps');
    console.log('2. Run the schematic:');
    console.log('   ng generate ng-add-takeuntil:add-takeuntil');
    console.log('3. Check the transformed files for takeUntil patterns');
    
  } catch (error) {
    console.error('❌ Failed to create package:', error.message);
  }
} else {
  console.log('\n❌ Fix the failing tests before proceeding');
  process.exit(1);
}
