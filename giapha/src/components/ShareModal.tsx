import React, { useState } from 'react';
import { GenealogyMember } from '../types';
import { X, Share2, Copy, Check, QrCode, Link2, Send, Sparkles, BookOpen } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GenealogyMember[];
  selectedMemberId?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  members,
  selectedMemberId,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [targetMemberId, setTargetMemberId] = useState<string>(selectedMemberId || '');

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = targetMemberId ? `${baseUrl}?member=${encodeURIComponent(targetMemberId)}` : baseUrl;

  // QR code image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=78350f&bgcolor=fef3c7&data=${encodeURIComponent(shareUrl)}`;

  const selectedMemberObj = members.find(m => m.id === targetMemberId);

  const inviteText = `Dạ kính thưa Quý thân nhân dòng họ Nguyễn Văn!

Kính mời Quý thân nhân truy cập Gia Phả Điện Tử Tộc Nguyễn Văn (Đời 11 - Đời 16) tích hợp Trợ Lý Gia Phả AI Lịch Sự Lễ Phép.

${selectedMemberObj ? `📌 Đường dẫn trực tiếp thông tin: Cụ ${selectedMemberObj.fullName} (${selectedMemberObj.generation})\n` : ''}🔗 Đường link tra cứu: ${shareUrl}

Kính chúc Quý thân nhân vạn sự an lành, gia đạo hưng thịnh!`;

  const copyToClipboard = (text: string, isMsg: boolean) => {
    navigator.clipboard.writeText(text);
    if (isMsg) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-amber-950 border-2 border-yellow-600/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-4 border-b border-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 overflow-hidden shrink-0">
              <img src="/emblem.jpg" alt="Biểu trưng Gia Phả" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-50">Chia Sẻ Link Gia Phả Tộc Nguyễn Văn</h2>
              <p className="text-xs text-amber-300/80">Kính gửi đường dẫn tra cứu cho bà con, thân nhân dòng họ</p>
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
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Pick specific member for deep linking */}
          <div className="space-y-2 bg-amber-900/40 p-4 rounded-xl border border-amber-800">
            <label className="text-xs font-semibold text-yellow-400 block flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              <span>Tạo link trực tiếp tới một vị Thành Viên cụ thể (Tùy chọn):</span>
            </label>
            <select
              value={targetMemberId}
              onChange={(e) => setTargetMemberId(e.target.value)}
              className="w-full bg-amber-950 border border-amber-700 text-amber-100 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">-- Toàn bộ trang Gia Phả Trang Chủ --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.generation} • {m.fullName} {m.otherName ? `(${m.otherName})` : ''} - Mã {m.code}
                </option>
              ))}
            </select>
          </div>

          {/* Share URL copy box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-300 block">Đường dẫn chia sẻ (URL):</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-amber-900/60 border border-amber-700 rounded-xl px-3.5 py-2 text-xs text-amber-100 font-mono truncate focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, false)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-amber-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Đã chép link!' : 'Chép link'}</span>
              </button>
            </div>
          </div>

          {/* QR Code & Invitation Text Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* QR Code Box */}
            <div className="sm:col-span-1 bg-amber-900/40 p-4 rounded-xl border border-amber-800 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2 bg-amber-100 rounded-xl shadow border border-yellow-500/50">
                <img
                  src={qrCodeUrl}
                  alt="Mã QR Gia Phả"
                  className="w-36 h-36 object-contain rounded"
                  onError={(e) => {
                    // Fallback visual if external image API blocked
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-yellow-300 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Quét mã Zalo/Camera
              </span>
            </div>

            {/* Ready Pre-written Message */}
            <div className="sm:col-span-2 space-y-2 bg-amber-900/40 p-4 rounded-xl border border-amber-800 flex flex-col justify-between">
              <div>
                <label className="text-xs font-semibold text-yellow-400 block mb-1">
                  Lời Mời Gửi Nhóm Zalo/Facebook Gia Tộc:
                </label>
                <textarea
                  readOnly
                  rows={6}
                  value={inviteText}
                  className="w-full bg-amber-950/80 border border-amber-700/80 rounded-lg p-2.5 text-xs text-amber-200/90 font-sans focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={() => copyToClipboard(inviteText, true)}
                className="mt-2 w-full py-2 bg-amber-800 hover:bg-amber-700 text-yellow-300 font-semibold text-xs rounded-lg border border-amber-600/80 flex items-center justify-center gap-2 transition-colors"
              >
                {copiedMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />}
                <span>{copiedMessage ? 'Đã sao chép lời mời!' : 'Sao chép tin nhắn lời mời'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-amber-950 p-4 border-t border-amber-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs font-semibold transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
