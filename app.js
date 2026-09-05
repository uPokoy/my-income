const KEY='my-income-data-v1';
const descriptions=['Зарплата','Аванс','Премия','Отпускные','Бонус','Фриланс','Подработка','Продажа товара','Продажа услуги','Аренда','Дивиденды','Проценты','Кэшбэк','Подарок','Возврат денег','Другое'];
const sources=['Зарплата','Фриланс','Продажи','Инвестиции','Подарок','Другое'];
let data=JSON.parse(localStorage.getItem(KEY)||'[]');
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' €';
const today=()=>new Date().toISOString().slice(0,10);
const monthOf=d=>d.slice(0,7);
let selectedMonth=new Date().toISOString().slice(0,7);
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function render(){
  const monthData=data.filter(x=>monthOf(x.date)===selectedMonth).sort((a,b)=>b.date.localeCompare(a.date));
  const year=selectedMonth.slice(0,4);
  const yearData=data.filter(x=>x.date.startsWith(year));
  const total=monthData.reduce((s,x)=>s+x.amount,0), yearTotal=yearData.reduce((s,x)=>s+x.amount,0);
  $('monthTotal').textContent=money(total); $('yearTotal').textContent=money(yearTotal); $('entryCount').textContent=monthData.length;
  $('periodLabel').textContent=new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(new Date(selectedMonth+'-01'));
  $('incomeList').innerHTML=monthData.length?monthData.map(x=>`<article class="income-item"><div class="income-main"><strong>${esc(x.description)}</strong><span>${formatDate(x.date)} · ${esc(x.source)}</span></div><div class="income-right"><b>${money(x.amount)}</b><div class="item-actions"><button class="tiny-btn" data-edit="${x.id}">Изменить</button><button class="tiny-btn" data-delete="${x.id}">Удалить</button></div></div></article>`).join(''):'<div class="empty">За выбранный месяц доходов пока нет.<br>Добавьте первую запись.</div>';
  const groups={}; monthData.forEach(x=>groups[x.source]=(groups[x.source]||0)+x.amount);
  $('sourceSummary').innerHTML=Object.entries(groups).sort((a,b)=>b[1]-a[1]).map(([name,val])=>`<div class="source-row"><div class="source-line"><span>${esc(name)}</span><b>${money(val)}</b></div><div class="bar"><i style="width:${total?val/total*100:0}%"></i></div></div>`).join('')||'<div class="empty">Данных для распределения пока нет.</div>';
}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function formatDate(d){return new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short'}).format(new Date(d+'T00:00:00'))}
function openDialog(item=null){
  $('incomeForm').reset(); $('editId').value=item?.id||''; $('dateInput').value=item?.date||today(); $('sourceInput').value=item?.source||sources[0]; $('descriptionInput').value=descriptions.includes(item?.description)?item.description:'Другое'; $('customDescription').value=descriptions.includes(item?.description)?'':(item?.description||''); $('amountInput').value=item?.amount??''; $('dialogTitle').textContent=item?'Изменить доход':'Новый доход'; toggleCustom(); $('incomeDialog').showModal();
}
function toggleCustom(){$('customDescriptionWrap').classList.toggle('hidden',$('descriptionInput').value!=='Другое')}
$('monthPicker').value=selectedMonth;
$('monthPicker').addEventListener('change',e=>{selectedMonth=e.target.value||selectedMonth;render()});
$('addBtn').addEventListener('click',()=>openDialog()); $('closeDialog').addEventListener('click',()=> $('incomeDialog').close()); $('cancelBtn').addEventListener('click',()=> $('incomeDialog').close()); $('descriptionInput').addEventListener('change',toggleCustom);
$('incomeForm').addEventListener('submit',e=>{e.preventDefault();const id=$('editId').value;const description=$('descriptionInput').value==='Другое'?$('customDescription').value.trim():' '+$('descriptionInput').value;const item={id:id||crypto.randomUUID(),date:$('dateInput').value,source:$('sourceInput').value,description:description.trim(),amount:Number($('amountInput').value)};if(!item.description||!item.date||!item.amount)return;if(id){data=data.map(x=>x.id===id?item:x)}else data.push(item);save();selectedMonth=monthOf(item.date);$('monthPicker').value=selectedMonth;$('incomeDialog').close();render()});
$('incomeList').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit){const item=data.find(x=>x.id===edit.dataset.edit);if(item)openDialog(item)}if(del){const id=del.dataset.delete;if(confirm('Удалить эту запись?')){data=data.filter(x=>x.id!==id);save();render()}}});
$('settingsBtn').addEventListener('click',()=>alert('Данные хранятся только на этом устройстве. Для резервной копии используйте экспорт в JSON — эта функция будет добавлена в следующем обновлении.'));
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.view!=='summary')alert(b.dataset.view==='history'?'История операций доступна через список выбранного месяца.':'Настройки приложения будут расширены в следующей версии.')}));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();