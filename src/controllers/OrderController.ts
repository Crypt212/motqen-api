import { asyncHandler } from '../types/asyncHandler.js';
import OrderService from '../services/OrderService.js';
import { FilterFromDescriptor, parseQueryParams } from '../schemas/common.js';
import { OrderFilterSchema, CreateOrderDTO, OrderQuery } from '../schemas/requests/order.request.js';
import { OrderResponseDTO, OrderListResponseDTO } from '../schemas/responses/order.response.js';
import { LocationResponseDTO } from '../schemas/responses/location.response.js';
import { FieldTypeDefinition, SortOptions } from 'src/types/query.js';
import { Order } from 'src/domain/order.entity.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';
import LocationService from 'src/services/LocationService.js';
import AppError from 'src/errors/AppError.js';

export default class OrderController {
  private orderService: OrderService;
  private locationService: LocationService;

  constructor(deps: { orderService: OrderService, locationService: LocationService }) {
    this.orderService = deps.orderService;
    this.locationService = deps.locationService;
  }

  create = asyncHandler<OrderResponseDTO, CreateOrderDTO>(async (req, res) => {
    const parsedBody = req.parsed!.body!;
    const images = (req.files as Express.Multer.File[]) || [];
    const clientUserId = req.userState.userId;

    if (req.userState.role !== 'CLIENT') {
      throw new AppError('User must be a client to create an order', 403);
    }

    const order = await this.orderService.createOrder({
      data: {
        orderData: parsedBody.orderData,
        clientUserId,
      },
      images,
    });

    res.status(201).send({ status: 'success', message: 'Order created successfully', data: { order } });
  });

  list = asyncHandler<OrderListResponseDTO, any, OrderQuery>(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(
      req.parsed!.query!,
      OrderFilterSchema
    );

    const userState = req.userState!;
    const adminState = req.adminState;
    const result = await this.orderService.getOrders({
      userId: userState.userId,
      isAdmin: adminState !== undefined,
      role: userState.role,
      clientUserId: filter.clientUserId as IDType,
      workerUserId: filter.workerUserId as IDType,
      filter: filter as FilterFromDescriptor<Record<string, FieldTypeDefinition>>,
      pagination,
      sort: sort as SortOptions<Order>,
    });
    res.status(200).send({ status: 'success', message: 'Orders retrieved successfully', data: result });
  });

  getById = asyncHandler<OrderResponseDTO, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.getOrderById({
      orderId: orderId as string,
      userId: userState.userId,
      role: userState.role,
    });
    res.status(200).send({ status: 'success', message: 'Order retrieved successfully', data: { order } });
  });

  getLocation = asyncHandler<LocationResponseDTO, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.getOrderById({
      orderId: orderId as string,
      userId: userState.userId,
      role: userState.role,
    });

    const location = await this.locationService.getLocationById({
      userId: order.clientUserId,
      locationId: order.locationId
    });
    res.status(200).send({ status: 'success', message: 'Location of order retrieved successfully', data: { location } });
  });

  cancel = asyncHandler<any, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    await this.orderService.cancelOrder({
      orderId: orderId as string,
      clientUserId: userState.userId,
    });
    res.status(200).send({ status: 'success', message: 'Order cancelled successfully', data: null });
  });


  startWork = asyncHandler<OrderResponseDTO, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.startWork({
      orderId: orderId as string,
      workerUserId: userState.userId,
    });
    res.status(200).send({ status: 'success', message: 'Work started successfully', data: { order } });
  });

  finishWork = asyncHandler<OrderResponseDTO, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.finishWork({
      orderId: orderId,
      workerUserId: userState.userId,
    });
    res.status(200).send({ status: 'success', message: 'Work finished successfully', data: { order } });
  });

  rate = asyncHandler<any, { rate: number, comment?: string }, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const { rate, comment } = req.parsed!.body!;
    const userState = req.userState!;
    await this.orderService.rateOrder({
      orderId: orderId,
      clientUserId: userState.userId,
      rate,
      comment,
    });
    res.status(200).send({ status: 'success', message: 'Order rated successfully', data: {} });
  });
}
