import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function AnonymousMessage() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    
    const botToken = '8748312228:AAHpEHOKZFdxCdW5IfhXWAxzsWIpCvglog4';
    const chatId = '1761015934';
    // Sending as plain text to prevent ANY escaping/parsing errors from user input
    const text = `🔒 New Anonymous Message\n\n${message}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('');
        setTimeout(() => {
          setStatus('idle');
          setIsOpen(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Telegram API Error:', errorData);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hoverable relative group text-xs md:text-sm font-bold text-brandRed flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-brandRed/30 bg-brandRed/10 hover:bg-brandRed hover:text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandRed opacity-75 group-hover:bg-black"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brandRed group-hover:bg-black transition-colors"></span>
        </span>
        <span className="hidden md:inline">Send Anonymous Message</span>
        <span className="md:hidden">Secret Msg</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">Send a Secret Message</h3>
              <p className="text-sm text-gray-400 mb-6">
                Your message will be sent directly to my Telegram. Completely anonymous.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brandRed/50 focus:bg-white/10 transition-all resize-none h-32 font-mono"
                  disabled={status === 'loading' || status === 'success'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success' || !message.trim()}
                  className="w-full bg-brandRed text-black font-bold py-3 px-6 rounded-xl text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' && <span className="animate-spin text-lg">↻</span>}
                  {status === 'success' ? 'Message Sent!' : status === 'error' ? 'Failed to Send' : 'Send Anonymously'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
