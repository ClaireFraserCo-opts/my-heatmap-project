/**
 * Fetches JSON data from specified files and aggregates the utterances.
 * @returns {Promise<Array>} Array of utterances from all JSON files.
 */
export async function fetchData() {
  const fileNames = ['data1.json', 'data2.json']; // List all your JSON files here
  const data = [];

  for (const fileName of fileNames) {
    const response = await fetch(`data/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
    }
    const json = await response.json();
    data.push(...json.utterances);
  }

  return data;
}
