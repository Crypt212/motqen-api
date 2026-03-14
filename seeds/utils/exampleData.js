import { governmentRepository, specializationRepository } from "../../src/state.js";
import getRandomElements from "../../src/utils/randomElements.js";

export async function getExampleSpecializationTree(count = 2, subCount = 3) {

  let exampleSpecializations = getRandomElements((await specializationRepository.findMany()).data, count);
  const exampleSpecializationsTree = [];
  for (let specialization of exampleSpecializations) {
    const subSpecializationIds = getRandomElements((await specializationRepository.findSubSpecializations({ filter: { mainSpecializationId: specialization.id } })).data, subCount).map(specialization => specialization.id);
    exampleSpecializationsTree.push({
      mainId: specialization.id,
      subIds: subSpecializationIds
    });
  }

  return exampleSpecializationsTree;
}

export async function getExampleGovernmentIds(count = 3) {
  const governments = (await governmentRepository.findMany()).data;
  const randomSamples = getRandomElements(governments, count).map(value => value.id);
  return randomSamples;
}

export async function getExampleCityIds(governmentId, count = 3) {
  const cities = (await governmentRepository.findCities({ filter: { governmentId } })).data;
  const randomSamples = getRandomElements(cities, count).map(value => value.id);
  return randomSamples;
}
