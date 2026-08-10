import { GenealogyMember, FamilyStats } from '../types';
import { loadGenealogyData } from './storage';

// Find a member by ID or code or name
export function findMemberById(id: string, membersList?: GenealogyMember[]): GenealogyMember | undefined {
  const list = membersList || loadGenealogyData();
  return list.find(m => m.id === id || m.code === id);
}

// Get lineage path from root to member
export function getLineagePath(memberId: string, membersList?: GenealogyMember[]): GenealogyMember[] {
  const list = membersList || loadGenealogyData();
  const path: GenealogyMember[] = [];
  let current = findMemberById(memberId, list);
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = findMemberById(current.parentId, list);
  }
  return path;
}

// Compute statistics
export function calculateStats(membersList?: GenealogyMember[]): FamilyStats {
  const list = membersList || loadGenealogyData();
  const totalMembers = list.length;
  const generationsSet = new Set(list.map(m => m.generation));
  const dharmaNamesCount = list.filter(m => m.otherName && m.otherName.toLowerCase().includes('pháp danh')).length;
  const overseasMembersCount = list.filter(m => 
    (m.notes && (m.notes.toLowerCase().includes('mỹ') || m.notes.toLowerCase().includes('hoa kỳ') || m.notes.toLowerCase().includes('vermont'))) ||
    (m.birthDeathInfo && m.birthDeathInfo.toLowerCase().includes('hoa kỳ'))
  ).length;

  const locationCounts: Record<string, number> = {
    'Hoa Kỳ (Hải ngoại)': overseasMembersCount,
    'Đồng Nai / Cố Bản': 0,
    'Bà Rịa - Vũng Tàu': 0,
    'Ban Mê Thuột / Đắk Lắk': 0,
    'Lao Bảo / Quảng Trị': 0,
    'TP. Hồ Chí Minh': 0,
    'Thừa Thiên Huế': 0,
  };

  list.forEach(m => {
    const text = ((m.notes || '') + " " + (m.birthDeathInfo || '')).toLowerCase();
    if (text.includes('đồng nai') || text.includes('cố bản') || text.includes('long khánh')) locationCounts['Đồng Nai / Cố Bản']++;
    if (text.includes('bà rịa') || text.includes('vũng tàu')) locationCounts['Bà Rịa - Vũng Tàu']++;
    if (text.includes('ban mê thuột') || text.includes('đắc lắc') || text.includes('đắk lắk')) locationCounts['Ban Mê Thuột / Đắk Lắk']++;
    if (text.includes('lao bảo')) locationCounts['Lao Bảo / Quảng Trị']++;
    if (text.includes('tphcm') || text.includes('tp.hcm') || text.includes('sài gòn')) locationCounts['TP. Hồ Chí Minh']++;
    if (text.includes('huế')) locationCounts['Thừa Thiên Huế']++;
  });

  return {
    totalMembers,
    generationsCount: generationsSet.size,
    dharmaNamesCount,
    overseasMembersCount,
    locationCounts,
  };
}

// Calculate relation between two members
export interface RelationshipResult {
  ancestorLCA: GenealogyMember | null;
  genDiff: number; // memberA.gen - memberB.gen
  relationshipText: string;
  addressingText: string;
  lineageA: GenealogyMember[];
  lineageB: GenealogyMember[];
}

