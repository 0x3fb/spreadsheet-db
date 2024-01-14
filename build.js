#!/usr/bin/env node

import { error } from 'console';
import { join } from 'path';
import { argv, cwd, exit } from 'process';

import { context } from 'esbuild';

const isTest = argv.includes('--test');

const ctx = await context({
    entryPoints: [join(cwd(), isTest ? 'test' : 'src', `index${isTest ? '.test' : ''}.ts`)],
    outdir: join(cwd(), 'dist'),
    bundle: true,
    minify: true,
    sourcesContent: false,
    allowOverwrite: true,
    format: 'esm',
    platform: 'node',
    sourcemap: 'inline',
    jsx: 'automatic',
    tsconfig: join(cwd(), 'tsconfig.json'),
    packages: 'external',
    define: {
        'process.env.NODE_ENV': isTest ? `'production'` : `'${process.env.NODE_ENV}'`,
    },
});

process.on('beforeExit', () => {
    ctx.dispose().catch(error);
});

if (!argv.includes('--watch')) {
    await ctx.rebuild();
    exit();
}

await ctx.watch();