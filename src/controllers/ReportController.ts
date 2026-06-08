import ReportService from '../services/ReportService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import { CreateReportDTO, ReportFilterSchema, ReportQuery, UpdateReportDTO, UpdateReportStatusDTO } from '../schemas/requests/report.request.js';
import { ReportResponseDTO, PaginatedReportsResponseDTO } from '../schemas/responses/report.response.js';

export default class ReportController {
  private reportService: ReportService;

  constructor(dependencies: { reportService: ReportService }) {
    this.reportService = dependencies.reportService;
  }

  create = asyncHandler<ReportResponseDTO, CreateReportDTO>(async (req, res) => {
    const { userId: requesterId, role } = req.userState!;

    const requesterType = role;
    const files = req.files as Express.Multer.File[] | undefined;
    const bodyData = req.parsed!.body!;

    const report = await this.reportService.createReport({
      report: {
        ...bodyData,
        reporterId: requesterId,
      },
      requesterType,
      files,
    });

    res.status(201).send({ status: 'success', message: 'Report created successfully', data: { report } });
  });

  list = asyncHandler<PaginatedReportsResponseDTO, any, ReportQuery>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const adminState = req.adminState;
    const { filter, pagination, sort } = parseQueryParams(req.parsed!.query!, ReportFilterSchema);

    const result = await this.reportService.getReports({
      filter,
      requesterId,
      isAdmin: adminState !== undefined,
      pagination,
      sort,
    });

    res.status(200).send({ status: 'success', message: 'Reports retrieved successfully', data: result });
  });

  getById = asyncHandler<ReportResponseDTO, any, any, { reportId: string }>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const adminState = req.adminState;
    const { reportId } = req.parsed!.params!;

    const report = await this.reportService.getReportById({
      reportId,
      requesterId,
      isAdmin: adminState !== undefined,
    });

    res.status(200).send({ status: 'success', message: 'Report retrieved successfully', data: { report } });
  });

  update = asyncHandler<ReportResponseDTO, UpdateReportDTO, any, { reportId: string }>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const adminState = req.adminState;
    const { reportId } = req.parsed!.params!;
    const bodyData = req.parsed!.body!;
    const files = req.files as Express.Multer.File[] | undefined;

    const report = await this.reportService.updateReport({
      reportId,
      requesterId,
      isAdmin: adminState !== undefined,
      report: bodyData,
      files,
    });

    res.status(200).send({ status: 'success', message: 'Report updated successfully', data: { report } });
  });

  cancel = asyncHandler<any, any, any, { reportId: string }>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const adminState = req.adminState;
    const { reportId } = req.parsed!.params!;

    await this.reportService.cancelReport({
      reportId,
      requesterId,
      isAdmin: adminState !== undefined,
    });

    res.status(200).send({ status: 'success', message: 'Report cancelled successfully', data: null });
  });

  updateStatus = asyncHandler<ReportResponseDTO, UpdateReportStatusDTO, any, { reportId: string }>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const { reportId } = req.parsed!.params!;
    const { status } = req.parsed!.body!;

    const report = await this.reportService.updateReportStatus({
      reportId,
      status,
      resolvedBy: requesterId,
    });

    res.status(200).send({ status: 'success', message: 'Report status updated successfully', data: { report } });
  });
}
