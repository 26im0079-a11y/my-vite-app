import { useState } from 'react';

// 11の運勢と、それぞれに紐づくお告げ
const LUCK_DATA = [
  {
    fortune: '大吉',
    weight: 5,
    comments: [
      '運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。',
      '暗闇に一筋の光明が差す如く、すべての迷いが消え去る日。自信を持って前へ進むべし。',
      '望みのもの向こうから歩み寄る運気なり。周囲の人に優しく接すれば、福が倍になりて返らん。',
      '長年の努力が実を結び、大きな成果を得る兆しあり。お祝いには少し良いものを食すが吉。',
      '天の加護ありて、災い自ずと遠ざかる。今日始める物事は、将来大きな財産とならん。'
    ]
  },
  {
    fortune: '吉',
    weight: 15,
    comments: [
      '誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。',
      '地道なる歩みが実を結ぶ日なり。派手さはなくとも、確実な一歩が将来の吉を呼ぶ。',
      '身近な人の助言に幸運のヒントあり。耳を傾け、素直な心で受け入れるべし。',
      '急いては事を仕損じる。今日は一歩引いて全体を眺める心の余裕が、さらなる福を招く。',
      '失せ物（なくしたもの）は近い将来に見つかる兆し。心静かに身の回りを整理せよ。'
    ]
  },
  {
    fortune: '中吉',
    weight: 12,
    comments: [
      '平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。',
      '日常の中に小さな奇跡が隠されている日。空の美しさや風の心地よさに目を向けるが吉。',
      '金運は緩やかに上昇。無駄遣いを控え、本当に心が豊かになるものに投資すべし。',
      '対人関係が円滑に進む。久しく連絡を取っていない友人に一筆送れば、新たな縁が生まれん。',
      '健康運良好。少し遠回りをして歩くなど、身体を動かすことで運気がさらに巡る。'
    ]
  },
  {
    fortune: '小吉',
    weight: 10,
    comments: [
      '小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。',
      '物事、腹八分目で満足するのが良い日。欲を張りすぎねば、穏やかな幸福が持続せん。',
      '忘れ物や落とし物に少し注意が必要。出かける前の指差し確認が、災いを未然に防ぐ。',
      '派手な進展は期待できぬが、守りを固めるには最適な日。本を読み、知識を蓄えるべし。',
      '夕方に小さなラッキーが訪れる予感。帰り道にふらりと寄り道してみるのも良し。'
    ]
  },
  {
    fortune: '末吉',
    weight: 8,
    comments: [
      '今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。',
      '物事の始まりは遅けれど、後から徐々に良くなる運気。焦りは禁物、時をじっくり待て。',
      '大きな決断は後日に回すが吉。今日は現状維持を心がけ、部屋の掃除に力を入れるべし。',
      '他人の言葉に惑わされず、己の軸を保つべし。夜更かしを避け、早く眠るのが開運の鍵。',
      '小さな障壁あれど、誠実に対応すれば霧が晴れる如く解決す。言葉遣いを丁寧にせよ。'
    ]
  },
  {
    fortune: '接続大吉',
    weight: 6,
    comments: [
      '通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。',
      '遮るものなき高速回線の如く、滞っていた作業が一気に片付く。集中力みなぎる日なり。',
      '画面の向こうにいる人々との絆が深まる。あなたの発信が多くの人の心に留まる兆し。',
      '電波のノイズ一切なし。直感が冴え渡り、迷っていた選択に正しい答えが見つからん。',
      '検索の運が極めて高い。求めていた情報や、人生を豊かにする新しい知識に出会える日。',
      'すべてのクラウドと同期する如く、周囲との意思疎通が完璧に噛み合う奇跡の一日なり。'
    ]
  },
  {
    fortune: '通信吉',
    weight: 15,
    comments: [
      '電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。',
      '通知音が心地よく響く日。有益な情報や、心が温まるメッセージが舞い込む予感。',
      'オンラインでの対話にツキあり。画面越しの笑顔が、お互いの運気を大きく高めん。',
      'SNSの海で、今のあなたに最も必要な「言葉」と巡り会う。その言葉を大切に記憶せよ。',
      'ネットでの買い物品にアタリあり。長く愛用できる素晴らしい品に出会える兆し。',
      'Wi-Fiの繋がりが安定する如く、穏やかで途切れのない安心した時間を過ごせる一日。'
    ]
  },
  {
    fortune: '再起動',
    weight: 7,
    comments: [
      '頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。',
      '不要な記憶（キャッシュ）を捨てる時。古いこだわりを一度手放せば、新しい福が入り込む。',
      '予定が詰まりすぎて熱を帯びている。一度立ち止まり、深呼吸をしてスケジュールを整理せよ。',
      '原因不明の不調は、ただのエネルギー切れ。温かい風呂に浸かり、身体を休めるのが最優先なり。',
      '画面を閉じ、自然の光を浴びよ。五感を現実の世界に戻すことで、運気のバグが綺麗に直らん。',
      '無理に稼働を続けることなかれ。今日は「何もしない贅沢」を己に許すことで、明日の大吉を生む。'
    ]
  },
  {
    fortune: '大吉持',
    weight: 5,
    comments: [
      '今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。',
      '種が地中でじっと芽吹くのを待つ如き時。焦らずに水をやり続ければ、やがて大輪の花が開かん。',
      '朝のうちは冴えねど、日が昇るにつれて運気うなぎ登り。夕方以降の行動に大いなる吉あり。',
      '隠れた才能が少しずつ表に現れる兆し。新しい趣味や勉強を始めるなら、今日が最高の転換点。',
      '他人の成功を羨む必要なし。あなたの運のピークはこれから。じっくりと実力を磨くべし。',
      '今受けている小さな苦労は、将来の大きな幸運の「前払い」なり。前を向いて歩むべし。'
    ]
  },
  {
    fortune: '平',
    weight: 5,
    comments: [
      '良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。',
      '過度な期待はせず、淡々と日常をこなすのが吉。いつも通りのご飯が美味しく感じられる日。',
      '運気のグラフは真横一直線。劇的な変化はないが、トラブルに巻き込まれる心配もなき安心の日。',
      '今日という日は、次の大冒険のための「セーブポイント」なり。心穏やかに体力を温存せよ。',
      '特別な出来事は起きねど、大過なく過ごせることこそ至上の幸福。家族や友人に感謝を。',
      '派手な風は吹かねど、足元は極めて強固なり。身の回りの片付けや、基本の復習をするに最適な日。'
    ]
  },
  {
    fortune: '恐',
    weight: 2,
    comments: [
      '少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。',
      '暗い夜道を歩む如く、一歩一歩を慎重に。言葉選び一つで、余計な摩擦を回避できる日なり。',
      '注意力が散漫になりやすい兆し。大事な書類の確認や、パスワードの管理は念入りに行うべし。',
      '他人の揉め事には首を突っ込まぬが吉。今日は静かに自分の作業に没頭し、早めに帰路につけ。',
      '心がざわついたら、温かい飲み物を一杯飲むべし。焦りから生まれるミスを未然に防ぐ知恵なり。',
      '運気は一時的に低迷するも、明けない夜はなし。嵐が過ぎ去るのを待つ如く、じっと耐えるが勝ち。'
    ]
  }
];

