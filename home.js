// ====== home.js НАЧАЛО ======
(function(){
var HBI=2, HBJ=4;
var tvCh=0;
var TV_CHANNELS=['📰 НОВОСТИ: в городе спокойно, полиция ищет нарушителей.','🏎️ СПОРТ: гонки на масл-карах, ставки растут!','🎬 ФИЛЬМ: «Побег из Лос-Анджелеса», серия 7.','🌤️ ПОГОДА: днём солнечно, ночью прохладно.','🎵 МУЗЫКА: хит-парад недели крутят по радио.','🍔 РЕКЛАМА: бургеры в закусочной — 2 за $5!'];
var ROOM={x0:0.05,y0:0.10,x1:0.95,y1:0.92};
var OBJ=[
 {id:'bed',x:0.10,y:0.20,w:0.24,h:0.30,label:'🛏️ КРОВАТЬ',hint:'[E] Поспать',act:'sleep'},
 {id:'tv',x:0.66,y:0.20,w:0.24,h:0.16,label:'📺 ТЕЛЕВИЗОР',hint:'[E] Смотреть ТВ',act:'tv'},
 {id:'kitchen',x:0.10,y:0.62,w:0.26,h:0.26,label:'🍳 КУХНЯ',hint:'[E] Поесть ($5)',act:'eat'},
 {id:'save',x:0.45,y:0.13,w:0.10,h:0.10,label:'💾 СОХРАНИТЬ',hint:'[E] Сохранить',act:'save',nocollide:true},
 {id:'door',x:0.70,y:0.74,w:0.16,h:0.16,label:'🚪 ВЫХОД',hint:'[E] На улицу',act:'exit'}
];
var hp={x:0.5,y:0.55,angle:0,af:0,at:0};
var homeKeys={};
var MOVE_CODES={KeyW:1,KeyA:1,KeyS:1,KeyD:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,ShiftLeft:1};
function Wd(){return canvas.width;} function Hd(){return canvas.height;}
function saveGame(){try{localStorage.setItem('gta2d_save',JSON.stringify({money:player.money,health:player.health,armor:player.armor,shirt:player.shirtColor,skin:player.skinColor,hair:player.hairColor,owned:player.ownedWeapons,weapons:player.weapons,kills:typeof kills!=='undefined'?kills:0}));showMessage('💾 Игра сохранена!',1800);if(typeof playSFX==='function')playSFX('buy');}catch(e){showMessage('❌ Ошибка сохранения',1500);}}
function eat(){if(player.money<5){showMessage('💸 Нет денег на еду ($5)',1600);return;}player.money-=5;player.health=Math.min(100,player.health+25);showMessage('🍳 Поели! +25 HP',1600);if(typeof playSFX==='function')playSFX('pickup');}
function doSleep(){if(typeof window.applySleep==='function')window.applySleep();else{player.health=100;showMessage('😴 Ты поспал.',2000);}if(typeof window.fishState!=='undefined')window.fishState.tired=false;showMessage('😴 Ты поспал в своей кровати. Здоровье полное.',2400);}
var _owr=window.onWorldReady;
window.onWorldReady=function(){ if(_owr)_owr();
  if(typeof window.clearBlock==='function')window.clearBlock(HBI,HBJ);
  for(var i=buildings.length-1;i>=0;i--){if(buildings[i]._shop==='home')buildings.splice(i,1);}
  if(window.shopDoors)delete window.shopDoors.home;
  var bx=HBI*BLOCK*TILE+ROAD_W*TILE+16, by=HBJ*BLOCK*TILE+ROAD_W*TILE+16;
  buildings.push({x:bx,y:by,w:150,h:130,color:'#7a5a3a',roofColor:'#5a3a20',_home:true});
  window.homePos={x:bx+75,y:by+130};
  try{var s=JSON.parse(localStorage.getItem('gta2d_save')||'null');if(s){if(s.money!=null)player.money=s.money;if(s.shirt)player.shirtColor=s.shirt;if(s.skin)player.skinColor=s.skin;if(s.hair)player.hairColor=s.hair;if(s.weapons)player.weapons=s.weapons;if(s.owned)player.ownedWeapons=s.owned;}}catch(e){}
};
window.openHome=function(){window.interiorOpen='home';hp.x=0.5;hp.y=0.55;hp.angle=0;homeKeys={};try{for(var c in MOVE_CODES)keys[c]=false;mouseDown=false;}catch(e){}if(typeof playSFX==='function')playSFX('click');};
function rectHit(px,py,r,o){var ox=o.x*Wd(),oy=o.y*Hd(),ow=o.w*Wd(),oh=o.h*Hd();var cx=Math.max(ox,Math.min(px,ox+ow)),cy=Math.max(oy,Math.min(py,oy+oh));return Math.hypot(px-cx,py-cy)<r;}
function solidAt(nx,ny){var px=nx*Wd(),py=ny*Hd(),r=18;var rx0=ROOM.x0*Wd(),ry0=ROOM.y0*Hd(),rx1=ROOM.x1*Wd(),ry1=ROOM.y1*Hd();if(px<rx0+r||px>rx1-r||py<ry0+r||py>ry1-r)return true;for(var i=0;i<OBJ.length;i++){if(OBJ[i].nocollide)continue;if(rectHit(px,py,r,OBJ[i]))return true;}return false;}
function nearestZone(){var px=hp.x*Wd(),py=hp.y*Hd(),bd=Math.min(Wd(),Hd())*0.20,best=null;for(var i=0;i<OBJ.length;i++){var o=OBJ[i];var cx=(o.x+o.w/2)*Wd(),cy=(o.y+o.h/2)*Hd();var d=Math.hypot(px-cx,py-cy);if(d<bd){bd=d;best=o;}}return best;}
function doAct(o){if(!o){showMessage(' Подойди ближе к предмету',1200);return;}if(o.act==='sleep')doSleep();else if(o.act==='tv'){window.interiorOpen='tv';tvCh=0;if(typeof playSFX==='function')playSFX('select');}else if(o.act==='eat')eat();else if(o.act==='save')saveGame();else if(o.act==='exit'){window.interiorOpen=null;homeKeys={};if(typeof playSFX==='function')playSFX('click');}}
function homeWorldUpdate(){gameTime++;dayTime=(gameTime%DAYCYCLE)/DAYCYCLE;var spd=homeKeys['ShiftLeft']?4.2:2.8;var dx=0,dy=0;if(homeKeys['KeyW']||homeKeys['ArrowUp'])dy-=1;if(homeKeys['KeyS']||homeKeys['ArrowDown'])dy+=1;if(homeKeys['KeyA']||homeKeys['ArrowLeft'])dx-=1;if(homeKeys['KeyD']||homeKeys['ArrowRight'])dx+=1;if(dx||dy){var l=Math.hypot(dx,dy);dx/=l;dy/=l;hp.angle=Math.atan2(dy,dx);var nx=hp.x+dx*spd/Wd(),ny=hp.y+dy*spd/Hd();if(!solidAt(nx,hp.y))hp.x=nx;if(!solidAt(hp.x,ny))hp.y=ny;hp.at++;if(hp.at>6){hp.at=0;hp.af=(hp.af+1)%4;}}}
function drawFurniture(ctx,W,H){
 ctx.fillStyle='#caa06a';ctx.fillRect(ROOM.x0*W,ROOM.y0*H,(ROOM.x1-ROOM.x0)*W,(ROOM.y1-ROOM.y0)*H);
 ctx.strokeStyle='#a87f4a';ctx.lineWidth=1;for(var x=ROOM.x0*W;x<ROOM.x1*W;x+=46){ctx.beginPath();ctx.moveTo(x,ROOM.y0*H);ctx.lineTo(x,ROOM.y1*H);ctx.stroke();}
 ctx.fillStyle='#8a6a3a';ctx.fillRect(ROOM.x0*W,ROOM.y0*H,(ROOM.x1-ROOM.x0)*W,10);ctx.fillRect(ROOM.x0*W,ROOM.y1*H-10,(ROOM.x1-ROOM.x0)*W,10);ctx.fillRect(ROOM.x0*W,ROOM.y0*H,10,(ROOM.y1-ROOM.y0)*H);ctx.fillRect(ROOM.x1*W-10,ROOM.y0*H,10,(ROOM.y1-ROOM.y0)*H);
 ctx.fillStyle='#b89a5a';ctx.fillRect(0.34*W,0.40*H,0.32*W,0.30*H);ctx.strokeStyle='#9a7a3a';ctx.strokeRect(0.34*W,0.40*H,0.32*W,0.30*H);
 OBJ.forEach(function(o){var x=o.x*W,y=o.y*H,w=o.w*W,h=o.h*H;
  if(o.id==='bed'){ctx.fillStyle='#e8e0d0';ctx.fillRect(x,y,w,h);ctx.fillStyle='#b04040';ctx.fillRect(x+8,y+22,w-16,h-30);ctx.fillStyle='#fff';ctx.fillRect(x+8,y+8,w-16,16);}
  else if(o.id==='tv'){ctx.fillStyle='#5a3a20';ctx.fillRect(x,y+h*0.55,w,h*0.45);ctx.fillStyle='#111';ctx.fillRect(x+8,y+6,w-16,h*0.5);ctx.fillStyle='#062';ctx.fillRect(x+12,y+10,w-24,h*0.5-8);}
  else if(o.id==='kitchen'){ctx.fillStyle='#cfcfcf';ctx.fillRect(x,y,w,h);ctx.fillStyle='#222';ctx.fillRect(x+12,y+12,34,34);ctx.fillStyle='#777';ctx.fillRect(x+w-58,y+12,46,34);ctx.fillStyle='#d33';ctx.fillRect(x+w/2-12,y+h-26,24,14);}
  else if(o.id==='save'){ctx.fillStyle='#3a2a1a';ctx.fillRect(x,y,w,h);ctx.fillStyle='#fc0';ctx.font='bold '+Math.round(h*0.6)+'px Arial';ctx.textAlign='center';ctx.fillText('💾',x+w/2,y+h*0.72);}
  else if(o.id==='door'){ctx.fillStyle='#6a4020';ctx.fillRect(x+w/2-22,y+4,44,h-4);ctx.fillStyle='#fc0';ctx.beginPath();ctx.arc(x+w/2+12,y+h/2,4,0,6.28);ctx.fill();ctx.fillStyle='#9a3030';ctx.fillRect(x+w/2-26,y+h-6,52,6);}
  ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillStyle='#fff';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText(o.label,x+w/2,y-8);ctx.restore();
 });
}
function drawPlayer(ctx,W,H){var k=Math.max(2.0,Math.min(W,H)/620);var px=hp.x*W,py=hp.y*H;ctx.save();ctx.translate(px,py);ctx.rotate(hp.angle);ctx.scale(k,k);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,2,9,6,0,0,6.28);ctx.fill();ctx.fillStyle=player.shirtColor;ctx.fillRect(-6,-5,12,10);ctx.fillStyle=player.skinColor;ctx.beginPath();ctx.arc(7,0,6,0,6.28);ctx.fill();ctx.fillStyle=player.hairColor;ctx.beginPath();ctx.arc(7,0,6,-2.2,2.2);ctx.fill();var lo=Math.sin(hp.af*Math.PI/2)*4;ctx.fillStyle='#335';ctx.fillRect(-7,-4+lo,5,3);ctx.fillRect(-7,2-lo,5,3);ctx.restore();ctx.strokeStyle='#0f0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,16*k*0.5+8,0,6.28);ctx.stroke();}
function drawInterior(ctx,W,H,tvMode){
 ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 drawFurniture(ctx,W,H);
 if(!tvMode){var nz=nearestZone();if(nz){ctx.strokeStyle='#ff0';ctx.lineWidth=4;ctx.strokeRect(nz.x*W-4,nz.y*H-4,nz.w*W+8,nz.h*H+8);ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillStyle='#ff0';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText(nz.hint,(nz.x+nz.w/2)*W,nz.y*H-26);ctx.restore();}}
 drawPlayer(ctx,W,H);
 if(tvMode){ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(W*0.18,H*0.30,W*0.64,H*0.40);ctx.strokeStyle='#0a3';ctx.lineWidth=3;ctx.strokeRect(W*0.18,H*0.30,W*0.64,H*0.40);ctx.fillStyle='#0f0';ctx.font='bold 22px monospace';ctx.textAlign='left';ctx.fillText('CH '+(tvCh+1),W*0.21,H*0.36);ctx.fillStyle='#fff';ctx.font='20px Arial';ctx.textAlign='center';var txt=TV_CHANNELS[tvCh%TV_CHANNELS.length],words=txt.split(' '),line='',ly=H*0.46;words.forEach(function(w){var t=line+w+' ';if(ctx.measureText(t).width>W*0.56){ctx.fillText(line,W*0.5,ly);line=w+' ';ly+=28;}else line=t;});ctx.fillText(line,W*0.5,ly);ctx.fillStyle='#aaa';ctx.font='15px Arial';ctx.fillText('← → переключить канал     E / ESC — выключить ТВ',W/0.5?W*0.5:W*0.5,H*0.66);}
 ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,H-40,W,40);ctx.fillStyle='#ff0';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('WASD — ходить   ·   подойди к предмету (жёлтая рамка) и нажми E   ·   ESC — ВЫЙТИ СРАЗУ',W/2,H-14);
 ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText('home v8',8,H-46);
}
function hideHUD(on){var ids=['minimap-container','controls-hint','clock','hud-top','info-panel','speed-display'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.style.display=on?'none':'';}}
addEventListener('keydown',function(e){
 if(window.interiorOpen===null){
  if(e.code==='KeyE' && window.homePos && typeof dist==='function' && dist(player,window.homePos)<60){ window.openHome(); e.stopImmediatePropagation(); e.preventDefault(); }
  return;
 }
 if(window.interiorOpen==='tv'){
  if(e.code==='ArrowLeft'){tvCh=(tvCh-1+TV_CHANNELS.length)%TV_CHANNELS.length;if(typeof playSFX==='function')playSFX('click');}
  else if(e.code==='ArrowRight'){tvCh=(tvCh+1)%TV_CHANNELS.length;if(typeof playSFX==='function')playSFX('click');}
  else if(e.code==='Escape'||e.code==='KeyE'){window.interiorOpen='home';if(typeof playSFX==='function')playSFX('click');}
  e.stopImmediatePropagation();e.preventDefault();return;
 }
 if(window.interiorOpen==='home'){
  if(MOVE_CODES[e.code]){homeKeys[e.code]=true;e.stopImmediatePropagation();e.preventDefault();return;}
  if(e.code==='Escape'){window.interiorOpen=null;homeKeys={};if(typeof playSFX==='function')playSFX('click');e.stopImmediatePropagation();e.preventDefault();return;}
  if(e.code==='KeyE'){doAct(nearestZone());e.stopImmediatePropagation();e.preventDefault();return;}
  e.stopImmediatePropagation();e.preventDefault();return;
 }
},true);
addEventListener('keyup',function(e){
 if(window.interiorOpen==='home'&&MOVE_CODES[e.code]){homeKeys[e.code]=false;e.stopImmediatePropagation();e.preventDefault();}
},true);
var _hr=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){
 if(window.interiorOpen==='tv'){hideHUD(true);gameTime++;dayTime=(gameTime%DAYCYCLE)/DAYCYCLE;drawInterior(ctx,W,H,true);return;}
 if(window.interiorOpen==='home'){hideHUD(true);homeWorldUpdate();drawInterior(ctx,W,H,false);return;}
 var cs=window.cutsceneSystem&&window.cutsceneSystem.active;
 hideHUD(cs);
 if(_hr)_hr(ctx,W,H);
 if(cs)return;
 if(!window.homePos)return;
 var s=180/WORLD_W;miniCtx.fillStyle='#4c4';miniCtx.fillRect(window.homePos.x*s-2,window.homePos.y*s-2,5,5);
 ctx.save();ctx.translate(-camera.x,-camera.y);var p=window.homePos;ctx.fillStyle='#4c4';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🏠 ДОМ',p.x,p.y-12);ctx.strokeStyle='#4c4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y+30,22+Math.sin(gameTime*.08)*3,0,6.28);ctx.stroke();if(dist(player,p)<60){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] войти',p.x,p.y+58);}ctx.restore();
};
})();
// ====== home.js КОНЕЦ ======
