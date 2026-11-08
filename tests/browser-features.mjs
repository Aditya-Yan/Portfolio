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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = async (label, expression, expected = true) => {
  const value = await evaluate(expression); assert.deepEqual(value, expected, label); console.log('PASS', label);
};
const go = async route => { await evaluate(`window.portfolio.navigate(${JSON.stringify(route)})`); await wait(750); };
await evaluate("sessionStorage.clear()");
await go('projects');
await check('section URL', 'location.hash', '#projects');
await evaluate("document.querySelector('.filter-btn[data-filter=vision]').click();document.querySelector('.panel-shell').scrollTop=300"); await wait(150);
await go('skills');
await check('skill evidence links', "document.querySelectorAll('.evidence-chip a').length > 25");
await evaluate("[...document.querySelectorAll('.evidence-chip a')].find(a=>a.textContent==='Computer Vision').click()"); await wait(750);
await check('computer vision opens the technical case study', "location.hash === '#projects/signvision' && document.querySelector('.case-study').textContent.includes('cropped before being sent to Gemini')");
await evaluate('history.back()'); await wait(750); await check('browser Back', 'location.hash', '#skills');
await evaluate('history.forward()'); await wait(750); await check('browser Forward', 'location.hash', '#projects/signvision');
await go('projects');
await check('filter survives section and detail navigation', "document.querySelector('.filter-btn.active').dataset.filter", 'vision');
await check('project scroll survives navigation', 'Math.round(document.querySelector(".panel-shell").scrollTop)', 300);
await call('Page.reload'); await wait(1300);
await check('refresh restores section', "document.querySelector('.panel-shell').dataset.section", 'projects');
await check('refresh restores filter', "document.querySelector('.filter-btn.active').dataset.filter", 'vision');
await check('refresh restores scroll', 'Math.round(document.querySelector(".panel-shell").scrollTop)', 300);
await go('skills');
await evaluate("[...document.querySelectorAll('.evidence-chip a')].find(a=>a.textContent==='AWS Glue').click()");await wait(750);
await check('cloud skill opens the matching role', "location.hash === '#experience/capital-one' && document.activeElement.id === 'capital-one'");
await check('target role clears the sticky header', "document.querySelector('#capital-one').getBoundingClientRect().top >= document.querySelector('.panel-topbar').getBoundingClientRect().bottom");
for (const width of [1440,768,390,320]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await wait(200);
  for (const section of ['about','experience','projects','skills','contact']) {
    await go(section);
    await check(`${section} navigation and width ${width}`, `location.hash === '#${section}' && document.querySelector('.section-nav a[aria-current]').hash === '#${section}' && document.querySelector('.panel-shell').scrollWidth <= document.querySelector('.panel-shell').clientWidth && document.documentElement.scrollWidth <= innerWidth`);
  }
  for (const id of ['glancear','signvision','researchly','akpsi-gpt','vantage','sentiment-radar']) {
    await go(`projects/${id}`);
    await check(`case study ${id} at ${width}`, "document.querySelector('.case-study') !== null && document.querySelector('.case-flow').children.length === 4 && document.querySelector('.case-stack dd') !== null && !document.querySelector('.case-contribution,.case-sources,.case-status') && document.querySelector('.panel-shell').scrollWidth <= document.querySelector('.panel-shell').clientWidth");
    if ((width===1440||width===390)&&id==='signvision') {
      const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`/tmp/portfolio-case-${width}.png`,Buffer.from(shot.result.data,'base64'));
    }
  }
}
await go('projects');
await check('six project cards and case-study links', "document.querySelectorAll('.case-study-link').length === 6 && document.querySelectorAll('.project-card').length === 6");
await go('projects/signvision');
await check('technical sections only', "JSON.stringify([...document.querySelectorAll('.case-study h3')].map(h=>h.textContent))", JSON.stringify(['Architecture','Tech stack','Key features & challenges','Engineering takeaway']));
await check('no source material or personal contribution in case studies', "!document.querySelector('.case-study').textContent.match(/my contribution|source material|supplied resume|hardest challenge/i) && document.querySelectorAll('.case-study a').length === 1");
await call('Page.reload');await wait(1300);
await check('case study deep link survives reload', "location.hash === '#projects/signvision' && document.querySelector('#panel-title').textContent === 'SignVision'");
await go('');
await evaluate("document.querySelector('.decor-ball').scrollIntoView({block:'center'});document.querySelector('.decor-ball').click();document.querySelector('.decor-ball').click()");
await check('one temporary hoop per shot', "document.querySelectorAll('.basketball-scene').length", 1);
await wait(400);const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('/tmp/portfolio-basketball.png',Buffer.from(shot.result.data,'base64'));
await wait(1500);
await check('made shot cleans up and restores the object', "!document.querySelector('.basketball-scene') && !document.querySelector('.decor-ball').disabled && document.querySelector('.decor-ball svg').style.visibility === ''");
await evaluate("document.querySelector('.decor-book').click()");
await check('notebook is unchanged', "document.querySelector('#egg-toast').textContent", 'One more chapter. Then I’ll close the laptop. Probably.');
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await evaluate("document.querySelector('.decor-ball').click()");await wait(600);
await check('reduced-motion shot cleans up', "!document.querySelector('.basketball-scene') && !document.querySelector('.decor-ball').disabled");
await go('skills');
await check('reduced-motion navigation remains readable', "document.querySelector('.panel-overlay').classList.contains('active') && document.querySelectorAll('.evidence-links').length===5");
console.log('All browser feature checks passed.');
}finally{ws?.close();chrome.kill();server.close()}
