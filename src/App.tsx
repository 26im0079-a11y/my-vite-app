import  { useState, useEffect, useRef,  } from 'react';

// ==========================================
// 1. データ定義と型
// ==========================================
type Tab = 'shop' | 'atelier' | 'map';

interface Ingredient {
  id: string;
  name: string;
  weight: number;
  icon: string;
  desc: string;
}

interface Potion {
  id: string;
  name: string;
  recipe: Record<string, number>;
  basePrice: number;
  icon: string;
  desc: string;
}

interface Location {
  id: string;
  name: string;
  ingredients: string[];
  icon: string;
}

// アイテムデータ
const INGREDIENTS: Record<string, Ingredient> = {
  nightglow: { id: 'nightglow', name: '夜光草', weight: 2, icon: '🌿', desc: '暗闇で光る軽い草' },
  fairy_dust: { id: 'fairy_dust', name: '妖精の粉', weight: 1, icon: '✨', desc: '神秘的な粉' },
  bone_meal: { id: 'bone_meal', name: '骨粉', weight: 10, icon: '🦴', desc: '沼地で拾える古い骨の粉' },
  mandragora: { id: 'mandragora', name: 'マンドラゴラ', weight: 25, icon: '🌱', desc: '引っこ抜くと叫ぶ重い植物' },
  iron_ore: { id: 'iron_ore', name: '鉄鉱石', weight: 30, icon: '🪨', desc: 'ずっしり重い鉱石' },
  crystal: { id: 'crystal', name: '魔力結晶', weight: 15, icon: '💎', desc: '魔力を帯びた石' },
  dragon_scale: { id: 'dragon_scale', name: '竜の鱗', weight: 50, icon: '🐉', desc: '極めて重く、強大な魔力を持つ' },
};

// ポーションデータ
const POTIONS: Record<string, Potion> = {
  healing: { id: 'healing', name: '回復のポーション', recipe: { nightglow: 2, fairy_dust: 1 }, basePrice: 50, icon: '🧪', desc: '基本的な回復薬' },
  strength: { id: 'strength', name: '力のポーション', recipe: { mandragora: 1, bone_meal: 2 }, basePrice: 150, icon: '💪', desc: '一時的に力がみなぎる' },
  iron_skin: { id: 'iron_skin', name: '鉄壁の薬', recipe: { iron_ore: 1, crystal: 1, nightglow: 1 }, basePrice: 250, icon: '🛡️', desc: '体が鉄のように硬くなる' },
  elixir: { id: 'elixir', name: 'エリクサー', recipe: { dragon_scale: 1, mandragora: 1, fairy_dust: 3 }, basePrice: 1000, icon: '🌟', desc: '万能の秘薬' },
};

// マップデータ
const LOCATIONS: Record<string, Location> = {
  forest: { id: 'forest', name: '妖精の森', ingredients: ['nightglow', 'fairy_dust'], icon: '🌲' },
  swamp: { id: 'swamp', name: '死者の沼', ingredients: ['mandragora', 'bone_meal'], icon: '🌫️' },
  mine: { id: 'mine', name: '古い鉱山', ingredients: ['iron_ore', 'crystal'], icon: '⛏️' },
  secret: { id: 'secret', name: '竜の巣（秘境）', ingredients: ['dragon_scale', 'crystal'], icon: '🌋' },
};

const MAX_WEIGHT = 100;

