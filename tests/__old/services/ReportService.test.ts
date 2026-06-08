import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportService from '../../src/services/ReportService.js';
import { $Enums } from '../../src/generated/prisma/client.js';

const ReportStatus = $Enums.ReportStatus;
const ReportTargetType = $Enums.ReportTargetType;
const ProblemCategory = $Enums.ProblemCategory;
const ProblemType = $Enums.ProblemType;
import AppError from '../../src/errors/AppError.js';
import IReportRepository from '../../src/repositories/interfaces/ReportRepository.js';
import uploadToCloudinary from '../../src/providers/cloudinaryProvider.js';

vi.mock('../../src/providers/cloudinaryProvider.js', () => ({
  default: vi.fn(),
}));

describe('ReportService', () => {
  let service: ReportService;
  let mockRepository: vi.Mocked<IReportRepository>;

  const mockReport = {
    id: 'report-1',
    reporterId: 'user-1',
    targetType: ReportTargetType.ORDER,
    targetId: 'order-1',
    contextOrderId: null,
    problemCategory: ProblemCategory.ORDER_ISSUE,
    problemType: ProblemType.UNFINISHED_WORK,
    description: 'Valid description text here',
    status: ReportStatus.PENDING,
    resolvedBy: null,
    retainUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      isPendingOrUnderReview: vi.fn(),
      countRecentReports: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      updateStatusById: vi.fn(),
    } as unknown as vi.Mocked<IReportRepository>;

    service = new ReportService({ reportRepository: mockRepository });
  });

  describe('createReport', () => {
    const validParams = {
      report: {
        reporterId: 'worker-1',
        targetType: ReportTargetType.ORDER,
        targetId: 'order-1',
        problemCategory: ProblemCategory.ORDER_ISSUE,
        problemType: ProblemType.UNFINISHED_WORK,
        description: 'Testing create report',
      },
      requesterRole: 'WORKER',
    };

    it('rejects CLIENT_PROFILE target for non-WORKER', async () => {
      await expect(
        service.createReport({
          report: {
            ...validParams.report,
            targetType: ReportTargetType.CLIENT_PROFILE,
          },
          requesterRole: 'CLIENT',
        })
      ).rejects.toThrow(new AppError('Only workers can report client profiles', 403));
    });

    it('rejects >5 files', async () => {
      const files = new Array(6).fill({} as Express.Multer.File);
      await expect(
        service.createReport({
          ...validParams,
          files,
        })
      ).rejects.toThrow(new AppError('Maximum of 5 images allowed per report', 400));
    });

    it('calls upload when files present', async () => {
      mockRepository.isPendingOrUnderReview.mockResolvedValue(false);
      mockRepository.countRecentReports.mockResolvedValue(0);
      mockRepository.create.mockResolvedValue({ ...mockReport, images: ['url1'] });

      const mockedUpload = vi.mocked(uploadToCloudinary);
      mockedUpload.mockResolvedValue({ url: 'url1', publicId: 'pid1' });

      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      await service.createReport({
        ...validParams,
        files: [file],
      });

      expect(mockedUpload).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        report: expect.objectContaining({
          imageUrls: ['url1'],
        }),
      });
    });

    it('no upload when no files', async () => {
      mockRepository.isPendingOrUnderReview.mockResolvedValue(false);
      mockRepository.countRecentReports.mockResolvedValue(0);
      mockRepository.create.mockResolvedValue(mockReport);

      const mockedUpload = vi.mocked(uploadToCloudinary);

      await service.createReport(validParams);

      expect(mockedUpload).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith({
        report: expect.objectContaining({
          imageUrls: undefined,
        }),
      });
    });
  });

  describe('updateReport', () => {
    it('throws 404 not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(
        service.updateReport({
          reportId: '123',
          requesterId: 'user-1',
          requesterRole: 'WORKER',
          report: { description: 'updated' },
        })
      ).rejects.toThrow(new AppError('Report not found', 404));
    });

    it('throws 403 not owner', async () => {
      mockRepository.findById.mockResolvedValue({ ...mockReport, reporterId: 'other-user' });
      await expect(
        service.updateReport({
          reportId: '123',
          requesterId: 'user-1',
          requesterRole: 'WORKER',
          report: { description: 'updated' },
        })
      ).rejects.toThrow(new AppError('Forbidden', 403));
    });

    it('throws 409 not PENDING', async () => {
      mockRepository.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.UNDER_REVIEW });
      await expect(
        service.updateReport({
          reportId: '123',
          requesterId: 'user-1',
          requesterRole: 'WORKER',
          report: { description: 'updated' },
        })
      ).rejects.toThrow(new AppError('Only PENDING reports can be edited', 409));
    });

    it('calls update with replaced URLs', async () => {
      mockRepository.findById.mockResolvedValue(mockReport);
      mockRepository.updateById.mockResolvedValue({ ...mockReport, description: 'updated', images: ['new-url'] });

      const mockedUpload = vi.mocked(uploadToCloudinary);
      mockedUpload.mockResolvedValue({ url: 'new-url', publicId: 'pid-new' });

      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      await service.updateReport({
        reportId: 'report-1',
        requesterId: 'user-1',
        requesterRole: 'WORKER',
        report: { description: 'updated' },
        files: [file],
      });

      expect(mockRepository.updateById).toHaveBeenCalledWith({
        id: 'report-1',
        report: { description: 'updated', imageUrls: ['new-url'] },
      });
    });
  });

  describe('cancelReport', () => {
    it('throws 409 if UNDER_REVIEW', async () => {
      mockRepository.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.UNDER_REVIEW });
      await expect(
        service.cancelReport({
          reportId: 'report-1',
          requesterId: 'user-1',
          requesterRole: 'WORKER',
        })
      ).rejects.toThrow(new AppError('Report cannot be cancelled in its current status', 409));
    });

    it('calls updateStatus with CANCELLED', async () => {
      mockRepository.findById.mockResolvedValue(mockReport);
      mockRepository.updateStatusById.mockResolvedValue({ ...mockReport, status: ReportStatus.CANCELLED });

      await service.cancelReport({
        reportId: 'report-1',
        requesterId: 'user-1',
        requesterRole: 'WORKER',
      });

      expect(mockRepository.updateStatusById).toHaveBeenCalledWith({
        id: 'report-1',
        status: { status: ReportStatus.CANCELLED },
      });
    });
  });

  describe('updateReportStatus', () => {
    it('throws 400 invalid transition PENDING->RESOLVED', async () => {
      mockRepository.findById.mockResolvedValue(mockReport); // status is PENDING
      await expect(
        service.updateReportStatus({
          reportId: 'report-1',
          status: ReportStatus.RESOLVED,
          resolvedBy: 'admin-1',
        })
      ).rejects.toThrow(new AppError('Cannot transition report from PENDING to RESOLVED', 400));
    });

    it('sets resolvedBy on RESOLVED', async () => {
      mockRepository.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.UNDER_REVIEW });
      mockRepository.updateStatusById.mockResolvedValue({ ...mockReport, status: ReportStatus.RESOLVED, resolvedBy: 'admin-1' });

      await service.updateReportStatus({
        reportId: 'report-1',
        status: ReportStatus.RESOLVED,
        resolvedBy: 'admin-1',
      });

      expect(mockRepository.updateStatusById).toHaveBeenCalledWith({
        id: 'report-1',
        status: { status: ReportStatus.RESOLVED, resolvedBy: 'admin-1' },
      });
    });

    it('no resolvedBy on UNDER_REVIEW', async () => {
      mockRepository.findById.mockResolvedValue({ ...mockReport, status: ReportStatus.PENDING });
      mockRepository.updateStatusById.mockResolvedValue({ ...mockReport, status: ReportStatus.UNDER_REVIEW });

      await service.updateReportStatus({
        reportId: 'report-1',
        status: ReportStatus.UNDER_REVIEW,
        resolvedBy: 'admin-1',
      });

      expect(mockRepository.updateStatusById).toHaveBeenCalledWith({
        id: 'report-1',
        status: { status: ReportStatus.UNDER_REVIEW, resolvedBy: undefined },
      });
    });
  });
});
