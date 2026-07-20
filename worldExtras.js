// ====== worldExtras.js НАЧАЛО ======
(function(){
var CYCLE=86400;
window.interiorOpen=null;
window.bridgesOpen=false;
window.mapPins=[];
window.extraContacts=window.extraContacts||[];
window.skyAlpha=function(d){var h=d*24;if(h>=7&&h<17)return 0;if(h>=17&&h<19)return .12+(h-17)/2*.2;if(h>=19||h<5)return .5;if(h>=5&&h<7)return .5-(h-5)/2*.4;return 0;};
window.skyRGB=function(d){var h=d*24;if(h>=17&&h<19)return '70,25,10';if(h>=5&&h<7)return '70,35,25';return '8,8,30';};
window.applySleep=function(){player.health=100;var target=Math.floor(7/24*CYCLE);gameTime=Math.floor(gameTime/CYCLE)*CYCLE+target;dayTime=(gameTime%CYCLE)/CYCLE;if(typeof window.fishState!=='undefined'){window.fishState.tired=false;window.fishState.count=0;window.fishState.day=curDay();window.fishState.limit=randInt(5,10);}showMessage('😴 Ты поспал. Здоровье и силы восстановлены.',2500);playSFX('pickup');};
var BS=BLOCK*TILE, RC=ROAD_W*TILE;
var PROLIV=3, RIVER=12, PED=[8,8];
var bridgeN={x:8*BS, y:PROLIV*BS-32, w:RC, h:BS+64};
var bridgeS={x:8*BS, y:RIVER*BS-32,  w:RC, h:BS+64};
window.bridges=[];
var SHOP_DEFS={weapon:{bi:6,bj:6,color:'#f80',icon:'🔫',label:'ОРУЖЕЙНЫЙ'},clothes:{bi:9,bj:6,color:'#f0a',icon:'👕',label:'ОДЕЖДА'},home:{bi:2,bj:4,color:'#4c4',icon:'🏠',label:'ДОМ'},barber:{bi:7,bj:9,color:'#f8f',icon:'💈',label:'ПАРИКМАХЕРСКАЯ'}};
var shopDoors={};var sleepSpot={x:0,y:0};
var PARK_BLOCKS=[[5,5],[8,5],[5,10],[10,5],[7,7]];
var parkTrees=[],parkPaths=[];
var heli=null,tanks=[],heliT=0,tankT=0;
var fishState={count:0,limit:0,tired:false,day:-1,casting:false,castT:0,bx:0,by:0};
function curDay(){return Math.floor(gameTime/CYCLE);}
function nearWater(px,py){if(typeof isInWater!=='function')return false;for(var a=0;a<8;a++){var ang=a*Math.PI/4;if(isInWater(px+Math.cos(ang)*30,py+Math.sin(ang)*30))return true;}return false;}
function waterBand(y){if(y<1*BS)return 0;if(y>=PROLIV*BS&&y<(PROLIV+1)*BS)return 1;if(y>=RIVER*BS&&y<(RIVER+1)*BS)return 2;if(y>=15*BS)return 3;return -1;}
function pushPlayerFromWater(){var y=player.y,shore;if(y<1*BS)shore=1*BS+RC;else if(y<(PROLIV+1)*BS)shore=(y-PROLIV*BS<BS/2)?PROLIV*BS-14:(PROLIV+1)*BS+RC;else if(y<(RIVER+1)*BS)shore=(y-RIVER*BS<BS/2)?RIVER*BS-14:(RIVER+1)*BS+RC;else shore=15*BS-14;player.y=clamp(shore,0,WORLD_H);player.x=clamp(player.x,RC,WORLD_W-RC);}
function relocateFromWater(o){
 if(typeof isInWater==='function' && !isInWater(o.x,o.y))return;
 o.y = (o.y < 8*BS) ? (PROLIV+1)*BS+RC : (RIVER+1)*BS+RC;
 o.x = clamp(o.x, RC, WORLD_W-RC); o.angle=0; if(o.speed===undefined)o.speed=2;
}
window.onWorldReady=function(){
 window.mapPins=[];
 for(var bx=0;bx<MAP_BLOCKS;bx++){window.clearBlock(bx,PROLIV);window.clearBlock(bx,RIVER);}
 window.clearBlock(PED[0],PED[1]);
 for(var k in SHOP_DEFS){var d=SHOP_DEFS[k];window.clearBlock(d.bi,d.bj);var bx=d.bi*BS+RC+16,by=d.bj*BS+RC+16;buildings.push({x:bx,y:by,w:130,h:120,color:'#5a5a6a',roofColor:'#333',_shop:k});shopDoors[k]={x:bx-8,y:by+60};window.mapPins.push({x:shopDoors[k].x,y:shopDoors[k].y,color:d.color,label:d.label});}
 sleepSpot.x=9*BS+RC+40; sleepSpot.y=8*BS+RC+40;
 parkTrees.length=0;parkPaths.length=0;
 PARK_BLOCKS.forEach(function(pb){window.clearBlock(pb[0],pb[1]);var px=pb[0]*BS+RC,py=pb[1]*BS+RC,pw=BS-RC*2,ph=BS-RC*2;parks.push({x:px,y:py,w:pw,h:ph,_decor:true});parkPaths.push({x:px,y:py,w:pw,h:ph});for(var t=0;t<14;t++){parkTrees.push({x:px+rand(14,pw-14),y:py+rand(14,ph-14),r:rand(9,15)});}});
 waterBodies.push({x:0,y:PROLIV*BS,w:WORLD_W,h:BS,_proliv:true});
 waterBodies.push({x:0,y:RIVER*BS,w:WORLD_W,h:BS,_river:true});
 (trafficVehicles||[]).forEach(function(v){v.driver=true;});
 var pedX=PED[0]*BS+RC/2;
 for(var s=0;s<30;s++){var y=rand(PED[1]*BS+RC,(PED[1]+1)*BS-RC);npcs.push({x:pedX+rand(-20,20),y:y,angle:Math.random()<.5?Math.PI/2:-Math.PI/2,speed:rand(.5,1.3),health:100,alive:true,color:['#e88','#8e8','#88e','#ee8','#fa8','#a8f'][randInt(0,5)],shirt:['#c44','#4c4','#44c','#cc4','#fff','#888'][randInt(0,5)],turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:pedX,homeY:y,atHome:false,bound:false});}
 for(var s=0;s<40;s++){var horiz=Math.random()<.5,ri=randInt(0,MAP_BLOCKS),al=rand(0,WORLD_W);var x,y;if(horiz){x=al;y=ri*BS+RC/2;}else{x=ri*BS+RC/2;y=al;}npcs.push({x:x,y:y,angle:rand(0,6.28),speed:rand(.5,1.4),health:100,alive:true,color:['#e88','#8e8','#88e','#ee8','#fa8','#a8f'][randInt(0,5)],shirt:['#c44','#4c4','#44c','#cc4','#fff','#888'][randInt(0,5)],turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:x,homeY:y,atHome:false,bound:false});}
 (vehicles||[]).forEach(relocateFromWater);
 (trafficVehicles||[]).forEach(function(t){relocateFromWater(t);if(Math.abs(t.speed)<0.5)t.speed=2;});
 (npcs||[]).forEach(relocateFromWater);
 heli=null;tanks.length=0;heliT=0;tankT=0;fishState.day=curDay();fishState.limit=randInt(5,10);fishState.count=0;fishState.tired=false;fishState.casting=false;
 if(!window.extraContacts.some(function(c){return c.id==='victor';}))window.extraContacts.push({id:'victor',name:'🧔 Виктор',tel:'+1 555 0101',lines:['Виктор: Йо, Рэй! Как сам?','Рэй: Нормально, Виктор. Ты как?','Виктор: Держусь. Ты мне теперь как брат, помни это.','Виктор: Если что — звони, я всегда на связи.']});
 if(!document.getElementById('s4scene')){var sc=document.createElement('script');sc.id='s4scene';sc.src='4scene.js';document.body.appendChild(sc);}
 console.log('worldExtras v10 ЗАГРУЖЕН');
};
function frontBad(x,y,a){var fx=x+Math.cos(a)*30,fy=y+Math.sin(a)*30;return (typeof isInWater==='function'&&isInWater(fx,fy))||(typeof collidesBuilding==='function'&&collidesBuilding(fx,fy,18));}
function trafficFix(){for(var i=0;i<trafficVehicles.length;i++){var t=trafficVehicles[i];if(t.occupied)continue;if(typeof isInWater==='function'&&isInWater(t.x,t.y)){relocateFromWater(t);continue;}if(frontBad(t.x,t.y,t.angle)){t.angle+=(Math.random()<.5?1:-1)*Math.PI/2;if(frontBad(t.x,t.y,t.angle))t.angle+=Math.PI;t.speed=Math.max(t.speed,2);}else if(Math.abs(t.speed)<0.6){t.speed=2;}}}
function policeUnstuck(){for(var i=0;i<policeVehicles.length;i++){var p=policeVehicles[i];if(p.leaving)continue;if(typeof isInWater==='function'&&isInWater(p.x,p.y)){p.y=(p.y<8*BS)?(PROLIV+1)*BS+RC:(RIVER+1)*BS+RC;p.x=clamp(p.x,RC,WORLD_W-RC);}if(frontBad(p.x,p.y,p.angle)){p.angle+=(Math.random()<.5?1:-1)*1.3;p.speed=Math.max(p.speed,2);}}}
function hostileAI(){var st=Math.floor(player.wanted);for(var i=0;i<npcs.length;i++){var n=npcs[i];if(!n.hostile||!n.alive)continue;if(st<=0&&!n.angryDriver){n.hostile=false;continue;}n.atHome=false;n.fleeing=false;var d=dist(n,player);n.angle=angleTo(n,player);if(d>120){var nx=n.x+Math.cos(n.angle)*1.3,ny=n.y+Math.sin(n.angle)*1.3;if(typeof collidesBuilding!=='function'||!collidesBuilding(nx,ny,8)){n.x=nx;n.y=ny;}}n.x=clamp(n.x,0,WORLD_W);n.y=clamp(n.y,0,WORLD_H);n.shootT=(n.shootT||60)-1;if(d<300&&n.shootT<=0){n.shootT=45+rand(0,40);shoot(n.x+Math.cos(n.angle)*12,n.y+Math.sin(n.angle)*12,n.angle+rand(-.12,.12),7,300,'police');playSFX('shoot');}n.animTimer++;if(n.animTimer>8){n.animTimer=0;n.animFrame=(n.animFrame+1)%4;}}}
function spawnSoldier(x,y){npcs.push({x:x+rand(-20,20),y:y+rand(-20,20),angle:0,speed:1,health:60,alive:true,color:'#dba',shirt:'#353',turnTimer:999,fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:x,homeY:y,atHome:false,bound:false,hostile:true,shootT:40});}
function heliLogic(){var st=Math.floor(player.wanted);
 if(st>=4){heliT--;if(!heli&&heliT<=0){var a=rand(0,6.28);heli={x:player.x+Math.cos(a)*700,y:player.y+Math.sin(a)*700,angle:0,hp:120,shootT:60,rot:0};}}
 else if(heli){heli.leave=true;}
 if(heli){heli.rot+=0.4;var d=dist(heli,player);heli.angle=angleTo(heli,player);if(heli.leave){heli.x+=Math.cos(heli.angle+Math.PI)*5;heli.y+=Math.sin(heli.angle+Math.PI)*5;if(d>1400)heli=null;}else{if(d>180){heli.x+=Math.cos(heli.angle)*3.2;heli.y+=Math.sin(heli.angle)*3.2;}heli.shootT--;if(heli.shootT<=0&&d<400){heli.shootT=35;shoot(heli.x,heli.y,angleTo(heli,player)+rand(-.1,.1),8,400,'police');playSFX('shoot');}}}
 if(st>=5){tankT--;if(tankT<=0&&tanks.length<2){tankT=400;var a2=rand(0,6.28);tanks.push({x:player.x+Math.cos(a2)*600,y:player.y+Math.sin(a2)*600,angle:0,hp:300,shootT:80,soldT:120,leave:false});}}
 else {for(var q=0;q<tanks.length;q++)tanks[q].leave=true;}
 for(var i=tanks.length-1;i>=0;i--){var tk=tanks[i];var d2=dist(tk,player);
  if(tk.leave){var aw=angleTo(tk,player)+Math.PI;tk.x+=Math.cos(aw)*2.2;tk.y+=Math.sin(aw)*2.2;if(d2>1400||tk.x<0||tk.x>WORLD_W||tk.y<0||tk.y>WORLD_H)tanks.splice(i,1);continue;}
  tk.angle=angleTo(tk,player);if(d2>140){var nx=tk.x+Math.cos(tk.angle)*1.1,ny=tk.y+Math.sin(tk.angle)*1.1;if(typeof collidesBuilding!=='function'||!collidesBuilding(nx,ny,24)){tk.x=nx;tk.y=ny;}}if(typeof isInWater==='function'&&isInWater(tk.x,tk.y)){tk.y=(tk.y<8*BS)?(PROLIV+1)*BS+RC:(RIVER+1)*BS+RC;}tk.shootT--;if(tk.shootT<=0&&d2<500){tk.shootT=70;shoot(tk.x+Math.cos(tk.angle)*26,tk.y+Math.sin(tk.angle)*26,tk.angle+rand(-.06,.06),14,500,'police');playSFX('explosion');}tk.soldT--;if(tk.soldT<=0&&d2<400){tk.soldT=160;spawnSoldier(tk.x,tk.y);}if(tk.hp<=0){createExplosion(tk.x,tk.y);tanks.splice(i,1);player.money+=200;}}}
function heliTankHit(){for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];if(b.owner!=='player')continue;
 if(heli&&!heli.leave&&dist(b,heli)<24){heli.hp-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);bullets.splice(i,1);if(heli.hp<=0){createExplosion(heli.x,heli.y);heli=null;player.money+=150;}continue;}
 for(var j=tanks.length-1;j>=0;j--){if(!tanks[j].leave&&dist(b,tanks[j])<30){tanks[j].hp-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);bullets.splice(i,1);break;}}}}
