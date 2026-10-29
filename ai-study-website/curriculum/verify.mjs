import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../dist/content.js',import.meta.url),'utf8')+';globalThis.catalog={lessons:LESSONS,exercises:EXERCISES,modules:MODULES,projects:AI_PROJECTS,paths:LEARNING_PATHS}',ctx);
const c=ctx.catalog;
const ids=new Set(c.lessons.map(x=>x.id));
if(ids.size!==c.lessons.length||c.lessons.some((l,i)=>l.id!==i))throw Error('Lesson IDs invalid');
for(const l of c.lessons){if(!l.body||!l.code||!l.problem||!l.explain||!l.error)throw Error('Incomplete lesson '+l.id);if(!c.modules.some(m=>m.key===l.module))throw Error('Unknown module');}
for(const x of c.exercises)if(!ids.has(x.lesson)||!x.answer||!x.expected)throw Error('Invalid exercise '+x.id);
for(const p of c.paths)for(const m of p.modules)if(!c.modules.some(x=>x.key===m))throw Error('Invalid path');
fs.mkdirSync(new URL('../outputs/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../outputs/catalog-test.json',import.meta.url),JSON.stringify(c));
console.log(`${c.lessons.length} lessons, ${c.exercises.length} exercises, ${c.modules.length} modules: structure verified.`);
