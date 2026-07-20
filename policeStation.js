=// ====== policeStation.js НАЧАЛО ======
(function(){
var SBI=10, SBJ=9;
var _owr=window.onWorldReady;
window.onWorldReady=function(){ if(_owr)_owr();
  if(typeof window.clearBlock==='function')window.clearBlock(SBI,SBJ);
  var bx=SBI*BLOCK*TILE+ROAD_W*TILE+16, by=SBJ*BLOCK*TILE+ROAD_W*TILE+16;
  buildings.push({x:bx,y:by,w:150,h:130,color:'#2a3a5a',roofColor:'#1a2a40',_station:true});
  window.stationPos={x:bx+75,y:by+130};
  window.mapPins=window.mapPins||[];window.mapPins.push({x:window.stationPos.x,y:window.stationPos.y,color:'#48f',label:'УЧАСТОК'});
  for(var i=0;i<4;i++){npcs.push({x:bx+rand(0,150),y:by+150+rand(0,30),angle:rand(0,6.28),speed:.5,health:60,alive:true,color:'#fca',shirt:'#1a2a5a',turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:bx+75,homeY:by+160,atHome:false,bound:true});}
};
var _r=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){ if(_r)_r(ctx,W,H);
  if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
  if(!window.stationPos)return;
  var s=180/WORLD_W; miniCtx.fillStyle='#48f'; miniCtx.fillRect(window.stationPos.x*s-2,window.stationPos.y*s-2,5,5);
  ctx.save();ctx.translate(-camera.x,-camera.y);
  var p=window.stationPos; ctx.fillStyle='#48f';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🚔 УЧАСТОК',p.x,p.y-12);
  ctx.strokeStyle='#48f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y+30,22+Math.sin(gameTime*.08)*3,0,6.28);ctx.stroke();
  ctx.restore();
};
})();
// ====== policeStation.js КОНЕЦ ======
