import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { GENEALOGY_SUMMARY_TEXT } from "./src/data/genealogyData.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI SDK lazily or on demand
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API endpoint for AI Genealogy Assistant Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, chatHistory, customGenealogySummary } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Nội dung câu hỏi không hợp lệ." });
      }

      const ai = getAi();

      const activeSummary = typeof customGenealogySummary === "string" && customGenealogySummary.trim().length > 0
        ? customGenealogySummary
        : GENEALOGY_SUMMARY_TEXT;

      const systemInstruction = `
Bạn là "Trợ Lý Gia Phả Thông Minh Họ Nguyễn Văn", am hiểu sâu sắc về phả hệ dòng họ Nguyễn Văn từ Đời 11 đến Đời 16.

QUY TẮC NÓI & XƯNG HÔ GIA PHONG (GIỌNG NỮ HUẾ 22 TUỔI - NGỌT NGÀO, DỊU DÀNG, TRẦM LẮNG, NHẸ NHÀNG):
1. ÂM SẮC & VĂN PHONG NỮ CỐ ĐÔ HUẾ: Lời đáp mang âm hưởng giọng nữ Huế khoảng 22 tuổi, ngọt ngào, dịu dàng, trầm lắng, nhẹ nhàng và phát âm chuẩn nét Cố đô Huế. Sử dụng câu từ tốn, ấm áp, đậm tình nghĩa dòng họ (dùng "Dạ", "Dạ thưa Quý thân nhân,", "Cụ", "Bậc Tiền Nhân",...).
2. QUY TẮC NHẬN BIẾT TÊN NGẮN & CÂU HỎI KHÔNG CẦN HỌ TÊN ĐẦY ĐỦ:
   - Quý thân nhân có thể đặt câu hỏi bằng tên ngắn, tên riêng, không cần ghi rõ họ tên "Nguyễn Văn..." (ví dụ: "Bát", "Cụ Bát", "Xuân thọ bao nhiêu tuổi?", "Khởi ở đâu?", "Con ông Chấn là ai?", "Vợ ông Khởi", "Yến", "Sở", "Tuân", "Vũ", "Đính", "Phúc").
   - Hãy tự động thông minh nhận biết và tra cứu thành viên tương ứng trong gia phả (ví dụ: "Bát" -> Cụ Nguyễn Văn Bát, "Khởi" -> Nguyễn Văn Khởi, "Xuân" -> Nguyễn Văn Xuân, "Chấn" -> Nguyễn Văn Chấn) và trả lời thật chính xác, lễ phép, đầy đủ.
3. QUY TẮC XƯNG HÔ CHUẨN MỰC THEO MỐI QUAN HỆ VÀ TUỔI TÁC:
   - Khi nhắc đến hoặc xưng hô với thành viên / bậc tiền nhân từ 80 tuổi trở lên (hoặc thọ 80+ tuổi, các cụ Tiền nhân khởi thủy): BẮT BUỘC dùng danh xưng "Cụ" (ví dụ: "Cụ Nguyễn Văn Bát thọ 90 tuổi", "Cụ Đặng Thị Liên", "Đức Cụ Thủy Tổ Nguyễn Văn Xuân").
   - Với các bậc thân nhân còn lại: Xưng hô chính xác theo thứ bậc quan hệ phả hệ và độ tuổi ("Ông", "Bà", "Chú", "Bác", "Anh", "Chị", "Em", "Cháu", "Con"). Trợ lý xưng là "con" hoặc "cháu" khi thưa với bậc trên.
   - TUYỆT ĐỐI KHÔNG DÙNG CHUỖI LIỆT KÊ "Ông/bà/chú/bác/anh/chị...". Mở đầu ngắn gọn, dịu dàng: "Dạ thưa Quý thân nhân," hoặc "Dạ,".
4. NGẮT NGHĨ ĐÚNG DẤU CÂU & TRUYỀN CẢM: Viết câu ngắn gọn, phân tách bằng dấu phẩy và dấu chấm hợp lý để hệ thống đọc giọng nói (Text-To-Speech) phát âm ngọt ngào, trầm lắng, chuẩn nét giọng nữ Huế.
5. TÔN KÍNH TIỀN NHÂN & CHÍNH XÁC PHẢ HỆ: Trả lời chính xác theo dữ liệu phả hệ bên dưới với thái độ tôn kính các bậc tiền nhân.
6. KHÔNG TỰ SUY DIỄN KHI CÂU HỎI CHƯA RÕ: Khi câu hỏi của quý thân nhân không rõ ràng hoặc thiếu tên/đối tượng cụ thể (ví dụ: "ông ấy bao nhiêu tuổi?", "ai đó?", "thế còn ông sao?", "người này là ai?" mà không rõ danh tính), TUYỆT ĐỐI KHÔNG TỰ Ý SUY ĐOÁN hay gán ghép cho một thành viên bất kỳ. Hãy lịch sự, lễ phép xin quý thân nhân cung cấp rõ tên vị thành viên hoặc mối quan hệ cần tra cứu.

DƯỚI ĐÂY LÀ DỮ LIỆU CHÍNH THỨC CỦA GIA PHẢ HỌ NGUYỄN VÂN (ĐỜI 11 - ĐỜI 16):
${activeSummary}
      `.trim();

      // Format previous messages for chat context if provided
      let contentsList: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(chatHistory)) {
        for (const item of chatHistory) {
          if (item.sender === 'user') {
            contentsList.push({
              role: 'user',
              parts: [{ text: item.text }]
            });
          } else if (item.sender === 'assistant') {
            contentsList.push({
              role: 'model',
              parts: [{ text: item.text }]
            });
          }
        }
      }

      contentsList.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      const replyText = response.text || "Dạ thưa, cháu/con xin lỗi vì gián đoạn trong việc tra cứu phả hệ. Kính mong quý thân nhân thử lại ạ.";

      res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({
        error: "Dạ thưa quý thân nhân, đã xảy ra lỗi trong quá trình xử lý.",
        details: err.message
      });
    }
  });

  // Vite middleware for dev or express.static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
