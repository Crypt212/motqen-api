import { governmentRepository, specializationRepository } from "../../src/state.js";
import getRandomElements from "../../src/utils/randomElements.js";

/**
 * Build a sample tree of specializations with selected sub-specializations.
 *
 * @param {number} [count=2] - Number of main specializations to include.
 * @param {number} [subCount=3] - Maximum number of sub-specializations to include for each main specialization.
 * @returns {{mainId: string, subIds: string[]}[]} An array of objects where each object contains a main specialization id (`mainId`) and an array of its selected sub-specialization ids (`subIds`).
 */
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

/**
 * Produce a random sample of government IDs.
 * @param {number} count - Number of government IDs to return (default 3).
 * @returns {Array<string|number>} An array of government ID values.
 */
export async function getExampleGovernmentIds(count = 3) {
  const governments = (await governmentRepository.findMany()).data;
  const randomSamples = getRandomElements(governments, count).map(value => value.id);
  return randomSamples;
}

/**
 * Selects a sample of city IDs for a given government.
 * @param {string|number} governmentId - ID of the government whose cities to sample.
 * @param {number} [count=3] - Maximum number of city IDs to return.
 * @returns {Array<string|number>} An array of city IDs from the specified government; length will be at most `count`.
 */
export async function getExampleCityIds(governmentId, count = 3) {
  const cities = (await governmentRepository.findCities({ filter: { governmentId } })).data;
  const randomSamples = getRandomElements(cities, count).map(value => value.id);
  return randomSamples;
}
