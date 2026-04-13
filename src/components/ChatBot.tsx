'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useI18n } from '@/context/LanguageContext';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  buttons?: { label: string; value: string }[];
  courses?: { id: string; title: string; description: string; price: number }[];
};

type Step =
  | 'welcome'
  | 'interest'
  | 'level'
  | 'recommend'
  | 'test_input'
  | 'test_result'
  | 'free_chat';

const INTERESTS = [
  { label: '🎮 Game Development', value: 'game' },
  { label: '🎬 3D Animatsiya', value: 'animation' },
  { label: '🤖 AI & Computer Vision', value: 'ai' },
  { label: '🎨 UI/UX Dizayn', value: 'uiux' },
];

const LEVELS = [
  { label: '🌱 Boshlang\'ich', value: 'beginner' },
  { label: '📈 O\'rta', value: 'intermediate' },
  { label: '🚀 Ilg\'or', value: 'advanced' },
];

const WELCOME_BUTTONS = [
  { label: '🎯 Menga mos kurs tavsiya qiling', value: 'recommend' },
  { label: '📊 Test natijamni tahlil qiling', value: 'test' },
  { label: '❓ Savol bermoqchiman', value: 'question' },
];

function analyzeTestScore(score: number): string {
  if (score >= 90) {
    return `🏆 Ajoyib natija! ${score}% — Siz bu mavzuni a'lo darajada o'zlashtirdingiz. Keyingi murakkab kursga o'tishingiz mumkin!`;
  } else if (score >= 75) {
    return `✅ Yaxshi natija! ${score}% — Asosiy tushunchalarni yaxshi bilasiz. Bir nechta mavzularni takrorlang va oldinga boring.`;
  } else if (score >= 60) {
    return `📚 O'rtacha natija. ${score}% — Asosiy tushunchalarni qayta ko'rib chiqing. Video darslarni yana bir marta tomosha qilish tavsiya etiladi.`;
  } else if (score >= 40) {
    return `⚠️ Past natija. ${score}% — Mavzuni boshidan o'rganish kerak. Asosiy tushunchalardan boshlang va sekin-sekin oldinga boring.`;
  }
  return `🔴 Juda past natija. ${score}% — Xafa bo'lmang! Har kim qiynalishi mumkin. Darslarni qayta boshlang va o'qituvchingizdan yordam so'rang.`;
}

async function askGemini(text: string, lang: string): Promise<string> {
  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, lang }),
    });
    const data = await res.json();
    return data.reply || (lang === 'en' ? '🤔 Failed to get a response.' : '🤔 Javob olishda xatolik yuz berdi.');
  } catch {
    return lang === 'en'
      ? '❌ Network or server error. Please try again.'
      : '❌ Internet yoki server xatoligi. Qayta urinib ko\'ring.';
  }
}

