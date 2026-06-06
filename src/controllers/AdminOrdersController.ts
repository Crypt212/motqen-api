import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import { orderRepository } from '../state.js';
import { OrderFilterSchema } from '../schemas/requests/order.request.js';

export default class AdminOrdersController {
  listOrders = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.query, OrderFilterSchema);
    const result = await orderRepository.findMany({ filter, pagination, sort });
    new SuccessResponse('Orders retrieved successfully', result, 200).send(res);
  });

  getOrderById = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId as string;
    const order = await orderRepository.find({ filter: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    new SuccessResponse('Order retrieved successfully', { order }, 200).send(res);
  });
}
