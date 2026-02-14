import { GoogleGenAI, Type } from "@google/genai";
import { TestConfig, MathTest } from "./types";

const getAPIKey = () => {
  // @ts-ignore
  const key = (import.meta.env && import.meta.env.VITE_API_KEY) || (typeof process !== 'undefined' ? process.env.API_KEY : '');
  return key;
};

export async function generateMathTest(config: TestConfig): Promise<MathTest> {
  const apiKey = getAPIKey();
  
  if (!apiKey) {
    throw new Error("Chưa cấu hình API Key cho Gemini. Vui lòng thiết lập VITE_API_KEY trong biến môi trường của Vercel.");
  }

  // Khởi tạo SDK theo version 0.2.0
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Hãy tạo một bài kiểm tra Toán lớp 2 cho học sinh Việt Nam.
  Tiêu đề: ${config.title}
  Các chủ đề cần bao quát: ${config.topics.join(', ')}
  Số lượng câu hỏi: ${config.count}
  Độ khó: ${config.difficulty}
  
  Yêu cầu quan trọng:
  1. Câu hỏi phải phù hợp chính xác với chương trình Toán lớp 2 hiện hành tại Việt Nam.
  2. Bao gồm các loại câu hỏi: Trắc nghiệm, Tính toán, Giải toán có lời văn.
  3. Trả về đúng định dạng JSON yêu cầu. 
  4. Đảm bảo đáp án đúng và lời giải thích dể hiểu cho học sinh lớp 2.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { 
                  type: Type.STRING,
                  description: "One of: Trắc nghiệm, Điền vào chỗ trống, Đặt tính rồi tính, Bài toán có lời văn"
                },
                content: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Chỉ dành cho câu hỏi Trắc nghiệm. Mảng gồm 4 lựa chọn, vd: ['A. 10', 'B. 20', 'C. 30', 'D. 40']"
                },
                correctAnswer: { 
                  type: Type.STRING,
                  description: "Đối với Trắc nghiệm: Chỉ ghi chữ cái (vd: 'A'). Đối với loại khác: Ghi đáp án chính xác."
                },
                explanation: { type: Type.STRING }
              },
              required: ["id", "type", "content", "correctAnswer"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  const rawData = JSON.parse(response.text);
  return {
    ...rawData,
    createdAt: new Date().toISOString()
  };
}