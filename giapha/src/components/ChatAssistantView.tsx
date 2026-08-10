import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GenealogyMember } from '../types';
import { generateGenealogySummary } from '../utils/storage';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';

interface ChatAssistantViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  members: GenealogyMember[];
}

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  members,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Dạ, Trợ lý Gia phả AI kính chào Quý thân nhân dòng họ Nguyễn Văn!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Speech-to-Text & Text-to-Speech States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle external trigger if user clicked "Hỏi AI về Cụ này" from modal
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Text-to-Speech function
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ chức năng đọc giọng nói (Text-to-Speech).');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text from Markdown symbols, brackets, and bullet points for smooth natural speech reading
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/•/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/,\s*,/g, ',')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.90; // Gentle, soft, unhurried pace for clear sweet Hue pronunciation
    utterance.pitch = 1.08; // Sweet, youthful, gentle female voice pitch (~22 years old)

    // Pick best Vietnamese female/Central/Hue voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice =
      voices.find(
        (v) =>
          v.lang.toLowerCase().includes('vi') &&
          (v.name.toLowerCase().includes('hue') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('nu') ||
            v.name.toLowerCase().includes('nữ') ||
            v.name.toLowerCase().includes('hoai') ||
            v.name.toLowerCase().includes('huyen') ||
            v.name.toLowerCase().includes('giao') ||
            v.name.toLowerCase().includes('linh') ||
            v.name.toLowerCase().includes('central'))
      ) || voices.find((v) => v.lang.toLowerCase().includes('vi'));

    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text handler
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tiếng Việt. Vui lòng thử trên Google Chrome, Microsoft Edge hoặc Safari.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputPrompt(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMsg.text,
          chatHistory: messages.slice(-8),
          customGenealogySummary: generateGenealogySummary(members),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Lỗi kết nối API gia phả.');
      }

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Auto speak response if enabled
      if (autoSpeak) {
        setTimeout(() => {
          speakText(data.reply, botMsgId);
        }, 300);
      }
    } catch (err: any) {
      console.error('Error talking to AI assistant:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Dạ, kính thưa Quý thân nhân! Con/cháu xin lỗi vì hệ thống gặp gián đoạn tạm thời: ${err.message || 'Không thể phản hồi'}. Xin kính mong Quý thân nhân thử gửi lại câu hỏi ạ.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMessage = (id: string) => {
    if (speakingMsgId === id && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setInputPrompt('');
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] bg-amber-950/80 border border-amber-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 p-4 border-b border-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700 p-0.5 shadow shrink-0">
            <img
              src="/emblem.jpg"
              alt="Họ Nguyễn Văn Emblem"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-yellow-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Trợ Lý Gia Phả Họ Nguyễn Văn</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Speak Toggle */}
          <button
            onClick={() => {
              if (speakingMsgId) {
                window.speechSynthesis.cancel();
                setSpeakingMsgId(null);
              }
              setAutoSpeak(!autoSpeak);
            }}
            title={autoSpeak ? 'Tắt tự động phát giọng nói' : 'Bật tự động phát giọng nói'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              autoSpeak
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                : 'bg-amber-900/60 text-amber-400 border-amber-700/60'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-yellow-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoSpeak ? 'Tự Đọc Lời Nói: Bật' : 'Tự Đọc Lời Nói: Tắt'}</span>
          </button>

          {/* Clear & Refresh Chat Button */}
          <button
            type="button"
            onClick={handleClearChat}
            title="Làm mới đoạn chat & xóa lịch sử trò chuyện cũ"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-900 via-amber-900 to-red-900 hover:from-red-800 hover:to-amber-800 text-yellow-200 border border-yellow-500/60 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-yellow-300 animate-spin-once" />
            <span className="inline">Làm mới đoạn chat</span>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeakingThis = speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md overflow-hidden ${
                  isUser
                    ? 'bg-amber-700 text-amber-100 border border-amber-500/50'
                    : 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/50'
                }`}
              >
                {isUser ? (
                  <User className="w-5 h-5" />
                ) : (
                  <img src="/emblem.jpg" alt="AI Emblem" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                  isUser
                    ? 'bg-amber-800 text-amber-50 rounded-tr-none border border-amber-700'
                    : 'bg-amber-900/80 text-amber-100 rounded-tl-none border border-amber-800/90'
                }`}
              >
                <div className="text-xs font-semibold mb-1 flex items-center justify-between gap-4 text-amber-300/80">
                  <span>{isUser ? 'Quý thân nhân' : 'Trợ Lý Gia Phả AI'}</span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {isUser && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-amber-400/60 hover:text-red-300 transition-colors p-0.5 rounded hover:bg-amber-900/60"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Speech, Copy & Delete buttons for assistant messages */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-amber-800/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                        isSpeakingThis
                          ? 'bg-yellow-500 text-amber-950 font-bold animate-pulse shadow'
                          : 'bg-amber-950/70 text-amber-300 hover:text-yellow-300 hover:bg-amber-900'
                      }`}
                      title={isSpeakingThis ? 'Dừng phát giọng nói' : 'Đọc phản hồi này bằng tiếng Việt'}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Đang đọc... (Bấm dừng)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe đọc</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="p-1 rounded bg-amber-950/70 text-amber-400 hover:text-yellow-300 hover:bg-amber-900 transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1 rounded bg-amber-950/70 text-red-400 hover:text-red-200 hover:bg-red-950/80 transition-colors"
                      title="Xóa đoạn trả lời này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-yellow-600/30 text-yellow-400 border border-yellow-500/50 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-amber-900/80 border border-amber-800 rounded-2xl rounded-tl-none p-4 text-amber-300 text-sm flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
              <span>Dạ thưa, cháu/con đang kính cẩn tra cứu gia phả... Xin kính đợi trong giây lát ạ.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice listening indicator banner */}
      {isListening && (
        <div className="bg-red-950/90 border-t border-red-800 px-4 py-2 text-xs text-red-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-semibold">Đang lắng nghe giọng nói tiếng Việt... Hãy nói câu hỏi của bạn!</span>
          </div>
          <button
            onClick={toggleListening}
            className="px-2 py-0.5 rounded bg-red-800 hover:bg-red-700 text-white font-bold text-[11px]"
          >
            Tắt thu âm
          </button>
        </div>
      )}

      {/* Quick Question Chips */}
      <div className="px-3 py-2 bg-amber-950/90 border-t border-amber-800/60 flex items-center gap-2 overflow-x-auto text-xs text-amber-200 no-scrollbar">
        <span className="font-semibold text-yellow-400/90 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Gợi ý hỏi nhanh:
        </span>
        <button
          type="button"
          onClick={handleClearChat}
          className="px-2.5 py-1 rounded-full bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/80 whitespace-nowrap transition-colors shrink-0 flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3 h-3 text-red-400" />
          <span>Làm mới chat</span>
        </button>
        {[
          'Khởi gọi Bát là gì?',
          'Xưng hô với ông Chấn',
          'Đời 15 gọi Đời 11 là gì?',
          'Con ông Chấn',
          'Con ông Khởi',
          'Vợ ông Khởi',
          'Cha của ông Khởi',
          'Anh em ông Chấn',
          'Ai ở Hoa Kỳ?'
        ].map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(sample)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-amber-900/70 hover:bg-amber-800 text-amber-100 border border-amber-700/80 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-amber-950 border-t border-amber-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 shadow ${
            isListening
              ? 'bg-red-600 text-white animate-bounce ring-2 ring-red-400'
              : 'bg-amber-900/80 hover:bg-amber-800 text-yellow-400 border border-amber-700'
          }`}
          title={isListening ? 'Bấm để dừng nhận diện giọng nói' : 'Bấm để nói bằng Giọng nói Tiếng Việt'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (inputPrompt.trim() && !isLoading) {
                  e.preventDefault();
                  handleSendMessage();
                } else {
                  e.preventDefault();
                }
              }
            }}
            placeholder={
              isListening
                ? 'Đang lắng nghe câu hỏi từ micro của bạn...'
                : 'Hỏi quan hệ gia tộc (VD: "Con ông Chấn", "Vợ ông Khởi", "Cha của ông Khởi", "Anh em ông Chấn")'
            }
            disabled={isLoading}
            className="w-full bg-amber-900/50 border border-amber-700/80 rounded-xl pl-4 pr-9 py-2.5 text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all disabled:opacity-50"
          />
          {inputPrompt.trim() !== '' && (
            <button
              type="button"
              onClick={() => setInputPrompt('')}
              className="absolute right-2.5 p-1 rounded-full text-amber-400 hover:text-yellow-200 hover:bg-amber-800/80 transition-colors"
              title="Xóa chữ đã nhập"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear Chat Button inside input bar */}
        <button
          type="button"
          onClick={handleClearChat}
          title="Xóa hết đoạn chat cũ & làm mới cuộc trò chuyện"
          className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-950 via-amber-950 to-red-950 hover:from-red-900 hover:to-amber-900 text-yellow-300 border border-yellow-600/70 hover:border-yellow-400 transition-all font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-yellow-400" />
          <span className="inline">Làm mới đoạn chat</span>
        </button>

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-amber-950 font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span>Kính hỏi</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

