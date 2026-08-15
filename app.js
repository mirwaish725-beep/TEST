"use strict";
/* ════════════════════════════════════════════════════════
   چاپ‌یار — سیستم مدیریت سفارشات چاپخانه
   ذخیره‌سازی: localStorage + همگام‌سازی لحظه‌ای با BroadcastChannel
   برای اتصال به سرور، فقط توابع save/ensureDB را جایگزین کنید.
════════════════════════════════════════════════════════ */

/* ───────── ابزارها ───────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
const NF = new Intl.NumberFormat("fa-IR");
const fa = (n) => NF.format(Math.round(+n || 0));
const money = (n) => fa(n) + " ؋";
const DF = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
const DFf = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric"
});
const DFt = new Intl.DateTimeFormat("fa-IR", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
const dFa = (d) => {
  try {
    return DF.format(new Date(d));
  } catch (e) {
    return "—";
  }
};
const dFaf = (d) => {
  try {
    return DFf.format(new Date(d));
  } catch (e) {
    return "—";
  }
};
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const dayStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};
const remain = (o) => Math.max((+o.price || 0) - (+o.paid || 0), 0);

const KEY = "chapyar_db_v1";
let DB = null,
  CH = null,
  currentUser = null,
  currentPage = "dashboard";
let lastSnap = 0,
  syncToastAt = 0,
  pendingFlash = null,
  confirmRes = null;
let F = { q: "", status: "", range: "" };

const PERMS = {
  dashboard: ["admin", "accountant", "staff"],
  neworder: ["admin", "staff"],
  orders: ["admin", "accountant", "staff"],
  customers: ["admin", "accountant", "staff"],
  finance: ["admin", "accountant"],
  users: ["admin"],
  settings: ["admin", "accountant"]
};
const TITLES = {
  dashboard: "پیشخوان",
  neworder: "ثبت سفارش جدید",
  orders: "مدیریت سفارشات",
  customers: "مشتریان",
  finance: "گزارش‌های مالی",
  users: "مدیریت کاربران",
  settings: "تنظیمات و پشتیبان"
};
const ROLES = { admin: "مدیر", accountant: "حسابدار", staff: "کارمند" };
const ST_CLS = { "در حال انجام": "a", ثبت‌شده: "b", تصفیه‌شده: "c" };
const ST_COL = {
  "در حال انجام": "#e8a013",
  ثبت‌شده: "#00a6c8",
  تصفیه‌شده: "#2f9e63"
};
const canEdit = () =>
  currentUser && ["admin", "staff"].includes(currentUser.role);
const canDel = () => currentUser && currentUser.role === "admin";

/* ───────── پایگاه داده ───────── */
function seed() {
  const users = [
    {
      id: "u1",
      username: "admin",
      pass: "admin123",
      name: "مدیر سیستم",
      role: "admin"
    },
    {
      id: "u2",
      username: "hesab",
      pass: "1234",
      name: "مریم حسینی",
      role: "accountant"
    },
    {
      id: "u3",
      username: "kargar",
      pass: "1234",
      name: "علی رضایی",
      role: "staff"
    }
  ];
  const O = (
    daysAgo,
    job,
    cust,
    phone,
    qty,
    color,
    size,
    mat,
    price,
    paid,
    status,
    pack,
    deliv
  ) => ({
    id: uid(),
    no: 0,
    date: new Date(Date.now() - daysAgo * 864e5).toISOString(),
    job,
    customer: cust,
    phone,
    address: "کابل، سرک اول، مارکیت چاپخانه",
    desc: "",
    delivery: new Date(Date.now() + deliv * 864e5).toISOString().slice(0, 10),
    qty,
    color,
    size,
    material: mat,
    packaged: pack,
    price,
    paid,
    status
  });
  const orders = [
    O(
      0,
      "کارت ویزیت گلاسه",
      "احمد رحیمی",
      "0700123456",
      5,
      "تمام‌رنگی",
      "۸.۵×۴.۸ سانتی",
      "گلاسه ۳۰۰ گرمی",
      4500,
      4500,
      "تصفیه‌شده",
      true,
      2
    ),
    O(
      0,
      "بنر فلکس افتتاحیه",
      "فروشگاه گلستان",
      "0788456123",
      2,
      "تمام‌رنگی",
      "۳×۱ متر",
      "فلکس",
      6800,
      3000,
      "در حال انجام",
      false,
      3
    ),
    O(
      1,
      "بروشور سه‌لت",
      "شرکت آریا",
      "0777334455",
      1000,
      "چهاررنگ",
      "A4",
      "گلاسه ۱۳۵ گرمی",
      12500,
      6000,
      "ثبت‌شده",
      true,
      5
    ),
    O(
      2,
      "سررسید اختصاصی",
      "نجیب‌الله عمرزی",
      "0701112233",
      200,
      "تک‌رنگ",
      "وزیری",
      "تحریر",
      18000,
      9000,
      "در حال انجام",
      false,
      10
    ),
    O(
      4,
      "پوستر A3",
      "فاطمه کریمی",
      "0744998877",
      50,
      "چهاررنگ",
      "A3",
      "گلاسه ۱۷۰ گرمی",
      3500,
      3500,
      "تصفیه‌شده",
      true,
      0
    ),
    O(
      6,
      "تراکت تبلیغاتی",
      "رستوران کابل",
      "0700556677",
      2000,
      "دورنگ",
      "A5",
      "تحریر ۸۰ گرمی",
      7200,
      2000,
      "در حال انجام",
      false,
      2
    ),
    O(
      9,
      "کاتالوگ ۸ صفحه",
      "شرکت پامیر",
      "0788112244",
      500,
      "چهاررنگ",
      "A4",
      "گلاسه",
      26000,
      15000,
      "ثبت‌شده",
      true,
      7
    ),
    O(
      12,
      "پاکت نامه اداری",
      "ریاست معارف",
      "0700667788",
      1000,
      "تک‌رنگ",
      "A4",
      "تحریر",
      5400,
      5400,
      "تصفیه‌شده",
      true,
      0
    ),
    O(
      18,
      "لیبل استیکری",
      "آبمیوه‌سازی صفا",
      "0777889900",
      3000,
      "چهاررنگ",
      "۵×۵ سانتی",
      "استیکر",
      9800,
      4000,
      "در حال انجام",
      false,
      4
    ),
    O(
      25,
      "دعوتنامه عروسی",
      "حاجی عمرزی",
      "0701112233",
      300,
      "چهاررنگ",
      "خشتی",
      "گلاسه ۲۵۰ گرمی",
      8500,
      8500,
      "تصفیه‌شده",
      true,
      0
    ),
    O(
      34,
      "ست اداری کامل",
      "شرکت آریا",
      "0777334455",
      2,
      "تمام‌رنگی",
      "A4",
      "تحریر / گلاسه",
      15500,
      10000,
      "تصفیه‌شده",
      true,
      0
    ),
    O(
      47,
      "فاکتور اختصاصی",
      "فروشگاه گلستان",
      "0788456123",
      20,
      "تک‌رنگ",
      "A5",
      "NCR",
      4300,
      4300,
      "تصفیه‌شده",
      true,
      0
    ),
    O(
      63,
      "پوستر تبلیغاتی",
      "مرکز زبان نور",
      "0744123123",
      100,
      "چهاررنگ",
      "۵۰×۷۰ سانتی",
      "گلاسه",
      6100,
      3000,
      "تصفیه‌شده",
      true,
      0
    ),
    O(
      78,
      "کارت ویزیت ساده",
      "حاجی نعمت‌الله",
      "0700909090",
      3,
      "تک‌رنگ",
      "۸.۵×۴.۸ سانتی",
      "گلاسه",
      2700,
      2700,
      "تصفیه‌شده",
      true,
      0
    )
  ];
  let n = 1001;
  orders.forEach((o) => (o.no = n++));
  DB = {
    settings: { nextNo: n, shop: "چاپخانه هنر" },
    users,
    orders,
    logs: [],
    snapshots: []
  };
  log("سیستم", "راه‌اندازی اولیه با داده‌های نمونه");
  save(false);
}
function ensureDB() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      DB = JSON.parse(raw);
    } catch (e) {
      DB = null;
    }
  }
  if (!DB || !DB.orders) seed();
}
function save(bc = true) {
  localStorage.setItem(KEY, JSON.stringify(DB));
  const now = Date.now();
  if (now - lastSnap > 120000) {
    /* پشتیبان خودکار هر ۲ دقیقه */
    lastSnap = now;
    DB.snapshots.unshift({
      t: new Date().toISOString(),
      count: DB.orders.length,
      data: JSON.stringify({
        orders: DB.orders,
        users: DB.users,
        settings: DB.settings
      })
    });
    DB.snapshots = DB.snapshots.slice(0, 6);
    localStorage.setItem(KEY, JSON.stringify(DB));
  }
  if (bc && CH) CH.postMessage({ type: "sync" });
}
function log(user, text) {
  DB.logs.unshift({ t: new Date().toISOString(), user, text });
  DB.logs = DB.logs.slice(0, 300);
}
/* همگام‌سازی لحظه‌ای بین تب‌ها/پنجره‌ها */
if ("BroadcastChannel" in window) {
  CH = new BroadcastChannel("chapyar");
  CH.onmessage = (e) => {
    if (e.data?.type === "sync") pullSync();
  };
}
window.addEventListener("storage", (e) => {
  if (e.key === KEY && e.newValue) pullSync();
});
function pullSync() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  DB = JSON.parse(raw);
  if (!currentUser) return;
  renderCurrent();
  const now = Date.now();
  if (now - syncToastAt > 4000) {
    syncToastAt = now;
    toast("🔄 اطلاعات با تغییرات کاربر دیگر به‌روز شد", "info");
  }
}

