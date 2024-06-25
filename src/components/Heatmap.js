import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Heatmap component to visualize data using D3.js.
 * @param {Object} props - Component properties.
 * @param {Array} props.data - The heatmap data array.
 * @param {number} props.width - The width of the SVG container.
 * @param {number} props.height - The height of the SVG container.
 */
function Heatmap({ data, width, height }) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear existing content

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.score)]);

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => d.x * d.width)
      .attr('y', d => d.y * d.height)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('fill', d => colorScale(d.score))
      .append('title')
      .text(d => `Score: ${d.score}`);
  }, [data]);

  return (
    <svg ref={svgRef} width={width} height={height}></svg>
  );
}

export default Heatmap;
