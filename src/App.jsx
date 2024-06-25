import React, { useState, useEffect } from 'react';
import { fetchData } from './utils/fetchData';
import { generateHeatmapData } from './utils/generateHeatmapData';
import { debounce } from './utils/debounce';
import Heatmap from './components/Heatmap';
import './App.css';

function App() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const sessionDuration = 3600;

  useEffect(() => {
    async function loadData() {
      try {
        const fileListResponse = await fetch('/data/fileList.json');
        if (!fileListResponse.ok) {
          throw new Error(`Failed to fetch file list, status: ${fileListResponse.status}`);
        }
        const fileList = await fileListResponse.json();

        let allData = [];
        for (const fileName of fileList) {
          try {
            const fileData = await fetchData(`/data/${fileName}`);
            allData = allData.concat(fileData);
          } catch (error) {
            console.error(`Error loading data from ${fileName}:`, error);
            // Handle specific file fetch error if needed
          }
        }

        const normalizedData = normalizeData(allData);
        const processedData = generateHeatmapData(normalizedData, dimensions.height, dimensions.width, sessionDuration);
        setHeatmapData(processedData);
      } catch (error) {
        console.error('Error loading data:', error);
        // Handle overall data loading error if needed
      }
    }

    const debouncedLoadData = debounce(loadData, 300);
    debouncedLoadData();
  }, [dimensions]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  function normalizeData(data) {
    return data.map(item => ({
      text: item.text || '',
      start: item.start || 0,
      end: item.end || 0,
      confidence: item.confidence || 0,
      speaker: item.speaker || 'Unknown'
    }));
  }

  return (
    <div className="App">
      <Heatmap data={heatmapData} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

export default App;
