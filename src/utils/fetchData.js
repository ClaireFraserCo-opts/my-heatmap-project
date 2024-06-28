// src/utils/fetchData.js

export async function fetchData(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch data, status: ${response.status}`);
    }
    const json = await response.json();
    
    // Check for expected properties or handle data differently
    if (json && (json.utterances || json.words)) {
      return json.utterances || json.words;
    } else {
      // Fallback or handle differently if properties are missing
      console.warn("JSON data does not have 'utterances' or 'words' property:", json);
      // Example: Return entire JSON object if no specific properties found
      return json;
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    throw error;
  }
}