/* ───────── احراز هویت ───────── */
function doLogin(u, p) {
  const user = DB.users.find((x) => x.username === u && x.pass === p);
  if (!user) return false;
  currentUser = { username: user.username, name: user.name, role: user.role };
  sessionStorage.setItem("ps_user", JSON.stringify(currentUser));
  log(user.name, "وارد سیستم شد");
  save();
  return true;
}
function enterApp(welcome = true) {
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#userName").textContent = currentUser.name;
  $("#userRole").textContent = ROLES[currentUser.role];
  $$("#navList .nav-item").forEach((n) => {
    const p = n.dataset.page;
    n.style.display = PERMS[p].includes(currentUser.role) ? "" : "none";
  });
  const first = Object.keys(PERMS).find((k) =>
    PERMS[k].includes(currentUser.role)
  );
  navigate(first);
  if (welcome) toast(`خوش آمدید، ${currentUser.name} 👋`);
}
function logout() {
  log(currentUser.name, "از سیستم خارج شد");
  save();
  sessionStorage.removeItem("ps_user");
  currentUser = null;
  $("#app").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  $("#loginPass").value = "";
}

/* ───────── مسیریابی ───────── */
const RENDER = {
  dashboard: renderDashboard,
  neworder: renderNewOrder,
  orders: renderOrders,
  customers: renderCustomers,
  finance: renderFinance,
  users: renderUsers,
  settings: renderSettings
};
function navigate(p) {
  if (!PERMS[p]?.includes(currentUser.role))
    p = Object.keys(PERMS).find((k) => PERMS[k].includes(currentUser.role));
  currentPage = p;
  $$(".page").forEach((s) =>
    s.classList.toggle("active", s.dataset.page === p)
  );
  $$("#navList .nav-item").forEach((n) =>
    n.classList.toggle("active", n.dataset.page === p)
  );
  $("#pageTitle").textContent = TITLES[p];
  if (p === "orders") $("#globalSearch").value = F.q;
  RENDER[p]?.();
  document.body.classList.remove("side-open");
}
function renderCurrent() {
  RENDER[currentPage]?.();
}

/* ───────── محاسبات آماری ───────── */
const incomeSince = (ts) =>
  DB.orders
    .filter((o) => new Date(o.date).getTime() >= ts)
    .reduce((s, o) => s + (+o.paid || 0), 0);
const countSince = (ts) =>
  DB.orders.filter((o) => new Date(o.date).getTime() >= ts).length;
const debtTotal = () => DB.orders.reduce((s, o) => s + remain(o), 0);
const stCount = (st) => DB.orders.filter((o) => o.status === st).length;

function monthBuckets(n) {
  const arr = [],
    now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({
      key: d.getFullYear() * 12 + d.getMonth(),
      label: new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(d),
      value: 0
    });
  }
  return arr;
}
function fillBuckets(buckets) {
  DB.orders.forEach((o) => {
    const d = new Date(o.date),
      k = d.getFullYear() * 12 + d.getMonth();
    const b = buckets.find((x) => x.key === k);
    if (b) b.value += +o.paid || 0;
  });
  return buckets;
}

