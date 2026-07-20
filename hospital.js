// ====== hospital.js НАЧАЛО ======
(function(){
var HBI=4, HBJ=4;
var _owr=window.onWorldReady;
window.onWorldReady=function(){ if(_owr)_owr();
  if(typeof window.clearBlock==='function')window.clearBlock(HBI,HBJ);
  var bx=HBI*BLOCK*TILE+ROAD_W*TILE+16, by=HBJ*BLOCK*TILE+ROAD_W*TILE+16;
  buildings.push({x:bx,y:by,w:150,h:130,color:'#d8d8e8',roofColor:'#a8a8c0',_hospital:true});
  window.hospitalPos={x:bx+75,y:by+130};
  for(var i=0;i<4;i++){npcs.push({x:bx+rand(0,150),y:by+150+rand(0,30),angle:rand(0,6.28),speed:.5,health:50,alive:true,color:'#fca',shirt:'#fff',turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:bx+75,homeY:by+160,atHome:false,bound:true});}
};
var _r=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){ if(_r)_r(ctx,W,H);
  if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
  if(!window.hospitalPos)return;
  var s=180/WORLD_W; miniCtx.fillStyle='#f44'; miniCtx.fillRect(window.hospitalPos.x*s-2,window.hospitalPos.y*s-2,5,5);
  ctx.save();ctx.translate(-camera.x,-camera.y);
  var p=window.hospitalPos; ctx.fillStyle='#f44';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🏥 БОЛЬНИЦА',p.x,p.y-12);
  ctx.strokeStyle='#f44';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y+30,22+Math.sin(gameTime*.08)*3,0,6.28);ctx.stroke();
  ctx.restore();
};
})();
// ====== hospital.js КОНЕЦ ======
