// ====== nameFix.js НАЧАЛО ======
(function(){
var NAME='Рэй', EMOJI='😎';
function fix(arr){if(!arr||!arr.forEach)return;arr.forEach(function(l){if(l&&l.name){var nm=l.name.replace(/^😎\s*/,'');if(nm==='Ты')l.name=EMOJI+' '+NAME;}if(l&&l.chars&&l.chars.forEach){l.chars.forEach(function(c){if(c.label==='Ты')c.label=NAME;});}});}
function apply(){['DIALOGUE_1','DIALOGUE_DONE','D2_START','D2_DONE','D3_START','D3_DONE','D4_START','D4_DONE','D5_START','D5_DONE'].forEach(function(n){try{fix(eval(n));}catch(e){}});}
if(document.readyState==='complete')apply();else window.addEventListener('load',apply);
console.log('nameFix v1: герой = '+NAME);
})();
// ====== nameFix.js КОНЕЦ ======
