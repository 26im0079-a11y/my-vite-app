import { useState } from 'react';

// 神社風のおみくじ結果リスト
const LUCK_RESULTS = [
  { fortune: '大吉', comment: '運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。' },
  { fortune: '吉', comment: '誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。' },
  { fortune: '中吉', comment: '平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。' },
  { fortune: '小吉', comment: '小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。' },
  { fortune: '末吉', comment: '今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。' },
];

export default function App() {
  const [result, setResult] = useState<{ fortune: string; comment: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const drawOmikuji = () => {
    setIsRolling(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * LUCK_RESULTS.length);
      setResult(LUCK_RESULTS[randomIndex]);
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 text-stone-900">
      {/* 全体の枠組み */}
      <div className="max-w-md w-full bg-stone-50 rounded-lg shadow-2xl p-8 border-4 border-red-700 text-center relative overflow-hidden">
        
        {/* 朱色のライン */}
        <div className="absolute top-0 left-0 w-full h-3 bg-red-700"></div>
        
        {/* 「御神籤」のみにスッキリと変更、余白を調整 */}
        <h1 className="text-4xl font-bold text-red-800 my-6 font-serif tracking-widest">御神籤</h1>

        {/* 結果表示エリア */}
        <div className="min-h-[160px] flex flex-col items-center justify-center bg-stone-100 rounded border border-stone-300 p-6 mb-8 shadow-inner">
          {isRolling ? (
            <div className="text-lg font-medium text-red-700 animate-pulse tracking-widest font-serif">
              御神意を伺っております...
            </div>
          ) : result ? (
            <div className="animate-fade-in font-serif">
              <div className="text-5xl font-black text-red-700 mb-4 tracking-widest border-b-2 border-red-700/20 pb-2 px-8 inline-block">
                {result.fortune}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed text-left px-2 font-sans tracking-wide">
                {result.comment}
              </p>
            </div>
          ) : (
            <div className="text-stone-400 text-sm tracking-wider font-serif">
              心静かに下の釦をお押しください
            </div>
          )}
        </div>

        {/* おみくじを引くボタン */}
        <button
          onClick={drawOmikuji}
          disabled={isRolling}
          className={`w-full py-4 px-6 text-lg font-bold text-stone-100 rounded shadow-md transition-all duration-300 active:scale-98 tracking-widest font-serif ${
            isRolling 
              ? 'bg-stone-400 cursor-not-allowed' 
              : 'bg-red-800 hover:bg-red-900 hover:shadow-lg'
          }`}
        >
          {result ? '再び紐解く' : 'おみくじを引く'}
        </button>
      </div>

       {/* ここを「謹製 仮想空間神社」に書き換えます */}
      <footer className="mt-8 text-[10px] text-stone-400 tracking-widest font-serif">
        謹製 仮想空間神社
      </footer>
    </div>
  );
}