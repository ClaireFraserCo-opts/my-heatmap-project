/**
 * Calculates dimensions based on the golden ratio to approximate a target value.
 * @param {number} targetValue - The target value to approximate with dimensions.
 * @returns {Object} An object containing the best X and Y dimensions.
 */
export function findDimensionsForGoldenRatio(targetValue) {
  const phi = (1 + Math.sqrt(5)) / 2; // Golden Ratio

  // Estimate starting points
  const estimatedX = Math.floor(Math.sqrt(targetValue * phi));
  const estimatedY = Math.floor(Math.sqrt(targetValue / phi));

  // Search boundaries
  let left = Math.max(0, estimatedX - 10);
  let right = Math.min(targetValue, estimatedX + 10);

  let bestX = 0;
  let bestY = 0;
  let smallestDifference = targetValue;

  // Binary search loop
  while (left <= right) {
    const midX = Math.floor((left + right) / 2);
    const midY = Math.round(midX / phi);
    const product = midX * midY;
    const difference = Math.abs(targetValue - product);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestX = midX;
      bestY = midY;
    }

    if (product < targetValue) {
      left = midX + 1;
    } else if (product > targetValue) {
      right = midX - 1;
    } else {
      break; // Exact match found
    }
  }

  return { bestX, bestY };
}
