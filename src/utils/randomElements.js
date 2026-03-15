/**
 * Selects a specified number of random elements from an array.
 * @param {Array} arr - Source array to select elements from.
 * @param {number} count - Number of elements to return.
 * @returns {Array} An array containing up to `count` elements randomly chosen from `arr`.
 */
export default function getRandomElements(arr, count) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
