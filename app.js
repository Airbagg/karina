/* Уроки Карины. Прототип: данные в памяти + localStorage. Сегодня зафиксировано: сб, 17 октября 2026, 14:00. */
'use strict';
const TODAY = '2026-10-17', NOWT = '14:00';
/* ключ хранилища менять при каждом изменении формы данных, иначе у открывавших раньше грузится старое состояние */
const KEY = 'karina-proto-v4';
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WDN = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MN = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
/* Разделы ЕГЭ как в листе PROGRESS у Карины: строки = задания или критерии, столбцы = попытки.
   sub: строка-разбивка (критерии задания 4 в Speaking), в Итого не входит.
   k1zero: правило ЕГЭ, К1 (РКЗ) = 0 обнуляет всё письмо и эссе; так у неё и стоит в таблице.
   Цвета: Listening, Reading, Grammar, Letter как в её таблице; у Essay и Speaking цвета не названы, оставлены нейтральными. */
const SEC = [
  { n: 'Listening', c: '#2F6FB5', rows: [['Задание 1', 2], ['Задание 2', 3], ['Задания 3–9', 7]] },
  { n: 'Reading', c: '#D9822B', rows: [['Задание 10', 3], ['Задание 11', 2], ['Задания 12–18', 7]] },
  { n: 'Grammar & Vocabulary', c: '#2F7D4F', rows: [['Задания 19–25', 6], ['Задания 26–31', 5], ['Задания 32–38', 7]] },
  { n: 'Letter', c: '#D3362D', k1zero: true, rows: [['РКЗ', 2], ['Орг.', 2], ['Язык', 2]] },
  { n: 'Essay', c: '#57514B', k1zero: true, rows: [['РКЗ', 3], ['Орг.', 3], ['Лекс.', 3], ['Гр.', 3], ['Орф./Пункт.', 2]] },
  { n: 'Speaking', c: '#57514B', rows: [['Задание 1', 1], ['Задание 2', 4], ['Задание 3', 5], ['Задание 4', 10], ['РКЗ', 4, 1], ['Орг.', 3, 1], ['Язык', 3, 1]] },
];
const SECD = n => SEC.find(x => x.n === n);
const TIMES = ['10:00', '11:30', '15:00', '16:00', '17:00', '18:00', '19:00', '19:30'];

/* ---------- даты ---------- */
const pad = n => String(n).padStart(2, '0');
const D = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const add = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
const wd = s => WD[D(s).getDay()];
const dm = s => `${D(s).getDate()} ${MG[D(s).getMonth()]}`;
const dms = s => `${D(s).getDate()} ${MS[D(s).getMonth()]}`;
const longD = s => `${wd(s)}, ${dm(s)}`;
const when = (s, t) => s === TODAY ? `сегодня в ${t}` : s === add(TODAY, 1) ? `завтра в ${t}` : s === add(TODAY, -1) ? `вчера в ${t}` : `${longD(s)} в ${t}`;
const isPast = l => l.date < TODAY || (l.date === TODAY && l.time <= NOWT);
const byDT = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
const plural = (n, a, b, c) => { const m = Math.abs(n) % 100, k = m % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k >= 2 && k <= 4 ? b : c; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const token = () => Array.from({ length: 12 }, () => 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 55)]).join('');
const code4 = () => String(Math.floor(1000 + Math.random() * 9000));

/* ---------- пример данных ---------- */
function L(date, time, status, topic = '', hw = '', note = '', extra = {}) { return { id: uid(), date, time, status, topic, hw, note, ...extra }; }
function seed() {
  /* Уроки, темы, ДЗ, переносы Алины из таблицы Карины дословно. Прогресс: цифры из шаблона таблицы, как пример структуры. Где в таблице пусто, здесь пусто. Время 17:00 условное: в таблице времени нет.
     Дат замеров прогресса в таблице нет. */
  const alina = {
    id: 'alina', name: 'Алина', goal: 'английский, подготовка к ЕГЭ', token: 'k7Qx9mP2vR4t', code: '1234', open: true, phones: ['+79000000000'],
    schedule: { days: [2, 5], time: '17:00' },
    /* даты оплат из таблицы; размеры пакетов (4 и 8) заданы владельцем, в таблице их нет */
    payments: [{ date: '2026-09-10', n: 4 }, { date: '2026-09-25', n: 8 }],
    lessons: [
      L('2026-09-11', '17:00', 'done', 'Hobbies. Лексика: виды хобби, фразовые глаголы', 'Progress me Hobbies sections 1,2,6,5', 'Не начали грамматику'),
      L('2026-09-15', '17:00', 'done', 'Hobbies. Лексика: виды хобби, фразовые глаголы повторение. Грамматика present simple/continuous', 'то же самое + грамматика на платформе'),
      L('2026-09-18', '17:00', 'done', 'Hobbies. Повтор времен. Разбор задания speaking 3', 'грамматика, учить лексику по преимуществам хобби'),
      L('2026-09-23', '17:00', 'done', 'Hobbies. Преимущества и недостатки.'),
      L('2026-09-25', '17:00', 'done', 'Hobbies. Преимущества и недостатки. Разбор задания 4 устной части'),
      L('2026-09-29', '17:00', 'done'),
      L('2026-10-02', '17:00', 'moved', '', '', 'проспала', { movedTo: '2026-10-13' }),
      L('2026-10-06', '17:00', 'done'),
      L('2026-10-08', '17:00', 'moved', '', '', '', { movedTo: '2026-10-16' }),
      L('2026-10-13', '17:00', 'done', '', '', '', { from: '2026-10-02' }),
      L('2026-10-16', '17:00', 'plan', '', '', '', { from: '2026-10-08' }),
      L('2026-10-20', '17:00', 'plan', '', '', '', { auto: true }),
      L('2026-10-23', '17:00', 'plan', '', '', '', { auto: true }),
      L('2026-10-27', '17:00', 'plan', '', '', '', { auto: true }),
    ],
    /* попытки слева направо, как в таблице; tot = её «Итого» дословно; даты попыток условные (в шаблоне их нет), по просьбе владельца;
       null = задание в этой попытке не делали; такая попытка частичная, в итоги раздела не идёт */
    prog: {
      'Listening': { att: [[1, 0, 4], [2, 3, 5], [2, null, null]], tot: [5, 10, null], dates: ['2026-09-15', '2026-09-29', '2026-10-13'] },
      'Reading': { att: [[2, 0, 5], [null, null, 6]], tot: [7, null], dates: ['2026-09-25', '2026-10-06'] },
      'Grammar & Vocabulary': { att: [[4, 3, 3], [6, 4, 2], [6, 5, 4]], tot: [10, 12, 16], dates: ['2026-09-15', '2026-09-29', '2026-10-13'] },
      'Letter': { att: [[1, 2, 1], [1, 1, 0], [0, 2, 0], [2, 0, 0], [1, 2, 1]], tot: [4, 2, 0, 2, 4], dates: ['2026-09-15', '2026-09-18', '2026-09-25', '2026-10-06', '2026-10-13'] },
      'Essay': { att: [[1, 2, 1, 1, 0], [2, 1, 0, 0, 2], [0, 2, 2, 1, 2], [2, 3, 2, 0, 1], [2, 2, 1, 1, 2]], tot: [5, 5, 0, 8, 8], dates: ['2026-09-15', '2026-09-18', '2026-09-25', '2026-10-06', '2026-10-13'] },
      'Speaking': { att: [[1, 3, 5, 3, 1, 1, 1], [1, 3, 5, 5, 2, 2, 1], [1, 4, 4, 4, 1, 2, 1]], tot: [12, 14, 13], dates: ['2026-09-18', '2026-09-29', '2026-10-13'] },
    },
    mocks: [{ id: uid(), date: '', p: 75, s: 94, link: 'есть' }],
  };
  return { students: [alina] };
}

/* будущие уроки по расписанию: на 4 недели вперёд; перенесённые и правленные руками не трогаем */
function regen(s) {
  s.lessons = s.lessons.filter(l => !(l.auto && l.status === 'plan' && !isPast(l) && !l.topic));
  for (let i = 0; i <= 27; i++) {
    const d = add(TODAY, i);
    if (!s.schedule.days.includes(D(d).getDay())) continue;
    const l = { date: d, time: s.schedule.time };
    if (isPast(l)) continue;
    if (s.lessons.some(x => x.date === d && x.status !== 'moved' && x.status !== 'free' && x.status !== 'burn')) continue;
    s.lessons.push(L(d, s.schedule.time, 'plan', '', '', '', { auto: true }));
  }
  s.lessons.sort(byDT);
}

/* ---------- расчёт оплат ---------- */
const charged = l => l.status === 'done' || l.status === 'burn' || (l.status === 'moved' && l.burn);
function calc(s) {
  const paid = s.payments.reduce((a, p) => a + p.n, 0) + (s.carry || 0);
  const used = s.lessons.filter(charged).length;
  const rem = paid - used;
  const plans = s.lessons.filter(l => l.status === 'plan').sort(byDT);
  const paidIds = new Set(plans.slice(0, Math.max(rem, 0)).map(l => l.id));
  const lastPack = s.payments.length ? s.payments[s.payments.length - 1].n : 0;
  const of = Math.max(lastPack, rem, 0);
  const pending = plans.filter(isPast);
  const upcoming = plans.filter(l => !isPast(l));
  const firstUnpaid = upcoming.find(l => !paidIds.has(l.id));
  return { paid, used, rem, of, lastPack, paidIds, pending, upcoming, firstUnpaid, next: upcoming[0] };
}
function lastHW(s) {
  const done = s.lessons.filter(l => l.status === 'done' && l.hw).sort(byDT).pop();
  if (!done) return null;
  return { text: done.hw, from: done.date };
}