/* ───────── داشبورد ───────── */
function animateNumber(el, target, isMoney) {
  const t0 = performance.now(),
    D = 700;
  (function f(t) {
    const k = Math.min((t - t0) / D, 1),
      e = 1 - Math.pow(1 - k, 3);
    el.textContent = isMoney ? money(target * e) : fa(target * e);
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
function kpiCard(label, value, acc, sub, hero, isMoney) {
  return `<div class="kpi ${acc} ${
    hero ? "hero" : ""
  }" style="animation-delay:${Math.random() * 0.12}s">
    <div class="lbl">${label}</div><div class="num" data-v="${value}" data-m="${
    isMoney ? 1 : 0
  }">۰</div>
    ${sub ? `<div class="sub2">${sub}</div>` : ""}</div>`;
}
function renderDashboard() {
  const now = Date.now(),
    today = dayStart(now);
  const incToday = incomeSince(today),
    inc7 = incomeSince(now - 7 * 864e5),
    inc30 = incomeSince(now - 30 * 864e5);
  const debt = debtTotal(),
    debtors = DB.orders.filter((o) => remain(o) > 0).length;
  $("#kpiGrid").innerHTML =
    kpiCard(
      "دریافتی ۳۰ روز اخیر",
      inc30,
      "acc-c",
      `امروز ${money(incToday)} • ۷ روز اخیر ${money(inc7)}`,
      true,
      true
    ) +
    kpiCard(
      "سفارشات امروز",
      countSince(today),
      "acc-m",
      `مجموع کل: ${fa(DB.orders.length)} سفارش`
    ) +
    kpiCard("در حال انجام", stCount("در حال انجام"), "acc-y") +
    kpiCard("ثبت‌شده", stCount("ثبت‌شده"), "acc-k") +
    kpiCard("تصفیه‌شده", stCount("تصفیه‌شده"), "acc-g") +
    kpiCard(
      "بدهی مشتریان",
      debt,
      "acc-m",
      `${fa(debtors)} سفارش دارای مانده`,
      false,
      true
    );
  $$("#kpiGrid .num").forEach((el) =>
    animateNumber(el, +el.dataset.v, el.dataset.m === "1")
  );

  requestAnimationFrame(() => {
    barChart($("#barChart"), fillBuckets(monthBuckets(6)));
    const parts = Object.keys(ST_COL).map((s) => ({
      label: s,
      value: stCount(s),
      color: ST_COL[s]
    }));
    donut($("#donutChart"), parts);
    $("#donutLegend").innerHTML = parts
      .map(
        (p) =>
          `<span class="lg"><i style="background:${p.color}"></i>${
            p.label
          } <b>${fa(p.value)}</b></span>`
      )
      .join("");
  });

  const recent = [...DB.orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  $("#recentList").innerHTML = recent.length
    ? recent
        .map(
          (o) => `
    <div class="mrow"><div class="grow"><b>${esc(o.job)}</b><small>${esc(
            o.customer
          )} • ${dFa(o.date)}</small></div>
    <span class="mbadge">${money(o.price)}</span><span class="badge st-${
            ST_CLS[o.status]
          }">${o.status}</span></div>`
        )
        .join("")
    : '<p class="hint" style="padding:14px">هنوز سفارشی ثبت نشده است.</p>';

  const ups = DB.orders
    .filter((o) => o.delivery && o.status !== "تصفیه‌شده")
    .map((o) => ({
      o,
      days: Math.ceil((dayStart(o.delivery) - dayStart(new Date())) / 864e5)
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);
  $("#deliveryList").innerHTML = ups.length
    ? ups
        .map(
          ({ o, days }) => `
    <div class="mrow"><div class="grow"><b>${esc(o.job)}</b><small>${esc(
            o.customer
          )} • تحویل: ${dFa(o.delivery)}</small></div>
    <span class="mbadge ${days < 0 ? "over" : days <= 2 ? "soon" : ""}">${
            days < 0
              ? fa(-days) + " روز تأخیر"
              : days === 0
              ? "امروز"
              : fa(days) + " روز مانده"
          }</span></div>`
        )
        .join("")
    : '<p class="hint" style="padding:14px">تحویل نزدیکی وجود ندارد.</p>';
}

/* ───────── فرم سفارش ───────── */
const COLORS = ["تک‌رنگ", "دورنگ", "چهاررنگ", "تمام‌رنگی"];
function orderFormHTML(o = {}) {
  return `<div class="frm">
    <div class="field"><label>شماره سفارش</label><input value="${
      o.no ? "سفارش " + fa(o.no) : "خودکار"
    }" disabled></div>
    <div class="field"><label>تاریخ ثبت</label><input value="${
      o.date ? dFa(o.date) : dFa(new Date())
    }" disabled></div>
    <div class="field"><label>نام کار *</label><input id="f_job" value="${esc(
      o.job || ""
    )}" placeholder="مثلاً کارت ویزیت، بنر…"></div>
    <div class="field"><label>نام سفارش‌دهنده *</label><input id="f_customer" value="${esc(
      o.customer || ""
    )}"></div>
    <div class="field"><label>شماره تماس *</label><input id="f_phone" dir="ltr" value="${esc(
      o.phone || ""
    )}" placeholder="07xxxxxxxx"></div>
    <div class="field"><label>تاریخ تحویل</label><input type="date" id="f_delivery" value="${
      o.delivery || ""
    }"></div>
    <div class="field"><label>تعداد</label><input type="number" id="f_qty" min="1" value="${
      o.qty ?? 1
    }"></div>
    <div class="field"><label>رنگ چاپ</label><select id="f_color">${COLORS.map(
      (c) => `<option ${c === o.color ? "selected" : ""}>${c}</option>`
    ).join("")}</select></div>
    <div class="field"><label>سایز</label><input id="f_size" value="${esc(
      o.size || ""
    )}" placeholder="A4، ۵۰×۷۰…"></div>
    <div class="field"><label>جنس</label><input id="f_material" value="${esc(
      o.material || ""
    )}" placeholder="گلاسه، فلکس…"></div>
    <div class="field span2"><label>آدرس</label><input id="f_address" value="${esc(
      o.address || ""
    )}"></div>
    <div class="field span2"><label>توضیحات کامل سفارش</label><textarea id="f_desc" rows="2">${esc(
      o.desc || ""
    )}</textarea></div>
    <div class="field"><label>قیمت کل (؋) *</label><input type="number" id="f_price" min="0" value="${
      o.price ?? ""
    }"></div>
    <div class="field"><label>مبلغ رسیده / دریافتی (؋)</label><input type="number" id="f_paid" min="0" value="${
      o.paid ?? 0
    }"></div>
    <div class="field"><label>مبلغ الباقی (خودکار)</label><input id="f_remain" disabled></div>
    ${
      o.status
        ? `<div class="field"><label>وضعیت</label><select id="f_status">${Object.keys(
            ST_CLS
          )
            .map(
              (s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`
            )
            .join("")}</select></div>`
        : ""
    }
  </div>`;
}
function bindForm(form, o) {
  form.innerHTML =
    orderFormHTML(o || {}) +
    (form.querySelector(".form-foot")?.outerHTML || "");
  const upd = () => {
    const p = +form.querySelector("#f_price").value || 0;
    const pd = +form.querySelector("#f_paid").value || 0;
    form.querySelector("#f_remain").value = money(Math.max(p - pd, 0));
  };
  form.querySelector("#f_price").addEventListener("input", upd);
  form.querySelector("#f_paid").addEventListener("input", upd);
  upd();
  form.onreset = () => setTimeout(upd, 0);
  form.onsubmit = (e) => {
    e.preventDefault();
    saveOrder(form, o);
  };
}
function saveOrder(form, o) {
  const g = (id) => form.querySelector(id).value.trim();
  const job = g("#f_job"),
    cust = g("#f_customer"),
    phone = g("#f_phone"),
    price = +g("#f_price");
  if (!job || !cust || !phone) {
    toast("نام کار، سفارش‌دهنده و تماس الزامی است", "err");
    return;
  }
  if (!/^[0-9۰-۹]{7,}$/.test(phone)) {
    toast("شماره تماس معتبر نیست", "err");
    return;
  }
  if (!(price >= 0)) {
    toast("قیمت کل را وارد کنید", "err");
    return;
  }
  const data = {
    job,
    customer: cust,
    phone,
    address: g("#f_address"),
    desc: g("#f_desc"),
    delivery: g("#f_delivery"),
    qty: +g("#f_qty") || 1,
    color: g("#f_color"),
    size: g("#f_size"),
    material: g("#f_material"),
    price,
    paid: +g("#f_paid") || 0
  };
  if (form.querySelector("#f_status"))
    data.status = form.querySelector("#f_status").value;
  if (o) {
    Object.assign(o, data);
    log(currentUser.name, `سفارش ${fa(o.no)} (${o.job}) را ویرایش کرد`);
    toast("تغییرات ذخیره شد ✔");
    closeModals();
    save();
    renderCurrent();
  } else {
    const no = DB.settings.nextNo++;
    DB.orders.push({
      id: uid(),
      no,
      date: new Date().toISOString(),
      packaged: false,
      status: "در حال انجام",
      ...data
    });
    log(currentUser.name, `سفارش ${fa(no)} «${job}» برای ${cust} ثبت کرد`);
    pendingFlash = no;
    toast(`سفارش شمارهٔ ${fa(no)} با موفقیت ثبت شد 🖨`);
    save();
    navigate("orders");
  }
}
function renderNewOrder() {
  bindForm($("#formNew"), null);
}

/* ───────── جدول سفارشات ───────── */
function filteredOrders() {
  const q = F.q.trim();
  let list = [...DB.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (q)
    list = list.filter(
      (o) =>
        o.customer.includes(q) ||
        o.job.includes(q) ||
        o.phone.includes(q) ||
        String(o.no).includes(q) ||
        fa(o.no).includes(q)
    );
  if (F.status) list = list.filter((o) => o.status === F.status);
  if (F.range) {
    const now = Date.now();
    const t =
      F.range === "today"
        ? dayStart(new Date())
        : now - (+F.range === 7 ? 7 : 30) * 864e5;
    list = list.filter((o) => new Date(o.date).getTime() >= t);
  }
  return list;
}
function renderOrders() {
  const ed = canEdit(),
    del = canDel();
  /* چیپ‌های وضعیت */
  const chips = [
    ["", "همه", DB.orders.length],
    ["در حال انجام", "در حال انجام", stCount("در حال انجام")],
    ["ثبت‌شده", "ثبت‌شده", stCount("ثبت‌شده")],
    ["تصفیه‌شده", "تصفیه‌شده", stCount("تصفیه‌شده")]
  ];
  $("#statusChips").innerHTML = chips
    .map(
      ([v, l, c]) =>
        `<button class="chip ${
          F.status === v ? "on" : ""
        }" data-st="${v}">${l} (${fa(c)})</button>`
    )
    .join("");

  const list = filteredOrders();
  $("#ordersCount").textContent = `${fa(list.length)} سفارش`;
  $("#ordersBody").innerHTML = list.length
    ? list
        .map((o) => {
          const r = remain(o);
          return `<tr data-id="${o.id}" class="${
            o.no === pendingFlash ? "flash" : ""
          }">
      <td class="num">${fa(o.no)}</td>
      <td>${dFa(o.date)}</td>
      <td><b>${esc(o.job)}</b>${
            o.desc
              ? `<span class="muted">${esc(o.desc.slice(0, 26))}${
                  o.desc.length > 26 ? "…" : ""
                }</span>`
              : ""
          }</td>
      <td>${esc(o.customer)}</td>
      <td dir="ltr" style="text-align:right">${esc(o.phone)}</td>
      <td>${fa(o.qty)}</td><td>${o.color}</td><td>${esc(
            o.size || "—"
          )}</td><td>${esc(o.material || "—")}</td>
      <td>${
        ed
          ? `<label class="chk" title="وضعیت بسته‌بندی"><input type="checkbox" data-pack="${
              o.id
            }" ${o.packaged ? "checked" : ""}><span></span></label>`
          : o.packaged
          ? "✔"
          : "—"
      }</td>
      <td>${money(o.price)}</td>
      <td>${money(o.paid)}</td>
      <td class="${r > 0 ? "rem-pos" : "rem-zero"}">${money(r)}</td>
      <td><span class="badge st-${ST_CLS[o.status]}">${o.status}</span></td>
      <td><div class="ops">
        <button class="ibtn" data-act="invoice" title="چاپ فاکتور">🖨</button>
        ${
          ed
            ? `<button class="ibtn" data-act="edit" title="ویرایش">✏️</button>`
            : ""
        }
        ${
          ed && o.status !== "ثبت‌شده"
            ? `<button class="ibtn" data-act="reg" title="انتقال به ثبت‌شده">🗂️</button>`
            : ""
        }
        ${
          ed && o.status !== "تصفیه‌شده"
            ? `<button class="ibtn ok" data-act="settle" title="انتقال به تصفیه‌شده">✅</button>`
            : ""
        }
        ${
          del
            ? `<button class="ibtn danger" data-act="del" title="حذف">🗑️</button>`
            : ""
        }
      </div></td>
    </tr>`;
        })
        .join("")
    : `<tr class="empty"><td colspan="15">🔍 سفارشی مطابق جستجو پیدا نشد</td></tr>`;
  pendingFlash = null;
  $("#btnGoNew").style.display = PERMS.neworder.includes(currentUser.role)
    ? ""
    : "none";
}
function openEdit(o) {
  $("#moTitle").textContent = `ویرایش سفارش ${fa(o.no)} — ${o.job}`;
  bindForm($("#formEdit"), o);
  openModal("modalOrder");
}

/* ───────── مشتریان ───────── */
function customersAgg() {
  const m = new Map();
  DB.orders.forEach((o) => {
    let c = m.get(o.phone);
    if (!c) {
      c = {
        name: o.customer,
        phone: o.phone,
        orders: 0,
        total: 0,
        paid: 0,
        last: null
      };
      m.set(o.phone, c);
    }
    c.orders++;
    c.total += +o.price || 0;
    c.paid += +o.paid || 0;
    if (!c.last || new Date(o.date) > new Date(c.last.date)) c.last = o;
  });
  return [...m.values()].sort((a, b) => b.total - b.paid - (a.total - a.paid));
}
function renderCustomers() {
  const list = customersAgg();
  $("#custBody").innerHTML = list.length
    ? list
        .map(
          (c) => `
    <tr><td><b>${esc(
      c.name
    )}</b></td><td dir="ltr" style="text-align:right">${esc(c.phone)}</td>
    <td>${fa(c.orders)}</td><td>${money(c.total)}</td><td>${money(c.paid)}</td>
    <td class="${c.total - c.paid > 0 ? "rem-pos" : "rem-zero"}">${money(
            c.total - c.paid
          )}</td>
    <td>${
      c.last
        ? `${esc(c.last.job)}<span class="muted">${dFa(c.last.date)}</span>`
        : "—"
    }</td>
    <td><div class="ops">
      <button class="ibtn" data-cact="view" data-phone="${esc(
        c.phone
      )}" title="مشاهده سفارشات این مشتری">📋</button>
      <button class="ibtn" data-cact="stmt" data-phone="${esc(
        c.phone
      )}" title="چاپ صورت‌حساب">🖨</button>
    </div></td></tr>`
        )
        .join("")
    : '<tr class="empty"><td colspan="8">مشتری‌ای یافت نشد</td></tr>';
}

/* ───────── گزارش مالی ───────── */
function renderFinance() {
  const now = Date.now();
  const totalReceived = DB.orders.reduce((s, o) => s + (+o.paid || 0), 0);
  const totalSales = DB.orders.reduce((s, o) => s + (+o.price || 0), 0);
  const chips = [
    ["درآمد امروز", incomeSince(dayStart(now))],
    ["هفتگی", incomeSince(now - 7 * 864e5)],
    ["ماهانه (۳۰ روز)", incomeSince(now - 30 * 864e5)],
    ["مجموع دریافتی", totalReceived],
    ["مجموع فروش", totalSales],
    ["مانده / بدهی", debtTotal()]
  ];
  $("#finChips").innerHTML = chips
    .map(
      ([l, v], i) =>
        `<div class="mini" style="animation-delay:${
          i * 0.05
        }s"><div class="lbl">${l}</div><div class="num">${money(v)}</div></div>`
    )
    .join("");
  requestAnimationFrame(() =>
    barChart($("#finBar"), fillBuckets(monthBuckets(12)))
  );

  const debtors = customersAgg().filter((c) => c.total - c.paid > 0);
  $("#debtBody").innerHTML = debtors.length
    ? debtors
        .map(
          (c) => `
    <tr><td><b>${esc(
      c.name
    )}</b></td><td dir="ltr" style="text-align:right">${esc(c.phone)}</td>
    <td>${fa(c.orders)}</td><td>${money(c.total)}</td><td>${money(c.paid)}</td>
    <td class="rem-pos">${money(c.total - c.paid)}</td>
    <td><div class="ops"><button class="ibtn" data-cact="stmt" data-phone="${esc(
      c.phone
    )}" title="چاپ صورت‌حساب">🖨</button></div></td></tr>`
        )
        .join("")
    : '<tr class="empty"><td colspan="7">🎉 هیچ بدهی‌ای وجود ندارد</td></tr>';
}

