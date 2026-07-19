// ====== engine1.js НАЧАЛО ======
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
addEventListener('mousedown',e=>{if(e.button===0)mouseDown=true});
addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false});
addEventListener('contextmenu',e=>{if(typeof showFullMap!=='undefined'&&showFullMap)e.preventDefault();});
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
function lobbyPick(){if(lobbyMenu==='main'){if(lobbySel===0){lobbyActive=false;gameStarted=true;startGame();}if(lobbySel===1){if(gameStarted)lobbyActive=false;}if(lobbySel===2){lobbyMenu='settings';lobbySel=0;}if(lobbySel===3){showExit();}}
else if(lobbyMenu==='settings'){if(lobbySel===5){lobbyMenu='controls';lobbySel=0;}if(lobbySel===6){lobbyMenu='main';lobbySel=2;}}
else if(lobbyMenu==='controls'){lobbyMenu='settings';lobbySel=5;}
else if(lobbyMenu==='pause'){if(lobbySel===0)lobbyActive=false;if(lobbySel===1){lobbyMenu='settings';lobbySel=0;}if(lobbySel===2){lobbyActive=true;lobbyMenu='main';lobbySel=0;}}}
let exitConfirmOpen=false,exitSel=1;
const exitBox=document.createElement('div');
exitBox.style.cssText='display:none;position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.75);z-index:9999;align-items:center;justify-content:center;pointer-events:auto;font-family:Segoe UI,Arial,sans-serif';
exitBox.innerHTML='<div style="background:#15152a;border:2px solid #f80;border-radius:14px;padding:34px 44px;text-align:center;box-shadow:0 0 40px rgba(255,136,0,.45)"><div style="color:#fff;font-size:26px;font-weight:bold;margin-bottom:10px">🚪 ВЫХОД</div><div style="color:#ccc;font-size:18px;margin-bottom:26px">Вы уверены, что хотите выйти из игры?</div><div id="exitBtns" style="display:flex;gap:22px;justify-content:center"></div><div id="exitHint" style="color:#666;font-size:12px;margin-top:20px">← → выбор · ENTER подтвердить · ESC отмена</div></div>';
document.body.appendChild(exitBox);
const exitBtns=exitBox.querySelector('#exitBtns'),exitHint=exitBox.querySelector('#exitHint');
function paintExitBtns(){exitBtns.innerHTML='';['✅ ДА, выйти','❌ НЕТ, остаться'].forEach((t,i)=>{const b=document.createElement('button');b.textContent=t;b.style.cssText='padding:13px 28px;font-size:18px;font-weight:bold;border-radius:9px;cursor:pointer;border:2px solid '+(i===exitSel?'#f80':'#555')+';background:'+(i===exitSel?'rgba(255,136,0,.2)':'#222')+';color:'+(i===exitSel?'#fff':'#999');b.onmouseenter=()=>{exitSel=i;paintExitBtns();};b.onclick=()=>{exitSel=i;exitPick();};exitBtns.appendChild(b);});}
function showExit(){exitConfirmOpen=true;exitSel=1;exitHint.style.color='#666';exitHint.style.fontSize='12px';exitHint.textContent='← → выбор · ENTER подтвердить · ESC отмена';exitBox.style.display='flex';paintExitBtns();}
function hideExit(){exitConfirmOpen=false;exitBox.style.display='none';}
function exitPick(){if(exitSel===0){window.close();exitBtns.innerHTML='';exitHint.style.color='#fc0';exitHint.style.fontSize='16px';exitHint.textContent='⚠️ Браузер запретил авто‑закрытие. Закрой вкладку сам: Ctrl+W (или крестиком).';}else hideExit();}
// ====== engine1.js КОНЕЦ ======
