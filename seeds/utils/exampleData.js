import { governmentRepository, specializationRepository } from "../../state.js";
import getRandomElements from "../../utils/randomElements.js";

export async function getExampleSpecializationTree (count = 2, subCount = 3) {

  let exampleSpecializations = getRandomElements(await specializationRepository.findMany(), count);
  const exampleSpecializationsTree = [];
  for (let specialization of exampleSpecializations) {
    const subSpecializationIds = getRandomElements(await specializationRepository.findSubSpecializations({ mainSpecializationId: specialization.id }), subCount).map(specialization => specialization.id);
    exampleSpecializationsTree.push({
      mainId: specialization.id,
      subIds: subSpecializationIds
    });
  }

  return exampleSpecializationsTree;
}

export async function getExampleGovernmentIds (count = 3) {
  return getRandomElements(await governmentRepository.findMany(), count).map(value => value.id);
}

export async function getExampleCityIds (governmentId, count = 3) {
  return getRandomElements(await governmentRepository.findCities({ governmentId }), count).map(value => value.id);
}
