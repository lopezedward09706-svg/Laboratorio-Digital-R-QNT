
import React from 'react';
import { ABCParams } from '../types';
import { Settings, Play, Download, Trash2, Atom, Layers, Zap } from 'lucide-react';

interface Props {
  nodeCount: number;
  setNodeCount: (n: number) => void;
  params: ABCParams;
  setParams: (p: ABCParams) => void;
  onRun: () => void;
  onReset: () => void;
  onExport: () => void;
  onAddMass: () => void;
  isSimulating: boolean;
}

const SimulationControls: React.FC<Props> = ({
  nodeCount, setNodeCount, params, setParams, onRun, onReset, onExport, onAddMass, isSimulating
}) => {
  const updateParam = (key: keyof ABCParams, val: number) => {
    setParams({ ...params, [key]: val });
  };

  return (
    <div className="flex flex-col h-full glass p-6 border-r border-white/10 w-80 space-y-6 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-cyan-500/20 p-2 rounded-lg">
          <Atom className="text-cyan-400 w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">ABC Simulator</h1>
      </div>

      {/* VALORES FUNDAMENTALES */}
      <div className="space-y-4">
        <label className="flex items-center text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">
          <Layers className="w-3 h-3 mr-2" />
          Valores Fundamentales (m_P)
        </label>
        
        {['a', 'b', 'c'].map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-[10px] mono text-gray-400">
              <span>Constante {key.toUpperCase()}</span>
              <span className="text-white">{params[key as keyof ABCParams].toFixed(6)}</span>
            </div>
            <input 
              type="range" 
              min="0.150" 
              max="0.170" 
              step="0.0001"
              value={params[key as keyof ABCParams]} 
              onChange={(e) => updateParam(key as keyof ABCParams, parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        ))}
      </div>

      {/* CONSTANTES DE ACOPLAMIENTO */}
      <div className="space-y-4 pt-2 border-t border-white/5">
        <label className="flex items-center text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">
          <Zap className="w-3 h-3 mr-2" />
          Acoplamientos (α)
        </label>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 mono">α (EM): {params.alpha.toFixed(6)}</span>
            <input 
              type="range" min="0.005" max="0.010" step="0.00001"
              value={params.alpha} onChange={(e) => updateParam('alpha', parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 accent-purple-500"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 mono">α_s (Fuerte): {params.alpha_s.toFixed(3)}</span>
            <input 
              type="range" min="0.05" max="0.20" step="0.001"
              value={params.alpha_s} onChange={(e) => updateParam('alpha_s', parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 accent-purple-500"
            />
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="space-y-3 pt-4">
        <button 
          onClick={onRun}
          disabled={isSimulating}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-lg shadow-cyan-900/20"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSimulating ? 'SIMULANDO...' : 'COLAPSAR RED'}
        </button>

        <button 
          onClick={onAddMass}
          className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/30 font-bold py-2 rounded-lg flex items-center justify-center transition-all"
        >
          <Zap className="w-4 h-4 mr-2" /> INYECTAR MASA
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onExport} className="bg-gray-900 text-gray-400 py-2 rounded border border-white/5 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors flex items-center justify-center">
            <Download className="w-3 h-3 mr-1" /> Exportar
          </button>
          <button onClick={onReset} className="bg-gray-900 text-gray-400 py-2 rounded border border-white/5 text-[10px] uppercase font-bold tracking-widest hover:text-red-400 transition-colors flex items-center justify-center">
            <Trash2 className="w-3 h-3 mr-1" /> Limpiar
          </button>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
         <div className="text-[9px] mono text-gray-600 leading-relaxed uppercase">
          Propulsado por Teoría ABC<br/>
          <span className="text-cyan-800">Geometría de Cartan Discreta</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
