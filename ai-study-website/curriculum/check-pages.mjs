import vm from 'node:vm';
import fs from 'node:fs';
const ctx=vm.createContext({localStorage:{getItem:()=>null,setItem:()=>{}},window:{},document:{querySelector:()=>null},location:{hash:''},setTimeout,clearTimeout,URL,Blob,console});
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
vm.runInContext(fs.readFileSync(new URL('../dist/content.js',import.meta.url),'utf8')+'\n'+fs.readFileSync(new URL('../dist/tutorials.js',import.meta.url),'utf8')+'\n'+fs.readFileSync(new URL('../dist/tutorial-ui.js',import.meta.url),'utf8')+'\n'+app.slice(0,app.indexOf("$('#setup-form').onsubmit")),ctx);
const result=vm.runInContext(`({
 lessons:LESSONS.map(l=>lesson(l.id)).filter(html=>html.includes('Python 代码编辑器')).length,
 modules:MODULES.map(m=>modulePage(m.key)).filter(html=>html.includes('module-lesson-list')).length,
 projects:[0,...AI_PROJECTS.map(p=>p.id)].map(projectPage).filter(html=>html.includes('Python 代码编辑器')).length,
 exercises:EXERCISES.map(x=>exercise(x.id)).filter(html=>html.includes('提交并检验')).length,
 resources:resources().includes('pandas 官方入门'),
 oldStateKey:KEY==='python-garden-v1'
})`,ctx);
if(result.lessons!==112||result.modules!==30||result.projects!==19||result.exercises!==175||!result.resources||!result.oldStateKey)throw Error(JSON.stringify(result));
console.log('All course, module, exercise and project pages render; original storage key preserved.');
