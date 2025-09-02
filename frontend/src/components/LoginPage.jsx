// src/components/LoginPage.jsx
import { useState, useEffect } from 'react'; // useEffectをインポート
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function LoginPage({ onLoginSuccess }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluators, setEvaluators] = useState([]); // 評価者リストを保持するstate
  const [error, setError] = useState('');

  // ページ読み込み時にバックエンドから評価者リストを取得
  useEffect(() => {
    const fetchEvaluators = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/evaluators`);
        setEvaluators(response.data.evaluators);
        // リストの先頭をデフォルト選択にする
        if (response.data.evaluators.length > 0) {
          setEvaluatorName(response.data.evaluators[0]);
        }
      } catch (err) {
        console.error("評価者リストの取得に失敗しました:", err);
        setError("評価者リストを取得できませんでした。");
      }
    };
    fetchEvaluators();
  }, []); // 空の配列を渡して、初回レンダリング時のみ実行

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!evaluatorName) {
      setError("評価者を選択してください。");
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/login`, {
        user_id: userId,
        password: password,
      });
      onLoginSuccess(evaluatorName);
    } catch (err) {
      setError('IDまたはパスワードが正しくありません。');
    }
  };

  return (
    <div className="login-container">
      <h2>評価アプリ ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="evaluatorName">評価者名 *</label>
          {/* ↓ inputからselectに変更 */}
          <select
            id="evaluatorName"
            value={evaluatorName}
            onChange={(e) => setEvaluatorName(e.target.value)}
            required
          >
            <option value="" disabled>選択してください</option>
            {evaluators.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="userId">共通ID</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">共通パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}

export default LoginPage;