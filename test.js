#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing ng-add-takeuntil schematic...\n');

// 1. Compilar el schematic
console.log('📦 Building schematic...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// 2. Verificar que los archivos compilados existen
const distFiles = [
  'dist/collection.json',
  'dist/add-takeuntil/index.js',
  'dist/add-takeuntil/schema.json'
];

console.log('🔍 Checking compiled files...');
distFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} missing`);
    process.exit(1);
  }
});

console.log('\n🎉 All tests passed!');
console.log('\n📋 Cómo usar en tu proyecto Angular local:');
console.log('\n🟡 SOLUCIONES COMPLETAS PARA WINDOWS Y VERSIONES DE ANGULAR:');
console.log('\n⚡ VERSIÓN MEJORADA CON AST Y DETECCIÓN INTELIGENTE:');
console.log('\n1️⃣ OPCIÓN 1 - Angular 10+ (PARA TU PROYECTO):');
console.log(`   1. Copia instalar-angular10.bat a tu proyecto Angular`);
console.log(`   2. Ejecuta: instalar-angular10.bat`);
console.log(`   3. Detecta automáticamente la versión y maneja conflictos`);
console.log('\n2️⃣ OPCIÓN 2 - Instalación estándar (Angular 12+):');
console.log(`   1. Copia instalar-y-ejecutar.bat a tu proyecto Angular`);
console.log(`   2. Ejecuta: instalar-y-ejecutar.bat`);
console.log(`   3. Selecciona vista previa (1) o aplicar cambios (2)`);
console.log('\n3️⃣ OPCIÓN 3 - Comando manual con compatibilidad forzada:');
console.log(`   cd C:\\Users\\Usuario\\Desktop\\iurix-cade\\iurix-cloud-ui\\angular-ui`);
console.log(`   npm install "${__dirname}\\ng-add-takeuntil-1.0.0.tgz" --save-dev --legacy-peer-deps`);
console.log(`   ng generate ng-add-takeuntil:add-takeuntil --dry-run`);
console.log('\n4️⃣ OPCIÓN 4 - PowerShell (alternativo):');
console.log(`   1. Copia ejecutar-schematic.ps1 a tu proyecto Angular`);
console.log(`   2. Ejecuta: .\\ejecutar-schematic.ps1 -DryRun`);
console.log('\n🛡️ NUEVAS CARACTERÍSTICAS MEJORADAS:');
console.log('   ✅ Manipulación AST (más robusta que strings)');
console.log('   ✅ Detección de subjects en takeUntil existentes');
console.log('   ✅ Reutilización inteligente (dispose$, teardown$, etc.)');
console.log('   ✅ Detección mejorada en ngOnDestroy');
console.log('   ✅ Manejo de pipes complejos con genéricos');
console.log('   ✅ Validación multicapa antes de transformar');
console.log('   ✅ Logging detallado para debugging');
console.log('   ✅ Continuación de procesamiento en caso de errores');
console.log('\n📁 Scripts especializados creados:');
console.log(`   ${__dirname}\\instalar-angular10.bat ⭐ (PARA ANGULAR 10)`);
console.log(`   ${__dirname}\\instalar-y-ejecutar.bat (ANGULAR 12+)`);
console.log(`   ${__dirname}\\instalar-como-paquete.bat`);
console.log(`   ${__dirname}\\ejecutar-schematic.ps1`);

// 3. Mostrar estadísticas del código
console.log('\n📊 Schematic Statistics:');
const indexFile = fs.readFileSync('src/add-takeuntil/index.ts', 'utf8');
const lines = indexFile.split('\n').length;
const functions = (indexFile.match(/function\s+\w+/g) || []).length;
const interfaces = (indexFile.match(/interface\s+\w+/g) || []).length;

console.log(`- Lines of code: ${lines}`);
console.log(`- Functions: ${functions}`);
console.log(`- Interfaces: ${interfaces}`);
console.log(`- File size: ${Math.round(fs.statSync('src/add-takeuntil/index.ts').size / 1024)}KB`);
