
import React, { useState, useEffect } from 'react';
import { BookOpen, Printer, Plus, RefreshCcw, CheckCircle2, XCircle, Award, Layout, Edit3, Trophy, Sparkles, BrainCircuit, GraduationCap, ChevronRight } from 'lucide-react';
import { TestConfig, MathTest, Difficulty, QuestionType } from './types';
import { generateMathTest } from './geminiService';

const TOPICS = [
  "Số và phép tính phạm vi 100",
  "Số và phép tính phạm vi 1000",
  "Cộng trừ có nhớ (phạm vi 100)",
  "Bảng nhân 2, 5",
  "Bảng chia 2, 5",
  "Hình học (Khối trụ, cầu, tứ giác)",
  "Đo lường (cm, dm, m, kg, lít)",
  "Thời gian (Ngày, giờ, tháng)",
  "Giải toán có lời văn"
];

const App: React.FC = () => {
  const [config, setConfig] = useState<TestConfig>({
    topics: [TOPICS[0]],
    count: 10,
    difficulty: Difficulty.MEDIUM,
    title: "Bài kiểm tra Toán Lớp 2"
  });
  
  const [test, setTest] = useState<MathTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isGraded, setIsGraded] = useState(false);
  const [score, setScore] = useState(0);

  // Reset state when new test is generated
  useEffect(() => {
    if (test) {
      setUserAnswers({});
      setIsGraded(false);
      setScore(0);
      setShowAnswers(false);
    }
  }, [test]);

  const handleToggleTopic = (topic: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleGenerate = async () => {
    if (config.topics.length === 0) {
      alert("Vui lòng chọn ít nhất một chủ đề!");
      return;
    }
    
    setIsLoading(true);
    try {
      const generatedTest = await generateMathTest(config);
      setTest(generatedTest);
    } catch (error) {
      console.error("Error generating test:", error);
      alert("Có lỗi xảy ra khi tạo đề. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    if (isGraded) return;
    setUserAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleGrade = () => {
    if (!test) return;
    let correctCount = 0;
    test.questions.forEach(q => {
      const userAns = (userAnswers[q.id] || "").trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();
      
      // Basic check: direct match or if it contains the answer for word problems
      if (userAns === correctAns || (q.type === QuestionType.MULTIPLE_CHOICE && userAns.includes(correctAns[0]))) {
        correctCount++;
      }
    });
    
    const calculatedScore = (correctCount / test.questions.length) * 10;
    setScore(calculatedScore);
    setIsGraded(true);
    setShowAnswers(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const getRank = (s: number) => {
    if (s >= 9) return { label: "Xuất Sắc", color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", icon: Trophy };
    if (s >= 8) return { label: "Giỏi", color: "text-teal-500", bg: "bg-teal-100", border: "border-teal-200", icon: Award };
    if (s >= 5) return { label: "Khá", color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-200", icon: CheckCircle2 };
    return { label: "Cần Cố Gắng", color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200", icon: Edit3 };
  };

  const RankInfo = getRank(score);

  return (
    <div className="min-h-screen pb-20 font-medium">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
              <BrainCircuit className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Toán Lớp 2 AI</h1>
              <p className="text-teal-100 text-sm font-medium opacity-90">Hệ thống tạo đề thông minh & tự chấm điểm</p>
            </div>
          </div>
          
          {test && (
            <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <button 
                onClick={() => setShowAnswers(!showAnswers)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-bold ${
                  showAnswers 
                  ? 'bg-amber-400 text-teal-900 shadow-lg scale-105' 
                  : 'text-white hover:bg-white/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {showAnswers ? "Ẩn Đáp Án" : "Xem Đáp Án"}
              </button>
              <div className="w-px h-6 bg-white/20"></div>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 text-white hover:bg-white/20 px-4 py-2.5 rounded-lg transition-all text-sm font-bold"
              >
                <Printer className="w-4 h-4" />
                In Đề
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Configuration Panel */}
        <section className="lg:col-span-4 xl:col-span-3 no-print">
          <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 sticky top-8 overflow-hidden">
            <div className="bg-stone-50/50 p-5 border-b border-stone-100 flex items-center gap-2">
              <div className="bg-teal-100 p-2 rounded-lg text-teal-700">
                <Layout className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-stone-700">Cấu hình đề thi</h2>
            </div>

            <div className="p-5 space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Tiêu đề bài kiểm tra</label>
                <input 
                  type="text" 
                  value={config.title}
                  onChange={(e) => setConfig({...config, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-semibold text-stone-700"
                />
              </div>

              {/* Count Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Số câu hỏi</label>
                  <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-md text-xs font-bold">{config.count} câu</span>
                </div>
                <input 
                  type="range" min="5" max="20" step="1"
                  value={config.count}
                  onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Độ khó</label>
                <div className="flex flex-col gap-2">
                  {Object.values(Difficulty).map((d) => (
                    <button
                      key={d}
                      onClick={() => setConfig({...config, difficulty: d})}
                      className={`relative px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border-2 ${
                        config.difficulty === d 
                        ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' 
                        : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {d}
                        {config.difficulty === d && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics Grid */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Chủ đề kiến thức</label>
                <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {TOPICS.map((topic) => {
                    const isActive = config.topics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => handleToggleTopic(topic)}
                        className={`group flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
                          isActive 
                          ? 'bg-gradient-to-r from-teal-50 to-white border-teal-200 shadow-sm' 
                          : 'bg-white border-transparent hover:bg-stone-50 text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isActive ? 'bg-teal-500 border-teal-500' : 'border-stone-300 group-hover:border-stone-400'
                        }`}>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-xs font-bold leading-tight ${isActive ? 'text-teal-900' : ''}`}>
                          {topic}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl shadow-xl shadow-stone-200 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin text-stone-400" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                {isLoading ? "AI đang suy nghĩ..." : "Tạo Đề Ngay"}
              </button>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <section className="lg:col-span-8 xl:col-span-9">
          
          {/* Result Card */}
          {isGraded && test && (
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-teal-900/5 border border-teal-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 no-print animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                   {/* Background Circle */}
                   <svg className="w-full h-full -rotate-90 drop-shadow-lg">
                      <circle cx="64" cy="64" r="56" fill="white" stroke="#f0fdfa" strokeWidth="12" />
                      <circle cx="64" cy="64" r="56" fill="transparent" stroke="#0d9488" strokeWidth="12" 
                              strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * score / 10)} 
                              strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-teal-700 tracking-tighter">{score.toFixed(1)}</span>
                      <span className="text-xs font-bold text-teal-400 uppercase">Điểm</span>
                   </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-black text-stone-800 mb-2">Kết quả bài làm</h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${RankInfo.bg} ${RankInfo.color} ${RankInfo.border}`}>
                    <RankInfo.icon className="w-5 h-5" />
                    <span className="font-bold uppercase text-sm">{RankInfo.label}</span>
                  </div>
                  <p className="mt-3 text-stone-500 text-sm max-w-xs">
                    {score >= 8 ? "Tuyệt vời! Em đã nắm vững kiến thức rất tốt." : "Hãy xem lại đáp án chi tiết để rút kinh nghiệm cho lần sau nhé!"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col w-full md:w-auto gap-3">
                <button 
                  onClick={handleGenerate} 
                  className="w-full md:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-200 font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Đề Mới
                </button>
                <button 
                  onClick={() => setIsGraded(false)} 
                  className="w-full md:w-auto px-6 py-3 bg-white hover:bg-stone-50 border-2 border-stone-200 text-stone-600 rounded-xl font-bold transition-all"
                >
                  Làm Lại
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!test && !isLoading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] p-12 text-center border-4 border-dashed border-stone-200 no-print">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <GraduationCap className="w-16 h-16 text-teal-400" />
              </div>
              <h3 className="text-3xl font-black text-stone-800 mb-4 tracking-tight">Sẵn sàng thử thách?</h3>
              <p className="text-stone-500 text-lg max-w-md mx-auto leading-relaxed">
                Chọn các chủ đề toán học ở cột bên trái để AI tạo ra bài kiểm tra dành riêng cho em nhé!
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="h-full min-h-[400px] bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center no-print shadow-xl shadow-stone-100">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-stone-100 border-t-teal-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold text-stone-700">Đang khởi tạo đề thi...</h3>
              <p className="text-stone-400 text-sm mt-2 font-medium">AI đang soạn những câu hỏi thú vị nhất</p>
            </div>
          )}

          {/* Exam Paper */}
          {test && (
            <div className="relative bg-white p-8 md:p-16 rounded-[2px] shadow-2xl paper mb-12 min-h-[800px]">
              {/* Binder Holes Visual Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-stone-100 border-r border-stone-200 hidden md:flex flex-col items-center py-10 gap-16 print:hidden">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="w-5 h-5 rounded-full bg-stone-300 shadow-inner"></div>
                 ))}
              </div>

              <div className="md:pl-8">
                {/* Exam Header */}
                <div className="text-center mb-12 pb-8 border-b-2 border-dashed border-stone-200">
                  <div className="flex justify-between items-start mb-6 text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <span>Trường TH ........................</span>
                    <span>Năm học 2024 - 2025</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-teal-800 uppercase mb-8 tracking-tight leading-tight">{test.title}</h2>
                  
                  <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm md:text-base font-medium text-stone-600">
                      <div className="text-left space-y-4">
                        <div className="flex items-end gap-2">
                          <span className="shrink-0 font-bold">Họ và tên:</span>
                          <div className="border-b-2 border-stone-300 border-dashed w-full"></div>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="shrink-0 font-bold">Lớp:</span>
                          <div className="border-b-2 border-stone-300 border-dashed w-24"></div>
                        </div>
                      </div>
                      <div className="text-left md:text-right space-y-2">
                        <p className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-lg text-xs font-bold uppercase">{config.difficulty}</p>
                        <p className="text-stone-500">Thời gian làm bài: <span className="text-stone-800 font-bold">40 phút</span></p>
                      </div>
                    </div>
                    
                    {/* Score Box for Print */}
                    <div className="mt-6 border-2 border-stone-800 h-24 w-full md:w-1/2 ml-auto hidden print:flex relative">
                       <span className="absolute top-0 left-0 bg-stone-800 text-white text-xs px-2 py-1 font-bold">Điểm</span>
                       <span className="absolute bottom-0 right-0 bg-stone-800 text-white text-xs px-2 py-1 font-bold">Lời phê của giáo viên</span>
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-10">
                  {test.questions.map((q, idx) => {
                    const isCorrect = isGraded && (userAnswers[q.id] || "").trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                    
                    return (
                      <div key={q.id} className="relative group">
                        {/* Status Line on Left */}
                        <div className={`absolute -left-4 md:-left-8 top-0 bottom-0 w-1 rounded-full transition-colors ${isGraded ? (isCorrect ? 'bg-teal-400' : 'bg-rose-400') : 'bg-transparent'}`}></div>

                        <div className="flex gap-4 md:gap-6">
                          {/* Question Number */}
                          <div className="flex flex-col items-center gap-2">
                            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-colors ${
                              isGraded 
                                ? (isCorrect ? 'bg-teal-500 text-white' : 'bg-rose-500 text-white') 
                                : 'bg-stone-100 text-stone-500 group-hover:bg-teal-500 group-hover:text-white'
                            }`}>
                              {idx + 1}
                            </span>
                          </div>

                          <div className="flex-1 pt-1">
                            {/* Question Content */}
                            <p className="text-stone-800 text-xl md:text-2xl font-bold mb-6 leading-normal tracking-tight">
                              {q.content}
                            </p>
                            
                            {/* MCQ Interaction */}
                            {q.type === QuestionType.MULTIPLE_CHOICE && q.options && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {q.options.map((opt, oIdx) => {
                                  const char = String.fromCharCode(65 + oIdx);
                                  const isSelected = userAnswers[q.id] === char;
                                  
                                  let stateStyle = "border-stone-200 bg-white hover:border-teal-300 hover:shadow-md text-stone-600";
                                  if (isSelected) stateStyle = "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500 shadow-md";
                                  if (isGraded) {
                                      if (char === q.correctAnswer[0]) stateStyle = "border-teal-500 bg-teal-100 text-teal-900 ring-1 ring-teal-500";
                                      else if (isSelected) stateStyle = "border-rose-300 bg-rose-50 text-rose-800 opacity-70";
                                      else stateStyle = "border-stone-100 bg-stone-50 opacity-50";
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={isGraded}
                                      onClick={() => handleInputChange(q.id, char)}
                                      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group/btn ${stateStyle}`}
                                    >
                                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                                        isSelected || (isGraded && char === q.correctAnswer[0]) ? 'bg-white text-teal-700 shadow-sm' : 'bg-stone-100 text-stone-400'
                                      }`}>
                                        {char}
                                      </span>
                                      <span className="font-semibold text-lg">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Text/Number Interaction */}
                            {(q.type === QuestionType.CALCULATION || q.type === QuestionType.FILL_IN_THE_BLANK || q.type === QuestionType.WORD_PROBLEM) && (
                              <div className="mt-4 max-w-lg">
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Edit3 className="h-5 w-5 text-stone-300" />
                                  </div>
                                  <input 
                                    type="text"
                                    disabled={isGraded}
                                    value={userAnswers[q.id] || ""}
                                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                                    placeholder="Nhập câu trả lời của em..."
                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all text-xl font-bold shadow-sm ${
                                      isGraded 
                                        ? (isCorrect ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-rose-300 bg-rose-50 text-rose-800') 
                                        : 'border-stone-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white text-stone-700'
                                    }`}
                                  />
                                </div>
                                {isGraded && !isCorrect && (
                                  <div className="mt-3 flex items-center gap-2 text-base font-bold text-teal-600 bg-teal-50 p-3 rounded-xl inline-block border border-teal-100">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Đáp án đúng: {q.correctAnswer}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Explanation Box */}
                            {(showAnswers || isGraded) && (
                              <div className={`mt-6 p-6 rounded-2xl text-base leading-relaxed border-l-4 shadow-sm animate-in fade-in slide-in-from-top-2 ${
                                isCorrect 
                                  ? 'bg-gradient-to-r from-teal-50 to-white border-teal-400 text-stone-700' 
                                  : 'bg-gradient-to-r from-amber-50 to-white border-amber-400 text-stone-700'
                              }`}>
                                <p className={`font-black flex items-center gap-2 mb-2 uppercase text-xs tracking-wider ${isCorrect ? 'text-teal-600' : 'text-amber-600'}`}>
                                  <BrainCircuit className="w-4 h-4" /> 
                                  {isGraded ? "Giải thích chi tiết" : "Gợi ý làm bài"}
                                </p>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Action Area */}
                {!isGraded && (
                  <div className="mt-20 text-center no-print">
                    <button 
                      onClick={handleGrade}
                      className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-stone-900 text-white rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-teal-900/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative font-black text-xl uppercase tracking-wider flex items-center gap-3">
                        Nộp Bài & Chấm Điểm
                        <ChevronRight className="w-6 h-6" />
                      </span>
                    </button>
                    <p className="mt-6 text-stone-400 text-sm font-medium">Hãy kiểm tra lại bài thật kỹ trước khi nộp em nhé!</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-24 pt-10 border-t-2 border-stone-100 flex flex-col items-center justify-center text-center opacity-60">
                   <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      <span className="font-bold text-stone-400 uppercase tracking-widest text-xs">AI Education</span>
                   </div>
                   <p className="text-stone-300 text-xs">Được tạo bởi Trí tuệ nhân tạo Gemini</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Floating Action Button */}
      {test && (
        <div className="fixed bottom-6 right-6 lg:hidden z-50 flex flex-col gap-3 no-print">
          <button 
             onClick={() => setShowAnswers(!showAnswers)}
             className="w-14 h-14 bg-white text-teal-600 rounded-full shadow-lg border border-teal-100 flex items-center justify-center"
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>
          {!isGraded && (
            <button 
              onClick={handleGrade}
              className="w-16 h-16 bg-teal-600 text-white rounded-full shadow-xl shadow-teal-600/30 flex items-center justify-center animate-bounce"
            >
              <Award className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
