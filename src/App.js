import React, { useState, useEffect } from 'react';
import { fetchData } from './utils/fetchData';
import { generateHeatmapData } from './utils/generateHeatmapData';
import { debounce } from './utils/debounce';
import Heatmap from './components/Heatmap';
import './App.css';

/**
 * Main App component to fetch data, generate heatmap data, and render Heatmap component.
 */
function App() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 }); // Example default dimensions
  const sessionDuration = 3600; // Example session duration in seconds

  useEffect(() => {
    async function loadData() {
      try {
        const utterances = await fetchData();
        const heatmapData = generateHeatmapData(utterances, dimensions.height, dimensions.width, sessionDuration);
        setHeatmapData(heatmapData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    const debouncedLoadData = debounce(loadData, 300);
    debouncedLoadData();
  }, [dimensions]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.8, // Example to keep the heatmap 80% of window width
        height: window.innerHeight * 0.8 // Example to keep the heatmap 80% of window height
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial dimensions
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="App">
      <Heatmap data={heatmapData} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}

export default App;
