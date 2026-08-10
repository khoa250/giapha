import React from 'react';
import { 
  Bot, 
  GitFork, 
  Users, 
  GitCompare, 
  BarChart3, 
  BookOpen, 
  Search,
  Sparkles,
  Edit3,
  Share2,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'tree' | 'directory' | 'relationship' | 'insights' | 'manage';
  setActiveTab: (tab: 'chat' | 'tree' | 'directory' | 'relationship' | 'insights' | 'manage') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalMembers: number;
  onOpenShareModal: () => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  totalMembers,
  onOpenShareModal,
  onRefreshData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-amber-950 border-b border-amber-800 text-amber-50 shadow-lg">
      {/* Top Banner / Decorative Bar */}
      <div className="bg-gradient-to-r from-amber-900 via-yellow-700 to-amber-900 text-amber-100 text-xs py-1 px-4 text-center border-b border-amber-700 font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>Gia Phả Điện Tử Tộc Nguyễn Văn • Đời 11 đến Đời 16 ({totalMembers} Thành Viên)</span>
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <img
                src="/emblem.jpg"
                alt="Biểu trưng Gia Phả Họ Nguyễn Văn"
                className="w-full h-full rounded-full object-cover border border-yellow-400/60 shadow-inner"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif tracking-wide text-amber-100 flex items-center gap-2">
                <span>GIA PHẢ HỌ NGUYỄN VĂN</span>
              </h1>
              <p className="text-xs text-amber-300/80">
                Trợ lý Gia phả AI Thông minh • Tra cứu &amp; Xem thông tin phả hệ dòng họ
              </p>
            </div>
          </div>

          {/* Search Bar & Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thành viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-amber-900/60 border border-amber-700/80 rounded-lg text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:text-amber-200"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (onRefreshData) onRefreshData();
                setActiveTab('manage');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-amber-900 hover:from-emerald-700 hover:to-amber-800 border border-emerald-600/70 text-emerald-200 hover:text-amber-100 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
              title="Cập nhật & Quản lý dữ liệu gia phả"
            >
              <RefreshCw className="w-4 h-4 text-emerald-300" />
              <span>Cập Nhật Dữ Liệu</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-amber-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
              title="Chia sẻ link gia phả cho họ hàng"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chia Sẻ</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2 pt-1 border-t border-amber-900/80 no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-amber-800 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-amber-200/90 hover:bg-amber-900/50 hover:text-amber-100'
            }`}
          >
            <Bot className="w-4 h-4 text-yellow-400" />
            <span>Trợ Lý Gia Phả AI</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'tree'
                ? 'bg-amber-800 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-amber-200/90 hover:bg-amber-900/50 hover:text-amber-100'
            }`}
          >
            <GitFork className="w-4 h-4 text-yellow-400" />
            <span>Cây Gia Phả Visual</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-amber-800 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-amber-200/90 hover:bg-amber-900/50 hover:text-amber-100'
            }`}
          >
            <Users className="w-4 h-4 text-yellow-400" />
            <span>Danh Sách Thành Viên</span>
          </button>

          <button
            onClick={() => setActiveTab('relationship')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'relationship'
                ? 'bg-amber-800 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-amber-200/90 hover:bg-amber-900/50 hover:text-amber-100'
            }`}
          >
            <GitCompare className="w-4 h-4 text-yellow-400" />
            <span>Đối Chiếu Quan Hệ</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-amber-800 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-amber-200/90 hover:bg-amber-900/50 hover:text-amber-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-yellow-400" />
            <span>Thống Kê Dòng Họ</span>
          </button>

          <button
            onClick={() => {
              if (onRefreshData) onRefreshData();
              setActiveTab('manage');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/60 shadow-sm'
                : 'text-emerald-300/90 hover:bg-emerald-950/60 hover:text-emerald-100'
            }`}
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Cập Nhật &amp; Quản Lý</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

