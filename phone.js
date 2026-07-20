// ====== phone.js НАЧАЛО ======
(function(){
var phone={open:false,tab:'main',sel:0,uiHidden:false,gallery:[],viewImg:-1,camFlash:0,callLines:null,callIdx:0,callName:''};
var APPS=[{id:'contacts',icon:'📇',label:'Контакты'},{id:'news',icon:'📰',label:'Новости'},{id:'camera',icon:'📷',label:'Камера'},{id:'gallery',icon:'🖼️',label:'Галерея'},{id:'settings',icon:'⚙️',label:'Настройки'}];
var BASE_CONTACTS=[['🚔 Экстренные','911',null],['🏥 Больница','+1 555 0199',null],['🔫 Оружейный','+1 555 0777',null],['🏠 Дом','автоответчик',null]];
var settingsSel=0;
function allContacts(){var list=[];BASE_CONTACTS.forEach(function(c){list.push({name:c[0],tel:c[1],lines:c[2]});});(window.extraContacts||[]).forEach(function(c){list.push(c);});return list;}
function hideHUD(on){var ids=['minimap-container','controls-hint','clock','hud-top','info-panel','speed-display'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.style.display=on?'none':'';}}
function snap(){try{var data=canvas.toDataURL('image/png');var img=new Image();img.src=data;phone.gallery.push(img);phone.viewImg=-1;phone.camFlash=8;showMessage('📸 Снимок сохранён в галерею',1400);playSFX('pickup');}catch(e){showMessage('❌ Не удалось снять',1200);}}
function openPhone(){phone.open=true;phone.tab='main';phone.sel=0;phone.viewImg=-1;hideHUD(true);playSFX('click');}
function closePhone(){phone.open=false;hideHUD(phone.uiHidden);playSFX('click');}
addEventListener('keydown',function(e){
 if(typeof lobbyActive!=='undefined'&&lobbyActive)return;
 if(window.interiorOpen)return;
 if(window.cutsceneSystem&&window.cutsceneSystem.active)return;
 if(e.code==='KeyP'){if(phone.open)closePhone();else openPhone();e.stopImmediatePropagation();e.preventDefault();return;}
 if(!phone.open)return;
 e.stopImmediatePropagation();e.preventDefault();
 if(phone.tab==='call'){
  if(e.code==='Enter'||e.code==='Space'){phone.callIdx++;if(phone.callIdx>=phone.callLines.length){phone.tab='contacts';phone.callLines=null;}}
  else if(e.code==='Escape'||e.code==='Backspace'){phone.tab='contacts';phone.callLines=null;}
 } else if(phone.tab==='main'){
  if(e.code==='ArrowUp'||e.code==='KeyW'){phone.sel=(phone.sel-1+APPS.length)%APPS.length;playSFX('click');}
  else if(e.code==='ArrowDown'||e.code==='KeyS'){phone.sel=(phone.sel+1)%APPS.length;playSFX('click');}
  else if(e.code==='Enter'||e.code==='Space'){phone.tab=APPS[phone.sel].id;phone.sel=0;settingsSel=0;playSFX('select');}
  else if(e.code==='Escape'||e.code==='Backspace'){closePhone();}
 } else if(phone.tab==='contacts'){
  var list=allContacts(),n=list.length;
  if(e.code==='ArrowUp'||e.code==='KeyW'){phone.sel=(phone.sel-1+n)%n;playSFX('click');}
  else if(e.code==='ArrowDown'||e.code==='KeyS'){phone.sel=(phone.sel+1)%n;playSFX('click');}
  else if(e.code==='Enter'||e.code==='Space'){var c=list[phone.sel];if(c.lines){phone.callLines=c.lines;phone.callIdx=0;phone.callName=c.name;phone.tab='call';playSFX('select');}else{showMessage('📵 '+c.name+': нет ответа / автоответчик',1600);}}
  else if(e.code==='Escape'||e.code==='Backspace'){phone.tab='main';}
 } else if(phone.tab==='camera'){
  if(e.code==='Enter'||e.code==='Space'){snap();}
  else if(e.code==='Escape'||e.code==='Backspace'){phone.tab='main';}
 } else if(phone.tab==='gallery'){
  if(phone.viewImg>=0){if(e.code==='Escape'||e.code==='Backspace'||e.code==='Enter')phone.viewImg=-1;}
  else {var n=phone.gallery.length;if(n===0){if(e.code==='Escape'||e.code==='Backspace')phone.tab='main';}
   else {if(e.code==='ArrowLeft'||e.code==='KeyA')phone.sel=(phone.sel-1+n)%n;else if(e.code==='ArrowRight'||e.code==='KeyD')phone.sel=(phone.sel+1)%n;else if(e.code==='ArrowUp'||e.code==='KeyW')phone.sel=(phone.sel-3+n)%n;else if(e.code==='ArrowDown'||e.code==='KeyS')phone.sel=(phone.sel+3)%n;else if(e.code==='Enter'||e.code==='Space')phone.viewImg=phone.sel;else if(e.code==='Escape'||e.code==='Backspace')phone.tab='main';}}
 } else if(phone.tab==='settings'){
  var opts=2;
  if(e.code==='ArrowUp'||e.code==='KeyW'){settingsSel=(settingsSel-1+opts)%opts;playSFX('click');}
  else if(e.code==='ArrowDown'||e.code==='KeyS'){settingsSel=(settingsSel+1)%opts;playSFX('click');}
  else if(e.code==='Enter'||e.code==='Space'){if(settingsSel===0){phone.uiHidden=!phone.uiHidden;hideHUD(true);}else{var b=(settings.brightness||1)+0.1;if(b>1.6)b=0.4;settings.brightness=Math.round(b*10)/10;}playSFX('select');}
  else if(e.code==='Escape'||e.code==='Backspace'){phone.tab='main';}
 } else {
  if(e.code==='Escape'||e.code==='Backspace')phone.tab='main';
 }
},true);
function panel(ctx,W,H){var pw=Math.min(380,W*0.9),ph=Math.min(660,H*0.92),px=(W-pw)/2,py=(H-ph)/2;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#0c0c14';ctx.fillRect(px-8,py-8,pw+16,ph+16);ctx.strokeStyle='#f80';ctx.lineWidth=2;ctx.strokeRect(px-8,py-8,pw+16,ph+16);ctx.fillStyle='#15151f';ctx.fillRect(px,py,pw,ph);ctx.fillStyle='#f80';ctx.font='bold 16px Arial';ctx.textAlign='left';ctx.fillText('📱 ТЕЛЕФОН',px+14,py+26);ctx.fillStyle='#888';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText('P — закрыть',px+pw-12,py+26);return{px:px,py:py,pw:pw,ph:ph};}
function drawPhone(ctx,W,H){
 if(phone.camFlash>0){phone.camFlash--;ctx.fillStyle='rgba(255,255,255,'+(phone.camFlash/8*0.7)+')';ctx.fillRect(0,0,W,H);}
 var r=panel(ctx,W,H),px=r.px,py=r.py,pw=r.pw,ph=r.ph,cx=px+pw/2,top=py+44;
 if(phone.tab==='call'){
  ctx.fillStyle='#4c4';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('📞 ЗВОНОК: '+phone.callName,px+16,top+12);
  ctx.fillStyle='#ddd';ctx.font='14px Arial';ctx.textAlign='left';var y=top+44;for(var i=0;i<=phone.callIdx&&i<phone.callLines.length;i++){var col=phone.callLines[i].indexOf('Рэй:')===0?'#9cf':'#fff';ctx.fillStyle=i===phone.callIdx?col:'#777';var words=phone.callLines[i].split(' '),line='';words.forEach(function(w){var tt=line+w+' ';if(ctx.measureText(tt).width>pw-40){ctx.fillText(line,px+20,y);line=w+' ';y+=18;}else line=tt;});ctx.fillText(line,px+20,y);y+=26;}
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText(phone.callIdx>=phone.callLines.length-1?'ENTER / ESC — завершить':'ENTER — дальше · ESC — завершить',cx,py+ph-12);
 } else if(phone.tab==='main'){
  ctx.fillStyle='#fff';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('ГЛАВНОЕ МЕНЮ',cx,top+10);
  APPS.forEach(function(a,i){var y=top+34+i*54,sel=i===phone.sel;ctx.fillStyle=sel?'rgba(255,136,0,.2)':'rgba(255,255,255,.04)';ctx.fillRect(px+16,y,pw-32,46);if(sel){ctx.strokeStyle='#f80';ctx.lineWidth=2;ctx.strokeRect(px+16,y,pw-32,46);}ctx.font='22px Arial';ctx.textAlign='left';ctx.fillText(a.icon,px+30,y+32);ctx.fillStyle=sel?'#fff':'#bbb';ctx.font='bold 16px Arial';ctx.fillText(a.label,px+66,y+30);});
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('↑↓ выбрать · ENTER открыть · P закрыть',cx,py+ph-12);
 } else if(phone.tab==='contacts'){
  var list=allContacts();
  ctx.fillStyle='#f80';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('📇 КОНТАКТЫ',px+16,top+12);
  list.forEach(function(c,i){var y=top+34+i*40,sel=i===phone.sel;if(sel){ctx.fillStyle='rgba(255,136,0,.18)';ctx.fillRect(px+12,y-4,pw-24,34);}ctx.fillStyle=sel?'#fff':'#ddd';ctx.font='14px Arial';ctx.textAlign='left';ctx.fillText(c.name,px+20,y+18);ctx.fillStyle=c.lines?'#4c4':'#888';ctx.font='11px Arial';ctx.textAlign='right';ctx.fillText(c.lines?'📞 '+c.tel:c.tel,px+pw-20,y+18);});
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('↑↓ выбрать · 📞 звонок ENTER · ESC назад',cx,py+ph-12);
 } else if(phone.tab==='news'){
  ctx.fillStyle='#f80';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('📰 НОВОСТИ',px+16,top+12);
  ctx.fillStyle='#ddd';ctx.font='13px Arial';ctx.textAlign='left';var y=top+34;['📰 Мэр снова обещал починить дороги.','🏎️ На улицах Лос-Рио: пробки и перестрелки.','🌤️ Прогноз: ясно, идеально для рыбалки.','🎵 Хит недели крутят по всему городу.','🍔 Акция в закусочной: 2 бургера за $5.','✈️ Аэропорт Лос-Рио принимает рейсы.'].forEach(function(t){var words=t.split(' '),line='';words.forEach(function(w){var tt=line+w+' ';if(ctx.measureText(tt).width>pw-40){ctx.fillText(line,px+20,y);line=w+' ';y+=18;}else line=tt;});ctx.fillText(line,px+20,y);y+=26;});
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('ESC / Backspace — назад',cx,py+ph-12);
 } else if(phone.tab==='camera'){
  ctx.fillStyle='#f80';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('📷 КАМЕРА',px+16,top+12);
  ctx.fillStyle='#222';ctx.fillRect(px+20,top+30,pw-40,ph-150);ctx.strokeStyle='#444';ctx.lineWidth=2;ctx.strokeRect(px+20,top+30,pw-40,ph-150);
  ctx.fillStyle='#aaa';ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('Видоискатель: кадр игры',cx,top+30+(ph-150)/2-6);ctx.fillText('ENTER — снять фото',cx,top+30+(ph-150)/2+14);
  ctx.fillStyle='#f44';ctx.beginPath();ctx.arc(cx,py+ph-58,20,0,6.28);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,py+ph-58,8,0,6.28);ctx.fill();
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.fillText('ENTER снять · ESC назад',cx,py+ph-12);
 } else if(phone.tab==='gallery'){
  ctx.fillStyle='#f80';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('🖼️ ГАЛЕРЕЯ ('+phone.gallery.length+')',px+16,top+12);
  if(phone.viewImg>=0&&phone.gallery[phone.viewImg]){ctx.fillStyle='#000';ctx.fillRect(px+20,top+30,pw-40,ph-150);try{ctx.drawImage(phone.gallery[phone.viewImg],px+20,top+30,pw-40,ph-150);}catch(e){}}
  else if(phone.gallery.length===0){ctx.fillStyle='#888';ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('Пока пусто.',cx,top+70);ctx.fillText('Сними фото в Камере.',cx,top+92);}
  else {var cols=3,cw=(pw-40)/cols,ch=cw*0.7;phone.gallery.forEach(function(img,i){var col=i%cols,row=Math.floor(i/cols);var x=px+20+col*cw,y=top+30+row*(ch+6);if(y+ch>py+ph-40)return;var sel=i===phone.sel;ctx.fillStyle='#111';ctx.fillRect(x,y,cw-6,ch);try{ctx.drawImage(img,x,y,cw-6,ch);}catch(e){}ctx.strokeStyle=sel?'#f80':'#333';ctx.lineWidth=sel?2:1;ctx.strokeRect(x,y,cw-6,ch);});}
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText(phone.viewImg>=0?'ESC — к сетке':'← → ↑ ↓ выбрать · ENTER открыть · ESC назад',cx,py+ph-12);
 } else if(phone.tab==='settings'){
  ctx.fillStyle='#f80';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('⚙️ НАСТРОЙКИ',px+16,top+12);
  var opts=['🖥️ Интерфейс (HUD): '+(phone.uiHidden?'СКРЫТ':'ВИДИМ'),'☀️ Яркость: '+Math.round((settings.brightness||1)*100)+'%'];
  opts.forEach(function(t,i){var y=top+34+i*50,sel=i===settingsSel;ctx.fillStyle=sel?'rgba(255,136,0,.2)':'rgba(255,255,255,.04)';ctx.fillRect(px+16,y,pw-32,42);if(sel){ctx.strokeStyle='#f80';ctx.lineWidth=2;ctx.strokeRect(px+16,y,pw-32,42);}ctx.fillStyle=sel?'#fff':'#bbb';ctx.font='14px Arial';ctx.textAlign='left';ctx.fillText(t,px+30,y+26);});
  ctx.fillStyle='#666';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText('↑↓ выбрать · ENTER изменить · ESC назад',cx,py+ph-12);
 }
}
var _pr=window.renderMissionHUD;
window.renderMissionHUD=function(ctx,W,H){if(_pr)_pr(ctx,W,H);if(phone.open){hideHUD(true);drawPhone(ctx,W,H);}else if(phone.uiHidden){hideHUD(true);}};
console.log('phone v2 ЗАГРУЖЕН');
})();
// ====== phone.js КОНЕЦ ======
