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


const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await evaluate('document.fonts.ready');
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await evaluate("window.portfolio.navigate('projects')");await wait(150);
assert.deepEqual(await evaluate("[...document.querySelectorAll('.project-card h3')].map(x=>x.textContent)"),['GlanceAR','SignVision','Researchly','AKPsi GPT','Vantage','Sentiment Radar']);
assert.equal(await evaluate("document.querySelectorAll('.project-scope').length"),0);
assert.equal(await evaluate("document.querySelectorAll('.case-study-link').length"),6);console.log('PASS project removal and descriptions');
for(const width of [1440,768,390,320]) {
 await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await wait(200);
 await evaluate("window.portfolio.navigate('skills')");await wait(150);
 const skills=await evaluate(`({topics:[...document.querySelectorAll('.skill-topic')].map(e=>({text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize)})),overflow:document.querySelector('.panel-shell').scrollWidth>document.querySelector('.panel-shell').clientWidth,deletedLinks:document.querySelectorAll('a[href*="ML_Final_Project"]').length})`);
 assert.equal(skills.topics.length,5);assert.ok(skills.topics.every(e=>e.size>=24));assert.equal(skills.overflow,false);assert.equal(skills.deletedLinks,0);
 if(width===1440||width===390){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`/tmp/portfolio-topic-headings-${width}.png`,Buffer.from(shot.result.data,'base64'));}
 await evaluate("window.portfolio.navigate('contact')");await wait(150);
 const contact=await evaluate(`({overflow:document.querySelector('.panel-shell').scrollWidth>document.querySelector('.panel-shell').clientWidth,removed:document.querySelector('#panel-body').textContent.includes('Good fits for a message'),invite:document.querySelector('.contact-invitation').textContent.includes('Message me about anything'),controls:[...document.querySelectorAll('.contact-surface a,.contact-surface button')].map(e=>({label:e.textContent.trim(),height:e.getBoundingClientRect().height}))})`);
 assert.equal(contact.overflow,false);assert.equal(contact.removed,false);assert.equal(contact.invite,true);assert.ok(contact.controls.every(c=>c.height>=44));console.log('PASS skills and contact layout',width);
 if(width===1440||width===390){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`/tmp/portfolio-contact-note-${width}.png`,Buffer.from(shot.result.data,'base64'));}
}
await evaluate(`(()=>{const t=document.querySelector('#contact-message');t.value='A question & an idea? #hello 👋';t.dispatchEvent(new Event('input',{bubbles:true}))})()`);
assert.equal(await evaluate("new URL(document.querySelector('#open-email-draft').href).searchParams.get('body')"),'A question & an idea? #hello 👋');console.log('PASS encoded email draft');
await evaluate("document.querySelector('#suggest-opener').click()");
assert.equal(await evaluate("document.querySelector('#contact-message').value.includes('A question & an idea? #hello 👋')"),true);
assert.equal(await evaluate("document.activeElement.id"),'contact-message');console.log('PASS opener preserves user draft and focuses message');
const draft=await evaluate("document.querySelector('#contact-message').value");
await evaluate("document.querySelector('#suggest-opener').click()");assert.equal(await evaluate("document.querySelector('#contact-message').value.split('A question & an idea? #hello 👋').length"),2);
const next=await evaluate("document.querySelector('#contact-message').value");assert.notEqual(draft,next);
await evaluate("window.portfolio.navigate('skills');window.portfolio.navigate('contact')");await wait(150);assert.equal(await evaluate("document.querySelector('#contact-message').value"),next);console.log('PASS draft survives navigation');
await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedEmail=text}}});document.querySelector('#copy-email-btn').click()");await wait(50);
assert.equal(await evaluate('window.copiedEmail'),'AXY230026@utdallas.edu');assert.ok((await evaluate("document.querySelector('#copy-feedback').textContent")).startsWith('Copied:'));console.log('PASS copy feedback');
await evaluate("navigator.clipboard.writeText=async()=>{throw Error('denied')};document.querySelector('#copy-email-btn').click()");await wait(50);assert.ok((await evaluate("document.querySelector('#copy-feedback').textContent")).includes('Clipboard access not available'));console.log('PASS clipboard-denied fallback');
}finally{ws?.close();chrome.kill();server.close()}
