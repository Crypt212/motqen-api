import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import OrderService from '../services/OrderService.js';
import { FilterFromDescriptor, parseQueryParams } from '../schemas/common.js';
import { OrderFilterSchema } from '../schemas/order.js';
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
      workerProfileId,
      locationId,
      startDate,
      isUrgent,
    } = req.body;
    const userId = req.userState!.userId;
    const images = (req.files as Express.Multer.File[]) || [];
    const clientProfileId = req.userState!.client?.id;

    if (!clientProfileId) {
      throw new Error('User must have a client profile to create orders');
    }

    const order = await this.orderService.createOrder({
      userId,
      data: {
        title,
        description,
        subSpecializationId,
        locationId,
        startDate,
        isUrgent: isUrgent === 'true',
        clientProfileId,
        workerProfileId,
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
      clientProfileId: userState.client?.id,
      workerProfileId: userState.worker?.id,
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
      clientProfileId: userState.client?.id,
      workerProfileId: userState.worker?.id,
    });
    new SuccessResponse('Order retrieved successfully', { order }, 200).send(res);
  });

  cancel = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userState = req.userState!;
    await this.orderService.cancelOrder({
      orderId: orderId as string,
      clientProfileId: userState.client?.id,
    });
    new SuccessResponse('Order cancelled successfully', null, 200).send(res);
  });

  specifyRange = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { startTime, endTime } = req.body;
    const userState = req.userState!;
    const order = await this.orderService.specifyTimeRange({
      orderId: orderId as string,
      workerProfileId: userState.worker?.id,
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
      workerProfileId: userState.worker?.id,
    });
    new SuccessResponse('Work started successfully', { order }, 200).send(res);
  });

  finishWork = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userState = req.userState!;
    const order = await this.orderService.finishWork({
      orderId: orderId as string,
      workerProfileId: userState.worker?.id,
    });
    new SuccessResponse('Work finished successfully', { order }, 200).send(res);
  });

  rate = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { rate, comment } = req.body;
    const userState = req.userState!;
    await this.orderService.rateOrder({
      orderId: orderId as string,
      clientProfileId: userState.client.id,
      rate,
      comment,
    });
    new SuccessResponse('Order rated successfully', 200).send(res);
  });
}
