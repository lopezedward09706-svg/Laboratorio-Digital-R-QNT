
import React, { useState, useCallback, useMemo } from 'react';
import { ABCParams, QuantumNode, SimulationResult, ValidationMetrics } from './types';
import SimulationControls from './components/SimulationControls';
import QuantumView from './components/QuantumView';
import AIAssistant from './components/AIAssistant';
// Added Atom to the import list to fix 'Cannot find name Atom' error
import { Activity, ShieldCheck, Target, Atom } from 'lucide-react';

const App: React.FC = () => {
  const [nodeCount, setNodeCount] = useState(800);
  const [params, setParams] = useState<ABCParams>({
    a: 0.159155,
    b: 0.158456,
    c: 0.158456,
    alpha: 0.007297,
    alpha_w: 0.0339,
    alpha_s: 0.118
  });
  const [nodes, setNodes] = useState<QuantumNode[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const calculateMetrics = useCallback((currentNodes: QuantumNode[]): ValidationMetrics => {
    // Teoria ABC Math
    const electronPred = Math.abs(params.a - params.b - params.c) * params.alpha * 650; // Scaled to MeV approx
    const protonPred = (2 * params.a + params.b) * params.alpha_s * 1200; // Scaled for demo
    const G_base = 6.6743e-11;
    const G_pred = G_base * ((params.a + params.b + params.c) / 0.476);

    const actualE = 0.5109;
    const actualP = 938.27;
    const actualG = 6.6743e-11;

    const errorE = Math.abs(electronPred - actualE) / actualE * 100;
    const errorP = Math.abs(protonPred - actualP) / actualP * 100;
    const errorG = Math.abs(G_pred - actualG) / actualG * 100;

    const match = Math.max(0, 100 - (errorE + errorP + errorG) / 3);

    return {
      electronMass: { predicted: electronPred, actual: actualE, error: errorE },
      protonMass: { predicted: protonPred, actual: actualP, error: errorP },
      G: { predicted: G_pred, actual: actualG, error: errorG },
      matchPercentage: match
    };
  }, [params]);

  const lastSim = useMemo(() => {
    if (nodes.length === 0) return null;
    return {
      nodes,
      timestamp: new Date().toISOString(),
      config: { nodeCount, params },
      metrics: calculateMetrics(nodes)
    } as SimulationResult;
  }, [nodes, nodeCount, params, calculateMetrics]);

  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      const newNodes: QuantumNode[] = [];
      const side = Math.ceil(Math.sqrt(nodeCount));
      const spacing = 1.2;

      for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / side);
        const col = i % side;
        const stateIdx = (row + col) % 3;
        const state = ['a', 'b', 'c'][stateIdx] as 'a' | 'b' | 'c';
        
        newNodes.push({
          id: i,
          state,
          energy: params[state],
          x: (col - side/2) * spacing,
          y: (row - side/2) * spacing,
          z: (Math.random() * 4) - 2,
          isExcited: false
        });
      }
      setNodes(newNodes);
      setIsSimulating(false);
    }, 600);
  }, [nodeCount, params]);

  const addMass = useCallback(() => {
    if (nodes.length === 0) return;
    setNodes(prev => prev.map(n => {
      const dist = Math.sqrt(n.x**2 + n.y**2 + n.z**2);
      if (dist < 4 && Math.random() > 0.5) {
        return { 
          ...n, 
          isExcited: true, 
          state: n.state.toUpperCase() as any,
          energy: n.energy * 1.5,
          z: n.z + (Math.random() * 2) 
        };
      }
      return n;
    }));
  }, [nodes]);

  const resetSim = () => setNodes([]);

  const exportData = () => {
    if (!lastSim) return;
    const report = `--- REPORTE TEORÍA ABC ---\nTimestamp: ${lastSim.timestamp}\n\n` +
      `PARAMETROS:\na: ${params.a}\nb: ${params.b}\nc: ${params.c}\n\n` +
      `VALIDACION:\nElectron: ${lastSim.metrics.electronMass.predicted.toFixed(4)} MeV\n` +
      `Proton: ${lastSim.metrics.protonMass.predicted.toFixed(2)} MeV\n` +
      `G: ${lastSim.metrics.G.predicted.toExponential(4)}\n` +
      `COINCIDENCIA: ${lastSim.metrics.matchPercentage.toFixed(2)}%`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abc-theory-report-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black selection:bg-cyan-500/30">
      <SimulationControls 
        nodeCount={nodeCount} setNodeCount={setNodeCount}
        params={params} setParams={setParams}
        onRun={runSimulation} onReset={resetSim}
        onExport={exportData} onAddMass={addMass}
        isSimulating={isSimulating}
      />
      
      <main className="flex-1 relative flex flex-col">
        {/* TOP METRICS BAR */}
        {lastSim && (
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between gap-4 pointer-events-none">
            <div className="glass px-6 py-4 rounded-2xl border border-white/5 flex items-center space-x-6 backdrop-blur-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center">
                  <Activity className="w-3 h-3 mr-2 text-cyan-400" /> Coincidencia Global
                </span>
                <span className="text-2xl font-black text-white mono">
                  {lastSim.metrics.matchPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Electron (MeV)</p>
                  <p className="text-xs text-white mono">{lastSim.metrics.electronMass.predicted.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Protón (MeV)</p>
                  <p className="text-xs text-white mono">{lastSim.metrics.protonMass.predicted.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Constante G</p>
                  <p className="text-xs text-white mono">{lastSim.metrics.G.predicted.toExponential(2)}</p>
                </div>
              </div>
            </div>

            <div className="glass px-4 py-2 rounded-xl border border-white/5 flex items-center space-x-3 self-start">
               <ShieldCheck className="w-4 h-4 text-green-500" />
               <span className="text-[10px] mono text-gray-400">ESTADO: RED ESTABLE</span>
            </div>
          </div>
        )}

        <div className="flex-1">
          {nodes.length > 0 ? (
            <QuantumView nodes={nodes} />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-12">
              <div className="max-w-md space-y-6">
                <div className="w-24 h-24 bg-cyan-900/10 rounded-full border border-cyan-500/20 flex items-center justify-center mx-auto animate-pulse">
                  <Atom className="w-10 h-10 text-cyan-500/50" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Cámara de Vacío ABC</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ajusta los valores de <strong>a, b, c</strong> y colapsa la red para observar la emergencia de la gravedad.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STATUS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 glass rounded-full border border-white/5 text-[9px] text-gray-600 mono uppercase tracking-widest flex items-center">
          <Target className="w-3 h-3 mr-2 text-cyan-800" />
          Teoría ABC - Métrica Planck v2.0
        </div>
      </main>

      <AIAssistant currentSim={lastSim} />
    </div>
  );
};

export default App;