/* ---------- состояние ---------- */
let data, auth, ui, sheet = null, toastT = 0, undoSnap = null, lastScreenKey = '', isShot = false;
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { if (isShot) return; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим: живём в памяти */ } },
};
function load() {
  data = store.get(KEY) || seed();
  auth = store.get(KEY + ':auth') || { k: false, s: {} };
  ui = { role: 'k', ktab: 'students', sid: null, dsid: 'alina', stab: 'now', stoken: 'k7Qx9mP2vR4t', more: {}, push: 0 };
}
function save() { store.set(KEY, data); store.set(KEY + ':auth', auth); }
const S = id => data.students.find(s => s.id === id);
const desk = () => matchMedia('(min-width: 900px)').matches;
function commit(fn, msg) {
  const snap = JSON.stringify(data);
  fn();
  save();
  render();
  toast(msg, snap);
}

/* ---------- иконки ---------- */
const I = {
  back: '<svg class="ico" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  arr: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  l: '<svg class="ico" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  r: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  tick: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.8a3.4 3.4 0 010 6.4M18 14.8c2 .7 3.2 2.4 3.6 5.2"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  now: '<svg viewBox="0 0 24 24"><path d="M4 11.5L12 5l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/></svg>',
  hist: '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16"/><path d="M7.5 15l4-4.5 3 2.5 5-6"/></svg>',
};

/* ---------- куски ---------- */
function remBlock(s, c, student) {
  const r = Math.max(c.rem, 0);
  const pct = c.of ? Math.round(r / c.of * 100) : 0;
  const word = plural(r, 'урок оплачен', 'урока оплачено', 'уроков оплачено');
  let note = '';
  if (c.rem < 0) note = `<div class="note">Долг ${-c.rem} ${plural(-c.rem, 'урок', 'урока', 'уроков')}. Пакет на 4 или 8 уроков</div>`;
  else if (c.firstUnpaid) note = `<div class="note">${c.firstUnpaid.date === (c.next && c.next.date) ? 'Следующий урок не оплачен' : 'С ' + dm(c.firstUnpaid.date) + ' нужна оплата'}</div>`;
  else if (!student) note = `<div class="okline">Все ближайшие уроки оплачены</div>`;
  return `<div class="big num ${r === 0 ? 'zero' : ''}">${r}<small>${word}</small></div>
    <div class="bar" style="height:6px;margin-top:14px"><i style="width:${pct}%${r <= 1 ? ';background:var(--red)' : ''}"></i></div>
    <div class="legend">${c.lastPack ? `<span>пакет ${c.lastPack} ${plural(c.lastPack, 'урок', 'урока', 'уроков')}</span><span>проведено ${Math.max(c.of - r, 0)}</span>` : ''}<span>осталось ${r}</span></div>${note}`;
}
function payTag(c, l) { return c.paidIds.has(l.id) ? '<span class="st g">оплачен</span>' : '<span class="st r">не оплачен</span>'; }
function upRow(s, c, l, karina) {
  const topic = l.topic ? esc(l.topic) : '';
  const moved = l.from ? `<div class="hwl"><em>перенос с ${dms(l.from)}</em></div>` : '';
  const acts = karina ? `<div class="acts"><button class="lnk" data-act="edit" data-l="${l.id}">изменить</button><button class="lnk" data-act="mark" data-mode="move" data-l="${l.id}">перенести</button><button class="lnk" data-act="mark" data-mode="cancel" data-l="${l.id}">отменить</button></div>` : '';
  return `<div class="les" data-row="${l.id}"><div class="d"><b class="num">${D(l.date).getDate()}</b><span>${wd(l.date)}</span></div>
    <div class="t"><b class="num">${l.time}</b>${topic ? `<div class="tp">${topic}</div>` : ''}${moved}</div><div class="st">${payTag(c, l)}${acts}</div></div>`;
}
function statusTag(l) {
  if (l.status === 'moved') return `<span class="tag">перенос на ${dms(l.movedTo)}${l.burn ? ', урок списан' : ''}</span>`;
  if (l.status === 'burn') return '<span class="tag r">отмена, урок сгорел</span>';
  if (l.status === 'free') return '<span class="tag">отмена без списания</span>';
  if (l.status === 'plan') return '<span class="tag r">ждёт отметки</span>';
  if (l.from) return `<span class="tag">перенос с ${dms(l.from)}</span>`;
  return '';
}
function pastRow(l, karina) {
  const tag = statusTag(l);
  let topic = l.topic ? `<div class="tp">${esc(l.topic)}</div>` : l.status === 'plan' ? `<div class="tp mute">${karina ? 'отметьте, как прошёл урок' : 'тема появится после урока'}</div>` : '';
  const hw = l.hw ? `<div class="hwl"><em>ДЗ:</em> ${esc(l.hw)}</div>` : '';
  const own = karina && l.note ? `<div class="own"><em>только для тебя:</em> ${esc(l.note)}</div>` : '';
  const cls = l.status === 'moved' ? 'moved' : (l.status === 'burn' || l.status === 'free') ? 'cancel' : '';
  const inner = `<div class="d"><b class="num">${D(l.date).getDate()}</b><span>${wd(l.date)}</span></div><div class="t"><b class="num">${l.time}${tag ? ' &nbsp;' + tag : ''}</b>${topic}${hw}${own}</div>`;
  return karina ? `<button class="les past btnrow ${cls}" data-act="${l.status === 'plan' ? 'mark' : 'editpast'}" data-mode="done" data-l="${l.id}" data-row="${l.id}">${inner}</button>`
    : `<div class="les past ${cls}">${inner}</div>`;
}
function months(list, karina) {
  const groups = {};
  list.forEach(l => { const k = l.date.slice(0, 7); (groups[k] = groups[k] || []).push(l); });
  return Object.keys(groups).sort().reverse().map(k => {
    const [y, m] = k.split('-').map(Number);
    const ls = groups[k].sort(byDT).reverse();
    const n = ls.filter(l => l.status === 'done').length;
    return `<h2><span>${MN[m - 1]}${y !== 2026 ? ' ' + y : ''}</span><span>${n} ${plural(n, 'урок', 'урока', 'уроков')}</span></h2>${ls.map(l => pastRow(l, karina)).join('')}`;
  }).join('');
}
const pg = (s, n) => (s.prog && s.prog[n]) || { att: [], tot: [] };
const secMax = n => SECD(n).rows.filter(r => !r[2]).reduce((a, r) => a + r[1], 0);
function formSum(n, vals) { const a = vals.map(v => String(v ?? '').trim() === '' ? null : (parseInt(v, 10) || 0)); if (a.every(x => x == null)) return '·'; return isPartial(n, a) ? 'частично' : calcTot(n, a); }
function calcTot(n, a) { const d = SECD(n); if (d.k1zero && a[0] === 0) return 0; return d.rows.reduce((t, r, i) => t + (r[2] ? 0 : (a[i] || 0)), 0); }
const isPartial = (n, a) => SECD(n).rows.some((r, i) => !r[2] && a[i] == null);
function allAtt(s, n) { const p = pg(s, n), mx = secMax(n); return p.att.map((a, i) => ({ a, partial: isPartial(n, a), score: isPartial(n, a) ? null : (p.tot[i] != null ? p.tot[i] : calcTot(n, a)), max: mx, date: (p.dates || [])[i] || '', i })); }
function totals(s, n) { return allAtt(s, n).filter(e => !e.partial); }
function taskHist(s, n, ri) { const r = SECD(n).rows[ri]; return allAtt(s, n).filter(e => e.a[ri] != null).map(e => ({ score: e.a[ri], max: r[1], date: e.date, i: e.i })); }
function spark(es) {
  if (es.length < 2) return '<span class="spark"></span>';
  const W = 64, H = 22, n = es.length;
  const pts = es.map((e, i) => `${(i * (W - 4) / (n - 1) + 2).toFixed(1)},${(H - 2 - e.score / e.max * (H - 4)).toFixed(1)}`).join(' ');
  const last = pts.split(' ').pop().split(',');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="2.4" fill="currentColor"/></svg>`;
}
function delta(es) { if (es.length < 2) return ''; const d = es[es.length - 1].score - es[0].score; return d !== 0 ? `<span class="dl ${d > 0 ? 'up' : 'dn'}">${d > 0 ? '+' : ''}${d}</span>` : ''; }
function progCompact(s, karina) {
  const rows = SEC.map(d => { const es = totals(s, d.n); const l = es[es.length - 1];
    const all = allAtt(s, d.n), lp = all[all.length - 1];
    if (!l && lp) { const ri = d.rows.findIndex((r, i) => lp.a[i] != null);
      return `<button class="prow" data-act="prog" data-sec="${d.n}" style="--sc:${d.c}"><span class="pn"><b>${d.n}</b><small>последнее: ${esc(d.rows[ri][0])}, ${lp.a[ri]} из ${d.rows[ri][1]}${lp.date ? ', ' + dms(lp.date) : ''}</small></span><span class="spark"></span><span class="pv num"><small>частично</small></span><svg class="ico chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`; }
    return `<button class="prow" data-act="prog" data-sec="${d.n}" style="--sc:${d.c}"><span class="pn"><b>${d.n}</b><small>${es.length ? (lp.date ? 'последняя ' + dms(lp.date) : es.length + ' ' + plural(es.length, 'попытка', 'попытки', 'попыток')) : 'попыток нет'}</small></span>${spark(es)}<span class="pv num">${l ? `${l.score}<small> из ${l.max}</small>${delta(es)}` : '<small>нет</small>'}</span><svg class="ico chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>`; }).join('');
  const mk = s.mocks[s.mocks.length - 1];
  const mock = mk ? `<button class="prow" data-act="mock" data-m="${mk.id}"><span class="pn"><b>Пробник</b><small>${mk.date ? dm(mk.date) : 'проверка работы'}</small></span><span class="pv num">${mk.p}<small> перв.</small> &nbsp;${mk.s}<small> втор.</small></span><svg class="ico chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>` : '';
  return `<h2><span>Прогресс по разделам ЕГЭ</span></h2>${rows}${karina ? '' : mock}`;
}
function progressBlock(s) { return progCompact(s, false); }
function grid(s, n) {
  const d = SECD(n), p = pg(s, n), es = allAtt(s, n);
  const tint = (v, m) => v == null ? '' : v >= m ? 'g' : v === 0 ? 'r' : '';
  const head = `<tr><th></th>${es.map((e, i) => `<th>${e.date ? dms(e.date) : '&nbsp;'}<small>${i + 1}</small></th>`).join('')}</tr>`;
  const body = d.rows.map((r, ri) => `<tr class="${r[2] ? 'sub' : ''}"><th><button data-act="task" data-row="${ri}">${esc(r[0])}</button></th>${p.att.map(a => `<td class="${tint(a[ri], r[1])}">${a[ri] == null ? '<span class="nd" title="не делали">·</span>' : a[ri] + '<small>/' + r[1] + '</small>'}</td>`).join('')}</tr>`).join('');
  const tot = `<tr class="tot"><th>Итого</th>${es.map(e => e.partial ? '<td><span class="part">частично</span></td>' : `<td>${e.score}<small>/${e.max}</small></td>`).join('')}</tr>`;
  return `<div class="gridwrap"><table class="grid num"><thead>${head}</thead><tbody>${body}${tot}</tbody></table></div>`;
}
function weakest(s, n) {
  const d = SECD(n); let w = -1, wr = 2, wv = null;
  d.rows.forEach((r, i) => { const h = taskHist(s, n, i); if (!h.length) return; const v = h[h.length - 1].score, q = v / r[1]; if (q < wr) { wr = q; w = i; wv = v; } });
  return w < 0 || wr >= 1 ? '' : `Слабее всего по последним результатам: <b>${esc(d.rows[w][0])}, ${wv} из ${d.rows[w][1]}</b>`;
}
function chart(es) {
  const n = es.length, bw = 30, gap = Math.max(14, Math.min(28, (300 - n * bw) / Math.max(n - 1, 1))), H = 90;
  const W = n * bw + (n - 1) * gap;
  const bars = es.map((e, i) => { const h = Math.max(2, Math.round(e.score / e.max * H)); const x = i * (bw + gap);
    return `<rect x="${x}" y="${H - h + 18}" width="${bw}" height="${h}" rx="5" fill="${i === n - 1 ? 'var(--ink)' : '#D9D0C6'}"/><text x="${x + bw / 2}" y="${H - h + 12}" text-anchor="middle" class="cv">${e.score}</text><text x="${x + bw / 2}" y="${H + 36}" text-anchor="middle" class="cl">${e.date ? dms(e.date) : i + 1}</text>`; }).join('');
  return `<svg class="chart" viewBox="-2 0 ${W + 4} ${H + 42}" width="${W + 4}" height="${H + 42}" role="img" aria-label="Динамика: ${es.map(e => e.score).join(', ')}"><line x1="-2" x2="${W + 2}" y1="${H + 18}" y2="${H + 18}" stroke="var(--line2)"/>${bars}</svg>`;
}

