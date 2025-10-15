import React, { useRef, useEffect } from 'react';
import type { GraphData, GraphNode, GraphLink, Translations } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';

declare const d3: any;

interface TopicGraphProps {
  data: GraphData;
  isLoading: boolean;
  t: Translations;
}

export const TopicGraph: React.FC<TopicGraphProps> = ({ data, isLoading, t }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data || data.nodes.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous graph

    const width = ref.current.parentElement?.clientWidth || 600;
    const height = ref.current.parentElement?.clientHeight || 500;
    svg.attr("width", width).attr("height", height).attr("viewBox", [-width / 2, -height / 2, width, height]);

    const links: GraphLink[] = data.links.map(d => ({...d}));
    const nodes: GraphNode[] = data.nodes.map(d => ({...d}));

    const color = (group: string) => {
        switch(group) {
            case 'topic': return '#38b2ac'; // highlight
            case 'person': return '#f56565'; // red
            case 'organization': return '#4299e1'; // blue
            case 'concept': return '#ed8936'; // orange
            default: return '#a0aec0'; // text-secondary
        }
    };
    
    const nodeSize = (group: string) => group === 'topic' ? 20 : 12;

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(0,0));

    const link = svg.append("g")
        .attr("stroke", "#4a5568")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));
      
    node.append("circle")
        .attr("r", d => nodeSize(d.group))
        .attr("fill", d => color(d.group))
        .attr("stroke", "#1a202c")
        .attr("stroke-width", 2);

    node.append("text")
        .text((d: any) => d.id)
        .attr("x", d => nodeSize(d.group) + 5)
        .attr("y", 5)
        .attr("fill", "#e2e8f0")
        .attr("font-size", "12px")
        .attr("paint-order", "stroke")
        .attr("stroke", "#1a202c")
        .attr("stroke-width", "0.5px");

    simulation.on("tick", () => {
      link
          .attr("x1", d => (d.source as any).x)
          .attr("y1", d => (d.source as any).y)
          .attr("x2", d => (d.target as any).x)
          .attr("y2", d => (d.target as any).y);

      node
          .attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    function drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }
    
  }, [data]);

  const hasData = data && data.nodes.length > 0;

  return (
    <div className="bg-secondary p-4 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-highlight border-b border-accent pb-2">{t.topicGraph}</h2>
      <div className="flex-grow relative">
        {isLoading && <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center z-10 rounded-b-lg">
          <LoadingSpinner />
        </div>}
        {!hasData && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">{t.graphPlaceholder}</p>
          </div>
        )}
        <svg ref={ref}></svg>
      </div>
    </div>
  );
};
