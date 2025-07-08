const fs = require('fs');
const { Project } = require('ts-morph');

console.log('🧪 Testing timer case with switchMap...\n');

// Cargar el archivo de test específico
const testFilePath = 'test-timer-case.ts';
if (!fs.existsSync(testFilePath)) {
  console.error('❌ Test file not found');
  process.exit(1);
}

const content = fs.readFileSync(testFilePath, 'utf8');
console.log('📁 Original file content (first 300 chars):');
console.log(content.substring(0, 300) + '...\n');

// Crear proyecto ts-morph
const project = new Project({
  useInMemoryFileSystem: true,
});

// Crear el archivo en memoria
const sourceFile = project.createSourceFile('test.ts', content);

// Simular la detección de suscripciones
const SyntaxKind = require('ts-morph').SyntaxKind;
const Node = require('ts-morph').Node;

function findSubscriptionCalls(classDeclaration) {
  console.log('🔍 Searching for subscription calls...');
  
  const calls = classDeclaration.getDescendantsOfKind(SyntaxKind.CallExpression).filter(call => {
    const expression = call.getExpression();
    
    if (Node.isPropertyAccessExpression(expression)) {
      if (expression.getName() === 'subscribe') {
        const observable = expression.getExpression();
        const observableText = observable.getText();
        
        console.log(`📍 Found subscribe call:`);
        console.log(`   Observable: ${observableText.substring(0, 100)}...`);
        console.log(`   Full text: ${call.getText().substring(0, 100)}...`);
        
        return true;
      }
    }
    
    return false;
  });
  
  return calls;
}

// Encontrar la clase de test
const classes = sourceFile.getClasses();
if (classes.length === 0) {
  console.error('❌ No classes found');
  process.exit(1);
}

const testClass = classes[0];
console.log(`🎯 Processing class: ${testClass.getName()}`);

// Encontrar suscripciones
const subscriptionCalls = findSubscriptionCalls(testClass);
console.log(`\n📊 Found ${subscriptionCalls.length} subscription calls`);

// Analizar cada suscripción
subscriptionCalls.forEach((call, index) => {
  console.log(`\n🔧 Analyzing subscription ${index + 1}:`);
  
  const expression = call.getExpression();
  if (Node.isPropertyAccessExpression(expression)) {
    const observable = expression.getExpression();
    const observableText = observable.getText();
    
    console.log(`   Observable text (${observableText.length} chars):`);
    console.log(`   "${observableText}"`);
    
    // Verificar si tiene pipe
    if (observableText.includes('.pipe(')) {
      console.log('   ✓ Has pipe() - needs takeUntil insertion');
      
      // Simular la transformación
      try {
        const transformed = simulateWrapWithTakeUntil(observableText);
        console.log(`   ✓ Transformed: ${transformed.substring(0, 100)}...`);
      } catch (error) {
        console.log(`   ❌ Transformation failed: ${error.message}`);
      }
    } else {
      console.log('   ✓ No pipe() - needs pipe(takeUntil(...)) addition');
    }
  }
});

function simulateWrapWithTakeUntil(observableText) {
  console.log(`     🔧 Transforming: ${observableText.substring(0, 50)}...`);
  
  if (observableText.includes('.pipe(')) {
    // Encontrar todas las ocurrencias de .pipe(
    const pipeMatches = [];
    let searchIndex = 0;
    
    while (true) {
      const pipeIndex = observableText.indexOf('.pipe(', searchIndex);
      if (pipeIndex === -1) break;
      
      pipeMatches.push(pipeIndex);
      searchIndex = pipeIndex + 6;
    }
    
    console.log(`     📍 Found ${pipeMatches.length} pipe() calls at positions: ${pipeMatches}`);
    
    if (pipeMatches.length === 0) {
      return `${observableText}.pipe(takeUntil(this.destroy$))`;
    }
    
    // Trabajar con el último pipe
    const lastPipeStart = pipeMatches[pipeMatches.length - 1];
    console.log(`     🎯 Working with pipe at position: ${lastPipeStart}`);
    
    // Encontrar el paréntesis de cierre
    let openParens = 0;
    let pipeEnd = -1;
    
    for (let i = lastPipeStart + 6; i < observableText.length; i++) {
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
    
    console.log(`     📍 Pipe closes at position: ${pipeEnd}`);
    
    if (pipeEnd === -1) {
      throw new Error('Could not find pipe closing parenthesis');
    }
    
    const beforePipe = observableText.substring(0, lastPipeStart + 6);
    const pipeContent = observableText.substring(lastPipeStart + 6, pipeEnd).trim();
    const afterPipe = observableText.substring(pipeEnd);
    
    console.log(`     📝 Before pipe: "${beforePipe}"`);
    console.log(`     📝 Pipe content: "${pipeContent.substring(0, 50)}..."`);
    console.log(`     📝 After pipe: "${afterPipe}"`);
    
    const needsComma = pipeContent.length > 0 && !pipeContent.trim().startsWith(',');
    const separator = needsComma ? ', ' : '';
    
    return `${beforePipe}${pipeContent}${separator}takeUntil(this.destroy$)${afterPipe}`;
  }
  
  return `${observableText}.pipe(takeUntil(this.destroy$))`;
}

console.log('\n🎉 Analysis complete!');
