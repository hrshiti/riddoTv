const Payment = require('../models/Payment');
const Content = require('../models/Content');
const QuickByte = require('../models/QuickByte');
const User = require('../models/User');
const { createContentPurchaseOrder, verifyPayment, refundPayment } = require('../config/razorpay');

// Create content purchase order
const createContentPurchaseOrderService = async (contentId, userId) => {
  const content = await Content.findById(contentId);
  const user = await User.findById(userId);

  if (!content) {
    throw new Error('Content not found');
  }

  if (!user) {
    throw new Error('User not found');
  }

  if (!content.isPaid) {
    throw new Error('This content is free');
  }

  // Check if user has active purchase for this content
  const activePurchase = user.purchasedContent?.find(p =>
    p.content.toString() === contentId.toString() &&
    new Date(p.expiresAt) > new Date()
  );

  if (activePurchase) {
    throw new Error('You already have active access to this content');
  }

  // Check if user has active subscription (then content is free)
  const hasActiveSubscription = user.subscription?.isActive &&
    user.subscription?.endDate > new Date();

  if (hasActiveSubscription) {
    throw new Error('Content is free for subscribers');
  }

  // Create Razorpay order
  const order = await createContentPurchaseOrder(content, user);

  // Save payment record
  await Payment.create({
    user: userId,
    type: 'content_purchase',
    content: contentId,
    razorpayOrderId: order.id,
    amount: content.price,
    currency: content.currency,
    status: 'pending'
  });

  return {
    order,
    content: {
      id: content._id,
      title: content.title,
      price: content.price,
      currency: content.currency
    }
  };
};

// Verify content purchase payment
const verifyContentPurchasePayment = async (paymentData, userId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  // Verify payment signature
  const isValidPayment = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValidPayment) {
    throw new Error('Payment verification failed');
  }

  // Find payment record
  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    user: userId
  }).populate('content', 'title price');

  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Update payment status
  payment.status = 'completed';
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  await payment.save();

  // Grant access to user
  const user = await User.findById(userId);
  if (user) {
    let expiresAt;
    const content = payment.content;

    // Determine expiration based on purchase mode
    if (content.purchaseMode === 'onetime') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    } else {
      // Default to monthly (or whatever 'monthly' implies, assuming 30 days)
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    user.purchasedContent.push({
      content: content._id,
      purchasedAt: new Date(),
      expiresAt: expiresAt
    });
    await user.save();
  }

  return {
    message: 'Content purchased successfully',
    payment: {
      id: payment._id,
      amount: payment.amount,
      content: payment.content,
      status: payment.status
    }
  };
};

// Create QuickByte episode purchase order
const createQuickBytePurchaseOrderService = async (quickbyteId, episodeIndex, userId) => {
  const quickbyte = await QuickByte.findById(quickbyteId);
  const user = await User.findById(userId);

  if (!quickbyte) throw new Error('QuickByte not found');
  if (!user) throw new Error('User not found');

  if (!quickbyte.isPaid) {
    throw new Error('This content is free');
  }

  // Check if it's the specific paid episode
  const freeCount = quickbyte.freeEpisodes || 0;
  if (episodeIndex !== freeCount) {
    throw new Error('This episode is free');
  }

  // Check if user already purchased this episode
  const alreadyPurchased = user.purchasedQuickBytes?.find(p =>
    p.quickbyte && p.quickbyte.toString() === quickbyteId.toString() && p.episodeIndex === parseInt(episodeIndex)
  );

  if (alreadyPurchased) {
    throw new Error('You already have access to this episode');
  }

  // Create Razorpay order
  // We can reuse createContentPurchaseOrder but we need to pass the price
  const { createContentPurchaseOrder: createOrder } = require('../config/razorpay');
  const order = await createOrder({ _id: quickbyte._id, title: `${quickbyte.title} - Ep ${episodeIndex + 1}`, price: quickbyte.price }, user);

  // Save payment record
  await Payment.create({
    user: userId,
    type: 'quickbyte_purchase',
    quickbyte: quickbyteId,
    episodeIndex: episodeIndex,
    razorpayOrderId: order.id,
    amount: quickbyte.price,
    currency: 'INR',
    status: 'pending'
  });

  return {
    order,
    quickbyte: {
      id: quickbyte._id,
      title: quickbyte.title,
      episodeIndex: episodeIndex,
      price: quickbyte.price
    }
  };
};

// Verify QuickByte episode purchase payment
const verifyQuickBytePurchasePayment = async (paymentData, userId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  const { verifyPayment } = require('../config/razorpay');
  const isValidPayment = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValidPayment) {
    throw new Error('Payment verification failed');
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    user: userId
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  payment.status = 'completed';
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  await payment.save();

  // Grant access
  const user = await User.findById(userId);
  if (user) {
    user.purchasedQuickBytes.push({
      quickbyte: payment.quickbyte,
      episodeIndex: payment.episodeIndex,
      purchasedAt: new Date()
    });
    await user.save();
  }

  return {
    message: 'Episode purchased successfully',
    payment: {
      id: payment._id,
      amount: payment.amount,
      status: payment.status
    }
  };
};

