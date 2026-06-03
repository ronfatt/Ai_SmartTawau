const form = document.querySelector("#reportForm");
const appShell = document.querySelector(".app-shell");
const pages = Array.from(document.querySelectorAll(".form-page"));
const indicators = Array.from(document.querySelectorAll("[data-step-indicator]"));
const nextButtons = Array.from(document.querySelectorAll("[data-next]"));
const backButtons = Array.from(document.querySelectorAll("[data-back]"));
const photoInput = document.querySelector("#photoInput");
const photoPreview = document.querySelector("#photoPreview");
const uploadZone = document.querySelector(".add-photo-card");
const locationBtn = document.querySelector("#locationBtn");
const locationStatus = document.querySelector("#locationStatus");
const locationText = document.querySelector("#locationText");
const descriptionInput = document.querySelector("#description");
const descriptionCounter = document.querySelector("#descriptionCounter");
const reportBackBtn = document.querySelector("#reportBackBtn");
const reportHelpBtn = document.querySelector("#reportHelpBtn");
const locationHelpBtn = document.querySelector("#locationHelpBtn");
const reviewHelpBtn = document.querySelector("#reviewHelpBtn");
const editDetailsBtn = document.querySelector("#editDetailsBtn");
const reportNearbyHint = document.querySelector("#reportNearbyHint");
const summaryCard = document.querySelector("#summaryCard");
const resultPanel = document.querySelector("#resultPanel");
const newAduanAction = document.querySelector("#newAduanAction");
const trackAction = document.querySelector("#trackAction");
const nearbyAction = document.querySelector("#nearbyAction");
const helpAction = document.querySelector("#helpAction");
const notificationsButton = document.querySelector("#notificationsButton");
const navAduan = document.querySelector("#navAduan");
const navHome = document.querySelector("#navHome");
const navTrack = document.querySelector("#navTrack");
const navNearby = document.querySelector("#navNearby");
const navProfile = document.querySelector("#navProfile");
const utilityPanel = document.querySelector("#utilityPanel");
const navItems = Array.from(document.querySelectorAll(".bottom-nav a"));
const categoryGrid = document.querySelector(".category-grid");
const glanceStats = document.querySelector(".glance-stats");

let currentPage = 1;
let coordinates = null;
const MOCK_DATA = {
  categories: [
    { value: "Sampah", label: "Sampah", icon: "garbage" },
    { value: "Kerosakan Jalan", label: "Kerosakan Jalan", icon: "road" },
    { value: "Saliran", label: "Saliran", icon: "drain" },
    { value: "Lampu Jalan", label: "Lampu Jalan", icon: "light" },
    { value: "Kemudahan Awam", label: "Kemudahan Awam", icon: "facility" },
    { value: "Kebersihan", label: "Kebersihan", icon: "clean" },
  ],
  case: {
    caseNumber: "TAW-2026-000128",
    category: "Kerosakan Jalan",
    location: "Jalan Apas, 91000 Tawau, Sabah, Malaysia",
    status: "Sedang Diproses",
    reportedAt: "03 Jun 2026, 09:41 pagi",
    description: "Lubang besar di tepi jalan yang boleh membahayakan trafik.",
    summary: "Kerosakan jalan dilaporkan di Jalan Apas. Foto dilampirkan. Memerlukan pemeriksaan.",
    timeline: [
      { title: "Diterima", description: "Aduan anda telah diterima.", state: "done" },
      { title: "Disahkan", description: "Isu telah disahkan oleh pasukan kami.", state: "done" },
      { title: "Ditugaskan", description: "Ditugaskan kepada jabatan berkaitan.", state: "done" },
      { title: "Sedang Diproses", description: "Kerja sedang dijalankan.", state: "current" },
      { title: "Selesai", description: "Kami akan memaklumkan anda selepas selesai.", state: "future" },
    ],
  },
  stats: {
    issuesReported: 128,
    inProgress: 94,
    resolved: 76,
  },
};
let latestCaseNumber = MOCK_DATA.case.caseNumber;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attrsToString(attrs = {}) {
  return Object.entries(attrs)
    .filter(([, value]) => value !== false && value !== null && value !== undefined)
    .map(([key, value]) => (value === true ? key : `${key}="${escapeHtml(String(value))}"`))
    .join(" ");
}

