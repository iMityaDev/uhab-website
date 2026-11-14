'use strict';
const config = window.UHAB_BANKA;
const money = value => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 2 }).format(value);
const amount = document.getElementById('amount');
const presets = [...document.querySelectorAll('[data-amount]')];
function syncPresets() {
  presets.forEach(button => {
    const selected = Number(button.dataset.amount) === Number(amount.value);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
presets.forEach(button => button.addEventListener('click', () => { amount.value = button.dataset.amount; syncPresets(); }));
amount.addEventListener('input', syncPresets);
document.getElementById('donation').action = config.url;
function render(collected, goal, status) {
  const hasAmount = Number.isFinite(collected) && collected >= 0;
  const hasGoal = Number.isFinite(goal) && goal > 0;
  document.getElementById('collected').textContent = hasAmount ? money(collected) : '—';
  document.getElementById('goal').textContent = hasGoal ? money(goal) : 'Не задана';
  document.getElementById('remaining').textContent = hasGoal && hasAmount ? money(Math.max(0, goal - collected)) : '—';
  const percent = hasAmount && hasGoal ? Math.min(100, collected / goal * 100) : null;
  document.getElementById('fill').style.width = `${percent ?? 0}%`;
  document.getElementById('percent').textContent = percent === null ? '—' : `${Math.round(percent)}%`;
  const progress = document.getElementById('progress');
  if (percent !== null) progress.setAttribute('aria-valuenow', String(percent));
  else progress.removeAttribute('aria-valuenow');
  document.getElementById('status').textContent = status;
}
async function refresh() {
  if (!config.longJarId) {
    render(config.collected, config.goal, Number.isFinite(config.collected) ? 'Дані оновлюються вручну' : 'Актуальна сума та ціль — на сторінці банки');
    if (config.goal === null) document.getElementById('goal').textContent = '—';
    return;
  }
  try {
    const response = await fetch(`https://api.monobank.ua/bank/jar/${encodeURIComponent(config.longJarId)}`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    if (!response.ok) throw new Error('Jar unavailable');
    const data = await response.json();
    if (!Number.isFinite(data.amount) || data.currency !== 980) throw new Error('Unexpected jar data');
    render(data.amount / 100, Number.isFinite(data.goal) ? data.goal / 100 : null, 'Оновлено о ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }));
  } catch {
    document.getElementById('status').textContent = 'Не вдалося оновити дані. Перевір суму на сторінці банки.';
  }
}
refresh();
if (config.longJarId) setInterval(() => { if (!document.hidden) refresh(); }, 60000);