// Get user's payment history
const getUserPaymentHistory = async (userId, limit = 10) => {
  const payments = await Payment.find({ user: userId })
    .populate('subscriptionPlan', 'name price')
    .populate('content', 'title type poster')
    .sort({ createdAt: -1 })
    .limit(limit);

  return payments;
};

// Get payment analytics for admin
const getPaymentAnalytics = async (startDate, endDate) => {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const end = endDate || new Date();

  const analytics = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);

  const subscriptionRevenue = analytics.find(item => item._id === 'subscription')?.totalAmount || 0;
  const contentRevenue = analytics.find(item => item._id === 'content_purchase')?.totalAmount || 0;
  const totalRevenue = subscriptionRevenue + contentRevenue;

  const subscriptionCount = analytics.find(item => item._id === 'subscription')?.count || 0;
  const contentPurchaseCount = analytics.find(item => item._id === 'content_purchase')?.count || 0;
  const totalTransactions = subscriptionCount + contentPurchaseCount;

  return {
    totalRevenue,
    subscriptionRevenue,
    contentRevenue,
    totalTransactions,
    subscriptionTransactions: subscriptionCount,
    contentPurchaseTransactions: contentPurchaseCount,
    period: {
      start,
      end
    }
  };
};

// Process refund
const processRefund = async (paymentId, adminId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }

  if (payment.status === 'refunded') {
    throw new Error('Payment already refunded');
  }

  try {
    // Process refund via Razorpay
    const refund = await refundPayment(payment.razorpayPaymentId, payment.amount);

    // Update payment status
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = 'Admin initiated refund';
    payment.refundProcessedAt = new Date();
    await payment.save();

    return {
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    };
  } catch (error) {
    throw new Error(`Refund failed: ${error.message}`);
  }
};

// Get all payments (Admin)
const getAllPayments = async (filters = {}, page = 1, limit = 10) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.user) query.user = filters.user;

  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate('user', 'name email')
    .populate('subscriptionPlan', 'name price')
    .populate('content', 'title type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(query);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get performance analytics for paid content (Admin)
const getPaidContentPerformance = async () => {
  // 1. Aggregate payments by content
  const stats = await Payment.aggregate([
    {
      $match: {
        type: 'content_purchase',
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$content',
        totalRevenue: { $sum: '$amount' },
        purchaseCount: { $sum: 1 }
      }
    }
  ]);

  // 2. Fetch all paid content to ensure we show even those with 0 sales
  const allPaidContent = await Content.find({ isPaid: true })
    .select('title price currency views likes poster image')
    .lean();

  // 3. Merge stats with content details
  const performanceData = allPaidContent.map(content => {
    const contentStats = stats.find(s => s._id && s._id.toString() === content._id.toString());
    return {
      _id: content._id,
      title: content.title,
      price: content.price,
      currency: content.currency || 'INR',
      poster: content.poster?.url || content.image,
      revenue: contentStats ? contentStats.totalRevenue : 0,
      purchases: contentStats ? contentStats.purchaseCount : 0,
      views: content.views,
      likes: content.likes
    };
  });

  // 4. Sort by revenue descending
  performanceData.sort((a, b) => b.revenue - a.revenue);

  return performanceData;
};

// Get performance analytics for Quick Bites (Admin)
const getQuickBytePerformance = async () => {
  // 1. Aggregate payments by Quick Bite
  const stats = await Payment.aggregate([
    {
      $match: {
        type: 'quickbyte_purchase',
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$quickbyte',
        totalRevenue: { $sum: '$amount' },
        purchaseCount: { $sum: 1 },
        purchasers: { $addToSet: '$user' } // Unique purchasers
      }
    }
  ]);

  // 2. Fetch all paid Quick Bites
  const allPaidQB = await QuickByte.find({ isPaid: true })
    .select('title price currency views thumbnail')
    .lean();

  // 3. Merge stats
  const performanceData = allPaidQB.map(qb => {
    const qbStats = stats.find(s => s._id && s._id.toString() === qb._id.toString());
    return {
      _id: qb._id,
      title: qb.title,
      price: qb.price,
      currency: qb.currency || 'INR',
      poster: qb.thumbnail?.url || qb.thumbnail,
      revenue: qbStats ? qbStats.totalRevenue : 0,
      purchases: qbStats ? qbStats.purchaseCount : 0,
      uniquePurchasers: qbStats ? qbStats.purchasers.length : 0,
      views: qb.views
    };
  });

  performanceData.sort((a, b) => b.revenue - a.revenue);
  return performanceData;
};

// Get detailed Quick Bite payments (Admin)
const getQuickBytePayments = async (limit = 50) => {
  return await Payment.find({ type: 'quickbyte_purchase', status: 'completed' })
    .populate('user', 'name email')
    .populate('quickbyte', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  createContentPurchaseOrderService,
  verifyContentPurchasePayment,
  createQuickBytePurchaseOrderService,
  verifyQuickBytePurchasePayment,
  getUserPaymentHistory,
  getPaymentAnalytics,
  processRefund,
  getAllPayments,
  getPaidContentPerformance,
  getQuickBytePerformance,
  getQuickBytePayments
};