/* ───────── کاربران ───────── */
function renderUsers() {
  $("#usersBody").innerHTML = DB.users
    .map(
      (u) => `
    <tr><td><b>${esc(
      u.name
    )}</b></td><td dir="ltr" style="text-align:right">${esc(u.username)}</td>
    <td><span class="badge st-b">${ROLES[u.role]}</span></td>
    <td><div class="ops">${
      u.username !== currentUser.username
        ? `<button class="ibtn danger" data-uact="del" data-uid="${u.id}" title="حذف کاربر">🗑️</button>`
        : '<span class="muted">شما</span>'
    }</div></td></tr>`
    )
    .join("");
}

/* ───────── تنظیمات ───────── */
function renderSettings() {
  $("#shopName").value = DB.settings.shop || "";
  $("#snapList").innerHTML = DB.snapshots.length
    ? DB.snapshots
        .map(
          (s, i) => `
    <div class="snap-row"><span>🕐 ${DFt.format(new Date(s.t))} — ${fa(
            s.count
          )} سفارش</span>
    <span class="grow"></span><button class="btn ghost sm" data-snap="${i}">بازیابی</button></div>`
        )
        .join("")
    : '<p class="hint">هنوز نسخهٔ خودکاری ساخته نشده است.</p>';
  $("#logBody").innerHTML =
    DB.logs
      .slice(0, 60)
      .map(
        (l) =>
          `<tr><td>${DFt.format(new Date(l.t))}</td><td><b>${esc(
            l.user
          )}</b></td><td>${esc(l.text)}</td></tr>`
      )
      .join("") ||
    '<tr class="empty"><td colspan="3">تاریخچه‌ای ثبت نشده</td></tr>';
}

