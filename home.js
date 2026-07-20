// ====== home.js НАЧАЛО ======
(function(){
var HBI=2, HBJ=4;
var hSel=0, tvCh=0, tvNoise=0;
var HOME_OPTS=['📺 Посмотреть телевизор','😴 Поспать до утра','💾 Сохранить игру','🚪 Выйти на улицу'];
var TV_CHANNELS=['📰 НОВОСТИ: в городе спокойно. Полиция ищет нарушителей.','🏎️ СПОРТ: гонки на Масл-карах, ставки растут!','🎬 ФИЛЬМ: «Побег из Лос-Анджелеса», серия 7.','🌤️ ПОГОДА: днём солнечно, ночью прохладно.','🎵 МУЗЫКА: хит-парад недели крутят по радио.','🍔 РЕКЛАМА: бургеры в закусочной — 2 за $5!'];
var _owr=window.onWorldReady;
window.onWorldReady=function(){ if(_owr)_owr();
  window.clearBlock(HBI,HBJ);
  var bx=HBI*BLOCK*TILE+ROAD_W*TILE+16, by=HBJ*BLOCK*TILE+ROAD_W*TILE+16;
  buildings.push({x:bx,y:by,w:150,h:130,color:'#7a5a3a',roofColor:'#5a3a20',_home:true});
  window.homePos={x:bx+75,y:by+130};
  try{var s=JSON.parse(localStorage.getItem('gta2d_save')||'null');if(s){player.money=s.money!=null?s.money:player.money;player.shirtColor=s.shirt||player.shirtColor;player.skinColor=s.skin||player.skinColor;player.hairColor=s.hair||player.hairColor;if(s.weapons)player.weapons=s.weapons;if(s.owned)player.ownedWeapons=s.owned;}}catch(e){}
};
window.openHome=function(){window.interiorOpen='home';hSel=0;playSFX('click');};
function saveGame(){try{localStorage.setItem('gta2d_save',JSON.stringify({money:player.money,health:player.health,armor:player.armor,shirt:player.shirtColor,skin:player.skinColor,hair:player.hairColor,owned:player.ownedWeapons,weapons:player.weapons,kills:typeof kills!=='undefined'?kills:0}));showMessage('💾 Игра сохранена!',1800);playSFX('buy');}catch(e){showMessage('❌ Ошибка сохранения',1500);}}
function drawRoom(ctx,W,H){
 ctx.fillStyle='#3a2a1a';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#5a4028';ctx.fillRect(0,H*0.62,W,H*0.38);
 ctx.fillStyle='#6a4a2a';for(var x=0;x<W;x+=60){ctx.fillRect(x,H*0.62,2,H*0.38);}
 ctx.fillStyle='#7a3030';ctx.fillRect(W*0.30,H*0.66,W*0.40,H*0.30);
 ctx.fillStyle='#9a4040';ctx.fillRect(W*0.32,H*0.68,W*0.36,H*0.26);
 ctx.fillStyle='#222';ctx.fillRect(W*0.58,H*0.18,W*0.30,H*0.30);
 ctx.fillStyle='#111';ctx.fillRect(W*0.60,H*0.20,W*0.26,H*0.26);
 tvNoise++;
 for(var i=0;i<120;i++){var gx=W*0.60+Math.random()*W*0.26,gy=H*0.20+Math.random()*H*0.26;ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.15)+')';ctx.fillRect(gx,gy,3,3);}
 ctx.fillStyle='#0a3';ctx.font='bold 13px monospace';ctx.textAlign='left';ctx.fillText('CH '+(tvCh+1),W*0.61,H*0.23);
 ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.textAlign='center';var txt=TV_CHANNELS[tvCh%TV_CHANNELS.length];var words=txt.split(' '),line='',ly=H*0.30;words.forEach(function(w){var t=line+w+' ';if(ctx.measureText(t).width>W*0.24){ctx.fillText(line,W*0.73,ly);line=w+' ';ly+=15;}else line=t;});ctx.fillText(line,W*0.73,ly);
 ctx.fillStyle='#caa';ctx.fillRect(W*0.78,H*0.40,8,4);ctx.fillRect(W*0.80,H*0.36,4,8);
 ctx.fillStyle='#4c4';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('🚪 ВЫХОД',W*0.12,H*0.50);ctx.strokeStyle='#4c4';ctx.lineWidth=2;ctx.strokeRect(W*0.07,H*0.40,W*0.10,H*0.12);
}
function drawHomeMenu(ctx,W,H){
 ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(20,H*0.12,300,HOME_OPTS.length*42+30);
 ctx.strokeStyle='#4c4';ctx.lineWidth=2;ctx.strokeRect(20,H*0.12,300,HOME_OPTS.length*42+30);
 ctx.fillStyle='#4c4';ctx.font='bold 22px Arial';ctx.textAlign='left';ctx.fillText('🏠 ТВОЙ ДОМ',36,H*0.12+30);
 HOME_OPTS.forEach(function(it,i){var y=H*0.12+58+i*42,sel=i===hSel;if(sel){ctx.fillStyle='rgba(80,200,80,.2)';ctx.fillRect(30,y-20,280,34);ctx.fillStyle='#fff';ctx.font='bold 18px Arial';}else{ctx.fillStyle='#bbb';ctx.font='16px Arial';}ctx.fillText(it,44,y+2);});
 ctx.fillStyle='#888';ctx.font='12px Arial';ctx.fillText('↑↓ выбор · ENTER подтвердить · E/ESC выйти',36,H*0.12+HOME_OPTS.length*42+22);
 ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.fillText('home v2',36,H-10);
}
function drawTV(ctx,W,H){
 drawRoom(ctx,W,H);
 ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(20,H-90,420,70);ctx.strokeStyle='#0a3';ctx.lineWidth=2;ctx.strokeRect(20,H-90,420,70);
 ctx.fillStyle='#0f0';ctx.font='bold 20px Arial';ctx.textAlign='left';ctx.fillText('📺 ТЕЛЕВИЗОР',36,H-62);
 ctx.fillStyle='#fff';ctx.font='14px Arial';ctx.fillText('← → переключить канал   ·   ESC / E выключить',36,H-38);
 ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.fillText('home v2',36,H-10);
}
addEventListener('keydown',function(e){
 if(window.interiorOpen==='tv'){
  if(e.code==='ArrowLeft'){tvCh=(tvCh-1+TV_CHANNELS.length)%TV_CHANNELS.length;playSFX('click');}
  else if(e.code==='ArrowRight'){tvCh=(tvCh+1)%TV_CHANNELS.length;playSFX('click');}
  else if(e.code==='Escape'||e.code==='KeyE'){window.interiorOpen='home';playSFX('click');}
  e.stopImmediatePropagation();e.preventDefault();return;
 }
 if(window.interiorOpen==='home'){
  if(e.code==='ArrowUp'||e.code==='KeyW'){hSel=(hSel-1+HOME_OPTS.length)%HOME_OPTS.length;playSFX('click');}
  else if(e.code==='ArrowDown'||e.code==='KeyS'){hSel=(hSel+1)%HOME_OPTS.length;playSFX('click');}
  else if(e.code==='Enter'||e.code==='Space'){
    if(hSel===0){window.interiorOpen='tv';tvCh=0;playSFX('select');}
    else if(hSel===1){window.applySleep();window.interiorOpen=null;}
    else if(hSel===2){saveGame();}
    else {window.interiorOpen=null;playSFX('click');}
  }
  else if(e.code==='Escape'||e.code==='KeyE'){window.interiorOpen=null;playSFX('click');}
  e.stopImmediatePropagation();e.preventDefault();return;
 }
},true);
var _hr=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){
 if(_hr)_hr(ctx,W,H);
 if(window.interiorOpen==='tv'){drawTV(ctx,W,H);return;}
 if(window.interiorOpen==='home'){drawRoom(ctx,W,H);drawHomeMenu(ctx,W,H);return;}
 if(!window.homePos)return;
 var s=180/WORLD_W;miniCtx.fillStyle='#4c4';miniCtx.fillRect(window.homePos.x*s-2,window.homePos.y*s-2,5,5);
 ctx.save();ctx.translate(-camera.x,-camera.y);var p=window.homePos;ctx.fillStyle='#4c4';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🏠 ДОМ',p.x,p.y-12);ctx.strokeStyle='#4c4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y+30,22+Math.sin(gameTime*.08)*3,0,6.28);ctx.stroke();ctx.restore();
};
})();
// ====== home.js КОНЕЦ ======
