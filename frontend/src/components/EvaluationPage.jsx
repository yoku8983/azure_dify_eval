// src/components/EvaluationPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

// VITE_API_URL が無ければ '' を指定し、同一オリジンの /api を呼び出す
const API_URL = import.meta.env.VITE_API_URL || '';



// --- 子コンポーネント：チャットパネル ---
function ChatPanel({ messages, setMessages, onChatComplete, isChatActive }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user', text: prompt };
    const newMessages = messages.length > 0 && messages[messages.length-1].sender === 'bot' 
        ? [userMessage] 
        : [...messages, userMessage];

    setMessages(newMessages);
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/chat`, { prompt, user: 'eval-user' });
      const botResponse = response.data.response;
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      onChatComplete({
        prompt,
        response: botResponse,
        conversationId: response.data.conversation_id,
      });
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'エラーが発生しました。' }]);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="chat-panel">
      <h3>チャットテスト</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{msg.text}</pre>
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isChatActive ? "評価を保存後、「新規チャットへ」を押してください。" : "プロンプトを入力..."}
          disabled={isLoading || isChatActive}
        />
        <button onClick={handleSend} disabled={isLoading || isChatActive}>
          {isLoading ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  );
}


// --- 子コンポーネント：評価フォーム ---
function EvaluationForm({ chatData, evaluatorName, onEvaluationSubmit, onNewChat, evaluationStatus }) {
  const [rating, setRating] = useState('');
  const [reasons, setReasons] = useState({});
  const [reasonFreeText, setReasonFreeText] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setRating('');
    setReasons({});
    setReasonFreeText('');
    setRemarks('');
    setFeedbackMessage({ type: '', text: '' });
  }, [chatData.prompt, chatData.response]);

  const handleReasonChange = (e) => {
    const { id, checked } = e.target;
    setReasons(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Good/Bad評価は必須です。');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage({ type: '', text: '' });
    const selectedReasons = Object.keys(reasons).filter(key => reasons[key]).join(',');

    const payload = {
      evaluator_name: evaluatorName,
      prompt: chatData.prompt,
      rag_response: chatData.response,
      dify_conversation_id: chatData.conversationId,
      rating,
      reason_category: selectedReasons,
      reason_free_text: reasonFreeText,
      remarks,
    };

    try {
      await axios.post(`${API_URL}/api/evaluations`, payload);
      setFeedbackMessage({ type: 'success', text: '評価が保存されました。「新規チャットへ」ボタンを押してください。' });
    } catch (error) {
      console.error("Evaluation API error:", error);
      setFeedbackMessage({ type: 'error', text: '評価の保存に失敗しました。' });
    } finally {
      setIsSubmitting(false);
      onEvaluationSubmit();
    }
  };

  const goodReasons = [
    { id: 'a', label: 'a) 関連性の高い回答' },
    { id: 'b', label: 'b) 関連性の高い回答と低い回答が混入、許容範囲内' },
    { id: 'c', label: 'c) その他（自由記述）' },
  ];

  const badReasons = [
    { id: 'a', label: 'a) 関連性の低い回答' },
    { id: 'b', label: 'b) 関連性の高い回答と低い回答の混入（許容基準以下）' },
    { id: 'c', label: 'c) 誤りを含む回答' },
    { id: 'd', label: 'd) 生成内容が抽象的、曖昧' },
    { id: 'e', label: 'e) その他（自由記述）' },
  ];

  const reasonOptions = rating === 'good' ? goodReasons : rating === 'bad' ? badReasons : [];
  const isOtherSelected = (rating === 'good' && reasons.c) || (rating === 'bad' && reasons.e);

  return (
    <form className="evaluation-form" onSubmit={handleSubmit}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3>評価フォーム</h3>
        <p style={{margin: 0, color: '#555'}}>評価者: <strong>{evaluatorName}</strong></p>
      </div>
      <div className="form-group">
        <label>プロンプト</label>
        <div className="readonly-text">{chatData.prompt || '（チャットを実行すると表示されます）'}</div>
      </div>
      <div className="form-group">
        <label>RAGの回答</label>
        <div className="readonly-text">{chatData.response || '（チャットを実行すると表示されます）'}</div>
      </div>

      <fieldset>
        {/* ... (評価項目は変更なし) ... */}
        <div className="form-group">
          <label>Good/Bad評価 *</label>
          <div className="radio-group">
            <label><input type="radio" value="good" name="rating" onChange={e => { setRating(e.target.value); setReasons({}); }} /> 有用</label>
            <label><input type="radio" value="bad" name="rating" onChange={e => { setRating(e.target.value); setReasons({}); }} /> 有用でない</label>
          </div>
        </div>
        
        {rating && (
          <div className="form-group">
            <label>評価理由（複数選択可）</label>
            {reasonOptions.map(reason => (
              <div key={reason.id}>
                <label>
                  <input type="checkbox" id={reason.id} checked={!!reasons[reason.id]} onChange={handleReasonChange} />
                  {reason.label}
                </label>
              </div>
            ))}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="reasonFreeText">評価理由（自由記述）</label>
          <textarea 
            id="reasonFreeText" 
            value={reasonFreeText} 
            onChange={e => setReasonFreeText(e.target.value)} 
            disabled={!isOtherSelected}
            placeholder={isOtherSelected ? '理由を自由記述してください' : '「その他」を選択した場合に入力可能'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="remarks">その他備考コメント</label>
          <textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            disabled={evaluationStatus !== 'pending' || isSubmitting}
          >
            {isSubmitting ? '保存中...' : '評価を保存'}
          </button>

          <button 
            type="button" 
            onClick={onNewChat}
            disabled={evaluationStatus !== 'submitted'}
          >
            新規チャットへ
          </button>
        </div>
        
        {feedbackMessage.text && (
          <div className={feedbackMessage.type === 'success' ? 'success-message' : 'error-message'}>
            {feedbackMessage.text}
          </div>
        )}
      </fieldset>
    </form>
  );
}


// --- 親コンポーネント：ページ全体 ---
function EvaluationPage({ evaluatorName, onLogout }) {
  const [chatData, setChatData] = useState({ prompt: '', response: '', conversationId: '' });
  const [messages, setMessages] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState('ready');

  const handleChatComplete = (data) => {
    setChatData(data);
    setEvaluationStatus('pending');
  };
  
  const handleEvaluationSubmit = () => {
    setEvaluationStatus('submitted');
  };

  const handleNewChat = () => {
    setChatData({ prompt: '', response: '', conversationId: '' });
    setMessages([]);
    setEvaluationStatus('ready');
  };

  const isChatActive = evaluationStatus === 'pending' || evaluationStatus === 'submitted';

  return (
    <div className="evaluation-container">
      <div style={{position: 'absolute', top: '1rem', right: '1.5rem'}}>
          <button onClick={onLogout} style={{backgroundColor: '#aaa', color: '#333'}}>ログアウト</button>
      </div>
      <ChatPanel 
        messages={messages} 
        setMessages={setMessages} 
        onChatComplete={handleChatComplete}
        isChatActive={isChatActive}
      />
      <EvaluationForm 
        chatData={chatData}
        evaluatorName={evaluatorName}
        onEvaluationSubmit={handleEvaluationSubmit}
        onNewChat={handleNewChat}
        evaluationStatus={evaluationStatus}
      />
    </div>
  );
}

export default EvaluationPage;