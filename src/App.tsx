import React, { useEffect, useMemo, useRef, useState } from "react";

type Entry = {
  id: string;
  date: string;
  store: string;
  sales: number;
  tail: number;
  refund: number;
  productBonus: number;
};

type Deduction = {
  id: string;
  amount: number;
  note: string;
};

type Settings = {
  idealSalary: number;
  baseSalary: number;
  mealTransport: number;
  travelAllowance: number;
  fixedDeduction: number;
};

const STORAGE_KEY = "salary-calendar-app-v16-final";

const defaultStores = [
  "AA",
  "AD",
  "A1",
  "A2",
  "A3",
  "A5",
  "A6",
  "A7",
  "A8",
  "A9",
  "A10",
  "A11",
  "A12",
  "A13",
  "A15",
];

const defaultSettings: Settings = {
  idealSalary: 150000,
  baseSalary: 25000,
  mealTransport: 2000,
  travelAllowance: 3000,
  fixedDeduction: 35000,
};

function toDateValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function roundAmount(value: number) {
  return Math.round(Number(value || 0));
}

function formatNumber(value: number) {
  return roundAmount(value).toLocaleString("zh-TW", {
    maximumFractionDigits: 0,
  });
}

function getCommission(netSales: number) {
  if (netSales >= 0) {
    if (netSales <= 99999) return netSales * 0.02;
    if (netSales <= 199999) return netSales * 0.03;
    if (netSales <= 299999) return netSales * 0.045;
    return netSales * 0.05;
  }
  return netSales * 0.02;
}

function calcEntry(entry: Entry) {
  const netSales =
    Number(entry.sales || 0) +
    Number(entry.tail || 0) -
    Number(entry.refund || 0);

  const commission = roundAmount(getCommission(netSales));
  const storeSalary = roundAmount(commission + Number(entry.productBonus || 0));

  return {
    netSales: roundAmount(netSales),
    commission,
    storeSalary,
  };
}

function isValidStoreName(value: string) {
  return /^(AA|AD|A\d+)$/.test(value);
}

function sanitizeStores(input: string[]) {
  const cleaned = input
    .map((s) => String(s || "").trim().toUpperCase())
    .filter((s) => s && isValidStoreName(s));

  const unique = Array.from(new Set(cleaned));

  return unique.length > 0
    ? unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : defaultStores;
}

function downloadExcel(filename: string, rows: (string | number)[][]) {

  const tableRows = rows
    .map(
      (row) =>
        "<tr>" +
        row
          .map(
            (cell) =>
              `<td style="border:1px solid #d1d5db;padding:8px;">${String(
                cell ?? ""
              )}</td>`
          )
          .join("") +
        "</tr>"
    )
    .join("");

  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${filename}</title>
    </head>
    <body>
      <table>
        ${tableRows}
      </table>
    </body>
  </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const ua = navigator.userAgent;

  const isAndroidWebView =
    /Android/i.test(ua) &&
    (/wv/i.test(ua) || /Version\/\d+\.\d+/i.test(ua));

  if (isAndroidWebView) {

    // ⭐ Android WebView 用這個下載
    window.location.href = url;

  } else {

    // ⭐ 一般瀏覽器下載
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 3000);
}

