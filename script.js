// ==========================================
// 1. اتصال به Supabase
// ==========================================

const SUPABASE_URL =
    "https://tujcsmurmojnnkhavglf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IkpCvlrLg7a1oQQrqXzBHg_tRJ6HJFY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// 2. متغیرهای عمومی
// ==========================================

let allCustomers = [];


// ==========================================
// 3. تست اتصال به Supabase
// ==========================================

async function testConnection() {

    const status =
        document.getElementById("connection-status");

    try {

        const { data, error } =
            await supabaseClient
                .from("customers")
                .select("id")
                .limit(1);

        if (error) {
            throw error;
        }

        if (status) {

            status.textContent =
                "✅ اتصال به دیتابیس با موفقیت انجام شد";

        }

        console.log(
            "Supabase connected:",
            data
        );

    } catch (error) {

        if (status) {

            status.textContent =
                "❌ اتصال به دیتابیس انجام نشد";

        }

        console.error(
            "Supabase Error:",
            error
        );
    }
}

/* ═════════════ چاپ‌یار — نسخهٔ ۳٫۰ (کدنویسی از صفر) ═════════════
   ورود آزاد تا وقتی خودتان رمز بگذارید | هجری شمسی | افغانی/دالر
═════════════════════════════════════════════════════════════════ */
'use strict';

