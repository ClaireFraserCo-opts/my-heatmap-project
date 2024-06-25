import { findDimensionsForGoldenRatio } from './calculateDimensions';

/**
 * Generates heatmap data based on utterances and display dimensions.
 * @param {Array} utterances - The list of utterances.
 * @param {number} displayHeight - The height of the display area.
 * @param {number} displayWidth - The width of the display area.
 * @param {number} sessionDuration - The duration of the session in seconds.
 * @returns {Array} Heatmap data array with block dimensions and scores.
 */
export function generateHeatmapData(utterances, displayHeight, displayWidth, sessionDuration) {
  const totalPixels = displayHeight * displayWidth;
  const pixelsPerSecond = totalPixels / sessionDuration;
  const { bestX: blockWidth, bestY: blockHeight } = findDimensionsForGoldenRatio(pixelsPerSecond);

  const heatmapData = utterances.map(utterance => {
    const startSeconds = utterance.start / 1000;
    const block = {
      x: Math.floor(startSeconds / blockWidth),
      y: Math.floor(startSeconds / blockHeight),
      width: blockWidth,
      height: blockHeight,
      score: utterance.density,
    };
    return block;
  });

  return heatmapData;
}
