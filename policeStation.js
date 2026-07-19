(function(){
    const SBI=10, SBJ=9;
    const _owr=window.onWorldReady;
    window.onWorldReady=function(){ if(_owr)_owr();
        window.clearBlock(SBI,SBJ);
        const bx=SBI*BLOCK*TILE+ROAD_W*TILE+16, by=SBJ*BLOCK*TILE+ROAD_W*TILE+16;
        buildings.push({x:bx,y:by,w:150,h:130,color:'#2a3a5a',roofColor:'#1a2a40',_station:true});
        window.stationPos={x:bx+75,y:by+130};
        for(let i=0;i<4;i++){npcs.push({x:bx+rand(0,150),y:by+150+rand(0,30),angle:rand(0,6.28),speed:.5,health:60,alive:true,color:'#fca',shirt:'#1a2a5a',turnTimer:rand(60,200),fleeing:false,fleeAngle:0,animFrame:0,animTimer:0,homeX:bx+75,homeY:by+160,atHome:false,bound:true});}
    };
    const _r=window.renderMissionHUD;
    window.renderMissionHUD=function(ctx,W,H){ if(_r)_r(ctx,W,H);
        if(!window.stationPos)return;
        const s=180/WORLD_W; miniCtx.fillStyle='#48f'; miniCtx.fillRect(window.stationPos.x*s-2,window.stationPos.y*s-2,5,5);
        ctx.save();ctx.translate(-camera.x,-camera.y);
        const p=window.stationPos; ctx.fillStyle='#48f';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('🚔 УЧАСТОК',p.x,p.y-12);
        ctx.strokeStyle='#48f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y+30,22+Math.sin(gameTime*.08)*3,0,6.28);ctx.stroke();
        ctx.restore();
    };
})();