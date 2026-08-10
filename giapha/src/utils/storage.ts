import { GenealogyMember } from '../types';
import { GENEALOGY_DATA } from '../data/genealogyData';

const STORAGE_KEY = 'nguyen_van_genealogy_members_v7';

// Helper to fix corrupted Vietnamese encoding from non-UTF8/ANSI CSV imports
export const cleanVietnameseEncoding = (str: string): string => {
  if (!str) return str;

  // Replace unicode replacement characters (\uFFFD) and common mangled patterns
  let fixed = str
    .replace(/\uFFFD/g, 'Đ')
    .replace(/\?\?i/g, 'Đời')
    .replace(/\?i/g, 'Đời')
    .replace(/Nguy\?n/g, 'Nguyễn')
    .replace(/Nguy\uFFFDn/g, 'Nguyễn')
    .replace(/V\?n/g, 'Văn')
    .replace(/V\uFFFDn/g, 'Văn')
    .replace(/Xu\?n/g, 'Xuân')
    .replace(/Kh\?i/g, 'Khởi')
    .replace(/Ch\?n/g, 'Chơn')
    .replace(/Kh\?\?ng/g, 'Khương')
    .replace(/Kh\uFFFDng/g, 'Khương')
    .replace(/T\?\?ng/g, 'Tường')
    .replace(/T\uFFFDng/g, 'Tường')
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
    .replace(/\?L/g, 'ÂL')
    .replace(/C\?n C\?t/g, 'Cần Cát')
    .replace(/Tr??ng/g, 'Trương')
    .replace(/D??ng/g, 'Dương')
    .replace(/Ph??ng/g, 'Phương')
    .replace(/H??ng/g, 'Hương');

  return fixed;
};

export const parseGenerationLevel = (genStr?: string, defaultLevel = 15): number => {
  if (!genStr) return defaultLevel;
  if (genStr.includes('11') || genStr.includes('XI')) return 11;
  if (genStr.includes('12') || genStr.includes('XII')) return 12;
  if (genStr.includes('13') || genStr.includes('XIII')) return 13;
  if (genStr.includes('14') || genStr.includes('XIV')) return 14;
  if (genStr.includes('15') || genStr.includes('XV')) return 15;
  if (genStr.includes('16') || genStr.includes('XVI')) return 16;
  const match = genStr.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return defaultLevel;
};

export const loadGenealogyData = (): GenealogyMember[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically repair damaged Vietnamese text (e.g. ? marks from legacy non-UTF8 imports)
        const repaired = parsed.map((member) => {
          const canonical = GENEALOGY_DATA.find((g) => g.code === member.code);

          const fixField = (val: string | undefined, canonicalVal: string | undefined): string | undefined => {
            // If canonical data has a valid clean string for this code, prefer canonical when val has '?' or '\uFFFD' or 'ï' or is corrupt
            if (canonicalVal !== undefined) {
              if (!val || val.includes('?') || val.includes('\uFFFD') || val.includes('ï')) {
                return canonicalVal;
              }
            }
            if (!val) return val;
            return cleanVietnameseEncoding(val);
          };

          const gen = fixField(member.generation, canonical?.generation) || 'Đời 15';
          const genLevel = Number(member.generationLevel) || canonical?.generationLevel || parseGenerationLevel(gen);

          return {
            ...member,
            generation: gen,
            generationLevel: genLevel,
            fullName: fixField(member.fullName, canonical?.fullName) || member.fullName,
            otherName: fixField(member.otherName, canonical?.otherName),
            relationship: fixField(member.relationship, canonical?.relationship) || 'Trực hệ',
            spouse: fixField(member.spouse, canonical?.spouse),
            birthDeathInfo: fixField(member.birthDeathInfo, canonical?.birthDeathInfo),
            notes: fixField(member.notes, canonical?.notes),
          };
        });

        // Save repaired version back to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(repaired));
        return repaired;
      }
    }
  } catch (err) {
    console.error('Failed to load genealogy data from localStorage:', err);
  }
  return GENEALOGY_DATA;
};

export const saveGenealogyData = (data: GenealogyMember[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save genealogy data to localStorage:', err);
  }
};

export const resetGenealogyData = (): GenealogyMember[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset genealogy data:', err);
  }
  return GENEALOGY_DATA;
};

export const generateGenealogySummary = (members: GenealogyMember[]): string => {
  return members
    .map(
      (m) =>
        `[${m.code}] ${m.generation} - ${m.fullName}${
          m.otherName ? ` (${m.otherName})` : ''
        } | Trực hệ: ${m.relationship}${
          m.spouse ? ` | Vợ/Chồng: ${m.spouse}` : ''
        }${m.birthDeathInfo ? ` | Sinh/Mất/Mộ: ${m.birthDeathInfo}` : ''}${
          m.notes ? ` | Ghi chú: ${m.notes}` : ''
        }`
    )
    .join('\n');
};
