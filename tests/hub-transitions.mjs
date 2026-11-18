import assert from 'node:assert/strict';
import {project} from '../assets/universe-math.mjs';
import {spawn} from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':(/\.m?js$/).test(file)?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end()}}).listen(5498,'127.0.0.1');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=9498','--user-data-dir=/tmp/portfolio-qa-chrome','about:blank'],{stdio:'ignore'});
let ws;try{
let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9498/json')).json();break}catch{await new Promise(r=>setTimeout(r,150))}}
ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}};const call=(method,params={})=>new Promise(resolve=>{pending.set(++id,resolve);ws.send(JSON.stringify({id,method,params}))});const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.result.exceptionDetails)throw Error(JSON.stringify(result.result.exceptionDetails));return result.result.result.value};
await call('Page.navigate',{url:'http://127.0.0.1:5498'});await new Promise(r=>setTimeout(r,1800));


await evaluate('document.fonts.ready');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await evaluate("document.querySelector('.ocean-motion-toggle').click()");
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[1280,600],[820,1180],[768,1024],[390,844],[320,844],[320,568],[844,390]]) {
 await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(120);
 await evaluate("document.querySelector('.cosmos-reset').click()");
 const layout=await evaluate(`(()=>{const boxes=[...document.querySelectorAll('.orbital-node')].map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute('aria-label'),left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,hit:e.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))}});const c=document.querySelector('.cosmos-controls').getBoundingClientRect(),hole=document.querySelector('.black-hole').getBoundingClientRect();return {width:innerWidth,height:innerHeight,pageHeight:document.documentElement.scrollHeight,pageWidth:document.documentElement.scrollWidth,boxes,controls:{left:c.left,top:c.top,right:c.right,bottom:c.bottom},center:{x:hole.left+hole.width/2,y:hole.top+hole.height/2},text:document.querySelector('.hub').innerText,meteors:Number(document.querySelector('#cosmos').dataset.meteors),ambient:Number(document.querySelector('#cosmos').dataset.ambientBodies),ice:Number(document.querySelector('#cosmos').dataset.iceAsteroids),streaks:Number(document.querySelector('#cosmos').dataset.orbitalStreaks)}})()`);
 assert.ok(layout.pageHeight<=height+1,'solar system fits without vertical scrolling');assert.ok(layout.pageWidth<=width,'no sideways scroll');
 assert.ok(layout.meteors>0,'shooting stars are rendered in the opening sky');
 assert.ok(layout.ambient>0,'additional decorative orbiters are visible');
 assert.ok(layout.ice>30,'the icy asteroid belt is visible');
 assert.ok(layout.streaks>0,'curved orbital comet trails are visible');
 assert.equal(layout.boxes.length,10,'all five sections and five easter eggs orbit');
 assert.ok(Math.abs(layout.center.x-width/2)<1&&Math.abs(layout.center.y-height/2)<1,'black hole stays centered');
 assert.ok(!layout.text.includes('Software engineer.')&&!layout.text.includes('Where I’ve worked'),'intro text and profile removed from landing');
 const overlaps=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
 for(const [i,r] of layout.boxes.entries()) {
  assert.ok(r.top>=0&&r.left>=0&&r.right<=width&&r.bottom<=height,`${width}x${height}: ${r.label} fits`);
  assert.ok(r.height>=44&&r.width>=44,'orbit target remains touch accessible');
  assert.ok(r.hit,`${width}: ${r.label} receives pointer input`);
  assert.ok(!overlaps(r,layout.controls),`${r.label} clears playback controls`);
  for(const other of layout.boxes.slice(i+1)) assert.ok(!overlaps(r,other),`${width}: ${r.label} clears ${other.label}`);
 }
 if(width>=1000){const span=Math.max(...layout.boxes.map(b=>b.right))-Math.min(...layout.boxes.map(b=>b.left));assert.ok(span>=width*.78,'desktop destinations fill the width of the screen');}
 assert.equal(await evaluate("getComputedStyle(document.querySelector('#cosmos')).pointerEvents === 'none' && getComputedStyle(document.querySelector('#cosmos-front')).pointerEvents === 'none'"),true,'decorative objects never capture input');
 console.log('PASS initial full-screen orbit layout and space decorations',width,height);
 if(width===1440||width===390){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`/tmp/portfolio-solar-${width}.png`,Buffer.from(shot.result.data,'base64'));}
}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await wait(200);
const frozenLayers=await evaluate("[...document.querySelectorAll('#cosmos,#cosmos-front')].map(c=>c.toDataURL()).join('|')");
await wait(150);
assert.equal(await evaluate("[...document.querySelectorAll('#cosmos,#cosmos-front')].map(c=>c.toDataURL()).join('|')"),frozenLayers,'pause freezes the asteroid belt and comet trails in both depth layers');
await evaluate("document.querySelector('.cosmos-reset').click();document.querySelector('.ocean-motion-toggle').click()");
const position=await evaluate("document.querySelector('.bubble-about').getBoundingClientRect().left");
await wait(300);
assert.notEqual(await evaluate("document.querySelector('.bubble-about').getBoundingClientRect().left"),position,'section itself orbits');
const target=await evaluate("(()=>{const r=document.querySelector('.bubble-about').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()");
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:target.x,y:target.y});await wait(50);
const stopped=await evaluate("document.querySelector('.bubble-about').getBoundingClientRect().left");await wait(250);
assert.equal(await evaluate("document.querySelector('.bubble-about').getBoundingClientRect().left"),stopped,'hover stops the moving target');
assert.equal(await evaluate("document.querySelector('#cosmos').dataset.motion"),'inspecting');
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await wait(100);
await evaluate("document.querySelector('.bubble-projects').focus()");await wait(50);
assert.equal(await evaluate("document.querySelector('#cosmos').dataset.motion"),'inspecting','keyboard focus freezes orbits');
assert.equal(await evaluate("getComputedStyle(document.querySelector('.bubble-projects')).outlineStyle"),'solid');
await evaluate("document.querySelector('.bubble-projects').blur()");
console.log('PASS actual orbital motion, hover pause, keyboard focus, and focus ring');
// Camera input remains available while automatic orbital movement is paused.
await evaluate("document.querySelector('.ocean-motion-toggle').click()");
await evaluate("document.querySelector('.cosmos-reset').click()");
const cameraBefore=await evaluate("({orientation:document.querySelector('#cosmos').dataset.orientation,depth:[...document.querySelectorAll('.orbital-node')].map(e=>Number(e.dataset.depth))})");
const initialProjection=await evaluate("(()=>{const c=document.querySelector('#cosmos');return {scale:Number(c.dataset.scale),distance:Number(c.dataset.distance),nodes:[...document.querySelectorAll('.orbital-node')].map(n=>({x:parseFloat(n.style.getPropertyValue('--orbit-x')),y:parseFloat(n.style.getPropertyValue('--orbit-y')),z:Number(n.dataset.depth)}))}})()");
const physical=initialProjection.nodes.map(p=>{const f=initialProjection.distance/(initialProjection.distance-p.z);return [(p.x-720)/(initialProjection.scale*f),(450-p.y)/(initialProjection.scale*f),p.z]});
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:720,y:450});
await call('Input.dispatchMouseEvent',{type:'mousePressed',x:720,y:450,button:'left',clickCount:1});
for(let step=1;step<=30;step++) {
 await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:720+step*6,y:450-step*4,button:'left',buttons:1});
 const view=await evaluate("({orientation:document.querySelector('#cosmos').dataset.orientation.split(',').map(Number),nodes:[...document.querySelectorAll('.orbital-node')].map(n=>({x:parseFloat(n.style.getPropertyValue('--orbit-x')),y:parseFloat(n.style.getPropertyValue('--orbit-y'))}))})");
 const camera={x:720,y:450,scale:initialProjection.scale,distance:initialProjection.distance,zoom:1,orientation:view.orientation};
 physical.forEach((p,i)=>{const expected=project(p,camera);assert.ok(Math.hypot(expected.x-view.nodes[i].x,expected.y-view.nodes[i].y)<.5,'dragging does not shuffle or clamp physical icon positions');});
}
await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:900,y:330,button:'left',clickCount:1});await wait(70);
const cameraAfter=await evaluate("({orientation:document.querySelector('#cosmos').dataset.orientation,depth:[...document.querySelectorAll('.orbital-node')].map(e=>Number(e.dataset.depth)),hash:location.hash})");
assert.notEqual(cameraAfter.orientation,cameraBefore.orientation,'drag rotates camera in three dimensions');
assert.ok(cameraAfter.depth.some((z,i)=>Math.abs(z-cameraBefore.depth[i])>.1),'drag changes actual depth, not only screen positions');
assert.equal(cameraAfter.hash,'','drag does not open a destination');
const rotated=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('/tmp/portfolio-3d-rotated.png',Buffer.from(rotated.result.data,'base64'));
await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:720,y:450,deltaX:0,deltaY:-120});await wait(60);
assert.ok(Number(await evaluate("document.querySelector('#cosmos').dataset.zoom"))>1,'wheel zooms the scene');
await evaluate("document.querySelector('.cosmos-reset').click()");
assert.equal(await evaluate("document.querySelector('#cosmos').dataset.orientation"),'0.000000,0.000000,0.000000,1.000000');
assert.equal(await evaluate("document.querySelector('#cosmos').dataset.zoom"),'1.00');
await evaluate("document.querySelector('.hub').focus()");
await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft'});
assert.notEqual(await evaluate("document.querySelector('#cosmos').dataset.orientation"),'0.000000,0.000000,0.000000,1.000000','keyboard rotates the view');
await evaluate("document.querySelector('.cosmos-reset').click()");
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await call('Emulation.setTouchEmulationEnabled',{enabled:true});await wait(150);
await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:422,id:0}]});
await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:285,y:350,id:0}]});
await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(50);
assert.notEqual(await evaluate("document.querySelector('#cosmos').dataset.orientation"),'0.000000,0.000000,0.000000,1.000000','one-finger touch rotates the view');
const zoomBefore=Number(await evaluate("document.querySelector('#cosmos').dataset.zoom"));
await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:145,y:422,id:0},{x:245,y:422,id:1}]});
await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:120,y:422,id:0},{x:270,y:422,id:1}]});
await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(50);
assert.ok(Number(await evaluate("document.querySelector('#cosmos').dataset.zoom"))>zoomBefore,'pinch zooms the view');
await call('Emulation.setTouchEmulationEnabled',{enabled:false});
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await wait(150);
await evaluate("document.querySelector('.cosmos-reset').click()");await wait(400);
// Dragging from a destination must never count as a click on that destination.
const source=await evaluate("(()=>{const r=document.querySelector('.bubble-projects').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()");
await call('Input.dispatchMouseEvent',{type:'mouseMoved',...source});
await call('Input.dispatchMouseEvent',{type:'mousePressed',...source,button:'left',clickCount:1});
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:source.x+100,y:source.y-60,button:'left',buttons:1});
await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:source.x+100,y:source.y-60,button:'left',clickCount:1});await wait(400);
assert.equal(await evaluate('location.hash'),'','dragging an object suppresses accidental navigation');
await evaluate("document.querySelector('.destination-menu').open=true");await wait(50);
assert.equal(await evaluate("document.querySelectorAll('.destination-menu nav>a').length"),5);
await evaluate("document.querySelector('.destination-menu a[href=\"#about\"]').click()");await wait(700);
assert.equal(await evaluate('location.hash'),'#about','direct destinations remain accessible');
await evaluate("window.portfolio.navigate('')");await wait(700);
await evaluate("document.querySelector('.cosmos-reset').click();document.querySelector('.ocean-motion-toggle').click()");
console.log('PASS smooth physical projection, 3D mouse/touch rotation, zoom, reset, drag suppression, and direct navigation');
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
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await evaluate("window.portfolio.navigate('skills')");assert.equal(await evaluate("document.querySelector('.panel-shell').dataset.section"),'skills');assert.equal(await evaluate("document.querySelector('#tide-transition').classList.contains('playing')"),false);assert.equal(await evaluate("document.querySelector('#cosmos').dataset.meteors"),'0','shooting stars rest under reduced motion');console.log('PASS reduced motion');
}finally{ws?.close();chrome.kill();server.close()}
