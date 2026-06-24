import { useState } from 'react';

// おみくじの結果のリスト
const LUCK_RESULTS = [
  { fortune: '🌟 超大吉', comment: '最高の一日！何をやってもうまくいきます。宝くじを買うなら今かも？' },
  { fortune: '🎉 大吉', comment: '素晴らしい運気です。笑顔で過ごすとさらにハッピーが舞い込みます。' },
  { fortune: '✨ 吉', comment: '手堅く良い一日。お気に入りの音楽を聴くと運気がさらにアップ！' },
  { fortune: '🍀 中吉', comment: '穏やかな幸運に恵まれます。いつもよりちょっといいランチを食べてみては？' },
  { fortune: '🎵 小吉', comment: '小さなラッキーが見つかる日。落とし物や忘れ物には少し注意。' },
  { fortune: '🍵 末吉', comment: 'のんびり過ごすのが吉。温かいお茶でも飲んでホッと一息つきましょう。' },
];

export default function App() {
  // おみくじの結果を保存するReactの状態（ステート）
  const [result, setResult] = useState<{ fortune: string; comment: string } | null>(null);
  // ボタンが押されて「シャッフル中」の演出用
  const [isRolling, setIsRolling] = useState(false);

  // おみくじを引く関数
  const drawOmikuji = () => {
    setIsRolling(true);
    
    // 0.5秒だけ「考え中…」の演出を入れてから結果を出す
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * LUCK_RESULTS.length);
      setResult(LUCK_RESULTS[randomIndex]);
      setIsRolling(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-4 border-red-500 text-center relative overflow-hidden">
        
        {/* 和風の飾り枠風デザイン */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <h1 className="text-3xl font-bold text-red-600 mb-2 font-serif">✨ 令和おみくじ ✨</h1>
        <p className="text-slate-500 text-sm mb-8">今日のあなたの運勢を占います</p>

        {/* 結果表示エリア */}
        <div className="min-h-[160px] flex flex-col items-center justify-center bg-amber-50/50 rounded-xl p-4 mb-8 border border-amber-200">
          {isRolling ? (
            <div className="text-xl font-bold text-amber-600 animate-bounce">
              🔮 運命をシャッフル中...
            </div>
          ) : result ? (
            <div className="animate-fade-in">
              <div className="text-4xl font-extrabold text-red-500 mb-3 drop-shadow-sm">
                {result.fortune}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed px-4">
                {result.comment}
              </p>
            </div>
          ) : (
            <div className="text-slate-400 italic">
              下のボタンを押して、おみくじを引いてね！
            </div>
          )}
        </div>

        {/* おみくじを引くボタン */}
        <button
          onClick={drawOmikuji}
          disabled={isRolling}
          className={`w-full py-4 px-6 text-lg font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 ${
            isRolling 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
          }`}
        >
          {result ? 'もう一度引く' : 'おみくじを引く！'}
        </button>
      </div>

      <footer className="mt-8 text-xs text-slate-400">
        © my-vite-app Omikuji App
      </footer>
    </div>
  );
  } //