window.onerror=function(m,s,l){const d=document.getElementById('message');if(d){d.style.opacity=1;d.style.color='#f66';d.style.fontSize='15px';d.textContent='❌ ОШИБКА: '+m+' (стр.'+l+') — F12 Console';}console.error('GTA2D',m,s,l);return false;};

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const miniCanvas=document.getElementById('minimap'),miniCtx=miniCanvas.getContext('2d');
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}resize();addEventListener('resize',resize);

function rand(a,b){return Math.random()*(b-a)+a}
function randInt(a,b){return Math.floor(rand(a,b+1))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v))}
function angleTo(a,b){return Math.atan2(b.y-a.y,b.x-a.x)}

const keys={};let mouseX=0,mouseY=0,mouseDown=false;
addEventListener('mousemove',e=>{mouseX=e.clientX;mouseY=e.clientY});
addEventListener('mousedown',e=>{if(e.button===0)mouseDown=true})
addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false})
addEventListener('contextmenu',e=>{if(showFullMap)e.preventDefault();});

// ===== AUDIO =====
let audioCtx=null,musicGain=null,sfxGain=null,musicPlaying=false,musicNodes=[],musicTimeout=null;
const settings={musicVolume:.5,sfxVolume:.7,brightness:1,vsync:true,fpsLimit:60,showFPS:false};
function initAudio(){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();musicGain=audioCtx.createGain();musicGain.gain.value=settings.musicVolume;musicGain.connect(audioCtx.destination);sfxGain=audioCtx.createGain();sfxGain.gain.value=settings.sfxVolume;sfxGain.connect(audioCtx.destination);}catch(e){}}
function resumeAudio(){if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();}
function unlockAudio(){resumeAudio();if(!musicPlaying)startMusic();}
function playSFX(t){if(!audioCtx||!sfxGain)return;const now=audioCtx.currentTime;const noise=(dur,dec)=>{const b=audioCtx.createBuffer(1,audioCtx.sampleRate*dur,audioCtx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,dec);return b;};
switch(t){
case 'shoot':{const s=audioCtx.createBufferSource(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();f.type='lowpass';f.frequency.value=3000;s.buffer=noise(.08,3);g.gain.value=.4;s.connect(f);f.connect(g);g.connect(sfxGain);s.start(now);break;}
case 'explosion':{const s=audioCtx.createBufferSource(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(2000,now);f.frequency.exponentialRampToValueAtTime(100,now+.4);s.buffer=noise(.5,2);g.gain.setValueAtTime(.6,now);g.gain.exponentialRampToValueAtTime(.01,now+.5);s.connect(f);f.connect(g);g.connect(sfxGain);s.start(now);break;}
case 'hit':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(80,now+.1);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.01,now+.1);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+.12);break;}
case 'pickup':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(600,now);o.frequency.exponentialRampToValueAtTime(1200,now+.1);g.gain.setValueAtTime(.2,now);g.gain.exponentialRampToValueAtTime(.01,now+.15);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+.15);break;}
case 'click':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=800;g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.01,now+.05);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+.06);break;}
case 'select':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(400,now);o.frequency.exponentialRampToValueAtTime(900,now+.1);g.gain.setValueAtTime(.2,now);g.gain.exponentialRampToValueAtTime(.01,now+.12);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+.13);break;}
case 'siren':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(600,now);o.frequency.linearRampToValueAtTime(900,now+.3);o.frequency.linearRampToValueAtTime(600,now+.6);g.gain.setValueAtTime(.07,now);g.gain.exponentialRampToValueAtTime(.01,now+.6);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+.65);break;}
case 'wasted':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(300,now);o.frequency.exponentialRampToValueAtTime(50,now+1.5);g.gain.setValueAtTime(.25,now);g.gain.exponentialRampToValueAtTime(.01,now+1.5);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+1.6);break;}
case 'busted':{[400,300,200,120].forEach((fr,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=fr;const tt=now+i*.18;g.gain.setValueAtTime(.2,tt);g.gain.exponentialRampToValueAtTime(.01,tt+.2);o.connect(g);g.connect(sfxGain);o.start(tt);o.stop(tt+.22);});break;}
case 'car_enter':{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(450,now+.15);g.gain.setValueAtTime(.15,now);g.gain.exponentialRampToValueAtTime(.01,now+.2);o.connect(g);g.connect(sfxGain);o.start(now);o.stop(now+.22);break;}
case 'mission':{[523,659,784,1046].forEach((fr,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=fr;const tt=now+i*.12;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.2,tt+.02);g.gain.exponentialRampToValueAtTime(.01,tt+.3);o.connect(g);g.connect(sfxGain);o.start(tt);o.stop(tt+.32);});break;}
case 'buy':{[700,900,1200].forEach((fr,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=fr;const tt=now+i*.07;g.gain.setValueAtTime(.15,tt);g.gain.exponentialRampToValueAtTime(.01,tt+.12);o.connect(g);g.connect(sfxGain);o.start(tt);o.stop(tt+.13);});break;}
case 'splash':{const s=audioCtx.createBufferSource(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();f.type='bandpass';f.frequency.value=800;s.buffer=noise(.3,2);g.gain.setValueAtTime(.3,now);g.gain.exponentialRampToValueAtTime(.01,now+.3);s.connect(f);f.connect(g);g.connect(sfxGain);s.start(now);break;}
}}
function startMusic(){if(!audioCtx||musicPlaying)return;musicPlaying=true;musicLoop();}
function stopMusic(){musicPlaying=false;clearTimeout(musicTimeout);musicNodes.forEach(n=>{try{n.stop()}catch(e){}});musicNodes=[];}
function musicLoop(){if(!musicPlaying||!audioCtx)return;const now=audioCtx.currentTime,bpm=90,beat=60/bpm,bar=beat*4,bars=8,loop=bar*bars;
const bass=[55,55,65.41,65.41,73.42,73.42,49,49];
for(let b=0;b<bars;b++){const t=now+b*bar;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sawtooth';o.frequency.value=bass[b];g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.01,t+bar*.9);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+bar);musicNodes.push(o);}
const ch=[[220,277,330],[220,277,330],[262,330,392],[262,330,392],[294,370,440],[294,370,440],[196,247,294],[196,247,294]];
for(let b=0;b<bars;b++){const t=now+b*bar;ch[b].forEach(fr=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+bar);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+bar);musicNodes.push(o);});}
for(let b=0;b<bars;b++)for(let bt=0;bt<4;bt++){const t=now+b*bar+bt*beat;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.1);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+.2);musicNodes.push(o);}
for(let i=0;i<bars*8;i++){const t=now+i*beat*.5;const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*.03,audioCtx.sampleRate);const d=buf.getChannelData(0);for(let s=0;s<d.length;s++)d[s]=(Math.random()*2-1)*(1-s/d.length);const src=audioCtx.createBufferSource(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();f.type='highpass';f.frequency.value=8000;src.buffer=buf;g.gain.value=(i%2===0)?.025:.012;src.connect(f);f.connect(g);g.connect(musicGain);src.start(t);musicNodes.push(src);}
musicTimeout=setTimeout(()=>{musicNodes=[];if(musicPlaying)musicLoop();},loop*1000-100);}

