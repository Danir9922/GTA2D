// ====== engine3.js НАЧАЛО ======
function clockText(d){const h=d*24,hh=Math.floor(h),mm=Math.floor((h-hh)*60);return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');}
function phaseText(d){const h=d*24;if(h>=5&&h<7)return '🌅 Восход';if(h>=7&&h<12)return '☀️ Утро';if(h>=12&&h<17)return '🌞 День';if(h>=17&&h<19)return '🌇 Закат';return '🌙 Ночь';}
function render(){const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
const nightAlpha=window.skyAlpha?window.skyAlpha(dayTime):Math.max(0,Math.sin(dayTime*6.28-1.57))*.4;
const skyRGB=window.skyRGB?window.skyRGB(dayTime):'10,10,40';
ctx.save();ctx.translate(-camera.x,-camera.y);
ctx.fillStyle='#3a5a3a';ctx.fillRect(0,0,WORLD_W,WORLD_H);
ctx.fillStyle='#444';for(let i=0;i<=MAP_BLOCKS;i++){const p=i*BLOCK*TILE;ctx.fillRect(p,0,ROAD_W*TILE,WORLD_H);ctx.fillRect(0,p,WORLD_W,ROAD_W*TILE);}
ctx.strokeStyle='#aa0';ctx.lineWidth=2;ctx.setLineDash([20,20]);for(let i=0;i<=MAP_BLOCKS;i++){const p=i*BLOCK*TILE+ROAD_W*TILE/2;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,WORLD_H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(WORLD_W,p);ctx.stroke();}ctx.setLineDash([]);
ctx.fillStyle='#666';for(let i=0;i<=MAP_BLOCKS;i++){const p=i*BLOCK*TILE;ctx.fillRect(p+ROAD_W*TILE,0,6,WORLD_H);ctx.fillRect(p-6,0,6,WORLD_H);ctx.fillRect(0,p+ROAD_W*TILE,WORLD_W,6);ctx.fillRect(0,p-6,WORLD_W,6);}
parks.forEach(p=>{ctx.fillStyle='#2d6b2d';ctx.fillRect(p.x,p.y,p.w,p.h);});
waterBodies.forEach(w=>{ctx.fillStyle=w._river?'#1d5e96':'#2266aa';ctx.fillRect(w.x,w.y,w.w,w.h);ctx.fillStyle='rgba(120,190,255,.22)';for(let k=0;k<3;k++)ctx.fillRect(w.x+10+k*30,w.y+w.h/2+Math.sin(gameTime*.03+k)*6,Math.max(8,w.w-40),2);});
bloodDecals.forEach(b=>{ctx.fillStyle='rgba(120,0,0,.55)';ctx.beginPath();ctx.ellipse(b.x,b.y,b.r,b.r*.6,0,0,6.28);ctx.fill();});
if(window.renderGroundExtras)window.renderGroundExtras(ctx);
buildings.forEach(b=>{ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(b.x+5,b.y+5,b.w,b.h);ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle=b.roofColor;ctx.fillRect(b.x+3,b.y+3,b.w-6,b.h-6);ctx.fillStyle=nightAlpha>.15?'rgba(255,255,150,.75)':'rgba(180,220,255,.5)';for(let wx=b.x+8;wx<b.x+b.w-8;wx+=12)for(let wy=b.y+8;wy<b.y+b.h-8;wy+=12)if(Math.sin(wx*wy)>.2)ctx.fillRect(wx,wy,5,5);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.strokeRect(b.x,b.y,b.w,b.h);});
pickups.forEach(p=>{if(!p.active)return;const bob=Math.sin(gameTime*.05+p.x)*3;ctx.font='18px Arial';ctx.textAlign='center';ctx.fillText({health:'❤️',armor:'🛡️',money:'💰',ammo:'📦'}[p.type],p.x,p.y+bob);});
vehicles.forEach(drawVehicle);trafficVehicles.forEach(drawVehicle);
policeVehicles.forEach(v=>{drawVehicle(v);if(!v.leaving){ctx.fillStyle=gameTime%20<10?'#f00':'#00f';ctx.beginPath();ctx.arc(v.x,v.y-5,4,0,6.28);ctx.fill();}});
npcs.forEach(n=>{if(!n.alive||n.atHome)return;ctx.save();ctx.translate(n.x,n.y);ctx.rotate(n.angle);ctx.fillStyle=n.shirt;ctx.fillRect(-5,-4,10,8);ctx.fillStyle=n.color;ctx.beginPath();ctx.arc(6,0,5,0,6.28);ctx.fill();const lo=Math.sin(n.animFrame*Math.PI/2)*3;ctx.fillStyle='#336';ctx.fillRect(-6,-3+lo,4,3);ctx.fillRect(-6,1-lo,4,3);ctx.restore();});
if(window.renderAnimalExtras)window.renderAnimalExtras(ctx);
if(player.alive&&!player.inVehicle){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.fillStyle=player.shirtColor;ctx.fillRect(-6,-5,12,10);ctx.fillStyle=player.skinColor;ctx.beginPath();ctx.arc(7,0,6,0,6.28);ctx.fill();ctx.fillStyle=player.hairColor;ctx.beginPath();ctx.arc(7,0,6,-2.2,2.2);ctx.fill();if(player.currentWeapon>0&&!player.swimming){ctx.fillStyle='#333';ctx.fillRect(10,-2,12,3);}const lo=Math.sin(player.animFrame*Math.PI/2)*4;ctx.fillStyle='#335';ctx.fillRect(-7,-4+lo,5,3);ctx.fillRect(-7,2-lo,5,3);ctx.restore();
  if(player.swimming){ctx.strokeStyle='rgba(120,200,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y,16+Math.sin(gameTime*.2)*3,0,6.28);ctx.stroke();}
  ctx.fillStyle='#0f0';ctx.beginPath();ctx.moveTo(player.x,player.y-22);ctx.lineTo(player.x-5,player.y-30);ctx.lineTo(player.x+5,player.y-30);ctx.fill();}
if(arrestCop&&arrestTimer>0){const t=clamp(arrestTimer/90,0,1);const cx=lerp2(arrestCop.x,player.x,t),cy=lerp2(arrestCop.y,player.y,t);ctx.font='22px Arial';ctx.textAlign='center';ctx.fillText('👮',cx,cy+6);ctx.fillStyle='#f44';ctx.font='bold 14px Arial';ctx.fillText('СТОЯТЬ! АРЕСТ...',cx,cy-22);}
bullets.forEach(b=>{ctx.fillStyle=b.owner==='police'?'#f44':'#ff0';ctx.beginPath();ctx.arc(b.x,b.y,3,0,6.28);ctx.fill();});
particles.forEach(p=>{ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);});ctx.globalAlpha=1;
explosions.forEach(e=>{const a=e.life/30;ctx.beginPath();ctx.arc(e.x,e.y,e.radius,0,6.28);ctx.fillStyle=`rgba(255,150,0,${a*.5})`;ctx.fill();});
ctx.restore();
if(nightAlpha>0){ctx.fillStyle=`rgba(${skyRGB},${nightAlpha})`;ctx.fillRect(0,0,W,H);}
const br=settings.brightness||1;if(br<1){ctx.fillStyle=`rgba(0,0,0,${(1-br)*0.6})`;ctx.fillRect(0,0,W,H);}else if(br>1){ctx.fillStyle=`rgba(255,255,255,${(br-1)*0.35})`;ctx.fillRect(0,0,W,H);}
document.getElementById('clock').textContent=clockText(dayTime)+'  '+phaseText(dayTime);
const _cs=window.cutsceneSystem&&window.cutsceneSystem.active;
document.getElementById('minimap-container').style.display=_cs?'none':'block';
document.getElementById('controls-hint').style.display=_cs?'none':'block';
document.getElementById('clock').style.display=_cs?'none':'block';
if(!_cs){updateHUD();renderMinimap();}
if(showFullMap&&!_cs)renderFullMap();
if(settings.showFPS&&!_cs){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(8,H-232,96,24);ctx.fillStyle='#0f0';ctx.font='bold 14px monospace';ctx.textAlign='left';ctx.fillText('FPS '+_fps,16,H-215);}}
function lerp2(a,b,t){return a+(b-a)*t;}
function drawVehicle(v){ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.angle);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-v.w/2+3,-v.h/2+3,v.w,v.h);ctx.fillStyle=v.color;ctx.fillRect(-v.w/2,-v.h/2,v.w,v.h);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(-v.w/4,-v.h/3,v.w/2,v.h*.66);ctx.fillStyle='rgba(150,200,255,.5)';ctx.fillRect(v.w/4,-v.h/3,v.w/5,v.h*.66);ctx.fillStyle='#ff8';ctx.fillRect(v.w/2-3,-v.h/2+2,3,4);ctx.fillRect(v.w/2-3,v.h/2-6,3,4);ctx.fillStyle='#f00';ctx.fillRect(-v.w/2,-v.h/2+2,3,4);ctx.fillRect(-v.w/2,v.h/2-6,3,4);ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.strokeRect(-v.w/2,-v.h/2,v.w,v.h);ctx.restore();if(v.health<100){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(v.x-15,v.y-v.h/2-10,30,4);ctx.fillStyle=v.health>50?'#0f0':v.health>25?'#ff0':'#f00';ctx.fillRect(v.x-15,v.y-v.h/2-10,30*(v.health/100),4);}}
function updateHUD(){let s='';const st=Math.floor(player.wanted);for(let i=0;i<5;i++)s+=i<st?'⭐':'☆';document.getElementById('wanted').textContent=s;document.getElementById('money').textContent='$'+player.money;document.getElementById('health-bar').style.width=player.health+'%';document.getElementById('armor-bar').style.width=player.armor+'%';const w=player.weapons[player.currentWeapon];document.getElementById('weapon-info').textContent=`${w.icon} ${w.name} | ${w.ammo===Infinity?'∞':w.ammo}`;const info=document.getElementById('info-panel');if(player.inVehicle)info.innerHTML=`🚗 ${player.inVehicle.name}<br>❤️ ${Math.round(player.inVehicle.health)}%<br>🔥 ${Math.round(player.inVehicle.nitro)}%`;else info.innerHTML=`🚶 ${player.swimming?'Плывёт':'Пешком'}<br>Убийств: ${kills}`;}
function renderMinimap(){miniCtx.fillStyle='#1a2a1a';miniCtx.fillRect(0,0,180,180);const s=180/WORLD_W;miniCtx.fillStyle='#555';for(let i=0;i<=MAP_BLOCKS;i++){const p=i*BLOCK*TILE*s;miniCtx.fillRect(p,0,ROAD_W*TILE*s,180);miniCtx.fillRect(0,p,180,ROAD_W*TILE*s);}miniCtx.fillStyle='#777';buildings.forEach(b=>miniCtx.fillRect(b.x*s,b.y*s,Math.max(1,b.w*s),Math.max(1,b.h*s)));miniCtx.fillStyle='#2a5a2a';parks.forEach(p=>miniCtx.fillRect(p.x*s,p.y*s,p.w*s,p.h*s));miniCtx.fillStyle='#1d5e96';waterBodies.forEach(w=>miniCtx.fillRect(w.x*s,w.y*s,Math.max(1,w.w*s),Math.max(1,w.h*s)));(window.bridges||[]).forEach(b=>{miniCtx.fillStyle='#8a6a3a';miniCtx.fillRect(b.x*s,b.y*s,Math.max(2,b.w*s),Math.max(2,b.h*s));});miniCtx.fillStyle='#88f';vehicles.forEach(v=>miniCtx.fillRect(v.x*s-1,v.y*s-1,2,2));miniCtx.fillStyle='#f00';policeVehicles.forEach(v=>{if(!v.leaving)miniCtx.fillRect(v.x*s-2,v.y*s-2,4,4);});if(window.missionMarker&&window.missionMarker.active){miniCtx.fillStyle='#ff0';miniCtx.beginPath();miniCtx.arc(window.missionMarker.x*s,window.missionMarker.y*s,4,0,6.28);miniCtx.fill();}miniCtx.fillStyle='#0f0';miniCtx.beginPath();miniCtx.arc(player.x*s,player.y*s,3,0,6.28);miniCtx.fill();miniCtx.strokeStyle='rgba(255,255,255,.4)';miniCtx.lineWidth=1;miniCtx.strokeRect(camera.x*s,camera.y*s,canvas.width*s,canvas.height*s);if(window.drawMiniLabels)window.drawMiniLabels(miniCtx,s);}
function renderFullMap(){const W=canvas.width,H=canvas.height;ctx.fillStyle='rgba(0,0,0,.9)';ctx.fillRect(0,0,W,H);
const base=(Math.min(W,H)-120)/WORLD_W,s=base*mapState.zoom;
ctx.save();ctx.translate(W/2+mapState.panX,H/2+mapState.panY);ctx.rotate(mapState.rot);
const SX=wx=>(wx-player.x)*s,SY=wy=>(wy-player.y)*s;
ctx.fillStyle='#1a2a1a';ctx.fillRect(SX(0),SY(0),WORLD_W*s,WORLD_H*s);
ctx.fillStyle='#555';for(let i=0;i<=MAP_BLOCKS;i++){const p=i*BLOCK*TILE;ctx.fillRect(SX(p),SY(0),ROAD_W*TILE*s,WORLD_H*s);ctx.fillRect(SX(0),SY(p),WORLD_W*s,ROAD_W*TILE*s);}
ctx.fillStyle='#777';buildings.forEach(b=>ctx.fillRect(SX(b.x),SY(b.y),Math.max(2,b.w*s),Math.max(2,b.h*s)));
ctx.fillStyle='#2a5a2a';parks.forEach(p=>ctx.fillRect(SX(p.x),SY(p.y),p.w*s,p.h*s));
ctx.fillStyle='#1d5e96';waterBodies.forEach(w=>ctx.fillRect(SX(w.x),SY(w.y),Math.max(2,w.w*s),Math.max(2,w.h*s)));
(window.bridges||[]).forEach(b=>{ctx.fillStyle='#8a6a3a';ctx.fillRect(SX(b.x),SY(b.y),b.w*s,b.h*s);});
ctx.fillStyle='#88f';vehicles.forEach(v=>ctx.fillRect(SX(v.x)-2,SY(v.y)-2,4,4));
ctx.fillStyle='#f00';policeVehicles.forEach(v=>{if(!v.leaving)ctx.fillRect(SX(v.x)-3,SY(v.y)-3,6,6);});
if(window.missionMarker&&window.missionMarker.active){ctx.fillStyle='#ff0';ctx.beginPath();ctx.arc(SX(window.missionMarker.x),SY(window.missionMarker.y),10,0,6.28);ctx.fill();}
ctx.fillStyle='#0f0';ctx.beginPath();ctx.arc(SX(player.x),SY(player.y),7,0,6.28);ctx.fill();
if(window.drawMapLabels)window.drawMapLabels(ctx,SX,SY);
ctx.restore();
ctx.fillStyle='#fff';ctx.font='bold 24px Arial';ctx.textAlign='center';ctx.fillText('🗺️ КАРТА ГОРОДА',W/2,40);
ctx.fillStyle='#999';ctx.font='13px Arial';ctx.fillText('ЛКМ‑двигать · ПКМ: ←→ поворот, ↑↓ зум · колесо‑зум · R‑сброс · M‑закрыть',W/2,H-25);
ctx.fillText('зум x'+mapState.zoom.toFixed(1)+'  поворот '+Math.round(mapState.rot*57.3)+'°',W/2,H-45);}
addEventListener('keydown',e=>{
 if(exitConfirmOpen){
  if(e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='Tab'){exitSel=exitSel?0:1;paintExitBtns();}
  else if(e.code==='Enter'||e.code==='Space'){exitPick();}
  else if(e.code==='Escape'){hideExit();}
  e.preventDefault();return;
 }
 unlockAudio();
 if(window.cutsceneSystem&&window.cutsceneSystem.active){if(e.code==='Enter'||e.code==='Space'){window.cutsceneSystem.advance();e.preventDefault();return;}if(e.code==='Escape'){window.cutsceneSystem.skip();e.preventDefault();return;}e.preventDefault();return;}
 if(lobbyActive){lobbyKey(e.code);e.preventDefault();return;}
 if(e.code==='F3'){settings.showFPS=!settings.showFPS;e.preventDefault();return;}
 keys[e.code]=true;
 if(e.code==='Escape'&&gameStarted){lobbyActive=true;lobbyMenu='pause';lobbySel=0;}
 if(e.code==='KeyM'&&gameStarted){showFullMap=!showFullMap;if(showFullMap){mapState.zoom=1;mapState.rot=0;mapState.panX=0;mapState.panY=0;}}
 if(e.code==='KeyR'&&showFullMap){mapState.zoom=1;mapState.rot=0;mapState.panX=0;mapState.panY=0;}
 e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('click',unlockAudio);
addEventListener('mousedown',e=>{if(!showFullMap)return;if(e.button===0){mapState.leftDown=true;mapState.lx=e.clientX;mapState.ly=e.clientY;}if(e.button===2){mapState.rightDown=true;mapState.lx=e.clientX;mapState.ly=e.clientY;}});
addEventListener('mouseup',e=>{if(e.button===0)mapState.leftDown=false;if(e.button===2)mapState.rightDown=false;});
addEventListener('mousemove',e=>{if(!showFullMap)return;if(mapState.leftDown){mapState.panX+=e.clientX-mapState.lx;mapState.panY+=e.clientY-mapState.ly;mapState.lx=e.clientX;mapState.ly=e.clientY;}if(mapState.rightDown){mapState.rot+=(e.clientX-mapState.lx)*0.004;mapState.zoom=clamp(mapState.zoom-(e.clientY-mapState.ly)*0.008,0.5,5);mapState.lx=e.clientX;mapState.ly=e.clientY;}});
addEventListener('wheel',e=>{if(!showFullMap)return;mapState.zoom=clamp(mapState.zoom*(e.deltaY<0?1.1:0.9),0.5,5);e.preventDefault();},{passive:false});
let _fpsT=performance.now(),_fpsC=0,_fps=60;
function gameLoop(t){
  _fpsC++;if(t-_fpsT>=500){_fps=Math.round(_fpsC*1000/(t-_fpsT));_fpsC=0;_fpsT=t;}
  const lim=settings.vsync?(settings.fpsLimit||60):9999;
  if((t-(gameLoop._last||0))<1000/lim-1){requestAnimationFrame(gameLoop);return;}
  gameLoop._last=t;
  try{
    if(lobbyActive){renderLobby();}
    else if(gameStarted){if(!(window.cutsceneSystem&&window.cutsceneSystem.active))update();render();if(window.updateMission)window.updateMission();if(window.renderMissionHUD)window.renderMissionHUD(ctx,canvas.width,canvas.height);}
  }catch(err){console.error('gameLoop',err);const d=document.getElementById('message');if(d){d.style.opacity=1;d.style.color='#f66';d.style.fontSize='15px';d.textContent='❌ '+err.message;}}
  requestAnimationFrame(gameLoop);}
initAudio();requestAnimationFrame(gameLoop);
// ====== engine3.js КОНЕЦ ======
