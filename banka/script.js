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
document.getElementById('goal').textContent = money(config.goal);
