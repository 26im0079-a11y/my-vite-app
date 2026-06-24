import { useState, useEffect } from 'react';

// 運勢データ（日本語版・英語版）
const LUCK_DATA = [
  {
    fortuneJa: '大吉', fortuneEn: 'Great Good Luck', weight: 5,
    commentsJa: [
      '運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。',
      '暗闇に一筋の光明が差す如く、すべての迷いが消え去る日。自信を持って前へ進むべし。'
    ],
    commentsEn: [
      'Your luck is at its peak; it is the perfect time for anything. Gratitude brings more blessings.',
      'Like a bright light piercing the darkness, all doubts vanish. Step forward with confidence.'
    ]
  },
  {
    fortuneJa: '吉', fortuneEn: 'Good Luck', weight: 15,
    commentsJa: [
      '誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。',
      '地道なる歩みが実を結ぶ日なり。派手さはなくとも、確実な一歩が将来の吉を呼ぶ。'
    ],
    commentsEn: [
      'Act with a sincere heart, and your path will open naturally. Wait patiently without rushing.',
      'Steady progress bears fruit today. A quiet but sure step will lead to future success.'
    ]
  },
  {
    fortuneJa: '中吉', fortuneEn: 'Middle Luck', weight: 12,
    commentsJa: [
      '平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。',
      '日常の中に小さな奇跡が隠されている日。空の美しさや風の心地よさに目を向けるが吉。'
    ],
    commentsEn: [
      'Signs of peaceful happiness. Value harmony and show kindness to those around you.',
      'A day filled with small everyday miracles. Look up at the sky and feel the gentle breeze.'
    ]
  },
  {
    fortuneJa: '小吉', fortuneEn: 'Small Luck', weight: 10,
    commentsJa: [
      '小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。',
      '忘れ物や落とし物に少し注意が必要。出かける前の指差し確認が、災いを未然に防ぐ。'
    ],
    commentsEn: [
      'Small joys accumulate today. Stay alert and tread carefully to avoid minor mistakes.',
      'Be mindful of misplaced items. Checking your belongings before leaving prevents trouble.'
    ]
  },
  {
    fortuneJa: '末吉', fortuneEn: 'Future Luck', weight: 8,
    commentsJa: [
      '今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。',
      '物事の始まりは遅けれど、後から徐々に良くなる運気。焦りは禁物、時をじっくり待て。'
    ],
    commentsEn: [
      'Now is the time to build your strength. Stay calm, drink warm tea, and rest well.',
      'Things may start slowly, but luck improves over time. Do not rush; wait for the right moment.'
    ]
  },
  {
    fortuneJa: '接続大吉', fortuneEn: 'Max Connection Luck', weight: 6,
    commentsJa: [
      '通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。',
      '遮るものなき高速回線の如く、滞っていた作業が一気に片付く。集中力みなぎる日なり。'
    ],
    commentsEn: [
      'Network speed is soaring; videos load instantly. All connections and relationships thrive.',
      'Like an unhindered high-speed line, delayed tasks clear up instantly. Focus is unlocked.'
    ]
  },
  {
    fortuneJa: '通信吉', fortuneEn: 'Stable Connection Luck', weight: 15,
    commentsJa: [
      '電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。',
      'Wi-Fiの繋がりが安定する如く、穏やかで途切れのない安心した時間を過ごせる一日。'
    ],
    commentsEn: [
      'Excellent signal strength. An unexpected, heartwarming message may pop up on your screen.',
      'Just like a stable Wi-Fi connection, enjoy a calm, uninterrupted, and peaceful day.'
    ]
  },
  {
    fortuneJa: '再起動', fortuneEn: 'System Reboot', weight: 7,
    commentsJa: [
      '頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。',
      '不要な記憶を捨てる時。古いこだわりを一度手放せば、新しい福が入り込む。'
    ],
    commentsEn: [
      'If your mind feels heavy, take a long sleep. Refresh your body and soul to reboot your luck.',
      'Time to clear your cache. Let go of old obsessions to make room for new blessings.'
    ]
  },
  {
    fortuneJa: '大吉持', fortuneEn: 'Loading Great Luck', weight: 5,
    commentsJa: [
      '今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。',
      '種が地中でじっと芽吹くのを待つ如き時。焦らずに水をやり続ければ、やがて大輪の花が開かん。'
    ],
    commentsEn: [
      'Current luck is average, but it is loading a massive blessing. A late-bloomer sign.',
      'Like a seed waiting underground. Keep watering it patiently, and a great flower will bloom.'
    ]
  },
  {
    fortuneJa: '平', fortuneEn: 'Status Quo', weight: 5,
    commentsJa: [
      '良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。',
      '今日という日は、次の大冒険のためのセーブポイントなり。心穏やかに体力を温存せよ。'
    ],
    commentsEn: [
      'Neither good nor bad, just a peaceful day. Appreciate the comfort of an ordinary day.',
      'Consider today a "save point" before your next big adventure. Relax and conserve energy.'
    ]
  },
  {
    fortuneJa: '恐', fortuneEn: 'System Error', weight: 2,
    commentsJa: [
      '少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。',
      '注意力が散漫になりやすい兆し。大事な書類の確認や、パスワードの管理は念入りに行うべし。'
    ],
    commentsEn: [
      'A day to tread with caution. Avoid starting new things and stick to your usual routine.',
      'Focus may drift today. Double-check important documents and manage passwords carefully.'
    ]
  }
];

