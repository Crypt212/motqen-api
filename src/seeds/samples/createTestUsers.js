import "dotenv/config";
import AppError from "../../errors/AppError.js";
import uploadToCloudinary from "../../providers/cloudinaryProvider.js";
import { tryCatch } from "../../services/Service.js";
import { governmentRepository, userRepository } from "../../state.js";
import { getExampleCityIds, getExampleGovernmentIds, getExampleSpecializationTree } from "../utils/exampleData.js";
import loadLocalImage from "../utils/imageLoader.js";



export async function createWorker ({
  userData: {
    phoneNumber,
    firstName,
    middleName,
    lastName,
    governmentId,
    cityId,
    role,
    profileImage,
  },
  workerProfileData: {
    idImage,
    profileWithIdImage,
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree,
    workGovernmentIds,
  }
}) {
  return tryCatch(async () => {
    try {

      const cities = await governmentRepository.findCities({ id: cityId, governmentId });
      if (!cities || cities.length === 0) throw new AppError("Government or city not found", 400);

      const { user, profile } = await userRepository.createWorker({
        userData: {
          phoneNumber,
          role,
          firstName,
          middleName,
          lastName,
          governmentId,
          cityId,
          status: "ACTIVE"
        },
        workerProfileData: {
          experienceYears,
          isInTeam: Boolean(isInTeam),
          acceptsUrgentJobs: Boolean(acceptsUrgentJobs),
        },
        verificationData: undefined
      });

      /** @type {string} */
      const nationalID = (await uploadToCloudinary(idImage.buffer, `${user.id}/verification_info`, "nationalID")).url;

      /** @type {string} */
      const selfiWithID = (await uploadToCloudinary(profileWithIdImage.buffer, `${user.id}/verification_info`, "selfiWithID")).url;

      const verification = await userRepository.upsertWorkerProfileVerification({
        workerProfileId: profile.id,
        verificationData: {
          idWithPersonalImageUrl: nationalID,
          idDocumentUrl: selfiWithID,
          status: "PENDING",
          reason: "Waiting for verification"
        }
      });

      await userRepository.insertWorkerProfileGovernments({ workerProfileId: profile.id, governmentIds: workGovernmentIds });
      await userRepository.insertWorkerProfileSpecializations({ workerProfileId: profile.id, specializationsTree });

      const { url } = (await uploadToCloudinary(profileImage.buffer, `${phoneNumber}/profile_image`, "profileMain"))
      await userRepository.updateMany({ profileImageUrl: url }, { id: user.id });
      user.profileImageUrl = url;

      return { profile, user, verification };
    } catch (reason) {
      console.log(reason)
      throw new AppError("Failed to create worker profile", 500, reason);
    }
  });
}

export async function createClient ({
  userData: {
    phoneNumber,
    firstName,
    middleName,
    lastName,
    governmentId,
    cityId,
    role,
    profileImage,
  },
  clientProfileData: {
    address,
    addressNotes
  },
}) {
  return tryCatch(async () => {
    try {

      const cities = await governmentRepository.findCities({ id: cityId, governmentId });
      if (!cities || cities.length === 0) throw new AppError("Government or city not found", 400);

      const { user, profile } = await userRepository.createClient({
        userData: {
          phoneNumber,
          role,
          firstName,
          middleName,
          lastName,
          governmentId,
          cityId,
          status: "ACTIVE"
        },
        clientProfileData: {
          address,
          addressNotes
        }
      });

      /** @type {import("../../repositories/database/UserRepository.js").User & { cityName: string }} */
      const modifiedUser = { ...user, cityName: cities[0].name };

      if (profileImage) {
        const { url } = await uploadToCloudinary(profileImage.buffer, `${user.id}/profile_image`, "profileMain");

        await userRepository.updateMany({ profileImageUrl: url }, { id: user.id });
        user.profileImageUrl = url
      }

      return { profile, user: modifiedUser };
    } catch (error) {
      console.log(error)
      throw new AppError("Failed to create client profile", 500, error);
    }
  });
}

export async function createMains () {
  const exampleGovernmentIds = await getExampleGovernmentIds();
  const exampleGovernmentId = await getExampleGovernmentIds(1)[0];
  const exampleCityId = await getExampleCityIds(await getExampleGovernmentIds(1)[0], 1)[0];
  const exampleSpecializationTree = await getExampleSpecializationTree();

  const exampleImage = {
    buffer: await loadLocalImage("./src/tests/auth/", "personal-profile.jpg"),
    mimetype: "jpg",
  }

  await userRepository.deleteMany({});

  await createClient({
    userData: {
      phoneNumber: "02000000000",
      firstName: "ahmed",
      middleName: "saeed",
      lastName: "farouk",
      governmentId: exampleGovernmentId,
      cityId: exampleCityId,
      role: "USER",
      profileImage: exampleImage,
    },
    clientProfileData: {
      address: "Cairo, Egypt",
      addressNotes: "Near the government office",
    },
  });

  await createWorker({
    userData: {
      phoneNumber: "01000000000",
      firstName: "ahmed",
      middleName: "mohamed",
      lastName: "mohamed",
      governmentId: exampleGovernmentId,
      cityId: exampleCityId,
      role: "USER",
      profileImage: exampleImage,
    },
    workerProfileData: {
      idImage: exampleImage,
      profileWithIdImage: exampleImage,
      experienceYears: 1,
      isInTeam: true,
      acceptsUrgentJobs: true,
      workGovernmentIds: exampleGovernmentIds,
      specializationsTree: exampleSpecializationTree,
    },
  });
}