function mocksBlock(s, karina) {
  const rows = s.mocks.slice().sort((a, b) => b.date.localeCompare(a.date)).map(m => `<button class="mock" data-act="mock" data-m="${m.id}" data-row="${m.id}"><div class="n"><b>Пробник${m.date ? ', ' + dm(m.date) : ''}</b><div>${m.link ? 'проверка работы' : 'без ссылки'}</div></div>
    <div class="sc"><b class="num">${m.p}</b><span>первичный</span></div><div class="sc"><b class="num">${m.s}</b><span>вторичный</span></div></button>`).join('');
  return `<h2><span>Пробники</span>${karina ? `<button class="lnk" data-act="addmock">+ пробник</button>` : ''}</h2>${rows || '<div class="empty">Пробников пока не было</div>'}`;
}
function askCard(s, l, d) {
  const q = `${s.name}, ${when(l.date, l.time)}`;
  if (d) return `<div class="ask ask-d"><div class="q">${q} <span>· как прошёл урок?</span></div><div class="btns">${askBtns(l)}</div></div>`;
  return `<div class="ask"><div class="q">${q}<span><br>Как прошёл урок?</span></div><div class="btns">${askBtns(l)}</div></div>`;
}
const askBtns = l => `<button class="btn main" data-act="mark" data-mode="done" data-l="${l.id}">Проведён</button><button class="btn" data-act="mark" data-mode="move" data-l="${l.id}">Перенос</button><button class="btn" data-act="mark" data-mode="cancel" data-l="${l.id}">Отмена</button>`;
const schedText = s => s.schedule.days.length ? `${[1, 2, 3, 4, 5, 6, 0].filter(d => s.schedule.days.includes(d)).map(d => WD[d]).join(', ')} в ${s.schedule.time}` : 'не задано';
function stRow(s, cur) {
  const c = calc(s);
  const r = Math.max(c.rem, 0);
  const nx = c.next ? when(c.next.date, c.next.time) : 'уроков нет';
  const warn = c.next && !c.paidIds.has(c.next.id) ? '<div class="pay">нужна оплата</div>' : '';
  return `<button class="row ${r <= 1 ? 'lowr' : ''}" data-act="open" data-s="${s.id}" ${cur ? 'aria-current="page"' : ''}><div class="n"><div class="nm">${esc(s.name)}</div><div class="nx">${nx}</div>${warn}</div>
    <div class="cnt"><div class="v num">${r} <small>из ${c.of}</small></div><div class="bar"><i style="width:${c.of ? Math.round(r / c.of * 100) : 0}%"></i></div></div></button>`;
}
function todayCount() { return data.students.reduce((a, s) => a + s.lessons.filter(l => l.date === TODAY && l.status === 'plan').length, 0); }

/* ---------- экраны Карины ---------- */
function kStudents() {
  const asks = [];
  data.students.forEach(s => calc(s).pending.forEach(l => asks.push([s, l])));
  asks.sort((a, b) => byDT(a[1], b[1]));
  const n = todayCount();
  return `<div class="top"><span>Уроки Карины</span><img class="av" src="avatar.jpg" alt=""></div>
    <h1>Ученики</h1><div class="sub">${WDN[D(TODAY).getDay()]}, ${dm(TODAY)} · сегодня ${n} ${plural(n, 'урок', 'урока', 'уроков')}</div>
    ${asks.map(([s, l]) => askCard(s, l)).join('')}
    <h2><span>Все ученики</span><button class="lnk" data-act="addstudent">+ ученик</button></h2>
    ${data.students.map(s => stRow(s)).join('')}
    <div style="padding-top:18px"><button class="lnk mute" data-act="logout">Выйти</button></div>`;
}
function kWeek() {
  let html = `<div class="top"><span>Уроки Карины</span><img class="av only-m" src="avatar.jpg" alt=""></div><h1>Неделя</h1><div class="sub">с ${dm(TODAY)} по ${dm(add(TODAY, 6))}</div>`;
  for (let i = 0; i < 7; i++) {
    const d = add(TODAY, i);
    const ls = [];
    data.students.forEach(s => { const c = calc(s); s.lessons.filter(l => l.date === d && l.status === 'plan').forEach(l => ls.push([s, l, c])); });
    ls.sort((a, b) => a[1].time.localeCompare(b[1].time));
    html += `<h2><span>${i === 0 ? 'Сегодня, ' : i === 1 ? 'Завтра, ' : ''}${i < 2 ? dm(d) : longD(d)}</span><span>${ls.length || ''}</span></h2>`;
    html += ls.length ? ls.map(([s, l, c]) => `<button class="les btnrow" data-act="open" data-s="${s.id}"><div class="d"><b class="num" style="font-size:16px">${l.time}</b></div><div class="t"><b>${esc(s.name)}</b>${l.topic ? `<div class="tp">${esc(l.topic)}</div>` : ''}</div><div class="st">${isPast(l) ? '<span class="st r">отметить</span>' : payTag(c, l)}</div></button>`).join('') : '<div class="empty">Уроков нет</div>';
  }
  return html;
}
function kStudent(s, d) {
  const c = calc(s);
  const asks = c.pending.map(l => askCard(s, l, d)).join('');
  const all = ui.more[s.id];
  const lim = d ? 3 : 4;
  const ups = c.upcoming.slice(0, all ? 99 : lim);
  const upHtml = `<h2><span>Ближайшие</span><button class="lnk" data-act="addlesson">+ урок</button></h2>${ups.map(l => upRow(s, c, l, true)).join('') || '<div class="empty">Уроков не запланировано</div>'}
    ${c.upcoming.length > lim ? `<button class="lnk mute" data-act="more">${all ? 'свернуть' : 'ещё ' + (c.upcoming.length - lim)}</button>` : ''}`;
  const past = s.lessons.filter(l => l.status !== 'plan' || isPast(l));
  const histHtml = `${months(past, true) || '<h2>Уроки</h2><div class="empty">Уроков ещё не было</div>'}`;
  const pays = s.payments.slice().reverse().map(p => `<div class="pr"><b class="num" style="font-weight:600">Пакет ${p.n}</b><span>${dm(p.date)}</span></div>`).join('');
  const settings = `<h2>Ученик</h2>
    <div class="setrow"><span class="k">Расписание: <b>${schedText(s)}</b></span><button class="lnk" data-act="sched">изменить</button></div>
    <div class="setrow"><span class="k">Доступ: ${s.open ? `<b class="num">${s.phones.length ? '+7 ' + s.phones[0].replace(/\D/g, '').slice(1, 4) + ' …' : 'номер не указан'}</b>, код <b class="num">${s.code}</b>` : '<b style="color:var(--red)">закрыт</b>'}</span><button class="lnk" data-act="access">изменить</button></div>`;
  const payHtml = `${remBlock(s, c, false)}<div class="btns" style="margin-top:16px"><button class="btn" data-act="pack" data-n="4">+ Пакет 4</button><button class="btn" data-act="pack" data-n="8">+ Пакет 8</button></div>`;
  if (d) {
    return `<div class="wrap" style="padding-top:28px">${asks}
      <div class="cols" style="margin-top:${asks ? 28 : 0}px"><div>
        <h1 style="margin-top:0">${esc(s.name)}</h1><div class="sub">${esc(s.goal)}</div>
        ${upHtml}${histHtml}
      </div><div>
        ${payHtml}
        ${progCompact(s, true)}
        ${settings}
        ${mocksBlock(s, true)}
        <h2>Оплаты</h2><div class="pays">${pays || '<div class="empty">Оплат пока не было</div>'}</div>
      </div></div></div>`;
  }
  return `<div class="top"><button class="back" data-act="back">${I.back}Ученики</button><img class="av" src="avatar.jpg" alt=""></div>
    ${asks}<h1>${esc(s.name)}</h1><div class="sub">${esc(s.goal)}</div>
    ${payHtml}${progCompact(s, true)}${settings}${upHtml}${histHtml}
    <h2>Оплаты</h2><div class="pays">${pays || '<div class="empty">Оплат пока не было</div>'}</div>
    ${mocksBlock(s, true)}`;
}

