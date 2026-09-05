const STORAGE_KEY = 'income-tracker-data-v2';
const THEME_KEY = 'income-theme';
const descriptions = ['Зарплата','Аванс','Премия','Отпускные','Бонус','Фриланс','Подработка','Продажа товара','Продажа услуги','Аренда','Дивиденды','Проценты','Кэшбэк','Подарок','Возврат денег','Другое'];
const sources = ['Зарплата','Фриланс','Продажи','Инвестиции','Подарок','Другое'];
const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let selectedYear = new Date().getFullYear();
let activeMonth = new Date().getMonth();

const money = n => new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n) + ' ₽';
const dateRu = value => { const p = String(value).split('-'); return p.length===3 ? `${p[2]}.${p[1]}.${p[0]}` : value; };
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const esc = s => String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function setTheme(theme){
  theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll('.theme-option').forEach(b=>b.classList.toggle('selected',b.dataset.themeChoice===theme));
}
function openView(){setTheme(localStorage.getItem(THEME_KEY)||'light');document.querySelector('#view-modal').classList.add('show');}
function closeView(){document.querySelector('#view-modal').classList.remove('show');}
function monthEntries(month){ return data.filter(x=>x.year===selectedYear && x.month===month); }
function renderSummary(){
  const rows = months.map((name,i)=>{const total=monthEntries(i).reduce((s,x)=>s+x.amount,0);return `<tr class="summary-row" data-month="${i}"><td>${name}</td><td>${money(total)}</td></tr>`}).join('');
  const yearEntries=data.filter(x=>x.year===selectedYear);
  const yearTotal=yearEntries.reduce((s,x)=>s+x.amount,0);
  const average=yearTotal/12;
  document.querySelector('#summary').innerHTML=`<div class="cards"><div class="card"><span>Доход за год</span><strong>${money(yearTotal)}</strong></div><div class="card"><span>Средний в месяц</span><strong>${money(average)}</strong></div></div><table><thead><tr><th>Месяц</th><th>Доход</th></tr></thead><tbody>${rows}</tbody></table>`;
  document.querySelectorAll('.summary-row').forEach(row=>row.onclick=()=>{activeMonth=+row.dataset.month;render();document.querySelector('.month-panel').scrollIntoView({behavior:'smooth',block:'start'});});
}
function renderMonthTabs(){
  document.querySelector('#months').innerHTML=months.map((m,i)=>`<button class="month-tab ${i===activeMonth?'active':''}" data-month="${i}">${m}</button>`).join('');
  document.querySelectorAll('.month-tab').forEach(b=>b.onclick=()=>{activeMonth=+b.dataset.month;render();});
}
function renderIncome(){
  const entries=monthEntries(activeMonth).sort((a,b)=>b.date.localeCompare(a.date));
  document.querySelector('#month-title').textContent=`${months[activeMonth]} ${selectedYear}`;
  document.querySelector('#month-total').textContent=money(entries.reduce((s,x)=>s+x.amount,0));
  document.querySelector('#income-list').innerHTML=entries.length?entries.map(x=>`<div class="income-row"><div><b>${esc(x.description)}</b><small>${dateRu(x.date)} · ${esc(x.source)}</small></div><strong>${money(x.amount)}</strong><button class="delete" data-id="${x.id}" title="Удалить" aria-label="Удалить доход">×</button></div>`).join(''):'<div class="empty">Доходов за этот месяц пока нет.<br>Нажмите «Добавить доход», чтобы создать первую запись.</div>';
  document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{data=data.filter(x=>x.id!==b.dataset.id);save();render();});
}
function render(){renderSummary();renderMonthTabs();renderIncome();}
function openModal(){
  const today=new Date();
  const day=Math.min(today.getDate(),new Date(selectedYear,activeMonth+1,0).getDate());
  document.querySelector('#income-date').value=`${selectedYear}-${String(activeMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  document.querySelector('#income-modal').classList.add('show');
  setTimeout(()=>document.querySelector('#income-description').focus(),0);
}
function closeModal(){document.querySelector('#income-modal').classList.remove('show');document.querySelector('#income-form').reset();}

document.addEventListener('DOMContentLoaded',()=>{
  setTheme(localStorage.getItem(THEME_KEY)||document.documentElement.dataset.theme||'light');
  document.querySelector('#year').textContent=selectedYear;
  document.querySelector('#add-income').onclick=openModal;
  document.querySelector('#view-settings').onclick=openView;
  document.querySelector('#view-close').onclick=closeView;
  document.querySelectorAll('.theme-option').forEach(b=>b.onclick=()=>setTheme(b.dataset.themeChoice));
  document.querySelector('#modal-close').onclick=closeModal;
  document.querySelector('#modal-cancel').onclick=closeModal;
  document.querySelector('#income-modal').onclick=e=>{if(e.target.id==='income-modal')closeModal();};
  document.querySelector('#view-modal').onclick=e=>{if(e.target.id==='view-modal')closeView();};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeView();}});
  document.querySelector('#income-form').onsubmit=e=>{e.preventDefault();const date=document.querySelector('#income-date').value;const amount=Number(document.querySelector('#income-amount').value);const description=document.querySelector('#income-description').value;const source=document.querySelector('#income-source').value;if(!date||!amount||!description||!source)return;data.push({id:crypto.randomUUID(),date,year:Number(date.slice(0,4)),month:Number(date.slice(5,7))-1,description,source,amount});save();activeMonth=Number(date.slice(5,7))-1;selectedYear=Number(date.slice(0,4));document.querySelector('#year').textContent=selectedYear;closeModal();render();};
  render();
});