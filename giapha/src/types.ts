export interface GenealogyMember {
  id: string;
  code: string;
  generation: string; // e.g. "Đời 11", "Đời 12", ...
  generationLevel: number; // 11, 12, 13, 14, 15, 16
  fullName: string;
  otherName?: string; // Tên khác / Hủy / Pháp danh
  relationship: string; // Quan hệ / Trực hệ
  parentId: string | null;
  spouse?: string; // Vợ / Chồng
  birthDeathInfo?: string; // Thông tin sinh, mất, mộ táng, kị nhật
  notes?: string; // Ghi chú / Con cái / Nơi ở / Sự nghiệp
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedMemberIds?: string[];
}

export interface FamilyStats {
  totalMembers: number;
  generationsCount: number;
  dharmaNamesCount: number;
  overseasMembersCount: number;
  locationCounts: Record<string, number>;
}
