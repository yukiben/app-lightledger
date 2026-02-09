
import React from 'react';

interface BudgetWaterlineProps {
  total: number;
  spent: number;
  onEdit: () => void;
}

const BudgetWaterline: React.FC<BudgetWaterlineProps> = ({ total, spent, onEdit }) => {
  const remaining = total - spent;
  const percentage = (remaining / total) * 100;
  
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  const dailyLimit = remaining > 0 ? (remaining / daysLeft).toFixed(0) : 0;

  let textColor = 'text-slate-700';
  let barColor = 'bg-slate-200';
  
  if (remaining < 0) {
    textColor = 'text-rose-500';
    barColor = 'bg-rose-100';
  } else if (percentage < 20) {
    textColor = 'text-orange-500';
    barColor = 'bg-orange-100';
  }

  return (
    <div className="relative w-full rounded-2xl p-6 bg-white border border-[rgba(55,53,47,0.08)] overflow-hidden transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">本月剩余可用</span>
          <button onClick={onEdit} className="text-[10px] text-slate-300 hover:text-slate-600 transition-colors">修改预算</button>
        </div>
        
        <h2 className={`text-4xl font-light tracking-tight mb-6 ${textColor}`}>
          <span className="text-xl mr-1 opacity-40">¥</span>
          {remaining.toLocaleString()}
        </h2>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(55,53,47,0.05)]">
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5">今日额度</div>
            <div className="text-base font-normal text-slate-600 tracking-tight">¥{dailyLimit}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 mb-0.5">已用百分比</div>
            <div className="text-base font-normal text-slate-600 tracking-tight">
              {Math.round((spent / total) * 100)}%
            </div>
          </div>
        </div>
      </div>
      {/* Subtle bottom progress line instead of full fill */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full" />
      <div 
        className={`absolute bottom-0 left-0 h-1 ${barColor} transition-all duration-1000 ease-in-out`}
        style={{ width: `${Math.min(100, (spent / total) * 100)}%` }}
      />
    </div>
  );
};

export default BudgetWaterline;
