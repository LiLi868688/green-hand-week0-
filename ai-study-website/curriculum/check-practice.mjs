import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../dist/content.js',import.meta.url),'utf8')+';globalThis.data=[...EXERCISES,...AI_PROJECTS].filter(x=>x.cases)',ctx);
const runner=fs.readFileSync(new URL('../dist/runner.js',import.meta.url),'utf8');
const harness=runner.split('const testHarness = `')[1].split('`;')[0];
let cases=0;
for(const x of ctx.data){
 const payload=JSON.stringify({function:x.function,cases:x.cases});
 const script=x.answer+'\n__test_payload = '+JSON.stringify(payload)+'\n'+harness+'\nassert all(x["ok"] for x in __test_results), __test_results\n';
 const r=spawnSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),['-c',script],{encoding:'utf8',timeout:5000});
 if(r.status!==0)throw Error(x.title+': '+r.stderr);
 if(x.hints.length!==3&&x.id<175&&x.lesson!==undefined)throw Error('Hints missing');
 cases+=x.cases.length;
}
for(const [code,fn,input] of [
 ['def f(a):\n    return [2,15]','f',[0]],
 ['def f(a):\n    a.append(2)\n    return a','f',[1]],
 ['def f(a):\n    raise ValueError("bad input")','f',[1]],
]){
 const spec={function:fn,cases:[{args:[input],expected:[0,0]}]};
 const r=spawnSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),['-c',code+'\n__test_payload = '+JSON.stringify(JSON.stringify(spec))+'\n'+harness+'\nassert not __test_results[0]["ok"]\n'],{encoding:'utf8',timeout:5000});
 if(r.status!==0)throw Error('False success or harness exception: '+r.stderr);
}
console.log(`${ctx.data.length} exercise/project solutions, ${cases} cases passed through browser runner harness; hardcoded, mutating and exception solutions rejected.`);
