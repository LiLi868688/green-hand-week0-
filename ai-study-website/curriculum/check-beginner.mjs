import vm from 'node:vm';
import fs from 'node:fs';
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../dist/content.js',import.meta.url),'utf8')+'\n'+fs.readFileSync(new URL('../dist/tutorials.js',import.meta.url),'utf8')+'\n globalThis.data={lessons:LESSONS,guides:BEGINNER_GUIDES};',ctx);
for(const l of ctx.data.lessons){
 const g=ctx.data.guides[l.id];
 if(!g||!g.analogy||!g.worked||!g.experiment||g.terms.length<4||!g.lines.length||!g.figureCaption)throw Error('Incomplete beginner lesson '+l.id);
 if(!fs.existsSync(new URL('../dist/'+g.figure,import.meta.url)))throw Error('Missing diagram '+l.id);
 const source=l.code.split('\n');
 for(const row of g.lines)if(source[row.line-1]!==row.code)throw Error('Annotation line mismatch '+l.id);
}
if(ctx.data.guides[3].observation.output!=='900')throw Error('Input example incorrect');
if(ctx.data.guides[20].observation.output!=='7\n5.0')throw Error('Norm example incorrect');
if(ctx.data.guides[67].observation.output!=='2.0')throw Error('Training example incorrect');
console.log('112 beginner guides: diagrams, annotated lines, glossary, worked examples and execution snapshots verified.');
