import LocationService from '../services/LocationService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQuery } from '../schemas/common.js';
import {
  GetLocationsRequestDTO,
  GetLocationsQueryDTO,
  GetLocationsParamsDTO,
  CreateLocationRequestDTO,
  CreateLocationQueryDTO,
  CreateLocationParamsDTO,
  GetMainLocationRequestDTO,
  GetMainLocationQueryDTO,
  GetMainLocationParamsDTO,
  UpdateMainLocationRequestDTO,
  UpdateMainLocationQueryDTO,
  UpdateMainLocationParamsDTO,
  UpdateLocationRequestDTO,
  UpdateLocationQueryDTO,
  UpdateLocationParamsDTO,
  SetMainLocationRequestDTO,
  SetMainLocationQueryDTO,
  SetMainLocationParamsDTO,
  GetLocationByIdRequestDTO,
  GetLocationByIdQueryDTO,
  GetLocationByIdParamsDTO,
  DeleteLocationRequestDTO,
  DeleteLocationQueryDTO,
  DeleteLocationParamsDTO,
} from '../schemas/requests/location.request.js';
import {
  GetLocationsResponseDTO,
  CreateLocationResponseDTO,
  GetMainLocationResponseDTO,
  UpdateMainLocationResponseDTO,
  UpdateLocationResponseDTO,
  SetMainLocationResponseDTO,
  GetLocationByIdResponseDTO,
  DeleteLocationResponseDTO,
} from '../schemas/responses/location.response.js';

export default class LocationController {
  private locationService: LocationService;

  constructor(params: { locationService: LocationService }) {
    this.locationService = params.locationService;
  }

  list = asyncHandler<GetLocationsResponseDTO, GetLocationsRequestDTO, GetLocationsQueryDTO, GetLocationsParamsDTO>(async (req, res) => {
    const { filter, pagination, sort } = parseQuery(req.parsed!.query!);
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

  create = asyncHandler<CreateLocationResponseDTO, CreateLocationRequestDTO, CreateLocationQueryDTO, CreateLocationParamsDTO>(async (req, res) => {
    const dto = req.parsed!.body!;
    const userId = req.userState!.userId;
    const location = await this.locationService.createLocation({ userId, data: dto });
    res.status(201).send({ status: 'success', message: 'Location created successfully', data: { location } });
  });

  getMain = asyncHandler<GetMainLocationResponseDTO, GetMainLocationRequestDTO, GetMainLocationQueryDTO, GetMainLocationParamsDTO>(async (req, res) => {
    const userId = req.userState!.userId;
    const location = await this.locationService.getMainLocation({ userId });
    res.status(200).send({ status: 'success', message: 'Main location retrieved successfully', data: { location } });
  });

  update = asyncHandler<UpdateLocationResponseDTO, UpdateLocationRequestDTO, UpdateLocationQueryDTO, UpdateLocationParamsDTO>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    const dto = req.parsed!.body!;
    const location = await this.locationService.updateLocation({ userId, locationId, data: dto });
    res.status(200).send({ status: 'success', message: 'Location updated successfully', data: { location } });
  });

  setMain = asyncHandler<SetMainLocationResponseDTO, SetMainLocationRequestDTO, SetMainLocationQueryDTO, SetMainLocationParamsDTO>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    const location = await this.locationService.setMainLocation({ userId, locationId });
    res.status(200).send({ status: 'success', message: 'Location has been set as main successfully', data: { location } });
  });

  updateMain = asyncHandler<UpdateMainLocationResponseDTO, UpdateMainLocationRequestDTO, UpdateMainLocationQueryDTO, UpdateMainLocationParamsDTO>(async (req, res) => {
    const userId = req.userState!.userId;
    const dto = req.parsed!.body!;
    const location = await this.locationService.updateMainLocation({ userId, data: dto });
    res.status(200).send({ status: 'success', message: 'Main location updated successfully', data: { location } });
  });

  getById = asyncHandler<GetLocationByIdResponseDTO, GetLocationByIdRequestDTO, GetLocationByIdQueryDTO, GetLocationByIdParamsDTO>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    const location = await this.locationService.getLocationById({ userId, locationId });
    res.status(200).send({ status: 'success', message: 'Location retrieved successfully', data: { location } });
  });

  delete = asyncHandler<DeleteLocationResponseDTO, DeleteLocationRequestDTO, DeleteLocationQueryDTO, DeleteLocationParamsDTO>(async (req, res) => {
    const locationId = req.parsed!.params!.locationId;
    const userId = req.userState!.userId;
    await this.locationService.deleteLocation({ userId, locationId });
    res.status(200).send({ status: 'success', message: 'Location deleted successfully', data: null });
  });
}
