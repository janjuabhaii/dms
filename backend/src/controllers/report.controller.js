import Order from "../models/Order.js";
import Shop from "../models/Shop.js";
import Worker from "../models/Worker.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * All reports in this file are admin-only aggregate views over data that's
 * already real (Orders since Phase 7/8, Shop/Worker running totals since
 * Phase 5/6/7/8) — nothing here introduces new source-of-truth fields,
 * it's all derived at read time from what already exists.
 */

// ---- Shared helpers ---------------------------------------------------

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Reads `?from=&to=` (ISO date strings) with a sensible default window
 * (last 90 days) for the date-scoped reports (Sales, Worker Performance,
 * Commissions). Pending Payments and Shop Purchase History are current-state
 * snapshots and don't use this — they reflect running totals, not a window.
 */
const parseDateRange = (req) => {
  const now = new Date();
  const to = req.query.to ? new Date(req.query.to) : now;
  to.setHours(23, 59, 59, 999);

  const from = req.query.from
    ? new Date(req.query.from)
    : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);

  return { from, to };
};

// ---- GET /api/v1/reports/dashboard-summary -----------------------------

/**
 * Feeds the main Admin Dashboard (Phase 3 was built against mock data —
 * this is what finally replaces it). Returns exactly the shape the existing
 * dashboard components expect (StatCard, MonthlySalesChart,
 * PaymentOverviewChart, WorkerPerformanceChart, RecentOrdersTable), so the
 * frontend swap is "change the data source," not "rebuild the UI."
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const now = new Date();

  const [totalProducts, totalWorkers, totalShops] = await Promise.all([
    Product.countDocuments(),
    Worker.countDocuments(),
    Shop.countDocuments(),
  ]);

  const [salesAgg] = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, totalPaid: { $sum: "$paidAmount" } } },
  ]);
  const totalSales = salesAgg?.totalSales || 0;

  const [pendingAgg] = await Shop.aggregate([
    { $group: { _id: null, total: { $sum: "$pendingAmount" } } },
  ]);
  const pendingPayments = pendingAgg?.total || 0;

  // Month-over-month trend for Total Sales — the one stat card where a
  // real trend is naturally available (Order.createdAt is a real time
  // series). The other four cards render without a trend badge rather than
  // fabricate one from data that has no history behind it.
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [thisMonthAgg] = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: thisMonthStart } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const [lastMonthAgg] = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const thisMonthSales = thisMonthAgg?.total || 0;
  const lastMonthSales = lastMonthAgg?.total || 0;
  const salesTrend =
    lastMonthSales > 0
      ? Number((((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1))
      : thisMonthSales > 0
      ? 100
      : 0;

  // Last 12 months of sales, zero-filled for months with no orders so the
  // chart is a continuous line rather than skipping gaps.
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const monthlyAgg = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        sales: { $sum: "$totalAmount" },
      },
    },
  ]);
  const monthlyMap = new Map(monthlyAgg.map((m) => [m._id, m.sales]));
  const monthlySales = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { month: MONTH_LABELS[d.getMonth()], sales: monthlyMap.get(key) || 0 };
  });

  // Paid / Pending / Overdue split — same 3 categories & color tokens the
  // existing PaymentOverviewChart component already expects.
  const [splitAgg] = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        paid: { $sum: "$paidAmount" },
        pending: {
          $sum: { $cond: [{ $gte: ["$deliveryDate", now] }, "$remainingAmount", 0] },
        },
        overdue: {
          $sum: { $cond: [{ $lt: ["$deliveryDate", now] }, "$remainingAmount", 0] },
        },
      },
    },
  ]);
  const paymentOverview = [
    { name: "Paid", value: splitAgg?.paid || 0, colorVar: "--success" },
    { name: "Pending", value: splitAgg?.pending || 0, colorVar: "--warning" },
    { name: "Overdue", value: splitAgg?.overdue || 0, colorVar: "--destructive" },
  ];

  const topWorkers = await Worker.find()
    .sort({ totalSales: -1 })
    .limit(6)
    .populate("userId", "name");
  const workerPerformance = topWorkers.map((w) => ({ name: w.userId?.name || "—", sales: w.totalSales }));

  const recent = await Order.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .populate("shopId", "shopName")
    .populate({ path: "workerId", populate: { path: "userId", select: "name" } });

  const recentOrders = recent.map((o) => ({
    id: `#${o._id.toString().slice(-6).toUpperCase()}`,
    shop: o.shopId?.shopName || "—",
    worker: o.workerId?.userId?.name || "—",
    amount: o.totalAmount,
    // Payment status (Paid/Pending/Partial), distinct from o.status which is
    // the fulfillment workflow (pending/confirmed/delivered/cancelled) —
    // RecentOrdersTable was built for the former, so derive it here.
    status: o.remainingAmount === 0 ? "Paid" : o.paidAmount === 0 ? "Pending" : "Partial",
    date: o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalProducts: { value: totalProducts },
          totalWorkers: { value: totalWorkers },
          totalShops: { value: totalShops },
          totalSales: { value: totalSales, trend: salesTrend },
          pendingPayments: { value: pendingPayments },
        },
        monthlySales,
        paymentOverview,
        workerPerformance,
        recentOrders,
      },
      "Dashboard summary fetched successfully"
    )
  );
});

// ---- GET /api/v1/reports/sales ------------------------------------------

export const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to } = parseDateRange(req);
  const rangeDays = (to - from) / (1000 * 60 * 60 * 24);
  const dateFormat = rangeDays > 60 ? "%Y-%m" : "%Y-%m-%d";

  const series = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const [summary] = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        totalPaid: { $sum: "$paidAmount" },
        totalPending: { $sum: "$remainingAmount" },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        series: series.map((s) => ({ date: s._id, totalSales: s.totalSales, orderCount: s.orderCount })),
        summary: summary || { totalSales: 0, totalOrders: 0, totalPaid: 0, totalPending: 0 },
        range: { from, to },
      },
      "Sales report fetched successfully"
    )
  );
});

// ---- GET /api/v1/reports/worker-performance ------------------------------

export const getWorkerPerformanceReport = asyncHandler(async (req, res) => {
  const { from, to } = parseDateRange(req);

  const orderAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$workerId",
        totalSales: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        commissionEarned: { $sum: "$commissionEarned" },
      },
    },
  ]);
  const aggById = new Map(orderAgg.map((a) => [a._id.toString(), a]));

  const workers = await Worker.find().populate("userId", "name email");

  const rows = workers
    .map((w) => {
      const agg = aggById.get(w._id.toString());
      return {
        id: w._id,
        name: w.userId?.name || "—",
        area: w.area,
        totalSales: agg?.totalSales || 0,
        totalOrders: agg?.totalOrders || 0,
        commissionEarned: agg?.commissionEarned || 0,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  res
    .status(200)
    .json(new ApiResponse(200, { rows, range: { from, to } }, "Worker performance report fetched successfully"));
});

// ---- GET /api/v1/reports/pending-payments --------------------------------

export const getPendingPaymentsReport = asyncHandler(async (req, res) => {
  const shops = await Shop.find({ pendingAmount: { $gt: 0 } })
    .populate({ path: "assignedWorker", populate: { path: "userId", select: "name" } })
    .sort({ pendingAmount: -1 });

  const rows = shops.map((s) => ({
    id: s._id,
    shopName: s.shopName,
    ownerName: s.ownerName,
    phone: s.phone,
    workerName: s.assignedWorker?.userId?.name || "Unassigned",
    totalPurchase: s.totalPurchase,
    paidAmount: s.paidAmount,
    pendingAmount: s.pendingAmount,
  }));

  const totalPending = rows.reduce((sum, r) => sum + r.pendingAmount, 0);

  res
    .status(200)
    .json(new ApiResponse(200, { rows, totalPending }, "Pending payments report fetched successfully"));
});

// ---- GET /api/v1/reports/shop-purchase-history ---------------------------

export const getShopPurchaseHistoryReport = asyncHandler(async (req, res) => {
  const [shops, orderCounts] = await Promise.all([
    Shop.find()
      .populate({ path: "assignedWorker", populate: { path: "userId", select: "name" } })
      .sort({ totalPurchase: -1 }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]),
  ]);

  const countByShop = new Map(orderCounts.map((c) => [c._id.toString(), c.count]));

  const rows = shops.map((s) => ({
    id: s._id,
    shopName: s.shopName,
    ownerName: s.ownerName,
    workerName: s.assignedWorker?.userId?.name || "Unassigned",
    orderCount: countByShop.get(s._id.toString()) || 0,
    totalPurchase: s.totalPurchase,
    paidAmount: s.paidAmount,
    pendingAmount: s.pendingAmount,
  }));

  res.status(200).json(new ApiResponse(200, { rows }, "Shop purchase history fetched successfully"));
});

// ---- GET /api/v1/reports/commissions -------------------------------------

/**
 * Unlike the other reports, this one deliberately does NOT re-aggregate
 * from Order — Worker.totalCommissionEarned is already an exactly-maintained
 * running total (incremented on order creation, decremented on
 * cancellation, per order.controller.js), so reading it directly here is
 * both simpler and guaranteed consistent with what created it.
 */
export const getCommissionReport = asyncHandler(async (req, res) => {
  const workers = await Worker.find().sort({ totalCommissionEarned: -1 }).populate("userId", "name email");

  const rows = workers.map((w) => ({
    id: w._id,
    name: w.userId?.name || "—",
    email: w.userId?.email,
    area: w.area,
    commissionPercentage: w.commissionPercentage,
    totalOrders: w.totalOrders,
    totalSales: w.totalSales,
    commissionEarned: w.totalCommissionEarned,
  }));

  const totalCommission = rows.reduce((sum, r) => sum + r.commissionEarned, 0);

  res
    .status(200)
    .json(new ApiResponse(200, { rows, totalCommission }, "Commission report fetched successfully"));
});