/* ═══ ۱) ابزارها ═══ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const faDigits = s => String(s ?? '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const fa = n => {
  if (n === null || n === undefined || isNaN(n)) return '۰';
  try { return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(n); }
  catch { return faDigits(String(n)); }
};
const money = (a, c) => fa(a) + ' ' + (c === 'USD' ? '$' : '؋');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ibtn = (act, id, txt, cls = '', title = '') =>
  `<button class="ibtn ${cls}" data-act="${act}" data-id="${id}" title="${esc(title)}">${txt}</button>`;

function toast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast ' + (type === 'err' ? 'err' : type === 'info' ? 'info' : '');
  t.textContent = msg;
  $('#toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}
let lastFocus = null, confirmCb = null;
function openModal(id) { lastFocus = document.activeElement; $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); if (lastFocus?.focus) lastFocus.focus(); }
function closeAllModals() { $$('.modal.open').forEach(m => m.classList.remove('open')); }
function confirmBox(text, cb) { $('#confirmText').textContent = text; confirmCb = cb; openModal('#modalConfirm'); }

/* ═══ ۲) تقویم هجری شمسی (ماه‌های افغانی) ═══ */
const MONTHS = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];
const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
const J = (() => {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const div = (a, b) => ~~(a / b), mod = (a, b) => a - ~~(a / b) * b;
  function jalCal(jy) {
    const bl = breaks.length, gy = jy + 621;
    let leapJ = -14, jp = breaks[0], jump = 0;
    for (let i = 1; i < bl; i++) {
      const jm = breaks[i]; jump = jm - jp;
      if (jy < jm) break;
      leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    let n = jy - jp;
    leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = div(gy, 4) - div(div(gy, 100) + 1, 4) * 3 - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap, march, gy };
  }
  function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
  }
  function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    return { gd: div(mod(i, 153), 5) + 1, gm: mod(div(i, 153), 12) + 1, gy: div(j, 1461) - 100100 + div(8 - mod(div(i, 153), 12) + 1, 6) };
  }
  const j2d = (jy, jm, jd) => { const r = jalCal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1; };
  function d2j(jdn) {
    let gy = d2g(jdn).gy, jy = gy - 621;
    const r = jalCal(jy), jdn1f = g2d(gy, 3, r.march);
    let k = jdn - jdn1f;
    if (k >= 0) { if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }; k -= 186; }
    else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
    return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
  }
  const mLen = (jy, jm) => jm <= 6 ? 31 : jm <= 11 ? 30 : (jalCal(jy).leap === 1 ? 30 : 29);
  return { toJalaali: (gy, gm, gd) => d2j(g2d(gy, gm, gd)), j2d, d2g, mLen };
})();
const jToday = () => { const n = new Date(); return J.toJalaali(n.getFullYear(), n.getMonth() + 1, n.getDate()); };
const validJ = j => j && j.jy > 1300 && j.jy < 1600 && j.jm >= 1 && j.jm <= 12 && j.jd >= 1 && j.jd <= J.mLen(j.jy, j.jm);
const jStr = j => validJ(j) ? faDigits(`${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`) : '—';
const jLong = j => validJ(j) ? `${MONTHS[j.jm - 1]} ${fa(j.jd)}، ${fa(j.jy)}` : '—';
const jAdd = (j, days) => { const g = J.d2g(J.j2d(j.jy, j.jm, j.jd)); const dt = new Date(g.gy, g.gm - 1, g.gd + days); return J.toJalaali(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); };
const jdnOf = j => J.j2d(j.jy, j.jm, j.jd);
const jWeekday = j => { const g = J.d2g(jdnOf(j)); return WEEKDAYS[new Date(g.gy, g.gm - 1, g.gd).getDay()]; };
const nowTime = () => { const n = new Date(); return faDigits(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`); };

/* ═══ ۳) لایهٔ داده ═══ */
const LS_KEY = 'chapyar_db_v3';
const ROLE_DEFS = {
  modir:    { name: 'مدیر',         modules: ['dashboard', 'orders', 'customers', 'gudam', 'finance', 'settings'] },
  pazirosh: { name: 'کارمند پذیرش', modules: ['dashboard', 'orders', 'customers'] },
  hesabdar: { name: 'حسابدار',      modules: ['dashboard', 'customers', 'finance'] },
  gudam:    { name: 'مسئول گدام',   modules: ['dashboard', 'gudam'] },
};

function seedData() {
  const T = jToday(), D = off => jAdd(T, off);
  let oc = 1000, cc = 100, rc = 500, pc = 200;
  const customers = [
    { id: uid(), code: 'C-101', name: 'احمد رحیمی', phone: '0700123456', type: 'credit', address: 'کابل، کارته سه', note: 'مشتری دایمی', d: D(-220) },
    { id: uid(), code: 'C-102', name: 'حاجی عبدالله عمرخیل', phone: '0707445566', type: 'credit', address: 'کابل، مندوی', note: '', d: D(-180) },
    { id: uid(), code: 'C-103', name: 'فاطمه احمدی', phone: '0780112233', type: 'cash', address: 'کابل، شهر نو', note: '', d: D(-90) },
    { id: uid(), code: 'C-104', name: 'شرکت کابل پرینت', phone: '0799887766', type: 'credit', address: 'کابل، شیرپور', note: 'قرارداد سالانه', d: D(-140) },
    { id: uid(), code: 'C-105', name: 'نجیب‌الله صافی', phone: '0744556677', type: 'cash', address: 'پروان، چاریکار', note: '', d: D(-45) },
    { id: uid(), code: 'C-106', name: 'استاد ضیایاالدین', phone: '0777334455', type: 'credit', address: 'کابل، کوته سنگی', note: 'چاپ کتاب', d: D(-30) },
  ];
  const [c1, c2, c3, c4, c5, c6] = customers;
  const orders = [], ledger = [], receipts = [];

  const mkO = (cust, off, job, qty, color, size, material, pack, price, cur, rate, rec, status, note = '') => {
    const total = +(qty * price).toFixed(2), remaining = +(total - rec).toFixed(2);
    const o = { id: uid(), code: 'SO-' + (++oc), d: D(off), job, customerId: cust.id, customerName: cust.name,
      ctype: cust.type, phone: cust.phone, qty, color, size, material, pack, price, currency: cur,
      rate: cur === 'USD' ? rate : null, total, received: rec, remaining, note, delivery: null, status };
    orders.push(o);
    if (cust.type === 'credit' && remaining > 0) {
      ledger.push({ id: uid(), customerId: cust.id, orderId: o.id, type: 'debit', currency: cur, amount: remaining,
        rate: cur === 'USD' ? rate : null, afnEq: cur === 'USD' ? +(remaining * rate).toFixed(2) : remaining,
        babat: `سفارش ${o.code} — ${job}`, d: D(off) });
    }
    return o;
  };
  mkO(c3, 0, 'چاپ دعوتنامه عروسی', 500, 'چندرنگ', 'A5', 'کاغذ گلاسه ۳۰۰گرام', true, 40, 'AFN', null, 20000, 'settled');
  mkO(c1, 0, 'کارت ویزیت طلایی', 1000, 'چندرنگ', '۸٫۵×۴٫۸', 'کاغذ مات ۳۰۰گرام', true, 20, 'AFN', null, 0, 'new', 'تحویل فوری');
  mkO(c4, -1, 'بروشور شرکتی A4', 2000, 'چندرنگ', 'A4', 'کاغذ تحریر ۱۰۰گرام', false, 15, 'AFN', null, 10000, 'new');
  mkO(c4, -1, 'کاتالوگ صادراتی', 500, 'چندرنگ', 'A5', 'گلاسه ۱۷۰گرام', true, 1, 'USD', 72, 200, 'new');
  mkO(c2, -2, 'تراکت تبلیغاتی', 5000, 'تک‌رنگ', 'A5', 'کاغذ تحریر ۸۰گرام', false, 1.7, 'AFN', null, 5000, 'registered');
  mkO(c6, -3, 'چاپ کتاب شعر', 300, 'تک‌رنگ', 'رقعی', 'کاغذ تحریر ۷۰گرام', false, 120, 'AFN', null, 10000, 'new');
  mkO(c1, -6, 'پوستر تبلیغاتی', 100, 'چندرنگ', 'A3', 'گلاسه ۱۷۰گرام', false, 45, 'AFN', null, 4500, 'settled');
  mkO(c5, -8, 'چاپ فاکتور رسمی', 50, 'تک‌رنگ', 'A5', 'کاربن‌دار', true, 60, 'AFN', null, 3000, 'settled');

  const mkR = (cust, off, cur, amount, rate, babat, orderId = null) => {
    const r = { id: uid(), code: 'R-' + (++rc), customerId: cust.id, d: D(off), currency: cur, amount,
      rate: cur === 'USD' ? rate : null, afnEq: cur === 'USD' ? +(amount * rate).toFixed(2) : amount, babat, orderId };
    receipts.push(r);
    ledger.push({ id: uid(), customerId: cust.id, orderId, type: 'credit', currency: cur, amount, rate: r.rate,
      afnEq: r.afnEq, babat: `رسید ${r.code} — ${babat || 'دریافت وجه'}`, d: D(off) });
    if (orderId) {
      const o = orders.find(x => x.id === orderId);
      if (o && o.currency === cur) { o.received = +(o.received + amount).toFixed(2); o.remaining = Math.max(0, +(o.total - o.received).toFixed(2)); }
    }
  };
  mkR(c1, 0, 'AFN', 5000, null, 'قسط اول کارت ویزیت', orders[1].id);
  mkR(c2, -4, 'AFN', 1500, null, 'پرداخت تراکت', orders[4].id);
  mkR(c4, 0, 'USD', 50, 72, 'رسید کاتالوگ', orders[3].id);

  const payments = [
    { id: uid(), code: 'P-201', d: D(0), babat: 'کرایه ماهانه دکان', checkNo: '', currency: 'AFN', amount: 15000, rate: null, afnEq: 15000, note: '' },
    { id: uid(), code: 'P-202', d: D(-4), babat: 'خرید زینک و پلیت', checkNo: '5542', currency: 'USD', amount: 200, rate: 72, afnEq: 14400, note: 'پرداخت به مارکیت' },
  ];
  const mkS = (kind, person, cat, item, qty, unit, size, off, note = '') =>
    ({ id: uid(), kind, person, cat, item, qty, unit, size, d: D(off), note });
  const stock = [
    mkS('in', 'احمد رحیمی', 'کاغذی', 'کاغذ گلاسه ۱۳۵ گرام', 500, 'برگ', '60×90', -5),
    mkS('out', 'احمد رحیمی', 'کاغذی', 'کاغذ گلاسه ۱۳۵ گرام', 120, 'برگ', '60×90', -2, 'سفارش کارت ویزیت'),
    mkS('in', 'شرکت کابل پرینت', 'کاغذی', 'کاغذ تحریر ۱۰۰ گرام', 1000, 'برگ', '70×100', -8),
    mkS('out', 'شرکت کابل پرینت', 'کاغذی', 'کاغذ تحریر ۱۰۰ گرام', 250, 'برگ', '70×100', -1),
    mkS('in', 'مارکیت مواد خام', 'مواد خام', 'مرکب آبی', 25, 'کیلو', '', -10),
    mkS('out', 'مارکیت مواد خام', 'مواد خام', 'مرکب آبی', 6, 'کیلو', '', -3),
    mkS('in', 'حاجی نصیر', 'کاغذی', 'مقوای ۳۰۰ گرام', 200, 'برگ', '50×70', 0),
  ];

  return {
    settings: { shopName: 'چاپخانه آریانا', shopAddr: 'کابل، مارکیت کتاب‌فروشان، دکان ۱۲', usdRate: 72, footer: 'از اعتماد شما متشکریم.', authEnabled: false },
    seq: { order: oc, customer: cc, receipt: rc, pay: 202 },
    users: [
      { id: uid(), username: 'میرویس', pass: '0000', name: 'میرویس', role: 'modir', active: true },
      { id: uid(), username: 'hesab', pass: '1234', name: 'صدیق احمدی', role: 'hesabdar', active: true },
      { id: uid(), username: 'paziresh', pass: '1234', name: 'مریم رسولی', role: 'pazirosh', active: true },
      { id: uid(), username: 'gudam', pass: '1234', name: 'وکیل عمری', role: 'gudam', active: true },
    ],
    customers, orders, ledger, receipts, payments, stock,
    log: [
      { d: D(-1), time: '۱۰:۱۵', user: 'مریم رسولی', text: 'سفارش SO-1002 را ثبت کرد.' },
      { d: D(0), time: '۰۸:۳۰', user: 'صدیق احمدی', text: 'مبلغ ۵٬۰۰۰ ؋ از مشتری احمد رحیمی دریافت کرد.' },
      { d: D(0), time: '۰۹:۱۰', user: 'وکیل عمری', text: 'مقدار ۲۰۰ برگ مقوا وارد گدام کرد.' },
    ],
  };
}

const LS = {
  load() { try { const s = localStorage.getItem(LS_KEY); if (s) return JSON.parse(s); } catch { } return null; },
  save() { localStorage.setItem(LS_KEY, JSON.stringify(DB)); },
};
let DB = LS.load() || seedData();
LS.save();
const save = () => LS.save();
let USER = null;
const can = m => USER && (USER.role === 'modir' || ROLE_DEFS[USER.role].modules.includes(m));
const addLog = text => { DB.log.unshift({ d: jToday(), time: nowTime(), user: USER ? USER.name : 'سیستم', text }); if (DB.log.length > 500) DB.log.length = 500; };

/* ═══ ۴) محاسبات مالی ═══ */
function balancesOf(cid) {
  const b = { afn: 0, usd: 0, afnPaid: 0, usdPaid: 0 };
  DB.ledger.filter(l => l.customerId === cid).forEach(l => {
    if (l.type === 'debit') { if (l.currency === 'USD') b.usd += l.amount; else b.afn += l.amount; }
    else { if (l.currency === 'USD') { b.usd -= l.amount; b.usdPaid += l.amount; } else { b.afn -= l.amount; b.afnPaid += l.amount; } }
  });
  return b;
}
const balAfnEq = b => b.afn + b.usd * DB.settings.usdRate;
const balText = b => {
  const p = [];
  if (Math.abs(b.afn) > 0.01) p.push(money(b.afn, 'AFN'));
  if (Math.abs(b.usd) > 0.01) p.push(money(b.usd, 'USD'));
  return p.length ? p.join(' + ') : '۰ ؋';
};
function customerStats(c) {
  const os = DB.orders.filter(o => o.customerId === c.id);
  const totalBuy = os.reduce((s, o) => s + (o.currency === 'USD' ? o.total * (o.rate || DB.settings.usdRate) : o.total), 0);
  const totalPaid = os.reduce((s, o) => s + (o.currency === 'USD' ? o.received * (o.rate || DB.settings.usdRate) : o.received), 0);
  return { orders: os.length, totalBuy, totalPaid, bal: balancesOf(c.id) };
}
function stockAgg() {
  const map = new Map();
  DB.stock.forEach(m => {
    const k = `${m.person}|${m.item}|${m.size || ''}|${m.unit}`;
    if (!map.has(k)) map.set(k, { person: m.person, cat: m.cat, item: m.item, size: m.size, unit: m.unit, tin: 0, tout: 0 });
    const r = map.get(k);
    if (m.kind === 'in') r.tin += m.qty; else r.tout += m.qty;
  });
  return [...map.values()].map(r => ({ ...r, bal: +(r.tin - r.tout).toFixed(2) }));
}
function stockBal(person, item, size, unit) {
  return stockAgg().find(r => r.person === person && r.item === item && (r.size || '') === (size || '') && r.unit === unit)?.bal || 0;
}

/* ═══ ۵) ناوبری ═══ */
const ROUTES = {
  dashboard: { t: 'پیشخوان', m: 'dashboard', f: renderDashboard },
  neworder: { t: 'ثبت سفارش جدید', m: 'orders', f: initOrderForm },
  orders: { t: 'مدیریت سفارشات', m: 'orders', f: renderOrders },
  customers: { t: 'مشتریان', m: 'customers', f: renderCustomers },
  customer: { t: 'پرونده مشتری', m: 'customers', f: renderCustomerDetail },
  ledger: { t: 'پا حساب مشتریان', m: 'customers', f: renderLedger },
  receipts: { t: 'رسید مشتریان نسیه', m: 'customers', f: initReceiptForm },
  stock: { t: 'موجودی گدام', m: 'gudam', f: renderStock },
  stockin: { t: 'ورودی جنس', m: 'gudam', f: initStockIn },
  stockout: { t: 'خروجی جنس', m: 'gudam', f: initStockOut },
  received: { t: 'دریافت مشتریان', m: 'finance', f: renderReceived },
  payment: { t: 'پرداخت پول', m: 'finance', f: initPayForm },
  finance: { t: 'گزارش‌های مالی', m: 'finance', f: renderFinance },
  users: { t: 'مدیریت کاربران', m: 'settings', f: renderUsers },
  settings: { t: 'تنظیمات', m: 'settings', f: renderSettings },
};
let CURRENT = 'dashboard', ORD_FILTER = 'all', CUST_FILTER = 'all';

function show(page, param = null) {
  const r = ROUTES[page]; if (!r) return;
  if (!can(r.m)) { toast('به این بخش دسترسی ندارید', 'err'); return; }
  CURRENT = page;
  $$('.page').forEach(p => p.classList.remove('active'));
  const sec = $(`.page[data-page="${page}"]`);
  if (sec) sec.classList.add('active');
  $('#pageTitle').textContent = r.t;
  $$('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  document.body.classList.remove('side-open');
  r.f(param);
  window.scrollTo({ top: 0 });
}
function applyNav() {
  $$('#navList .nav-item').forEach(a => {
    const r = ROUTES[a.dataset.page];
    a.style.display = r && can(r.m) ? '' : 'none';
  });
}

/* ═══ ) داشبورد ══ */
const orderStatus = o => o.status === 'settled' ? 'تصفیه شده' : o.status === 'registered' ? 'ثبت شده' : 'در جریان';
const orderBadgeClass = o => o.status === 'settled' ? 'chip-green' : o.status === 'registered' ? 'chip-blue' : 'chip-amber';
const afnOf = o => o.currency === 'USD' ? o.total * (o.rate || DB.settings.usdRate) : o.total;

function renderDashboard() {
  const t = jToday(), tJdn = jdnOf(t);
  const isToday = d => jdnOf(d) === tJdn;
  $('#dashTitle').textContent = `سلام ${USER.name} عزیز`;
  $('#dashSub').textContent = `${jWeekday(t)}، ${jLong(t)} — ${esc(DB.settings.shopName)}`;

  const O = DB.orders;
  const todayN = O.filter(o => isToday(o.d)).length;
  const inProg = O.filter(o => o.status !== 'settled').length;
  const registered = O.filter(o => o.status === 'registered').length;
  const settled = O.filter(o => o.status === 'settled').length;
  const cashN = DB.customers.filter(c => c.type === 'cash').length;
  const creditC = DB.customers.filter(c => c.type === 'credit');
  let debt = 0;
  creditC.forEach(c => { const v = balAfnEq(balancesOf(c.id)); if (v > 0) debt += v; });
  const todayIn = DB.receipts.filter(r => isToday(r.d)).reduce((s, r) => s + r.afnEq, 0);
  const todayOut = DB.payments.filter(p => isToday(p.d)).reduce((s, p) => s + p.afnEq, 0);
  const agg = stockAgg().filter(r => r.bal > 0);
  const saleToday = O.filter(o => isToday(o.d)).reduce((s, o) => s + afnOf(o), 0);
  const saleMonth = O.filter(o => o.d.jy === t.jy && o.d.jm === t.jm).reduce((s, o) => s + afnOf(o), 0);

  const kpis = [
    ['سفارشات امروز', todayN, 'acc-c'], ['در حال انجام', inProg, 'acc-y'],
    ['ثبت شده‌ها', registered, 'acc-c'], ['تصفیه شده‌ها', settled, 'acc-g'],
    ['مشتریان نقدی', cashN, 'acc-g'], ['مشتریان نسیه', creditC.length, 'acc-m'],
    ['مجموع طلب نسیه', fa(debt) + ' ؋', 'acc-r'], ['دریافتی امروز', fa(todayIn) + ' ؋', 'acc-g'],
    ['پرداختی امروز', fa(todayOut) + ' ؋', 'acc-k'], ['اقلام گدام', agg.length, 'acc-y'],
    ['فروش امروز', fa(saleToday) + ' ؋', 'acc-c'], ['فروش این ماه', fa(saleMonth) + ' ؋', 'acc-c'],
  ];
  $('#kpiGrid').innerHTML = kpis.map((k, i) =>
    `<div class="kpi ${i < 2 ? 'hero' : ''} ${k[2]}"><div class="lbl">${k[0]}</div><div class="num">${k[1]}</div></div>`).join('');

  const quick = [
    ['neworder', '+ سفارش جدید', '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'],
    ['receipts', '💰 دریافت پول', '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'],
    ['stockin', '📥 ورودی جنس', '<path d="M12 3v14M7 12l5 5 5-5"/><path d="M4 21h16"/>'],
    ['stockout', '📤 خروجی جنس', '<path d="M12 21V7M7 12l5-5 5 5"/><path d="M4 3h16"/>'],
    ['payment', '💳 پرداخت پول', '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/>'],
    ['customers', '🔎 جستجوی مشتری', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'],
  ];
  $('#quickGrid').innerHTML = quick.map(q =>
    `<button class="qa" data-page="${q[0]}"><svg viewBox="0 0 24 24">${q[2]}</svg><span>${q[1]}</span></button>`).join('');

  const debtors = creditC.map(c => ({ c, b: balancesOf(c.id) }))
    .filter(x => balAfnEq(x.b) > 0).sort((a, b) => balAfnEq(b.b) - balAfnEq(a.b)).slice(0, 5);
  $('#debtorsList').innerHTML = debtors.length ? debtors.map(x =>
    `<div class="mrow"><div class="grow"><b>${esc(x.c.name)}</b><small>${esc(x.c.address || '')}</small></div>
     <span class="mbadge">${fa(balAfnEq(x.b))} ؋</span>${ibtn('open-customer', x.c.id, '→', '', 'پرونده')}</div>`).join('')
    : '<div class="mrow"><div class="grow"><b class="hint">بدهکاری وجود ندارد 🎉</b></div></div>';

  const latest = [...O].sort((a, b) => jdnOf(b.d) - jdnOf(a.d)).slice(0, 5);
  $('#recentList').innerHTML = latest.map(o =>
    `<div class="mrow"><div class="grow"><b>${faDigits(o.code)} — ${esc(o.job)}</b><small>${esc(o.customerName)} · ${jStr(o.d)}</small></div>
     <span class="mbadge">${orderStatus(o)}</span>${ibtn('view-order', o.id, '→', '', 'مشاهده')}</div>`).join('');

  $('#stockMini').innerHTML = agg.slice(0, 5).map(r =>
    `<div class="mrow"><div class="grow"><b>${esc(r.item)}</b><small>${esc(r.person)}${r.size ? ' · ' + faDigits(r.size) : ''}</small></div>
     <span class="mbadge">${fa(r.bal)} ${r.unit}</span></div>`).join('')
    || '<div class="mrow"><div class="grow"><b class="hint">گدام خالی است</b></div></div>';

  drawBarChart('#barChart', saleHistory7());
}
function saleHistory7() {
  const t = jToday(), wd = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = jAdd(t, -i), jdn = jdnOf(d);
    const sum = DB.orders.filter(o => jdnOf(o.d) === jdn).reduce((s, o) => s + afnOf(o), 0);
    const g = J.d2g(jdn);
    days.push({ lbl: wd[(new Date(g.gy, g.gm - 1, g.gd).getDay() + 1) % 7], val: sum });
  }
  return days;
}
function drawBarChart(sel, data) {
  const cv = $(sel); if (!cv) return;
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width * dpr; cv.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(...data.map(d => d.val), 1);
  const barW = (w - 40) / data.length - 8, chartH = h - 30;
  const txt = getComputedStyle(document.body).getPropertyValue('--txt2').trim() || '#666';
  ctx.font = '11px Vazirmatn'; ctx.textAlign = 'center';
  data.forEach((d, i) => {
    const x = 20 + i * (barW + 8), bh = (d.val / max) * chartH;
    const g = ctx.createLinearGradient(0, chartH - bh, 0, chartH);
    g.addColorStop(0, '#00a6c8'); g.addColorStop(1, '#e23d8a');
    ctx.fillStyle = g; ctx.fillRect(x, chartH - bh, barW, bh);
    ctx.fillStyle = txt;
    ctx.fillText(d.lbl, x + barW / 2, chartH + 14);
    if (d.val) ctx.fillText(fa(Math.round(d.val)), x + barW / 2, chartH - bh - 4);
  });
}

/* ═══ ۷) سفارشات ═══ */
function initOrderForm() {
  $('#oDate').textContent = jLong(jToday());
  $('#oCode').textContent = faDigits('SO-' + (DB.seq.order + 1));
  if (!$('#oId').value) resetOrderForm();
  buildOrderFields('formHostNew');
}
function buildOrderFields(hostId) {
  const p = hostId === 'formHostNew' ? 'o' : 'eo';
  $(`#${hostId}`).innerHTML = `
    <div class="frm">
      <div class="field span2"><label>نام کار <em>*</em></label><input id="${p}Job" required></div>
      <div class="field"><label>مشتری (سفارش‌دهنده)</label><select id="${p}CustSel" onchange="onCustSelChange('${hostId}')"></select></div>
      <div class="field" id="${p}TypeBox"></div>
      <div class="field"><label>شماره تماس</label><input id="${p}Phone" readonly></div>
      <div class="field"><label>تعداد <em>*</em></label><input id="${p}Qty" type="number" min="1" value="1" oninput="updateCalc('${hostId}')"></div>
      <div class="field"><label>رنگ</label><select id="${p}Color"><option>تک‌رنگ</option><option selected>چندرنگ</option></select></div>
      <div class="field"><label>سایز</label><input id="${p}Size" placeholder="A4، 60×90..."></div>
      <div class="field"><label>جنس</label><input id="${p}Mat" placeholder="گلاسه، تحریر..."></div>
      <div class="field"><label>قیمت فی واحد <em>*</em></label><input id="${p}Price" type="number" min="0" step="any" value="0" oninput="updateCalc('${hostId}')"></div>
      <div class="field"><label>واحد پولی</label><select id="${p}Cur" onchange="updateCalc('${hostId}')">
        <option value="AFN">افغانی (؋)</option><option value="USD">دالر ($)</option></select></div>
      <div class="field" id="${p}RateWrap" hidden><label>نرخ دالر (دستی) <em>*</em></label>
        <input id="${p}Rate" type="number" step="any" oninput="updateCalc('${hostId}')">
        <small class="hint">نرخ همین معامله ذخیره می‌شود</small></div>
      <div class="field"><label>مبلغ رسیده</label><input id="${p}Rec" type="number" min="0" step="any" value="0" oninput="updateCalc('${hostId}')"></div>
      <div class="field"><label>بسته‌بندی</label>
        <label class="radio" style="margin-top:8px"><input type="checkbox" id="${p}Pack"><span>دارد</span></label></div>
      <div class="field span2"><label>توضیحات</label><input id="${p}Note"></div>
    </div>
    <input type="hidden" id="${p}Id">
    <div class="calc-row">
      <div class="calcbox"><small>جمع کل</small><b id="${p}Total">۰</b></div>
      <div class="calcbox" id="${p}AfnWrap" hidden><small>معادل افغانی</small><b id="${p}AfnEq">۰</b></div>
      <div class="calcbox rem"><small>مبلغ باقی‌مانده</small><b id="${p}Rem">۰</b></div>
    </div>`;
  fillCustSelect(`#${p}CustSel`);
  onCustSelChange(hostId);
  updateCalc(hostId);
}
function fillCustSelect(selId) {
  $(selId).innerHTML = '<option value="">— مشتری جدید —</option>' +
    DB.customers.map(c => `<option value="${c.id}">${esc(c.name)} (${faDigits(c.code)})</option>`).join('');
}
function onCustSelChange(hostId) {
  const p = hostId === 'formHostNew' ? 'o' : 'eo';
  const id = $(`#${p}CustSel`).value;
  if (id) {
    const c = DB.customers.find(x => x.id === id);
    $(`#${p}Phone`).value = c.phone || '';
    $(`#${p}TypeBox`).innerHTML = c.type === 'cash' ? '<span class="chip chip-green">نقدی</span>' : '<span class="chip chip-mag">نسیه</span>';
  } else {
    $(`#${p}Phone`).value = '';
    $(`#${p}TypeBox`).innerHTML = `<div class="radios">
      <label class="radio"><input type="radio" name="${hostId}_type" value="cash" checked><span>نقدی</span></label>
      <label class="radio"><input type="radio" name="${hostId}_type" value="credit"><span>نسیه</span></label></div>`;
  }
}
function updateCalc(hostId) {
  const p = hostId === 'formHostNew' ? 'o' : 'eo';
  const qty = +$(`#${p}Qty`).value || 0, price = +$(`#${p}Price`).value || 0, rec = +$(`#${p}Rec`).value || 0;
  const cur = $(`#${p}Cur`).value;
  const total = +(qty * price).toFixed(2), rem = +(total - rec).toFixed(2);
  $(`#${p}Total`).textContent = money(total, cur);
  $(`#${p}Rem`).textContent = money(rem, cur);
  const usd = cur === 'USD';
  $(`#${p}RateWrap`).hidden = !usd;
  $(`#${p}AfnWrap`).hidden = !usd;
  if (usd) {
    if (!$(`#${p}Rate`).value) $(`#${p}Rate`).value = DB.settings.usdRate;
    $(`#${p}AfnEq`).textContent = fa(total * (+$(`#${p}Rate`).value || 0)) + ' ؋';
  }
}
function resetOrderForm() {
  $('#formNew').reset();
  $('#oQty').value = 1; $('#oPrice').value = 0; $('#oRec').value = 0; $('#oId').value = '';
  buildOrderFields('formHostNew');
}
function saveOrder(hostId) {
  const p = hostId === 'formHostNew' ? 'o' : 'eo';
  const job = $(`#${p}Job`).value.trim();
  const qty = +$(`#${p}Qty`).value || 0, price = +$(`#${p}Price`).value || 0, rec = +$(`#${p}Rec`).value || 0;
  const cur = $(`#${p}Cur`).value, rate = +$(`#${p}Rate`).value || 0;
  if (!job) return toast('نام کار ضروری است', 'err');
  if (qty <= 0 || price < 0) return toast('تعداد و قیمت را درست وارد کنید', 'err');
  if (cur === 'USD' && rate <= 0) return toast('نرخ دالر را دستی وارد کنید', 'err');
  const total = +(qty * price).toFixed(2);
  if (rec < 0 || rec > total) return toast('مبلغ رسیده معتبر نیست', 'err');

  const oId = $(`#${p}Id`).value;
  const existing = oId ? DB.orders.find(x => x.id === oId) : null;
  const cid = $(`#${p}CustSel`).value;
  let cust;
  if (cid) cust = DB.customers.find(x => x.id === cid);
  else if (existing) cust = DB.customers.find(x => x.id === existing.customerId);
  else {
    const name = prompt('نام مشتری جدید:');
    if (!name) return toast('نام مشتری ضروری است', 'err');
    const phone = prompt('شماره تماس:') || '';
    const type = $(`input[name="${hostId}_type"]:checked`)?.value || 'cash';
    cust = { id: uid(), code: 'C-' + (++DB.seq.customer), name: name.trim(), phone, type, address: '', note: '', d: jToday() };
    DB.customers.push(cust);
    addLog(`مشتری جدید «${cust.name}» را هنگام ثبت سفارش ایجاد کرد.`);
  }
  const rem = +(total - rec).toFixed(2);

  if (existing) {
    Object.assign(existing, {
      job, qty, price, currency: cur, rate: cur === 'USD' ? rate : existing.rate,
      total, received: rec, remaining: rem, color: $(`#${p}Color`).value,
      size: $(`#${p}Size`).value.trim(), material: $(`#${p}Mat`).value.trim(),
      pack: $(`#${p}Pack`).checked, note: $(`#${p}Note`).value.trim(),
    });
    DB.ledger = DB.ledger.filter(l => l.orderId !== oId || l.type !== 'debit');
    if (cust.type === 'credit' && rem > 0) {
      DB.ledger.push({ id: uid(), customerId: cust.id, orderId: oId, type: 'debit', currency: cur, amount: rem,
        rate: cur === 'USD' ? rate : null, afnEq: cur === 'USD' ? +(rem * rate).toFixed(2) : rem,
        babat: `سفارش ${existing.code} — ${job}`, d: existing.d });
    }
    addLog(`سفارش ${existing.code} را ویرایش کرد.`);
    toast('سفارش به‌روزرسانی شد');
  } else {
    const o = { id: uid(), code: 'SO-' + (++DB.seq.order), d: jToday(), job, customerId: cust.id,
      customerName: cust.name, ctype: cust.type, phone: cust.phone, qty, color: $(`#${p}Color`).value,
      size: $(`#${p}Size`).value.trim(), material: $(`#${p}Mat`).value.trim(), pack: $(`#${p}Pack`).checked,
      price, currency: cur, rate: cur === 'USD' ? rate : null, total, received: rec, remaining: rem,
      note: $(`#${p}Note`).value.trim(), delivery: null,
      status: (cust.type === 'cash' && rem === 0) ? 'settled' : 'new' };
    DB.orders.push(o);
    if (cust.type === 'credit' && rem > 0) {
      DB.ledger.push({ id: uid(), customerId: cust.id, orderId: o.id, type: 'debit', currency: cur, amount: rem,
        rate: cur === 'USD' ? rate : null, afnEq: cur === 'USD' ? +(rem * rate).toFixed(2) : rem,
        babat: `سفارش ${o.code} — ${job}`, d: jToday() });
    }
    addLog(`سفارش ${o.code} («${job}») را برای ${cust.name} ثبت کرد.`);
    toast(`سفارش ${faDigits(o.code)} ثبت شد`);
    resetOrderForm();
  }
  save();
  if (hostId === 'formHostNew') show('orders');
  else { closeModal('#modalOrder'); show(CURRENT); }
}
function renderOrders() {
  const q = ($('#orderSearch').value || '').trim();
  let list = [...DB.orders].sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  if (ORD_FILTER !== 'all') list = list.filter(o => o.status === ORD_FILTER);
  if (q) list = list.filter(o => (o.code + o.job + o.customerName + o.phone).includes(q));

  const chips = [['all', 'همه'], ['new', 'در جریان'], ['registered', 'ثبت شده'], ['settled', 'تصفیه شده']];
  $('#orderStatusChips').innerHTML = chips.map(c =>
    `<button class="chip ${ORD_FILTER === c[0] ? 'on' : ''}" data-filter="${c[0]}">${c[1]}</button>`).join('');
  $('#ordersCount').textContent = fa(list.length) + ' سفارش';

  $('#ordersBody').innerHTML = list.length ? list.map(o => `
    <tr>
      <td><b>${faDigits(o.code)}</b></td><td>${jStr(o.d)}</td><td>${esc(o.job)}</td><td>${esc(o.customerName)}</td>
      <td><span class="chip ${o.ctype === 'cash' ? 'chip-green' : 'chip-mag'}">${o.ctype === 'cash' ? 'نقدی' : 'نسیه'}</span></td>
      <td>${fa(o.qty)}</td>
      <td>${o.color === 'تک‌رنگ' ? '<span class="chip">تک‌رنگ</span>' : '<span class="chip chip-blue">چندرنگ</span>'}</td>
      <td>${faDigits(o.size || '—')}</td><td>${esc(o.material || '—')}</td>
      <td>${o.pack ? '<span class="chip chip-green">دارد</span>' : '<span class="chip">ندارد</span>'}</td>
      <td><b>${money(o.total, o.currency)}</b>${o.rate ? `<div class="muted">نرخ ${fa(o.rate)}</div>` : ''}</td>
      <td style="color:var(--green);font-weight:700">${money(o.received, o.currency)}</td>
      <td class="${o.remaining > 0 ? 'rem-pos' : 'rem-zero'}">${money(o.remaining, o.currency)}</td>
      <td><span class="chip ${orderBadgeClass(o)}">${orderStatus(o)}</span></td>
      <td><div class="ops">
        ${o.status !== 'settled' ? ibtn('settle-order', o.id, '✔', 'ok', 'تصفیه') : ''}
        ${o.status === 'new' ? ibtn('register-order', o.id, '◉', '', 'ثبت شده') : ''}
        ${ibtn('open-ledger-order', o.id, '📖', o.ctype === 'cash' ? 'dis' : 'mag', 'پا حساب')}
        ${ibtn('print-order', o.id, '🖨', '', 'پرینت')}
        ${ibtn('edit-order', o.id, '✎', '', 'ویرایش')}
        ${ibtn('view-order', o.id, '→', '', 'مشاهده')}
      </div></td>
    </tr>`).join('') : '<tr class="empty"><td colspan="15">سفارشی یافت نشد</td></tr>';
}
function viewOrder(id) {
  const o = DB.orders.find(x => x.id === id);
  openModal('#modalView');
  $('#mvTitle').textContent = 'سفارش ' + faDigits(o.code);
  $('#mvBody').innerHTML = `<div class="kv">
    <dt>شماره سفارش</dt><dd>${faDigits(o.code)}</dd>
    <dt>تاریخ</dt><dd>${jLong(o.d)}</dd>
    <dt>نام کار</dt><dd>${esc(o.job)}</dd>
    <dt>سفارش‌دهنده</dt><dd>${esc(o.customerName)} (${o.ctype === 'cash' ? 'نقدی' : 'نسیه'})</dd>
    <dt>تماس</dt><dd>${faDigits(o.phone || '—')}</dd>
    <dt>تعداد / رنگ</dt><dd>${fa(o.qty)} · ${o.color}</dd>
    <dt>سایز / جنس</dt><dd>${faDigits(o.size || '—')} · ${esc(o.material || '—')}</dd>
    <dt>جمع کل</dt><dd>${money(o.total, o.currency)}${o.rate ? ` (نرخ ${fa(o.rate)} — معادل ${fa(o.total * o.rate)} ؋)` : ''}</dd>
    <dt>رسیده</dt><dd style="color:var(--green)">${money(o.received, o.currency)}</dd>
    <dt>باقی‌مانده</dt><dd style="color:var(--red)">${money(o.remaining, o.currency)}</dd>
    <dt>وضعیت</dt><dd><span class="chip ${orderBadgeClass(o)}">${orderStatus(o)}</span></dd>
    <dt>توضیحات</dt><dd>${esc(o.note || '—')}</dd></div>`;
}
function editOrder(id) {
  const o = DB.orders.find(x => x.id === id);
  openModal('#modalOrder');
  $('#moTitle').textContent = 'ویرایش ' + faDigits(o.code);
  buildOrderFields('formHostEdit');
  $('#eoId').value = o.id; $('#eoJob').value = o.job; $('#eoCustSel').value = o.customerId;
  $('#eoQty').value = o.qty; $('#eoPrice').value = o.price; $('#eoRec').value = o.received;
  $('#eoCur').value = o.currency; if (o.rate) $('#eoRate').value = o.rate;
  $('#eoColor').value = o.color; $('#eoSize').value = o.size; $('#eoMat').value = o.material;
  $('#eoPack').checked = o.pack; $('#eoNote').value = o.note;
  onCustSelChange('formHostEdit'); updateCalc('formHostEdit');
}

/* ═══ ) مشتریان ═══ */
function renderCustomers() {
  const q = ($('#custSearch').value || '').trim();
  let list = DB.customers;
  if (CUST_FILTER === 'cash') list = list.filter(c => c.type === 'cash');
  if (CUST_FILTER === 'credit') list = list.filter(c => c.type === 'credit');
  if (q) list = list.filter(c => (c.name + c.code + c.phone + (c.address || '')).includes(q));

  const chips = [['all', 'همه'], ['cash', 'نقدی'], ['credit', 'نسیه']];
  $('#custTypeChips').innerHTML = chips.map(c =>
    `<button class="chip ${CUST_FILTER === c[0] ? 'on' : ''}" data-custfilter="${c[0]}">${c[1]}</button>`).join('');

  $('#custBody').innerHTML = list.length ? list.map(c => {
    const s = customerStats(c), rem = balAfnEq(s.bal);
    return `<tr>
      <td><b>${faDigits(c.code)}</b></td><td><b>${esc(c.name)}</b></td>
      <td>${faDigits(c.phone || '—')}</td><td>${esc(c.address || '—')}</td>
      <td><span class="chip ${c.type === 'cash' ? 'chip-green' : 'chip-mag'}">${c.type === 'cash' ? 'نقدی' : 'نسیه'}</span></td>
      <td>${fa(s.orders)}</td><td>${fa(s.totalBuy)} ؋</td><td>${fa(s.totalPaid)} ؋</td>
      <td class="${rem > 0 ? 'rem-pos' : 'rem-zero'}">${rem > 0 ? balText(s.bal) : 'تسویه'}</td>
      <td><div class="ops">
        ${ibtn('open-customer', c.id, '→', '', 'پرونده')}
        ${ibtn('edit-customer', c.id, '✎', '', 'ویرایش')}
        ${c.type === 'credit' ? ibtn('print-statement', c.id, '🖨', '', 'پرینت سوابق') : ''}
      </div></td></tr>`;
  }).join('') : '<tr class="empty"><td colspan="10">مشتری یافت نشد</td></tr>';
}
function openCustomerForm(cid = null) {
  openModal('#modalCust');
  $('#mcTitle').textContent = cid ? 'ویرایش مشتری' : 'مشتری جدید';
  $('#formCust').dataset.id = cid || '';
  if (cid) {
    const c = DB.customers.find(x => x.id === cid);
    $('#mcName').value = c.name; $('#mcPhone').value = c.phone;
    $('#mcAddr').value = c.address; $('#mcNote').value = c.note;
    $(`input[name="mcType"][value="${c.type}"]`).checked = true;
  } else {
    $('#formCust').reset();
    $('input[name="mcType"][value="cash"]').checked = true;
  }
}
function saveCustomerForm() {
  const id = $('#formCust').dataset.id;
  const name = $('#mcName').value.trim();
  if (!name) return toast('نام مشتری ضروری است', 'err');
  const type = $('input[name="mcType"]:checked').value;
  const data = { name, phone: $('#mcPhone').value.trim(), address: $('#mcAddr').value.trim(), note: $('#mcNote').value.trim(), type };
  if (id) {
    const c = DB.customers.find(x => x.id === id);
    Object.assign(c, data);
    DB.orders.filter(o => o.customerId === id).forEach(o => { o.customerName = name; o.ctype = type; o.phone = data.phone; });
    addLog(`مشتری «${name}» را ویرایش کرد.`);
    toast('به‌روزرسانی شد');
  } else {
    DB.customers.push({ id: uid(), code: 'C-' + (++DB.seq.customer), ...data, d: jToday() });
    addLog(`مشتری جدید «${name}» (${type === 'credit' ? 'نسیه' : 'نقدی'}) را ثبت کرد.`);
    toast('مشتری ثبت شد');
  }
  save(); closeModal('#modalCust'); show(CURRENT);
}
function renderCustomerDetail(cid) {
  const c = DB.customers.find(x => x.id === cid);
  if (!c) return show('customers');
  const s = customerStats(c), b = s.bal;
  $('#custTitle').textContent = c.name;
  $('#custMeta').innerHTML = `${faDigits(c.code)} · ${c.type === 'cash' ? 'نقدی' : 'نسیه'} · ${faDigits(c.phone || '—')}`;
  $('#btnEditCust').dataset.id = c.id;
  $('#btnPrintCust').dataset.id = c.id;

  $('#custBalRow').innerHTML = `
    <div class="mini"><div class="lbl">بدهکار افغانی</div><div class="num">${fa(b.afn)} ؋</div></div>
    <div class="mini"><div class="lbl">پرداخت افغانی</div><div class="num">${fa(b.afnPaid)} ؋</div></div>
    <div class="mini"><div class="lbl">بدهکار دالر</div><div class="num">${fa(b.usd)} $</div></div>
    <div class="mini"><div class="lbl">پرداخت دالر</div><div class="num">${fa(b.usdPaid)} $</div></div>
    <div class="mini"><div class="lbl">مانده کل (معادل ؋)</div><div class="num" style="color:${balAfnEq(b) > 0 ? 'var(--red)' : 'var(--green)'}">${fa(balAfnEq(b))} ؋</div></div>
    <div class="mini"><div class="lbl">مجموع خرید</div><div class="num">${fa(s.totalBuy)} ؋</div></div>`;

  const os = DB.orders.filter(o => o.customerId === cid).sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  $('#custOrdersBody').innerHTML = os.length ? os.map(o => `
    <tr><td><b>${faDigits(o.code)}</b></td><td>${jStr(o.d)}</td><td>${esc(o.job)}</td>
      <td>${money(o.total, o.currency)}</td>
      <td class="${o.remaining > 0 ? 'rem-pos' : 'rem-zero'}">${money(o.remaining, o.currency)}</td>
      <td><span class="chip ${orderBadgeClass(o)}">${orderStatus(o)}</span></td>
      <td>${ibtn('print-order', o.id, '🖨', '', 'پرینت سفارش')}</td></tr>`).join('')
    : '<tr class="empty"><td colspan="7">سفارشی ندارد</td></tr>';

  const ls = DB.ledger.filter(l => l.customerId === cid).sort((a, b) => jdnOf(a.d) - jdnOf(b.d));
  let run = 0;
  $('#custLedgerBody').innerHTML = ls.length ? ls.map(l => {
    run += l.type === 'debit' ? l.afnEq : -l.afnEq;
    return `<tr><td>${jStr(l.d)}</td><td>${esc(l.babat)}</td>
      <td><span class="chip ${l.type === 'debit' ? 'chip-red' : 'chip-green'}">${l.type === 'debit' ? 'بدهکار' : 'پرداخت'}</span></td>
      <td>${money(l.amount, l.currency)}</td><td>${l.rate ? fa(l.rate) : '—'}</td>
      <td><b>${fa(run)} ؋</b></td></tr>`;
  }).join('') : '<tr class="empty"><td colspan="6">تراکنشی ندارد</td></tr>';

  /* رسیدهای جداگانهٔ این مشتری */
  const rs = DB.receipts.filter(r => r.customerId === cid).sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  const tA = rs.filter(r => r.currency === 'AFN').reduce((s, r) => s + r.amount, 0);
  const tU = rs.filter(r => r.currency === 'USD').reduce((s, r) => s + r.amount, 0);
  $('#custReceiptsSection').innerHTML = `
    <div class="card-h"><h3>📄 رسیدهای این مشتری (${fa(rs.length)})</h3>
      ${rs.length ? `<span class="chip chip-blue">مجموع: ${fa(tA)} ؋${tU ? ' + ' + fa(tU) + ' $' : ''}</span>` : ''}</div>
    ${rs.length ? `<div class="tscroll"><table class="tbl">
      <thead><tr><th>شماره رسید</th><th>تاریخ</th><th>مبلغ</th><th>واحد</th><th>نرخ دالر</th><th>معادل ؋</th><th>بابت</th><th>سفارش</th><th>چاپ</th></tr></thead>
      <tbody>${rs.map(r => `<tr>
        <td><b>${faDigits(r.code)}</b></td><td>${jStr(r.d)}</td>
        <td><b>${money(r.amount, r.currency)}</b></td>
        <td>${r.currency === 'USD' ? 'دالر' : 'افغانی'}</td>
        <td>${r.rate ? fa(r.rate) : '—'}</td><td>${fa(r.afnEq)} ؋</td>
        <td>${esc(r.babat)}</td>
        <td>${r.orderId ? faDigits(DB.orders.find(o => o.id === r.orderId)?.code || '—') : '—'}</td>
        <td>${ibtn('print-receipt', r.id, '🖨', '', 'چاپ رسید')}</td></tr>`).join('')}</tbody></table></div>`
      : '<div class="empty-plain">هنوز رسیدی برای این مشتری ثبت نشده است</div>'}`;
}

/* ═══ ) پا حساب ═══ */
function renderLedger() {
  const ls = [...DB.ledger].sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  $('#ledgerBody').innerHTML = ls.length ? ls.map(l => {
    const c = DB.customers.find(x => x.id === l.customerId);
    return `<tr><td>${jStr(l.d)}</td>
      <td><b>${esc(c?.name || '—')}</b><div class="muted">${faDigits(c?.code || '')}</div></td>
      <td>${l.orderId ? faDigits(DB.orders.find(o => o.id === l.orderId)?.code || '—') : '—'}</td>
      <td>${esc(l.babat)}</td>
      <td><span class="chip ${l.type === 'debit' ? 'chip-red' : 'chip-green'}">${l.type === 'debit' ? 'بدهکار' : 'پرداخت'}</span></td>
      <td><b>${money(l.amount, l.currency)}</b></td>
      <td>${l.rate ? fa(l.rate) : '—'}</td>
      <td>${l.rate ? fa(l.afnEq) + ' ؋' : '—'}</td>
      <td><div class="ops">${c ? ibtn('open-customer', c.id, '→', '', 'پرونده') : ''}</div></td></tr>`;
  }).join('') : '<tr class="empty"><td colspan="9">رکوردی در پا حساب نیست</td></tr>';
}

/* ═══ ۱۰) رسید نسیه ═══ */
function initReceiptForm() {
  $('#rDate').textContent = jLong(jToday());
  const credits = DB.customers.filter(c => c.type === 'credit');
  $('#rCust').innerHTML = '<option value="">انتخاب...</option>' + credits.map(c => `<option value="${c.id}">${esc(c.name)} (${faDigits(c.code)})</option>`).join('');
  $('#rOrderSel').innerHTML = '<option value="">—</option>';
  updateReceiptCalc();
  renderReceiptsList();
}
function updateReceiptOrders() {
  const cid = $('#rCust').value;
  const sel = $('#rOrderSel');
  if (!cid) { sel.innerHTML = '<option value="">—</option>'; return; }
  const open = DB.orders.filter(o => o.customerId === cid && o.remaining > 0);
  sel.innerHTML = '<option value="">— بدون اتصال —</option>' +
    open.map(o => `<option value="${o.id}">${faDigits(o.code)} — ${esc(o.job)} (باقی ${money(o.remaining, o.currency)})</option>`).join('');
}
function updateReceiptCalc() {
  const cur = $('#rCur').value, amt = +$('#rAmount').value || 0;
  $('#rRateWrap').hidden = cur !== 'USD'; $('#rAfnWrap').hidden = cur !== 'USD';
  if (cur === 'USD' && !$('#rRate').value) $('#rRate').value = DB.settings.usdRate;
  $('#rAfnEq').value = cur === 'USD' ? fa(amt * (+$('#rRate').value || 0)) + ' ؋' : '';
  const b = $('#rCust').value ? balancesOf($('#rCust').value) : { afn: 0, usd: 0 };
  $('#rBalNow').textContent = balText(b);
  $('#rBalAfter').textContent = balText({ afn: b.afn - (cur === 'AFN' ? amt : 0), usd: b.usd - (cur === 'USD' ? amt : 0) });
}
function renderReceiptsList() {
  const rs = [...DB.receipts].sort((a, b) => jdnOf(b.d) - jdnOf(a.d)).slice(0, 15);
  $('#receiptsBody').innerHTML = rs.length ? rs.map(r => {
    const c = DB.customers.find(x => x.id === r.customerId);
    return `<tr><td><b>${faDigits(r.code)}</b></td><td>${jStr(r.d)}</td><td>${esc(c?.name || '—')}</td>
      <td>${money(r.amount, r.currency)}${r.rate ? `<div class="muted">نرخ ${fa(r.rate)}</div>` : ''}</td>
      <td>${ibtn('print-receipt', r.id, '🖨', '', 'چاپ')}</td></tr>`;
  }).join('') : '<tr class="empty"><td colspan="5">رسیدی ثبت نشده</td></tr>';
}
function saveReceipt() {
  const cid = $('#rCust').value;
  if (!cid) return toast('مشتری را انتخاب کنید', 'err');
  const c = DB.customers.find(x => x.id === cid);
  if (c.type !== 'credit') return toast('این مشتری نقدی است', 'err');
  const cur = $('#rCur').value, amt = +$('#rAmount').value || 0;
  const rate = cur === 'USD' ? (+$('#rRate').value || 0) : null;
  if (amt <= 0) return toast('مبلغ را وارد کنید', 'err');
  if (cur === 'USD' && rate <= 0) return toast('نرخ دالر را دستی وارد کنید', 'err');
  const orderId = $('#rOrderSel').value || null;
  const r = { id: uid(), code: 'R-' + (++DB.seq.receipt), customerId: cid, d: jToday(), currency: cur, amount: amt,
    rate, afnEq: cur === 'USD' ? +(amt * rate).toFixed(2) : amt, babat: $('#rBabat').value.trim() || 'دریافت وجه', orderId };
  DB.receipts.push(r);
  DB.ledger.push({ id: uid(), customerId: cid, orderId, type: 'credit', currency: cur, amount: amt, rate,
    afnEq: r.afnEq, babat: `رسید ${r.code} — ${r.babat}`, d: jToday() });
  if (orderId) {
    const o = DB.orders.find(x => x.id === orderId);
    if (o && o.currency === cur) { o.received = +(o.received + amt).toFixed(2); o.remaining = Math.max(0, +(o.total - o.received).toFixed(2)); }
  }
  addLog(`مبلغ ${money(amt, cur)} از مشتری ${c.name} دریافت کرد (رسید ${r.code}).`);
  save();
  printReceipt(r, c, balancesOf(cid));
  toast(`رسید ${faDigits(r.code)} ثبت شد`);
  $('#rAmount').value = ''; $('#rBabat').value = ''; $('#rOrderSel').innerHTML = '<option value="">—</option>';
  updateReceiptCalc(); renderReceiptsList();
}

/* ═══ ۱) گدام ═══ */
function renderStock() {
  const agg = stockAgg();
  $('#stockSum').innerHTML = `
    <div class="mini"><div class="lbl">اقلام</div><div class="num">${fa(agg.length)}</div></div>
    <div class="mini"><div class="lbl">آورندگان</div><div class="num">${fa(new Set(DB.stock.map(m => m.person)).size)}</div></div>
    <div class="mini"><div class="lbl">رکوردهای ورودی</div><div class="num">${fa(DB.stock.filter(m => m.kind === 'in').length)}</div></div>
    <div class="mini"><div class="lbl">رکوردهای خروجی</div><div class="num">${fa(DB.stock.filter(m => m.kind === 'out').length)}</div></div>`;
  $('#stockBody').innerHTML = agg.length ? agg.map(r => `
    <tr><td><b>${esc(r.person)}</b></td><td>${esc(r.item)}</td>
      <td><span class="chip ${r.cat === 'کاغذی' ? 'chip-blue' : 'chip-amber'}">${r.cat}</span></td>
      <td>${faDigits(r.size || '—')}</td><td>${r.unit}</td>
      <td>${fa(r.tin)}</td><td>${fa(r.tout)}</td>
      <td style="font-weight:800;color:${r.bal > 0 ? 'var(--green)' : 'var(--red)'}">${fa(r.bal)} ${r.unit}</td>
      <td>${ibtn('view-provider', encodeURIComponent(r.person), '→', '', 'پرونده آورنده')}</td></tr>`).join('')
    : '<tr class="empty"><td colspan="9">گدام خالی است</td></tr>';
}
function initStockIn() {
  $('#siDate').textContent = jLong(jToday());
  fillDatalists();
  $('#siSizeWrap').style.display = $('#siCat').value === 'کاغذی' ? '' : 'none';
}
function saveStockIn() {
  const person = $('#siPerson').value.trim(), item = $('#siItem').value.trim(), qty = +$('#siQty').value || 0;
  if (!person || !item) return toast('آورنده و جنس ضروری است', 'err');
  if (qty <= 0) return toast('مقدار معتبر وارد کنید', 'err');
  const cat = $('#siCat').value, size = cat === 'کاغذی' ? $('#siSize').value.trim() : '';
  const m = { id: uid(), kind: 'in', person, cat, item, qty, unit: $('#siUnit').value, size, d: jToday(), note: $('#siNote').value.trim() };
  DB.stock.push(m);
  addLog(`مقدار ${fa(qty)} ${m.unit} «${item}» را برای ${person} وارد گدام کرد.`);
  save(); fillDatalists();
  printStockSheet(m, stockBal(person, item, size, m.unit));
  toast('ورودی ثبت شد');
  $('#siItem').value = ''; $('#siQty').value = ''; $('#siNote').value = '';
}
function initStockOut() {
  $('#soDate').textContent = jLong(jToday());
  $('#soPerson').innerHTML = '<option value="">انتخاب...</option>' + [...new Set(DB.stock.map(m => m.person))].map(p => `<option>${esc(p)}</option>`).join('');
  fillSoItems();
}
function fillSoItems() {
  const person = $('#soPerson').value, cat = $('#soCat').value;
  const agg = stockAgg().filter(r => r.person === person && r.cat === cat && r.bal > 0);
  $('#soItem').innerHTML = '<option value="">—</option>' + agg.map(r =>
    `<option value="${esc(r.item)}" data-size="${esc(r.size)}" data-unit="${esc(r.unit)}" data-bal="${r.bal}">${esc(r.item)}${r.size ? ' — ' + faDigits(r.size) : ''} (موجودی ${fa(r.bal)} ${r.unit})</option>`).join('');
  updateSoAvail();
}
function updateSoAvail() {
  const opt = $('#soItem').selectedOptions[0];
  if (!opt || !opt.value) { $('#soAvail').value = ''; $('#soUnit').value = ''; return; }
  $('#soAvail').value = `${fa(opt.dataset.bal)} ${opt.dataset.unit}`;
  $('#soUnit').value = opt.dataset.unit;
}
function saveStockOut() {
  const person = $('#soPerson').value, item = $('#soItem').value, qty = +$('#soQty').value || 0;
  if (!person || !item) return toast('آورنده و جنس را انتخاب کنید', 'err');
  if (qty <= 0) return toast('مقدار معتبر وارد کنید', 'err');
  const opt = $('#soItem').selectedOptions[0];
  const bal = +opt.dataset.bal, size = opt.dataset.size, unit = opt.dataset.unit, cat = $('#soCat').value;
  if (qty > bal) return toast(`موجودی کافی نیست! فقط ${fa(bal)} ${unit} موجود است`, 'err');
  const m = { id: uid(), kind: 'out', person, cat, item, qty, unit, size, d: jToday(), note: $('#soNote').value.trim() };
  DB.stock.push(m);
  addLog(`مقدار ${fa(qty)} ${unit} «${item}» را از گدام خارج کرد.`);
  save();
  printStockSheet(m, stockBal(person, item, size, unit));
  toast('خروجی ثبت شد');
  $('#soQty').value = ''; $('#soNote').value = ''; fillSoItems();
}
function viewProvider(name) {
  name = decodeURIComponent(name);
  const agg = stockAgg().filter(r => r.person === name);
  const ms = DB.stock.filter(m => m.person === name).sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  openModal('#modalView');
  $('#mvTitle').textContent = 'پرونده ' + name;
  $('#mvBody').innerHTML = `
    <div class="card-h"><h3>خلاصه موجودی</h3></div>
    <table class="tbl"><thead><tr><th>جنس</th><th>نوع</th><th>سایز</th><th>ورودی</th><th>خروجی</th><th>موجودی</th></tr></thead><tbody>
    ${agg.map(r => `<tr><td>${esc(r.item)}</td><td>${r.cat}</td><td>${faDigits(r.size || '—')}</td>
      <td>${fa(r.tin)} ${r.unit}</td><td>${fa(r.tout)} ${r.unit}</td>
      <td style="font-weight:800;color:${r.bal > 0 ? 'var(--green)' : 'var(--red)'}">${fa(r.bal)} ${r.unit}</td></tr>`).join('')}</tbody></table>
    <div class="card-h" style="margin-top:20px"><h3>تاریخچه</h3></div>
    <table class="tbl"><thead><tr><th>تاریخ</th><th>نوع</th><th>جنس</th><th>مقدار</th><th>توضیحات</th></tr></thead><tbody>
    ${ms.map(m => `<tr><td>${jStr(m.d)}</td><td><span class="chip ${m.kind === 'in' ? 'chip-green' : 'chip-red'}">${m.kind === 'in' ? 'ورودی' : 'خروجی'}</span></td>
      <td>${esc(m.item)}</td><td><b>${fa(m.qty)} ${m.unit}</b></td><td>${esc(m.note || '—')}</td></tr>`).join('')}</tbody></table>`;
}

/* ═══ ۱۲) دریافت‌ها ═══ */
function renderReceived() {
  const rs = [...DB.receipts].sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  $('#receivedSum').innerHTML = `
    <div class="mini"><div class="lbl">تعداد رسیدها</div><div class="num">${fa(rs.length)}</div></div>
    <div class="mini"><div class="lbl">مجموع افغانی</div><div class="num">${fa(rs.filter(r => r.currency === 'AFN').reduce((s, r) => s + r.amount, 0))} ؋</div></div>
    <div class="mini"><div class="lbl">مجموع دالر</div><div class="num">${fa(rs.filter(r => r.currency === 'USD').reduce((s, r) => s + r.amount, 0))} $</div></div>
    <div class="mini"><div class="lbl">معادل افغانی کل</div><div class="num">${fa(rs.reduce((s, r) => s + r.afnEq, 0))} ؋</div></div>`;
  $('#receivedBody').innerHTML = rs.length ? rs.map(r => {
    const c = DB.customers.find(x => x.id === r.customerId);
    return `<tr><td><b>${faDigits(r.code)}</b></td><td>${jStr(r.d)}</td><td>${esc(c?.name || '—')}</td><td>${esc(r.babat)}</td>
      <td><b>${money(r.amount, r.currency)}</b></td><td>${r.rate ? fa(r.rate) : '—'}</td><td>${fa(r.afnEq)} ؋</td>
      <td>${ibtn('print-receipt', r.id, '🖨', '', 'چاپ')}</td></tr>`;
  }).join('') : '<tr class="empty"><td colspan="8">رسیدی نیست</td></tr>';
}

/* ═══ ۱۳) پرداخت پول ═══ */
function initPayForm() {
  $('#pDate').textContent = jLong(jToday());
  updatePayCalc(); renderPaysList();
}
function updatePayCalc() {
  const cur = $('#pCur').value, amt = +$('#pAmount').value || 0;
  $('#pRateWrap').hidden = cur !== 'USD'; $('#pAfnWrap').hidden = cur !== 'USD';
  if (cur === 'USD' && !$('#pRate').value) $('#pRate').value = DB.settings.usdRate;
  $('#pAfnEq').value = cur === 'USD' ? fa(amt * (+$('#pRate').value || 0)) + ' ؋' : '';
}
function savePayment() {
  const babat = $('#pBabat').value.trim(), amt = +$('#pAmount').value || 0;
  const cur = $('#pCur').value, rate = cur === 'USD' ? (+$('#pRate').value || 0) : null;
  if (!babat) return toast('بابت را وارد کنید', 'err');
  if (amt <= 0) return toast('مبلغ را وارد کنید', 'err');
  if (cur === 'USD' && rate <= 0) return toast('نرخ دالر را دستی وارد کنید', 'err');
  const p = { id: uid(), code: 'P-' + (++DB.seq.pay), babat, checkNo: $('#pCheck').value.trim(), d: jToday(),
    currency: cur, amount: amt, rate, afnEq: cur === 'USD' ? +(amt * rate).toFixed(2) : amt, note: $('#pNote').value.trim() };
  DB.payments.push(p);
  addLog(`سند پرداخت ${p.code} بابت «${babat}» صادر کرد.`);
  save(); printPayment(p);
  toast('سند صادر شد');
  $('#pBabat').value = ''; $('#pCheck').value = ''; $('#pAmount').value = ''; $('#pNote').value = '';
  renderPaysList();
}
function renderPaysList() {
  const ps = [...DB.payments].sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  $('#paysBody').innerHTML = ps.length ? ps.map(p => `
    <tr><td><b>${faDigits(p.code)}</b></td><td>${jStr(p.d)}</td><td>${esc(p.babat)}</td>
      <td>${faDigits(p.checkNo || '—')}</td>
      <td>${money(p.amount, p.currency)}${p.rate ? `<div class="muted">نرخ ${fa(p.rate)}</div>` : ''}</td>
      <td>${ibtn('print-payment', p.id, '🖨', '', 'چاپ سند')}</td></tr>`).join('')
    : '<tr class="empty"><td colspan="6">سندی نیست</td></tr>';
}

/* ═══ ۱۴) گزارش مالی ═══ */
function renderFinance() {
  const tAfn = DB.receipts.filter(r => r.currency === 'AFN').reduce((s, r) => s + r.amount, 0);
  const tUsd = DB.receipts.filter(r => r.currency === 'USD').reduce((s, r) => s + r.amount, 0);
  const tRec = DB.receipts.reduce((s, r) => s + r.afnEq, 0);
  const tPay = DB.payments.reduce((s, p) => s + p.afnEq, 0);
  let debt = 0;
  DB.customers.filter(c => c.type === 'credit').forEach(c => { const v = balAfnEq(balancesOf(c.id)); if (v > 0) debt += v; });

  $('#finChips').innerHTML = `
    <div class="mini"><div class="lbl">دریافت افغانی</div><div class="num">${fa(tAfn)} ؋</div></div>
    <div class="mini"><div class="lbl">دریافت دالر</div><div class="num">${fa(tUsd)} $</div></div>
    <div class="mini"><div class="lbl">کل دریافت (معادل ؋)</div><div class="num">${fa(tRec)} ؋</div></div>
    <div class="mini"><div class="lbl">کل پرداخت (معادل ؋)</div><div class="num">${fa(tPay)} ؋</div></div>
    <div class="mini"><div class="lbl">مجموع طلب نسیه</div><div class="num" style="color:var(--red)">${fa(debt)} ؋</div></div>`;
  drawFinChart();

  const credits = DB.customers.filter(c => c.type === 'credit');
  $('#debtBody').innerHTML = credits.map(c => {
    const b = balancesOf(c.id);
    return `<tr><td><b>${esc(c.name)}</b><div class="muted">${faDigits(c.code)}</div></td>
      <td>${fa(b.afn)} ؋</td><td>${fa(b.afnPaid)} ؋</td><td>${fa(b.usd)} $</td><td>${fa(b.usdPaid)} $</td>
      <td style="font-weight:800;color:${balAfnEq(b) > 0 ? 'var(--red)' : 'var(--green)'}">${fa(balAfnEq(b))} ؋</td>
      <td>${ibtn('open-customer', c.id, '→', '', 'پرونده')}</td></tr>`;
  }).join('') || '<tr class="empty"><td colspan="7">مشتری نسیه‌ای ثبت نشده</td></tr>';
}
function drawFinChart() {
  const t = jToday(), months = [];
  for (let i = 5; i >= 0; i--) {
    let m = t.jm - i, y = t.jy;
    while (m < 1) { m += 12; y -= 1; }
    const rec = DB.receipts.filter(r => r.d.jy === y && r.d.jm === m).reduce((s, r) => s + r.afnEq, 0);
    const pay = DB.payments.filter(p => p.d.jy === y && p.d.jm === m).reduce((s, p) => s + p.afnEq, 0);
    months.push({ lbl: MONTHS[m - 1].slice(0, 3), rec, pay });
  }
  const cv = $('#finBar'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width * dpr; cv.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(...months.flatMap(m => [m.rec, m.pay]), 1);
  const chartH = h - 30, groupW = (w - 40) / months.length, barW = groupW / 2 - 4;
  const txt = getComputedStyle(document.body).getPropertyValue('--txt2').trim();
  ctx.font = '11px Vazirmatn'; ctx.textAlign = 'center';
  months.forEach((m, i) => {
    const x = 20 + i * groupW;
    ctx.fillStyle = '#2f9e63'; ctx.fillRect(x, chartH - (m.rec / max) * chartH, barW, (m.rec / max) * chartH);
    ctx.fillStyle = '#d64545'; ctx.fillRect(x + barW + 4, chartH - (m.pay / max) * chartH, barW, (m.pay / max) * chartH);
    ctx.fillStyle = txt; ctx.fillText(m.lbl, x + groupW / 2, chartH + 14);
  });
}

/* ═══ ۵) کاربران ═══ */
function renderUsers() {
  $('#usersBody').innerHTML = DB.users.map(u => `
    <tr><td><b>${esc(u.name)}</b></td><td>${esc(u.username)}</td>
      <td><span class="chip chip-blue">${ROLE_DEFS[u.role].name}</span></td>
      <td><span class="chip ${u.active ? 'chip-green' : 'chip-red'}">${u.active ? 'فعال' : 'غیرفعال'}</span></td>
      <td><div class="ops">
        ${ibtn('edit-user', u.id, '✎', '', 'ویرایش کاربر')}
        ${u.id !== USER.id ? ibtn('toggle-user', u.id, u.active ? '✕' : '✔', u.active ? 'danger' : 'ok', u.active ? 'غیرفعال' : 'فعال') : ''}
      </div></td></tr>`).join('');
}
function saveUser() {
  const name = $('#ufName').value.trim(), username = $('#ufUser').value.trim(), pass = $('#ufPass').value;
  if (!name || !username || !pass) return toast('همه فیلدها ضروری است', 'err');
  if (DB.users.some(u => u.username === username)) return toast('نام کاربری تکراری است', 'err');
  DB.users.push({ id: uid(), name, username, pass, role: $('#ufRole').value, active: true });
  addLog(`کاربر «${name}» را ایجاد کرد.`);
  save(); $('#userForm').reset(); renderUsers(); toast('کاربر اضافه شد');
}
function editUserForm(id) {
  const u = DB.users.find(x => x.id === id);
  if (!u) return;
  openModal('#modalUser');
  $('#muTitle').textContent = 'ویرایش کاربر: ' + u.name;
  $('#formUser').dataset.id = id;
  $('#euName').value = u.name; $('#euUser').value = u.username; $('#euPass').value = u.pass;
  $('#euRole').value = u.role;
  $(`input[name="euActive"][value="${u.active}"]`).checked = true;
}
function saveUserEdit(id) {
  const u = DB.users.find(x => x.id === id);
  if (!u) return;
  const name = $('#euName').value.trim(), username = $('#euUser').value.trim(), pass = $('#euPass').value;
  const role = $('#euRole').value, active = $('input[name="euActive"]:checked').value === 'true';
  if (!name || !username || !pass) return toast('همه فیلدها ضروری است', 'err');
  if (u.id === USER.id && !active) return toast('نمی‌توانید خودتان را غیرفعال کنید', 'err');
  if (DB.users.some(x => x.id !== id && x.username === username)) return toast('این نام کاربری قبلاً استفاده شده', 'err');
  Object.assign(u, { name, username, pass, role, active });
  addLog(`کاربر «${name}» را ویرایش کرد.`);
  save(); closeModal('#modalUser'); renderUsers(); toast('کاربر به‌روزرسانی شد');
}

/* ═══ ۱۶) تنظیمات + رمز ═══ */
const authOn = () => DB.settings.authEnabled === true;

function renderSettings() {
  $('#shopName').value = DB.settings.shopName;
  $('#shopAddr').value = DB.settings.shopAddr;
  $('#logBody').innerHTML = DB.log.map(l => `
    <tr><td>${jStr(l.d)}</td><td>${l.time}</td><td><b>${esc(l.user)}</b></td><td>${esc(l.text)}</td></tr>`).join('')
    || '<tr class="empty"><td colspan="4">خالی</td></tr>';

  const on = authOn();
  $('#authStatus').innerHTML = on
    ? '<span class="chip chip-green">🔒 ورود با رمز فعال است</span>'
    : '<span class="chip chip-amber">🔓 ورود آزاد (بدون رمز)</span>';
  $('#authHint').textContent = on
    ? 'برای ورود باید نام کاربری و رمز را وارد کنید. برای تغییر رمز، مقادیر جدید را نوشته و دوباره «فعال‌سازی» را بزنید.'
    : 'فعلاً بدون رمز وارد می‌شوید. نام کاربری و رمز دلخواه خود را بنویسید و «فعال‌سازی» را بزنید تا از دفعهٔ بعد ورود با رمز الزامی شود.';
  $('#btnDisableAuth').style.display = on ? '' : 'none';
  $('#authUser').value = ''; $('#authPass').value = '';
}

/* ═══ ۷) موتور چاپ ══ */
function printDoc(title, bodyHtml) {
  const s = DB.settings, t = jToday();
  const html = `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Vazirmatn',Tahoma;font-size:13px;color:#14181f;padding:10mm}
    .paper{max-width:190mm;margin:0 auto;padding:14px}
    .cmyk{display:flex;height:8px;margin-bottom:16px}
    .cmyk i{flex:1}.cmyk i:nth-child(1){background:#00a6c8}.cmyk i:nth-child(2){background:#e23d8a}.cmyk i:nth-child(3){background:#f2b707}.cmyk i:nth-child(4){background:#1a212c}
    .p-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #14181f;padding-bottom:12px;margin-bottom:14px}
    .p-head h1{font-family:'Lalezar';font-size:27px;line-height:1}
    .p-head p{font-size:12.5px;color:#4b5563;margin-top:2px}
    .p-no{text-align:left;font-size:12.5px;line-height:2}
    .p-title{text-align:center;font-size:17px;font-weight:700;margin:12px 0;letter-spacing:1px}
    .p-table{width:100%;border-collapse:collapse;margin-bottom:14px}
    .p-table th,.p-table td{border:1px solid #cfd6df;padding:8px 12px;text-align:right;font-size:12.5px}
    .p-table th{background:#f3f5f8;font-weight:800}
    .kv{display:grid;grid-template-columns:140px 1fr;gap:6px 12px;font-size:13px;margin:12px 0}
    .kv dt{font-weight:700;color:#333}.kv dd{font-weight:600}
    .p-money{display:flex;gap:12px;justify-content:flex-end;margin:16px 0;flex-wrap:wrap}
    .p-money div{border:1.5px solid #14181f;border-radius:9px;padding:8px 18px;font-size:12.5px;text-align:center;min-width:120px}
    .p-money .rem{background:#14181f;color:#fff}
    .big-amt{font-family:'Lalezar';font-size:30px;text-align:center;border:2px dashed #333;border-radius:10px;padding:12px;margin:16px 0}
    .sig{display:flex;justify-content:space-between;margin-top:40px}
    .sig div{width:160px;text-align:center;border-top:1.5px solid #333;padding-top:6px;font-size:11px}
    footer{display:flex;justify-content:space-between;border-top:1.5px dashed #9aa4b2;padding-top:14px;font-size:12px;color:#4b5563;margin-top:20px}
    @page{margin:10mm}
  </style></head><body><div class="paper">
  <div class="cmyk"><i></i><i></i><i></i><i></i></div>
  <div class="p-head">
    <div><h1 style="font-family:'Lalezar'">${esc(s.shopName)}</h1><p>${esc(s.shopAddr)}</p></div>
    <div class="p-no">تاریخ: ${jLong(t)}<br>وقت: ${nowTime()}</div>
  </div>
  ${bodyHtml}
  <footer><span>${esc(s.footer)}</span><span>${esc(s.shopName)}</span></footer>
  </div></body></html>`;
  const w = window.open('', '_blank', 'width=860,height=920');
  if (!w) return toast('مرورگر اجازهٔ چاپ نداد', 'err');
  w.document.write(html); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch { } }, 600);
}
function printReceipt(r, c, bal) {
  printDoc('رسید', `
    <div class="p-title">رسید دریافت وجه — ${faDigits(r.code)}</div>
    <div class="kv">
      <dt>نام مشتری</dt><dd>${esc(c.name)} (${faDigits(c.code)})</dd>
      <dt>تاریخ</dt><dd>${jLong(r.d)}</dd>
      <dt>بابت</dt><dd>${esc(r.babat)}</dd>
      ${r.orderId ? `<dt>سفارش مرتبط</dt><dd>${faDigits(DB.orders.find(o => o.id === r.orderId)?.code || '—')}</dd>` : ''}
      <dt>واحد پولی</dt><dd>${r.currency === 'USD' ? 'دالر ($)' : 'افغانی (؋)'}</dd>
      ${r.rate ? `<dt>نرخ دالر</dt><dd>${fa(r.rate)} ؋</dd><dt>معادل افغانی</dt><dd>${fa(r.afnEq)} ؋</dd>` : ''}
      <dt>مانده حساب</dt><dd><b>${balText(bal)}</b></dd>
    </div>
    <div class="big-amt">مبلغ دریافتی: ${money(r.amount, r.currency)}</div>
    <div class="sig"><div>تحویل‌گیرنده</div><div>تحویل‌دهنده</div><div>مهر چاپخانه</div></div>`);
}
function printStockSheet(m, bal) {
  const isIn = m.kind === 'in';
  printDoc(isIn ? 'برگه ورودی' : 'برگه خروجی', `
    <div class="p-title">${isIn ? 'برگه ورودی جنس به گدام' : 'برگه خروجی جنس از گدام'}</div>
    <div class="kv">
      <dt>${isIn ? 'آورنده' : 'خارج‌کننده'}</dt><dd>${esc(m.person)}</dd>
      <dt>تاریخ</dt><dd>${jLong(m.d)}</dd>
      <dt>نوع جنس</dt><dd>${m.cat}</dd>
      <dt>نام جنس</dt><dd>${esc(m.item)}</dd>
      ${m.size ? `<dt>سایز</dt><dd>${faDigits(m.size)}</dd>` : ''}
      ${m.note ? `<dt>توضیحات</dt><dd>${esc(m.note)}</dd>` : ''}
    </div>
    <div class="big-amt">مقدار: ${fa(m.qty)} ${m.unit}</div>
    <p style="text-align:center">موجودی باقی‌مانده: <b>${fa(bal)} ${m.unit}</b></p>
    <div class="sig"><div>مسئول گدام</div><div>تحویل‌دهنده</div><div>تحویل‌گیرنده</div></div>`);
}
function printPayment(p) {
  printDoc('سند پرداخت', `
    <div class="p-title">سند پرداخت پول — ${faDigits(p.code)}</div>
    <div class="kv">
      <dt>مرجع / بابت</dt><dd>${esc(p.babat)}</dd>
      <dt>تاریخ</dt><dd>${jLong(p.d)}</dd>
      ${p.checkNo ? `<dt>شماره چک</dt><dd>${faDigits(p.checkNo)}</dd>` : ''}
      <dt>واحد پولی</dt><dd>${p.currency === 'USD' ? 'دالر ($)' : 'افغانی (؋)'}</dd>
      ${p.rate ? `<dt>نرخ دالر</dt><dd>${fa(p.rate)} ؋</dd><dt>معادل افغانی</dt><dd>${fa(p.afnEq)} ؋</dd>` : ''}
      ${p.note ? `<dt>توضیحات</dt><dd>${esc(p.note)}</dd>` : ''}
    </div>
    <div class="big-amt">مبلغ: ${money(p.amount, p.currency)}</div>
    <div class="sig"><div>صادرکننده</div><div>تأیید مدیر</div><div>دریافت‌کننده</div></div>`);
}
function printOrder(o) {
  printDoc('سفارش', `
    <div class="p-title">برگه سفارش — ${faDigits(o.code)}</div>
    <div class="kv">
      <dt>تاریخ</dt><dd>${jLong(o.d)}</dd>
      <dt>سفارش‌دهنده</dt><dd>${esc(o.customerName)} (${o.ctype === 'cash' ? 'نقدی' : 'نسیه'})</dd>
      <dt>تماس</dt><dd>${faDigits(o.phone || '—')}</dd>
      <dt>نام کار</dt><dd>${esc(o.job)}</dd>
      <dt>تعداد / رنگ</dt><dd>${fa(o.qty)} · ${o.color}</dd>
      <dt>سایز / جنس</dt><dd>${faDigits(o.size || '—')} · ${esc(o.material || '—')}</dd>
    </div>
    <div class="p-money">
      <div>جمع: ${money(o.total, o.currency)}</div>
      <div>رسیده: ${money(o.received, o.currency)}</div>
      <div class="rem">الباقی: ${money(o.remaining, o.currency)}</div>
    </div>
    ${o.rate ? `<p style="text-align:center">نرخ دالر: ${fa(o.rate)} ؋ — معادل افغانی: ${fa(o.total * o.rate)} ؋</p>` : ''}
    <div class="sig"><div>پذیرش</div><div>مشتری</div><div>مدیر</div></div>`);
}
function printStatement(c) {
  const os = DB.orders.filter(o => o.customerId === c.id);
  const ls = DB.ledger.filter(l => l.customerId === c.id).sort((a, b) => jdnOf(a.d) - jdnOf(b.d));
  const rs = DB.receipts.filter(r => r.customerId === c.id).sort((a, b) => jdnOf(b.d) - jdnOf(a.d));
  const b = balancesOf(c.id);
  let run = 0;
  printDoc('سوابق', `
    <div class="p-title">پرینت سوابق مشتری</div>
    <div class="kv">
      <dt>نام / شماره</dt><dd>${esc(c.name)} (${faDigits(c.code)})</dd>
      <dt>نوع / تماس</dt><dd>${c.type === 'cash' ? 'نقدی' : 'نسیه'} · ${faDigits(c.phone || '—')}</dd>
      <dt>مانده</dt><dd><b>${balText(b)}</b></dd>
    </div>
    <h3 style="margin:16px 0 6px">سفارشات</h3>
    <table class="p-table"><tr><th>شماره</th><th>تاریخ</th><th>نام کار</th><th>مبلغ</th><th>رسیده</th><th>باقی</th></tr>
    ${os.map(o => `<tr><td>${faDigits(o.code)}</td><td>${jStr(o.d)}</td><td>${esc(o.job)}</td>
      <td>${money(o.total, o.currency)}</td><td>${money(o.received, o.currency)}</td>
      <td>${money(o.remaining, o.currency)}</td></tr>`).join('') || '<tr><td colspan="6">سفارشی ندارد</td></tr>'}</table>
    ${c.type === 'credit' ? `
    <h3 style="margin:16px 0 6px">پا حساب</h3>
    <table class="p-table"><tr><th>تاریخ</th><th>بابت</th><th>نوع</th><th>مبلغ</th><th>نرخ</th><th>مانده</th></tr>
    ${ls.map(l => { run += l.type === 'debit' ? l.afnEq : -l.afnEq;
      return `<tr><td>${jStr(l.d)}</td><td>${esc(l.babat)}</td><td>${l.type === 'debit' ? 'بدهکار' : 'پرداخت'}</td>
      <td>${money(l.amount, l.currency)}</td><td>${l.rate ? fa(l.rate) : '—'}</td><td>${fa(run)} ؋</td></tr>`; }).join('')}</table>
    <h3 style="margin:16px 0 6px">رسیدها</h3>
    <table class="p-table"><tr><th>شماره</th><th>تاریخ</th><th>مبلغ</th><th>بابت</th></tr>
    ${rs.map(r => `<tr><td>${faDigits(r.code)}</td><td>${jStr(r.d)}</td>
      <td>${money(r.amount, r.currency)}</td><td>${esc(r.babat)}</td></tr>`).join('') || '<tr><td colspan="4">رسیدی ندارد</td></tr>'}</table>` : ''}
    <div class="sig"><div>امضای مشتری</div><div>حسابدار</div><div>مهر چاپخانه</div></div>`);
}