/* ───────── نمودارها (Canvas بدون وابستگی) ───────── */
function setupCanvas(cv) {
  const r = cv.getBoundingClientRect(),
    d = window.devicePixelRatio || 1;
  cv.width = r.width * d;
  cv.height = r.height * d;
  const ctx = cv.getContext("2d");
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, W: r.width, H: r.height };
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}
function cssVar(name, fb) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fb
  );
}
function barChart(cv, buckets) {
  if (!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  const pad = { t: 28, b: 26, l: 6, r: 6 };
  const max = Math.max(...buckets.map((b) => b.value), 1);
  const cyan = cssVar("--cy", "#00a6c8"),
    txt2 = cssVar("--txt2", "#667");
  const n = buckets.length,
    bw = (W - pad.l - pad.r) / n,
    w = Math.min(bw * 0.55, 48);
  const rects = buckets.map((b, i) => {
    const h = (b.value / max) * (H - pad.t - pad.b);
    return {
      x: pad.l + bw * i + (bw - w) / 2,
      y: H - pad.b - h,
      w,
      h,
      label: b.label,
      value: b.value
    };
  });
  cv._bars = rects;
  const t0 = performance.now();
  (function frame(t) {
    const p = Math.min((t - t0) / 700, 1),
      e = 1 - Math.pow(1 - p, 3);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cssVar("--border", "#ddd");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, H - pad.b + 0.5);
    ctx.lineTo(W - pad.r, H - pad.b + 0.5);
    ctx.stroke();
    rects.forEach((r) => {
      const hh = r.h * e;
      ctx.fillStyle = cyan;
      if (hh > 1) {
        rr(ctx, r.x, H - pad.b - hh, r.w, hh, 5);
        ctx.fill();
      }
      ctx.fillStyle = txt2;
      ctx.font = "11px Vazirmatn";
      ctx.textAlign = "center";
      ctx.fillText(r.label, r.x + r.w / 2, H - 8);
      if (r.value > 0 && p > 0.85)
        ctx.fillText(fa(r.value), r.x + r.w / 2, H - pad.b - hh - 7);
    });
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
  tipBind(cv);
}
function donut(cv, parts) {
  if (!cv) return;
  const { ctx, W, H } = setupCanvas(cv);
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const cx = W / 2,
    cy = H / 2,
    R = Math.min(W, H) / 2 - 10,
    r = R * 0.62;
  const t0 = performance.now();
  (function frame(t) {
    const p = Math.min((t - t0) / 750, 1),
      e = 1 - Math.pow(1 - p, 3);
    ctx.clearRect(0, 0, W, H);
    let a = -Math.PI / 2;
    parts.forEach((pt) => {
      const sw = (pt.value / total) * Math.PI * 2 * e;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a, a + sw);
      ctx.closePath();
      ctx.fillStyle = pt.color;
      ctx.fill();
      a += sw;
    });
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 7);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = cssVar("--txt", "#111");
    ctx.textAlign = "center";
    ctx.font = "26px Lalezar";
    ctx.fillText(fa(total), cx, cy + 4);
    ctx.font = "11px Vazirmatn";
    ctx.fillStyle = cssVar("--txt2", "#667");
    ctx.fillText("سفارش", cx, cy + 22);
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}
function tipBind(cv) {
  if (cv._tb) return;
  cv._tb = 1;
  cv.addEventListener("mousemove", (e) => {
    const r = cv.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
    const hit = (cv._bars || []).find(
      (b) => x >= b.x && x <= b.x + b.w && y >= b.y - 6
    );
    const tip = $("#chartTip");
    if (hit) {
      tip.style.display = "block";
      tip.style.left = e.clientX + 14 + "px";
      tip.style.top = e.clientY - 34 + "px";
      tip.innerHTML = `${hit.label}: <b>${money(hit.value)}</b>`;
    } else tip.style.display = "none";
  });
  cv.addEventListener(
    "mouseleave",
    () => ($("#chartTip").style.display = "none")
  );
}
let rsT;
window.addEventListener("resize", () => {
  clearTimeout(rsT);
  rsT = setTimeout(() => {
    if (currentPage === "dashboard") renderDashboard();
    if (currentPage === "finance") renderFinance();
  }, 250);
});

/* ───────── چاپ و خروجی ───────── */
function doPrint(html) {
  const pa = $("#printArea");
  pa.innerHTML = html;
  document.body.classList.add("printing");
  const done = () => {
    document.body.classList.remove("printing");
    pa.innerHTML = "";
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  setTimeout(() => window.print(), 80);
}
const paperHead = (title) => `
  <div class="cmyk"><i></i><i></i><i></i><i></i></div>
  <header class="p-head">
    <div><h1>${esc(DB.settings.shop)}</h1><p>${title}</p></div>
    <div class="p-no"><b>تاریخ صدور:</b> ${dFa(
      new Date()
    )}<br><b>اپراتور:</b> ${esc(currentUser.name)}</div>
  </header>`;
function invoiceHTML(o) {
  return `<div class="paper">${paperHead("فاکتور سفارش چاپ")}
    <section class="p-grid">
      <div><b>مشتری:</b> ${esc(o.customer)}</div><div><b>تماس:</b> ${
    o.phone
  }</div>
      <div><b>شماره سفارش:</b> ${fa(o.no)}</div><div><b>تاریخ تحویل:</b> ${
    o.delivery ? dFa(o.delivery) : "—"
  }</div>
      <div style="grid-column:span 2"><b>آدرس:</b> ${esc(
        o.address || "—"
      )}</div>
    </section>
    <table class="p-table">
      <tr><th>شرح کار</th><td>${esc(o.job)}${
    o.desc ? " — " + esc(o.desc) : ""
  }</td></tr>
      <tr><th>تعداد</th><td>${fa(o.qty)}</td></tr>
      <tr><th>رنگ چاپ</th><td>${o.color}</td></tr>
      <tr><th>سایز / جنس</th><td>${esc(o.size || "—")} / ${esc(
    o.material || "—"
  )}</td></tr>
      <tr><th>بسته‌بندی</th><td>${
        o.packaged ? "✔ انجام شده" : "انجام نشده"
      }</td></tr>
    </table>
    <div class="p-money">
      <div>قیمت کل<br><b>${money(o.price)}</b></div>
      <div>مبلغ رسیده<br><b>${money(o.paid)}</b></div>
      <div class="rem">مبلغ الباقی<br><b>${money(remain(o))}</b></div>
    </div>
    <footer><span>از اعتماد شما سپاس‌گزاریم 🌷</span><span>امضا و مهر چاپخانه</span></footer>
  </div>`;
}
function orderRowCells(o) {
  return `<td>${fa(o.no)}</td><td>${dFa(o.date)}</td><td>${esc(
    o.job
  )}</td><td>${esc(o.customer)}</td>
    <td>${fa(o.qty)}</td><td>${money(o.price)}</td><td>${money(o.paid)}</td>
    <td>${money(remain(o))}</td><td>${o.status}</td>`;
}
function listHTML(title, list) {
  const tot = list.reduce((s, o) => s + (+o.price || 0), 0),
    pay = list.reduce((s, o) => s + (+o.paid || 0), 0);
  return `<div class="paper">${paperHead(title)}
    <table class="p-table"><thead><tr>
      <th>شماره</th><th>تاریخ</th><th>نام کار</th><th>سفارش‌دهنده</th><th>تعداد</th>
      <th>قیمت</th><th>دریافتی</th><th>الباقی</th><th>وضعیت</th></tr></thead>
    <tbody>${list.map((o) => `<tr>${orderRowCells(o)}</tr>`).join("")}</tbody>
    <tfoot><tr><th colspan="5">جمع کل (${fa(list.length)} سفارش)</th>
      <th>${money(tot)}</th><th>${money(pay)}</th><th>${money(
    tot - pay
  )}</th><th></th></tr></tfoot></table>
    <footer><span>${esc(
      DB.settings.shop
    )}</span><span>امضا و مهر</span></footer></div>`;
}
function statementHTML(c) {
  const list = DB.orders
    .filter((o) => o.phone === c.phone)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return listHTML(`صورت‌حساب مشتری: ${c.name} — ${c.phone}`, list);
}
function dashPrintHTML() {
  const now = Date.now();
  const rows = [
    ["سفارشات امروز", fa(countSince(dayStart(now)))],
    ["دریافتی امروز", money(incomeSince(dayStart(now)))],
    ["دریافتی ۷ روز اخیر", money(incomeSince(now - 7 * 864e5))],
    ["دریافتی ۳۰ روز اخیر", money(incomeSince(now - 30 * 864e5))],
    ["در حال انجام", fa(stCount("در حال انجام"))],
    ["ثبت‌شده", fa(stCount("ثبت‌شده"))],
    ["تصفیه‌شده", fa(stCount("تصفیه‌شده"))],
    ["مجموع بدهی مشتریان", money(debtTotal())]
  ];
  return `<div class="paper">${paperHead("گزارش روزانهٔ پیشخوان")}
    <table class="p-table">${rows
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join("")}</table>
    <footer><span>${esc(
      DB.settings.shop
    )}</span><span>تهیه‌شده توسط چاپ‌یار</span></footer></div>`;
}
function finPrintHTML() {
  const now = Date.now();
  const rows = [
    ["درآمد امروز", money(incomeSince(dayStart(now)))],
    ["درآمد هفتگی", money(incomeSince(now - 7 * 864e5))],
    ["درآمد ماهانه", money(incomeSince(now - 30 * 864e5))],
    [
      "مجموع دریافتی‌ها",
      money(DB.orders.reduce((s, o) => s + (+o.paid || 0), 0))
    ],
    ["مجموع فروش", money(DB.orders.reduce((s, o) => s + (+o.price || 0), 0))],
    ["مجموع بدهی مشتریان", money(debtTotal())]
  ];
  const debtors = customersAgg().filter((c) => c.total - c.paid > 0);
  return `<div class="paper">${paperHead("گزارش مالی")}
    <table class="p-table">${rows
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join("")}</table>
    ${
      debtors.length
        ? `<h3 style="margin:14px 0 8px;font-size:15px">بدهکاران</h3>
    <table class="p-table"><tr><th>مشتری</th><th>تماس</th><th>خرید</th><th>پرداختی</th><th>بدهی</th></tr>
    ${debtors
      .map(
        (c) =>
          `<tr><td>${esc(c.name)}</td><td>${c.phone}</td><td>${money(
            c.total
          )}</td><td>${money(c.paid)}</td><td>${money(
            c.total - c.paid
          )}</td></tr>`
      )
      .join("")}</table>`
        : ""
    }
    <footer><span>${esc(
      DB.settings.shop
    )}</span><span>امضا و مهر</span></footer></div>`;
}
function exportCSV() {
  const rows = filteredOrders();
  const head = [
    "شماره",
    "تاریخ",
    "نام کار",
    "سفارش‌دهنده",
    "تماس",
    "تعداد",
    "رنگ",
    "سایز",
    "جنس",
    "بسته‌بندی",
    "قیمت",
    "دریافتی",
    "باقیمانده",
    "وضعیت"
  ];
  const lines = [
    head,
    ...rows.map((o) => [
      fa(o.no),
      dFa(o.date),
      o.job,
      o.customer,
      o.phone,
      o.qty,
      o.color,
      o.size,
      o.material,
      o.packaged ? "بلی" : "نخیر",
      o.price,
      o.paid,
      remain(o),
      o.status
    ])
  ];
  const csv =
    "\uFEFF" +
    lines
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  a.download = "سفارشات-چاپیار.csv";
  a.click();
  log(currentUser.name, "خروجی CSV گرفت");
  save();
  toast("فایل CSV دانلود شد ⬇");
}

/* ───────── مودال و توست ───────── */
function openModal(id) {
  $("#" + id).classList.add("open");
}
function closeModals() {
  $$(".modal.open").forEach((m) => m.classList.remove("open"));
}
function confirmDialog(msg) {
  $("#confirmText").textContent = msg;
  openModal("modalConfirm");
  return new Promise((res) => {
    confirmRes = res;
  });
}
function toast(msg, type = "ok") {
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  $("#toasts").appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 380);
  }, 3300);
}