function ButtonPrimary(label, attrs = {}) {
  return `<button class="ButtonPrimary primary-btn ${attrs.class || ""}" ${attrsToString({ ...attrs, class: null, type: attrs.type || "button" })}>${label}</button>`;
}

function ButtonSecondary(label, attrs = {}) {
  return `<button class="ButtonSecondary ghost-btn ${attrs.class || ""}" ${attrsToString({ ...attrs, class: null, type: attrs.type || "button" })}>${label}</button>`;
}

function StatusBadge(label, tone = "pending") {
  return `<span class="StatusBadge status-pill status-pill--${tone}">${escapeHtml(label)}</span>`;
}

function CategoryChip({ value, label, icon, checked = false }) {
  return `
    <label class="CategoryChip">
      <input type="radio" name="category" value="${escapeHtml(value)}" ${checked ? "checked" : ""} />
      <span><i class="cat-icon cat-icon--${escapeHtml(icon)}"></i>${escapeHtml(label)}</span>
    </label>
  `;
}

function TimelineItem({ title, description, state = "future" }) {
  const stateClass = state === "done" ? "is-done" : state === "current" ? "is-current" : "";
  const marker = state === "done" ? "✓" : state === "current" ? "•" : "";
  return `<div class="TimelineItem timeline-step ${stateClass}"><span>${marker}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div></div>`;
}

function CaseCard({ caseId, category, location, meta, status, tone = "pending", variant = "recent" }) {
  const title = variant === "nearby" ? category : caseId;
  const detail = variant === "nearby" ? location : category;
  const secondary = variant === "nearby" ? meta : location;
  return `
    <button class="PremiumSurfaceCard CaseCard ${variant}-case-card mini-case-button" data-case-id="${escapeHtml(caseId)}" type="button">
      <div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small><small>${escapeHtml(secondary)}</small></div>
      <div>${StatusBadge(status, tone)}${variant !== "nearby" && meta ? `<time>${escapeHtml(meta)}</time>` : ""}</div>
    </button>
  `;
}

function QuickActionCard({ id, title, subtitle, iconClass, variant = "" }) {
  return `
    <button class="ActionCard QuickActionCard action-card ${variant}" id="${escapeHtml(id)}" type="button">
      <span class="action-icon ${escapeHtml(iconClass)}"></span>
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(subtitle)}</small>
    </button>
  `;
}

function StatsCard({ title, label, stats }) {
  return `
    <section class="PremiumSurfaceCard StatsCard glance-card" aria-label="${escapeHtml(title)}">
      <div class="glance-head"><h2>${escapeHtml(title)}</h2><span>${escapeHtml(label)}</span></div>
      <div class="glance-stats">
        ${stats.map((stat) => `<div class="StatMetric"><small>${escapeHtml(stat.label)}</small><strong>${escapeHtml(String(stat.value))}</strong></div>`).join("")}
      </div>
    </section>
  `;
}

function PhotoUploadCard({ inputId = "photoInput", previewId = "photoPreview" } = {}) {
  return `
    <label class="PhotoUploadCard add-photo-card" for="${escapeHtml(inputId)}">
      <input id="${escapeHtml(inputId)}" name="photo" type="file" accept="image/*" capture="environment" />
      <span class="camera-mini-icon"></span>
      <strong>Tambah Foto</strong>
      <img id="${escapeHtml(previewId)}" alt="" />
    </label>
  `;
}

function AddressCard({ textareaId = "locationText", value }) {
  return `
    <label class="AddressCard address-card">
      <span>Alamat</span>
      <textarea id="${escapeHtml(textareaId)}" name="location" rows="3" required>${escapeHtml(value)}</textarea>
    </label>
  `;
}

function NotificationItem({ caseId, title, time, date, tone = "success", icon = "✓", badge, badgeTone = "success" }) {
  return `
    <button class="NotificationItem notification-item notification-item--${tone} mini-case-button" data-case-id="${escapeHtml(caseId)}" type="button">
      <span class="notification-status-icon">${escapeHtml(icon)}</span>
      <div><strong>${escapeHtml(title)}</strong><small>No. Kes ${escapeHtml(caseId)}</small>${badge ? StatusBadge(badge, badgeTone) : ""}</div>
      <time><b>${escapeHtml(time)}</b><span>${escapeHtml(date)}</span></time>
    </button>
  `;
}

