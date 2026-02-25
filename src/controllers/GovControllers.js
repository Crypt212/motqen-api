/**
 * @fileoverview Government Controllers
 * @module controllers/GovernmentControllers
 */

import { governmentRepository } from '../state.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Get all governments with optional filtering
 */
export const getAllGovernments = asyncHandler(async (req, res) => {
    const governments = await governmentRepository.findMany({}, { orderBy: { name: 'asc' } })
    new SuccessResponse('Governments retrieved successfully', { governments }).send(res);
});

/**
 * Get single government by ID
 */
export const getGovernmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const government = await governmentRepository.findOne({ id });
    if (!government) {
        throw new AppError('Government not found', 404);
    }

    new SuccessResponse('Government retrieved', { government }).send(res);
});

/**
 * Get all cities under a specific government
 */
export const getCitiesByGovernment = asyncHandler(async (req, res) => {
    const { governmentId } = req.params;

    const government = await governmentRepository.findOne({ id: governmentId });
    if (!government) {
        throw new AppError('Government not found', 404);
    }

    const cities = await governmentRepository.findCities({ governmentId }, { orderBy: { name: 'asc' } });

    new SuccessResponse('Cities retrieved', { cities }).send(res);
});
