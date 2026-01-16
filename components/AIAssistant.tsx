
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, MessageSquare, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { chatWithAssistant, analyzeSimulation } from '../services/geminiService';
import { SimulationResult, ChatMessage } from '../types';

interface Props {
  currentSim: SimulationResult | null;
}

const AIAssistant: React.FC<Props> = ({ currentSim }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAssistant(input, []);
      const aiMsg: ChatMessage = { role: 'model', content: response, timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', content: "Hubo un error al conectar con el asistente cuántico.", timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const runAnalysis = async () => {
    if (!currentSim || isAnalyzing) return;
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeSimulation(currentSim);
      const aiMsg: ChatMessage = { 
        role: 'model', 
        content: `### ANÁLISIS DE LA SIMULACIÓN\n${analysis}`, 
        timestamp: new Date().toLocaleTimeString() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass border-l border-white/10 w-96 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="text-purple-400 w-5 h-5" />
          <h2 className="font-bold text-sm tracking-wide text-white">ASISTENTE DE IA</h2>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={!currentSim || isAnalyzing}
          className="text-[10px] bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 flex items-center transition-all disabled:opacity-30"
        >
          {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
          Analizar Red
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-50">
            <MessageSquare className="w-10 h-10 text-gray-600" />
            <p className="text-xs text-gray-400 italic">
              "La red espera observación. Colapsa la función de onda o haz una pregunta sobre la torsión de Cartan."
            </p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              m.role === 'user' 
                ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/30 rounded-tr-none' 
                : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'
            }`}>
              {m.content.split('\n').map((line, idx) => (
                <p key={idx} className={line.startsWith('###') ? 'font-bold text-purple-400 mt-2 mb-1' : 'mb-1'}>
                  {line.replace('###', '')}
                </p>
              ))}
              <span className="block text-[8px] mt-1 text-gray-600 mono">{m.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500 text-[10px] mono">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>GEMINI PRO PENSANDO...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre la física..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 pr-12"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 p-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
