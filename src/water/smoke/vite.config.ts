import {defineConfig,mergeConfig} from 'vite';
import base from '../../../vite.config';
import {resolve} from 'node:path';
export default mergeConfig(base,defineConfig({server:{port:5177,strictPort:true},build:{outDir:'src/water/smoke/dist',emptyOutDir:true,rollupOptions:{input:resolve(import.meta.dirname,'index.html')}}}));