// ===== LOBBY =====
let lobbyActive=true,lobbyMenu='main',lobbySel=0,lobbyAnim=0,gameStarted=false;
const lobbyStars=[],lobbyCars=[];
for(let i=0;i<80;i++)lobbyStars.push({x:Math.random(),y:Math.random(),s:Math.random()*2+.5,tw:Math.random()*6.28});
for(let i=0;i<6;i++)lobbyCars.push({x:Math.random(),y:.6+Math.random()*.3,sp:(Math.random()*.001+.0005)*(Math.random()<.5?1:-1),c:['#c33','#33c','#fc0','#3c3','#f80','#88f'][i],w:30+Math.random()*20});
function renderLobby(){const W=canvas.width,H=canvas.height;lobbyAnim+=.016;const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0a1a');g.addColorStop(.5,'#1a1a3a');g.addColorStop(1,'#0a0a0a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
lobbyStars.forEach(s=>{s.tw+=.02;ctx.fillStyle=`rgba(255,255,255,${.3+Math.sin(s.tw)*.3})`;ctx.fillRect(s.x*W,s.y*H*.5,s.s,s.s);});
ctx.fillStyle='#111';for(let i=0;i<20;i++){const bw=W/20,bh=80+Math.sin(i*1.7)*60+Math.cos(i*.8)*40;ctx.fillRect(i*bw,H*.55-bh,bw-2,bh+H*.5);ctx.fillStyle='rgba(255,200,50,.25)';for(let wy=H*.55-bh+10;wy<H*.55;wy+=15)for(let wx=i*bw+5;wx<(i+1)*bw-5;wx+=10)if(Math.sin(wx*wy*.01+lobbyAnim)>.3)ctx.fillRect(wx,wy,5,7);ctx.fillStyle='#111';}
ctx.fillStyle='#222';ctx.fillRect(0,H*.55,W,H*.45);ctx.strokeStyle='#aa0';ctx.lineWidth=2;ctx.setLineDash([30,30]);ctx.beginPath();ctx.moveTo(0,H*.72);ctx.lineTo(W,H*.72);ctx.stroke();ctx.setLineDash([]);
lobbyCars.forEach(c=>{c.x+=c.sp;if(c.x>1.1)c.x=-.1;if(c.x<-.1)c.x=1.1;const cx=c.x*W,cy=c.y*H,dir=c.sp>0?1:-1;ctx.fillStyle=c.c;ctx.fillRect(cx-c.w/2,cy-8,c.w,16);ctx.fillStyle='rgba(255,255,200,.8)';ctx.fillRect(cx+dir*c.w/2-2,cy-5,4,4);ctx.fillRect(cx+dir*c.w/2-2,cy+2,4,4);});
ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
if(lobbyMenu==='main'){ctx.fillStyle='rgba(0,0,0,.5)';ctx.font='bold 72px Arial';ctx.fillText('GTA 2D',W/2+3,H*.18+3);const tg=ctx.createLinearGradient(W/2-150,0,W/2+150,0);tg.addColorStop(0,'#f80');tg.addColorStop(.5,'#fc0');tg.addColorStop(1,'#f80');ctx.fillStyle=tg;ctx.font='bold 72px Arial';ctx.fillText('GTA 2D',W/2,H*.18);ctx.fillStyle='#aaa';ctx.font='18px Arial';ctx.fillText('OPEN WORLD EDITION',W/2,H*.18+35);
const items=['🎮  НОВАЯ ИГРА','▶️  ПРОДОЛЖИТЬ','⚙️  НАСТРОЙКИ','🚪  ВЫХОД'];items.forEach((it,i)=>{const y=H*.4+i*55,sel=i===lobbySel;if(sel){ctx.fillStyle='rgba(255,150,0,.15)';ctx.fillRect(W/2-180,y-22,360,44);ctx.strokeStyle='#f80';ctx.lineWidth=2;ctx.strokeRect(W/2-180,y-22,360,44);ctx.fillStyle='#fff';ctx.font='bold 24px Arial';}else{ctx.fillStyle='#999';ctx.font='22px Arial';}ctx.fillText(it,W/2,y+8);});ctx.fillStyle='#666';ctx.font='14px Arial';ctx.fillText('↑↓ выбор | ENTER подтвердить',W/2,H-40);}
else if(lobbyMenu==='settings'){ctx.fillStyle='#fc0';ctx.font='bold 40px Arial';ctx.fillText('⚙️ НАСТРОЙКИ',W/2,H*.12);
const items=[`🎵 Музыка: ${Math.round(settings.musicVolume*100)}%`,`🔫 Звуки: ${Math.round(settings.sfxVolume*100)}%`,`☀️ Яркость: ${Math.round(settings.brightness*100)}%`,`🖥️ VSync: ${settings.vsync?'ВКЛ':'ВЫКЛ'}`,`⚡ FPS-лимит: ${settings.vsync?settings.fpsLimit:'—'}`,`🎮 Управление`,`↩️ Назад`];
items.forEach((it,i)=>{const y=H*.22+i*44,sel=i===lobbySel;if(sel){ctx.fillStyle='rgba(255,150,0,.15)';ctx.fillRect(W/2-200,y-18,400,36);ctx.fillStyle='#fff';ctx.font='bold 20px Arial';}else{ctx.fillStyle='#999';ctx.font='18px Arial';}ctx.fillText(it,W/2,y+6);});
ctx.fillStyle='#666';ctx.font='13px Arial';ctx.fillText('←→ изменить | ENTER войти | ESC назад | F3 — FPS в игре',W/2,H-30);}
else if(lobbyMenu==='controls'){ctx.fillStyle='#fc0';ctx.font='bold 42px Arial';ctx.fillText('🎮 УПРАВЛЕНИЕ',W/2,H*.12);const c=[['WASD','Движение'],['F','Сесть/Выйти'],['SPACE','Тормоз'],['ЛКМ','Стрелять'],['1-5','Оружие'],['SHIFT','Бег/Нитро'],['E','Подобрать/Войти'],['M','Карта (ЛКМ/ПКМ/колесо)'],['F3','Показать FPS'],['ESC','Пауза']];ctx.font='18px Arial';c.forEach((x,i)=>{const y=H*.24+i*36;ctx.fillStyle='#f80';ctx.textAlign='right';ctx.fillText(x[0],W/2-20,y);ctx.fillStyle='#ccc';ctx.textAlign='left';ctx.fillText(x[1],W/2+20,y);});ctx.textAlign='center';ctx.fillStyle='#666';ctx.font='14px Arial';ctx.fillText('ESC назад',W/2,H-40);}
else if(lobbyMenu==='pause'){ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fc0';ctx.font='bold 48px Arial';ctx.fillText('ПАУЗА',W/2,H*.2);const items=['▶️ Продолжить','⚙️ Настройки','🏠 Главное меню'];items.forEach((it,i)=>{const y=H*.38+i*55,sel=i===lobbySel;if(sel){ctx.fillStyle='rgba(255,150,0,.15)';ctx.fillRect(W/2-160,y-22,320,44);ctx.fillStyle='#fff';ctx.font='bold 24px Arial';}else{ctx.fillStyle='#999';ctx.font='22px Arial';}ctx.fillText(it,W/2,y+8);});}}
function lobbyKey(code){unlockAudio();if(code==='Escape'){if(lobbyMenu==='main')return;if(lobbyMenu==='pause'){lobbyActive=false;return;}lobbyMenu='main';lobbySel=0;playSFX('click');return;}
if(code==='ArrowUp'||code==='KeyW'){lobbySel--;playSFX('click');}if(code==='ArrowDown'||code==='KeyS'){lobbySel++;playSFX('click');}
const mx={main:4,settings:7,controls:1,pause:3}[lobbyMenu]||4;if(lobbySel<0)lobbySel=mx-1;if(lobbySel>=mx)lobbySel=0;
if(code==='ArrowLeft'||code==='ArrowRight'){const d=code==='ArrowRight'?1:-1;
 if(lobbyMenu==='settings'){
  if(lobbySel===0){settings.musicVolume=clamp(settings.musicVolume+d*.1,0,1);if(musicGain)musicGain.gain.value=settings.musicVolume;}
  if(lobbySel===1){settings.sfxVolume=clamp(settings.sfxVolume+d*.1,0,1);if(sfxGain)sfxGain.gain.value=settings.sfxVolume;}
  if(lobbySel===2){settings.brightness=clamp(Math.round((settings.brightness+d*.1)*10)/10,.4,1.6);}
  if(lobbySel===3){settings.vsync=!settings.vsync;}
  if(lobbySel===4){const arr=[30,60,144];settings.fpsLimit=arr[(arr.indexOf(settings.fpsLimit)+d+3)%3];}
 }playSFX('click');}
if(code==='Enter'||code==='Space'){playSFX('select');lobbyPick();}}
function lobbyPick(){if(lobbyMenu==='main'){if(lobbySel===0){lobbyActive=false;gameStarted=true;startGame();}if(lobbySel===1){if(gameStarted)lobbyActive=false;}if(lobbySel===2){lobbyMenu='settings';lobbySel=0;}}
else if(lobbyMenu==='settings'){if(lobbySel===5){lobbyMenu='controls';lobbySel=0;}if(lobbySel===6){lobbyMenu='main';lobbySel=2;}}
else if(lobbyMenu==='controls'){lobbyMenu='settings';lobbySel=5;}
else if(lobbyMenu==='pause'){if(lobbySel===0)lobbyActive=false;if(lobbySel===1){lobbyMenu='settings';lobbySel=0;}if(lobbySel===2){lobbyActive=true;lobbyMenu='main';lobbySel=0;}}}

// ===== WORLD =====
const buildings=[],parks=[],waterBodies=[],bloodDecals=[];
const camera={x:0,y:0};
let gameTime=0,dayTime=0,kills=0,showFullMap=false;
let arrestTimer=0,arrestCop=null;
const mapState={zoom:1,rot:0,panX:0,panY:0,leftDown:false,rightDown:false,lx:0,ly:0};

function clockText(d){const h=d*24,hh=Math.floor(h),mm=Math.floor((h-hh)*60);return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');}
function phaseText(d){const h=d*24;if(h>=5&&h<7)return '🌅 Восход';if(h>=7&&h<12)return '☀️ Утро';if(h>=12&&h<17)return '🌞 День';if(h>=17&&h<19)return '🌇 Закат';return '🌙 Ночь';}

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

// ===== UPDATE =====
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

// ===== RENDER =====
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

// ===== ВВОД =====
addEventListener('keydown',e=>{unlockAudio();
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

// ===== GAME LOOP =====
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