export default function App() {
  const today = new Date();
  const todayValue = toDateValue(today);

  const [tab, setTab] = useState<
    "calendar" | "summary" | "deductions" | "settings"
  >("calendar");

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [zoom, setZoom] = useState(1);

  const [stores, setStores] = useState<string[]>(defaultStores);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);

  const [selectedDate, setSelectedDate] = useState(todayValue);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    store: defaultStores[0],
    sales: "",
    tail: "",
    refund: "",
    productBonus: "",
  });

  const [deductionForm, setDeductionForm] = useState({
    amount: "",
    note: "",
  });

  const [newStore, setNewStore] = useState("");

  const tailInputRef = useRef<HTMLInputElement | null>(null);
  const refundInputRef = useRef<HTMLInputElement | null>(null);
  const productBonusInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      setStores(sanitizeStores(data.stores || defaultStores));
      setSettings(data.settings || defaultSettings);
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setDeductions(Array.isArray(data.deductions) ? data.deductions : []);
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ stores, settings, entries, deductions })
    );
  }, [stores, settings, entries, deductions]);

  const validStores = useMemo(() => sanitizeStores(stores), [stores]);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const monthEntries = useMemo(() => {
    return entries.filter((item) => item.date.startsWith(monthKey));
  }, [entries, monthKey]);

  const monthCalculated = useMemo(() => {
    return monthEntries.map((entry) => ({
      ...entry,
      ...calcEntry(entry),
    }));
  }, [monthEntries]);

  const entriesByDate = useMemo(() => {
    const map: Record<
      string,
      Array<Entry & { netSales: number; commission: number; storeSalary: number }>
    > = {};

    monthCalculated.forEach((entry) => {
      if (!map[entry.date]) map[entry.date] = [];
      map[entry.date].push(entry);
    });

    return map;
  }, [monthCalculated]);

  const selectedEntries = useMemo(() => {
    return (entriesByDate[selectedDate] || []).slice();
  }, [entriesByDate, selectedDate]);

  const selectedDayTotalSalary = selectedEntries.reduce(
    (sum, entry) => sum + Number(entry.storeSalary || 0),
    0
  );

  const salesTotal = monthCalculated.reduce((sum, item) => sum + item.sales, 0);
  const tailTotal = monthCalculated.reduce((sum, item) => sum + item.tail, 0);
  const refundTotal = monthCalculated.reduce(
    (sum, item) => sum + item.refund,
    0
  );
  const netSalesTotal = monthCalculated.reduce(
    (sum, item) => sum + item.netSales,
    0
  );
  const commissionTotal = monthCalculated.reduce(
    (sum, item) => sum + item.commission,
    0
  );
  const productBonusTotal = monthCalculated.reduce(
    (sum, item) => sum + item.productBonus,
    0
  );

  const fixedIncome =
    settings.baseSalary +
    settings.mealTransport +
    settings.travelAllowance;

  const otherDeductionTotal = deductions.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const actualSalary =
    fixedIncome +
    commissionTotal +
    productBonusTotal -
    settings.fixedDeduction -
    otherDeductionTotal;

  const gap = settings.idealSalary - actualSalary;
  const progress =
    settings.idealSalary > 0 ? actualSalary / settings.idealSalary : 0;
  const neededSalesEstimate = gap <= 0 ? 0 : gap / 0.03;

  const monthStart = new Date(year, month, 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  const days = Array.from({ length: 42 }, (_, index) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + index);
    return d;
  });

  function openNewEntry(dateValue: string) {
    setSelectedDate(dateValue);
    setEditId(null);
    setForm({
      store: validStores[0] || defaultStores[0],
      sales: "",
      tail: "",
      refund: "",
      productBonus: "",
    });
    setShowForm(true);
  }

  function openEdit(entry: Entry) {
    setSelectedDate(entry.date);
    setEditId(entry.id);
    setForm({
      store: entry.store,
      sales: String(entry.sales || 0),
      tail: String(entry.tail || 0),
      refund: String(entry.refund || 0),
      productBonus: String(entry.productBonus || 0),
    });
    setShowForm(true);
  }

  function saveEntry() {
    const payload: Entry = {
      id: editId || crypto.randomUUID(),
      date: selectedDate,
      store: form.store,
      sales: Number(form.sales || 0),
      tail: Number(form.tail || 0),
      refund: Number(form.refund || 0),
      productBonus: Number(form.productBonus || 0),
    };

    setEntries((prev) => {
      if (editId) {
        return prev.map((item) => (item.id === editId ? payload : item));
      }
      return [...prev, payload].sort((a, b) => a.date.localeCompare(b.date));
    });

    setShowForm(false);
    setEditId(null);
    setSelectedDate(payload.date);
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    setShowForm(false);
    setEditId(null);
  }

  function addDeduction() {
    if (!deductionForm.amount) return;

    setDeductions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        amount: Number(deductionForm.amount),
        note: deductionForm.note,
      },
    ]);

    setDeductionForm({ amount: "", note: "" });
  }

  function addStore() {
    const value = newStore.trim().toUpperCase();
    if (!value) return;
    if (!isValidStoreName(value)) return;
    if (validStores.includes(value)) return;

    setStores((prev) =>
      [...prev, value].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      )
    );

    setNewStore("");
  }

  function removeStore(storeName: string) {
    if (defaultStores.includes(storeName)) return;
    setStores((prev) => prev.filter((item) => item !== storeName));
  }

  function exportAccountantReport() {
    const rows: (string | number)[][] = [
      ["日期", "店家", "業績", "尾款", "退款", "實算業績", "產品獎金"],
      ...monthCalculated.map((item) => [
        item.date,
        item.store,
        item.sales,
        item.tail,
        item.refund,
        item.netSales,
        item.productBonus,
      ]),
    ];

    if (rows.length <= 1) {
      alert("這個月份沒有資料可以匯出");
      return;
    }

    downloadExcel(
      `${year}-${String(month + 1).padStart(2, "0")}_每日業績明細.xls`,
      rows
    );
  }

  const calendarMinWidth =
    zoom <= 0.6
      ? 780
      : zoom <= 0.7
      ? 860
      : zoom <= 0.8
      ? 940
      : zoom <= 0.9
      ? 1020
      : 1100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily:
          '"Noto Sans TC","Microsoft JhengHei","PingFang TC","Heiti TC",sans-serif',
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 30 }}>私人薪資月曆 App</h1>
            <div style={{ color: "#64748b", marginTop: 6 }}>
              逐店分開計算，最後再加總每日薪水。
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                const d = new Date(year, month - 1, 1);
                setYear(d.getFullYear());
                setMonth(d.getMonth());
              }}
              style={buttonStyle}
            >
              上個月
            </button>

            <div style={{ minWidth: 140, textAlign: "center", fontWeight: 700 }}>
              {year} / {month + 1} 月
            </div>

            <button
              onClick={() => {
                const d = new Date(year, month + 1, 1);
                setYear(d.getFullYear());
                setMonth(d.getMonth());
              }}
              style={buttonStyle}
            >
              下個月
            </button>
          </div>
        </div>

        {tab === "calendar" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={summaryCardStyle}>
              <div style={summaryTitleStyle}>本月薪水</div>
              <div style={{ ...summaryValueStyle, color: "#047857" }}>
                {formatNumber(actualSalary)}
              </div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryTitleStyle}>距離理想薪資差距</div>
              <div
                style={{
                  ...summaryValueStyle,
                  color: gap > 0 ? "#dc2626" : "#047857",
                }}
              >
                {formatNumber(gap)}
              </div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryTitleStyle}>尚需業績估算</div>
              <div style={summaryValueStyle}>
                {formatNumber(neededSalesEstimate)}
              </div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryTitleStyle}>達成率</div>
              <div style={summaryValueStyle}>{(progress * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <button
            onClick={() => setTab("calendar")}
            style={tab === "calendar" ? activeTabStyle : tabStyle}
          >
            月曆
          </button>
          <button
            onClick={() => setTab("summary")}
            style={tab === "summary" ? activeTabStyle : tabStyle}
          >
            月統計
          </button>
          <button
            onClick={() => setTab("deductions")}
            style={tab === "deductions" ? activeTabStyle : tabStyle}
          >
            扣薪
          </button>
          <button
            onClick={() => setTab("settings")}
            style={tab === "settings" ? activeTabStyle : tabStyle}
          >
            設定
          </button>

          {tab === "calendar" && (
            <>
              <button
                onClick={() =>
                  setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))
                }
                style={buttonStyle}
              >
                縮小
              </button>
              <button
                onClick={() =>
                  setZoom((z) => Math.min(1.1, Number((z + 0.1).toFixed(2))))
                }
                style={buttonStyle}
              >
                放大
              </button>
            </>
          )}
        </div>

        {tab === "calendar" && (
          <>
            <div style={panelStyle}>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <div style={{ minWidth: calendarMinWidth }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {["日", "一", "二", "三", "四", "五", "六"].map((name) => (
                      <div
                        key={name}
                        style={{
                          textAlign: "center",
                          fontWeight: 700,
                          color: "#64748b",
                          fontSize: 16,
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                      gap: 8,
                    }}
                  >
                    {days.map((date) => {
                      const dateValue = toDateValue(date);
                      const calculatedEntries = entriesByDate[dateValue] || [];
                      const salaryTotal = calculatedEntries.reduce(
                        (sum, entry) => sum + entry.storeSalary,
                        0
                      );
                      const inMonth = date.getMonth() === month;
                      const hasRefund = calculatedEntries.some(
                        (item) => item.refund > 0
                      );
                      const isToday = dateValue === todayValue;

                      return (
                        <div
                          key={dateValue}
                          style={{
                            minHeight: 132,
                            borderRadius: 16,
                            border:
                              selectedDate === dateValue
                                ? "2px solid #0f766e"
                                : "1px solid #dbe4ee",
                            background: "white",
                            padding: 10,
                            opacity: inMonth ? 1 : 0.35,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <button
                            onClick={() => setSelectedDate(dateValue)}
                            style={{
                              all: "unset",
                              display: "block",
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 8,
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 16,
                                  display: "flex",
                                  gap: 6,
                                  alignItems: "center",
                                }}
                              >
                                <span>{date.getDate()}</span>
                                {isToday && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      padding: "2px 6px",
                                      borderRadius: 999,
                                      background: "#dcfce7",
                                      color: "#166534",
                                      fontWeight: 700,
                                    }}
                                  >
                                    今日
                                  </span>
                                )}
                              </div>

                              {hasRefund ? (
                                <div
                                  style={{
                                    color: "#dc2626",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    marginRight: 28,
                                  }}
                                >
                                  退款
                                </div>
                              ) : (
                                <div />
                              )}
                            </div>

                            <div
                              style={{
                                fontSize: 14,
                                lineHeight: 1.45,
                                minHeight: 52,
                              }}
                            >
                              {calculatedEntries.length > 0 && (
                                <>
                                  {calculatedEntries.slice(0, 2).map((entry) => (
                                    <div key={entry.id} style={{ marginBottom: 4 }}>
                                      <div
                                        style={{
                                          fontWeight: 600,
                                          fontSize: 14,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {entry.store} {formatNumber(entry.sales)}
                                      </div>
                                    </div>
                                  ))}
                                  {calculatedEntries.length > 2 && (
                                    <div style={{ color: "#64748b", fontSize: 13 }}>
                                      +{calculatedEntries.length - 2}筆
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {calculatedEntries.length > 0 && (
                              <div
                                style={{
                                  marginTop: 8,
                                  paddingTop: 8,
                                  borderTop: "1px solid #e5e7eb",
                                  fontWeight: 700,
                                  color: "#047857",
                                  fontSize: 14,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                💰 {formatNumber(salaryTotal)}
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => openNewEntry(dateValue)}
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              border: "1px solid #cbd5e1",
                              background: "white",
                              cursor: "pointer",
                              fontWeight: 700,
                              lineHeight: 1,
                            }}
                            aria-label={`新增 ${dateValue} 資料`}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...panelStyle, marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 22 }}>{selectedDate}明細</h2>
                <button
                  onClick={() => openNewEntry(selectedDate)}
                  style={{
                    ...buttonStyle,
                    background: "#0f766e",
                    color: "white",
                    border: "none",
                  }}
                >
                  這一天新增資料
                </button>
              </div>

              {selectedEntries.length === 0 ? (
                <div style={{ color: "#64748b" }}>這一天還沒有資料。</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {selectedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        padding: 14,
                        background: "white",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ lineHeight: 1.7 }}>
                          <div style={{ fontWeight: 700, fontSize: 18 }}>
                            {entry.store}
                          </div>
                          <div>業績：{formatNumber(entry.sales)}</div>
                          <div>尾款：{formatNumber(entry.tail)}</div>
                          <div
                            style={{
                              color: entry.refund > 0 ? "#dc2626" : undefined,
                            }}
                          >
                            退款：{formatNumber(entry.refund)}
                          </div>
                          <div>產品獎金：{formatNumber(entry.productBonus)}</div>
                          <div>業績獎金：{formatNumber(entry.commission)}</div>
                          <div style={{ fontWeight: 700, color: "#047857" }}>
                            店家薪資：{formatNumber(entry.storeSalary)}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(entry)} style={buttonStyle}>
                            編輯
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            style={{ ...buttonStyle, color: "#dc2626" }}
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  textAlign: "right",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                當天總工資：{formatNumber(selectedDayTotalSalary)}
              </div>
            </div>
          </>
        )}

        {tab === "summary" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <div style={summaryCardStyle}>
                <div style={summaryTitleStyle}>當月業績總和</div>
                <div style={summaryValueStyle}>{formatNumber(salesTotal)}</div>
              </div>
              <div style={summaryCardStyle}>
                <div style={summaryTitleStyle}>當月尾款總和</div>
                <div style={summaryValueStyle}>{formatNumber(tailTotal)}</div>
              </div>
              <div style={summaryCardStyle}>
                <div style={summaryTitleStyle}>當月退款總和</div>
                <div style={{ ...summaryValueStyle, color: "#dc2626" }}>
                  {formatNumber(refundTotal)}
                </div>
              </div>
              <div style={summaryCardStyle}>
                <div style={summaryTitleStyle}>當月實算業績</div>
                <div style={summaryValueStyle}>{formatNumber(netSalesTotal)}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={panelStyle}>
                <h2 style={{ marginTop: 0 }}>薪資統計</h2>
                <Row label="業績獎金總和" value={commissionTotal} />
                <Row label="產品獎金總和" value={productBonusTotal} />
                <Row label="底薪" value={settings.baseSalary} />
                <Row label="伙食+車資" value={settings.mealTransport} />
                <Row label="跑店津貼" value={settings.travelAllowance} />
                <Row label="固定收入合計" value={fixedIncome} strong />
                <Row label="固定扣薪" value={settings.fixedDeduction} />
                <Row label="其他扣薪" value={otherDeductionTotal} />
                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 12, paddingTop: 12 }}>
                  <Row
                    label="目前實際薪水"
                    value={actualSalary}
                    strong
                    color="#047857"
                  />
                </div>
              </div>

              <div style={panelStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <h2 style={{ margin: 0 }}>目標追蹤</h2>
                  <button
                    type="button"
                    onClick={() => exportAccountantReport()}
                    style={{
                      ...buttonStyle,
                      background: "#0f766e",
                      color: "white",
                      border: "none",
                    }}
                  >
                    匯出會計明細
                  </button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Row label="理想薪資" value={settings.idealSalary} />
                  <Row label="差距" value={gap} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid #eef2f7",
                    }}
                  >
                    <span>達成率</span>
                    <span style={{ fontWeight: 700 }}>
                      {(progress * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Row label="尚需業績估算" value={neededSalesEstimate} strong />
                  <div style={{ color: "#64748b", marginTop: 12, fontSize: 14 }}>
                    尚需業績用 3% 平均抽成估算。
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "deductions" && (
          <div style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>其他扣薪＋備註</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 8,
                marginBottom: 16,
                alignItems: "stretch",
              }}
            >
              <input
                type="number"
                inputMode="numeric"
                value={deductionForm.amount}
                onChange={(e) =>
                  setDeductionForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="扣薪金額"
                style={inputStyle}
              />
              <input
                value={deductionForm.note}
                onChange={(e) =>
                  setDeductionForm((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="備註"
                style={inputStyle}
              />
              <button
                onClick={addDeduction}
                style={{
                  ...buttonStyle,
                  background: "#0f766e",
                  color: "white",
                  border: "none",
                  width: "100%",
                  minHeight: 48,
                }}
              >
                新增
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {deductions.length === 0 ? (
                <div style={{ color: "#64748b" }}>目前沒有其他扣薪。</div>
              ) : null}

              {deductions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 12,
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: "1 1 180px" }}>
                    <div style={{ fontWeight: 700 }}>{formatNumber(item.amount)}</div>
                    <div style={{ color: "#64748b", fontSize: 14 }}>
                      {item.note || "無備註"}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setDeductions((prev) =>
                        prev.filter((d) => d.id !== item.id)
                      )
                    }
                    style={{
                      ...buttonStyle,
                      flex: "0 0 auto",
                      minWidth: 88,
                    }}
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            <div style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>薪資設定</h2>
              <Field label="理想薪資">
                <input
                  type="number"
                  inputMode="numeric"
                  value={settings.idealSalary}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      idealSalary: Number(e.target.value || 0),
                    }))
                  }
                  style={inputStyle}
                />
              </Field>
              <Field label="底薪">
                <input
                  type="number"
                  inputMode="numeric"
                  value={settings.baseSalary}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      baseSalary: Number(e.target.value || 0),
                    }))
                  }
                  style={inputStyle}
                />
              </Field>
              <Field label="伙食+車資">
                <input
                  type="number"
                  inputMode="numeric"
                  value={settings.mealTransport}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      mealTransport: Number(e.target.value || 0),
                    }))
                  }
                  style={inputStyle}
                />
              </Field>
              <Field label="跑店津貼">
                <input
                  type="number"
                  inputMode="numeric"
                  value={settings.travelAllowance}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      travelAllowance: Number(e.target.value || 0),
                    }))
                  }
                  style={inputStyle}
                />
              </Field>
              <Field label="固定扣薪">
                <input
                  type="number"
                  inputMode="numeric"
                  value={settings.fixedDeduction}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      fixedDeduction: Number(e.target.value || 0),
                    }))
                  }
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>店家設定</h2>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  placeholder="新增店家，例如 A26"
                  style={inputStyle}
                />
                <button
                  onClick={addStore}
                  style={{
                    ...buttonStyle,
                    background: "#0f766e",
                    color: "white",
                    border: "none",
                  }}
                >
                  新增
                </button>
              </div>

              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
                只允許 AA、AD、A數字 格式。
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {validStores.map((store) => (
                  <div
                    key={store}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 10,
                      background: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{store}</div>

                    {defaultStores.includes(store) ? (
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>預設</div>
                    ) : (
                      <button
                        onClick={() => removeStore(store)}
                        style={{
                          ...buttonStyle,
                          color: "#dc2626",
                          padding: "6px 10px",
                        }}
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>
              {editId ? "編輯資料" : "新增資料"}｜{selectedDate}
            </h2>

            <div style={{ color: "#64748b", marginBottom: 12 }}>
              儲存後自動計算薪資
            </div>

            <Field label="店家">
              <select
                value={form.store}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, store: e.target.value }))
                }
                style={inputStyle}
              >
                {validStores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="業績">
              <input
                type="number"
                inputMode="numeric"
                value={form.sales}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sales: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    tailInputRef.current?.focus();
                  }
                }}
                style={inputStyle}
              />
            </Field>

            <Field label="尾款">
              <input
                ref={tailInputRef}
                type="number"
                inputMode="numeric"
                value={form.tail}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tail: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    refundInputRef.current?.focus();
                  }
                }}
                style={inputStyle}
              />
            </Field>

            <Field label="退款">
              <input
                ref={refundInputRef}
                type="number"
                inputMode="numeric"
                value={form.refund}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, refund: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    productBonusInputRef.current?.focus();
                  }
                }}
                style={{ ...inputStyle, color: "#dc2626" }}
              />
            </Field>

            <Field label="產品獎金">
              <input
                ref={productBonusInputRef}
                type="number"
                inputMode="numeric"
                value={form.productBonus}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    productBonus: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </Field>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                {editId ? (
                  <button
                    onClick={() => deleteEntry(editId)}
                    style={{ ...buttonStyle, color: "#dc2626" }}
                  >
                    刪除
                  </button>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  style={buttonStyle}
                >
                  取消
                </button>
                <button
                  onClick={saveEntry}
                  style={{
                    ...buttonStyle,
                    background: "#0f766e",
                    color: "white",
                    border: "none",
                  }}
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  color,
}: {
  label: string;
  value: number;
  strong?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #eef2f7",
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500, color }}>
        {formatNumber(value)}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ marginBottom: 6, fontWeight: 700 }}>{label}</div>
      {children}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  border: "1px solid #cbd5e1",
  background: "white",
  borderRadius: 12,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
};

const tabStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "white",
};

const activeTabStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#0f766e",
  color: "white",
  border: "none",
};

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
};

const summaryCardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
};

const summaryTitleStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 14,
};

const summaryValueStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 28,
  marginTop: 6,
};

const inputStyle: React.CSSProperties = {
  fontFamily: "inherit",
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "white",
  borderRadius: 20,
  padding: 20,
  boxSizing: "border-box",
};
