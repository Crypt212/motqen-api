import { Router } from 'express';
import multer from 'multer';
import { authorizeAdmin } from '../../middlewares/accessMiddleware.js';
import {
  CreateReportRequestSchema,
  CreateReportQuerySchema,
  CreateReportParamsSchema,
  GetReportsRequestSchema,
  GetReportsQuerySchema,
  GetReportsParamsSchema,
  GetReportByIdRequestSchema,
  GetReportByIdQuerySchema,
  GetReportByIdParamsSchema,
  UpdateReportRequestSchema,
  UpdateReportQuerySchema,
  UpdateReportParamsSchema,
  CancelReportRequestSchema,
  CancelReportQuerySchema,
  CancelReportParamsSchema,
  UpdateReportStatusRequestSchema,
  UpdateReportStatusQuerySchema,
  UpdateReportStatusParamsSchema,
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
    schemas: { body: CreateReportRequestSchema, query: CreateReportQuerySchema, params: CreateReportParamsSchema },
    handler: reportController.create,
  })
);

reportsRouter.get(
  '/',
  createRoute({
    schemas: { body: GetReportsRequestSchema, query: GetReportsQuerySchema, params: GetReportsParamsSchema },
    handler: reportController.list,
  })
);

reportsRouter.get(
  '/:reportId',
  createRoute({
    schemas: { body: GetReportByIdRequestSchema, query: GetReportByIdQuerySchema, params: GetReportByIdParamsSchema },
    handler: reportController.getById,
  })
);

reportsRouter.patch(
  '/:reportId',
  upload.array('images', 5),
  createRoute({
    schemas: { body: UpdateReportRequestSchema, query: UpdateReportQuerySchema, params: UpdateReportParamsSchema },
    handler: reportController.update,
  })
);

reportsRouter.delete(
  '/:reportId',
  createRoute({
    schemas: { body: CancelReportRequestSchema, query: CancelReportQuerySchema, params: CancelReportParamsSchema },
    handler: reportController.cancel,
  })
);

reportsRouter.patch(
  '/:reportId/status',
  authorizeAdmin,
  createRoute({
    schemas: { body: UpdateReportStatusRequestSchema, query: UpdateReportStatusQuerySchema, params: UpdateReportStatusParamsSchema },
    handler: reportController.updateStatus,
  })
);

export default reportsRouter;