function checkHit(){
 if(!player.alive||player.inVehicle||player.swimming)return;
 var all=(trafficVehicles||[]).concat(policeVehicles||[]);
 for(var i=0;i<all.length;i++){var v=all[i];var sp=Math.abs(v.speed||0);if(sp>0.6&&dist(v,player)<26){
   var a=angleTo(v,player);var knock=sp*2.4;player.x+=Math.cos(a)*knock;player.y+=Math.sin(a)*knock;
   spawnParticles(player.x,player.y,'#f00',6,3);if(typeof addBlood==='function')addBlood(player.x,player.y);playSFX('hit');
   if(sp>4.0){damagePlayer(9999);showMessage('🚗 ТЕБЯ СБИЛА МАШИНА!',2500);}
   else{var dmg=Math.round(sp*4);damagePlayer(dmg);showMessage('🚗 Удар машиной! -'+dmg+' HP',1300);}
   return;}}
}
function canFish(){return player.alive&&!player.inVehicle&&!window.interiorOpen&&!(window.cutsceneSystem&&window.cutsceneSystem.active)&&!player.swimming&&nearWater(player.x,player.y);}
function doCast(){if(fishState.tired){showMessage('😩 Ты устал от рыбалки. Поспи или приходи завтра.',2200);return;}if(fishState.day!==curDay()){fishState.day=curDay();fishState.count=0;fishState.limit=randInt(5,10);fishState.tired=false;}fishState.casting=true;fishState.castT=70+randInt(0,60);fishState.bx=player.x+Math.cos(player.angle)*32;fishState.by=player.y+Math.sin(player.angle)*32;showMessage('🎣 Забросил удочку... жди поклёвки',1300);}
function fishUpdate(){var cd=curDay();if(fishState.day!==-1&&fishState.day!==cd){fishState.day=cd;fishState.count=0;fishState.limit=randInt(5,10);fishState.tired=false;}if(fishState.casting){fishState.castT--;if(fishState.castT<=0){fishState.casting=false;if(Math.random()<0.78){if(fishState.count<fishState.limit){fishState.count++;player.money+=10;showMessage('🐟 Поймал рыбу! +$10  ('+fishState.count+'/'+fishState.limit+')',1900);playSFX('pickup');spawnParticles(fishState.bx,fishState.by,'#9cf',6,2);}else{fishState.tired=true;showMessage('😩 Устал от рыбалки на сегодня. Поспи или приходи завтра!',2600);}}else{showMessage('🎣 Ничего не клюнуло...',1400);}}}}
function hijackCheck(){
 if(player.inVehicle||window.interiorOpen||(window.cutsceneSystem&&window.cutsceneSystem.active)||!player.alive)return false;
 var best=null,bd=55;for(var i=0;i<trafficVehicles.length;i++){var v=trafficVehicles[i];if(v.driver&&!v.occupied&&Math.abs(v.speed)>1.0){var d=dist(player,v);if(d<bd){bd=d;best=v;}}}
 if(!best)return false;
 var ang=best.angle+Math.PI/2;var dx=Math.cos(ang)*22,dy=Math.sin(ang)*22;
 var angry=Math.random()<0.5;
 npcs.push({x:best.x+dx,y:best.y+dy,angle:best.angle,health:60,alive:true,color:'#fca',shirt:angry?'#a33':'#888',turnTimer:200,fleeing:!angry,fleeAngle:best.angle+Math.PI,animFrame:0,animTimer:0,homeX:best.x,homeY:best.y,atHome:false,bound:false,hostile:angry,angryDriver:angry,shootT:50});
 best.driver=false;best.occupied=true;best.speed*=0.4;player.inVehicle=best;
 showMessage(angry?'🚗 Угнал! Водитель в ярости — берегись!':'🚗 Угнал машину! Водитель сбежал.',2200);playSFX('car_enter');addWanted(0.5);
 return true;
}
function tickExtras(){if(typeof lobbyActive!=='undefined'&&lobbyActive)return;if(typeof gameStarted!=='undefined'&&!gameStarted)return;if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 window.bridgesOpen=!!(window.M5&&(window.M5.phase==='free'||window.M5.phase==='done'));
 window.bridges=window.bridgesOpen?[bridgeN,bridgeS]:[];
 if(typeof player!=='undefined'&&player&&player.alive&&!player.inVehicle&&typeof isInWater==='function'&&isInWater(player.x,player.y)&&waterBand(player.y)!==-1){pushPlayerFromWater();}
 if(window.M3&&window.M3.phase==='free'&&!window.extraContacts.some(function(c){return c.id==='girl';})){window.extraContacts.push({id:'girl',name:'👧 Аня',tel:'+1 555 0202',lines:['Аня: Алло? Это ты?! Я так рада слышать тебя!','Рэй: Привет, Аня. Как ты, в порядке?','Аня: Да, уже не боюсь. Спасибо тебе ещё раз...','Аня: Ты настоящий герой. Береги себя, ладно?']});showMessage('📞 Аня добавила свой номер в телефон!',2600);}
 trafficFix();policeUnstuck();hostileAI();heliLogic();heliTankHit();fishUpdate();checkHit();}
