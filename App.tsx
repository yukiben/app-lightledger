
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Fingerprint, 
  X,
  Check,
  Zap,
  RotateCcw,
  List,
  ChevronLeft
} from 'lucide-react';
import { ViewState, Record, Category } from './types';
import { CATEGORIES, getIcon } from './constants';
import Keypad from './components/Keypad';
import BudgetWaterline from './components/BudgetWaterline';
import { parseSemanticInput } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LOCKED);
  const [records, setRecords] = useState<Record[]>([]);
  const [budget, setBudget] = useState(6000);
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(CATEGORIES[0].id);
  const [isParsing, setIsParsing] = useState(false);
  const [semanticInput, setSemanticInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lightledger_data');
    if (saved) {
      const { records: r, budget: b } = JSON.parse(saved);
      setRecords(r.map((x: any) => ({ ...x, date: new Date(x.date) })));
      setBudget(b);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lightledger_data', JSON.stringify({ records, budget }));
  }, [records, budget]);

  const totalSpent = useMemo(() => records.reduce((sum, r) => sum + r.amount, 0), [records]);

  const stats = useMemo(() => {
    return CATEGORIES.map(cat => {
      const amount = records
        .filter(r => r.categoryId === cat.id)
        .reduce((sum, r) => sum + r.amount, 0);
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      return { ...cat, amount, percentage };
    }).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [records, totalSpent]);

  const handleKeypadNumber = (num: string) => {
    if (amount === '0' && num !== '.') setAmount(num);
    else if (amount.includes('.') && num === '.') return;
    else if (amount.length < 10) setAmount(amount + num);
  };

  const handleKeypadDelete = () => {
    if (amount.length <= 1) setAmount('0');
    else setAmount(amount.slice(0, -1));
  };

  const handleAddRecord = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    const newRecord: Record = {
      id: Math.random().toString(36).substr(2, 9),
      amount: val,
      categoryId: selectedCatId,
      note: note.trim() || CATEGORIES.find(c => c.id === selectedCatId)?.name || '支出',
      date: new Date()
    };
    setRecords([newRecord, ...records]);
    setAmount('0'); setNote(''); setSemanticInput('');
    setView(ViewState.HOME);
  };

  const handleSemanticParse = async () => {
    if (!semanticInput.trim()) return;
    setIsParsing(true);
    const result = await parseSemanticInput(semanticInput);
    if (result) {
      setAmount(result.amount.toString());
      setNote(result.note);
      const cat = CATEGORIES.find(c => c.name === result.category);
      if (cat) setSelectedCatId(cat.id);
    }
    setIsParsing(false);
  };

  // --- Components ---

  const DonutChart = () => {
    let currentOffset = 0;
    const size = 200;
    const radius = 80;
    const strokeWidth = 10;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="relative w-full aspect-square flex items-center justify-center max-w-[220px] mx-auto mb-10 mt-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          <circle
            cx={center} cy={center} r={radius}
            fill="transparent" stroke="#f3f4f6" strokeWidth={strokeWidth}
          />
          {stats.map((stat) => {
            const strokeDasharray = (stat.percentage * circumference) / 100;
            const strokeDashoffset = -currentOffset;
            currentOffset += strokeDasharray;
            return (
              <circle
                key={stat.id}
                cx={center} cy={center} r={radius}
                fill="transparent" stroke={stat.color} strokeWidth={strokeWidth}
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">总计</div>
          <div className="text-2xl font-light tracking-tight text-slate-800">¥{totalSpent.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  const LockedScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#37352f] flex items-center justify-center mb-6 shadow-sm">
        <Fingerprint size={32} className="text-white opacity-80" />
      </div>
      <h1 className="text-lg font-normal tracking-tight mb-1 text-slate-800">LightLedger</h1>
      <p className="text-slate-400 text-xs font-normal mb-10">数据保存在本地，极简私密</p>
      <button 
        onClick={() => setView(ViewState.ENTRY)}
        className="px-8 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 active:scale-95 transition-all"
      >
        进入账本
      </button>
    </div>
  );

  const EntryScreen = () => {
    const cat = CATEGORIES.find(c => c.id === selectedCatId)!;
    return (
      <div className="h-full flex flex-col bg-white animate-subtle-in">
        <div className="px-6 py-4 flex justify-between items-center">
          <button onClick={() => setView(ViewState.HOME)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
          <span className="text-[10px] font-medium text-slate-400 tracking-widest">闪电录入</span>
          <div className="w-6" />
        </div>

        <div className="flex-1 flex flex-col justify-center px-10">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{cat.name}</span>
          </div>

          <div className="flex items-baseline mb-8">
            <span className="text-2xl font-light text-slate-200 mr-2">¥</span>
            <div className="text-6xl font-light tracking-tighter truncate overflow-hidden text-slate-800">
              {amount}
              <span className="w-[1px] h-10 bg-slate-300 ml-1 inline-block animate-pulse align-middle" />
            </div>
          </div>

          <div className="space-y-4">
            <input 
              type="text" placeholder="备注..." value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-base font-normal border-b border-slate-100 pb-2 focus:outline-none focus:border-slate-300 transition-all bg-transparent"
            />
            <div className="flex items-center space-x-2">
              <input 
                type="text" placeholder="语义识别 (如: 晚餐50)" value={semanticInput}
                onChange={(e) => setSemanticInput(e.target.value)}
                className="flex-1 text-xs font-normal border border-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-200 transition-all bg-slate-50/50"
              />
              <button 
                onClick={handleSemanticParse} disabled={isParsing}
                className="p-2 text-slate-400 hover:text-slate-800 transition-all disabled:opacity-30"
              >
                {isParsing ? <RotateCcw size={16} className="animate-spin" /> : <Zap size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 mb-4 overflow-x-auto no-scrollbar py-2">
          <div className="flex space-x-4">
            {CATEGORIES.map(c => (
              <button 
                key={c.id} onClick={() => setSelectedCatId(c.id)}
                className={`flex-shrink-0 flex flex-col items-center space-y-1.5 transition-all ${selectedCatId === c.id ? 'opacity-100' : 'opacity-20'}`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100">
                  {getIcon(c.icon, 16)}
                </div>
                <span className="text-[9px] font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50/30 pt-1 border-t border-slate-50">
          <Keypad onNumber={handleKeypadNumber} onDelete={handleKeypadDelete} onClear={() => setAmount('0')} />
          <button 
            onClick={handleAddRecord}
            className="w-full py-4 text-slate-500 font-medium text-xs uppercase tracking-[0.2em] hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center space-x-2 border-t border-slate-100"
          >
            <Check size={14} />
            <span>确认</span>
          </button>
        </div>
      </div>
    );
  };

  const HomeScreen = () => (
    <div className="h-full flex flex-col bg-[#ffffff] animate-subtle-in">
      <div className="p-8 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-normal tracking-tight text-slate-800">本月</h1>
        <div className="flex space-x-1">
          <button onClick={() => setView(ViewState.STATS)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <BarChart3 size={20} />
          </button>
          <button onClick={() => setView(ViewState.LOCKED)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 py-2">
        <BudgetWaterline total={budget} spent={totalSpent} onEdit={() => setIsSettingBudget(true)} />
      </div>

      <div className="flex-1 px-8 pt-8 overflow-y-auto no-scrollbar pb-32">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">最近支出</h3>
        </div>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-200 italic">
            <p className="text-xs">记下一笔支出</p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map(r => {
              const c = CATEGORIES.find(cat => cat.id === r.categoryId)!;
              return (
                <div key={r.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {getIcon(c.icon, 16)}
                    </div>
                    <div>
                      <h4 className="font-normal text-slate-700 text-sm tracking-tight">{r.note}</h4>
                      <p className="text-[9px] font-normal text-slate-300 uppercase tracking-wider">
                        {c.name} • {r.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-light text-slate-800 text-sm">
                      <span className="text-[10px] opacity-30 mr-0.5">¥</span>
                      {r.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        <button 
          onClick={() => setView(ViewState.ENTRY)}
          className="w-12 h-12 bg-[#37352f] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {isSettingBudget && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-10 border-t border-slate-100 shadow-2xl animate-subtle-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">设定预算</h2>
              <button onClick={() => setIsSettingBudget(false)}><X size={18} className="text-slate-300"/></button>
            </div>
            <div className="flex items-baseline space-x-2 mb-10">
              <span className="text-2xl font-light text-slate-200">¥</span>
              <input 
                autoFocus type="number" value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="text-5xl font-light tracking-tighter w-full focus:outline-none text-slate-800 bg-transparent"
              />
            </div>
            <button 
              onClick={() => setIsSettingBudget(false)}
              className="w-full py-3 bg-[#37352f] text-white rounded-xl font-medium text-xs uppercase tracking-widest shadow-sm"
            >
              保存修改
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const StatsScreen = () => (
    <div className="h-full flex flex-col bg-white animate-subtle-in">
      <div className="p-8 flex justify-between items-center">
        <button onClick={() => setView(ViewState.HOME)} className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">分类概览</h2>
        <div className="w-6" />
      </div>

      <div className="px-8 flex-1 overflow-y-auto no-scrollbar pb-10">
        <DonutChart />
        <div className="space-y-6">
          {stats.map(s => (
            <div key={s.id}>
              <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-normal text-slate-600">{s.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-light text-slate-800">¥{s.amount.toLocaleString()}</span>
                  <span className="text-[9px] ml-2 text-slate-300 font-medium uppercase">{Math.round(s.percentage)}%</span>
                </div>
              </div>
              <div className="w-full h-[2px] bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7f6f3]">
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.04)] overflow-hidden border border-[rgba(55,53,47,0.06)] relative">
        {view === ViewState.LOCKED && <LockedScreen />}
        {view === ViewState.ENTRY && <EntryScreen />}
        {view === ViewState.HOME && <HomeScreen />}
        {view === ViewState.STATS && <StatsScreen />}
      </div>
    </div>
  );
};

export default App;
