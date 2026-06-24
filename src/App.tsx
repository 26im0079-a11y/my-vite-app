import { useState, useEffect } from 'react';

// 運勢データ（格式順に定義）
const LUCK_DATA = [
  { fortuneJa: '大吉', fortuneEn: 'Great Good Luck', weight: 5, btnJa: '福を重ねる', btnEn: 'Multiply Blessings', commentsJa: ['運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。', '暗闇に一筋の光明が差す如く、すべての迷いが消え去る日。自信を持って前へ進むべし。'], commentsEn: ['Your luck is at its peak; it is the perfect time for anything. Gratitude brings more blessings.', 'Like a bright light piercing the darkness, all doubts vanish. Step forward with confidence.'] },
  { fortuneJa: '吉', fortuneEn: 'Good Luck', weight: 15, btnJa: '吉を広げる', btnEn: 'Expand Good Fortune', commentsJa: ['誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。', '地道なる歩みが実を結ぶ日なり。派手さはなくとも、確実な一歩が将来の吉を呼ぶ。'], commentsEn: ['Act with a sincere heart, and your path will open naturally. Wait patiently without rushing.', 'Steady progress bears fruit today. A quiet but sure step will lead to future success.'] },
  { fortuneJa: '中吉', fortuneEn: 'Middle Luck', weight: 12, btnJa: '縁を結ぶ', btnEn: 'Nurture Harmony', commentsJa: ['平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。', '日常の中に小さな奇跡が隠されている日。空の美しさや風の心地よさに目を向けるが吉。'], commentsEn: ['Signs of peaceful happiness. Value harmony and show kindness to those around you.', 'A day filled with small everyday miracles. Look up at the sky and feel the gentle breeze.'] },
  { fortuneJa: '小吉', fortuneEn: 'Small Luck', weight: 10, btnJa: '歩みを進める', btnEn: 'Step Forward', commentsJa: ['小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。', '忘れ物や落とし物に少し注意が必要。出かける前の指差し確認が、災いを未然に防ぐ。'], commentsEn: ['Small joys accumulate today. Stay alert and tread carefully to avoid minor mistakes.', 'Be mindful of misplaced items. Checking your belongings before leaving prevents trouble.'] },
  { fortuneJa: '末吉', fortuneEn: 'Future Luck', weight: 8, btnJa: '時を待つ', btnEn: 'Await the Hour', commentsJa: ['今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。', '物事の始まりは遅けれど、後から徐々に良くなる運気。焦りは禁物、時をじっくり待て。'], commentsEn: ['Now is the time to build your strength. Stay calm, drink warm tea, and rest well.', 'Things may start slowly, but luck improves over time. Do not rush; wait for the right moment.'] },
  { fortuneJa: '接続大吉', fortuneEn: 'Max Connection Luck', weight: 6, btnJa: '帯域を広げる', btnEn: 'Maximize Bandwidth', commentsJa: ['通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。', '遮るものなき高速回線の如く、滞っていた作業が一気に片付く。集中力みなぎる日なり。'], commentsEn: ['Network speed is soaring; videos load instantly. All connections and relationships thrive.', 'Like an unhindered high-speed line, delayed tasks clear up instantly. Focus is unlocked.'] },
  { fortuneJa: '通信吉', fortuneEn: 'Stable Connection Luck', weight: 15, btnJa: '同期を保つ', btnEn: 'Stay Synchronized', commentsJa: ['電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。', 'Wi-Fiの繋がりが安定する如く、穏やかで途切れのない安心した時間を過ごせる一日。'], commentsEn: ['Excellent signal strength. An unexpected, heartwarming message may pop up on your screen.', 'Just like a stable Wi-Fi connection, enjoy a calm, uninterrupted, and peaceful day.'] },
  { fortuneJa: '再起動', fortuneEn: 'System Reboot', weight: 7, btnJa: '新たに紡ぐ', btnEn: 'Reboot Anew', commentsJa: ['頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。', '不要な記憶を捨てる時。古いこだわりを一度手放せば、新しい福が入り込む。'], commentsEn: ['If your mind feels heavy, take a long sleep. Refresh your body and soul to reboot your luck.', 'Time to clear your cache. Let go of old obsessions to make room for new blessings.'] },
  { fortuneJa: '大吉持', fortuneEn: 'Loading Great Luck', weight: 5, btnJa: '読込を待つ', btnEn: 'Complete Loading', commentsJa: ['今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。', '種が地中でじっと芽吹くのを待つ如き時。焦らずに水をやり続ければ、やがて大輪の花が開かん。'], commentsEn: ['Current luck is average, but it is loading a massive blessing. A late-bloomer sign.', 'Like a seed waiting underground. Keep watering it patiently, and a great flower will bloom.'] },
  { fortuneJa: '平', fortuneEn: 'Status Quo', weight: 5, btnJa: '平穏を保つ', btnEn: 'Maintain Balance', commentsJa: ['良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。', '今日という日は、次の大冒険のためのセーブポイントなり。心穏やかに体力を温存せよ。'], commentsEn: ['Neither good nor bad, just a peaceful day. Appreciate the comfort of an ordinary day.', 'Consider today a "save point" before your next big adventure. Relax and conserve energy.'] },
  { fortuneJa: '恐', fortuneEn: 'System Error', weight: 2, btnJa: '慎重に進む', btnEn: 'Proceed with Caution', commentsJa: ['少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。', '注意力が散漫になりやすい兆し。大事な書類の確認や、パスワードの管理は念入りに行うべし。'], commentsEn: ['A day to tread with caution. Avoid starting new things and stick to your usual routine.', 'Focus may drift today. Double-check important documents and manage passwords carefully.'] }
];

