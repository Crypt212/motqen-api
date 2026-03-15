import prisma from "../src/libs/database.js";
import { getGovernmentCoordinates } from "../src/utils/governmentDistance.js";

const userId = "935478d9-0572-41d3-ba1b-370cb87e9fd1";
const workerId = "32155f89-f269-414c-a429-2590f1750f90";

const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    governmentId: true,
    government: { select: { name: true } },
  },
});

const worker = await prisma.workerProfile.findUnique({
  where: { id: workerId },
  select: {
    id: true,
    governments: {
      select: {
        government: { select: { name: true } },
      },
    },
  },
});

const userGovernmentName = user?.government?.name ?? null;
const workerGovernments = (worker?.governments || []).map((g) => g.government.name);

console.log(
  JSON.stringify(
    {
      user,
      userGovernmentName,
      userGovernmentCoordinates: getGovernmentCoordinates(userGovernmentName),
      workerGovernments,
      workerGovernmentCoordinates: workerGovernments.map((name) => ({
        name,
        coordinates: getGovernmentCoordinates(name),
      })),
    },
    null,
    2
  )
);

await prisma.$disconnect();