// 🎨 吉兆の色：読み仮名を削り、すっきりした漢字のみに変更
const LUCKY_COLORS = [
  '漆黒', '朱赤', '琥珀色', '常盤色', '白磁', '瑠璃色', '黄金色', '茜色', 
  '浅葱色', '藤紫', '桜色', '萌黄', '山吹色', '空色', '胡桃色', '群青', 
  '葡萄鼠', '藍生鼠', '銀鼠', '生成色', 'ダークモードの黒', 'サイバーネオンブルー', 
  'バグのない緑', '警告のRGBレッド', 'ピクセルゴールド', '液晶のバックライト白', 
  'ターミナルのフォント緑', '通知バッジの赤', 'ハイパーリンクの青', '初期設定のグレー'
];

// 💻 吉兆の物：扇子などの読みも削り、洗練された表記に統一
const LUCKY_ITEMS = [
  'LANケーブル', 'ノイズキャンセリングヘッドホン', '温かい緑茶', '最新のガジェット', 
  'バックアップデータ', 'キーボードクリーナー', 'お気に入りのブックマーク', '二段階認証コード', 
  '余らせたポイント', 'ダークモードの設定', '整理されたデスクトップ', '新しいパスワード', 
  '予備の充電器', 'ブルーライトカット眼鏡', 'クラウドストレージの空き', '静音マウス', 
  '和紙のノート', 'お守り袋', '水引のストラップ', '木彫りの熊', 
  '扇子', 'お気に入りの湯呑み', 'お香', '招き猫の置物', 
  '風呂敷', 'だるまの絵画', '数珠', '絵馬', 
  '神棚のお札', '打ち水'
];

