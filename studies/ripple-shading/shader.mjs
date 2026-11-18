import {COEFFICIENTS,validateCoefficients} from './math.mjs';
function requireOnce(source,marker){if(source.split(marker).length!==2)throw new Error(`Shader contract failed: expected exactly one ${JSON.stringify(marker)}`);}
/** Extracts the original scalar evaluation, retaining all point-conditioned warp/source logic.
 * Both original main bodies remain unchanged except B's new varying calculation and tone factor. */
export function injectShading(vertex,fragment,coefficients=COEFFICIENTS){
 validateCoefficients(coefficients);
 const start='  vec2 p = transformed.xy;',end='  vField = sizeBoost;',shift='  transformed.xy += accDisp;',ambient='  vAmbient = ambH;',main='void main() {',tone='  vec3 tone = diffuse * max(darken, 0.0);',angle='    float ang = atan(d.y, d.x);';
 for(const marker of [start,end,shift,ambient,main,angle])requireOnce(vertex,marker);
 requireOnce(fragment,tone);requireOnce(fragment,main);
 const a=vertex.indexOf(start),b=vertex.indexOf(end);
 if(a>=b)throw new Error('Shader contract failed: scalar boundaries reversed');
 const body=vertex.slice(a,b).replace(start,'  vec2 p = studyPosition;').replace(shift,'').replace(/\baSeed\b/g,'studySeed').replace(angle,'    float ang = dist > 1e-8 ? atan(d.y, d.x) : 0.0;');
 if(/\btransformed\b|\bvField\b|\bgl_/.test(body))throw new Error('Shader contract failed: extracted scalar has side effects');
 const evaluator=`float studyScalarAt(vec2 studyPosition, float studySeed) {\n${body}\n  return sizeBoost;\n}\n`;
 const varyings='\nvarying float vStudyRelief;\nuniform vec2 uStudyLight;\n';
 const {step,heightScale,gain}=coefficients;
 const calculation=`${ambient}\n  vec2 studySlope = vec2(\n    studyScalarAt(p + vec2(${step}, 0.0), aSeed) - studyScalarAt(p - vec2(${step}, 0.0), aSeed),\n    studyScalarAt(p + vec2(0.0, ${step}), aSeed) - studyScalarAt(p - vec2(0.0, ${step}), aSeed)\n  ) / ${2*step};\n  vec3 studyNormal = vec3(-${heightScale} * studySlope, 1.0);\n  studyNormal /= max(length(studyNormal), 1e-6);\n  vStudyRelief = dot(studyNormal.xy, uStudyLight / max(length(uStudyLight), 1e-6));`;
 return {vertexShader:vertex.replace(main,varyings+evaluator+'\n'+main).replace(ambient,calculation),fragmentShader:fragment.replace(main,'varying float vStudyRelief;\n'+main).replace(tone,tone+`\n  tone *= 1.0 + ${gain} * vStudyRelief;`),evaluator};
}