setInterval(tickExtras,16);
function drawDoor(ctx,x,y,color,icon,label,near){var p=Math.sin(gameTime*.08)*4;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,26+p,0,6.28);ctx.stroke();ctx.globalAlpha=.15;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,26+p,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.font='22px Arial';ctx.textAlign='center';ctx.fillText(icon,x,y+8);ctx.fillStyle=color;ctx.font='bold 11px Arial';ctx.fillText(label,x,y-32);if(near){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] войти',x,y+44);}}
function drawBridge(ctx,b,label,open){
 ctx.fillStyle='#3a2a18';ctx.fillRect(b.x-6,b.y,b.w+12,b.h);
 ctx.fillStyle=open?'#8a6a3a':'#5a4a3a';ctx.fillRect(b.x,b.y,b.w,b.h);
 ctx.strokeStyle='#5a4020';ctx.lineWidth=2;for(var yy=b.y;yy<b.y+b.h;yy+=14){ctx.beginPath();ctx.moveTo(b.x,yy);ctx.lineTo(b.x+b.w,yy);ctx.stroke();}
 ctx.fillStyle='#444';ctx.fillRect(b.x-8,b.y,4,b.h);ctx.fillRect(b.x+b.w+4,b.y,4,b.h);
 if(!open){ctx.fillStyle='#d33';ctx.fillRect(b.x-10,b.y+b.h/2-8,b.w+20,16);ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.save();ctx.translate(b.x+b.w/2,b.y+b.h/2+3);ctx.rotate(Math.PI/2);ctx.fillText('🚧 ЗАКРЫТО',0,0);ctx.restore();}
}
function drawPlane(ctx,x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#ddd';ctx.fillRect(-22,-5,44,10);ctx.fillStyle='#bbb';ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(6,-22);ctx.lineTo(12,-22);ctx.lineTo(4,-5);ctx.fill();ctx.beginPath();ctx.moveTo(-4,5);ctx.lineTo(6,22);ctx.lineTo(12,22);ctx.lineTo(4,5);ctx.fill();ctx.fillStyle='#999';ctx.beginPath();ctx.moveTo(-22,-3);ctx.lineTo(-30,-12);ctx.lineTo(-26,-12);ctx.lineTo(-18,-3);ctx.fill();ctx.beginPath();ctx.moveTo(-22,3);ctx.lineTo(-30,12);ctx.lineTo(-26,12);ctx.lineTo(-18,3);ctx.fill();ctx.fillStyle='#48f';ctx.fillRect(14,-3,6,6);ctx.restore();}
function drawHeliStat(ctx,x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#484';ctx.fillRect(-14,-6,28,12);ctx.fillStyle='#363';ctx.fillRect(-26,-2,12,4);ctx.strokeStyle='rgba(200,200,200,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(20,0);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(0,18);ctx.stroke();ctx.restore();}
window.renderGroundExtras=function(ctx){
 var open=window.bridgesOpen;
 drawBridge(ctx,bridgeN,'СЕВЕРНЫЙ МОСТ',open);
 drawBridge(ctx,bridgeS,'ЮЖНЫЙ МОСТ',open);
 if(typeof camera!=='undefined'){var cx=camera.x,cy=camera.y,W=canvas.width,H=canvas.height;ctx.fillStyle='#14507e';
  if(cy<0)ctx.fillRect(cx,cy,W,-cy);
  if(cy+H>WORLD_H)ctx.fillRect(cx,WORLD_H,W,cy+H-WORLD_H);
  if(cx<0)ctx.fillRect(cx,cy,-cx,H);
  if(cx+W>WORLD_W)ctx.fillRect(WORLD_W,cy,cx+W-WORLD_W,H);}
 var ax=6*BS+RC,ay=14*BS+RC,aw=4*BS,ah=BS-RC*2;
 ctx.fillStyle='#3a3a3a';ctx.fillRect(ax,ay,aw,ah);
 ctx.fillStyle='#eee';ctx.setLineDash([24,24]);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ax+10,ay+ah/2);ctx.lineTo(ax+aw-10,ay+ah/2);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle='#fc0';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('✈️ АЭРОПОРТ ЛОС-РИО',ax+aw/2,ay-8);
 drawPlane(ctx,ax+aw*0.25,ay+ah*0.30,0.2);drawPlane(ctx,ax+aw*0.6,ay+ah*0.7,-0.1);drawHeliStat(ctx,ax+aw*0.85,ay+ah*0.35);
 var px0=PED[0]*BS+RC,py0=PED[1]*BS+RC,pw0=BS-RC*2;
 ctx.fillStyle='#b8a070';ctx.fillRect(px0,py0,pw0,BS-RC*2);
 ctx.strokeStyle='#8a7040';ctx.lineWidth=1;for(var yy=py0;yy<py0+pw0;yy+=16){ctx.beginPath();ctx.moveTo(px0,yy);ctx.lineTo(px0+pw0,yy);ctx.stroke();}
 ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.save();ctx.translate(px0+pw0/2,py0+pw0/2);ctx.rotate(Math.PI/2);ctx.fillText('ПЕШЕХОДНАЯ АЛЛЕЯ',0,3);ctx.restore();
 parkPaths.forEach(function(p){ctx.fillStyle='#c9b48a';ctx.fillRect(p.x+p.w/2-5,p.y,10,p.h);ctx.fillRect(p.x,p.y+p.h/2-5,p.w,10);});
 parkTrees.forEach(function(t){ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.arc(t.x+3,t.y+3,t.r,0,6.28);ctx.fill();ctx.fillStyle='#1a4a1a';ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,6.28);ctx.fill();ctx.fillStyle='#2e7a2e';ctx.beginPath();ctx.arc(t.x-2,t.y-2,t.r*0.6,0,6.28);ctx.fill();});
 tanks.forEach(function(tk){ctx.save();ctx.translate(tk.x,tk.y);ctx.rotate(tk.angle);ctx.fillStyle='#3a4030';ctx.fillRect(-26,-16,52,32);ctx.fillStyle='#4a5040';ctx.beginPath();ctx.arc(0,0,12,0,6.28);ctx.fill();ctx.fillStyle='#2a3020';ctx.fillRect(8,-3,24,6);ctx.restore();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(tk.x-20,tk.y-26,40,4);ctx.fillStyle='#f44';ctx.fillRect(tk.x-20,tk.y-26,40*(tk.hp/300),4);});
 if(heli){ctx.save();ctx.translate(heli.x,heli.y);ctx.fillStyle='#444';ctx.fillRect(-14,-6,28,12);ctx.strokeStyle='rgba(200,200,200,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-22*Math.cos(heli.rot),-2);ctx.lineTo(22*Math.cos(heli.rot),-2);ctx.stroke();ctx.beginPath();ctx.moveTo(-22*Math.sin(heli.rot),-2);ctx.lineTo(22*Math.sin(heli.rot),-2);ctx.stroke();ctx.fillStyle='#f00';ctx.fillRect(-2,8,4,4);ctx.restore();}
 if(fishState.casting){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(fishState.bx,fishState.by);ctx.stroke();ctx.fillStyle='#f33';ctx.beginPath();ctx.arc(fishState.bx,fishState.by+Math.sin(gameTime*.2)*2,4,0,6.28);ctx.fill();}
 if(canFish()){ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillStyle='#9cf';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🎣 [E] Рыбалка',player.x,player.y-30);ctx.restore();}
 ctx.textAlign='center';
 ctx.fillStyle='#cfc';ctx.font='bold 22px Arial';ctx.fillText('🏝️ ДИКИЙ ОСТРОВ',WORLD_W/2,1*BS+70);
 ctx.fillStyle='#cfe';ctx.font='italic 22px Arial';ctx.fillText('р. Лос-Рио',WORLD_W/2,RIVER*BS+BS/2+8);
};
var _wr=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){
 if(_wr)_wr(ctx,W,H);
 if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 ctx.save();ctx.translate(-camera.x,-camera.y);
 for(var k in shopDoors){var d=shopDoors[k],def=SHOP_DEFS[k];drawDoor(ctx,d.x,d.y,def.color,def.icon,def.label,dist(player,d)<45);}
 var sn=dist(player,sleepSpot)<45;ctx.fillStyle='#8af';ctx.fillRect(sleepSpot.x-14,sleepSpot.y-8,28,16);ctx.fillStyle='#fff';ctx.fillRect(sleepSpot.x-14,sleepSpot.y-8,8,16);var sp2=Math.sin(gameTime*.08)*4;ctx.strokeStyle='#8af';ctx.lineWidth=2;ctx.beginPath();ctx.arc(sleepSpot.x,sleepSpot.y,24+sp2,0,6.28);ctx.stroke();ctx.font='18px Arial';ctx.textAlign='center';ctx.fillText('🛏️',sleepSpot.x,sleepSpot.y-26);if(sn){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] спать',sleepSpot.x,sleepSpot.y+34);}
 ctx.restore();
 var s=180/WORLD_W;for(var k in shopDoors){miniCtx.fillStyle=SHOP_DEFS[k].color;miniCtx.fillRect(shopDoors[k].x*s-2,shopDoors[k].y*s-2,5,5);}miniCtx.fillStyle='#8af';miniCtx.fillRect(sleepSpot.x*s-2,sleepSpot.y*s-2,5,5);
 ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText('worldExtras v10',8,H-6);
 if(fishState.tired){ctx.fillStyle='#fa0';ctx.fillText('🎣 рыбалка: устал',8,H-20);}else if(typeof fishState.limit!=='undefined'&&fishState.limit>0){ctx.fillStyle='#9cf';ctx.fillText('🎣 рыба '+fishState.count+'/'+fishState.limit,8,H-20);}
 if(window.interiorOpen==='sleep'){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#8af';ctx.font='bold 40px Arial';ctx.fillText('🛏️ ОТДОХНУТЬ',W/2,H/2-40);ctx.fillStyle='#fff';ctx.font='20px Arial';ctx.fillText('Поспать до утра и восстановить здоровье и силы',W/2,H/2+10);ctx.fillStyle='#fc0';ctx.font='bold 22px Arial';ctx.fillText('[ENTER] Спать     [ESC] Отмена',W/2,H/2+60);}
};
window.drawMapLabels=function(ctx,SX,SY){
 (window.mapPins||[]).forEach(function(p){ctx.fillStyle=p.color;ctx.fillRect(SX(p.x)-6,SY(p.y)-6,12,12);ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.strokeRect(SX(p.x)-6,SY(p.y)-6,12,12);ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText(p.label,SX(p.x),SY(p.y)-10);});
 ctx.textAlign='center';ctx.fillStyle='#cfc';ctx.font='italic 20px Arial';ctx.fillText('🏝️ ДИКИЙ ОСТРОВ',SX(WORLD_W*0.5),SY(1*BS));ctx.fillStyle='#9cf';ctx.font='italic 22px Arial';ctx.fillText('р. Лос-Рио',SX(WORLD_W*0.5),SY(RIVER*BS+BS/2));ctx.fillStyle='#fc0';ctx.font='bold 16px Arial';ctx.fillText('✈️ АЭРОПОРТ',SX(8*BS),SY(14.5*BS));
};
function tryOpen(){for(var k in shopDoors){if(dist(player,shopDoors[k])<45)return k;}if(dist(player,sleepSpot)<45)return 'sleep';return null;}
addEventListener('keydown',function(e){
 if(window.interiorOpen==='sleep'){if(e.code==='Enter'||e.code==='Space'||e.code==='KeyE'){window.applySleep();window.interiorOpen=null;}if(e.code==='Escape')window.interiorOpen=null;e.stopImmediatePropagation();e.preventDefault();return;}
 if(window.interiorOpen===null&&e.code==='KeyF'){if(hijackCheck()){e.stopImmediatePropagation();e.preventDefault();}return;}
 if(window.interiorOpen===null&&e.code==='KeyE'){var d=tryOpen();if(d==='sleep'){window.interiorOpen='sleep';e.stopImmediatePropagation();e.preventDefault();return;}if(d==='weapon'&&window.openWeaponShop){window.openWeaponShop();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='clothes'&&window.openClothesShop){window.openClothesShop();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='home'&&window.openHome){window.openHome();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='barber'&&window.openBarber){window.openBarber();e.stopImmediatePropagation();e.preventDefault();return;}if(canFish()){doCast();e.stopImmediatePropagation();e.preventDefault();return;}}
},true);
window.shopDoors=shopDoors;window.sleepSpot=sleepSpot;
})();
// ====== worldExtras.js КОНЕЦ ======
