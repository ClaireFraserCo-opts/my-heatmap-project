import React, { useState, useEffect } from 'react';
import { fetchData } from './utils/fetchData'; // Import function to fetch data
import { generateHeatmapData } from './utils/generateHeatmapData'; // Import function to generate heatmap data
import { debounce } from './utils/debounce'; // Import debounce utility function
import Heatmap from './components/Heatmap'; // Import Heatmap component
import './App.css'; // Import CSS styles

function App() {
  // State variables
  const [heatmapData, setHeatmapData] = useState([]); // State for heatmap data
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 }); // State for dimensions of heatmap
  const [sessionDuration] = useState(3600); // Constant for session duration in seconds
  const [fileList, setFileList] = useState([]); // State for list of files from fileList.json
  const [selectedFile, setSelectedFile] = useState(''); // State for currently selected file

  // Effect to fetch the list of files when component mounts
  useEffect(() => {
    async function fetchFileList() {
      try {
        const response = await fetch('/data/fileList.json'); // Fetch file list from server
        if (!response.ok) {
          throw new Error(`Failed to fetch file list, status: ${response.status}`); // Handle fetch errors
        }
        const fileListData = await response.json(); // Parse JSON response
        setFileList(fileListData); // Set fileList state with fetched data
        setSelectedFile(fileListData[0] || ''); // Set the first file as default selected or empty string if fileListData is empty
      } catch (error) {
        console.error('Error fetching file list:', error); // Log fetch errors
      }
    }

    fetchFileList(); // Invoke fetchFileList function when component mounts
  }, []);

  // Effect to load data for selected file when selectedFile or dimensions/sessionDuration change
  useEffect(() => {
    async function loadData() {
      if (!selectedFile) return; // Return early if no file is selected

      try {
        const fileData = await fetchData(`/data/${selectedFile}`); // Fetch data for selected file
        const normalizedData = normalizeData(fileData); // Normalize fetched data
        const processedData = generateHeatmapData(normalizedData, dimensions.height, dimensions.width, sessionDuration); // Process data to generate heatmap data
        setHeatmapData(processedData); // Set heatmapData state with processed data
      } catch (error) {
        console.error(`Error loading data from ${selectedFile}:`, error); // Log errors if data loading fails
      }
    }

    const debouncedLoadData = debounce(loadData, 300); // Debounce loadData function to avoid rapid re-fetching
    debouncedLoadData(); // Invoke debounced loadData function
  }, [selectedFile, dimensions, sessionDuration]); // Depend on selectedFile, dimensions, and sessionDuration

  // Event handler for file selection change
  const handleFileSelect = (event) => {
    const selectedFileName = event.target.value; // Get selected file name from event
    setSelectedFile(selectedFileName); // Update selectedFile state with selected file name
  };

  // Function to normalize data structure
  function normalizeData(data) {
    return data.map(item => ({
      text: item.text || '', // Handle missing text
      start: item.start || 0, // Handle missing start time
      end: item.end || 0, // Handle missing end time
      confidence: item.confidence || 0, // Handle missing confidence
      speaker: item.speaker || 'Unknown' // Handle missing speaker
    }));
  }

  // Generate dropdown options for fileList
  const fileListOptions = fileList.map((fileName, index) => (
    <option key={index} value={fileName}>{fileName}</option>
  ));

  // JSX structure for rendering App component
  return (
    <div className="App">
      <div>
        <label htmlFor="fileSelect">Select a file:</label>
        <select id="fileSelect" value={selectedFile} onChange={handleFileSelect}>
          {fileListOptions} {/* Render dropdown options based on fileList */}
        </select>
      </div>
      <Heatmap data={heatmapData} width={dimensions.width} height={dimensions.height} /> {/* Render Heatmap component */}
    </div>
  );
}

export default App; // Export App component
