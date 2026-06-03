const STORAGE_KEY = "tabletke-v1";

const MONTHS_SL = [
  "Januar", "Februar", "Marec", "April", "Maj", "Junij",
  "Julij", "Avgust", "September", "Oktober", "November", "December"
];
const DAYS_SL = ["nedelja", "ponedeljek", "torek", "sreda", "četrtek", "petek", "sobota"];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function dateKey(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

const state = {
  data: loadData(),
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth()
};

const todayDateEl = document.getElementById("today-date");
const statusPhotoEl = document.getElementById("status-photo");
const statusBadgeEl = document.getElementById("status-badge");
const statusTextEl = document.getElementById("status-text");
const btnTaken = document.getElementById("btn-taken");
const btnTakenLabel = document.getElementById("btn-taken-label");
const streakEl = document.getElementById("streak");
const totalTakenEl = document.getElementById("total-taken");
const monthTitle = document.getElementById("month-title");
const calendarEl = document.getElementById("calendar");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

function formatTodayDate() {
  const t = new Date();
  const dayName = DAYS_SL[t.getDay()];
  return `${dayName}, ${t.getDate()}. ${MONTHS_SL[t.getMonth()].toLowerCase()} ${t.getFullYear()}`;
}

function isTaken(key) {
  return state.data[key] === "taken";
}

function computeStreak() {
  let streak = 0;
  const t = new Date();
  for (let i = 0; i < 1000; i++) {
    const d = new Date(t);
    d.setDate(t.getDate() - i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (isTaken(key)) {
      streak++;
    } else if (i === 0) {
      continue; // today not yet marked — count yesterday onwards
    } else {
      break;
    }
  }
  return streak;
}

function computeTotal() {
  return Object.values(state.data).filter(v => v === "taken").length;
}

function renderToday() {
  todayDateEl.textContent = formatTodayDate();
  const key = todayKey();
  const taken = isTaken(key);

  if (taken) {
    statusBadgeEl.textContent = "🌸";
    statusTextEl.textContent = "Bravo! Vzela si jo danes 💕";
    btnTaken.classList.add("done");
    statusPhotoEl.classList.add("done");
  } else {
    statusBadgeEl.textContent = "💖";
    statusTextEl.textContent = "Ali si že vzela tableto?";
    btnTaken.classList.remove("done");
    statusPhotoEl.classList.remove("done");
  }
  btnTakenLabel.textContent = "✓";
}

function renderStats() {
  streakEl.textContent = computeStreak();
  totalTakenEl.textContent = computeTotal();
}

function renderCalendar() {
  const year = state.viewYear;
  const month = state.viewMonth;
  monthTitle.textContent = `${MONTHS_SL[month]} ${year}`;

  calendarEl.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1; // monday-first
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement("div");
    el.className = "day empty";
    calendarEl.appendChild(el);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const el = document.createElement("div");
    el.className = "day";
    el.textContent = day;
    const key = dateKey(year, month, day);

    const isTodayCell = year === todayY && month === todayM && day === todayD;
    const isFuture =
      year > todayY ||
      (year === todayY && month > todayM) ||
      (year === todayY && month === todayM && day > todayD);

    if (isTaken(key)) el.classList.add("taken");
    if (isTodayCell) el.classList.add("today");
    if (isFuture) el.classList.add("future");

    if (!isFuture) {
      el.addEventListener("click", () => {
        if (isTaken(key)) {
          delete state.data[key];
        } else {
          state.data[key] = "taken";
          if (isTodayCell) celebrate();
        }
        saveData(state.data);
        renderAll();
      });
    }

    calendarEl.appendChild(el);
  }
}

function renderAll() {
  renderToday();
  renderStats();
  renderCalendar();
}

btnTaken.addEventListener("click", () => {
  const key = todayKey();
  if (isTaken(key)) {
    delete state.data[key];
  } else {
    state.data[key] = "taken";
    celebrate();
  }
  saveData(state.data);
  renderAll();
});

prevMonthBtn.addEventListener("click", () => {
  state.viewMonth--;
  if (state.viewMonth < 0) {
    state.viewMonth = 11;
    state.viewYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  state.viewMonth++;
  if (state.viewMonth > 11) {
    state.viewMonth = 0;
    state.viewYear++;
  }
  renderCalendar();
});

function celebrate() {
  const emojis = ["💖", "🌸", "✨", "💕", "🌷", "🎀"];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement("div");
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.position = "fixed";
    el.style.left = Math.random() * 100 + "vw";
    el.style.top = "-40px";
    el.style.fontSize = 22 + Math.random() * 18 + "px";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.transition = "transform 2.5s ease-out, opacity 2.5s ease-out";
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${window.innerHeight + 60}px) rotate(${(Math.random() - 0.5) * 360}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 2700);
  }
}

renderAll();
