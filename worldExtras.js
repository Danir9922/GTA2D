(function(){
    const CYCLE=86400;
    window.interiorOpen=null;
    window.skyAlpha=function(d){const h=d*24;if(h>=7&&h<17)return 0;if(h>=17&&h<19)return .12+(h-17)/2*.2;if(h>=19||h<5)return .5;if(h>=5&&h<7)return .5-(h-5)/2*.4;return 0;};
    window.skyRGB=function(d){const h=d*24;if(h>=17&&h<19)return '70,25,10';if(h>=5&&h<7)return '70,35,25';return '8,8,30';};
    window.applySleep=function(){player.health=100;const target=Math.floor(7/24*CYCLE);gameTime=Math.floor(gameTime/CYCLE)*CYCLE+target;dayTime=(gameTime%CYCLE)/CYCLE;showMessage('😴 Ты поспал. Здоровье восстановлено.',2500);playSFX('pickup');};

    const BS=BLOCK*TILE, RC=ROAD_W*TILE;
// СЕВЕР: пролив (3..5 блоков) + мост#1 на остров
    const NORTH_WATER_Y0=3*BS, NORTH_WATER_Y1=5*BS;
    const bridgeN={x:8*BS, y:NORTH_WATER_Y0-32, w:RC, h:(NORTH_WATER_Y1-NORTH_WATER_Y0)+64};
// ЮГ: широкая река (11..15 блоков) + мост#2 + южный берег-парк (15..16)
    const SOUTH_WATER_Y0=11*BS, SOUTH_WATER_Y1=15*BS;
    const bridgeS={x:8*BS, y:SOUTH_WATER_Y0-32, w:RC, h:(SOUTH_WATER_Y1-SOUTH_WATER_Y0)+64};
    window.bridges=[bridgeN,bridgeS];
    const RIVER_LABEL='р. Лос-Рио';

    const SHOP_DEFS={weapon:{bi:6,bj:6,color:'#f80',icon:'🔫',label:'ОРУЖЕЙНЫЙ'},clothes:{bi:9,bj:6,color:'#f0a',icon:'👕',label:'ОДЕЖДА'},home:{bi:6,bj:9,color:'#4c4',icon:'🏠',label:'ДОМ'}};
    const shopDoors={};const sleepSpot={x:0,y:0};

    window.onWorldReady=function(){
        // чистим остров (by 0,1,2) и обе водные зоны (by 3,4 и 11,12,13,14) от зданий/парков
        for(let by=0;by<=4;by++)for(let bx=0;bx<MAP_BLOCKS;bx++)window.clearBlock(bx,by);
        for(let by=11;by<=14;by++)for(let bx=0;bx<MAP_BLOCKS;bx++)window.clearBlock(bx,by);
        // магазины в городе
        for(const k in SHOP_DEFS){const d=SHOP_DEFS[k];window.clearBlock(d.bi,d.bj);const bx=d.bi*BS+RC+16,by=d.bj*BS+RC+16;buildings.push({x:bx,y:by,w:130,h:120,color:'#5a5a6a',roofColor:'#333',_shop:k});shopDoors[k]={x:bx-8,y:by+60};}
        sleepSpot.x=9*BS+RC+40; sleepSpot.y=8*BS+RC+40;
        // северный пролив (во всю ширину, 2 куска с вырезом под мост#1)
        waterBodies.push({x:0,y:NORTH_WATER_Y0,w:bridgeN.x,h:NORTH_WATER_Y1-NORTH_WATER_Y0,_proliv:true});
        waterBodies.push({x:bridgeN.x+bridgeN.w,y:NORTH_WATER_Y0,w:WORLD_W-(bridgeN.x+bridgeN.w),h:NORTH_WATER_Y1-NORTH_WATER_Y0,_proliv:true});
        // южная широкая река (во всю ширину, 2 куска с вырезом под мост#2)
        waterBodies.push({x:0,y:SOUTH_WATER_Y0,w:bridgeS.x,h:SOUTH_WATER_Y1-SOUTH_WATER_Y0,_river:true});
        waterBodies.push({x:bridgeS.x+bridgeS.w,y:SOUTH_WATER_Y0,w:WORLD_W-(bridgeS.x+bridgeS.w),h:SOUTH_WATER_Y1-SOUTH_WATER_Y0,_river:true});
        // южный берег-парк (за широкой рекой, чтобы мост#2 имел смысл)
        parks.push({x:0,y:SOUTH_WATER_Y1,w:WORLD_W,h:BS,_shore:true});
    };

    function drawDoor(ctx,x,y,color,icon,label,near){const p=Math.sin(gameTime*.08)*4;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,26+p,0,6.28);ctx.stroke();ctx.globalAlpha=.15;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,26+p,0,6.28);ctx.fill();ctx.globalAlpha=1;ctx.font='22px Arial';ctx.textAlign='center';ctx.fillText(icon,x,y+8);ctx.fillStyle=color;ctx.font='bold 11px Arial';ctx.fillText(label,x,y-32);if(near){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] войти',x,y+44);}}
    function drawBridge(ctx,b,label){
        ctx.fillStyle='#3a2a18';ctx.fillRect(b.x-6,b.y,b.w+12,b.h);
        ctx.fillStyle='#8a6a3a';ctx.fillRect(b.x,b.y,b.w,b.h);
        ctx.strokeStyle='#5a4020';ctx.lineWidth=2;for(let yy=b.y;yy<b.y+b.h;yy+=14){ctx.beginPath();ctx.moveTo(b.x,yy);ctx.lineTo(b.x+b.w,yy);ctx.stroke();}
        ctx.fillStyle='#444';ctx.fillRect(b.x-8,b.y,4,b.h);ctx.fillRect(b.x+b.w+4,b.y,4,b.h);
        for(let yy=b.y+10;yy<b.y+b.h;yy+=40){ctx.fillStyle='#333';ctx.fillRect(b.x-12,yy,4,8);ctx.fillRect(b.x+b.w+8,yy,4,8);}
        ctx.fillStyle='#fff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.save();ctx.translate(b.x+b.w/2,b.y+b.h/2);ctx.rotate(Math.PI/2);ctx.fillText(label,0,3);ctx.restore();
    }
    window.renderGroundExtras=function(ctx){
        drawBridge(ctx,bridgeN,'МОСТ НА ОСТРОВ');
        drawBridge(ctx,bridgeS,'ЮЖНЫЙ МОСТ');
        // гора на острове (север)
        const gx=8*BS+256, gy=1.3*BS;
        [[180,'#3a5a3a'],[140,'#4a6a44'],[100,'#6a7a5a'],[60,'#8a8a7a'],[28,'#e8e8f0']].forEach(l=>{ctx.fillStyle=l[1];ctx.beginPath();ctx.ellipse(gx,gy,l[0],l[0]*0.7,0,0,6.28);ctx.fill();});
        ctx.fillStyle='#fff';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText('⛰️ ГОРА ВИКТОРИЯ',gx,gy-190);
    };

    const _wr=window.renderMissionHUD;
    window.renderMissionHUD=function(ctx,W,H){
        if(_wr)_wr(ctx,W,H);
        if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
        ctx.save();ctx.translate(-camera.x,-camera.y);
        for(const k in shopDoors){const d=shopDoors[k],def=SHOP_DEFS[k];drawDoor(ctx,d.x,d.y,def.color,def.icon,def.label,dist(player,d)<45);}
        const sn=dist(player,sleepSpot)<45;ctx.fillStyle='#8af';ctx.fillRect(sleepSpot.x-14,sleepSpot.y-8,28,16);ctx.fillStyle='#fff';ctx.fillRect(sleepSpot.x-14,sleepSpot.y-8,8,16);const sp2=Math.sin(gameTime*.08)*4;ctx.strokeStyle='#8af';ctx.lineWidth=2;ctx.beginPath();ctx.arc(sleepSpot.x,sleepSpot.y,24+sp2,0,6.28);ctx.stroke();ctx.font='18px Arial';ctx.textAlign='center';ctx.fillText('🛏️',sleepSpot.x,sleepSpot.y-26);if(sn){ctx.fillStyle='#fff';ctx.font='12px Arial';ctx.fillText('[E] спать',sleepSpot.x,sleepSpot.y+34);}
        ctx.restore();
        const s=180/WORLD_W;for(const k in shopDoors){miniCtx.fillStyle=SHOP_DEFS[k].color;miniCtx.fillRect(shopDoors[k].x*s-2,shopDoors[k].y*s-2,5,5);}miniCtx.fillStyle='#8af';miniCtx.fillRect(sleepSpot.x*s-2,sleepSpot.y*s-2,5,5);
        if(window.interiorOpen==='sleep'){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#8af';ctx.font='bold 40px Arial';ctx.fillText('🛏️ ОТДОХНУТЬ',W/2,H/2-40);ctx.fillStyle='#fff';ctx.font='20px Arial';ctx.fillText('Поспать до утра и восстановить здоровье',W/2,H/2+10);ctx.fillStyle='#fc0';ctx.font='bold 22px Arial';ctx.fillText('[ENTER] Спать     [ESC] Отмена',W/2,H/2+60);}
    };
    window.drawMiniLabels=function(mc,s){mc.fillStyle='#9cf';mc.font='italic 9px Arial';mc.textAlign='center';mc.fillText(RIVER_LABEL,WORLD_W*0.5*s,(13*BS)*s);mc.fillStyle='#cfc';mc.fillText('🏝️ ОСТРОВ',WORLD_W*0.5*s,(1.3*BS)*s);};
    window.drawMapLabels=function(ctx,SX,SY){ctx.fillStyle='#9cf';ctx.font='italic 22px Arial';ctx.textAlign='center';ctx.fillText(RIVER_LABEL,SX(WORLD_W*0.5),SY(13*BS));ctx.fillStyle='#cfc';ctx.fillText('🏝️ ДИКИЙ ОСТРОВ',SX(WORLD_W*0.5),SY(1.3*BS));};

    function tryOpen(){for(const k in shopDoors){if(dist(player,shopDoors[k])<45)return k;}if(dist(player,sleepSpot)<45)return 'sleep';return null;}
    addEventListener('keydown',function(e){
        if(window.interiorOpen==='sleep'){if(e.code==='Enter'||e.code==='Space'||e.code==='KeyE'){window.applySleep();window.interiorOpen=null;}if(e.code==='Escape')window.interiorOpen=null;e.stopImmediatePropagation();e.preventDefault();return;}
        if(window.interiorOpen===null&&e.code==='KeyE'){const d=tryOpen();if(d==='sleep'){window.interiorOpen='sleep';e.stopImmediatePropagation();e.preventDefault();return;}if(d==='weapon'&&window.openWeaponShop){window.openWeaponShop();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='clothes'&&window.openClothesShop){window.openClothesShop();e.stopImmediatePropagation();e.preventDefault();return;}if(d==='home'&&window.openHome){window.openHome();e.stopImmediatePropagation();e.preventDefault();return;}}
    },true);
    window.shopDoors=shopDoors;window.sleepSpot=sleepSpot;
})();