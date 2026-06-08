import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { NotificationsResponseSchema, MarkAllReadResponseSchema } from '../../../schemas/responses/notification.response.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerNotificationsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/notifications',
    tags: ['Notifications'],
    summary: 'Get user notifications',
    description: 'Retrieves a paginated list of notifications for the authenticated user.',
    security: [{ BearerAuth: [] }],
    parameters: [
      { $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' },
      {
        in: 'query',
        name: 'cursor',
        required: false,
        description: 'Cursor for pagination',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'limit',
        required: false,
        description: 'Number of notifications to retrieve (1-50, default 20)',
        schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
      },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Notifications retrieved successfully',
        content: { 'application/json': { schema: NotificationsResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /notifications/mark-all-read
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/notifications/mark-all-read',
    tags: ['Notifications'],
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications for the authenticated user as read.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'All notifications marked as read',
        content: { 'application/json': { schema: MarkAllReadResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });
}
