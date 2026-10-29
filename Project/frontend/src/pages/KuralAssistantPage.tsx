import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  BookOpen,
  HelpCircle,
  X,
  Tag,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { chatWithKural, fetchAssistantStatus } from '../services/api';
import type { ChatMessageItem, ChatSource, AssistantStatus } from '../types';
import { KuralIcon } from '../components/KuralIcon';

interface KuralAssistantPageProps {
  initialContext?: {
    pestName?: string;
    diagnosisId?: string;
  } | null;
  onClearContext?: () => void;
}

export const KuralAssistantPage: React.FC<KuralAssistantPageProps> = ({
  initialContext,
  onClearContext,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('ta')
    ? 'ta'
    : i18n.language?.startsWith('hi')
    ? 'hi'
    : 'en';

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeContext, setActiveContext] = useState<{ pestName?: string; diagnosisId?: string } | null>(
    initialContext || null
  );
  const [statusInfo, setStatusInfo] = useState<AssistantStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check assistant status on mount
  useEffect(() => {
    fetchAssistantStatus()
      .then((status) => setStatusInfo(status))
      .catch((err) => console.warn('Could not fetch assistant status:', err));
  }, []);

  // Update active context if initialContext changes
  useEffect(() => {
    if (initialContext) {
      setActiveContext(initialContext);
    }
  }, [initialContext]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Default welcome chips based on language
  const defaultChips = currentLang === 'ta'
    ? [
        'நெல் இலை சுருட்டுப் புழுவை எவ்வாறு கட்டுப்படுத்துவது?',
        'ரசாயனம் இல்லா இயற்கை பூச்சி மேலாண்மை முறைகள் யாவை?',
        'களத்தில் நன்மை செய்யும் வேட்டைப் பூச்சிகள் எவை?',
        'மஞ்சள் தண்டு துளைப்பான் அறிகுறிகள் யாவை?',
      ]
    : currentLang === 'hi'
    ? [
        'धान के तना छेदक कीट की रोकथाम कैसे करें?',
        'जैविक एवं गैर-रासायनिक कीटनाशक के क्या विकल्प हैं?',
        'खेत में पाए जाने वाले मित्र कीट कौन से हैं?',
        'पत्ती मोड़क कीट के प्रमुख लक्षण क्या हैं?',
      ]
    : [
        'How to manage Rice Leaf Roller with biological controls?',
        'What are the best non-chemical IPM practices for paddy?',
        'Which natural predators help control stem borers?',
        'What symptoms indicate hopperburn in rice fields?',
      ];

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Could not copy message text:', err);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Setup abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      // Build history for backend
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatWithKural(
        {
          message: textToSend,
          language: currentLang,
          diagnosis_id: activeContext?.diagnosisId,
          pest_name: activeContext?.pestName,
          history,
        },
        controller.signal
      );

      const assistantMsg: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources,
        suggestedQuestions: res.suggested_questions,
        disclaimer: res.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request aborted by user
        console.log('Kural generation stopped by user');
      } else {
        const errorDetail = err instanceof Error ? err.message : t('kural.error_failed');
        setErrorMessage(errorDetail);
        const errorMsg: ChatMessageItem = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `${t('kural.error_failed')} (${errorDetail})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      if (window.confirm(t('kural.confirm_clear'))) {
        setMessages([]);
        setErrorMessage(null);
      }
    }
  };

  const handleClearContext = () => {
    setActiveContext(null);
    if (onClearContext) {
      onClearContext();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl border border-forest-800/15 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-900 text-white flex items-center justify-center shrink-0 shadow-md p-2.5">
              <KuralIcon className="w-full h-full text-agri-lime" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-forest-950 font-display tracking-tight">
                  {t('kural.title')}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest-900 text-agri-lime border border-forest-700">
                  <Sparkles className="w-3 h-3 text-agri-lime" />
                  {t('kural.badge')}
                </span>
                {statusInfo?.has_live_llm ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    OpenAI {statusInfo.model}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <BookOpen className="w-3 h-3" />
                    ICAR/TNAU RAG Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {t('kural.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-agri-sand text-xs font-medium text-gray-600 hover:text-forest-950 hover:bg-forest-50 transition-colors"
                title={t('kural.clear_chat')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('kural.clear_chat')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Agricultural Safety Disclaimer Banner */}
        <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>{t('kural.disclaimer_banner')}</p>
        </div>

        {/* Attached Diagnosis Context Banner */}
        {activeContext && (
          <div className="mt-3 p-3 bg-forest-50 border border-forest-200 rounded-xl flex items-center justify-between text-xs text-forest-950">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-agri-leaf" />
              <span>
                <strong className="font-semibold text-forest-900">{t('kural.context_attached')}</strong>{' '}
                {activeContext.pestName || (activeContext.diagnosisId ? `Diagnosis #${activeContext.diagnosisId.slice(0, 8)}` : '')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearContext}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
              title={t('kural.clear_context')}
            >
              <X className="w-4 h-4" />
              <span>{t('kural.clear_context')}</span>
            </button>
          </div>
        )}

        {/* Dynamic Error Alert Banner */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="bg-white rounded-2xl border border-forest-800/15 shadow-sm p-4 md:p-6 mb-4 min-h-[420px] max-h-[650px] flex flex-col justify-between overflow-hidden">
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Welcome Intro Card if no messages yet */}
          {messages.length === 0 && (
            <div className="py-6 px-4 md:px-8 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-forest-950 to-forest-800 text-white flex items-center justify-center mx-auto mb-4 shadow-md p-3.5">
                <KuralIcon className="w-full h-full text-agri-lime" />
              </div>
              <h2 className="text-xl font-bold text-forest-950 font-display mb-2">
                {t('kural.welcome_heading')}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {t('kural.welcome_desc')}
              </p>

              {/* Quick Starting Chips */}
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-950 uppercase tracking-wider mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-agri-leaf" />
                  <span>{t('kural.suggested_title')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {defaultChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(chip)}
                      className="p-2.5 text-left text-xs text-forest-950 bg-forest-50/70 hover:bg-forest-100/80 border border-agri-sand hover:border-forest-600 rounded-xl transition-all flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-agri-leaf shrink-0 mt-0.5" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2.5 max-w-[88%] md:max-w-[82%]">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm p-1.5">
                    <KuralIcon className="w-full h-full text-agri-lime" />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-forest-800 text-white rounded-br-sm shadow-sm'
                      : msg.isError
                      ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-sm'
                      : 'bg-emerald-50/40 text-forest-950 border border-forest-700/20 rounded-bl-sm shadow-xs'
                  }`}
                >
                  {/* Assistant Copy Button */}
                  {msg.role === 'assistant' && !msg.isError && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-forest-900 hover:bg-forest-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Render Message Body */}
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap font-sans text-white">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-forest-950 font-sans">
                      <ReactMarkdown
                        components={{
                          h3: ({ ...props }) => (
                            <h3 className="text-base font-bold text-forest-950 mt-2 mb-1.5 font-display" {...props} />
                          ),
                          h4: ({ ...props }) => (
                            <h4 className="text-sm font-bold text-forest-900 mt-2 mb-1 font-display" {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed text-forest-950" {...props} />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc pl-5 mb-2 space-y-1 text-forest-950" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal pl-5 mb-2 space-y-1 text-forest-950" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                          strong: ({ ...props }) => (
                            <strong className="font-semibold text-forest-950" {...props} />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-agri-leaf pl-3 my-2 text-xs italic text-gray-700 bg-emerald-50/70 py-1.5 rounded-r" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Render Verified Sources if present */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-forest-800/15 text-xs">
                      <div className="font-semibold text-forest-950 flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-agri-leaf" />
                        <span>{t('kural.sources_title')}</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.sources.map((src: ChatSource, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white/90 p-2 rounded-lg border border-agri-sand/60 text-xs shadow-2xs"
                          >
                            <div className="font-medium text-forest-950">{src.title}</div>
                            <div className="text-[11px] text-agri-leaf font-medium">{src.authority}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{src.relevance}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message timestamp */}
                  <div
                    className={`text-[10px] mt-1.5 text-right ${
                      msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>

              {/* Follow-up Question Chips for Assistant Responses */}
              {msg.role === 'assistant' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-2 ml-10 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-forest-50/80 hover:bg-forest-100 text-forest-900 hover:text-forest-950 border border-agri-sand hover:border-forest-600 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-agri-leaf" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Retry button on error */}
              {msg.isError && (
                <div className="mt-1.5 ml-10">
                  <button
                    type="button"
                    onClick={() => {
                      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                      if (lastUser) handleSend(lastUser.content);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('kural.retry')}</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm p-1.5">
                <KuralIcon className="w-full h-full text-agri-lime" />
              </div>
              <div className="bg-emerald-50/40 border border-forest-800/15 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-agri-leaf rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-agri-leaf rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-agri-leaf rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-600 font-medium">{t('kural.thinking')}</span>
                <button
                  type="button"
                  onClick={handleStop}
                  className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>{t('kural.stop')}</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box Area */}
      <div className="bg-white rounded-2xl border border-forest-800/15 shadow-sm p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder={t('kural.input_placeholder')}
              disabled={isLoading}
              maxLength={2000}
              className="flex-1 resize-none bg-forest-50/30 focus:bg-white text-forest-950 text-sm rounded-xl px-4 py-3 border border-agri-sand focus:border-forest-600 focus:outline-hidden transition-all disabled:opacity-50"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="w-11 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
                title={t('kural.stop')}
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 rounded-xl bg-forest-900 hover:bg-forest-950 disabled:bg-gray-300 text-agri-lime disabled:text-gray-500 flex items-center justify-center shrink-0 shadow-sm transition-all disabled:cursor-not-allowed"
                title={t('kural.send')}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
            <div className="flex items-center gap-2">
              <span>{inputText.length} / 2000</span>
              <span>•</span>
              <span className="uppercase font-mono">{currentLang}</span>
            </div>
            <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
          </div>
        </form>
      </div>
    </div>
  );
};
