#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Empaquetando schematic para uso local...\n');

try {
  // 1. Compilar
  console.log('🔨 Compilando schematic...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Crear paquete
  console.log('\n📦 Creando paquete npm...');
  execSync('npm pack', { stdio: 'inherit' });
  
  // 3. Buscar el archivo .tgz creado
  const files = fs.readdirSync('.');
  const tgzFile = files.find(file => file.endsWith('.tgz'));
  
  if (tgzFile) {
    const fullPath = path.resolve(tgzFile);
    
    console.log('\n✅ ¡Paquete creado exitosamente!');
    console.log('\n📋 Para usar en tu proyecto Angular:');
    console.log('\n1. Ir a tu proyecto Angular:');
    console.log('   cd C:\\ruta\\a\\tu\\proyecto-angular');
    console.log('\n2. Instalar este schematic:');
    console.log(`   npm install "${fullPath}"`);
    console.log('\n3. Ejecutar el schematic:');
    console.log('   ng generate ng-add-takeuntil:add-takeuntil --dry-run');
    console.log('   ng generate ng-add-takeuntil:add-takeuntil');
    console.log('\n📁 Archivo creado:');
    console.log(`   ${fullPath}`);
    
    // 4. Crear script de instalación rápida
    const installScript = `@echo off
echo Instalando ng-add-takeuntil en el proyecto Angular actual...
npm install "${fullPath}"
echo.
echo ✅ Instalación completa!
echo.
echo Para usar el schematic:
echo   ng generate ng-add-takeuntil:add-takeuntil --dry-run
echo   ng generate ng-add-takeuntil:add-takeuntil
pause`;

    fs.writeFileSync('install-local.bat', installScript);
    console.log('\n🚀 Script de instalación creado: install-local.bat');
    console.log('   Copia este archivo a tu proyecto Angular y ejecútalo');
    
  } else {
    console.error('❌ No se encontró el archivo .tgz');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
