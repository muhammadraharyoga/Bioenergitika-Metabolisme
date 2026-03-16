import React, { useState, useEffect } from 'react';
import { Activity, RefreshCcw, Zap, ArrowRight, ArrowDown, ArrowUp, Database, ShieldAlert, Cpu, Power, Settings2, Dna, Waves, PlusCircle, MinusCircle } from 'lucide-react';

// --- INJECTED CSS UNTUK ANIMASI ---
const CustomStyles = () => (
  <style>{`
    @keyframes flow-down { 0% { transform: translateY(-20px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(40px); opacity: 0; } }
    @keyframes flow-up { 0% { transform: translateY(40px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-20px); opacity: 0; } }
    @keyframes orbit { 0% { transform: rotate(0deg) translateX(120px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
    @keyframes electron-move { 0% { left: 0%; opacity: 0; transform: scale(0.5); } 10% { opacity: 1; transform: scale(1); } 90% { opacity: 1; transform: scale(1); } 100% { left: 100%; opacity: 0; transform: scale(0.5); } }
    @keyframes proton-pump { 0% { bottom: 0%; opacity: 0; } 50% { opacity: 1; } 100% { bottom: 120%; opacity: 0; } }
    @keyframes atp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 80% { transform: scale(1.2); opacity: 0; } 100% { transform: scale(0.8); opacity: 0; } }
    
    .animate-flow-down { animation: flow-down 1.5s infinite linear; }
    .animate-flow-up { animation: flow-up 1.5s infinite linear; }
    .animate-orbit { animation: orbit 10s infinite linear; position: absolute; top: 50%; left: 50%; margin-top: -8px; margin-left: -8px; }
    .animate-electron { animation: electron-move 3s infinite linear; position: absolute; }
    .animate-proton { animation: proton-pump 1.5s infinite ease-out; position: absolute; }
    .animate-rotor { animation: atp-spin 1s infinite linear; transform-origin: center; }
    .animate-pulse-ring { animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// --- DATA STRUKTUR JALUR ---
const glycolysisSteps = [
  { id: 1, sub: "Glukosa", enz: "Heksokinase / Glukokinase", prod: "Glukosa-6-Fosfat (G6P)", energy: "-1 ATP", bypassEnz: "Glukosa-6-Fosfatase", isIreversible: true },
  { id: 2, sub: "G6P", enz: "Fosfoheksosa Isomerase", prod: "Fruktosa-6-Fosfat (F6P)", energy: "", isIreversible: false },
  { id: 3, sub: "F6P", enz: "Fosfofruktokinase-1 (PFK-1)", prod: "Fruktosa-1,6-Bisfosfat", energy: "-1 ATP", bypassEnz: "Fruktosa-1,6-Bisfosfatase", isIreversible: true },
  { id: 4, sub: "F1,6BP", enz: "Aldolase", prod: "Gliseraldehid-3-P (G3P) + DHAP", energy: "", isIreversible: false },
  { id: 5, sub: "DHAP", enz: "Triosa Fosfat Isomerase", prod: "G3P (Total 2 molekul G3P)", energy: "", isIreversible: false },
  { id: 6, sub: "G3P (x2)", enz: "GAP Dehidrogenase", prod: "1,3-Bisfosfogliserat (1,3-BPG)", energy: "+2 NADH", isIreversible: false },
  { id: 7, sub: "1,3-BPG", enz: "Fosfogliserat Kinase", prod: "3-Fosfogliserat (3-PG)", energy: "+2 ATP", isIreversible: false },
  { id: 8, sub: "3-PG", enz: "Fosfogliserat Mutase", prod: "2-Fosfogliserat (2-PG)", energy: "", isIreversible: false },
  { id: 9, sub: "2-PG", enz: "Enolase", prod: "Fosfoenolpiruvat (PEP)", energy: "-2 H₂O", isIreversible: false },
  { id: 10, sub: "PEP", enz: "Piruvat Kinase", prod: "Piruvat", energy: "+2 ATP", bypassEnz: "Piruvat Karboksilase & PEPCK", isIreversible: true }
];

const krebsSteps = [
  { id: 1, sub: "Asetil-KoA + Oksaloasetat", enz: "Sitrat Sintase", prod: "Sitrat", output: "KoA-SH" },
  { id: 2, sub: "Sitrat", enz: "Akonitase", prod: "Isositrat", output: "Isomerisasi" },
  { id: 3, sub: "Isositrat", enz: "Isositrat Dehidrogenase", prod: "α-Ketoglutarat", output: "NADH, CO₂" },
  { id: 4, sub: "α-Ketoglutarat", enz: "α-KG Dehidrogenase Kompleks", prod: "Suksinil-KoA", output: "NADH, CO₂" },
  { id: 5, sub: "Suksinil-KoA", enz: "Suksinil-KoA Sintetase", prod: "Suksinat", output: "GTP (ATP)" },
  { id: 6, sub: "Suksinat", enz: "Suksinat Dehidrogenase (Kompleks II)", prod: "Fumarat", output: "FADH₂" },
  { id: 7, sub: "Fumarat", enz: "Fumarase", prod: "Malat", output: "H₂O Masuk" },
  { id: 8, sub: "Malat", enz: "Malat Dehidrogenase", prod: "Oksaloasetat", output: "NADH" }
];

const MetabolismMap = () => {
  const [activeTab, setActiveTab] = useState('glycolysis');
  const [showGluconeogenesis, setShowGluconeogenesis] = useState(false);
  
  // Simulator State
  const [energyState, setEnergyState] = useState('normal'); 
  const [isSimulating, setIsSimulating] = useState(true);

  const tabs = [
    { id: 'glycolysis', name: 'Glikolisis & Glukoneogenesis', icon: <ArrowDown className="w-4 h-4" /> },
    { id: 'krebs', name: 'Siklus Krebs', icon: <RefreshCcw className="w-4 h-4" /> },
    { id: 'rte', name: 'RTE (Fosforilasi Oksidatif)', icon: <Waves className="w-4 h-4" /> },
    { id: 'simulator', name: 'Macro Simulator', icon: <Power className="w-4 h-4" /> }
  ];

  // ================= TAB 1: GLIKOLISIS & GLUKONEOGENESIS =================
  const renderGlycolysis = () => (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-500" /> Mesin Glikolisis (Sitosol)
          </h2>
          <p className="text-sm text-slate-500 mt-1">10 Langkah pemecahan Glukosa (6C) menjadi 2 Piruvat (3C).</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-sm font-bold text-slate-700">Mode Fluks:</span>
          <button 
            onClick={() => setShowGluconeogenesis(false)}
            className={`px-4 py-2 rounded font-bold text-xs transition-colors ${!showGluconeogenesis ? 'bg-blue-500 text-white shadow' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
          >
            GLIKOLISIS (Katabolik)
          </button>
          <button 
            onClick={() => setShowGluconeogenesis(true)}
            className={`px-4 py-2 rounded font-bold text-xs transition-colors ${showGluconeogenesis ? 'bg-purple-500 text-white shadow' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
          >
            GLUKONEOGENESIS (Anabolik)
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-2xl bg-slate-50 rounded-2xl p-8 border-2 border-slate-200 shadow-inner overflow-hidden">
        {/* Animated Background Flow Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-200 -translate-x-1/2 rounded-full z-0 overflow-hidden">
          {!showGluconeogenesis ? (
            <div className="w-full h-12 bg-blue-400 rounded-full animate-flow-down shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          ) : (
            <div className="w-full h-12 bg-purple-400 rounded-full animate-flow-up shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{animationDuration: '2s'}}></div>
          )}
        </div>

        <div className="relative z-10 space-y-2">
          {glycolysisSteps.map((step, index) => (
            <div key={step.id} className="flex items-center w-full">
              
              {/* Kiri: Energi / Bypass Info */}
              <div className="w-5/12 text-right pr-6 flex flex-col items-end justify-center min-h-[60px]">
                {step.energy && !showGluconeogenesis && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${step.energy.includes('-') ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-green-100 text-green-600 border border-green-200'}`}>
                    {step.energy}
                  </span>
                )}
                {step.bypassEnz && showGluconeogenesis && (
                  <div className="bg-purple-100 border border-purple-300 p-2 rounded text-right shadow-sm relative animate-pulse">
                    <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-purple-500"><ArrowUp className="w-5 h-5"/></span>
                    <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Enzim Bypass</p>
                    <p className="text-xs font-bold text-purple-900">{step.bypassEnz}</p>
                    {step.id === 10 && <p className="text-[9px] text-purple-700 mt-1">(-2 ATP, -2 GTP diubah via OAA)</p>}
                  </div>
                )}
              </div>

              {/* Tengah: Node */}
              <div className="w-2/12 flex flex-col items-center justify-center relative">
                <div className="bg-white border-2 border-slate-300 w-32 text-center p-2 rounded-lg text-xs font-bold text-slate-700 shadow-sm relative z-10">
                  {step.sub}
                </div>
                {index < glycolysisSteps.length - 1 && (
                   <div className="h-10 border-l-2 border-dashed border-slate-400 my-1"></div>
                )}
              </div>

              {/* Kanan: Enzim Utama (Glikolisis) */}
              <div className="w-5/12 pl-6 flex flex-col justify-center min-h-[60px]">
                <div className={`p-2 rounded border text-xs shadow-sm transition-opacity duration-300 ${showGluconeogenesis && step.isIreversible ? 'bg-slate-200 border-slate-300 opacity-30 line-through' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                  <span className="font-bold">{step.enz}</span>
                  {step.isIreversible && !showGluconeogenesis && (
                    <span className="block text-[9px] text-red-500 font-bold uppercase mt-1">Ireversibel (Kritis)</span>
                  )}
                </div>
              </div>

            </div>
          ))}
          
          {/* Hasil Akhir */}
          <div className="flex items-center w-full mt-4">
             <div className="w-5/12"></div>
             <div className="w-2/12 flex justify-center">
               <div className="bg-yellow-200 border-2 border-yellow-500 w-32 text-center p-3 rounded-lg text-sm font-black text-yellow-900 shadow-md">
                 {showGluconeogenesis ? 'GLUKOSA' : 'PIRUVAT (x2)'}
               </div>
             </div>
             <div className="w-5/12 pl-6">
                {!showGluconeogenesis && (
                  <div className="text-[10px] font-bold text-green-700 bg-green-100 p-2 rounded border border-green-300 inline-block">
                    Netto: +2 ATP, +2 NADH
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ================= TAB 2: SIKLUS KREBS =================
  const renderKrebs = () => (
    <div className="p-6">
      <div className="w-full bg-slate-900 text-white rounded-xl shadow-2xl p-6 mb-6 flex flex-col md:flex-row gap-8 items-center border border-slate-700">
        
        {/* Kiri: Diagram Lingkaran Animasi */}
        <div className="w-full md:w-1/2 flex justify-center items-center relative h-[400px]">
           {/* Masukan Piruvat */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
             <div className="bg-yellow-100 text-yellow-900 text-xs font-bold px-3 py-1 rounded border-2 border-yellow-500">PIRUVAT</div>
             <ArrowDown className="text-yellow-500 my-1 animate-bounce" />
             <div className="bg-orange-100 text-orange-900 text-[10px] font-bold p-1 rounded border border-orange-400">Kompleks PDH (Melepas NADH, CO₂)</div>
             <ArrowDown className="text-orange-500 my-1" />
             <div className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.6)] z-20 relative">
               ASETIL-KoA (2C)
             </div>
           </div>

           {/* Circular Track */}
           <div className="relative w-64 h-64 border-4 border-dashed border-slate-600 rounded-full mt-24 flex items-center justify-center">
             {/* Animasi Partikel Orbit */}
             <div className="w-4 h-4 bg-orange-400 rounded-full animate-orbit shadow-[0_0_15px_rgba(249,115,22,1)]"></div>
             
             <div className="text-center">
               <div className="text-2xl font-black text-slate-700 opacity-50">KREBS</div>
               <div className="text-[10px] font-bold text-slate-500">MATRIKS</div>
             </div>

             {/* Nodes Positioned in Circle */}
             <div className="absolute -top-6 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">Sitrat (6C)</div>
             <div className="absolute top-8 -right-8 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">Isositrat (6C)</div>
             <div className="absolute top-24 -right-12 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">α-KG (5C)</div>
             <div className="absolute bottom-8 -right-8 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">Suksinil-KoA (4C)</div>
             <div className="absolute -bottom-6 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">Suksinat (4C)</div>
             <div className="absolute bottom-8 -left-8 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">Fumarat (4C)</div>
             <div className="absolute top-24 -left-10 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600">Malat (4C)</div>
             <div className="absolute top-8 -left-12 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-600 z-10">Oksaloasetat (4C)</div>
           </div>
        </div>

        {/* Kanan: Detail Langkah */}
        <div className="w-full md:w-1/2 space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-lg font-bold text-orange-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Database className="w-5 h-5"/> Rincian Reaksi Enzimatis
          </h3>
          {krebsSteps.map(step => (
            <div key={step.id} className="bg-slate-800 p-3 rounded-lg border border-slate-600 flex flex-col relative overflow-hidden group hover:border-orange-500 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded">Langkah {step.id}</span>
                {step.output && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${step.output.includes('NADH') || step.output.includes('FADH') || step.output.includes('GTP') ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                    {step.output}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-200">{step.sub} <ArrowRight className="inline w-3 h-3 text-slate-500 mx-1"/> <span className="text-orange-300">{step.prod}</span></div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500"/> {step.enz}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ================= TAB 3: RANTAI TRANSPOR ELEKTRON (3D Engine) =================
  const renderRTEDynamic = () => (
    <div className="p-6">
      <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden min-h-[500px] border border-zinc-700">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-cyan-400">
          <Waves /> Rantai Transpor Elektron (Mesin Molekuler)
        </h3>
        <p className="text-xs text-zinc-400 mb-12">Tahap akhir beromzet tinggi: Elektron (kuning) mengalir antar kompleks, memompa Proton (biru) ke ruang antarmembran. ATP Sintase memanfaatkan gradien ini.</p>

        {/* Membran Matrix & Intermembrane */}
        <div className="absolute top-24 left-0 w-full h-32 bg-blue-900/20 border-b border-blue-500/30">
           <div className="absolute top-2 left-4 text-blue-300/50 text-[10px] font-bold tracking-[0.2em] flex flex-col gap-1">
             <span>RUANG ANTARMEMBRAN</span>
             <span>[H+] TINGGI • pH RENDAH</span>
           </div>
           {/* Static Protons Grid */}
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#60a5fa_1px,_transparent_2px)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-48 bg-orange-900/10 border-t border-orange-500/30 pt-4">
           <div className="absolute top-2 left-4 text-orange-300/50 text-[10px] font-bold tracking-[0.2em] flex flex-col gap-1">
             <span>MATRIKS MITOKONDRIA</span>
             <span>[H+] RENDAH • pH TINGGI</span>
           </div>
        </div>

        {/* Membrane Layer */}
        <div className="relative w-full h-16 bg-zinc-800 border-y-2 border-zinc-600 top-32 flex items-center justify-between px-4 md:px-12 z-10">
          
          {/* Alur Elektron SVG Path */}
          <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 pointer-events-none" preserveAspectRatio="none">
            <path d="M 50 16 Q 100 16 120 32 T 220 32 T 240 0 T 350 0 T 370 40" fill="none" stroke="rgba(250,204,21,0.3)" strokeWidth="3" strokeDasharray="6 6" className="animate-pulse"/>
          </svg>

          {/* Kompleks I */}
          <div className="relative group flex flex-col items-center">
            <div className="w-14 md:w-16 h-24 bg-purple-600/90 border border-purple-400 rounded-xl transform -translate-y-4 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] z-20">I</div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-proton"></div>
            <div className="absolute -bottom-12 text-center w-20">
              <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 px-1 rounded">NADH <ArrowRight className="inline w-3 h-3 text-yellow-400"/> NAD⁺</span>
            </div>
            <div className="absolute -top-12 text-[10px] font-bold text-blue-300">4 H⁺</div>
          </div>

          {/* Kompleks II (Suksinat DH) */}
          <div className="relative group flex flex-col items-center mt-12">
            <div className="w-12 h-16 bg-emerald-600/90 border border-emerald-400 rounded-lg flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20">II</div>
            <div className="absolute -bottom-10 text-center w-24">
              <span className="text-[9px] font-bold text-zinc-300 bg-zinc-800 px-1 rounded">Suksinat (FADH₂)</span>
            </div>
          </div>

          {/* Q Coenzyme */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-zinc-900 shadow-[0_0_10px_rgba(234,179,8,0.5)] z-20">Q</div>

          {/* Kompleks III */}
          <div className="relative flex flex-col items-center">
            <div className="w-12 md:w-14 h-20 bg-pink-600/90 border border-pink-400 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(236,72,153,0.4)] z-20">III</div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-proton [animation-delay:0.5s]"></div>
            <div className="absolute -top-12 text-[10px] font-bold text-blue-300">4 H⁺</div>
          </div>

          {/* Cyt C */}
          <div className="w-6 h-6 md:w-8 md:h-8 bg-cyan-400 rounded-full flex items-center justify-center font-bold text-zinc-900 shadow-[0_0_10px_rgba(34,211,238,0.5)] -mt-16 z-20">c</div>

          {/* Kompleks IV */}
          <div className="relative flex flex-col items-center">
            <div className="w-14 md:w-16 h-24 bg-orange-600/90 border border-orange-400 rounded-xl transform -translate-y-4 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] z-20">IV</div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-proton [animation-delay:1s]"></div>
            <div className="absolute -bottom-12 text-center w-24">
              <span className="text-[10px] font-bold text-cyan-200 bg-zinc-800 px-1 rounded">½O₂ + 2H⁺ → H₂O</span>
            </div>
            <div className="absolute -top-12 text-[10px] font-bold text-blue-300">2 H⁺</div>
          </div>

          {/* ATP Synthase */}
          <div className="relative ml-8 md:ml-16 flex flex-col items-center">
            <div className="absolute -top-16 text-blue-300 font-bold text-[10px] animate-bounce">Aliran H⁺</div>
            <div className={`w-10 md:w-12 h-16 bg-red-600/80 border-2 border-red-400 rounded-t-lg -mt-16 z-20 flex justify-center overflow-hidden animate-rotor`}>
               <div className="w-2 h-full bg-red-800/50"></div>
            </div>
            <div className={`w-16 md:w-20 h-16 bg-rose-500 rounded-b-full border-x-2 border-b-2 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.8)] flex flex-col items-center justify-center font-bold z-20 text-white`}>
              ATP<br/><span className="text-[8px] font-normal">Sintase</span>
            </div>
            <div className="absolute -bottom-10 text-[10px] font-bold text-yellow-400 bg-zinc-800 px-2 py-1 rounded shadow-lg border border-yellow-700 whitespace-nowrap">ADP + Pi → <span className="text-white">ATP</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  // ================= TAB 4: MACRO SIMULATOR (Control Panel) =================
  const renderSimulator = () => (
    <div className="p-6 space-y-6 flex flex-col items-center">
      <div className="w-full bg-slate-800 rounded-xl p-4 text-white flex flex-col md:flex-row justify-between items-center shadow-lg border border-slate-600">
        <div className="mb-4 md:mb-0">
          <h3 className="font-bold flex items-center gap-2 text-lg"><Cpu className="text-blue-400"/> Simulator Dinamika Sel</h3>
          <p className="text-xs text-slate-400">Amati bagaimana status energi (Rasio ATP/AMP) mengubah aliran karbon.</p>
        </div>
        <div className="flex gap-2 bg-slate-700 p-2 rounded-lg">
          <button onClick={() => {setEnergyState('low'); setIsSimulating(true);}} className={`px-4 py-2 text-xs font-bold rounded shadow transition-all ${energyState === 'low' ? 'bg-red-500 text-white scale-105' : 'bg-slate-800 text-slate-300 hover:bg-slate-600'}`}>Olahraga Berat (ATP Habis)</button>
          <button onClick={() => {setEnergyState('normal'); setIsSimulating(true);}} className={`px-4 py-2 text-xs font-bold rounded shadow transition-all ${energyState === 'normal' ? 'bg-blue-500 text-white scale-105' : 'bg-slate-800 text-slate-300 hover:bg-slate-600'}`}>Istirahat Normal</button>
          <button onClick={() => {setEnergyState('high'); setIsSimulating(true);}} className={`px-4 py-2 text-xs font-bold rounded shadow transition-all ${energyState === 'high' ? 'bg-green-500 text-white scale-105' : 'bg-slate-800 text-slate-300 hover:bg-slate-600'}`}>Kenyang (ATP Penuh)</button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
        {/* Sitosol Macro */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 relative shadow-inner">
           <div className="absolute top-4 left-4 font-black text-slate-300 text-2xl tracking-widest uppercase">Sitosol</div>
           
           <div className="flex flex-col items-center mt-12 h-full relative z-10">
             <div className="bg-blue-500 text-white font-bold px-6 py-3 rounded-lg shadow-md">GLUKOSA Darah</div>
             
             {/* Dynamic Arrow */}
             <div className="flex flex-col items-center my-4 h-24">
                <div className={`w-2 transition-all duration-500 ${energyState === 'high' ? 'bg-slate-300 h-full' : 'bg-blue-300 h-full'}`}></div>
                {energyState !== 'high' && <ArrowDown className="text-blue-500 animate-bounce -mt-4" />}
                {energyState === 'high' && <div className="absolute mt-8 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-300">Dihambat oleh ATP (PFK-1)</div>}
             </div>

             <div className="bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-lg shadow-md">PIRUVAT</div>

             {/* Anaerobic switch */}
             <div className={`mt-8 transition-all duration-500 w-full flex justify-center ${energyState === 'low' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
               <div className="bg-red-50 border-2 border-red-400 p-4 rounded-xl flex items-center gap-4">
                 <ArrowRight className="text-red-500 rotate-180" />
                 <div>
                   <div className="font-bold text-red-700">Fermentasi Laktat</div>
                   <div className="text-xs text-red-600 font-medium mt-1">Siklus Cori aktif. Mengoksidasi NADH kembali menjadi NAD⁺ agar glikolisis bisa terus berjalan tanpa Oksigen.</div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Mitokondria Macro */}
        <div className="bg-orange-50 border-4 border-orange-300 rounded-[3rem] p-6 relative shadow-inner flex flex-col items-center">
           <div className="absolute top-4 right-6 font-black text-orange-200 text-2xl tracking-widest uppercase text-right">Matriks<br/>Mitokondria</div>
           
           <div className={`mt-24 transition-all duration-500 flex flex-col items-center ${energyState === 'high' ? 'opacity-30' : 'opacity-100'}`}>
             <div className="bg-orange-500 text-white font-bold px-6 py-3 rounded-lg shadow-lg z-10 relative">
                Siklus Krebs & RTE Aktif
                {energyState === 'low' && <div className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full animate-ping"></div>}
             </div>
             
             <div className="mt-8 relative w-40 h-40">
               <div className={`absolute inset-0 border-8 border-orange-300 border-t-orange-500 rounded-full ${isSimulating && energyState !== 'high' ? 'animate-spin' : ''}`} style={{animationDuration: energyState === 'low' ? '1s' : '3s'}}></div>
               <div className="absolute inset-0 flex items-center justify-center font-black text-orange-400 text-xl">ATP</div>
             </div>
             
             {energyState === 'low' && <p className="text-xs text-center font-bold text-orange-700 mt-6 bg-orange-100 p-2 rounded border border-orange-300">Mesin berputar maksimal mencoba memenuhi defisit ATP otot.</p>}
           </div>

           {energyState === 'high' && (
             <div className="absolute inset-0 bg-slate-900/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-[1px]">
               <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-green-500 text-center max-w-[250px]">
                 <ShieldAlert className="w-8 h-8 text-green-500 mx-auto mb-2" />
                 <h4 className="font-bold text-slate-800">Umpan Balik Negatif</h4>
                 <p className="text-xs text-slate-600 mt-1">Sel sudah kaya energi (ATP tinggi). Mesin dimatikan secara alosterik untuk mencegah pemborosan bahan bakar.</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-slate-100 min-h-screen rounded-xl shadow-lg overflow-hidden flex flex-col font-sans">
      <CustomStyles />
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b-4 border-blue-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Dna /> Bioenergetika Masterclass v3.0</h1>
          <p className="text-slate-400 text-xs mt-1">Arsitektur Jalur Molekuler Terperinci (Substrat & Enzim Spesifik)</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap
              ${activeTab === tab.id ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
            `}
          >
            {tab.icon}
            {tab.name}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-auto bg-slate-100">
        {activeTab === 'glycolysis' && renderGlycolysis()}
        {activeTab === 'krebs' && renderKrebs()}
        {activeTab === 'rte' && renderRTEDynamic()}
        {activeTab === 'simulator' && renderSimulator()}
      </div>
    </div>
  );
};

export default MetabolismMap;