/* ═══ ۱۸) رویدادها و اتصال ═══ */
function fillDatalists() {
  $('#dlPersons').innerHTML = [...new Set(DB.stock.map(m => m.person))].map(p => `<option value="${esc(p)}">`).join('');
  $('#dlItems').innerHTML = [...new Set(DB.stock.map(m => m.item))].map(p => `<option value="${esc(p)}">`).join('');
}

document.addEventListener('click', e => {
  const nav = e.target.closest('[data-page]');
  if (nav) { show(nav.dataset.page); return; }
  if (e.target.closest('[data-close]')) { closeAllModals(); return; }
  const flt = e.target.closest('[data-filter]');
  if (flt) { ORD_FILTER = flt.dataset.filter; renderOrders(); return; }
  const cflt = e.target.closest('[data-custfilter]');
  if (cflt) { CUST_FILTER = cflt.dataset.custfilter; renderCustomers(); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const a = btn.dataset.act, id = btn.dataset.id;
  switch (a) {
    case 'view-order': viewOrder(id); break;
    case 'edit-order': editOrder(id); break;
    case 'register-order': { const o = DB.orders.find(x => x.id === id); o.status = 'registered'; addLog(`سفارش ${o.code} را ثبت شده کرد.`); save(); toast('به ثبت شده‌ها منتقل شد'); renderOrders(); break; }
    case 'settle-order': {
      const o = DB.orders.find(x => x.id === id);
      if (o.remaining <= 0) { o.status = 'settled'; addLog(`سفارش ${o.code} را تصفیه کرد.`); save(); toast('تصفیه شد'); renderOrders(); break; }
      const amt = prompt(`باقی‌مانده: ${money(o.remaining, o.currency)}\nمبلغ دریافتی برای تصفیه:`, o.remaining);
      if (!amt) break;
      const n = +amt; if (n <= 0 || isNaN(n)) return toast('مبلغ نامعتبر', 'err');
      o.received = +(o.received + n).toFixed(2); o.remaining = Math.max(0, +(o.total - o.received).toFixed(2));
      o.status = 'settled';
      if (o.ctype === 'credit') {
        DB.ledger.push({ id: uid(), customerId: o.customerId, orderId: id, type: 'credit', currency: o.currency,
          amount: n, rate: o.rate, afnEq: o.rate ? +(n * o.rate).toFixed(2) : n, babat: `تسویه سفارش ${o.code}`, d: jToday() });
      }
      addLog(`سفارش ${o.code} را تصفیه کرد.`); save(); toast('تصفیه شد'); renderOrders(); break;
    }
    case 'open-ledger-order': { const o = DB.orders.find(x => x.id === id); if (o.ctype === 'cash') return toast('مشتری نقدی پا حساب ندارد', 'info'); show('customer', o.customerId); break; }
    case 'print-order': printOrder(DB.orders.find(x => x.id === id)); break;
    case 'print-receipt': { const r = DB.receipts.find(x => x.id === id); const c = DB.customers.find(x => x.id === r.customerId); printReceipt(r, c, balancesOf(c.id)); break; }
    case 'print-payment': printPayment(DB.payments.find(x => x.id === id)); break;
    case 'print-statement': { const c = DB.customers.find(x => x.id === id); if (c) printStatement(c); break; }
    case 'open-customer': show('customer', id); break;
    case 'edit-customer': openCustomerForm(id); break;
    case 'view-provider': viewProvider(id); break;
    case 'edit-user': editUserForm(id); break;
    case 'toggle-user': { const u = DB.users.find(x => x.id === id); if (u.id === USER.id) return toast('نمی‌توانید خود را غیرفعال کنید', 'err'); u.active = !u.active; save(); renderUsers(); break; }
  }
});

document.addEventListener('change', e => {
  const id = e.target.id;
  if (id === 'siCat') $('#siSizeWrap').style.display = e.target.value === 'کاغذی' ? '' : 'none';
  if (id === 'soPerson' || id === 'soCat') fillSoItems();
  if (id === 'soItem') updateSoAvail();
  if (id === 'rCust') { updateReceiptOrders(); updateReceiptCalc(); }
  if (['rCur', 'rAmount', 'rRate'].includes(id)) updateReceiptCalc();
  if (['pCur', 'pAmount', 'pRate'].includes(id)) updatePayCalc();
});
['orderSearch', 'custSearch'].forEach(id =>
  document.addEventListener('input', e => {
    if (e.target.id === 'orderSearch' && CURRENT === 'orders') renderOrders();
    if (e.target.id === 'custSearch' && CURRENT === 'customers') renderCustomers();
  }));

$('#formNew').onsubmit = e => { e.preventDefault(); saveOrder('formHostNew'); };
$('#formEdit').onsubmit = e => { e.preventDefault(); saveOrder('formHostEdit'); };
$('#formCust').onsubmit = e => { e.preventDefault(); saveCustomerForm(); };
$('#formUser').onsubmit = e => { e.preventDefault(); saveUserEdit($('#formUser').dataset.id); };
$('#formReceipt').onsubmit = e => { e.preventDefault(); saveReceipt(); };
$('#formStockIn').onsubmit = e => { e.preventDefault(); saveStockIn(); };
$('#formStockOut').onsubmit = e => { e.preventDefault(); saveStockOut(); };
$('#formPay').onsubmit = e => { e.preventDefault(); savePayment(); };
$('#userForm').onsubmit = e => { e.preventDefault(); saveUser(); };

$('#btnAddCust').onclick = () => openCustomerForm();
$('#btnEditCust').onclick = e => openCustomerForm(e.currentTarget.dataset.id);
$('#btnPrintCust').onclick = e => { const c = DB.customers.find(x => x.id === e.currentTarget.dataset.id); if (c) printStatement(c); };
$('#btnPrintDash').onclick = () => printDoc('گزارش روز', $('#kpiGrid').outerHTML + $('#recentList').outerHTML);
$('#btnPrintOrders').onclick = () => printDoc('سفارشات', $('#ordersBody').closest('.tscroll').outerHTML);
$('#btnPrintCusts').onclick = () => printDoc('مشتریان', $('#custBody').closest('.tscroll').outerHTML);
$('#btnPrintLedger').onclick = () => printDoc('پا حساب', $('#ledgerBody').closest('.tscroll').outerHTML);
$('#btnPrintStock').onclick = () => printDoc('گدام', $('#stockBody').closest('.tscroll').outerHTML);
$('#btnPrintReceived').onclick = () => printDoc('دریافت‌ها', $('#receivedBody').closest('.tscroll').outerHTML);
$('#btnPrintFin').onclick = () => printDoc('گزارش مالی', $('#debtBody').closest('.tscroll').outerHTML);

$('#hamburger').onclick = () => document.body.classList.toggle('side-open');
$('#sideOverlay').onclick = () => document.body.classList.remove('side-open');
$('#themeToggle').onclick = toggleTheme;
$('#logoutBtn').onclick = () => {
  if (!authOn()) return toast('ورود با رمز فعال نیست؛ اول از تنظیمات فعالش کنید', 'info');
  confirmBox('از سیستم خارج می‌شوید؟', logout);
};
$('#rateChip').onclick = () => {
  const r = prompt(`نرخ فعلی: ${fa(DB.settings.usdRate)} ؋\nنرخ جدید:`, DB.settings.usdRate);
  if (!r) return;
  const n = +r; if (n <= 0) return toast('نرخ نامعتبر', 'err');
  DB.settings.usdRate = n; save(); refreshTopbar();
  addLog(`نرخ دالر را به ${fa(n)} ؋ تغییر داد.`);
  toast('نرخ به‌روزرسانی شد');
};
$('#btnShop').onclick = () => { DB.settings.shopName = $('#shopName').value.trim() || DB.settings.shopName; save(); refreshTopbar(); toast('ذخیره شد'); };
$('#btnAddr').onclick = () => { DB.settings.shopAddr = $('#shopAddr').value.trim(); save(); toast('ذخیره شد'); };
$('#dlBackup').onclick = () => {
  const blob = new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chapyar-${jStr(jToday()).replace(/\//g, '-')}.json`;
  a.click(); toast('پشتیبان دانلود شد');
};
$('#fileRestore').onchange = function () {
  const f = this.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!d.customers) throw 0;
      DB = d; save(); toast('بازیابی شد'); setTimeout(() => location.reload(), 800);
    } catch { toast('فایل نامعتبر', 'err'); }
  };
  rd.readAsText(f);
};
$('#btnSample').onclick = () => confirmBox('داده‌های نمونه بازمی‌گردد. مطمئنید؟', () => { DB = seedData(); save(); toast('بازگردانی شد'); location.reload(); });
$('#btnEmpty').onclick = () => confirmBox('تمام سفارشات، رسیدها و گدام پاک می‌شوند!', () => {
  DB.orders = []; DB.ledger = []; DB.receipts = []; DB.payments = []; DB.stock = [];
  save(); toast('پاک شد'); location.reload();
});
$('#btnEnableAuth').onclick = () => {
  const u = $('#authUser').value.trim(), p = $('#authPass').value.trim();
  if (!u || !p) return toast('نام کاربری و رمز عبور را وارد کنید', 'err');
  if (DB.users.some(x => x.id !== USER.id && x.username === u)) return toast('این نام کاربری قبلاً استفاده شده', 'err');
  USER.username = u; USER.pass = p;
  DB.settings.authEnabled = true;
  addLog(`ورود با رمز را با نام کاربری «${u}» فعال کرد.`);
  save(); renderSettings(); renderUsers();
  toast('✅ رمز فعال شد — از دفعهٔ بعد ورود با رمز الزامی است');
};
$('#btnDisableAuth').onclick = () => confirmBox('ورود با رمز غیرفعال شود؟ از این به بعد هر کسی بدون رمز وارد می‌شود.', () => {
  DB.settings.authEnabled = false;
  addLog('ورود با رمز را غیرفعال کرد.');
  save(); renderSettings();
  toast('🔓 ورود آزاد شد');
});
$('#confirmYes').onclick = () => { closeModal('#modalConfirm'); if (confirmCb) confirmCb(); confirmCb = null; };
$('#confirmNo').onclick = () => { closeModal('#modalConfirm'); confirmCb = null; };
$('#globalSearch').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const q = e.target.value.trim(); if (!q) return;
  if (DB.orders.some(o => o.code.includes(q))) { show('orders'); $('#orderSearch').value = q; renderOrders(); return; }
  show('customers'); $('#custSearch').value = q; renderCustomers();
});

