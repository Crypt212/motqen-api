import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import { adminIssuesService } from '../state.js';
import { AdminRole } from '../domain/admin.entity.js';

export default class AdminIssuesController {
  getUnifiedQueue = asyncHandler(async (req, res): Promise<void> => {
    const filter = {
      department: req.query.department as AdminRole,
      status: req.query.status as string,
      isAssigned: req.query.isAssigned !== undefined ? req.query.isAssigned === 'true' : undefined,
      adminId: req.query.adminId as string,
    };
    const issues = await adminIssuesService.getUnifiedQueue(filter);
    new SuccessResponse('Unified queue fetched successfully', { data: issues }, 200).send(res);
  });

  claimIssue = asyncHandler(async (req, res): Promise<void> => {
    const { targetType, targetId } = req.body;
    await adminIssuesService.claimIssue({
      targetType,
      targetId,
      adminId: req.adminState.adminId,
      adminRole: req.adminState.role as AdminRole,
    });
    new SuccessResponse('Issue claimed successfully', null, 200).send(res);
  });

  transferIssue = asyncHandler(async (req, res): Promise<void> => {
    const { targetType, targetId, newDepartment, newAdminId, note } = req.body;
    await adminIssuesService.transferIssue({
      targetType,
      targetId,
      adminId: req.adminState.adminId,
      adminRole: req.adminState.role as AdminRole,
      newDepartment,
      newAdminId,
      note,
    });
    new SuccessResponse('Issue transferred successfully', null, 200).send(res);
  });

  returnIssue = asyncHandler(async (req, res): Promise<void> => {
    const { targetType, targetId, note } = req.body;
    await adminIssuesService.returnIssue({
      targetType,
      targetId,
      adminId: req.adminState.adminId,
      adminRole: req.adminState.role as AdminRole,
      note,
    });
    new SuccessResponse('Issue returned to queue successfully', null, 200).send(res);
  });

  addNote = asyncHandler(async (req, res): Promise<void> => {
    const { targetType, targetId } = req.params as { targetType: string; targetId: string };
    const { content } = req.body;
    const note = await adminIssuesService.addNote({
      targetType: targetType as 'REPORT' | 'DISPUTE' | 'VERIFICATION',
      targetId,
      adminId: req.adminState.adminId,
      content,
    });
    new SuccessResponse('Note added successfully', note, 201).send(res);
  });

  getNotes = asyncHandler(async (req, res): Promise<void> => {
    const { targetType, targetId } = req.params as { targetType: string; targetId: string };
    const notes = await adminIssuesService.getNotes(targetType, targetId);
    new SuccessResponse('Notes fetched successfully', { data: notes }, 200).send(res);
  });

  getHistory = asyncHandler(async (req, res): Promise<void> => {
    const { targetType, targetId } = req.params as { targetType: string; targetId: string };
    const history = await adminIssuesService.getHistory(targetType, targetId);
    new SuccessResponse('History fetched successfully', { data: history }, 200).send(res);
  });
}
