import {clamp, cross, normalize, multiply, rotate, arcball, between, axisAngle, orbitPoint, project} from './universe-math.mjs';
import {createSpaceDecorations} from './space-decoration.mjs';

(() => {
  const hub=document.querySelector('.hub'),field=document.querySelector('.bubble-field');
  hub.tabIndex=0;hub.setAttribute('aria-label','Interactive three-dimensional solar system');
  hub.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight ArrowUp ArrowDown Home');
  hub.setAttribute('aria-describedby','universe-instructions');
  const sections=[...field.querySelectorAll('.bubble')];
  const eggs=[['ball','Basketball','Take a shot'],['game','Aim lab','Play a 15-second aim test'],['food','Food','Open the food gallery'],['book','Reading','One more chapter'],['valorant','Valorant','Reveal my Valorant rank']].map(([name,label,action])=>{
    const button=document.querySelector('.decor-'+name);
    button.classList.add('egg-object','orbital-node');button.title=action;button.setAttribute('aria-label',action);
    const text=button.querySelector('span');text.className='orbit-label';text.textContent=label;
    field.append(button);return button;
  });
  const nodes=[...sections,...eggs];
  const controls=document.createElement('div');controls.className='cosmos-controls';
  controls.setAttribute('role','group');controls.setAttribute('aria-label','Solar system controls');
  const control=(className,label,path)=>{
    const b=document.createElement('button');b.type='button';b.className=className;b.title=label;b.setAttribute('aria-label',label);
    b.innerHTML=`<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    controls.append(b);return b;
  };
  const reset=control('cosmos-reset','Reset view','<path d="M5 5a6 6 0 1 1-1 8M5 2v4H1"/>');
  const zoomOut=control('cosmos-zoom-out','Zoom out','<path d="M5 10h10"/>');
  const toggle=control('ocean-motion-toggle','Pause animation','<path d="M7 5v10M13 5v10"/>');
  const zoomIn=control('cosmos-zoom-in','Zoom in','<path d="M5 10h10M10 5v10"/>');
  const fullscreen=control('cosmos-fullscreen','Enter fullscreen','<path d="M7 3H3v4M13 3h4v4M17 13v4h-4M7 17H3v-4"/>');
  hub.append(controls);
  const instructions=document.createElement('p');instructions.id='universe-instructions';instructions.className='universe-instructions';
  instructions.textContent='Drag to rotate · Scroll to zoom';hub.append(instructions);

  const destinations=document.createElement('details');destinations.className='destination-menu';
  const summary=document.createElement('summary');summary.innerHTML='<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m13 7-2 4-4 2 2-4Z"/></svg>Destinations';
  const nav=document.createElement('nav');nav.setAttribute('aria-label','Direct portfolio destinations');
  sections.forEach(node=>{
    const a=document.createElement('a');a.href='#'+node.dataset.openPanel;a.innerHTML=node.querySelector('.celestial-object').innerHTML;
    const label=document.createElement('span');label.textContent=node.querySelector('.orbit-label').textContent;a.append(label);nav.append(a);
  });
  let shortcutDialog=false;
  const shortcuts=document.createElement('div');shortcuts.className='destination-surprises';shortcuts.setAttribute('role','group');shortcuts.setAttribute('aria-label','Easter eggs');
  eggs.forEach(node=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',node.getAttribute('aria-label'));b.title=node.title;
    b.append(node.querySelector('svg').cloneNode(true));b.addEventListener('click',()=>{destinations.open=false;node.click();if(document.querySelector('dialog[open]'))shortcutDialog=true;else summary.focus();});shortcuts.append(b);
  });
  nav.append(shortcuts);destinations.append(summary,nav);hub.append(destinations);
  nav.addEventListener('click',event=>{if(event.target.closest('a'))destinations.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')destinations.open=false;});
  document.addEventListener('pointerdown',event=>{if(destinations.open&&!destinations.contains(event.target))destinations.open=false;});

  const canvas=document.getElementById('cosmos'),ctx=canvas.getContext('2d',{alpha:false});
  const foreground=document.createElement('canvas');foreground.id='cosmos-front';foreground.setAttribute('aria-hidden','true');hub.prepend(foreground);
  const front=foreground.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),overlay=document.getElementById('panel-overlay');
  const hole=document.querySelector('.black-hole');
  const camera={x:0,y:0,scale:1,zoom:1,distance:5.5,orientation:[0,0,0,1]};
  let width=0,height=0,baseWidth=0,baseHeight=0,coreRadius=70,time=0,paused=false,previous=0,frame=0;
  let cloudStretch=[1,1,1];
  let pointerNode=null,focusNode=null,texture=null,drag=null,suppressClickUntil=0,pinch=null;
  let inertia={axis:[0,1,0],speed:0};
  const pointers=new Map();
  let seed=8256;
  const tau=Math.PI*2;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const glow=(context,x,y,radius,color)=>{
    const g=context.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,color);g.addColorStop(1,'transparent');
    context.fillStyle=g;context.fillRect(x-radius,y-radius,radius*2,radius*2);
  };
  const decorations=createSpaceDecorations({background:ctx,foreground:front,canvas,glow});
  const blocked=()=>overlay.classList.contains('active')||destinations.open||!!document.querySelector('dialog[open],.decor-ball[aria-busy="true"]');
  const resting=()=>paused||reduced.matches||document.hidden||blocked()||pointerNode||focusNode||drag;
  const depthSeeds=[.15,-.5,.5,.65,-.2,-.65,.65,-.6,.45,-.7];
  const orbital=[];
  const meteors=Array.from({length:5},(_,i)=>({
    offset:850+i*3100,duration:1500+i%3*160,startX:.05+(i*.193)% .7,startY:-.1+(i%2)*.2,
    dx:i%2?-.68:.68,dy:.65+(i%3)*.12,tail:.12+i%3*.035,warm:i===3
  }));

  function openingTargets() {
    const compact=width<=720||height<=560;
    const outerX=(width-baseWidth)/2-(compact?15:34);
    const outerY=Math.max(36,(height-baseHeight)/2-105);
    const targets=[];
    if(compact){
      // Equal arc spacing is needed only when constructing the opening view.
      const samples=[{a:0,length:0}];let length=0,x=outerX,y=0;
      for(let i=1;i<=720;i++){
        const a=i/720*tau,nx=Math.cos(a)*outerX,ny=Math.sin(a)*outerY;
        length+=Math.hypot(nx-x,ny-y);samples.push({a,length});x=nx;y=ny;
      }
      for(let i=0;i<10;i++){
        const slot=i<5?i*2:(i-5)*2+1,target=((slot/10-.29+1)%1)*length;
        let j=1;while(samples[j].length<target)j++;
        const a=samples[j-1],b=samples[j],angle=a.a+(b.a-a.a)*(target-a.length)/(b.length-a.length);
        targets.push({x:camera.x+Math.cos(angle)*outerX,y:camera.y+Math.sin(angle)*outerY,i});
      }
    }else{
      for(let i=0;i<10;i++){
        const ring=i<5?0:1,a=(-110+(i%5)*72+ring*36)*Math.PI/180;
        targets.push({x:camera.x+Math.cos(a)*outerX*(ring?1:.67),y:camera.y+Math.sin(a)*outerY*(ring?1:.64),i});
      }
    }
    const constrain=p=>{
      const distance=Math.hypot(p.x-camera.x,p.y-camera.y),clear=coreRadius+Math.min(baseWidth,baseHeight)*.58+10;
      if(distance<clear){const a=distance<1?p.i*tau/10:Math.atan2(p.y-camera.y,p.x-camera.x);p.x=camera.x+Math.cos(a)*clear;p.y=camera.y+Math.sin(a)*clear;}
      p.x=clamp(p.x,baseWidth/2+12,width-baseWidth/2-12);
      p.y=clamp(p.y,baseHeight/2+78,height-baseHeight/2-106);
    };
    for(let pass=0;pass<40;pass++){
      targets.forEach(constrain);
      for(let i=0;i<10;i++)for(let j=i+1;j<10;j++){
        const a=targets[i],b=targets[j],dx=b.x-a.x,dy=b.y-a.y;
        const ox=baseWidth+9-Math.abs(dx),oy=baseHeight+9-Math.abs(dy);
        if(ox>0&&oy>0){if(ox<oy){const n=(ox/2+.1)*(dx<0?-1:1);a.x-=n;b.x+=n;}else{const n=(oy/2+.1)*(dy<0?-1:1);a.y-=n;b.y+=n;}}
      }
    }
    targets.forEach(constrain);
    return targets;
  }
  function buildOrbits() {
    const targets=openingTargets();
    orbital.length=0;
    targets.forEach((target,i)=>{
      // Invert the initial projection so every icon starts exactly on its orbit.
      const z=depthSeeds[i],perspective=camera.distance/(camera.distance-z);
      const point=[(target.x-camera.x)/(camera.scale*perspective),(camera.y-target.y)/(camera.scale*perspective),z];
      const u=normalize(point),axis=normalize([Math.sin(i*1.8+.4),Math.cos(i*1.4),.5+Math.sin(i*.9)]);
      orbital.push({u,v:normalize(cross(u,axis)),radius:Math.hypot(...point),eccentricity:.88+(i%3)*.045,speed:(.000014+i*.0000011)*(i%3===1?-1:1)});
    });

  }
  // One world-space constellation, independent of screen dimensions.
  const cloud=Array.from({length:850},()=>{
    const z=random()*2-1,a=random()*tau,r=.4+Math.pow(random(),.65)*1.65,c=Math.sqrt(1-z*z);
    return {v:[Math.cos(a)*c*r*1.16,Math.sin(a)*c*r,z*r*.9],r:.25+random()*.8,alpha:.2+random()*.55};
  });
  const edges=[];
  cloud.forEach((p,i)=>{
    const near=cloud.map((q,j)=>({j,d:Math.hypot(...p.v.map((n,k)=>n-q.v[k]))})).filter(q=>q.j>i&&q.d<.36).sort((a,b)=>a.d-b.d).slice(0,3);
    near.forEach(q=>edges.push([i,q.j,1-q.d/.4]));
  });
  const diskDust=Array.from({length:250},()=>({a:random()*tau,r:1.03+Math.pow(random(),1.4)*1.3,size:.3+random()*.65,alpha:.16+random()*.45}));

  function resize() {
    width=hub.clientWidth;height=hub.clientHeight;camera.x=width/2;camera.y=height/2;
    baseWidth=parseFloat(getComputedStyle(nodes[0]).width);baseHeight=parseFloat(getComputedStyle(nodes[0]).height);
    camera.scale=Math.max(40,Math.min(width,height)*.24);
    camera.distance=Math.max(8,Math.max(width/height,height/width)*4);
    coreRadius=clamp(Math.min(width,height)*.09,42,82);
    cloudStretch=[width/(camera.scale*4.2),height/(camera.scale*4.2),1];
    buildOrbits();
    decorations.configure(camera,width,height,orbital);
    const dpr=Math.min(devicePixelRatio||1,1.75);
    for(const surface of [canvas,foreground]){surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);}
    ctx?.setTransform(dpr,0,0,dpr,0,0);front?.setTransform(dpr,0,0,dpr,0,0);
    texture=document.createElement('canvas');texture.width=width;texture.height=height;
    const t=texture.getContext('2d'),count=Math.max(1200,Math.min(4600,Math.round(width*height/380)));
    canvas.dataset.starCount=count;
    seed=8256;
    if(t){
      t.fillStyle='#030407';t.fillRect(0,0,width,height);
      for(let i=0;i<95;i++){
        const x=random()*width,y=camera.y+(x-camera.x)*-.6+(random()-.5)*height*1.3;
        glow(t,x,y,50+random()*Math.min(width,height)*.32,`rgba(130,150,176,${.008+random()*.014})`);
      }
      for(let i=0;i<count;i++){
        const x=random()*width,y=random()*height,r=.2+Math.pow(random(),3)*.9;
        t.fillStyle=`rgba(214,226,244,${.15+random()*.55})`;t.beginPath();t.arc(x,y,r,0,tau);t.fill();
        if(r>1)glow(t,x,y,5,'rgba(211,226,255,.15)');
      }
    }
    draw();
  }
  function placeNodes() {
    const projected=orbital.map((orbit,i)=>({...project(orbitPoint(orbit,time*orbit.speed),camera),i}));
    const order=[...projected].sort((a,b)=>a.z-b.z);
    order.forEach((p,rank)=>{
      const node=nodes[p.i],selected=node===pointerNode||node===focusNode;
      const behindCore=p.z<0&&Math.hypot(p.x-camera.x,p.y-camera.y)<coreRadius*camera.zoom+10;
      const onScreen=p.x>baseWidth/2&&p.x<width-baseWidth/2&&p.y>baseHeight/2&&p.y<height-baseHeight/2;
      node.style.setProperty('--orbit-x',`${p.x.toFixed(3)}px`);node.style.setProperty('--orbit-y',`${p.y.toFixed(3)}px`);
      node.style.setProperty('--node-scale',clamp(p.perspective,.76,1.28).toFixed(3));
      node.style.setProperty('--node-alpha',selected?'1':clamp(.82+p.z*.065,.58,1).toFixed(3));
      node.style.zIndex=selected?'60':String((p.z>=0?35:10)+rank);
      node.style.pointerEvents=behindCore&&!selected?'none':'auto';
      node.tabIndex=onScreen&&!behindCore?0:-1;
      node.dataset.depth=p.z.toFixed(3);
    });
    return projected;
  }
  function renderOrbits() {
    orbital.forEach((orbit,i)=>{
      for(const near of [false,true]){
        const layer=near?front:ctx;if(!layer)continue;
        layer.strokeStyle=near?'rgba(171,197,229,.22)':'rgba(138,157,187,.075)';layer.lineWidth=near?.8:.55;layer.beginPath();
        let connected=false;
        for(let step=0;step<=96;step++){
          const p=project(orbitPoint(orbit,step/96*tau),camera);
          if((p.z>=0)===near){if(connected)layer.lineTo(p.x,p.y);else layer.moveTo(p.x,p.y);connected=true;}else connected=false;
        }
        layer.stroke();
      }
      const p=project(orbitPoint(orbit,time*orbit.speed+Math.PI*.7),camera),layer=p.z>0?front:ctx;
      if(layer){glow(layer,p.x,p.y,6*p.perspective,'rgba(211,230,255,.22)');layer.fillStyle='#e2edff';layer.beginPath();layer.arc(p.x,p.y,Math.max(.7,p.perspective),0,tau);layer.fill();}
    });
  }
  function renderMeteors() {
    let visible=0;
    if(!reduced.matches)for(const meteor of meteors){
      const phase=(time+meteor.offset)%16500;
      if(phase>meteor.duration)continue;
      const progress=phase/meteor.duration,x=(meteor.startX+meteor.dx*progress)*width,y=(meteor.startY+meteor.dy*progress)*height;
      const vx=meteor.dx*width,vy=meteor.dy*height,length=Math.hypot(vx,vy),tail=Math.min(width,height)*meteor.tail;
      const tx=x-vx/length*tail,ty=y-vy/length*tail,alpha=Math.sin(progress*Math.PI)*.9;
      const gradient=ctx.createLinearGradient(tx,ty,x,y);
      gradient.addColorStop(0,'rgba(166,200,243,0)');gradient.addColorStop(.65,`rgba(173,207,249,${alpha*.3})`);gradient.addColorStop(1,`rgba(235,244,255,${alpha})`);
      ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=gradient;ctx.lineWidth=1.3;
      ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(x,y);ctx.stroke();
      glow(ctx,x,y,7,`rgba(194,220,255,${alpha*.5})`);ctx.fillStyle=`rgba(247,251,255,${alpha})`;ctx.beginPath();ctx.arc(x,y,1.3,0,tau);ctx.fill();ctx.restore();
      visible++;
    }
    canvas.dataset.meteors=visible;
  }
  function renderDisk() {
    const radius=coreRadius/camera.scale;
    for(let ring=0;ring<7;ring++)for(const near of [false,true]){
      const layer=near?front:ctx;if(!layer)continue;
      const r=radius*(1.06+ring*.15);
      layer.strokeStyle=`rgba(244,${213-ring*5},${163-ring*8},${.48-ring*.052})`;
      layer.lineWidth=(ring<2?2.3:1)*camera.zoom;layer.beginPath();let connected=false;
      for(let n=0;n<=128;n++){
        const a=n/128*tau,p=project([Math.cos(a)*r,Math.sin(a)*r*.19,Math.sin(a)*r*.98],camera);
        if((p.z>=0)===near){if(connected)layer.lineTo(p.x,p.y);else layer.moveTo(p.x,p.y);connected=true;}else connected=false;
      }
      layer.stroke();
    }
    diskDust.forEach(d=>{
      const a=d.a+time*.00006,r=radius*d.r,p=project([Math.cos(a)*r,Math.sin(a)*r*.19,Math.sin(a)*r*.98],camera),layer=p.z>0?front:ctx;
      if(layer){layer.fillStyle=`rgba(246,221,180,${d.alpha})`;layer.beginPath();layer.arc(p.x,p.y,d.size*p.perspective,0,tau);layer.fill();}
    });
  }
  function draw() {
    placeNodes();
    hole.style.setProperty('--hole-scale',(coreRadius/68*camera.zoom).toFixed(3));
    canvas.dataset.orientation=camera.orientation.map(n=>n.toFixed(6)).join(',');canvas.dataset.zoom=camera.zoom.toFixed(2);
    canvas.dataset.scale=camera.scale.toFixed(4);canvas.dataset.distance=camera.distance.toFixed(4);
    if(!ctx||!front)return;
    ctx.drawImage(texture,0,0,width,height);front.clearRect(0,0,width,height);
    const cloudCamera={...camera,orientation:multiply(camera.orientation,axisAngle([0,1,0],time*.000006))};
    const projected=cloud.map(point=>project(point.v.map((v,i)=>v*cloudStretch[i]),cloudCamera));
    for(let group=0;group<4;group++){
      ctx.strokeStyle=`rgba(180,204,235,${.025+group*.025})`;ctx.lineWidth=.5;ctx.beginPath();
      for(const [i,j,alpha] of edges)if(Math.min(3,Math.floor(alpha*4))===group){ctx.moveTo(projected[i].x,projected[i].y);ctx.lineTo(projected[j].x,projected[j].y);}
      ctx.stroke();
    }
    projected.forEach((p,i)=>{
      const point=cloud[i],alpha=point.alpha*clamp(.75+p.z*.22,.15,1);
      ctx.fillStyle=`rgba(216,231,253,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,point.r*p.perspective,0,tau);ctx.fill();
    });
    renderMeteors();renderOrbits();decorations.render(camera,time);renderDisk();
    const selected=pointerNode||focusNode;
    if(selected){
      const p={x:parseFloat(selected.style.getPropertyValue('--orbit-x')),y:parseFloat(selected.style.getPropertyValue('--orbit-y'))};front.strokeStyle='rgba(235,210,165,.38)';front.lineWidth=.7;front.setLineDash([2,5]);
      front.beginPath();front.moveTo(camera.x,camera.y);front.lineTo(p.x,p.y);front.stroke();front.setLineDash([]);
    }
  }
  function tick(now) {
    frame=0;if(resting())return;
    const elapsed=Math.min(now-previous,50);
    if(now-previous>=25){
      time+=elapsed;previous=now;
      if(inertia.speed>.00003){camera.orientation=multiply(axisAngle(inertia.axis,inertia.speed*elapsed),camera.orientation);inertia.speed*=Math.exp(-elapsed*.005);}
      draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);frame=0;
    toggle.hidden=reduced.matches||overlay.classList.contains('active');
    const label=paused?'Play animation':'Pause animation';toggle.title=label;toggle.setAttribute('aria-label',label);toggle.setAttribute('aria-pressed',String(paused));
    toggle.querySelector('svg').innerHTML=paused?'<path d="m7 4 9 6-9 6Z"/>':'<path d="M7 5v10M13 5v10"/>';
    canvas.dataset.motion=reduced.matches?'reduced':paused?'paused':drag?'dragging':document.hidden||blocked()?'resting':pointerNode||focusNode?'inspecting':'running';
    draw();if(!resting()){previous=performance.now();frame=requestAnimationFrame(tick);}
  }
  function setZoom(value) {camera.zoom=clamp(value,.72,1.35);inertia.speed=0;draw();}
  function resetView() {camera.orientation=[0,0,0,1];camera.zoom=1;inertia.speed=0;time=0;pointerNode=null;focusNode=null;syncMotion();}
  toggle.addEventListener('click',()=>{paused=!paused;inertia.speed=0;syncMotion();});
  reset.addEventListener('click',resetView);zoomIn.addEventListener('click',()=>setZoom(camera.zoom+.12));zoomOut.addEventListener('click',()=>setZoom(camera.zoom-.12));
  fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen?.();}catch{/* Embedded previews may not allow fullscreen. */}});
  document.addEventListener('fullscreenchange',()=>{const label=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';fullscreen.title=label;fullscreen.setAttribute('aria-label',label);});
  hub.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.target.closest('.cosmos-controls,.destination-menu')||overlay.classList.contains('active'))return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:camera.zoom};drag=null;hub.setPointerCapture(event.pointerId);return;}
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:arcball(event.clientX,event.clientY,width,height),orientation:[...camera.orientation],moved:false,lastQ:[...camera.orientation],lastTime:performance.now()};
    inertia.speed=0;
  });
  hub.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()];setZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance);suppressClickUntil=performance.now()+350;event.preventDefault();return;}
    if(!drag||event.pointerId!==drag.id)return;
    if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<6)return;
    if(!drag.moved){drag.moved=true;hub.setPointerCapture(event.pointerId);pointerNode=null;focusNode=null;document.activeElement?.closest('.orbital-node')?.blur();hub.classList.add('is-dragging');}
    event.preventDefault();
    const q=multiply(between(drag.start,arcball(event.clientX,event.clientY,width,height)),drag.orientation);
    const inverse=[-drag.lastQ[0],-drag.lastQ[1],-drag.lastQ[2],drag.lastQ[3]],delta=multiply(q,inverse);
    const now=performance.now(),angle=2*Math.acos(clamp(delta[3],-1,1));
    inertia={axis:normalize(delta.slice(0,3)),speed:Math.min(.009,angle/Math.max(16,now-drag.lastTime))};
    camera.orientation=q;drag.lastQ=q;drag.lastTime=now;syncMotion();
  });
  const endDrag=event=>{
    pointers.delete(event.pointerId);
    if(pinch){pinch=null;suppressClickUntil=performance.now()+350;}
    if(drag?.id===event.pointerId){
      if(drag.moved){suppressClickUntil=performance.now()+350;if(reduced.matches||paused||event.type==='pointercancel')inertia.speed=0;}
      drag=null;hub.classList.remove('is-dragging');pointerNode=null;
    }
    if(hub.hasPointerCapture(event.pointerId))hub.releasePointerCapture(event.pointerId);
    syncMotion();
  };
  hub.addEventListener('pointerup',endDrag);hub.addEventListener('pointercancel',endDrag);
  hub.addEventListener('lostpointercapture',event=>{if(drag?.id===event.pointerId){drag=null;hub.classList.remove('is-dragging');inertia.speed=0;syncMotion();}});
  hub.addEventListener('click',event=>{if(performance.now()<suppressClickUntil&&event.target.closest('.orbital-node')){event.preventDefault();event.stopImmediatePropagation();}},true);
  hub.addEventListener('wheel',event=>{if(event.target.closest('.destination-menu')||blocked())return;event.preventDefault();setZoom(camera.zoom-event.deltaY*.0007);},{passive:false});
  hub.addEventListener('keydown',event=>{
    if(event.target!==hub)return;
    const axes={ArrowLeft:[0,-1,0],ArrowRight:[0,1,0],ArrowUp:[-1,0,0],ArrowDown:[1,0,0]};
    if(axes[event.key]){event.preventDefault();event.stopPropagation();camera.orientation=multiply(axisAngle(axes[event.key],.14),camera.orientation);inertia.speed=0;draw();}
    if(event.key==='Home'){event.preventDefault();resetView();}
  });
  nodes.forEach(node=>{
    node.addEventListener('pointerenter',()=>{if(!drag?.moved){pointerNode=node;inertia.speed=0;syncMotion();}});
    node.addEventListener('pointerleave',()=>{if(drag?.moved)return;if(pointerNode===node)pointerNode=null;syncMotion();});
    node.addEventListener('focus',()=>{if(node.matches(':focus-visible')&&!drag?.moved)focusNode=node;inertia.speed=0;syncMotion();});
    node.addEventListener('blur',()=>{if(focusNode===node)focusNode=null;syncMotion();});
  });
  destinations.addEventListener('toggle',syncMotion);
  reduced.addEventListener('change',()=>{inertia.speed=0;syncMotion();});document.addEventListener('visibilitychange',syncMotion);
  new MutationObserver(()=>{if(overlay.classList.contains('active')){pointerNode=null;focusNode=null;destinations.open=false;inertia.speed=0;}syncMotion();}).observe(overlay,{attributes:true,attributeFilter:['class']});
  const dialogObserver=new MutationObserver(syncMotion);document.querySelectorAll('dialog').forEach(d=>{dialogObserver.observe(d,{attributes:true,attributeFilter:['open']});d.addEventListener('close',()=>{if(shortcutDialog){shortcutDialog=false;summary.focus();}});});
  new MutationObserver(syncMotion).observe(eggs[0],{attributes:true,attributeFilter:['aria-busy']});
  document.addEventListener('portfolio:travel',event=>{
    const route=event.detail.to.split('/')[0],node=sections.find(n=>n.dataset.openPanel===route);
    const p=node?.getBoundingClientRect();
    document.documentElement.style.setProperty('--jump-x',p?`${p.left+p.width/2}px`:'50vw');
    document.documentElement.style.setProperty('--jump-y',p?`${p.top+p.height/2}px`:'50vh');
  });
  let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(resize);});
  document.fonts.ready.then(()=>{resize();syncMotion();});resize();syncMotion();
})();
