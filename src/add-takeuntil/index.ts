import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import {
  Project,
  SourceFile,
  ClassDeclaration,
  SyntaxKind,
  CallExpression,
  Node,
  PropertyAccessExpression,
} from 'ts-morph';
import { join } from 'path';

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
export function addTakeUntil(options: Schema): Rule {
  return (tree: Tree, _ctx: SchematicContext) => {
    const base = options.path || 'src';
    const project = new Project({ useInMemoryFileSystem: true });

    collectFiles(tree, base).forEach((fp) => {
      const buf = tree.read(fp);
      if (!buf) return;
      const sf = project.createSourceFile(fp, buf.toString(), { overwrite: true });
      if (transform(sf)) tree.overwrite(fp, sf.getFullText());
    });
    return tree;
  };
}

/* -------------------------------------------------------------------------- */
/*                               FILE HELPERS                                 */
/* -------------------------------------------------------------------------- */
function collectFiles(tree: Tree, dir: string, acc: string[] = []): string[] {
  tree
    .getDir(dir)
    .subfiles.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
    .forEach((f) => acc.push(join(dir, f)));
  tree
    .getDir(dir)
    .subdirs.filter((d) => d !== 'node_modules')
    .forEach((d) => collectFiles(tree, join(dir, d), acc));
  return acc;
}

function transform(sf: SourceFile): boolean {
  let changed = false;
  findNgClasses(sf).forEach((c) => {
    const subj = ensureDestroySubject(sf, c);
    if (subj) {
      console.log(`Processing class: ${c.getName()} with subject: ${subj}`);
      changed = syncNgOnDestroy(sf, c, subj) || changed;
      changed = patchSubscribeCalls(sf, c, subj) || changed;
    } else {
      console.log(`Skipping class ${c.getName()}: no subscriptions found`);
    }
  });
  return changed;
}

/* -------------------------------------------------------------------------- */
/*                            ANGULAR CLASS FINDER                            */
/* -------------------------------------------------------------------------- */
const NG_DECORATORS = ['Component', 'Directive', 'Pipe', 'Injectable'];
function findNgClasses(sf: SourceFile): ClassDeclaration[] {
  return sf
    .getClasses()
    .filter((c) => c.getDecorators().some((d) => NG_DECORATORS.includes(d.getName())));
}

/* -------------------------------------------------------------------------- */
/*                 DETECCIÓN / CREACIÓN DEL SUBJECT DE DESTRUCCIÓN            */
/* -------------------------------------------------------------------------- */
function locateExistingDestroySubject(clazz: ClassDeclaration): string | undefined {
  // 1. Buscar subjects ya usados en takeUntil (prioridad alta)
  const takeUntilSubjects = detectExistingTakeUntilSubjects(clazz);
  if (takeUntilSubjects.length > 0) {
    console.log(`✓ Found subject already used in takeUntil: ${takeUntilSubjects[0]}`);
    return takeUntilSubjects[0];
  }

  // 2. Buscar propiedades que parezcan subjects de destrucción
  for (const prop of clazz.getProperties()) {
    const name = prop.getName();
    const typeTxt = prop.getTypeNode()?.getText() ?? '';
    const initTxt = prop.getInitializer()?.getText() ?? '';

    const isSubject =
      /Subject/i.test(typeTxt) || /new\s+(Replay|Behavior)?Subject/i.test(initTxt);
    if (!isSubject) continue;

    const looksDestroyish = isDestroySubjectName(name);
    if (!looksDestroyish) continue;

    console.log(`✓ Found potential destroy subject property: ${name}`);
    return name;
  }

  // 3. Buscar subjects mencionados en ngOnDestroy
  const ng = clazz.getMethod('ngOnDestroy');
  if (ng) {
    const body = ng.getBodyText() ?? '';
    // Buscar patrones como this.something$.next() o this.something$.complete()
    const regex = /this\.(\w+\$?)\.(?:next|complete)\(\)/g;
    let match;
    while ((match = regex.exec(body)) !== null) {
      const subjectName = match[1];
      if (isDestroySubjectName(subjectName)) {
        console.log(`✓ Found subject used in ngOnDestroy: ${subjectName}`);
        return subjectName;
      }
    }
  }

  return undefined;
}

function hasSubscribeCalls(clazz: ClassDeclaration): boolean {
  return clazz
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .some(isSubscribe);
}

function ensureDestroySubject(sf: SourceFile, clazz: ClassDeclaration): string | null {
  // Solo crear/usar subject si hay suscripciones
  if (!hasSubscribeCalls(clazz)) {
    return null;
  }

  const existing = locateExistingDestroySubject(clazz);
  if (existing) {
    console.log(`✓ Found existing destroy subject: ${existing}`);
    return existing;
  }

  const name = 'destroy$';
  clazz.insertProperty(0, {
    name,
    type: 'Subject<void>',
    initializer: 'new Subject<void>()',
    scope: 'private' as any,
  });
  addImport(sf, 'Subject', 'rxjs');
  console.log(`✓ Created new destroy subject: ${name}`);
  return name;
}

/* -------------------------------------------------------------------------- */
/*                         NGONDESTROY – SINCRONIZACIÓN                       */
/* -------------------------------------------------------------------------- */
function syncNgOnDestroy(sf: SourceFile, clazz: ClassDeclaration, subj: string): boolean {
  let mod = false;

  if (!clazz.getImplements().some((i) => i.getText().includes('OnDestroy'))) {
    clazz.addImplements('OnDestroy');
    addImport(sf, 'OnDestroy', '@angular/core');
    mod = true;
  }

  let ng = clazz.getMethod('ngOnDestroy');
  if (!ng) {
    clazz.addMethod({
      name: 'ngOnDestroy',
      returnType: 'void',
      statements: [`this.${subj}.next();`, `this.${subj}.complete();`],
    });
    return true;
  }

  const body = ng.getBodyText() ?? '';
  if (!body.includes(`${subj}.next()`)) {
    ng.addStatements(`this.${subj}.next();`);
    mod = true;
  }
  if (!body.includes(`${subj}.complete()`)) {
    ng.addStatements(`this.${subj}.complete();`);
    mod = true;
  }
  return mod;
}