// ==========================================
// 2. ミニゲーム用コンポーネント（交渉の振り子）
// ==========================================
const NegotiationMiniGame = ({ onComplete }: { onComplete: (results: string[]) => void }) => {
  const [pos, setPos] = useState(50);
  const [results, setResults] = useState<string[]>([]);
  const dirRef = useRef(1);
  const posRef = useRef(50);
  const reqRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.15; // 振り子の速度

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

    return () => cancelAnimationFrame(reqRef.current!);
  }, []);

  const handleTap = () => {
    if (results.length >= 3) return;
    
    const current = posRef.current;
    const distance = Math.abs(current - 50);
    let hit = 'bad';
    if (distance <= 8) hit = 'perfect'; // ど真ん中 (42 ~ 58)
    else if (distance <= 25) hit = 'good'; // 真ん中付近 (25 ~ 75)

    const newResults = [...results, hit];
    setResults(newResults);

    if (newResults.length === 3) {
      cancelAnimationFrame(reqRef.current!);
      setTimeout(() => onComplete(newResults), 1000);
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border-2 border-amber-900 shadow-inner my-4">
      <div className="text-center text-amber-200 mb-2 font-bold">交渉の振り子 (タップして止める: {3 - results.length}回)</div>
      
      {/* ゲージ本体 */}
      <div className="relative w-full h-8 bg-slate-900 rounded-full overflow-hidden border border-slate-700 cursor-pointer" onMouseDown={handleTap} onTouchStart={handleTap}>
        {/* 大成功ゾーン */}
        <div className="absolute top-0 bottom-0 left-[42%] right-[42%] bg-emerald-500/50"></div>
        {/* 成功ゾーン */}
        <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-amber-500/30"></div>
        {/* インジケーター針 */}
        <div 
          className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_white] transition-none pointer-events-none"
          style={{ left: `calc(${pos}% - 4px)` }}
        ></div>
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
// 3. メインアプリケーション
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shop');
  
  // セーブデータ関連の状態
  const [gold, setGold] = useState(100);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [potions, setPotions] = useState<Record<string, number>>({});
  const [unlockedRecipes, setUnlockedRecipes] = useState<string[]>(['healing']);
  const [unlockedLocations, setUnlockedLocations] = useState<string[]>(['forest', 'swamp', 'mine']);
  const [mysteriousPowder, setMysteriousPowder] = useState(0);

  // UI用の一時状態
  const [msg, setMsg] = useState<{text: string, type: 'info'|'success'|'error'} | null>(null);
  
  // お客さん関連
  const [customer, setCustomer] = useState<{type: 'normal'|'mysterious', potionWanted: string, state: 'waiting'|'negotiating'|'done'} | null>(null);
  const [dialogue, setDialogue] = useState("いらっしゃい。何かお探し？");
  
  // クラフト関連
  const [cauldron, setCauldron] = useState<Record<string, number>>({});

  // 探索（カバン）関連
  const [gatheringCart, setGatheringCart] = useState<Record<string, number>>({});
  const [gatheringLocation, setGatheringLocation] = useState<string | null>(null);

  // トースト表示用ヘルパー
  const showMsg = (text: string, type: 'info'|'success'|'error' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // ------------------------------------------
  // ゲームロジック：お客さんの来店
  // ------------------------------------------
  useEffect(() => {
    if (activeTab === 'shop' && !customer) {
      const timer = setTimeout(() => {
        const isMysterious = Math.random() < 0.2 && unlockedRecipes.includes('strength');
        let wanted = 'healing';
        if (isMysterious) {
          wanted = Math.random() < 0.5 ? 'strength' : 'iron_skin';
        } else {
          const available = unlockedRecipes;
          wanted = available[Math.floor(Math.random() * available.length)];
        }
        
        setCustomer({ type: isMysterious ? 'mysterious' : 'normal', potionWanted: wanted, state: 'waiting' });
        
        if (isMysterious) {
          setDialogue("……求めているのは、特別な力を持つ薬だ。持っているか？");
        } else {
          setDialogue(`「${POTIONS[wanted].name}」を一つ、売ってくれないか？`);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, customer, unlockedRecipes]);

  // ------------------------------------------
  // ゲームロジック：交渉完了
  // ------------------------------------------
  const handleNegotiationComplete = (results: string[]) => {
    if (!customer) return;

    const perfectCount = results.filter(r => r === 'perfect').length;
    const badCount = results.filter(r => r === 'bad').length;
    
    const potion = POTIONS[customer.potionWanted];
    let multiplier = 1.0;
    
    if (perfectCount === 3) {
      multiplier = 1.5;
      setDialogue("「また来るわ！お得意様、ってやつかしらね。」（大成功！1.5倍で売却）");
    } else if (badCount >= 2) {
      multiplier = 0.5;
      setDialogue("「あんた、ちょっと失礼だぜ。もういいよ…」（失敗…半額で買い叩かれた）");
    } else {
      multiplier = 1.0;
      setDialogue("「うん、悪くないポーションだ。」（成功！通常価格で売却）");
    }

    // 謎の客の場合は粉を渡す
    if (customer.type === 'mysterious' && badCount < 2) {
      setDialogue("「……約束の品だ。これを地図に振りかけるといい。」");
      setMysteriousPowder(prev => prev + 1);
      showMsg("不思議な粉を手に入れた！", "success");
    } else {
      const earned = Math.floor(potion.basePrice * multiplier);
      setGold(prev => prev + earned);
      showMsg(`${earned}G 売り上げた！`, "success");
    }

    setPotions(prev => ({ ...prev, [customer.potionWanted]: prev[customer.potionWanted] - 1 }));
    setCustomer(prev => prev ? { ...prev, state: 'done' } : null);

    setTimeout(() => {
      setCustomer(null);
      setDialogue("いらっしゃい。何かお探し？");
    }, 4000);
  };

  // ------------------------------------------
  // ゲームロジック：クラフト（調合）
  // ------------------------------------------
  const addToCauldron = (itemId: string) => {
    if ((inventory[itemId] || 0) <= (cauldron[itemId] || 0)) return;
    setCauldron(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const clearCauldron = () => setCauldron({});

  const tryCraft = () => {
    // 釜の中身とレシピが完全一致するか確認
    let craftedPotionId: string | null = null;
    
    for (const [pId, potion] of Object.entries(POTIONS)) {
      const recipe = potion.recipe;
      const recipeKeys = Object.keys(recipe);
      const cauldronKeys = Object.keys(cauldron);
      
      if (recipeKeys.length !== cauldronKeys.length) continue;
      
      let match = true;
      for (const k of recipeKeys) {
        if (recipe[k] !== cauldron[k]) match = false;
      }
      
      if (match) { craftedPotionId = pId; break; }
    }

    if (craftedPotionId) {
      // 消費
      const newInv = { ...inventory };
      Object.keys(cauldron).forEach(k => {
        newInv[k] -= cauldron[k];
      });
      setInventory(newInv);
      setPotions(prev => ({ ...prev, [craftedPotionId!]: (prev[craftedPotionId!] || 0) + 1 }));
      setCauldron({});
      
      // 未解放レシピを自力で作った場合、解放する
      if (!unlockedRecipes.includes(craftedPotionId)) {
        setUnlockedRecipes(prev => [...prev, craftedPotionId!]);
        showMsg(`新しいレシピ「${POTIONS[craftedPotionId].name}」を閃いた！`, "success");
      } else {
        showMsg(`${POTIONS[craftedPotionId].name} を作成した！`, "success");
      }
    } else {
      showMsg("調合失敗！ドロドロの灰になった…（材料は失われました）", "error");
      const newInv = { ...inventory };
      Object.keys(cauldron).forEach(k => { newInv[k] -= cauldron[k]; });
      setInventory(newInv);
      setCauldron({});
    }
  };

  // ------------------------------------------
  // ゲームロジック：探索（パッキング）
  // ------------------------------------------
  const getCartWeight = () => {
    let w = 0;
    Object.keys(gatheringCart).forEach(k => {
      w += INGREDIENTS[k].weight * gatheringCart[k];
    });
    return w;
  };

  const updateCart = (itemId: string, delta: number) => {
    const current = gatheringCart[itemId] || 0;
    if (current + delta < 0) return;
    
    if (delta > 0) {
      const nextWeight = getCartWeight() + INGREDIENTS[itemId].weight;
      if (nextWeight > MAX_WEIGHT) {
        showMsg("鞄の重量オーバーだ！", "error");
        return;
      }
    }
    setGatheringCart(prev => ({ ...prev, [itemId]: current + delta }));
  };

  const finishGathering = () => {
    // 鞄の中身をインベントリに移す
    const newInv = { ...inventory };
    Object.keys(gatheringCart).forEach(k => {
      newInv[k] = (newInv[k] || 0) + gatheringCart[k];
    });
    setInventory(newInv);
    
    // ランダムイベント：レシピ発見
    if (Math.random() < 0.2) {
      const locked = Object.keys(POTIONS).filter(p => !unlockedRecipes.includes(p) && p !== 'elixir'); // エリクサー以外
      if (locked.length > 0) {
        const found = locked[Math.floor(Math.random() * locked.length)];
        setUnlockedRecipes(prev => [...prev, found]);
        showMsg(`探索中に古い紙片を見つけた！「${POTIONS[found].name}」のレシピだ！`, "success");
      } else {
        showMsg("無事に帰還した。", "info");
      }
    } else {
      showMsg("無事に帰還した。", "info");
    }

    setGatheringLocation(null);
    setGatheringCart({});
  };

  const usePowder = () => {
    if (mysteriousPowder > 0 && !unlockedLocations.includes('secret')) {
      setMysteriousPowder(prev => prev - 1);
      setUnlockedLocations(prev => [...prev, 'secret']);
      showMsg("地図に新たな場所「竜の巣」が浮かび上がった！", "success");
    }
  };


  // ==========================================
  // レンダリング関数
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-serif flex flex-col items-center">
      
      {/* トースト通知 */}
      {msg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 text-white font-bold transition-all ${
          msg.type === 'success' ? 'bg-emerald-600' : msg.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {msg.text}
        </div>
      )}

      {/* ヘッダー（ステータス） */}
      <header className="w-full max-w-md bg-slate-950 p-4 border-b border-amber-900/50 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="text-xl text-amber-500 font-bold border-b border-amber-500/30">💰 {gold} G</div>
        {mysteriousPowder > 0 && <div className="text-sm text-fuchsia-400">✨ 謎の粉: {mysteriousPowder}</div>}
      </header>

      {/* メイン画面 */}
      <main className="flex-1 w-full max-w-md p-4 overflow-y-auto pb-24">
        
        {/* --- 1. SHOP (お店) --- */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            <h2 className="text-2xl text-amber-200 text-center font-bold">お店（Shop）</h2>
            
            {/* 接客エリア */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative min-h-[250px]">
              {customer ? (
                <div className="flex flex-col items-center">
                  <div className="text-6xl mb-4">
                    {customer.type === 'mysterious' ? '🧥' : '🧙‍♀️'}
                  </div>
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border-l-4 border-amber-600 w-full mb-4 shadow-inner text-sm leading-relaxed">
                    {dialogue}
                  </div>
                  
                  {customer.state === 'waiting' && (
                    <div className="w-full">
                      <div className="text-center text-sm mb-2">要求: {POTIONS[customer.potionWanted].icon} {POTIONS[customer.potionWanted].name}</div>
                      {potions[customer.potionWanted] > 0 ? (
                        <button 
                          onClick={() => setCustomer(prev => prev ? { ...prev, state: 'negotiating' } : null)}
                          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg"
                        >
                          売る（交渉開始！）
                        </button>
                      ) : (
                        <button disabled className="w-full py-3 bg-slate-700 text-slate-500 font-bold rounded-lg">
                          在庫がありません
                        </button>
                      )}
                    </div>
                  )}

                  {customer.state === 'negotiating' && (
                    <div className="w-full">
                      <NegotiationMiniGame onComplete={handleNegotiationComplete} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 pt-10">
                  <div className="text-4xl mb-2">🚪</div>
                  <p>お客さんを待っています...</p>
                </div>
              )}
            </div>

            {/* 在庫表示 */}
            <div className="bg-slate-800/50 p-4 rounded-xl">
              <h3 className="text-amber-300 mb-3 text-sm font-bold border-b border-slate-700 pb-1">ポーションの在庫</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(potions).filter(k => potions[k] > 0).length === 0 && <span className="text-xs text-slate-500">在庫なし</span>}
                {Object.keys(potions).map(id => potions[id] > 0 && (
                  <div key={id} className="bg-slate-900 p-2 rounded flex justify-between text-sm">
                    <span>{POTIONS[id].icon} {POTIONS[id].name}</span>
                    <span className="text-amber-500 font-bold">x{potions[id]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. ATELIER (工房) --- */}
        {activeTab === 'atelier' && (
          <div className="space-y-6">
            <h2 className="text-2xl text-amber-200 text-center font-bold">工房（Atelier）</h2>
            
            {/* 大釜エリア */}
            <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 shadow-xl text-center">
              <div className="text-5xl mb-4 relative inline-block">
                🍲
                {Object.keys(cauldron).length > 0 && (
                  <span className="absolute -top-2 -right-4 text-2xl animate-bounce">✨</span>
                )}
              </div>
              
              <div className="min-h-[60px] bg-slate-900 p-2 rounded-lg mb-4 flex flex-wrap gap-2 justify-center items-center border border-slate-700">
                {Object.keys(cauldron).length === 0 && <span className="text-xs text-slate-500">材料を入れてください</span>}
                {Object.keys(cauldron).map(id => (
                  <span key={id} className="bg-slate-800 px-2 py-1 rounded text-sm text-slate-300">
                    {INGREDIENTS[id].icon} x{cauldron[id]}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={clearCauldron} className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-bold">リセット</button>
                <button onClick={tryCraft} className="flex-2 w-2/3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-lg">調合する！</button>
              </div>
            </div>

            {/* 素材一覧 */}
            <div className="bg-slate-800/50 p-4 rounded-xl">
              <h3 className="text-amber-300 mb-3 text-sm font-bold border-b border-slate-700 pb-1">手持ちの材料 (タップで釜へ)</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(inventory).filter(k => inventory[k] > 0).length === 0 && <span className="text-xs text-slate-500">材料がありません</span>}
                {Object.keys(inventory).map(id => inventory[id] > 0 && (
                  <button 
                    key={id} 
                    onClick={() => addToCauldron(id)}
                    className="bg-slate-900 p-2 rounded-lg text-center hover:bg-slate-700 transition active:scale-95 flex flex-col items-center justify-center relative border border-slate-700"
                  >
                    <span className="text-2xl mb-1">{INGREDIENTS[id].icon}</span>
                    <span className="text-[10px] text-slate-300 truncate w-full">{INGREDIENTS[id].name}</span>
                    <span className="absolute top-1 right-1 text-[10px] bg-slate-800 px-1 rounded text-amber-400">x{(inventory[id] || 0) - (cauldron[id] || 0)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* レシピ帳 */}
            <div className="bg-slate-800/50 p-4 rounded-xl">
              <h3 className="text-amber-300 mb-3 text-sm font-bold border-b border-slate-700 pb-1">レシピ帳</h3>
              <div className="space-y-2">
                {unlockedRecipes.map(id => (
                  <div key={id} className="bg-slate-900 p-3 rounded-lg border border-amber-900/30">
                    <div className="text-sm font-bold text-amber-100 flex items-center gap-2">
                      {POTIONS[id].icon} {POTIONS[id].name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex gap-2 flex-wrap">
                      {Object.entries(POTIONS[id].recipe).map(([iId, qty]) => (
                        <span key={iId} className="bg-slate-800 px-1.5 py-0.5 rounded">{INGREDIENTS[iId].name} x{qty}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 3. MAP (マップ) --- */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <h2 className="text-2xl text-amber-200 text-center font-bold">地図（Map）</h2>

            {gatheringLocation ? (
              // 探索中（パッキング）UI
              <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 shadow-xl">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  {LOCATIONS[gatheringLocation].icon} {LOCATIONS[gatheringLocation].name} で採集
                </h3>
                <p className="text-xs text-slate-400 mb-6">カバンの重量を気にしながら、持ち帰るものを詰め込もう。</p>

                {/* 重量ゲージ */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">カバンの重さ</span>
                    <span className={`${getCartWeight() > MAX_WEIGHT * 0.8 ? 'text-red-400' : 'text-amber-400'} font-bold`}>
                      {getCartWeight()} / {MAX_WEIGHT} kg
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full transition-all ${getCartWeight() >= MAX_WEIGHT ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (getCartWeight() / MAX_WEIGHT) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* アイテムリスト */}
                <div className="space-y-3 mb-6">
                  {LOCATIONS[gatheringLocation].ingredients.map(id => (
                    <div key={id} className="bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-700">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{INGREDIENTS[id].icon}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-200">{INGREDIENTS[id].name}</div>
                          <div className="text-xs text-slate-500">重さ: {INGREDIENTS[id].weight}kg</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-2 py-1">
                        <button onClick={() => updateCart(id, -1)} className="text-slate-400 hover:text-white px-2 text-lg font-bold">-</button>
                        <span className="w-6 text-center text-amber-400 font-bold">{gatheringCart[id] || 0}</span>
                        <button onClick={() => updateCart(id, 1)} className="text-slate-400 hover:text-white px-2 text-lg font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => {setGatheringLocation(null); setGatheringCart({});}} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg font-bold">やめる</button>
                  <button onClick={finishGathering} className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-lg">帰還する</button>
                </div>
              </div>
            ) : (
              // マップ全体表示 UI
              <div className="space-y-4">
                <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-900/50">
                  <p className="text-sm text-amber-200/70 mb-4 text-center">古ぼけた地図が広がっている。どこへ探索に行こうか？</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {unlockedLocations.map(id => (
                      <button 
                        key={id}
                        onClick={() => setGatheringLocation(id)}
                        className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-700 transition active:scale-95 border border-slate-700 text-left relative overflow-hidden"
                      >
                        <span className="text-4xl z-10">{LOCATIONS[id].icon}</span>
                        <div className="z-10">
                          <div className="font-bold text-slate-100">{LOCATIONS[id].name}</div>
                          <div className="text-xs text-slate-400 mt-1">採集: {LOCATIONS[id].ingredients.map(i => INGREDIENTS[i].name).join(', ')}</div>
                        </div>
                        {id === 'secret' && <div className="absolute inset-0 bg-fuchsia-900/20 z-0 animate-pulse"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 不思議な粉を使うボタン */}
                {mysteriousPowder > 0 && !unlockedLocations.includes('secret') && (
                  <button 
                    onClick={usePowder}
                    className="w-full p-4 bg-fuchsia-900/40 border border-fuchsia-500/50 rounded-xl text-fuchsia-200 font-bold hover:bg-fuchsia-800/60 transition shadow-[0_0_15px_rgba(217,70,239,0.2)]"
                  >
                    ✨ 不思議な粉を地図に撒く (残り{mysteriousPowder}個)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* フッターナビゲーション */}
      <nav className="w-full max-w-md bg-slate-950 border-t border-slate-800 fixed bottom-0 z-20 flex">
        {[
          { id: 'shop', name: 'お店', icon: '🏪' },
          { id: 'atelier', name: '工房', icon: '🍲' },
          { id: 'map', name: '地図', icon: '🗺️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 py-4 flex flex-col items-center justify-center transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500' : 'text-slate-500 hover:bg-slate-900'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-bold">{tab.name}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}