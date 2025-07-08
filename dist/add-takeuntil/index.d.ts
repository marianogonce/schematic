import { Rule } from '@angular-devkit/schematics';
import { Schema } from './schema';
/**
 * Robust addTakeUntil schematic
 * --------------------------------------------
 * ▸ Añade `.pipe(takeUntil(this.<destroySubject>))` a cada llamada
 *   `.subscribe()` que aún no gestione cancelación.
 * ▸ Detecta y reutiliza subjects de destrucción existentes, sin importar
 *   su nombre (destroy$, dispose$, teardown$, etc.).
 * ▸ Crea el subject si no existe, importa lo necesario y completa
 *   `ngOnDestroy()` sólo con lo que falte.
 */
export declare function addTakeUntil(options: Schema): Rule;
