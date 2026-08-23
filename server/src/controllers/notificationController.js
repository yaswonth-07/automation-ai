import { notificationService } from '../services/notificationService.js';

export class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { limit, unreadOnly } = req.query;
      const notifications = await notificationService.getNotifications(req.user.id, {
        limit: limit ? Number(limit) : 30,
        unreadOnly: unreadOnly === 'true',
      });
      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
