
import React, { useRef, useEffect, useState } from 'react';
import { QuantumNode } from '../types';
import * as d3 from 'd3';
import { Box, Grid2X2, Type, Info, Zap } from 'lucide-react';

interface Props {
  nodes: QuantumNode[];
}

const QuantumView: React.FC<Props> = ({ nodes }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'ascii'>('3d');
  const [hovered, setHovered] = useState<QuantumNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || viewMode === 'ascii') return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    svg.selectAll("*").remove();

    // Group for zoom and pan
    const g = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 12])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);

    const xScale = d3.scaleLinear().domain([-18, 18]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-18, 18]).range([height, 0]);

    // Color mapping for ABC nodes
    const colors: Record<string, string> = {
      'a': '#ef4444', 'b': '#3b82f6', 'c': '#10b981',
      'A': '#fca5a5', 'B': '#93c5fd', 'C': '#6ee7b7'
    };

    // Advanced Radius Scale: Energy levels are mapped exponentially for visual clarity
    // Standard energy ~0.15, Excited ~0.25+
    const energyToRadius = d3.scalePow()
      .exponent(1.5)
      .domain([0.1, 0.45])
      .range([2, 12]);

    // Depth scale for opacity and blur simulation
    const depthScale = d3.scaleLinear().domain([-10, 15]).range([0.15, 1]);

    if (viewMode === '2d') {
      const sliceNodes = nodes.filter(n => Math.abs(n.z) < 2.5);
      
      g.selectAll("circle")
        .data(sliceNodes)
        .enter()
        .append("circle")
        .attr("r", n => energyToRadius(n.energy))
        .attr("fill", n => colors[n.state])
        .attr("cx", n => xScale(n.x))
        .attr("cy", n => yScale(n.y))
        .attr("opacity", 0.9)
        .attr("stroke", n => n.isExcited ? "#fff" : "none")
        .attr("stroke-width", n => n.isExcited ? 1.5 : 0)
        .attr("class", n => n.isExcited ? "excited-node node-hover" : "node-hover")
        .style("cursor", "crosshair")
        .on("mouseover", (e, d) => setHovered(d))
        .on("mouseout", () => setHovered(null));

    } else {
      // Sort nodes by depth (Z-order) to render back-to-front
      const sortedNodes = [...nodes].sort((a, b) => a.z - b.z);

      g.selectAll("circle")
        .data(sortedNodes)
        .enter()
        .append("circle")
        .attr("r", n => {
            const baseR = energyToRadius(n.energy);
            // Z-Perspective: Nodes closer (higher Z) appear larger
            const perspectiveFactor = d3.scaleLinear().domain([-5, 10]).range([0.6, 1.8])(n.z);
            return baseR * perspectiveFactor;
        })
        .attr("fill", n => colors[n.state])
        .attr("cx", n => xScale(n.x))
        .attr("cy", n => yScale(n.y))
        .attr("opacity", n => depthScale(n.z))
        // Map stroke intensity to energy
        .attr("stroke", n => n.energy > 0.2 ? colors[n.state] : "none")
        .attr("stroke-width", n => n.energy * 10)
        .attr("stroke-opacity", 0.4)
        .attr("class", n => n.isExcited ? "excited-node node-hover" : "node-hover")
        .style("cursor", "pointer")
        .on("mouseover", (e, d) => setHovered(d))
        .on("mouseout", () => setHovered(null));
    }

  }, [nodes, viewMode]);

  const generateASCII = () => {
    let ascii = `=== R-QNT GEOMETRY ARRAY ===\n`;
    ascii += `Observation Mode: Low-Level Matrix\n\n`;
    const slice = nodes.filter(n => Math.abs(n.z) < 1).slice(0, 500);
    const sorted = [...slice].sort((a,b) => (a.y - b.y) || (a.x - b.x));
    
    let currentY = -999;
    sorted.forEach(n => {
      if (Math.abs(n.y - currentY) > 0.6) {
        ascii += '\n';
        currentY = n.y;
      }
      const char = n.isExcited ? '✸' : '·';
      ascii += `${char}${n.state} `;
    });
    return ascii;
  };

  return (
    <div className="relative w-full h-full bg-[#020202] overflow-hidden">
      {/* HUD: View Control */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 z-20 shadow-[0_0_40px_-10px_rgba(0,0,0,1)]">
        <button 
          onClick={() => setViewMode('3d')} 
          className={`flex items-center px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-500 ${viewMode === '3d' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <Box className="w-3.5 h-3.5 mr-2" /> 3D TOPOLOGY
        </button>
        <button 
          onClick={() => setViewMode('2d')} 
          className={`flex items-center px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-500 ${viewMode === '2d' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <Grid2X2 className="w-3.5 h-3.5 mr-2" /> 2D PROJECTION
        </button>
        <button 
          onClick={() => setViewMode('ascii')} 
          className={`flex items-center px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-500 ${viewMode === 'ascii' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <Type className="w-3.5 h-3.5 mr-2" /> DATA ARRAY
        </button>
      </div>

      {/* Main Rendering Engine */}
      {viewMode === 'ascii' ? (
        <div className="w-full h-full p-24 overflow-auto font-mono text-[10px] text-emerald-500/80 leading-[1.1] tracking-tighter whitespace-pre bg-[#010101] selection:bg-emerald-500/20">
          {generateASCII()}
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full" style={{ background: 'radial-gradient(circle at 50% 50%, #080808 0%, #000 100%)' }} />
      )}

      {/* Dynamic Legend */}
      <div className="absolute top-6 right-6 flex flex-col items-end space-y-3 pointer-events-none">
        <div className="glass p-4 rounded-2xl border border-white/5 text-[10px] text-gray-400 space-y-3 shadow-xl backdrop-blur-3xl">
            <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> 
                <span className="font-semibold text-gray-300 tracking-tight">Potencial 'a'</span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> 
                <span className="font-semibold text-gray-300 tracking-tight">Potencial 'b'</span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
                <span className="font-semibold text-gray-300 tracking-tight">Potencial 'c'</span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/10 italic text-[9px] flex items-center text-cyan-700">
                <Zap className="w-2.5 h-2.5 mr-1.5" /> Radio ∝ E (Energía)
            </div>
        </div>
      </div>

      {/* Detailed Node Inspector */}
      {hovered && (
        <div className="absolute bottom-8 left-8 glass p-6 rounded-[2rem] border border-cyan-500/20 w-72 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300 backdrop-blur-3xl">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center space-x-2 text-[10px] px-3 py-1 rounded-full font-black tracking-tighter uppercase ${hovered.isExcited ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-800/40 text-gray-500 border border-white/5'}`}>
              {hovered.isExcited ? <Zap className="w-2.5 h-2.5 animate-pulse" /> : <Box className="w-2.5 h-2.5" />}
              <span>{hovered.isExcited ? 'EXCITADO' : 'BASAL'}</span>
            </div>
            <span className="text-[10px] mono text-gray-600 font-bold uppercase">ID {hovered.id}</span>
          </div>
          <div className="space-y-3 mono text-xs">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-gray-500 text-[9px] uppercase tracking-widest">Simetría</span>
              <span className="text-white font-black text-sm">{hovered.state.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-gray-500 text-[9px] uppercase tracking-widest">Energía (E)</span>
              <span className="text-cyan-400 font-bold tracking-tighter">{hovered.energy.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-gray-500 text-[9px] uppercase tracking-widest">Curvatura (Z)</span>
              <span className="text-purple-400 font-bold">{hovered.z.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[9px] pt-1 text-gray-500">
                <span>COORDENADAS LOCALES</span>
                <span className="italic">X:{hovered.x.toFixed(2)} Y:{hovered.y.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="absolute bottom-6 right-8 text-[9px] mono text-gray-700 tracking-[0.4em] uppercase font-bold pointer-events-none select-none flex items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-900 mr-2" />
        PAN: LEFT-CLICK • ZOOM: SCROLL • HOVER: PROBE
      </div>
    </div>
  );
};

export default QuantumView;
