import "dotenv/config";
import { authService, userRepository } from "../../src/state.js";
import { getExampleCityIds, getExampleGovernmentIds, getExampleSpecializationTree } from "../utils/exampleData.js";
import loadLocalImage from "../utils/imageLoader.js";



/**
 * Seed the system with example users by clearing existing users and creating sample client and worker accounts.
 *
 * Deletes all users in the repository, logs the assembled payloads, and registers one sample client and one sample worker using local example data (government/city IDs, specialization tree, and a local profile image).
 */
export async function createMains() {
  const exampleGovernmentIds = await getExampleGovernmentIds();
  const exampleGovernmentId = (await getExampleGovernmentIds(1))[0];
  const exampleCityId = (await getExampleCityIds(exampleGovernmentId, 1))[0];
  const exampleSpecializationTree = await getExampleSpecializationTree();

  const exampleImage = await loadLocalImage("./seeds/samples/", "personal-profile.jpg");

  await userRepository.deleteMany({});

  console.log({
    userData: {
      phoneNumber: "01000000000",
      firstName: "ahmed",
      middleName: "mohamed",
      lastName: "mohamed",
      governmentId: exampleGovernmentId,
      cityId: exampleCityId,
      role: "USER",
      profileImageBuffer: exampleImage,
    },
    workerProfileData: {
      idImageBuffer: exampleImage,
      profileWithIdImageBuffer: exampleImage,
      experienceYears: 1,
      isInTeam: true,
      acceptsUrgentJobs: true,
      workGovernmentIds: exampleGovernmentIds,
      specializationsTree: exampleSpecializationTree,
    }
  });

  await authService.registerClient({
    userData: {
      phoneNumber: "02222222222",
      firstName: "ahmed",
      middleName: "saeed",
      lastName: "farouk",
      governmentId: exampleGovernmentId,
      cityId: exampleCityId,
      role: "USER",
      profileImageBuffer: exampleImage,
    },
    clientProfileData: {
      address: "Cairo, Egypt",
      addressNotes: "Near the government office",
    },
  });

  await authService.registerWorker({
    userData: {
      phoneNumber: "01111111111",
      firstName: "ahmed",
      middleName: "mohamed",
      lastName: "mohamed",
      governmentId: exampleGovernmentId,
      cityId: exampleCityId,
      role: "USER",
      profileImageBuffer: exampleImage,
    },
    workerProfileData: {
      idImageBuffer: exampleImage,
      profileWithIdImageBuffer: exampleImage,
      experienceYears: 1,
      isInTeam: true,
      acceptsUrgentJobs: true,
      workGovernmentIds: exampleGovernmentIds,
      specializationsTree: exampleSpecializationTree,
    },
  });
}

createMains();
