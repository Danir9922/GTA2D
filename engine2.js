// ====== engine2.js НАЧАЛО ======
const buildings=[],parks=[],waterBodies=[],bloodDecals=[];
const camera={x:0,y:0};
let gameTime=0,dayTime=0,kills=0,showFullMap=false;
let arrestTimer=0,arrestCop=null;
const mapState={zoom:1,rot:0,panX:0,panY:0,leftDown:false,rightDown:false,lx:0,ly:0};
const player={x:0,y:0,angle:0,speed:0,health:100,armor:0,money:500,wanted:0,wantedTimer:0,inVehicle:null,currentWeapon:1,shootTimer:0,radius:12,animFrame:0,animTimer:0,alive:true,respawnTimer:0,swimming:false,busted:false,
  shirtColor:'#2255cc',skinColor:'#fca',hairColor:'#432',ownedWeapons:['Пистолет','Автомат'],
  weapons:[{name:'Кулаки',icon:'👊',ammo:Infinity,damage:12,rate:350,range:40},{name:'Пистолет',icon:'🔫',ammo:120,damage:25,rate:350,range:400},{name:'Автомат',icon:'🔫',ammo:300,damage:15,rate:100,range:350}]};
const vehicleTypes=[
 {name:'Седан',w:50,h:26,maxSpeed:7,accel:.15,color:'#c33',handling:.04},
 {name:'Спорткар',w:48,h:24,maxSpeed:10,accel:.25,color:'#fc0',handling:.05},
 {name:'Грузовик',w:65,h:30,maxSpeed:5,accel:.08,color:'#48a',handling:.025},
 {name:'Такси',w:50,h:26,maxSpeed:7,accel:.15,color:'#fd0',handling:.04},
 {name:'Полиция',w:52,h:26,maxSpeed:5,accel:.06,color:'#222',handling:.035},
 {name:'Маслкар',w:52,h:27,maxSpeed:9,accel:.2,color:'#a33',handling:.035},
 {name:'Фургон',w:58,h:28,maxSpeed:5.5,accel:.1,color:'#eee',handling:.03}];
const vehicles=[],trafficVehicles=[],policeVehicles=[],npcs=[],bullets=[],particles=[],pickups=[],explosions=[];
function generateMap(){buildings.length=0;parks.length=0;waterBodies.length=0;bloodDecals.length=0;
const cols=['#8B7355','#A0522D','#6B6B6B','#778899','#556B2F','#8B4513','#696969','#4682B4','#B8860B','#708090','#CD853F','#5F6B7A'];
for(let bx=0;bx<MAP_BLOCKS;bx++)for(let by=0;by<MAP_BLOCKS;by++){const bX=bx*BLOCK*TILE+ROAD_W*TILE,bY=by*BLOCK*TILE+ROAD_W*TILE,bW=(BLOCK-ROAD_W)*TILE,bH=(BLOCK-ROAD_W)*TILE;
if(Math.random()<.12){parks.push({x:bX,y:bY,w:bW,h:bH});continue;}
if(Math.random()<.04){waterBodies.push({x:bX,y:bY,w:bW,h:bH});continue;}
const c=randInt(1,3),r=randInt(1,3),gap=8,bw=(bW-gap*(c+1))/c,bh=(bH-gap*(r+1))/r;
for(let i=0;i<c;i++)for(let j=0;j<r;j++){if(Math.random()<.1)continue;buildings.push({x:bX+gap+i*(bw+gap),y:bY+gap+j*(bh+gap),w:bw*rand(.7,1),h:bh*rand(.7,1),color:cols[randInt(0,cols.length-1)],roofColor:`hsl(${randInt(0,360)},20%,${randInt(25,45)}%)`});}}}
window.clearBlock=function(bi,bj){const x0=bi*BLOCK*TILE,x1=x0+BLOCK*TILE,y0=bj*BLOCK*TILE,y1=y0+BLOCK*TILE;
 for(let i=buildings.length-1;i>=0;i--){const b=buildings[i],cx=b.x+b.w/2,cy=b.y+b.h/2;if(cx>=x0&&cx<x1&&cy>=y0&&cy<y1)buildings.splice(i,1);}
 for(let i=parks.length-1;i>=0;i--){const p=parks[i],cx=p.x+p.w/2,cy=p.y+p.h/2;if(cx>=x0&&cx<x1&&cy>=y0&&cy<y1)parks.splice(i,1);}
 for(let i=waterBodies.length-1;i>=0;i--){const w=waterBodies[i];if(!w._river&&!w._proliv){const cx=w.x+w.w/2,cy=w.y+w.h/2;if(cx>=x0&&cx<x1&&cy>=y0&&cy<y1)waterBodies.splice(i,1);}}};
