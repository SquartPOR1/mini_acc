(() => {
  "use strict";

  const STORAGE_KEY = "ledgerly-mini-accounting-v1";
  const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
  const dateFormatter = new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "short", day: "numeric" });
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const accountTypes = ["Income", "Expense", "Asset", "Liability", "Equity"];
  const defaultAccounts = [
    { id: "acct-income-dues", code: "4001", name: "Membership dues", type: "Income", description: "Regular member contributions" },
    { id: "acct-income-donation", code: "4002", name: "Donations", type: "Income", description: "Donations and sponsorships" },
    { id: "acct-income-event", code: "4003", name: "Event income", type: "Income", description: "Income from organization events" },
    { id: "acct-expense-supplies", code: "5001", name: "Office supplies", type: "Expense", description: "Stationery and office materials" },
    { id: "acct-expense-travel", code: "5002", name: "Travel & transportation", type: "Expense", description: "Local travel and transportation" },
    { id: "acct-expense-event", code: "5003", name: "Event expenses", type: "Expense", description: "Costs for organization events" },
    { id: "acct-expense-utilities", code: "5004", name: "Utilities", type: "Expense", description: "Internet, electricity, and utilities" },
    { id: "acct-asset-cash", code: "1001", name: "Cash on hand", type: "Asset", description: "Organization cash fund" },
    { id: "acct-asset-bank", code: "1002", name: "Bank account", type: "Asset", description: "Organization checking account" },
    { id: "acct-equity-fund", code: "3001", name: "Organization fund", type: "Equity", description: "Accumulated organization funds" }
  ];

  const today = new Date();
  const dateDaysAgo = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return localDateString(date);
  };
  const dateThisMonth = (daysAgo) => {
    const date = new Date(today);
    date.setDate(Math.max(1, date.getDate() - daysAgo));
    return localDateString(date);
  };
  const sampleTransactions = [
    { id: "tx-1", type: "income", description: "Monthly membership dues", category: "Membership dues", account: "Bank account", amount: 12500, date: dateThisMonth(1), notes: "Member contributions" },
    { id: "tx-2", type: "expense", description: "Workshop materials", category: "Office supplies", account: "Cash on hand", amount: 1850, date: dateThisMonth(2), notes: "Materials for the student workshop" },
    { id: "tx-3", type: "income", description: "Community event donations", category: "Donations", account: "Bank account", amount: 8200, date: dateThisMonth(4), notes: "" },
    { id: "tx-4", type: "expense", description: "Venue reservation", category: "Event expenses", account: "Bank account", amount: 4500, date: dateThisMonth(6), notes: "Community outreach event" },
    { id: "tx-5", type: "expense", description: "Local transport", category: "Travel & transportation", account: "Cash on hand", amount: 750, date: dateThisMonth(9), notes: "" },
    { id: "tx-6", type: "income", description: "Fundraising booth", category: "Event income", account: "Cash on hand", amount: 5600, date: dateThisMonth(12), notes: "Campus fair" },
    { id: "tx-7", type: "expense", description: "Internet bill", category: "Utilities", account: "Bank account", amount: 1200, date: dateThisMonth(15), notes: "" },
    { id: "tx-8", type: "income", description: "Membership dues", category: "Membership dues", account: "Bank account", amount: 10500, date: dateDaysAgo(37), notes: "September member contributions" },
    { id: "tx-9", type: "expense", description: "Printing & materials", category: "Office supplies", account: "Cash on hand", amount: 2300, date: dateDaysAgo(43), notes: "" },
    { id: "tx-10", type: "income", description: "Local sponsor", category: "Donations", account: "Bank account", amount: 9200, date: dateDaysAgo(72), notes: "" },
    { id: "tx-11", type: "expense", description: "Volunteer travel", category: "Travel & transportation", account: "Cash on hand", amount: 1350, date: dateDaysAgo(79), notes: "" },
    { id: "tx-12", type: "income", description: "Summer workshop fees", category: "Event income", account: "Cash on hand", amount: 7400, date: dateDaysAgo(105), notes: "" },
    { id: "tx-13", type: "expense", description: "Event venue", category: "Event expenses", account: "Bank account", amount: 3200, date: dateDaysAgo(111), notes: "" },
    { id: "tx-14", type: "income", description: "Monthly membership dues", category: "Membership dues", account: "Bank account", amount: 9800, date: dateDaysAgo(137), notes: "" },
    { id: "tx-15", type: "expense", description: "Office stationery", category: "Office supplies", account: "Cash on hand", amount: 980, date: dateDaysAgo(145), notes: "" },
    { id: "tx-16", type: "income", description: "Community donations", category: "Donations", account: "Bank account", amount: 6800, date: dateDaysAgo(164), notes: "" },
    { id: "tx-17", type: "expense", description: "Electricity bill", category: "Utilities", account: "Bank account", amount: 1450, date: dateDaysAgo(170), notes: "" }
  ];
  const sampleMembers = [
    { id: "mem-1", memberId: "ORG-26-001", name: "Alyssa Mendoza", course: "BSIT", year: "3rd Year", email: "alyssa.mendoza@school.edu", phone: "0917 555 0101", fee: 1000, createdAt: dateDaysAgo(150) },
    { id: "mem-2", memberId: "ORG-26-002", name: "Paolo Reyes", course: "BSCS", year: "2nd Year", email: "paolo.reyes@school.edu", phone: "0917 555 0102", fee: 1000, createdAt: dateDaysAgo(145) },
    { id: "mem-3", memberId: "ORG-26-003", name: "Jasmine Cruz", course: "BSIT", year: "4th Year", email: "jasmine.cruz@school.edu", phone: "0917 555 0103", fee: 1000, createdAt: dateDaysAgo(140) },
    { id: "mem-4", memberId: "ORG-26-004", name: "Miguel Santos", course: "BSBA", year: "1st Year", email: "miguel.santos@school.edu", phone: "0917 555 0104", fee: 1000, createdAt: dateDaysAgo(135) },
    { id: "mem-5", memberId: "ORG-26-005", name: "Nicole Flores", course: "BSED", year: "3rd Year", email: "nicole.flores@school.edu", phone: "0917 555 0105", fee: 1000, createdAt: dateDaysAgo(130) },
    { id: "mem-6", memberId: "ORG-26-006", name: "Ethan Garcia", course: "BSIT", year: "2nd Year", email: "ethan.garcia@school.edu", phone: "0917 555 0106", fee: 1000, createdAt: dateDaysAgo(125) },
    { id: "mem-7", memberId: "ORG-26-007", name: "Sofia Bautista", course: "BSCS", year: "1st Year", email: "sofia.bautista@school.edu", phone: "0917 555 0107", fee: 1000, createdAt: dateDaysAgo(120) },
    { id: "mem-8", memberId: "ORG-26-008", name: "Noah Villanueva", course: "BSIT", year: "4th Year", email: "noah.villanueva@school.edu", phone: "0917 555 0108", fee: 1000, createdAt: dateDaysAgo(115) }
  ];
  const sampleCollections = [
    { id: "col-1", reference: "OR-2026-0001", memberId: "mem-1", memberName: "Alyssa Mendoza", date: dateThisMonth(1), amount: 1000, method: "Cash", notes: "Full membership fee" },
    { id: "col-2", reference: "OR-2026-0002", memberId: "mem-2", memberName: "Paolo Reyes", date: dateThisMonth(2), amount: 500, method: "GCash", notes: "First installment" },
    { id: "col-3", reference: "OR-2026-0003", memberId: "mem-3", memberName: "Jasmine Cruz", date: dateThisMonth(3), amount: 1000, method: "Bank transfer", notes: "" },
    { id: "col-4", reference: "OR-2026-0004", memberId: "mem-4", memberName: "Miguel Santos", date: dateThisMonth(5), amount: 1000, method: "Cash", notes: "" },
    { id: "col-5", reference: "OR-2026-0005", memberId: "mem-5", memberName: "Nicole Flores", date: dateThisMonth(7), amount: 250, method: "Cash", notes: "Partial payment" }
  ];
  const sampleAdvances = [
    { id: "adv-1", reference: "CA-2026-0001", activity: "Student leadership seminar", responsible: "Alyssa Mendoza", date: dateThisMonth(14), amount: 5000 },
    { id: "adv-2", reference: "CA-2026-0002", activity: "Campus welcome booth", responsible: "Miguel Santos", date: dateThisMonth(10), amount: 2500 },
    { id: "adv-3", reference: "CA-2026-0003", activity: "Community outreach", responsible: "Nicole Flores", date: dateThisMonth(4), amount: 4000 }
  ];
  const sampleCashReturns = [
    { id: "return-1", advanceId: "adv-3", reference: "CR-2026-0001", amount: 4000, date: dateThisMonth(2) }
  ];
  const sampleExpenses = [
    { id: "exp-1", description: "Seminar venue and equipment", category: "Activities & events", date: dateThisMonth(12), amount: 3000, responsible: "Alyssa Mendoza", reference: "OR-SEP-1042", advanceId: "adv-1", notes: "" },
    { id: "exp-2", description: "Seminar refreshments", category: "Food & refreshments", date: dateThisMonth(12), amount: 1200, responsible: "Alyssa Mendoza", reference: "OR-SEP-1048", advanceId: "adv-1", notes: "" },
    { id: "exp-3", description: "Welcome booth materials", category: "Supplies", date: dateThisMonth(8), amount: 2800, responsible: "Miguel Santos", reference: "OR-SEP-1011", advanceId: "adv-2", notes: "Over advance by ₱300" },
    { id: "exp-4", description: "Outreach transport", category: "Transportation", date: dateThisMonth(2), amount: 650, responsible: "Nicole Flores", reference: "OR-SEP-1090", advanceId: "", notes: "" }
  ];
  const sampleUsers = [
    { id: "user-admin", name: "Organization Admin", email: "admin@schoolorg.demo", role: "Administrator", status: "Active", current: true },
    { id: "user-finance", name: "Finance Officer", email: "finance@schoolorg.demo", role: "Finance officer", status: "Active", current: false }
  ];
  const defaultSettings = {
    organizationName: "School Organization",
    defaultFee: 1000,
    receiptPrefix: "OR"
  };

  let state;
  let toastTimer;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = (amount) => currency.format(Number(amount) || 0);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const validDate = (value) => {
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) ? date : new Date(0);
  };
  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.transactions) && Array.isArray(parsed.accounts)) {
          state = parsed;
          if (!Array.isArray(state.members)) state.members = structuredClone(sampleMembers);
          if (!Array.isArray(state.collections)) state.collections = structuredClone(sampleCollections);
          if (!Array.isArray(state.expenses)) state.expenses = structuredClone(sampleExpenses);
          if (!Array.isArray(state.advances)) state.advances = structuredClone(sampleAdvances);
          if (!Array.isArray(state.cashReturns)) state.cashReturns = structuredClone(sampleCashReturns);
          if (!Array.isArray(state.auditTrail)) state.auditTrail = [];
          if (!Number.isInteger(Number(state.nextAuditNumber)) || Number(state.nextAuditNumber) < 1) state.nextAuditNumber = state.auditTrail.length + 1;
          else state.nextAuditNumber = Number(state.nextAuditNumber);
          if (!Array.isArray(state.users)) state.users = structuredClone(sampleUsers);
          if (!state.settings || typeof state.settings !== "object") state.settings = structuredClone(defaultSettings);
          if (!Number.isInteger(Number(state.nextMemberNumber)) || Number(state.nextMemberNumber) < 1) state.nextMemberNumber = state.members.length + 1;
          else state.nextMemberNumber = Number(state.nextMemberNumber);
          if (!Number.isInteger(Number(state.nextAccountCode)) || Number(state.nextAccountCode) < 1) state.nextAccountCode = 6001;
          else state.nextAccountCode = Number(state.nextAccountCode);
          if (!Number.isInteger(Number(state.nextCashReturnNumber)) || Number(state.nextCashReturnNumber) < 1) state.nextCashReturnNumber = state.cashReturns.length + 1;
          else state.nextCashReturnNumber = Number(state.nextCashReturnNumber);
          return;
        }
        throw new Error("Saved accounting data has an invalid format.");
      }
    } catch (error) {
      console.error("Could not load saved accounting data.", error);
      showToast("Saved data could not be loaded. Starting with sample data.", "error");
    }
    state = {
      accounts: structuredClone(defaultAccounts),
      transactions: structuredClone(sampleTransactions),
      nextAccountCode: 6001,
      members: structuredClone(sampleMembers),
      collections: structuredClone(sampleCollections),
      expenses: structuredClone(sampleExpenses),
      advances: structuredClone(sampleAdvances),
      cashReturns: structuredClone(sampleCashReturns),
      auditTrail: [],
      nextAuditNumber: 1,
      nextMemberNumber: sampleMembers.length + 1,
      nextCashReturnNumber: sampleCashReturns.length + 1,
      users: structuredClone(sampleUsers),
      settings: structuredClone(defaultSettings)
    };
    saveState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Could not save accounting data.", error);
      showToast("Your browser could not save this change.", "error");
    }
  }

  function recordActivity(activity, entityType, entityId, sourceReference, description, amount, date) {
    const number = Number(state.nextAuditNumber) || 1;
    const now = new Date();
    state.auditTrail.push({
      id: `audit-${Date.now()}-${number}`,
      reference: activity === "Record updated" || activity === "Record deleted"
        ? `AT-${now.getFullYear()}-${String(number).padStart(4, "0")}`
        : sourceReference,
      sourceReference,
      activity,
      entityType,
      entityId,
      description,
      amount: Number(amount) || 0,
      date: activity === "Record updated" || activity === "Record deleted" ? localDateString(now) : (date || localDateString(now)),
      recordedAt: now.toISOString()
    });
    state.nextAuditNumber = number + 1;
  }

  function showToast(message, type = "success") {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.remove("success", "error");
    toast.classList.add(type);
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2800);
  }

  function accountForCategory(name, type) {
    return state.accounts.find((account) => account.name === name && account.type === (type === "income" ? "Income" : "Expense"));
  }

  function navigate(page) {
    $$(".page").forEach((section) => section.classList.toggle("active", section.id === `page-${page}`));
    $$(".nav-link").forEach((button) => {
      button.classList.toggle("active", button.dataset.page === page);
      if (button.dataset.page === page) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const activeNav = $(`.nav-link[data-page="${page}"]`);
    const navIcon = activeNav?.querySelector(".nav-icon")?.textContent || "";
    $("#breadcrumbPage").textContent = activeNav ? activeNav.textContent.replace(navIcon, "").trim() : "Dashboard";
    $("#sidebar").classList.remove("open");
    if (page === "dashboard") renderDashboard();
    if (page === "members") renderMembers();
    if (page === "collections") renderCollections();
    if (page === "expenses") renderExpenses();
    if (page === "liquidation") renderLiquidation();
    if (page === "transactions") renderTransactions();
    if (page === "accounts") renderAccounts();
    if (page === "reports") renderReports();
    if (page === "users") renderUsers();
    if (page === "settings") renderSettings();
  }

  function memberPayments(memberId) {
    return state.collections.filter((item) => item.memberId === memberId);
  }

  function memberPaid(memberId) {
    return memberPayments(memberId).reduce((sum, item) => sum + Number(item.amount), 0);
  }

  function memberStatus(member) {
    const paid = memberPaid(member.id);
    if (paid >= Number(member.fee)) return "Paid";
    return paid > 0 ? "Partial" : "Unpaid";
  }

  function collectionTotal(items = state.collections) {
    return items.reduce((sum, item) => sum + Number(item.amount), 0);
  }

  function expenseTotal(items = state.expenses) {
    return items.reduce((sum, item) => sum + Number(item.amount), 0);
  }

  function transactionTotal(type, items = state.transactions) {
    return items.filter((item) => item.type === type).reduce((sum, item) => sum + Number(item.amount), 0);
  }

  function financialIncomeTotal(collections = state.collections, transactions = state.transactions) {
    return collectionTotal(collections) + transactionTotal("income", transactions);
  }

  function financialExpenseTotal(expenses = state.expenses, transactions = state.transactions) {
    return expenseTotal(expenses) + transactionTotal("expense", transactions);
  }

  function liquidation(advance) {
    const actual = state.expenses.filter((item) => item.advanceId === advance.id).reduce((sum, item) => sum + Number(item.amount), 0);
    const returned = state.cashReturns.filter((item) => item.advanceId === advance.id).reduce((sum, item) => sum + Number(item.amount), 0);
    const difference = Number(advance.amount) - actual;
    return { actual, returned, difference, remaining: difference > 0 ? Math.max(0, difference - returned) : difference };
  }

  function availableCashBalance() {
    return financialIncomeTotal() - financialExpenseTotal();
  }

  function filteredByDate(items, start, end) {
    return items.filter((item) => (!start || item.date >= start) && (!end || item.date <= end));
  }

  function renderFinancialChart(container, collections, expenses, start = "", end = "", limit = 6) {
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let firstMonth;
    let lastMonth;
    if (start || end) {
      firstMonth = start ? validDate(start) : new Date(today.getFullYear(), today.getMonth() - limit + 1, 1);
      lastMonth = end ? validDate(end) : today;
    } else {
      firstMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - limit + 1, 1);
      lastMonth = currentMonth;
    }
    const first = new Date(firstMonth.getFullYear(), firstMonth.getMonth(), 1);
    const last = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    let months = [];
    for (let cursor = first; cursor <= last && months.length < 24; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
      months.push(new Date(cursor));
    }
    if (!months.length) months = [currentMonth];
    if (months.length > limit && !(start || end)) months = months.slice(-limit);
    const totals = months.map((date) => {
      const inMonth = (item) => {
        const itemDate = validDate(item.date);
        return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth();
      };
      return {
        date,
        income: collections.filter(inMonth).reduce((sum, item) => sum + Number(item.amount), 0),
        expense: expenses.filter(inMonth).reduce((sum, item) => sum + Number(item.amount), 0)
      };
    });
    const max = Math.max(...totals.flatMap((item) => [item.income, item.expense]), 1);
    container.innerHTML = totals.map((item) => {
      const incomeHeight = Math.max(2, item.income / max * 100);
      const expenseHeight = Math.max(2, item.expense / max * 100);
      const label = monthFormatter.format(item.date);
      return `<div class="chart-month" title="${label}: income ${money(item.income)}, expenses ${money(item.expense)}"><div class="bar-pair"><div class="bar" style="height:${incomeHeight}%"></div><div class="bar expense-bar" style="height:${expenseHeight}%"></div></div><span>${label}</span></div>`;
    }).join("");
  }

  function transactionRow(transaction, actions = true) {
    const isIncome = transaction.type === "income";
    const icon = isIncome ? "↗" : "↙";
    return `<tr>
      <td><div class="transaction-name"><span class="transaction-avatar ${transaction.type}">${icon}</span>${escapeHtml(transaction.description)}</div></td>
      <td><span class="type-pill ${transaction.type}">${escapeHtml(transaction.category)}</span></td>
      <td>${dateFormatter.format(validDate(transaction.date))}</td>
      <td>${escapeHtml(transaction.account)}</td>
      <td class="amount ${transaction.type}">${isIncome ? "+" : "−"}${money(transaction.amount)}</td>
      ${actions ? `<td><div class="row-actions"><button class="row-action" data-edit-transaction="${escapeHtml(transaction.id)}" title="Edit transaction" aria-label="Edit ${escapeHtml(transaction.description)}">✎</button><button class="row-action delete" data-delete-transaction="${escapeHtml(transaction.id)}" title="Delete transaction" aria-label="Delete ${escapeHtml(transaction.description)}">×</button></div></td>` : "<td></td>"}
    </tr>`;
  }

  function renderDashboard() {
    const assessed = state.members.reduce((sum, member) => sum + Number(member.fee), 0);
    const collected = collectionTotal();
    const monthStart = localDateString(new Date(today.getFullYear(), today.getMonth(), 1));
    const monthlyCollections = filteredByDate(state.collections, monthStart, localDateString(today));
    const monthlyExpenses = filteredByDate(state.expenses, monthStart, localDateString(today));
    const monthlyTransactions = filteredByDate(state.transactions, monthStart, localDateString(today));
    $("#membersCount").textContent = state.members.length;
    $("#assessedTotal").textContent = money(assessed);
    $("#actualCollections").textContent = money(collected);
    $("#outstandingFees").textContent = money(Math.max(0, assessed - collected));
    $("#totalExpenses").textContent = money(financialExpenseTotal());
    $("#availableCash").textContent = money(availableCashBalance());

    const recent = [...state.transactions].sort((a, b) => validDate(b.date) - validDate(a.date)).slice(0, 5);
    $("#recentTransactions").innerHTML = recent.map((item) => transactionRow(item, false)).join("");
    $("#recentEmpty").classList.toggle("hidden", recent.length > 0);
    $(".recent-panel .table-wrap").classList.toggle("hidden", recent.length === 0);
    const monthlyIncome = [...monthlyCollections, ...monthlyTransactions.filter((item) => item.type === "income")];
    const monthlyAllExpenses = [...monthlyExpenses, ...monthlyTransactions.filter((item) => item.type === "expense")];
    renderFinancialChart($("#cashFlowChart"), [...state.collections, ...state.transactions.filter((item) => item.type === "income")], [...state.expenses, ...state.transactions.filter((item) => item.type === "expense")], "", "", 6);
    renderBreakdown($("#expenseBreakdown"), monthlyAllExpenses);
    if (monthlyIncome.length || monthlyAllExpenses.length) {
      const income = financialIncomeTotal(monthlyCollections, monthlyTransactions);
      $(".activity-panel .panel-heading p").textContent = `${money(income)} income · ${money(financialExpenseTotal(monthlyExpenses, monthlyTransactions))} expenses this month`;
    }
    renderRecentActivity();
  }

  function renderRecentActivity() {
    const activity = [
      ...state.transactions.map((item) => ({ ...item })),
      ...state.collections.map((item) => ({ type: "income", description: `${item.memberName} · ${item.reference}`, category: "Membership dues", date: item.date, account: item.method, amount: item.amount })),
      ...state.expenses.map((item) => ({ type: "expense", description: item.description, category: item.category, date: item.date, account: item.responsible, amount: item.amount }))
    ].sort((a, b) => validDate(b.date) - validDate(a.date)).slice(0, 5);
    $("#recentTransactions").innerHTML = activity.map((item) => transactionRow(item, false)).join("");
    $("#recentEmpty").classList.toggle("hidden", activity.length > 0);
    $(".recent-panel .table-wrap").classList.toggle("hidden", activity.length === 0);
  }

  function renderMembers() {
    const search = $("#memberSearch").value.trim().toLowerCase();
    const statusFilter = $("#memberStatusFilter").value;
    const course = $("#courseFilter").value;
    const members = [...state.members].filter((member) => {
      const status = memberStatus(member);
      const matchesSearch = `${member.memberId} ${member.name} ${member.course} ${member.year} ${member.email} ${member.phone}`.toLowerCase().includes(search);
      return matchesSearch && (statusFilter === "all" || status === statusFilter) && (course === "all" || member.course === course);
    }).sort((a, b) => a.name.localeCompare(b.name));
    $("#membersTable").innerHTML = members.map((member) => {
      const paid = memberPaid(member.id);
      const balance = Math.max(0, Number(member.fee) - paid);
      const status = memberStatus(member);
      return `<tr>
        <td><div class="member-primary"><strong>${escapeHtml(member.name)}</strong><span class="member-id">${escapeHtml(member.memberId)}</span></div></td>
        <td>${escapeHtml(member.course)}<br><span class="member-id">${escapeHtml(member.year)}</span></td>
        <td>${escapeHtml(member.email || "—")}<br><span class="member-id">${escapeHtml(member.phone || "—")}</span></td>
        <td>${money(member.fee)}</td><td class="positive-amount">${money(paid)}</td><td>${money(balance)}</td>
        <td><span class="status-pill ${status.toLowerCase()}">${status}</span></td>
        <td><div class="row-actions"><button class="row-action" data-member-history="${escapeHtml(member.id)}" title="Payment history" aria-label="Payment history for ${escapeHtml(member.name)}">▤</button><button class="row-action" data-edit-member="${escapeHtml(member.id)}" title="Edit member" aria-label="Edit ${escapeHtml(member.name)}">✎</button><button class="row-action delete" data-delete-member="${escapeHtml(member.id)}" title="Delete member" aria-label="Delete ${escapeHtml(member.name)}">×</button></div></td>
      </tr>`;
    }).join("");
    $("#memberCount").textContent = `${members.length} ${members.length === 1 ? "member" : "members"}`;
    $("#membersEmpty").classList.toggle("hidden", members.length > 0);
    $(".records-panel .table-wrap", $("#page-members")).classList.toggle("hidden", members.length === 0);
    $(".records-panel .table-footer", $("#page-members")).classList.toggle("hidden", members.length === 0);
  }

  function populateCourseFilter() {
    const select = $("#courseFilter");
    const selected = select.value;
    const courses = [...new Set(state.members.map((member) => member.course).filter(Boolean))].sort();
    select.innerHTML = '<option value="all">All courses</option>' + courses.map((course) => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join("");
    if (courses.includes(selected)) select.value = selected;
  }

  function renderCollections() {
    const search = $("#collectionSearch").value.trim().toLowerCase();
    const statusFilter = $("#collectionStatusFilter").value;
    const month = $("#collectionDateFilter").value;
    const total = collectionTotal();
    $("#collectionPageTotal").textContent = money(total);
    $("#paidMemberCount").textContent = state.members.filter((member) => memberStatus(member) === "Paid").length;
    $("#unpaidMemberCount").textContent = state.members.filter((member) => memberStatus(member) !== "Paid").length;
    const rows = [...state.collections].filter((item) => {
      const member = state.members.find((entry) => entry.id === item.memberId);
      const status = member ? memberStatus(member) : "Unpaid";
      const matchesSearch = `${item.reference} ${item.memberName} ${item.method} ${item.notes || ""}`.toLowerCase().includes(search);
      return matchesSearch && (statusFilter === "all" || status === statusFilter) && (!month || item.date.slice(0, 7) === month);
    }).sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#collectionsTable").innerHTML = rows.map((item) => `<tr>
      <td><strong class="member-primary">${escapeHtml(item.reference)}</strong></td><td>${escapeHtml(item.memberName)}</td>
      <td>${dateFormatter.format(validDate(item.date))}</td><td>${escapeHtml(item.method)}</td><td class="amount positive-amount">${money(item.amount)}</td>
      <td><div class="row-actions"><button class="row-action" data-print-receipt="${escapeHtml(item.id)}" title="Print receipt" aria-label="Print receipt ${escapeHtml(item.reference)}">▧</button><button class="row-action delete" data-delete-collection="${escapeHtml(item.id)}" title="Delete payment" aria-label="Delete payment ${escapeHtml(item.reference)}">×</button></div></td>
    </tr>`).join("");
    $("#collectionCount").textContent = `${rows.length} ${rows.length === 1 ? "payment" : "payments"}`;
    $("#collectionsEmpty").classList.toggle("hidden", rows.length > 0);
    $(".records-panel .table-wrap", $("#page-collections")).classList.toggle("hidden", rows.length === 0);
    $(".records-panel .table-footer", $("#page-collections")).classList.toggle("hidden", rows.length === 0);
  }

  function renderAdvances() {
    const rows = [...state.advances].sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#advancesTable").innerHTML = rows.map((advance) => {
      const { actual, returned, difference, remaining } = liquidation(advance);
      const settled = Math.abs(difference) < 0.005 || (difference > 0 && remaining < 0.005);
      const status = settled ? "Liquidated" : difference > 0 ? "Return due" : "Reimbursement";
      const statusClass = status === "Liquidated" ? "paid" : status === "Return due" ? "partial" : "unpaid";
      return `<tr><td><div class="member-primary"><strong>${escapeHtml(advance.activity)}</strong><span>${escapeHtml(advance.reference)}</span></div></td>
        <td>${escapeHtml(advance.responsible)}</td><td>${dateFormatter.format(validDate(advance.date))}</td><td class="amount">${money(advance.amount)}</td>
        <td class="amount">${money(actual)}</td><td class="amount">${returned > 0 ? `<button class="text-button" data-cash-return-history="${escapeHtml(advance.id)}" title="View return history">${money(returned)}</button>` : money(0)}</td><td class="amount ${remaining < 0 ? "negative-amount" : remaining > 0 ? "positive-amount" : ""}">${remaining < 0 ? `(${money(Math.abs(remaining))})` : money(remaining)}</td>
        <td><span class="status-pill ${statusClass}">${status}</span></td><td><div class="row-actions">${difference > 0 && remaining > 0 ? `<button class="row-action" data-record-return="${escapeHtml(advance.id)}" title="Record returned cash" aria-label="Record returned cash for ${escapeHtml(advance.reference)}">↩</button>` : ""}<button class="row-action delete" data-delete-advance="${escapeHtml(advance.id)}" title="Delete advance" aria-label="Delete advance ${escapeHtml(advance.reference)}">×</button></div></td></tr>`;
    }).join("");
    $("#advancesEmpty").classList.toggle("hidden", rows.length > 0);
    $("#page-liquidation .liquidation-panel .table-wrap").classList.toggle("hidden", rows.length === 0);
  }

  function renderLiquidation() {
    const totalAdvances = state.advances.reduce((sum, item) => sum + Number(item.amount), 0);
    const openAdvances = state.advances.reduce((sum, advance) => sum + Math.abs(liquidation(advance).remaining), 0);
    $("#advancePageTotal").textContent = money(totalAdvances);
    $("#liquidationExpenseTotal").textContent = money(expenseTotal(state.expenses.filter((item) => item.advanceId)));
    $("#unliquidatedTotal").textContent = money(openAdvances);
    renderAdvances();
  }

  function renderExpenses() {
    const search = $("#expenseSearch").value.trim().toLowerCase();
    const category = $("#expenseCategoryFilter").value;
    const month = $("#expenseMonthFilter").value;
    $("#expensePageTotal").textContent = money(expenseTotal());
    $("#expenseRecordCount").textContent = state.expenses.length;
    const categories = [...new Set(state.expenses.map((item) => item.category))].sort();
    const categorySelect = $("#expenseCategoryFilter");
    const oldCategory = categorySelect.value;
    categorySelect.innerHTML = '<option value="all">All categories</option>' + categories.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
    if (categories.includes(oldCategory)) categorySelect.value = oldCategory;
    const rows = [...state.expenses].filter((item) =>
      `${item.description} ${item.category} ${item.responsible} ${item.reference}`.toLowerCase().includes(search) &&
      (category === "all" || item.category === category) && (!month || item.date.slice(0, 7) === month)
    ).sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#expensesTable").innerHTML = rows.map((item) => {
      const advance = state.advances.find((entry) => entry.id === item.advanceId);
      return `<tr><td><div class="member-primary"><strong>${escapeHtml(item.description)}</strong><span>${escapeHtml(item.notes || "")}</span></div></td>
        <td><span class="type-pill expense">${escapeHtml(item.category)}</span></td><td>${dateFormatter.format(validDate(item.date))}</td><td>${escapeHtml(item.responsible)}</td>
        <td>${escapeHtml(item.reference || "—")}</td><td>${advance ? escapeHtml(advance.reference) : "—"}</td><td class="amount">${money(item.amount)}</td>
        <td><div class="row-actions"><button class="row-action" data-edit-expense="${escapeHtml(item.id)}" title="Edit expense" aria-label="Edit ${escapeHtml(item.description)}">✎</button><button class="row-action delete" data-delete-expense="${escapeHtml(item.id)}" title="Delete expense" aria-label="Delete ${escapeHtml(item.description)}">×</button></div></td></tr>`;
    }).join("");
    $("#expenseCount").textContent = `${rows.length} ${rows.length === 1 ? "expense" : "expenses"}`;
    $("#expensesEmpty").classList.toggle("hidden", rows.length > 0);
    $("#page-expenses .expense-history-panel .table-wrap").classList.toggle("hidden", rows.length === 0);
    $("#page-expenses .expense-history-panel .table-footer").classList.toggle("hidden", rows.length === 0);
    renderAdvances();
  }

  function renderBreakdown(container, items) {
    const totals = new Map();
    items.forEach((item) => totals.set(item.category, (totals.get(item.category) || 0) + Number(item.amount)));
    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    if (!sorted.length) {
      container.innerHTML = '<div class="breakdown-empty">No expenses recorded for this period.</div>';
      return;
    }
    const max = sorted[0][1] || 1;
    container.innerHTML = sorted.slice(0, 6).map(([name, amount]) => `
      <div class="breakdown-item"><span class="breakdown-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
      <div class="breakdown-track"><div class="breakdown-fill" style="width:${Math.max(4, amount / max * 100)}%"></div></div>
      <span class="breakdown-amount">${money(amount)}</span></div>`).join("");
  }

  function getActivityRows() {
    const activities = [];
    const addLegacy = (entityType, entityId, activity, reference, description, amount, date) => {
      if (state.auditTrail.some((entry) => entry.entityType === entityType && entry.entityId === entityId)) return;
      activities.push({ reference, activity, description, amount, date: date || "", recordedAt: date || "" });
    };

    state.members.forEach((item) => addLegacy("member", item.id, "Membership registration", item.memberId, `Registered member · ${item.name}`, item.fee, item.createdAt));
    state.collections.forEach((item) => addLegacy("collection", item.id, "Membership fee payment", item.reference, `${item.memberName} · ${item.method}`, item.amount, item.date));
    state.expenses.forEach((item) => addLegacy("expense", item.id, "Expense transaction", item.reference || `EXP-${item.id}`, item.description, item.amount, item.date));
    state.advances.forEach((item) => addLegacy("advance", item.id, "Cash advance", item.reference, `${item.activity} · ${item.responsible}`, item.amount, item.date));
    state.cashReturns.forEach((item) => {
      const advance = state.advances.find((entry) => entry.id === item.advanceId);
      addLegacy("cashReturn", item.id, "Cash return", item.reference, `Cash returned${advance ? ` · ${advance.reference}` : ""}`, item.amount, item.date);
    });
    state.transactions.forEach((item) => addLegacy(
      "transaction", item.id, item.type === "income" ? "Income transaction" : "Expense transaction",
      `TX-${item.id}`, `${item.description} · ${item.category} · ${item.account}`, item.amount, item.date
    ));

    state.auditTrail.forEach((entry) => activities.push({
      reference: entry.reference,
      activity: entry.activity,
      description: entry.activity === "Record updated" || entry.activity === "Record deleted"
        ? `${entry.description} · ${entry.sourceReference}`
        : entry.description,
      amount: entry.amount,
      date: entry.date || "",
      recordedAt: entry.recordedAt || entry.date || ""
    }));
    return activities.sort((a, b) => String(b.recordedAt).localeCompare(String(a.recordedAt)));
  }

  function renderTransactions() {
    const search = $("#transactionSearch").value.trim().toLowerCase();
    const type = $("#typeFilter").value;
    const month = $("#monthFilter").value;
    const rows = getActivityRows().filter((item) => {
      const matchesSearch = `${item.reference} ${item.activity} ${item.description}`.toLowerCase().includes(search);
      const matchesType = type === "all" || item.activity === type;
      const matchesMonth = month === "all" || item.date.slice(0, 7) === month;
      return matchesSearch && matchesType && matchesMonth;
    });
    $("#transactionsTable").innerHTML = rows.map((item) => `<tr>
      <td><strong>${escapeHtml(item.reference || "—")}</strong></td>
      <td><span class="type-pill ${item.activity === "Record deleted" ? "expense" : item.activity === "Record updated" ? "income" : ""}">${escapeHtml(item.activity)}</span></td>
      <td>${escapeHtml(item.description)}</td>
      <td>${item.date ? dateFormatter.format(validDate(item.date)) : "—"}</td>
      <td class="amount">${money(item.amount)}</td>
    </tr>`).join("");
    $("#transactionCount").textContent = `${rows.length} ${rows.length === 1 ? "activity" : "activities"}`;
    $("#transactionsEmpty").classList.toggle("hidden", rows.length > 0);
    $(".transactions-panel .table-wrap").classList.toggle("hidden", rows.length === 0);
    $(".transactions-panel .table-footer").classList.toggle("hidden", rows.length === 0);
  }

  function populateMonthFilter() {
    const select = $("#monthFilter");
    const selected = select.value;
    const months = [...new Set(getActivityRows().map((item) => item.date.slice(0, 7)).filter(Boolean))].sort().reverse();
    select.innerHTML = '<option value="all">All dates</option>' + months.map((month) => {
      const [year, monthNumber] = month.split("-").map(Number);
      const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1, 1));
      return `<option value="${month}">${label}</option>`;
    }).join("");
    if ([...select.options].some((option) => option.value === selected)) select.value = selected;
  }

  function renderAccounts() {
    const counts = Object.fromEntries(accountTypes.map((type) => [type, state.accounts.filter((account) => account.type === type).length]));
    $("#accountSummary").innerHTML = accountTypes.map((type) => `<div class="account-type-card"><span>${type} accounts</span><strong>${counts[type]}</strong></div>`).join("");
    const rows = [...state.accounts].sort((a, b) => Number(a.code) - Number(b.code));
    $("#accountsTable").innerHTML = rows.map((account) => {
      const usage = state.transactions.filter((item) => item.category === account.name).length;
      return `<tr><td><span class="account-code">${escapeHtml(account.code)}</span><strong>${escapeHtml(account.name)}</strong></td>
        <td><span class="account-type">${escapeHtml(account.type)}</span></td><td>${escapeHtml(account.description || "—")}</td><td>${usage} ${usage === 1 ? "entry" : "entries"}</td>
        <td><div class="row-actions"><button class="row-action" data-edit-account="${escapeHtml(account.id)}" title="Edit account" aria-label="Edit ${escapeHtml(account.name)}">✎</button><button class="row-action delete" data-delete-account="${escapeHtml(account.id)}" title="Delete account" aria-label="Delete ${escapeHtml(account.name)}">×</button></div></td></tr>`;
    }).join("");
    $("#accountsEmpty").classList.toggle("hidden", rows.length > 0);
    $(".accounts-panel .table-wrap").classList.toggle("hidden", rows.length === 0);
  }

  function renderReports() {
    const start = $("#reportStart").value;
    const end = $("#reportEnd").value;
    const invalidRange = Boolean(start && end && start > end);
    const collections = invalidRange ? [] : filteredByDate(state.collections, start, end);
    const expenses = invalidRange ? [] : filteredByDate(state.expenses, start, end);
    const transactions = invalidRange ? [] : filteredByDate(state.transactions, start, end);
    const incomeTransactions = transactions.filter((item) => item.type === "income");
    const expenseTransactions = transactions.filter((item) => item.type === "expense");
    const collected = financialIncomeTotal(collections, transactions);
    const expenseSum = financialExpenseTotal(expenses, transactions);
    const assessed = state.members.reduce((sum, member) => sum + Number(member.fee), 0);
    const outstanding = Math.max(0, assessed - collectionTotal());
    const cashBalance = collected - expenseSum;
    $("#reportAssessed").textContent = money(assessed);
    $("#reportIncome").textContent = money(collected);
    $("#reportOutstanding").textContent = money(outstanding);
    $("#reportExpenses").textContent = money(expenseSum);
    $("#reportNet").textContent = money(cashBalance);
    $("#reportDateRange").textContent = invalidRange ? "Start date must be on or before end date." :
      `${start ? dateFormatter.format(validDate(start)) : "All dates"} – ${end ? dateFormatter.format(validDate(end)) : "Present"}`;
    renderFinancialChart($("#reportChart"), [...collections, ...incomeTransactions], [...expenses, ...expenseTransactions], start, end, 12);
    renderBreakdown($("#reportBreakdown"), [...expenses, ...expenseTransactions]);

    const type = $("#reportType").value;
    const head = $("#reportTable thead");
    const body = $("#reportTable tbody");
    if (type === "collections") {
      $("#reportTableTitle").textContent = "Collection report";
      $("#reportTableSubtitle").textContent = "Member dues payments recorded within the selected dates.";
      head.innerHTML = "<tr><th>RECEIPT / REF.</th><th>MEMBER</th><th>DATE</th><th>METHOD</th><th class=\"amount-col\">AMOUNT</th></tr>";
      body.innerHTML = collections.map((item) => `<tr><td>${escapeHtml(item.reference)}</td><td>${escapeHtml(item.memberName)}</td><td>${dateFormatter.format(validDate(item.date))}</td><td>${escapeHtml(item.method)}</td><td class=\"amount\">${money(item.amount)}</td></tr>`).join("");
    } else if (type === "expenses") {
      $("#reportTableTitle").textContent = "Expense report";
      $("#reportTableSubtitle").textContent = "Expense records and manual expense transactions in the selected dates.";
      head.innerHTML = "<tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>RESPONSIBLE / ACCOUNT</th><th>REFERENCE</th><th class=\"amount-col\">AMOUNT</th></tr>";
      body.innerHTML = [...expenses.map((item) => ({ ...item, party: item.responsible, reportReference: item.reference || `EXP-${item.id}` })),
        ...expenseTransactions.map((item) => ({ ...item, party: item.account, reportReference: `TX-${item.id}` }))]
        .map((item) => `<tr><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.category)}</td><td>${dateFormatter.format(validDate(item.date))}</td><td>${escapeHtml(item.party || "—")}</td><td>${escapeHtml(item.reportReference)}</td><td class="amount">${money(item.amount)}</td></tr>`).join("");
    } else {
      const monthMap = new Map();
      [...collections, ...incomeTransactions].forEach((item) => {
        const key = item.date.slice(0, 7);
        const row = monthMap.get(key) || { collections: 0, expenses: 0 };
        row.collections += Number(item.amount);
        monthMap.set(key, row);
      });
      [...expenses, ...expenseTransactions].forEach((item) => {
        const key = item.date.slice(0, 7);
        const row = monthMap.get(key) || { collections: 0, expenses: 0 };
        row.expenses += Number(item.amount);
        monthMap.set(key, row);
      });
      $("#reportTableTitle").textContent = type === "monthly" ? "Monthly financial summary" : "Financial summary by month";
      $("#reportTableSubtitle").textContent = "Income, expenses, and monthly net activity.";
      head.innerHTML = "<tr><th>MONTH</th><th class=\"amount-col\">INCOME</th><th class=\"amount-col\">EXPENSES</th><th class=\"amount-col\">NET ACTIVITY</th></tr>";
      body.innerHTML = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, row]) => {
        const [year, month] = key.split("-").map(Number);
        const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
        return `<tr class="report-month-row"><td>${label}</td><td class="amount">${money(row.collections)}</td><td class="amount">${money(row.expenses)}</td><td class="amount">${money(row.collections - row.expenses)}</td></tr>`;
      }).join("");
    }
    const hasRows = body.children.length > 0 && !invalidRange;
    $("#reportEmpty").classList.toggle("hidden", hasRows);
    $("#reportTable").classList.toggle("hidden", !hasRows);
  }

  function renderUsers() {
    const users = [...state.users].sort((a, b) => Number(b.current) - Number(a.current) || a.name.localeCompare(b.name));
    $("#usersTable").innerHTML = users.map((user) => `<tr>
      <td><div class="member-primary"><strong>${escapeHtml(user.name)}${user.current ? " · You" : ""}</strong><span>${user.current ? "Current demo profile" : "Demo workspace user"}</span></div></td>
      <td>${escapeHtml(user.email)}</td><td><span class="account-type">${escapeHtml(user.role)}</span></td>
      <td><span class="status-pill ${user.status === "Active" ? "paid" : "partial"}">${escapeHtml(user.status)}</span></td>
      <td><div class="row-actions"><button class="row-action" data-edit-user="${escapeHtml(user.id)}" title="Edit demo user" aria-label="Edit ${escapeHtml(user.name)}">✎</button>${user.current ? "" : `<button class="row-action delete" data-delete-user="${escapeHtml(user.id)}" title="Delete demo user" aria-label="Delete ${escapeHtml(user.name)}">×</button>`}</div></td>
    </tr>`).join("");
    $("#usersEmpty").classList.toggle("hidden", users.length > 0);
    $("#page-users .records-panel .table-wrap").classList.toggle("hidden", users.length === 0);
    const currentUser = users.find((user) => user.current) || users[0];
    if (currentUser) {
      $(".topbar-profile-copy strong").textContent = currentUser.name;
      $(".topbar-profile-copy small").textContent = currentUser.role;
      $(".topbar-profile .avatar").textContent = currentUser.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    }
  }

  function renderSettings() {
    $("#organizationNameInput").value = state.settings.organizationName;
    $("#defaultFeeInput").value = state.settings.defaultFee;
    $("#receiptPrefixInput").value = state.settings.receiptPrefix;
    $(".topbar-brand > span").textContent = state.settings.organizationName;
    $(".topbar-brand > span").title = state.settings.organizationName;
  }

  function refreshViews() {
    populateMonthFilter();
    populateCourseFilter();
    renderDashboard();
    renderMembers();
    renderCollections();
    renderExpenses();
    renderLiquidation();
    renderTransactions();
    renderAccounts();
    renderReports();
    renderUsers();
    renderSettings();
  }

  function setTransactionTypeOptions(type, selectedCategory = "") {
    const desiredType = type === "income" ? "Income" : "Expense";
    const categories = state.accounts.filter((account) => account.type === desiredType);
    const categorySelect = $("#categoryInput");
    categorySelect.innerHTML = categories.map((account) => `<option value="${escapeHtml(account.name)}">${escapeHtml(account.name)}</option>`).join("");
    if (categories.some((account) => account.name === selectedCategory)) categorySelect.value = selectedCategory;
    const assetAccounts = state.accounts.filter((account) => account.type === "Asset");
    const accountSelect = $("#accountInput");
    const currentAccount = accountSelect.value;
    accountSelect.innerHTML = assetAccounts.map((account) => `<option value="${escapeHtml(account.name)}">${escapeHtml(account.name)}</option>`).join("");
    if (assetAccounts.some((account) => account.name === currentAccount)) accountSelect.value = currentAccount;
    if (assetAccounts.some((account) => account.name === $("#transactionForm").dataset.account)) accountSelect.value = $("#transactionForm").dataset.account;
  }

  function openTransactionModal(transaction = null) {
    const form = $("#transactionForm");
    form.reset();
    delete form.dataset.account;
    $("#transactionId").value = transaction?.id || "";
    $("#transactionModalTitle").textContent = transaction ? "Edit transaction" : "Add transaction";
    $("#saveTransactionButton").textContent = transaction ? "Save changes" : "Save transaction";
    $$('input[name="type"]').forEach((radio) => { radio.checked = radio.value === (transaction?.type || "income"); });
    form.dataset.account = transaction?.account || "";
    setTransactionTypeOptions(transaction?.type || "income", transaction?.category || "");
    $("#descriptionInput").value = transaction?.description || "";
    $("#amountInput").value = transaction?.amount ?? "";
    $("#dateInput").value = transaction?.date || localDateString();
    $("#notesInput").value = transaction?.notes || "";
    $("#transactionError").classList.add("hidden");
    $("#transactionModal").classList.remove("hidden");
    $("#descriptionInput").focus();
  }

  function openAccountModal(account = null) {
    $("#accountForm").reset();
    $("#accountId").value = account?.id || "";
    $("#accountModalTitle").textContent = account ? "Edit account" : "Add account";
    $("#saveAccountButton").textContent = account ? "Save changes" : "Save account";
    $("#accountNameInput").value = account?.name || "";
    $("#accountTypeInput").value = account?.type || "Income";
    $("#accountDescriptionInput").value = account?.description || "";
    $("#accountError").classList.add("hidden");
    $("#accountModal").classList.remove("hidden");
    $("#accountNameInput").focus();
  }

  function openMemberModal(member = null) {
    $("#memberForm").reset();
    $("#memberId").value = member?.id || "";
    $("#memberModalTitle").textContent = member ? "Edit member" : "Add member";
    $("#saveMemberButton").textContent = member ? "Save changes" : "Save member";
    $("#memberNameInput").value = member?.name || "";
    $("#memberCourseInput").value = member?.course || "";
    $("#memberYearInput").value = member?.year || "1st Year";
    $("#memberEmailInput").value = member?.email || "";
    $("#memberPhoneInput").value = member?.phone || "";
    $("#memberFeeInput").value = member?.fee ?? state.settings.defaultFee;
    $("#memberError").classList.add("hidden");
    $("#memberModal").classList.remove("hidden");
    $("#memberNameInput").focus();
  }

  function openExpenseModal(expense = null) {
    const form = $("#expenseForm");
    form.reset();
    $("#expenseId").value = expense?.id || "";
    $("#expenseModalTitle").textContent = expense ? "Edit expense" : "Record expense";
    $("#saveExpenseButton").textContent = expense ? "Save changes" : "Save expense";
    $("#expenseDescriptionInput").value = expense?.description || "";
    $("#expenseCategoryInput").value = expense?.category || "Activities & events";
    $("#expenseAmountInput").value = expense?.amount ?? "";
    $("#expenseDateInput").value = expense?.date || localDateString();
    $("#expenseResponsibleInput").value = expense?.responsible || "";
    $("#expenseReferenceInput").value = expense?.reference || "";
    $("#expenseNotesInput").value = expense?.notes || "";
    const advanceSelect = $("#expenseAdvanceInput");
    advanceSelect.innerHTML = '<option value="">Not linked to an advance</option>' + state.advances.map((advance) =>
      `<option value="${escapeHtml(advance.id)}">${escapeHtml(advance.reference)} · ${escapeHtml(advance.activity)}</option>`
    ).join("");
    advanceSelect.value = expense?.advanceId || "";
    $("#expenseError").classList.add("hidden");
    $("#expenseModal").classList.remove("hidden");
    $("#expenseDescriptionInput").focus();
  }

  function openAdvanceModal() {
    $("#advanceForm").reset();
    $("#advanceDateInput").value = localDateString();
    $("#advanceError").classList.add("hidden");
    $("#advanceModal").classList.remove("hidden");
    $("#advanceActivityInput").focus();
  }

  function openCashReturnModal(advanceId) {
    const advance = state.advances.find((item) => item.id === advanceId);
    if (!advance) return;
    const { remaining } = liquidation(advance);
    if (remaining <= 0) {
      showToast("There is no cash return due for this advance.", "error");
      return;
    }
    $("#cashReturnForm").reset();
    $("#cashReturnAdvanceId").value = advance.id;
    $("#cashReturnAmountInput").max = remaining.toFixed(2);
    $("#cashReturnAmountInput").value = remaining.toFixed(2);
    $("#cashReturnDateInput").value = localDateString();
    $("#cashReturnSubtitle").textContent = `${advance.reference} · ${advance.activity} · ${money(remaining)} return due`;
    $("#cashReturnError").classList.add("hidden");
    $("#cashReturnModal").classList.remove("hidden");
    $("#cashReturnAmountInput").focus();
  }

  function openCashReturnHistory(advanceId) {
    const advance = state.advances.find((item) => item.id === advanceId);
    if (!advance) return;
    const returns = state.cashReturns.filter((item) => item.advanceId === advance.id).sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#cashReturnHistoryTitle").textContent = "Cash returns";
    $("#cashReturnHistorySubtitle").textContent = `${advance.reference} · ${advance.activity}`;
    $("#cashReturnHistoryTable").innerHTML = returns.map((item) => `<tr><td>${escapeHtml(item.reference)}</td><td>${dateFormatter.format(validDate(item.date))}</td><td class="amount">${money(item.amount)}</td></tr>`).join("");
    $("#cashReturnHistoryEmpty").classList.toggle("hidden", returns.length > 0);
    $("#cashReturnHistoryModal").classList.remove("hidden");
  }

  function openMemberHistory(memberId) {
    const member = state.members.find((item) => item.id === memberId);
    if (!member) return;
    const payments = memberPayments(member.id).sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#historyModalTitle").textContent = member.name;
    $("#historyModalSubtitle").textContent = `${member.memberId} · ${member.course} · ${member.year} · ${memberStatus(member)} · Balance ${money(Math.max(0, member.fee - memberPaid(member.id)))}`;
    $("#memberHistoryTable").innerHTML = payments.map((item) => `<tr><td>${escapeHtml(item.reference)}</td><td>${dateFormatter.format(validDate(item.date))}</td><td>${escapeHtml(item.method)}</td><td class="amount">${money(item.amount)}</td><td><button class="row-action" data-print-receipt="${escapeHtml(item.id)}" title="Print receipt" aria-label="Print receipt">▧</button></td></tr>`).join("");
    $("#historyEmpty").classList.toggle("hidden", payments.length > 0);
    $("#historyAddPayment").dataset.memberId = member.id;
    $("#historyModal").classList.remove("hidden");
  }

  function openUserModal(user = null) {
    $("#userForm").reset();
    $("#userId").value = user?.id || "";
    $("#userModalTitle").textContent = user ? "Edit demo user" : "Add demo user";
    $("#userNameInput").value = user?.name || "";
    $("#userEmailInput").value = user?.email || "";
    $("#userRoleInput").value = user?.role || "Finance officer";
    $("#userError").classList.add("hidden");
    $("#userModal").classList.remove("hidden");
    $("#userNameInput").focus();
  }

  function demoLogout() {
    $("#logoutConfirmation").classList.remove("hidden");
    $("#logoutConfirmation").focus();
  }

  function nextReference(prefix, records, counterKey, field = "reference") {
    const year = today.getFullYear();
    const usedNumbers = records.map((record) => {
      const match = String(record[field] || "").match(/-(\d+)$/);
      return match ? Number(match[1]) : 0;
    });
    const next = Math.max(Number(state[counterKey]) || 1, ...usedNumbers.map((number) => number + 1));
    state[counterKey] = next + 1;
    return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
  }

  function printReceipt(payment) {
    const member = state.members.find((item) => item.id === payment.memberId);
    const popup = window.open("", "_blank", "width=720,height=700");
    if (!popup) {
      showToast("Allow pop-ups to print the receipt.", "error");
      return;
    }
    const assessed = member ? Number(member.fee) : 0;
    const history = member ? memberPayments(member.id).sort((a, b) => a.date.localeCompare(b.date) || a.reference.localeCompare(b.reference)) : [];
    const paymentIndex = history.findIndex((item) => item.id === payment.id);
    const paidBefore = paymentIndex >= 0 ? history.slice(0, paymentIndex).reduce((sum, item) => sum + Number(item.amount), 0) : 0;
    const balance = member ? Math.max(0, assessed - paidBefore - Number(payment.amount)) : 0;
    popup.document.write(`<!doctype html><html><head><title>Receipt ${escapeHtml(payment.reference)}</title><style>body{font:15px Arial,sans-serif;color:#20283a;margin:40px auto;max-width:620px}.receipt{border:1px solid #dfe3ea;padding:32px}.top{display:flex;justify-content:space-between;border-bottom:1px solid #e8ebf1;padding-bottom:18px}.muted{color:#788398;font-size:13px}.line{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #edf0f4}.total{font-weight:bold;font-size:20px}.footer{margin-top:30px;text-align:center;color:#788398;font-size:12px}</style></head><body><main class="receipt"><div class="top"><div><h1>Official Receipt</h1><div class="muted">${escapeHtml(state.settings.organizationName)} · Membership Fee</div></div><div><strong>${escapeHtml(payment.reference)}</strong><br><span class="muted">${dateFormatter.format(validDate(payment.date))}</span></div></div><div class="line"><span>Received from</span><strong>${escapeHtml(payment.memberName)}</strong></div><div class="line"><span>Member ID</span><strong>${escapeHtml(member?.memberId || "Member record removed")}</strong></div><div class="line"><span>Payment method</span><strong>${escapeHtml(payment.method)}</strong></div><div class="line total"><span>Amount received</span><strong>${money(payment.amount)}</strong></div><div class="line"><span>Membership fee balance</span><strong>${money(balance)}</strong></div><div class="footer">This receipt was generated by the Ledgerly demo system.</div></main><script>window.onload=()=>window.print();</script></body></html>`);
    popup.document.close();
  }

  function openCollectionModal(memberId = "") {
    const form = $("#collectionForm");
    form.reset();
    const select = $("#collectionMemberInput");
    select.innerHTML = [...state.members].sort((a, b) => a.name.localeCompare(b.name)).map((member) =>
      `<option value="${escapeHtml(member.id)}">${escapeHtml(member.memberId)} · ${escapeHtml(member.name)}</option>`
    ).join("");
    if (memberId && state.members.some((member) => member.id === memberId)) select.value = memberId;
    $("#collectionDateInput").value = localDateString();
    $("#collectionError").classList.add("hidden");
    $("#collectionModal").classList.remove("hidden");
    updateMemberFeePreview(true);
    select.focus();
  }

  function updateMemberFeePreview(suggestAmount = false) {
    const member = state.members.find((item) => item.id === $("#collectionMemberInput").value);
    const preview = $("#memberFeePreview");
    const amount = $("#collectionAmountInput");
    if (!member) {
      preview.textContent = "Add a member before recording a payment.";
      return;
    }
    const paid = memberPaid(member.id);
    const balance = Math.max(0, Number(member.fee) - paid);
    preview.textContent = `Assessed: ${money(member.fee)} · Paid: ${money(paid)} · Balance: ${money(balance)} · Status: ${memberStatus(member)}`;
    if (suggestAmount && balance > 0) amount.value = balance.toFixed(2);
  }

  function openExpenseModal(expense = null) {
    const form = $("#expenseForm");
    form.reset();
    $("#expenseId").value = expense?.id || "";
    $("#expenseModalTitle").textContent = expense ? "Edit expense" : "Record expense";
    $("#saveExpenseButton").textContent = expense ? "Save changes" : "Save expense";
    $("#expenseDescriptionInput").value = expense?.description || "";
    $("#expenseCategoryInput").value = expense?.category || "Activities & events";
    $("#expenseAmountInput").value = expense?.amount ?? "";
    $("#expenseDateInput").value = expense?.date || localDateString();
    $("#expenseResponsibleInput").value = expense?.responsible || "";
    $("#expenseReferenceInput").value = expense?.reference || "";
    $("#expenseNotesInput").value = expense?.notes || "";
    const advanceSelect = $("#expenseAdvanceInput");
    advanceSelect.innerHTML = '<option value="">Not linked to an advance</option>' + state.advances.map((advance) =>
      `<option value="${escapeHtml(advance.id)}">${escapeHtml(advance.reference)} · ${escapeHtml(advance.activity)}</option>`
    ).join("");
    advanceSelect.value = expense?.advanceId || "";
    $("#expenseError").classList.add("hidden");
    $("#expenseModal").classList.remove("hidden");
    $("#expenseDescriptionInput").focus();
  }

  function openAdvanceModal() {
    $("#advanceForm").reset();
    $("#advanceDateInput").value = localDateString();
    $("#advanceError").classList.add("hidden");
    $("#advanceModal").classList.remove("hidden");
    $("#advanceActivityInput").focus();
  }

  function openCashReturnModal(advanceId) {
    const advance = state.advances.find((item) => item.id === advanceId);
    if (!advance) return;
    const { remaining } = liquidation(advance);
    if (remaining <= 0) {
      showToast("There is no cash return due for this advance.", "error");
      return;
    }
    $("#cashReturnForm").reset();
    $("#cashReturnAdvanceId").value = advance.id;
    $("#cashReturnAmountInput").max = remaining.toFixed(2);
    $("#cashReturnAmountInput").value = remaining.toFixed(2);
    $("#cashReturnDateInput").value = localDateString();
    $("#cashReturnSubtitle").textContent = `${advance.reference} · ${advance.activity} · ${money(remaining)} return due`;
    $("#cashReturnError").classList.add("hidden");
    $("#cashReturnModal").classList.remove("hidden");
    $("#cashReturnAmountInput").focus();
  }

  function openCashReturnHistory(advanceId) {
    const advance = state.advances.find((item) => item.id === advanceId);
    if (!advance) return;
    const returns = state.cashReturns.filter((item) => item.advanceId === advance.id).sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#cashReturnHistoryTitle").textContent = "Cash returns";
    $("#cashReturnHistorySubtitle").textContent = `${advance.reference} · ${advance.activity}`;
    $("#cashReturnHistoryTable").innerHTML = returns.map((item) => `<tr><td>${escapeHtml(item.reference)}</td><td>${dateFormatter.format(validDate(item.date))}</td><td class="amount">${money(item.amount)}</td></tr>`).join("");
    $("#cashReturnHistoryEmpty").classList.toggle("hidden", returns.length > 0);
    $("#cashReturnHistoryModal").classList.remove("hidden");
  }

  function openMemberHistory(memberId) {
    const member = state.members.find((item) => item.id === memberId);
    if (!member) return;
    const payments = memberPayments(member.id).sort((a, b) => validDate(b.date) - validDate(a.date));
    $("#historyModalTitle").textContent = member.name;
    $("#historyModalSubtitle").textContent = `${member.memberId} · ${member.course} · ${member.year} · ${memberStatus(member)} · Balance ${money(Math.max(0, member.fee - memberPaid(member.id)))}`;
    $("#memberHistoryTable").innerHTML = payments.map((item) => `<tr><td>${escapeHtml(item.reference)}</td><td>${dateFormatter.format(validDate(item.date))}</td><td>${escapeHtml(item.method)}</td><td class="amount">${money(item.amount)}</td><td><button class="row-action" data-print-receipt="${escapeHtml(item.id)}" title="Print receipt" aria-label="Print receipt">▧</button></td></tr>`).join("");
    $("#historyEmpty").classList.toggle("hidden", payments.length > 0);
    $("#historyAddPayment").dataset.memberId = member.id;
    $("#historyModal").classList.remove("hidden");
  }

  function openUserModal(user = null) {
    $("#userForm").reset();
    $("#userId").value = user?.id || "";
    $("#userModalTitle").textContent = user ? "Edit demo user" : "Add demo user";
    $("#userNameInput").value = user?.name || "";
    $("#userEmailInput").value = user?.email || "";
    $("#userRoleInput").value = user?.role || "Finance officer";
    $("#userError").classList.add("hidden");
    $("#userModal").classList.remove("hidden");
    $("#userNameInput").focus();
  }

  function demoLogout() {
    $("#logoutConfirmation").classList.remove("hidden");
    $("#logoutConfirmation").focus();
  }

  function nextReference(prefix, records, counterKey, field = "reference") {
    const year = today.getFullYear();
    const usedNumbers = records.map((record) => {
      const match = String(record[field] || "").match(/-(\d+)$/);
      return match ? Number(match[1]) : 0;
    });
    const next = Math.max(Number(state[counterKey]) || 1, ...usedNumbers.map((number) => number + 1));
    state[counterKey] = next + 1;
    return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
  }

  function printReceipt(payment) {
    const member = state.members.find((item) => item.id === payment.memberId);
    const popup = window.open("", "_blank", "width=720,height=700");
    if (!popup) {
      showToast("Allow pop-ups to print the receipt.", "error");
      return;
    }
    const assessed = member ? Number(member.fee) : 0;
    const history = member ? memberPayments(member.id).sort((a, b) => a.date.localeCompare(b.date) || a.reference.localeCompare(b.reference)) : [];
    const paymentIndex = history.findIndex((item) => item.id === payment.id);
    const paidBefore = paymentIndex >= 0 ? history.slice(0, paymentIndex).reduce((sum, item) => sum + Number(item.amount), 0) : 0;
    const balance = member ? Math.max(0, assessed - paidBefore - Number(payment.amount)) : 0;
    popup.document.write(`<!doctype html><html><head><title>Receipt ${escapeHtml(payment.reference)}</title><style>body{font:15px Arial,sans-serif;color:#20283a;margin:40px auto;max-width:620px}.receipt{border:1px solid #dfe3ea;padding:32px}.top{display:flex;justify-content:space-between;border-bottom:1px solid #e8ebf1;padding-bottom:18px}.muted{color:#788398;font-size:13px}.line{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #edf0f4}.total{font-weight:bold;font-size:20px}.footer{margin-top:30px;text-align:center;color:#788398;font-size:12px}@media print{button{display:none}}</style></head><body><main class="receipt"><div class="top"><div><h1>Official Receipt</h1><div class="muted">School Organization · Membership Fee</div></div><div><strong>${escapeHtml(payment.reference)}</strong><br><span class="muted">${dateFormatter.format(validDate(payment.date))}</span></div></div><div class="line"><span>Received from</span><strong>${escapeHtml(payment.memberName)}</strong></div><div class="line"><span>Member ID</span><strong>${escapeHtml(member?.memberId || "Member record removed")}</strong></div><div class="line"><span>Payment method</span><strong>${escapeHtml(payment.method)}</strong></div><div class="line total"><span>Amount received</span><strong>${money(payment.amount)}</strong></div><div class="line"><span>Membership fee balance</span><strong>${money(balance)}</strong></div><div class="footer">This receipt was generated by the Ledgerly demo system.</div></main><script>window.onload=()=>window.print();</script></body></html>`);
    popup.document.close();
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
  }

  function saveMember(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = $("#memberId").value;
    const name = String(data.get("name") || "").trim();
    const course = String(data.get("course") || "").trim();
    const year = String(data.get("year") || "");
    const fee = Number(data.get("fee"));
    const error = $("#memberError");
    if (!name || !course || !year || !Number.isFinite(fee) || fee < 0) {
      error.textContent = "Enter a name, course, year level, and a valid non-negative membership fee.";
      error.classList.remove("hidden");
      return;
    }
    const member = {
      id: id || `mem-${Date.now()}`,
      memberId: id ? state.members.find((item) => item.id === id).memberId : `ORG-${String(today.getFullYear()).slice(-2)}-${String(state.nextMemberNumber).padStart(3, "0")}`,
      name, course, year, fee,
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      createdAt: id ? state.members.find((item) => item.id === id).createdAt : localDateString()
    };
    if (!id) state.nextMemberNumber += 1;
    state.members = id ? state.members.map((item) => item.id === id ? member : item) : [...state.members, member];
    recordActivity(id ? "Record updated" : "Membership registration", "member", member.id, member.memberId, id ? `Updated member record · ${member.name}` : `Registered member · ${member.name}`, member.fee, localDateString());
    saveState();
    closeModal($("#memberModal"));
    refreshViews();
    showToast(id ? "Member record updated." : `Member added with ID ${member.memberId}.`);
  }

  function saveCollection(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const member = state.members.find((item) => item.id === data.get("memberId"));
    const amount = Number(data.get("amount"));
    const date = String(data.get("date") || "");
    const error = $("#collectionError");
    if (!member || !Number.isFinite(amount) || amount <= 0 || !date || !data.get("method")) {
      error.textContent = "Select a member, enter a positive payment amount, date, and method.";
      error.classList.remove("hidden");
      return;
    }
    const balance = Math.max(0, Number(member.fee) - memberPaid(member.id));
    if (balance <= 0) {
      error.textContent = "This member has already paid the assessed membership fee.";
      error.classList.remove("hidden");
      return;
    }
    if (amount > balance + 0.005) {
      error.textContent = `Payment cannot exceed the remaining balance of ${money(balance)}.`;
      error.classList.remove("hidden");
      return;
    }
    const collection = {
      id: `col-${Date.now()}`,
      reference: nextReference(state.settings.receiptPrefix, state.collections, "nextCollectionNumber"),
      memberId: member.id,
      memberName: member.name,
      date,
      amount,
      method: String(data.get("method")),
      notes: String(data.get("notes") || "").trim()
    };
    state.collections.push(collection);
    recordActivity("Membership fee payment", "collection", collection.id, collection.reference, `${collection.memberName} · ${collection.method}`, collection.amount, collection.date);
    saveState();
    closeModal($("#collectionModal"));
    refreshViews();
    showToast(`Payment recorded. Receipt ${collection.reference} issued.`);
    printReceipt(collection);
  }

  function saveAdvance(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const activity = String(data.get("activity") || "").trim();
    const amount = Number(data.get("amount"));
    const responsible = String(data.get("responsible") || "").trim();
    const date = String(data.get("date") || "");
    const error = $("#advanceError");
    if (!activity || !Number.isFinite(amount) || amount <= 0 || !responsible || !date) {
      error.textContent = "Enter an activity, positive advance amount, date, and responsible person.";
      error.classList.remove("hidden");
      return;
    }
    const advance = {
      id: `adv-${Date.now()}`,
      reference: nextReference("CA", state.advances, "nextAdvanceNumber"),
      activity, amount, responsible, date
    };
    state.advances.push(advance);
    recordActivity("Cash advance", "advance", advance.id, advance.reference, `${advance.activity} · ${advance.responsible}`, advance.amount, advance.date);
    saveState();
    closeModal($("#advanceModal"));
    refreshViews();
    showToast(`Cash advance ${advance.reference} recorded.`);
  }

  function saveCashReturn(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const advance = state.advances.find((item) => item.id === $("#cashReturnAdvanceId").value);
    const amount = Number(data.get("amount"));
    const date = String(data.get("date") || "");
    const error = $("#cashReturnError");
    const remaining = advance ? liquidation(advance).remaining : 0;
    if (!advance || !Number.isFinite(amount) || amount <= 0 || !date || amount > remaining + 0.005) {
      error.textContent = advance ? `Enter a positive return no greater than the remaining ${money(remaining)} due.` : "The selected cash advance no longer exists.";
      error.classList.remove("hidden");
      return;
    }
    const reference = String(data.get("reference") || "").trim() ||
      nextReference("CR", state.cashReturns, "nextCashReturnNumber");
    const cashReturn = { id: `return-${Date.now()}`, advanceId: advance.id, reference, amount, date };
    state.cashReturns.push(cashReturn);
    recordActivity("Cash return", "cashReturn", cashReturn.id, cashReturn.reference, `Cash returned · ${advance.reference}`, cashReturn.amount, cashReturn.date);
    saveState();
    closeModal($("#cashReturnModal"));
    refreshViews();
    showToast(`Cash return ${reference} recorded. It is not counted twice in available cash.`);
  }

  function saveSettings(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const organizationName = String(data.get("organizationName") || "").trim();
    const defaultFee = Number(data.get("defaultFee"));
    const receiptPrefix = String(data.get("receiptPrefix") || "").trim().toUpperCase();
    const error = $("#settingsError");
    if (!organizationName || !Number.isFinite(defaultFee) || defaultFee < 0 || !/^[A-Z0-9]{1,8}$/.test(receiptPrefix)) {
      error.textContent = "Enter an organization name, a non-negative default fee, and a 1–8 character alphanumeric receipt prefix.";
      error.classList.remove("hidden");
      showToast("Settings were not saved. Check the highlighted form.", "error");
      return;
    }
    state.settings = { organizationName, defaultFee, receiptPrefix };
    saveState();
    error.classList.add("hidden");
    renderSettings();
    showToast("Organization settings saved.");
  }

  function saveUser(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = $("#userId").value;
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const role = String(data.get("role") || "").trim();
    const error = $("#userError");
    const duplicate = state.users.some((user) => user.email.toLowerCase() === email && user.id !== id);
    if (!name || !email || !role || duplicate) {
      error.textContent = duplicate ? "A demo user with this email already exists." : "Enter a name, valid email address, and role.";
      error.classList.remove("hidden");
      return;
    }
    if (id) {
      state.users = state.users.map((user) => user.id === id ? { ...user, name, email, role } : user);
    } else {
      state.users.push({ id: `user-${Date.now()}`, name, email, role, status: "Active", current: false });
    }
    saveState();
    closeModal($("#userModal"));
    renderUsers();
    showToast(id ? "Demo user updated." : "Demo user added.");
  }

  function deleteUser(id) {
    const user = state.users.find((item) => item.id === id);
    if (!user || user.current) return;
    if (!window.confirm(`Remove ${user.name} from this demo workspace? This does not affect login access.`)) return;
    state.users = state.users.filter((item) => item.id !== id);
    saveState();
    renderUsers();
    showToast("Demo user removed.");
  }

  function saveExpense(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = $("#expenseId").value;
    const description = String(data.get("description") || "").trim();
    const category = String(data.get("category") || "");
    const amount = Number(data.get("amount"));
    const date = String(data.get("date") || "");
    const responsible = String(data.get("responsible") || "").trim();
    const advanceId = String(data.get("advanceId") || "");
    const error = $("#expenseError");
    if (!description || !category || !Number.isFinite(amount) || amount <= 0 || !date || !responsible ||
        (advanceId && !state.advances.some((item) => item.id === advanceId))) {
      error.textContent = "Enter a description, category, positive amount, date, responsible person, and valid advance.";
      error.classList.remove("hidden");
      return;
    }
    if (advanceId) {
      const advance = state.advances.find((item) => item.id === advanceId);
      const actualAfterSave = state.expenses.filter((item) => item.advanceId === advanceId && item.id !== id).reduce((sum, item) => sum + Number(item.amount), 0) + amount;
      const returned = state.cashReturns.filter((item) => item.advanceId === advanceId).reduce((sum, item) => sum + Number(item.amount), 0);
      if (returned > Math.max(0, Number(advance.amount) - actualAfterSave) + 0.005) {
        error.textContent = "This change would make recorded cash returns exceed the unspent advance balance.";
        error.classList.remove("hidden");
        return;
      }
    }
    const expense = {
      id: id || `exp-${Date.now()}`,
      description, category, amount, date, responsible, advanceId,
      reference: String(data.get("reference") || "").trim(),
      notes: String(data.get("notes") || "").trim()
    };
    state.expenses = id ? state.expenses.map((item) => item.id === id ? expense : item) : [...state.expenses, expense];
    recordActivity(id ? "Record updated" : "Expense transaction", "expense", expense.id, expense.reference || `EXP-${expense.id}`, id ? `Updated expense · ${expense.description}` : expense.description, expense.amount, id ? localDateString() : expense.date);
    saveState();
    closeModal($("#expenseModal"));
    refreshViews();
    showToast(id ? "Expense updated." : "Expense recorded.");
  }

  function saveTransaction(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const type = formData.get("type");
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "");
    const account = String(formData.get("account") || "");
    const amount = Number(formData.get("amount"));
    const date = String(formData.get("date") || "");
    const categoryRecord = accountForCategory(category, type);
    const accountRecord = state.accounts.find((entry) => entry.name === account && entry.type === "Asset");
    const error = $("#transactionError");
    if (!description || !Number.isFinite(amount) || amount <= 0 || !date || !categoryRecord || !accountRecord) {
      error.textContent = "Enter a description, positive amount, valid date, category, and asset account.";
      error.classList.remove("hidden");
      return;
    }
    const id = $("#transactionId").value;
    const record = { id: id || `tx-${Date.now()}`, type, description, category, account, amount, date, notes: String(formData.get("notes") || "").trim() };
    if (id) state.transactions = state.transactions.map((item) => item.id === id ? record : item);
    else state.transactions.push(record);
    recordActivity(id ? "Record updated" : (type === "income" ? "Income transaction" : "Expense transaction"), "transaction", record.id, `TX-${record.id}`, id ? `Updated transaction · ${record.description}` : record.description, record.amount, id ? localDateString() : record.date);
    saveState();
    closeModal($("#transactionModal"));
    refreshViews();
    showToast(id ? "Transaction updated." : "Transaction added.");
  }

  function saveAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = $("#accountId").value;
    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "");
    const description = String(formData.get("description") || "").trim();
    const currentName = state.accounts.find((account) => account.id === id)?.name;
    const used = state.transactions.some((item) => item.category === currentName || item.account === currentName);
    const duplicate = state.accounts.some((account) => account.name.toLowerCase() === name.toLowerCase() && account.id !== id);
    const error = $("#accountError");
    if (!name || !accountTypes.includes(type) || duplicate) {
      error.textContent = duplicate ? "An account with this name already exists." : "Enter an account name and a valid account type.";
      error.classList.remove("hidden");
      return;
    }
    if (id && used && state.accounts.find((account) => account.id === id)?.type !== type) {
      error.textContent = "This account is used by existing transactions, so its type cannot be changed.";
      error.classList.remove("hidden");
      return;
    }
    if (id && used && state.accounts.find((account) => account.id === id)?.name !== name) {
      error.textContent = "This account is used by existing transactions, so its name cannot be changed.";
      error.classList.remove("hidden");
      return;
    }
    if (id) {
      state.accounts = state.accounts.map((account) => account.id === id ? { ...account, name, type, description } : account);
    } else {
      const next = Number(state.nextAccountCode) || 6001;
      state.accounts.push({ id: `acct-${Date.now()}`, code: String(next), name, type, description });
      state.nextAccountCode = next + 1;
    }
    saveState();
    closeModal($("#accountModal"));
    refreshViews();
    showToast(id ? "Account updated." : "Account added.");
  }

  function deleteTransaction(id) {
    const transaction = state.transactions.find((item) => item.id === id);
    if (!transaction || !window.confirm(`Delete "${transaction.description}"? This cannot be undone.`)) return;
    recordActivity("Record deleted", "transaction", transaction.id, `TX-${transaction.id}`, `Deleted transaction · ${transaction.description}`, transaction.amount, localDateString());
    state.transactions = state.transactions.filter((item) => item.id !== id);
    saveState();
    refreshViews();
    showToast("Transaction deleted.");
  }

  function deleteAccount(id) {
    const account = state.accounts.find((item) => item.id === id);
    if (!account) return;
    const used = state.transactions.some((item) => item.category === account.name || item.account === account.name);
    if (used) {
      showToast("This account is used in transactions and cannot be deleted.", "error");
      return;
    }
    if (!window.confirm(`Delete the "${account.name}" account?`)) return;
    state.accounts = state.accounts.filter((item) => item.id !== id);
    saveState();
    refreshViews();
    showToast("Account deleted.");
  }

  function deleteMember(id) {
    const member = state.members.find((item) => item.id === id);
    if (!member || !window.confirm(`Delete ${member.name} (${member.memberId})? Existing receipts will be retained as financial records.`)) return;
    recordActivity("Record deleted", "member", member.id, member.memberId, `Deleted member record · ${member.name}`, member.fee, localDateString());
    state.members = state.members.filter((item) => item.id !== id);
    saveState();
    refreshViews();
    showToast("Member record deleted; historical receipts were retained.");
  }

  function deleteCollection(id) {
    const payment = state.collections.find((item) => item.id === id);
    if (!payment || !window.confirm(`Delete receipt ${payment.reference}? This will change the member's payment status.`)) return;
    recordActivity("Record deleted", "collection", payment.id, payment.reference, `Deleted membership payment · ${payment.memberName}`, payment.amount, localDateString());
    state.collections = state.collections.filter((item) => item.id !== id);
    saveState();
    refreshViews();
    showToast("Payment record deleted.");
  }

  function deleteExpense(id) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense || !window.confirm(`Delete expense "${expense.description}"?`)) return;
    if (expense.advanceId) {
      const advance = state.advances.find((item) => item.id === expense.advanceId);
      const actualAfterDelete = state.expenses.filter((item) => item.advanceId === expense.advanceId && item.id !== id).reduce((sum, item) => sum + Number(item.amount), 0);
      const returned = state.cashReturns.filter((item) => item.advanceId === expense.advanceId).reduce((sum, item) => sum + Number(item.amount), 0);
      if (advance && returned > Math.max(0, Number(advance.amount) - actualAfterDelete) + 0.005) {
        showToast("This expense supports an already recorded cash return and cannot be deleted.", "error");
        return;
      }
    }
    recordActivity("Record deleted", "expense", expense.id, expense.reference || `EXP-${expense.id}`, `Deleted expense · ${expense.description}`, expense.amount, localDateString());
    state.expenses = state.expenses.filter((item) => item.id !== id);
    saveState();
    refreshViews();
    showToast("Expense record deleted.");
  }

  function deleteAdvance(id) {
    const advance = state.advances.find((item) => item.id === id);
    if (!advance) return;
    if (state.expenses.some((item) => item.advanceId === id) || state.cashReturns.some((item) => item.advanceId === id)) {
      showToast("This advance has linked expenses or cash returns. Remove those records before deleting the advance.", "error");
      return;
    }
    if (!window.confirm(`Delete cash advance ${advance.reference}?`)) return;
    recordActivity("Record deleted", "advance", advance.id, advance.reference, `Deleted cash advance · ${advance.activity}`, advance.amount, localDateString());
    state.advances = state.advances.filter((item) => item.id !== id);
    saveState();
    refreshViews();
    showToast("Cash advance deleted.");
  }

  function exportRows(columns, rows, filename) {
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [columns.map(quote).join(","), ...rows.map((row) => row.map(quote).join(","))].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("CSV export downloaded.");
  }

  function exportCollections(items = state.collections, filename = "ledgerly-collections.csv") {
    exportRows(["Receipt / Reference", "Member ID", "Member", "Date", "Method", "Amount (PHP)", "Notes"],
      items.map((item) => [item.reference, state.members.find((member) => member.id === item.memberId)?.memberId || "Removed member", item.memberName, item.date, item.method, Number(item.amount).toFixed(2), item.notes || ""]), filename);
  }

  function exportExpenses(items = state.expenses, filename = "ledgerly-expenses.csv") {
    exportRows(["Description", "Category", "Date", "Responsible", "Supporting reference", "Advance reference", "Amount (PHP)", "Notes"],
      items.map((item) => [item.description, item.category, item.date, item.responsible, item.reference, state.advances.find((advance) => advance.id === item.advanceId)?.reference || "", Number(item.amount).toFixed(2), item.notes || ""]), filename);
  }

  function exportCurrentReport() {
    const start = $("#reportStart").value;
    const end = $("#reportEnd").value;
    if (start && end && start > end) {
      showToast("Choose a valid date range before exporting.", "error");
      return;
    }
    const type = $("#reportType").value;
    if (type === "collections") {
      exportCollections(filteredByDate(state.collections, start, end), "ledgerly-collection-report.csv");
    } else if (type === "expenses") {
      const expenses = filteredByDate(state.expenses, start, end);
      const transactions = filteredByDate(state.transactions, start, end).filter((item) => item.type === "expense");
      exportRows(["Description", "Category", "Date", "Responsible / Account", "Reference", "Amount (PHP)", "Notes"],
        [
          ...expenses.map((item) => [item.description, item.category, item.date, item.responsible, item.reference || `EXP-${item.id}`, Number(item.amount).toFixed(2), item.notes || ""]),
          ...transactions.map((item) => [item.description, item.category, item.date, item.account, `TX-${item.id}`, Number(item.amount).toFixed(2), item.notes || ""])
        ],
        "ledgerly-expense-report.csv");
    } else {
      const monthMap = new Map();
      const incomeTransactions = filteredByDate(state.transactions, start, end).filter((item) => item.type === "income");
      const expenseTransactions = filteredByDate(state.transactions, start, end).filter((item) => item.type === "expense");
      [...filteredByDate(state.collections, start, end), ...incomeTransactions].forEach((item) => {
        const row = monthMap.get(item.date.slice(0, 7)) || { collections: 0, expenses: 0 };
        row.collections += Number(item.amount);
        monthMap.set(item.date.slice(0, 7), row);
      });
      [...filteredByDate(state.expenses, start, end), ...expenseTransactions].forEach((item) => {
        const row = monthMap.get(item.date.slice(0, 7)) || { collections: 0, expenses: 0 };
        row.expenses += Number(item.amount);
        monthMap.set(item.date.slice(0, 7), row);
      });
      const rows = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, values]) => [month, values.collections.toFixed(2), values.expenses.toFixed(2), (values.collections - values.expenses).toFixed(2)]);
      exportRows(["Month", "Income (PHP)", "Expenses (PHP)", "Net activity (PHP)"], rows, "ledgerly-financial-report.csv");
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-page]");
      if (pageButton) { event.preventDefault(); navigate(pageButton.dataset.page); return; }
      const actionButton = event.target.closest("[data-action]");
      if (actionButton?.dataset.action === "new-member") { openMemberModal(); return; }
      if (actionButton?.dataset.action === "new-collection") { openCollectionModal(); return; }
      if (actionButton?.dataset.action === "new-expense") { openExpenseModal(); return; }
      if (actionButton?.dataset.action === "new-advance") { openAdvanceModal(); return; }
      if (actionButton?.dataset.action === "new-user") { openUserModal(); return; }
      if (actionButton?.dataset.action === "new-transaction") { openTransactionModal(); return; }
      if (actionButton?.dataset.action === "new-account") { openAccountModal(); return; }
      const historyButton = event.target.closest("[data-member-history]");
      if (historyButton) { openMemberHistory(historyButton.dataset.memberHistory); return; }
      const editMember = event.target.closest("[data-edit-member]");
      if (editMember) {
        const member = state.members.find((item) => item.id === editMember.dataset.editMember);
        if (member) openMemberModal(member);
        return;
      }
      const deleteMemberButton = event.target.closest("[data-delete-member]");
      if (deleteMemberButton) { deleteMember(deleteMemberButton.dataset.deleteMember); return; }
      const printReceiptButton = event.target.closest("[data-print-receipt]");
      if (printReceiptButton) {
        const payment = state.collections.find((item) => item.id === printReceiptButton.dataset.printReceipt);
        if (payment) printReceipt(payment);
        return;
      }
      const deleteCollectionButton = event.target.closest("[data-delete-collection]");
      if (deleteCollectionButton) { deleteCollection(deleteCollectionButton.dataset.deleteCollection); return; }
      const editExpenseButton = event.target.closest("[data-edit-expense]");
      if (editExpenseButton) {
        const expense = state.expenses.find((item) => item.id === editExpenseButton.dataset.editExpense);
        if (expense) openExpenseModal(expense);
        return;
      }
      const deleteExpenseButton = event.target.closest("[data-delete-expense]");
      if (deleteExpenseButton) { deleteExpense(deleteExpenseButton.dataset.deleteExpense); return; }
      const deleteAdvanceButton = event.target.closest("[data-delete-advance]");
      if (deleteAdvanceButton) { deleteAdvance(deleteAdvanceButton.dataset.deleteAdvance); return; }
      const recordReturnButton = event.target.closest("[data-record-return]");
      if (recordReturnButton) { openCashReturnModal(recordReturnButton.dataset.recordReturn); return; }
      const returnHistoryButton = event.target.closest("[data-cash-return-history]");
      if (returnHistoryButton) { openCashReturnHistory(returnHistoryButton.dataset.cashReturnHistory); return; }
      const editUserButton = event.target.closest("[data-edit-user]");
      if (editUserButton) {
        const user = state.users.find((item) => item.id === editUserButton.dataset.editUser);
        if (user) openUserModal(user);
        return;
      }
      const deleteUserButton = event.target.closest("[data-delete-user]");
      if (deleteUserButton) { deleteUser(deleteUserButton.dataset.deleteUser); return; }
      const editTransaction = event.target.closest("[data-edit-transaction]");
      if (editTransaction) {
        const transaction = state.transactions.find((item) => item.id === editTransaction.dataset.editTransaction);
        if (transaction) openTransactionModal(transaction);
        return;
      }
      const deleteTransactionButton = event.target.closest("[data-delete-transaction]");
      if (deleteTransactionButton) { deleteTransaction(deleteTransactionButton.dataset.deleteTransaction); return; }
      const editAccount = event.target.closest("[data-edit-account]");
      if (editAccount) {
        const account = state.accounts.find((item) => item.id === editAccount.dataset.editAccount);
        if (account) openAccountModal(account);
        return;
      }
      const deleteAccountButton = event.target.closest("[data-delete-account]");
      if (deleteAccountButton) { deleteAccount(deleteAccountButton.dataset.deleteAccount); return; }
      const closeButton = event.target.closest("[data-close-modal]");
      if (closeButton) { closeModal(closeButton.closest(".modal-backdrop")); return; }
      if (event.target.classList.contains("modal-backdrop")) closeModal(event.target);
    });
    $("#memberForm").addEventListener("submit", saveMember);
    $("#collectionForm").addEventListener("submit", saveCollection);
    $("#advanceForm").addEventListener("submit", saveAdvance);
    $("#cashReturnForm").addEventListener("submit", saveCashReturn);
    $("#userForm").addEventListener("submit", saveUser);
    $("#settingsForm").addEventListener("submit", saveSettings);
    $("#expenseForm").addEventListener("submit", saveExpense);
    $("#transactionForm").addEventListener("submit", saveTransaction);
    $("#accountForm").addEventListener("submit", saveAccount);
    $$('input[name="type"]').forEach((radio) => radio.addEventListener("change", () => setTransactionTypeOptions(radio.value)));
    $("#transactionSearch").addEventListener("input", renderTransactions);
    $("#typeFilter").addEventListener("change", renderTransactions);
    $("#monthFilter").addEventListener("change", renderTransactions);
    $("#memberSearch").addEventListener("input", renderMembers);
    $("#memberStatusFilter").addEventListener("change", renderMembers);
    $("#courseFilter").addEventListener("change", renderMembers);
    $("#collectionSearch").addEventListener("input", renderCollections);
    $("#collectionStatusFilter").addEventListener("change", renderCollections);
    $("#collectionDateFilter").addEventListener("change", renderCollections);
    $("#collectionMemberInput").addEventListener("change", () => updateMemberFeePreview(true));
    $("#expenseSearch").addEventListener("input", renderExpenses);
    $("#expenseCategoryFilter").addEventListener("change", renderExpenses);
    $("#expenseMonthFilter").addEventListener("change", renderExpenses);
    $("#reportType").addEventListener("change", renderReports);
    $("#reportStart").addEventListener("change", renderReports);
    $("#reportEnd").addEventListener("change", renderReports);
    $("#clearReportDates").addEventListener("click", () => {
      $("#reportStart").value = "";
      $("#reportEnd").value = "";
      renderReports();
    });
    $("#historyAddPayment").addEventListener("click", (event) => {
      const memberId = event.currentTarget.dataset.memberId;
      closeModal($("#historyModal"));
      openCollectionModal(memberId);
    });
    $("#onlinePaymentButton").addEventListener("click", () => window.alert("Online payment preview only. No gateway is connected and no payment will be processed. In a live system, members would review a secure payment page before confirming."));
    $("#collectionExportButton").addEventListener("click", () => exportCollections());
    $("#expenseExportButton").addEventListener("click", () => exportExpenses());
    $("#reportPrintButton").addEventListener("click", () => window.print());
    $("#exportButton").addEventListener("click", () => {
      const search = $("#transactionSearch").value.trim().toLowerCase();
      const type = $("#typeFilter").value;
      const month = $("#monthFilter").value;
      const filtered = getActivityRows().filter((item) =>
        `${item.reference} ${item.activity} ${item.description}`.toLowerCase().includes(search) &&
        (type === "all" || item.activity === type) && (month === "all" || item.date.slice(0, 7) === month));
      exportRows(["Reference", "Activity", "Description", "Date", "Amount (PHP)"],
        filtered.map((item) => [item.reference, item.activity, item.description, item.date, Number(item.amount).toFixed(2)]),
        "ledgerly-audit-trail.csv");
    });
    $("#reportExportButton").addEventListener("click", exportCurrentReport);
    $("#logoutButton").addEventListener("click", demoLogout);
    $("#logoutCancelButton").addEventListener("click", () => $("#logoutConfirmation").classList.add("hidden"));
    $("#logoutContinueButton").addEventListener("click", () => {
      $("#logoutConfirmation").classList.add("hidden");
      window.alert("You are using a frontend-only demo, so no sign-in session exists to end. In the complete system, this action will sign you out.");
    });
    $("#resetButton").addEventListener("click", () => {
      if (!window.confirm("Restore the original sample data? Your current demo records will be replaced.")) return;
      state = {
        accounts: structuredClone(defaultAccounts),
        transactions: structuredClone(sampleTransactions),
        nextAccountCode: 6001,
        members: structuredClone(sampleMembers),
        collections: structuredClone(sampleCollections),
        expenses: structuredClone(sampleExpenses),
        advances: structuredClone(sampleAdvances),
        cashReturns: structuredClone(sampleCashReturns),
        nextMemberNumber: sampleMembers.length + 1,
        nextCollectionNumber: sampleCollections.length + 1,
        nextAdvanceNumber: sampleAdvances.length + 1,
        nextCashReturnNumber: sampleCashReturns.length + 1,
        auditTrail: [],
        nextAuditNumber: 1,
        users: structuredClone(sampleUsers),
        settings: structuredClone(defaultSettings)
      };
      saveState();
      refreshViews();
      showToast("Sample data restored.");
    });
    $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    $("#aboutButton").addEventListener("click", () => window.alert("Ledgerly is a frontend-only school organization accounting demo. Members, fee collections, expenses, advances, and demo records are stored in this browser using LocalStorage. No information is sent to a server, and the online payment preview does not process payments."));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        $$(".modal-backdrop:not(.hidden)").forEach(closeModal);
        $("#logoutConfirmation").classList.add("hidden");
      }
    });
  }

  function initialize() {
    loadState();
    $("#todayLabel").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(today).toUpperCase();
    bindEvents();
    refreshViews();
  }

  initialize();
})();
