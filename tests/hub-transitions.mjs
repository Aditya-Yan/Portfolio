import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end()}}).listen(5498,'127.0.0.1');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=9498','--user-data-dir=/tmp/portfolio-qa-chrome','about:blank'],{stdio:'ignore'});
let ws;try{
let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9498/json')).json();break}catch{await new Promise(r=>setTimeout(r,150))}}
ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}};const call=(method,params={})=>new Promise(resolve=>{pending.set(++id,resolve);ws.send(JSON.stringify({id,method,params}))});const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.result.exceptionDetails)throw Error(JSON.stringify(result.result.exceptionDetails));return result.result.result.value};
await call('Page.navigate',{url:'http://127.0.0.1:5498'});await new Promise(r=>setTimeout(r,1800));


await evaluate('document.fonts.ready');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[1280,600],[390,844]]) {
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(250);
 const layout=await evaluate(`(()=>{const selectors=['.topbar','.intro-copy','.centerpiece','.bubble-field',...['ball','game','food','book','valorant'].map(x=>'.decor-'+x),'.ocean-motion-toggle'];return {width:innerWidth,height:innerHeight,pageHeight:document.documentElement.scrollHeight,pageWidth:document.documentElement.scrollWidth,rects:selectors.map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {selector,top:r.top,left:r.left,right:r.right,bottom:r.bottom}})}})()`);
 console.log('layout',JSON.stringify(layout));
 if(width>=1024){assert.ok(layout.pageHeight<=height+1,'desktop must not scroll');assert.ok(layout.pageWidth<=width,'no sideways scroll');for(const r of layout.rects){assert.ok(r.top>=-1&&r.left>=-1&&r.right<=width+1&&r.bottom<=height+1,`${width}x${height} ${r.selector} must fit`);}}
 if(width===1440||width===1280||width===1024){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`/tmp/portfolio-hub-${width}x${height}.png`,Buffer.from(shot.result.data,'base64'));}
}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
for(const route of ['about','experience','projects','skills','contact','']) {
 const frames=await evaluate(`new Promise(resolve=>{const frames=[],start=performance.now(),old=document.querySelector('.panel-shell').dataset.section||'home';window.portfolio.navigate('${route}');const tick=()=>{const t=performance.now()-start,tide=document.querySelector('#tide-transition');frames.push({t,active:document.querySelector('.panel-overlay').classList.contains('active'),section:document.querySelector('.panel-shell').dataset.section,playing:tide.classList.contains('playing'),cover:[[3,3],[innerWidth-3,3],[3,innerHeight-3],[innerWidth-3,innerHeight-3],[innerWidth/2,innerHeight/2]].every(([x,y])=>document.elementFromPoint(x,y)?.closest('#tide-transition'))});if(t<700)requestAnimationFrame(tick);else resolve({old,frames})};requestAnimationFrame(tick)})`);
 const target=route||'home';const changed=frames.frames.find(f=>route?f.active&&f.section===route:!f.active);
 assert.ok(changed&&changed.t>=300,`${target}: outgoing view must remain until cover`);
 assert.ok(changed.playing,`${target}: swap must happen during transition`);
 assert.ok(changed.cover,`${target}: viewport must be fully covered at swap`);
 assert.equal(frames.frames.at(-1).playing,false);
 console.log('PASS covered transition',target,Math.round(changed.t));
}
await evaluate("window.portfolio.navigate('experience')");await wait(700);
console.log('role order',await evaluate("[...document.querySelectorAll('.timeline-item')].map(x=>({id:x.id,title:x.querySelector('h3').textContent}))"));
assert.deepEqual(await evaluate("[...document.querySelectorAll('.timeline-item')].map(x=>x.id)"),['ibm','capital-one','acm-research-lead','alura','acm-research-intern']);
await evaluate("window.portfolio.navigate('projects')");await wait(700);await evaluate("document.querySelector('.filter-btn[data-filter=vision]').click()");
assert.deepEqual(await evaluate("[...document.querySelectorAll('.project-card')].filter(c=>!c.hidden).map(c=>c.querySelector('h3').textContent)"),['GlanceAR','SignVision']);console.log('PASS Computer Vision filter');
await evaluate("window.portfolio.navigate('skills');setTimeout(()=>window.portfolio.navigate('contact'),70)");await wait(800);assert.equal(await evaluate("document.querySelector('.panel-shell').dataset.section"),'contact');console.log('PASS latest navigation wins');
await evaluate("window.portfolio.navigate('projects');setTimeout(()=>history.back(),70)");await wait(800);assert.equal(await evaluate("document.querySelector('.panel-shell').dataset.section"),'contact');console.log('PASS Back cancels pending swap');
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await evaluate("window.portfolio.navigate('skills')");assert.equal(await evaluate("document.querySelector('.panel-shell').dataset.section"),'skills');assert.equal(await evaluate("document.querySelector('#tide-transition').classList.contains('playing')"),false);console.log('PASS reduced motion');
}finally{ws?.close();chrome.kill();server.close()}
