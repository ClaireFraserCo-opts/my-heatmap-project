import { findDimensionsForGoldenRatio } from './calculateDimensions';

/**
 * Normalizes the input data to a common structure.
 * @param {Array} data - The input data array (either utterances or words).
 * @returns {Array} Normalized data array.
 */
function normalizeData(data) {
  return data.map(item => ({
    text: item.text,
    start: item.start,
    end: item.end,
    speaker: item.speaker || 'Unknown',
    density: item.confidence || 0
  }));
}

/**
 * Generates heatmap data based on utterances and display dimensions.
 * @param {Array} data - The list of utterances or words.
 * @param {number} displayHeight - The height of the display area.
 * @param {number} displayWidth - The width of the display area.
 * @param {number} sessionDuration - The duration of the session in seconds.
 * @returns {Array} Heatmap data array with block dimensions and scores.
 */
export function generateHeatmapData(data, displayHeight, displayWidth, sessionDuration) {
  // Normalize the data to ensure consistency
  const normalizedData = normalizeData(data);

  const totalPixels = displayHeight * displayWidth;
  const pixelsPerSecond = totalPixels / sessionDuration;
  const { bestX: blockWidth, bestY: blockHeight } = findDimensionsForGoldenRatio(pixelsPerSecond);

  const heatmapData = normalizedData.map(item => {
    const startSeconds = item.start / 1000;
    const block = {
      x: Math.floor(startSeconds / blockWidth),
      y: Math.floor(startSeconds / blockHeight),
      width: blockWidth,
      height: blockHeight,
      score: item.density,
    };
    return block;
  });

  return heatmapData;
}
