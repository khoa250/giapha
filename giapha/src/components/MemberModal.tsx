import React from 'react';
import { GenealogyMember } from '../types';
import { findMemberById } from '../utils/genealogyUtils';
import { loadGenealogyData } from '../utils/storage';
import { User, Heart, Calendar, MapPin, Award, Users, Bot, X, HeartHandshake } from 'lucide-react';

interface MemberModalProps {
  member: GenealogyMember | null;
  onClose: () => void;
  onSelectMember: (member: GenealogyMember) => void;
  onAskAi: (prompt: string) => void;
  allMembers?: GenealogyMember[];
}

export const MemberModal: React.FC<MemberModalProps> = ({
  member,
  onClose,
  onSelectMember,
  onAskAi,
  allMembers,
}) => {
  if (!member) return null;

  const membersList = allMembers || loadGenealogyData();
  const parent = member.parentId ? findMemberById(member.parentId, membersList) : null;
  const children = membersList.filter(m => m.parentId === member.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-amber-950 border-2 border-yellow-600/80 text-amber-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 border-b border-amber-800 p-5 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 font-bold text-lg">
              {member.generationLevel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-600/30 text-yellow-300 border border-yellow-500/40 text-xs font-semibold">
                  {member.generation}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  Mã: {member.code}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-amber-50 mt-1">
                {member.fullName}
              </h2>
              {member.otherName && (
                <p className="text-sm text-yellow-300 font-medium">
                  {member.otherName}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-300 hover:text-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Trực hệ / Thân phụ */}
          <div className="bg-amber-900/40 rounded-xl p-4 border border-amber-800/80 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
              <User className="w-4 h-4" />
              <span>Trực Hệ / Thân Phụ:</span>
            </div>
            <p className="text-sm text-amber-100">
              {member.relationship}
            </p>
            {parent && (
              <button
                onClick={() => onSelectMember(parent)}
                className="mt-2 text-xs text-yellow-300 underline underline-offset-2 hover:text-yellow-200 flex items-center gap-1 font-medium"
              >
                ➔ Xem phả hệ Thân phụ: Cụ {parent.fullName} ({parent.generation})
              </button>
            )}
          </div>

          {/* Thông tin Phối ngẫu (Vợ/Chồng) */}
          {member.spouse && (
            <div className="bg-amber-900/40 rounded-xl p-4 border border-amber-800/80 space-y-2">
              <div className="flex items-center gap-2 text-pink-400 text-sm font-semibold">
                <Heart className="w-4 h-4" />
                <span>Thông Tin Phối Ngẫu (Vợ/Chồng):</span>
              </div>
              <p className="text-sm text-amber-100 leading-relaxed">
                {member.spouse}
              </p>
            </div>
          )}

          {/* Sinh / Mất / Mộ táng / Kị nhật */}
          {member.birthDeathInfo && (
            <div className="bg-amber-900/40 rounded-xl p-4 border border-amber-800/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Thông Tin Sinh / Mất / Mộ Táng / Kị Nhật:</span>
              </div>
              <p className="text-sm text-amber-100 leading-relaxed">
                {member.birthDeathInfo}
              </p>
            </div>
          )}

          {/* Ghi chú / Con cái / Nơi ở / Sự nghiệp */}
          {member.notes && (
            <div className="bg-amber-900/40 rounded-xl p-4 border border-amber-800/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <Award className="w-4 h-4" />
                <span>Con Cái / Nơi Cư Trú / Sự Nghiệp:</span>
              </div>
              <p className="text-sm text-amber-100 leading-relaxed">
                {member.notes}
              </p>
            </div>
          )}

          {/* Hướng dẫn Danh xưng Xưng hô Tôn kính khi thưa chuyện */}
          <div className="bg-gradient-to-r from-amber-900/60 via-amber-950 to-amber-900/60 rounded-xl p-4 border border-yellow-600/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>Danh Xưng Xưng Hô Lễ Phép Khi Thưa Chuyện:</span>
              </div>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-medium">
                Gia phong tôn kính
              </span>
            </div>
            <div className="text-xs text-amber-200/90 space-y-1.5 leading-relaxed bg-amber-950/80 p-3 rounded-lg border border-amber-800/80">
              <p>
                • <strong>Thành viên Đời 15/16 (Cháu/Chắt):</strong> Kính xưng <strong>"Cháu"</strong> hoặc <strong>"Chắt"</strong>, gọi vị ấy là <strong>"{member.generationLevel <= 12 ? 'Cụ' : member.generationLevel === 13 ? 'Bậc Tiền Nhân / Ông' : 'Ông/Bà'} {member.fullName.split(' ').pop()}"</strong>.
              </p>
              <p>
                • <strong>Thành viên Đời 13/14 (Hàng Chú/Bác/Anh/Em):</strong> Kính xưng <strong>"Con/Cháu"</strong> (nếu vị ấy là bậc Tiền nhân) hoặc <strong>"Tôi/Em"</strong> (với đồng tộc).
              </p>
            </div>
            <button
              onClick={() => {
                onAskAi(`Xưng hô với ${member.fullName} (${member.generation}) thế nào?`);
                onClose();
              }}
              className="text-xs text-yellow-300 hover:text-yellow-200 font-medium flex items-center gap-1 transition-colors"
            >
              ➔ Thắc mắc chi tiết cách xưng hô? Hỏi Trợ lý AI
            </button>
          </div>

          {/* Danh sách Con Cái Trực Hệ trong phả hệ */}
          {children.length > 0 && (
            <div className="bg-amber-900/40 rounded-xl p-4 border border-amber-800/80 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
                <Users className="w-4 h-4" />
                <span>Các Con Trực Hệ Được Ghi Nhận ({children.length} vị):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onSelectMember(child)}
                    className="p-2.5 rounded-lg bg-amber-950/80 hover:bg-amber-800/60 border border-amber-700/60 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-medium text-amber-100 group-hover:text-yellow-300">
                        {child.fullName}
                      </div>
                      <div className="text-xs text-amber-400/80">
                        {child.generation} {child.otherName ? `• ${child.otherName}` : ''}
                      </div>
                    </div>
                    <span className="text-xs text-yellow-400 font-mono">
                      Mã {child.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-amber-900/90 border-t border-amber-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onAskAi(`Kính thưa Trợ lý AI, xin hãy cho biết chi tiết phả hệ, xuất thân, phối ngẫu và các con cháu của vị ${member.fullName} (${member.generation}, mã ${member.code}).`);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-amber-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Hỏi Trợ Lý AI Về Vị Này</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-950 border border-amber-700 hover:bg-amber-900 text-amber-200 text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