export default function App() {
  const [result, setResult] = useState<{ fortune: string; comment: string; color: string; item: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [visitDate, setVisitDate] = useState<string>('');

  const playSound = (type: 'roll' | 'success') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'roll') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const drawOmikuji = () => {
    setIsRolling(true);
    playSound('roll');
    
    const today = new Date();
    const jstYear = today.getFullYear();
    const reiwaYear = jstYear - 2018;
    const dateStr = `令和${reiwaYear}年${today.getMonth() + 1}月${today.getDate()}日`;
    setVisitDate(dateStr);

    setTimeout(() => {
      const totalWeight = LUCK_DATA.reduce((sum, item) => sum + item.weight, 0);
      let randomNum = Math.floor(Math.random() * totalWeight);
      
      let selectedGroup = LUCK_DATA[0];
      for (const group of LUCK_DATA) {
        if (randomNum < group.weight) {
          selectedGroup = group;
          break;
        }
        randomNum -= group.weight;
      }

      const randomComment = selectedGroup.comments[Math.floor(Math.random() * selectedGroup.comments.length)];
      const randomColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
      const randomItem = LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)];
      
      setResult({
        fortune: selectedGroup.fortune,
        comment: randomComment,
        color: randomColor,
        item: randomItem
      });
      
      setIsRolling(false);
      playSound('success');
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
      <div className="max-w-md w-full bg-stone-50 rounded-lg shadow-2xl p-8 border-4 border-red-700 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-red-700"></div>
        
        {visitDate && (
          <div className="text-[11px] text-stone-500 font-serif tracking-widest absolute top-5 right-6 animate-fade-in">
            {visitDate} 参拝
          </div>
        )}

        <h1 className="text-4xl font-bold text-red-800 my-6 font-serif tracking-widest">御神籤</h1>

        <div className="min-h-[220px] flex flex-col items-center justify-center bg-stone-100 rounded border border-stone-300 p-6 mb-8 shadow-inner">
          {isRolling ? (
            <div className="text-lg font-medium text-red-700 animate-pulse tracking-widest font-serif">
              御神意を伺っております...
            </div>
          ) : result ? (
            <div className="animate-fade-in font-serif w-full">
              <div className="text-4xl sm:text-5xl font-black text-red-700 mb-4 tracking-widest border-b-2 border-red-700/20 pb-2 px-6 inline-block">
                {result.fortune}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed text-left px-2 font-sans tracking-wide mb-4">
                {result.comment}
              </p>
              
              <div className="border-t border-dashed border-stone-300 pt-3 mt-2 text-xs font-serif text-stone-600 bg-stone-50/50 py-3 rounded flex flex-col gap-1 px-4 text-left">
                <div><span className="text-red-700 font-bold">吉兆の色：</span>{result.color}</div>
                <div><span className="text-red-700 font-bold">吉兆の物：</span>{result.item}</div>
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-sm tracking-wider font-serif">
              心静かに下の釦をお押しください
            </div>
          )}
        </div>

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

      <footer className="mt-8 text-[10px] text-stone-400 tracking-widest font-serif">
        謹製 仮想空間神社
      </footer>
    </div>
  );
}