/* ---------- экраны ученика ---------- */
function sNow(s, d) {
  const c = calc(s);
  const ups = c.upcoming.slice(0, 3).map(l => upRow(s, c, l, false)).join('') || '<div class="empty">Уроков не запланировано</div>';
  const hw = lastHW(s);
  const hwHtml = `<h2>Домашнее задание</h2>${hw ? `<div class="hw"><div class="m">задано ${dm(hw.from)}</div>${esc(hw.text)}</div>` : '<div class="empty">Заданий нет</div>'}`;
  const head = `<div class="top only-m"><span>Уроки с Кариной</span><img class="av" src="avatar.jpg" alt=""></div><h1>${esc(s.name)}</h1><div class="sub">${esc(s.goal)}</div>`;
  if (d) return `<div class="wrap" style="padding-top:36px">${head}<div class="cols"><div>${remBlock(s, c, true)}${progCompact(s, false)}${hwHtml}</div><div><h2 style="margin-top:28px"><span>Ближайшие</span><span>${schedText(s)}</span></h2>${ups}</div></div></div>`;
  return `${head}${remBlock(s, c, true)}${progCompact(s, false)}<h2><span>Ближайшие</span><span style="font-weight:500">${schedText(s)}</span></h2>${ups}${hwHtml}`;
}
function sHist(s, d) {
  const past = s.lessons.filter(l => l.status !== 'plan' || isPast(l));
  const done = s.lessons.filter(l => l.status === 'done').length;
  const head = `<div class="top only-m"><span>Уроки с Кариной</span><img class="av" src="avatar.jpg" alt=""></div><h1>История и прогресс</h1><div class="sub">${done} ${plural(done, 'урок проведён', 'урока проведено', 'уроков проведено')} с ${dm(s.lessons[0] ? s.lessons[0].date : TODAY)}</div>`;
  const prog = progressBlock(s, false);
  if (d) return `<div class="wrap" style="padding-top:36px">${head}<div class="cols"><div>${months(past, false)}</div><div>${prog}</div></div></div>`;
  return `${head}${prog}${months(past, false)}`;
}

/* ---------- входы ---------- */
function kLogin() {
  return `<div style="max-width:380px;margin:0 auto;padding-top:9vh">
    <img class="av" src="avatar.jpg" alt="" style="width:64px;height:64px">
    <h1 style="margin-top:20px">Уроки Карины</h1><div class="sub">Вход для преподавателя</div>
    <label class="fld" style="margin-top:28px"><span>Пароль</span><input class="in" id="pw" type="password" autocomplete="current-password" placeholder="Пароль"></label>
    <button class="check" data-act="remember" aria-pressed="${ui.remember !== false}"><span class="bx">${I.tick}</span><span><b>Запомнить это устройство</b><small>Больше не спросим пароль на этом телефоне или Mac</small></span></button>
    <div class="info r" id="pwerr" hidden style="color:var(--red);font-weight:600">Введите пароль</div>
    <button class="btn main wide" data-act="login" style="margin-top:22px">Войти</button>
    <p class="fine">В примере подойдёт любой пароль.</p></div>`;
}
function sLogin(tok) {
  const s = data.students.find(x => x.token === tok);
  const phone = s && s.open ? s.phones[0] : '';
  return `<div style="max-width:380px;margin:0 auto;padding-top:9vh">
    <img class="av" src="avatar.jpg" alt="" style="width:64px;height:64px">
    <h1 style="margin-top:20px">Уроки с Кариной</h1>
    <div class="sub" style="margin-top:6px">Расписание, оплаты и прогресс. Только просмотр.</div>
    <label class="fld" style="margin-top:28px"><span>Телефон ученика или родителя</span><input class="in num" id="phone" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" value="${esc(fmtPhone(phone))}"></label>
    <div class="fld"><span>Код из 4 цифр <em>· его даёт Карина</em></span>
    <label class="codebox"><input id="code" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="one-time-code" aria-label="Код из 4 цифр">
      <span class="cells">${[0, 1, 2, 3].map(i => `<span class="cell num" data-i="${i}"></span>`).join('')}</span></label></div>
    <div id="codeerr" class="info" style="color:var(--red);font-weight:600" hidden>Сначала номер телефона</div>
    <p class="fine">После входа это устройство запомним, код больше не спросим.<br>В примере: +7 900 000-00-00, код 1234.</p></div>`;
}
function fmtPhone(v) {
  const d = String(v || '').replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10);
  if (!d) return '';
  let out = '+7 (' + d.slice(0, 3);
  if (d.length > 3) out += ') ' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

