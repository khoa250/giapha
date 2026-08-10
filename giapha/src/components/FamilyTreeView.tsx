import React, { useState } from 'react';
import { GenealogyMember } from '../types';
import { loadGenealogyData } from '../utils/storage';
import { GitFork, ChevronRight, ChevronDown, User, Heart, MapPin, Sparkles, Eye } from 'lucide-react';

interface FamilyTreeViewProps {
  onSelectMember: (member: GenealogyMember) => void;
  filterText: string;
  members?: GenealogyMember[];
}

export const FamilyTreeView: React.FC<FamilyTreeViewProps> = ({
  onSelectMember,
  filterText,
  members: propsMembers,
}) => {
  const members = propsMembers || loadGenealogyData();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [expandedGen, setExpandedGen] = useState<Record<number, boolean>>({
    11: true,
    12: true,
    13: true,
    14: true,
    15: true,
    16: true,
  });

  const toggleGen = (level: number) => {
    setExpandedGen(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // Filter members by search text and branch
  const filteredMembers = members.filter(m => {
    // Branch filter
    if (selectedBranch === 'ngoc' && !m.code.startsWith('1_1_1') && m.id !== '1' && m.id !== '1_1') return false;
    if (selectedBranch === 'ngo' && !m.code.startsWith('1_1_2') && m.id !== '1' && m.id !== '1_1') return false;
    if (selectedBranch === 'khoi' && !m.code.startsWith('1_1_1_1') && m.id !== '1' && m.id !== '1_1' && m.id !== '1_1_1') return false;
    if (selectedBranch === 'khuong' && !m.code.startsWith('1_1_1_3') && m.id !== '1' && m.id !== '1_1' && m.id !== '1_1_1') return false;

    // Search filter
    if (!filterText) return true;
    const term = filterText.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(term) ||
      (m.otherName && m.otherName.toLowerCase().includes(term)) ||
      m.generation.toLowerCase().includes(term) ||
      (m.spouse && m.spouse.toLowerCase().includes(term)) ||
      (m.notes && m.notes.toLowerCase().includes(term))
    );
  });

  // Group members by generation
  const generations = [11, 12, 13, 14, 15, 16];

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-100 font-semibold text-base">
          <GitFork className="w-5 h-5 text-yellow-400" />
          <span>Sơ Đồ Cây Gia Phả Tộc Nguyễn Văn</span>
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-amber-300 whitespace-nowrap font-medium">Lọc Nhánh:</span>
          <button
            onClick={() => setSelectedBranch('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedBranch === 'all'
                ? 'bg-yellow-600 text-amber-950 shadow-sm'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            Tất Cả Dòng Họ
          </button>
          <button
            onClick={() => setSelectedBranch('ngoc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedBranch === 'ngoc'
                ? 'bg-yellow-600 text-amber-950 shadow-sm'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            Nhánh Cụ Ngọc (Đời 13)
          </button>
          <button
            onClick={() => setSelectedBranch('ngo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedBranch === 'ngo'
                ? 'bg-yellow-600 text-amber-950 shadow-sm'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            Nhánh Cụ Ngô (Đời 13)
          </button>
          <button
            onClick={() => setSelectedBranch('khoi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedBranch === 'khoi'
                ? 'bg-yellow-600 text-amber-950 shadow-sm'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            Nhánh Cụ Khởi (Đời 14)
          </button>
          <button
            onClick={() => setSelectedBranch('khuong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedBranch === 'khuong'
                ? 'bg-yellow-600 text-amber-950 shadow-sm'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            Nhánh Cụ Khương (Đời 14)
          </button>
        </div>
      </div>

      {/* Generations Tree Layers */}
      <div className="space-y-6">
        {generations.map((level) => {
          const membersInGen = filteredMembers.filter(m => m.generationLevel === level);
          if (membersInGen.length === 0) return null;

          const isExpanded = expandedGen[level] ?? true;
          const genTitle = membersInGen[0]?.generation || `Đời ${level}`;

          return (
            <div 
              key={level} 
              className="bg-amber-950/70 border border-amber-800/80 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Generation Section Header */}
              <button
                onClick={() => toggleGen(level)}
                className="w-full bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 hover:from-amber-850 p-4 border-b border-amber-800 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-300 font-bold text-sm">
                    {level}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                      <span>{genTitle}</span>
                      <span className="text-xs font-normal text-amber-300 px-2 py-0.5 rounded-full bg-amber-900 border border-amber-700">
                        {membersInGen.length} Thành viên
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-amber-300 text-sm">
                  <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {/* Members Cards Grid */}
              {isExpanded && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membersInGen.map((m) => {
                    const childrenCount = members.filter(c => c.parentId === m.id).length;
                    const isOverseas = m.notes?.toLowerCase().includes('hoa kỳ') || m.notes?.toLowerCase().includes('mỹ') || m.birthDeathInfo?.toLowerCase().includes('hoa kỳ');

                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectMember(m)}
                        className="group relative bg-gradient-to-b from-amber-900/40 to-amber-950/80 hover:from-amber-900/70 hover:to-amber-900/90 border border-amber-800/80 hover:border-yellow-500/60 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-md hover:shadow-yellow-900/20 flex flex-col justify-between"
                      >
                        {/* Card Top */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-yellow-400">
                                {m.code}
                              </span>
                              {isOverseas && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" /> Hoa Kỳ
                                </span>
                              )}
                            </div>
                            <Eye className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <h4 className="text-base font-bold text-amber-50 group-hover:text-yellow-300 transition-colors">
                            {m.fullName}
                          </h4>

                          {m.otherName && (
                            <p className="text-xs text-yellow-300/90 font-medium mt-0.5">
                              {m.otherName}
                            </p>
                          )}

                          <p className="text-xs text-amber-300/80 mt-1.5 flex items-center gap-1">
                            <User className="w-3 h-3 text-amber-400" />
                            <span className="truncate">{m.relationship}</span>
                          </p>

                          {m.spouse && (
                            <p className="text-xs text-pink-300/80 mt-1 flex items-start gap-1 line-clamp-1">
                              <Heart className="w-3 h-3 text-pink-400 shrink-0 mt-0.5" />
                              <span className="truncate">{m.spouse}</span>
                            </p>
                          )}
                        </div>

                        {/* Card Bottom */}
                        <div className="mt-3 pt-2.5 border-t border-amber-800/60 flex items-center justify-between text-[11px] text-amber-400/90">
                          <span>
                            {childrenCount > 0 ? ` Con trực hệ: ${childrenCount} vị` : 'Chưa ghi nhận con'}
                          </span>
                          <span className="text-yellow-400 group-hover:underline flex items-center gap-1 font-medium">
                            Chi tiết ➔
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
