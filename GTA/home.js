// ============================================================
//  home.js — дом игрока (сон + сохранение)
// ============================================================
let hSel = 0;
const HOME_OPTS = ['😴 Поспать до утра', '💾 Сохранить игру', '🚪 Выйти'];

window.openHome = function(){ window.interiorOpen='home'; hSel=0; playSFX('click'); };

function saveGame(){
    try{
        localStorage.setItem('gta2d_save', JSON.stringify({
            money:player.money, health:player.health, armor:player.armor,
            shirt:player.shirtColor, skin:player.skinColor, hair:player.hairColor,
            owned:player.ownedWeapons, weapons:player.weapons, kills:kills
        }));
        showMission('💾 Игра сохранена!', 1800); playSFX('buy');
    }catch(e){ showMission('❌ Ошибка сохранения', 1500); }
}
// автозагрузка при старте мира
const _owr = window.onWorldReady;
window.onWorldReady = function(){
    if(_owr) _owr();
    try{
        const s = JSON.parse(localStorage.getItem('gta2d_save')||'null');
        if(s){ player.money=s.money??player.money; player.shirtColor=s.shirt||player.shirtColor;
            player.skinColor=s.skin||player.skinColor; player.hairColor=s.hair||player.hairColor;
            if(s.weapons) player.weapons=s.weapons; if(s.owned) player.ownedWeapons=s.owned; }
    }catch(e){}
};

addEventListener('keydown', function(e){
    if(window.interiorOpen !== 'home') return;
    if(e.code==='ArrowUp'||e.code==='KeyW'){ hSel=(hSel-1+HOME_OPTS.length)%HOME_OPTS.length; playSFX('click'); }
    else if(e.code==='ArrowDown'||e.code==='KeyS'){ hSel=(hSel+1)%HOME_OPTS.length; playSFX('click'); }
    else if(e.code==='Enter'||e.code==='Space'){
        if(hSel===0){ window.applySleep(); window.interiorOpen=null; }
        else if(hSel===1){ saveGame(); }
        else { window.interiorOpen=null; playSFX('click'); }
    }
    else if(e.code==='Escape'||e.code==='KeyE'){ window.interiorOpen=null; playSFX('click'); }
    e.stopImmediatePropagation(); e.preventDefault();
}, true);

const _hr = window.renderMissionHUD;
window.renderMissionHUD = function(ctx, W, H){
    _hr(ctx, W, H);
    if(window.interiorOpen !== 'home') return;
    ctx.fillStyle='rgba(0,0,0,.82)'; ctx.fillRect(0,0,W,H);
    ctx.textAlign='center'; ctx.fillStyle='#4c4'; ctx.font='bold 42px Arial'; ctx.fillText('🏠 ТВОЙ ДОМ', W/2, H*0.3);
    ctx.fillStyle='#aaa'; ctx.font='16px Arial'; ctx.fillText('Здесь ты в безопасности.', W/2, H*0.3+30);
    const startY = H*0.45, gap = 50;
    HOME_OPTS.forEach((it,i)=>{
        const y = startY + i*gap, sel = i===hSel;
        if(sel){ ctx.fillStyle='rgba(80,200,80,.15)'; ctx.fillRect(W/2-180, y-22, 360, 44); ctx.strokeStyle='#4c4'; ctx.lineWidth=2; ctx.strokeRect(W/2-180, y-22, 360, 44); ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; }
        else { ctx.fillStyle='#999'; ctx.font='20px Arial'; }
        ctx.fillText(it, W/2, y+8);
    });
    ctx.fillStyle='#666'; ctx.font='14px Arial'; ctx.fillText('↑↓ выбор | ENTER подтвердить | ESC/E выйти', W/2, H-40);
};