function BottomTabBar(items) {
  return `
    <nav class="FloatingBottomNav BottomTabBar bottom-nav" aria-label="Navigasi aplikasi">
      ${items
        .map(
          (item) => `
            <a class="${item.current ? "is-current" : ""}" href="${escapeHtml(item.href)}" id="${escapeHtml(item.id)}">
              <span class="${escapeHtml(item.iconClass)}"></span>
              <small>${escapeHtml(item.label)}</small>
            </a>
          `,
        )
        .join("")}
    </nav>
  `;
}

function ScreenHeader({ title, backId, helpId, backAttrs = "" }) {
  const leftAttrs = backId ? `id="${escapeHtml(backId)}"` : backAttrs;
  return `
    <div class="ScreenHeader screen-topbar">
      <button class="screen-icon-btn" type="button" ${leftAttrs} aria-label="Kembali">‹</button>
      <h2>${escapeHtml(title)}</h2>
      <button class="screen-icon-btn" type="button" id="${escapeHtml(helpId)}" aria-label="Bantuan">?</button>
    </div>
  `;
}

function statusTone(status) {
  if (["Completed", "Resolved", "Selesai", "Telah Diselesaikan"].includes(status)) return "success";
  if (["Action Needed", "Perlu Tindakan", "Maklumat Diperlukan"].includes(status)) return "warning";
  return "pending";
}

function renderMockData() {
  if (categoryGrid) {
    categoryGrid.innerHTML = MOCK_DATA.categories
      .map((category) => CategoryChip({ ...category, checked: category.value === MOCK_DATA.case.category }))
      .join("");
  }

  if (glanceStats) {
    glanceStats.innerHTML = `
      <div class="StatMetric"><span class="stat-icon stat-icon--reported"></span><small>Aduan Dilaporkan</small><strong>${MOCK_DATA.stats.issuesReported}</strong></div>
      <div class="StatMetric"><span class="stat-icon stat-icon--progress"></span><small>Sedang Diproses</small><strong>${MOCK_DATA.stats.inProgress}</strong></div>
      <div class="StatMetric"><span class="stat-icon stat-icon--resolved"></span><small>Selesai</small><strong>${MOCK_DATA.stats.resolved}</strong></div>
    `;
  }

  if (locationText) {
    locationText.value = MOCK_DATA.case.location;
  }

  if (descriptionInput && !descriptionInput.value.trim()) {
    descriptionInput.value = MOCK_DATA.case.description;
    descriptionCounter.textContent = `${descriptionInput.value.length}/500`;
  }
}

function updateRoute(path, replace = false) {
  if (window.location.pathname === path) return;
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", path);
}

function reportRouteForPage(pageNumber) {
  if (pageNumber === 3) return "/report/location";
  if (pageNumber === 4) return "/report/review";
  return "/report";
}

function showPage(pageNumber, options = {}) {
  currentPage = pageNumber;
  appShell.classList.remove("is-home", "is-welcome");
  appShell.classList.remove("is-utility", "is-submitted");
  appShell.classList.add("is-reporting");
  form.style.display = "";
  document.querySelector(".progress-panel").style.display = "";
  resultPanel.classList.remove("is-visible");
  if (!options.skipRoute) {
    updateRoute(reportRouteForPage(currentPage));
  }
  pages.forEach((page) => {
    page.classList.toggle("is-active", Number(page.dataset.page) === currentPage);
  });
  indicators.forEach((indicator) => {
    indicator.classList.toggle("is-active", Number(indicator.dataset.stepIndicator) === currentPage);
  });
  if (currentPage === 4) {
    renderSummary();
  }
  setActiveNav(navAduan);
}

function selectedCategory() {
  const checked = document.querySelector('input[name="category"]:checked');
  return checked ? checked.value : "Belum dipilih";
}