export default function ChatBot() {
  const { language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState<Step>('welcome');
  const [userInterest, setUserInterest] = useState('');
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addBotMessage = useCallback((
    text: string,
    buttons?: Message['buttons'],
    courses?: Message['courses']
  ) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role: 'bot',
      text,
      buttons,
      courses,
    }]);
  }, []);

  const simulateTyping = useCallback((callback: () => void, delay = 900) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  }, []);

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      simulateTyping(() => {
        addBotMessage(
          '👋 Salom! Men Skynet Academy\'ning AI yordamchisiman. Sizga qanday yordam bera olaman?',
          WELCOME_BUTTONS
        );
      }, 400);
    }
  }, [isOpen, hasOpened, addBotMessage, simulateTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleRecommend = useCallback((interest: string) => {
    simulateTyping(async () => {
      try {
        const res = await fetch(`/api/chatbot?interest=${interest}`);
        const data = await res.json();
        if (data.courses && data.courses.length > 0) {
          addBotMessage(
            `🎉 Siz uchun ${data.courses.length} ta mos kurs topdim!`,
            undefined,
            data.courses
          );
          setTimeout(() => {
            simulateTyping(() => {
              addBotMessage(
                'Qiziqtirgan kursga kirib ko\'rishingiz mumkin. Yana yordam kerakmi?',
                [
                  { label: '🔄 Boshqa soha qidirish', value: 'restart' },
                  { label: '📊 Test tahlili', value: 'test' },
                ]
              );
            }, 600);
          }, 300);
        } else {
          addBotMessage(
            '😔 Hozircha bu soha bo\'yicha kurslar mavjud emas. Tez orada qo\'shiladi!',
            [{ label: '🔄 Boshqa soha qidirish', value: 'restart' }]
          );
        }
      } catch {
        addBotMessage('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.', [
          { label: '🔄 Qayta urinish', value: 'restart' },
        ]);
      }
    }, 1400);
  }, [addBotMessage, simulateTyping]);

  const handleButtonClick = (value: string, label: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role: 'user',
      text: label,
    }]);

    if (value === 'restart') {
      setStep('welcome');
      simulateTyping(() => {
        addBotMessage(
          '🔄 Xo\'p, boshidan boshlaylik! Qanday yordam kerak?',
          WELCOME_BUTTONS
        );
      });
      return;
    }

    if (value === 'test') {
      setStep('test_input');
      simulateTyping(() => {
        addBotMessage('📝 Test natijangizni kiriting (0–100 orasida foizda):');
      });
      return;
    }

    if (value === 'question') {
      setStep('free_chat');
      simulateTyping(() => {
        addBotMessage('💬 Savolingizni yozing, men javob berishga harakat qilaman!');
      });
      return;
    }

    if (step === 'welcome' && value === 'recommend') {
      setStep('interest');
      simulateTyping(() => {
        addBotMessage('🔍 Ajoyib! Qaysi soha sizni eng ko\'p qiziqtiradi?', INTERESTS);
      });
      return;
    }

    if (step === 'interest') {
      setUserInterest(value);
      setStep('level');
      simulateTyping(() => {
        addBotMessage('📈 Yaxshi tanlov! Tajriba darajangiz qanday?', LEVELS);
      });
      return;
    }

    if (step === 'level') {
      setStep('recommend');
      handleRecommend(userInterest);
      return;
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role: 'user',
      text,
    }]);

    if (step === 'test_input') {
      const score = parseInt(text, 10);
      if (isNaN(score) || score < 0 || score > 100) {
        simulateTyping(() => {
          addBotMessage('⚠️ Iltimos, 0 dan 100 gacha bo\'lgan raqam kiriting.');
        });
      } else {
        setStep('test_result');
        simulateTyping(() => {
          addBotMessage(analyzeTestScore(score), [
            { label: '🔄 Boshqa tahlil', value: 'restart' },
            { label: '🎯 Kurs tavsiyasi olish', value: 'recommend' },
          ]);
        });
      }
      return;
    }

    setIsTyping(true);
    askGemini(text, language).then(reply => {
      setIsTyping(false);
      addBotMessage(reply);
    });
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="AI yordamchi"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-90 h-130 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Academy AI</p>
              <p className="text-white/70 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-muted text-foreground rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Quick-reply buttons */}
                  {msg.buttons && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.buttons.map(btn => (
                        <button
                          key={btn.value}
                          onClick={() => handleButtonClick(btn.value, btn.label)}
                          className="px-2.5 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Course cards */}
                  {msg.courses && (
                    <div className="space-y-2">
                      {msg.courses.map(course => (
                        <a
                          key={course.id}
                          href={`/courses/${course.id}`}
                          className="block p-2.5 bg-primary/5 border border-primary/15 rounded-xl hover:bg-primary/10 transition-colors"
                        >
                          <p className="text-xs font-semibold text-foreground">{course.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {course.description}
                          </p>
                          <p className="text-xs text-primary font-medium mt-1">
                            {course.price === 0 ? '🆓 Bepul' : `💰 ${course.price.toLocaleString()} so'm`}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="px-3 py-2.5 bg-muted rounded-2xl rounded-tl-none">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend()}
                placeholder="Xabar yozing..."
                disabled={isTyping}
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2 opacity-60">
              Academy AI · Yordamchi chatbot
            </p>
          </div>
        </div>
      )}
    </>
  );
}
