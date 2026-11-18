import {defineConfig, mergeConfig} from 'vite';
import base from '../../vite.config';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const files=['src/engine/constants.ts','src/engine/rippleFieldMaterial.ts','src/engine/swellSourceBuffer.ts','studies/ripple-baseline/main.tsx','studies/ripple-baseline/replay.mjs'];
const revision={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:Object.fromEntries(files.map(file=>[file,createHash('sha256').update(readFileSync(file)).digest('hex')]))};
export default mergeConfig(base,defineConfig({define:{__STUDY_REVISION__:JSON.stringify(revision)},build:{outDir:'studies/ripple-baseline/dist',emptyOutDir:true,rollupOptions:{input:resolve(import.meta.dirname,'index.html')}}}));
