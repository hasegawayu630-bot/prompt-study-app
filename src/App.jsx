import { useState, useEffect } from 'react';
import './App.css';
import { questions as allQuestions } from './questions';

function App() {
  const [isStarted, setIsStarted] = useState(() => {
    const hasProgress = localStorage.getItem('promptDojo_index') !== null || 
                        localStorage.getItem('promptDojo_retry_mode') === 'true' ||
                        localStorage.getItem('promptDojo_score') !== null;
    return hasProgress;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState([]);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(0);

  // Filter questions based on mode
  const currentQuestionList = isRetryMode 
    ? allQuestions.filter(q => wrongQuestionIds.includes(q.id))
    : allQuestions;

  // Load state from local storage on mount
  useEffect(() => {
    const savedIndex = localStorage.getItem('promptDojo_index');
    const savedScore = localStorage.getItem('promptDojo_score');
    const savedWrongs = localStorage.getItem('promptDojo_wrong_ids');
    const savedRetry = localStorage.getItem('promptDojo_retry_mode');

    if (savedWrongs) {
      setWrongQuestionIds(JSON.parse(savedWrongs));
    }

    if (savedRetry === 'true') {
      setIsRetryMode(true);
      if (savedIndex) setCurrentQuestionIndex(parseInt(savedIndex, 10));
    } else {
      if (savedIndex && savedScore) {
        const idx = parseInt(savedIndex, 10);
        if (idx < allQuestions.length) {
          setCurrentQuestionIndex(idx);
          setScore(parseInt(savedScore, 10));
        } else {
          setIsFinished(true);
          setScore(parseInt(savedScore, 10));
        }
      }
    }
  }, []);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleOptionClick = (index) => {
    if (showExplanation) return; // Prevent clicking after selection

    setSelectedOption(index);
    setShowExplanation(true);

    const questionText = currentQuestionList[currentQuestionIndex];
    const isCorrect = index === questionText.correctAnswer;
    
    let newScore = score;
    let newWrongs = [...wrongQuestionIds];

    if (isCorrect) {
      if (!isRetryMode) {
        newScore += 1;
        setScore(newScore);
        localStorage.setItem('promptDojo_score', newScore);
      } else {
        // Remove from wrongs if answered correctly in retry mode
        newWrongs = newWrongs.filter(id => id !== questionText.id);
        setWrongQuestionIds(newWrongs);
        localStorage.setItem('promptDojo_wrong_ids', JSON.stringify(newWrongs));
      }
    } else {
      // If wrong, add to wrongs (if not already there)
      if (!newWrongs.includes(questionText.id)) {
        newWrongs.push(questionText.id);
        setWrongQuestionIds(newWrongs);
        localStorage.setItem('promptDojo_wrong_ids', JSON.stringify(newWrongs));
      }
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setSelectedOption(null);
    setShowExplanation(false);

    if (nextIndex < currentQuestionList.length) {
      setCurrentQuestionIndex(nextIndex);
      localStorage.setItem('promptDojo_index', nextIndex);
    } else {
      setIsFinished(true);
      localStorage.setItem('promptDojo_index', nextIndex);
    }
  };

  const startRetryMode = () => {
    setIsRetryMode(true);
    setCurrentQuestionIndex(0);
    setIsFinished(false);
    setSelectedOption(null);
    setShowExplanation(false);
    localStorage.setItem('promptDojo_retry_mode', 'true');
    localStorage.setItem('promptDojo_index', 0);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsFinished(false);
    setIsRetryMode(false);
    setWrongQuestionIds([]);
    setIsStarted(true); // Go back to question 1, skipping the welcome screen
    localStorage.removeItem('promptDojo_index');
    localStorage.removeItem('promptDojo_score');
    localStorage.removeItem('promptDojo_wrong_ids');
    localStorage.removeItem('promptDojo_retry_mode');
  };

  const resetToHome = () => {
    resetQuiz();
    setIsStarted(false); // Back to very beginning
  };

  const quitCurrentMode = () => {
    if (isRetryMode) {
      // 復習モードを中断して、リザルト画面へ戻る
      setIsRetryMode(false);
      setIsFinished(true);
      localStorage.removeItem('promptDojo_retry_mode');
    } else {
      // 通常モードを諦めてトップへ戻る
      if (window.confirm("現在の進行状況やスコアがリセットされます。中断してトップに戻りますか？")) {
        resetToHome();
      }
    }
  };

  if (!isStarted) {
    return (
      <div className="app-container">
        <header>
          <h1>自動化・AI連携マスターアプリ</h1>
        </header>
        <div className="card" style={{ padding: '30px 20px', animation: 'fadeIn 0.5s ease-out' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '25px', color: 'var(--accent-color)' }}>
            なぜこれらの技術を学ぶのか？
          </h2>
          
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>🌐 JSONと通信の基礎（API）</h3>
            <p style={{ fontSize: '0.95rem', color: '#c9d1d9', lineHeight: '1.6' }}>
              kintoneやn8nなど、ほぼすべてのツールは「JSON」という共通言語と「API（GET/POSTなど）」の通信ルールでシステム連携をしています。<br />
              これを理解するだけで、<strong>プログラマーに依存せずに「システム同士を自動で繋ぐ橋渡し役」</strong>になれます。
            </p>
          </div>

          <div style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>🤖 プロンプトと正規表現の使い分け</h3>
            <p style={{ fontSize: '0.95rem', color: '#c9d1d9', lineHeight: '1.6' }}>
              単にAIと話すだけでなく、<strong>「絶対にシステムをエラーで止めない正確な指示（プロンプト）」</strong>や、AIに頼らずに100%データを抜く「正規表現」を学ぶことで、AI全盛時代における「真の業務設計士」としての市場価値が爆発的に高まります。
            </p>
          </div>

          <div style={{ marginBottom: '25px', backgroundColor: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '1.0rem', marginBottom: '15px', color: '#8b949e' }}>▼ 学習を始める章を選ぶ（30問ずつ）</h3>
            <select 
              value={selectedBatch} 
              onChange={(e) => setSelectedBatch(parseInt(e.target.value, 10))}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', marginBottom: '15px', fontSize: '0.95rem' }}
            >
              <option value={0}>第1弾 (Q1〜Q30: JSONと自動化の基礎)</option>
              <option value={1}>第2弾 (Q31〜Q60: APIと認証の基礎)</option>
              <option value={2}>第3弾 (Q61〜Q90: 冪等性とエラー制御)</option>
              <option value={3}>第4弾 (Q91〜Q120: 正規表現とデータ抽出)</option>
              <option value={4}>第5弾 (Q121〜Q150: OAuthと配列処理)</option>
              <option value={5}>第6弾 (Q151〜Q180: 高度なJSON構造設計)</option>
              <option value={6}>第7弾 (Q181〜Q210: AIプロンプトのシステム化)</option>
              <option value={7}>第8弾 (Q211〜Q240: アーキテクチャと運用思想)</option>
              <option value={8}>第9弾 (Q241〜Q270: データベースと非同期処理)</option>
              <option value={9}>第10弾 (Q271〜Q300: 最新インフラと自動化哲学)</option>
            </select>
            <button 
              className="primary-btn" 
              onClick={() => {
                const startIndex = selectedBatch * 30;
                setCurrentQuestionIndex(startIndex);
                setScore(0);
                setSelectedOption(null);
                setShowExplanation(false);
                setIsFinished(false);
                setIsRetryMode(false);
                setWrongQuestionIds([]);
                setIsStarted(true);
                localStorage.setItem('promptDojo_index', startIndex);
                localStorage.setItem('promptDojo_score', 0);
                localStorage.removeItem('promptDojo_wrong_ids');
                localStorage.removeItem('promptDojo_retry_mode');
              }} 
              style={{ width: '100%' }}
            >
              選択した章から新しくスタートする
            </button>
          </div>

          {(localStorage.getItem('promptDojo_index') !== null || localStorage.getItem('promptDojo_score') !== null || localStorage.getItem('promptDojo_wrong_ids') !== null) && (
            <button 
              className="primary-btn" 
              onClick={handleStart} 
              style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}
            >
              前回の学習データの続きから再開する
            </button>
          )}

        </div>
      </div>
    );
  }

  if (isFinished) {
    if (isRetryMode && wrongQuestionIds.length === 0) {
      return (
        <div className="app-container">
          <header>
            <h1>復習完了！</h1>
          </header>
          <div className="card center-content">
            <h2>素晴らしい！👏</h2>
            <p>間違えた問題をすべてマスターしました。</p>
            <button className="primary-btn" onClick={resetQuiz} style={{marginTop: '20px'}}>
              全体を最初からやり直す
            </button>
            <div style={{marginTop: '25px'}}>
              <a href="#" onClick={(e) => { e.preventDefault(); resetToHome(); }} style={{color: 'var(--accent-color)', fontSize: '0.9rem', textDecoration: 'none'}}>トップ画面（解説）に戻る</a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app-container">
        <header>
          <h1>{isRetryMode ? "復習セッション終了" : "学習完了！"}</h1>
        </header>
        <div className="card center-content">
          <h2>お疲れ様でした。</h2>
          {!isRetryMode && <p>あなたのスコア: {score} / {allQuestions.length}</p>}
          {wrongQuestionIds.length > 0 ? (
            <p>まだマスターしていない問題が {wrongQuestionIds.length} 問あります。</p>
          ) : (
            <p>全問正解です！完璧です。</p>
          )}

          {wrongQuestionIds.length > 0 && (
            <button className="primary-btn" onClick={startRetryMode} style={{marginTop: '20px', backgroundColor: '#d29922'}}>
              間違えた問題を復習する
            </button>
          )}

          <button className="primary-btn" onClick={resetQuiz} style={{marginTop: '20px', marginLeft: '10px', backgroundColor: '#58a6ff'}}>
            最初からやり直す
          </button>

          <div style={{marginTop: '25px'}}>
            <a href="#" onClick={(e) => { e.preventDefault(); resetToHome(); }} style={{color: 'var(--accent-color)', fontSize: '0.9rem', textDecoration: 'none'}}>トップ画面（解説）に戻る</a>
          </div>
        </div>
      </div>
    );
  }

  // If there are no questions in retry mode (edge case)
  if (currentQuestionList.length === 0) {
    return <div className="app-container">読み込み中...</div>;
  }

  const currentQuestion = currentQuestionList[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / currentQuestionList.length) * 100;

  return (
    <div className="app-container">
      <header>
        <h1>{isRetryMode ? "復習モード" : "自動化・AI連携マスター"}</h1>
        <div className="score-display">
          問題 {currentQuestionIndex + 1} / {currentQuestionList.length} 
          {!isRetryMode && ` | スコア: ${score}`}
        </div>
      </header>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercentage}%`, backgroundColor: isRetryMode ? '#d29922' : 'var(--accent-color)' }}></div>
      </div>

      <div className="card">
        <div className="question-title">
          {isRetryMode ? `復習問題 ID:${currentQuestion.id}` : `Stage ${currentQuestionIndex + 1}`} : {currentQuestion.title}
        </div>
        <div className="question-text">{currentQuestion.question}</div>
        
        <div className="options-list">
          {currentQuestion.options.map((option, index) => {
            let btnClass = "option-btn";
            if (showExplanation) {
              if (index === currentQuestion.correctAnswer) {
                btnClass += " correct";
              } else if (index === selectedOption) {
                btnClass += " wrong";
              }
            }
            return (
              <button 
                key={index} 
                className={btnClass}
                onClick={() => handleOptionClick(index)}
                disabled={showExplanation}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="explanation-box">
            <h4>{selectedOption === currentQuestion.correctAnswer ? "⭕ 正解！" : "❌ 不正解"}</h4>
            <p>{currentQuestion.explanation}</p>
            <button className="next-btn" onClick={handleNextQuestion} style={{backgroundColor: isRetryMode ? '#d29922' : 'var(--accent-color)'}}>
              次の問題へ
            </button>
          </div>
        )}
      </div>

      <div style={{textAlign: 'center', marginTop: '10px', paddingBottom: '20px'}}>
        <a href="#" onClick={(e) => { e.preventDefault(); quitCurrentMode(); }} style={{color: '#8b949e', fontSize: '0.9rem', textDecoration: 'underline'}}>
          {isRetryMode ? "復習を中断してスコア画面に戻る" : "学習を中断してトップに戻る"}
        </a>
      </div>
    </div>
  );
}

export default App;