// 特殊時間（ゾロ目・キリ番）の運勢定義
const SPECIAL_LUCK: { [key: string]: { ja: string; en: string; commentJa: string; commentEn: string } } = {
  '11:11': { ja: '星連大吉', en: 'Synchronicity Luck', commentJa: '【11:11の奇跡】時計の数字が美しく一直線に並ぶ奇跡の瞬間なり。全てのノイズが消え去り、あなたの願いが最速で宇宙に届く大吉兆なり！', commentEn: '【11:11 Miracle】The numbers line up perfectly. All noise vanishes, and your wishes are delivered to the universe at maximum speed!' },
  '00:00': { ja: '深淵大吉', en: 'Abyss Luck', commentJa: '【00:00の深淵】全てがゼロに還り、新しき世界が幕を開ける神秘の時間なり。過去のバグはすべてリセットされ、無限の可能性がここに同期せん。', commentEn: '【00:00 Abyss】Everything returns to zero as a new world begins. Past bugs are reset, and infinite possibilities synchronize right here.' },
  '12:34': { ja: '順風大吉', en: 'Progression Luck', commentJa: '【12:34の昇龍】数字が美しく階段を昇る如く、あなたの運気も一歩ずつ確実に上昇していく兆しあり。物事が驚くほどスムーズに進行する一日となる。', commentEn: '【12:34 Progression】Like steps ascending, your fortune rises surely. A beautiful progression where everything runs smoother than ever.' },
  '22:22': { ja: '複製大吉', en: 'Replication Luck', commentJa: '【22:22の調和】全ての要素が美しく対を成し、強固なミラーリング（複製）を形成する時。あなたの善き行いや努力が、倍の成果となって手元に返らん。', commentEn: '【22:22 Replication】All elements form a perfect pair. Your good deeds and hard work mirror back to you, doubling your rewards.' }
};

// 御朱印の並び順（表示用のマスタ順。特殊運勢を先頭に）
const FORTUNE_ORDER = ['星連大吉', '深淵大吉', '順風大吉', '22:22', '大吉', '吉', '中吉', '小吉', '末吉', '接続大吉', '通信吉', '再起動', '大吉持', '平', '恐'];

// 吉兆の色＆物（インデックス完全同期用）
const LUCKY_COLORS_JA = ['漆黒', '朱赤', '瑠璃色', '黄金色', '白', '黒', '赤', '青', '琥珀色', '常盤色'];
const LUCKY_COLORS_EN = ['Jet Black', 'Vermilion Red', 'Lapis Lazuli', 'Pure Gold', 'White', 'Black', 'Red', 'Blue', 'Amber', 'Evergreen'];
const LUCKY_ITEMS_JA = ['LANケーブル', '温かい緑茶', 'ハンカチ', 'ティッシュ', 'ボールペン', 'イヤホン', '最新のガジェット', '和紙のノート'];
const LUCKY_ITEMS_EN = ['LAN Cable', 'Warm Green Tea', 'Handkerchief', 'Tissue', 'Ballpoint Pen', 'Earphones', 'Latest Gadget', 'Washi Notebook'];

