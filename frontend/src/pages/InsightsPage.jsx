import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, PiggyBank, MessageSquare, Bot } from 'lucide-react';
import { insightAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

const InsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [savings, setSavings] = useState([]);
  const [budget, setBudget] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    try {
      const [insRes, anomRes, savRes, budRes] = await Promise.all([
        insightAPI.getAll(), insightAPI.getAnomalies(), insightAPI.getSavings(), insightAPI.getBudgetSuggestions()
      ]);
      setInsights(insRes.data.data.insights || []);
      setAnomalies(anomRes.data.data.anomalies || []);
      setSavings(savRes.data.data.recommendations || []);
      setBudget(budRes.data.data);
    } catch (err) { toast.error('Failed to load insights'); }
    finally { setLoading(false); }
  };

  const sendChat = async () => {
    if (!chatMessage.trim()) return;
    setChatHistory((prev) => [...prev, { role: 'user', content: chatMessage }]);
    try {
      const { data } = await insightAPI.chat(chatMessage);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.data.message }]);
    } catch (err) { toast.error('Chat failed'); }
    setChatMessage('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">AI Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-5 flex gap-4">
            <div className={`p-3 rounded-xl ${insight.type === 'saving' ? 'bg-green-50 dark:bg-green-950' : insight.type === 'warning' ? 'bg-red-50 dark:bg-red-950' : 'bg-blue-50 dark:bg-blue-950'}`}>
              {insight.type === 'saving' ? <PiggyBank className="w-6 h-6 text-green-600" /> : insight.type === 'warning' ? <AlertTriangle className="w-6 h-6 text-red-600" /> : <Lightbulb className="w-6 h-6 text-blue-600" />}
            </div>
            <div><h3 className="font-semibold">{insight.title}</h3><p className="text-sm text-gray-500 mt-1">{insight.description}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Anomalies</h2>
          {anomalies.length === 0 ? <p className="text-gray-400 text-center py-8">No anomalies detected</p> : (
            <div className="space-y-3">
              {anomalies.map((a, i) => (
                <div key={i} className={`p-3 rounded-xl ${a.severity === 'high' ? 'bg-red-50 dark:bg-red-950' : 'bg-yellow-50 dark:bg-yellow-950'}`}>
                  <p className="text-sm">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><PiggyBank className="w-5 h-5 text-green-500" /> Savings Tips</h2>
          {savings.length === 0 ? <p className="text-gray-400 text-center py-8">No savings recommendations yet</p> : (
            <div className="space-y-3">
              {savings.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-green-50 dark:bg-green-950">
                  <p className="font-medium text-sm">{s.category}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.tip}</p>
                  <p className="text-xs font-semibold text-green-600 mt-1">Potential saving: {formatCurrency(s.potentialSaving)}/month</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot Floating Button */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-6 right-6 p-4 rounded-full gradient-bg shadow-lg shadow-primary-500/30 text-white z-50 hover:scale-110 transition-transform">
        {chatOpen ? <MessageSquare className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 glass-card z-50 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-500" />
            <span className="font-semibold text-sm">AI Assistant</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Ask about your finances..." className="input-field py-2 text-sm flex-1" />
            <button onClick={sendChat} className="btn-primary py-2">Send</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InsightsPage;