// 吉兆の色＆物
const LUCKY_COLORS_JA = ['漆黒', '朱赤', '瑠璃色', '黄金色', '白', '黒', '赤', '青'];
const LUCKY_COLORS_EN = ['Jet Black', 'Vermilion Red', 'Lapis Lazuli', 'Pure Gold', 'White', 'Black', 'Red', 'Blue'];
const LUCKY_ITEMS_JA = ['LANケーブル', '温かい緑茶', 'ハンカチ', 'ティッシュ', 'ボールペン', 'イヤホン'];
const LUCKY_ITEMS_EN = ['LAN Cable', 'Warm Green Tea', 'Handkerchief', 'Tissue', 'Ballpoint Pen', 'Earphones'];

export default function App() {
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  const [result, setResult] = useState<{ fortune: string; comment: string; color: string; item: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [visitDate, setVisitDate] = useState<string>('');
  const [history, setHistory] = useState<{ [key: string]: number }>({});

  // 📥 アプリ起動時にLocalStorageから過去の履歴を読み込む
  useEffect(() => {
    const savedHistory = localStorage.getItem('omikuji_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const playSound = (type: 'roll' | 'success') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'roll') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      } else {
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      }
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } catch (e) { console.log(e); }
  };

  const drawOmikuji = () => {
    setIsRolling(true);
    playSound('roll');
    
    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    
    // 日付表記の作成
    const dateStr = lang === 'ja' 
      ? `令和${today.getFullYear() - 2018}年${today.getMonth() + 1}月${today.getDate()}日`
      : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setVisitDate(dateStr);

    setTimeout(() => {
      // 🎯 確率の重み計算
      const totalWeight = LUCK_DATA.reduce((sum, item) => sum + item.weight, 0);
      let randomNum = Math.floor(Math.random() * totalWeight);
      
      let selectedGroup = LUCK_DATA[0];
      for (const group of LUCK_DATA) {
        if (randomNum < group.weight) { selectedGroup = group; break; }
        randomNum -= group.weight;
      }

      // 1. 基本のお告げと運勢を取得
      let fortune = lang === 'ja' ? selectedGroup.fortuneJa : selectedGroup.fortuneEn;
      const idx = Math.floor(Math.random() * selectedGroup.commentsJa.length);
      let comment = lang === 'ja' ? selectedGroup.commentsJa[idx] : selectedGroup.commentsEn[idx];

      // 2. ⏰ 11:11 などのゾロ目特殊判定
      if (hours === 11 && minutes === 11) {
        fortune = lang === 'ja' ? '星連大吉' : 'Synchronicity Luck';
        comment = lang === 'ja' 
          ? '【11:11の奇跡】時計の数字が美しく一直線に並ぶ奇跡の瞬間なり。全てのノイズが消え去り、あなたの願いが最速で宇宙（サーバー）に届く大吉兆なり！'
          : '【11:11 Miracle】The numbers line up perfectly. All noise vanishes, and your wishes are delivered to the universe at maximum speed!';
      } else {
        // 3. ☀️ 🌆 🌙 時間帯による拡張メッセージの自動ドッキング
        if (hours >= 5 && hours < 10) {
          comment += lang === 'ja' ? '（朝一番の澄んだ電波の如く、清々しい出発となるでしょう。）' : ' (Like a fresh morning signal, your day starts clear and bright.)';
        } else if (hours >= 17 && hours < 24) {
          comment += lang === 'ja' ? '（夜更かしはバグの元なり。早めの休止を心がけるが吉。）' : ' (Late nights cause system bugs. Resting early brings good fortune.)';
        }
      }

      // 吉兆の色・物
      const colorIdx = Math.floor(Math.random() * LUCKY_COLORS_JA.length);
      const itemIdx = Math.floor(Math.random() * LUCKY_ITEMS_JA.length);
      const color = lang === 'ja' ? LUCKY_COLORS_JA[colorIdx] : LUCKY_COLORS_EN[colorIdx];
      const item = lang === 'ja' ? LUCKY_ITEMS_JA[itemIdx] : LUCKY_ITEMS_EN[itemIdx];

      setResult({ fortune, comment, color, item });
      setIsRolling(false);
      playSound('success');

      // 📊 履歴の保存処理（日本語の運勢名で統一してカウント保持）
      const historyKey = selectedGroup.fortuneJa;
      const newHistory = { ...history, [historyKey]: (history[historyKey] || 0) + 1 };
      setHistory(newHistory);
      localStorage.setItem('omikuji_history', JSON.stringify(newHistory));
    }, 600);
  };

  return (
    <div 
      className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 text-stone-900 select-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(139, 92, 26, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 26, 0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* 🌐 言語切り替えボタン */}
      <button 
        onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
        className="absolute top-4 left-4 bg-stone-200 border border-stone-400 text-xs px-3 py-1.5 rounded hover:bg-stone-300 font-serif shadow-sm transition-all"
      >
        {lang === 'ja' ? '🌐 English' : '🌐 日本語'}
      </button>

      <div className="max-w-md w-full bg-stone-50 rounded-lg shadow-2xl p-8 border-4 border-red-700 text-center relative overflow-hidden mt-8">
        <div className="absolute top-0 left-0 w-full h-3 bg-red-700"></div>
        
        {visitDate && (
          <div className="text-[11px] text-stone-500 font-serif tracking-widest absolute top-5 right-6">
            {visitDate} {lang === 'ja' ? '参拝' : 'Visited'}
          </div>
        )}

        <h1 className="text-4xl font-bold text-red-800 my-6 font-serif tracking-widest">
          {lang === 'ja' ? '御神籤' : 'OMIKUJI'}
        </h1>

        <div className="min-h-[220px] flex flex-col items-center justify-center bg-stone-100 rounded border border-stone-300 p-6 mb-8 shadow-inner">
          {isRolling ? (
            <div className="text-lg font-medium text-red-700 animate-pulse tracking-widest font-serif">
              {lang === 'ja' ? '御神意を伺っております...' : 'Consulting the divine status...'}
            </div>
          ) : result ? (
            <div className="animate-fade-in font-serif w-full">
              <div className="text-3xl sm:text-4xl font-black text-red-700 mb-4 tracking-widest border-b-2 border-red-700/20 pb-2 px-4 inline-block">
                {result.fortune}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed text-left px-2 font-sans tracking-wide mb-4">
                {result.comment}
              </p>
              
              <div className="border-t border-dashed border-stone-300 pt-3 mt-2 text-xs font-serif text-stone-600 bg-stone-50/50 py-3 rounded flex flex-col gap-1 px-4 text-left">
                <div><span className="text-red-700 font-bold">{lang === 'ja' ? '吉兆の色：' : 'Lucky Color: '}</span>{result.color}</div>
                <div><span className="text-red-700 font-bold">{lang === 'ja' ? '吉兆の物：' : 'Lucky Item: '}</span>{result.item}</div>
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-sm tracking-wider font-serif">
              {lang === 'ja' ? '心静かに下の釦をお押しください' : 'Quiet your mind and press the button below'}
            </div>
          )}
        </div>

        <button
          onClick={drawOmikuji}
          disabled={isRolling}
          className={`w-full py-4 px-6 text-lg font-bold text-stone-100 rounded shadow-md transition-all duration-300 active:scale-98 tracking-widest font-serif ${
            isRolling ? 'bg-stone-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-900'
          }`}
        >
          {result 
            ? (lang === 'ja' ? '再び紐解く' : 'Draw Again') 
            : (lang === 'ja' ? 'おみくじを引く' : 'Draw Fortune')}
        </button>
      </div>

      {/* 📊 おみくじ帳（コレクション履歴機能） */}
      <div className="max-w-md w-full mt-6 bg-stone-50 rounded border border-stone-300 p-4 shadow-md font-serif text-center">
        <h3 className="text-xs font-bold text-stone-600 tracking-wider border-b border-stone-200 pb-1.5 mb-2.5">
          {lang === 'ja' ? '仮想御朱印' : 'Your Fortune Log'}
        </h3>
        {Object.keys(history).length === 0 ? (
          <p className="text-[11px] text-stone-400 italic">
            {lang === 'ja' ? 'まだ参拝履歴がありません' : 'No history yet.'}
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-1.5 text-[10px]">
            {Object.entries(history).map(([luck, count]) => (
              <span key={luck} className="bg-red-50 text-red-800 border border-red-200/60 rounded px-2 py-0.5 shadow-sm">
                {luck} : <strong className="text-xs font-sans">{count}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-6 text-[10px] text-stone-400 tracking-widest font-serif">
        謹製 仮想空間神社 / Virtual Shrine
      </footer>
    </div>
  );
}