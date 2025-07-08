"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTakeUntil = addTakeUntil;
const ts_morph_1 = require("ts-morph");
const path_1 = require("path");
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
function addTakeUntil(options) {
    return (tree, _ctx) => {
        const base = options.path || 'src';
        const project = new ts_morph_1.Project({ useInMemoryFileSystem: true });
        collectFiles(tree, base).forEach((fp) => {
            const buf = tree.read(fp);
            if (!buf)
                return;
            const sf = project.createSourceFile(fp, buf.toString(), { overwrite: true });
            if (transform(sf))
                tree.overwrite(fp, sf.getFullText());
        });
        return tree;
    };
}
/* -------------------------------------------------------------------------- */
/*                               FILE HELPERS                                 */
/* -------------------------------------------------------------------------- */
function collectFiles(tree, dir, acc = []) {
    tree
        .getDir(dir)
        .subfiles.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
        .forEach((f) => acc.push((0, path_1.join)(dir, f)));
    tree
        .getDir(dir)
        .subdirs.filter((d) => d !== 'node_modules')
        .forEach((d) => collectFiles(tree, (0, path_1.join)(dir, d), acc));
    return acc;
}
function transform(sf) {
    let changed = false;
    findNgClasses(sf).forEach((c) => {
        const subj = ensureDestroySubject(sf, c);
        if (subj) {
            console.log(`Processing class: ${c.getName()} with subject: ${subj}`);
            changed = syncNgOnDestroy(sf, c, subj) || changed;
            changed = patchSubscribeCalls(sf, c, subj) || changed;
        }
        else {
            console.log(`Skipping class ${c.getName()}: no subscriptions found`);
        }
    });
    return changed;
}
/* -------------------------------------------------------------------------- */
/*                            ANGULAR CLASS FINDER                            */
/* -------------------------------------------------------------------------- */
const NG_DECORATORS = ['Component', 'Directive', 'Pipe', 'Injectable'];
function findNgClasses(sf) {
    return sf
        .getClasses()
        .filter((c) => c.getDecorators().some((d) => NG_DECORATORS.includes(d.getName())));
}
/* -------------------------------------------------------------------------- */
/*                 DETECCIÓN / CREACIÓN DEL SUBJECT DE DESTRUCCIÓN            */
/* -------------------------------------------------------------------------- */
function locateExistingDestroySubject(clazz) {
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
        const isSubject = /Subject/i.test(typeTxt) || /new\s+(Replay|Behavior)?Subject/i.test(initTxt);
        if (!isSubject)
            continue;
        const looksDestroyish = isDestroySubjectName(name);
        if (!looksDestroyish)
            continue;
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
function hasSubscribeCalls(clazz) {
    return clazz
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression)
        .some(isSubscribe);
}
function ensureDestroySubject(sf, clazz) {
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
        scope: 'private',
    });
    addImport(sf, 'Subject', 'rxjs');
    console.log(`✓ Created new destroy subject: ${name}`);
    return name;
}
/* -------------------------------------------------------------------------- */
/*                         NGONDESTROY – SINCRONIZACIÓN                       */
/* -------------------------------------------------------------------------- */
function syncNgOnDestroy(sf, clazz, subj) {
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
function patchSubscribeCalls(sf, clazz, subj) {
    let changed = false;
    const subscribeCalls = clazz
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression)
        .filter(isSubscribe);
    subscribeCalls.forEach((call) => {
        const expr = call.getExpression();
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
        }
        catch (error) {
            console.warn(`⚠ Could not transform subscription: ${obsText.substring(0, 50)}... - ${error}`);
        }
    });
    return changed;
}
function isSubscribe(node) {
    const e = node.getExpression();
    return ts_morph_1.Node.isPropertyAccessExpression(e) && e.getName() === 'subscribe';
}
function wrapWithTakeUntil(obs, subj) {
    return obs.includes('.pipe(')
        ? appendOperator(obs, `takeUntil(this.${subj})`)
        : `${obs}.pipe(takeUntil(this.${subj}))`;
}
function appendOperator(obs, op) {
    const lastIdx = obs.lastIndexOf('.pipe(');
    if (lastIdx === -1)
        return `${obs}.pipe(${op})`;
    const start = lastIdx + 6;
    const close = closeParen(obs, start);
    const before = obs.slice(0, start);
    const content = obs.slice(start, close).trim();
    const after = obs.slice(close);
    const sep = content ? ', ' : '';
    return `${before}${content}${sep}${op}${after}`;
}
function closeParen(str, i) {
    let d = 0;
    for (let p = i; p < str.length; p++) {
        if (str[p] === '(')
            d++;
        else if (str[p] === ')') {
            if (d === 0)
                return p;
            d--;
        }
    }
    return str.length - 1;
}
/* -------------------------------------------------------------------------- */
/*                                IMPORT UTILS                                */
/* -------------------------------------------------------------------------- */
function addImport(sf, name, from) {
    const imp = sf.getImportDeclarations().find((i) => i.getModuleSpecifierValue() === from);
    if (imp) {
        if (!imp.getNamedImports().some((n) => n.getName() === name))
            imp.addNamedImport(name);
    }
    else {
        sf.addImportDeclaration({ moduleSpecifier: from, namedImports: [name] });
    }
}
/**
 * Adds takeUntil operator using AST manipulation instead of string replacement
 * This approach is more robust and handles complex cases better
 */
function addTakeUntilToObservableAST(obsNode, subj) {
    try {
        // Check if it's already a pipe call expression
        if (ts_morph_1.Node.isCallExpression(obsNode)) {
            const expr = obsNode.getExpression();
            if (ts_morph_1.Node.isPropertyAccessExpression(expr) && expr.getName() === 'pipe') {
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
    }
    catch (error) {
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
function detectExistingTakeUntilSubjects(clazz) {
    const subjects = [];
    const takeUntilCalls = clazz.getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression)
        .filter(call => {
        const expr = call.getExpression();
        return ts_morph_1.Node.isIdentifier(expr) && expr.getText() === 'takeUntil';
    });
    takeUntilCalls.forEach(call => {
        const args = call.getArguments();
        if (args.length > 0) {
            const arg = args[0];
            if (ts_morph_1.Node.isPropertyAccessExpression(arg)) {
                const subjectName = arg.getName();
                if (isDestroySubjectName(subjectName)) {
                    subjects.push(subjectName);
                }
            }
        }
    });
    return [...new Set(subjects)]; // Remove duplicates
}
function isDestroySubjectName(name) {
    return name.endsWith('$') || /destroy|dispose|teardown|signal|unsubscribe/i.test(name);
}