export function calculateRelationship(idA: string, idB: string, membersList?: GenealogyMember[]): RelationshipResult | null {
  const list = membersList || loadGenealogyData();
  const memberA = findMemberById(idA, list);
  const memberB = findMemberById(idB, list);
  if (!memberA || !memberB) return null;

  const pathA = getLineagePath(idA, list);
  const pathB = getLineagePath(idB, list);

  // Find Lowest Common Ancestor (LCA)
  let lca: GenealogyMember | null = null;
  let lcaIndex = -1;
  let minLen = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < minLen; i++) {
    if (pathA[i].id === pathB[i].id) {
      lca = pathA[i];
      lcaIndex = i;
    } else {
      break;
    }
  }

  // Determine branch ordering if LCA is found and both paths have steps after LCA
  let branchOrderA = 0;
  let branchOrderB = 0;
  let isSeniorBranchA = false;
  let isSeniorBranchB = false;

  if (lcaIndex >= 0 && lcaIndex + 1 < pathA.length && lcaIndex + 1 < pathB.length && lca) {
    const branchA = pathA[lcaIndex + 1];
    const branchB = pathB[lcaIndex + 1];
    const childrenOfLCA = list.filter(m => m.parentId === lca.id);
    const idxA = childrenOfLCA.findIndex(m => m.id === branchA.id);
    const idxB = childrenOfLCA.findIndex(m => m.id === branchB.id);
    if (idxA !== -1 && idxB !== -1) {
      branchOrderA = idxA;
      branchOrderB = idxB;
      isSeniorBranchA = idxA < idxB; // A's lineage comes from an elder sibling
      isSeniorBranchB = idxB < idxA; // B's lineage comes from an elder sibling
    }
  }

  const isFemale = (m: GenealogyMember) => {
    const text = ((m.relationship || '') + ' ' + (m.fullName || '') + ' ' + (m.notes || '')).toLowerCase();
    return (
      text.includes('vợ') ||
      text.includes('bà') ||
      text.includes('cụ bà') ||
      text.includes('con gái') ||
      text.includes('chị') ||
      text.includes('em gái')
    );
  };

  const genDiff = memberA.generationLevel - memberB.generationLevel;
  let relationshipText = '';
  let addressingText = '';

  if (idA === idB) {
    relationshipText = `${memberA.fullName} và ${memberB.fullName} là CÙNG MỘT NGƯỜI`;
    addressingText = `Bản thân (${memberA.fullName})`;
  } else if (memberA.parentId === idB) {
    relationshipText = `${memberA.fullName} là CON ruột của ${memberB.fullName}`;
    addressingText = isFemale(memberB)
      ? `${memberA.fullName} xưng "Con", kính gọi ${memberB.fullName} là "Mẹ"`
      : `${memberA.fullName} xưng "Con", kính gọi ${memberB.fullName} là "Cha" (hoặc "Ba")`;
  } else if (memberB.parentId === idA) {
    relationshipText = `${memberA.fullName} là THÂN SINH (Cha/Mẹ) trực hệ của ${memberB.fullName}`;
    addressingText = isFemale(memberA)
      ? `${memberA.fullName} xưng "Mẹ", gọi ${memberB.fullName} là "Con"`
      : `${memberA.fullName} xưng "Cha", gọi ${memberB.fullName} là "Con"`;
  } else if (lca && lca.id === memberB.id) {
    const dist = memberA.generationLevel - memberB.generationLevel;
    if (dist === 2) {
      relationshipText = `${memberA.fullName} là CHÁU NỘI trực hệ của ${memberB.fullName}`;
      addressingText = isFemale(memberB)
        ? `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Bà Nội"`
        : `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Ông Nội"`;
    } else if (dist === 3) {
      relationshipText = `${memberA.fullName} là CHẮT NỘI trực hệ của ${memberB.fullName}`;
      addressingText = isFemale(memberB)
        ? `${memberA.fullName} xưng "Chắt", kính gọi ${memberB.fullName} là "Cụ Bà"`
        : `${memberA.fullName} xưng "Chắt", kính gọi ${memberB.fullName} là "Cụ Ông"`;
    } else {
      relationshipText = `${memberA.fullName} là HẬU DUỆ NỘI TRỰC HỆ (cách ${dist} đời) của ${memberB.fullName}`;
      addressingText = isFemale(memberB)
        ? `${memberA.fullName} xưng "Chắt/Hậu duệ", kính gọi ${memberB.fullName} là "Cụ Bà Thủy Tổ / Bậc Tiền Nhân"`
        : `${memberA.fullName} xưng "Chắt/Hậu duệ", kính gọi ${memberB.fullName} là "Cụ Ông Thủy Tổ / Bậc Tiền Nhân"`;
    }
  } else if (lca && lca.id === memberA.id) {
    const dist = memberB.generationLevel - memberA.generationLevel;
    if (dist === 2) {
      relationshipText = `${memberA.fullName} là ÔNG/BÀ NỘI trực hệ của ${memberB.fullName}`;
      addressingText = isFemale(memberA)
        ? `${memberA.fullName} xưng "Bà Nội", gọi ${memberB.fullName} là "Cháu"`
        : `${memberA.fullName} xưng "Ông Nội", gọi ${memberB.fullName} là "Cháu"`;
    } else if (dist === 3) {
      relationshipText = `${memberA.fullName} là CỤ ÔNG/CỤ BÀ trực hệ của ${memberB.fullName}`;
      addressingText = isFemale(memberA)
        ? `${memberA.fullName} xưng "Cụ Bà", gọi ${memberB.fullName} là "Chắt"`
        : `${memberA.fullName} xưng "Cụ Ông", gọi ${memberB.fullName} là "Chắt"`;
    } else {
      relationshipText = `${memberA.fullName} là BẬC TIỀN NHÂN TRỰC HỆ (trên ${dist} đời) của ${memberB.fullName}`;
      addressingText = isFemale(memberA)
        ? `${memberA.fullName} xưng "Cụ Bà / Tiền Nhân", gọi ${memberB.fullName} là "Hậu Duệ / Chắt"`
        : `${memberA.fullName} xưng "Cụ Ông / Tiền Nhân", gọi ${memberB.fullName} là "Hậu Duệ / Chắt"`;
    }
  } else if (memberA.parentId === memberB.parentId) {
    // Siblings
    const siblings = list.filter(m => m.parentId === memberA.parentId);
    const idxA = siblings.findIndex(m => m.id === memberA.id);
    const idxB = siblings.findIndex(m => m.id === memberB.id);
    if (idxA < idxB) {
      relationshipText = `${memberA.fullName} là ANH/CHỊ RUỘT của ${memberB.fullName} (cùng thuộc ${memberA.generation})`;
      addressingText = isFemale(memberA)
        ? `${memberA.fullName} xưng "Chị", gọi ${memberB.fullName} là "Em"`
        : `${memberA.fullName} xưng "Anh", gọi ${memberB.fullName} là "Em"`;
    } else {
      relationshipText = `${memberA.fullName} là EM RUỘT của ${memberB.fullName} (cùng thuộc ${memberA.generation})`;
      addressingText = isFemale(memberB)
        ? `${memberA.fullName} xưng "Em", kính gọi ${memberB.fullName} là "Chị"`
        : `${memberA.fullName} xưng "Em", kính gọi ${memberB.fullName} là "Anh"`;
    }
  } else if (genDiff === 0) {
    // Same generation cousins
    if (isSeniorBranchA) {
      relationshipText = `${memberA.fullName} và ${memberB.fullName} là ANH EM HỌ DÒNG TỘC (Cùng Đời ${memberA.generation}). ${memberA.fullName} thuộc Nhánh Cành Trưởng (Anh/Chị họ) so với ${memberB.fullName} thuộc Nhánh Cành Thứ (Em họ).`;
      addressingText = isFemale(memberA)
        ? `${memberA.fullName} xưng "Chị" (Nhánh Trưởng), gọi ${memberB.fullName} là "Em"`
        : `${memberA.fullName} xưng "Anh" (Nhánh Trưởng), gọi ${memberB.fullName} là "Em"`;
    } else if (isSeniorBranchB) {
      relationshipText = `${memberA.fullName} và ${memberB.fullName} là ANH EM HỌ DÒNG TỘC (Cùng Đời ${memberA.generation}). ${memberA.fullName} thuộc Nhánh Cành Thứ (Em họ) so với ${memberB.fullName} thuộc Nhánh Cành Trưởng (Anh/Chị họ).`;
      addressingText = isFemale(memberB)
        ? `${memberA.fullName} xưng "Em" (Nhánh Thứ), kính gọi ${memberB.fullName} là "Chị" (Nhánh Trưởng)`
        : `${memberA.fullName} xưng "Em" (Nhánh Thứ), kính gọi ${memberB.fullName} là "Anh" (Nhánh Trưởng)`;
    } else {
      relationshipText = `${memberA.fullName} và ${memberB.fullName} là ANH EM HỌ ĐỒNG TỘC (Cùng Đời ${memberA.generation}). Cùng chung tổ tiên là Cụ ${lca?.fullName || 'Nguyễn Văn Xuân'}.`;
      addressingText = `${memberA.fullName} xưng "Anh" (nếu lớn tuổi hơn) hoặc "Em", kính gọi ${memberB.fullName} là "Anh/Chị" hoặc "Em"`;
    }
  } else if (genDiff === -1) {
    // A is 1 gen lower than B -> B is 1 gen higher
    if (isSeniorBranchB || branchOrderB <= branchOrderA) {
      relationshipText = `${memberA.fullName} (${memberA.generation}) thuộc HÀNG CHÁU HỌ so với ${memberB.fullName} (${memberB.generation}, Nhánh Bác).`;
      addressingText = `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Bác" (Hàng Bác dòng tộc)`;
    } else {
      relationshipText = `${memberA.fullName} (${memberA.generation}) thuộc HÀNG CHÁU HỌ so với ${memberB.fullName} (${memberB.generation}, Nhánh Chú/Cô).`;
      addressingText = isFemale(memberB)
        ? `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Cô"`
        : `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Chú"`;
    }
  } else if (genDiff === 1) {
    // A is 1 gen higher than B
    if (isSeniorBranchA || branchOrderA <= branchOrderB) {
      relationshipText = `${memberA.fullName} (${memberA.generation}, Nhánh Bác) thuộc HÀNG BÁC HỌ so với ${memberB.fullName} (${memberB.generation}).`;
      addressingText = `${memberA.fullName} xưng "Bác", gọi ${memberB.fullName} là "Cháu"`;
    } else {
      relationshipText = `${memberA.fullName} (${memberA.generation}, Nhánh Chú/Cô) thuộc HÀNG CHÚ/CÔ HỌ so với ${memberB.fullName} (${memberB.generation}).`;
      addressingText = isFemale(memberA)
        ? `${memberA.fullName} xưng "Cô", gọi ${memberB.fullName} là "Cháu"`
        : `${memberA.fullName} xưng "Chú", gọi ${memberB.fullName} là "Cháu"`;
    }
  } else if (genDiff === -2) {
    relationshipText = `${memberA.fullName} (${memberA.generation}) thuộc HÀNG CHÁU HỌ so với ${memberB.fullName} (${memberB.generation}, Hàng Ông/Bà).`;
    addressingText = isFemale(memberB)
      ? `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Bà"`
      : `${memberA.fullName} xưng "Cháu", kính gọi ${memberB.fullName} là "Ông"`;
  } else if (genDiff === 2) {
    relationshipText = `${memberA.fullName} (${memberA.generation}, Hàng Ông/Bà) thuộc HÀNG ÔNG/BÀ HỌ so với ${memberB.fullName} (${memberB.generation}).`;
    addressingText = isFemale(memberA)
      ? `${memberA.fullName} xưng "Bà", gọi ${memberB.fullName} là "Cháu"`
      : `${memberA.fullName} xưng "Ông", gọi ${memberB.fullName} là "Cháu"`;
  } else if (genDiff === -3) {
    relationshipText = `${memberA.fullName} (${memberA.generation}) thuộc HÀNG CHẮT HỌ so với ${memberB.fullName} (${memberB.generation}, Hàng Cụ).`;
    addressingText = isFemale(memberB)
      ? `${memberA.fullName} xưng "Chắt", kính gọi ${memberB.fullName} là "Cụ Bà"`
      : `${memberA.fullName} xưng "Chắt", kính gọi ${memberB.fullName} là "Cụ Ông"`;
  } else if (genDiff === 3) {
    relationshipText = `${memberA.fullName} (${memberA.generation}, Hàng Cụ) thuộc HÀNG CỤ HỌ so với ${memberB.fullName} (${memberB.generation}).`;
    addressingText = isFemale(memberA)
      ? `${memberA.fullName} xưng "Cụ Bà", gọi ${memberB.fullName} là "Chắt"`
      : `${memberA.fullName} xưng "Cụ Ông", gọi ${memberB.fullName} là "Chắt"`;
  } else if (genDiff <= -4) {
    relationshipText = `${memberA.fullName} (${memberA.generation}) thuộc HÀNG HẬU DUỆ / CHẮT so với ${memberB.fullName} (${memberB.generation}, Bậc Tiền Nhân).`;
    addressingText = isFemale(memberB)
      ? `${memberA.fullName} xưng "Chắt/Hậu duệ", kính gọi ${memberB.fullName} là "Cụ Bà Thủy Tổ / Bậc Tiền Nhân"`
      : `${memberA.fullName} xưng "Chắt/Hậu duệ", kính gọi ${memberB.fullName} là "Cụ Ông Thủy Tổ / Bậc Tiền Nhân"`;
  } else {
    relationshipText = `${memberA.fullName} (${memberA.generation}, Bậc Tiền Nhân) thuộc HÀNG TIỀN NHÂN / THỦY TỔ so với ${memberB.fullName} (${memberB.generation}).`;
    addressingText = isFemale(memberA)
      ? `${memberA.fullName} xưng "Cụ Bà / Tiền Nhân", gọi ${memberB.fullName} là "Hậu Duệ / Chắt"`
      : `${memberA.fullName} xưng "Cụ Ông / Tiền Nhân", gọi ${memberB.fullName} là "Hậu Duệ / Chắt"`;
  }

  return {
    ancestorLCA: lca,
    genDiff,
    relationshipText,
    addressingText,
    lineageA: pathA,
    lineageB: pathB,
  };
}
