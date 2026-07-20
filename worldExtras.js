// ====== worldExtras.js НАЧАЛО ======
(function(){
var CYCLE=86400;
window.interiorOpen=null;
window.skyAlpha=function(d){var h=d*24;if(h>=7&&h<17)return 0;if(h>=17&&h<19)return .12+(h-17)/2*.2;if(h>=19||h<5)return .5;if(h>=5&&h<7)return .5-(h-5)/2*.4;return 0;};
window.skyRGB=function(d){var h=d*24;if(h>=17&&h<19)return '70,25,10';if(h>=5&&h<7)return '70,35,25';return '8,8,30';};
window.applySleep=function(){player.health=100;var target=Math.floor(7/24*CYCLE);gameTime=Math.floor(gameTime/CYCLE)*CYCLE+target;dayTime=(gameTime%CYCLE)/CYCLE;showMessage('😴 Ты поспал. Здоровье восстановлено.',2500);playSFX('pickup');};
var BS=BLOCK*TILE, RC=ROAD_W*TILE;
var PROLIV=3, RIVER=12, PED=[8,8];
var bridgeN={x:8*BS, y:PROLIV*BS-32, w:RC, h:BS+64};
var bridgeS={x:8*BS, y:RIVER*BS-32,  w:RC, h:BS+64};
window.bridges=[bridgeN,bridgeS];
var SHOP_DEFS={weapon:{bi:6,bj:6,color:'#f80',icon:'🔫',label:'ОРУЖЕЙНЫЙ'},clothes:{bi:9,bj:6,color:'#f0a',icon:'👕',label:'ОДЕЖДА'},home:{bi:6,bj:9,color:'#4c4',icon:'🏠',label:'ДОМ'}};
var shopDoors={};var sleepSpot={x:0,y:0};
var PARK_BLOCKS=[[5,5],[8,5],[5,10],[10,5],[7,7]];
var parkTrees=[],parkPaths=[];
var heli=null,tanks=[],heliT=0,tankT=0;
function relocateFromWater(o){
 if(typeof isInWater==='function' && !isInWater(o.x,o.y))return;
 o.y = (o.y < 8*BS) ? (PROLIV+1)*BS+RC : (RIVER+1)*BS+RC;
 o.x = clamp(o.x, RC, WORLD_W-RC); o.angle=0; if(o.speed===undefined)o.speed=0;
}
window.onWorldReady=function(){
 for(var bx=0;bx<MAP_BLOCKS;bx++){window.clearBlock(bx,PROLIV);window.clearBlock(bx,RIVER);}
 window.clearBlock(PED[0],PED[1]);
 for(var k in SHOP_DEFS){var d=SHOP_DEFS[k];window.clearBlock(d.bi,d.bj);var bx=d.bi*BS+RC+16,by=d.bj*BS+RC+16;buildings.push({x:bx,y:by,w:130,h:120,color:'#5a5a6a',roofColor:'#333',_shop:k});shopDoors[k]={x:bx-8,y:by+60};}
 sleepSpot.x=9*BS+RC+40; sleepSpot.y=8*BS+RC+40;
 parkTrees.length=0;parkPaths.length=0;
 PARK_BLOCKS.forEach(function(pb){window.clearBlock(pb[0],pb[1]);var px=pb[0]*BS+RC,py=pb[1]*BS+RC,pw=BS-RC*2,ph=BS-RC*2;parks.push({x:px,y:py,w:pw,h:ph,_decor:true});parkPaths.push({x:px,y:py,w:pw,h:ph});for(var t=0;t<14;t++){parkTrees.push({x:px+rand(14,pw-14),y:py+rand(14,ph-14),r:rand(9,15)});}});
 waterBodies.push({x:0,y:PROLIV*BS,w:bridgeN.x,h:BS,_proliv:true});
 waterBodies.push({x:bridgeN.x+bridgeN.w,y:PROLIV*BS,w:WORLD_W-(bridgeN.x+bridgeN.w),h:BS,_proliv:true});
 waterBodies.push({x:0,y:RIVER*BS,w:bridgeS.x,h:BS,_river:true});
 waterBodies.push({x:bridgeS.x+bridgeS.w,y:RIVER*BS,w:WORLD_W-(bridgeS.x+bridgeS.w),h:BS,_river:true});
 var pedX=PED[0]*BS+RC/2;
 for(var s=0;s<30;s++){var y=rand(PED[1]*BS+RC, (PED[1]+1)*BS-RC);var home=buildings[0],hd=1e9;for(var bi=0;bi<buildings.length;bi++){var b=buildings[bi];var dd=dist({x:pedX,y:y},{x:b.x+b.w/2,y:b.y+b.h/2});if(dd<hd){hd=dd;home=b;}}npcs.push({x:pedX+rand(-20,20),y:y,angle:Math.random()<.5?Math.PI/2:-Math.PI/2,speed:rand(.5,1.3),health:100,alive:true,color:['#e88','#8e8','#88e','#ee8','#fa8','#a8f'][randInt(0,5)],shirt:['#c44','#4c4','#44c','#cc4','#fff','#888'][randInt(0,5)],turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:pedX,homeY:y,atHome:false,bound:false});}
 for(var s=0;s<40;s++){var horiz=Math.random()<.5,ri=randInt(0,MAP_BLOCKS),al=rand(0,WORLD_W);var x,y;if(horiz){x=al;y=ri*BS+RC/2;}else{x=ri*BS+RC/2;y=al;}npcs.push({x:x,y:y,angle:rand(0,6.28),speed:rand(.5,1.4),health:100,alive:true,color:['#e88','#8e8','#88e','#ee8','#fa8','#a8f'][randInt(0,5)],shirt:['#c44','#4c4','#44c','#cc4','#fff','#888'][randInt(0,5)],turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:x,homeY:y,atHome:false,bound:false});}
 (vehicles||[]).forEach(relocateFromWater);
 (trafficVehicles||[]).forEach(relocateFromWater);
 (npcs||[]).forEach(relocateFromWater);
 heli=null;tanks.length=0;heliT=0;tankT=0;
 console.log('worldExtras v5 ЗАГРУЖЕН');
};
function checkHit(){
 if(!player.alive||player.inVehicle||player.swimming)return;
 var all=(trafficVehicles||[]).concat(policeVehicles||[]);
 for(var i=0;i<all.length;i++){var v=all[i];var sp=Math.abs(v.speed||0);if(sp>1.2&&dist(v,player)<28){if(typeof addBlood==='function')addBlood(player.x,player.y);spawnParticles(player.x,player.y,'#f00',10,3);showMission('🚗 ТЕБЯ СБИЛА МАШИНА!',2500);damagePlayer(9999);return;}}
}
function trafficFix(){for(var i=0;i<trafficVehicles.length;i++){var t=trafficVehicles[i];if(typeof isInWater==='function'&&isInWater(t.x,t.y)){relocateFromWater(t);}else if(Math.abs(t.speed)<0.5){t.speed=2;}}}
function hostileAI(){for(var i=0;i<npcs.length;i++){var n=npcs[i];if(!n.hostile||!n.alive)continue;n.atHome=false;n.fleeing=false;var d=dist(n,player);n.angle=angleTo(n,player);if(d>120){n.x+=Math.cos(n.angle)*1.3;n.y+=Math.sin(n.angle)*1.3;}n.x=clamp(n.x,0,WORLD_W);n.y=clamp(n.y,0,WORLD_H);n.shootT=(n.shootT||60)-1;if(d<300&&n.shootT<=0){n.shootT=45+rand(0,40);shoot(n.x+Math.cos(n.angle)*12,n.y+Math.sin(n.angle)*12,n.angle+rand(-.12,.12),7,300,'police');playSFX('shoot');}n.animTimer++;if(n.animTimer>8){n.animTimer=0;n.animFrame=(n.animFrame+1)%4;}}}
function spawnSoldier(x,y){npcs.push({x:x+rand(-20,20),y:y+rand(-20,20),angle:0,speed:1,health:60,alive:true,color:'#dba',shirt:'#353',turnTimer:999,fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:x,homeY:y,atHome:false,bound:false,hostile:true,shootT:40});}
function heliLogic(){var st=Math.floor(player.wanted);
 if(st>=4){heliT--;if(!heli&&heliT<=0){var a=rand(0,6.28);heli={x:player.x+Math.cos(a)*700,y:player.y+Math.sin(a)*700,angle:0,hp:120,shootT:60,rot:0};}}
 else if(heli){heli.leave=true;}
 if(heli){heli.rot+=0.4;var d=dist(heli,player);heli.angle=angleTo(heli,player);if(heli.leave){heli.x+=Math.cos(heli.angle+Math.PI)*5;heli.y+=Math.sin(heli.angle+Math.PI)*5;if(d>1400)heli=null;}else{if(d>180){heli.x+=Math.cos(heli.angle)*3.2;heli.y+=Math.sin(heli.angle)*3.2;}heli.shootT--;if(heli.shootT<=0&&d<400){heli.shootT=35;shoot(heli.x,heli.y,angleTo(heli,player)+rand(-.1,.1),8,400,'police');playSFX('shoot');}}}
 if(st>=5){tankT--;if(tankT<=0&&tanks.length<2){tankT=400;var a2=rand(0,6.28);tanks.push({x:player.x+Math.cos(a2)*600,y:player.y+Math.sin(a2)*600,angle:0,hp:300,shootT:80,soldT:120});}}
 for(var i=tanks.length-1;i>=0;i--){var tk=tanks[i];var d2=dist(tk,player);tk.angle=angleTo(tk,player);if(d2>140){var nx=tk.x+Math.cos(tk.angle)*1.1,ny=tk.y+Math.sin(tk.angle)*1.1;if(typeof collidesBuilding!=='function'||!collidesBuilding(nx,ny,24)){tk.x=nx;tk.y=ny;}}tk.shootT--;if(tk.shootT<=0&&d2<500){tk.shootT=70;shoot(tk.x+Math.cos(tk.angle)*26,tk.y+Math.sin(tk.angle)*26,tk.angle+rand(-.06,.06),14,500,'police');playSFX('explosion');}tk.soldT--;if(tk.soldT<=0&&d2<400){tk.soldT=160;spawnSoldier(tk.x,tk.y);}if(tk.hp<=0){createExplosion(tk.x,tk.y);tanks.splice(i,1);player.money+=200;}}
}
function heliTankHit(){for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];if(b.owner!=='player')continue;
 if(heli&&!heli.leave&&dist(b,heli)<24){heli.hp-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);bullets.splice(i,1);if(heli.hp<=0){createExplosion(heli.x,heli.y);heli=null;player.money+=150;}continue;}
 for(var j=tanks.length-1;j>=0;j--){if(dist(b,tanks[j])<30){tanks[j].hp-=b.damage;spawnParticles(b.x,b.y,'#fa0',3,2);bullets.splice(i,1);break;}}}}
