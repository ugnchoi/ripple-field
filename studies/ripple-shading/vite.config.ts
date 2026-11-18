import {defineConfig,mergeConfig} from 'vite';
import base from '../../vite.config';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const files=['src/engine/constants.ts','src/engine/rippleFieldMaterial.ts','src/engine/swellSourceBuffer.ts','src/engine/resolvePerformanceBudget.ts','studies/ripple-baseline/replay.mjs','studies/ripple-shading/main.ts','studies/ripple-shading/math.mjs','studies/ripple-shading/shader.mjs','studies/ripple-shading/index.html','studies/ripple-shading/study.css','studies/ripple-shading/vite.config.ts'];
const revision={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:Object.fromEntries(files.map(file=>[file,createHash('sha256').update(readFileSync(file)).digest('hex')]))};
export default mergeConfig(base,defineConfig({define:{__SHADING_REVISION__:JSON.stringify(revision)},server:{port:5175,strictPort:true},build:{outDir:'studies/ripple-shading/dist',emptyOutDir:true,rollupOptions:{input:resolve(import.meta.dirname,'index.html')}}}));
