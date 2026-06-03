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
    { value: "Garbage", label: "Garbage", icon: "garbage" },
    { value: "Road Damage", label: "Road Damage", icon: "road" },
    { value: "Drainage", label: "Drainage", icon: "drain" },
    { value: "Street Light", label: "Street Light", icon: "light" },
    { value: "Public Facility", label: "Public Facility", icon: "facility" },
    { value: "Cleanliness", label: "Cleanliness", icon: "clean" },
  ],
  case: {
    caseNumber: "TAW-2026-000128",
    category: "Road Damage",
    location: "Jalan Apas, 91000 Tawau, Sabah, Malaysia",
    status: "In Progress",
    reportedAt: "03 June 2026, 09:41 AM",
    description: "Large pothole near roadside causing traffic risk.",
    summary: "Road damage reported at Jalan Apas. Photo attached. Requires inspection.",
    timeline: [
      { title: "Received", description: "Your complaint has been received.", state: "done" },
      { title: "Verified", description: "Issue verified by our team.", state: "done" },
      { title: "Assigned", description: "Assigned to relevant department.", state: "done" },
      { title: "In Progress", description: "Work is in progress.", state: "current" },
      { title: "Completed", description: "We will update you once completed.", state: "future" },
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
    <button class="CaseCard ${variant}-case-card mini-case-button" data-case-id="${escapeHtml(caseId)}" type="button">
      <div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small><small>${escapeHtml(secondary)}</small></div>
      <div>${StatusBadge(status, tone)}${variant !== "nearby" && meta ? `<time>${escapeHtml(meta)}</time>` : ""}</div>
    </button>
  `;
}

function QuickActionCard({ id, title, subtitle, iconClass, variant = "" }) {
  return `
    <button class="QuickActionCard action-card ${variant}" id="${escapeHtml(id)}" type="button">
      <span class="action-icon ${escapeHtml(iconClass)}"></span>
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(subtitle)}</small>
    </button>
  `;
}

function StatsCard({ title, label, stats }) {
  return `
    <section class="StatsCard glance-card" aria-label="${escapeHtml(title)}">
      <div class="glance-head"><h2>${escapeHtml(title)}</h2><span>${escapeHtml(label)}</span></div>
      <div class="glance-stats">
        ${stats.map((stat) => `<div><small>${escapeHtml(stat.label)}</small><strong>${escapeHtml(String(stat.value))}</strong></div>`).join("")}
      </div>
    </section>
  `;
}

function PhotoUploadCard({ inputId = "photoInput", previewId = "photoPreview" } = {}) {
  return `
    <label class="PhotoUploadCard add-photo-card" for="${escapeHtml(inputId)}">
      <input id="${escapeHtml(inputId)}" name="photo" type="file" accept="image/*" capture="environment" />
      <span class="camera-mini-icon"></span>
      <strong>Add Photo</strong>
      <img id="${escapeHtml(previewId)}" alt="" />
    </label>
  `;
}

function AddressCard({ textareaId = "locationText", value }) {
  return `
    <label class="AddressCard address-card">
      <span>Address</span>
      <textarea id="${escapeHtml(textareaId)}" name="location" rows="3" required>${escapeHtml(value)}</textarea>
    </label>
  `;
}

function NotificationItem({ caseId, title, time, date, tone = "success", icon = "✓", badge, badgeTone = "success" }) {
  return `
    <button class="NotificationItem notification-item notification-item--${tone} mini-case-button" data-case-id="${escapeHtml(caseId)}" type="button">
      <span class="notification-status-icon">${escapeHtml(icon)}</span>
      <div><strong>${escapeHtml(title)}</strong><small>Case No. ${escapeHtml(caseId)}</small>${badge ? StatusBadge(badge, badgeTone) : ""}</div>
      <time><b>${escapeHtml(time)}</b><span>${escapeHtml(date)}</span></time>
    </button>
  `;
}

function BottomTabBar(items) {
  return `
    <nav class="BottomTabBar bottom-nav" aria-label="App navigation">
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
      <button class="screen-icon-btn" type="button" ${leftAttrs} aria-label="Back">‹</button>
      <h2>${escapeHtml(title)}</h2>
      <button class="screen-icon-btn" type="button" id="${escapeHtml(helpId)}" aria-label="Help">?</button>
    </div>
  `;
}

function statusTone(status) {
  if (status === "Completed" || status === "Resolved") return "success";
  if (status === "Action Needed") return "warning";
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
      <div><span class="stat-icon stat-icon--reported"></span><small>Issues Reported</small><strong>${MOCK_DATA.stats.issuesReported}</strong></div>
      <div><span class="stat-icon stat-icon--progress"></span><small>In Progress</small><strong>${MOCK_DATA.stats.inProgress}</strong></div>
      <div><span class="stat-icon stat-icon--resolved"></span><small>Resolved</small><strong>${MOCK_DATA.stats.resolved}</strong></div>
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
  return checked ? checked.value : "Not selected";
}

function renderSummary() {
  const description = escapeHtml(document.querySelector("#description").value.trim() || MOCK_DATA.case.description);
  const location = escapeHtml(locationText.value.trim() || MOCK_DATA.case.location);
  const locationDetail = coordinates
    ? `${location} (${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)})`
    : location;
  const category = escapeHtml(selectedCategory() || MOCK_DATA.case.category);

  summaryCard.innerHTML = `
    <div class="review-status">${StatusBadge("Ready to Submit", "success")}</div>
    <div class="review-main">
      <div class="review-thumb ${photoInput.files.length ? "has-upload" : ""}">
        ${photoInput.files.length && photoPreview.src ? `<img src="${photoPreview.src}" alt="Uploaded issue" />` : `<span class="camera-mini-icon"></span>`}
      </div>
      <div class="review-details">
        <div class="summary-row"><span>Category</span><strong>${category}</strong></div>
        <div class="summary-row"><span>Address</span><strong>${locationDetail}</strong></div>
        <div class="summary-row summary-row--stack"><span>Description</span><strong>${description}</strong></div>
      </div>
    </div>
    <div class="ai-summary">
      <span>Issue Summary:</span>
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
    { caseId: "TAW-2026-000097", category: "Garbage", location: "Kubota area", meta: "02 Jun", status: "Completed", tone: "success" },
    { caseId: "TAW-2026-000082", category: "Drainage", location: "Fajar area", meta: "01 Jun", status: "Action Needed", tone: "warning" },
  ];
  const nearbyCases = [
    { caseId: mockCase.caseNumber, category: mockCase.category, location: "Jalan Apas area", meta: "1.2 km away · 03 Jun", status: mockCase.status, tone: statusTone(mockCase.status), variant: "nearby" },
    { caseId: "TAW-2026-000097", category: "Garbage", location: "Kubota area", meta: "1.8 km away · 02 Jun", status: "Completed", tone: "success", variant: "nearby" },
    { caseId: "TAW-2026-000082", category: "Drainage", location: "Fajar area", meta: "2.1 km away · 01 Jun", status: "Action Needed", tone: "warning", variant: "nearby" },
    { caseId: "TAW-2026-000087", category: "Street Light", location: "Taman Semarak area", meta: "2.4 km away · 01 Jun", status: "Pending", tone: "pending", variant: "nearby" },
  ];
  const notifications = [
    { caseId: mockCase.caseNumber, title: "Your complaint has been received", time: "09:41 AM", date: "03 Jun" },
    { caseId: mockCase.caseNumber, title: "Your complaint has been verified", time: "11:20 AM", date: "03 Jun" },
    { caseId: mockCase.caseNumber, title: "Your complaint has been assigned", time: "01:15 PM", date: "03 Jun", tone: "info", icon: "👥" },
    { caseId: mockCase.caseNumber, title: "Work is in progress", time: "09:30 AM", date: "04 Jun", tone: "info", icon: "⚙" },
    { caseId: "TAW-2026-000097", title: "Your complaint has been completed", time: "04:45 PM", date: "04 Jun", badge: "Completed", badgeTone: "success" },
    { caseId: "TAW-2026-000082", title: "More information required", time: "10:05 AM", date: "05 Jun", tone: "warning", icon: "!", badge: "Action Needed", badgeTone: "warning" },
  ];

  const screens = {
    track: `
      <section class="utility-card">
        <h2>Track Complaint</h2>
        <p>Track without complex login. Paste your case number below.</p>
        <div class="case-search track-search">
          <label>
            <span>Enter case number</span>
            <input type="text" inputmode="text" autocapitalize="characters" spellcheck="false" value="${mockCase.caseNumber}" placeholder="Example: ${mockCase.caseNumber}" />
          </label>
          ${ButtonPrimary("Track Case", { "data-case-id": mockCase.caseNumber })}
        </div>
      </section>
      <section class="utility-card">
        <h2>Recent Cases</h2>
        <div class="case-list recent-case-list">
          ${recentCases.map((item) => CaseCard(item)).join("")}
        </div>
      </section>
    `,
    nearby: `
      <section class="utility-card nearby-screen">
        <h2>Nearby Issues</h2>
        <p>Check nearby public reports before submitting a duplicate complaint.</p>
        <div class="map-card compact-map nearby-map">
          <div class="map-grid"></div>
          <div class="map-pin"></div>
          <p>Public issue map around Jalan Apas, Fajar and Kubota.</p>
        </div>
        <div class="filter-chips" aria-label="Nearby issue filters">
          <button class="is-active" type="button">All</button>
          <button type="button">Garbage</button>
          <button type="button">Road Damage</button>
          <button type="button">Drainage</button>
          <button type="button">Street Light</button>
        </div>
        <div class="duplicate-hint">
          <strong>This issue may already be reported.</strong>
          <span>Follow this case instead?</span>
          <button data-case-id="${mockCase.caseNumber}" type="button">Follow Case</button>
        </div>
        <div class="case-list nearby-case-list">
          ${nearbyCases.map((item) => CaseCard(item)).join("")}
        </div>
      </section>
    `,
    help: `
      <section class="utility-card">
        <h2>Help / FAQ</h2>
        <p>Quick answers for residents using Tawau Aduan.</p>
        <div class="profile-list">
          <div class="profile-item"><span class="mini-icon">?</span><div><strong>How do I report?</strong><small>Add photo, category, location, then submit.</small></div></div>
          <div class="profile-item"><span class="mini-icon">#</span><div><strong>Where is my case number?</strong><small>It appears after submission and in notifications.</small></div></div>
          <div class="profile-item"><span class="mini-icon">☎</span><div><strong>Need support?</strong><small>Contact civic response support.</small></div></div>
        </div>
      </section>
    `,
    notifications: `
      <section class="utility-card notifications-screen">
        <h2>Notifications</h2>
        <div class="notification-tabs" role="tablist" aria-label="Notification filters">
          <button class="is-active" type="button">All Updates</button>
          <button type="button">My History</button>
        </div>
        <div class="notification-list notification-list--updates">
          ${notifications.map((item) => NotificationItem(item)).join("")}
        </div>
      </section>
    `,
    profile: `
      <section class="utility-card profile-screen">
        <h2>Profile</h2>
        <p>Only your phone number is used for case updates. No extra personal details needed.</p>
        <div class="profile-phone-card">
          <span class="mini-icon">☎</span>
          <div>
            <strong>0123456789</strong>
            <small>Phone number for WhatsApp / SMS updates</small>
          </div>
        </div>
      </section>

      <section class="utility-card">
        <h2>My Account</h2>
        <div class="profile-list">
          <button class="profile-item mini-case-button" data-profile-action="reports" type="button"><span class="mini-icon">#</span><div><strong>My Reports</strong><small>View your submitted cases</small></div></button>
          <button class="profile-item mini-case-button" data-profile-action="notifications" type="button"><span class="mini-icon">🔔</span><div><strong>Notification Settings</strong><small>WhatsApp and push updates</small></div></button>
        </div>
      </section>

      <section class="utility-card">
        <h2>Language</h2>
        <div class="language-options" aria-label="Language options">
          <button class="is-active" type="button">English</button>
          <button type="button">Bahasa Malaysia</button>
          <button type="button">中文</button>
        </div>
      </section>

      <section class="utility-card">
        <div class="profile-list profile-list--plain">
          <button class="profile-item mini-case-button" data-profile-action="help" type="button"><span class="mini-icon">?</span><div><strong>Help & FAQ</strong><small>Get answers or contact support</small></div></button>
          <button class="profile-item mini-case-button" data-profile-action="privacy" type="button"><span class="mini-icon">✓</span><div><strong>Privacy Policy</strong><small>How case information is protected</small></div></button>
          <button class="profile-item profile-item--logout mini-case-button" data-profile-action="logout" type="button"><span class="mini-icon">↗</span><div><strong>Clear Session</strong><small>Return to Home</small></div></button>
        </div>
      </section>
    `,
    privacy: `
      <section class="utility-card">
        <h2>Privacy Policy</h2>
        <p>Tawau Aduan only uses your phone number to send case updates and help you track reports.</p>
        <div class="profile-list">
          <div class="profile-item"><span class="mini-icon">✓</span><div><strong>Minimal Data</strong><small>No IC number, full name, or private profile details are required.</small></div></div>
          <div class="profile-item"><span class="mini-icon">#</span><div><strong>Case Information</strong><small>Photos, category, location, and description are used to process your complaint.</small></div></div>
          <div class="profile-item"><span class="mini-icon">◉</span><div><strong>Public Nearby Issues</strong><small>Only issue type, general area, and status are shown publicly.</small></div></div>
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
    ${ScreenHeader({ title: "Case Details", backAttrs: 'data-profile-action="reports"', helpId: "caseHelpBtn" })}
    <section class="case-card">
      <div class="case-card-head">
        <div>
          <span>Case Number</span>
          <strong>${escapeHtml(activeCaseNumber)}</strong>
        </div>
        <button class="copy-btn" type="button" aria-label="Copy case number">Copy</button>
      </div>
      <div class="case-meta">
        <span>Reported on</span>
        <strong>${escapeHtml(mockCase.reportedAt)}</strong>
      </div>
      ${StatusBadge(mockCase.status, statusTone(mockCase.status))}
      <p class="case-reassurance">Your case is being handled by the relevant department.</p>
    </section>
    <section class="case-section timeline-section">
      <h3>Status Timeline</h3>
      <div class="case-timeline">
        ${mockCase.timeline.map((item) => TimelineItem(item)).join("")}
      </div>
    </section>
    <section class="case-section issue-summary-card">
      <h3>Issue Summary</h3>
      <div class="issue-summary-row">
        <div class="issue-thumb"></div>
        <div>
          <strong>${escapeHtml(mockCase.category)}</strong>
          <p>${escapeHtml(mockCase.location)}</p>
          <small>${escapeHtml(mockCase.description)}</small>
        </div>
      </div>
      <div class="ai-summary issue-ai-summary">
        <span>Issue Summary:</span>
        <p>${escapeHtml(mockCase.summary)}</p>
      </div>
    </section>
    <section class="case-section">
      <h3>Officer Update</h3>
      <div class="officer-update">
        <p>Road maintenance team has been assigned. Site inspection is scheduled.</p>
        <span>03 June 2026, 11:20 AM</span>
        <div class="before-after">
          <div><small>Before</small></div>
          <div><small>After</small></div>
        </div>
      </div>
    </section>
    <section class="case-section">
      <h3>Notification Settings</h3>
      <label class="toggle-row"><span>WhatsApp Updates</span><input type="checkbox" checked /></label>
      <label class="toggle-row"><span>Push Notification</span><input type="checkbox" checked /></label>
    </section>
    ${ButtonPrimary("Report Another Issue", { id: "newReportBtn" })}
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
      <h2>Phone Login</h2>
      <p>Enter your phone number to receive case updates.</p>
      <div class="case-search">
        <input type="tel" inputmode="tel" placeholder="Example: 0123456789" />
        ${ButtonPrimary("Continue to Home", { id: "loginContinue" })}
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
    locationStatus.textContent = "This browser does not support automatic location. Please enter the address manually.";
    return;
  }

  locationStatus.textContent = "Getting current location...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      locationStatus.textContent = `Location detected: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
      if (!locationText.value.trim()) {
        locationText.value = "Near current location";
      }
    },
    () => {
      locationStatus.textContent = "Location could not be detected. Please check permission or enter the address manually.";
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
    locationStatus.textContent = "This is where the issue happened.";
    form.style.display = "";
    document.querySelector(".progress-panel").style.display = "";
    resultPanel.classList.remove("is-visible");
    appShell.classList.remove("is-submitted");
    focusReportStart();
    return;
  }

  if (event.target.closest(".copy-btn")) {
    event.target.closest(".copy-btn").textContent = "Copied";
  }
});

window.addEventListener("popstate", () => handleRoute(window.location.pathname, { skipRoute: true }));

renderMockData();
handleRoute(window.location.pathname, { skipRoute: true });
