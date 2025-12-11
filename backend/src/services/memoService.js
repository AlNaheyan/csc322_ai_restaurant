const { ManagerMemo, User } = require('../models');

class MemoService {
  async createMemo(managerId, referenceType, referenceId, memoText) {
    if (!['delivery_bid', 'performance_override', 'complaint_decision', 'warning_override'].includes(referenceType)) {
      throw new Error('Invalid reference type');
    }

    if (!memoText || memoText.trim().length === 0) {
      throw new Error('Memo text is required');
    }

    const memo = await ManagerMemo.create({
      manager_id: managerId,
      reference_type: referenceType,
      reference_id: referenceId,
      memo_text: memoText
    });

    return memo;
  }

  async getMemosByReference(referenceType, referenceId) {
    const memos = await ManagerMemo.findAll({
      where: {
        reference_type: referenceType,
        reference_id: referenceId
      },
      include: [{
        model: User,
        as: 'Manager',
        attributes: ['user_id', 'first_name', 'last_name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    return memos;
  }

  async getAllMemos(managerId = null) {
    const where = managerId ? { manager_id: managerId } : {};

    const memos = await ManagerMemo.findAll({
      where,
      include: [{
        model: User,
        as: 'Manager',
        attributes: ['user_id', 'first_name', 'last_name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    return memos;
  }

  async getMemoById(memoId) {
    const memo = await ManagerMemo.findByPk(memoId, {
      include: [{
        model: User,
        as: 'Manager',
        attributes: ['user_id', 'first_name', 'last_name', 'email']
      }]
    });

    if (!memo) {
      throw new Error('Memo not found');
    }

    return memo;
  }

  async updateMemo(memoId, managerId, memoText) {
    const memo = await ManagerMemo.findByPk(memoId);

    if (!memo) {
      throw new Error('Memo not found');
    }

    if (memo.manager_id !== managerId) {
      throw new Error('Unauthorized to update this memo');
    }

    if (!memoText || memoText.trim().length === 0) {
      throw new Error('Memo text is required');
    }

    await memo.update({ memo_text: memoText });

    return memo;
  }

  async deleteMemo(memoId, managerId) {
    const memo = await ManagerMemo.findByPk(memoId);

    if (!memo) {
      throw new Error('Memo not found');
    }

    if (memo.manager_id !== managerId) {
      throw new Error('Unauthorized to delete this memo');
    }

    await memo.destroy();

    return { message: 'Memo deleted successfully' };
  }
}

module.exports = new MemoService();
