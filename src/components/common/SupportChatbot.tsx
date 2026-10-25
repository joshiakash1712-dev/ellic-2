import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  LifeBuoy,
  MessageCircle,
  Minimize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { EllixConnectLogo } from '../branding/EllixConnectLogo';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const STARTER_QUESTIONS = [
  '🖨️ How to connect thermal printer?',
  '💳 How does Customer Khata work?',
  '📊 How to export GSTR tax reports?',
  '🔍 How to setup barcode scanner?',
  '⚡ Does billing work offline?',
  '👥 How to set cashier 4-digit PINs?',
  '📞 Talk to human agent'
];

export const SupportChatbot: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeStore } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [hasPromptedGreeting, setHasPromptedGreeting] = useState(false);

  const initialWelcomeText = `Hello${
    currentUser?.displayName ? ` ${currentUser.displayName}` : ''
  }! 👋 I am **Ellic Assistant**, your 24/7 retail specialist.

How can I help you today? You can ask me about:
- **POS & Billing:** Barcode scanning, receipt printing (58mm/80mm), split payments.
- **Inventory & Batches:** Stock alerts, expiry tracking, wholesaler reorders.
- **Khata & Credit:** Customer ledgers, WhatsApp payment reminders with UPI links.
- **GST & Reports:** GSTR-1 & GSTR-3B filings, E-Way bills, daily Z-reports.
- **Hardware & Shift:** Thermal printer jams, cashier handover PINs.`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: initialWelcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Listen to global open-support-chat event from other components (Footer, Sidebar, etc.)
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ initialPrompt?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.initialPrompt) {
        handleSendMessage(customEvent.detail.initialPrompt);
      }
    };

    window.addEventListener('open-support-chat', handleOpenChat);
    return () => window.removeEventListener('open-support-chat', handleOpenChat);
  }, []);

  // Show a gentle greeting pill after 4 seconds on initial visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasPromptedGreeting(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) {
      setInputMessage('');
    }
    setIsLoading(true);

    try {
      // Build history payload for contextual assistance
      const historyPayload = messages.slice(-5).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          context: {
            storeName: activeStore?.name || 'Primary Store',
            userName: currentUser?.displayName || currentUser?.email || 'Merchant'
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I am ready to help you with Ellic. Could you clarify what you need assistance with?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Chat request failed, providing direct support escalation:', err);
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: `### 📞 Reach Our 24/7 Support Team
I am momentarily experiencing a connection glitch, but our dedicated team is here to help!

- **WhatsApp Helpline:** [+91 98765 43210](https://wa.me/919876543210) *(Fastest response)*
- **Toll-Free Phone:** +91 98765 43210
- **Email:** support@ellic.com`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        text: initialWelcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper function to render markdown-like text safely
  const formatChatText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Header check ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-100 text-sm mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-xs">
            <span className="text-sky-400 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: renderInlineTokens(bulletText) }} />
          </div>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-1 my-0.5 text-xs" dangerouslySetInnerHTML={{ __html: renderInlineTokens(line) }} />
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard line
      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: renderInlineTokens(line) }} />
      );
    });
  };

  // Basic inline bold and link token parser
  const renderInlineTokens = (raw: string): string => {
    return raw
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">$1</code>')
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline font-semibold hover:text-sky-300">$1</a>'
      );
  };

  return (
    <div
      id="customer-support-chatbot-container"
      className="fixed bottom-20 sm:bottom-20 md:bottom-22 right-3.5 sm:right-6 z-50 flex flex-col items-end pointer-events-none max-w-[calc(100vw-1.75rem)] box-border"
    >
      
      {/* Floating Prompt Bubble on Initial Visit (Desktop/Tablet only to prevent mobile screen clutter) */}
      <AnimatePresence>
        {!isOpen && hasPromptedGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="hidden sm:flex mb-2.5 max-w-xs bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-2xl p-3 shadow-2xl pointer-events-auto items-start gap-2.5 text-slate-200"
          >
            <div className="w-7 h-7 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-center shrink-0 p-0.5 shadow-sm">
              <EllixConnectLogo variant="symbol" size={20} alt="Ellic" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-white">Need help with POS or billing?</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Chat with Ellic Assistant 24/7 for instant support.</p>
              <button
                id="btn-prompt-open-chat"
                onClick={() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                }}
                className="mt-1.5 text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Ask a question &rarr;</span>
              </button>
            </div>
            <button
              id="btn-dismiss-prompt"
              onClick={() => setHasPromptedGreeting(false)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chatbot Window Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="support-chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`w-[calc(100vw-1.75rem)] sm:w-[400px] max-w-md bg-slate-950/98 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto mb-2.5 sm:mb-3 transition-all ${
              isMinimized
                ? 'h-auto'
                : 'h-[calc(100dvh-5.5rem)] max-h-[520px] sm:h-[540px] sm:max-h-[calc(100dvh-6.5rem)]'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-sky-500/40 flex items-center justify-center p-1 shadow-md shadow-blue-500/20">
                    <EllixConnectLogo variant="symbol" size={26} alt="Ellic" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">Ellic Support</h3>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      24/7 AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Retail & POS Technical Assistant</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                <button
                  id="btn-chat-reset"
                  onClick={handleResetChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  id="btn-chat-minimize"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  id="btn-chat-close"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close support chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (Hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Direct Human Hotline Strip */}
                <div className="px-3.5 py-2 bg-blue-950/40 border-b border-sky-500/20 flex items-center justify-between text-[11px] text-sky-300">
                  <div className="flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Hardware Helpline:</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-0.5 text-sky-300 hover:text-sky-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                    <span>•</span>
                    <a
                      href="tel:+919876543210"
                      className="hover:underline flex items-center gap-0.5 text-sky-300 hover:text-sky-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[90%]">
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-lg bg-slate-800/90 border border-sky-500/40 flex items-center justify-center shrink-0 mt-0.5 p-0.5 shadow-sm">
                            <EllixConnectLogo variant="symbol" size={18} alt="Ellic Assistant" />
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl relative group ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-600/20'
                              : 'bg-slate-900 border border-slate-800/90 text-slate-300 rounded-tl-xs shadow-md'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            formatChatText(msg.text)
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}

                          {/* Message Footer / Copy */}
                          <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                            <span>{msg.timestamp}</span>
                            {msg.role === 'assistant' && (
                              <button
                                onClick={() => handleCopyText(msg.text, msg.id)}
                                className="opacity-70 hover:opacity-100 flex items-center gap-1 transition-opacity text-slate-400 hover:text-slate-200"
                                title="Copy answer"
                              >
                                {copiedMessageId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-sky-400" />
                                    <span className="text-sky-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-800/90 border border-sky-500/40 flex items-center justify-center shrink-0 p-0.5 shadow-sm">
                        <EllixConnectLogo variant="symbol" size={18} className="animate-pulse" alt="Thinking" />
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[11px] ml-1">Consulting knowledge base...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Topic Suggestion Chips */}
                <div className="p-2.5 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-sky-300 border border-slate-700/60 text-[11px] font-medium whitespace-nowrap transition-all active:scale-95 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2 shrink-0"
                >
                  <input
                    ref={inputRef}
                    id="support-chat-input"
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="Ask about POS, billing, thermal printer, GST..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
                  />
                  <button
                    id="btn-send-support-message"
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button */}
      <motion.button
        id="btn-toggle-support-chatbot"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
          setHasPromptedGreeting(false);
        }}
        className={`pointer-events-auto h-12 sm:h-13 px-4 rounded-2xl flex items-center gap-2.5 shadow-2xl transition-colors duration-200 border shrink-0 whitespace-nowrap box-border ${
          isOpen
            ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white border-sky-400/40 shadow-blue-900/40'
        }`}
        title={isOpen ? 'Close Support' : 'Customer Support & Help'}
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <EllixConnectLogo variant="symbol" size={24} className="shrink-0 drop-shadow" alt="Ellic" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sky-300 border-2 border-slate-950 animate-ping" />
          )}
        </div>
        <span className="font-bold text-xs sm:text-sm tracking-wide">
          {isOpen ? 'Close Help' : 'Support 24/7'}
        </span>
      </motion.button>

    </div>
  );
};
