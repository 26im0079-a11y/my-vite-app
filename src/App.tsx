import { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 定数データ定義（アイテム・ポーション・マップ）
// ==========================================
type Tab = 'shop' | 'atelier' | 'map';

interface Ingredient { id: string; name: string; weight: number; icon: string; desc: string; }
interface Potion { id: string; name: string; recipe: Record<string, number>; basePrice: number; icon: string; desc: string; }
interface MapLocation { id: string; name: string; ingredients: string[]; recipes: string[]; icon: string; x: number; y: number; cost: number; }

const INGREDIENTS: Record<string, Ingredient> = {
  // 妖精の森
  nightglow: { id: 'nightglow', name: '夜光草', weight: 2, icon: '🌿', desc: '暗闇で光る草' },
  fairy_dust: { id: 'fairy_dust', name: '妖精の粉', weight: 1, icon: '✨', desc: '神秘的な粉' },
  // 死者の沼 (4種)
  mandragora: { id: 'mandragora', name: 'マンドラゴラ', weight: 25, icon: '🌱', desc: '叫ぶ重い植物' },
  bone_meal: { id: 'bone_meal', name: '骨粉', weight: 10, icon: '🦴', desc: '古い骨の粉' },
  swamp_water: { id: 'swamp_water', name: '濁った沼水', weight: 5, icon: '💧', desc: '毒素を含む水' },
  poison_toad: { id: 'poison_toad', name: '猛毒ガエル', weight: 15, icon: '🐸', desc: '強力な毒を持つ' },
  // 古い鉱山 (5種)
  iron_ore: { id: 'iron_ore', name: '鉄鉱石', weight: 30, icon: '🪨', desc: 'ずっしり重い鉱石' },
  crystal: { id: 'crystal', name: '魔力結晶', weight: 15, icon: '💎', desc: '魔力を帯びた石' },
  gold_ore: { id: 'gold_ore', name: '金鉱石', weight: 20, icon: '🟡', desc: '価値の高い鉱石' },
  fire_stone: { id: 'fire_stone', name: '炎の石', weight: 10, icon: '🔥', desc: '熱を放つ石' },
  bat_wing: { id: 'bat_wing', name: 'コウモリの羽', weight: 5, icon: '🦇', desc: '反響する羽' },
  // 竜の巣 (5種)
  dragon_scale: { id: 'dragon_scale', name: '竜の鱗', weight: 50, icon: '🐉', desc: '極めて重い秘宝' },
  dragon_tear: { id: 'dragon_tear', name: '竜の涙', weight: 5, icon: '💧', desc: '純粋な魔力の塊' },
  phoenix_feather: { id: 'phoenix_feather', name: '不死鳥の羽', weight: 2, icon: '🪶', desc: '生命力の象徴' },
  ancient_ash: { id: 'ancient_ash', name: '太古の灰', weight: 8, icon: '🌫', desc: '大爆発の残骸' },
  star_shard: { id: 'star_shard', name: '星の欠片', weight: 12, icon: '⭐', desc: '宇宙からの贈り物' },
};

const POTIONS: Record<string, Potion> = {
  healing: { id: 'healing', name: '回復のポーション', recipe: { nightglow: 2, fairy_dust: 1 }, basePrice: 50, icon: '🧪', desc: '基本の傷薬' },
  strength: { id: 'strength', name: '力のポーション', recipe: { mandragora: 1, bone_meal: 1, swamp_water: 2 }, basePrice: 150, icon: '💪', desc: '力がみなぎる薬' },
  poison: { id: 'poison', name: '猛毒の瓶', recipe: { poison_toad: 2, swamp_water: 1 }, basePrice: 120, icon: '☠️', desc: '危険な劇薬' },
  iron_skin: { id: 'iron_skin', name: '鉄壁の薬', recipe: { iron_ore: 1, gold_ore: 1, fire_stone: 1 }, basePrice: 300, icon: '🛡️', desc: '体を鉄にする薬' },
  explosion: { id: 'explosion', name: '爆発薬', recipe: { fire_stone: 2, ancient_ash: 1, bone_meal: 1 }, basePrice: 400, icon: '💣', desc: '投げると爆発する' },
  echo: { id: 'echo', name: '反響の薬', recipe: { bat_wing: 2, nightglow: 1, crystal: 1 }, basePrice: 200, icon: '🔊', desc: '感覚を鋭くする' },
  elixir: { id: 'elixir', name: 'エリクサー', recipe: { dragon_scale: 1, phoenix_feather: 1, dragon_tear: 1 }, basePrice: 1500, icon: '🌟', desc: '伝説の秘薬' },
  magic_polish: { id: 'magic_polish', name: '魔力研磨液', recipe: { crystal: 2, fairy_dust: 2, star_shard: 1 }, basePrice: 800, icon: '✨', desc: '武器に魔力を付与' },
  golden_syrup: { id: 'golden_syrup', name: '黄金のシロップ', recipe: { gold_ore: 1, dragon_tear: 1, fairy_dust: 1 }, basePrice: 1000, icon: '🍯', desc: '至高の甘み' },
};

const LOCATIONS: Record<string, MapLocation> = {
  forest: { id: 'forest', name: '妖精の森', ingredients: ['nightglow', 'fairy_dust'], recipes: [], icon: '🌲', x: 20, y: 70, cost: 0 },
  swamp: { id: 'swamp', name: '死者の沼', ingredients: ['mandragora', 'bone_meal', 'swamp_water', 'poison_toad'], recipes: ['strength', 'poison'], icon: '🌫️', x: 70, y: 30, cost: 30 },
  mine: { id: 'mine', name: '古い鉱山', ingredients: ['iron_ore', 'crystal', 'gold_ore', 'fire_stone', 'bat_wing'], recipes: ['iron_skin', 'explosion', 'echo'], icon: '⛏️', x: 40, y: 20, cost: 50 },
  secret: { id: 'secret', name: '竜の巣', ingredients: ['dragon_scale', 'dragon_tear', 'phoenix_feather', 'ancient_ash', 'star_shard'], recipes: ['elixir', 'magic_polish', 'golden_syrup'], icon: '🌋', x: 80, y: 80, cost: 100 },
};

const MAX_WEIGHT = 100;
const RECIPE_WEIGHT = 10;

// ==========================================
// 2. セリフデータ（各20パターン）
// ==========================================
const DIALOGUES: Record<string, string[]> = {
  healing: [
    "スライムに噛まれちまってな。ちょっと回復を頼む。", "風邪を引いたみたいだ。普通のポーションでいい。", "庭仕事で擦り傷をね。一番安いやつでいいよ。", "ゴブリンの矢がかすって痛いんだ。", "子供が木から落ちてね、念のために持っておきたい。", "修行中に石につまづいてさ……恥ずかしいけど薬をくれ。", "なんだか今日は体がだるいんだ。", "少し胃の調子が悪くてね。", "最近、肩こりが酷くて。癒やしてくれないか？", "ペットの犬が怪我をしたんだ、使えるかな？", "ギルドの試験でボロボロにされたよ……。", "長旅で足がパンパンだ。回復薬を頼む。", "森で転んで膝をすりむいたの。", "料理中に火傷したんだ、すぐに効くやつを！", "ちょっと飲みすぎた……二日酔いに効くか？", "寝違えて首が痛い。治してくれ。", "蜂に刺された！早く腫れを引かせたい！", "冒険者の基本、回復ポーションを一つ補充だ。", "剣の稽古で打ち身だらけさ。", "ただのお守り代わりに一つ買っていくよ。"
  ],
  strength: [
    "力が欲しい……すべてを捩じ伏せる力が！", "明日の腕相撲大会、絶対に負けられないんだ！", "あの重い岩をどかさなきゃいけない。力を貸してくれ。", "ドラゴンと戦うんだ。俺の腕力を限界突破させてくれ！", "最近、剣を振るのが重く感じてな……気付けの一杯を。", "荷車の車輪が沼にハマって動かないんだ。怪力が必要だ。", "力仕事が山積みでね。一気に片付けたいんだ。", "宿敵にリベンジする時が来た。最強の力をくれ！", "もっと筋肉を……筋肉をパンパンに膨らませたいんだ！", "扉が開かないんだよ。物理でぶち破るための薬を！", "オーガと殴り合う約束をした。負けたくねえ。", "うちの嫁が強すぎてな……今日こそ言い返したいんだ。", "村の綱引き大会で英雄になりたいんだよ。", "どうしても持ち上げたい宝箱があるんだ！", "魔王の城の門、俺の拳でこじ開けてやる！", "俺の力はこんなもんじゃない……引き出してくれ！", "大木を一人で切り倒さないといけないんだ。", "鍛冶のハンマーが最近重くてね。", "もっと強く……ただ純粋な暴力が欲しい。", "自分の限界を知りたいんだ。力のポーションをくれ。"
  ],
  poison: [
    "地下室にネズミが湧いてね。一網打尽にしたいんだ。", "……誰にも言わないでくれ。強力な『毒』が欲しい。", "武器に塗るための劇薬を探している。", "沼の怪物を退治する。毒には毒で対抗するのさ。", "……少し、静かにさせたいヤツがいてね。", "害虫駆除に使いたいんだ。一番強いやつを頼む。", "暗殺ギルドの者だ。仕事で必要になった。", "……旦那のスープにちょっとしたスパイスをね。", "隣の畑の雑草を根こそぎ枯らしたいんだ。", "危険な毒の知識が必要なんだ、研究用に一つ。", "……どうしても勝てない相手がいる。手段は選ばん。", "魔物の巣穴に投げ込んで一掃してやるんだ。", "自分の毒耐性を試したい。俺は死なない……はずだ。", "……これはただの掃除用だ。変な勘違いをするなよ？", "拷問部屋の在庫が切れた。一つ譲ってくれ。", "罠に仕掛けるための強力な毒液を探してる。", "……裏切者には、苦痛を伴う罰が必要だ。", "闘技場の剣に、少し細工をしたくてな。", "どうしても腐らせたいものがあるんだ。", "……ふふふ。これで計画は完璧だ。"
  ],
  iron_skin: [
    "重い鎧は肩が凝る。この肌を鉄に変えたいんだ。", "オークの棍棒を素肌で受け止めてみたい。", "トゲトゲの迷宮に挑む。肌を硬くしておきたい。", "落石地帯を通るんだ。体が鋼になれば安心だろ？", "刃物を持った強盗が出没してね。防刃の薬を。", "火の粉を浴びる仕事でね。肌を守りたいんだ。", "竜の爪も弾き返す、無敵の肉体が欲しい！", "……絶対に傷つきたくない。心も体もな。", "防具を買う金がない。薬で代用させてくれ。", "暗殺者に狙われている。寝込みを襲われても大丈夫なように。", "蜂の巣を素手で駆除したいんだ！", "針の山を歩く修行があるんだよ……。", "俺の腹筋を、本当の鉄の塊にしてくれ！", "盾が壊れちまってな。俺自身が盾になるしかない。", "乱戦に飛び込む。かすり傷ひとつ負いたくないぜ。", "熊と素手でレスリングをする約束があるんだ。", "皮膚を硬くして、寒さも痛みも忘れさせたい。", "鉄壁の防御……それこそが最強の鉾だと思わないか？", "俺の柔肌を、今日だけは鋼の要塞に変えてくれ！", "隕石が落ちてきても弾き返せる薬を頼む。"
  ],
  explosion: [
    "邪魔な岩山を吹き飛ばしたいんだ。爆発薬をくれ！", "ド派手な花火を上げたい気分でね。爆発する薬はないか？", "魔物の群れを一瞬で消し去りたい。一番強力な爆弾を。", "……金庫の扉がどうしても開かなくてね。", "閉ざされた道をこじ開けるための爆発力が欲しい。", "坑道で新しいルートを掘削する。手っ取り早い薬を。", "……全てを破壊したい衝動に駆られているんだ。", "敵の陣地に放り込む、最高のプレゼントをくれ！", "バンッ！と爽快に何かが弾ける音を聞きたいんだ。", "古城の壁に大穴を開けたい。強力なやつを頼む。", "……証拠隠滅に、跡形もなく消し飛ぶ薬が必要だ。", "氷の山を溶かすんじゃない、粉々に砕きたいんだ。", "ゴブリンの巣に挨拶代わりの一発を放ちたい。", "祭りのクライマックスに、ドカンと一発お願いしたい。", "俺の怒りを、この爆発薬に乗せてぶつけてやる！", "……爆発の芸術。それを私に見せてくれないか？", "扉の鍵を失くした。もう丸ごと吹き飛ばすしかない。", "危険なのは承知の上だ。最高火力を頼む！", "敵の船の底に仕掛けたいんだ。水には強いか？", "……この街ごと、吹き飛ばしてしまいたい気分だ。"
  ],
  echo: [
    "暗闇でも敵の位置を知りたい。感覚を鋭くする薬を。", "森の中で迷った仲間を探す。遠くの音を聞きたいんだ。", "隠し扉の反響音を聞き分けたい。耳を良くしてくれ。", "スパイの仕事だ。隣の部屋の密談を盗み聞きしたい。", "……誰かにつけられている気がする。気配を感じたい。", "洞窟の奥にいる魔物の息遣いを察知したい。", "音楽家の耳を取り戻したいんだ。音がぼやけてね。", "透明な敵と戦う。音だけが頼りなんだ。", "遠くで呼ぶ愛しい人の声を聞き逃したくない。", "感覚を研ぎ澄まし、世界と一体化したいんだ。", "……静寂の中で、自分の心音すら聞きたい気分だ。", "敵の弓矢が空を切る音を、0.1秒早く感知したい。", "夜の森の囁きをすべて理解できるようになりたい。", "……嘘をついているやつの心拍数を聞き分けたいんだ。", "暗殺者の足音を絶対に逃さないための薬を。", "遠くの街の鐘の音まで聞こえる薬はないか？", "五感を限界まで引き上げ、超越者になりたい。", "地下水脈の流れる音を探している。ダウジング用に。", "……俺の感覚は鈍りすぎた。昔の鋭さを取り戻したい。", "反響の薬……コウモリのように闇を生きるために。"
  ],
  elixir: [
    "伝説のエリクサー……ついにここまで辿り着いたか。", "不治の病に伏せる姫を救うため、万能薬を譲ってくれ！", "俺の寿命を延ばしたい。いや、永遠の命が欲しい！", "死の淵にある友を救えるのは、この秘薬だけだ！", "どんな呪いも解き放つという奇跡の薬。言い値で買おう。", "……私のすべてを失ってもいい。エリクサーをくれ！", "世界を救う戦いに挑む。最後のお守りにしたい。", "神の領域に触れる薬……その輝きを拝ませてくれ。", "王の勅命だ。エリクサーを城へ持ち帰らねばならん。", "これがあれば、死者さえも蘇ると聞いたが……本当か？", "究極の錬金術の結晶。君の腕を信じて買いに来た。", "……過去の過ちを帳消しにする力、それが入っているのか？", "私の失われた右腕も、これなら元通りになるはずだ！", "魔王の瘴気に侵された。これで浄化するしかない！", "この秘薬を手に入れるためなら、国一つ売ってもいい。", "……命の源、純粋な奇跡。私に扱えるだろうか。", "一族に伝わる病を、私の代で終わらせたいんだ。", "神々に喧嘩を売る。このエリクサーが俺の保険だ。", "ただ飲んでみたいんだ。究極の味がどんなものか。", "君の最高傑作、伝説の万能薬……私に売ってくれ。"
  ],
  magic_polish: [
    "この古びた名剣に、かつての魔力を取り戻させたい。", "武器が光り輝く研磨液があると聞いてね。", "私の杖の魔力伝導率を上げたいんだ。最高の研磨を。", "鈍ら刀だが、魔力をまとえば伝説の剣になるはずだ！", "……俺の暗器に、見えない魔力の刃を付与してくれ。", "魔法騎士団の試験だ。剣の輝きで試験官を圧倒したい。", "武具の手入れは一流の液で。君の店の品が最高だと聞いた。", "ただ光るだけじゃない、魔力を帯びる研磨液が欲しい。", "祖父の形見の盾をピカピカにして、魔力も宿らせたい。", "……これを塗れば、ただの木の棒も魔剣になるって本当か？", "竜の鱗を切り裂くため、剣の切れ味を魔法で極限まで高めたい。", "私の美しい槍を、さらに星のように輝かせたいの。", "……呪われた武具を浄化し、新たな力を与える液を。", "武闘大会に出る。武器の見た目から相手を威圧したいんだ。", "魔法陣を描くための特殊なインク代わりにならないか？", "俺の矢じりに塗る。一発必中の魔法の矢になるはずだ。", "……この鉄の爪に魔力を宿らせて、奴を引き裂く。", "武器屋を開くんだ。展示品の剣を魔力で輝かせたくてね。", "ただの飾り剣だが、夜光るようにしてくれないか？", "究極の魔力研磨液……私の武具がそれを求めている。"
  ],
  golden_syrup: [
    "黄金のシロップ……それを一舐めすれば天国が見えるとか。", "王宮の晩餐会で出す極上のスイーツを作りたいんだ。", "……ただ、最高に甘くて幸せになれるものが欲しい。", "どんなに悲しいことも忘れられる、至高の甘みをくれ。", "神々の飲み物、ネクターに匹敵するシロップがあると聞いて。", "子供の誕生日に、世界で一番美味しいパンケーキを焼くんだ。", "……このシロップがあれば、あの人も振り向いてくれるかも。", "究極の甘党として、これを味わわずに死ねない！", "疲れ切った脳みそに、黄金の糖分を叩き込みたいんだ！", "魔女様が作る伝説のシロップ……味見させてくれないか？", "……苦い薬を飲むための、甘いおまけが欲しいだけさ。", "これを紅茶に一滴垂らすだけで、世界が変わるのだろう？", "私の料理の隠し味だ。これを使えば料理コンクールはもらった！", "……ただのシロップじゃない、黄金の輝きを飲むんだ。", "妖精たちがこぞって盗みに来るというシロップを一つ。", "人生が辛すぎる。せめて舌の上くらい甘くさせてくれ。", "これを食べれば、寿命が10年延びる気がするんだ。", "王様に献上する。最高の品でなければ私の首が飛ぶ！", "……金よりも価値のある甘み。いくらでも払おう。", "これを塗れば、古いブーツでも美味しく食えそうだな。"
  ]
};

const SUCCESS_REACTIONS = {
  perfect: [
    "「また来るわ！お得意様、ってやつかしらね。」", "「素晴らしい！これこそ私が求めていたものだ！」", "「完璧だ……。おまけに多めに払っておくよ。」"
  ],
  good: [
    "「うん、悪くない。助かるよ。」", "「ちょうどいい感じだね。ありがとう。」", "「納得のいく品質だ。大事に使わせてもらうよ。」"
  ],
  bad: [
    "「...」「あんた、ちょっと失礼だぜ。もういいよ…」", "「なんだこれは……？ 濁っているじゃないか。」", "「……不味い。これだけしか払えないよ。」"
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
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      let nextPos = posRef.current + (dirRef.current * 0.15 * delta);
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
    <div className="bg-slate-800 p-4 rounded-xl border-2 border-amber-900 shadow-inner my-4 select-none w-full">
      <div className="text-center text-amber-200 mb-2 font-bold text-sm">【交渉の振り子】真ん中を狙え！ ({3 - results.length}回)</div>
      <div className="relative w-full h-8 bg-slate-900 rounded-full overflow-hidden border border-slate-700 cursor-pointer" onMouseDown={handleTap}>
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

  // UI・モーダル状態
  const [showInv, setShowInv] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [mapDetail, setMapDetail] = useState<MapLocation | null>(null);
  const [gatheringLocation, setGatheringLocation] = useState<string | null>(null);
  const [gatheringCart, setGatheringCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState<{dialogue: string, potionWanted: string, state: 'waiting'|'negotiating'|'done'} | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<string | null>(null);
  const [cauldron, setCauldron] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{text: string, type: 'success'|'error'|'info'} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('witch_potion_save_v3');
    if (saved) {
      const d = JSON.parse(saved);
      setGold(d.gold); setInventory(d.inventory); setPotions(d.potions);
      setUnlockedRecipes(d.unlockedRecipes); setUnlockedLocations(d.unlockedLocations);
      setMysteriousPowder(d.mysteriousPowder);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('witch_potion_save_v3', JSON.stringify({ gold, inventory, potions, unlockedRecipes, unlockedLocations, mysteriousPowder }));
  }, [gold, inventory, potions, unlockedRecipes, unlockedLocations, mysteriousPowder]);

  const showMsg = (text: string, type: 'success'|'error'|'info' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // ------------------------------------------
  // お客さんロジック
  // ------------------------------------------
  useEffect(() => {
    if (activeTab === 'shop' && !customer) {
      const timer = setTimeout(() => {
        const available = unlockedRecipes;
        const wanted = available[Math.floor(Math.random() * available.length)];
        const dials = DIALOGUES[wanted] || DIALOGUES['healing'];
        const dial = dials[Math.floor(Math.random() * dials.length)];
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

    if (rank === 'perfect' && Math.random() < 0.2) {
      setMysteriousPowder(prev => prev + 1);
      showMsg("特別なお礼に「不思議な粉」をもらった！", "success");
    }
    setTimeout(() => setCustomer(null), 5000);
  };

  // ------------------------------------------
  // 調合ロジック
  // ------------------------------------------
  const craft = () => {
    let targetId: string | null = null;
    for (const [id, p] of Object.entries(POTIONS)) {
      if (JSON.stringify(p.recipe) === JSON.stringify(cauldron)) { targetId = id; break; }
    }
    const newInv = { ...inventory };
    Object.keys(cauldron).forEach(k => newInv[k] -= cauldron[k]);
    setInventory(newInv);
    setCauldron({});
    
    if (targetId) {
      setPotions(prev => ({ ...prev, [targetId!]: (prev[targetId!] || 0) + 1 }));
      showMsg(`${POTIONS[targetId].name} が完成した！`, "success");
    } else {
      showMsg("調合失敗！材料がゴミになった…", "error");
    }
  };

  // ------------------------------------------
  // 探索ロジック
  // ------------------------------------------
  const getWeight = (cart: Record<string, number>) => {
    let w = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      if (id.startsWith('recipe_')) w += RECIPE_WEIGHT * qty;
      else w += (INGREDIENTS[id]?.weight || 0) * qty;
    });
    return w;
  };

  const startGathering = (loc: MapLocation) => {
    if (gold < loc.cost) { showMsg("お金が足りないよ。", "error"); return; }
    setGold(prev => prev - loc.cost);
    setGatheringLocation(loc.id);
    setMapDetail(null);
    setGatheringCart({});
  };

  const finishGathering = () => {
    const newInv = { ...inventory };
    let foundRecipe = false;

    Object.entries(gatheringCart).forEach(([id, qty]) => {
      if (qty === 0) return;
      if (id.startsWith('recipe_')) {
        const recipeId = id.replace('recipe_', '');
        if (!unlockedRecipes.includes(recipeId)) {
          setUnlockedRecipes(prev => [...prev, recipeId]);
          showMsg(`新しいレシピ「${POTIONS[recipeId].name}」を覚えた！`, "success");
          foundRecipe = true;
        }
      } else {
        newInv[id] = (newInv[id] || 0) + qty;
      }
    });

    setInventory(newInv);
    if (!foundRecipe) showMsg("無事に家に戻った。", "info");
    setGatheringLocation(null);
  };

  // ------------------------------------------
  // レンダリング
  // ------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-serif flex flex-col items-center select-none overflow-hidden">
      {msg && <div className={`fixed top-4 px-6 py-2 rounded-full shadow-lg z-[100] text-sm font-bold animate-bounce ${msg.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{msg.text}</div>}

      <header className="w-full max-w-md bg-slate-900/80 p-4 border-b border-amber-900/40 flex justify-between items-center z-50">
        <div className="text-amber-500 font-bold">💰 {gold} G</div>
        <div className="text-xs text-slate-500">魔女のポーション屋 v3.0</div>
      </header>

      <main className="flex-1 w-full max-w-md relative overflow-y-auto pb-24">
        
        {/* --- SHOP --- */}
        {activeTab === 'shop' && (
          <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-amber-200 font-bold">お店</h2>
              <button onClick={() => setShowInv(true)} className="p-2 bg-slate-800 rounded-full border border-slate-700 text-xl">🎒</button>
            </div>

            <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 shadow-2xl relative min-h-[300px] flex flex-col items-center">
              {customer ? (
                <>
                  <div className="text-6xl mb-4">🧙‍♂️</div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border-l-4 border-amber-600 text-sm mb-4 w-full italic">
                    「{customer.dialogue}」
                  </div>
                  {customer.state === 'waiting' && (
                    <div className="w-full text-center">
                      <p className="text-xs text-amber-400 mb-2">求: {POTIONS[customer.potionWanted].icon} {POTIONS[customer.potionWanted].name}</p>
                      {potions[customer.potionWanted] > 0 ? (
                        <button onClick={() => setCustomer({...customer, state: 'negotiating'})} className="w-full py-3 bg-amber-600 rounded-xl font-bold active:scale-95">交渉して売る</button>
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
              <button onClick={() => setShowRecipes(true)} className="p-2 bg-slate-800 rounded-full border border-slate-700 text-xl">📜</button>
            </div>

            <div className="bg-slate-800 p-8 rounded-full aspect-square border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center relative">
              <div className="text-6xl mb-2">🍲</div>
              <div className="flex flex-wrap justify-center gap-1 min-h-[40px]">
                {Object.entries(cauldron).map(([id, qty]) => <span key={id} className="text-[10px] bg-slate-900 px-2 py-1 rounded-full">{INGREDIENTS[id].icon} x{qty}</span>)}
              </div>
              <button onClick={craft} className="mt-4 px-6 py-2 bg-emerald-600 rounded-full font-bold active:scale-95">調合開始</button>
              <button onClick={() => setCauldron({})} className="absolute bottom-4 text-xs text-slate-500 underline">釜を空にする</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Object.entries(inventory).map(([id, qty]) => qty > 0 && (
                <button key={id} onClick={() => setCauldron({...cauldron, [id]: (cauldron[id]||0)+1})} className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex flex-col items-center active:scale-90">
                  <span className="text-2xl">{INGREDIENTS[id]?.icon}</span>
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
                    <div className={`h-full transition-all ${getWeight(gatheringCart)>MAX_WEIGHT?'bg-red-500':'bg-blue-500'}`} style={{ width: `${Math.min(100,(getWeight(gatheringCart)/MAX_WEIGHT)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 p-2 bg-slate-950 rounded-xl">
                  {/* 材料リスト */}
                  {LOCATIONS[gatheringLocation].ingredients.map(id => (
                    <div key={id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-sm">
                        {INGREDIENTS[id].icon} {INGREDIENTS[id].name} <span className="text-[10px] text-slate-500">(重さ: {INGREDIENTS[id].weight}kg)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" min="0" max="100" value={gatheringCart[id]||0} 
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            const testCart = {...gatheringCart, [id]: newVal};
                            if (getWeight(testCart) <= MAX_WEIGHT) setGatheringCart(testCart);
                          }}
                          className="w-24 accent-blue-500"
                        />
                        <span className="text-xs w-6 text-right text-amber-400 font-bold">{gatheringCart[id]||0}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* レシピリスト（未取得のみ） */}
                  {LOCATIONS[gatheringLocation].recipes.filter(r => !unlockedRecipes.includes(r)).map(rId => (
                    <div key={`recipe_${rId}`} className="flex items-center justify-between border border-amber-900/50 bg-amber-900/20 p-2 rounded-lg">
                      <div className="text-sm text-amber-200">
                        📜 {POTIONS[rId].name}のレシピ <span className="text-[10px] text-amber-500/70">(重さ: {RECIPE_WEIGHT}kg)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" min="0" max="1" value={gatheringCart[`recipe_${rId}`]||0} 
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            const testCart = {...gatheringCart, [`recipe_${rId}`]: newVal};
                            if (getWeight(testCart) <= MAX_WEIGHT) setGatheringCart(testCart);
                          }}
                          className="w-12 accent-amber-500"
                        />
                        <span className="text-xs w-6 text-right text-amber-400 font-bold">{gatheringCart[`recipe_${rId}`]||0}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={finishGathering} className="w-full py-3 bg-blue-600 rounded-xl font-bold" disabled={getWeight(gatheringCart)>MAX_WEIGHT}>カバンを閉じて帰る</button>
              </div>
            ) : (
              <div className="relative w-full aspect-square bg-amber-900/10 rounded-xl border border-amber-900/30 overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#8b5e3c_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute left-[45%] top-[50%] flex flex-col items-center"><div className="text-3xl">🏠</div><span className="text-[10px] bg-slate-900/80 px-1 rounded">我が家</span></div>
                {Object.values(LOCATIONS).map(loc => {
                  const isSecret = loc.id === 'secret';
                  const isLocked = isSecret && !unlockedLocations.includes('secret');
                  return (
                    <div key={loc.id} className="absolute cursor-pointer flex flex-col items-center hover:scale-110" style={{ left: `${loc.x}%`, top: `${loc.y}%` }} onClick={() => isLocked ? showMsg("不思議な力を感じる…", "info") : setMapDetail(loc)}>
                      <div className={`text-3xl p-2 rounded-full ${isLocked ? 'bg-black text-black grayscale' : ''}`}>{isLocked ? '●' : loc.icon}</div>
                      <span className="text-[10px] bg-slate-900/80 px-1 rounded">{isLocked ? '???' : loc.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {mysteriousPowder > 0 && !unlockedLocations.includes('secret') && (
              <button onClick={() => { setUnlockedLocations([...unlockedLocations, 'secret']); setMysteriousPowder(prev => prev - 1); showMsg("秘境の場所が浮かび上がった！", "success"); }} className="mt-4 w-full p-3 bg-fuchsia-900/30 border border-fuchsia-500/50 rounded-xl text-fuchsia-200 text-xs font-bold animate-pulse">不思議な粉を地図に撒く (残り{mysteriousPowder})</button>
            )}
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {showInv && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-sm rounded-3xl p-6 relative">
            <button onClick={() => setShowInv(false)} className="absolute top-4 right-4 text-2xl">×</button>
            <h3 className="text-lg font-bold mb-4 border-b border-slate-700 pb-2">在庫・持ち物</h3>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              <div className="col-span-2 text-xs text-amber-500 font-bold mb-1">【ポーション】</div>
              {Object.entries(potions).map(([id, qty]) => qty > 0 && <div key={id} className="bg-slate-900 p-2 rounded-xl flex items-center gap-2"><span>{POTIONS[id].icon}</span><span className="text-xs">{POTIONS[id].name}</span><span className="ml-auto font-bold">x{qty}</span></div>)}
              <div className="col-span-2 text-xs text-blue-400 font-bold mt-4 mb-1">【材料】</div>
              {Object.entries(inventory).map(([id, qty]) => qty > 0 && <div key={id} className="bg-slate-900 p-2 rounded-xl flex items-center gap-2"><span>{INGREDIENTS[id]?.icon}</span><span className="text-xs">{INGREDIENTS[id]?.name}</span><span className="ml-auto font-bold">x{qty}</span></div>)}
            </div>
          </div>
        </div>
      )}

      {showRecipes && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative border border-amber-900/30">
            <button onClick={() => setShowRecipes(false)} className="absolute top-4 right-4 text-2xl">×</button>
            <h3 className="text-lg font-bold mb-4 text-amber-200 border-b border-amber-900/30 pb-2">魔女のレシピ帳</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {unlockedRecipes.map(id => (
                <div key={id} className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="font-bold text-amber-100 mb-1">{POTIONS[id].icon} {POTIONS[id].name}</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(POTIONS[id].recipe).map(([iId, q]) => <span key={iId} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full">{INGREDIENTS[iId].icon} {INGREDIENTS[iId].name} ×{q}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mapDetail && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center p-4">
          <div className="bg-slate-800 w-full max-w-sm rounded-t-3xl p-6 border-t-4 border-blue-600">
            <div className="flex justify-between items-start mb-4">
              <div><h3 className="text-xl font-bold">{mapDetail.icon} {mapDetail.name}</h3><p className="text-xs text-slate-400">移動費: {mapDetail.cost} G</p></div>
              <button onClick={() => setMapDetail(null)} className="text-2xl">×</button>
            </div>
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-2">採取可能なアイテム:</p>
              <div className="flex flex-wrap gap-2">
                {mapDetail.ingredients.map(i => <span key={i} className="bg-slate-900 px-2 py-1 rounded-lg text-[10px]">{INGREDIENTS[i].icon} {INGREDIENTS[i].name}</span>)}
                {mapDetail.recipes.filter(r => !unlockedRecipes.includes(r)).map(r => <span key={r} className="bg-amber-900/40 text-amber-200 px-2 py-1 rounded-lg text-[10px] border border-amber-500/50">📜 未知のレシピ</span>)}
              </div>
            </div>
            <button onClick={() => startGathering(mapDetail)} className="w-full py-4 bg-blue-600 rounded-2xl font-bold shadow-xl">出発する</button>
          </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <nav className="w-full max-w-md bg-slate-900 border-t border-slate-800 fixed bottom-0 z-50 flex">
        {[ { id: 'shop', name: 'お店', icon: '🏪' }, { id: 'atelier', name: '工房', icon: '🍲' }, { id: 'map', name: '地図', icon: '🗺️' } ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`flex-1 py-4 flex flex-col items-center justify-center ${activeTab === t.id ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500' : 'text-slate-500'}`}>
            <span className="text-xl">{t.icon}</span><span className="text-[10px] font-bold mt-1">{t.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}