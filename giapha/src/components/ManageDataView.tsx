import React, { useState } from 'react';
import { GenealogyMember } from '../types';
import { saveGenealogyData, resetGenealogyData, parseGenerationLevel } from '../utils/storage';
import { GENEALOGY_DATA } from '../data/genealogyData';
import { Edit3, Plus, Trash2, RotateCcw, Download, Upload, Search, UserCheck, Save, X, AlertTriangle, ShieldCheck, Check, FileText, Sparkles, RefreshCw } from 'lucide-react';

interface ManageDataViewProps {
  members: GenealogyMember[];
  onUpdateMembers: (newMembers: GenealogyMember[]) => void;
  onSelectMember: (member: GenealogyMember) => void;
  onNavigateTab?: (tab: 'chat' | 'tree' | 'directory' | 'relationship' | 'insights' | 'manage') => void;
}

// Smart auto-repair helper for Vietnamese text corrupted by ANSI/Windows-1252 CSV
const repairVietnameseText = (str: string, code?: string, fieldName?: keyof GenealogyMember): string => {
  if (!str) return str;

  // 1. If code matches canonical dataset, borrow canonical clean text if uploaded string has '?' or ''
  if (code) {
    const canonical = GENEALOGY_DATA.find(g => g.code === code);
    if (canonical) {
      if (fieldName && canonical[fieldName]) {
        const canonicalVal = String(canonical[fieldName]);
        if (str.includes('?') || str.includes('') || str.includes('ï')) {
          return canonicalVal;
        }
      }
    }
  }

  // 2. Pattern replacements for common mangled Vietnamese characters
  let fixed = str
    .replace(/\?\?i/g, 'Đời')
    .replace(/\?i/g, 'Đời')
    .replace(/Nguy\?n/g, 'Nguyễn')
    .replace(/V\?n/g, 'Văn')
    .replace(/Xu\?n/g, 'Xuân')
    .replace(/Kh\?i/g, 'Khởi')
    .replace(/Ch\?n/g, 'Chơn')
    .replace(/Kh\?\?ng/g, 'Khương')
    .replace(/T\?\?ng/g, 'Tường')
    .replace(/Gi\?o/g, 'Giáo')
    .replace(/\?m/g, 'Ấm')
    .replace(/\?i\?u/g, 'Điều')
    .replace(/S\?/g, 'Sĩ')
    .replace(/\?t/g, 'Ất')
    .replace(/\?inh/g, 'Đinh')
    .replace(/K\?/g, 'Kỷ')
    .replace(/Nh\?m/g, 'Nhâm')
    .replace(/Qu\?/g, 'Quý')
    .replace(/Gi\?p/g, 'Giáp')
    .replace(/B\?nh/g, 'Bính')
    .replace(/M\?u/g, 'Mậu')
    .replace(/T\?n/g, 'Tân')
    .replace(/Th\?/g, 'Thọ')
    .replace(/Ch\?nh ph\?i/g, 'Chính phối')
    .replace(/Th\? ph\?i/g, 'Thứ phối')
    .replace(/Th\? n\?\?ng/g, 'Thứ nương')
    .replace(/Hi\?n T\?ng T\?/g, 'Hiền Tặng Tự')
    .replace(/Ph\?p danh/g, 'Pháp danh')
    .replace(/C\? nh\?n/g, 'Cử nhân')
    .replace(/Su\?t ??i/g, 'Suất đội')
    .replace(/M\?/g, 'Mộ')
    .replace(/K\? /g, 'Kị ')
    .replace(/\?L/g, 'ÂL');

  return fixed;
};

