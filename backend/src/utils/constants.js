const USER_ROLES = {
  VISITOR: 'visitor',
  CUSTOMER: 'customer',
  VIP: 'vip',
  CHEF: 'chef',
  DELIVERY: 'delivery',
  MANAGER: 'manager'
};

const REGISTRATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const COMPLAINT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
};

const EMPLOYEE_TYPE = {
  CHEF: 'chef',
  DELIVERY: 'delivery'
};

const WARNING_THRESHOLD = {
  CUSTOMER: 3,
  VIP: 2,
  EMPLOYEE: 3
};

module.exports = {
  USER_ROLES,
  REGISTRATION_STATUS,
  ORDER_STATUS,
  COMPLAINT_STATUS,
  EMPLOYEE_TYPE,
  WARNING_THRESHOLD
};
