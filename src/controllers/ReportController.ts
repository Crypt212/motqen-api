import ReportService from '../services/ReportService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQuery } from '../schemas/common.js';
import {
  CreateReportRequestDTO,
  CreateReportQueryDTO,
  CreateReportParamsDTO,
  GetReportsRequestDTO,
  GetReportsQueryDTO,
  GetReportsParamsDTO,
  GetReportByIdRequestDTO,
  GetReportByIdQueryDTO,
  GetReportByIdParamsDTO,
  UpdateReportRequestDTO,
  UpdateReportQueryDTO,
  UpdateReportParamsDTO,
  CancelReportRequestDTO,
  CancelReportQueryDTO,
  CancelReportParamsDTO,
  UpdateReportStatusRequestDTO,
  UpdateReportStatusQueryDTO,
  UpdateReportStatusParamsDTO
} from '../schemas/requests/report.request.js';
import {
  CreateReportResponseDTO,
  GetReportsResponseDTO,
  GetReportByIdResponseDTO,
  UpdateReportResponseDTO,
  CancelReportResponseDTO,
  UpdateReportStatusResponseDTO
} from '../schemas/responses/report.response.js';

export default class ReportController {
  private reportService: ReportService;

  constructor(dependencies: { reportService: ReportService }) {
    this.reportService = dependencies.reportService;
  }

  create = asyncHandler<CreateReportResponseDTO, CreateReportRequestDTO, CreateReportQueryDTO, CreateReportParamsDTO>(async (req, res) => {
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

  list = asyncHandler<GetReportsResponseDTO, GetReportsRequestDTO, GetReportsQueryDTO, GetReportsParamsDTO>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const adminState = req.adminState;
    const { filter, pagination, sortBy, sortOrder } = parseQuery(req.parsed!.query!);

    const result = await this.reportService.getReports({
      filter,
      requesterId,
      isAdmin: adminState !== undefined,
      pagination,
      sort: sortBy.map((field, index) => ({ sortBy: field as any, sortOrder: sortOrder[index] })),
    });

    res.status(200).send({ status: 'success', message: 'Reports retrieved successfully', data: result });
  });

  getById = asyncHandler<GetReportByIdResponseDTO, GetReportByIdRequestDTO, GetReportByIdQueryDTO, GetReportByIdParamsDTO>(async (req, res) => {
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

  update = asyncHandler<UpdateReportResponseDTO, UpdateReportRequestDTO, UpdateReportQueryDTO, UpdateReportParamsDTO>(async (req, res) => {
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

  cancel = asyncHandler<CancelReportResponseDTO, CancelReportRequestDTO, CancelReportQueryDTO, CancelReportParamsDTO>(async (req, res) => {
    const { userId: requesterId } = req.userState!;
    const adminState = req.adminState;
    const { reportId } = req.parsed!.params!;

    await this.reportService.cancelReport({
      reportId,
      requesterId,
      isAdmin: adminState !== undefined,
    });

    res.status(200).send({ status: 'success', message: 'Report cancelled successfully' });
  });

  updateStatus = asyncHandler<UpdateReportStatusResponseDTO, UpdateReportStatusRequestDTO, UpdateReportStatusQueryDTO, UpdateReportStatusParamsDTO>(async (req, res) => {
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
