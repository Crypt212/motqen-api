/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import { matchedData } from 'express-validator';
import SuccessResponse from '../responses/successResponse.js';
import GovernmentService from '../services/GovernmentService.js';
import { asyncHandler } from '../types/asyncHandler.js';

export default class GovernmentController {
  private governmentService: GovernmentService;

  constructor(params: { governmentService: GovernmentService }) {
    this.governmentService = params.governmentService;
  }

  getGovernments = asyncHandler(async (req, res) => {
    const { filter, sortBy, sortOrder, page, limit } = matchedData(req, {
      includeOptionals: true,
    });

    const result = await this.governmentService.getGovernments({
      filter,
      pagination: { page, limit },
      sort: { sortBy, sortOrder },
    });

    new SuccessResponse('Governments retrieved successfully', result, 200).send(
      res
    );
  });

  getGovernmentById = asyncHandler(async (req, res) => {
    const { governmentId: id } = matchedData(req, { includeOptionals: true });

    const government = await this.governmentService.getGovernmentById({ id });

    new SuccessResponse(
      'Government retrieved successfully',
      { government },
      200
    ).send(res);
  });

  createGovernment = asyncHandler(async (req, res) => {
    const { name, nameAr, long, lat } = matchedData(req, {
      includeOptionals: true,
    });

    const government = await this.governmentService.createGovernment({
      data: { name, nameAr, long, lat },
    });

    new SuccessResponse(
      'Government created successfully',
      { government },
      201
    ).send(res);
  });

  updateGovernment = asyncHandler(async (req, res) => {
    const { governmentId: id, name, nameAr, long, lat } = matchedData(req, {
      includeOptionals: true,
    });

    const government = await this.governmentService.updateGovernment({
      id,
      data: { name, nameAr, long, lat },
    });

    new SuccessResponse(
      'Government updated successfully',
      { government },
      200
    ).send(res);
  });

  deleteGovernment = asyncHandler(async (req, res) => {
    const { governmentId: id } = matchedData(req, { includeOptionals: true });

    await this.governmentService.deleteGovernment({ id });

    new SuccessResponse('Government deleted successfully', null, 200).send(res);
  });

  getCitiesByGovernment = asyncHandler(async (req, res) => {
    const { filter, sortBy, sortOrder, page, limit } = matchedData(req, {
      includeOptionals: true,
    });
    const governmentId = req.params.governmentId as string;

    const result = await this.governmentService.getCitiesByGovernment({
      governmentId,
      filter,
      pagination: { limit, page },
      sort: { sortBy, sortOrder },
    });

    new SuccessResponse('Cities retrieved', result).send(res);
  });
}