/* -------------------------------------------------------------------------- */
/*            SUBSCRIBE() → .PIPE(TAKEUNTIL(...)) – CONVERSIÓN                */
/* -------------------------------------------------------------------------- */
function patchSubscribeCalls(sf: SourceFile, clazz: ClassDeclaration, subj: string): boolean {
  let changed = false;
  const subscribeCalls = clazz
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(isSubscribe);

  subscribeCalls.forEach((call) => {
    const expr = call.getExpression() as PropertyAccessExpression;
    const obsNode = expr.getExpression();
    const obsText = obsNode.getText();
    
    if (obsText.includes('takeUntil(')) {
      console.log(`✓ Subscription already managed: ${obsText.substring(0, 50)}...`);
      return; // ya gestionado
    }

    try {
      if (addTakeUntilToObservableAST(obsNode, subj)) {
        addImport(sf, 'takeUntil', 'rxjs/operators');
        console.log(`✓ Added takeUntil to: ${obsText.substring(0, 50)}...`);
        changed = true;
      }
    } catch (error) {
      console.warn(`⚠ Could not transform subscription: ${obsText.substring(0, 50)}... - ${error}`);
    }
  });
  
  return changed;
}

function isSubscribe(node: CallExpression): boolean {
  const e = node.getExpression();
  return Node.isPropertyAccessExpression(e) && e.getName() === 'subscribe';
}

function wrapWithTakeUntil(obs: string, subj: string): string {
  return obs.includes('.pipe(')
    ? appendOperator(obs, `takeUntil(this.${subj})`)
    : `${obs}.pipe(takeUntil(this.${subj}))`;
}

function appendOperator(obs: string, op: string): string {
  const lastIdx = obs.lastIndexOf('.pipe(');
  if (lastIdx === -1) return `${obs}.pipe(${op})`;
  const start = lastIdx + 6;
  const close = closeParen(obs, start);
  const before = obs.slice(0, start);
  const content = obs.slice(start, close).trim();
  const after = obs.slice(close);
  const sep = content ? ', ' : '';
  return `${before}${content}${sep}${op}${after}`;
}

function closeParen(str: string, i: number): number {
  let d = 0;
  for (let p = i; p < str.length; p++) {
    if (str[p] === '(') d++;
    else if (str[p] === ')') {
      if (d === 0) return p;
      d--;
    }
  }
  return str.length - 1;
}

/* -------------------------------------------------------------------------- */
/*                                IMPORT UTILS                                */
/* -------------------------------------------------------------------------- */
function addImport(sf: SourceFile, name: string, from: string): void {
  const imp = sf.getImportDeclarations().find((i) => i.getModuleSpecifierValue() === from);
  if (imp) {
    if (!imp.getNamedImports().some((n) => n.getName() === name)) imp.addNamedImport(name);
  } else {
    sf.addImportDeclaration({ moduleSpecifier: from, namedImports: [name] });
  }
}

/**
 * Adds takeUntil operator using AST manipulation instead of string replacement
 * This approach is more robust and handles complex cases better
 */
function addTakeUntilToObservableAST(obsNode: Node, subj: string): boolean {
  try {
    // Check if it's already a pipe call expression
    if (Node.isCallExpression(obsNode)) {
      const expr = obsNode.getExpression();
      if (Node.isPropertyAccessExpression(expr) && expr.getName() === 'pipe') {
        // It's already a pipe call, add takeUntil as an argument
        const takeUntilCall = `takeUntil(this.${subj})`;
        obsNode.addArgument(takeUntilCall);
        return true;
      }
    }
    
    // If not a pipe, wrap with pipe and add takeUntil
    const newCode = `${obsNode.getText()}.pipe(takeUntil(this.${subj}))`;
    obsNode.replaceWithText(newCode);
    return true;
  } catch (error) {
    console.warn(`AST manipulation failed, falling back to string replacement: ${error}`);
    // Fallback to string replacement if AST fails
    const newCode = wrapWithTakeUntil(obsNode.getText(), subj);
    obsNode.replaceWithText(newCode);
    return true;
  }
}

/**
 * Enhanced detection of existing destroy subjects in takeUntil calls
 * This looks for subjects already being used in takeUntil operators
 */
function detectExistingTakeUntilSubjects(clazz: ClassDeclaration): string[] {
  const subjects: string[] = [];
  
  const takeUntilCalls = clazz.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => {
      const expr = call.getExpression();
      return Node.isIdentifier(expr) && expr.getText() === 'takeUntil';
    });

  takeUntilCalls.forEach(call => {
    const args = call.getArguments();
    if (args.length > 0) {
      const arg = args[0];
      if (Node.isPropertyAccessExpression(arg)) {
        const subjectName = arg.getName();
        if (isDestroySubjectName(subjectName)) {
          subjects.push(subjectName);
        }
      }
    }
  });
  
  return [...new Set(subjects)]; // Remove duplicates
}

function isDestroySubjectName(name: string): boolean {
  return name.endsWith('$') || /destroy|dispose|teardown|signal|unsubscribe/i.test(name);
}
