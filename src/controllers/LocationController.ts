import LocationService from '../services/LocationService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import { parseQueryParams } from '../schemas/common.js';
import { LocationFilterSchema } from '../schemas/location.js';

export default class LocationController {
  private locationService: LocationService;

  constructor(params: { locationService: LocationService }) {
    this.locationService = params.locationService;
  }

  list = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.query, LocationFilterSchema);
    const userId = req.userState!.userId;
    const result = await this.locationService.getLocations({
      userId,
      filter,
      pagination,
      sort,
    });
    new SuccessResponse('Locations retrieved successfully', result, 200).send(res);
  });

  create = asyncHandler(async (req, res) => {
    const dto = req.body;
    const userId = req.userState!.userId;
    const location = await this.locationService.createLocation({ userId, data: dto });
    new SuccessResponse('Location created successfully', { location }, 201).send(res);
  });

  getMain = asyncHandler(async (req, res) => {
    const userId = req.userState!.userId;
    const location = await this.locationService.getMainLocation({ userId });
    new SuccessResponse('Main location retrieved successfully', { location }, 200).send(res);
  });

  update = asyncHandler(async (req, res) => {
    const locationId = req.params.locationId as string;
    const userId = req.userState!.userId;
    const dto = req.body;
    const location = await this.locationService.updateLocation({ userId, locationId, data: dto });
    new SuccessResponse('Location updated successfully', { location }, 200).send(res);
  });

  updateMain = asyncHandler(async (req, res) => {
    const userId = req.userState!.userId;
    const dto = req.body;
    const location = await this.locationService.updateMainLocation({ userId, data: dto });
    new SuccessResponse('Main location updated successfully', { location }, 200).send(res);
  });

  getById = asyncHandler(async (req, res) => {
    const locationId = req.params.locationId as string;
    const userId = req.userState!.userId;
    const location = await this.locationService.getLocationById({ userId, locationId });
    new SuccessResponse('Location retrieved successfully', { location }, 200).send(res);
  });
}