export const ManageDataView: React.FC<ManageDataViewProps> = ({
  members,
  onUpdateMembers,
  onSelectMember,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingMember, setEditingMember] = useState<GenealogyMember | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<GenealogyMember>>({
    id: '',
    code: '',
    generation: 'Đời 15',
    generationLevel: 15,
    fullName: '',
    otherName: '',
    relationship: '',
    parentId: '',
    spouse: '',
    birthDeathInfo: '',
    notes: '',
  });

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const filteredMembers = members.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(term) ||
      m.code.toLowerCase().includes(term) ||
      (m.otherName && m.otherName.toLowerCase().includes(term)) ||
      m.generation.toLowerCase().includes(term)
    );
  });

  const handleOpenAdd = (parentMember?: GenealogyMember) => {
    const newId = `1_${Date.now().toString().slice(-6)}`;
    setFormData({
      id: newId,
      code: parentMember ? `${parentMember.code}_1` : '1_1_1_1',
      generation: parentMember ? `Đời ${parentMember.generationLevel + 1}` : 'Đời 15',
      generationLevel: parentMember ? parentMember.generationLevel + 1 : 15,
      fullName: '',
      otherName: '',
      relationship: parentMember ? `Con của ${parentMember.fullName}` : 'Trực hệ Tộc Nguyễn Văn',
      parentId: parentMember ? parentMember.id : (members[0]?.id || '1'),
      spouse: '',
      birthDeathInfo: '',
      notes: '',
    });
    setIsAddingNew(true);
    setEditingMember(null);
  };

  const handleOpenEdit = (member: GenealogyMember) => {
    setFormData({ ...member });
    setEditingMember(member);
    setIsAddingNew(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fullName.trim()) {
      showStatus('Vui lòng nhập Họ tên thành viên!', 'error');
      return;
    }

    const memberToSave: GenealogyMember = {
      id: formData.id || `member_${Date.now()}`,
      code: formData.code || '1_1',
      generation: formData.generation || 'Đời 15',
      generationLevel: Number(formData.generationLevel) || 15,
      fullName: formData.fullName.trim(),
      otherName: formData.otherName?.trim() || undefined,
      relationship: formData.relationship?.trim() || 'Trực hệ',
      parentId: formData.parentId || null,
      spouse: formData.spouse?.trim() || undefined,
      birthDeathInfo: formData.birthDeathInfo?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    let updatedList: GenealogyMember[];
    if (isAddingNew) {
      updatedList = [...members, memberToSave];
      showStatus(`Đã thêm thành công thành viên: ${memberToSave.fullName}`);
    } else {
      updatedList = members.map(m => (m.id === memberToSave.id ? memberToSave : m));
      showStatus(`Đã cập nhật thành công thông tin: ${memberToSave.fullName}`);
    }

    saveGenealogyData(updatedList);
    onUpdateMembers(updatedList);
    setEditingMember(null);
    setIsAddingNew(false);
  };

  const handleDeleteMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    saveGenealogyData(updated);
    onUpdateMembers(updated);
    setDeleteConfirmId(null);
    showStatus('Đã xóa thông tin thành viên khỏi hệ thống!');
  };

  const handleResetData = () => {
    if (window.confirm('Quý thân nhân có chắc chắn muốn khôi phục lại Dữ liệu Gia phả Gốc ban đầu? Mọi chỉnh sửa cá nhân sẽ được đặt lại.')) {
      const reset = resetGenealogyData();
      onUpdateMembers(reset);
      showStatus('Đã khôi phục dữ liệu gia phả mặc định ban đầu!');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Gia_Pha_Nguyen_Van_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStatus('Đã trích xuất tệp dữ liệu gia phả JSON!');
  };

  const handleExportCSV = () => {
    const headers = ['Mã số', 'Đời Thứ', 'Tên Thành Viên', 'Tên Khác / Hụy / Pháp Danh', 'Quan Hệ / Trực Hệ Với', 'Thông Tin Phối Ngẫu (Vợ/Chồng)', 'Thông Tin Sinh / Mất / Mộ Táng / Kị Phụ', 'Ghi Chú / Con Cái / Sự Nghiệp'];
    const rows = members.map(m => [
      `"${m.code || ''}"`,
      `"${m.generation || ''}"`,
      `"${m.fullName || ''}"`,
      `"${m.otherName || ''}"`,
      `"${m.relationship || ''}"`,
      `"${m.spouse || ''}"`,
      `"${m.birthDeathInfo || ''}"`,
      `"${m.notes || ''}"`
    ].join(','));
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gia_Pha_Nguyen_Van_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showStatus('Đã trích xuất thành công tệp CSV gia phả!');
  };

  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [pastedContent, setPastedContent] = useState<string>('');

  const parseCSVToMembers = (csvText: string): GenealogyMember[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (text: string): string[] => {
      const isTab = text.includes('\t');
      const delimiter = isTab ? '\t' : ',';
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          if (inQuotes && text[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const dataLines = lines.slice(1);
    const parsedMembers: GenealogyMember[] = [];

    dataLines.forEach((lineStr) => {
      const cols = parseLine(lineStr);
      if (cols.length >= 3 && cols[2]) {
        const code = cols[0] || '';
        const genText = repairVietnameseText(cols[1] || 'Đời 15', code, 'generation');
        const fullName = repairVietnameseText(cols[2], code, 'fullName');
        const otherName = cols[3] ? repairVietnameseText(cols[3], code, 'otherName') : undefined;
        const relationship = cols[4] ? repairVietnameseText(cols[4], code, 'relationship') : 'Trực hệ';
        const spouse = cols[5] ? repairVietnameseText(cols[5], code, 'spouse') : undefined;
        const birthDeathInfo = cols[6] ? repairVietnameseText(cols[6], code, 'birthDeathInfo') : undefined;
        const notes = cols[7] ? repairVietnameseText(cols[7], code, 'notes') : undefined;

        let generationLevel = parseGenerationLevel(genText);

        let parentId: string | null = null;
        if (code.includes('_')) {
          const parts = code.split('_');
          parentId = parts.slice(0, -1).join('_');
        }

        parsedMembers.push({
          id: code || `mem_${Date.now()}_${Math.random()}`,
          code,
          generation: genText,
          generationLevel,
          fullName,
          otherName,
          relationship,
          parentId,
          spouse,
          birthDeathInfo,
          notes,
        });
      }
    });

    return parsedMembers;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processText = (text: string) => {
      if (file.name.endsWith('.csv') || text.includes('Mã số') || text.includes('Đời Thứ') || text.includes('1_1')) {
        const parsed = parseCSVToMembers(text);
        if (parsed.length > 0) {
          saveGenealogyData(parsed);
          onUpdateMembers(parsed);
          showStatus(`Đã tải lên & tự động sửa lỗi phông thành công ${parsed.length} bản ghi gia phả từ CSV!`);
        } else {
          showStatus('Tệp CSV không thể đọc được cấu trúc bản ghi!', 'error');
        }
      } else {
        const json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0 && json[0].fullName) {
          saveGenealogyData(json);
          onUpdateMembers(json);
          showStatus(`Đã tải lên & áp dụng thành công ${json.length} bản ghi gia phả từ JSON!`);
        } else {
          showStatus('Tệp JSON không đúng cấu trúc gia phả!', 'error');
        }
      }
    };

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let text = event.target?.result as string;
        // If text contains unreadable replacement characters (\uFFFD), try re-reading as windows-1252
        if (text.includes('\uFFFD')) {
          const secondReader = new FileReader();
          secondReader.onload = (secEvent) => {
            try {
              const secText = secEvent.target?.result as string;
              processText(secText || text);
            } catch (err) {
              processText(text);
            }
          };
          secondReader.readAsText(file, 'windows-1252');
          return;
        }
        processText(text);
      } catch (err) {
        showStatus('Lỗi khi đọc tệp dữ liệu!', 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleApplyPastedContent = () => {
    if (!pastedContent || !pastedContent.trim()) {
      showStatus('Vui lòng dán nội dung CSV hoặc JSON!', 'error');
      return;
    }

    try {
      const trimmed = pastedContent.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveGenealogyData(parsed);
          onUpdateMembers(parsed);
          setIsPasteModalOpen(false);
          setPastedContent('');
          showStatus(`Đã cập nhật thành công ${parsed.length} bản ghi từ văn bản dán!`);
          return;
        }
      }

      const parsedCsv = parseCSVToMembers(trimmed);
      if (parsedCsv.length > 0) {
        saveGenealogyData(parsedCsv);
        onUpdateMembers(parsedCsv);
        setIsPasteModalOpen(false);
        setPastedContent('');
        showStatus(`Đã cập nhật & tự động sửa phông thành công ${parsedCsv.length} bản ghi từ CSV!`);
      } else {
        showStatus('Nội dung dán không khớp với định dạng CSV hoặc JSON phả hệ!', 'error');
      }
    } catch (e) {
      showStatus('Lỗi khi xử lý dữ liệu dán vào!', 'error');
    }
  };

  const handleRestoreStandardData = (andNavigateToTree: boolean = false) => {
    saveGenealogyData(GENEALOGY_DATA);
    onUpdateMembers(GENEALOGY_DATA);
    showStatus('Đã đồng bộ & cập nhật lại toàn bộ 52 vị gia phả Tộc Nguyễn Văn chuẩn tiếng Việt!');
    if (andNavigateToTree && onNavigateTab) {
      onNavigateTab('tree');
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Primary "Cập Nhật Dữ Liệu" Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-amber-950 to-emerald-950 border-2 border-emerald-600/70 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hệ Thống Tự Động Sửa Phông Tiếng Việt & Sơ Đồ Cây Gia Phả</span>
            </div>
            <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2 font-serif">
              <span>CẬP NHẬT DỮ LIỆU GIA PHẢ CHUẨN</span>
            </h2>
            <p className="text-xs text-amber-200/90 max-w-2xl leading-relaxed">
              Nhấn nút <strong>"Cập Nhật &amp; Xem Cây Gia Phả"</strong> để nạp dữ liệu chuẩn 52 thành viên Tộc Nguyễn Văn có đầy đủ dấu Tiếng Việt sắc nét và xem trực tiếp trên sơ đồ cây phả hệ interactive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleRestoreStandardData(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-all border border-emerald-300/40 transform active:scale-95"
              title="Cập nhật 52 thành viên gia phả chuẩn và mở ngay Cây Gia Phả"
            >
              <RefreshCw className="w-4 h-4 text-emerald-200 animate-spin-slow" />
              <span>Đưa Dữ Liệu Vào Trình Gia Phả (Xem Cây Ngay) ➔</span>
            </button>

            <button
              onClick={() => handleRestoreStandardData(false)}
              className="px-3.5 py-2.5 bg-amber-900/90 hover:bg-amber-800 text-emerald-300 border border-emerald-600 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
              title="Đồng bộ lại dữ liệu gốc chuẩn"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Đồng Bộ Dữ Liệu Gốc</span>
            </button>

            <button
              onClick={() => setIsPasteModalOpen(true)}
              className="px-3.5 py-2.5 bg-amber-900/90 hover:bg-amber-800 text-yellow-300 border border-amber-600 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <FileText className="w-4 h-4 text-yellow-400" />
              <span>Dán CSV/JSON</span>
            </button>

            <label className="px-3.5 py-2.5 bg-amber-900/90 hover:bg-amber-800 text-amber-100 border border-amber-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all">
              <Upload className="w-4 h-4 text-yellow-400" />
              <span>Tải File CSV</span>
              <input type="file" accept=".csv,.json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Control Bar & Actions */}
      <div className="bg-amber-950/80 border border-amber-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-amber-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-yellow-400" />
            <span>Công Cụ Quản Lý &amp; Trích Xuất Dữ Liệu</span>
          </h3>
          <p className="text-xs text-amber-300/70 mt-0.5">
            Tổng số bản ghi gia phả hiện tại: <strong className="text-yellow-400">{members.length} thành viên</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleRestoreStandardData(false)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Nút Cập nhật & Đồng bộ dữ liệu gia phả"
          >
            <RefreshCw className="w-4 h-4 text-emerald-200" />
            <span>Cập Nhật &amp; Đồng Bộ</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-amber-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên Mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="Tải về file bảng tính CSV"
          >
            <Download className="w-4 h-4 text-yellow-400" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="Tải về file sao lưu JSON"
          >
            <Download className="w-4 h-4 text-yellow-400" />
            <span>Xuất JSON</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/80 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            title="Khôi phục về bản ghi gốc"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Đặt Lại Ban Đầu</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-sm font-medium animate-fadeIn ${
          statusMessage.type === 'error'
            ? 'bg-red-950 border-red-800 text-red-200'
            : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" /> : <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          {onNavigateTab && statusMessage.type === 'success' && (
            <button
              onClick={() => onNavigateTab('tree')}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-amber-950 font-bold text-xs rounded-lg shadow flex items-center gap-1 transition-all ml-auto shrink-0"
            >
              <span>Xem Trình Gia Phả Ngay ➔</span>
            </button>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-amber-950/60 border border-amber-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            placeholder="Lọc tên thành viên để chỉnh sửa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-amber-900/50 border border-amber-700 rounded-xl text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <span className="text-xs text-amber-300 whitespace-nowrap font-medium">
          Hiển thị: {filteredMembers.length} / {members.length} vị
        </span>
      </div>

      {/* Member Table / List */}
      <div className="bg-amber-950/80 border border-amber-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-amber-200">
            <thead className="bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 text-yellow-300 font-bold border-b border-amber-800">
              <tr>
                <th className="p-3.5">Thế Hệ</th>
                <th className="p-3.5">Mã Số</th>
                <th className="p-3.5">Họ Tên &amp; Pháp Danh</th>
                <th className="p-3.5">Quan Hệ Trực Hệ</th>
                <th className="p-3.5">Phối Ngẫu</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/60">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-amber-900/40 transition-colors">
                  <td className="p-3.5 font-semibold text-yellow-400/90 whitespace-nowrap">
                    {m.generation}
                  </td>
                  <td className="p-3.5 font-mono text-amber-300/80 whitespace-nowrap">
                    {m.code}
                  </td>
                  <td className="p-3.5 font-bold text-amber-50">
                    <button
                      onClick={() => onSelectMember(m)}
                      className="hover:text-yellow-300 hover:underline text-left"
                    >
                      {m.fullName}
                    </button>
                    {m.otherName && (
                      <span className="block text-[11px] font-normal text-yellow-300/90">
                        {m.otherName}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-amber-200/90 max-w-xs truncate">
                    {m.relationship}
                  </td>
                  <td className="p-3.5 text-pink-300/90 max-w-xs truncate">
                    {m.spouse || '—'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenAdd(m)}
                        title="Thêm con cháu của vị này"
                        className="px-2.5 py-1 rounded bg-amber-900 hover:bg-amber-800 text-yellow-300 border border-amber-700 text-[11px] font-medium transition-colors"
                      >
                        + Thêm Con
                      </button>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 rounded bg-amber-800 hover:bg-amber-700 text-amber-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        title="Xóa bản ghi"
                        className="p-1.5 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-amber-950 border-2 border-red-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Xác Nhận Xóa Bản Ghi Phả Hệ</span>
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Quý thân nhân có chắc chắn muốn xóa thành viên{' '}
              <strong className="text-yellow-300">
                {members.find(m => m.id === deleteConfirmId)?.fullName}
              </strong>{' '}
              khỏi danh sách phả hệ không?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs font-semibold rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteMember(deleteConfirmId)}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {(isAddingNew || editingMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-amber-950 border-2 border-yellow-600/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-4 border-b border-amber-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-50 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-yellow-400" />
                <span>{isAddingNew ? 'Thêm Thành Viên Phả Hệ Mới' : `Chỉnh Sửa: ${editingMember?.fullName}`}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingMember(null);
                }}
                className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveForm} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-yellow-400 block">Họ và Tên (* Bắt buộc):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn Khai"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Other Name / Dharma Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-300 block">Tên gọi khác / Pháp danh:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Pháp danh Chơn Thông"
                    value={formData.otherName || ''}
                    onChange={(e) => setFormData({ ...formData, otherName: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-300 block">Mã Số Phả Hệ (Ví dụ: 1_1_1_1):</label>
                  <input
                    type="text"
                    placeholder="1_1_1_1_5"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Generation Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-300 block">Thế Hệ (Đời thứ):</label>
                  <select
                    value={formData.generation || 'Đời 15'}
                    onChange={(e) => {
                      const gen = e.target.value;
                      const level = parseGenerationLevel(gen);
                      setFormData({ ...formData, generation: gen, generationLevel: level });
                    }}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Đời 11">Đời 11</option>
                    <option value="Đời 12">Đời 12</option>
                    <option value="Đời 13">Đời 13</option>
                    <option value="Đời 14">Đời 14</option>
                    <option value="Đời 15">Đời 15</option>
                    <option value="Đời 16">Đời 16</option>
                  </select>
                </div>

                {/* Parent Member Selector */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-300 block">Trực hệ Cha/Mẹ trong họ:</label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">-- Không chọn (Thủy Tổ) --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.generation} • {m.fullName} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relationship Text */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-amber-300 block">Trực Hệ Quan Hệ:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Con trai thứ 2 của Cụ Nguyễn Văn Khởi"
                    value={formData.relationship || ''}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Spouse */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-amber-300 block">Phối Ngẫu (Vợ/Chồng):</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Bà Võ Thị Dĩ (Pháp danh Diệu Nhẫn)"
                    value={formData.spouse || ''}
                    onChange={(e) => setFormData({ ...formData, spouse: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Birth Death Info */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-amber-300 block">Sinh, Mất, Kị Nhật, Mộ Táng:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Sinh năm 1928, mất ngày 15 tháng 8 Âm lịch. Mộ táng tại An Lương."
                    value={formData.birthDeathInfo || ''}
                    onChange={(e) => setFormData({ ...formData, birthDeathInfo: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-amber-300 block">Ghi Chú / Con Cái / Định Cư:</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi chú về con cái, địa chỉ sinh sống, sự nghiệp..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-amber-900/50 border border-amber-700 rounded-xl p-2.5 text-amber-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-amber-800 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded-xl font-semibold transition-colors text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-yellow-300 border border-amber-600 font-bold rounded-xl shadow flex items-center gap-1.5 transition-all text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Bản Ghi</span>
                </button>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={(e) => {
                      handleSaveForm(e);
                      if (formData.fullName && formData.fullName.trim()) {
                        onNavigateTab('tree');
                      }
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Lưu &amp; Xem Trình Gia Phả ➔</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paste CSV/JSON Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-amber-950 border-2 border-yellow-600/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-4 border-b border-amber-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-50 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <span>Dán Nội Dung CSV Hoặc JSON Nhập Dữ Liệu</span>
              </h3>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-amber-200/90 leading-relaxed">
                Quý thân nhân có thể sao chép và dán trực tiếp dữ liệu dạng bảng CSV hoặc JSON vào ô bên dưới. Hệ thống sẽ tự động quét và sửa các lỗi phông chữ Tiếng Việt nếu bị mất dấu.
              </p>

              <textarea
                rows={10}
                placeholder="Dán nội dung CSV (Mã số, Đời Thứ, Tên Thành Viên,...) hoặc chuỗi JSON tại đây..."
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                className="w-full bg-amber-900/40 border border-amber-700/80 rounded-xl p-3 text-amber-100 font-mono text-xs placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleRestoreStandardData}
                  className="px-3 py-2 bg-amber-900 hover:bg-amber-800 text-yellow-300 rounded-xl font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Dùng Dữ Liệu Gốc 52 Vị</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPasteModalOpen(false)}
                    className="px-4 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded-xl font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyPastedContent}
                    className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-yellow-300 font-bold rounded-xl border border-amber-600 shadow flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Cập Nhật &amp; Sửa Phông</span>
                  </button>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        handleApplyPastedContent();
                        onNavigateTab('tree');
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Cập Nhật &amp; Xem Cây Gia Phả ➔</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
