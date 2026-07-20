// ====== respawnFix.js НАЧАЛО ======
(function(){
// деньги НЕ теряются при смерти/аресте
window.damagePlayer=function(a){if(player.armor>0){var ab=Math.min(player.armor,a*.6);player.armor-=ab;a-=ab;}player.health-=a;if(player.health<=0){player.health=0;player.alive=false;player.respawnTimer=150;player.busted=false;window._respawnType='death';showMessage('WASTED',2500);playSFX('wasted');}};
window.doBusted=function(){player.alive=false;player.busted=true;player.respawnTimer=150;player.inVehicle=null;player.wanted=0;policeVehicles.length=0;window._respawnType='bust';showMessage('BUSTED',2500);playSFX('busted');};
// миссия НЕ сбрасывается при смерти/аресте (катсцена не проигрывается заново)
window.missionRestarters=[];
})();
// ====== respawnFix.js КОНЕЦ ======
