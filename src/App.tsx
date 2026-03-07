<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>薪資月曆</title>
  <style>
    :root{
      --primary:#167c72;
      --primary-light:#e8f5f3;
      --danger:#d93025;
      --text:#1f2937;
      --sub:#6b7280;
      --bg:#f4f6f8;
      --card:#ffffff;
      --line:#d8dee4;
      --shadow:0 4px 14px rgba(0,0,0,.06);
      --radius:18px;
    }

    *{box-sizing:border-box}
    html,body{
      margin:0;
      padding:0;
      background:var(--bg);
      color:var(--text);
      font-family:"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif;
    }

    body{
      max-width:480px;
      margin:0 auto;
      min-height:100vh;
      padding:14px 14px 24px;
    }

    .topbar{
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:10px;
    }

    .month-title{
      font-size:28px;
      font-weight:800;
      letter-spacing:.5px;
    }

    .month-nav{
      display:flex;
      gap:8px;
    }

    .icon-btn{
      border:none;
      background:var(--card);
      border-radius:12px;
      padding:10px 12px;
      box-shadow:var(--shadow);
      font-size:16px;
      cursor:pointer;
    }

    .summary-cards{
      display:grid;
      grid-template-columns:1fr;
      gap:12px;
      margin-bottom:14px;
    }

    .card{
      background:var(--card);
      border-radius:22px;
      box-shadow:var(--shadow);
      padding:18px 16px;
      text-align:center;
    }

    .card .label{
      font-size:14px;
      color:var(--sub);
      margin-bottom:8px;
    }

    .card .value{
      font-size:26px;
      font-weight:900;
      line-height:1.1;
    }

    .green{color:var(--primary)}
    .red{color:var(--danger)}
    .dark{color:#0f172a}

    .tabs{
      display:flex;
      gap:8px;
      margin:12px 0 14px;
      overflow:auto;
      -webkit-overflow-scrolling:touch;
      padding-bottom:2px;
    }

    .tab-btn{
      flex:0 0 auto;
      border:1px solid #d1d5db;
      background:#fff;
      color:#111827;
      padding:12px 16px;
      border-radius:16px;
      font-size:14px;
      font-weight:800;
      cursor:pointer;
      min-width:74px;
    }

    .tab-btn.active{
      background:var(--primary);
      color:#fff;
      border-color:var(--primary);
    }

    .panel{display:none}
    .panel.active{display:block}

    .weekday-row{
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:8px;
      margin-bottom:8px;
      padding:0 2px;
    }

    .weekday{
      text-align:center;
      font-size:15px;
      font-weight:800;
      color:#64748b;
      padding:4px 0;
    }

    .calendar-grid{
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:8px;
      align-items:stretch;
    }

    .day-cell{
      background:#fff;
      border:1px solid var(--line);
      border-radius:18px;
      min-height:118px;
      padding:10px 8px;
      display:flex;
      flex-direction:column;
      justify-content:flex-start;
      box-shadow:0 2px 8px rgba(0,0,0,.03);
      cursor:pointer;
      overflow:hidden;
    }

    .day-cell.other-month{
      opacity:.28;
      background:#f8fafc;
    }

    .day-cell.today{
      border:2px solid var(--primary);
      background:#fcfffe;
    }

    .date-num{
      font-size:22px;
      font-weight:900;
      margin-bottom:6px;
      color:#111827;
      line-height:1;
    }

    .divider{
      height:1px;
      background:#e5e7eb;
      margin:4px 0 6px;
      flex:0 0 auto;
    }

    .entry-line{
      font-size:12px;
      line-height:1.35;
      margin-bottom:3px;
      word-break:break-word;
    }

    .entry-schedule{
      color:#334155;
      font-weight:700;
    }

    .entry-performance{
      color:#0f766e;
      font-weight:800;
    }

    .entry-salary{
      color:#1d4ed8;
      font-weight:800;
    }

    .entry-empty{
      color:#9ca3af;
      font-size:12px;
    }

    .section-card{
      background:#fff;
      border-radius:20px;
      box-shadow:var(--shadow);
      padding:16px;
      margin-bottom:14px;
    }

    .section-title{
      font-size:18px;
      font-weight:900;
      margin-bottom:14px;
    }

    .stat-list{
      display:grid;
      gap:12px;
    }

    .stat-row{
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:12px 0;
      border-bottom:1px solid #eef2f7;
      gap:10px;
    }

    .stat-row:last-child{border-bottom:none}

    .stat-row .left{
      color:#475569;
      font-weight:700;
    }

    .stat-row .right{
      font-weight:900;
      font-size:18px;
      text-align:right;
    }

    .form-group{
      margin-bottom:14px;
    }

    .form-group label{
      display:block;
      font-size:14px;
      font-weight:800;
      margin-bottom:6px;
      color:#334155;
    }

    input, select, textarea{
      width:100%;
      border:1px solid #d1d5db;
      border-radius:14px;
      padding:12px 14px;
      font-size:16px;
      background:#fff;
      outline:none;
    }

    textarea{
      min-height:90px;
      resize:vertical;
    }

    .btn{
      border:none;
      background:var(--primary);
      color:#fff;
      border-radius:14px;
      padding:13px 16px;
      width:100%;
      font-size:16px;
      font-weight:900;
      cursor:pointer;
    }

    .btn.secondary{
      background:#fff;
      color:#111827;
      border:1px solid #d1d5db;
    }

    .btn-row{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
      margin-top:10px;
    }

    .modal{
      position:fixed;
      inset:0;
      background:rgba(15,23,42,.45);
      display:none;
      align-items:flex-end;
      justify-content:center;
      z-index:999;
      padding:12px;
    }

    .modal.show{display:flex}

    .modal-card{
      width:100%;
      max-width:480px;
      background:#fff;
      border-radius:24px 24px 18px 18px;
      padding:18px 16px 20px;
      box-shadow:0 10px 30px rgba(0,0,0,.18);
      max-height:88vh;
      overflow:auto;
    }

    .modal-title{
      font-size:20px;
      font-weight:900;
      margin-bottom:14px;
    }

    .helper{
      font-size:13px;
      color:#64748b;
      margin-top:6px;
    }

    .small-note{
      font-size:12px;
      color:#64748b;
      line-height:1.5;
    }

    @media (max-width:400px){
      .day-cell{
        min-height:108px;
        padding:8px 6px;
        border-radius:16px;
      }
      .date-num{
        font-size:20px;
      }
      .entry-line{
        font-size:11px;
      }
      .month-title{
        font-size:24px;
      }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="month-title" id="monthTitle">2026 / 03</div>
    <div class="month-nav">
      <button class="icon-btn" id="prevMonthBtn">‹</button>
      <button class="icon-btn" id="todayBtn">今</button>
      <button class="icon-btn" id="nextMonthBtn">›</button>
    </div>
  </div>

  <div class="summary-cards">
    <div class="card">
      <div class="label">本月薪水</div>
      <div class="value green" id="totalSalaryCard">$0</div>
    </div>
    <div class="card">
      <div class="label">距離理想薪資差距</div>
      <div class="value red" id="salaryGapCard">$0</div>
    </div>
    <div class="card">
      <div class="label">本月總業績</div>
      <div class="value dark" id="totalPerformanceCard">$0</div>
    </div>
    <div class="card">
      <div class="label">完成率</div>
      <div class="value dark" id="completionRateCard">0%</div>
    </div>
  </div>

  <div class="tabs">
    <button class="tab-btn active" data-tab="calendarPanel">月曆</button>
    <button class="tab-btn" data-tab="statsPanel">月統計</button>
    <button class="tab-btn" data-tab="deductPanel">扣薪</button>
    <button class="tab-btn" data-tab="settingsPanel">設定</button>
  </div>

  <div class="panel active" id="calendarPanel">
    <div class="weekday-row">
      <div class="weekday">日</div>
      <div class="weekday">一</div>
      <div class="weekday">二</div>
      <div class="weekday">三</div>
      <div class="weekday">四</div>
      <div class="weekday">五</div>
      <div class="weekday">六</div>
    </div>
    <div class="calendar-grid" id="calendarGrid"></div>
  </div>

  <div class="panel" id="statsPanel">
    <div class="section-card">
      <div class="section-title">本月統計</div>
      <div class="stat-list">
        <div class="stat-row">
          <div class="left">本月總業績</div>
          <div class="right" id="statsPerformance">$0</div>
        </div>
        <div class="stat-row">
          <div class="left">本月總薪水</div>
          <div class="right" id="statsSalary">$0</div>
        </div>
        <div class="stat-row">
          <div class="left">本月扣薪</div>
          <div class="right red" id="statsDeduction">$0</div>
        </div>
        <div class="stat-row">
          <div class="left">平均每日業績</div>
          <div class="right" id="statsAvgPerformance">$0</div>
        </div>
        <div class="stat-row">
          <div class="left">平均每日薪水</div>
          <div class="right" id="statsAvgSalary">$0</div>
        </div>
        <div class="stat-row">
          <div class="left">目標達成率</div>
          <div class="right" id="statsRate">0%</div>
        </div>
      </div>
    </div>
  </div>

  <div class="panel" id="deductPanel">
    <div class="section-card">
      <div class="section-title">扣薪設定</div>
      <div class="form-group">
        <label for="monthlyDeductionInput">本月固定扣薪</label>
        <input type="number" id="monthlyDeductionInput" placeholder="例如 5000">
        <div class="helper">這裡是整個月固定要扣掉的金額。</div>
      </div>
      <button class="btn" id="saveDeductionBtn">儲存扣薪</button>
    </div>
  </div>

  <div class="panel" id="settingsPanel">
    <div class="section-card">
      <div class="section-title">基本設定</div>
      <div class="form-group">
        <label for="targetSalaryInput">理想月薪目標</label>
        <input type="number" id="targetSalaryInput" placeholder="例如 150000">
      </div>
      <button class="btn" id="saveSettingsBtn">儲存設定</button>
      <div class="helper">完成率會依照「本月薪水 ÷ 理想月薪目標」計算。</div>
    </div>
  </div>

  <div class="modal" id="editModal">
    <div class="modal-card">
      <div class="modal-title" id="modalTitle">編輯日期</div>

      <div class="form-group">
        <label for="scheduleInput">行程</label>
        <select id="scheduleInput">
          <option value="">請選擇</option>
          <option>淇AA</option>
          <option>淇AD</option>
          <option>淇A9</option>
          <option>淇A1</option>
          <option>淇A2</option>
          <option>淇A3</option>
          <option>淇A6</option>
          <option>淇A7</option>
          <option>淇A11</option>
          <option>淇A13</option>
          <option>淇休假</option>
          <option>週會</option>
          <option>店長會議</option>
          <option>週會+店長會議</option>
          <option>升等考</option>
          <option>100天</option>
          <option>淇POP上課</option>
        </select>
      </div>

      <div class="form-group">
        <label for="performanceInput">業績</label>
        <input type="number" id="performanceInput" placeholder="例如 8000">
      </div>

      <div class="form-group">
        <label for="salaryInput">薪水</label>
        <input type="number" id="salaryInput" placeholder="例如 3200">
      </div>

      <div class="form-group">
        <label for="noteInput">備註</label>
        <textarea id="noteInput" placeholder="可不填"></textarea>
      </div>

      <div class="btn-row">
        <button class="btn secondary" id="deleteDayBtn">清除此日</button>
        <button class="btn" id="saveDayBtn">儲存</button>
      </div>
    </div>
  </div>

  <script>
    const STORAGE_KEY = "salary_calendar_v5_data";
    const SETTINGS_KEY = "salary_calendar_v5_settings";

    let currentDate = new Date();
    let selectedDateKey = "";

    let dataStore = loadData();
    let settings = loadSettings();

    const monthTitle = document.getElementById("monthTitle");
    const calendarGrid = document.getElementById("calendarGrid");

    const totalSalaryCard = document.getElementById("totalSalaryCard");
    const salaryGapCard = document.getElementById("salaryGapCard");
    const totalPerformanceCard = document.getElementById("totalPerformanceCard");
    const completionRateCard = document.getElementById("completionRateCard");

    const statsPerformance = document.getElementById("statsPerformance");
    const statsSalary = document.getElementById("statsSalary");
    const statsDeduction = document.getElementById("statsDeduction");
    const statsAvgPerformance = document.getElementById("statsAvgPerformance");
    const statsAvgSalary = document.getElementById("statsAvgSalary");
    const statsRate = document.getElementById("statsRate");

    const targetSalaryInput = document.getElementById("targetSalaryInput");
    const monthlyDeductionInput = document.getElementById("monthlyDeductionInput");

    const editModal = document.getElementById("editModal");
    const modalTitle = document.getElementById("modalTitle");
    const scheduleInput = document.getElementById("scheduleInput");
    const performanceInput = document.getElementById("performanceInput");
    const salaryInput = document.getElementById("salaryInput");
    const noteInput = document.getElementById("noteInput");

    function loadData(){
      try{
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      }catch(e){
        return {};
      }
    }

    function saveData(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataStore));
    }

    function loadSettings(){
      try{
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
          targetSalary: 150000,
          monthlyDeduction: 0
        };
      }catch(e){
        return {
          targetSalary: 150000,
          monthlyDeduction: 0
        };
      }
    }

    function saveSettings(){
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    function formatCurrency(num){
      const value = Number(num || 0);
      return "$" + value.toLocaleString("zh-Hant-TW", {
        maximumFractionDigits: 2
      });
    }

    function formatPercent(num){
      return `${Number(num || 0).toFixed(1)}%`;
    }

    function pad(num){
      return String(num).padStart(2, "0");
    }

    function getDateKey(date){
      return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
    }

    function getMonthKey(date){
      return `${date.getFullYear()}-${pad(date.getMonth()+1)}`;
    }

    function isToday(date){
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }

    function renderAll(){
      renderHeader();
      renderCalendar();
      renderSummary();
      renderStats();
      syncSettingsInputs();
    }

    function renderHeader(){
      monthTitle.textContent = `${currentDate.getFullYear()} / ${pad(currentDate.getMonth()+1)}`;
    }

    function renderCalendar(){
      calendarGrid.innerHTML = "";

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const startWeekday = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();

      const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

      for(let i = 0; i < totalCells; i++){
        let cellDate;
        let otherMonth = false;

        if(i < startWeekday){
          cellDate = new Date(year, month - 1, prevMonthDays - startWeekday + i + 1);
          otherMonth = true;
        }else if(i >= startWeekday + daysInMonth){
          cellDate = new Date(year, month + 1, i - (startWeekday + daysInMonth) + 1);
          otherMonth = true;
        }else{
          cellDate = new Date(year, month, i - startWeekday + 1);
        }

        const dateKey = getDateKey(cellDate);
        const entry = dataStore[dateKey] || {};

        const cell = document.createElement("div");
        cell.className = "day-cell";
        if(otherMonth) cell.classList.add("other-month");
        if(isToday(cellDate) && !otherMonth) cell.classList.add("today");

        const schedule = entry.schedule ? `<div class="entry-line entry-schedule">${escapeHtml(entry.schedule)}</div>` : `<div class="entry-line entry-empty">—</div>`;
        const performance = `<div class="entry-line entry-performance">業績 ${formatCurrency(entry.performance || 0)}</div>`;
        const salary = `<div class="entry-line entry-salary">薪水 ${formatCurrency(entry.salary || 0)}</div>`;

        cell.innerHTML = `
          <div class="date-num">${cellDate.getDate()}</div>
          <div class="divider"></div>
          ${schedule}
          ${performance}
          ${salary}
        `;

        cell.addEventListener("click", () => openEditor(dateKey));
        calendarGrid.appendChild(cell);
      }
    }

    function renderSummary(){
      const monthData = getCurrentMonthData();
      const totalPerformance = monthData.totalPerformance;
      const totalSalaryRaw = monthData.totalSalary;
      const deduction = Number(settings.monthlyDeduction || 0);
      const totalSalary = totalSalaryRaw - deduction;
      const targetSalary = Number(settings.targetSalary || 0);
      const gap = Math.max(targetSalary - totalSalary, 0);
      const rate = targetSalary > 0 ? (totalSalary / targetSalary) * 100 : 0;

      totalSalaryCard.textContent = formatCurrency(totalSalary);
      totalSalaryCard.className = "value " + (totalSalary >= 0 ? "green" : "red");

      salaryGapCard.textContent = formatCurrency(gap);
      totalPerformanceCard.textContent = formatCurrency(totalPerformance);
      completionRateCard.textContent = formatPercent(rate);
    }

    function renderStats(){
      const monthData = getCurrentMonthData();
      const totalPerformance = monthData.totalPerformance;
      const totalSalaryRaw = monthData.totalSalary;
      const activeDays = monthData.activeDays;
      const deduction = Number(settings.monthlyDeduction || 0);
      const totalSalary = totalSalaryRaw - deduction;
      const targetSalary = Number(settings.targetSalary || 0);
      const rate = targetSalary > 0 ? (totalSalary / targetSalary) * 100 : 0;

      statsPerformance.textContent = formatCurrency(totalPerformance);
      statsSalary.textContent = formatCurrency(totalSalary);
      statsDeduction.textContent = formatCurrency(deduction);
      statsAvgPerformance.textContent = formatCurrency(activeDays > 0 ? totalPerformance / activeDays : 0);
      statsAvgSalary.textContent = formatCurrency(activeDays > 0 ? totalSalaryRaw / activeDays : 0);
      statsRate.textContent = formatPercent(rate);
    }

    function getCurrentMonthData(){
      const key = getMonthKey(currentDate);
      let totalPerformance = 0;
      let totalSalary = 0;
      let activeDays = 0;

      Object.keys(dataStore).forEach(dateKey => {
        if(dateKey.startsWith(key)){
          const item = dataStore[dateKey] || {};
          const performance = Number(item.performance || 0);
          const salary = Number(item.salary || 0);

          totalPerformance += performance;
          totalSalary += salary;

          if(item.schedule || performance !== 0 || salary !== 0 || item.note){
            activeDays += 1;
          }
        }
      });

      return {
        totalPerformance,
        totalSalary,
        activeDays
      };
    }

    function syncSettingsInputs(){
      targetSalaryInput.value = settings.targetSalary ?? 150000;
      monthlyDeductionInput.value = settings.monthlyDeduction ?? 0;
    }

    function openEditor(dateKey){
      selectedDateKey = dateKey;
      const entry = dataStore[dateKey] || {};

      modalTitle.textContent = `編輯 ${dateKey}`;
      scheduleInput.value = entry.schedule || "";
      performanceInput.value = entry.performance ?? "";
      salaryInput.value = entry.salary ?? "";
      noteInput.value = entry.note || "";

      editModal.classList.add("show");
    }

    function closeEditor(){
      editModal.classList.remove("show");
    }

    function saveDay(){
      if(!selectedDateKey) return;

      dataStore[selectedDateKey] = {
        schedule: scheduleInput.value.trim(),
        performance: Number(performanceInput.value || 0),
        salary: Number(salaryInput.value || 0),
        note: noteInput.value.trim()
      };

      saveData();
      closeEditor();
      renderAll();
    }

    function deleteDay(){
      if(!selectedDateKey) return;
      delete dataStore[selectedDateKey];
      saveData();
      closeEditor();
      renderAll();
    }

    function escapeHtml(text){
      return String(text)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    document.getElementById("prevMonthBtn").addEventListener("click", () => {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      renderAll();
    });

    document.getElementById("nextMonthBtn").addEventListener("click", () => {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      renderAll();
    });

    document.getElementById("todayBtn").addEventListener("click", () => {
      currentDate = new Date();
      renderAll();
    });

    document.getElementById("saveDayBtn").addEventListener("click", saveDay);
    document.getElementById("deleteDayBtn").addEventListener("click", deleteDay);

    document.getElementById("saveSettingsBtn").addEventListener("click", () => {
      settings.targetSalary = Number(targetSalaryInput.value || 0);
      saveSettings();
      renderAll();
      alert("設定已儲存");
    });

    document.getElementById("saveDeductionBtn").addEventListener("click", () => {
      settings.monthlyDeduction = Number(monthlyDeductionInput.value || 0);
      saveSettings();
      renderAll();
      alert("扣薪已儲存");
    });

    editModal.addEventListener("click", (e) => {
      if(e.target === editModal){
        closeEditor();
      }
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });

    renderAll();
  </script>
</body>
</html>
