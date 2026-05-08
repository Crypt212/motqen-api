import ReportService from '../services/ReportService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import { ReportFilterSchema } from '../schemas/requests/report.request.js';
import SuccessResponse from 'src/responses/successResponse.js';

export default class ReportController {
  private reportService: ReportService;

  constructor(dependencies: { reportService: ReportService }) {
    this.reportService = dependencies.reportService;
  }

  create = asyncHandler(async (req, res) => {
    const { userId: requesterId, role: requesterRole } = req.userState;
    const files = req.files as Express.Multer.File[] | undefined;

    const report = await this.reportService.createReport({
      report: {
        ...req.body,
        reporterId: requesterId,
      },
      requesterRole,
      files,
    });

    new SuccessResponse('Report created successfully', { report }).send(res);
  });

  list = asyncHandler(async (req, res) => {
    const { userId: requesterId, role: requesterRole } = req.userState;
    const { filter, pagination, sort } = parseQueryParams(req.query, ReportFilterSchema);

    const result = await this.reportService.getReports({
      filter,
      requesterId,
      requesterRole,
      pagination,
      sort,
    });

    new SuccessResponse('Reports retrieved successfully', result).send(res);
  });

  getById = asyncHandler(async (req, res) => {
    const { userId: requesterId, role: requesterRole } = req.userState;
    const reportId = req.params.reporterId as string;

    const report = await this.reportService.getReportById({
      reportId,
      requesterId,
      requesterRole,
    });

    new SuccessResponse('Report retrieved successfully', { report }).send(res);
  });

  update = asyncHandler(async (req, res) => {
    const { userId: requesterId, role: requesterRole } = req.userState;
    const reportId = req.params.reportId as string;
    const files = req.files as Express.Multer.File[] | undefined;

    const report = await this.reportService.updateReport({
      reportId,
      requesterId,
      requesterRole,
      report: req.body,
      files,
    });

    new SuccessResponse('Report updated successfully', { report }).send(res);
  });

  cancel = asyncHandler(async (req, res) => {
    const { userId: requesterId, role: requesterRole } = req.userState;
    const reportId = req.params.reporterId as string;

    await this.reportService.cancelReport({
      reportId,
      requesterId,
      requesterRole,
    });

    new SuccessResponse('Report cancelled successfully', null).send(res);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { userId: requesterId } = req.userState;
    const reportId = req.params.reportId as string;

    const report = await this.reportService.updateReportStatus({
      reportId,
      status: req.body.status,
      resolvedBy: requesterId,
    });

    new SuccessResponse('Report status updated successfully', { report }).send(res);
  });
}
