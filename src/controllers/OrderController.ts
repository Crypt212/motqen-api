import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import OrderService from '../services/OrderService.js';
import { FilterFromDescriptor, parseQueryParams } from '../schemas/common.js';
import { OrderFilterSchema } from '../schemas/requests/order.request.js';
import { FieldTypeDefinition, SortOptions } from 'src/types/query.js';
import { Order } from 'src/domain/order.entity.js';

export default class OrderController {
  private orderService: OrderService;

  constructor(deps: { orderService: OrderService }) {
    this.orderService = deps.orderService;
  }

  create = asyncHandler(async (req, res) => {
    const {
      title,
      description,
      subSpecializationId,
      workerUserId,
      locationId,
      startDate,
      isUrgent,
    } = req.body;
    const images = (req.files as Express.Multer.File[]) || [];
    const clientUserId = req.userState.userId;

    if (!req.userState.client) {
      throw new Error('User must have a client profile to create orders');
    }

    const order = await this.orderService.createOrder({
      data: {
        title,
        description,
        subSpecializationId,
        locationId,
        startDate,
        isUrgent: isUrgent === 'true',
        clientUserId,
        workerUserId,
      },
      images,
    });
    new SuccessResponse('Order created successfully', { order }, 201).send(res);
  });

  list = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(
      req.query as Record<string, unknown>,
      OrderFilterSchema
    );
    const userState = req.userState!;
    const result = await this.orderService.getOrders({
      userId: userState.userId,
      role: userState.role,
      clientUserId: userState.userId,
      workerUserId: userState.userId,
      filter: filter as FilterFromDescriptor<Record<string, FieldTypeDefinition>>,
      pagination,
      sort: sort as SortOptions<Order>,
    });
    new SuccessResponse('Orders retrieved successfully', result, 200).send(res);
  });

  getById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userState = req.userState!;
    const order = await this.orderService.getOrderById({
      orderId: orderId as string,
      clientUserId: userState.userId,
      workerUserId: userState.userId,
    });
    new SuccessResponse('Order retrieved successfully', { order }, 200).send(res);
  });

  cancel = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userState = req.userState!;
    await this.orderService.cancelOrder({
      orderId: orderId as string,
      clientUserId: userState.userId,
    });
    new SuccessResponse('Order cancelled successfully', null, 200).send(res);
  });

  specifyRange = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { startTime, endTime } = req.body;
    const userState = req.userState!;
    const order = await this.orderService.specifyTimeRange({
      orderId: orderId as string,
      workerUserId: userState.userId,
      startTime,
      endTime,
    });
    new SuccessResponse('Time range specified successfully', { order }, 200).send(res);
  });

  startWork = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userState = req.userState!;
    const order = await this.orderService.startWork({
      orderId: orderId as string,
      workerUserId: userState.userId,
    });
    new SuccessResponse('Work started successfully', { order }, 200).send(res);
  });

  finishWork = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userState = req.userState!;
    const order = await this.orderService.finishWork({
      orderId: orderId as string,
      workerUserId: userState.userId,
    });
    new SuccessResponse('Work finished successfully', { order }, 200).send(res);
  });

  rate = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { rate, comment } = req.body;
    const userState = req.userState!;
    await this.orderService.rateOrder({
      orderId: orderId as string,
      clientUserId: userState.userId,
      rate,
      comment,
    });
    new SuccessResponse('Order rated successfully', 200).send(res);
  });
}
