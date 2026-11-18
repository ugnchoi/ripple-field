import {defineConfig} from 'vite';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const files=['../../src/grid/contour.mjs','../../src/grid/field.mjs','../../src/grid/shaders.mjs','contour.mjs','field.mjs','shaders.mjs','main.mjs','style.css','index.html','vite.config.mjs'];
const revision=Object.fromEntries(files.map(name=>[name,createHash('sha256').update(readFileSync(root+name)).digest('hex')]));
export default defineConfig({root,base:'./',define:{__GRID_REVISION__:JSON.stringify(revision)},server:{port:5178,strictPort:true},build:{outDir:'dist',emptyOutDir:true}});
