import { useState } from 'react';

// 11種類に増量した御神籤結果リスト
const LUCK_RESULTS = [
  /* --- 従来の運勢 --- */
  { fortune: '大吉', comment: '運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。' },
  { fortune: '吉', comment: '誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。' },
  { fortune: '中吉', comment: '平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。' },
  { fortune: '小吉', comment: '小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。' },
  { fortune: '末吉', comment: '今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。' },

  /* --- ネット・デジタルならではの運勢（確定枠） --- */
  { fortune: '接続大吉', comment: '通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。' },
  { fortune: '通信吉', comment: '電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。' },
  { fortune: '再起動', comment: '頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。' },

  /* --- 現実の神社にある珍しい運勢（確定枠） --- */
  { fortune: '大吉持', comment: '今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。' },
  { fortune: '平', comment: '良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。' },
  { fortune: '恐', comment: '少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。' }
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
        
        {/* タイトル */}
        <h1 className="text-4xl font-bold text-red-800 my-6 font-serif tracking-widest">御神籤</h1>

        {/* 結果表示エリア */}
        <div className="min-h-[160px] flex flex-col items-center justify-center bg-stone-100 rounded border border-stone-300 p-6 mb-8 shadow-inner">
          {isRolling ? (
            <div className="text-lg font-medium text-red-700 animate-pulse tracking-widest font-serif">
              御神意を伺っております...
            </div>
          ) : result ? (
            <div className="animate-fade-in font-serif">
              {/* 4文字の運勢（接続大集など）でも綺麗に収まるよう、文字サイズを自動調整するクラスにしています */}
              <div className="text-4xl sm:text-5xl font-black text-red-700 mb-4 tracking-widest border-b-2 border-red-700/20 pb-2 px-6 inline-block">
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

      {/* フッター */}
      <footer className="mt-8 text-[10px] text-stone-400 tracking-widest font-serif">
        謹製 仮想空間神社
      </footer>
    </div>
  );
}