function tickExtras(){trafficFix();hostileAI();heliLogic();heliTankHit();checkHit();}
function drawDoor(ctx,x,y,color,icon,label,near){var p=Math.sin(gameTime*.08)*4;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,26+p,0,6.28);ctx.stroke();ctx.globalAlpha=.15;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,26+p,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.font='22px Arial';ctx.textAlign='center';ctx.fillText(icon,x,y+8);ctx.fillStyle=color;ctx.font='bold 11px Arial';ctx.fillText(label,x,y-32);if(near){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] войти',x,y+44);}}
function drawBridge(ctx,b,label){
 ctx.fillStyle='#3a2a18';ctx.fillRect(b.x-6,b.y,b.w+12,b.h);
 ctx.fillStyle='#8a6a3a';ctx.fillRect(b.x,b.y,b.w,b.h);
 ctx.strokeStyle='#5a4020';ctx.lineWidth=2;for(var yy=b.y;yy<b.y+b.h;yy+=14){ctx.beginPath();ctx.moveTo(b.x,yy);ctx.lineTo(b.x+b.w,yy);ctx.stroke();}
 ctx.fillStyle='#444';ctx.fillRect(b.x-8,b.y,4,b.h);ctx.fillRect(b.x+b.w+4,b.y,4,b.h);
 for(var yy=b.y+10;yy<b.y+b.h;yy+=40){ctx.fillStyle='#333';ctx.fillRect(b.x-12,yy,4,8);ctx.fillRect(b.x+b.w+8,yy,4,8);}
 ctx.fillStyle='#fff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.save();ctx.translate(b.x+b.w/2,b.y+b.h/2);ctx.rotate(Math.PI/2);ctx.fillText(label,0,3);ctx.restore();
}
window.renderGroundExtras=function(ctx){
 drawBridge(ctx,bridgeN,'СЕВЕРНЫЙ МОСТ');
 drawBridge(ctx,bridgeS,'ЮЖНЫЙ МОСТ');
 var px0=PED[0]*BS+RC,py0=PED[1]*BS+RC,pw0=BS-RC*2;
 ctx.fillStyle='#b8a070';ctx.fillRect(px0,py0,pw0,BS-RC*2);
 ctx.strokeStyle='#8a7040';ctx.lineWidth=1;for(var yy=py0;yy<py0+pw0;yy+=16){ctx.beginPath();ctx.moveTo(px0,yy);ctx.lineTo(px0+pw0,yy);ctx.stroke();}
 ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.save();ctx.translate(px0+pw0/2,py0+pw0/2);ctx.rotate(Math.PI/2);ctx.fillText('ПЕШЕХОДНАЯ АЛЛЕЯ',0,3);ctx.restore();
 parkPaths.forEach(function(p){ctx.fillStyle='#c9b48a';ctx.fillRect(p.x+p.w/2-5,p.y,10,p.h);ctx.fillRect(p.x,p.y+p.h/2-5,p.w,10);});
 parkTrees.forEach(function(t){ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.arc(t.x+3,t.y+3,t.r,0,6.28);ctx.fill();ctx.fillStyle='#1a4a1a';ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,6.28);ctx.fill();ctx.fillStyle='#2e7a2e';ctx.beginPath();ctx.arc(t.x-2,t.y-2,t.r*0.6,0,6.28);ctx.fill();});
 tanks.forEach(function(tk){ctx.save();ctx.translate(tk.x,tk.y);ctx.rotate(tk.angle);ctx.fillStyle='#3a4030';ctx.fillRect(-26,-16,52,32);ctx.fillStyle='#4a5040';ctx.beginPath();ctx.arc(0,0,12,0,6.28);ctx.fill();ctx.fillStyle='#2a3020';ctx.fillRect(8,-3,24,6);ctx.restore();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(tk.x-20,tk.y-26,40,4);ctx.fillStyle='#f44';ctx.fillRect(tk.x-20,tk.y-26,40*(tk.hp/300),4);});
 if(heli){ctx.save();ctx.translate(heli.x,heli.y);ctx.fillStyle='#444';ctx.fillRect(-14,-6,28,12);ctx.strokeStyle='rgba(200,200,200,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-22*Math.cos(heli.rot),-2);ctx.lineTo(22*Math.cos(heli.rot),-2);ctx.stroke();ctx.beginPath();ctx.moveTo(-22*Math.sin(heli.rot),-2);ctx.lineTo(22*Math.sin(heli.rot),-2);ctx.stroke();ctx.fillStyle='#f00';ctx.fillRect(-2,8,4,4);ctx.restore();}
 ctx.textAlign='center';
 ctx.fillStyle='#cfc';ctx.font='bold 22px Arial';ctx.fillText('🏝️ ДИКИЙ ОСТРОВ',WORLD_W/2,1*BS+70);
 ctx.fillStyle='#cfe';ctx.font='italic 22px Arial';ctx.fillText('р. Лос-Рио',WORLD_W/2,RIVER*BS+BS/2+8);
};
var _wr=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){
 if(!window._extHooked && typeof update==='function'){window._extHooked=true;var _ou=window.update;window.update=function(){_ou();tickExtras();};}
 if(_wr)_wr(ctx,W,H);
 if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 ctx.save();ctx.translate(-camera.x,-camera.y);
 for(var k in shopDoors){var d=shopDoors[k],def=SHOP_DEFS[k];drawDoor(ctx,d.x,d.y,def.color,def.icon,def.label,dist(player,d)<45);}
 var sn=dist(player,sleepSpot)<45;ctx.fillStyle='#8af';ctx.fillRect(sleepSpot.x-14,sleepSpot.y-8,28,16);ctx.fillStyle='#fff';ctx.fillRect(sleepSpot.x-14,sleepSpot.y-8,8,16);var sp2=Math.sin(gameTime*.08)*4;ctx.strokeStyle='#8af';ctx.lineWidth=2;ctx.beginPath();ctx.arc(sleepSpot.x,sleepSpot.y,24+sp2,0,6.28);ctx.stroke();ctx.font='18px Arial';ctx.textAlign='center';ctx.fillText('🛏️',sleepSpot.x,sleepSpot.y-26);if(sn){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] спать',sleepSpot.x,sleepSpot.y+34);}
 ctx.restore();
 var s=180/WORLD_W;for(var k in shopDoors){miniCtx.fillStyle=SHOP_DEFS[k].color;miniCtx.fillRect(shopDoors[k].x*s-2,shopDoors[k].y*s-2,5,5);}miniCtx.fillStyle='#8af';miniCtx.fillRect(sleepSpot.x*s-2,sleepSpot.y*s-2,5,5);
 ctx.fillStyle='#0f0';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText('worldExtras v5',8,H-6);
 if(window.interiorOpen==='sleep'){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#8af';ctx.font='bold 40px Arial';ctx.fillText('🛏️ ОТДОХНУТЬ',W/2,H/2-40);ctx.fillStyle='#fff';ctx.font='20px Arial';ctx.fillText('Поспать до утра и восстановить здоровье',W/2,H/2+10);ctx.fillStyle='#fc0';ctx.font='bold 22px Arial';ctx.fillText('[ENTER] Спать     [ESC] Отмена',W/2,H/2+60);}
};
window.drawMiniLabels=function(mc,s){mc.textAlign='center';mc.fillStyle='#cfc';mc.font='italic 8px Arial';mc.fillText('🏝️ ОСТРОВ',WORLD_W*0.5*s,(1*BS)*s);mc.fillStyle='#9cf';mc.font='italic 9px Arial';mc.fillText('р. Лос-Рио',WORLD_W*0.5*s,(RIVER*BS+BS/2)*s);};
window.drawMapLabels=function(ctx,SX,SY){ctx.textAlign='center';ctx.fillStyle='#cfc';ctx.font='italic 20px Arial';ctx.fillText('🏝️ ДИКИЙ ОСТРОВ',SX(WORLD_W*0.5),SY(1*BS));ctx.fillStyle='#9cf';ctx.font='italic 22px Arial';ctx.fillText('р. Лос-Рио',SX(WORLD_W*0.5),SY(RIVER*BS+BS/2));};
function tryOpen(){for(var k in shopDoors){if(dist(player,shopDoors[k])<45)return k;}if(dist(player,sleepSpot)<45)return 'sleep';return null;}
addEventListener('keydown',function(e){
 if(window.interiorOpen==='sleep'){if(e.code==='Enter'||e.code==='Space'||e.code==='KeyE'){window.applySleep();window.interiorOpen=null;}if(e.code==='Escape')window.interiorOpen=null;e.stopImmediatePropagation();e.preventDefault();return;}
 if(window.interiorOpen===null&&e.code==='KeyE'){var d=tryOpen();if(d==='sleep'){window.interiorOpen='sleep';e.stopImmediatePropagation();e.preventDefault();return;}if(d==='weapon'&&window.openWeaponShop){window.openWeaponShop();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='clothes'&&window.openClothesShop){window.openClothesShop();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='home'&&window.openHome){window.openHome();e.stopImmediatePropagation();e.preventDefault();return;}}
},true);
window.shopDoors=shopDoors;window.sleepSpot=sleepSpot;
})();
// ====== worldExtras.js КОНЕЦ ======
