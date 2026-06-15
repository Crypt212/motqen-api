import { asyncHandler } from '../../types/asyncHandler.js';
import { AdminNotificationService } from '../../services/admin/AdminNotificationService.js';
import SuccessResponse from '../../responses/successResponse.js';

export class AdminNotificationController {
  constructor(private readonly service: AdminNotificationService) {}

  public listNotifications = asyncHandler(async (req, res) => {
    const data = await this.service.listNotifications(req.query);
    new SuccessResponse('Notifications retrieved successfully', data).send(res);
  });

  public getNotification = asyncHandler(async (req, res) => {
    const data = await this.service.getNotification(req.params.id as string);
    new SuccessResponse('Notification retrieved successfully', data).send(res);
  });

  public createNotification = asyncHandler(async (req, res) => {
    const data = await this.service.createNotification(req.body);
    new SuccessResponse('Notification created successfully', data, 201).send(res);
  });

  public deleteNotification = asyncHandler(async (req, res) => {
    await this.service.deleteNotification(req.params.id as string);
    new SuccessResponse('Notification deleted successfully', null, 200).send(res);
  });

  public sendNotification = asyncHandler(async (req, res) => {
    const data = await this.service.sendNotification(req.params.id as string);
    new SuccessResponse('Notification sent successfully', data).send(res);
  });

  public sendNewNotification = asyncHandler(async (req, res) => {
    const data = await this.service.sendAndCreate(req.body);
    new SuccessResponse('Notification sent successfully', data, 201).send(res);
  });

  public listTemplates = asyncHandler(async (_req, res) => {
    const data = await this.service.listTemplates();
    new SuccessResponse('Notification templates retrieved successfully', data).send(res);
  });

  public createTemplate = asyncHandler(async (req, res) => {
    const data = await this.service.createTemplate(req.body);
    new SuccessResponse('Notification template created successfully', data, 201).send(res);
  });
}
