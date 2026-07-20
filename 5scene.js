// ====== 5scene.js НАЧАЛО ======
(function(){
var m5Ware=[],m5Lair=[],m5boss=null;
var M5={phase:'idle',objectives:[],cur:0,reward:3000};
var TRIGGER5={x:8*BLOCK*TILE+TILE*1.5,y:8*BLOCK*TILE+TILE*1.5};
var WARE5={x:6*BLOCK*TILE+TILE*1.5,y:6*BLOCK*TILE+TILE*1.5};
var LOGOVO5={x:10*BLOCK*TILE+TILE*1.5,y:9*BLOCK*TILE+TILE*1.5};
var VICTOR5={x:8*BLOCK*TILE+TILE*1.5,y:7*BLOCK*TILE+TILE*1.5};
var D5_START=[
{name:'🧔 Виктор',text:'Рэй... это конец. Долли лично повёл товар через город. Если мы его упустим — нам крышка обоим.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'😎 Рэй',text:'Тогда не упустим. Рассказывай по порядку.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2},{x:.7,color:'#25c',skin:'#fca',hair:'#432',label:'Рэй',scale:1.2}]},
{name:'🧔 Виктор',text:'Сначала их склад — зачисти охрану. Потом сам Долли поедет на тачке. Догони и сожги её к чёртовой матери.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'🧔 Виктор',text:'После — его логово, там ещё охрана. Зачистишь — возвращайся ко мне. Три тысячи и... свобода от этой банды навсегда.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'😎 Рэй',text:'Склад, погоня, логово. Понял. Сегодня Долли узнает, кто в городе хозяин.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2},{x:.7,color:'#25c',skin:'#fca',hair:'#432',label:'Рэй',scale:1.2}]},
{name:'',text:'▶ ЦЕЛЬ: склад → погоня за боссом → логово → к Виктору.',bg:'dark',chars:[]}];
var D5_DONE=[
{name:'🧔 Виктор',text:'*долго молчит, потом улыбается* Ты сделал то, что я сам не смог за десять лет. Долли больше нет.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'😎 Рэй',text:'Город чище. А мосты?',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2},{x:.7,color:'#25c',skin:'#fca',hair:'#432',label:'Рэй',scale:1.2}]},
{name:'🧔 Виктор',text:'Полиция сняла перекрытие. Вся карта твоя — остров, река, всё открыто. Три тысячи, брат. И моё уважение навсегда.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'',text:'🔓 МОСТЫ ОТКРЫТЫ! МИССИЯ 5 ПРОЙДЕНА. Ты — легенда Лос-Рио.',bg:'dark',chars:[]}];
function spawnGroup(arr,cx,cy,n){for(var i=0;i<n;i++){var a=(i/n)*6.28+rand(-.3,.3),r=rand(80,140);arr.push({x:clamp(cx+Math.cos(a)*r,50,WORLD_W-50),y:clamp(cy+Math.sin(a)*r,50,WORLD_H-50),angle:0,hp:80,maxHp:80,alive:true,shootT:rand(30,80)});}}
function spawnBoss(){var horiz=Math.random()<.5;var x,y,a;if(horiz){x=2*BLOCK*TILE;y=WARE5.y;a=0;}else{x=WARE5.x;y=2*BLOCK*TILE;a=Math.PI/2;}m5boss={x:x,y:y,angle:a,speed:3.4,hp:260,maxHp:260,turnT:rand(70,140)};}
function guardAI(arr){arr.forEach(function(e){if(!e.alive)return;var d=dist(e,player);e.angle=angleTo(e,player);if(d>165){e.x+=Math.cos(e.angle)*1.2;e.y+=Math.sin(e.angle)*1.2;}else if(d<110){e.x-=Math.cos(e.angle)*.8;e.y-=Math.sin(e.angle)*.8;}if(typeof collidesBuilding==='function'&&collidesBuilding(e.x,e.y,10)){e.x-=Math.cos(e.angle)*6;e.y-=Math.sin(e.angle)*6;}e.x=clamp(e.x,0,WORLD_W);e.y=clamp(e.y,0,WORLD_H);e.shootT--;if(d<330&&e.shootT<=0){e.shootT=50+rand(0,40);shoot(e.x+Math.cos(e.angle)*14,e.y+Math.sin(e.angle)*14,e.angle+rand(-.12,.12),7,300,'police');playSFX('shoot');}});}
function arrow5(ctx,W,H,tx,ty){var d=dist(player,{x:tx,y:ty});if(d<300)return;var a=angleTo(player,{x:tx,y:ty});var ax=W/2+Math.cos(a)*90,ay=H/2+Math.sin(a)*90;ctx.save();ctx.translate(ax,ay);ctx.rotate(a);ctx.fillStyle='rgba(255,40,40,.9)';ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-9,-9);ctx.lineTo(-9,9);ctx.fill();ctx.restore();ctx.fillStyle='#f44';ctx.font='12px Arial';ctx.textAlign='center';ctx.fillText(Math.round(d)+'м',ax,ay-14);}
function resetM5(){m5Ware.length=0;m5Lair.length=0;m5boss=null;spawnGroup(m5Ware,WARE5.x,WARE5.y,6);M5.phase='active';M5.objectives=[{text:'Доедь до склада Долли',done:false},{text:'Зачисти склад (0/6)',done:false},{text:'Догони и уничтожь машину босса',done:false},{text:'Зачисти логово (0/4)',done:false},{text:'Вернись к Виктору',done:false}];M5.cur=0;window.missionMarker.x=WARE5.x;window.missionMarker.y=WARE5.y;window.missionMarker.active=true;}
function updateMission5(){if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 if(M5.phase==='idle'&&window.M4&&window.M4.phase==='free'){M5.phase='trigger';window.missionMarker.x=TRIGGER5.x;window.missionMarker.y=TRIGGER5.y;window.missionMarker.active=true;showMission('📞 ФИНАЛ — иди к красной «5»!',4000);showMessage('📞 МИССИЯ 5: Финальный расчёт',3000);}
 if(M5.phase==='trigger'&&window.missionMarker.active&&dist(player,window.missionMarker)<55){window.missionMarker.active=false;M5.phase='cutscene';playSFX('mission');window.cutsceneSystem.start(D5_START,function(){resetM5();showMission('📋 Миссия 5: Финальный расчёт',3000);});}
 if(M5.phase==='active'){
  for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];if(b.owner!=='player')continue;var hit=false;
   for(var k=0;k<m5Ware.length;k++){var e=m5Ware[k];if(e.alive&&dist(b,e)<14){e.hp-=b.damage;spawnParticles(b.x,b.y,'#f00',4,2);playSFX('hit');hit=true;if(e.hp<=0){e.alive=false;if(typeof addBlood==='function')addBlood(e.x,e.y);spawnParticles(e.x,e.y,'#a00',12,3);player.money+=20;}break;}}
   if(!hit)for(var k=0;k<m5Lair.length;k++){var e=m5Lair[k];if(e.alive&&dist(b,e)<14){e.hp-=b.damage;spawnParticles(b.x,b.y,'#f00',4,2);playSFX('hit');hit=true;if(e.hp<=0){e.alive=false;if(typeof addBlood==='function')addBlood(e.x,e.y);spawnParticles(e.x,e.y,'#a00',12,3);player.money+=20;}break;}}
   if(!hit&&m5boss&&dist(b,m5boss)<30){m5boss.hp-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);hit=true;}
   if(hit)bullets.splice(i,1);
  }
  if(M5.cur===0){if(dist(player,WARE5)<60){M5.objectives[0].done=true;M5.cur=1;window.missionMarker.active=false;showMission('⚔️ Охрана склада — убей всех!',2500);playSFX('select');}}
  else if(M5.cur===1){guardAI(m5Ware);var dw=m5Ware.filter(function(e){return !e.alive;}).length;M5.objectives[1].text='Зачисти склад ('+dw+'/'+m5Ware.length+')';if(dw>=m5Ware.length){M5.objectives[1].done=true;M5.cur=2;spawnBoss();showMission('🚗 Босс поехал! Сядь в тачку и догони!',3000);playSFX('select');}}
  else if(M5.cur===2){
   if(m5boss){var BS=BLOCK*TILE,RC=ROAD_W*TILE/2;var nrc=function(v){return Math.round((v-RC)/BS)*BS+RC;};var horiz=Math.abs(Math.cos(m5boss.angle))>.5;if(horiz)m5boss.y+=(nrc(m5boss.y)-m5boss.y)*.15;else m5boss.x+=(nrc(m5boss.x)-m5boss.x)*.15;var cx=nrc(m5boss.x),cy=nrc(m5boss.y),cross=Math.abs(m5boss.x-cx)<16&&Math.abs(m5boss.y-cy)<16;if(cross){m5boss.turnT--;if(m5boss.turnT<=0){m5boss.turnT=rand(70,140);if(Math.random()<.5){var dirs=[0,Math.PI/2,Math.PI,-Math.PI/2];var opts=dirs.filter(function(a){return Math.abs(Math.cos(a-m5boss.angle))<.5;});m5boss.angle=opts[randInt(0,opts.length-1)];}}}m5boss.x+=Math.cos(m5boss.angle)*m5boss.speed;m5boss.y+=Math.sin(m5boss.angle)*m5boss.speed;if(m5boss.x<0||m5boss.x>WORLD_W||m5boss.y<0||m5boss.y>WORLD_H)m5boss.angle+=Math.PI;if(typeof collidesBuilding==='function'&&collidesBuilding(m5boss.x,m5boss.y,24)){m5boss.angle+=Math.PI;m5boss.x+=Math.cos(m5boss.angle)*12;m5boss.y+=Math.sin(m5boss.angle)*12;}
    if(player.inVehicle&&dist(player.inVehicle,m5boss)<42&&Math.abs(player.inVehicle.speed)>2.5){m5boss.hp-=Math.abs(player.inVehicle.speed)*6;player.inVehicle.speed*=-0.25;spawnParticles(m5boss.x,m5boss.y,'#fa0',6,3);playSFX('hit');}
    if(m5boss.hp<=0){createExplosion(m5boss.x,m5boss.y);m5boss=null;M5.objectives[2].done=true;M5.cur=3;spawnGroup(m5Lair,LOGOVO5.x,LOGOVO5.y,4);window.missionMarker.x=LOGOVO5.x;window.missionMarker.y=LOGOVO5.y;window.missionMarker.active=true;showMission('🔥 Босс горит! Зачисти логово!',2500);playSFX('select');}
    else arrow5(ctx,canvas.width,canvas.height,m5boss.x,m5boss.y);
   }
  }
  else if(M5.cur===3){guardAI(m5Lair);var dl=m5Lair.filter(function(e){return !e.alive;}).length;M5.objectives[3].text='Зачисти логово ('+dl+'/'+m5Lair.length+')';if(dl>=m5Lair.length){M5.objectives[3].done=true;M5.cur=4;window.missionMarker.x=VICTOR5.x;window.missionMarker.y=VICTOR5.y;window.missionMarker.active=true;showMission('✅ Логово чисто! К Виктору!',2500);playSFX('select');}}
  else if(M5.cur===4){if(window.missionMarker.active&&dist(player,VICTOR5)<55){M5.objectives[4].done=true;M5.phase='done';window.missionMarker.active=false;player.money+=M5.reward;playSFX('pickup');showMessage('МИССИЯ ВЫПОЛНЕНА! МОСТЫ ОТКРЫТЫ!',3500);showMission('+$'+M5.reward,3000);m5Ware.length=0;m5Lair.length=0;m5boss=null;setTimeout(function(){window.cutsceneSystem.start(D5_DONE,function(){M5.phase='free';});},3200);}}
 }
}
function drawGuards(ctx,arr){arr.forEach(function(e){if(!e.alive)return;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.fillStyle='#722';ctx.fillRect(-6,-5,12,10);ctx.fillStyle='#dba';ctx.beginPath();ctx.arc(7,0,6,0,6.28);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(7,0,6,-2.2,2.2);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(10,-2,13,3);ctx.restore();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(e.x-15,e.y-18,30,4);ctx.fillStyle='#f44';ctx.fillRect(e.x-15,e.y-18,30*(e.hp/e.maxHp),4);});}
function renderMission5World(ctx,W,H){if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 if(M5.phase==='trigger'&&window.missionMarker.active){ctx.save();ctx.translate(-camera.x,-camera.y);var p=Math.sin(gameTime*.08)*5;ctx.strokeStyle='#f22';ctx.lineWidth=3;ctx.beginPath();ctx.arc(window.missionMarker.x,window.missionMarker.y,45+p,0,6.28);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle='#f22';ctx.beginPath();ctx.arc(window.missionMarker.x,window.missionMarker.y,45+p,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#f22';ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.fillText('5',window.missionMarker.x,window.missionMarker.y+10);if(dist(player,window.missionMarker)<120){ctx.fillStyle='#fff';ctx.font='14px Arial';ctx.fillText('Подойди ближе',window.missionMarker.x,window.missionMarker.y-55);}ctx.restore();arrow5(ctx,W,H,window.missionMarker.x,window.missionMarker.y);return;}
 if(M5.phase==='active'){ctx.save();ctx.translate(-camera.x,-camera.y);drawGuards(ctx,m5Ware);drawGuards(ctx,m5Lair);
  if(m5boss){ctx.save();ctx.translate(m5boss.x,m5boss.y);ctx.rotate(m5boss.angle);ctx.fillStyle='#111';ctx.fillRect(-30,-15,60,30);ctx.fillStyle='#300';ctx.fillRect(-30,-15,16,30);ctx.fillStyle='#f00';ctx.fillRect(-30,-13,3,4);ctx.fillRect(-30,9,3,4);ctx.restore();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(m5boss.x-26,m5boss.y-26,52,4);ctx.fillStyle='#f80';ctx.fillRect(m5boss.x-26,m5boss.y-26,52*(m5boss.hp/m5boss.maxHp),4);ctx.fillStyle='#fff';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('БОСС ДОЛЛИ',m5boss.x,m5boss.y-30);}
  if(M5.cur===1){var p=Math.sin(gameTime*.1)*4;ctx.strokeStyle='rgba(255,60,60,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(WARE5.x,WARE5.y,130+p,0,6.28);ctx.stroke();}
  if(M5.cur===3){var p=Math.sin(gameTime*.1)*4;ctx.strokeStyle='rgba(255,60,60,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(LOGOVO5.x,LOGOVO5.y,140+p,0,6.28);ctx.stroke();}
  ctx.restore();
  if(m5boss&&M5.cur===2)arrow5(ctx,W,H,m5boss.x,m5boss.y);
 }
 if(M5.phase==='active'&&window.missionMarker.active){ctx.save();ctx.translate(-camera.x,-camera.y);var p=Math.sin(gameTime*.08)*5;ctx.strokeStyle='#ff0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(window.missionMarker.x,window.missionMarker.y,50+p,0,6.28);ctx.stroke();ctx.globalAlpha=.1;ctx.fillStyle='#ff0';ctx.beginPath();ctx.arc(window.missionMarker.x,window.missionMarker.y,50+p,0,6.28);ctx.fill();ctx.globalAlpha=1;var d=Math.round(dist(player,window.missionMarker));ctx.fillStyle='#ff0';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText(d+'м',window.missionMarker.x,window.missionMarker.y-55-p);ctx.restore();arrow5(ctx,W,H,window.missionMarker.x,window.missionMarker.y);}
}
function renderMission5HUD(ctx,W,H){if(M5.phase!=='active')return;var pX=W-330,pY=300,pW=310;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(pX,pY,pW,30+M5.objectives.length*26);ctx.strokeStyle='rgba(255,40,40,.5)';ctx.lineWidth=1;ctx.strokeRect(pX,pY,pW,30+M5.objectives.length*26);ctx.fillStyle='#f44';ctx.font='bold 14px Arial';ctx.textAlign='left';ctx.fillText('💀 Финальный расчёт',pX+10,pY+20);M5.objectives.forEach(function(o,i){var y=pY+42+i*26;if(o.done){ctx.fillStyle='#4c4';ctx.font='12px Arial';ctx.fillText('✅ '+o.text,pX+10,y);}else if(i===M5.cur){ctx.fillStyle='#ff0';ctx.font='bold 12px Arial';ctx.fillText('▶ '+o.text,pX+10,y);}else{ctx.fillStyle='#888';ctx.font='12px Arial';ctx.fillText('○ '+o.text,pX+10,y);}});}
var _u5=window.updateMission;window.updateMission=function(){if(_u5)_u5();updateMission5();};
var _r5=window.renderMissionHUD;window.renderMissionHUD=function(c,W,H){renderMission5World(c,W,H);if(_r5)_r5(c,W,H);renderMission5HUD(c,W,H);};
window.missionRestarters=window.missionRestarters||[];
window.missionRestarters.push(function(){if(M5.phase==='active'){resetM5();showMission('🔁 Миссия 5 начата заново',2000);}});
window.M5=M5;
console.log('5scene v1 ЗАГРУЖЕН');
})();
// ====== 5scene.js КОНЕЦ ======
