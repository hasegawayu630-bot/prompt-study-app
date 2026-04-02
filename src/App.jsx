import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { questions as allQuestions } from './questions';

const BATCH_SIZE = 30;
const BATCH_COUNT = Math.ceil(allQuestions.length / BATCH_SIZE);

const BATCH_LABELS = [
  "第1弾 (Q1〜Q30: JSONと自動化の基礎)",
  "第2弾 (Q31〜Q60: APIと認証の基礎)",
  "第3弾 (Q61〜Q90: 冪等性とエラー制御)",
  "第4弾 (Q91〜Q120: 正規表現とデータ抽出)",
  "第5弾 (Q121〜Q150: OAuthと配列処理)",
  "第6弾 (Q151〜Q180: 高度なJSON構造設計)",
  "第7弾 (Q181〜Q210: AIプロンプトのシステム化)",
  "第8弾 (Q211〜Q240: アーキテクチャと運用思想)",
  "第9弾 (Q241〜Q270: データベースと非同期処理)",
  "第10弾 (Q271〜Q300: 最新インフラと自動化哲学)",
];

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
  const [currentBatch, setCurrentBatch] = useState(0);
  const [retrySessionIds, setRetrySessionIds] = useState([]);

  // バッチ（章）ごとの問題リストを取得
  const getBatchQuestions = (batchIndex) => {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, allQuestions.length);
    return allQuestions.slice(start, end);
  };

  // バッチごとの間違い問題を取得
  const getBatchWrongQuestions = (batchIndex) => {
    const batchQuestions = getBatchQuestions(batchIndex);
    const batchIds = batchQuestions.map(q => q.id);
    return allQuestions.filter(q => batchIds.includes(q.id) && wrongQuestionIds.includes(q.id));
  };

  // 現在のモードに応じた問題リスト
  const currentQuestionList = isRetryMode 
    ? allQuestions.filter(q => retrySessionIds.includes(q.id))
    : getBatchQuestions(currentBatch);

  // Load state from local storage on mount
  useEffect(() => {
    const savedIndex = localStorage.getItem('promptDojo_index');
    const savedScore = localStorage.getItem('promptDojo_score');
    const savedWrongs = localStorage.getItem('promptDojo_wrong_ids');
    const savedRetry = localStorage.getItem('promptDojo_retry_mode');
    const savedBatch = localStorage.getItem('promptDojo_batch');
    const savedRetrySession = localStorage.getItem('promptDojo_retry_session');

    if (savedWrongs) {
      setWrongQuestionIds(JSON.parse(savedWrongs));
    }

    if (savedRetrySession) {
      setRetrySessionIds(JSON.parse(savedRetrySession));
    }

    if (savedBatch !== null) {
      setCurrentBatch(parseInt(savedBatch, 10));
    }

    if (savedRetry === 'true') {
      setIsRetryMode(true);
      if (savedIndex) setCurrentQuestionIndex(parseInt(savedIndex, 10));
    } else {
      if (savedIndex && savedScore) {
        const idx = parseInt(savedIndex, 10);
        setCurrentQuestionIndex(idx);
        setScore(parseInt(savedScore, 10));
        // Check if finished
        const batch = savedBatch !== null ? parseInt(savedBatch, 10) : 0;
        const batchLen = getBatchQuestions(batch).length;
        if (idx >= batchLen) {
          setIsFinished(true);
        }
      }
    }
  }, []);

  const currentQuestion = currentQuestionList[currentQuestionIndex];

  // シャッフル用（Hooksのルールに従い、Topレベルで宣言）
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion || !currentQuestion.options) return [];
    const indices = Array.from({ length: currentQuestion.options.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map(idx => ({
      originalIndex: idx,
      text: currentQuestion.options[idx]
    }));
  }, [currentQuestion?.id]);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleOptionClick = (index) => {
    if (showExplanation) return;

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
        newWrongs = newWrongs.filter(id => id !== questionText.id);
        setWrongQuestionIds(newWrongs);
        localStorage.setItem('promptDojo_wrong_ids', JSON.stringify(newWrongs));
      }
    } else {
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

  const startRetryMode = (batchIndex) => {
    setIsRetryMode(true);
    setCurrentBatch(batchIndex);
    setCurrentQuestionIndex(0);
    setIsFinished(false);
    setSelectedOption(null);
    setShowExplanation(false);
    const wrongsInBatch = getBatchWrongQuestions(batchIndex).map(q => q.id);
    setRetrySessionIds(wrongsInBatch);
    localStorage.setItem('promptDojo_retry_session', JSON.stringify(wrongsInBatch));
    localStorage.setItem('promptDojo_retry_mode', 'true');
    localStorage.setItem('promptDojo_batch', batchIndex);
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
    setCurrentBatch(0);
    setRetrySessionIds([]);
    setIsStarted(true);
    localStorage.removeItem('promptDojo_index');
    localStorage.removeItem('promptDojo_score');
    localStorage.removeItem('promptDojo_wrong_ids');
    localStorage.removeItem('promptDojo_retry_mode');
    localStorage.removeItem('promptDojo_batch');
    localStorage.removeItem('promptDojo_retry_session');
  };

  const resetToHome = () => {
    resetQuiz();
    setIsStarted(false);
  };

  const quitCurrentMode = () => {
    if (isRetryMode) {
      setIsRetryMode(false);
      setIsFinished(true);
      setRetrySessionIds([]);
      localStorage.removeItem('promptDojo_retry_mode');
      localStorage.removeItem('promptDojo_retry_session');
    } else {
      if (window.confirm("現在の進行状況やスコアがリセットされます。中断してトップに戻りますか？")) {
        resetToHome();
      }
    }
  };

  // ====== トップ画面 ======
  if (!isStarted) {
    // 各章ごとの間違い数を計算
    const batchWrongCounts = Array.from({ length: BATCH_COUNT }, (_, i) => getBatchWrongQuestions(i).length);
    const totalWrongs = wrongQuestionIds.length;

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

          {/* 章選択セクション */}
          <div style={{ marginBottom: '25px', backgroundColor: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '1.0rem', marginBottom: '15px', color: '#8b949e' }}>📘 学習を始める章を選ぶ（30問ずつ）</h3>
            <select 
              value={selectedBatch} 
              onChange={(e) => setSelectedBatch(parseInt(e.target.value, 10))}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', marginBottom: '15px', fontSize: '0.95rem' }}
            >
              {BATCH_LABELS.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>
            <button 
              className="primary-btn" 
              onClick={() => {
                setCurrentBatch(selectedBatch);
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedOption(null);
                setShowExplanation(false);
                setIsFinished(false);
                setIsRetryMode(false);
                setIsStarted(true);
                localStorage.setItem('promptDojo_batch', selectedBatch);
                localStorage.setItem('promptDojo_index', 0);
                localStorage.setItem('promptDojo_score', 0);
                localStorage.removeItem('promptDojo_retry_mode');
              }} 
              style={{ width: '100%' }}
            >
              選択した章から新しくスタートする
            </button>
          </div>

          {/* 復習セクション */}
          {totalWrongs > 0 && (
            <div style={{ marginBottom: '25px', backgroundColor: '#1c1410', padding: '20px', borderRadius: '8px', border: '1px solid #d2992244' }}>
              <h3 style={{ fontSize: '1.0rem', marginBottom: '15px', color: '#d29922' }}>🔄 間違えた問題を復習する（全{totalWrongs}問）</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {BATCH_LABELS.map((label, i) => {
                  const wrongCount = batchWrongCounts[i];
                  if (wrongCount === 0) return null;
                  return (
                    <button
                      key={i}
                      className="primary-btn"
                      onClick={() => startRetryMode(i)}
                      style={{ 
                        width: '100%', 
                        backgroundColor: '#d29922', 
                        fontSize: '0.9rem', 
                        padding: '12px 15px',
                        textAlign: 'left'
                      }}
                    >
                      {label.split('(')[0]}— {wrongCount}問を復習
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 続きから再開 */}
          {(localStorage.getItem('promptDojo_index') !== null || localStorage.getItem('promptDojo_score') !== null) && (
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

  // ====== 完了画面 ======
  if (isFinished) {
    const batchLabel = BATCH_LABELS[currentBatch] || `第${currentBatch + 1}弾`;
    const batchWrongCount = getBatchWrongQuestions(currentBatch).length;

    if (isRetryMode && batchWrongCount === 0) {
      return (
        <div className="app-container">
          <header>
            <h1>復習完了！</h1>
          </header>
          <div className="card center-content">
            <h2>素晴らしい！👏</h2>
            <p>{batchLabel.split('(')[0]}の間違い問題をすべてマスターしました。</p>
            <button className="primary-btn" onClick={resetToHome} style={{marginTop: '20px'}}>
              トップ画面に戻る
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-container">
        <header>
          <h1>{isRetryMode ? "復習セッション終了" : `${batchLabel.split('(')[0]}完了！`}</h1>
        </header>
        <div className="card center-content">
          <h2>お疲れ様でした。</h2>
          {!isRetryMode && <p>スコア: {score} / {getBatchQuestions(currentBatch).length}</p>}
          
          {batchWrongCount > 0 && (
            <>
              <p>この章でまだマスターしていない問題が {batchWrongCount} 問あります。</p>
              <button className="primary-btn" onClick={() => startRetryMode(currentBatch)} style={{marginTop: '20px', backgroundColor: '#d29922'}}>
                この章の間違いを復習する
              </button>
            </>
          )}
          {batchWrongCount === 0 && !isRetryMode && (
            <p>この章は全問正解です！完璧です。🎉</p>
          )}

          <button className="primary-btn" onClick={resetToHome} style={{marginTop: '15px', backgroundColor: '#58a6ff'}}>
            トップ画面に戻る（別の章を選ぶ）
          </button>
        </div>
      </div>
    );
  }

  // ====== 問題がない場合 ======
  if (currentQuestionList.length === 0) {
    return (
      <div className="app-container">
        <div className="card center-content">
          <h2>この章に間違えた問題はありません 🎉</h2>
          <button className="primary-btn" onClick={resetToHome} style={{marginTop: '20px'}}>
            トップ画面に戻る
          </button>
        </div>
      </div>
    );
  }

  // ====== クイズ画面 ======
  
  if (!currentQuestion) {
    // データ不整合時の安全フォールバック（クラッシュ防止）
    return (
      <div className="app-container">
        <div className="card center-content">
          <h2>データの読み込みに失敗しました</h2>
          <button className="primary-btn" onClick={resetToHome} style={{marginTop: '20px'}}>
            トップ画面に戻る
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex) / currentQuestionList.length) * 100;
  const batchLabel = BATCH_LABELS[currentBatch] || `第${currentBatch + 1}弾`;

  return (
    <div className="app-container">
      <header>
        <h1>{isRetryMode ? `復習モード` : `${batchLabel.split('(')[0].trim()}`}</h1>
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
          {isRetryMode ? `復習 Q${currentQuestion.id}` : `Q${currentQuestion.id}`} : {currentQuestion.title}
        </div>
        <div className="question-text">{currentQuestion.question}</div>
        
        <div className="options-list">
          {shuffledOptions.map((opt, index) => {
            let btnClass = "option-btn";
            if (showExplanation) {
              if (opt.originalIndex === currentQuestion.correctAnswer) {
                btnClass += " correct";
              } else if (opt.originalIndex === selectedOption) {
                btnClass += " wrong";
              }
            }
            return (
              <button 
                key={index} 
                className={btnClass}
                onClick={() => handleOptionClick(opt.originalIndex)}
                disabled={showExplanation}
              >
                {opt.text}
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
          {isRetryMode ? "復習を中断してトップに戻る" : "学習を中断してトップに戻る"}
        </a>
      </div>
    </div>
  );
}

export default App;