/* ---------- сборка ---------- */
function render() {
  const app = document.getElementById('app');
  const d = desk();
  document.querySelectorAll('.who [data-role]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.role === ui.role)));
  let side = '', screen = '', tabs = '', key = '';
  if (ui.role === 'k' && !auth.k) { screen = kLogin(); key = 'klogin'; }
  else if (ui.role === 's' && !auth.s[ui.stoken]) { screen = sLogin(ui.stoken); key = 'slogin'; }
  else if (ui.role === 'k') {
    if (d) {
      const n = todayCount();
      side = `<aside class="side"><div class="top"><span>Уроки Карины</span><img class="av" src="avatar.jpg" alt=""></div>
        <h1>Ученики</h1><div class="sub">сегодня ${n} ${plural(n, 'урок', 'урока', 'уроков')}</div>
        <button class="nav" data-act="ktab" data-t="week" style="margin-top:14px" ${ui.ktab === 'week' ? 'aria-current="page"' : ''}>Неделя<span class="c">${data.students.reduce((a, s) => a + calc(s).pending.length, 0) || ''}</span></button>
        <div style="height:8px"></div>
        ${data.students.map(s => stRow(s, ui.ktab === 'students' && ui.dsid === s.id)).join('')}
        <button class="lnk" data-act="addstudent" style="padding:8px 10px">+ ученик</button>
        <div class="foot"><button class="lnk mute" data-act="logout" style="padding:0 10px">Выйти</button></div></aside>`;
      if (ui.ktab === 'week') { screen = kWeek(); key = 'kweek'; } else { const s = S(ui.dsid) || data.students[0]; ui.dsid = s.id; screen = kStudent(s, true); key = 'kd:' + s.id; }
    } else {
      if (ui.sid && S(ui.sid)) { screen = kStudent(S(ui.sid), false); key = 'ks:' + ui.sid; }
      else { screen = ui.ktab === 'week' ? kWeek() : kStudents(); key = 'k' + ui.ktab; }
      tabs = `<nav class="tabs"><button class="tb" data-act="ktab" data-t="students" ${ui.ktab === 'students' && !ui.sid ? 'aria-current="page"' : ''}>${I.people}Ученики</button><button class="tb" data-act="ktab" data-t="week" ${ui.ktab === 'week' && !ui.sid ? 'aria-current="page"' : ''}>${I.cal}Неделя</button></nav>`;
    }
  } else {
    const s = data.students.find(x => x.token === ui.stoken);
    if (!s || !s.open) { delete auth.s[ui.stoken]; save(); return render(); }
    screen = ui.stab === 'hist' ? sHist(s, d) : sNow(s, d);
    key = 's' + ui.stab;
    const nav = `<button class="${d ? 'nav' : 'tb'}" data-act="stab" data-t="now" ${ui.stab === 'now' ? 'aria-current="page"' : ''}>${d ? '' : I.now}Сейчас</button><button class="${d ? 'nav' : 'tb'}" data-act="stab" data-t="hist" ${ui.stab === 'hist' ? 'aria-current="page"' : ''}>${d ? '' : I.hist}История и прогресс</button>`;
    if (d) side = `<aside class="side"><div class="top"><span>Уроки с Кариной</span><img class="av" src="avatar.jpg" alt=""></div><h1>${esc(s.name)}</h1><div class="sub">${esc(s.goal)}</div><div style="height:14px"></div>${nav}<div class="foot"><button class="lnk mute" data-act="slogout" style="padding:0 10px">Выйти на этом устройстве</button></div></aside>`;
    else tabs = `<nav class="tabs">${nav}</nav>`;
  }
  const old = app.querySelector('.scr');
  const keep = old && key === lastScreenKey ? old.scrollTop : 0;
  let anim = '';
  if (key !== lastScreenKey && lastScreenKey) anim = ui.push === 1 ? 'in-right' : ui.push === -1 ? 'in-left' : 'in-fade';
  ui.push = 0;
  app.innerHTML = `${side}<div class="pane"><div class="scr ${anim}">${screen}</div>${tabs}</div>`;
  const scr = app.querySelector('.scr');
  scr.scrollTop = keep;
  lastScreenKey = key;
  if (key === 'slogin') bindCode();
  if (sheet) drawSheet();
}

/* ---------- листы ---------- */
function openSheet(st) { sheet = st; const w = document.getElementById('sheet'); w.hidden = false; w.classList.remove('closing'); drawSheet(true); }
function closeSheet() {
  const w = document.getElementById('sheet');
  if (!sheet) return;
  sheet = null;
  if (isShot) { w.hidden = true; return; }
  w.classList.add('closing');
  setTimeout(() => { if (!sheet) { w.hidden = true; w.innerHTML = ''; w.classList.remove('closing'); } }, 240);
}
function calHtml(st, s) {
  const base = D(st.cal);
  const dow = (base.getDay() + 6) % 7;
  const start = add(iso(base), -dow);
  const end = add(start, 13);
  const busy = new Set(s ? s.lessons.filter(l => l.status === 'plan' || l.status === 'done').map(l => l.date) : []);
  const title = D(start).getMonth() === D(end).getMonth() ? `${MN[D(start).getMonth()]}` : `${MN[D(start).getMonth()]} · ${MN[D(end).getMonth()].toLowerCase()}`;
  let cells = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(w => `<span class="wd">${w}</span>`).join('');
  for (let i = 0; i < 14; i++) {
    const d = add(start, i);
    cells += `<button class="dy num ${d === TODAY ? 'today' : ''} ${d < TODAY ? 'off' : ''}" data-act="pickday" data-d="${d}" aria-pressed="${d === st.date}" aria-label="${longD(d)}">${D(d).getDate()}${busy.has(d) ? '<i></i>' : ''}</button>`;
  }
  return `<div class="cal"><div class="ch"><button data-act="calnav" data-n="-7" aria-label="Раньше">${I.l}</button><span>${title}</span><button data-act="calnav" data-n="7" aria-label="Позже">${I.r}</button></div><div class="grid">${cells}</div></div>`;
}
function timesHtml(st) {
  const opts = TIMES.includes(st.time) ? TIMES : [...TIMES.slice(0, 7), st.time];
  return `<div class="times">${opts.map(t => `<button data-act="picktime" data-t="${t}" aria-pressed="${t === st.time}">${t}</button>`).join('')}</div>
    <label class="fld" style="margin-top:8px"><span><em>или своё время</em></span><input class="in num" type="time" data-f="time" value="${st.time}" style="max-width:160px"></label>`;
}
function drawSheet(first) {
  const w = document.getElementById('sheet');
  const st = sheet;
  const s = S(st.sid);
  let h = '';
  if (st.type === 'mark' || st.type === 'editpast') {
    const l = s.lessons.find(x => x.id === st.lid);
    const c = calc(s);
    const editing = st.type === 'editpast';
    h = `<h3>${esc(s.name)}</h3><div class="shd">${longD(l.date)} в ${l.time}${editing ? ' · правка урока' : ''}</div>`;
    if (!editing) h += `<div class="seg">${[['done', 'Проведён'], ['move', 'Перенос'], ['cancel', 'Отмена']].map(([m, t]) => `<button data-act="mode" data-mode="${m}" aria-pressed="${st.mode === m}">${t}</button>`).join('')}</div>`;
    h += `<div class="mode" data-k="${st.mode}">`;
    if (st.mode === 'done') {
      const after = c.rem - 1;
      h += `<label class="fld"><span>Тема урока</span><textarea class="in" data-f="topic" rows="2" style="min-height:0" placeholder="Например, Hobbies. Разбор задания 4">${esc(st.topic)}</textarea></label>
        <label class="fld"><span>Домашнее задание${c.upcoming[0] ? ` <em>к ${dm(c.upcoming[0].date)}</em>` : ''}</span><textarea class="in" data-f="hw" rows="3" placeholder="Что сделать к следующему уроку">${esc(st.hw)}</textarea></label>
        <label class="fld"><span>Комментарий <em>видишь только ты</em></span><textarea class="in own" data-f="note" rows="2" placeholder="Например, не начали грамматику">${esc(st.note)}</textarea></label>
        ${editing ? '' : `<div class="info">${after >= 0 ? `Спишется 1 урок из пакета. Останется <b class="num">${after} из ${c.of}</b>.` : `<span class="r">Оплаченных уроков нет: урок уйдёт в долг.</span>`} Тему и ДЗ ${esc(s.name)} увидит сразу.</div>`}
        <button class="btn main wide" data-act="savemark">${editing ? 'Сохранить' : 'Сохранить урок'}</button>`;
    } else if (st.mode === 'move') {
      h += `<div class="fromto"><span class="was">${longD(l.date)}, ${l.time}</span>${I.arr}<span class="now">${longD(st.date)}, ${st.time}</span></div>
        ${calHtml(st, s)}${timesHtml(st)}
        <button class="check" data-act="nocharge" aria-pressed="${st.nocharge}"><span class="bx">${I.tick}</span><span><b>Не списывать урок</b><small>Снимите, если перенос поздний и урок сгорает</small></span></button>
        <button class="btn main wide" data-act="savemove">Перенести на ${dm(st.date)}</button>`;
    } else {
      h += `<div class="opts"><button class="opt" data-act="burn" data-v="1" aria-pressed="${st.burn}"><span class="radio"></span><span><b>Урок сгорает</b><small>Спишется из пакета, как проведённый</small></span></button>
        <button class="opt" data-act="burn" data-v="0" aria-pressed="${!st.burn}"><span class="radio"></span><span><b>Без списания</b><small>Урок останется в оплаченных</small></span></button></div>
        <button class="btn red wide" data-act="savecancel">Отменить урок</button>`;
    }
    h += `</div>`;
  } else if (st.type === 'edit' || st.type === 'addlesson') {
    const l = st.lid && s.lessons.find(x => x.id === st.lid);
    h = `<h3>${st.type === 'edit' ? 'Изменить урок' : 'Новый урок'}</h3><div class="shd">${esc(s.name)}${l ? ` · сейчас ${longD(l.date)}, ${l.time}` : ''}</div>
      ${calHtml(st, s)}${timesHtml(st)}
      <label class="fld"><span>Тема <em>необязательно</em></span><input class="in" data-f="topic" value="${esc(st.topic)}" placeholder="Тема по плану"></label>
      <button class="btn main wide" data-act="savelesson">${st.type === 'edit' ? 'Сохранить' : 'Добавить урок'} · ${longD(st.date)}, ${st.time}</button>`;
  } else if (st.type === 'sched') {
    const fut = s.lessons.filter(l => l.auto && l.status === 'plan' && !isPast(l)).length;
    h = `<h3>Расписание</h3><div class="shd">${esc(s.name)} · сейчас ${schedText(s)}</div>
      <div class="fld"><span>Дни недели</span><div class="days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button data-act="day" data-d="${d}" aria-pressed="${st.days.includes(d)}">${WD[d]}</button>`).join('')}</div></div>
      <div class="fld"><span>Время</span>${timesHtml(st)}</div>
      <div class="info">Уроки по расписанию на 4 недели вперёд пересчитаются (${fut} ${plural(fut, 'урок', 'урока', 'уроков')} сейчас). Перенесённые вручную и уроки с темой останутся как есть.</div>
      <button class="btn main wide" data-act="savesched" ${st.days.length ? '' : 'disabled style="opacity:.4"'}>Сохранить расписание</button>`;
  } else if (st.type === 'access') {
    const url = location.href.split('#')[0].split('?')[0] + '#s=' + s.token;
    h = `<h3>Доступ для ученика</h3><div class="shd">${esc(s.name)} и родители входят по номеру телефона и коду. Видят уроки, оплаты и прогресс, без твоих комментариев.</div>`;
    if (!s.open) h += `<div class="note">Доступ закрыт. Вход по этим номерам и коду не работает.</div><button class="btn main wide" data-act="reopen">Открыть доступ с новым кодом</button>`;
    else if (st.confirm) h += `<div class="note">${esc(s.name)} и родители выйдут на всех устройствах.</div><button class="btn red wide" data-act="revoke">Закрыть доступ</button><button class="cancel" data-act="noconfirm">Не закрывать</button>`;
    else h += `<label class="fld"><span>Телефон ученика</span><input class="in num" inputmode="tel" data-f="ph0" value="${esc(fmtPhone(st.ph0))}" placeholder="+7 (___) ___-__-__"></label>
      <label class="fld"><span>Телефон родителя <em>необязательно</em></span><input class="in num" inputmode="tel" data-f="ph1" value="${esc(fmtPhone(st.ph1))}" placeholder="+7 (___) ___-__-__"></label>
      <label class="fld"><span>Код для входа</span><div class="two" style="align-items:center"><input class="in num" inputmode="numeric" maxlength="4" data-f="code" value="${esc(st.code)}" style="font-size:22px;letter-spacing:.2em;font-weight:700;max-width:140px"><button class="lnk" data-act="newcode" style="flex:none">другой код</button></div></label>
      <button class="btn main wide" data-act="saveaccess">Сохранить</button>
      <div class="setrow" style="margin-top:14px;border-top:1px solid var(--line)"><span class="k">Ссылка, где номер уже подставлен</span><button class="lnk" data-act="copy" data-v="${esc(url)}">скопировать</button></div>
      <button class="cancel" data-act="askrevoke" style="color:var(--red);margin-top:10px">Закрыть доступ</button>`;
  } else if (st.type === 'addstudent') {
    h = `<h3>Новый ученик</h3>
      <label class="fld"><span>Имя</span><input class="in" data-f="name" value="${esc(st.name)}" placeholder="Например, Лиза"></label>
      <label class="fld"><span>Телефон ученика или родителя <em>для входа</em></span><input class="in num" inputmode="tel" data-f="phone" value="${esc(fmtPhone(st.phone))}" placeholder="+7 (___) ___-__-__"></label>
      <label class="fld"><span>Цель</span><input class="in" data-f="goal" value="${esc(st.goal)}" placeholder="английский, подготовка к ЕГЭ"></label>
      <div class="fld"><span>Дни недели</span><div class="days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button data-act="day" data-d="${d}" aria-pressed="${st.days.includes(d)}">${WD[d]}</button>`).join('')}</div></div>
      <div class="fld"><span>Время</span>${timesHtml(st)}</div>
      <div class="fld"><span>Оплата сразу</span><div class="seg" style="margin-top:0">${[[0, 'Пока нет'], [4, 'Пакет 4'], [8, 'Пакет 8']].map(([n, t]) => `<button data-act="spack" data-n="${n}" aria-pressed="${st.pack === n}">${t}</button>`).join('')}</div></div>
      <div class="info r" id="err" hidden style="color:var(--red);font-weight:600">Нужно имя</div>
      <button class="btn main wide" data-act="savestudent">Добавить ученика</button>`;
  } else if (st.type === 'prog') {
    const d = SECD(st.sec), es = totals(s, st.sec);
    const karina = ui.role === 'k';
    const f = es[0], l = es[es.length - 1];
    const nAll = allAtt(s, st.sec).length, nPart = nAll - es.length;
    h = `<h3 class="sech" style="--sc:${d.c}">${st.sec}</h3><div class="shd">${esc(s.name)} · ${nAll} ${plural(nAll, 'попытка', 'попытки', 'попыток')}${nPart ? `, из них ${nPart} ${plural(nPart, 'частичная', 'частичные', 'частичных')}` : ''}</div>`;
    if (st.task != null) {
      const r = d.rows[st.task], th = taskHist(s, st.sec, st.task), f0 = th[0], l0 = th[th.length - 1];
      h = `<button class="back" data-act="untask" style="min-height:36px;margin:-6px 0 4px">${I.back}${st.sec}</button><h3 class="sech" style="--sc:${d.c}">${esc(r[0])}</h3><div class="shd">${esc(s.name)} · ${th.length ? 'делали ' + th.length + ' ' + plural(th.length, 'раз', 'раза', 'раз') : 'ещё не делали'}</div>`;
      if (th.length) h += `<div class="pbig num">${l0.score}<small> из ${r[1]}</small>${delta(th)}</div>
        ${th.length > 1 ? `<div class="info" style="margin-top:4px">Первый раз${f0.date ? ' ' + dm(f0.date) : ''}: ${f0.score} из ${r[1]}, последний${l0.date ? ' ' + dm(l0.date) : ''}: ${l0.score} из ${r[1]}</div>` : ''}
        <div class="chartbox">${chart(th)}</div>
        <div class="opts" style="margin-top:6px">${th.map(e => `<div class="setrow"><span class="k">${e.date ? dm(e.date) + ' · ' : ''}попытка ${e.i + 1}</span><b class="num">${e.score} <span style="color:var(--mute);font-weight:500">из ${r[1]}</span></b></div>`).join('')}</div>`;
    } else
    if (st.adding) {
      const sum = formSum(st.sec, st.vals);
      h += `<label class="fld"><span>Попытка ${es.length + 1} · дата</span><input class="in num" type="date" data-f="adate" value="${st.adate}" style="max-width:200px"></label><div class="attf" style="margin-top:12px">${d.rows.map((r, i) => `<label class="ar ${r[2] ? 'sub' : ''}"><span>${esc(r[0])}${r[2] ? ' <em>в задании 4</em>' : ''}</span><input class="in num" inputmode="numeric" data-av="${i}" value="${esc(st.vals[i])}" placeholder="0"><em>из ${r[1]}</em></label>`).join('')}
        <div class="ar tot"><span>Итого</span><b class="num" id="attsum">${sum}</b><em>из ${secMax(st.sec)}</em></div></div>
        <div class="info">Пустое поле = задание не делали. Итого считается, только когда заполнены все задания.${d.k1zero ? ' Если РКЗ 0, итог 0, как в ЕГЭ.' : ''}</div>
        <button class="btn main wide" data-act="saveatt">Сохранить попытку</button><button class="cancel" data-act="noatt">Не добавлять</button>`;
    } else {
      const allA = allAtt(s, st.sec);
      if (!es.length && allA.length) h += `<div class="info" style="margin-top:14px">Полных попыток раздела пока нет, только отдельные задания. Нажмите на задание, чтобы увидеть его динамику.</div>${weakest(s, st.sec) ? `<div class="weak">${weakest(s, st.sec)}</div>` : ''}${grid(s, st.sec)}`;
      else if (es.length) h += `<div class="pbig num">${l.score}<small> из ${l.max}</small>${delta(es)}</div>
        ${es.length > 1 ? `<div class="info" style="margin-top:4px">Первая попытка${f.date ? ' ' + dm(f.date) : ''}: ${f.score} из ${f.max}, последняя${l.date ? ' ' + dm(l.date) : ''}: ${l.score} из ${l.max}</div>` : ''}
        ${weakest(s, st.sec) ? `<div class="weak">${weakest(s, st.sec)}</div>` : ''}
        <div class="chartbox">${chart(es)}</div>${grid(s, st.sec)}`;
      else h += `<div class="emptybox"><b>Пока нет попыток</b><span>${karina ? 'Задания раздела: ' + d.rows.filter(r => !r[2]).map(r => r[0]).join(', ') + '. Итого из ' + secMax(st.sec) + '.' : 'Результаты появятся после первой попытки.'}</span></div>`;
      if (karina) h += `<button class="btn main wide" data-act="addatt">${es.length ? '+ попытка' : '+ первая попытка'}</button>`;
    }
  } else if (st.type === 'mock') {
    const m = s.mocks.find(x => x.id === st.mid);
    h = `<h3>Пробник</h3><div class="shd">${esc(s.name)}${m.date ? ' · ' + dm(m.date) : ''}</div>
      <div class="two" style="margin-top:18px"><div><div class="pbig num">${m.p}</div><div class="info" style="margin-top:2px">первичный балл</div></div><div><div class="pbig num">${m.s}<small> из 100</small></div><div class="info" style="margin-top:2px">вторичный балл</div></div></div>
      <div class="bar" style="height:6px;margin-top:16px"><i style="width:${Math.min(m.s, 100)}%"></i></div>
      <div class="setrow" style="margin-top:14px;border-top:1px solid var(--line)"><span class="k">Проверка работы</span><span class="tag">${m.link ? 'есть' : 'нет'}</span></div>`;
  } else if (st.type === 'addmock') {
    h = `<h3>Пробник</h3><div class="shd">${esc(s.name)}</div>
      <div class="two"><label class="fld"><span>Первичный</span><input class="in num" inputmode="numeric" data-f="p" value="${esc(st.p)}" placeholder="0"></label>
      <label class="fld"><span>Вторичный</span><input class="in num" inputmode="numeric" data-f="s" value="${esc(st.s)}" placeholder="0"></label></div>
      <label class="fld"><span>Дата</span><input class="in num" type="date" data-f="date" value="${st.date}"></label>
      <label class="fld"><span>Ссылка на проверку <em>необязательно</em></span><input class="in" data-f="link" value="${esc(st.link)}" placeholder="https://"></label>
      <div class="info" id="err" hidden style="color:var(--red);font-weight:600"></div>
      <button class="btn main wide" data-act="savemock">Добавить пробник</button>`;
  }
  if (st.type !== 'access' || !st.confirm) h += `<button class="cancel" data-act="close">Закрыть</button>`;
  const prev = w.querySelector('.sheet');
  const top = prev ? prev.scrollTop : 0;
  w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${h}</div>`;
  if (!first) { w.querySelector('.sheet').style.animation = 'none'; w.querySelector('.sheet').scrollTop = top; const m = w.querySelector('.mode'); if (m && m.dataset.k === st._lastMode) m.style.animation = 'none'; }
  st._lastMode = st.mode;
  w.style.animation = first ? '' : 'none';
}

