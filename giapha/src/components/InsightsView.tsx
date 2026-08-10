import React from 'react';
import { GenealogyMember } from '../types';
import { calculateStats } from '../utils/genealogyUtils';
import { loadGenealogyData } from '../utils/storage';
import { BarChart3, Users, Award, Globe, Layers, MapPin, Sparkles, BookOpen } from 'lucide-react';

interface InsightsViewProps {
  members?: GenealogyMember[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ members: propsMembers }) => {
  const members = propsMembers || loadGenealogyData();
  const stats = calculateStats(members);

  // Generation counts
  const genCounts = [11, 12, 13, 14, 15, 16].map(level => {
    const list = members.filter(m => m.generationLevel === level);
    return {
      level,
      name: list[0]?.generation || `Đời ${level}`,
      count: list.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-50">Thống Kê Tổng Quan Phả Hệ Dòng Họ</h2>
            <p className="text-xs text-amber-300/80">Tóm tắt quy mô thế hệ, truyền thống Phật giáo &amp; phân bố địa lý gia tộc</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-gradient-to-br from-amber-900/60 to-amber-950 border border-amber-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Users className="w-5 h-5" />
            <span className="text-xs font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-700">Đời 11 - 16</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-50">{stats.totalMembers}</div>
          <p className="text-xs text-amber-300">Thành viên trực hệ được ghi nhận</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-gradient-to-br from-amber-900/60 to-amber-950 border border-amber-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-yellow-400">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-700">6 Thế hệ</span>
          </div>
          <div className="text-3xl font-extrabold text-yellow-300">{stats.generationsCount}</div>
          <p className="text-xs text-amber-300">Đời nối tiếp kế thừa</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-amber-900/60 to-amber-950 border border-amber-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Award className="w-5 h-5" />
            <span className="text-xs font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-700">Pháp danh</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-300">{stats.dharmaNamesCount}</div>
          <p className="text-xs text-amber-300">Vị có Pháp danh Phật giáo quy y</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-gradient-to-br from-amber-900/60 to-amber-950 border border-amber-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <Globe className="w-5 h-5" />
            <span className="text-xs font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-700">Hải ngoại</span>
          </div>
          <div className="text-3xl font-extrabold text-blue-300">{stats.overseasMembersCount}</div>
          <p className="text-xs text-amber-300">Thành viên định cư Hoa Kỳ</p>
        </div>
      </div>

      {/* Generation Breakdown Chart & Location Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generations Breakdown */}
        <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-amber-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-yellow-400" />
            <span>Phân Bố Số Lượng Theo Đời Thứ</span>
          </h3>

          <div className="space-y-3">
            {genCounts.map(gen => {
              const percent = Math.round((gen.count / stats.totalMembers) * 100);
              return (
                <div key={gen.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-amber-200">
                    <span className="font-semibold text-yellow-300">{gen.name}</span>
                    <span>{gen.count} vị ({percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-900/80 rounded-full overflow-hidden border border-amber-800">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent * 3}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Distribution */}
        <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-amber-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span>Phân Bố Cư Trú &amp; Địa Phương</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(stats.locationCounts).map(([loc, count]) => {
              if (count === 0) return null;
              return (
                <div key={loc} className="p-3 bg-amber-900/40 border border-amber-800/80 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-medium text-amber-100">{loc}</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-950 text-yellow-400 border border-amber-700 font-bold">
                    {count} thành viên
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
