import React, { useState } from 'react';
import { GenealogyMember } from '../types';
import { loadGenealogyData } from '../utils/storage';
import { Users, Search, Filter, MapPin, Heart, Calendar, UserCheck, Eye, Award } from 'lucide-react';

interface MemberDirectoryViewProps {
  onSelectMember: (member: GenealogyMember) => void;
  searchTerm: string;
  members?: GenealogyMember[];
}

export const MemberDirectoryView: React.FC<MemberDirectoryViewProps> = ({
  onSelectMember,
  searchTerm,
  members: propsMembers,
}) => {
  const members = propsMembers || loadGenealogyData();
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [onlyDharmaName, setOnlyDharmaName] = useState<boolean>(false);
  const [onlyOverseas, setOnlyOverseas] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');

  const activeSearch = searchTerm || localSearch;

  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d");

  const filteredMembers = members.filter((m) => {
    // Gen filter
    if (selectedGen !== 'all' && m.generation !== selectedGen) return false;

    // Dharma name filter
    if (onlyDharmaName && (!m.otherName || !m.otherName.toLowerCase().includes('pháp danh'))) return false;

    // Overseas filter
    const isOverseas = m.notes?.toLowerCase().includes('hoa kỳ') || m.notes?.toLowerCase().includes('mỹ') || m.birthDeathInfo?.toLowerCase().includes('hoa kỳ');
    if (onlyOverseas && !isOverseas) return false;

    // Search query
    if (!activeSearch) return true;
    const term = activeSearch.trim().toLowerCase();
    const termNorm = normalizeStr(activeSearch);

    const fullNorm = normalizeStr(m.fullName);
    const otherNorm = normalizeStr(m.otherName || '');
    const notesNorm = normalizeStr(m.notes || '');
    const spouseNorm = normalizeStr(m.spouse || '');
    const relNorm = normalizeStr(m.relationship || '');
    const codeNorm = normalizeStr(m.code || '');

    // Smart Relationship Filters in Directory Search
    if (termNorm.startsWith('con ') || termNorm.includes('con ong') || termNorm.includes('con cu') || termNorm.includes('con cua')) {
      const pName = termNorm
        .replace(/con ong/g, '')
        .replace(/con cu/g, '')
        .replace(/con cua/g, '')
        .replace(/con/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();
      if (pName) {
        const parent = members.find(pm => normalizeStr(pm.fullName).includes(pName));
        if (parent && m.parentId === parent.id) return true;
        if (relNorm.includes(pName)) return true;
      }
    }

    if (termNorm.startsWith('vo ') || termNorm.includes('vo ong') || termNorm.includes('vo cu') || termNorm.includes('vo cua')) {
      const sName = termNorm
        .replace(/vo cua/g, '')
        .replace(/vo ong/g, '')
        .replace(/vo cu/g, '')
        .replace(/vo/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();
      if (sName) {
        const targetMember = members.find(tm => normalizeStr(tm.fullName).includes(sName));
        if (targetMember && m.id === targetMember.id) return true;
        if (spouseNorm.includes(sName)) return true;
      }
    }

    if (termNorm.includes('cha ') || termNorm.includes('bo ') || termNorm.includes('than sinh')) {
      const cName = termNorm
        .replace(/cha cua/g, '')
        .replace(/cha ong/g, '')
        .replace(/cha/g, '')
        .replace(/bo/g, '')
        .replace(/than sinh/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();
      if (cName) {
        const child = members.find(cm => normalizeStr(cm.fullName).includes(cName));
        if (child && m.id === child.parentId) return true;
      }
    }

    if (termNorm.includes('anh em')) {
      const sibName = termNorm
        .replace(/anh em cua/g, '')
        .replace(/anh em ong/g, '')
        .replace(/anh em/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();
      if (sibName) {
        const targetSib = members.find(sm => normalizeStr(sm.fullName).includes(sibName));
        if (targetSib && targetSib.parentId && m.parentId === targetSib.parentId) return true;
      }
    }

    return (
      m.fullName.toLowerCase().includes(term) ||
      fullNorm.includes(termNorm) ||
      (m.otherName && m.otherName.toLowerCase().includes(term)) ||
      otherNorm.includes(termNorm) ||
      m.code.toLowerCase().includes(term) ||
      codeNorm.includes(termNorm) ||
      m.relationship.toLowerCase().includes(term) ||
      relNorm.includes(termNorm) ||
      (m.spouse && m.spouse.toLowerCase().includes(term)) ||
      spouseNorm.includes(termNorm) ||
      (m.birthDeathInfo && m.birthDeathInfo.toLowerCase().includes(term)) ||
      (m.notes && m.notes.toLowerCase().includes(term)) ||
      notesNorm.includes(termNorm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters Section */}
      <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-100 font-bold text-base">
            <Users className="w-5 h-5 text-yellow-400" />
            <span>Danh Sách Phả Hệ Dòng Họ ({filteredMembers.length}/{members.length} Vị)</span>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-amber-900/60 border border-amber-700 rounded-xl text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-800/80 text-xs">
          <span className="text-amber-300 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc Thế Hệ:
          </span>

          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
            className="bg-amber-900/80 border border-amber-700 text-amber-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">Tất Cả Các Thế Hệ (Đời 11 - 16)</option>
            <option value="Đời 11">Đời 11 (Khởi thủy phả hệ)</option>
            <option value="Đời 12">Đời 12</option>
            <option value="Đời 13">Đời 13</option>
            <option value="Đời 14">Đời 14</option>
            <option value="Đời 15">Đời 15</option>
            <option value="Đời 16">Đời 16</option>
          </select>

          <button
            onClick={() => setOnlyDharmaName(!onlyDharmaName)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 font-medium ${
              onlyDharmaName
                ? 'bg-yellow-600 text-amber-950 border-yellow-500'
                : 'bg-amber-900/60 text-amber-200 border-amber-700 hover:bg-amber-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Có Pháp Danh Phật Giáo</span>
          </button>

          <button
            onClick={() => setOnlyOverseas(!onlyOverseas)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 font-medium ${
              onlyOverseas
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-amber-900/60 text-amber-200 border-amber-700 hover:bg-amber-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Định Cư Hoa Kỳ</span>
          </button>

          {(selectedGen !== 'all' || onlyDharmaName || onlyOverseas || localSearch) && (
            <button
              onClick={() => {
                setSelectedGen('all');
                setOnlyDharmaName(false);
                setOnlyOverseas(false);
                setLocalSearch('');
              }}
              className="text-amber-400 hover:text-yellow-300 underline underline-offset-2 ml-auto"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Grid of Members */}
      {filteredMembers.length === 0 ? (
        <div className="bg-amber-950/60 border border-amber-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-amber-200 text-base">Dạ thưa, không tìm thấy thành viên phù hợp với tiêu chí tra cứu.</p>
          <p className="text-amber-400/80 text-xs">Quý thân nhân vui lòng thử tìm bằng từ khóa hoặc xóa bớt bộ lọc ạ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isOverseas = member.notes?.toLowerCase().includes('hoa kỳ') || member.notes?.toLowerCase().includes('mỹ') || member.birthDeathInfo?.toLowerCase().includes('hoa kỳ');

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="bg-amber-950/80 border border-amber-800/90 hover:border-yellow-500/80 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl hover:shadow-yellow-950/40 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-600/30 text-yellow-300 border border-yellow-500/40 text-xs font-semibold">
                      {member.generation}
                    </span>
                    <span className="text-xs font-mono text-amber-400">
                      Mã: {member.code}
                    </span>
                  </div>

                  {/* Name & Dharma name */}
                  <div>
                    <h3 className="text-lg font-bold text-amber-50 group-hover:text-yellow-300 transition-colors">
                      {member.fullName}
                    </h3>
                    {member.otherName && (
                      <p className="text-xs text-yellow-400 font-medium mt-0.5">
                        {member.otherName}
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-amber-200/90">
                    <p className="flex items-start gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{member.relationship}</span>
                    </p>

                    {member.spouse && (
                      <p className="flex items-start gap-1.5 text-pink-300/90">
                        <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{member.spouse}</span>
                      </p>
                    )}

                    {member.birthDeathInfo && (
                      <p className="flex items-start gap-1.5 text-amber-300/80">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{member.birthDeathInfo}</span>
                      </p>
                    )}

                    {isOverseas && (
                      <p className="flex items-center gap-1.5 text-blue-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Định cư Hoa Kỳ</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-800/60 flex items-center justify-between text-xs text-amber-400">
                  <span>Trực hệ họ Nguyễn Văn</span>
                  <span className="text-yellow-400 font-semibold flex items-center gap-1 group-hover:underline">
                    Xem hồ sơ <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