// 時候の挨拶（月ごと）
const MONTHLY_GREETINGS: { [key: number]: { ja: string; en: string } } = {
  1: { ja: '新春の清らかな光がシステムを照らす如く、', en: 'As the pure light of the New Year illuminates the system, ' },
  2: { ja: '厳しい寒さの中で梅が静かに芽吹く如く、', en: 'As plum blossoms quietly bud amidst the severe winter cold, ' },
  3: { ja: '春の柔らかな風が滞るデータを融かす如く、', en: 'As the gentle spring breeze thaws all frozen data, ' },
  4: { ja: '爛漫たる桜の如く新たな回線が開通する時、', en: 'As new connection lines open like cherry blossoms in full bloom, ' },
  5: { ja: '新緑の葉がバグのない美しさを湛える如く、', en: 'As the fresh green leaves display a beauty free of any bugs, ' },
  6: { ja: '梅雨の合間の澄み渡る電波の如く、', en: 'Like a perfectly clear signal piercing through the June rainy season, ' },
  7: { ja: '夏の夜空を彩る大輪の花火が如く、', en: 'Like grand fireworks lighting up the midsummer night sky, ' },
  8: { ja: '清涼なる滝の水が熱きサーバーを冷ます如く、', en: 'As cool waterfall streams soothe and refresh a heated server, ' },
  9: { ja: '中秋の名月が夜道を優しく導く如く、', en: 'As the harvest moon gently guides your path through the night, ' },
  10: { ja: '実りの秋が豊かなリソースをもたらす如く、', en: 'As the autumn harvest brings an abundance of rich resources, ' },
  11: { ja: '鮮やかな紅葉が画面を美しく彩る如く、', en: 'As brilliant autumn maple leaves beautifully color the screen, ' },
  12: { ja: '寒風に耐え忍びてサーバーが強固に稼働する如く、', en: 'As servers stand resilient and strong against the biting winter wind, ' }
};

// 数値を漢数字に変換する関数 (例: 24 -> 二十四)
const toKanjiNumber = (num: number): string => {
  const kanjiNums = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (num === 0) return kanjiNums[0];
  let res = '';
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  if (tens > 0) {
    if (tens > 1) res += kanjiNums[tens];
    res += '十';
  }
  if (ones > 0) res += kanjiNums[ones];
  return res;
};

