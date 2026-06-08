import LocationService from '../services/LocationService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import {
  LocationFilterSchema,
  CreateLocationDTO,
  UpdateLocationDTO,
  LocationQuery,
} from '../schemas/requests/location.request.js';
import {
  LocationListResponseDTO,
  LocationResponseDTO,
} from '../schemas/responses/location.response.js';

export default class LocationController {
  private locationService: LocationService;

  constructor(params: { locationService: LocationService }) {
    this.locationService = params.locationService;
  }

  list = asyncHandler<LocationListResponseDTO, any, LocationQuery>(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.parsed!.query!, LocationFilterSchema);
    const userId = req.userState!.userId;

    if (!("isHidden" in filter)) filter.isHidden = false

    const result = await this.locationService.getLocations({
      userId,
      filter,
      pagination,
      sort,
    });
    res.status(200).send({ status: 'success', message: 'Locations retrieved successfully', data: result });
  });

  create = asyncHandler<LocationResponseDTO, CreateLocationDTO>(async (req, res) => {
    const dto = req.parsed!.body!;
    const userId = req.userState!.userId;
    const location = await this.locationService.createLocation({ userId, data: dto });
    res.status(201).send({ status: 'success', message: 'Location created successfully', data: { location } });
  });

  getMain = asyncHandler<LocationResponseDTO>(async (req, res) => {
    const userId = req.userState!.userId;
    const location = await this.locationService.getMainLocation({ userId });
    res.status(200).send({ status: 'success', message: 'Main location retrieved successfully', data: { location } });
  });

  update = asyncHandler<LocationResponseDTO, UpdateLocationDTO, any, { locationId: string }>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    const dto = req.parsed!.body!;
    const location = await this.locationService.updateLocation({ userId, locationId, data: dto });
    res.status(200).send({ status: 'success', message: 'Location updated successfully', data: { location } });
  });

  setMain = asyncHandler<LocationResponseDTO, any, any, { locationId: string }>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    const location = await this.locationService.setMainLocation({ userId, locationId });
    res.status(200).send({ status: 'success', message: 'Location has been set as main successfully', data: { location } });
  });

  updateMain = asyncHandler<LocationResponseDTO, UpdateLocationDTO>(async (req, res) => {
    const userId = req.userState!.userId;
    const dto = req.parsed!.body!;
    const location = await this.locationService.updateMainLocation({ userId, data: dto });
    res.status(200).send({ status: 'success', message: 'Main location updated successfully', data: { location } });
  });

  getById = asyncHandler<LocationResponseDTO, any, any, { locationId: string }>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    const location = await this.locationService.getLocationById({ userId, locationId });
    res.status(200).send({ status: 'success', message: 'Location retrieved successfully', data: { location } });
  });
}