/* ═══ ۹) احراز هویت ═══ */
function toggleTheme() {
  const t = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = t; localStorage.setItem('cy_theme', t);
  $('#themeToggle').textContent = t === 'dark' ? '☀' : '🌙';
}
function refreshTopbar() {
  const t = jToday();
  $('#topDate').textContent = `${jWeekday(t)}، ${jLong(t)}`;
  $('#rateVal').textContent = fa(DB.settings.usdRate);
}
function enterApp(user) {
  USER = user;
  sessionStorage.setItem('cy_user', user.id);
  $('#loginScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#userName').textContent = user.name;
  $('#userRole').textContent = ROLE_DEFS[user.role].name;
  applyNav();
  refreshTopbar();
  show('dashboard');
}
function doLogin(u, p) {
  const user = DB.users.find(x => x.username === u && x.pass === p && x.active);
  if (!user) { $('#loginErr').textContent = 'نام کاربری یا رمز نادرست است'; return; }
  addLog('وارد سیستم شد.'); save();
  enterApp(user);
}
function logout() {
  addLog('از سیستم خارج شد.'); save();
  USER = null; sessionStorage.removeItem('cy_user');
  location.reload();
}

/* چرخش متن صفحهٔ ورود */
const rotWords = ['کارت ویزیت', 'بروشور شرکتی', 'تراکت تبلیغاتی', 'پوستر رنگی', 'سربرگ رسمی', 'کاتالوگ', 'فاکتور', 'بنر بزرگ', 'کتاب'];
let rotI = 0;
setInterval(() => {
  const el = $('#rotWord'); if (!el) return;
  el.classList.add('fade');
  setTimeout(() => { rotI = (rotI + 1) % rotWords.length; el.textContent = rotWords[rotI]; el.classList.remove('fade'); }, 400);
}, 3000);