/* ---------- тост с отменой ---------- */
function toast(msg, snap) {
  const t = document.getElementById('toast');
  undoSnap = snap || null;
  t.innerHTML = `<span>${msg}</span>${snap ? '<button data-act="undo">Отменить</button>' : ''}`;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.classList.remove('on'); undoSnap = null; }, 4200);
}

/* ---------- ввод кода ---------- */
function bindCode() {
  const inp = document.getElementById('code'), ph = document.getElementById('phone');
  if (!inp) return;
  const paint = () => {
    const v = inp.value;
    document.querySelectorAll('.cell').forEach((c, i) => { c.textContent = v[i] || ''; c.classList.toggle('cur', i === Math.min(v.length, 3) && document.activeElement === inp); });
  };
  ph.addEventListener('input', () => {
    ph.value = fmtPhone(ph.value);
    if (ph.value.replace(/\D/g, '').length === 11) inp.focus();
  });
  inp.addEventListener('input', () => {
    inp.value = inp.value.replace(/\D/g, '').slice(0, 4);
    document.getElementById('codeerr').hidden = true;
    paint();
    if (inp.value.length === 4) {
      /* макет: пускает с любым кодом; проверку номера и кода делает рабочая версия */
      if (ph.value.replace(/\D/g, '').length < 11) { document.getElementById('codeerr').hidden = false; inp.value = ''; paint(); ph.focus(); return; }
      const s = data.students.find(x => x.token === ui.stoken && x.open) || S('alina');
      ui.stoken = s.token; auth.s[s.token] = true; save(); ui.stab = 'now'; lastScreenKey = 'x'; render();
    }
  });
  inp.addEventListener('focus', paint); inp.addEventListener('blur', paint);
  paint();
}