function collidesBuilding(x,y,r){for(const b of buildings){const cx=clamp(x,b.x,b.x+b.w),cy=clamp(y,b.y,b.y+b.h);if(Math.hypot(x-cx,y-cy)<r)return b;}return null;}
function pushOut(x,y,r){let gx=x,gy=y;for(let i=0;i<8;i++){const b=collidesBuilding(gx,gy,r);if(!b)break;const cx=clamp(gx,b.x,b.x+b.w),cy=clamp(gy,b.y,b.y+b.h);let dx=gx-cx,dy=gy-cy;const d=Math.hypot(dx,dy)||.01;gx+=dx/d*(r-d+1);gy+=dy/d*(r-d+1);}return{x:clamp(gx,0,WORLD_W),y:clamp(gy,0,WORLD_H)};}
function onBridge(x,y){const br=window.bridges||[];for(const b of br)if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)return true;return false;}
function isInWater(x,y){if(onBridge(x,y))return false;for(const w of waterBodies){if(x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h)return true;}return false;}
function moveSlide(x,y,nx,ny,r,solidWater){
 if(!collidesBuilding(nx,ny,r)&&!(solidWater&&isInWater(nx,ny)))return{x:nx,y:ny,hit:false};
 if(!collidesBuilding(nx,y,r)&&!(solidWater&&isInWater(nx,y)))return{x:nx,y:y,hit:false};
 if(!collidesBuilding(x,ny,r)&&!(solidWater&&isInWater(x,ny)))return{x:x,y:ny,hit:false};
 return{x,y,hit:true};
}
function spawnWorld(){vehicles.length=0;trafficVehicles.length=0;npcs.length=0;pickups.length=0;
for(let i=0;i<90;i++){const t=vehicleTypes[randInt(0,6)],ri=randInt(0,MAP_BLOCKS),al=rand(0,WORLD_W);let x,y,a;if(Math.random()<.5){x=ri*BLOCK*TILE+TILE;y=al;a=Math.PI/2;}else{x=al;y=ri*BLOCK*TILE+TILE;a=0;}vehicles.push({...t,x,y,angle:a,speed:0,health:100,occupied:false,nitro:100});}
for(let i=0;i<50;i++){const t=vehicleTypes[randInt(0,3)],ri=randInt(0,MAP_BLOCKS),al=rand(0,WORLD_W);let x,y,a,horiz=Math.random()<.5;if(horiz){x=al;y=ri*BLOCK*TILE+ROAD_W*TILE/2;a=Math.random()<.5?0:Math.PI;}else{x=ri*BLOCK*TILE+ROAD_W*TILE/2;y=al;a=Math.random()<.5?Math.PI/2:-Math.PI/2;}trafficVehicles.push({...t,x,y,angle:a,speed:rand(1.5,3),health:100,turnTimer:rand(40,120)});}
const nc=['#e88','#8e8','#88e','#ee8','#e8e','#8ee','#fa8','#a8f','#8ff','#f8a'],ns=['#c44','#4c4','#44c','#cc4','#c4c','#4cc','#fff','#888','#f80','#08f','#a64','#64a'];
for(let i=0;i<120;i++){const ri=randInt(0,MAP_BLOCKS),al=rand(0,WORLD_W);let x,y;if(Math.random()<.5){x=ri*BLOCK*TILE+TILE*2.5;y=al;}else{x=al;y=ri*BLOCK*TILE+TILE*2.5;}
  let home=buildings[0],hd=1e9;for(const b of buildings){const d=dist({x,y},{x:b.x+b.w/2,y:b.y+b.h/2});if(d<hd){hd=d;home=b;}}
  npcs.push({x,y,angle:rand(0,6.28),speed:rand(.5,1.5),health:100,alive:true,color:nc[randInt(0,nc.length-1)],shirt:ns[randInt(0,ns.length-1)],turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:home.x+home.w/2,homeY:home.y+home.h/2,atHome:false,bound:false});}
for(let i=0;i<35;i++){const ri=randInt(0,MAP_BLOCKS),al=rand(0,WORLD_W);let x,y;if(Math.random()<.5){x=ri*BLOCK*TILE+TILE*2;y=al;}else{x=al;y=ri*BLOCK*TILE+TILE*2;}pickups.push({x,y,type:['health','armor','money','ammo'][randInt(0,3)],active:true,respawnTimer:0});}}
function startGame(){generateMap();spawnWorld();
player.x=8*BLOCK*TILE+2*TILE;player.y=8*BLOCK*TILE+2*TILE;player.health=100;player.armor=0;player.money=500;player.wanted=0;player.inVehicle=null;player.alive=true;player.busted=false;player.swimming=false;
policeVehicles.length=0;bullets.length=0;particles.length=0;explosions.length=0;kills=0;gameTime=6*60*60;arrestTimer=0;window._respawnType=null;
camera.x=player.x-canvas.width/2;camera.y=player.y-canvas.height/2;
if(window.onWorldReady)window.onWorldReady();
showMessage('GTA 2D',2000);setTimeout(()=>showMission('Подойди к жёлтому маркеру «V»!',4000),2200);
if(window.initMission1Marker)window.initMission1Marker();}
let msgT=null,misT=null;
function showMessage(t,d){const el=document.getElementById('message');el.textContent=t;el.style.color='#fff';el.style.fontSize='36px';el.style.opacity=1;clearTimeout(msgT);msgT=setTimeout(()=>el.style.opacity=0,d||2000);}
function showMission(t,d){const el=document.getElementById('mission-text');el.textContent=t;el.style.opacity=1;clearTimeout(misT);misT=setTimeout(()=>el.style.opacity=0,d||3000);}
function addBlood(x,y){bloodDecals.push({x:x+rand(-6,6),y:y+rand(-6,6),r:rand(8,16)});if(bloodDecals.length>250)bloodDecals.shift();}
function damagePlayer(a){if(player.armor>0){const ab=Math.min(player.armor,a*.6);player.armor-=ab;a-=ab;}player.health-=a;if(player.health<=0){player.health=0;player.alive=false;player.respawnTimer=150;player.busted=false;
  const cost=Math.min(50,player.money);player.money-=cost;window._deathCost=cost;window._respawnType='death';
  showMessage('WASTED',2500);playSFX('wasted');}}