$('#loginForm').onsubmit = e => { e.preventDefault(); doLogin($('#loginUser').value.trim(), $('#loginPass').value); };
$$('.demo-btn').forEach(b => b.onclick = () => { $('#loginUser').value = b.dataset.u; $('#loginPass').value = b.dataset.p; $('#loginPass').focus(); });
$('#loginDate').textContent = `${jWeekday(jToday())}، ${jLong(jToday())} — تاریخ‌های سیستم هجری شمسی است`;

/* ═══ ۰) راه‌اندازی ═══ */
(function boot() {
  const t = localStorage.getItem('cy_theme') || 'light';
  document.body.dataset.theme = t;
  $('#themeToggle').textContent = t === 'dark' ? '☀' : '🌙';
  fillDatalists();

  if (!DB.users || DB.users.length === 0) {
    DB.users = [{ id: uid(), username: 'میرویس', pass: '0000', name: 'میرویس', role: 'modir', active: true }];
    save();
  }

  window.addEventListener('resize', () => {
    if (CURRENT === 'dashboard') drawBarChart('#barChart', saleHistory7());
    if (CURRENT === 'finance') drawFinChart();
  });
  window.addEventListener('storage', e => {
    if (e.key === LS_KEY && e.newValue) { DB = JSON.parse(e.newValue); show(CURRENT); }
  });

  // 🔓 رمز فعال نیست → ورود آزاد
  if (!authOn()) {
    enterApp(DB.users.find(x => x.active) || DB.users[0]);
    return;
  }
  // 🔒 رمز فعال است → سشن یا صفحهٔ ورود
  const saved = sessionStorage.getItem('cy_user');
  if (saved) {
    const u = DB.users.find(x => x.id === saved);
    if (u) enterApp(u);
  }
})();
