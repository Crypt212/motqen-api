import { Router } from 'express';
import multer from 'multer';
import { authorizeAdmin } from '../../middlewares/accessMiddleware.js';
import {
  CreateReportSchema,
  UpdateReportSchema,
  UpdateReportStatusSchema,
  ReportIdParamsSchema,
  ReportQuerySchema,
} from '../../schemas/requests/report.request.js';
import { reportController } from '../../state.js';
import { createRoute } from 'src/types/asyncHandler.js';

const reportsRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

reportsRouter.post(
  '/',
  upload.array('images', 5),
  createRoute({
    schemas: { body: CreateReportSchema },
    handler: reportController.create,
  })
);

reportsRouter.get(
  '/',
  createRoute({
    schemas: { query: ReportQuerySchema },
    handler: reportController.list,
  })
);

reportsRouter.get(
  '/:reportId',
  createRoute({
    schemas: { params: ReportIdParamsSchema },
    handler: reportController.getById,
  })
);

reportsRouter.patch(
  '/:reportId',
  upload.array('images', 5),
  createRoute({
    schemas: { params: ReportIdParamsSchema, body: UpdateReportSchema },
    handler: reportController.update,
  })
);

reportsRouter.delete(
  '/:reportId',
  createRoute({
    schemas: { params: ReportIdParamsSchema },
    handler: reportController.cancel,
  })
);

reportsRouter.patch(
  '/:reportId/status',
  authorizeAdmin,
  createRoute({
    schemas: { params: ReportIdParamsSchema, body: UpdateReportStatusSchema },
    handler: reportController.updateStatus,
  })
);

export default reportsRouter;
