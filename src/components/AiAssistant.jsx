import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2, MessageCircle } from "lucide-react";
import { useAskAssistant } from "@/hooks/use-queries";

const WELCOME = {
  id: "welcome",
  role: "bot",
  text: "Xin chào! Tôi là trợ lý AI của SV GYM. Hỏi tôi về lịch tập, gói tập, hoặc bất kỳ thông tin nào bạn cần nhé! 💪",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#4a5568] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const ask = useAskAssistant();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ask.isPending]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || ask.isPending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    ask.mutate(
      { question: text },
      {
        onSuccess: (data) => {
          // API shape: { message: "...", data: { answer: "...", contextCount: N } }
          const answer =
            data?.data?.answer ||
            data?.answer ||
            data?.response ||
            data?.data?.response ||
            "Tôi chưa có thông tin về vấn đề này.";
          setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: answer }]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: "bot", text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.", isError: true },
          ]);
        },
      },
    );
  };

  return (
    <>
      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-5 z-[60] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ boxShadow: "12px 12px 24px #babecc, -12px -12px 24px #ffffff", background: "#e0e5ec", maxHeight: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#babecc]"
          style={{ boxShadow: "0 2px 6px #babecc" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ff4757] flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#2d3436]">SV GYM Assistant</p>
              <p className="text-xs text-[#10b981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-[#4a5568] hover:bg-[#d1d9e6] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ minHeight: "240px" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-[#ff4757] flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#ff4757] text-white rounded-br-sm shadow-[3px_3px_6px_rgba(166,50,60,0.3)]"
                    : msg.isError
                    ? "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
                    : "text-[#2d3436] shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {ask.isPending && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-[#ff4757] flex items-center justify-center shrink-0 mr-2 mt-1">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff] rounded-2xl rounded-bl-sm">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#babecc] p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Nhập câu hỏi..."
              className="flex-1 rounded-xl px-3 py-2 text-sm text-[#2d3436] placeholder:text-[#a0aec0] outline-none"
              style={{ background: "#e0e5ec", boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || ask.isPending}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-[#ff4757] disabled:opacity-50 transition-all active:scale-95"
              style={{ boxShadow: "3px 3px 6px rgba(166,50,60,0.35), -3px -3px 6px rgba(255,100,110,0.25)" }}
            >
              {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Mở AI Assistant"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full flex items-center justify-center text-white bg-[#ff4757] transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ boxShadow: "6px 6px 12px rgba(166,50,60,0.4), -6px -6px 12px rgba(255,100,110,0.3), 0 0 20px rgba(255,71,87,0.3)" }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