/* ---------- действия ---------- */
function curSid() { return desk() ? ui.dsid : ui.sid; }
function lessonOf(lid) { for (const s of data.students) { const l = s.lessons.find(x => x.id === lid); if (l) return [s, l]; } return [null, null]; }
function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) { if (e.target.id === 'sheet') closeSheet(); return; }
  const a = b.dataset.act;
  const st = sheet;
  switch (a) {
    case 'role': {
      ui.role = b.dataset.role; ui.sid = null; lastScreenKey = ''; closeSheet();
      if (ui.role === 's') { const m = S('alina'); ui.stoken = m ? m.token : ui.stoken; history.replaceState(null, '', '#s=' + ui.stoken); }
      else history.replaceState(null, '', location.pathname + location.search);
      render(); break;
    }
    case 'reset': { try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + ':auth'); } catch (er) { } data = seed(); auth = { k: false, s: {} }; ui.sid = null; ui.dsid = 'alina'; ui.stoken = 'k7Qx9mP2vR4t'; closeSheet(); lastScreenKey = ''; render(); toast('Пример вернули к началу'); break; }
    case 'remember': ui.remember = !(ui.remember !== false); b.setAttribute('aria-pressed', String(ui.remember)); break;
    case 'login': {
      const pw = document.getElementById('pw').value;
      if (!pw.trim()) { document.getElementById('pwerr').hidden = false; return; }
      auth.k = true;
      if (ui.remember !== false) save(); else { store.set(KEY + ':auth', { ...auth, k: false }); }
      render(); break;
    }
    case 'logout': auth.k = false; save(); ui.sid = null; render(); break;
    case 'slogout': delete auth.s[ui.stoken]; save(); render(); break;
    case 'ktab': ui.ktab = b.dataset.t; if (ui.sid) ui.push = -1; ui.sid = null; render(); break;
    case 'stab': ui.stab = b.dataset.t; render(); break;
    case 'open': ui.ktab = 'students'; if (desk()) ui.dsid = b.dataset.s; else { ui.sid = b.dataset.s; ui.push = 1; } render(); break;
    case 'back': ui.sid = null; ui.push = -1; render(); break;
    case 'more': ui.more[curSid()] = !ui.more[curSid()]; render(); break;
    case 'pack': {
      const s = S(curSid()); const n = +b.dataset.n;
      commit(() => { s.payments.push({ date: TODAY, n }); }, `Пакет ${n} добавлен. Осталось ${Math.max(calc(s).rem + n, 0)} из ${Math.max(n, calc(s).rem + n)}`);
      break;
    }
    case 'mark': case 'editpast': {
      const [s, l] = lessonOf(b.dataset.l); if (!s) return;
      const date = l.status === 'plan' && !isPast(l) ? l.date : (calc(s).upcoming.find(x => x.date >= TODAY) || { date: add(TODAY, 3) }).date;
      openSheet({ type: a, sid: s.id, lid: l.id, mode: b.dataset.mode, topic: l.topic, hw: l.hw, note: l.note, date, cal: date, time: l.time, nocharge: true, burn: false });
      break;
    }
    case 'edit': { const [s, l] = lessonOf(b.dataset.l); openSheet({ type: 'edit', sid: s.id, lid: l.id, date: l.date, cal: l.date, time: l.time, topic: l.topic }); break; }
    case 'addlesson': { const s = S(curSid()); const d = add(TODAY, 1); openSheet({ type: 'addlesson', sid: s.id, date: d, cal: d, time: s.schedule.time, topic: '' }); break; }
    case 'sched': { const s = S(curSid()); openSheet({ type: 'sched', sid: s.id, days: s.schedule.days.slice(), time: s.schedule.time }); break; }
    case 'access': { const s = S(curSid()); openSheet({ type: 'access', sid: s.id, ph0: s.phones[0] || '', ph1: s.phones[1] || '', code: s.code, confirm: false }); break; }
    case 'newcode': st.code = code4(); drawSheet(); break;
    case 'saveaccess': { const s = S(st.sid); commit(() => { s.phones = [st.ph0, st.ph1].map(x => x.replace(/\D/g, '')).filter(x => x.length >= 11).map(x => '+' + x); s.code = (st.code || '').replace(/\D/g, '').slice(0, 4) || s.code; }, 'Доступ сохранён'); closeSheet(); break; }
    case 'addstudent': openSheet({ type: 'addstudent', name: '', goal: '', days: [2, 5], time: '17:00', pack: 4 }); break;
    case 'addmock': openSheet({ type: 'addmock', sid: curSid(), p: '', s: '', date: TODAY, link: '' }); break;
    case 'close': closeSheet(); break;
    case 'prog': { const s = (ui.role === 's' && data.students.find(x => x.token === ui.stoken)) || S(curSid()); openSheet({ type: 'prog', sid: s.id, sec: b.dataset.sec, adding: false, vals: [] }); break; }
    case 'mock': { const s = (ui.role === 's' && data.students.find(x => x.token === ui.stoken)) || S(curSid()); openSheet({ type: 'mock', sid: s.id, mid: b.dataset.m }); break; }
    case 'addatt': st.adding = true; st.adate = TODAY; st.vals = SECD(st.sec).rows.map(() => ''); drawSheet(); break;
    case 'task': st.task = +b.dataset.row; drawSheet(); break;
    case 'untask': st.task = null; drawSheet(); break;
    case 'noatt': st.adding = false; drawSheet(); break;
    case 'saveatt': {
      const s = S(st.sid), d = SECD(st.sec);
      const a = d.rows.map((r, i) => String(st.vals[i] ?? '').trim() === '' ? null : Math.max(0, Math.min(r[1], parseInt(st.vals[i], 10) || 0)));
      if (a.every(x => x == null)) { toast('Заполните хотя бы одно задание'); return; }
      commit(() => { s.prog = s.prog || {}; const p = s.prog[st.sec] = s.prog[st.sec] || { att: [], tot: [] }; p.att.push(a); p.tot.push(null); p.dates = p.dates || []; while (p.dates.length < p.att.length - 1) p.dates.push(''); p.dates.push(st.adate || TODAY); }, `${st.sec}: попытка ${pg(s, st.sec).att.length + 1}${isPartial(st.sec, a) ? ', частичная' : ', итого ' + calcTot(st.sec, a) + ' из ' + secMax(st.sec)}`);
      st.adding = false; drawSheet(); break;
    }
    case 'mode': st.mode = b.dataset.mode; drawSheet(); break;
    case 'pickday': st.date = b.dataset.d; drawSheet(); break;
    case 'calnav': st.cal = add(st.cal, +b.dataset.n); drawSheet(); break;
    case 'picktime': st.time = b.dataset.t; drawSheet(); break;
    case 'nocharge': st.nocharge = !st.nocharge; drawSheet(); break;
    case 'burn': st.burn = b.dataset.v === '1'; drawSheet(); break;
    case 'day': { const d = +b.dataset.d; st.days = st.days.includes(d) ? st.days.filter(x => x !== d) : [...st.days, d]; drawSheet(); break; }
    case 'spack': st.pack = +b.dataset.n; drawSheet(); break;
    case 'showcode': st.show = !st.show; drawSheet(); break;
    case 'askrevoke': st.confirm = true; drawSheet(); break;
    case 'noconfirm': st.confirm = false; drawSheet(); break;
    case 'copy': { const v = b.dataset.v; try { navigator.clipboard.writeText(v).then(() => toast('Ссылка скопирована'), () => toast('Скопируйте ссылку из поля')); } catch (er) { toast('Скопируйте ссылку из поля'); } break; }
    case 'revoke': { const s = S(st.sid); commit(() => { delete auth.s[s.token]; s.open = false; }, `Доступ для ${esc(s.name)} закрыт`); drawSheet(); break; }
    case 'reopen': { const s = S(st.sid); commit(() => { s.token = token(); s.code = code4(); s.open = true; }, 'Доступ открыт, код ' + s.code); st.code = s.code; st.confirm = false; drawSheet(); break; }
    case 'savemark': {
      const s = S(st.sid); const l = s.lessons.find(x => x.id === st.lid);
      const was = l.status;
      commit(() => { l.status = 'done'; l.topic = st.topic.trim(); l.hw = st.hw.trim(); l.note = st.note.trim(); },
        was === 'plan' ? `Урок отмечен. Осталось ${Math.max(calc(s).rem - 1, 0)} из ${calc(s).of}` : 'Урок сохранён');
      closeSheet(); flash(l.id); break;
    }
    case 'savemove': {
      const s = S(st.sid); const l = s.lessons.find(x => x.id === st.lid);
      let nl;
      commit(() => {
        if (l.status === 'plan') { l.status = 'moved'; l.movedTo = st.date; l.burn = !st.nocharge; }
        else { l.movedTo = st.date; }
        nl = L(st.date, st.time, 'plan', l.topic, '', '', { from: l.date });
        s.lessons = s.lessons.filter(x => !(x.auto && x.status === 'plan' && x.date === st.date && !x.topic));
        s.lessons.push(nl); s.lessons.sort(byDT);
      }, `Урок перенесён на ${longD(st.date)}, ${st.time}${st.nocharge ? '' : '. Урок списан'}`);
      closeSheet(); flash(nl.id); break;
    }
    case 'savecancel': {
      const s = S(st.sid); const l = s.lessons.find(x => x.id === st.lid);
      commit(() => { l.status = st.burn ? 'burn' : 'free'; }, st.burn ? 'Урок отменён и списан' : 'Урок отменён без списания');
      closeSheet(); break;
    }
    case 'savelesson': {
      const s = S(st.sid); let id;
      commit(() => {
        if (st.type === 'edit') { const l = s.lessons.find(x => x.id === st.lid); l.date = st.date; l.time = st.time; l.topic = st.topic.trim(); l.auto = false; id = l.id; }
        else { const nl = L(st.date, st.time, 'plan', st.topic.trim()); s.lessons.push(nl); id = nl.id; }
        s.lessons.sort(byDT);
      }, st.type === 'edit' ? `Урок теперь ${longD(st.date)}, ${st.time}` : `Урок добавлен: ${longD(st.date)}, ${st.time}`);
      closeSheet(); flash(id); break;
    }
    case 'savesched': {
      if (!st.days.length) return;
      const s = S(st.sid);
      commit(() => { s.schedule = { days: st.days.slice().sort(), time: st.time }; regen(s); }, `Расписание: ${schedText(s)}. Будущие уроки пересчитаны`);
      closeSheet(); break;
    }
    case 'savestudent': {
      if (!st.name.trim()) { document.getElementById('err').hidden = false; return; }
      const id = uid();
      commit(() => {
        const s = { id, name: st.name.trim(), goal: st.goal.trim() || 'английский', token: token(), code: code4(), open: true, phones: st.phone && st.phone.replace(/\D/g, '').length === 11 ? ['+' + st.phone.replace(/\D/g, '')] : [], schedule: { days: st.days.length ? st.days : [2], time: st.time }, payments: st.pack ? [{ date: TODAY, n: st.pack }] : [], lessons: [], prog: {}, mocks: [] };
        regen(s); data.students.push(s);
      }, `${esc(st.name.trim())} добавлен${st.pack ? ', пакет ' + st.pack : ''}`);
      ui.ktab = 'students'; if (desk()) ui.dsid = id; else { ui.sid = id; ui.push = 1; }
      closeSheet(); render(); break;
    }
    case 'savemock': {
      const p = parseInt(st.p, 10), sv = parseInt(st.s, 10);
      const err = document.getElementById('err');
      if (isNaN(p) || isNaN(sv) || p < 0 || sv < 0 || sv > 100) { err.textContent = 'Нужны оба балла, вторичный до 100'; err.hidden = false; return; }
      const s = S(st.sid); let id;
      commit(() => { id = uid(); s.mocks.push({ id, date: st.date || TODAY, p, s: sv, link: st.link.trim() }); }, `Пробник добавлен: ${p} / ${sv}`);
      closeSheet(); flash(id); break;
    }
    case 'undo': if (undoSnap) { data = JSON.parse(undoSnap); undoSnap = null; save(); render(); document.getElementById('toast').classList.remove('on'); } break;
  }
}
function flash(id) { requestAnimationFrame(() => { const el = document.querySelector(`[data-row="${id}"]`); if (el) { el.classList.add('fresh'); if (!isShot) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }); }
function onInput(e) {
  if (e.target.dataset && e.target.dataset.av != null && sheet) { sheet.vals[+e.target.dataset.av] = e.target.value; const el = document.getElementById('attsum'); if (el) el.textContent = formSum(sheet.sec, sheet.vals); return; }
  const f = e.target.dataset && e.target.dataset.f;
  if (!f || !sheet) return;
  if (f === 'ph0' || f === 'ph1' || f === 'phone') e.target.value = fmtPhone(e.target.value);
  sheet[f] = e.target.value;
  if (f === 'time' && e.target.value) { sheet.time = e.target.value; clearTimeout(onInput.t); onInput.t = setTimeout(() => sheet && drawSheet(), 400); }
}

/* ---------- запуск ---------- */
function fromHash() {
  const m = location.hash.match(/s=([A-Za-z0-9]+)/);
  if (m) { ui.role = 's'; ui.stoken = m[1]; }
}
function applyShot(k) {
  isShot = true;
  data = seed(); auth = { k: true, s: { 'k7Qx9mP2vR4t': true } };
  document.documentElement.classList.add('shot');
  if (!['C', 'I', 'J', 'K', 'L'].includes(k)) document.documentElement.classList.add('phone');
  const m = S('alina');
  const l16 = m.lessons.find(l => l.date === '2026-10-16');
  if (k === 'A') { ui.role = 's'; ui.stab = 'now'; document.documentElement.classList.add('long'); }
  if (k === 'B') { ui.role = 's'; ui.stab = 'hist'; document.documentElement.classList.add('long'); }
  if (k === 'C') { ui.role = 'k'; ui.dsid = 'alina'; }
  if (k === 'D') { ui.role = 'k'; ui.sid = 'alina'; render(); openSheet({ type: 'mark', sid: 'alina', lid: l16.id, mode: 'done', topic: '', hw: '', note: '', date: '2026-10-20', cal: '2026-10-20', time: '17:00' }); return; }
  if (k === 'E') { const l2 = m.lessons.find(l => l.date === '2026-10-02'); l2.status = 'plan'; ui.role = 'k'; ui.sid = 'alina'; render(); openSheet({ type: 'mark', sid: 'alina', lid: l2.id, mode: 'move', topic: '', hw: '', note: '', date: '2026-10-13', cal: '2026-10-13', time: '17:00', nocharge: true, burn: false }); return; }
  if (k === 'F') { auth.s = {}; ui.role = 's'; }
  if (k === 'G') { auth.k = false; ui.role = 'k'; }
  if (k === 'H') { ui.role = 'k'; }
  if (k === 'I') { ui.role = 's'; ui.stab = 'now'; }
  if (k === 'G2') { ui.role = 's'; render(); openSheet({ type: 'prog', sid: 'alina', sec: 'Essay', adding: false, vals: [] }); return; }
  if (k === 'L') { ui.role = 'k'; ui.dsid = 'alina'; render(); openSheet({ type: 'prog', sid: 'alina', sec: 'Listening', adding: false, vals: [] }); return; }
  if (k === 'T') { ui.role = 's'; render(); openSheet({ type: 'prog', sid: 'alina', sec: 'Listening', adding: false, vals: [], task: 0 }); return; }
  if (k === 'P') { ui.role = 'k'; ui.sid = 'alina'; render(); openSheet({ type: 'prog', sid: 'alina', sec: 'Essay', adding: true, vals: ['2', '2', '2', '1', '2'] }); return; }
  if (k === 'Q') { ui.role = 's'; render(); openSheet({ type: 'mock', sid: 'alina', mid: m.mocks[0].id }); return; }
  if (k === 'J') { ui.role = 'k'; ui.dsid = 'alina'; render(); openSheet({ type: 'access', sid: 'alina', ph0: m.phones[0], ph1: m.phones[1], code: m.code, confirm: false }); return; }
  if (k === 'K') { ui.role = 'k'; ui.dsid = 'alina'; render(); openSheet({ type: 'sched', sid: 'alina', days: [2, 5], time: '17:00' }); return; }
  render();
  if (k === 'F') { const i = document.getElementById('code'); i.value = '12'; i.dispatchEvent(new Event('input')); document.querySelectorAll('.cell')[2].classList.add('cur'); }
}
document.addEventListener('DOMContentLoaded', () => {
  load();
  fromHash();
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet) closeSheet();
    if (e.key === 'Enter' && e.target.id === 'pw') document.querySelector('[data-act="login"]').click();
  });
  window.addEventListener('hashchange', () => { fromHash(); lastScreenKey = ''; render(); });
  matchMedia('(min-width: 900px)').addEventListener('change', () => { lastScreenKey = ''; render(); });
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    applyShot(shot);
    const done = () => { document.title = 'H' + Math.ceil(document.documentElement.scrollHeight); if (location.search.includes('dbg')) document.title += ' ' + [300, 400, 500, 700].map(y => { const e = document.elementFromPoint(150, y); const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return y + ':' + e.tagName + '.' + e.className + '[' + Math.round(r.top) + ',' + Math.round(r.height) + ',' + c.position + ',' + c.display + ',' + c.minHeight + ',' + c.height + ',' + c.flexGrow + ' parent ' + e.parentElement.className + ' ' + getComputedStyle(e.parentElement).display + ']'; }).slice(0,1).join(' '); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(done);
    return;
  }
  render();
});
