import { asyncHandler } from '../types/asyncHandler.js';
import OrderService from '../services/OrderService.js';
import { parseQuery } from '../schemas/common.js';
import {
  CreateOrderRequestDTO,
  CreateOrderQueryDTO,
  CreateOrderParamsDTO,
  GetOrdersRequestDTO,
  GetOrdersQueryDTO,
  GetOrdersParamsDTO,
  GetOrderByIdRequestDTO,
  GetOrderByIdQueryDTO,
  GetOrderByIdParamsDTO,
  CancelOrderRequestDTO,
  CancelOrderQueryDTO,
  CancelOrderParamsDTO,
  GetOrderLocationRequestDTO,
  GetOrderLocationQueryDTO,
  GetOrderLocationParamsDTO,
  StartWorkRequestDTO,
  StartWorkQueryDTO,
  StartWorkParamsDTO,
  FinishWorkRequestDTO,
  FinishWorkQueryDTO,
  FinishWorkParamsDTO,
  RateOrderRequestDTO,
  RateOrderQueryDTO,
  RateOrderParamsDTO
} from '../schemas/requests/order.request.js';
import {
  CreateOrderResponseDTO,
  GetOrdersResponseDTO,
  GetOrderByIdResponseDTO,
  CancelOrderResponseDTO,
  GetOrderLocationResponseDTO,
  StartWorkResponseDTO,
  FinishWorkResponseDTO,
  RateOrderResponseDTO
} from '../schemas/responses/order.response.js';
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

  create = asyncHandler<CreateOrderResponseDTO, CreateOrderRequestDTO, CreateOrderQueryDTO, CreateOrderParamsDTO>(async (req, res) => {
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

  list = asyncHandler<GetOrdersResponseDTO, GetOrdersRequestDTO, GetOrdersQueryDTO, GetOrdersParamsDTO>(async (req, res) => {
    const { filter, pagination, sortBy, sortOrder } = parseQuery(req.parsed!.query!);

    const userState = req.userState!;
    const adminState = req.adminState;
    const result = await this.orderService.getOrders({
      userId: userState.userId,
      isAdmin: adminState !== undefined,
      role: userState.role,
      clientUserId: filter.clientUserId as IDType,
      workerUserId: filter.workerUserId as IDType,
      filter,
      pagination,
      sort: sortBy.map((field, index) => ({ sortBy: field as any, sortOrder: sortOrder[index] })),
    });
    res.status(200).send({ status: 'success', message: 'Orders retrieved successfully', data: result });
  });

  getById = asyncHandler<GetOrderByIdResponseDTO, GetOrderByIdRequestDTO, GetOrderByIdQueryDTO, GetOrderByIdParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.getOrderById({
      orderId: orderId as string,
      userId: userState.userId,
      role: userState.role,
    });
    res.status(200).send({ status: 'success', message: 'Order retrieved successfully', data: { order } });
  });

  getLocation = asyncHandler<GetOrderLocationResponseDTO, GetOrderLocationRequestDTO, GetOrderLocationQueryDTO, GetOrderLocationParamsDTO>(async (req, res) => {
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

  cancel = asyncHandler<CancelOrderResponseDTO, CancelOrderRequestDTO, CancelOrderQueryDTO, CancelOrderParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    await this.orderService.cancelOrder({
      orderId: orderId as string,
      clientUserId: userState.userId,
    });
    res.status(200).send({ status: 'success', message: 'Order cancelled successfully' });
  });


  startWork = asyncHandler<StartWorkResponseDTO, StartWorkRequestDTO, StartWorkQueryDTO, StartWorkParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.startWork({
      orderId: orderId as string,
      workerUserId: userState.userId,
    });
    res.status(200).send({ status: 'success', message: 'Work started successfully', data: { order } });
  });

  finishWork = asyncHandler<FinishWorkResponseDTO, FinishWorkRequestDTO, FinishWorkQueryDTO, FinishWorkParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userState = req.userState!;
    const order = await this.orderService.finishWork({
      orderId: orderId,
      workerUserId: userState.userId,
    });
    res.status(200).send({ status: 'success', message: 'Work finished successfully', data: { order } });
  });

  rate = asyncHandler<RateOrderResponseDTO, RateOrderRequestDTO, RateOrderQueryDTO, RateOrderParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const { rate, comment } = req.parsed!.body!;
    const userState = req.userState!;
    await this.orderService.rateOrder({
      orderId: orderId,
      clientUserId: userState.userId,
      rate,
      comment,
    });
    res.status(200).send({ status: 'success', message: 'Order rated successfully' });
  });
}
