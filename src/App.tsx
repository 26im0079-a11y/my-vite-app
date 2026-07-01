import { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 定数データ定義（アイテム・ポーション・マップ）
// ==========================================
type Tab = 'shop' | 'atelier' | 'map';

interface Ingredient { id: string; name: string; weight: number; icon: string; desc: string; }
interface Potion { id: string; name: string; recipe: Record<string, number>; basePrice: number; icon: string; desc: string; }
interface MapLocation { id: string; name: string; ingredients: string[]; icon: string; x: number; y: number; cost: number; }

const INGREDIENTS: Record<string, Ingredient> = {
  nightglow: { id: 'nightglow', name: '夜光草', weight: 2, icon: '🌿', desc: '暗闇で光る軽い草' },
  fairy_dust: { id: 'fairy_dust', name: '妖精の粉', weight: 1, icon: '✨', desc: '神秘的な粉' },
  bone_meal: { id: 'bone_meal', name: '骨粉', weight: 10, icon: '🦴', desc: '沼地で拾える古い骨の粉' },
  mandragora: { id: 'mandragora', name: 'マンドラゴラ', weight: 25, icon: '🌱', desc: '叫ぶ重い植物' },
  iron_ore: { id: 'iron_ore', name: '鉄鉱石', weight: 30, icon: '🪨', desc: 'ずっしり重い鉱石' },
  crystal: { id: 'crystal', name: '魔力結晶', weight: 15, icon: '💎', desc: '魔力を帯びた石' },
  dragon_scale: { id: 'dragon_scale', name: '竜の鱗', weight: 50, icon: '🐉', desc: '極めて重い秘宝' },
};

const POTIONS: Record<string, Potion> = {
  healing: { id: 'healing', name: '回復のポーション', recipe: { nightglow: 2, fairy_dust: 1 }, basePrice: 50, icon: '🧪', desc: '傷を癒やす基本の薬' },
  strength: { id: 'strength', name: '力のポーション', recipe: { mandragora: 1, bone_meal: 2 }, basePrice: 150, icon: '💪', desc: '力がみなぎる赤い薬' },
  iron_skin: { id: 'iron_skin', name: '鉄壁の薬', recipe: { iron_ore: 1, crystal: 1, nightglow: 1 }, basePrice: 250, icon: '🛡️', desc: '体を鉄にする薬' },
  elixir: { id: 'elixir', name: 'エリクサー', recipe: { dragon_scale: 1, mandragora: 1, fairy_dust: 3 }, basePrice: 1000, icon: '🌟', desc: '伝説の万能秘薬' },
};

const LOCATIONS: Record<string, MapLocation> = {
  forest: { id: 'forest', name: '妖精の森', ingredients: ['nightglow', 'fairy_dust'], icon: '🌲', x: 20, y: 70, cost: 0 },
  swamp: { id: 'swamp', name: '死者の沼', ingredients: ['mandragora', 'bone_meal'], icon: '🌫️', x: 70, y: 30, cost: 30 },
  mine: { id: 'mine', name: '古い鉱山', ingredients: ['iron_ore', 'crystal'], icon: '⛏️', x: 40, y: 20, cost: 50 },
  secret: { id: 'secret', name: '竜の巣（秘境）', ingredients: ['dragon_scale', 'crystal'], icon: '🌋', x: 80, y: 80, cost: 100 },
};

const MAX_WEIGHT = 100;

// ==========================================
// 2. セリフ・リアクションデータ（大量追加）
// ==========================================

const CUSTOMER_DIALOGUES = [
  "ドラゴンと戦ってたんだ。ああ、もちろん勝ったぜ？ただ、ちょっと怪我しちまってな…",
  "力が…力が欲しい……。すべてを捩じ伏せるほどの力が！",
  "夜道が怖くてね、体が石のように硬くなる薬はあるかしら？",
  "伝説のエリクサーを探している。君なら作れると聞いたが。",
  "明日の収穫祭のために、少し元気が出るものを頼むよ。",
  "最近、腰が痛くてかなわん。魔女様、何とかしてくれんか。",
  "……静かな眠りが必要なんだ。夜光草の香りがする薬を頼む。",
  "鉱山で落盤に遭ってね。骨がミシミシ言うんだ、助けてくれ。",
  "恋の悩み……ではなく、単に風邪を引いたみたいです。",
  "沼地の怪物を退治しに行く。最強の防御力を備えたいんだ。",
  "隣の村まで全力で走らなきゃならない。スタミナが出るやつを！",
  "魔力修行中に倒れてしまって。栄養のあるポーションはある？",
  "ひび割れた盾を直すより、自分の肌を硬くしたほうが早いと思ってな。",
  "マンドラゴラの叫び声を聞きすぎて耳鳴りがするんだ。回復を頼む。",
  "深い深い地下に潜る。光が必要なんだ、光る薬をくれ。",
  "あー、飲みすぎた……。二日酔いに効く魔法の薬はないか？",
  "冒険者ギルドの試験があるんだ。これに受かれば一人前さ！",
  "森で見慣れないキノコを食べてしまった。お腹が痛い……。",
  "英雄になるためには、まず健康な体からだと思わないか？",
  "不思議な粉を探している。どこかで見かけなかったかい？",
  "重い鎧が肩に食い込んで痛いんだ。痛みを消してくれ。",
  "……王国の騎士団に追われている。足を速くする薬はないか？",
  "孫が生まれたんだ！お祝いに、一番いい薬を一つ持っていきたい。",
  "呪いの沼に足を踏み入れてしまった。浄化の力が欲しい。",
  "冬の寒さが身に沁みる。体を芯から温めるポーションを。",
  "新しい剣を試すのが楽しみで、つい徹夜してしまったよ。",
  "空を飛ぶ夢を見たんだ。現実に飛ばなくてもいい、そんな気分になりたい。",
  "昔はこの辺りももっと賑やかだったんだがね。ポーションをくれ。",
  "旅の途中で水を切らしてしまった。水分補給にいいやつを。",
  "不老不死の薬……なんて、冗談さ。普通の回復薬でいいよ。",
  "あいつを見返してやりたいんだ！俺に無敵の力を貸してくれ！",
  "研究に行き詰まって。頭がスッキリする香りの薬を。",
  "屋根から落ちた。骨は折れてないと思うが、すごく痛い。",
  "森の奥に大きな卵を見つけたんだ。……孵るのが怖いよ。",
  "妖精に悪戯されて、荷物を全部隠されちゃった。元気をくれ。",
  "雨の日が続くと、古傷が疼くんだ。魔女さん、お願いだ。",
  "世界を救う旅に出るんだ。まずは基礎的な薬を持っておきたい。",
  "宝箱を開けたら毒ガスが出てきて！今すぐ解毒を頼む！",
  "眠れない……。羊を千匹数えてもダメなんだ。",
  "あの竜の咆哮を聞いたか？震えが止まらないんだ、勇気をくれ。",
  "修行中に崖から落ちかけた。生きててよかったよ、本当に。",
  "……誰にも言わないでくれ。実は、暗いところが苦手なんだ。",
  "商売繁盛の薬はないのかい？……ないなら普通のでいいよ。",
  "新しいレシピを探しているのかい？私は知らないけどね。",
  "おい！一番強くて一番高いやつをくれ！金ならある！",
  "……失った記憶を戻したいんだ。そんな薬、あるわけないか。",
  "ただの通りすがりだ。喉が渇いたから、何か飲ませてくれ。",
  "畑仕事で腰を痛めた。マンドラゴラより叫びたい気分だ。",
  "鏡を見たら、少し老けた気がしてね。美容にいいやつを。",
  "竜の鱗を拾ったんだ。これで何かすごいものが作れるか？",
  "……この小屋、昔の主を知っているよ。彼女は……いや、いい。",
  "幽霊を見たんだ！心臓が止まるかと思った。落ち着く薬を。",
  "この街を離れることにした。最後のポーションを買いに来たよ。",
  "お腹が空きすぎて、魔力が空っぽだ。何か一服頼む。",
  "……いいポーションは、いい材料から。あんた、分かってるね。",
  "武器の手入れ中に指を切った。地味に痛いやつだ。",
  "死者の沼で変な鳴き声を聞いた。……あれは、何だい？",
  "伝説の魔女のレシピ……。それを君が持っているのか？",
  "ただいま。今日もいつものやつ、お願いね。",
  "おっと、調合中だったかい？邪魔したな、ポーションをくれ。"
];

const SUCCESS_REACTIONS = {
  perfect: [
    "「また来るわ！お得意様、ってやつかしらね。」",
    "「素晴らしい！これこそ私が求めていたポーションだわ！」",
    "「あんた、天才だね。おまけに多めに払っておくよ。」",
    "「完璧だ……。体が軽くなるようだ。ありがとう！」",
    "「こんなに澄んだ色のポーション、王都でも見たことがないぜ。」",
    "「最高だ！君の店を皆に宣伝しておくよ。」",
    "「……信じられない。伝説のレシピを完全に再現しているのか？」",
    "「ああ、心地いい。まるで魂が洗われるようだ。」",
    "「君に任せて正解だった。また必ず来るよ。」",
    "「これは芸術品だ。使うのがもったいないくらいだよ！」"
  ],
  good: [
    "「うん、悪くないポーションだ。助かるよ。」",
    "「ちょうどいい感じだね。ありがとう。」",
    "「納得のいく品質だ。大事に使わせてもらうよ。」",
    "「ふむ、悪くない。これなら目的を果たせそうだ。」",
    "「ありがとう。助かったよ、魔女さん。」",
    "「期待通りの効果だね。また頼むよ。」",
    "「しっかり調合されているな。感心したよ。」",
    "「いいポーションだ。お代を置いていくね。」",
    "「使い勝手が良さそうだ。また寄らせてもらう。」",
    "「うん、これなら十分だ。いい仕事をしたね。」"
  ],
  bad: [
    "「...」「あんた、ちょっと失礼だぜ。もういいよ…」",
    "「なんだこれは……？ 濁っているじゃないか。」",
    "「……不味い。効果も薄そうだし、これだけしか払えないよ。」",
    "「あんた、ちゃんとレシピを見たのかい？」",
    "「……次は期待させてもらうよ。今回はこれで我慢するが。」",
    "「少し機嫌が悪くなったわ。……もう行くわね。」",
    "「……このクオリティでこの値段？ 冗談はやめてくれ。」",
    "「あーあ、期待外れだ。別の店を探すべきだったかな。」",
    "「……。 (無言でお代を半分置いて立ち去った)」",
    "「ちょっと、失礼な態度じゃない？ 薬もこれじゃあね……。」"
  ]
};

// ==========================================
// 3. ミニゲームコンポーネント
// ==========================================
const NegotiationMiniGame = ({ onComplete }: { onComplete: (results: string[]) => void }) => {
  const [pos, setPos] = useState(50);
  const [results, setResults] = useState<string[]>([]);
  const dirRef = useRef(1);
  const posRef = useRef(50);
  const reqRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.15;
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      let nextPos = posRef.current + (dirRef.current * speed * delta);
      if (nextPos >= 100) { nextPos = 100; dirRef.current = -1; }
      if (nextPos <= 0) { nextPos = 0; dirRef.current = 1; }
      posRef.current = nextPos;
      setPos(nextPos);
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, []);

  const handleTap = () => {
    if (results.length >= 3) return;
    const distance = Math.abs(posRef.current - 50);
    let hit = 'bad';
    if (distance <= 8) hit = 'perfect';
    else if (distance <= 25) hit = 'good';
    const newResults = [...results, hit];
    setResults(newResults);
    if (newResults.length === 3) {
      cancelAnimationFrame(reqRef.current);
      setTimeout(() => onComplete(newResults), 1000);
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border-2 border-amber-900 shadow-inner my-4 select-none">
      <div className="text-center text-amber-200 mb-2 font-bold text-sm">【交渉の振り子】真ん中を狙え！ ({3 - results.length}回)</div>
      <div className="relative w-full h-8 bg-slate-900 rounded-full overflow-hidden border border-slate-700 cursor-pointer active:scale-95 transition-transform" onMouseDown={handleTap}>
        <div className="absolute top-0 bottom-0 left-[42%] right-[42%] bg-emerald-500/50"></div>
        <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-amber-500/30"></div>
        <div className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_white]" style={{ left: `calc(${pos}% - 4px)` }}></div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {results.map((r, i) => (
          <span key={i} className={`text-2xl ${r === 'perfect' ? 'text-emerald-400' : r === 'good' ? 'text-amber-400' : 'text-red-500'}`}>
            {r === 'perfect' ? '◎' : r === 'good' ? '◯' : '×'}
          </span>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. メインアプリケーション
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shop');
  const [gold, setGold] = useState(100);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [potions, setPotions] = useState<Record<string, number>>({});
  const [unlockedRecipes, setUnlockedRecipes] = useState<string[]>(['healing']);
  const [unlockedLocations, setUnlockedLocations] = useState<string[]>(['forest', 'swamp', 'mine']);
  const [mysteriousPowder, setMysteriousPowder] = useState(0);

  // モーダル・UI状態
  const [showInv, setShowInv] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [mapDetail, setMapDetail] = useState<MapLocation | null>(null);
  const [gatheringLocation, setGatheringLocation] = useState<string | null>(null);
  const [gatheringCart, setGatheringCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState<{dialogue: string, potionWanted: string, state: 'waiting'|'negotiating'|'done'} | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<string | null>(null);
  const [cauldron, setCauldron] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{text: string, type: 'success'|'error'|'info'} | null>(null);

  // ------------------------------------------
  // セーブ・ロード機能
  // ------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem('witch_potion_save_v2');
    if (saved) {
      const d = JSON.parse(saved);
      setGold(d.gold); setInventory(d.inventory); setPotions(d.potions);
      setUnlockedRecipes(d.unlockedRecipes); setUnlockedLocations(d.unlockedLocations);
      setMysteriousPowder(d.mysteriousPowder);
    }
  }, []);

  useEffect(() => {
    const data = { gold, inventory, potions, unlockedRecipes, unlockedLocations, mysteriousPowder };
    localStorage.setItem('witch_potion_save_v2', JSON.stringify(data));
  }, [gold, inventory, potions, unlockedRecipes, unlockedLocations, mysteriousPowder]);

  const showMsg = (text: string, type: 'success'|'error'|'info' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // ------------------------------------------
  // お客さん
  // ------------------------------------------
  useEffect(() => {
    if (activeTab === 'shop' && !customer) {
      const timer = setTimeout(() => {
        const available = unlockedRecipes;
        const wanted = available[Math.floor(Math.random() * available.length)];
        const dial = CUSTOMER_DIALOGUES[Math.floor(Math.random() * CUSTOMER_DIALOGUES.length)];
        setCustomer({ dialogue: dial, potionWanted: wanted, state: 'waiting' });
        setNegotiationResult(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, customer, unlockedRecipes]);

  const handleNegotiation = (results: string[]) => {
    if (!customer) return;
    const perfectCount = results.filter(r => r === 'perfect').length;
    const badCount = results.filter(r => r === 'bad').length;
    let rank: 'perfect' | 'good' | 'bad' = 'good';
    let multiplier = 1.0;

    if (perfectCount === 3) { rank = 'perfect'; multiplier = 1.5; }
    else if (badCount >= 2) { rank = 'bad'; multiplier = 0.5; }

    const earns = Math.floor(POTIONS[customer.potionWanted].basePrice * multiplier);
    const reaction = SUCCESS_REACTIONS[rank][Math.floor(Math.random() * SUCCESS_REACTIONS[rank].length)];
    
    setGold(prev => prev + earns);
    setPotions(prev => ({ ...prev, [customer.potionWanted]: prev[customer.potionWanted] - 1 }));
    setNegotiationResult(`${reaction}\n（評価: ${rank === 'perfect' ? '大成功！1.5倍' : rank === 'good' ? '成功' : '失敗…0.5倍'} / 獲得: ${earns}G）`);
    setCustomer({ ...customer, state: 'done' });

    // 稀に粉をくれる謎のイベント
    if (rank === 'perfect' && Math.random() < 0.3) {
      setMysteriousPowder(prev => prev + 1);
      showMsg("特別なお礼に「不思議な粉」をもらった！", "success");
    }

    setTimeout(() => setCustomer(null), 5000);
  };

  // ------------------------------------------
  // 調合
  // ------------------------------------------
  const craft = () => {
    let targetId: string | null = null;
    for (const [id, p] of Object.entries(POTIONS)) {
      if (JSON.stringify(p.recipe) === JSON.stringify(cauldron)) { targetId = id; break; }
    }
    if (targetId) {
      const newInv = { ...inventory };
      Object.keys(cauldron).forEach(k => newInv[k] -= cauldron[k]);
      setInventory(newInv);
      setPotions(prev => ({ ...prev, [targetId!]: (prev[targetId!] || 0) + 1 }));
      setCauldron({});
      showMsg(`${POTIONS[targetId].name} が完成した！`, "success");
    } else {
      showMsg("調合に失敗した！材料がゴミになった…", "error");
      const newInv = { ...inventory };
      Object.keys(cauldron).forEach(k => newInv[k] -= cauldron[k]);
      setInventory(newInv);
      setCauldron({});
    }
  };

  // ------------------------------------------
  // 探索
  // ------------------------------------------
  const getWeight = (cart: Record<string, number>) => Object.entries(cart).reduce((sum, [id, qty]) => sum + INGREDIENTS[id].weight * qty, 0);

  const startGathering = (loc: MapLocation) => {
    if (gold < loc.cost) { showMsg("お金が足りないよ。", "error"); return; }
    setGold(prev => prev - loc.cost);
    setGatheringLocation(loc.id);
    setMapDetail(null);
    setGatheringCart({});
  };

  const finishGathering = () => {
    const newInv = { ...inventory };
    Object.entries(gatheringCart).forEach(([id, qty]) => newInv[id] = (newInv[id] || 0) + qty);
    setInventory(newInv);
    
    // レシピ発見ロジック（未開放のものだけ）
    const locked = Object.keys(POTIONS).filter(id => !unlockedRecipes.includes(id));
    if (locked.length > 0 && Math.random() < 0.25) {
      const found = locked[Math.floor(Math.random() * locked.length)];
      setUnlockedRecipes(prev => [...prev, found]);
      showMsg(`新しいレシピ「${POTIONS[found].name}」を見つけた！`, "success");
    } else {
      showMsg("無事に家に戻った。", "info");
    }
    setGatheringLocation(null);
  };

  // ------------------------------------------
  // UIパーツ
  // ------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-serif flex flex-col items-center select-none overflow-hidden">
      {msg && <div className={`fixed top-4 px-6 py-2 rounded-full shadow-lg z-[100] text-sm font-bold animate-bounce ${msg.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{msg.text}</div>}

      <header className="w-full max-w-md bg-slate-900/80 p-4 border-b border-amber-900/40 flex justify-between items-center z-50">
        <div className="text-amber-500 font-bold">💰 {gold} G</div>
        <div className="text-xs text-slate-500">魔女のポーション屋 v2.0</div>
      </header>

      <main className="flex-1 w-full max-w-md relative overflow-y-auto pb-24">
        
        {/* --- SHOP --- */}
        {activeTab === 'shop' && (
          <div className="p-4 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-amber-200 font-bold">お店</h2>
              <button onClick={() => setShowInv(true)} className="p-2 bg-slate-800 rounded-full border border-slate-700 shadow-lg text-xl">🎒</button>
            </div>

            <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 shadow-2xl relative min-h-[300px] flex flex-col items-center">
              {customer ? (
                <>
                  <div className="text-6xl mb-4 transition-transform hover:scale-110">🧙‍♂️</div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border-l-4 border-amber-600 text-sm mb-4 w-full italic">
                    「{customer.dialogue}」
                  </div>
                  {customer.state === 'waiting' && (
                    <div className="w-full text-center">
                      <p className="text-xs text-amber-400 mb-2">求: {POTIONS[customer.potionWanted].icon} {POTIONS[customer.potionWanted].name}</p>
                      {potions[customer.potionWanted] > 0 ? (
                        <button onClick={() => setCustomer({...customer, state: 'negotiating'})} className="w-full py-3 bg-amber-600 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">交渉する</button>
                      ) : <p className="text-slate-500 text-sm">（在庫がありません）</p>}
                    </div>
                  )}
                  {customer.state === 'negotiating' && <NegotiationMiniGame onComplete={handleNegotiation} />}
                  {negotiationResult && (
                    <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-xs text-center text-emerald-200 whitespace-pre-wrap animate-pulse">
                      {negotiationResult}
                    </div>
                  )}
                </>
              ) : <div className="mt-20 text-slate-500">次のお客さんを待っています...</div>}
            </div>
          </div>
        )}

        {/* --- ATELIER --- */}
        {activeTab === 'atelier' && (
          <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-emerald-200 font-bold">工房</h2>
              <button onClick={() => setShowRecipes(true)} className="p-2 bg-slate-800 rounded-full border border-slate-700 shadow-lg text-xl">📜</button>
            </div>

            <div className="bg-slate-800 p-8 rounded-full aspect-square border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center relative">
              <div className="text-6xl mb-2">🍲</div>
              <div className="flex flex-wrap justify-center gap-1 min-h-[40px]">
                {Object.entries(cauldron).map(([id, qty]) => <span key={id} className="text-xs bg-slate-900 px-2 py-1 rounded-full">{INGREDIENTS[id].icon} x{qty}</span>)}
              </div>
              <button onClick={craft} className="mt-4 px-6 py-2 bg-emerald-600 rounded-full font-bold shadow-lg active:scale-95 transition-transform">調合開始</button>
              <button onClick={() => setCauldron({})} className="absolute bottom-4 text-xs text-slate-500 underline">空にする</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Object.entries(inventory).map(([id, qty]) => qty > 0 && (
                <button key={id} onClick={() => setCauldron({...cauldron, [id]: (cauldron[id]||0)+1})} className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex flex-col items-center active:scale-90 transition-transform">
                  <span className="text-2xl">{INGREDIENTS[id].icon}</span>
                  <span className="text-[10px] text-amber-500">x{qty - (cauldron[id]||0)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- MAP --- */}
        {activeTab === 'map' && (
          <div className="p-4 h-full">
            <h2 className="text-xl text-blue-200 font-bold mb-4">世界地図</h2>
            
            {gatheringLocation ? (
              <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700">
                <h3 className="text-lg font-bold mb-4">{LOCATIONS[gatheringLocation].name}</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>カバン容量</span>
                    <span className={getWeight(gatheringCart) > MAX_WEIGHT ? 'text-red-500' : 'text-blue-400'}>{getWeight(gatheringCart)} / {MAX_WEIGHT} kg</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(getWeight(gatheringCart)/MAX_WEIGHT)*100}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-[250px] overflow-y-auto mb-4 p-2 bg-slate-950 rounded-xl">
                  {LOCATIONS[gatheringLocation].ingredients.map(id => (
                    <div key={id} className="flex items-center justify-between">
                      <div className="text-sm">{INGREDIENTS[id].icon} {INGREDIENTS[id].name}</div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" min="0" max="20" value={gatheringCart[id]||0} 
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            const testCart = {...gatheringCart, [id]: newVal};
                            if (getWeight(testCart) <= MAX_WEIGHT) setGatheringCart(testCart);
                          }}
                          className="w-24 accent-blue-500"
                        />
                        <span className="text-xs w-4">{gatheringCart[id]||0}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={finishGathering} className="w-full py-3 bg-blue-600 rounded-xl font-bold">家に戻る</button>
              </div>
            ) : (
              <div className="relative w-full aspect-square bg-amber-900/10 rounded-xl border border-amber-900/30 overflow-hidden shadow-inner">
                {/* 地図のテクスチャ背景的な演出 */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#8b5e3c_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                
                <div className="absolute left-[45%] top-[50%] flex flex-col items-center">
                  <div className="text-3xl">🏠</div>
                  <span className="text-[10px] bg-slate-900/80 px-1 rounded">我が家</span>
                </div>

                {Object.values(LOCATIONS).map(loc => {
                  const isSecret = loc.id === 'secret';
                  const isLocked = isSecret && !unlockedLocations.includes('secret');
                  return (
                    <div 
                      key={loc.id} 
                      className="absolute cursor-pointer flex flex-col items-center transition-transform hover:scale-110 active:scale-95"
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      onClick={() => isLocked ? showMsg("不思議な力を感じる…", "info") : setMapDetail(loc)}
                    >
                      <div className={`text-3xl p-2 rounded-full ${isLocked ? 'bg-black text-black grayscale' : ''}`}>
                        {isLocked ? '●' : loc.icon}
                      </div>
                      <span className="text-[10px] bg-slate-900/80 px-1 rounded">{isLocked ? '???' : loc.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 不思議な粉 */}
            {mysteriousPowder > 0 && !unlockedLocations.includes('secret') && (
              <button 
                onClick={() => {
                  setUnlockedLocations([...unlockedLocations, 'secret']);
                  setMysteriousPowder(prev => prev - 1);
                  showMsg("秘境の場所が浮かび上がった！", "success");
                }}
                className="mt-4 w-full p-3 bg-fuchsia-900/30 border border-fuchsia-500/50 rounded-xl text-fuchsia-200 text-xs font-bold animate-pulse"
              >
                不思議な粉を地図に振りかける (残り{mysteriousPowder})
              </button>
            )}
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {showInv && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-sm rounded-3xl p-6 relative border border-slate-700 shadow-2xl">
            <button onClick={() => setShowInv(false)} className="absolute top-4 right-4 text-2xl">×</button>
            <h3 className="text-lg font-bold mb-4 border-b border-slate-700 pb-2">在庫・持ち物</h3>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              <div className="col-span-2 text-xs text-amber-500 font-bold mb-1">【ポーション】</div>
              {Object.entries(potions).map(([id, qty]) => qty > 0 && (
                <div key={id} className="bg-slate-900 p-2 rounded-xl flex items-center gap-2">
                  <span>{POTIONS[id].icon}</span><span className="text-xs">{POTIONS[id].name}</span><span className="ml-auto font-bold">x{qty}</span>
                </div>
              ))}
              <div className="col-span-2 text-xs text-blue-400 font-bold mt-4 mb-1">【材料】</div>
              {Object.entries(inventory).map(([id, qty]) => qty > 0 && (
                <div key={id} className="bg-slate-900 p-2 rounded-xl flex items-center gap-2">
                  <span>{INGREDIENTS[id].icon}</span><span className="text-xs">{INGREDIENTS[id].name}</span><span className="ml-auto font-bold">x{qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRecipes && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative border border-amber-900/30 shadow-2xl">
            <button onClick={() => setShowRecipes(false)} className="absolute top-4 right-4 text-2xl">×</button>
            <h3 className="text-lg font-bold mb-4 text-amber-200 border-b border-amber-900/30 pb-2">魔女のレシピ帳</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {unlockedRecipes.map(id => (
                <div key={id} className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="font-bold text-amber-100 mb-1">{POTIONS[id].icon} {POTIONS[id].name}</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(POTIONS[id].recipe).map(([iId, q]) => (
                      <span key={iId} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full">{INGREDIENTS[iId].icon} {INGREDIENTS[iId].name} ×{q}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mapDetail && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center p-4">
          <div className="bg-slate-800 w-full max-w-sm rounded-t-3xl p-6 border-t-4 border-blue-600 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{mapDetail.icon} {mapDetail.name}</h3>
                <p className="text-xs text-slate-400">移動費: {mapDetail.cost} G</p>
              </div>
              <button onClick={() => setMapDetail(null)} className="text-2xl">×</button>
            </div>
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-2">採取可能な材料:</p>
              <div className="flex gap-2">
                {mapDetail.ingredients.map(i => <span key={i} className="bg-slate-900 px-2 py-1 rounded-lg text-xs">{INGREDIENTS[i].icon} {INGREDIENTS[i].name}</span>)}
              </div>
            </div>
            <button 
              onClick={() => startGathering(mapDetail)}
              className="w-full py-4 bg-blue-600 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
            >
              探索に出発する
            </button>
          </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <nav className="w-full max-w-md bg-slate-900 border-t border-slate-800 fixed bottom-0 z-50 flex">
        {[
          { id: 'shop', name: 'お店', icon: '🏪' },
          { id: 'atelier', name: '工房', icon: '🍲' },
          { id: 'map', name: '地図', icon: '🗺️' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`flex-1 py-4 flex flex-col items-center justify-center transition-all ${activeTab === t.id ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500' : 'text-slate-500'}`}>
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-bold mt-1">{t.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}