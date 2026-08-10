import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  GitBranch,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  X,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  MapPin,
  Heart,
  FileText,
  PieChart,
  Send,
  Sparkles,
  Bot,
  User,
  Filter,
  Check,
  Share2,
  HelpCircle,
  Award,
  BookOpen,
  Copy,
  ExternalLink
} from 'lucide-react';
import { GenealogyMember, ChatMessage } from './types';
import { calculateRelationship } from './utils/genealogyUtils';

const cleanText = (str: string) =>
  str
    ? str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
    : "";

// DỮ LIỆU MẪU CHUẨN 61 THÀNH VIÊN HỌ NGUYỄN VĂN (ĐỜI 11 - ĐỜI 16)
const DEFAULT_61_MEMBERS: GenealogyMember[] = [
  {
    id: "1",
    code: "1",
    generation: "Đời 11",
    generationLevel: 11,
    fullName: "Nguyễn Văn Xuân",
    otherName: "Cử nhân Võ / Suất Đội",
    relationship: "Con ông Nguyễn Văn Hài",
    parentId: null,
    spouse: "Chánh phối: Trương Thị Mảnh (mộ Cồn Cát, kỵ 05-3 ÂL)",
    birthDeathInfo: "Kỵ 05-5 ÂL; Mộ Nương Đò (mất khi dẹp giặc Cao Bằng)",
    notes: "Sinh 3 trai, 2 gái: Nồi, Bàng, Bát, Tạc, Thanh"
  },
  {
    id: "1_1",
    code: "1_1",
    generation: "Đời 12",
    generationLevel: 12,
    fullName: "Nguyễn Văn Bát",
    otherName: "Hiển Tằng Tổ",
    relationship: "Con ông Nguyễn Văn Xuân",
    parentId: "1",
    spouse: "Chánh phối: Đặng Thị Liên (1881 - 1970, thọ 90 tuổi)",
    birthDeathInfo: "1874 - 1925 (thọ 51 tuổi). Kỵ 02-9 ÂL; Mộ Cồn Cát",
    notes: "Sinh 3 trai, 4 gái: Ngọc, Ngà, Thăng, Thí, Hương, Vô danh, Vàng"
  },
  {
    id: "1_1_1",
    code: "1_1_1",
    generation: "Đời 13",
    generationLevel: 13,
    fullName: "Nguyễn Văn Ngọc",
    otherName: "Pháp danh: Tâm Quý",
    relationship: "Con ông Nguyễn Văn Bát",
    parentId: "1_1",
    spouse: "Chánh phối: Lê Đình Thị Nghĩa (1914 - 1951)",
    birthDeathInfo: "1909 - 1994 (thọ 85 tuổi). Kỵ 28-11 ÂL; Mộ Cồn Cát",
    notes: "Sinh 3 trai, 3 gái: Khởi, Chấn, Khương, Gái, Năm, Lới"
  },
  {
    id: "1_1_2",
    code: "1_1_2",
    generation: "Đời 13",
    generationLevel: 13,
    fullName: "Nguyễn Văn Ngà",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Bát",
    parentId: "1_1",
    spouse: "Chánh phối: Lê Đính Thị Thiếp (1918 - 1995)",
    birthDeathInfo: "1911 - 1949 (thọ 39 tuổi). Kỵ 16-10 ÂL; Mộ Cồn Cát",
    notes: "Sinh 3 trai, 2 gái: Yến, Ẩm, Trừ, Tư, Thể"
  },
  {
    id: "1_1_1_1",
    code: "1_1_1_1",
    generation: "Đời 14",
    generationLevel: 14,
    fullName: "Nguyễn Văn Khởi",
    otherName: "Pháp danh: Tâm Để",
    relationship: "Con ông Nguyễn Văn Ngọc",
    parentId: "1_1_1",
    spouse: "Chánh phối: Trương Thị Tửu (1929 - 2019); Thứ phối: Trương Thị Tưởng (s. 1943)",
    birthDeathInfo: "Sinh năm 1935 (Ất Hợi)",
    notes: "Sinh 7 trai, 2 gái: Khoan, Sở, Tường, Giáo, Khoa, Khai, Thái, Kim Thanh, Tùng"
  },
  {
    id: "1_1_1_2",
    code: "1_1_1_2",
    generation: "Đời 14",
    generationLevel: 14,
    fullName: "Nguyễn Văn Chấn",
    otherName: "Pháp danh: Tâm Hưng",
    relationship: "Con ông Nguyễn Văn Ngọc",
    parentId: "1_1_1",
    spouse: "Chánh phối: Trương Thị Dục (1936 - 1997)",
    birthDeathInfo: "Sinh năm 1937 (Đinh Sửu)",
    notes: "Mộ tại nghĩa trang Đường Đỏ Cù Bị, Đồng Nai. Sinh 5 trai, 1 gái: Triển, Diễn, Diện, Tiến, Điểu, Hồng Ân"
  },
  {
    id: "1_1_1_3",
    code: "1_1_1_3",
    generation: "Đời 14",
    generationLevel: 14,
    fullName: "Nguyễn Văn Khương",
    otherName: "Pháp danh: Tâm Thái",
    relationship: "Con ông Nguyễn Văn Ngọc",
    parentId: "1_1_1",
    spouse: "Chánh phối: Nguyễn Thị Hường (s. 1935)",
    birthDeathInfo: "1940 - 1999 (mất tại Hoa Kỳ). Kỵ 16-2 ÂL; Mộ Cồn Cát",
    notes: "Sinh 7 trai, 2 gái: Hưng, Lệ Thủy, Sơn, Đông, Hải, Hoàng, Nguyên, Lệ Thu, Tuân"
  },
  {
    id: "1_1_2_1",
    code: "1_1_2_1",
    generation: "Đời 14",
    generationLevel: 14,
    fullName: "Nguyễn Văn Yến",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Ngà",
    parentId: "1_1_2",
    spouse: "Chánh phối: Trương Thị Thiên (s. 1938)",
    birthDeathInfo: "Sinh năm 1939 (Kỷ Mão)",
    notes: "Sinh 6 trai, 4 gái: Châu, Đức, Hà, Long, Quốc, Kỳ, Mỵ, Huế, Ngọc, Trưng, Nhi"
  },
  {
    id: "1_1_2_2",
    code: "1_1_2_2",
    generation: "Đời 14",
    generationLevel: 14,
    fullName: "Nguyễn Văn Ẩm",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Ngà",
    parentId: "1_1_2",
    spouse: "Chánh phối: Nguyễn Thị Hỏa (1940 - 2000)",
    birthDeathInfo: "1940 - 2005. Mộ Cồn Cát",
    notes: "Sinh 5 trai, 4 gái: Phúc, Hậu, Liễu, Đãi, Ánh Nguyệt, Hồng Vân, Vũ, Kim Nga, Đính"
  },
  {
    id: "1_1_1_1_1",
    code: "1_1_1_1_1",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Sở",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Khởi",
    parentId: "1_1_1_1",
    spouse: "Chánh phối: Nguyễn Thị Ánh (s. 1957)",
    birthDeathInfo: "Sinh 07-9 Giáp Ngọ (1954)",
    notes: "Trú tại Bà Rịa - Vũng Tàu. Sinh: Kim Oanh, Nhật, Tân, Kim Anh"
  },
  {
    id: "1_1_1_1_2",
    code: "1_1_1_1_2",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Tường",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Khởi",
    parentId: "1_1_1_1",
    spouse: "Chánh phối: Nguyễn Thị Chương (s. 1960)",
    birthDeathInfo: "Sinh 20-7 Đinh Dậu (1957)",
    notes: "Trú tại Cù Bị 3, Đồng Nai. Sinh: Tính, Bích Trâm, Hữu Hà"
  },
  {
    id: "1_1_1_1_3",
    code: "1_1_1_1_3",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Giáo",
    otherName: "Pháp danh: Tâm Dưỡng",
    relationship: "Con ông Nguyễn Văn Khởi",
    parentId: "1_1_1_1",
    spouse: "Chánh phối: Dương Thị Oanh (s. 1964)",
    birthDeathInfo: "1960 - 1999. Mộ tại TP. Ban Mê Thuột",
    notes: "Sinh 2 gái: Dương Hạnh, Thúy Nga"
  },
  {
    id: "1_1_1_1_4",
    code: "1_1_1_1_4",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Khoa",
    otherName: "Pháp danh: Nhuận Thanh",
    relationship: "Con ông Nguyễn Văn Khởi",
    parentId: "1_1_1_1",
    spouse: "Chánh phối: Hồ Thị Xuân Lộc (s. 1963)",
    birthDeathInfo: "Sinh 05-10 Quý Mão (1963)",
    notes: "Trú tại Đạt Lý - Ban Mê Thuột. Sinh: Trí Quãng, Trí Tài"
  },
  {
    id: "1_1_1_1_5",
    code: "1_1_1_1_5",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Khai",
    otherName: "Pháp danh: Không Phương",
    relationship: "Con ông Nguyễn Văn Khởi",
    parentId: "1_1_1_1",
    spouse: "Chánh phối: Trương Thị Hương (s. 1974)",
    birthDeathInfo: "Sinh 11-8 Mậu Thân (1968)",
    notes: "Sinh: Minh Trí, Phương Trang"
  },
  {
    id: "1_1_1_2_1",
    code: "1_1_1_2_1",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Triển",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Chấn",
    parentId: "1_1_1_2",
    spouse: "Chánh phối: Trần Thị Minh Lợi (s. 1959)",
    birthDeathInfo: "Sinh 11-4 Canh Tý (1960)",
    notes: "Trú tại TPHCM. Sinh: Minh Nguyệt, Nguyệt Anh"
  },
  {
    id: "1_1_1_2_2",
    code: "1_1_1_2_2",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Diễn",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Chấn",
    parentId: "1_1_1_2",
    spouse: "Chánh phối: Đặng Thị Lan (s. 1963)",
    birthDeathInfo: "Sinh 17-8 Nhâm Dần (1962)",
    notes: "Trú tại Long Khánh, Đồng Nai. Sinh: Hiếu Thảo"
  },
  {
    id: "1_1_1_2_3",
    code: "1_1_1_2_3",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Diện",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Chấn",
    parentId: "1_1_1_2",
    spouse: "Chánh phối: Trần Thị Thư (1963 - 2017)",
    birthDeathInfo: "Sinh 17-1 Bính Ngọ (1966)",
    notes: "Sinh 2 trai: Khải, Hoàn"
  },
  {
    id: "1_1_1_2_4",
    code: "1_1_1_2_4",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Điểu",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Chấn",
    parentId: "1_1_1_2",
    spouse: "Chánh phối: Nguyễn Thị Thanh Hương (s. 1977)",
    birthDeathInfo: "Sinh 16-1 Kỷ Dậu (1969)",
    notes: "Trú tại Bà Rịa - Vũng Tàu. Sinh: Thùy Dương"
  },
  {
    id: "1_1_1_3_1",
    code: "1_1_1_3_1",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Hưng",
    otherName: "Pháp danh: Nguyên Thịnh",
    relationship: "Con ông Nguyễn Văn Khương",
    parentId: "1_1_1_3",
    spouse: "Chánh phối: Lê Thị Hồng Ánh (s. 1969)",
    birthDeathInfo: "Sinh 21-3 Nhâm Dần (1962)",
    notes: "Sinh: Cẩm Tú, Văn Anh, Diệu Như"
  },
  {
    id: "1_1_1_3_2",
    code: "1_1_1_3_2",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Sơn",
    otherName: "Pháp danh: Nguyên Đức",
    relationship: "Con ông Nguyễn Văn Khương",
    parentId: "1_1_1_3",
    spouse: "Chánh phối: Trần Võ Thị Thu Vân (s. 1974)",
    birthDeathInfo: "Sinh 26-9 Ất Tỵ (1965)",
    notes: "Trú tại Huế. Sinh: Thành Pháp, Quỳnh Hương"
  },
  {
    id: "1_1_1_3_3",
    code: "1_1_1_3_3",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Đông",
    otherName: "Pháp danh: Nguyên Phương",
    relationship: "Con ông Nguyễn Văn Khương",
    parentId: "1_1_1_3",
    spouse: "Chánh phối: Nguyễn Thị Lãnh (s. 1968)",
    birthDeathInfo: "Sinh 01-4 Đinh Mùi (1967)",
    notes: "Trú tại Lao Bảo. Sinh: Nam, Hiếu"
  },
  {
    id: "1_1_1_3_4",
    code: "1_1_1_3_4",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Hải",
    otherName: "Pháp danh: Nguyên Đức",
    relationship: "Con ông Nguyễn Văn Khương",
    parentId: "1_1_1_3",
    spouse: "Chánh phối: Trương Thị Hồ (s. 1970)",
    birthDeathInfo: "Sinh 14-12 Mậu Thân (1969)",
    notes: "Định cư Hoa Kỳ (1994). Sinh: Thanh, Việt Mỹ"
  },
  {
    id: "1_1_1_3_5",
    code: "1_1_1_3_5",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Nguyên",
    otherName: "HighLands / PD Nguyên Giải",
    relationship: "Con ông Nguyễn Văn Khương",
    parentId: "1_1_1_3",
    spouse: "Chánh phối: Lê Thị Mỹ Hằng (s. 1984)",
    birthDeathInfo: "Sinh 26-4 Nhâm Tý (1972)",
    notes: "Định cư Vermont, Hoa Kỳ. Sinh: Nhật Tấn"
  },
  {
    id: "1_1_1_3_6",
    code: "1_1_1_3_6",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Tuân",
    otherName: "Pháp danh: Nguyên Thủ",
    relationship: "Con ông Nguyễn Văn Khương",
    parentId: "1_1_1_3",
    spouse: "Chánh phối: Kristin Truong; Thứ phối: Nguyễn Thị Mai Phương",
    birthDeathInfo: "Sinh 03-7 Tân Dậu (1981)",
    notes: "Định cư Vermont, Hoa Kỳ. Sinh: Minh Quang"
  },
  {
    id: "1_1_2_1_1",
    code: "1_1_2_1_1",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Đức",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Yến",
    parentId: "1_1_2_1",
    spouse: "Chánh phối: Vương Thị Huê (s. 1971)",
    birthDeathInfo: "Sinh 10-9 Quý Mão (1963)",
    notes: "Định cư Mỹ. Sinh: Bút, Mai"
  },
  {
    id: "1_1_2_1_2",
    code: "1_1_2_1_2",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Long",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Yến",
    parentId: "1_1_2_1",
    spouse: "Chánh phối: Lê Thị Gái (s. 1970)",
    birthDeathInfo: "Sinh 19-11 Đinh Mùi (1967)",
    notes: "Sinh 4 trai: Lai, Liệu, Lợi, Lộc"
  },
  {
    id: "1_1_2_1_3",
    code: "1_1_2_1_3",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Quốc",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Yến",
    parentId: "1_1_2_1",
    spouse: "Chánh phối: Lê Thị Hóa (s. 1973)",
    birthDeathInfo: "Sinh năm 1969 (Kỷ Dậu)",
    notes: "Sinh: Ái Hồng, Nhật Anh, Kim Nho"
  },
  {
    id: "1_1_2_1_4",
    code: "1_1_2_1_4",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Kỳ",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Yến",
    parentId: "1_1_2_1",
    spouse: "Chánh phối: Hồ Thị Hiền (s. 1980)",
    birthDeathInfo: "Sinh 11-9 Tân Hợi (1971)",
    notes: "Sinh: Kiệt, Nhật, Ý"
  },
  {
    id: "1_1_2_1_5",
    code: "1_1_2_1_5",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Trưng",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Yến",
    parentId: "1_1_2_1",
    spouse: "Chánh phối: Annie; Thứ phối: Ngô Thị Linh Trâm",
    birthDeathInfo: "Sinh 24-10 Tân Dậu (1981)",
    notes: "Sinh: Song Phương, Song Dung, Bảo Như"
  },
  {
    id: "1_1_2_2_1",
    code: "1_1_2_2_1",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Phúc",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Ẩm",
    parentId: "1_1_2_2",
    spouse: "Chánh phối: Hoàng Thị Kim Khuê",
    birthDeathInfo: "Sinh 08-11 Nhâm Dần (1962)",
    notes: "Trú tại Cù Bị, Đồng Nai. Sinh: Quyết Chăm, Kim Anh, Hoàng Hiệp, Hoàng Huy"
  },
  {
    id: "1_1_2_2_2",
    code: "1_1_2_2_2",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Đãi",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Ẩm",
    parentId: "1_1_2_2",
    spouse: "Chánh phối: Lê Thị Tho",
    birthDeathInfo: "Sinh 19-10 Đinh Mùi (1967)",
    notes: "Sinh: Đức Dũng, Thị Sương"
  },
  {
    "id": "1_1_2_2_3",
    "code": "1_1_2_2_3",
    "generation": "Đời 15",
    "generationLevel": 15,
    "fullName": "Nguyễn Văn Vũ",
    "otherName": "",
    "relationship": "Con ông Nguyễn Văn Ẩm",
    "parentId": "1_1_2_2",
    "spouse": "Chánh phối: Phan Thị Thương (s. 1981)",
    "birthDeathInfo": "Sinh năm 1978 (Mậu Ngọ)",
    "notes": "Sinh 2 trai: Văn Việt, Văn Minh"
  },
  {
    id: "1_1_2_2_4",
    code: "1_1_2_2_4",
    generation: "Đời 15",
    generationLevel: 15,
    fullName: "Nguyễn Văn Đính",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Ẩm",
    parentId: "1_1_2_2",
    spouse: "Chánh phối: Nguyễn Thị Thanh Bình (s. 1988)",
    birthDeathInfo: "Sinh năm 1984 (Giáp Tý)",
    notes: "Trú tại Lao Bảo. Sinh 2 trai: Tuấn, Duy"
  },
  {
    id: "1_1_1_1_1_1",
    code: "1_1_1_1_1_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Nhật",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Sở",
    parentId: "1_1_1_1_1",
    spouse: "Chánh phối: Trần Vân Khánh (s. 1981)",
    birthDeathInfo: "Sinh 09-9 Tân Dậu (1981)",
    notes: "Kết hôn 2009. Sinh: Khánh Thư, Nguyễn Hoàng"
  },
  {
    id: "1_1_1_1_1_2",
    code: "1_1_1_1_1_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Tân",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Sở",
    parentId: "1_1_1_1_1",
    spouse: "Chánh phối: Nguyễn Khánh Chi (s. 1983)",
    birthDeathInfo: "Sinh 03-9 Quý Hợi (1983)",
    notes: "Kết hôn 2010. Sinh: Bảo Châu, Tuấn Hùng"
  },
  {
    id: "1_1_1_1_2_1",
    code: "1_1_1_1_2_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Tính",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Tường",
    parentId: "1_1_1_1_2",
    spouse: "Chánh phối: Phan Thị Ly (s. 1985)",
    birthDeathInfo: "Sinh 30-12 Tân Dậu (1982)",
    notes: "Kết hôn 2008. Sinh: Minh Tuấn, Minh Anh"
  },
  {
    id: "1_1_1_1_2_2",
    code: "1_1_1_1_2_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Hữu Hà",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Tường",
    parentId: "1_1_1_1_2",
    spouse: "Chánh phối: Bùi Phan Hoài Linh (s. 1998)",
    birthDeathInfo: "Sinh 19-2 Tân Mùi (1991)",
    notes: "Kết hôn 2016. Sinh: Hoài Lâm"
  },
  {
    id: "1_1_1_1_4_1",
    code: "1_1_1_1_4_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Trí Quãng",
    otherName: "Pháp danh: Nhuận Tâm",
    relationship: "Con ông Nguyễn Văn Khoa",
    parentId: "1_1_1_1_4",
    spouse: "Chánh phối: Nguyễn Trương Ngọc Khánh (s. 1993)",
    birthDeathInfo: "Sinh 27-9 Tân Mùi (1991)",
    notes: "Kết hôn 2018. Sinh: Trúc Linh"
  },
  {
    id: "1_1_1_1_4_2",
    code: "1_1_1_1_4_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Trí Tài",
    otherName: "Pháp danh: Nhuận Toàn",
    relationship: "Con ông Nguyễn Văn Khoa",
    parentId: "1_1_1_1_4",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 21-3 Ất Hợi (1995)",
    notes: ""
  },
  {
    id: "1_1_1_1_5_1",
    code: "1_1_1_1_5_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Minh Trí",
    otherName: "Pháp danh: Không Quảng",
    relationship: "Con ông Nguyễn Văn Khai",
    parentId: "1_1_1_1_5",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 29-3 Tân Tỵ (2001)",
    notes: ""
  },
  {
    id: "1_1_1_2_3_1",
    code: "1_1_1_2_3_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Trần Khải",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Diện",
    parentId: "1_1_1_2_3",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 21-7 Kỷ Tỵ (1989)",
    notes: ""
  },
  {
    id: "1_1_1_2_3_2",
    code: "1_1_1_2_3_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Trần Hoàn",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Diện",
    parentId: "1_1_1_2_3",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 26-7 Quý Dậu (1993)",
    notes: ""
  },
  {
    id: "1_1_1_3_1_1",
    code: "1_1_1_3_1_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Anh",
    otherName: "Pháp danh: Nguyên Tuấn",
    relationship: "Con ông Nguyễn Văn Hưng",
    parentId: "1_1_1_3_1",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 15-6 Tân Mùi (1991)",
    notes: ""
  },
  {
    id: "1_1_1_3_2_1",
    code: "1_1_1_3_2_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Thành Pháp",
    otherName: "Pháp danh: Nguyên Thành",
    relationship: "Con ông Nguyễn Văn Sơn",
    parentId: "1_1_1_3_2",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 11-12 Bính Tý (1997)",
    notes: ""
  },
  {
    id: "1_1_1_3_3_1",
    code: "1_1_1_3_3_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Nam",
    otherName: "Pháp danh: Nguyên Phương",
    relationship: "Con ông Nguyễn Văn Đông",
    parentId: "1_1_1_3_3",
    spouse: "Chánh phối: Trương Thị Miên (s. 1997)",
    birthDeathInfo: "Sinh 07-4 Canh Ngọ (1990)",
    notes: "Kết hôn 2015. Sinh: Bích Gia Linh, Bích Minh Châu"
  },
  {
    id: "1_1_1_3_4_1",
    code: "1_1_1_3_4_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Việt Mỹ",
    otherName: "Pháp danh: Nguyên Nhân",
    relationship: "Con ông Nguyễn Văn Hải",
    parentId: "1_1_1_3_4",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 23-7 Giáp Tuất (1994)",
    notes: "Định cư Hoa Kỳ"
  },
  {
    id: "1_1_1_3_5_1",
    code: "1_1_1_3_5_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Nhật Tấn",
    otherName: "Pháp danh: Nguyên Thiện",
    relationship: "Con ông Nguyễn Văn Nguyên",
    parentId: "1_1_1_3_5",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 11-01 Tân Mão (2011)",
    notes: "Định cư Hoa Kỳ"
  },
  {
    id: "1_1_1_3_6_1",
    code: "1_1_1_3_6_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Minh Quang",
    otherName: "Pháp danh: Nguyên Trí",
    relationship: "Con ông Nguyễn Văn Tuân",
    parentId: "1_1_1_3_6",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 15-8 Đinh Hợi (2007)",
    notes: "Định cư Hoa Kỳ"
  },
  {
    id: "1_1_2_1_1_1",
    code: "1_1_2_1_1_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Bút",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Đức",
    parentId: "1_1_2_1_1",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 06-4 Giáp Tuất (1994)",
    notes: "Định cư Hoa Kỳ"
  },
  {
    id: "1_1_2_1_2_1",
    code: "1_1_2_1_2_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Lai",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Long",
    parentId: "1_1_2_1_2",
    spouse: "Chánh phối: Dương Phi Hải Yến (s. 1992)",
    birthDeathInfo: "Sinh 16-5 Nhâm Thân (1992)",
    notes: "Kết hôn 2016. Sinh: Khải Uy"
  },
  {
    id: "1_1_2_1_2_2",
    code: "1_1_2_1_2_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Liệu",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Long",
    parentId: "1_1_2_1_2",
    spouse: "Chánh phối: Đặng Thị Kiều Vân (s. 1995)",
    birthDeathInfo: "Sinh 06-5 Giáp Tuất (1994)",
    notes: "Kết hôn 2014. Sinh: Khôi Nguyên"
  },
  {
    id: "1_1_2_1_2_3",
    code: "1_1_2_1_2_3",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Lợi",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Long",
    parentId: "1_1_2_1_2",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 29-8 Đinh Sửu (1997)",
    notes: ""
  },
  {
    id: "1_1_2_1_2_4",
    code: "1_1_2_1_2_4",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Lộc",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Long",
    parentId: "1_1_2_1_2",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 03-7 Bính Tuất (2006)",
    notes: ""
  },
  {
    id: "1_1_2_1_3_1",
    code: "1_1_2_1_3_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Nhật Anh",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Quốc",
    parentId: "1_1_2_1_3",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 24-2 Bính Tý (1996)",
    notes: ""
  },
  {
    id: "1_1_2_1_4_1",
    code: "1_1_2_1_4_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Nhật",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Kỳ",
    parentId: "1_1_2_1_4",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 29-8 Mậu Dần (1998)",
    notes: ""
  },
  {
    id: "1_1_2_1_4_2",
    code: "1_1_2_1_4_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Ý",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Kỳ",
    parentId: "1_1_2_1_4",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 06-6 Canh Thìn (2000)",
    notes: ""
  },
  {
    id: "1_1_2_2_1_1",
    code: "1_1_2_2_1_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Hoàng Hiệp",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Phúc",
    parentId: "1_1_2_2_1",
    spouse: "Chánh phối: Nguyễn Thị Thanh Trà (s. 1994)",
    birthDeathInfo: "Sinh 06-01 Canh Ngọ (1990)",
    notes: "Kết hôn 2017. Sinh: Hoàng Hải Đăng"
  },
  {
    id: "1_1_2_2_1_2",
    code: "1_1_2_2_1_2",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Hoàng Huy",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Phúc",
    parentId: "1_1_2_2_1",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 28-01 Kỷ Mão (1999)",
    notes: ""
  },
  {
    id: "1_1_2_2_2_1",
    code: "1_1_2_2_2_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Đức Dũng",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Đãi",
    parentId: "1_1_2_2_2",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 29-8 nhuận Ất Hợi (1995)",
    notes: ""
  },
  {
    id: "1_1_2_2_3_1",
    code: "1_1_2_2_3_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Việt",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Vũ",
    parentId: "1_1_2_2_3",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 22-6 Ất Dậu (2005)",
    notes: ""
  },
  {
    id: "1_1_2_2_4_1",
    code: "1_1_2_2_4_1",
    generation: "Đời 16",
    generationLevel: 16,
    fullName: "Nguyễn Văn Tuấn",
    otherName: "",
    relationship: "Con ông Nguyễn Văn Đính",
    parentId: "1_1_2_2_4",
    spouse: "Chưa thông tin",
    birthDeathInfo: "Sinh 20-11 Kỷ Sửu (2010)",
    notes: ""
  }
];

