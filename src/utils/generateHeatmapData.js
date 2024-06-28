import { findDimensionsForGoldenRatio } from './calculateDimensions';

/**
 * Normalizes the input data to a common structure.
 * @param {Array} data - The input data array (either utterances or words).
 * @returns {Array} Normalized data array.
 */
function normalizeData(data) {
  return data.map(item => ({
    text: item.text || '',
    start: item.start || 0,
    end: item.end || 0,
    speaker: item.speaker || 'Unknown',
    density: item.confidence || 0,
    percentile: item.percentile || 0
  }));
}

/**
 * Generates heatmap data based on utterances and display dimensions.
 * @param {Array} data - The list of utterances or words.
 * @param {number} displayHeight - The height of the display area.
 * @param {number} displayWidth - The width of the display area.
 * @param {number} sessionDuration - The duration of the session in seconds.
 * @param {string} viewMode - The view mode ('full' or 'summary').
 * @returns {Array} Heatmap data array with block dimensions and scores.
 */
export function generateHeatmapData(data, displayHeight, displayWidth, sessionDuration, viewMode) {
  // Normalize the data to ensure consistency
  const normalizedData = normalizeData(data);

  const totalPixels = displayHeight * displayWidth;
  const pixelsPerSecond = totalPixels / sessionDuration;
  const { bestX: blockWidth, bestY: blockHeight } = findDimensionsForGoldenRatio(pixelsPerSecond);

  const heatmapData = normalizedData.map(item => {
    const startSeconds = item.start / 1000;
    const color = getColorForSpeaker(item.speaker, item.percentile, viewMode);
    const block = {
      x: Math.floor(startSeconds / blockWidth),
      y: Math.floor(startSeconds / blockHeight),
      width: blockWidth,
      height: blockHeight,
      score: item.density,
      color: color,
    };
    return block;
  });

  return heatmapData;
}

/**
 * Returns color based on speaker and percentile.
 * @param {string} speaker - The speaker.
 * @param {number} percentile - The percentile.
 * @param {string} viewMode - The view mode ('full' or 'summary').
 * @returns {string} The color for the block.
 */
function getColorForSpeaker(speaker, percentile, viewMode) {
  if (speaker === 'Unknown') {
    return '#CCCCCC'; // Gray for unknown/silence
  }
  
  const intensity = getIntensity(percentile);
  if (viewMode === 'summary' && percentile < 100) {
    return '#E0E0E0'; // Light gray for non-summary in summary mode
  }

  const colors = {
    'A': `rgba(0, 0, 255, ${intensity})`, // Blue for speaker A
    'B': `rgba(255, 0, 0, ${intensity})`, // Red for speaker B
    // Add more speakers as needed
  };

  return colors[speaker] || '#000000'; // Default to black if speaker not recognized
}

/**
 * Calculates intensity based on percentile.
 * @param {number} percentile - The percentile.
 * @returns {number} The intensity value.
 */
function getIntensity(percentile) {
  const maxPercentile = 100;
  const minPercentileIntensity = 0.2;
  const maxPercentileIntensity = 1.0;

  if (percentile === maxPercentile) {
    return maxPercentileIntensity;
  } else {
    const intensityRange = maxPercentileIntensity - minPercentileIntensity;
    return minPercentileIntensity + (percentile / maxPercentile) * intensityRange;
  }
}
