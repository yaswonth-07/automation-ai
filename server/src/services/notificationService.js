import { Notification } from '../models/Notification.js';
import { emitUserNotification } from '../config/socket.js';

export class NotificationService {
  async createNotification({ owner, workflowId, executionId, type = 'info', title, message }) {
    const notification = await Notification.create({
      owner,
      workflowId,
      executionId,
      type,
      title,
      message,
      isRead: false,
    });

    emitUserNotification(owner ? owner.toString() : null, notification);
    return notification;
  }

  async getNotifications(userId, { limit = 30, unreadOnly = false } = {}) {
    const query = { owner: userId };
    if (unreadOnly) query.isRead = false;

    return Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, owner: userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}

export const notificationService = new NotificationService();
