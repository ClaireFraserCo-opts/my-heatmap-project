import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { processConversationData } from '../utils/processConversationData'; // Corrected import
import { findDimensionsForGoldenRatio } from '../utils/calculateDimensions'; // Corrected import
import stopWords from '../utils/stopWords'; // Corrected import

function Heatmap({ data, width, height }) {
  const svgRef = useRef();

  useEffect(() => {
    console.log('Original data:', data);
    if (!data || data.length === 0) {
      console.warn('Heatmap data is empty or undefined:', data);
      return; // Exit early if data is empty
    }

    let processedData;
    try {
      processedData = processConversationData(data);
    } catch (error) {
      console.error('Error processing conversation data:', error);
      return;
    }

    console.log('Processed data:', processedData);
    if (processedData.length === 0) {
      console.warn('Processed data is empty');
      return;
    }

    const filteredWords = stopWords();
    const { bestX: blockWidth, bestY: blockHeight } = findDimensionsForGoldenRatio(/* provide necessary arguments */);

    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract unique speakers and session times
    const speakers = Array.from(new Set(data.map(d => d.speaker)));
    const sessionTimes = Array.from(new Set(data.map(d => d.start)));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(sessionTimes)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(speakers)
      .range([innerHeight, 0])
      .padding(0.1);

    const colorScale = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([1, 100]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Draw rectangles
    svg.selectAll()
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.start))
      .attr("y", d => yScale(d.speaker))
      .attr("width", blockWidth)
      .attr("height", blockHeight)
      .style("fill", d => colorScale(d.frequency))
      .attr("stroke", "black");

  }, [data, width, height]);

  return (
    <svg ref={svgRef}></svg>
  );
}

export default Heatmap;