const LOCAL_STORAGE_KEY = 'nguyen_van_genealogy_members_v10';

export default function App() {
  const [members, setMembers] = useState<GenealogyMember[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load members from localStorage", e);
    }
    return DEFAULT_61_MEMBERS;
  });

  const [activeTab, setActiveTab] = useState<
    'tree' | 'directory' | 'relationship' | 'stats' | 'manage'
  >('tree');

  const [selectedMember, setSelectedMember] = useState<GenealogyMember | null>(null);
  const [editingMember, setEditingMember] = useState<GenealogyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const getShareUrl = () => {
    try {
      if (typeof window !== 'undefined' && window.location.href && window.location.href !== 'about:blank') {
        return window.location.href;
      }
    } catch (e) {
      console.error(e);
    }
    return 'https://ais-pre-nbd3z23zqxykl5yhvj3w5d-148478833039.asia-southeast1.run.app';
  };

  const handleCopyShareLink = async () => {
    const url = getShareUrl();
    let success = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        success = true;
      } catch (err) {
        console.warn('Clipboard writeText failed:', err);
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (e) {
        console.error('Fallback execCommand failed:', e);
      }
    }

    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } else {
      window.prompt('Vui lòng sao chép liên kết bên dưới:', url);
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gia Phả Họ Nguyễn Văn',
          text: 'Gia Phả Họ Nguyễn Văn (Vĩnh Lại - Triệu Phong - Quảng Trị)',
          url: url,
        });
      } catch (e) {
        console.log('User cancelled or share error', e);
      }
    } else {
      handleCopyShareLink();
    }
  };

  // Relationship matrix states
  const [personAId, setPersonAId] = useState<string>('');
  const [personBId, setPersonBId] = useState<string>('');

  // Save to localStorage when members change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [members]);

  // Offline AI Assistant Messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Cháu là Trợ Lý Gia Phả Họ Nguyễn Văn rất vui khi được hầu chuyện . Quý vị có thể đặt câu hỏi bằng văn bản bên dưới để tra cứu chi tiết thông tin thành viên dòng họ, năm sinh, độ tuổi thọ, mối quan hệ trực hệ và quê quán ạ.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --------------------------------------------------------------------------
  // OFFLINE QUERY PARSER ENGINE
  // --------------------------------------------------------------------------
  const processOfflineQuery = (userPrompt: string): string => {
    const rawQuery = userPrompt.trim();
    if (!rawQuery) return "Dạ thưa, quý vị vui lòng nhập tên hoặc câu hỏi cần tra cứu ạ.";

    const queryNorm = cleanText(rawQuery);

    // 1. Check total members query
    if (
      queryNorm.includes('bao nhieu thanh vien') ||
      queryNorm.includes('tong so') ||
      queryNorm.includes('may nguoi') ||
      queryNorm.includes('bao nhieu nguoi')
    ) {
      return `Dạ thưa quý vị, trong gia phả Tộc Nguyễn Văn (từ Đời 11 đến Đời 16) hiện có **${members.length} thành viên** được ghi nhận chính thức. Quý vị có thể tra cứu chi tiết từng thế hệ hoặc gõ tên riêng/họ tên thành viên (như "Bát", "Khởi", "Chấn", "Xuân", "Sở", "Yến",...) để tìm hiểu sâu hơn ạ.`;
    }

    // 2. Generation list query (e.g. Đời 11, Đời 15)
    const genMatch = queryNorm.match(/doi\s*(\d+)/i) || rawQuery.toLowerCase().match(/đời\s*(\d+)/i);
    if (genMatch) {
      const genNum = parseInt(genMatch[1], 10);
      if (genNum >= 11 && genNum <= 16) {
        const genMembers = members.filter(m => m.generationLevel === genNum);
        if (genMembers.length > 0) {
          const namesList = genMembers.map(m => `• **${m.fullName}** (${m.code}) - ${m.relationship}`).join('\n');
          return `Dạ thưa quý vị, **Đời ${genNum}** của họ Nguyễn Văn hiện ghi nhận **${genMembers.length} thành viên**:\n\n${namesList}`;
        }
      }
    }

    // 3. Location / Overseas / Diaspora queries
    if (
      queryNorm.includes('hoa ky') ||
      queryNorm.includes('my') ||
      queryNorm.includes('overseas') ||
      queryNorm.includes('dinh cu')
    ) {
      const overseas = members.filter(
        m =>
          (m.notes && (cleanText(m.notes).includes('hoa ky') || cleanText(m.notes).includes('my'))) ||
          (m.birthDeathInfo && cleanText(m.birthDeathInfo).includes('hoa ky'))
      );
      if (overseas.length > 0) {
        const listStr = overseas.map(m => `• **${m.fullName}** (${m.generation}, Mã ${m.code}): ${m.notes || m.birthDeathInfo}`).join('\n');
        return `Dạ thưa quý vị, các thành viên họ Nguyễn Văn định cư hoặc từng sinh sống tại Hoa Kỳ (Mỹ) bao gồm **${overseas.length} vị**:\n\n${listStr}`;
      }
    }

    // -------------------------------------------------------------------------
    // KINSHIP & RELATIONSHIP QUERIES (Con ông X, Vợ ông X, Cha ông X, Anh em ông X)
    // -------------------------------------------------------------------------

    // A. CHILDREN QUERY ("con ông X", "con cụ X", "con của X", "danh sách con X", "các con X")
    const isChildrenQuery =
      queryNorm.includes('con ong') ||
      queryNorm.includes('con cu') ||
      queryNorm.includes('con cua') ||
      queryNorm.includes('danh sach con') ||
      queryNorm.includes('cac con') ||
      queryNorm.includes('may con') ||
      queryNorm.startsWith('con ');

    if (isChildrenQuery) {
      const targetName = queryNorm
        .replace(/danh sach con/g, '')
        .replace(/cac con/g, '')
        .replace(/may con/g, '')
        .replace(/co may con/g, '')
        .replace(/bao nhieu con/g, '')
        .replace(/con cua/g, '')
        .replace(/con ong/g, '')
        .replace(/con cu/g, '')
        .replace(/con bac/g, '')
        .replace(/con chu/g, '')
        .replace(/con ba/g, '')
        .replace(/con/g, '')
        .replace(/la ai/g, '')
        .replace(/nhung ai/g, '')
        .replace(/gom nhung ai/g, '')
        .replace(/may nguoi/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();

      if (targetName) {
        const parentMember = members.find(m => {
          const fn = cleanText(m.fullName);
          const on = cleanText(m.otherName || '');
          const words = fn.split(/\s+/);
          const given = words[words.length - 1];
          return given === targetName || fn === targetName || fn.includes(targetName) || on.includes(targetName);
        });

        if (parentMember) {
          const directChildren = members.filter(m => m.parentId === parentMember.id);
          const honorific = parentMember.generationLevel <= 12 ? 'Cụ' : 'Ông/Bà';

          let resp = `Dạ thưa quý vị, thông tin về **con cái của ${honorific} ${parentMember.fullName}** (${parentMember.generation}, Mã ${parentMember.code}):\n\n`;

          if (parentMember.notes) {
            resp += `💡 **Ghi chú phả hệ:** ${parentMember.notes}\n\n`;
          }

          if (directChildren.length > 0) {
            resp += `📌 **Danh sách ${directChildren.length} con có hồ sơ trong gia phả:**\n`;
            directChildren.forEach((c, idx) => {
              resp += `${idx + 1}. **${c.fullName}** (${c.generation}, Mã ${c.code}) - ${c.relationship}`;
              if (c.spouse) resp += ` | *Phối ngẫu:* ${c.spouse}`;
              resp += `\n`;
            });
          } else {
            resp += `Trực hệ của ${honorific} chưa có hồ sơ con cái riêng biệt ngoài thông tin ghi chú trên ạ.`;
          }
          return resp;
        }
      }
    }

    // B. SPOUSE QUERY ("vợ ông X", "vợ cụ X", "vợ của X", "chồng bà Y", "phối ngẫu X")
    const isSpouseQuery =
      queryNorm.includes('vo ong') ||
      queryNorm.includes('vo cu') ||
      queryNorm.includes('vo cua') ||
      queryNorm.includes('chong cua') ||
      queryNorm.includes('phoi ngau') ||
      queryNorm.startsWith('vo ');

    if (isSpouseQuery) {
      const targetName = queryNorm
        .replace(/vo cua/g, '')
        .replace(/vo ong/g, '')
        .replace(/vo cu/g, '')
        .replace(/vo/g, '')
        .replace(/chong cua/g, '')
        .replace(/chong/g, '')
        .replace(/phoi ngau cua/g, '')
        .replace(/phoi ngau/g, '')
        .replace(/la ai/g, '')
        .replace(/ten gi/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();

      if (targetName) {
        const targetMember = members.find(m => {
          const fn = cleanText(m.fullName);
          const on = cleanText(m.otherName || '');
          const words = fn.split(/\s+/);
          const given = words[words.length - 1];
          return given === targetName || fn === targetName || fn.includes(targetName) || on.includes(targetName);
        });

        if (targetMember) {
          const honorific = targetMember.generationLevel <= 12 ? 'Cụ' : 'Ông/Bà';
          let resp = `Dạ thưa quý vị, thông tin phối ngẫu (vợ/chồng) của **${honorific} ${targetMember.fullName}** (${targetMember.generation}, Mã ${targetMember.code}):\n\n`;
          if (targetMember.spouse) {
            resp += `🌹 **Phối ngẫu:** ${targetMember.spouse}\n`;
          } else {
            resp += `Chưa có thông tin ghi nhận phối ngẫu trong phả hệ.\n`;
          }
          resp += `• **Trực hệ:** ${targetMember.relationship}\n`;
          if (targetMember.birthDeathInfo) resp += `• **Sinh mất / Mộ chí:** ${targetMember.birthDeathInfo}\n`;
          return resp;
        }
      }
    }

    // C. FATHER / PARENT QUERY ("cha của X", "bố X", "thân sinh X", "mẹ X")
    const isParentQuery =
      queryNorm.includes('cha cua') ||
      queryNorm.includes('cha ong') ||
      queryNorm.includes('bo cua') ||
      queryNorm.includes('me cua') ||
      queryNorm.includes('than sinh');

    if (isParentQuery) {
      const targetName = queryNorm
        .replace(/cha cua/g, '')
        .replace(/cha ong/g, '')
        .replace(/cha cu/g, '')
        .replace(/cha/g, '')
        .replace(/bo cua/g, '')
        .replace(/bo/g, '')
        .replace(/me cua/g, '')
        .replace(/me/g, '')
        .replace(/than sinh/g, '')
        .replace(/la ai/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();

      if (targetName) {
        const childMember = members.find(m => {
          const fn = cleanText(m.fullName);
          const words = fn.split(/\s+/);
          const given = words[words.length - 1];
          return given === targetName || fn.includes(targetName);
        });

        if (childMember) {
          const parent = members.find(p => p.id === childMember.parentId);
          let resp = `Dạ thưa quý vị, **thân sinh (cha)** của **${childMember.fullName}** là `;
          if (parent) {
            const honorific = parent.generationLevel <= 12 ? 'Cụ' : 'Ông/Bà';
            resp += `**${honorific} ${parent.fullName}** (${parent.generation}, Mã ${parent.code}).\n\n`;
            resp += `• **Tên khác / Chức vị:** ${parent.otherName || 'Không'}\n`;
            if (parent.spouse) resp += `• **Phối ngẫu (Mẹ / Hiền nội):** ${parent.spouse}\n`;
            if (parent.birthDeathInfo) resp += `• **Sinh / Mất / Mộ chí:** ${parent.birthDeathInfo}\n`;
          } else {
            resp += `**Thủy tổ / Bậc tiền nhân khởi thủy** (Trực hệ: ${childMember.relationship}).`;
          }
          return resp;
        }
      }
    }

    // D. SIBLINGS QUERY ("anh em ông X", "chị em ông X")
    const isSiblingsQuery = queryNorm.includes('anh em') || queryNorm.includes('chi em');
    if (isSiblingsQuery) {
      const targetName = queryNorm
        .replace(/anh em cua/g, '')
        .replace(/anh em ong/g, '')
        .replace(/anh em cu/g, '')
        .replace(/anh em/g, '')
        .replace(/chi em cua/g, '')
        .replace(/chi em/g, '')
        .replace(/la ai/g, '')
        .replace(/nguyen van/g, '')
        .replace(/nguyen/g, '')
        .trim();

      if (targetName) {
        const targetMember = members.find(m => {
          const fn = cleanText(m.fullName);
          const words = fn.split(/\s+/);
          return words[words.length - 1] === targetName || fn.includes(targetName);
        });

        if (targetMember && targetMember.parentId) {
          const siblings = members.filter(m => m.parentId === targetMember.parentId && m.id !== targetMember.id);
          const parent = members.find(p => p.id === targetMember.parentId);
          let resp = `Dạ thưa quý vị, **anh em ruột** của **${targetMember.fullName}** (con của ${parent ? parent.fullName : 'thân sinh'}) bao gồm **${siblings.length} người**:\n\n`;
          siblings.forEach((s, idx) => {
            resp += `${idx + 1}. **${s.fullName}** (${s.generation}, Mã ${s.code}) - ${s.relationship}\n`;
          });
          return resp;
        }
      }
    }

    // E. ADDRESSING & KINSHIP TERMS QUERY ("xưng hô", "gọi bằng gì", "xưng là gì", "gọi như thế nào", "gọi ông/bà X là gì")
    const isAddressingQuery =
      queryNorm.includes('xung ho') ||
      queryNorm.includes('goi bang gi') ||
      queryNorm.includes('goi la gi') ||
      queryNorm.includes('goi nhu the nao') ||
      queryNorm.includes('xung the nao') ||
      queryNorm.includes('cach goi') ||
      queryNorm.includes('goi bang') ||
      queryNorm.includes('goi sao') ||
      queryNorm.includes('xung sao') ||
      queryNorm.includes('danh xung') ||
      queryNorm.includes('doi chieu quan he');

    // Check generation vs generation addressing (e.g., "Đời 15 gọi Đời 11", "Đời 16 xưng hô Đời 12")
    const genMatches = Array.from(queryNorm.matchAll(/doi\s*(\d+)/gi));
    if (genMatches.length >= 2) {
      const g1 = parseInt(genMatches[0][1], 10);
      const g2 = parseInt(genMatches[1][1], 10);
      if (g1 >= 11 && g1 <= 16 && g2 >= 11 && g2 <= 16) {
        const diff = Math.abs(g1 - g2);
        const lowerGen = Math.max(g1, g2); // e.g. 15
        const higherGen = Math.min(g1, g2); // e.g. 11

        let addrRule = "";
        if (diff === 0) {
          addrRule = `• Đồng thế hệ (Đời ${g1}): Xưng hô **"Anh / Chị / Em"** trong đồng tộc gia đình.`;
        } else if (diff === 1) {
          addrRule = `• Chênh 1 thế hệ: Thành viên Đời ${lowerGen} xưng **"Con / Cháu"**, kính gọi thành viên Đời ${higherGen} là **"Bác / Chú / Cậu / Cô"**.`;
        } else if (diff === 2) {
          addrRule = `• Chênh 2 thế hệ: Thành viên Đời ${lowerGen} xưng **"Cháu"**, kính gọi thành viên Đời ${higherGen} là **"Ông / Bà"**.`;
        } else if (diff === 3) {
          addrRule = `• Chênh 3 thế hệ: Thành viên Đời ${lowerGen} xưng **"Chắt"**, kính gọi thành viên Đời ${higherGen} là **"Cụ Ông / Cụ Bà"**.`;
        } else {
          addrRule = `• Chênh ${diff} thế hệ: Thành viên Đời ${lowerGen} xưng **"Chắt / Hậu Duệ"**, kính gọi các vị Đời ${higherGen} là **"Cụ / Cụ Thủy Tổ / Bậc Tiền Nhân"**.`;
        }

        return `Dạ thưa quý vị, quy tắc xưng hô gia phong giữa **Đời ${lowerGen}** và **Đời ${higherGen}** (chênh lệch ${diff} thế hệ):\n\n` +
          `🤝 **QUY TẮC XƯNG HÔ LỄ PHÉP:**\n${addrRule}\n\n` +
          `💡 *Gia phả Tộc Nguyễn Văn giữ nét gia phong tôn kính Tiền nhân. Quý vị có thể chọn 2 tên cụ thể trong mục "Đối Chiếu Quan Hệ" trên menu để xem chi tiết trực hệ nối truyền ạ.*`;
      }
    }

    if (isAddressingQuery) {
      // Find members mentioned in query
      const mentionedMembers = members.filter(m => {
        const fn = cleanText(m.fullName);
        const on = cleanText(m.otherName || '');
        const words = fn.split(/\s+/);
        const given = words[words.length - 1];
        return (
          (fn.length > 2 && queryNorm.includes(fn)) ||
          (given.length >= 2 && queryNorm.includes(given)) ||
          (on && queryNorm.includes(on))
        );
      });

      if (mentionedMembers.length >= 2) {
        const memA = mentionedMembers[0];
        const memB = mentionedMembers[1];
        const rel = calculateRelationship(memA.id, memB.id, members);
        if (rel) {
          return `Dạ thưa quý vị, kết quả tra cứu cách xưng hô lễ phép giữa **${memA.fullName}** (${memA.generation}) và **${memB.fullName}** (${memB.generation}):\n\n` +
            `🤝 **DANH XƯNG XƯNG HÔ LỄ PHÉP:**\n` +
            `• ${rel.addressingText}\n\n` +
            `📜 **MỐI QUAN HỆ PHẢ HỆ CHÍNH THỨC:**\n` +
            `• ${rel.relationshipText}\n` +
            (rel.ancestorLCA ? `• **Tổ tiên chung:** Cụ ${rel.ancestorLCA.fullName} (${rel.ancestorLCA.generation})\n` : '');
        }
      } else if (mentionedMembers.length === 1) {
        const memTarget = mentionedMembers[0];
        const honorific = memTarget.generationLevel <= 12 ? 'Cụ' : memTarget.generationLevel === 13 ? 'Bậc Tiền Nhân / Ông' : 'Ông/Bà';
        return `Dạ thưa quý vị, hướng dẫn xưng hô lễ phép khi thưa chuyện với **${honorific} ${memTarget.fullName}** (${memTarget.generation}, Mã ${memTarget.code}):\n\n` +
          `• **Nếụ quý vị thuộc Đời 15/16 (Hàng Cháu/Chắt):** Kính xưng **"Cháu"** hoặc **"Chắt"**, kính gọi là **"${honorific} ${memTarget.fullName.split(' ').pop()}"** hoặc **"${honorific}"**.\n` +
          `• **Nếụ quý vị thuộc Đời 13/14 (Hàng Chú/Bác/Anh/Em):** Kính xưng **"Con/Cháu"** (với Tiền nhân) hoặc **"Tôi/Em"** (với anh em đồng tộc).\n\n` +
          `💡 *Quý vị có thể chọn mục "Đối Chiếu Quan Hệ" trên thanh điều hướng để đối chiếu xưng hô giữa 2 vị bất kỳ ạ.*`;
      }
    }

    // 4. Clean query to extract target short/single name or given name
    let cleanQuery = queryNorm
      .replace(/duc cu/g, '')
      .replace(/cu/g, '')
      .replace(/ong/g, '')
      .replace(/ba/g, '')
      .replace(/bac/g, '')
      .replace(/chu/g, '')
      .replace(/co/g, '')
      .replace(/di/g, '')
      .replace(/anh/g, '')
      .replace(/chi/g, '')
      .replace(/em/g, '')
      .replace(/chau/g, '')
      .replace(/con/g, '')
      .replace(/cau/g, '')
      .replace(/mo/g, '')
      .replace(/thim/g, '')
      .replace(/me/g, '')
      .replace(/cha/g, '')
      .replace(/ba/g, '')
      .replace(/bo/g, '')
      .replace(/tho bao nhieu tuoi/g, '')
      .replace(/bao nhieu tuoi/g, '')
      .replace(/may tuoi/g, '')
      .replace(/sinh nam bao nhieu/g, '')
      .replace(/sinh nam nao/g, '')
      .replace(/sinh nam may/g, '')
      .replace(/mat nam bao nhieu/g, '')
      .replace(/mat nam nao/g, '')
      .replace(/qua doi nam nao/g, '')
      .replace(/o dau/g, '')
      .replace(/song o dau/g, '')
      .replace(/tru tai dau/g, '')
      .replace(/que o dau/g, '')
      .replace(/mo o dau/g, '')
      .replace(/mo chi o dau/g, '')
      .replace(/la ai/g, '')
      .replace(/la gi/g, '')
      .replace(/con ai/g, '')
      .replace(/con cua ai/g, '')
      .replace(/la con ai/g, '')
      .replace(/vo la ai/g, '')
      .replace(/chong la ai/g, '')
      .replace(/may nguoi con/g, '')
      .replace(/co bao nhieu con/g, '')
      .replace(/may con/g, '')
      .replace(/cho biet/g, '')
      .replace(/cho hoi/g, '')
      .replace(/tim/g, '')
      .replace(/tra cuu/g, '')
      .replace(/xem/g, '')
      .replace(/thong tin ve/g, '')
      .replace(/thong tin/g, '')
      .replace(/hoi ve/g, '')
      .replace(/hoi/g, '')
      .replace(/nguyen van/g, '')
      .replace(/nguyen/g, '')
      .trim();

    if (!cleanQuery || cleanQuery.length < 2 || ['ong ay', 'ba ay', 'nguoi do', 'nguoi nay', 'ai do', 'ai vay', 'chinh la ai', 'ong', 'ba', 'cu', 'bac', 'chu', 'co', 'di', 'anh', 'chi', 'em', 'chau', 'con', 'ho', 'them', 'the nao'].includes(cleanQuery)) {
      return `Dạ thưa quý thân nhân, câu hỏi chưa rõ tên vị thành viên hoặc đối tượng cụ thể ạ.\n\nĐể con/cháu tra cứu thật chính xác và không suy diễn, kính mong quý vị cung cấp thêm tên thành viên hoặc mối quan hệ cụ thể (Ví dụ: "Cụ Bát", "Ông Chấn", "Vợ ông Khởi", "Con ông Xuân", "Anh em ông Khởi"...).`;
    }

    // Smart Score Matching against all 61 members
    type ScoredMember = { member: GenealogyMember; score: number };
    const scoredList: ScoredMember[] = [];

    for (const m of members) {
      const fullLower = m.fullName.toLowerCase();
      const otherLower = (m.otherName || '').toLowerCase();
      const notesNorm = cleanText(m.notes || '');
      const spouseNorm = cleanText(m.spouse || '');

      const fullWordsLower = fullLower.split(/\s+/);
      const givenNameLower = fullWordsLower[fullWordsLower.length - 1]; // Given name with exact diacritics

      const rawLower = rawQuery.toLowerCase();
      const rawClean = cleanText(rawQuery);

      let score = 0;

      // 1. Name match: Requires exact diacritics (rawLower)
      if (givenNameLower === rawLower || fullLower === rawLower) {
        score = 100;
      } else if (fullWordsLower.includes(rawLower)) {
        score = 85;
      } else if (fullLower.includes(rawLower) || (otherLower && otherLower.includes(rawLower))) {
        score = 70;
      } 
      // 2. Other fields: Can match without diacritics (rawClean)
      else if (spouseNorm && spouseNorm.includes(rawClean)) {
        score = 35;
      } else if (notesNorm && notesNorm.includes(rawClean)) {
        score = 25;
      }

      if (score > 0) {
        scoredList.push({ member: m, score });
      }
    }

    scoredList.sort((a, b) => b.score - a.score);

    if (scoredList.length > 0) {
      const topScore = scoredList[0].score;
      if (topScore < 50) {
        return `Dạ thưa quý thân nhân, từ khóa "${userPrompt}" chưa khớp chính xác với tên vị thành viên nào trong gia phả. Kính mong quý vị cung cấp tên thành viên hoặc câu hỏi rõ ràng hơn (Ví dụ: "Cụ Bát", "Ông Chấn", "Vợ ông Khởi", "Con ông Xuân"...) để con/cháu tra cứu thật chính xác, không suy đoán ạ.`;
      }
      // Filter top scored candidates
      const topMatches = scoredList.filter(
        item => item.score === topScore || (topScore >= 85 && item.score >= 85)
      );

      if (topMatches.length === 1) {
        const m = topMatches[0].member;
        const honorific = m.generationLevel <= 12 ? 'Cụ' : m.generationLevel === 13 ? 'Bậc Tiền Nhân / Ông' : 'Ông/Bà';
        const parent = members.find(p => p.id === m.parentId);
        const children = members.filter(c => c.parentId === m.id);

        let responseText = `Dạ thưa quý vị, thông tin tra cứu phả hệ về **${honorific} ${m.fullName}**:\n\n`;

        // Direct answer callouts for specific questions
        if (queryNorm.includes('tuoi') || queryNorm.includes('tho') || queryNorm.includes('sinh') || queryNorm.includes('mat')) {
          responseText += `💡 **Thông tin Thọ / Sinh / Mất:** ${m.birthDeathInfo || 'Chưa ghi nhận'}\n\n`;
        }
        if (queryNorm.includes('o dau') || queryNorm.includes('tru') || queryNorm.includes('que') || queryNorm.includes('mo')) {
          responseText += `💡 **Nơi ở / Nơi an nghỉ:** ${m.notes || m.birthDeathInfo || 'Chưa ghi nhận'}\n\n`;
        }
        if (queryNorm.includes('vo') || queryNorm.includes('chong') || queryNorm.includes('phoi ngau')) {
          responseText += `💡 **Phối ngẫu:** ${m.spouse || 'Chưa thông tin'}\n\n`;
        }
        if (queryNorm.includes('con')) {
          responseText += `💡 **Con cái:** ${children.length > 0 ? children.map(c => c.fullName).join(', ') : 'Chưa ghi nhận'}\n\n`;
        }

        responseText += `• **Thế hệ:** ${m.generation} (Mã phả hệ: ${m.code})\n`;
        if (m.otherName) responseText += `• **Tên khác / Pháp danh / Chức vị:** ${m.otherName}\n`;
        responseText += `• **Trực hệ:** ${m.relationship}${parent ? ` (Thân sinh / Cha: ${parent.fullName})` : ''}\n`;
        if (m.birthDeathInfo) responseText += `• **Sinh / Mất / Thọ / Mộ chí:** ${m.birthDeathInfo}\n`;
        if (m.spouse) responseText += `• **Phối ngẫu (Vợ/Chồng):** ${m.spouse}\n`;
        if (m.notes) responseText += `• **Ghi chú & Nơi ở:** ${m.notes}\n`;

        if (children.length > 0) {
          responseText += `\n• **Danh sách con cái (${children.length} vị):** ${children.map(c => c.fullName).join(', ')}`;
        }

        return responseText;
      } else {
        let responseText = `Dạ thưa quý vị, con/cháu tìm thấy **${topMatches.length} thành viên** có tên/từ khóa phù hợp với "${rawQuery}":\n\n`;
        topMatches.slice(0, 10).forEach((item, idx) => {
          const m = item.member;
          responseText += `${idx + 1}. **${m.fullName}** (${m.generation}, Mã ${m.code}) - ${m.relationship}\n   _Thông tin:_ ${m.birthDeathInfo || 'Chưa ghi nhận'}\n`;
        });
        if (topMatches.length > 10) {
          responseText += `\n... và một số thành viên khác.`;
        }
        responseText += `\nQuý vị có thể gõ rõ hơn (ví dụ: "Ông Nguyễn Văn ${topMatches[0].member.fullName.split(' ').pop()}") để xem thông tin chi tiết từng vị ạ.`;
        return responseText;
      }
    }

    // 5. Default polite fallback
    return `Dạ thưa quý thân nhân con cháu dòng họ Nguyễn Văn,\n\nCon/cháu đã tra cứu kỹ trong cơ sở dữ liệu 61 thành viên gia phả nhưng chưa tìm thấy từ khóa "${userPrompt}".\n\nQuý vị có thể thử đặt câu hỏi bằng tên ngắn hoặc tên đầy đủ ạ:\n1. Tên ngắn: "Bát", "Khởi", "Xuân", "Chấn", "Yến", "Sở", "Tuân", "Vũ", "Đính".\n2. Câu hỏi ngắn: "Xuân thọ bao nhiêu tuổi?", "Khởi ở đâu?", "Con ông Chấn", "Cụ Bát".\n3. Tra cứu thế hệ: "Đời 11", "Đời 14", "Đời 16".`;
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate instant offline response
    setTimeout(() => {
      const reply = processOfflineQuery(userText);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    }, 150);
  };

  // --------------------------------------------------------------------------
  // RELATIONSHIP CALCULATOR LOGIC
  // --------------------------------------------------------------------------
  const relationshipAnalysis = useMemo(() => {
    if (!personAId || !personBId || personAId === personBId) {
      return null;
    }

    const memberA = members.find(m => m.id === personAId);
    const memberB = members.find(m => m.id === personBId);

    if (!memberA || !memberB) return null;

    // Build ancestors map
    const getAncestors = (id: string): string[] => {
      const ancestors: string[] = [];
      let current = members.find(m => m.id === id);
      while (current && current.parentId) {
        ancestors.push(current.parentId);
        current = members.find(m => m.id === current?.parentId);
      }
      return ancestors;
    };

    const ancestorsA = [memberA.id, ...getAncestors(memberA.id)];
    const ancestorsB = [memberB.id, ...getAncestors(memberB.id)];

    let commonAncestorId: string | null = null;
    for (const idA of ancestorsA) {
      if (ancestorsB.includes(idA)) {
        commonAncestorId = idA;
        break;
      }
    }

    const commonAncestor = commonAncestorId
      ? members.find(m => m.id === commonAncestorId)
      : null;

    const levelDiff = memberA.generationLevel - memberB.generationLevel;

    let formOfAddress = '';
    if (levelDiff === 0) {
      formOfAddress = 'Anh / Chị / Em họ đồng cành';
    } else if (levelDiff === -1) {
      formOfAddress = `${memberA.fullName} là bậc Chú/Bác/Cô/Dì của ${memberB.fullName}`;
    } else if (levelDiff === 1) {
      formOfAddress = `${memberA.fullName} là hàng Con/Cháu xưng hô với ${memberB.fullName}`;
    } else if (levelDiff <= -2) {
      formOfAddress = `${memberA.fullName} là bậc Cụ/Ông/Bà Tiền bối đối với ${memberB.fullName}`;
    } else {
      formOfAddress = `${memberA.fullName} là hàng Hậu duệ Cháu/Chắt đối với ${memberB.fullName}`;
    }

    return {
      memberA,
      memberB,
      commonAncestor,
      levelDiff,
      formOfAddress
    };
  }, [personAId, personBId, members]);

  // --------------------------------------------------------------------------
  // MEMBER DIRECTORY FILTERS
  // --------------------------------------------------------------------------
  const filteredMembers = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return members;

    const queryLower = rawQuery.toLowerCase();
    const queryClean = cleanText(rawQuery);

    return members.filter(m => {
      // 1. TÊN THÀNH VIÊN: Bắt buộc viết CHÍNH XÁC CÓ DẤU (không phân biệt hoa/thường)
      const nameMatches =
        m.fullName.toLowerCase().includes(queryLower) ||
        (m.otherName && m.otherName.toLowerCase().includes(queryLower));

      // 2. PHẦN THÔNG TIN KHÁC (Ghi chú, thông tin sinh/mất, phối ngẫu, trực hệ, mã): Có thể viết THIẾU DẤU (accent-insensitive)
      const otherFieldsMatches =
        (m.notes && cleanText(m.notes).includes(queryClean)) ||
        (m.birthDeathInfo && cleanText(m.birthDeathInfo).includes(queryClean)) ||
        (m.spouse && cleanText(m.spouse).includes(queryClean)) ||
        (m.relationship && cleanText(m.relationship).includes(queryClean)) ||
        (m.generation && cleanText(m.generation).includes(queryClean)) ||
        m.code.toLowerCase().includes(queryLower);

      const matchesSearch = nameMatches || otherFieldsMatches;

      const matchesGen =
        generationFilter === 'all' || m.generationLevel.toString() === generationFilter;

      return matchesSearch && matchesGen;
    });
  }, [members, searchQuery, generationFilter]);

  // --------------------------------------------------------------------------
  // MEMBER MANAGEMENT CRUD
  // --------------------------------------------------------------------------
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (editingMember.id) {
      // Update existing
      setMembers(prev => prev.map(m => (m.id === editingMember.id ? editingMember : m)));
    } else {
      // Create new
      const newId = `custom_${Date.now()}`;
      const newMember: GenealogyMember = {
        ...editingMember,
        id: newId,
        code: editingMember.code || `1_custom_${members.length + 1}`
      };
      setMembers(prev => [...prev, newMember]);
    }

    setEditingMember(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi phả hệ không?")) {
      setMembers(prev => prev.filter(m => m.id !== id));
      if (selectedMember?.id === id) setSelectedMember(null);
    }
  };

  const handleResetDefault61 = () => {
    if (window.confirm("Khôi phục lại danh sách chuẩn 61 thành viên ban đầu của Tộc Nguyễn Văn?")) {
      setMembers(DEFAULT_61_MEMBERS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_61_MEMBERS));
      alert("Đã khôi phục thành công 61 thành viên gia phả gốc!");
    }
  };

  const handleExportDataJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GiaPha_NguyenVan_${members.length}_ThanhVien.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDataJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          alert(`Nhập thành công ${parsed.length} thành viên vào hệ thống!`);
        } else {
          alert("File JSON không hợp lệ hoặc dữ liệu rỗng.");
        }
      } catch (err) {
        alert("Lỗi khi đọc file JSON. Vui lòng kiểm tra định dạng file.");
      }
    };
    reader.readAsText(file);
  };

  // --------------------------------------------------------------------------
  // TREE VISUALIZATION RENDERER
  // --------------------------------------------------------------------------
  const renderTreeBranch = (parentId: string | null = null, level: number = 0) => {
    const children = members.filter(m => m.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={`flex flex-col items-center gap-6 ${level > 0 ? 'mt-4 border-t border-amber-800/40 pt-4' : ''}`}>
        <div className="flex flex-wrap justify-center gap-6">
          {children.map(member => {
            const hasChildren = members.some(m => m.parentId === member.id);
            return (
              <div key={member.id} className="flex flex-col items-center">
                {/* Member Card */}
                <div
                  onClick={() => setSelectedMember(member)}
                  className={`w-64 cursor-pointer rounded-xl p-3 border transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 ${
                    selectedMember?.id === member.id
                      ? 'bg-amber-900/90 border-yellow-400 ring-2 ring-yellow-400/50 text-amber-50'
                      : 'bg-stone-900/90 border-amber-800/80 hover:border-amber-500 text-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-amber-800/50 pb-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      {member.generation}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono">
                      Mã: {member.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-yellow-300 tracking-wide font-serif">
                    {member.fullName}
                  </h3>

                  {member.otherName && (
                    <p className="text-xs text-amber-200/80 italic mt-0.5">
                      {member.otherName}
                    </p>
                  )}

                  <p className="text-xs text-amber-300/90 mt-1 line-clamp-1">
                    {member.relationship}
                  </p>

                  {member.birthDeathInfo && (
                    <p className="text-[11px] text-amber-400/70 mt-1 line-clamp-1">
                      {member.birthDeathInfo}
                    </p>
                  )}
                </div>

                {/* Sub branches */}
                {hasChildren && renderTreeBranch(member.id, level + 1)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-amber-100 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 pb-16">
      {/* HEADER SECTION */}
      <header className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-amber-800/80 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-xl shrink-0">
              <img
                src="/emblem.jpg"
                alt="Biểu trưng Họ Nguyễn Văn"
                className="w-full h-full rounded-full object-cover border border-yellow-300/80 shadow-inner"
                onError={(e) => {
                  // Fallback icon if emblem image doesn't load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-black font-serif tracking-wide text-yellow-300 drop-shadow-md">
                GIA PHẢ GIA ĐÌNH NGUYỄN VĂN
              </h1>
              <p className="text-xs text-amber-200/90 font-medium">
                Vĩnh Lại - Triệu Phong - Quảng Trị (Từ Đời 11 đến Đời 16)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              Tổng {members.length} Thành Viên
            </span>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-yellow-300 text-xs font-medium transition shadow"
            >
              <Share2 className="w-3.5 h-3.5" />
              Chia Sẻ Web
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-1 pt-2">
          {[
            { id: 'tree', label: 'Cây Gia Phả Visual', icon: GitBranch },
            { id: 'directory', label: 'Danh Sách Thành Viên', icon: Users },
            { id: 'relationship', label: 'Đối Chiếu Quan Hệ', icon: Heart },
            { id: 'stats', label: 'Thống Kê Dòng Họ', icon: PieChart },
            { id: 'manage', label: 'Cập Nhật & Quản Lý', icon: Edit }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-yellow-400 text-yellow-300 bg-amber-900/40'
                    : 'border-transparent text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================================================================== */}
        {/* TAB 1: CÂY GIA PHẢ VISUAL & EMBEDDED OFFLINE ASSISTANT */}
        {/* ==================================================================== */}
        {activeTab === 'tree' && (
          <div className="space-y-6">
            {/* OFFLINE ASSISTANT TEXT BANNER / CHAT PANEL */}
            <div className="bg-gradient-to-r from-amber-950 via-red-950 to-amber-950 border border-amber-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-0.5 shadow shrink-0">
                    <img src="/emblem.jpg" alt="AI Icon" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-yellow-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      Trợ Lý Gia Phả Họ Nguyễn Văn
                    </h2>
                    <p className="text-xs text-amber-200/80">
                      Tra cứu thông tin 61 thành viên, độ tuổi thọ, thế hệ, mối quan hệ trực hệ tức thì.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setChatInput('');
                    setChatMessages([]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-900 via-amber-900 to-red-900 hover:from-red-800 hover:to-amber-800 text-yellow-200 border border-yellow-500/60 hover:border-yellow-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md shrink-0 cursor-pointer"
                  title="Làm mới đoạn chat & xóa phản hồi cũ"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="inline">Làm mới đoạn chat</span>
                </button>
              </div>

              {/* Chat Message History */}
              <div className="max-h-56 overflow-y-auto space-y-3 py-3 pr-2 my-2 no-scrollbar">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-2xl rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow ${
                        msg.sender === 'user'
                          ? 'bg-amber-800/80 text-amber-50 border border-amber-600'
                          : 'bg-stone-900/90 text-amber-100 border border-amber-800/80'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* QUICK QUESTION PILLS */}
              <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar text-xs">
                {[
                  'Họ Nguyễn Văn có bao nhiêu thành viên?',
                  'Cụ Nguyễn Văn Bát thọ bao nhiêu tuổi?',
                  'Cụ Nguyễn Văn Ngọc sinh năm nào?',
                  'Nguyễn Văn Khởi là con ai?',
                  'Ai định cư ở Hoa Kỳ?',
                  'Đời 16 có những thành viên nào?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatInput(q);
                    }}
                    className="px-2.5 py-1 rounded-full bg-amber-900/50 hover:bg-amber-800 border border-amber-700/60 text-amber-200 whitespace-nowrap text-[11px] transition"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* CHAT INPUT FORM - TEXT ONLY (NO MICROPHONE, NO SPEAKER) */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage(e);
                    }
                  }}
                  placeholder="Nhập câu hỏi (ví dụ: Đức Cụ Bát thọ bao nhiêu tuổi?)"
                  className="flex-1 bg-stone-900/90 border border-amber-700/80 rounded-xl px-4 py-2.5 text-xs text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-yellow-400 transition"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi
                </button>
              </form>
            </div>

            {/* VISUAL TREE CANVAS */}
            <div className="bg-stone-900/80 border border-amber-800/80 rounded-2xl p-6 shadow-xl overflow-x-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold font-serif text-yellow-300">
                  CÂY PHẢ HỆ DÒNG HỌ NGUYỄN VĂN
                </h2>
                <p className="text-xs text-amber-200/80 mt-1">
                  Nhấp vào thẻ từng thành viên để xem thông tin chi tiết
                </p>
              </div>

              <div className="min-w-[800px] flex justify-center py-4">
                {renderTreeBranch(null)}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: DANH SÁCH THÀNH VIÊN */}
        {/* ==================================================================== */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-stone-900/90 border border-amber-800/80 p-4 rounded-2xl shadow-lg">
              {/* SEARCH BAR */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm (Tên viết chính xác có dấu, thông tin khác có thể thiếu dấu)..."
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl pl-10 pr-4 py-2 text-xs text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* GENERATION FILTER */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-amber-400" />
                <select
                  value={generationFilter}
                  onChange={e => setGenerationFilter(e.target.value)}
                  className="bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">Tất cả các Đời (11 - 16)</option>
                  <option value="11">Đời 11</option>
                  <option value="12">Đời 12</option>
                  <option value="13">Đời 13</option>
                  <option value="14">Đời 14</option>
                  <option value="15">Đời 15</option>
                  <option value="16">Đời 16</option>
                </select>
              </div>
            </div>

            {/* MEMBER CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-stone-900/90 border border-amber-800/80 hover:border-yellow-500/80 rounded-2xl p-4 shadow-lg hover:shadow-2xl transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-800/50 pb-2.5 mb-2.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                        {member.generation}
                      </span>
                      <span className="text-xs font-mono text-amber-400/80">
                        Mã: {member.code}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-yellow-300 font-serif group-hover:text-yellow-200 transition">
                      {member.fullName}
                    </h3>

                    {member.otherName && (
                      <p className="text-xs text-amber-200/80 italic mt-0.5">
                        {member.otherName}
                      </p>
                    )}

                    <div className="mt-3 space-y-1.5 text-xs text-amber-100/90">
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{member.relationship}</span>
                      </p>

                      {member.spouse && (
                        <p className="flex items-center gap-1.5 text-amber-200/90">
                          <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="line-clamp-1">{member.spouse}</span>
                        </p>
                      )}

                      {member.birthDeathInfo && (
                        <p className="flex items-center gap-1.5 text-amber-300/80">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="line-clamp-1">{member.birthDeathInfo}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-amber-800/40 flex justify-between items-center text-xs text-yellow-400 group-hover:translate-x-1 transition-transform">
                    <span>Xem chi tiết phả hệ</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12 bg-stone-900/60 rounded-2xl border border-amber-800/60">
                <p className="text-amber-300 font-medium">Không tìm thấy thành viên nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: ĐỐI CHIẾU QUAN HỆ */}
        {/* ==================================================================== */}
        {activeTab === 'relationship' && (
          <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-yellow-300">
                ĐỐI CHIẾU MỐI QUAN HỆ VÀ XƯNG HÔ DÒNG HỌ
              </h2>
              <p className="text-xs text-amber-200/80 mt-1">
                Chọn 2 thành viên bất kỳ trong gia phả 61 người để xác định quan hệ thứ bậc, thế hệ và cách xưng hô chuẩn mực.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PERSON A */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-yellow-300">Thành viên thứ nhất (A):</label>
                <select
                  value={personAId}
                  onChange={e => setPersonAId(e.target.value)}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2.5 text-xs text-amber-100 focus:outline-none focus:border-yellow-400"
                >
                  <option value="">-- Chọn thành viên A --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.generation} - Mã {m.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* PERSON B */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-yellow-300">Thành viên thứ hai (B):</label>
                <select
                  value={personBId}
                  onChange={e => setPersonBId(e.target.value)}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2.5 text-xs text-amber-100 focus:outline-none focus:border-yellow-400"
                >
                  <option value="">-- Chọn thành viên B --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.generation} - Mã {m.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ANALYSIS RESULT PANEL */}
            {relationshipAnalysis ? (
              <div className="bg-amber-950/80 border border-yellow-500/50 rounded-2xl p-5 space-y-4 shadow-lg">
                <h3 className="text-base font-bold text-yellow-300 border-b border-amber-800/60 pb-2">
                  KẾT QUẢ ĐỐI CHIẾU QUAN HỆ
                </h3>

                <div className="space-y-2 text-xs leading-relaxed text-amber-100">
                  <p>
                    • <strong>Thành viên A:</strong> {relationshipAnalysis.memberA.fullName} ({relationshipAnalysis.memberA.generation})
                  </p>
                  <p>
                    • <strong>Thành viên B:</strong> {relationshipAnalysis.memberB.fullName} ({relationshipAnalysis.memberB.generation})
                  </p>

                  {relationshipAnalysis.commonAncestor ? (
                    <p className="text-yellow-200">
                      • <strong>Tổ tiên chung gần nhất:</strong> Cụ {relationshipAnalysis.commonAncestor.fullName} ({relationshipAnalysis.commonAncestor.generation})
                    </p>
                  ) : (
                    <p className="text-amber-300/80">
                      • Cùng chung gốc khởi thủy từ Cụ Nguyễn Văn Xuân (Đời 11).
                    </p>
                  )}

                  <div className="mt-3 p-3 rounded-xl bg-stone-900 border border-amber-700/80 text-yellow-300 font-semibold text-sm">
                    Xưng hô chuẩn mực: {relationshipAnalysis.formOfAddress}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-amber-300/60 border border-dashed border-amber-800/60 rounded-xl">
                Vui lòng chọn đủ 2 thành viên để xem phân tích đối chiếu.
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: THỐNG KÊ DÒNG HỌ */}
        {/* ==================================================================== */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-amber-300 font-medium">Tổng Số Thành Viên</p>
                <p className="text-3xl font-black text-yellow-300 font-serif mt-1">{members.length}</p>
                <p className="text-[11px] text-amber-400/70 mt-1">Ghi nhận chính thức trong gia phả</p>
              </div>

              <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-amber-300 font-medium">Số Thế Hệ</p>
                <p className="text-3xl font-black text-yellow-300 font-serif mt-1">6 Đời</p>
                <p className="text-[11px] text-amber-400/70 mt-1">Từ Đời 11 đến Đời 16</p>
              </div>

              <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-amber-300 font-medium">Đồ Thống Định Cư Ngoại Quốc</p>
                <p className="text-3xl font-black text-yellow-300 font-serif mt-1">
                  {members.filter(m => m.notes?.includes('Hoa Kỳ') || m.notes?.includes('Mỹ')).length}
                </p>
                <p className="text-[11px] text-amber-400/70 mt-1">Thành viên tại Hoa Kỳ (Mỹ)</p>
              </div>

              <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-amber-300 font-medium">Số Lượng Đời 16 (Hậu Duệ Trẻ)</p>
                <p className="text-3xl font-black text-yellow-300 font-serif mt-1">
                  {members.filter(m => m.generationLevel === 16).length}
                </p>
                <p className="text-[11px] text-amber-400/70 mt-1">Hậu duệ nối nghiệp dòng họ</p>
              </div>
            </div>

            {/* GENERATION DISTRIBUTION BREAKDOWN */}
            <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold font-serif text-yellow-300 border-b border-amber-800/60 pb-2">
                PHÂN BỔ THÀNH VIÊN THEO CÁC THẾ HỆ
              </h3>

              <div className="space-y-3">
                {[11, 12, 13, 14, 15, 16].map(gen => {
                  const count = members.filter(m => m.generationLevel === gen).length;
                  const percentage = Math.round((count / members.length) * 100);
                  return (
                    <div key={gen} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-amber-200">Đời {gen}</span>
                        <span className="text-yellow-400">{count} người ({percentage}%)</span>
                      </div>
                      <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-amber-800/60">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: CẬP NHẬT & QUẢN LÝ DỮ LIỆU */}
        {/* ==================================================================== */}
        {activeTab === 'manage' && (
          <div className="bg-stone-900/90 border border-amber-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-800/60 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-yellow-300">
                  QUẢN LÝ VÀ CẬP NHẬT GIA PHẢ
                </h2>
                <p className="text-xs text-amber-200/80 mt-1">
                  Thêm mới, chỉnh sửa, trích xuất dữ liệu JSON hoặc khôi phục lại 61 thành viên gốc.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingMember({
                      id: '',
                      code: `1_custom_${members.length + 1}`,
                      generation: 'Đời 16',
                      generationLevel: 16,
                      fullName: '',
                      relationship: '',
                      parentId: members[0]?.id || null,
                      spouse: '',
                      birthDeathInfo: '',
                      notes: ''
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Thành Viên
                </button>

                <button
                  onClick={handleExportDataJSON}
                  className="px-3.5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 border border-amber-700/80 text-yellow-300 font-semibold text-xs flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" />
                  Tải JSON
                </button>

                <label className="px-3.5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 border border-amber-700/80 text-yellow-300 font-semibold text-xs flex items-center gap-1.5 shadow cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Nhập File JSON
                  <input type="file" accept=".json" onChange={handleImportDataJSON} className="hidden" />
                </label>

                <button
                  onClick={handleResetDefault61}
                  className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 font-semibold text-xs flex items-center gap-1.5 shadow"
                >
                  <RotateCcw className="w-4 h-4" />
                  Khôi Phục 61 Gốc
                </button>
              </div>
            </div>

            {/* MEMBER TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-amber-100 border-collapse">
                <thead>
                  <tr className="border-b border-amber-800/80 bg-amber-950/50 text-yellow-300 font-serif">
                    <th className="p-3">Mã</th>
                    <th className="p-3">Đời</th>
                    <th className="p-3">Họ và Tên</th>
                    <th className="p-3">Trực hệ</th>
                    <th className="p-3">Thông tin Sinh/Mất</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-800/40">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-amber-950/40 transition">
                      <td className="p-3 font-mono text-amber-400">{member.code}</td>
                      <td className="p-3">{member.generation}</td>
                      <td className="p-3 font-bold text-yellow-300">{member.fullName}</td>
                      <td className="p-3">{member.relationship}</td>
                      <td className="p-3 text-amber-300/80 max-w-xs truncate">{member.birthDeathInfo || '-'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-amber-100">
            <div className="flex justify-between items-start border-b border-amber-800/60 pb-3">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  {selectedMember.generation}
                </span>
                <h3 className="text-xl font-bold font-serif text-yellow-300 mt-2">
                  {selectedMember.fullName}
                </h3>
                {selectedMember.otherName && (
                  <p className="text-xs text-amber-200/80 italic">{selectedMember.otherName}</p>
                )}
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-amber-400 hover:bg-amber-900/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <p><strong>Mã phả hệ:</strong> <span className="font-mono text-amber-300">{selectedMember.code}</span></p>
              <p><strong>Trực hệ:</strong> {selectedMember.relationship}</p>
              {selectedMember.spouse && <p><strong>Phối ngẫu:</strong> {selectedMember.spouse}</p>}
              {selectedMember.birthDeathInfo && <p><strong>Sinh/Mất/Thọ/Mộ chí:</strong> {selectedMember.birthDeathInfo}</p>}
              {selectedMember.notes && <p><strong>Ghi chú & Con cái:</strong> {selectedMember.notes}</p>}
            </div>

            <div className="pt-3 border-t border-amber-800/60 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-yellow-300 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD MEMBER MODAL */}
      {isAddModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMember} className="bg-stone-900 border border-amber-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-amber-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-800/60 pb-3">
              <h3 className="text-lg font-bold font-serif text-yellow-300">
                {editingMember.id ? 'Chỉnh Sửa Thành Viên' : 'Thêm Thành Viên Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-amber-400 hover:bg-amber-900/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-yellow-300">Họ và Tên (*):</label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={e => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-yellow-300">Mã Phả Hệ:</label>
                  <input
                    type="text"
                    value={editingMember.code}
                    onChange={e => setEditingMember({ ...editingMember, code: e.target.value })}
                    className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-yellow-300">Đời Thứ:</label>
                  <select
                    value={editingMember.generationLevel}
                    onChange={e => {
                      const lvl = parseInt(e.target.value, 10);
                      setEditingMember({ ...editingMember, generationLevel: lvl, generation: `Đời ${lvl}` });
                    }}
                    className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                  >
                    {[11, 12, 13, 14, 15, 16].map(g => (
                      <option key={g} value={g}>Đời {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-yellow-300">Tên khác / Pháp danh:</label>
                <input
                  type="text"
                  value={editingMember.otherName || ''}
                  onChange={e => setEditingMember({ ...editingMember, otherName: e.target.value })}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-yellow-300">Trực hệ (Con ai):</label>
                <input
                  type="text"
                  value={editingMember.relationship}
                  onChange={e => setEditingMember({ ...editingMember, relationship: e.target.value })}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-yellow-300">Vợ / Chồng:</label>
                <input
                  type="text"
                  value={editingMember.spouse || ''}
                  onChange={e => setEditingMember({ ...editingMember, spouse: e.target.value })}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-yellow-300">Thông tin Sinh/Mất/Thọ/Mộ chí:</label>
                <input
                  type="text"
                  value={editingMember.birthDeathInfo || ''}
                  onChange={e => setEditingMember({ ...editingMember, birthDeathInfo: e.target.value })}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-yellow-300">Ghi chú & Con cái:</label>
                <textarea
                  rows={3}
                  value={editingMember.notes || ''}
                  onChange={e => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-amber-800/80 rounded-xl px-3 py-2 text-amber-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-amber-800/60 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-stone-950 font-bold text-xs"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-amber-100">
            <div className="flex justify-between items-center border-b border-amber-800/60 pb-3">
              <h3 className="text-base font-bold font-serif text-yellow-300 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-yellow-400" />
                Chia Sẻ Link Web Gia Phả
              </h3>
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setCopySuccess(false);
                }}
                className="p-1 rounded-lg text-amber-400 hover:bg-amber-900/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-amber-200/90 leading-relaxed">
                Quý thân nhân có thể sao chép đường dẫn bên dưới hoặc chia sẻ trực tiếp cho con cháu dòng họ Nguyễn Văn cùng truy cập:
              </p>

              <div className="flex items-center gap-2 p-2.5 bg-stone-950 border border-amber-800/90 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="w-full bg-transparent font-mono text-xs text-yellow-300 focus:outline-none select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>

              {copySuccess && (
                <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-emerald-300 font-semibold text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Đã sao chép liên kết trang web vào bộ nhớ tạm!
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Đã Sao Chép Link!' : 'Sao Chép Link Web'}
                </button>

                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-2.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-yellow-200 border border-amber-600/80 font-bold text-xs shadow flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-yellow-300" />
                    Chia Sẻ Trực Tiếp (Zalo / SMS / App)
                  </button>
                )}

                <a
                  href={getShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 border border-amber-800/70 font-semibold text-xs flex items-center justify-center gap-2 transition text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  Mở Trang Web Trong Cửa Sổ Mới
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
