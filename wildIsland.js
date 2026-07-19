(function(){
    const animals=[];
    const ISLAND_Y1=3*BLOCK*TILE; // остров = верх карты (y 0..3 блоков)
    function inIsland(x,y){return y>=20&&y<=ISLAND_Y1-20&&x>=20&&x<=WORLD_W-20;}
    function spawnAnimals(){
        animals.length=0;
        const types=[['wolf','#777',4],['rabbit','#dcd',6],['bug','#0a0',8],['bug','#fa0',6]];
        types.forEach(t=>{for(let i=0;i<t[2];i++){const x=rand(40,WORLD_W-40),y=rand(40,ISLAND_Y1-40);animals.push({kind:t[0],color:t[1],x,y,angle:rand(0,6.28),t:rand(40,160),hop:0});}});
    }
    const _owr=window.onWorldReady;
    window.onWorldReady=function(){ if(_owr)_owr(); spawnAnimals(); };
    function updateAnimals(){
        animals.forEach(a=>{
            a.t--;
            if(a.kind==='bug'){a.angle+=rand(-.4,.4);a.x+=Math.cos(a.angle)*1.4;a.y+=Math.sin(a.angle)*1.4;if(!inIsland(a.x,a.y)){a.angle+=Math.PI;a.x+=Math.cos(a.angle)*4;a.y+=Math.sin(a.angle)*4;}}
            else{if(a.t<=0){a.t=rand(40,160);a.angle=rand(0,6.28);}const sp=a.kind==='rabbit'?1.6:0.9;a.x+=Math.cos(a.angle)*sp;a.y+=Math.sin(a.angle)*sp;if(a.kind==='rabbit')a.hop=(a.hop+1)%20;if(!inIsland(a.x,a.y)||collidesBuilding(a.x,a.y,8)){a.angle+=Math.PI;a.x+=Math.cos(a.angle)*6;a.y+=Math.sin(a.angle)*6;}if(a.kind==='wolf'&&dist(a,player)<120&&gameTime%40===0)spawnParticles(a.x,a.y,'#fff',2,1);}
            a.x=clamp(a.x,20,WORLD_W-20);a.y=clamp(a.y,20,ISLAND_Y1-20);
        });
    }
    function renderAnimals(ctx){
        ctx.save();ctx.translate(-camera.x,-camera.y);
        animals.forEach(a=>{
            if(a.kind==='bug'){ctx.fillStyle=a.color;ctx.fillRect(a.x-2,a.y-2+Math.sin(gameTime*.3+a.x)*2,4,4);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(a.x-4,a.y-3,3,2);ctx.fillRect(a.x+1,a.y-3,3,2);}
            else if(a.kind==='rabbit'){const h=Math.abs(Math.sin(a.hop*.3))*3;ctx.save();ctx.translate(a.x,a.y-h);ctx.rotate(a.angle);ctx.fillStyle=a.color;ctx.beginPath();ctx.ellipse(0,0,7,5,0,0,6.28);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(2,-7,2,6);ctx.fillRect(5,-7,2,6);ctx.restore();}
            else{ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.angle);ctx.fillStyle=a.color;ctx.fillRect(-8,-5,16,10);ctx.fillStyle='#555';ctx.beginPath();ctx.arc(8,0,5,0,6.28);ctx.fill();ctx.fillStyle='#222';ctx.fillRect(11,-1,4,2);ctx.restore();}
        });
        ctx.restore();
    }
    const _u=window.updateMission;window.updateMission=function(){ if(_u)_u(); updateAnimals(); };
    const _r=window.renderMissionHUD;
    window.renderMissionHUD=function(ctx,W,H){ if(_r)_r(ctx,W,H); renderAnimals(ctx); };
})();