/**
 * Fetches JSON data from specified files and aggregates the utterances.
 * @returns {Promise<Array>} Array of utterances from all JSON files.
 */

// src/utils/fetchData.js
export async function fetchData(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch data, status: ${response.status}`);
    }
    const json = await response.json();
    
    if (json && (json.utterances || json.words)) {
      return json.utterances || json.words;
    } else {
      throw new Error("JSON data does not have 'utterances' or 'words' property");
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    throw error;
  }
}

