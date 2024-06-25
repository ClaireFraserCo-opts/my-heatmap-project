import React, { useState, useEffect } from 'react';
import { fetchData } from './utils/fetchData';
import { generateHeatmapData } from './utils/generateHeatmapData';
import { debounce } from './utils/debounce';
import Heatmap from './components/Heatmap';
import './App.css';

function App() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [sessionDuration] = useState(3600);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

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

      try {
        const fileData = await fetchData(`/data/${selectedFile}`);
        const normalizedData = normalizeData(fileData);
        const processedData = generateHeatmapData(normalizedData, dimensions.height, dimensions.width, sessionDuration);
        setHeatmapData(processedData);
      } catch (error) {
        console.error(`Error loading data from ${selectedFile}:`, error);
      }
    }

    const debouncedLoadData = debounce(loadData, 300);
    debouncedLoadData();
  }, [selectedFile, dimensions, sessionDuration]);

  const handleFileSelect = (event) => {
    const selectedFileName = event.target.value;
    setSelectedFile(selectedFileName);
  };

  function normalizeData(data) {
    return data.map(item => ({
      text: item.text || '',
      start: item.start || 0,
      end: item.end || 0,
      confidence: item.confidence || 0,
      speaker: item.speaker || 'Unknown'
    }));
  }

  const fileListOptions = fileList.map((fileName, index) => (
    <option key={index} value={fileName}>{fileName}</option>
  ));

  return (
    <div className="App">
      <div>
        <label htmlFor="fileSelect">Select a file:</label>
        <select id="fileSelect" value={selectedFile} onChange={handleFileSelect}>
          {fileListOptions}
        </select>
      </div>
      <Heatmap data={heatmapData} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

export default App;
