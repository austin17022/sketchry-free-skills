/* VITRELLE desk: draws the cards listed in data.js. Edit data.js, not this file. */
(() => {
'use strict';

const D = window.DESK || {};
const qs = new URLSearchParams(location.search);
const P = Object.assign({}, D.profile);
const C = D.cards || {};
if (qs.get('theme')) P.theme = qs.get('theme');
if (qs.get('lang')) P.lang = qs.get('lang');

const EN = P.lang === 'en';
const L = EN ? {
  greet: ['Good morning', 'Good afternoon', 'Good evening'],
  wk: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  wkS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  mon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  today: 'Today', tomorrow: 'Tomorrow', items: n => n + (n === 1 ? ' item' : ' items'),
  allDay: 'All day', left: n => `${n} min left`, inMin: n => n >= 60 ? `in ${Math.floor(n / 60)}h ${n % 60}m` : `in ${n} min`, done: 'Done',
  updated: t => 'Updated ' + t, empty: 'Nothing here yet', toReply: n => n + ' to reply',
  dur: (h, m) => `${h}h ${m}m`, deep: 'Deep', rem: 'REM', light: 'Light', awake: 'Awake', state: 'Today',
  loading: 'Loading weather…', feels: 'Feels', hum: 'Humidity', rain: 'Rain', days: 'days', daysLeft: 'days to go', dayToday: 'Today',
  doneToday: 'done today', start: 'Start', pause: 'Pause', resume: 'Resume', focusDone: 'Focus session done', breakNow: 'Time for a short break',
  soon: 'Starting soon', hide: 'Hide amounts', show: 'Show amounts', streak: n => n + 'd',
  t: { schedule: 'Schedule', todo: 'To-do', mail: 'Inbox', sleep: 'Sleep', weather: 'Weather', markets: 'Markets', income: 'Income', habits: 'Habits', focus: 'Focus', countdown: 'Countdown', goals: 'Goals', note: 'Note' },
  wx: { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Fog', 51: 'Drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm' },
} : {
  greet: ['早安', '午安', '晚安'],
  wk: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  wkS: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今日', tomorrow: '明日', items: n => n + ' 項',
  allDay: '全天', left: n => `進行中 · 剩 ${n} 分`, inMin: n => n >= 60 ? `${Math.floor(n / 60)} 小時 ${n % 60} 分後` : `${n} 分後`, done: '完成',
  updated: t => '更新於 ' + t, empty: '還沒有資料', toReply: n => n + ' 封',
  dur: (h, m) => `${h} 小時 ${m} 分`, deep: '深眠', rem: 'REM', light: '淺眠', awake: '清醒', state: '今日狀態',
  loading: '天氣載入中…', feels: '體感', hum: '濕度', rain: '降雨', days: '天', daysLeft: '天後', dayToday: '今天',
  doneToday: '今日完成', start: '開始', pause: '暫停', resume: '繼續', focusDone: '專注時間結束', breakNow: '起來走走，休息一下',
  soon: '即將開始', hide: '隱藏金額', show: '顯示金額', streak: n => n + ' 天',
  t: { schedule: '行程', todo: '待辦', mail: '要回的信', sleep: '睡眠與狀態', weather: '天氣', markets: '行情', income: '本月收入', habits: '習慣', focus: '專注', countdown: '倒數日', goals: '目標進度', note: '便條' },
  wx: { 0: '晴朗', 1: '大致晴朗', 2: '多雲時晴', 3: '陰天', 45: '有霧', 51: '毛毛雨', 61: '下雨', 71: '下雪', 80: '陣雨', 95: '雷雨' },
};

const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MASK = '＊＊＊＊＊';
const hm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toMin = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const store = {
  get(k, d) { try { const v = localStorage.getItem('desk:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('desk:' + k, JSON.stringify(v)); } catch {} },
};
const num = (v, dec) => Number(v).toLocaleString(EN ? 'en-US' : 'zh-TW', { minimumFractionDigits: dec ?? 0, maximumFractionDigits: dec ?? 2 });
const shortDate = d => EN ? `${L.mon[d.getMonth()].slice(0, 3)} ${d.getDate()}` : `${d.getMonth() + 1}/${d.getDate()}（${L.wkS[d.getDay()]}）`;

let privacy = store.get('privacy', P.privacy !== false);

/* ---------- theme ---------- */
const root = document.documentElement;
root.lang = EN ? 'en' : 'zh-Hant';
root.dataset.theme = P.theme === 'light' ? 'light' : 'dark';
if (P.accent) root.style.setProperty('--acc', P.accent);
if (P.upIsRed) { root.style.setProperty('--up', root.dataset.theme === 'light' ? '#e0412f' : '#ff5a4f'); root.style.setProperty('--down', root.dataset.theme === 'light' ? '#0f9d6b' : '#34e3a0'); }
if (P.background && P.background !== 'aurora') {
  $('.bg').classList.add('has-photo');
  $('.photo').style.backgroundImage = `url("${P.background}")`;
}

/* ---------- icons ---------- */
const I = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
  part: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4.5v1.4M3.6 9H5M4.9 5.4l1 1M11.4 5.4l-1 1"/><path d="M5.6 11a3.2 3.2 0 0 1 5.9-1.6"/><path d="M8 19.5h9.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6-1.2A3.6 3.6 0 0 0 8 19.5z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 18.5h10.5a4 4 0 0 0 .3-8 6 6 0 0 0-11.4 1.4A3.4 3.4 0 0 0 7 18.5z"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10.5a4 4 0 0 0 .3-8 6 6 0 0 0-11.4 1.4A3.4 3.4 0 0 0 7 15z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10.5a4 4 0 0 0 .3-8 6 6 0 0 0-11.4 1.4A3.4 3.4 0 0 0 7 15z"/><circle cx="8.5" cy="19" r=".6"/><circle cx="12" cy="20.5" r=".6"/><circle cx="15.5" cy="19" r=".6"/></svg>',
  storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10.5a4 4 0 0 0 .3-8 6 6 0 0 0-11.4 1.4A3.4 3.4 0 0 0 7 15z"/><path d="M12.5 15.5l-2 3.5h3l-2 3"/></svg>',
  fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9h16M6 13h12M4 17h16"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16M9.9 6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.7M6.6 7.4A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.1-1"/><path d="M9.9 10a2.8 2.8 0 0 0 4 4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>',
};
const wxKey = c => c == null ? null : c === 0 ? 0 : c <= 2 ? (c === 1 ? 1 : 2) : c === 3 ? 3 : c <= 48 ? 45 : c <= 57 ? 51 : c <= 67 ? 61 : c <= 77 ? 71 : c <= 82 ? 80 : c <= 86 ? 71 : 95;
const wxIcon = (k, night) => night && k <= 1 ? I.moon : ({ 0: I.sun, 1: I.sun, 2: I.part, 3: I.cloud, 45: I.fog, 51: I.rain, 61: I.rain, 71: I.snow, 80: I.rain, 95: I.storm }[k] || I.cloud);

/* ---------- island notifications ---------- */
const islandQ = []; let islandBusy = false;
function notify(icon, title, sub) { islandQ.push({ icon, title, sub }); if (!islandBusy) runIsland(); }
async function runIsland() {
  islandBusy = true;
  const el = $('#island'), wait = ms => new Promise(r => setTimeout(r, ms));
  while (islandQ.length) {
    const m = islandQ.shift();
    $('#iIc').innerHTML = m.icon; $('#iT').textContent = m.title; $('#iS').textContent = m.sub || '';
    el.classList.add('open'); await wait(4200); el.classList.remove('open'); await wait(900);
  }
  islandBusy = false;
}

/* ---------- cards ---------- */
const meta = d => d && d.updated ? L.updated(d.updated) : '';
const empty = () => `<p class="empty">${L.empty}</p>`;
const money = (v, dec) => privacy ? `<span class="mask">${MASK}</span>` : esc(num(v, dec));

const CARDS = {
  schedule: {
    tall: true, every: 30,
    meta: d => meta(d),
    render(d, el, tall) {
      const now = new Date(), nm = now.getHours() * 60 + now.getMinutes(), tmr = new Date(+now + 864e5);
      const today = d.today || [], tm = d.tomorrow || [];
      let nextSet = false;
      const row = (e, live) => {
        if (e.allDay) return `<div class="ev all"><time>${L.allDay}</time><i class="nd"></i><div class="bx"><b>${esc(e.title)}</b><span class="tag">${esc(e.tag)}</span></div></div>`;
        const s = toMin(e.time), en = toMin(e.end) ?? (s + 60);
        let cls = '', tag = esc(e.tag), style = '';
        if (live && s != null) {
          if (nm >= en) { cls = 'done'; }
          else if (nm >= s) { cls = 'now'; tag = L.left(en - nm); style = ` style="--p:${((nm - s) / (en - s) * 100).toFixed(1)}%"`; }
          else if (!nextSet) { nextSet = true; cls = 'next'; tag = L.inMin(s - nm); }
        }
        return `<div class="ev ${cls}"><time>${esc(e.time)}</time><i class="nd"></i><div class="bx"${style}><b>${esc(e.title)}</b><span class="tag">${tag}</span></div></div>`;
      };
      const max = tall ? 14 : 8;
      let h = `<div class="day"><b>${L.today}</b><span>${shortDate(now)}</span><em>${L.items(today.length)}</em></div>`;
      h += today.length ? `<div class="tl today">${today.slice(0, max).map(e => row(e, true)).join('')}</div>` : empty();
      if (tall && tm.length) h += `<div class="day"><b>${L.tomorrow}</b><span>${shortDate(tmr)}</span><em>${L.items(tm.length)}</em></div><div class="tl">${tm.slice(0, 8).map(e => row(e, false)).join('')}</div>`;
      return h;
    },
    tick(d) { // remind 10 minutes before
      const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
      (d.today || []).forEach(e => {
        const s = toMin(e.time), key = 'rem:' + ymd(now) + e.time + e.title;
        if (s != null && s - nm > 0 && s - nm <= 10 && !store.get(key, false)) {
          store.set(key, true); notify(I.bell, e.title, `${L.soon} · ${e.time}`);
        }
      });
    },
  },

  todo: {
    tallOk: true,
    meta: d => { const it = d.items || [], n = it.filter(t => done(t)).length; return it.length ? `${n}/${it.length}` : ''; },
    render(d, el, tall) {
      const it = d.items || [];
      if (!it.length) return empty();
      const n = it.filter(t => done(t)).length;
      return `<div class="bar1"><i style="width:${n / it.length * 100}%"></i></div><div class="list">${it.slice(0, tall ? 14 : 8).map((t, i) => `<button class="row td ${done(t) ? 'on' : ''}" data-i="${i}"><i class="cb">${I.check}</i><span>${esc(t.text)}</span>${t.due ? `<em>${esc(t.due)}</em>` : ''}</button>`).join('')}</div>${tall ? `<div class="todo-sum"><b>${Math.round(n / it.length * 100)}%</b><span>${L.doneToday}</span></div>` : ''}`;
    },
    bind(d, el, redraw) {
      el.addEventListener('click', e => {
        const b = e.target.closest('.td'); if (!b) return;
        const t = d.items[+b.dataset.i]; store.set('todo:' + ymd(new Date()) + ':' + t.text, !done(t)); redraw();
      });
    },
  },

  mail: {
    tallOk: true,
    meta: d => (d.items || []).length ? L.toReply((d.items || []).length) : meta(d),
    render(d, el, tall) {
      const it = d.items || [];
      if (!it.length) return empty();
      return `<div class="list">${it.slice(0, tall ? 10 : 6).map(m => `<div class="row ml ${m.urgent ? 'hot' : ''}"><i class="md"></i><span class="fr">${esc(m.from)}</span><span class="tg">${esc(m.tag)}</span><span class="sj">${esc(m.subject)}</span>${m.note ? `<span class="sm">→ ${esc(m.note)}</span>` : ''}</div>`).join('')}</div>`;
    },
  },

  sleep: {
    meta: d => d.source || meta(d),
    render(d) {
      if (!d.minutes) return empty();
      const st = d.stages || {}, tot = (st.deep || 0) + (st.rem || 0) + (st.light || 0) + (st.awake || 0) || 1;
      const segs = [['deep', '#4c5bff'], ['rem', '#9b6bff'], ['light', '#4aa8ff'], ['awake', '#ff5a4f']].filter(([k]) => st[k]);
      const fd = m => m >= 60 ? L.dur(Math.floor(m / 60), m % 60) : (EN ? m + 'm' : m + ' 分');
      const sc = d.score, scCol = sc == null ? 'var(--text)' : sc < 40 ? 'var(--down)' : sc < 70 ? 'var(--amber)' : 'var(--up)';
      return `<div class="sl-top"><div class="dur">${fd(d.minutes)}</div>${d.from ? `<div class="rng">${esc(d.from)} → ${esc(d.to)}</div>` : ''}</div>
        ${segs.length ? `<div class="sbar">${segs.map(([k, c]) => `<i style="background:${c};box-shadow:0 0 12px ${c}99" data-w="${st[k] / tot * 100}"></i>`).join('')}</div>
        <div class="lg">${segs.map(([k, c]) => `<div><i style="background:${c}"></i>${L[k]}<b>${fd(st[k])}</b></div>`).join('')}</div>` : ''}
        ${sc != null ? `<div class="state"><div class="score" style="color:${scCol};text-shadow:0 0 24px ${scCol}">${sc}</div><div><small>${L.state}</small><b>${esc(d.label)}</b></div></div>` : ''}
        ${d.vitals ? `<div class="foot">${esc(d.vitals)}</div>` : ''}`;
    },
    after(el) { requestAnimationFrame(() => setTimeout(() => el.querySelectorAll('.sbar i').forEach(i => i.style.width = i.dataset.w + '%'), 300)); },
  },

  weather: {
    every: 1800,
    meta: d => esc(d.city || ''),
    render(d) {
      const w = d.live || d;
      if (w.temp == null) return d.lat != null && !d.failed ? `<p class="empty loading">${L.loading}</p>` : empty();
      const k = wxKey(w.code);
      return `<div class="wx">${wxIcon(k, w.night)}<div><div class="tp">${Math.round(w.temp)}<sup>°</sup></div><p>${esc(w.text || L.wx[k] || '')}${w.hi != null ? ` · ${Math.round(w.hi)}° / ${Math.round(w.lo)}°` : ''}</p></div></div>
        <div class="wx-sub">${w.feels != null ? `<span>${L.feels} ${Math.round(w.feels)}°</span>` : ''}${w.humidity != null ? `<span>${L.hum} ${w.humidity}%</span>` : ''}${w.rain != null ? `<span>${L.rain} ${w.rain}%</span>` : ''}</div>
        ${(w.days || []).length ? `<div class="fc">${w.days.slice(0, 3).map(x => `<div>${esc(x.day)}${wxIcon(wxKey(x.code))}<b>${Math.round(x.hi)}°</b> ${Math.round(x.lo)}°</div>`).join('')}</div>` : ''}`;
    },
    async load(d) {
      if (d.lat == null || d.lon == null) return false;
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`;
      const j = await (await fetch(u)).json();
      const dd = j.daily;
      d.live = {
        temp: j.current.temperature_2m, feels: j.current.apparent_temperature, humidity: j.current.relative_humidity_2m, code: j.current.weather_code, night: j.current.is_day === 0,
        hi: dd.temperature_2m_max[0], lo: dd.temperature_2m_min[0], rain: dd.precipitation_probability_max[0],
        days: dd.time.slice(1, 4).map((t, i) => ({ day: L.wkS[new Date(t + 'T12:00').getDay()], code: dd.weather_code[i + 1], hi: dd.temperature_2m_max[i + 1], lo: dd.temperature_2m_min[i + 1] })),
      };
      return true;
    },
  },

  markets: {
    tallOk: true, every: 120,
    meta: d => meta(d),
    render(d, el, tall) {
      const it = d.items || [];
      if (!it.length) return empty();
      return `<div class="list">${it.slice(0, tall ? 12 : 6).map(m => {
        const ch = m.change ?? 0, cls = ch >= 0 ? 'up' : 'down';
        return `<div class="row mk"><div><b>${esc(m.symbol)}</b><small>${esc(m.name)}</small></div>${spark(m.spark, ch >= 0 ? 'var(--up)' : 'var(--down)')}<div class="pr">${m.price != null ? esc(num(m.price, m.price < 10 ? 4 : 2)) : '-'}<span class="${cls}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(2)}%</span></div></div>`;
      }).join('')}</div>`;
    },
    async load(d) {
      const ids = (d.items || []).filter(m => m.coingecko).map(m => m.coingecko);
      if (!ids.length) return false;
      const j = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`)).json();
      d.items.forEach(m => { const r = m.coingecko && j[m.coingecko]; if (r) { m.price = r.usd; m.change = r.usd_24h_change; } });
      return true;
    },
  },

  income: {
    tallOk: true,
    meta: d => esc(d.period || '') || meta(d),
    render(d, el, tall) {
      const it = d.items || [];
      if (!it.length) return empty();
      const tot = it.reduce((a, b) => a + (+b.amount || 0), 0) || 1, pal = ['#e8e8ee', '#ff3b5c', '#7c6bff', '#3fb8ff', '#ffb340'];
      const col = (m, i) => m.color || pal[i % pal.length];
      const neg = String(d.change || '').trim().startsWith('-');
      return `<div class="total"><span class="cy">${esc(d.currency || '')}</span><span class="num ${privacy ? 'mask' : ''}">${privacy ? MASK : esc(num(tot, 0))}</span>${d.change ? `<span class="pill ${neg ? 'neg' : ''}">${neg ? '▼' : '▲'} ${esc(String(d.change).replace(/^[+-]/, ''))}</span>` : ''}</div>
        <div class="stack">${it.map((m, i) => `<i style="background:${col(m, i)}" data-w="${m.amount / tot * 100}"></i>`).join('')}</div>
        <div class="list">${it.slice(0, tall ? 10 : 6).map((m, i) => `<div class="rw"><div class="ic" style="background:${col(m, i)};color:${i === 0 && !m.color ? '#111' : '#fff'}">${esc((m.short || m.name || '?').slice(0, 2))}</div><div class="nm"><b>${esc(m.name)}</b>${m.note ? `<span>${esc(m.note)}</span>` : ''}</div><div class="amt">${esc(d.currency || '')} <b class="${privacy ? 'mask' : ''}">${privacy ? MASK : esc(num(m.amount, 0))}</b></div></div>`).join('')}</div>
        ${d.latest ? `<div class="foot">${esc(d.latest)}</div>` : ''}`;
    },
    after(el) { requestAnimationFrame(() => setTimeout(() => el.querySelectorAll('.stack i').forEach(i => i.style.width = i.dataset.w + '%'), 300)); },
  },

  habits: {
    tallOk: true,
    meta: d => meta(d),
    render(d, el, tall) {
      const it = d.items || [];
      if (!it.length) return empty();
      const now = new Date(), labels = [];
      for (let i = 6; i >= 0; i--) labels.push(L.wkS[new Date(+now - i * 864e5).getDay()]);
      return `<div class="hb-head"><span></span>${labels.map(x => `<span>${x}</span>`).join('')}<span></span></div><div class="hbs">${it.slice(0, tall ? 14 : 8).map((h, hi) => {
        const past = (h.days || []).slice(-6); while (past.length < 6) past.unshift(0);
        const tdy = store.get('habit:' + ymd(now) + ':' + h.name, !!h.today);
        const all = [...past.map(Boolean), tdy];
        let streak = 0; for (let i = all.length - 1; i >= 0 && all[i]; i--) streak++;
        return `<div class="hb"><span class="hn">${esc(h.name)}</span>${past.map(v => `<i class="${v ? 'on' : ''}"></i>`).join('')}<button class="today" data-i="${hi}" aria-label="${esc(h.name)}"><i class="${tdy ? 'on' : ''}"></i></button><span class="st">${streak ? L.streak(streak) : ''}</span></div>`;
      }).join('')}</div>`;
    },
    bind(d, el, redraw) {
      el.addEventListener('click', e => {
        const b = e.target.closest('.today'); if (!b) return;
        const h = d.items[+b.dataset.i], k = 'habit:' + ymd(new Date()) + ':' + h.name;
        store.set(k, !store.get(k, !!h.today)); redraw();
      });
    },
  },

  focus: {
    meta: () => '',
    render(d) {
      const tot = (d.minutes || 25) * 60;
      return `<div class="fo"><div class="ring"><svg viewBox="0 0 100 100"><circle class="tk" cx="50" cy="50" r="44"/><circle class="gw" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/><circle class="pg" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><span>${pad(Math.floor(tot / 60))}:00</span></div>${d.label ? `<b>${esc(d.label)}</b>` : ''}<button class="go">${L.start}</button></div>`;
    },
    bind(d, el) {
      const tot = (d.minutes || 25) * 60; let left = tot, run = false, t = null;
      const draw = () => {
        $('.ring span', el).textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
        el.querySelectorAll('.pg,.gw').forEach(c => c.style.strokeDashoffset = 276.5 * (1 - left / tot));
        $('.go', el).textContent = run ? L.pause : left < tot ? L.resume : L.start;
      };
      el.addEventListener('click', e => {
        if (!e.target.closest('.go')) return;
        run = !run; window.__deskBusy = run;
        clearInterval(t);
        if (run) t = setInterval(() => { left--; if (left <= 0) { run = false; window.__deskBusy = false; clearInterval(t); left = tot; notify(I.timer, L.focusDone, L.breakNow); } draw(); }, 1000);
        draw();
      });
    },
  },

  countdown: {
    tallOk: true, every: 3600,
    meta: () => '',
    render(d) {
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const it = (d.items || []).map(x => ({ ...x, n: Math.round((new Date(x.date + 'T00:00') - now) / 864e5) })).filter(x => x.n >= 0).sort((a, b) => a.n - b.n);
      if (!it.length) return empty();
      const [f, ...rest] = it;
      return `<div class="cd-main">${f.n === 0 ? `<span class="n">${L.dayToday}</span>` : `<span class="n">${f.n}</span><span>${L.daysLeft}</span>`}</div><div class="cd-name">${esc(f.name)}</div><div class="cd-date">${esc(f.date)}</div>
        ${rest.length ? `<div class="cd-list">${rest.slice(0, 3).map(x => `<div><span>${esc(x.name)}</span><b>${x.n} ${L.days}</b></div>`).join('')}</div>` : ''}`;
    },
  },

  goals: {
    tallOk: true,
    meta: d => meta(d),
    render(d, el, tall) {
      const it = d.items || [];
      if (!it.length) return empty();
      return `<div class="gl">${it.slice(0, tall ? 12 : 6).map(g => {
        const p = Math.max(0, Math.min(100, g.current / g.target * 100));
        const val = g.money && privacy ? `<span class="mask">${MASK}</span>` : `${esc(num(g.current))} / ${esc(num(g.target))} ${esc(g.unit || '')}`;
        return `<div><div class="gh"><b>${esc(g.name)}</b><span>${val} · ${Math.round(p)}%</span></div><div class="tr"><i data-w="${p}"></i></div></div>`;
      }).join('')}</div>`;
    },
    after(el) { requestAnimationFrame(() => setTimeout(() => el.querySelectorAll('.tr i').forEach(i => i.style.width = i.dataset.w + '%'), 300)); },
  },

  note: {
    tallOk: true,
    meta: d => meta(d),
    render(d) { return d.text ? `<p class="nt">${esc(d.text)}</p>${d.by ? `<div class="nt-by">${esc(d.by)}</div>` : ''}` : empty(); },
  },
};

// Drop rows that do not fit, so any amount of data stays inside its card.
// Finished events go first, then rows from the end of the last list.
function trim(el) {
  if (document.body.classList.contains('m')) return;
  const bd = $('.bd', el), lists = [...bd.querySelectorAll('.list,.tl,.gl,.cd-list,.hbs')];
  for (let guard = 60; bd.scrollHeight > bd.clientHeight + 1 && guard--;) {
    const l = [...lists].reverse().find(x => x.children.length > 1);
    if (!l) break;
    const node = l.classList.contains('today') && l.querySelector('.done') || l.lastElementChild, next = node.nextSibling, before = bd.scrollHeight;
    node.remove();
    if (bd.scrollHeight >= before) { l.insertBefore(node, next); break; } // the overflow comes from somewhere else
  }
}
function done(t) { const v = store.get('todo:' + ymd(new Date()) + ':' + t.text, null); return v == null ? !!t.done : v; }
function spark(v, col) {
  if (!v || v.length < 2) return '<span></span>';
  const lo = Math.min(...v), hi = Math.max(...v), r = hi - lo || 1;
  const d = v.map((x, i) => `${i ? 'L' : 'M'}${(i / (v.length - 1) * 64).toFixed(1)} ${(22 - (x - lo) / r * 20).toFixed(1)}`).join(' ');
  return `<svg class="spk" viewBox="0 0 64 24"><path d="${d}" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ---------- layout: two rows, up to four columns ---------- */
let ids = (qs.get('layout') ? qs.get('layout').split(',') : D.layout || []).map(s => s.trim()).filter(id => CARDS[id]);
ids = [...new Set(ids)].slice(0, 8);
const tall = new Set(ids.filter(id => CARDS[id].tall || (C[id] && C[id].size === 'tall')));
let cells = ids.length + tall.size;
while (cells > 8 && tall.size) { tall.delete([...tall].pop()); cells--; }
if (cells % 2) {
  const rows = id => ((C[id] || {}).items || []).length;
  const pick = ids.filter(id => !tall.has(id) && CARDS[id].tallOk).sort((a, b) => rows(b) - rows(a))[0] || ids[ids.length - 1];
  tall.add(pick); cells++;
}
const cols = Math.max(1, cells / 2);
const grid = $('#grid');
grid.style.gridTemplateColumns = `repeat(${cols},minmax(0,1fr))`;

fit();
const mounted = [];
ids.forEach((id, n) => {
  const def = CARDS[id], d = C[id] || {}, isTall = tall.has(id);
  const el = document.createElement('section');
  el.className = 'card c-' + id + (isTall ? ' tall' : '');
  el.style.animationDelay = (0.12 + n * 0.07) + 's';
  el.innerHTML = `<div class="in"><div class="hd"><h2 class="ttl">${esc(d.title || L.t[id])}</h2><span class="meta"></span></div><div class="bd"></div></div>`;
  grid.appendChild(el);
  const draw = () => {
    $('.meta', el).innerHTML = def.meta ? def.meta(d) : '';
    $('.bd', el).innerHTML = def.render(d, el, isTall);
    trim(el);
    def.after && def.after(el);
    setTimeout(() => trim(el), 500);
  };
  draw();
  def.bind && def.bind(d, el, draw);
  mounted.push({ id, def, d, el, draw });
  if (def.load) {
    const pull = () => def.load(d).then(ok => ok && draw()).catch(() => { if (!d.failed) { d.failed = true; draw(); } });
    pull(); if (def.every) setInterval(pull, def.every * 1000);
  } else if (def.every) setInterval(draw, def.every * 1000);
});

/* ---------- header ---------- */
function tick() {
  const d = new Date(), h = d.getHours();
  $('#date').textContent = EN ? `${L.mon[d.getMonth()]} ${d.getDate()}` : `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  $('#wk').textContent = L.wk[d.getDay()];
  $('#clock').textContent = `${hm(d)}:${pad(d.getSeconds())}`;
  $('#greet').textContent = (h < 11 ? L.greet[0] : h < 18 ? L.greet[1] : L.greet[2]) + (P.name ? (EN ? ', ' : ' ') + P.name : '');
  if (d.getSeconds() === 0) mounted.forEach(m => m.def.tick && m.def.tick(m.d));
}
tick(); setInterval(tick, 1000);
setTimeout(() => mounted.forEach(m => m.def.tick && m.def.tick(m.d)), 1500);

const hasMoney = ids.some(id => id === 'income' || (id === 'goals' && (C.goals?.items || []).some(g => g.money)));
const chips = $('#chips');
(P.chips || []).forEach(c => { const s = document.createElement('span'); s.className = 'chip'; s.innerHTML = `<i class="dot"></i>${esc(c)}`; chips.appendChild(s); });
if (hasMoney) {
  const b = document.createElement('button'); b.className = 'chip';
  const paint = () => { b.innerHTML = (privacy ? I.eyeOff : I.eye) + (privacy ? L.show : L.hide); };
  const flip = () => { privacy = !privacy; store.set('privacy', privacy); paint(); mounted.filter(m => ['income', 'goals'].includes(m.id)).forEach(m => m.draw()); };
  b.addEventListener('click', flip); paint(); chips.appendChild(b);
  addEventListener('keydown', e => { if (e.key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey) flip(); });
}

/* ---------- fit the canvas to any screen ---------- */
function fit() {
  const iw = innerWidth, ih = innerHeight, desk = $('#desk');
  if (iw < 760 || iw / ih < 1.05) { document.body.classList.add('m'); return; }
  document.body.classList.remove('m');
  // 1600 wide by default; very wide screens get a wider canvas instead of empty sides
  let W = 1600, H = Math.round(Math.max(880, Math.min(1120, W * ih / iw)));
  if (W * ih / iw < 880) W = Math.min(2100, Math.round(H * iw / ih));
  desk.style.width = W + 'px';
  desk.style.height = H + 'px';
  desk.style.transform = `translate(-50%,-50%) scale(${Math.min(iw / W, ih / H)})`;
}
let lastH = 0;
addEventListener('resize', () => { fit(); const h = $('#desk').offsetHeight; if (h !== lastH) { lastH = h; mounted.forEach(m => m.draw()); } });
lastH = $('#desk').offsetHeight;

/* ---------- pick up new data.js every few minutes ---------- */
const every = (P.reloadMinutes ?? 10) * 60e3;
if (every > 0) setInterval(() => { if (!window.__deskBusy) location.reload(); }, every);
})();
