
import { GoogleGenAI, Type } from "@google/genai";
import { TestConfig, Question, MathTest, QuestionType } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateMathTest(config: TestConfig): Promise<MathTest> {
  const prompt = `Hãy tạo một bài kiểm tra Toán lớp 2 cho học sinh Việt Nam.
  Tiêu đề: ${config.title}
  Các chủ đề cần bao quát: ${config.topics.join(', ')}
  Số lượng câu hỏi: ${config.count}
  Độ khó: ${config.difficulty}
  
  Yêu cầu:
  1. Câu hỏi phải phù hợp chính xác với chương trình Toán lớp 2 (Bộ sách Kết nối tri thức, Chân trời sáng tạo hoặc Cánh diều).
  2. Bao gồm đa dạng các loại câu hỏi: Trắc nghiệm, Tính toán, Giải toán có lời văn.
  3. Trả về đúng định dạng JSON yêu cầu.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
                  description: "Only for Multiple Choice questions"
                },
                correctAnswer: { type: Type.STRING },
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
