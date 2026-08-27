import React, { useEffect, useState } from 'react';
import { Trophy, Award, Shield, EyeOff, Sparkles, Coins, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ApiService } from '../../services/api';
import { CitizenLeaderboardItem } from '../../types';

export const CitizenLeaderboardPage: React.FC = () => {
  const [champions, setChampions] = useState<CitizenLeaderboardItem[]>([]);
  const [showMeOnLeaderboard, setShowMeOnLeaderboard] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await ApiService.getCitizenLeaderboard();
        setChampions(data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-mono text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>CIVIC CHAMPIONS</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            CIVIC CHAMPIONS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Recognizing active citizens whose verified observations protect municipal infrastructure across Coimbatore.
          </p>
        </div>

        {/* Privacy Protection Banner with Toggle */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3 text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block font-sans">
                Privacy Protection Active
              </span>
              <p className="text-slate-500 font-sans mt-0.5 leading-relaxed">
                We never expose emails, phone numbers, or private locations. Display names are pseudonymized by default.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono">
            <span className="text-[11px] font-bold text-slate-700">Show me on Civic Champions:</span>
            <button
              onClick={() => setShowMeOnLeaderboard(!showMeOnLeaderboard)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                showMeOnLeaderboard
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {showMeOnLeaderboard ? 'ON' : 'OFF (Civic Contributor)'}
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between font-mono text-xs font-bold text-slate-500 bg-slate-50">
            <span>RANK & DISPLAY NAME</span>
            <div className="flex items-center gap-8">
              <span className="w-20 text-center">VALIDATED</span>
              <span className="w-20 text-center">RESOLVED</span>
              <span className="w-24 text-right">CIVICX POINTS</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 font-mono text-xs">
            {champions.map((c) => (
              <div
                key={c.rank}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold font-display ${
                      c.rank === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : c.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : c.rank === 3
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `#${c.rank}`}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 font-sans">{c.name}</h4>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {c.badge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right font-bold">
                  <span className="w-20 text-center text-slate-700">{c.reportsValidated}</span>
                  <span className="w-20 text-center text-emerald-600">{c.issuesResolved}</span>
                  <span className="w-24 text-right text-civic-dark font-display text-sm font-black">
                    🪙 {c.civicxPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