export default function App() {
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  const [result, setResult] = useState<{ fortune: string; comment: string; color: string; item: string; currentBtn: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [visitDate, setVisitDate] = useState<string>('');
  const [history, setHistory] = useState<{ [key: string]: number }>({});
  const [visitDays, setVisitDays] = useState<number>(1);

  // 📥 LocalStorageからデータ読み込み＆参拝日数カウント
  useEffect(() => {
    const savedHistory = localStorage.getItem('omikuji_history_v2');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const todayStr = new Date().toDateString();
    const lastVisit = localStorage.getItem('omikuji_last_visit');
    let days = parseInt(localStorage.getItem('omikuji_visit_days') || '1', 10);

    if (lastVisit && lastVisit !== todayStr) {
      days += 1;
      localStorage.setItem('omikuji_visit_days', days.toString());
    }
    localStorage.setItem('omikuji_last_visit', todayStr);
    setVisitDays(days);
  }, []);

  // ⌨️ キーボード操作 (Enter / Space) 対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !isRolling) {
        e.preventDefault();
        drawOmikuji();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRolling, lang, history]);

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
    setResult(null);
    playSound('roll');
    
    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayOfWeek = today.getDay(); // 0:日, 6:土

    // 📅 日付のフォーマット処理 (日本語は完全漢数字化)
    let dateStr = '';
    if (lang === 'ja') {
      const reiwaYear = today.getFullYear() - 2018;
      dateStr = `令和${toKanjiNumber(reiwaYear)}年${toKanjiNumber(month)}月${toKanjiNumber(date)}日`;
    } else {
      dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    setVisitDate(dateStr);

    setTimeout(() => {
      let fortune = '';
      let comment = '';
      let currentBtnJa = '再び紐解く';
      let currentBtnEn = 'Draw Again';
      let historyKey = '';

      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // ⏰ A. 特殊時間（ゾロ目）の判定
      if (SPECIAL_LUCK[timeStr]) {
        const spec = SPECIAL_LUCK[timeStr];
        fortune = lang === 'ja' ? spec.ja : spec.en;
        comment = lang === 'ja' ? spec.commentJa : spec.commentEn;
        currentBtnJa = '奇跡を重ねる';
        currentBtnEn = 'Keep the Miracle';
        historyKey = spec.ja;
      } 
      // 🎁 B. 記念日・祝日の判定
      else if (month === 1 && date === 1) {
        fortune = lang === 'ja' ? '初春大吉' : 'New Year Luck';
        comment = lang === 'ja' ? '【謹賀新年】新しき年の幕開け。全ての回路が祝福に満ち、壮大なる幸運があなたを待つ。' : '【Happy New Year】A fresh dawn. All systems are blessed with boundless new fortune.';
        historyKey = '大吉';
      } else if (month === 5 && date === 4) {
        fortune = lang === 'ja' ? '翠緑大吉' : 'Greenery Luck';
        comment = lang === 'ja' ? '【みどりの日】バグのない美しい自然の如く、あなたの心身も健やかにリフレッシュされる日なり。' : '【Greenery Day】Like a bug-free natural ecosystem, your mind and body refresh completely.';
        historyKey = '大吉';
      } else if (month === 10 && date === 10) {
        fortune = lang === 'ja' ? '電脳大吉' : 'Digital Day Luck';
        comment = lang === 'ja' ? '【デジタル記念日】一と零が織りなす美しき世界。あなたのロジックが冴え渡り、最良の成果を生む。' : '【Digital Day】The beautiful world of 1s and 0s. Your logic shines to produce the best results.';
        historyKey = '大吉';
      }
      // 🎲 C. 通常のおみくじ抽選
      else {
        const totalWeight = LUCK_DATA.reduce((sum, item) => sum + item.weight, 0);
        let randomNum = Math.floor(Math.random() * totalWeight);
        
        let selectedGroup = LUCK_DATA[0];
        for (const group of LUCK_DATA) {
          if (randomNum < group.weight) { selectedGroup = group; break; }
          randomNum -= group.weight;
        }

        fortune = lang === 'ja' ? selectedGroup.fortuneJa : selectedGroup.fortuneEn;
        currentBtnJa = selectedGroup.btnJa;
        currentBtnEn = selectedGroup.btnEn;
        historyKey = selectedGroup.fortuneJa;

        const idx = Math.floor(Math.random() * selectedGroup.commentsJa.length);
        
        // 🌸 時候の挨拶 ＋ ベースお告げ
        const greeting = MONTHLY_GREETINGS[month] ? (lang === 'ja' ? MONTHLY_GREETINGS[month].ja : MONTHLY_GREETINGS[month].en) : '';
        comment = greeting + (lang === 'ja' ? selectedGroup.commentsJa[idx] : selectedGroup.commentsEn[idx]);

        // ☀️ 🌆 🌙 ライフスタイル連動メッセージの自動ドッキング
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          comment += lang === 'ja' ? '（休日の通信は混雑するも、心は穏やかに過ごすが吉。）' : ' (Weekend lines may be busy, but keeping a calm mind brings peace.)';
        } else if (dayOfWeek === 1 && hours >= 5 && hours < 10) {
          comment += lang === 'ja' ? '（週始めのシステムチェックを怠るなかれ。手堅き一歩が吉を呼ぶ。）' : ' (Do not skip your Monday morning system checks. A steady step brings luck.)';
        } else if (hours >= 13 && hours < 15) {
          comment += lang === 'ja' ? '（睡魔はシステムの過熱なり。少しの休止が効率を上げん。）' : ' (Drowsiness means an overheated system. A short power nap scales up efficiency.)';
        }
      }

      // 🎨 吉兆の色・物の完全同期取得
      const colorIdx = Math.floor(Math.random() * LUCKY_COLORS_JA.length);
      const itemIdx = Math.floor(Math.random() * LUCKY_ITEMS_JA.length);
      const color = lang === 'ja' ? LUCKY_COLORS_JA[colorIdx] : LUCKY_COLORS_EN[colorIdx];
      const item = lang === 'ja' ? LUCKY_ITEMS_JA[itemIdx] : LUCKY_ITEMS_EN[itemIdx];
      const currentBtn = lang === 'ja' ? currentBtnJa : currentBtnEn;

      setResult({ fortune, comment, color, item, currentBtn });
      setIsRolling(false);
      playSound('success');

      // 📊 履歴の保存（日本語キーで一元管理）
      const newHistory = { ...history, [historyKey]: (history[historyKey] || 0) + 1 };
      setHistory(newHistory);
      localStorage.setItem('omikuji_history_v2', JSON.stringify(newHistory));
    }, 600);
  };

  // 🔥 お焚き上げ（履歴リセット）
  const clearHistory = () => {
    if (window.confirm(lang === 'ja' ? 'これまでの御神籤をお焚き上げ（消去）いたしますか？' : 'Are you sure you want to perform the sacred disposal (clear history)?')) {
      localStorage.removeItem('omikuji_history_v2');
      localStorage.removeItem('omikuji_visit_days');
      localStorage.removeItem('omikuji_last_visit');
      setHistory({});
      setVisitDays(1);
      setResult(null);
    }
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
        className="absolute top-4 left-4 bg-stone-200 border border-stone-400 text-xs px-3 py-1.5 rounded hover:bg-stone-300 font-serif shadow-sm transition-all focus:outline-none"
      >
        {lang === 'ja' ? '🌐 English' : '🌐 日本語'}
      </button>

      <div className="max-w-md w-full bg-stone-50 rounded-lg shadow-2xl p-8 border-4 border-red-700 text-center relative overflow-hidden mt-8">
        <div className="absolute top-0 left-0 w-full h-3 bg-red-700"></div>
        
        {visitDate && (
          <div className="text-[10px] text-stone-500 font-serif tracking-widest absolute top-5 right-6 leading-tight">
            {visitDate} {lang === 'ja' ? '参拝' : 'Visited'}
            {lang === 'en' && <span className="block text-[8px] text-stone-400 font-sans italic">(Japanese Era: Reiwa)</span>}
          </div>
        )}

        <h1 className="text-4xl font-bold text-red-800 my-6 font-serif tracking-widest">
          {lang === 'ja' ? '御神籤' : 'OMIKUJI'}
        </h1>

        <div className="min-h-[240px] flex flex-col items-center justify-center bg-stone-100 rounded border border-stone-300 p-6 mb-6 shadow-inner">
          {isRolling ? (
            <div className="text-lg font-medium text-red-700 animate-pulse tracking-widest font-serif">
              {lang === 'ja' ? '御神意を伺っております...' : 'Consulting the divine status...'}
            </div>
          ) : result ? (
            <div className={`font-serif w-full ${lang === 'en' ? 'text-xs' : 'text-sm'}`}>
              {/* ⏳ 段階的フェードイン演出（ディレイ調整） */}
              <div className="text-3xl sm:text-4xl font-black text-red-700 mb-4 tracking-widest border-b-2 border-red-700/20 pb-2 px-4 inline-block animate-fade-in">
                {result.fortune}
              </div>
              <p className="text-stone-700 leading-relaxed text-left px-2 font-sans tracking-wide mb-4 animate-fade-in animation-delay-200" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                {result.comment}
              </p>
              
              <div className="border-t border-dashed border-stone-300 pt-3 mt-2 font-serif text-stone-600 bg-stone-50/50 py-3 rounded flex flex-col gap-1 px-4 text-left animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
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
          className={`w-full py-4 px-6 text-lg font-bold text-stone-100 rounded shadow-md transition-all duration-300 active:scale-98 tracking-widest font-serif focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isRolling ? 'bg-stone-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-900'
          }`}
        >
          {result ? result.currentBtn : (lang === 'ja' ? 'おみくじを引く' : 'Draw Fortune')}
        </button>
      </div>

      {/* 📊 格式順・仮想御朱印帳エリア */}
      <div className="max-w-md w-full mt-6 bg-stone-50 rounded border border-stone-300 p-4 shadow-md font-serif text-center relative">
        <h3 className="text-xs font-bold text-stone-600 tracking-wider border-b border-stone-200 pb-1.5 mb-2.5 flex justify-between items-center px-1">
          <span>{lang === 'ja' ? '仮想御朱印' : 'Your Fortune Log'}</span>
          <span className="text-[10px] font-normal text-stone-400 font-sans">
            {lang === 'ja' ? `通算参拝：${visitDays}日目` : `Days Visited: ${visitDays}`}
          </span>
        </h3>
        {Object.keys(history).length === 0 ? (
          <p className="text-[11px] text-stone-400 italic py-2">
            {lang === 'ja' ? 'まだ参拝履歴がありません' : 'No history yet.'}
          </p>
        ) : (
          <div>
            {/* 格式の高い順（FORTUNE_ORDER）にソートして並べる */}
            <div className="flex flex-wrap justify-center gap-1.5 text-[10px] mb-3">
              {FORTUNE_ORDER.map(luckKey => {
                const count = history[luckKey];
                if (!count) return null;
                return (
                  <span key={luckKey} className="bg-red-50 text-red-800 border border-red-200/60 rounded px-2 py-0.5 shadow-sm">
                    {luckKey} : <strong className="text-xs font-sans">{count}</strong>
                  </span>
                );
              })}
            </div>
            {/* 🔥 お焚き上げ（データリセット）リンク */}
            <button 
              onClick={clearHistory}
              className="text-[9px] text-stone-400 hover:text-red-700 underline transition-colors font-sans block mx-auto focus:outline-none"
            >
              {lang === 'ja' ? '御神籤をお焚き上げする' : 'Perform Sacred Disposal (Reset History)'}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-6 text-[10px] text-stone-400 tracking-widest font-serif">
        謹製 仮想空間神社 / Virtual Shrine
      </footer>
    </div>
  );
}