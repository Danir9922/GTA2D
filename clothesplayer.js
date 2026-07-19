// ============================================================
//  clothesplayer.js — магазин одежды (меняет внешность)
// ============================================================
const CLOTHES = [
    { label:'Синяя рубашка',  type:'shirt', value:'#2255cc', price:100 },
    { label:'Красная рубашка',type:'shirt', value:'#cc2222', price:100 },
    { label:'Чёрная куртка',  type:'shirt', value:'#222222', price:150 },
    { label:'Зелёная футболка',type:'shirt',value:'#22aa44', price:100 },
    { label:'Белая рубашка',  type:'shirt', value:'#eeeeee', price:120 },
    { label:'Тёмные волосы',  type:'hair',  value:'#221100', price:80 },
    { label:'Светлые волосы', type:'hair',  value:'#ddbb55', price:80 },
    { label:'Рыжие волосы',   type:'hair',  value:'#cc5500', price:80 },
    { label:'Седые волосы',   type:'hair',  value:'#cccccc', price:80 },
    { label:'Загар',          type:'skin',  value:'#c98', price:80 },
    { label:'Светлая кожа',   type:'skin',  value:'#fca', price:80 },
    { label:'Тёмная кожа',    type:'skin',  value:'#854', price:80 },
];
let cSel = 0;
window.openClothesShop = function(){ window.interiorOpen='clothes'; cSel=0; playSFX('click'); };

function buyClothes(it){
    if(player.money < it.price){ showMission('❌ Мало денег', 1500); playSFX('hit'); return; }
    player.money -= it.price;
    if(it.type==='shirt') player.shirtColor = it.value;
    if(it.type==='hair')  player.hairColor  = it.value;
    if(it.type==='skin')  player.skinColor  = it.value;
    showMission('👕 Применено: '+it.label, 1500); playSFX('buy');
}

addEventListener('keydown', function(e){
    if(window.interiorOpen !== 'clothes') return;
    if(e.code==='ArrowUp'||e.code==='KeyW'){ cSel=(cSel-1+CLOTHES.length)%CLOTHES.length; playSFX('click'); }
    else if(e.code==='ArrowDown'||e.code==='KeyS'){ cSel=(cSel+1)%CLOTHES.length; playSFX('click'); }
    else if(e.code==='Enter'||e.code==='Space'){ buyClothes(CLOTHES[cSel]); }
    else if(e.code==='Escape'||e.code==='KeyE'){ window.interiorOpen=null; playSFX('click'); }
    e.stopImmediatePropagation(); e.preventDefault();
}, true);

const _cr = window.renderMissionHUD;
window.renderMissionHUD = function(ctx, W, H){
    _cr(ctx, W, H);
    if(window.interiorOpen !== 'clothes') return;
    ctx.fillStyle='rgba(0,0,0,.82)'; ctx.fillRect(0,0,W,H);
    ctx.textAlign='center'; ctx.fillStyle='#f0a'; ctx.font='bold 42px Arial'; ctx.fillText('👕 МАГАЗИН ОДЕЖДЫ', W/2, 70);
    ctx.fillStyle='#aaa'; ctx.font='16px Arial'; ctx.fillText('Деньги: $'+player.money, W/2, 98);
    // превью персонажа
    ctx.save(); ctx.translate(W/2, 170); ctx.scale(3,3);
    ctx.fillStyle=player.shirtColor; ctx.fillRect(-6,-5,12,10);
    ctx.fillStyle=player.skinColor; ctx.beginPath(); ctx.arc(0,-15,6,0,6.28); ctx.fill();
    ctx.fillStyle=player.hairColor; ctx.beginPath(); ctx.arc(0,-17,6,Math.PI,0); ctx.fill();
    ctx.restore();
    const startY = 250, gap = 34, perPage = 8;
    const start = Math.max(0, Math.min(cSel-perPage+1, CLOTHES.length-perPage));
    for(let i=start; i<start+perPage && i<CLOTHES.length; i++){
        const it = CLOTHES[i], y = startY + (i-start)*gap, sel = i===cSel;
        if(sel){ ctx.fillStyle='rgba(255,0,170,.15)'; ctx.fillRect(W/2-220, y-20, 440, 30); ctx.strokeStyle='#f0a'; ctx.lineWidth=1; ctx.strokeRect(W/2-220, y-20, 440, 30); }
        ctx.textAlign='left'; ctx.fillStyle=it.value; ctx.fillRect(W/2-210, y-12, 16, 16);
        ctx.strokeStyle='#fff'; ctx.strokeRect(W/2-210, y-12, 16, 16);
        ctx.fillStyle = sel?'#fff':'#bbb'; ctx.font='18px Arial'; ctx.fillText(it.label, W/2-180, y+2);
        ctx.textAlign='right'; ctx.fillStyle='#fc0'; ctx.font='bold 18px Arial'; ctx.fillText('$'+it.price, W/2+210, y+2);
    }
    ctx.textAlign='center'; ctx.fillStyle='#666'; ctx.font='14px Arial';
    ctx.fillText('↑↓ выбор | ENTER купить и надеть | ESC/E выйти', W/2, H-30);
};