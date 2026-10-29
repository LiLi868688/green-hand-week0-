let py;
const testHarness = `
import json as __test_json, math as __test_math, copy as __test_copy

def __test_close(a,b):
    if isinstance(b,bool) or b is None or isinstance(b,str):
        return type(a) is type(b) and a==b
    if isinstance(b,(int,float)):
        return type(a) in (int,float) and __test_math.isclose(a,b,rel_tol=1e-7,abs_tol=1e-7)
    if isinstance(b,list):
        return isinstance(a,(list,tuple)) and len(a)==len(b) and all(__test_close(x,y) for x,y in zip(a,b))
    if isinstance(b,dict):
        return isinstance(a,dict) and a.keys()==b.keys() and all(__test_close(a[k],v) for k,v in b.items())
    return a==b

__test_spec = __test_json.loads(__test_payload)
__test_results = []
for __test_case in __test_spec['cases']:
    try:
        __test_args = __test_copy.deepcopy(__test_case['args'])
        __test_before = __test_copy.deepcopy(__test_args)
        __test_actual = globals()[__test_spec['function']](*__test_args)
        __test_match = __test_close(__test_actual,__test_case['expected'])
        __test_intact = __test_args == __test_before
        __test_results.append({'ok':__test_match and __test_intact,'message': '返回值正确，输入未被修改' if __test_match and __test_intact else '输入被修改，请返回新数据' if not __test_intact else '期望 '+repr(__test_case['expected'])+'；实际 '+repr(__test_actual)[:500]})
    except Exception as __test_error:
        __test_results.append({'ok':False,'message':type(__test_error).__name__+': '+str(__test_error)[:500]})
__test_json.dumps(__test_results,ensure_ascii=False)
`;
self.onmessage=async({data})=>{let out='',err='';try{
 if(!py){importScripts('python/pyodide.js');py=await loadPyodide({indexURL:'python/'});}
 py.setStdout({batched:t=>out+=t+'\n'});py.setStderr({batched:t=>err+=t+'\n'});
 const inputs=(data.input||'').split('\n');py.setStdin({stdin:()=>inputs.length?inputs.shift():undefined});
 const scope=py.toPy({});try{
  await py.runPythonAsync(data.code,{globals:scope});
  let tests;
  if(data.tests){scope.set('__test_payload',JSON.stringify(data.tests));tests=JSON.parse(await py.runPythonAsync(testHarness,{globals:scope}));}
  self.postMessage({ok:true,out,err,tests});
 }finally{scope.destroy();}
}catch(e){self.postMessage({ok:false,out,err:String(e)});}};
