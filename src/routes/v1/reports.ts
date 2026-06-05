import { Router } from 'express';
import multer from 'multer';
import {
  CreateReportSchema,
  UpdateReportSchema,
  ReportIdParamsSchema,
  ReportQuerySchema,
} from '../../schemas/requests/report.request.js';
import { reportController } from '../../state.js';
import { validateBody, validateParams, validateQuery } from 'src/middlewares/validateRequest.js';

const reportsRouter: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

reportsRouter.post(
  '/',
  upload.array('images', 5),
  validateBody(CreateReportSchema),
  reportController.create
);

reportsRouter.get('/', validateQuery(ReportQuerySchema), reportController.list);

reportsRouter.get('/:reportId', validateParams(ReportIdParamsSchema), reportController.getById);

reportsRouter.patch(
  '/:reportId',
  validateParams(ReportIdParamsSchema),
  upload.array('images', 5),
  validateBody(UpdateReportSchema),
  reportController.update
);

reportsRouter.delete('/:reportId', validateParams(ReportIdParamsSchema), reportController.cancel);

export default reportsRouter;