/* ───────── تم ───────── */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem("ps_theme", t);
  $("#themeToggle").textContent = t === "dark" ? "☀️" : "🌙";
}

/* ───────── اتصال رویدادها ───────── */
function bind() {
  /* ورود */
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (doLogin($("#loginUser").value.trim(), $("#loginPass").value)) {
      $("#loginErr").textContent = "";
      enterApp();
    } else $("#loginErr").textContent = "نام کاربری یا رمز عبور اشتباه است!";
  });
  $$(".demo-btn").forEach((b) =>
    b.addEventListener("click", () => {
      $("#loginUser").value = b.dataset.u;
      $("#loginPass").value = b.dataset.p;
      $("#loginForm").requestSubmit();
    })
  );
  const words = [
    "کارت ویزیت",
    "بنر و فلکس",
    "بروشور",
    "سررسید",
    "پوستر",
    "کاتالوگ",
    "تراکت",
    "دعوتنامه"
  ];
  let wi = 0;
  setInterval(() => {
    const el = $("#rotWord");
    if (!el) return;
    el.classList.add("fade");
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      el.textContent = words[wi];
      el.classList.remove("fade");
    }, 380);
  }, 1900);

  /* ناوبری و پوسته */
  $("#navList").addEventListener("click", (e) => {
    const n = e.target.closest(".nav-item");
    if (n) navigate(n.dataset.page);
  });
  $("#logoutBtn").addEventListener("click", logout);
  $("#themeToggle").addEventListener("click", () =>
    applyTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark"
    )
  );
  $("#hamburger").addEventListener("click", () =>
    document.body.classList.toggle("side-open")
  );
  $("#sideOverlay").addEventListener("click", () =>
    document.body.classList.remove("side-open")
  );

  /* جستجوی سراسری */
  let sT;
  $("#globalSearch").addEventListener("input", (e) => {
    clearTimeout(sT);
    sT = setTimeout(() => {
      F.q = e.target.value;
      if (currentPage !== "orders") navigate("orders");
      else renderOrders();
    }, 180);
  });
  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey && e.key.toLowerCase() === "k") ||
      (e.key === "/" &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))
    ) {
      e.preventDefault();
      $("#globalSearch").focus();
    }
    if (e.key === "Escape") closeModals();
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModals();
  });

  /* داشبورد */
  $("#btnPrintDash").addEventListener("click", () => doPrint(dashPrintHTML()));

  /* فیلترها و جدول سفارشات */
  $("#fltStatus").addEventListener("change", (e) => {
    F.status = e.target.value;
    renderOrders();
  });
  $("#fltRange").addEventListener("change", (e) => {
    F.range = e.target.value;
    renderOrders();
  });
  $("#fltClear").addEventListener("click", () => {
    F = { q: "", status: "", range: "" };
    $("#globalSearch").value = "";
    $("#fltStatus").value = "";
    $("#fltRange").value = "";
    renderOrders();
  });
  $("#statusChips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    F.status = c.dataset.st;
    $("#fltStatus").value = F.status;
    renderOrders();
  });
  $("#btnGoNew").addEventListener("click", () => navigate("neworder"));
  $("#btnPrintOrders").addEventListener("click", () =>
    doPrint(listHTML("فهرست سفارشات", filteredOrders()))
  );
  $("#btnCSV").addEventListener("click", exportCSV);

  $("#ordersBody").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const tr = btn.closest("tr"),
      o = DB.orders.find((x) => x.id === tr.dataset.id);
    if (!o) return;
    const act = btn.dataset.act;
    if (act === "invoice") doPrint(invoiceHTML(o));
    if (act === "edit") openEdit(o);
    if (act === "reg") {
      o.status = "ثبت‌شده";
      log(currentUser.name, `سفارش ${fa(o.no)} را به «ثبت‌شده» منتقل کرد`);
      save();
      renderOrders();
      toast("به بخش ثبت‌شده منتقل شد 🗂");
    }
    if (act === "settle") {
      o.paid = o.price;
      o.status = "تصفیه‌شده";
      log(currentUser.name, `سفارش ${fa(o.no)} را تصفیه کرد`);
      save();
      renderOrders();
      toast("سفارش تصفیه شد ✅");
    }
    if (act === "del") {
      if (
        await confirmDialog(`سفارش ${fa(o.no)} «${o.job}» برای همیشه حذف شود؟`)
      ) {
        DB.orders = DB.orders.filter((x) => x.id !== o.id);
        log(currentUser.name, `سفارش ${fa(o.no)} (${o.job}) را حذف کرد`);
        save();
        renderOrders();
        toast("سفارش حذف شد 🗑", "info");
      }
    }
  });
  $("#ordersBody").addEventListener("change", (e) => {
    const cb = e.target.closest("[data-pack]");
    if (!cb) return;
    const o = DB.orders.find((x) => x.id === cb.dataset.pack);
    if (!o) return;
    o.packaged = cb.checked;
    log(
      currentUser.name,
      `بسته‌بندی سفارش ${fa(o.no)} را «${cb.checked ? "انجام" : "ناتمام"}» کرد`
    );
    save();
  });

  /* مشتریان و مالی */
  $("#btnPrintCusts").addEventListener("click", () => {
    const list = customersAgg();
    doPrint(`<div class="paper">${paperHead("فهرست مشتریان و حساب‌ها")}
      <table class="p-table"><tr><th>مشتری</th><th>تماس</th><th>سفارشات</th><th>خرید</th><th>پرداختی</th><th>بدهی</th></tr>
      ${list
        .map(
          (c) =>
            `<tr><td>${esc(c.name)}</td><td>${c.phone}</td><td>${fa(
              c.orders
            )}</td><td>${money(c.total)}</td><td>${money(
              c.paid
            )}</td><td>${money(c.total - c.paid)}</td></tr>`
        )
        .join("")}</table>
      <footer><span>${esc(
        DB.settings.shop
      )}</span><span>امضا و مهر</span></footer></div>`);
  });
  $("#btnPrintFin").addEventListener("click", () => doPrint(finPrintHTML()));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cact]");
    if (!b) return;
    const c = customersAgg().find((x) => x.phone === b.dataset.phone);
    if (!c) return;
    if (b.dataset.cact === "stmt") doPrint(statementHTML(c));
    if (b.dataset.cact === "view") {
      F = { q: c.phone, status: "", range: "" };
      $("#fltStatus").value = "";
      $("#fltRange").value = "";
      navigate("orders");
      toast(`نمایش سفارشات «${c.name}»`, "info");
    }
  });

  /* کاربران */
  $("#userForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#ufName").value.trim(),
      username = $("#ufUser").value.trim(),
      pass = $("#ufPass").value;
    if (!name || !username || !pass) return;
    if (DB.users.some((u) => u.username === username)) {
      toast("این نام کاربری تکراری است", "err");
      return;
    }
    DB.users.push({
      id: uid(),
      username,
      pass,
      name,
      role: $("#ufRole").value
    });
    log(currentUser.name, `کاربر «${name}» را افزود`);
    save();
    renderUsers();
    e.target.reset();
    toast("کاربر جدید افزوده شد ✔");
  });
  $("#usersBody").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-uact]");
    if (!b) return;
    const u = DB.users.find((x) => x.id === b.dataset.uid);
    if (!u) return;
    if (await confirmDialog(`کاربر «${u.name}» حذف شود؟`)) {
      DB.users = DB.users.filter((x) => x.id !== u.id);
      log(currentUser.name, `کاربر «${u.name}» را حذف کرد`);
      save();
      renderUsers();
      toast("کاربر حذف شد", "info");
    }
  });

  /* تنظیمات */
  $("#btnShop").addEventListener("click", () => {
    DB.settings.shop = $("#shopName").value.trim() || DB.settings.shop;
    log(currentUser.name, "نام چاپخانه را تغییر داد");
    save();
    toast("نام چاپخانه ذخیره شد ✔");
  });
  $("#dlBackup").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(DB, null, 1)], { type: "application/json" })
    );
    a.download = `chapyar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    log(currentUser.name, "پشتیبان کامل دانلود کرد");
    save();
    toast("نسخهٔ پشتیبان دانلود شد ⬇");
  });
  $("#fileRestore").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data.orders || !data.users) throw 0;
      if (
        await confirmDialog(
          "اطلاعات فعلی با فایل پشتیبان جایگزین می‌شود. ادامه می‌دهید؟"
        )
      ) {
        DB.orders = data.orders;
        DB.users = data.users;
        DB.settings = data.settings || DB.settings;
        log(currentUser.name, "اطلاعات را از فایل پشتیبان بازیابی کرد");
        save();
        renderCurrent();
        toast("بازیابی با موفقیت انجام شد ✔");
      }
    } catch (err) {
      toast("فایل انتخابی معتبر نیست", "err");
    }
    e.target.value = "";
  });
  $("#snapList").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-snap]");
    if (!b) return;
    const s = DB.snapshots[+b.dataset.snap];
    if (!s) return;
    if (await confirmDialog("این نسخهٔ خودکار بازیابی شود؟")) {
      const d = JSON.parse(s.data);
      DB.orders = d.orders;
      DB.users = d.users;
      DB.settings = d.settings;
      log(currentUser.name, "از نسخهٔ خودکار بازیابی کرد");
      save();
      renderCurrent();
      toast("بازیابی شد ✔");
    }
  });
  $("#btnSample").addEventListener("click", async () => {
    if (
      await confirmDialog(
        "داده‌های نمونه دوباره بارگذاری شود؟ اطلاعات فعلی حذف می‌شود."
      )
    ) {
      localStorage.removeItem(KEY);
      seed();
      renderCurrent();
      toast("داده‌های نمونه بازگردانده شد");
    }
  });
  $("#btnEmpty").addEventListener("click", async () => {
    if (await confirmDialog("تمام سفارشات برای همیشه پاک شوند؟")) {
      DB.orders = [];
      log(currentUser.name, "تمام سفارشات را پاک کرد");
      save();
      renderCurrent();
      toast("سفارشات پاک شد", "info");
    }
  });

  /* مودال تأیید */
  $("#confirmYes").addEventListener("click", () => {
    closeModals();
    confirmRes?.(true);
    confirmRes = null;
  });
  $("#confirmNo").addEventListener("click", () => {
    closeModals();
    confirmRes?.(false);
    confirmRes = null;
  });
}

/* ───────── شروع برنامه ───────── */
function init() {
  applyTheme(localStorage.getItem("ps_theme") || "light");
  ensureDB();
  bind();
  const s = sessionStorage.getItem("ps_user");
  if (s) {
    currentUser = JSON.parse(s);
    enterApp(false);
  }
}
init();
