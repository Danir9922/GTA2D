// ====== barber.js НАЧАЛО ======
(function(){
var HAIRS=['#1a1a1a','#432','#a52','#c33','#fc0','#eee','#08f','#f0a','#3a3'];
var barber={open:false,sel:0};
window.openBarber=function(){barber.open=true;barber.sel=HAIRS.indexOf(player.hairColor);if(barber.sel<0)barber.sel=0;playSFX('click');};
addEventListener('keydown',function(e){
 if(!barber.open)return;
 e.stopImmediatePropagation();e.preventDefault();
 if(e.code==='ArrowLeft'||e.code==='KeyA'){barber.sel=(barber.sel-1+HAIRS.length)%HAIRS.length;player.hairColor=HAIRS[barber.sel];playSFX('click');}
 else if(e.code==='ArrowRight'||e.code==='KeyD'){barber.sel=(barber.sel+1)%HAIRS.length;player.hairColor=HAIRS[barber.sel];playSFX('click');}
 else if(e.code==='Enter'||e.code==='Space'){showMessage('💈 Новая стрижка! -$20',1600);player.money=Math.max(0,player.money-20);playSFX('buy');barber.open=false;}
 else if(e.code==='Escape'||e.code==='Backspace'){barber.open=false;playSFX('click');}
},true);
var _br=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){if(_br)_br(ctx,W,H);if(!barber.open)return;
 var pw=340,ph=220,px=(W-pw)/2,py=(H-ph)/2;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#1a1020';ctx.fillRect(px,py,pw,ph);ctx.strokeStyle='#f8f';ctx.lineWidth=2;ctx.strokeRect(px,py,pw,ph);
 ctx.fillStyle='#f8f';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('💈 ПАРИКМАХЕРСКАЯ',px+pw/2,py+34);
 ctx.fillStyle='#fff';ctx.font='14px Arial';ctx.fillText('Выбери цвет волос',px+pw/2,py+64);
 var n=HAIRS.length,cw=30,gap=6,total=n*cw+(n-1)*gap,sx=px+(pw-total)/2;
 for(var i=0;i<n;i++){var x=sx+i*(cw+gap);ctx.fillStyle=HAIRS[i];ctx.fillRect(x,py+80,cw,cw);if(i===barber.sel){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(x-2,py+78,cw+4,cw+4);}}
 ctx.fillStyle='#ddd';ctx.font='13px Arial';ctx.fillText('← → цвет · ENTER подстричься ($20) · ESC отмена',px+pw/2,py+ph-22);
};
console.log('barber v1 ЗАГРУЖЕН');
})();
// ====== barber.js КОНЕЦ ======
