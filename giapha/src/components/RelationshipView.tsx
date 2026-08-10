import React, { useState, useMemo } from 'react';
import { GenealogyMember } from '../types';
import { loadGenealogyData } from '../utils/storage';
import { calculateRelationship, RelationshipResult } from '../utils/genealogyUtils';
import { GitCompare, ShieldCheck, HeartHandshake, User, ArrowDown, Search, Sparkles, BookOpen } from 'lucide-react';

interface RelationshipViewProps {
  onSelectMember: (member: GenealogyMember) => void;
  members?: GenealogyMember[];
}

export const RelationshipView: React.FC<RelationshipViewProps> = ({
  onSelectMember,
  members: propsMembers,
}) => {
  const members = propsMembers || loadGenealogyData();

  // Selected IDs
  const [memberAId, setMemberAId] = useState<string>('1_1_2_2_2_1'); // Nguyễn Văn Khởi (Đời 15)
  const [memberBId, setMemberBId] = useState<string>('1'); // Cụ Nguyễn Văn Bát (Đời 11)

  // Search filters for select dropdowns
  const [searchA, setSearchA] = useState<string>('');
  const [searchB, setSearchB] = useState<string>('');

  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d");

  const filteredMembersA = useMemo(() => {
    if (!searchA.trim()) return members;
    const norm = normalizeStr(searchA);
    return members.filter(
      m =>
        normalizeStr(m.fullName).includes(norm) ||
        (m.otherName && normalizeStr(m.otherName).includes(norm)) ||
        m.code.toLowerCase().includes(norm) ||
        m.generation.toLowerCase().includes(norm)
    );
  }, [members, searchA]);

  const filteredMembersB = useMemo(() => {
    if (!searchB.trim()) return members;
    const norm = normalizeStr(searchB);
    return members.filter(
      m =>
        normalizeStr(m.fullName).includes(norm) ||
        (m.otherName && normalizeStr(m.otherName).includes(norm)) ||
        m.code.toLowerCase().includes(norm) ||
        m.generation.toLowerCase().includes(norm)
    );
  }, [members, searchB]);

  const result: RelationshipResult | null = calculateRelationship(memberAId, memberBId, members);

  const memberA = members.find(m => m.id === memberAId);
  const memberB = members.find(m => m.id === memberBId);

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-800/80 pb-4">
          <div className="flex items-center gap-2 text-amber-100 font-bold text-lg">
            <GitCompare className="w-6 h-6 text-yellow-400" />
            <span>Đối Chiếu Quan Hệ Gia Phả &amp; Tra Cứu Danh Xưng Xưng Hô</span>
          </div>
          <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-3 py-1 rounded-full font-medium w-fit">
            Chuẩn Lễ Nghi Cố Đô Huế
          </span>
        </div>

        <p className="text-xs text-amber-300/90 leading-relaxed">
          Chọn hai thành viên bất kỳ trong gia phả Tộc Nguyễn Văn để hệ thống tự động tính toán chính xác trực hệ nối truyền, thế hệ chênh lệch, tổ tiên chung và danh xưng xưng hô tôn kính đúng đạo nghĩa gia phong.
        </p>

        {/* Quick Sample Comparisons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Mẫu đối chiếu xưng hô nhanh:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              {
                label: 'Khởi (Đời 15) & Cụ Bát (Đời 11)',
                idA: '1_1_2_2_2_1',
                idB: '1',
              },
              {
                label: 'Khởi (Đời 15) & Chấn (Đời 14)',
                idA: '1_1_2_2_2_1',
                idB: '1_1_2_2',
              },
              {
                label: 'Chấn (Đời 14) & Cụ Bát (Đời 11)',
                idA: '1_1_2_2',
                idB: '1',
              },
              {
                label: 'Việt (Đời 16) & Vũ (Đời 15)',
                idA: '1_1_2_2_3_1',
                idB: '1_1_2_2_3',
              },
              {
                label: 'Tuấn (Đời 16) & Đính (Đời 15)',
                idA: '1_1_2_2_4_1',
                idB: '1_1_2_2_4',
              },
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMemberAId(preset.idA);
                  setMemberBId(preset.idB);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-yellow-200 border border-amber-700/80 transition-all text-xs flex items-center gap-1.5"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Member Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Member A Selector */}
          <div className="space-y-3 bg-amber-900/40 p-4 rounded-xl border border-amber-800">
            <label className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-yellow-400" />
              <span>1. Thành viên thứ nhất (Người xưng hô):</span>
            </label>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
              <input
                type="text"
                value={searchA}
                onChange={e => setSearchA(e.target.value)}
                placeholder="Tìm theo tên/mã (VD: Khởi, Chấn, 15...)"
                className="w-full bg-amber-950/90 border border-amber-700/80 text-amber-100 rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder-amber-400/60 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <select
              value={memberAId}
              onChange={e => setMemberAId(e.target.value)}
              className="w-full bg-amber-950 border border-amber-700 text-amber-100 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {filteredMembersA.map(m => (
                <option key={m.id} value={m.id}>
                  {m.generation} • {m.fullName} {m.otherName ? `(${m.otherName})` : ''} - Mã {m.code}
                </option>
              ))}
            </select>
          </div>

          {/* Member B Selector */}
          <div className="space-y-3 bg-amber-900/40 p-4 rounded-xl border border-amber-800">
            <label className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-yellow-400" />
              <span>2. Thành viên thứ hai (Đối tượng kính gọi):</span>
            </label>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-400" />
              <input
                type="text"
                value={searchB}
                onChange={e => setSearchB(e.target.value)}
                placeholder="Tìm theo tên/mã (VD: Bát, Xuân, 11...)"
                className="w-full bg-amber-950/90 border border-amber-700/80 text-amber-100 rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder-amber-400/60 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <select
              value={memberBId}
              onChange={e => setMemberBId(e.target.value)}
              className="w-full bg-amber-950 border border-amber-700 text-amber-100 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {filteredMembersB.map(m => (
                <option key={m.id} value={m.id}>
                  {m.generation} • {m.fullName} {m.otherName ? `(${m.otherName})` : ''} - Mã {m.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Display Card */}
      {result && (
        <div className="bg-amber-950/90 border-2 border-yellow-600/80 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Main Relationship Banner */}
          <div className="bg-gradient-to-r from-amber-900 via-yellow-900/80 to-amber-900 p-5 rounded-xl border border-yellow-500/40 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-yellow-300" />
              <span>KẾT QUẢ ĐỐI CHIẾU QUAN HỆ PHẢ HỆ:</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-amber-50 leading-relaxed">
              {result.relationshipText}
            </h3>
          </div>

          {/* Polite Addressing Term Highlight */}
          <div className="bg-gradient-to-br from-amber-900/70 to-amber-950/90 p-5 rounded-xl border-2 border-emerald-500/50 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
              <HeartHandshake className="w-6 h-6 text-emerald-400" />
              <span>CÁCH XƯNG HÔ CHUẨN MỰC GIA PHONG:</span>
            </div>
            <div className="bg-amber-950/80 p-4 rounded-xl border border-amber-700/80 space-y-2">
              <p className="text-base font-bold text-yellow-300 leading-relaxed">
                {result.addressingText}
              </p>
              {memberA && memberB && (
                <div className="text-xs text-amber-200/90 space-y-1 pt-1 border-t border-amber-800/60">
                  <div>
                    • <strong>{memberA.fullName} ({memberA.generation})</strong> xưng hô kính cẩn khi thưa chuyện với <strong>{memberB.fullName} ({memberB.generation})</strong>.
                  </div>
                  <div>
                    • Thế hệ chênh lệch: <strong>{Math.abs(memberA.generationLevel - memberB.generationLevel)} thế hệ</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lowest Common Ancestor */}
          {result.ancestorLCA && (
            <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 block font-semibold">TỔ TIÊN CHUNG CỦA HAI VỊ:</span>
                <span className="text-base font-bold text-amber-50">
                  Cụ {result.ancestorLCA.fullName} ({result.ancestorLCA.generation})
                </span>
              </div>
              <button
                onClick={() => onSelectMember(result.ancestorLCA!)}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-700 text-yellow-300 font-medium transition-colors"
              >
                Xem chi tiết Tổ tiên ➔
              </button>
            </div>
          )}

          {/* Side-by-Side Lineage Paths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Path A */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-400" />
                <span>Trực hệ của {result.lineageA[result.lineageA.length - 1]?.fullName}:</span>
              </h4>
              <div className="space-y-2 bg-amber-900/30 p-3 rounded-xl border border-amber-800/80">
                {result.lineageA.map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-start">
                    <button
                      onClick={() => onSelectMember(step)}
                      className="text-xs font-medium text-amber-200 hover:text-yellow-300 p-2 rounded bg-amber-950/80 border border-amber-700/60 w-full text-left transition-colors"
                    >
                      <span className="font-bold text-yellow-400">{step.generation}:</span> {step.fullName}
                    </button>
                    {idx < result.lineageA.length - 1 && (
                      <ArrowDown className="w-3.5 h-3.5 text-amber-500 my-1 self-center" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Path B */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-400" />
                <span>Trực hệ của {result.lineageB[result.lineageB.length - 1]?.fullName}:</span>
              </h4>
              <div className="space-y-2 bg-amber-900/30 p-3 rounded-xl border border-amber-800/80">
                {result.lineageB.map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-start">
                    <button
                      onClick={() => onSelectMember(step)}
                      className="text-xs font-medium text-amber-200 hover:text-yellow-300 p-2 rounded bg-amber-950/80 border border-amber-700/60 w-full text-left transition-colors"
                    >
                      <span className="font-bold text-yellow-400">{step.generation}:</span> {step.fullName}
                    </button>
                    {idx < result.lineageB.length - 1 && (
                      <ArrowDown className="w-3.5 h-3.5 text-amber-500 my-1 self-center" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Kinship Addressing Rules Reference Table */}
      <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-base">
          <BookOpen className="w-5 h-5 text-yellow-400" />
          <span>BẢNG NGUYÊN TẮC XƯNG HÔ GIA PHONG TỘC NGUYỄN VĂN (ĐỜI 11 - ĐỜI 16)</span>
        </div>
        <p className="text-xs text-amber-300/80">
          Quy tắc xưng hô truyền thống Việt Nam dựa trên khoảng cách thế hệ và thứ bậc trực hệ trong tộc phả:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800 space-y-1">
            <span className="font-bold text-yellow-300 block">1. Cùng Thế Hệ (Đồng tộc):</span>
            <p className="text-amber-100">Xưng <strong>"Anh / Chị / Em"</strong>. Tôn trọng anh lớn em nhỏ theo thứ tự cành nhánh trong họ.</p>
          </div>
          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800 space-y-1">
            <span className="font-bold text-yellow-300 block">2. Chênh 1 Thế Hệ (Hàng Con):</span>
            <p className="text-amber-100">Xưng <strong>"Con / Cháu"</strong>, kính gọi người lớn là <strong>"Bác / Chú / Cậu / Cô"</strong>.</p>
          </div>
          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800 space-y-1">
            <span className="font-bold text-yellow-300 block">3. Chênh 2 Thế Hệ (Hàng Cháu):</span>
            <p className="text-amber-100">Xưng <strong>"Cháu"</strong>, kính gọi người lớn là <strong>"Ông / Bà"</strong> (Ví dụ: Đời 15 gọi Đời 13).</p>
          </div>
          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800 space-y-1">
            <span className="font-bold text-yellow-300 block">4. Chênh 3 Thế Hệ (Hàng Chắt):</span>
            <p className="text-amber-100">Xưng <strong>"Chắt"</strong>, kính gọi người lớn là <strong>"Cụ Ông / Cụ Bà"</strong> (Ví dụ: Đời 15 gọi Đời 12).</p>
          </div>
          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800 space-y-1">
            <span className="font-bold text-yellow-300 block">5. Chênh 4+ Thế Hệ (Thủy Tổ/Cụ):</span>
            <p className="text-amber-100">Xưng <strong>"Chắt / Hậu duệ"</strong>, kính xưng <strong>"Cụ / Cụ Thủy Tổ / Bậc Tiền Nhân"</strong> (Ví dụ: Đời 15 gọi Đời 11).</p>
          </div>
          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800 space-y-1">
            <span className="font-bold text-yellow-300 block">6. Kính Lễ Người Đã Khuất:</span>
            <p className="text-amber-100">Dùng danh xưng <strong>"Đức Cụ", "Cụ", "Cụ Bà", "Pháp Danh"</strong> với lòng biết ơn và kính cẩn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
