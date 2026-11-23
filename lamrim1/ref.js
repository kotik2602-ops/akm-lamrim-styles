/*
  Учёт продаж билетов по партнёрам / амбассадорам.

  Как добавить партнёра:
  1. В WayForPay создать для него копии кнопок оплаты (место и VIP;
     для EN/DE-версии — отдельные евро-кнопки, если нужно).
  2. Добавить сюда строку: код партнёра (латиницей, маленькими буквами)
     и какие стандартные кнопки на какие его кнопки заменить.
  2б. Поднять номер версии ref.js?v=N в четырёх index.html (иначе браузеры держат старый файл до 4 ч).
  3. Дать партнёру ссылку: https://staircase.classicwisdomacademy.com/lamrim1/?ref=КОД
     (или /lamrim1/ua/?ref=КОД, /en/?ref=КОД, /de/?ref=КОД).

  Стандартные кнопки:
    RU/UA  место  bcc4309a38938   VIP  bc78e3106b571
    EN/DE  место  b27b9968a0cf1   VIP  b305aadd75ff7

  Пример:
    anna: {
      bcc4309a38938: 'bAAAAAAAAAAAA',   // место (грн) — кнопка Анны
      bc78e3106b571: 'bBBBBBBBBBBBB',   // VIP (грн) — кнопка Анны
    },
*/
var LAMRIM_PARTNERS = {
  // Diamond Mind Academy (немецкоязычная команда): 5 проданных билетов = 1 бесплатный
  dma: {
    b27b9968a0cf1: 'ba4504aa93b04',   // место 169 € (EN/DE) — кнопка DMA
    b305aadd75ff7: 'bc2001aa60dd4',   // VIP 600 € (EN/DE) — кнопка DMA
  },
  // Telegram-канал «Відень тільки корисне» (реклама, ноябрь 2026). Кнопки на укр., от Ивана 23.11
  vtk: {
    bcc4309a38938: 'bb4c1fe51f769',   // место 169 € (RU/UA) — кнопка канала
    bc78e3106b571: 'b8557729366e5',   // VIP 600 € (RU/UA) — кнопка канала
    b27b9968a0cf1: 'bb4c1fe51f769',   // место (EN/DE) — та же кнопка канала
    b305aadd75ff7: 'b8557729366e5',   // VIP (EN/DE) — та же кнопка канала
  },
};

(function () {
  var KEY = 'lamrim_ref', DAYS = 60;
  var ref = null;
  try {
    var q = new URLSearchParams(location.search).get('ref');
    if (q) q = q.trim().toLowerCase();
    if (q && LAMRIM_PARTNERS[q]) {
      ref = q;
      localStorage.setItem(KEY, JSON.stringify({ ref: q, t: Date.now() }));
    } else {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && LAMRIM_PARTNERS[s.ref] && Date.now() - s.t < DAYS * 864e5) ref = s.ref;
    }
  } catch (e) {
    try { var q2 = new URLSearchParams(location.search).get('ref'); if (q2 && LAMRIM_PARTNERS[q2.toLowerCase()]) ref = q2.toLowerCase(); } catch (e2) {}
  }
  if (!ref) return;
  var map = LAMRIM_PARTNERS[ref];
  function apply() {
    var links = document.querySelectorAll('a[href*="wayforpay.com/button/"]');
    for (var i = 0; i < links.length; i++) {
      var m = links[i].href.match(/\/button\/([a-z0-9]+)/i);
      if (m && map[m[1]]) links[i].href = 'https://secure.wayforpay.com/button/' + map[m[1]];
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
