# Ejemplos de Uso del Schematic

## Instalación y Uso

```bash
# 1. Instalar las dependencias
npm install

# 2. Compilar el schematic
npm run build

# 3. Aplicar el schematic a un proyecto Angular
ng generate ./dist:add-takeuntil --path=src/app

# 4. Vista previa de cambios (dry-run)
ng generate ./dist:add-takeuntil --path=src/app --dry-run
```

## Estructura de Archivos

```
src/
├── collection.json          # Configuración del schematic
└── add-takeuntil/
    ├── index.ts             # Lógica principal del schematic
    ├── schema.json          # Schema de opciones
    └── schema.ts            # Interfaz TypeScript del schema
```

## Testing Local

Para probar el schematic localmente en un proyecto Angular:

1. Compila el schematic: `npm run build`
2. En tu proyecto Angular, ejecuta:
   ```bash
   ng generate /ruta/completa/al/schematic/dist:add-takeuntil
   ```

## Extensiones Recomendadas

- TypeScript Hero
- Angular Language Service
- RxJS snippet extension
