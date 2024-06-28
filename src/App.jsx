import React, { useState, useEffect } from 'react';
import { fetchData } from './utils/fetchData';
import { generateHeatmapData } from './utils/generateHeatmapData';
import { debounce } from './utils/debounce';
import Heatmap from './components/Heatmap';
import { processConversationData } from './utils/processConversationData'; // Import processConversationData
import './App.css';

function App() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [sessionDuration] = useState(3600);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'summary'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFileList() {
      try {
        const response = await fetch('/data/fileList.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch file list, status: ${response.status}`);
        }
        const fileListData = await response.json();
        setFileList(fileListData);
        setSelectedFile(fileListData[0] || ''); // Set the first file as default selected or empty string if fileListData is empty
      } catch (error) {
        console.error('Error fetching file list:', error);
      }
    }

    fetchFileList();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!selectedFile) return;

      setLoading(true); // Start loading indicator

      try {
        const fileData = await fetchData(`/data/${selectedFile}`);
        console.log('Fetched data:', fileData); // Log fetched data to inspect its structure
        
        const normalizedData = normalizeData(fileData);
        console.log('Normalized data:', normalizedData); // Log normalized data to inspect its structure
        
        const processedData = processConversationData(normalizedData); // Process data using processConversationData
        console.log('Processed data:', processedData); // Log processed data to inspect its structure
        
        const generatedData = generateHeatmapData(processedData, dimensions.height, dimensions.width, sessionDuration, viewMode);
        console.log('Generated heatmap data:', generatedData); // Log generated heatmap data to inspect its structure
        
        setHeatmapData(generatedData);
      } catch (error) {
        console.error(`Error loading data from ${selectedFile}:`, error);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    }

    const debouncedLoadData = debounce(loadData, 300);
    debouncedLoadData();
  }, [selectedFile, dimensions, sessionDuration, viewMode]);

  const handleFileSelect = (event) => {
    const selectedFileName = event.target.value;
    setSelectedFile(selectedFileName);
  };

  const handleViewModeChange = (event) => {
    const selectedViewMode = event.target.value;
    setViewMode(selectedViewMode);
  };

  function normalizeData(data) {
    return data.map(item => ({
      text: item.text || '',
      start: item.start || 0,
      end: item.end || 0,
      confidence: item.confidence || 0,
      speaker: item.speaker || 'Unknown',
      percentile: item.percentile || 0
    }));
  }

  const fileListOptions = fileList.map((fileName, index) => (
    <option key={index} value={fileName}>{fileName}</option>
  ));

  return (
    <div className="App">
      <h1>Heatmap</h1>
      <div>
        <label htmlFor="fileSelect">Select a file:</label>
        <select id="fileSelect" value={selectedFile} onChange={handleFileSelect}>
          {fileListOptions}
        </select>
      </div>
      <div>
        <label htmlFor="viewModeSelect">View Mode:</label>
        <select id="viewModeSelect" value={viewMode} onChange={handleViewModeChange}>
          <option value="full">Full Interaction</option>
          <option value="summary">Summary</option>
        </select>
      </div>
      {loading ? (
        <p>Loading heatmap data...</p>
      ) : (
        heatmapData.length > 0 ? (
          <Heatmap data={heatmapData} width={dimensions.width} height={dimensions.height} />
        ) : (
          <p>No data available for the selected file.</p>
        )
      )}
    </div>
  );
}

export default App;
