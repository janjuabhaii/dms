import Worker from "../models/Worker.js";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Shapes a Worker doc (with populated userId) into the flat object the
 * frontend actually wants — merging identity (name/email/isActive) and
 * business profile (area/commission/performance) into one "worker" so the
 * UI never has to know these live in two collections.
 *
 * `assignedShopsCount` is passed in rather than computed here, since getting
 * it efficiently for a whole list means one aggregation query up front
 * rather than an N+1 query per worker — see getWorkers below.
 */
const toWorkerDTO = (worker, assignedShopsCount = 0) => ({
  id: worker._id,
  name: worker.userId?.name,
  email: worker.userId?.email,
  phone: worker.userId?.phone,
  isActive: worker.userId?.isActive,
  lastLogin: worker.userId?.lastLogin,
  area: worker.area,
  commissionPercentage: worker.commissionPercentage,
  totalSales: worker.totalSales,
  totalOrders: worker.totalOrders,
  totalCommissionEarned: worker.totalCommissionEarned,
  assignedShopsCount,
  createdAt: worker.createdAt,
});

const validateCommission = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) throw new ApiError(400, "Commission percentage must be a number");
  if (num < 0 || num > 100) throw new ApiError(400, "Commission percentage must be between 0 and 100");
  return num;
};

/**
 * GET /api/v1/workers/me
 * Worker only. Unlike every other route in this file, this is NOT admin-only
 * — it's how the worker mobile app (Phase 7) shows "Hi Ahmed, Lahore area,
 * 5% commission" on its home screen without needing admin privileges to see
 * their own record.
 */
export const getMyWorkerProfile = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id }).populate(
    "userId",
    "name email phone isActive lastLogin"
  );

  if (!worker) {
    throw new ApiError(403, "No worker profile is linked to this account");
  }

  const assignedShopsCount = await Shop.countDocuments({ assignedWorker: worker._id });

  res
    .status(200)
    .json(new ApiResponse(200, toWorkerDTO(worker, assignedShopsCount), "Worker profile fetched successfully"));
});

/**
 * POST /api/v1/workers
 * Admin only. Creates BOTH the login account (User, role="worker") and the
 * business profile (Worker) in one request — from the admin's perspective
 * this is "adding a worker," not "creating a user, then separately a profile."
 * If the profile creation fails after the user was created, the user is
 * rolled back so no orphaned login account is left behind.
 */
export const createWorker = asyncHandler(async (req, res) => {
  const { name, email, password, area, commissionPercentage, phone } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }
  if (!area?.trim()) {
    throw new ApiError(400, "Area is required");
  }

  const commission = validateCommission(commissionPercentage ?? 5);

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    name: name.trim(),
    email,
    password,
    phone,
    role: "worker",
  });

  let worker;
  try {
    worker = await Worker.create({
      userId: user._id,
      area: area.trim(),
      commissionPercentage: commission,
    });
  } catch (err) {
    // Roll back the auth account so a failed profile creation never leaves
    // a dangling login with no business profile behind it.
    await User.findByIdAndDelete(user._id);
    throw err;
  }

  worker = await worker.populate("userId", "name email phone isActive lastLogin");

  res.status(201).json(new ApiResponse(201, toWorkerDTO(worker, 0), "Worker created successfully"));
});

/**
 * GET /api/v1/workers?search=...
 * Admin only. Search matches worker name/email (on the User side) OR area
 * (on the Worker side), since both collections hold searchable fields.
 */
export const getWorkers = asyncHandler(async (req, res) => {
  const { search } = req.query;

  let filter = {};

  if (search) {
    const matchingUsers = await User.find({
      role: "worker",
      $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
    }).select("_id");

    filter = {
      $or: [{ userId: { $in: matchingUsers.map((u) => u._id) } }, { area: { $regex: search, $options: "i" } }],
    };
  }

  const workers = await Worker.find(filter)
    .populate("userId", "name email phone isActive lastLogin")
    .sort({ createdAt: -1 });

  // One aggregation for the whole list instead of a per-worker count query
  const shopCounts = await Shop.aggregate([{ $group: { _id: "$assignedWorker", count: { $sum: 1 } } }]);
  const countMap = new Map(shopCounts.map((c) => [String(c._id), c.count]));

  const dtos = workers.map((worker) => toWorkerDTO(worker, countMap.get(String(worker._id)) || 0));

  res.status(200).json(new ApiResponse(200, dtos, "Workers fetched successfully"));
});

/**
 * GET /api/v1/workers/:id
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id).populate(
    "userId",
    "name email phone isActive lastLogin"
  );

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  const assignedShopsCount = await Shop.countDocuments({ assignedWorker: worker._id });

  res.status(200).json(new ApiResponse(200, toWorkerDTO(worker, assignedShopsCount), "Worker fetched successfully"));
});

/**
 * PUT /api/v1/workers/:id
 * Admin only. Updates identity fields (name/email/phone/isActive) on the
 * User doc and business fields (area/commissionPercentage) on the Worker
 * doc in the same request — the split is invisible to the caller.
 * Password changes are intentionally out of scope here (a separate,
 * more guarded flow — not a casual PATCH field).
 */
export const updateWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id).populate("userId");

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  const { name, email, phone, isActive, area, commissionPercentage } = req.body;
  const user = worker.userId;

  if (email !== undefined && email.toLowerCase().trim() !== user.email) {
    const emailTaken = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
    if (emailTaken) throw new ApiError(409, "A user with this email already exists");
    user.email = email;
  }

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Name cannot be empty");
    user.name = name.trim();
  }
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;

  if (area !== undefined) {
    if (!area.trim()) throw new ApiError(400, "Area cannot be empty");
    worker.area = area.trim();
  }
  if (commissionPercentage !== undefined) {
    worker.commissionPercentage = validateCommission(commissionPercentage);
  }

  await user.save({ validateBeforeSave: true });
  await worker.save();

  const assignedShopsCount = await Shop.countDocuments({ assignedWorker: worker._id });

  res.status(200).json(new ApiResponse(200, toWorkerDTO(worker, assignedShopsCount), "Worker updated successfully"));
});

/**
 * DELETE /api/v1/workers/:id
 * Admin only. Removes both the Worker profile and its linked User login —
 * a worker with no profile but a lingering login (or vice versa) would be
 * a confusing half-deleted state. Blocked if the worker still has shops
 * assigned to them, since that would leave Shop.assignedWorker pointing at
 * a document that no longer exists — reassign those shops first.
 */
export const deleteWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id);

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  const assignedShopsCount = await Shop.countDocuments({ assignedWorker: worker._id });
  if (assignedShopsCount > 0) {
    throw new ApiError(
      400,
      `This worker has ${assignedShopsCount} shop${assignedShopsCount > 1 ? "s" : ""} assigned. Reassign or remove them first.`
    );
  }

  await User.findByIdAndDelete(worker.userId);
  await worker.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Worker deleted successfully"));
});
