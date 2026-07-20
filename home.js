// ====== home.js НАЧАЛО ======
(function(){
var HBI=2, HBJ=4;
var hSel=0, tvCh=0, tvNoise=0;
var HOME_OPTS=['🛏️ Кровать — поспать и сохраниться','📺 Телевизор — смотреть','🍳 Кухня — поесть (+25 HP, $5)','💾 Сохранить игру','🚪 Выйти на улицу'];
var TV_CHANNELS=['📰 НОВОСТИ: в городе спокойно, полиция ищет нарушителей.','🏎️ СПОРТ: гонки на масл-карах, ставки растут!','🎬 ФИЛЬМ: «Побег из Лос-Анджелеса», серия 7.','🌤️ ПОГОДА: днём солнечно, ночью прохладно.','🎵 МУЗЫКА: хит-парад недели крутят по радио.','🍔 РЕКЛАМА: бургеры в закусочной — 2 за $5!'];
function clearKeys(){try{if(typeof keys!=='undefined'){keys['KeyW']=keys['KeyS']=keys['KeyA']=keys['KeyD']=keys['KeyE']=false;}}catch(e){}}
var _owr=window.onWorldReady;
window.onWorldReady=function(){ if(_owr)_owr();
  if(typeof window.clearBlock==='function')window.clearBlock(HBI,HBJ);
  var bx=HBI*BLOCK*TILE+ROAD_W*TILE+16, by=HBJ*BLOCK*TILE+ROAD_W*TILE+16;
  buildings.push({x:bx,y:by,w:150,h:130,color:'#7a5a3a',roofColor:'#5a3a20',_home:true});
  window.homePos={x:bx+75,y:by+130};
  try{var s=JSON.parse(localStorage.getItem('gta2d_save')||'null');if(s){if(s.money!=null)player.money=s.money;if(s.shirt)player.shirtColor=s.shirt;if(s.skin)player.skinColor=s.skin;if(s.hair)player.hairColor=s.hair;if(s.weapons)player.weapons=s.weapons;if(s.owned)player.ownedWeapons=s.owned;}}catch(e){}
};
window.openHome=function(){window.interiorOpen='home';hSel=0;clearKeys();if(typeof playSFX==='function')playSFX('click');};
function saveGame(){try{localStorage.setItem('gta2d_save',JSON.stringify({money:player.money,health:player.health,armor:player.armor,shirt:player.shirtColor,skin:player.skinColor,hair:player.hairColor,owned:player.ownedWeapons,weapons:player.weapons,kills:typeof kills!=='undefined'?kills:0}));showMessage('💾 Игра сохранена!',1800);if(typeof playSFX==='function')playSFX('buy');}catch(e){showMessage('❌ Ошибка сохранения',1500);}}
function eat(){if(player.money<5){showMessage('💸 Нет денег на еду ($5)',1600);return;}player.money-=5;player.health=Math.min(100,player.health+25);showMessage('🍳 Поели! +25 HP',1600);if(typeof playSFX==='function')playSFX('pickup');}
function sleepHome(){if(typeof window.applySleep==='function')window.applySleep();else{player.health=100;showMessage('😴 Ты поспал.',2000);}saveGame();window.interiorOpen=null;}
var ZONES=[{x:.06,y:.16,w:.26,h:.30},{x:.68,y:.16,w:.26,h:.30},{x:.06,y:.56,w:.26,h:.30},{x:.40,y:.40,w:.20,h:.16},{x:.68,y:.56,w:.26,h:.30}];
function drawRoom(ctx,W,H){
 ctx.fillStyle='#4a3420';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#6a4a2a';ctx.fillRect(0,H*0.60,W,H*0.40);
 ctx.fillStyle='#5a3a1a';for(var x=0;x<W;x+=70)ctx.fillRect(x,H*0.60,2,H*0.40);
 ctx.fillStyle='#3a2410';ctx.fillRect(0,H*0.58,W,6);
 ZONES.forEach(function(z,i){var sel=i===hSel;ctx.strokeStyle=sel?'#ff0':'rgba(255,255,255,.25)';ctx.lineWidth=sel?4:2;ctx.strokeRect(z.x*W,z.y*H,z.w*W,z.h*H);if(sel){ctx.fillStyle='rgba(255,255,0,.10)';ctx.fillRect(z.x*W,z.y*H,z.w*W,z.h*H);}});
 ctx.fillStyle='#d8d0c0';ctx.fillRect(ZONES[0].x*W+10,ZONES[0].y*H+10,ZONES[0].w*W-20,ZONES[0].h*H-20);ctx.fillStyle='#b04040';ctx.fillRect(ZONES[0].x*W+18,ZONES[0].y*H+18,ZONES[0].w*W-36,ZONES[0].h*H-50);ctx.fillStyle='#fff';ctx.fillRect(ZONES[0].x*W+18,ZONES[0].y*H+18,ZONES[0].w*W-36,18);
 ctx.fillStyle='#111';ctx.fillRect(ZONES[1].x*W+10,ZONES[1].y*H+10,ZONES[1].w*W-20,ZONES[1].h*H-30);ctx.fillStyle='#062';ctx.fillRect(ZONES[1].x*W+16,ZONES[1].y*H+16,ZONES[1].w*W-32,ZONES[1].h*H-42);ctx.fillStyle='#333';ctx.fillRect(ZONES[1].x*W+ZONES[1].w*W/2-6,ZONES[1].y*H+ZONES[1].h*H-22,12,12);
 ctx.fillStyle='#888';ctx.fillRect(ZONES[2].x*W+10,ZONES[2].y*H+10,ZONES[2].w*W-20,ZONES[2].h*H-20);ctx.fillStyle='#222';ctx.fillRect(ZONES[2].x*W+20,ZONES[2].y*H+20,30,30);ctx.fillRect(ZONES[2].x*W+ZONES[2].w*W-60,ZONES[2].y*H+20,40,30);ctx.fillStyle='#c33';ctx.fillRect(ZONES[2].x*W+ZONES[2].w*W/2-10,ZONES[2].y*H+ZONES[2].h*H-30,20,12);
 ctx.fillStyle='#fc0';ctx.font='bold 26px Arial';ctx.textAlign='center';ctx.fillText('💾',ZONES[3].x*W+ZONES[3].w*W/2,ZONES[3].y*H+ZONES[3].h*H/2+10);
 ctx.fillStyle='#7a5030';ctx.fillRect(ZONES[4].x*W+ZONES[4].w*W/2-22,ZONES[4].y*H+8,44,ZONES[4].h*H-16);ctx.fillStyle='#fc0';ctx.beginPath();ctx.arc(ZONES[4].x*W+ZONES[4].w*W/2+12,ZONES[4].y*H+ZONES[4].h*H/2,4,0,6.28);ctx.fill();
 ctx.fillStyle='#fff';ctx.font='bold 13px Arial';ctx.textAlign='center';
 ctx.fillText('🛏️ КРОВАТЬ',ZONES[0].x*W+ZONES[0].w*W/2,ZONES[0].y*H-6);
 ctx.fillText('📺 ТВ',ZONES[1].x*W+ZONES[1].w*W/2,ZONES[1].y*H-6);
 ctx.fillText('🍳 КУХНЯ',ZONES[2].x*W+ZONES[2].w*W/2,ZONES[2].y*H-6);
 ctx.fillText('СОХРАНИТЬ',ZONES[3].x*W+ZONES[3].w*W/2,ZONES[3].y*H-6);
 ctx.fillText('🚪 ВЫХОД',ZONES[4].x*W+ZONES[4].w*W/2,ZONES[4].y*H-6);
}
function drawHomeMenu(ctx,W,H){
 var pw=330,ph=HOME_OPTS.length*40+64,px=W-pw-20,py=20;
 ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(px,py,pw,ph);ctx.strokeStyle='#4c4';ctx.lineWidth=2;ctx.strokeRect(px,py,pw,ph);
 ctx.fillStyle='#4c4';ctx.font='bold 20px Arial';ctx.textAlign='left';ctx.fillText('🏠 ТВОЙ ДОМ',px+16,py+30);
 HOME_OPTS.forEach(function(it,i){var y=py+58+i*40,sel=i===hSel;if(sel){ctx.fillStyle='rgba(80,200,80,.22)';ctx.fillRect(px+10,y-22,pw-20,34);ctx.fillStyle='#fff';ctx.font='bold 16px Arial';}else{ctx.fillStyle='#bbb';ctx.font='15px Arial';}ctx.fillText(it,px+22,y);});
 ctx.fillStyle='#888';ctx.font='12px Arial';ctx.fillText('↑↓ выбрать · ENTER действие · E/ESC выйти',px+16,py+ph-12);
}
function drawTV(ctx,W,H){
 drawRoom(ctx,W,H);tvNoise++;
 var z=ZONES[1];ctx.fillStyle='#0a3';ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillText('CH '+(tvCh+1),z.x*W+22,z.y*H+30);
 for(var i=0;i<60;i++){ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.12)+')';ctx.fillRect(z.x*W+18+Math.random()*(z.w*W-36),z.y*H+18+Math.random()*(z.h*H-42),3,3);}
 ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(20,H-96,460,76);ctx.strokeStyle='#0a3';ctx.lineWidth=2;ctx.strokeRect(20,H-96,460,76);
 ctx.fillStyle='#0f0';ctx.font='bold 18px Arial';ctx.textAlign='left';ctx.fillText('📺 ТЕЛЕВИЗОР',36,H-70);
 ctx.fillStyle='#fff';ctx.font='13px Arial';ctx.fillText(TV_CHANNELS[tvCh%TV_CHANNELS.length],36,H-48);
 ctx.fillStyle='#aaa';ctx.font='12px Arial';ctx.fillText('← → переключить канал   ·   E / ESC выключить',36,H-30);
}
function hideHUD(on){var m=document.getElementById('minimap-container'),c=document.getElementById('controls-hint'),k=document.getElementById('clock');if(m)m.style.display=on?'none':'';if(c)c.style.display=on?'none':'';if(k)k.style.display=on?'none':'';}
addEventListener('keydown',function(e){
 if(window.interiorOpen==='tv'){
  if(e.code==='ArrowLeft'){tvCh=(tvCh-1+TV_CHANNELS.length)%TV_CHANNELS.length;if(typeof playSFX==='function')playSFX('click');}
  else if(e.code==='ArrowRight'){tvCh=(tvCh+1)%TV_CHANNELS.length;if(typeof playSFX==='function')playSFX('click');}
  else if(e.code==='Escape'||e.code==='KeyE'){window.interiorOpen='home';if(typeof playSFX==='function')playSFX('click');}
  e.stopImmediatePropagation();e.preventDefault();return;
 }
 if(window.interiorOpen==='home'){
  if(e.code==='ArrowUp'||e.code==='KeyW'){hSel=(hSel-1+HOME_OPTS.length)%HOME_OPTS.length;if(typeof playSFX==='function')playSFX('click');}
  else if(e.code==='ArrowDown'||e.code==='KeyS'){hSel=(hSel+1)%HOME_OPTS.length;if(typeof playSFX==='function')playSFX('click');}
  else if(e.code==='Enter'||e.code==='Space'){
    if(hSel===0)sleepHome();
    else if(hSel===1){window.interiorOpen='tv';tvCh=0;if(typeof playSFX==='function')playSFX('select');}
    else if(hSel===2)eat();
    else if(hSel===3)saveGame();
    else {window.interiorOpen=null;if(typeof playSFX==='function')playSFX('click');}
  }
  else if(e.code==='Escape'||e.code==='KeyE'){window.interiorOpen=null;if(typeof playSFX==='function')playSFX('click');}
  e.stopImmediatePropagation();e.preventDefault();return;
 }
},true);
var _hr=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){
 if(_hr)_hr(ctx,W,H);
 if(window.interiorOpen==='tv'){hideHUD(true);drawTV(ctx,W,H);ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText('home v3',8,H-6);return;}
 if(window.interiorOpen==='home'){hideHUD(true);drawRoom(ctx,W,H);drawHomeMenu(ctx,W,H);ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText('home v3',8,H-6);return;}
 hideHUD(false);
 if(!window.homePos)return;
 var s=180/WORLD_W;miniCtx.fillStyle='#4c4';miniCtx.fillRect(window.homePos.x*s-2,window.homePos.y*s-2,5,5);
 ctx.save();ctx.translate(-camera.x,-camera.y);var p=window.homePos;ctx.fillStyle='#4c4';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🏠 ДОМ',p.x,p.y-12);ctx.strokeStyle='#4c4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y+30,22+Math.sin(gameTime*.08)*3,0,6.28);ctx.stroke();if(dist(player,p)<60){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] войти',p.x,p.y+58);}ctx.restore();
};
})();
// ====== home.js КОНЕЦ ======