function renderSummary() {
  const description = escapeHtml(document.querySelector("#description").value.trim() || MOCK_DATA.case.description);
  const location = escapeHtml(locationText.value.trim() || MOCK_DATA.case.location);
  const locationDetail = coordinates
    ? `${location} (${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)})`
    : location;
  const category = escapeHtml(selectedCategory() || MOCK_DATA.case.category);

  summaryCard.innerHTML = `
    <div class="review-status">${StatusBadge("Sedia Dihantar", "success")}</div>
    <div class="review-main">
      <div class="review-thumb ${photoInput.files.length ? "has-upload" : ""}">
        ${photoInput.files.length && photoPreview.src ? `<img src="${photoPreview.src}" alt="Foto isu dimuat naik" />` : `<span class="camera-mini-icon"></span>`}
      </div>
      <div class="review-details">
        <div class="summary-row"><span>Kategori</span><strong>${category}</strong></div>
        <div class="summary-row"><span>Alamat</span><strong>${locationDetail}</strong></div>
        <div class="summary-row summary-row--stack"><span>Penerangan</span><strong>${description}</strong></div>
      </div>
    </div>
    <div class="ai-summary">
      <span>Ringkasan Isu:</span>
      <p>${escapeHtml(MOCK_DATA.case.summary)}</p>
    </div>
  `;
}

function createCaseNumber() {
  return MOCK_DATA.case.caseNumber;
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextPage = currentPage === 1 ? 3 : Math.min(currentPage + 1, 4);
    showPage(nextPage);
  });
});

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const previousPage = currentPage === 3 ? 1 : Math.max(currentPage - 1, 1);
    showPage(previousPage);
  });
});

function setActiveNav(activeItem) {
  navItems.forEach((item) => item.classList.toggle("is-current", item === activeItem));
}

function focusReportStart(options = {}) {
  appShell.classList.remove("is-home", "is-welcome");
  appShell.classList.remove("is-utility");
  form.style.display = "";
  document.querySelector(".progress-panel").style.display = "";
  resultPanel.classList.remove("is-visible");
  showPage(1, { skipRoute: options.skipRoute });
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveNav(navAduan);
}

function showHome(options = {}) {
  resultPanel.classList.remove("is-visible");
  form.style.display = "";
  document.querySelector(".progress-panel").style.display = "";
  showPage(1, { skipRoute: true });
  appShell.classList.remove("is-reporting", "is-submitted", "is-utility", "is-welcome");
  appShell.classList.add("is-home");
  if (!options.skipRoute) updateRoute("/home");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setActiveNav(navHome);
}

