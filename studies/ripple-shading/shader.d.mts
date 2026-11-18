import type {Coefficients} from './math.mjs';
export function injectShading(vertex:string,fragment:string,coefficients?:Coefficients):{vertexShader:string;fragmentShader:string;evaluator:string};
