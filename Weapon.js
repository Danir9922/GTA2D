// ============================================================
//  Weapon.js — оружейный магазин (оверлей)
// ============================================================
const WEAPON_SHOP = [
    { name:'Дробовик', icon:'💥', ammo:40,  damage:40, rate:600, range:250, price:800 },
    { name:'Узи',      icon:'🔫', ammo:200, damage:12, rate:70,  range:300, price:1200 },
    { name:'Снайперка',icon:'🎯', ammo:20,  damage:90, rate:900, range:600, price:2000 },
];
let wSel = 0;

window.openWeaponShop = function(){ window.interiorOpen = 'weapon'; wSel = 0; playSFX('click'); };

function buyWeapon(it){
    const owned = player.ownedWeapons.indexOf(it.name) >= 0;
    if(!owned){
        if(player.money < it.price){ showMission('❌ Мало денег', 1500); playSFX('hit'); return; }
        player.money -= it.price;
        player.weapons.push({ name:it.name, icon:it.icon, ammo:it.ammo, damage:it.damage, rate:it.rate, range:it.range });
        player.ownedWeapons.push(it.name);
        player.currentWeapon = player.weapons.length - 1;
        showMission('✅ Куплено: ' + it.name, 1800); playSFX('buy');
    } else {
        const cost = Math.floor(it.price * 0.3);
        if(player.money < cost){ showMission('❌ Мало денег на патроны', 1500); playSFX('hit'); return; }
        player.money -= cost;
        const w = player.weapons.find(w=>w.name===it.name);
        if(w) w.ammo += it.ammo;
        showMission('🔫 Патроны пополнены (-$'+cost+')', 1500); playSFX('buy');
    }
}

addEventListener('keydown', function(e){
    if(window.interiorOpen !== 'weapon') return;
    if(e.code==='ArrowUp'||e.code==='KeyW'){ wSel=(wSel-1+WEAPON_SHOP.length)%WEAPON_SHOP.length; playSFX('click'); }
    else if(e.code==='ArrowDown'||e.code==='KeyS'){ wSel=(wSel+1)%WEAPON_SHOP.length; playSFX('click'); }
    else if(e.code==='Enter'||e.code==='Space'){ buyWeapon(WEAPON_SHOP[wSel]); }
    else if(e.code==='Escape'||e.code==='KeyE'){ window.interiorOpen=null; playSFX('click'); }
    e.stopImmediatePropagation(); e.preventDefault();
}, true);

const _wr = window.renderMissionHUD;
window.renderMissionHUD = function(ctx, W, H){
    _wr(ctx, W, H);
    if(window.interiorOpen !== 'weapon') return;
    ctx.fillStyle='rgba(0,0,0,.82)'; ctx.fillRect(0,0,W,H);
    ctx.textAlign='center'; ctx.fillStyle='#f80'; ctx.font='bold 42px Arial'; ctx.fillText('🔫 ОРУЖЕЙНЫЙ МАГАЗИН', W/2, 90);
    ctx.fillStyle='#aaa'; ctx.font='16px Arial'; ctx.fillText('Твои деньги: $'+player.money, W/2, 120);
    const startY = 180, gap = 70;
    WEAPON_SHOP.forEach((it,i)=>{
        const y = startY + i*gap, sel = i===wSel;
        const owned = player.ownedWeapons.indexOf(it.name)>=0;
        if(sel){ ctx.fillStyle='rgba(255,136,0,.15)'; ctx.fillRect(W/2-260, y-26, 520, 56); ctx.strokeStyle='#f80'; ctx.lineWidth=2; ctx.strokeRect(W/2-260, y-26, 520, 56); }
        ctx.textAlign='left'; ctx.fillStyle = sel?'#fff':'#bbb'; ctx.font='bold 22px Arial';
        ctx.fillText(it.icon+'  '+it.name, W/2-230, y+4);
        ctx.fillStyle='#9cf'; ctx.font='14px Arial';
        ctx.fillText('урон '+it.damage+'  патроны '+it.ammo, W/2-230, y+22);
        ctx.textAlign='right'; ctx.fillStyle = owned?'#4c4':'#fc0'; ctx.font='bold 20px Arial';
        ctx.fillText(owned?'ПОПОЛНИТЬ -$'+Math.floor(it.price*0.3):'$'+it.price, W/2+230, y+8);
    });
    ctx.textAlign='center'; ctx.fillStyle='#666'; ctx.font='14px Arial';
    ctx.fillText('↑↓ выбор | ENTER купить/пополнить | ESC/E выйти', W/2, H-40);
};