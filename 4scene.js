// ====== 4scene.js НАЧАЛО ======
(function(){
var M4={phase:'idle',objectives:[],cur:0,reward:2000};
var convoy=null;
var M4_TRIGGER={x:9*BLOCK*TILE+TILE*1.5,y:7*BLOCK*TILE+TILE*1.5};
var D4_START=[
{name:'🧔 Виктор',text:'Брат, слушай. Банда Долли везёт МОЙ товар на фургоне через город. Это уже наглость.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'🧔 Виктор',text:'Догони их на машине и тарань фургон. Стрелять не надо — бей бортом, пока не загорится.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'😎 Ты',text:'Таранить фургон на ходу? Легко. Двадцатка за работу?',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2},{x:.7,color:'#25c',skin:'#fca',hair:'#432',label:'Ты',scale:1.2}]},
{name:'🧔 Виктор',text:'Две тысячи. И когда разберёшься — полиция снимет перекрытие с мостов. Дорога на остров и за реку откроется.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'',text:'▶ ЦЕЛЬ: догони фургон банды и тарань его, пока не взорвётся.',bg:'dark',chars:[]}];
var D4_DONE=[
{name:'🧔 Виктор',text:'*смотрит на дым* Красиво сгорел. Товар мой, деньги твои. Две тысячи, как обещал.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'🧔 Виктор',text:'И держи слово про мосты — перекрытие снято. Весь город теперь твой, брат. Езжай куда хочешь.',bg:'city',chars:[{x:.3,color:'#833',skin:'#dba',hair:'#222',label:'Виктор',scale:1.2}]},
{name:'',text:'🔓 МОСТЫ ОТКРЫТЫ! МИССИЯ 4 ПРОЙДЕНА.',bg:'dark',chars:[]}];
function spawnConvoy(){var a=Math.random()<.5?0:Math.PI/2;var x,y;if(a===0){x=2*BLOCK*TILE;y=7*BLOCK*TILE+ROAD_W*TILE/2;}else{x=7*BLOCK*TILE+ROAD_W*TILE/2;y=2*BLOCK*TILE;}convoy={x:x,y:y,angle:a,speed:3.2,hp:220,maxHp:220,turnT:rand(80,160)};}
function arrow4(ctx,W,H,tx,ty){var d=dist(player,{x:tx,y:ty});if(d<300)return;var a=angleTo(player,{x:tx,y:ty});var ax=W/2+Math.cos(a)*90,ay=H/2+Math.sin(a)*90;ctx.save();ctx.translate(ax,ay);ctx.rotate(a);ctx.fillStyle='rgba(255,140,0,.9)';ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-9,-9);ctx.lineTo(-9,9);ctx.fill();ctx.restore();ctx.fillStyle='#f80';ctx.font='12px Arial';ctx.textAlign='center';ctx.fillText(Math.round(d)+'м',ax,ay-14);}
function resetM4(){spawnConvoy();M4.phase='active';M4.objectives=[{text:'Догони фургон банды',done:false},{text:'Тарань фургон, пока не взорвётся',done:false}];M4.cur=0;}
function updateMission4(){if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 if(M4.phase==='idle'&&window.M3&&window.M3.phase==='free'){M4.phase='trigger';window.missionMarker.x=M4_TRIGGER.x;window.missionMarker.y=M4_TRIGGER.y;window.missionMarker.active=true;window.missionMarker.kind='trigger4';showMission('📞 МИССИЯ 4 — иди к оранжевой «4»!',4000);showMessage('📞 МИССИЯ 4: Конвой',3000);}
 if(M4.phase==='trigger'&&window.missionMarker.active&&dist(player,window.missionMarker)<55){window.missionMarker.active=false;M4.phase='cutscene';playSFX('mission');window.cutsceneSystem.start(D4_START,function(){resetM4();showMission('📋 Миссия: Конвой — тарань фургон!',3000);});}
 if(M4.phase==='active'&&convoy){
  convoy.turnT--;var BS=BLOCK*TILE,RC=ROAD_W*TILE/2;var nrc=function(v){return Math.round((v-RC)/BS)*BS+RC;};var horiz=Math.abs(Math.cos(convoy.angle))>.5;
  if(horiz)convoy.y+=(nrc(convoy.y)-convoy.y)*.15;else convoy.x+=(nrc(convoy.x)-convoy.x)*.15;
  var cx=nrc(convoy.x),cy=nrc(convoy.y),cross=Math.abs(convoy.x-cx)<16&&Math.abs(convoy.y-cy)<16;
  if(cross&&convoy.turnT<=0){convoy.turnT=rand(80,160);if(Math.random()<.5){var dirs=[0,Math.PI/2,Math.PI,-Math.PI/2];var opts=dirs.filter(function(a){return Math.abs(Math.cos(a-convoy.angle))<.5;});convoy.angle=opts[randInt(0,opts.length-1)];}}
  convoy.x+=Math.cos(convoy.angle)*convoy.speed;convoy.y+=Math.sin(convoy.angle)*convoy.speed;
  if(convoy.x<0||convoy.x>WORLD_W||convoy.y<0||convoy.y>WORLD_H)convoy.angle+=Math.PI;
  if(typeof collidesBuilding==='function'&&collidesBuilding(convoy.x,convoy.y,24)){convoy.angle+=Math.PI;convoy.x+=Math.cos(convoy.angle)*12;convoy.y+=Math.sin(convoy.angle)*12;}
  if(M4.cur===0&&dist(player,convoy)<220){M4.objectives[0].done=true;M4.cur=1;showMission('💥 Тарань фургон бортом!',2200);}
  if(player.inVehicle&&dist(player.inVehicle,convoy)<42&&Math.abs(player.inVehicle.speed)>2.5){var sp=Math.abs(player.inVehicle.speed);convoy.hp-=sp*7;player.inVehicle.speed*=-0.25;spawnParticles(convoy.x,convoy.y,'#fa0',6,3);playSFX('hit');}
  for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];if(b.owner==='player'&&convoy&&dist(b,convoy)<30){convoy.hp-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);bullets.splice(i,1);}}
  if(convoy.hp<=0){createExplosion(convoy.x,convoy.y);convoy=null;M4.objectives[1].done=true;M4.phase='done';window.missionMarker.active=false;player.money+=M4.reward;playSFX('pickup');showMessage('МИССИЯ ВЫПОЛНЕНА! МОСТЫ ОТКРЫТЫ!',3500);showMission('+$'+M4.reward,3000);setTimeout(function(){window.cutsceneSystem.start(D4_DONE,function(){M4.phase='free';});},3200);}}
}
function renderMission4World(ctx,W,H){if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 if(M4.phase==='trigger'&&window.missionMarker.active){ctx.save();ctx.translate(-camera.x,-camera.y);var p=Math.sin(gameTime*.08)*5;ctx.strokeStyle='#f80';ctx.lineWidth=3;ctx.beginPath();ctx.arc(window.missionMarker.x,window.missionMarker.y,45+p,0,6.28);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle='#f80';ctx.beginPath();ctx.arc(window.missionMarker.x,window.missionMarker.y,45+p,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#f80';ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.fillText('4',window.missionMarker.x,window.missionMarker.y+10);if(dist(player,window.missionMarker)<120){ctx.fillStyle='#fff';ctx.font='14px Arial';ctx.fillText('Подойди ближе',window.missionMarker.x,window.missionMarker.y-55);}ctx.restore();arrow4(ctx,W,H,window.missionMarker.x,window.missionMarker.y);return;}
 if(M4.phase==='active'&&convoy){ctx.save();ctx.translate(-camera.x,-camera.y);ctx.translate(convoy.x,convoy.y);ctx.rotate(convoy.angle);ctx.fillStyle='#caa030';ctx.fillRect(-32,-15,64,30);ctx.fillStyle='#8a6a10';ctx.fillRect(-32,-15,18,30);ctx.fillStyle='#fff';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('$',6,5);ctx.restore();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(convoy.x-26,convoy.y-26,52,4);ctx.fillStyle='#f80';ctx.fillRect(convoy.x-26,convoy.y-26,52*(convoy.hp/convoy.maxHp),4);arrow4(ctx,W,H,convoy.x,convoy.y);}}
function renderMission4HUD(ctx,W,H){if(M4.phase!=='active')return;var pX=W-330,pY=300,pW=310;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(pX,pY,pW,30+M4.objectives.length*28);ctx.strokeStyle='rgba(255,140,0,.5)';ctx.lineWidth=1;ctx.strokeRect(pX,pY,pW,30+M4.objectives.length*28);ctx.fillStyle='#f80';ctx.font='bold 14px Arial';ctx.textAlign='left';ctx.fillText('🚚 Конвой',pX+10,pY+20);M4.objectives.forEach(function(o,i){var y=pY+45+i*28;if(o.done){ctx.fillStyle='#4c4';ctx.font='13px Arial';ctx.fillText('✅ '+o.text,pX+10,y);}else if(i===M4.cur){ctx.fillStyle='#ff0';ctx.font='bold 13px Arial';ctx.fillText('▶ '+o.text,pX+10,y);}else{ctx.fillStyle='#888';ctx.font='13px Arial';ctx.fillText('○ '+o.text,pX+10,y);}});}
var _u4=window.updateMission;window.updateMission=function(){if(_u4)_u4();updateMission4();};
var _r4=window.renderMissionHUD;window.renderMissionHUD=function(c,W,H){renderMission4World(c,W,H);if(_r4)_r4(c,W,H);renderMission4HUD(c,W,H);};
window.missionRestarters=window.missionRestarters||[];
window.missionRestarters.push(function(){if(M4.phase==='active'){resetM4();showMission('🔁 Миссия 4 начата заново',2000);}});
window.M4=M4;
console.log('4scene v1 ЗАГРУЖЕН');
})();
// ====== 4scene.js КОНЕЦ ======
