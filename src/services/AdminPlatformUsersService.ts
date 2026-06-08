import AppError from '../errors/AppError.js';
import {
  userService,
  userRepository,
  workerProfileRepository,
  clientProfileRepository,
  sessionRepository,
  adminAuditLogService,
  locationRepository,
} from '../state.js';
import { AdminUserExtendedFilter, CreatePlatformUserDTO, UpdatePlatformUserDTO } from '../schemas/requests/admin-platform-users.request.js';

/**
 * Service for managing platform users from admin perspective
 * Handles user listing, details, creation, updates, status changes, and activity tracking
 */
export default class AdminPlatformUsersService {
  /**
   * List users with advanced filtering
   */
  async listUsers(params: { filter: AdminUserExtendedFilter }) {
    const { filter } = params;
    const {
      search,
      firstName,
      middleName,
      lastName,
      phoneNumber,
      status,
      isOnline,
      page = 1,
      limit = 20,
    } = filter;

    // Build search criteria
    const searchTerms: Record<string, unknown> = {};
    if (firstName) searchTerms.firstName = firstName;
    if (middleName) searchTerms.middleName = middleName;
    if (lastName) searchTerms.lastName = lastName;
    if (phoneNumber) searchTerms.phoneNumber = phoneNumber;
    if (status) searchTerms.status = status;
    if (isOnline !== undefined) searchTerms.isOnline = isOnline;

    // Use userService to get users
    const result = await userService.findMany({
      filter: searchTerms,
      pagination: { page, limit },
    });

    // Enrich users with profile data
    const enrichedUsers = await Promise.all(
      (result.users || result).map((user: any) => this.enrichUserWithProfileData(user))
    );

    return {
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: result.total || result.length,
        totalPages: result.totalPages || Math.ceil((result.total || result.length) / limit),
        hasNext: result.hasNext ?? false,
        hasPrev: result.hasPrev ?? false,
      },
    };
  }

  /**
   * Get complete user details
   */
  async getUser(params: { userId: string }) {
    const { userId } = params;

    const user = await userService.get({ filter: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Fetch related data
    const [locations, workerProfile, clientProfile, sessions] = await Promise.all([
      locationRepository.findMany({ filter: { userId } }),
      workerProfileRepository.find({ filter: { userId } }),
      clientProfileRepository.find({ filter: { userId } }),
      sessionRepository.findMany({
        filter: { userId, isRevoked: false } as any,
      }),
    ]);

    // Determine user type
    const userType = workerProfile ? 'WORKER' : clientProfile ? 'CLIENT' : null;

    const mainLocation = locations.find((loc: any) => loc.isMain);

    return {
      user,
      userType,
      locations,
      mainLocation: mainLocation || null,
      workerProfile: workerProfile || null,
      clientProfile: clientProfile || null,
      activeSessions: sessions.map((session: any) => ({
        id: session.id,
        deviceId: session.deviceId || null,
        userAgent: session.userAgent || null,
        ipAddress: session.ipAddress || null,
        lastUsedAt: session.lastUsedAt || null,
        expiresAt: session.expiresAt,
      })),
    };
  }

  /**
   * Create a new platform user (client or worker)
   */
  async createUser(params: {
    data: CreatePlatformUserDTO;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { data, actorAdminId, actorUsername } = params;
    const { role, ...userData } = data;

    // Check if phone number already exists
    const existing = await userRepository.find({
      filter: { phoneNumber: userData.phoneNumber } as any,
    });

    if (existing) {
      throw new AppError('Phone number already in use', 409);
    }

    // Create user
    const createdUser = await userRepository.create({
      user: {
        ...userData,
        role: 'USER',
        status: userData.status || 'ACTIVE',
        middleName: userData.middleName || '',
      } as any,
    });

    // Create profile based on role
    if (role === 'WORKER') {
      await workerProfileRepository.create({
        userId: createdUser.id,
        workerProfile: {
          experienceYears: data.experienceYears || 0,
          acceptsUrgentJobs: data.acceptsUrgentJobs || false,
          isInTeam: false,
        } as any,
      });
    } else if (role === 'CLIENT') {
      await clientProfileRepository.create({
        userId: createdUser.id,
        clientProfile: {} as any,
      });
    }

    // Audit log
    await adminAuditLogService.record({
      actor: {
        adminId: actorAdminId,
        username: actorUsername,
        role: 'USER_MANAGEMENT' as any,
      },
      action: 'USER_CREATED',
      category: 'USER_MANAGEMENT',
      severity: 'WARNING',
      targetType: 'USER',
      targetId: createdUser.id,
      metadata: { role, phone: userData.phoneNumber },
    });

    return createdUser;
  }

  /**
   * Update user profile information
   */
  async updateUser(params: {
    userId: string;
    data: UpdatePlatformUserDTO;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId, data, actorAdminId, actorUsername } = params;

    const user = await userRepository.find({ filter: { id: userId } as any });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.middleName !== undefined) updateData.middleName = data.middleName || '';
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.profileImageUrl) updateData.profileImageUrl = data.profileImageUrl;

    const updated = await userRepository.update({
      filter: { id: userId } as any,
      user: updateData,
    });

    // Update worker profile if data provided
    if (data.experienceYears !== undefined || data.acceptsUrgentJobs !== undefined) {
      const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
      if (workerProfile) {
        const workerUpdateData: any = {};
        if (data.experienceYears !== undefined) workerUpdateData.experienceYears = data.experienceYears;
        if (data.acceptsUrgentJobs !== undefined) workerUpdateData.acceptsUrgentJobs = data.acceptsUrgentJobs;

        await workerProfileRepository.update({
          filter: { userId } as any,
          workerProfile: workerUpdateData,
        });
      }
    }

    // Audit log
    await adminAuditLogService.record({
      actor: {
        adminId: actorAdminId,
        username: actorUsername,
        role: 'USER_MANAGEMENT' as any,
      },
      action: 'USER_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: Object.keys(data).slice(0, 5),
    });

    return updated;
  }

  /**
   * Get user activity (placeholder for future implementation)
   */
  async getUserActivity(params: {
    userId: string;
    page: number;
    limit: number;
    type?: string;
  }) {
    const { userId, page = 1, limit = 20 } = params;

    // Verify user exists
    const user = await userRepository.find({ filter: { id: userId } as any });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Placeholder: would query Orders, Reports, Withdrawals, etc.
    const activities: any[] = [];
    const total = 0;
    const totalPages = Math.ceil(total / limit);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create working hours for a worker (placeholder)
   */
  async createWorkingHours(params: {
    userId: string;
    day: string;
    startTime: string;
    endTime: string;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId } = params;

    const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
    if (!workerProfile) {
      throw new AppError('Worker profile not found', 404);
    }

    // Placeholder: actual implementation would use DayWorkingHoursRepository
    await adminAuditLogService.record({
      actor: { adminId: params.actorAdminId, username: params.actorUsername, role: 'USER_MANAGEMENT' as any },
      action: 'USER_WORKING_HOURS_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: { day: params.day },
    });

    return { id: 'placeholder', day: params.day, startTime: params.startTime, endTime: params.endTime };
  }

  /**
   * Update working hours for a worker (placeholder)
   */
  async updateWorkingHours(params: {
    userId: string;
    day: string;
    startTime?: string;
    endTime?: string;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId } = params;

    const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
    if (!workerProfile) {
      throw new AppError('Worker profile not found', 404);
    }

    await adminAuditLogService.record({
      actor: { adminId: params.actorAdminId, username: params.actorUsername, role: 'USER_MANAGEMENT' as any },
      action: 'USER_WORKING_HOURS_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: { day: params.day },
    });

    return { id: 'placeholder', day: params.day, startTime: params.startTime, endTime: params.endTime };
  }

  /**
   * Delete working hours for a worker (placeholder)
   */
  async deleteWorkingHours(params: {
    userId: string;
    day: string;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId } = params;

    const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
    if (!workerProfile) {
      throw new AppError('Worker profile not found', 404);
    }

    await adminAuditLogService.record({
      actor: { adminId: params.actorAdminId, username: params.actorUsername, role: 'USER_MANAGEMENT' as any },
      action: 'USER_WORKING_HOURS_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: { day: params.day, action: 'deleted' },
    });
  }

  /**
   * Create occupied time slot for a worker (placeholder)
   */
  async createOccupiedSlot(params: {
    userId: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId } = params;

    const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
    if (!workerProfile) {
      throw new AppError('Worker profile not found', 404);
    }

    if (params.startDate >= params.endDate) {
      throw new AppError('Start date must be before end date', 400);
    }

    await adminAuditLogService.record({
      actor: { adminId: params.actorAdminId, username: params.actorUsername, role: 'USER_MANAGEMENT' as any },
      action: 'USER_OCCUPIED_SLOT_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: { startDate: params.startDate, endDate: params.endDate },
    });

    return { id: 'placeholder', startDate: params.startDate, endDate: params.endDate };
  }

  /**
   * Update occupied time slot (placeholder)
   */
  async updateOccupiedSlot(params: {
    userId: string;
    slotId: string;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId } = params;

    const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
    if (!workerProfile) {
      throw new AppError('Worker profile not found', 404);
    }

    await adminAuditLogService.record({
      actor: { adminId: params.actorAdminId, username: params.actorUsername, role: 'USER_MANAGEMENT' as any },
      action: 'USER_OCCUPIED_SLOT_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: { slotId: params.slotId },
    });

    return { id: params.slotId, startDate: params.startDate, endDate: params.endDate };
  }

  /**
   * Delete occupied time slot (placeholder)
   */
  async deleteOccupiedSlot(params: {
    userId: string;
    slotId: string;
    actorAdminId: string;
    actorUsername: string;
  }) {
    const { userId } = params;

    const workerProfile = await workerProfileRepository.find({ filter: { userId } as any });
    if (!workerProfile) {
      throw new AppError('Worker profile not found', 404);
    }

    await adminAuditLogService.record({
      actor: { adminId: params.actorAdminId, username: params.actorUsername, role: 'USER_MANAGEMENT' as any },
      action: 'USER_OCCUPIED_SLOT_UPDATED',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      targetType: 'USER',
      targetId: userId,
      metadata: { slotId: params.slotId, action: 'deleted' },
    });
  }

  /**
   * Enrich user with profile data for listing
   */
  private async enrichUserWithProfileData(user: any) {
    const [workerProfile, clientProfile] = await Promise.all([
      workerProfileRepository.find({ filter: { userId: user.id } as any }).catch(() => null),
      clientProfileRepository.find({ filter: { userId: user.id } as any }).catch(() => null),
    ]);

    if (workerProfile) {
      return {
        ...user,
        userType: 'WORKER',
        workerProfile: {
          workerProfileId: workerProfile.id,
          rate: workerProfile.rate || null,
          ratingCount: workerProfile.ratingCount || 0,
          completedJobsCount: workerProfile.completedJobsCount || 0,
          verificationStatus: null, // Would need verification repo
          experienceYears: workerProfile.experienceYears,
          acceptsUrgentJobs: workerProfile.acceptsUrgentJobs,
        },
      };
    }

    if (clientProfile) {
      return {
        ...user,
        userType: 'CLIENT',
        clientProfile: {
          clientProfileId: clientProfile.id,
        },
      };
    }

    return {
      ...user,
      userType: null,
    };
  }
}