function doBusted(){player.alive=false;player.busted=true;player.respawnTimer=150;player.inVehicle=null;
  const cost=Math.min(100,player.money);player.money-=cost;window._bustCost=cost;player.wanted=0;policeVehicles.length=0;window._respawnType='bust';
  showMessage('BUSTED',2500);playSFX('busted');arrestTimer=0;arrestCop=null;}
function addWanted(a){player.wanted=clamp(player.wanted+a,0,5);player.wantedTimer=600+player.wanted*200;}
function spawnParticles(x,y,color,n,sp){for(let i=0;i<n;i++){const a=rand(0,6.28),s=rand(.5,sp);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(15,40),maxLife:40,color,size:rand(2,5)});}}
function createExplosion(x,y){explosions.push({x,y,radius:0,life:30});spawnParticles(x,y,'#f80',20,5);spawnParticles(x,y,'#ff0',15,4);playSFX('explosion');npcs.forEach(n=>{if(n.alive&&dist(n,{x,y})<100){n.health-=80;if(n.health<=0){n.alive=false;addBlood(n.x,n.y);}}});if(dist(player,{x,y})<100&&!player.inVehicle)damagePlayer(50);}
function shoot(x,y,angle,dmg,range,owner){bullets.push({x,y,angle,damage:dmg,range,speed:12,traveled:0,owner});}
function update(){gameTime++;dayTime=(gameTime%DAYCYCLE)/DAYCYCLE;
if(!isFinite(player.x))player.x=8*BLOCK*TILE;if(!isFinite(player.y))player.y=8*BLOCK*TILE;
const hh=dayTime*24;
if(!player.alive){player.respawnTimer--;if(player.respawnTimer<=0){player.alive=true;player.busted=false;player.health=100;player.armor=0;player.wanted=0;player.inVehicle=null;player.swimming=false;
  let rx,ry;
  if(window._respawnType==='bust'&&window.stationPos){rx=window.stationPos.x;ry=window.stationPos.y+70;const c=window._bustCost||0;showMessage('🚔 Участок. Штраф $'+c,3000);}
  else if(window._respawnType==='death'&&window.hospitalPos){rx=window.hospitalPos.x;ry=window.hospitalPos.y+70;const c=window._deathCost||0;showMessage(c>0?('🏥 Больница. Счёт $'+c):'🏥 Больница. Бесплатно.',3000);}
  else{rx=8*BLOCK*TILE+2*TILE;ry=8*BLOCK*TILE+2*TILE;}
  window._respawnType=null;window._bustCost=0;window._deathCost=0;
  const po=pushOut(rx,ry,player.radius);player.x=po.x;player.y=po.y;
  policeVehicles.length=0;showMessage('',0);
  (window.missionRestarters||[]).forEach(f=>{try{f()}catch(e){}});
  }return;}
if(keys['Digit1'])player.currentWeapon=0;if(keys['Digit2'])player.currentWeapon=1;if(keys['Digit3'])player.currentWeapon=2;if(keys['Digit4']&&player.weapons[3])player.currentWeapon=3;if(keys['Digit5']&&player.weapons[4])player.currentWeapon=4;
const weapon=player.weapons[player.currentWeapon];
if(player.inVehicle){const v=player.inVehicle;
if(keys['KeyW']||keys['ArrowUp'])v.speed=Math.min(v.speed+v.accel,v.maxSpeed);else if(keys['KeyS']||keys['ArrowDown'])v.speed=Math.max(v.speed-v.accel*1.5,-v.maxSpeed*.4);else v.speed*=.98;
if(keys['Space'])v.speed*=.92;
if(keys['ShiftLeft']&&v.nitro>0&&v.speed>v.maxSpeed*0.5){v.speed=Math.min(v.speed+0.06,v.maxSpeed*1.2);v.nitro=Math.max(0,v.nitro-0.4);spawnParticles(v.x-Math.cos(v.angle)*v.w/2,v.y-Math.sin(v.angle)*v.w/2,'#f80',1,2);}else{v.nitro=Math.min(100,v.nitro+0.15);}
if(Math.abs(v.speed)>.5){const ta=v.handling*(v.speed>0?1:-1);if(keys['KeyA']||keys['ArrowLeft'])v.angle-=ta;if(keys['KeyD']||keys['ArrowRight'])v.angle+=ta;}
const nx=v.x+Math.cos(v.angle)*v.speed,ny=v.y+Math.sin(v.angle)*v.speed;
if(isInWater(nx,ny)){createExplosion(v.x,v.y);spawnParticles(v.x,v.y,'#48f',15,4);playSFX('splash');player.inVehicle=null;v.occupied=false;const idx=vehicles.indexOf(v);if(idx>=0)vehicles.splice(idx,1);showMission('🌊 Машина утонула!',2000);damagePlayer(9999);}
else{const sl=moveSlide(v.x,v.y,nx,ny,20,false);if(sl.hit){v.speed*=-.3;v.health-=Math.abs(v.speed)*2;spawnParticles(v.x,v.y,'#fa0',3,2);}else{v.x=clamp(sl.x,0,WORLD_W);v.y=clamp(sl.y,0,WORLD_H);}}
player.x=v.x;player.y=v.y;player.angle=v.angle;player.swimming=false;
npcs.forEach(n=>{if(n.alive&&dist(n,v)<30&&Math.abs(v.speed)>2){n.health-=Math.abs(v.speed)*10;n.fleeing=true;n.fleeAngle=angleTo(v,n);spawnParticles(n.x,n.y,'#f00',5,3);if(n.health<=0){n.alive=false;addBlood(n.x,n.y);kills++;addWanted(1);player.money+=10;}}});
if(v.health<=0){createExplosion(v.x,v.y);player.inVehicle=null;v.occupied=false;damagePlayer(40);const idx=vehicles.indexOf(v);if(idx>=0)vehicles.splice(idx,1);}
if(!window.interiorOpen&&keys['KeyF']){keys['KeyF']=false;player.inVehicle=null;v.occupied=false;v.speed=0;let ex=v.x+Math.cos(v.angle+Math.PI/2)*35,ey=v.y+Math.sin(v.angle+Math.PI/2)*35;const po=pushOut(ex,ey,player.radius);player.x=po.x;player.y=po.y;playSFX('car_enter');}
document.getElementById('speed-display').style.display='block';document.getElementById('speed-display').textContent=Math.abs(Math.round(v.speed*20))+' км/ч';
} else {document.getElementById('speed-display').style.display='none';
player.swimming=isInWater(player.x,player.y);
const spd=player.swimming?1.2:(keys['ShiftLeft']?3.5:2);let dx=0,dy=0;
if(keys['KeyW']||keys['ArrowUp'])dy-=1;if(keys['KeyS']||keys['ArrowDown'])dy+=1;if(keys['KeyA']||keys['ArrowLeft'])dx-=1;if(keys['KeyD']||keys['ArrowRight'])dx+=1;
if(dx||dy){const l=Math.hypot(dx,dy);dx/=l;dy/=l;const nx=player.x+dx*spd,ny=player.y+dy*spd;if(!collidesBuilding(nx,player.y,player.radius))player.x=nx;if(!collidesBuilding(player.x,ny,player.radius))player.y=ny;player.x=clamp(player.x,0,WORLD_W);player.y=clamp(player.y,0,WORLD_H);player.animTimer++;if(player.animTimer>6){player.animTimer=0;player.animFrame=(player.animFrame+1)%4;}}
const wmx=mouseX+camera.x,wmy=mouseY+camera.y;player.angle=Math.atan2(wmy-player.y,wmx-player.x);
if(!window.interiorOpen&&keys['KeyF']){keys['KeyF']=false;let cl=null,cd=60;vehicles.forEach(v=>{const d=dist(player,v);if(d<cd&&!v.occupied){cl=v;cd=d;}});if(cl){player.inVehicle=cl;cl.occupied=true;showMission('🚗 '+cl.name,1500);playSFX('car_enter');}}
player.shootTimer=Math.max(0,player.shootTimer-16);
if(!window.interiorOpen&&!player.swimming&&mouseDown&&player.shootTimer<=0){if(player.currentWeapon===0){player.shootTimer=weapon.rate;npcs.forEach(n=>{if(n.alive&&dist(n,player)<weapon.range){n.health-=weapon.damage;n.fleeing=true;n.fleeAngle=angleTo(player,n);spawnParticles(n.x,n.y,'#f00',3,2);playSFX('hit');if(n.health<=0){n.alive=false;addBlood(n.x,n.y);kills++;addWanted(1);}}});}
else if(weapon.ammo>0){player.shootTimer=weapon.rate;weapon.ammo--;shoot(player.x+Math.cos(player.angle)*15,player.y+Math.sin(player.angle)*15,player.angle+rand(-.05,.05),weapon.damage,weapon.range,'player');spawnParticles(player.x+Math.cos(player.angle)*18,player.y+Math.sin(player.angle)*18,'#ff0',2,2);playSFX('shoot');addWanted(.1);}}
if(!window.interiorOpen&&keys['KeyE']){keys['KeyE']=false;pickups.forEach(p=>{if(p.active&&dist(p,player)<40){p.active=false;p.respawnTimer=600;playSFX('pickup');if(p.type==='health'){player.health=Math.min(100,player.health+25);showMission('+25 ❤️',1000);}if(p.type==='armor'){player.armor=Math.min(100,player.armor+25);showMission('+25 🛡️',1000);}if(p.type==='money'){player.money+=randInt(50,200);showMission('+$',1000);}if(p.type==='ammo'){player.weapons.forEach(w=>{if(w.ammo!==Infinity)w.ammo+=30;});showMission('+Патроны',1000);}}});}}
if(player.wanted>0){player.wantedTimer--;if(player.wantedTimer<=0){player.wanted=Math.max(0,player.wanted-1);player.wantedTimer=400;}}
const stars=Math.floor(player.wanted);
if(stars>=1&&gameTime%120===0&&policeVehicles.length<stars*2){const a=rand(0,6.28),d=600;policeVehicles.push({...vehicleTypes[4],x:clamp(player.x+Math.cos(a)*d,0,WORLD_W),y:clamp(player.y+Math.sin(a)*d,0,WORLD_H),angle:0,speed:0,health:150,shootTimer:0,leaving:false});}
if(stars===0)policeVehicles.forEach(p=>p.leaving=true);
policeVehicles.forEach((p,pi)=>{const d=dist(p,player);
  if(p.leaving){p.speed=Math.min(p.speed+.05,4);const sl=moveSlide(p.x,p.y,p.x+Math.cos(p.angle)*p.speed,p.y+Math.sin(p.angle)*p.speed,20,true);p.x=sl.x;p.y=sl.y;if(d>1600||p.x<0||p.x>WORLD_W||p.y<0||p.y>WORLD_H){policeVehicles.splice(pi,1);}return;}
  const ta=angleTo(p,player);let ad=ta-p.angle;while(ad>Math.PI)ad-=6.28;while(ad<-Math.PI)ad+=6.28;p.angle+=clamp(ad,-.03,.03);const mps=2.5+stars*.4;if(d>120)p.speed=Math.min(p.speed+.04,mps);else if(d>50)p.speed=Math.min(p.speed+.02,mps*.6);else p.speed*=.93;p.speed*=.99;
  const nx=p.x+Math.cos(p.angle)*p.speed,ny=p.y+Math.sin(p.angle)*p.speed;
  const sl=moveSlide(p.x,p.y,nx,ny,20,true);if(sl.hit){p.speed*=.4;p.angle+=0.05;}else{p.x=clamp(sl.x,0,WORLD_W);p.y=clamp(sl.y,0,WORLD_H);}
  if(d<250&&stars>=2){p.shootTimer=(p.shootTimer||0)-1;if(p.shootTimer<=0){p.shootTimer=50-stars*4;shoot(p.x,p.y,angleTo(p,player)+rand(-.15,.15),6,250,'police');}}
  if(player.inVehicle&&d<35){player.inVehicle.health-=.3;p.health-=.2;p.speed*=.5;}
  if(p.health<=0){createExplosion(p.x,p.y);policeVehicles.splice(pi,1);player.money+=50;}});
if(policeVehicles.some(p=>!p.leaving)&&gameTime%60===0)playSFX('siren');
if(stars>=1&&!window.interiorOpen){
  const moving=keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD'];
  const stopped=player.inVehicle?Math.abs(player.inVehicle.speed)<0.3:!moving;
  let nearCop=null,nd=player.inVehicle?70:40;
  policeVehicles.forEach(p=>{if(!p.leaving){const dd=dist(p,player);if(dd<nd){nd=dd;nearCop=p;}}});
  if(nearCop&&stopped&&!mouseDown){arrestTimer++;arrestCop=nearCop;if(arrestTimer>90)doBusted();}
  else{arrestTimer=Math.max(0,arrestTimer-2);if(arrestTimer===0)arrestCop=null;}
}else{arrestTimer=0;arrestCop=null;}
trafficVehicles.forEach(t=>{const BS=BLOCK*TILE,RC=ROAD_W*TILE/2;const nrc=v=>Math.round((v-RC)/BS)*BS+RC;const horiz=Math.abs(Math.cos(t.angle))>.5;
if(horiz)t.y+=(nrc(t.y)-t.y)*.15;else t.x+=(nrc(t.x)-t.x)*.15;
const cx=nrc(t.x),cy=nrc(t.y),atCross=Math.abs(t.x-cx)<14&&Math.abs(t.y-cy)<14;
t.turnTimer--;if(atCross&&t.turnTimer<=0){t.turnTimer=rand(40,120);if(Math.random()<.4){const dirs=[0,Math.PI/2,Math.PI,-Math.PI/2];const opts=dirs.filter(a=>Math.abs(Math.cos(a-t.angle))<.5);t.angle=opts[randInt(0,opts.length-1)];}}
const nx=t.x+Math.cos(t.angle)*t.speed,ny=t.y+Math.sin(t.angle)*t.speed;
const sl=moveSlide(t.x,t.y,nx,ny,20,true);if(sl.hit){t.angle+=Math.PI*.5;t.x+=Math.cos(t.angle)*8;t.y+=Math.sin(t.angle)*8;}else{t.x=sl.x;t.y=sl.y;}
if(t.x<0)t.x=WORLD_W;if(t.x>WORLD_W)t.x=0;if(t.y<0)t.y=WORLD_H;if(t.y>WORLD_H)t.y=0;});
npcs.forEach(n=>{if(!n.alive)return;
  if(n.bound){n.turnTimer--;if(n.turnTimer<=0){n.turnTimer=rand(60,200);n.angle=rand(0,6.28);}const nx=n.x+Math.cos(n.angle)*.5,ny=n.y+Math.sin(n.angle)*.5;if(!collidesBuilding(nx,ny,8)){n.x=nx;n.y=ny;}if(dist(n,{x:n.homeX,y:n.homeY})>70)n.angle=angleTo(n,{x:n.homeX,y:n.homeY});n.x=clamp(n.x,0,WORLD_W);n.y=clamp(n.y,0,WORLD_H);n.animTimer++;if(n.animTimer>10){n.animTimer=0;n.animFrame=(n.animFrame+1)%4;}return;}
  const isNight=hh>=22||hh<5,isDawn=hh>=5&&hh<7;
  if(n.atHome){if(isDawn)n.atHome=false;else return;}
  if(isNight&&!n.atHome){const a=angleTo(n,{x:n.homeX,y:n.homeY});n.angle=a;const nx=n.x+Math.cos(a)*1.6,ny=n.y+Math.sin(a)*1.6;if(!collidesBuilding(nx,ny,8)&&!isInWater(nx,ny)){n.x=nx;n.y=ny;}if(dist(n,{x:n.homeX,y:n.homeY})<25)n.atHome=true;n.animTimer++;if(n.animTimer>8){n.animTimer=0;n.animFrame=(n.animFrame+1)%4;}return;}
  if(n.fleeing){n.x+=Math.cos(n.fleeAngle)*3;n.y+=Math.sin(n.fleeAngle)*3;n.turnTimer--;if(n.turnTimer<=0){n.fleeing=false;n.turnTimer=rand(60,200);}}else{n.turnTimer--;if(n.turnTimer<=0){n.turnTimer=rand(60,200);n.angle=rand(0,6.28);n.speed=rand(.5,1.5);}const nx=n.x+Math.cos(n.angle)*n.speed,ny=n.y+Math.sin(n.angle)*n.speed;if(!isInWater(nx,ny)&&!collidesBuilding(nx,ny,8)){n.x=nx;n.y=ny;}else n.angle+=Math.PI;}
  if(stars>=1&&dist(n,player)<200){n.fleeing=true;n.fleeAngle=angleTo(player,n);n.turnTimer=60;}
  n.x=clamp(n.x,0,WORLD_W);n.y=clamp(n.y,0,WORLD_H);n.animTimer++;if(n.animTimer>10){n.animTimer=0;n.animFrame=(n.animFrame+1)%4;}});
for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.x+=Math.cos(b.angle)*b.speed;b.y+=Math.sin(b.angle)*b.speed;b.traveled+=b.speed;if(b.traveled>b.range){bullets.splice(i,1);continue;}if(collidesBuilding(b.x,b.y,2)){spawnParticles(b.x,b.y,'#ff0',3,2);bullets.splice(i,1);continue;}if(b.owner==='player'){for(const n of npcs){if(n.alive&&dist(b,n)<12){n.health-=b.damage;n.fleeing=true;n.fleeAngle=angleTo(player,n);spawnParticles(n.x,n.y,'#f00',4,2);playSFX('hit');if(n.health<=0){n.alive=false;addBlood(n.x,n.y);kills++;addWanted(1);player.money+=randInt(5,20);}bullets.splice(i,1);break;}}for(let pi=policeVehicles.length-1;pi>=0;pi--){const p=policeVehicles[pi];if(dist(b,p)<25){p.health-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);if(p.health<=0){createExplosion(p.x,p.y);policeVehicles.splice(pi,1);player.money+=50;}bullets.splice(i,1);break;}}}if(b.owner==='police'&&dist(b,player)<(player.inVehicle?25:12)){damagePlayer(b.damage);spawnParticles(b.x,b.y,'#f00',3,2);bullets.splice(i,1);}}
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.95;p.vy*=.95;p.life--;if(p.life<=0)particles.splice(i,1);}
for(let i=explosions.length-1;i>=0;i--){explosions[i].radius+=4;explosions[i].life--;if(explosions[i].life<=0)explosions.splice(i,1);}
pickups.forEach(p=>{if(!p.active){p.respawnTimer--;if(p.respawnTimer<=0)p.active=true;}});
camera.x=player.x-canvas.width/2;camera.y=player.y-canvas.height/2;if(!isFinite(camera.x))camera.x=0;if(!isFinite(camera.y))camera.y=0;}
// ====== engine2.js КОНЕЦ ======
