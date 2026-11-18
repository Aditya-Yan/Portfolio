import {clamp, cross, normalize, orbitPoint, project} from './universe-math.mjs';

// Decorative geometry stays on the two pointer-transparent universe canvases.
export function createSpaceDecorations({background,foreground,canvas,glow}) {
  const tau=Math.PI*2;
  const planets=[],comets=[];
  let belt=null,width=0,height=0,particleLimit=0,mobile=false;
  let seed=13784;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const debris=Array.from({length:340},(_,i)=>({
    angle:random()*tau,radius:.91+random()*.18,lift:(random()-.5)*.065,
    size:.55+Math.pow(random(),2)*2.2,rotation:random()*tau,
    facets:4+i%3,glint:i%19===0,shade:i%4,speed:.000012+random()*.000005
  }));
  const palettes={
    ice:['#effbff','#a3d8e8','#375771'],
    rocky:['#d4b29b','#8a6252','#201c29'],
    gas:['#e6cda3','#ab8660','#292532'],
    ringed:['#e3e7ed','#8d9bb1','#1a263b']
  };
  const plane=(u,normal,radius,eccentricity,speed,phase=0)=>({u:normalize(u),v:normalize(cross(normal,u)),radius,eccentricity,speed,phase});
  const inView=(p,margin=20)=>p.x>-margin&&p.x<width+margin&&p.y>-margin&&p.y<height+margin;

  function configure(camera,nextWidth,nextHeight,orbits) {
    width=nextWidth;height=nextHeight;mobile=width<=720||height<=560;particleLimit=mobile?140:340;
    planets.length=0;comets.length=0;
    const kinds=['ice','ringed','rocky','gas','ice','rocky','ringed','gas','ice'];
    for(let i=0;i<9;i++) {
      const source=orbits[(i*3+2)%orbits.length];
      planets.push({...source,radius:source.radius*(1.08+i%3*.09),phase:i*1.63,
        size:(mobile?4.1:6.8)+(i%4)*(mobile?1.1:1.7),kind:kinds[i],speed:source.speed*.7});
    }
    for(let i=0;i<8;i++) {
      const source=orbits[(i*2+1)%orbits.length];
      comets.push({...source,radius:source.radius*(.72+i*.075),eccentricity:.72+i%3*.09,
        phase:i*tau/8+.24,speed:(.000075+i*.000006)*(i%3===1?-1:1),trail:.24+i%3*.09,warm:i%4===3});
    }
    const u=normalize([1,.16,-.08]);
    belt=plane(u,[.06,-.82,.57],Math.min(width*.4,height*.7)/camera.scale,.9,.000014);
    belt.normal=normalize(cross(belt.u,belt.v));
  }
  function renderIce(camera,time) {
    if(!belt)return;
    // A faint cold haze joins the individual shards into a readable orbital band.
    for(const near of [false,true]) {
      const layer=near?foreground:background;
      layer.strokeStyle=near?'rgba(118,191,224,.035)':'rgba(101,159,206,.025)';
      layer.lineWidth=mobile?8:15;layer.beginPath();let connected=false;
      for(let i=0;i<=110;i++) {
        const p=project(orbitPoint(belt,i/110*tau),camera);
        if((p.z>=0)===near){if(connected)layer.lineTo(p.x,p.y);else layer.moveTo(p.x,p.y);connected=true;}else connected=false;
      }
      layer.stroke();
    }
    let visible=0;
    for(let i=0;i<particleLimit;i++) {
      const shard=debris[i],angle=shard.angle+time*shard.speed;
      const point=orbitPoint(belt,angle).map((v,k)=>v*shard.radius+belt.normal[k]*shard.lift*belt.radius);
      const p=project(point,camera);
      if(!inView(p,8))continue;
      const layer=p.z>=0?foreground:background,radius=shard.size*clamp(p.perspective,.6,1.65)*(mobile?.85:1);
      const rotation=shard.rotation+time*.000025,alpha=clamp(.51+p.z*.07,.27,.82);
      layer.save();layer.translate(p.x,p.y);layer.rotate(rotation);layer.globalAlpha=alpha;
      layer.fillStyle=['#b6e7f2','#88b8d3','#d9f5fa','#a6c9e5'][shard.shade];
      layer.beginPath();
      for(let j=0;j<shard.facets;j++) {
        const a=j/shard.facets*tau,r=radius*(j%2?.65:1);
        if(j)layer.lineTo(Math.cos(a)*r,Math.sin(a)*r);else layer.moveTo(Math.cos(a)*r,Math.sin(a)*r);
      }
      layer.closePath();layer.fill();
      layer.fillStyle='#355a84';layer.beginPath();layer.moveTo(0,0);layer.lineTo(radius,0);layer.lineTo(0,radius*.65);layer.closePath();layer.fill();
      if(shard.glint){
        layer.strokeStyle='#e1faff';layer.lineWidth=.6;layer.beginPath();layer.moveTo(-radius*2,0);layer.lineTo(radius*2,0);layer.moveTo(0,-radius*1.5);layer.lineTo(0,radius*1.5);layer.stroke();
      }
      layer.restore();visible++;
    }
    canvas.dataset.iceAsteroids=visible;
  }
  function renderPlanets(camera,time) {
    let visible=0;
    for(const body of planets) {
      const p=project(orbitPoint(body,body.phase+time*body.speed),camera);
      if(!inView(p,40))continue;
      const layer=p.z>0?foreground:background,radius=body.size*clamp(p.perspective,.65,1.6),colors=palettes[body.kind];
      if(body.kind==='ringed') {
        layer.strokeStyle='rgba(184,205,231,.32)';layer.lineWidth=1.2;layer.beginPath();layer.ellipse(p.x,p.y,radius*1.9,radius*.53,-.4,0,tau);layer.stroke();
      }
      const fill=layer.createRadialGradient(p.x-radius*.4,p.y-radius*.45,0,p.x,p.y,radius);
      fill.addColorStop(0,colors[0]);fill.addColorStop(.42,colors[1]);fill.addColorStop(1,colors[2]);
      layer.save();layer.beginPath();layer.arc(p.x,p.y,radius,0,tau);layer.clip();layer.fillStyle=fill;layer.fill();
      if(body.kind==='gas'||body.kind==='ringed') {
        layer.strokeStyle='rgba(255,239,216,.14)';layer.lineWidth=Math.max(1,radius*.13);
        for(let j=-2;j<4;j++){
          const y=p.y+j*radius*.3;
          layer.beginPath();layer.moveTo(p.x-radius,y);layer.bezierCurveTo(p.x-radius*.3,y+radius*.15,p.x+radius*.4,y-radius*.12,p.x+radius,y-radius*.2);layer.stroke();
        }
      }else if(body.kind==='ice') {
        layer.strokeStyle='rgba(230,252,255,.34)';layer.lineWidth=.65;layer.beginPath();
        layer.moveTo(p.x-radius*.8,p.y-radius*.4);layer.lineTo(p.x-radius*.1,p.y-radius*.2);layer.lineTo(p.x+radius*.2,p.y+radius*.35);layer.lineTo(p.x+radius*.8,p.y+radius*.55);
        layer.moveTo(p.x-radius*.1,p.y-radius*.2);layer.lineTo(p.x+radius*.3,p.y-radius*.75);layer.stroke();
      }else{
        layer.fillStyle='rgba(20,20,31,.3)';
        for(const [x,y,r] of [[-.35,-.2,.2],[.3,.15,.13],[-.1,.5,.15]]){layer.beginPath();layer.arc(p.x+x*radius,p.y+y*radius,r*radius,0,tau);layer.fill();}
      }
      layer.restore();
      if(body.kind==='ringed') {
        layer.strokeStyle='rgba(213,226,240,.7)';layer.lineWidth=1.15;layer.beginPath();layer.ellipse(p.x,p.y,radius*1.9,radius*.53,-.4,0,Math.PI);layer.stroke();
      }
      visible++;
    }
    canvas.dataset.ambientBodies=visible;
  }
  function renderComets(camera,time) {
    let visible=0;
    for(const comet of comets) {
      const angle=comet.phase+time*comet.speed,direction=Math.sign(comet.speed),steps=mobile?28:42;
      let previous=null,seen=false;
      for(let i=0;i<=steps;i++) {
        const t=i/steps,p=project(orbitPoint(comet,angle-direction*comet.trail*(1-t)),camera);
        if(previous) {
          const layer=(previous.z+p.z)/2>=0?foreground:background;
          const alpha=t*t*(comet.warm?.67:.8);
          layer.strokeStyle=comet.warm?`rgba(245,215,165,${alpha})`:`rgba(190,225,255,${alpha})`;
          layer.lineWidth=(.5+t*1.15)*clamp(p.perspective,.7,1.5);
          layer.beginPath();layer.moveTo(previous.x,previous.y);layer.lineTo(p.x,p.y);layer.stroke();
        }
        if(inView(p,8))seen=true;
        previous=p;
      }
      if(previous&&inView(previous,20)) {
        const layer=previous.z>=0?foreground:background;
        glow(layer,previous.x,previous.y,(mobile?7:10)*clamp(previous.perspective,.7,1.5),comet.warm?'rgba(246,214,159,.4)':'rgba(191,225,255,.45)');
        layer.fillStyle='#f4fbff';layer.beginPath();layer.arc(previous.x,previous.y,clamp(previous.perspective,.8,1.8)*1.5,0,tau);layer.fill();
      }
      if(seen)visible++;
    }
    canvas.dataset.orbitalStreaks=visible;
  }
  function render(camera,time) {
    if(!background||!foreground)return;
    renderIce(camera,time);renderPlanets(camera,time);renderComets(camera,time);
  }
  return {configure,render};
}