function showUtility(type, options = {}) {
  appShell.classList.remove("is-home", "is-reporting", "is-submitted", "is-welcome");
  appShell.classList.add("is-utility");
  resultPanel.classList.remove("is-visible");
  form.style.display = "";
  document.querySelector(".progress-panel").style.display = "";

  const mockCase = MOCK_DATA.case;
  const recentCases = [
    { caseId: mockCase.caseNumber, category: mockCase.category, location: mockCase.location, meta: "03 Jun", status: mockCase.status, tone: statusTone(mockCase.status) },
    { caseId: "TAW-2026-000097", category: "Sampah", location: "Kawasan Kubota", meta: "02 Jun", status: "Selesai", tone: "success" },
    { caseId: "TAW-2026-000082", category: "Saliran", location: "Kawasan Fajar", meta: "01 Jun", status: "Perlu Tindakan", tone: "warning" },
  ];
  const nearbyCases = [
    { caseId: mockCase.caseNumber, category: mockCase.category, location: "Kawasan Jalan Apas", meta: "1.2 km dari sini · 03 Jun", status: mockCase.status, tone: statusTone(mockCase.status), variant: "nearby" },
    { caseId: "TAW-2026-000097", category: "Sampah", location: "Kawasan Kubota", meta: "1.8 km dari sini · 02 Jun", status: "Selesai", tone: "success", variant: "nearby" },
    { caseId: "TAW-2026-000082", category: "Saliran", location: "Kawasan Fajar", meta: "2.1 km dari sini · 01 Jun", status: "Perlu Tindakan", tone: "warning", variant: "nearby" },
    { caseId: "TAW-2026-000087", category: "Lampu Jalan", location: "Kawasan Taman Semarak", meta: "2.4 km dari sini · 01 Jun", status: "Menunggu", tone: "pending", variant: "nearby" },
  ];
  const notifications = [
    { caseId: mockCase.caseNumber, title: "Aduan anda telah diterima", time: "09:41 pagi", date: "03 Jun" },
    { caseId: mockCase.caseNumber, title: "Aduan anda telah disahkan", time: "11:20 pagi", date: "03 Jun" },
    { caseId: mockCase.caseNumber, title: "Aduan anda telah ditugaskan", time: "01:15 petang", date: "03 Jun", tone: "info", icon: "👥" },
    { caseId: mockCase.caseNumber, title: "Kerja sedang dijalankan", time: "09:30 pagi", date: "04 Jun", tone: "info", icon: "⚙" },
    { caseId: "TAW-2026-000097", title: "Aduan anda telah selesai", time: "04:45 petang", date: "04 Jun", badge: "Selesai", badgeTone: "success" },
    { caseId: "TAW-2026-000082", title: "Maklumat lanjut diperlukan", time: "10:05 pagi", date: "05 Jun", tone: "warning", icon: "!", badge: "Perlu Tindakan", badgeTone: "warning" },
  ];

  const screens = {
    track: `
      <section class="utility-card">
        <h2>Semak Aduan</h2>
        <p>Semak tanpa log masuk yang rumit. Tampal nombor kes anda di bawah.</p>
        <div class="case-search track-search">
          <label>
            <span>Masukkan nombor kes</span>
            <input type="text" inputmode="text" autocapitalize="characters" spellcheck="false" value="${mockCase.caseNumber}" placeholder="Contoh: ${mockCase.caseNumber}" />
          </label>
          ${ButtonPrimary("Semak Kes", { "data-case-id": mockCase.caseNumber })}
        </div>
      </section>
      <section class="utility-card">
        <h2>Kes Terkini</h2>
        <div class="case-list recent-case-list">
          ${recentCases.map((item) => CaseCard(item)).join("")}
        </div>
      </section>
    `,
    nearby: `
      <section class="utility-card nearby-screen">
        <h2>Aduan Berdekatan</h2>
        <p>Semak aduan awam berhampiran sebelum menghantar aduan yang sama.</p>
        <div class="map-card compact-map nearby-map">
          <div class="map-grid"></div>
          <div class="map-pin"></div>
          <p>Peta aduan awam sekitar Jalan Apas, Fajar dan Kubota.</p>
        </div>
        <div class="filter-chips" aria-label="Tapisan aduan berdekatan">
          <button class="is-active" type="button">Semua</button>
          <button type="button">Sampah</button>
          <button type="button">Kerosakan Jalan</button>
          <button type="button">Saliran</button>
          <button type="button">Lampu Jalan</button>
        </div>
        <div class="duplicate-hint">
          <strong>Isu ini mungkin telah dilaporkan.</strong>
          <span>Ikuti kes ini?</span>
          <button data-case-id="${mockCase.caseNumber}" type="button">Ikuti Kes</button>
        </div>
        <div class="case-list nearby-case-list">
          ${nearbyCases.map((item) => CaseCard(item)).join("")}
        </div>
      </section>
    `,
    help: `
      <section class="utility-card">
        <h2>Bantuan / Soalan Lazim</h2>
        <p>Jawapan ringkas untuk penduduk yang menggunakan Tawau Aduan.</p>
        <div class="profile-list">
          <div class="profile-item"><span class="mini-icon">?</span><div><strong>Bagaimana saya membuat aduan?</strong><small>Tambah foto, pilih kategori, tetapkan lokasi, kemudian hantar.</small></div></div>
          <div class="profile-item"><span class="mini-icon">#</span><div><strong>Di mana nombor kes saya?</strong><small>Nombor kes muncul selepas penghantaran dan dalam notifikasi.</small></div></div>
          <div class="profile-item"><span class="mini-icon">☎</span><div><strong>Perlu bantuan?</strong><small>Hubungi sokongan respons sivik.</small></div></div>
        </div>
      </section>
    `,
    notifications: `
      <section class="utility-card notifications-screen">
        <h2>Notifikasi</h2>
        <div class="notification-tabs" role="tablist" aria-label="Tapisan notifikasi">
          <button class="is-active" type="button">Semua Kemas Kini</button>
          <button type="button">Sejarah Saya</button>
        </div>
        <div class="notification-list notification-list--updates">
          ${notifications.map((item) => NotificationItem(item)).join("")}
        </div>
      </section>
    `,
    profile: `
      <section class="utility-card profile-screen">
        <h2>Profil</h2>
        <p>Hanya nombor telefon anda digunakan untuk kemas kini kes. Tiada butiran peribadi tambahan diperlukan.</p>
        <div class="profile-phone-card">
          <span class="mini-icon">☎</span>
          <div>
            <strong>0123456789</strong>
            <small>Nombor telefon untuk kemas kini WhatsApp / SMS</small>
          </div>
        </div>
      </section>

      <section class="utility-card">
        <h2>Akaun Saya</h2>
        <div class="profile-list">
          <button class="profile-item mini-case-button" data-profile-action="reports" type="button"><span class="mini-icon">#</span><div><strong>Aduan Saya</strong><small>Lihat kes yang telah dihantar</small></div></button>
          <button class="profile-item mini-case-button" data-profile-action="notifications" type="button"><span class="mini-icon">🔔</span><div><strong>Tetapan Notifikasi</strong><small>Kemas kini WhatsApp dan push</small></div></button>
        </div>
      </section>

      <section class="utility-card">
        <h2>Bahasa</h2>
        <div class="language-options" aria-label="Pilihan bahasa">
          <button class="is-active" type="button">Bahasa Malaysia</button>
          <button type="button">English</button>
          <button type="button">中文</button>
        </div>
      </section>

      <section class="utility-card">
        <div class="profile-list profile-list--plain">
          <button class="profile-item mini-case-button" data-profile-action="help" type="button"><span class="mini-icon">?</span><div><strong>Bantuan & Soalan Lazim</strong><small>Dapatkan jawapan atau hubungi sokongan</small></div></button>
          <button class="profile-item mini-case-button" data-profile-action="privacy" type="button"><span class="mini-icon">✓</span><div><strong>Dasar Privasi</strong><small>Cara maklumat kes dilindungi</small></div></button>
          <button class="profile-item profile-item--logout mini-case-button" data-profile-action="logout" type="button"><span class="mini-icon">↗</span><div><strong>Kosongkan Sesi</strong><small>Kembali ke Laman Utama</small></div></button>
        </div>
      </section>
    `,
    privacy: `
      <section class="utility-card">
        <h2>Dasar Privasi</h2>
        <p>Tawau Aduan hanya menggunakan nombor telefon anda untuk menghantar kemas kini kes dan membantu anda menyemak aduan.</p>
        <div class="profile-list">
          <div class="profile-item"><span class="mini-icon">✓</span><div><strong>Data Minimum</strong><small>No. IC, nama penuh atau butiran profil peribadi tidak diperlukan.</small></div></div>
          <div class="profile-item"><span class="mini-icon">#</span><div><strong>Maklumat Kes</strong><small>Foto, kategori, lokasi dan penerangan digunakan untuk memproses aduan anda.</small></div></div>
          <div class="profile-item"><span class="mini-icon">◉</span><div><strong>Aduan Awam Berdekatan</strong><small>Hanya jenis isu, kawasan umum dan status dipaparkan kepada orang awam.</small></div></div>
        </div>
      </section>
    `,
  };

  utilityPanel.innerHTML = screens[type];
  const routeMap = {
    track: "/track",
    nearby: "/nearby",
    help: "/help",
    notifications: "/notifications",
    profile: "/profile",
    privacy: "/privacy",
  };
  const active = type === "profile" ? navProfile : type === "track" ? navTrack : type === "nearby" ? navNearby : null;
  if (!options.skipRoute) updateRoute(routeMap[type]);
  setActiveNav(active);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCaseDetails(caseId = latestCaseNumber, options = {}) {
  const mockCase = MOCK_DATA.case;
  const activeCaseNumber = caseId === "TAW-2026-05123" ? mockCase.caseNumber : caseId || mockCase.caseNumber;
  latestCaseNumber = activeCaseNumber;
  appShell.classList.remove("is-home", "is-reporting", "is-utility", "is-welcome");
  appShell.classList.add("is-submitted");
  form.style.display = "none";
  document.querySelector(".progress-panel").style.display = "none";
  resultPanel.innerHTML = `
    ${ScreenHeader({ title: "Butiran Kes", backAttrs: 'data-profile-action="reports"', helpId: "caseHelpBtn" })}
    <section class="case-card">
      <div class="case-card-head">
        <div>
          <span>Nombor Kes</span>
          <strong>${escapeHtml(activeCaseNumber)}</strong>
        </div>
        <button class="copy-btn" type="button" aria-label="Salin nombor kes">Salin</button>
      </div>
      <div class="case-meta">
        <span>Dilaporkan pada</span>
        <strong>${escapeHtml(mockCase.reportedAt)}</strong>
      </div>
      ${StatusBadge(mockCase.status, statusTone(mockCase.status))}
      <p class="case-reassurance">Kes anda sedang dikendalikan oleh jabatan berkaitan.</p>
    </section>
    <section class="case-section timeline-section">
      <h3>Garis Masa Status</h3>
      <div class="case-timeline">
        ${mockCase.timeline.map((item) => TimelineItem(item)).join("")}
      </div>
    </section>
    <section class="case-section issue-summary-card">
      <h3>Ringkasan Isu</h3>
      <div class="issue-summary-row">
        <div class="issue-thumb"></div>
        <div>
          <strong>${escapeHtml(mockCase.category)}</strong>
          <p>${escapeHtml(mockCase.location)}</p>
          <small>${escapeHtml(mockCase.description)}</small>
        </div>
      </div>
      <div class="ai-summary issue-ai-summary">
        <span>Ringkasan Isu:</span>
        <p>${escapeHtml(mockCase.summary)}</p>
      </div>
    </section>
    <section class="case-section">
      <h3>Kemas Kini Pegawai</h3>
      <div class="officer-update">
        <p>Pasukan penyelenggaraan jalan telah ditugaskan. Pemeriksaan tapak dijadualkan.</p>
        <span>03 Jun 2026, 11:20 pagi</span>
        <div class="before-after">
          <div><small>Sebelum</small></div>
          <div><small>Selepas</small></div>
        </div>
      </div>
    </section>
    <section class="case-section">
      <h3>Tetapan Notifikasi</h3>
      <label class="toggle-row"><span>Kemas Kini WhatsApp</span><input type="checkbox" checked /></label>
      <label class="toggle-row"><span>Notifikasi Push</span><input type="checkbox" checked /></label>
    </section>
    ${ButtonPrimary("Buat Aduan Baru", { id: "newReportBtn" })}
  `;
  resultPanel.classList.add("is-visible");
  if (!options.skipRoute) updateRoute(`/case/${activeCaseNumber}`);
  setActiveNav(navTrack);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPhoneLogin(options = {}) {
  showUtility("login", { skipRoute: true });
  utilityPanel.innerHTML = `
    <section class="utility-card">
      <h2>Log Masuk Telefon</h2>
      <p>Masukkan nombor telefon anda untuk menerima kemas kini kes.</p>
      <div class="case-search">
        <input type="tel" inputmode="tel" placeholder="Contoh: 0123456789" />
        ${ButtonPrimary("Terus ke Laman Utama", { id: "loginContinue" })}
      </div>
    </section>
  `;
  if (!options.skipRoute) updateRoute("/login-phone");
}

function handleRoute(path = window.location.pathname, options = {}) {
  if (path === "/") {
    showHome({ skipRoute: true });
    updateRoute("/home", true);
    return;
  }
  if (path === "/home") return showHome({ skipRoute: true });
  if (path === "/welcome") {
    showHome({ skipRoute: true });
    updateRoute("/home", true);
    return;
  }
  if (path === "/login-phone") return showPhoneLogin({ skipRoute: true });
  if (path === "/report") return focusReportStart({ skipRoute: true });
  if (path === "/report/location") return showPage(3, { skipRoute: true });
  if (path === "/report/review") return showPage(4, { skipRoute: true });
  if (path === "/track") return showUtility("track", { skipRoute: true });
  if (path === "/notifications") return showUtility("notifications", { skipRoute: true });
  if (path === "/nearby") return showUtility("nearby", { skipRoute: true });
  if (path === "/profile") return showUtility("profile", { skipRoute: true });
  if (path === "/help") return showUtility("help", { skipRoute: true });
  if (path === "/privacy") return showUtility("privacy", { skipRoute: true });
  if (path.startsWith("/case/")) return showCaseDetails(path.split("/").pop(), { skipRoute: true });
  return showHome({ skipRoute: true });
}

newAduanAction.addEventListener("click", () => focusReportStart());
trackAction.addEventListener("click", () => showUtility("track"));
nearbyAction.addEventListener("click", () => showUtility("nearby"));
helpAction.addEventListener("click", () => showUtility("help"));
notificationsButton.addEventListener("click", () => showUtility("notifications"));

navAduan.addEventListener("click", (event) => {
  event.preventDefault();
  focusReportStart();
});

navHome.addEventListener("click", (event) => {
  event.preventDefault();
  showHome();
});

navTrack.addEventListener("click", (event) => {
  event.preventDefault();
  showUtility("track");
});

navNearby.addEventListener("click", (event) => {
  event.preventDefault();
  showUtility("nearby");
});

navProfile.addEventListener("click", (event) => {
  event.preventDefault();
  showUtility("profile");
});

reportBackBtn.addEventListener("click", () => showHome());
reportHelpBtn.addEventListener("click", () => showUtility("help"));
locationHelpBtn.addEventListener("click", () => showUtility("help"));
reviewHelpBtn.addEventListener("click", () => showUtility("help"));
editDetailsBtn.addEventListener("click", () => showPage(1));
reportNearbyHint.addEventListener("click", () => showUtility("nearby"));

descriptionInput.addEventListener("input", () => {
  descriptionCounter.textContent = `${descriptionInput.value.length}/500`;
});

utilityPanel.addEventListener("click", (event) => {
  const profileAction = event.target.closest("[data-profile-action]");
  if (profileAction) {
    const action = profileAction.dataset.profileAction;
    if (action === "reports") showUtility("track");
    if (action === "notifications") showUtility("notifications");
    if (action === "help") showUtility("help");
    if (action === "privacy") showUtility("privacy");
    if (action === "logout") showHome();
    return;
  }
  const caseButton = event.target.closest("[data-case-id]");
  if (caseButton) {
    showCaseDetails(caseButton.dataset.caseId);
    return;
  }
  if (event.target.closest("#loginContinue")) {
    showHome();
  }
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    photoPreview.src = reader.result;
    uploadZone.classList.add("has-image");
  });
  reader.readAsDataURL(file);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Pelayar ini tidak menyokong lokasi automatik. Sila masukkan alamat secara manual.";
    return;
  }

  locationStatus.textContent = "Sedang mendapatkan lokasi semasa...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      locationStatus.textContent = `Lokasi dikesan: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
      if (!locationText.value.trim()) {
        locationText.value = "Berhampiran lokasi semasa";
      }
    },
    () => {
      locationStatus.textContent = "Lokasi tidak dapat dikesan. Sila semak kebenaran lokasi atau masukkan alamat secara manual.";
    },
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 },
  );
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showCaseDetails(createCaseNumber());
});

resultPanel.addEventListener("click", (event) => {
  if (event.target.closest("[data-profile-action='reports']")) {
    showUtility("track");
    return;
  }

  if (event.target.closest("#caseHelpBtn")) {
    showUtility("help");
    return;
  }

  if (event.target.closest("#newReportBtn")) {
    form.reset();
    coordinates = null;
    photoPreview.removeAttribute("src");
    uploadZone.classList.remove("has-image");
    descriptionCounter.textContent = "0/500";
    locationStatus.textContent = "Di sinilah isu berlaku.";
    form.style.display = "";
    document.querySelector(".progress-panel").style.display = "";
    resultPanel.classList.remove("is-visible");
    appShell.classList.remove("is-submitted");
    focusReportStart();
    return;
  }

  if (event.target.closest(".copy-btn")) {
    event.target.closest(".copy-btn").textContent = "Disalin";
  }
});

window.addEventListener("popstate", () => handleRoute(window.location.pathname, { skipRoute: true }));

renderMockData();
handleRoute(window.location.pathname, { skipRoute: true });
