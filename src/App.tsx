import { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 定数データ定義（アイテム・ポーション・マップ）
// ==========================================
type Tab = 'shop' | 'atelier' | 'map';
type GameState = 'title' | 'playing';
type HoodedManState = 'pending' | 'active' | 'completed';
type CustomerType = 'wizard' | 'knight' | 'youth' | 'child' | 'woman' | 'elf' | 'dwarf';

interface Ingredient { id: string; name: string; weight: number; icon: string; desc: string; }
interface Potion { id: string; name: string; recipe: Record<string, number>; basePrice: number; icon: string; desc: string; }
interface MapLocation { id: string; name: string; ingredients: string[]; recipes: string[]; icon: string; x: number; y: number; cost: number; }

const INGREDIENTS: Record<string, Ingredient> = {
  nightglow: { id: 'nightglow', name: '夜光草', weight: 2, icon: '🌿', desc: '暗闇で光る草' },
  fairy_dust: { id: 'fairy_dust', name: '妖精の粉', weight: 1, icon: '✨', desc: '神秘的な粉' },
  mandragora: { id: 'mandragora', name: 'マンドラゴラ', weight: 25, icon: '🌱', desc: '叫ぶ重い植物' },
  bone_meal: { id: 'bone_meal', name: '骨粉', weight: 10, icon: '🦴', desc: '古い骨の粉' },
  swamp_water: { id: 'swamp_water', name: '濁った沼水', weight: 5, icon: '💧', desc: '毒素を含む水' },
  poison_toad: { id: 'poison_toad', name: '猛毒ガエル', weight: 15, icon: '🐸', desc: '強力な毒を持つ' },
  iron_ore: { id: 'iron_ore', name: '鉄鉱石', weight: 30, icon: '🪨', desc: 'ずっしり重い鉱石' },
  crystal: { id: 'crystal', name: '魔力結晶', weight: 15, icon: '💎', desc: '魔力を帯びた石' },
  gold_ore: { id: 'gold_ore', name: '金鉱石', weight: 20, icon: '🟡', desc: '価値の高い鉱石' },
  fire_stone: { id: 'fire_stone', name: '炎の石', weight: 10, icon: '🔥', desc: '熱を放つ石' },
  bat_wing: { id: 'bat_wing', name: 'コウモリの羽', weight: 5, icon: '🦇', desc: '反響する羽' },
  dragon_scale: { id: 'dragon_scale', name: '竜の鱗', weight: 50, icon: '🐉', desc: '極めて重い秘宝' },
  dragon_tear: { id: 'dragon_tear', name: '竜の涙', weight: 5, icon: '💧', desc: '純粋な魔力の塊' },
  phoenix_feather: { id: 'phoenix_feather', name: '不死鳥の羽', weight: 2, icon: '🪶', desc: '生命力の象徴' },
  ancient_ash: { id: 'ancient_ash', name: '太古の灰', weight: 8, icon: '🌫', desc: '大爆発の残骸' },
  star_shard: { id: 'star_shard', name: '星の欠片', weight: 12, icon: '⭐', desc: '宇宙からの贈り物' },
};

const POTIONS: Record<string, Potion> = {
  healing: { id: 'healing', name: '回復のポーション', recipe: { nightglow: 2, fairy_dust: 1 }, basePrice: 50, icon: '🧪', desc: '基本の傷薬' },
  // マナの小瓶に沼の素材（濁った沼水）を追加し、次のエリアへの探索を誘導
  mana_potion: { id: 'mana_potion', name: 'マナの小瓶', recipe: { nightglow: 1, fairy_dust: 1, swamp_water: 1 }, basePrice: 80, icon: '🔮', desc: '魔力を少し回復' },
  strength: { id: 'strength', name: '力のポーション', recipe: { mandragora: 1, bone_meal: 1, swamp_water: 2 }, basePrice: 150, icon: '💪', desc: '力がみなぎる薬' },
  poison: { id: 'poison', name: '猛毒の瓶', recipe: { poison_toad: 2, swamp_water: 1 }, basePrice: 120, icon: '☠️', desc: '危険な劇薬' },
  iron_skin: { id: 'iron_skin', name: '鉄壁の薬', recipe: { iron_ore: 1, gold_ore: 1, fire_stone: 1 }, basePrice: 300, icon: '🛡️', desc: '体を鉄にする薬' },
  explosion: { id: 'explosion', name: '爆発薬', recipe: { fire_stone: 2, ancient_ash: 1, bone_meal: 1 }, basePrice: 400, icon: '💣', desc: '投げると爆発する' },
  echo: { id: 'echo', name: '反響の薬', recipe: { bat_wing: 2, nightglow: 1, crystal: 1 }, basePrice: 200, icon: '🔊', desc: '感覚を鋭くする' },
  elixir: { id: 'elixir', name: 'エリクサー', recipe: { dragon_scale: 1, phoenix_feather: 1, dragon_tear: 1 }, basePrice: 1500, icon: '🌟', desc: '伝説の秘薬' },
  magic_polish: { id: 'magic_polish', name: '魔力研磨液', recipe: { crystal: 2, fairy_dust: 2, star_shard: 1 }, basePrice: 800, icon: '✨', desc: '武器に魔力を付与' },
  golden_syrup: { id: 'golden_syrup', name: '黄金のシロップ', recipe: { gold_ore: 1, dragon_tear: 1, fairy_dust: 1 }, basePrice: 1000, icon: '🍯', desc: '至高の甘み' },
};

const MYSTERY_RECIPE = { bone_meal: 1, poison_toad: 1, fairy_dust: 1 };

const LOCATIONS: Record<string, MapLocation> = {
  forest: { id: 'forest', name: '妖精の森', ingredients: ['nightglow', 'fairy_dust'], recipes: ['mana_potion'], icon: '🌲', x: 20, y: 70, cost: 0 },
  swamp: { id: 'swamp', name: '死者の沼', ingredients: ['mandragora', 'bone_meal', 'swamp_water', 'poison_toad'], recipes: ['strength', 'poison'], icon: '🌫️', x: 70, y: 30, cost: 30 },
  mine: { id: 'mine', name: '古い鉱山', ingredients: ['iron_ore', 'crystal', 'gold_ore', 'fire_stone', 'bat_wing'], recipes: ['iron_skin', 'explosion', 'echo'], icon: '⛏️', x: 40, y: 20, cost: 50 },
  secret: { id: 'secret', name: '竜の巣', ingredients: ['dragon_scale', 'dragon_tear', 'phoenix_feather', 'ancient_ash', 'star_shard'], recipes: ['elixir', 'magic_polish', 'golden_syrup'], icon: '🌋', x: 80, y: 80, cost: 100 },
};

const MAX_WEIGHT = 100;
const RECIPE_WEIGHT = 10;
const CUSTOMER_EMOJIS: Record<CustomerType, string> = { wizard: '🧙‍♂️', knight: '🛡️', youth: '👱‍♂️', child: '👦', woman: '👩', elf: '🧝‍♀️', dwarf: '🧔‍♂️' };

// ==========================================
// 2. セリフデータ（限界まで増量バージョン）
// ==========================================
const DIALOGUES: Record<string, Record<CustomerType, string[]>> = {
  healing: {
    wizard: ["スライムに噛まれちまってな。回復を頼む。","風邪気味でな。普通のポーションでいい。","薬草学の授業で手本として使いたいんじゃ。","使い魔が怪我をしてな。治してやりたい。","ポーションの飲み比べをしておるんじゃ。","弟子の失敗で火傷してしまってな。はぁ。","老体には擦り傷もこたえる。一つ頼むよ。"],
    knight: ["パトロール中にゴブリンの矢がかすってな。","騎士団の備品として回復薬を補充したい。","剣の稽古で生傷が絶えなくてな、頼む。","長征の疲れが抜けなくてな。","盾を持たない左腕を少しやられた。","回復薬はいくらあっても困らんからな！","新兵の治療用に買いだめしておきたい。"],
    youth: ["冒険に行くんだ！一番安い回復薬をくれよ！","転んで膝をすりむいちゃってさ。痛ぇ〜。","とりあえず回復ポーション持ってれば安心っしょ！","ヤバい！スズメバチに刺された！早く！","彼女にかっこいいとこ見せようとして怪我した…。","赤い薬ってなんかテンション上がるよな！","お守り代わりに一本持っとくぜ。"],
    child: ["お母さんのおつかいできたよ！赤いお薬ちょうだい！","えへへ、木登りして落ちちゃったの。痛いの治して！","魔女のお姉ちゃん、お薬ひとつくださーい！","ねえねえ、これっていちご味なの？","絆創膏よりすごいお薬なんだよね！","ワンちゃんが足ひきずってるの。治るかな？","僕も大きくなったらこれ作る人になる！"],
    woman: ["料理中に包丁で指を切ってしまって……。","子供が怪我をした時のために、お守り代わりにね。","なんだか今日は体がだるくて。癒やしてくれない？","肌荒れにも効いたりするのかしら？","お隣さんにお裾分けしたくてね。","最近、肩こりがひどくて。これも治る？","旅に出る夫に持たせたいの。"],
    elf: ["人間の薬がどれほどのものか、見せてもらうわ。","森の獣に引っ掻かれてしまってね。少し分けてちょうだい。","自然の治癒力が追いつかないの。力を貸して。","私たちの秘薬とどう違うのかしら。","不注意で茨に足を取られたの。恥ずかしいわ。","少しばかり人間の技術に頼ってみようかしら。","……苦くないといいのだけれど。"],
    dwarf: ["ガハハ！鍛冶のハンマーを足に落としちまってな！","炭鉱で岩に挟まれた！早く傷薬をくれ！","エールより効く飲み物はこれくらいだぜ！","火傷なんて日常茶飯事だが、今回はちょっと深くてな。","酒と混ぜて飲んでも効き目はあるのか？","ワシの分厚い皮膚にも効くやつを頼むぜ！","安いのでいい！とにかく量をくれ！"]
  },
  mana_potion: {
    wizard: ["研究で魔力を使いすぎた。マナを補充したい。","魔法陣の起動に少し魔力が足りなくてな。","徹夜の魔術実験のお供にな、一つおくれ。","新しい呪文の詠唱練習で喉が渇いてな。","沼の素材が入っていると聞いてな、興味があるんじゃ。","弟子に飲ませて魔力炉を拡張させるんじゃ。","魔力切れの頭痛にはこれが一番じゃよ。"],
    knight: ["魔法剣の練習で魔力切れだ。一つ頼む。","部隊の魔術師が倒れた。至急マナの回復を！","我々には魔力がないが、仲間のために必要なのだ。","魔法具のメンテナンスにこの液体がいるらしい。","王宮魔術師からの使いで参った。","気付け薬代わりに飲む猛者もいるそうだ。","青い液体は毒々しいが、背に腹は代えられん。"],
    youth: ["魔法使いデビューするぜ！まずはマナポーションからだ！","すっげー魔法をぶっ放したいから、これ飲んで頑張る！","魔力ってどんな味すんの？一回飲んでみたいぜ！","これ飲んだら俺も火の玉とか出せるようになる！？","友達との肝試しで、光る飲み物を持っていきたいんだ。","徹夜でゲーム…じゃなくて、修業するからさ！","沼の水が入ってるってマジ！？腹壊さねえかな！"],
    child: ["これ飲むと魔法が使えるようになるって本当？","青くてキラキラしてて、ジュースみたい！","お父さんが魔法の練習するから買ってこいって！","夜にお外歩くとき、ランプ代わりに持っていくの！","魔法少女になりたいの！お水ちょうだい！","苦くない？甘くしてある？","魔法の森の味がするのかなぁ。"],
    woman: ["生活魔法の使いすぎで少し頭痛がしてね……。","暖炉の火を起こす魔法がうまくいかなくて。","たまには魔力をチャージしないと肌荒れしちゃって。","これ、お風呂に入れるとリラックス効果があるのよ。","魔力不足でホウキが飛ばなくなっちゃって。","最近、水晶玉の映りが悪くてね。","水晶を磨くのにも使えるのよ、これ。"],
    elf: ["森のマナが乱れているの。私自身の魔力で補うわ。","純粋なマナの結晶……あなたの腕前を見せて。","精霊との対話には、多くの魔力が必要なの。","人間の作るマナは少し濁っているけれど、悪くないわ。","私の魔力プールを満たすには、少し足りないかしら。","……沼の臭いが少しするわね。でも我慢するわ。","エルフの泉が枯れかけているの。これで一時凌ぎを。"],
    dwarf: ["ワシらには無縁だが、魔法具の燃料にいるんだとよ。","魔法使いのヒョロガリどもがこぞって欲しがる水だ。","光る水なんて気味が悪いが、仕事で必要なんだ。","これを炉に入れると、変な色の炎が出て面白いんだぜ！","ワシが飲んだらどうなるんだ？ゲップが出るだけか？","こんな水に金を出すぐらいならエールを飲むがな！","依頼されてる武器の冷却材に使うんだよ。"]
  },
  strength: {
    wizard: ["重い魔導書を運ばねばならん。力を貸してくれ。","老体には杖を突くのもしんどくてな。腕力が欲しい。","ゴーレムの物理法則を体感したくてな。","時には杖で殴り倒す筋力も必要じゃ。","書庫の模様替えを一人でやらねばならんでな。","筋肉増強の魔法薬…錬金術のロマンじゃ。"],
    knight: ["明日はオーガ討伐だ。腕力を限界まで引き上げたい！","重鎧を着たまま走り込みをする。筋力増強を頼む！","力こそ正義だ！圧倒的なパワーをくれ！","大剣を片手で振るうためのドーピングだ。","力比べでどうしても勝ちたい相手がいるのだ。","城門の開閉訓練があってな、少しズルをさせてくれ。"],
    youth: ["腕相撲大会で絶対に優勝してやるんだ！","あの重い岩をどかして、宝箱を開けるぜ！","モテるためには筋肉だろ？筋肉パンパンにしてくれ！","これ飲んで、街の不良どもをボコボコにしてやる！","筋トレのサプリメント代わりにどうかな？","俺の隠されたパワーを引き出してくれ！"],
    child: ["大きくなったら力持ちの勇者になるんだ！","重い荷物、僕が持ってお母さんを助けるの！","ワンちゃんが岩に挟まってるの！助ける力をちょうだい！","ガオォー！強い怪獣になるお薬ちょうだい！","いじめっ子にやり返してやるんだ！","これ飲んだら、お父さんより力持ちになれる？"],
    woman: ["タンスを動かして模様替えをしたいのよ。","……たまには旦那を腕相撲で負かしてやりたくてね。","力仕事が多くてね。一気に片付けたいの。","護身用に、か弱いフリして一撃をお見舞いしたいわ。","重い鍋を振るのに少し腕の力が欲しくて。","薪割りを一瞬で終わらせたいのよ。"],
    elf: ["エルフはか弱いと舐められているから、見返してやるの。","あの巨木を移植するには、物理的な力が必要だわ。","弓を引く力が衰えてきたの。少しズルをさせて。","優雅さだけでは生き残れない時もあるわ。","……怒りに任せて物を壊したくなる夜もあるの。","重い石像を動かして、隠し通路を開けるわ。"],
    dwarf: ["大岩を粉砕するぜ！俺の腕力を限界突破させろ！","ドワーフの怪力をさらに倍にしてやる！ガハハ！","重い鉄を打つには、最高の一撃が必要なんだ！","これがあれば、三日三晩ハンマーを振り続けられる！","素手で竜を殴り倒すための準備だ！","エール樽を10個まとめて担ぐ大会に出るんだ！"]
  },
  poison: {
    wizard: ["地下室のネズミを駆除したいんじゃ。","毒物学の講義に使うサンプルが必要でな。","……決して悪用はせんよ。ただの『研究』じゃ。","強力な酸で錠前を溶かしたくてな。","解毒剤を作るための逆算の材料じゃよ。","魔法の罠に仕込む劇薬を探しておる。"],
    knight: ["沼の怪物を退治する。毒には毒で対抗するのだ。","武器の刃に塗るための劇薬を探している。","……静かに始末せねばならん標的がいる。","捕虜の口を割らせるための…いや、何でもない。","毒への耐性をつける過酷な訓練用だ。","我々の正義のためには、裏の手段も必要なのだ。"],
    youth: ["罠に仕掛けるための強力な毒液を探してるんだ！","害虫駆除に使うんだ。一番ヤバいやつを頼むぜ！","自分の毒耐性を試したいんだ。俺は死なねえ！","暗殺者ごっこに使うんだ、もちろん薄めてな！","嫌なやつの靴の中に仕込んでやるのさ！","これってドクロのマーク描いてある？かっけぇ！"],
    child: ["これでお庭の悪い虫さんをやっつけるの！","ねぇねぇ、これ飲むとどうなっちゃうの？","ドクロのマークがかっこいいから欲しい！","紫のお水、きれいだね！飲んじゃダメ？","お母さんが、屋根裏のネズミさん退治するんだって。","苦いお薬より不味いのかなぁ。"],
    woman: ["……隣の畑の雑草を、根こそぎ枯らしたいの。","……うちのスープに、ちょっとしたスパイスをね。","倉庫に湧いた害虫を一網打尽にしたいのよ。","憎い相手の庭に撒いてやりたい気分だわ。","護身用に、顔にぶっかけるやつをちょうだい。","……痕が残らない毒って、あるかしら。"],
    elf: ["魔物の巣穴に投げ込んで一掃するわ。","美しい花には毒がある。私の矢にもね。","……自然を汚す者には、相応の報いが必要よ。","毒の沼地を浄化するための、逆位相の毒が必要なの。","私たちの森の毒草と、どちらが凶悪かしら？","無知な人間に、自然の恐ろしさを教えるわ。"],
    dwarf: ["鉱山の奥に湧いたバケモノを毒殺してやる。","拷問部屋の在庫が切れた。一つ譲ってくれ。","ガハハ！こんなもん飲む奴の気が知れねえな！","酒の隠し味に一滴……冗談だ、冗談！","金属を急激に腐食させる液体として使えるか？","ドワーフの胃袋なら、これくらい消化できるぜ！"]
  },
  iron_skin: {
    wizard: ["落石地帯を通るんじゃ。体が鋼になれば安心じゃろ。","物理攻撃への耐性を研究しておる。","ローブだけでは防御力が皆無でな……。","実験中の爆発から身を守りたいんじゃよ。","ゴーレムの皮膚構造を人間で再現したくてな。","時には魔法の盾より、物理的な硬さが必要じゃ。"],
    knight: ["竜の爪も弾き返す、無敵の肉体が欲しい！","乱戦に飛び込む。かすり傷ひとつ負いたくないのだ。","鉄壁の防御……それこそが最強の鉾だ！","重鎧を着るより、これを飲んだ方が早いと気づいた。","背中を守る盾が壊れた。これに頼るしかない。","絶対に引けない戦いがある。死なない体が欲しい。"],
    youth: ["オークの棍棒を素肌で受け止めてみたいぜ！","トゲトゲの迷宮に挑むんだ。肌を硬くしておきたい！","俺の腹筋を、本当の鉄の塊にしてくれ！","ガチガチに硬くなって、体当たりで壁を壊すぜ！","喧嘩で絶対に殴り負けないための秘策だ！","これ飲んで高いところから飛び降りても平気？"],
    child: ["カチカチになれば、いじめっ子も怖くないぞ！","これ飲んだらロボットになれるの！？","お外でいっぱい転んでも痛くなくなるお薬ちょうだい！","ハチさんに刺されても、針が折れるようになる？","カブトムシみたいに硬い殻が欲しいな！","お父さんの肩たたき、手が痛くならないようにね！"],
    woman: ["火の粉を浴びる仕事でね。肌を守りたいの。","防具を買う金がないから、薬で代用させてちょうだい。","蜂の巣を素手で駆除したいのよ！","……時々、心が壊れそうな時に体だけでも硬くしたくて。","庭のイバラのお手入れを、素手でやりたいの。","日焼け止めよりも強力な物理バリアね。"],
    elf: ["エルフの柔肌を傷つけるわけにはいかないわ。","森のイバラ道を抜けるために必要なの。","……絶対に傷つきたくないの。心も体もね。","醜い傷跡を残すくらいなら、鋼の肌を選ぶわ。","私たちの防御魔法より素早く効くから便利ね。","オークの不潔な武器に、少しでも触れたくないの。"],
    dwarf: ["俺の皮膚を鋼の要塞に変えてくれ！","熊と素手でレスリングをする約束があるんだ！","溶岩の近くで仕事するんでな、これが必要なんだ。","これさえあれば、防具を打つ手間が省けるぜ！","ガハハ！鉄の塊同士でぶつかり合うのが男だろ！","火の粉なんて痒くもねえが、たまには念のためな。"]
  },
  explosion: {
    wizard: ["邪魔な岩山を吹き飛ばしたいんじゃ。","……芸術とは爆発じゃろ？","古い実験室を丸ごと更地にしたいんじゃが。","魔法陣の暴走より、こっちの方が制御しやすい。","弟子に『火力とは何か』を教える教材じゃ。","杖を振るより投げたほうが早い時もある。"],
    knight: ["閉ざされた道をこじ開けるための爆発力が欲しい。","敵の陣地に放り込む、最高のプレゼントだ！","……証拠隠滅に、跡形もなく消し飛ぶ薬が必要だ。","城壁に穴を開ける作戦に使う。","魔物の群れのど真ん中に突っ込ませる！","時には力業で戦況をひっくり返すのだ！"],
    youth: ["ド派手な花火を上げたい気分でね。ドカンと一発！","バンッ！と爽快に何かが弾ける音を聞きたいんだぜ！","魔物の群れを一瞬で消し去りたいんだ！","すっげえイタズラを思いついたんだ！早く売ってくれ！","退屈な日常を、これでぶっ壊してやるぜ！","爆発の衝撃波でジャンプしてみたいんだ！"],
    child: ["ドカーン！ってなるお薬ちょうだい！","これで大きな穴を掘って秘密基地を作るんだ！","おっきな音が出るの？面白そう！","お空に投げたら、お星さまみたいに光る？","お祭りみたいにパチパチするのかなぁ！","お母さんに内緒で、お庭で遊ぶの！"],
    woman: ["……金庫の扉がどうしても開かなくてね。","扉の鍵を失くしたの。もう丸ごと吹き飛ばすしかないわ。","……たまには、すべてを破壊したくなる時があるのよ。","古い過去を、文字通り灰にしてしまいたいわ。","料理の火起こしに…ちょっと威力が強すぎるかしら？","あの鬱陶しい蜂の巣を、根元から消し去るわ。"],
    elf: ["氷の山を溶かすんじゃない、粉々に砕きたいの。","ゴブリンの巣に挨拶代わりの一発を放ちたいわ。","この森を荒らす連中に、大爆発の怒りを。","自然の怒りを、錬金術の形で具現化したものね。","炎の精霊を怒らせるより、これを投げる方が安全。","下品な音が出るけど、威力は認めるわ。"],
    dwarf: ["坑道で新しいルートを掘削する。手っ取り早い薬をくれ。","ガハハ！ドワーフと言えば爆薬だろ！","危険なのは承知の上だ。最高火力を頼むぜ！","火薬の匂いってのは、いつ嗅いでも最高だな！","硬い鉱脈も、これ一つで木っ端微塵よ！","酒のつまみに爆音を聞くのもオツなもんだぜ。"]
  },
  echo: {
    wizard: ["地下水脈の流れる音を探しておるんじゃ。","遠くの街の鐘の音まで聞こえる魔法薬じゃな。","……静寂の中で、自分の心音すら聞きたい気分じゃ。","コウモリの生体模倣魔法の研究じゃよ。","目に見えない霊体の声を聞き取るためにね。","図書館でのヒソヒソ話を取り締まるためじゃ。"],
    knight: ["暗闇でも敵の位置を知りたい。感覚を鋭くする薬を。","スパイの仕事だ。隣の部屋の密談を盗み聞きしたい。","暗殺者の足音を絶対に逃さないための薬だ。","見えない敵の刃の風切り音を捉える。","夜間警備には必須のドーピング剤だ。","五感を研ぎ澄ますことで、生存率が上がるのだ。"],
    youth: ["森の中で迷った仲間を探すんだ。遠くの音を聞きたい！","透明な敵と戦うんだ。音だけが頼りなんだぜ。","嘘をついているやつの心拍数を聞き分けたいんだ！","好きなあの子のヒソヒソ話を盗み聞き…いや、何でもない！","ギャンブルで相手の動揺を音で察知するのさ！","目隠しして戦う修行に使うんだぜ！"],
    child: ["遠くの小鳥さんの声が聞きたいな！","これ飲んだらお化けの足音も聞こえるの？","かくれんぼで絶対勝てるお薬だね！","ママがこっそりおやつを食べる音、見つけるの！","ワンちゃんが何を言ってるかわかるようになる？","耳がウサギさんみたいに大きくなるのかな！"],
    woman: ["音楽家の耳を取り戻したいの。音がぼやけてね。","……誰かにつけられている気がするの。気配を感じたいわ。","遠くに住むあの人の声が、風に乗って聞こえないかしら。","隣の家の騒音の出所を、正確に特定したいのよ。","迷子になった飼い猫の鳴き声を探しているの。","自分の内なる心の声に、耳を傾けたい夜もあるわ。"],
    elf: ["夜の森の囁きをすべて理解できるようになりたいわ。","隠し扉の反響音を聞き分けたいの。耳を良くして。","感覚を研ぎ澄まし、森の精霊と一体化したいの。","エルフの耳をさらに強化するなんて、贅沢かしら。","人間の汚い足音を、いち早く察知して避けるためよ。","風が運んでくる遠くの危機を知るために。"],
    dwarf: ["洞窟の奥にいる魔物の息遣いを察知したいんだ。","岩盤の脆い場所を、ハンマーの反響音で探るんだ。","コウモリのように闇を生きるため、頼むぜ。","落盤の予兆を音で感じ取るのは炭鉱夫の基本だ。","金貨の落ちる音を、1マイル先から聞き分けるぜ！","酒場で誰がワシの悪口を言ってるか探るためだ。"]
  },
  elixir: {
    wizard: ["究極の錬金術の結晶……この目で拝みたいんじゃ。","神の領域に触れる薬……私の寿命すら延ばせるか？","これがあれば、死者さえも蘇ると聞いたが……本当か？","長年の魔術研究の答え合わせをさせてくれ。","歴史書にのみ記された秘薬。いくら積めば買える？","私のような老いぼれには過ぎた代物じゃがな。"],
    knight: ["不治の病に伏せる姫を救うため、万能薬を譲ってくれ！","死の淵にある友を救えるのは、この秘薬だけなのだ！","王の勅命だ。エリクサーを城へ持ち帰らねばならん！","この一滴で、我が軍隊は不滅の存在となる！","奇跡を金で買えるのなら、全財産を投げ打つぞ！","……どんな傷も癒えるのなら、私の心の傷も消えるか？"],
    youth: ["伝説のエリクサー！一生に一度は飲んでみたいぜ！","世界を救う戦いに挑む。最後のお守りにさせてくれ！","どんな呪いも解き放つという奇跡の薬……すげぇ！","これ持ってりゃ、絶対にゲームオーバーにならねぇ！","俺の人生を逆転させるための、最強の切り札だ！","飾っておくだけでご利益がありそうじゃんか！"],
    child: ["これがあれば、病気のお母さんが元気になるって聞いたの！","星のお空みたいな色！とっても綺麗！","僕も勇者になれる魔法のお水ちょうだい！","天使さんの涙が入ってるって本当？","これ飲んだら、永遠に大人にならないで遊べる？","すっごく高いお薬なんでしょ？僕の貯金箱で足りるかなぁ。"],
    woman: ["……私のすべてを失ってもいい。エリクサーをちょうだい。","一族に伝わる病を、私の代で終わらせたいの。","私の失われた右腕も、これなら元通りになるはずよ。","若さと美しさを永遠に保つ……そんな効果はないかしら。","愛する人をこの世に繋ぎ止めるための、最後の希望。","これが本当に奇跡を起こすなら、私は悪魔にでも魂を売るわ。"],
    elf: ["魔王の瘴気に侵された森。これで浄化するしかないわ！","……命の源、純粋な奇跡。私に扱えるかしら。","神々に喧嘩を売るわ。このエリクサーが私の保険よ。","自然の理を超える人間の業……恐ろしくも美しいわ。","長命なエルフでさえ、死の運命からは逃れられないのよ。","星の瞬きを閉じ込めたような液体ね。見事だわ。"],
    dwarf: ["この秘薬を手に入れるためなら、国一つ売ってもいいぜ！","ただ飲んでみたいんだ。究極の味がどんなものか。","ガハハ！これ一杯でドワーフの寿命が100年延びるぜ！","最高の武具を打つための、最後の冷却液にするんだ！","伝説の薬をワシのコレクションに加えたいんだよ。","どんな二日酔いも一瞬で治るらしいじゃねえか！"]
  },
  magic_polish: {
    wizard: ["私の杖の魔力伝導率を上げたいんじゃ。最高の研磨を。","魔法陣を描くための特殊なインク代わりにならないか？","ただの木の棒も魔力を帯びるというあの研磨液じゃな。","魔導書の手入れに使う。紙が魔力を記憶するのじゃ。","古いアーティファクトの錆を落としたいんじゃよ。","杖の先端を磨いて、魔力の光を強くしたい。"],
    knight: ["この古びた名剣に、かつての魔力を取り戻させたい。","魔法騎士団の試験だ。剣の輝きで試験官を圧倒したい！","竜の鱗を切り裂くため、剣の切れ味を極限まで高めたい。","ただの鉄の盾を、魔法の盾へと昇華させる液だ。","戦場でも私の鎧が星のように輝くように。","霊体を斬るために、武器に魔力を付与せねば。"],
    youth: ["俺の剣に、見えない魔力の刃を付与してくれよ！","武闘大会に出るんだ。武器の見た目から相手を威圧するぜ！","ただ光るだけじゃない、魔力を帯びる研磨液が欲しい！","これ塗れば、100均で買った剣も伝説の剣になる！？","ピカピカの武器って男のロマンだろ？","これで自転車…じゃなくて、馬車を磨いて速くする！"],
    child: ["僕の木の剣も、これを塗ったら伝説の剣になる！？","ピカピカ光るお水、かっこいい！","お父さんの盾をこっそりピカピカにして驚かせるの！","おもちゃのリングが、魔法のリングになっちゃう？","靴に塗ったら、空を飛べるようになるかなぁ！","光るどろだんごを作るのに使ってもいい？"],
    woman: ["……呪われた武具を浄化し、新たな力を与える液を。","私の美しい槍を、さらに星のように輝かせたいの。","護身用の短剣を、いざという時のために強化しておきたくて。","家宝の銀食器を磨いたら、何か魔力が宿るかしら。","宝石の輝きを取り戻すのにも使えると聞いたわ。","鏡をこれで磨けば、真実の姿を映し出すそうね。"],
    elf: ["私の弓に塗るわ。一発必中の魔法の矢になるはずよ。","武具の手入れは一流の液で。あなたの店の品が最高だと聞いたわ。","自然の魔力を武器に宿らせる……美しい響きね。","エルフの細剣は、常に美しく魔力を帯びていなければ。","この液で磨いた矢は、風の精霊に愛されるの。","無骨な鉄の塊も、これで少しは上品になるかしら。"],
    dwarf: ["俺が打った最高の斧に、魔法の仕上げをしてやりたいんだ。","鈍ら刀だが、魔力をまとえば伝説の剣になるはずだぜ！","武器屋を開くんだ。展示品の剣を魔力で輝かせたくてな。","最高のドワーフ鋼は、最高の研磨液で完成する。","これを使って磨き上げれば、国宝級の武具になる！","ワシの自慢の兜をピカピカに磨き上げるぜ！"]
  },
  golden_syrup: {
    wizard: ["神々の飲み物、ネクターに匹敵するシロップと聞いてな。","これを紅茶に一滴垂らすだけで、世界が変わるんじゃろ？","……苦い薬を飲むための、甘いおまけが欲しいだけじゃ。","頭脳労働には極上の糖分が必要なんじゃよ。","錬金術で生み出された『黄金』の味、確かめたい。","魔法の実験で焦げたクッキーを、これで誤魔化すんじゃ。"],
    knight: ["王様に献上する。最高の品でなければ私の首が飛ぶのだ！","王宮の晩餐会で出す極上のスイーツを作りたいのだ。","……ただ、最高に甘くて幸せになれるものが欲しくてな。","戦いの恐怖を、この甘みで忘れさせてくれ。","疲労困憊の身体に、この黄金の糖分が染み渡る……。","鬼教官の誕生日に贈る。少しは優しくなるかもしれん。"],
    youth: ["黄金のシロップ……それを一舐めすれば天国が見えるとか！","疲れ切った脳みそに、黄金の糖分を叩き込みたいんだ！","これを食べれば、寿命が10年延びる気がするぜ！","デートで高級なデザートを振る舞うんだ、頼むぜ！","金欠だけど、これだけは死ぬまでに一度味わいたい！","これ塗れば何でも美味くなる魔法の調味料だろ！？"],
    child: ["世界で一番甘くて美味しいシロップちょうだい！","パンケーキにたーーっぷりかけて食べるんだ！","妖精さんたちがみんな大好きな甘いお水！","これなめたら、虫歯も治っちゃうくらい甘いの？","ママが隠してるおやつより、もっと美味しいのかな！","金色にキラキラしてて、食べるのもったいないや！"],
    woman: ["どんなに悲しいことも忘れられる、至高の甘みをちょうだい。","子供の誕生日に、世界で一番美味しいケーキを焼くの。","私の料理の隠し味よ。これを使えばコンクールはもらったわ！","自分へのご褒美よ。たまには贅沢したっていいでしょ？","……ストレスでドカ食いしたい夜に、これしかないわ。","この黄金の輝きを、唇に塗りたいくらい美しいわ。"],
    elf: ["……このシロップがあれば、あの人も振り向いてくれるかも。","ただのシロップじゃない、黄金の輝きを飲むのよ。","森の果実を、さらに甘く彩る魔法の蜜……。","エルフの舌にも合う、繊細で上品な甘さなのかしら。","花の蜜を集めるより、これを一滴垂らす方が贅沢ね。","自然の甘みを越えるなんて生意気だけど、試してみるわ。"],
    dwarf: ["金よりも価値のある甘み。いくらでも払おうじゃないか。","人生が辛すぎる。せめて舌の上くらい甘くさせてくれや。","ガハハ！これを塗れば、古いブーツでも美味しく食えそうだな！","泥臭いエールに混ぜたら、王侯貴族の酒になるか？","ドワーフの菓子は硬くて味気ねえから、これで補うんだ。","これを舐めながら打つ鉄は、一味違うぜ！"]
  }
};

const SUCCESS_REACTIONS: Record<'perfect'|'good'|'bad', Record<CustomerType, string[]>> = {
  perfect: {
    wizard: ["「お見事じゃ！君の腕は本物じゃな！」", "「完璧な調合じゃ。特別にチップをはずもう。」", "「これほど澄んだ色、老いぼれの目にも焼き付いたわい。」","「素晴らしい。私の弟子にしたいぐらいじゃよ。」","「予想以上の出来栄えだ。感謝するぞ。」"],
    knight: ["「素晴らしい！これこそ私が求めていたものだ！」", "「騎士の誇りにかけて、この恩は忘れないぞ！」", "「君の店を見つけて本当に良かった。感謝する！」","「完璧だ！これならどんな任務も恐れることはない！」","「最高の品質だ。騎士団長にも勧めておこう。」"],
    youth: ["「すっげぇぇ！あんた天才じゃんか！」", "「マジで最高！友達にも絶対教えるぜ！」", "「テンションぶち上がるぜ！おまけに金置いとく！」","「うおおお！なんだこれ、最高に良い感じだぜ！」","「神レベルのポーションじゃん！一生通うわ！」"],
    child: ["「わあーっ！キラキラしてる！ありがとう！」", "「魔女のお姉ちゃん、だーいすき！」", "「すっごい！宝物にするね！」","「お母さんに自慢しちゃおーっと！」","「えへへ、お姉ちゃん天才だね！」"],
    woman: ["「震えるほど素晴らしい出来ね。感動したわ。」", "「この品質……王宮の錬金術師より上手いじゃない。」", "「一生の恩人だわ！ありがとう、魔女さん！」","「ため息が出るほど美しいわ。お代は多めに置いておくわね。」","「これこそ私が探し求めていた究極の品よ。」"],
    elf: ["「……人間の手でこれほど美しいものが作れるのね。」", "「素晴らしいわ。森の精霊たちも喜んでいる。」", "「完璧ね。いくらでも払う価値があるわ。」","「エルフの秘薬にも劣らない輝き。見事だわ。」","「あなたの調合には、自然への敬意が感じられるわ。」"],
    dwarf: ["「ガハハ！最高品質だ！チップを受け取ってくれ！」", "「これだよこれ！このクオリティを待っていたんだ！」", "「あんたの腕、ドワーフの鍛冶屋も顔負けだぜ！」","「ワシの目に狂いはなかった！最高の取引だ！」","「酒が美味くなるようないい仕事っぷりだぜ！」"]
  },
  good: {
    wizard: ["「うん、悪くない。助かるよ。」", "「無難な仕上がりじゃな。文句はない。」", "「これで十分じゃ。ありがとう。」","「まあ、値段相応といったところじゃな。」"],
    knight: ["「ちょうどいい品質だ。感謝する。」", "「よし、これで準備万端だ。」", "「期待通りの効果だ。また来るぞ。」","「実戦で使うには十分だ。助かった。」"],
    youth: ["「サンキュー！助かったぜ！」", "「いい感じ！またよろしくな！」", "「まあまあだな。普通に使えるぜ。」","「おっ、ありがと！また来るわ！」"],
    child: ["「ありがとう！大事に使うね！」", "「ちゃんと効きそう！えへへ。」", "「お薬買えた！やったー！」","「バイバーイ！またね！」"],
    woman: ["「ええ、これで目的は果たせそうだわ。」", "「標準的なポーションね。ありがとう。」", "「適正価格ね。また利用するわ。」","「助かったわ、またよろしくね。」"],
    elf: ["「及第点ってところかしら。ありがとう。」", "「悪くないわ。自然の力も感じられる。」", "「ふふ、これなら安心して使えるわね。」","「十分よ。ありがとう。」"],
    dwarf: ["「おお、問題なしだ。お代を置いていくぜ。」", "「ガハハ！とりあえずカバンに入れておくよ。」", "「しっかりした作りだ。安心したぜ。」","「よし、これで仕事に戻れるぜ。」"]
  },
  bad: {
    wizard: ["「なんだこの泥水は！？金返せ！」", "「素人が作ったのか？がっかりじゃ。」", "「……最悪じゃ。二度と来るか。」","「わしの魔力が穢れてしまいそうじゃ…」"],
    knight: ["「ぼったくりか？こんなのに満額は払えん！」", "「色が変だぞ。本当に大丈夫なのか？」", "「君の店には期待していたのだがな……。」","「命を預ける薬だというのに、なんだこれは！」"],
    youth: ["「え、何これマズっ！半分しか払わねえぞ！」", "「あーあ、材料の無駄遣いだな。」", "「ふざけてるのか？ちゃんとしたのを出せよ！」","「テンション下がるわー、マジ最悪。」"],
    child: ["「……くさい。これお薬じゃないよぉ。」", "「なんか変なゴミが入ってる……。」", "「もう来ない！へたくそ！」","「お腹痛くなっちゃいそう…やだなぁ。」"],
    woman: ["「これ飲んでお腹壊さないか心配だわ……。」", "「……もう行くわ。最悪の気分。」", "「こんなものを客に出すなんて信じられない。」","「ゴミを売りつけるなんていい度胸してるわね。」"],
    elf: ["「ドブの味がしそう。勘弁してちょうだい。」", "「……はぁ。もっとマシな店を探すわ。」", "「自然への冒涜ね。話にならないわ。」","「不愉快極まりないわ。二度と来ない。」"],
    dwarf: ["「適当に混ぜただけだろ？バレてるぞ！」", "「なんだこのガラクタは……金を取れるレベルじゃねえ。」", "「……金は置いていくが、二度と来ないからな。」","「こんなもん飲んだら腹を壊しちまう！」"]
  }
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
  const [gameState, setGameState] = useState<GameState>('title');
  const [hasSave, setHasSave] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('shop');
  const [gold, setGold] = useState(100);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [potions, setPotions] = useState<Record<string, number>>({});
  const [unlockedRecipes, setUnlockedRecipes] = useState<string[]>(['healing']);
  const [unlockedLocations, setUnlockedLocations] = useState<string[]>(['forest', 'swamp', 'mine']);
  
  const [salesCount, setSalesCount] = useState(0);
  const [hoodedManState, setHoodedManState] = useState<HoodedManState>('pending');
  const [mysteriousPowder, setMysteriousPowder] = useState(0);
  const [forestVisits, setForestVisits] = useState(0); // 内部的なカウント用として残す

  const [showInv, setShowInv] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [mapDetail, setMapDetail] = useState<MapLocation | null>(null);
  const [gatheringLocation, setGatheringLocation] = useState<string | null>(null);
  const [gatheringCart, setGatheringCart] = useState<Record<string, number>>({});
  const [gatheringSpawnedRecipe, setGatheringSpawnedRecipe] = useState<string | null>(null);
  
  const [customer, setCustomer] = useState<{isHoodedMan?: boolean, type: CustomerType, dialogue: string, potionWanted: string, state: 'waiting'|'negotiating'|'done'} | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<string | null>(null);
  const [cauldron, setCauldron] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{text: string, type: 'success'|'error'|'info'} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('witch_potion_save_v6');
    if (saved) setHasSave(true);
  }, []);

  const saveGame = () => {
    localStorage.setItem('witch_potion_save_v6', JSON.stringify({ gold, inventory, potions, unlockedRecipes, unlockedLocations, mysteriousPowder, salesCount, hoodedManState, forestVisits }));
  };

  useEffect(() => {
    if (gameState === 'playing') saveGame();
  }, [gold, inventory, potions, unlockedRecipes, unlockedLocations, mysteriousPowder, salesCount, hoodedManState, forestVisits, gameState]);

  const startGame = (isContinue: boolean) => {
    if (isContinue) {
      const d = JSON.parse(localStorage.getItem('witch_potion_save_v6')!);
      setGold(d.gold); setInventory(d.inventory); setPotions(d.potions);
      setUnlockedRecipes(d.unlockedRecipes); setUnlockedLocations(d.unlockedLocations);
      setMysteriousPowder(d.mysteriousPowder || 0); setSalesCount(d.salesCount || 0);
      setHoodedManState(d.hoodedManState || 'pending'); setForestVisits(d.forestVisits || 0);
    } else {
      localStorage.removeItem('witch_potion_save_v6');
      setGold(100); setInventory({}); setPotions({}); setUnlockedRecipes(['healing']); setUnlockedLocations(['forest', 'swamp', 'mine']);
      setMysteriousPowder(0); setSalesCount(0); setHoodedManState('pending'); setForestVisits(0);
    }
    setGameState('playing');
  };

  const showMsg = (text: string, type: 'success'|'error'|'info' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (activeTab === 'shop' && !customer) {
      const timer = setTimeout(() => {
        if (salesCount >= 30 && hoodedManState !== 'completed') {
          setCustomer({
            isHoodedMan: true,
            type: 'wizard', 
            dialogue: "……『骨粉』と『猛毒ガエル』、そして『妖精の粉』を混ぜたものをくれ。",
            potionWanted: 'mystery',
            state: 'waiting'
          });
          if (hoodedManState === 'pending') setHoodedManState('active');
        } else {
          const available = unlockedRecipes;
          const wanted = available[Math.floor(Math.random() * available.length)];
          const types: CustomerType[] = ['wizard', 'knight', 'youth', 'child', 'woman', 'elf', 'dwarf'];
          const cType = types[Math.floor(Math.random() * types.length)];
          
          const dials = DIALOGUES[wanted]?.[cType] || DIALOGUES['healing']['wizard'];
          const dial = dials[Math.floor(Math.random() * dials.length)];
          setCustomer({ type: cType, dialogue: dial, potionWanted: wanted, state: 'waiting' });
        }
        setNegotiationResult(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, customer, unlockedRecipes, salesCount, hoodedManState, gameState]);

  const handleNegotiation = (results: string[]) => {
    if (!customer) return;
    const perfectCount = results.filter(r => r === 'perfect').length;
    const badCount = results.filter(r => r === 'bad').length;
    let rank: 'perfect' | 'good' | 'bad' = 'good';
    let multiplier = 1.0;

    if (perfectCount === 3) { rank = 'perfect'; multiplier = 1.5; }
    else if (badCount >= 2) { rank = 'bad'; multiplier = 0.5; }

    const earns = Math.floor(POTIONS[customer.potionWanted].basePrice * multiplier);
    const reactions = SUCCESS_REACTIONS[rank][customer.type] || SUCCESS_REACTIONS[rank]['wizard'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    setGold(prev => prev + earns);
    setPotions(prev => ({ ...prev, [customer.potionWanted]: prev[customer.potionWanted] - 1 }));
    setSalesCount(prev => prev + 1);
    setNegotiationResult(`${reaction}\n（評価: ${rank === 'perfect' ? '大成功！1.5倍' : rank === 'good' ? '成功' : '失敗…0.5倍'} / 獲得: ${earns}G）`);
    setCustomer({ ...customer, state: 'done' });
    setTimeout(() => setCustomer(null), 5000);
  };

  const handleHoodedManGive = () => {
    if (!customer || !customer.isHoodedMan) return;
    setPotions(prev => ({ ...prev, mystery: prev.mystery - 1 }));
    setMysteriousPowder(prev => prev + 1);
    setHoodedManState('completed');
    setNegotiationResult("「……これは礼だ。」\n(不思議な粉を手に入れた！)");
    setCustomer({ ...customer, state: 'done' });
    setTimeout(() => setCustomer(null), 5000);
  };

  const craft = () => {
    const isMystery = JSON.stringify(cauldron) === JSON.stringify(MYSTERY_RECIPE);
    
    const newInv = { ...inventory };
    Object.keys(cauldron).forEach(k => newInv[k] -= cauldron[k]);
    setInventory(newInv);
    setCauldron({});

    if (isMystery) {
      if (hoodedManState === 'completed') {
        showMsg("何故か上手くいかない。", "error");
      } else {
        setPotions(prev => ({ ...prev, mystery: (prev.mystery || 0) + 1 }));
        showMsg("「？？？のポーション」が完成した！", "success");
      }
      return;
    }

    let targetId: string | null = null;
    for (const [id, p] of Object.entries(POTIONS)) {
      if (JSON.stringify(p.recipe) === JSON.stringify(cauldron)) { targetId = id; break; }
    }
    
    if (targetId) {
      setPotions(prev => ({ ...prev, [targetId!]: (prev[targetId!] || 0) + 1 }));
      showMsg(`${POTIONS[targetId].name} が完成した！`, "success");
    } else {
      showMsg("調合失敗！材料がゴミになった…", "error");
    }
  };

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
    
    let spawned = null;
    const availableLocked = loc.recipes.filter(r => !unlockedRecipes.includes(r));

    if (loc.id === 'forest' && (forestVisits + 1) % 3 === 0) {
      if (availableLocked.length > 0) {
        spawned = availableLocked[0]; 
      } else {
        const allLocked = Object.keys(POTIONS).filter(r => !unlockedRecipes.includes(r) && r !== 'mystery');
        if (allLocked.length > 0) spawned = allLocked[Math.floor(Math.random() * allLocked.length)];
      }
    } else if (availableLocked.length > 0) {
      const isManaAvailable = availableLocked.includes('mana_potion');
      const roll = Math.random();
      
      if (isManaAvailable && roll < 0.25) {
        spawned = 'mana_potion';
      } else if (roll < 0.10) {
        const others = availableLocked.filter(r => r !== 'mana_potion');
        if (others.length > 0) spawned = others[Math.floor(Math.random() * others.length)];
      }
    }
    
    setGatheringSpawnedRecipe(spawned);
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
    
    if (gatheringLocation === 'forest') {
      setForestVisits(prev => prev + 1);
    }

    if (!foundRecipe) showMsg("無事に家に戻った。", "info");
    setGatheringLocation(null);
  };

  if (gameState === 'title') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-serif flex flex-col items-center justify-center select-none">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_#8b5e3c_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="z-10 flex flex-col items-center">
          <div className="text-8xl mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">🧪</div>
          <h1 className="text-4xl font-bold text-amber-400 mb-12 tracking-widest text-center border-y border-amber-900/50 py-4">魔女のポーション屋</h1>
          
          <div className="flex flex-col gap-4 w-64">
            <button onClick={() => startGame(false)} className="py-4 bg-amber-700/80 hover:bg-amber-600 rounded-xl font-bold text-lg border border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all">
              はじめから
            </button>
            {hasSave && (
              <button onClick={() => startGame(true)} className="py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg border border-slate-600 transition-all text-amber-200">
                つづきから
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-serif flex flex-col items-center select-none overflow-hidden">
      {msg && <div className={`fixed top-4 px-6 py-2 rounded-full shadow-lg z-[100] text-sm font-bold animate-bounce ${msg.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{msg.text}</div>}

      <header className="w-full max-w-md bg-slate-900/80 p-4 border-b border-amber-900/40 flex justify-between items-center z-50">
        <div className="text-amber-500 font-bold">💰 {gold} G</div>
        {/* UIの森訪問回数を削除し、販売数のみ表示に変更 */}
        <div className="text-xs text-slate-500 flex gap-4">
          <span>販売数: {salesCount}</span>
        </div>
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
                  <div className="text-6xl mb-4">{customer.isHoodedMan ? '🧥' : CUSTOMER_EMOJIS[customer.type]}</div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border-l-4 border-amber-600 text-sm mb-4 w-full italic whitespace-pre-wrap">
                    「{customer.dialogue}」
                  </div>
                  {customer.state === 'waiting' && (
                    <div className="w-full text-center">
                      <p className="text-xs text-amber-400 mb-2">求: {customer.isHoodedMan ? '？？？のポーション' : `${POTIONS[customer.potionWanted].icon} ${POTIONS[customer.potionWanted].name}`}</p>
                      
                      {!customer.isHoodedMan && (potions[customer.potionWanted] > 0 ? (
                        <button onClick={() => setCustomer({...customer, state: 'negotiating'})} className="w-full py-3 bg-amber-600 rounded-xl font-bold active:scale-95">交渉して売る</button>
                      ) : <p className="text-slate-500 text-sm">（在庫がありません）</p>)}

                      {customer.isHoodedMan && (potions.mystery > 0 ? (
                        <button onClick={handleHoodedManGive} className="w-full py-3 bg-fuchsia-900 rounded-xl font-bold text-fuchsia-200 active:scale-95 border border-fuchsia-500">渡す</button>
                      ) : <p className="text-slate-500 text-sm">（在庫がありません）</p>)}
                    </div>
                  )}
                  {customer.state === 'negotiating' && !customer.isHoodedMan && <NegotiationMiniGame onComplete={handleNegotiation} />}
                  {negotiationResult && (
                    <div className={`mt-4 p-3 border rounded-lg text-xs text-center whitespace-pre-wrap animate-pulse ${customer.isHoodedMan ? 'bg-fuchsia-900/30 border-fuchsia-500/30 text-fuchsia-200' : 'bg-emerald-900/30 border-emerald-500/30 text-emerald-200'}`}>
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
                  {LOCATIONS[gatheringLocation].ingredients.map(id => (
                    <div key={id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-sm">
                        {INGREDIENTS[id].icon} {INGREDIENTS[id].name} <span className="text-[10px] text-slate-500">({INGREDIENTS[id].weight}kg)</span>
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
                  
                  {gatheringSpawnedRecipe && (
                    <div className="flex items-center justify-between border border-amber-900/50 bg-amber-900/20 p-2 rounded-lg">
                      <div className="text-sm text-amber-200">
                        📜 {POTIONS[gatheringSpawnedRecipe].name}のレシピ <span className="text-[10px] text-amber-500/70">({RECIPE_WEIGHT}kg)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" min="0" max="1" value={gatheringCart[`recipe_${gatheringSpawnedRecipe}`]||0} 
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            const testCart = {...gatheringCart, [`recipe_${gatheringSpawnedRecipe}`]: newVal};
                            if (getWeight(testCart) <= MAX_WEIGHT) setGatheringCart(testCart);
                          }}
                          className="w-12 accent-amber-500"
                        />
                        <span className="text-xs w-6 text-right text-amber-400 font-bold">{gatheringCart[`recipe_${gatheringSpawnedRecipe}`]||0}</span>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={finishGathering} className="w-full py-3 bg-blue-600 rounded-xl font-bold" disabled={getWeight(gatheringCart)>MAX_WEIGHT}>帰る</button>
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
              <button onClick={() => { setUnlockedLocations([...unlockedLocations, 'secret']); setMysteriousPowder(prev => prev - 1); showMsg("秘境の場所が浮かび上がった！", "success"); }} className="mt-4 w-full p-3 bg-fuchsia-900/30 border border-fuchsia-500/50 rounded-xl text-fuchsia-200 text-xs font-bold animate-pulse">不思議な粉を撒く (残り{mysteriousPowder})</button>
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
              {Object.entries(potions).map(([id, qty]) => qty > 0 && <div key={id} className="bg-slate-900 p-2 rounded-xl flex items-center gap-2"><span>{id==='mystery'?'🧪':POTIONS[id]?.icon}</span><span className="text-xs">{id==='mystery'?'？？？のポーション':POTIONS[id]?.name}</span><span className="ml-auto font-bold">x{qty}</span></div>)}
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
                
                {mapDetail.id === 'forest' && (forestVisits + 1) % 3 === 0 && Object.keys(POTIONS).length > unlockedRecipes.length + 1 ? (
                   <span className="bg-fuchsia-900/40 text-fuchsia-200 px-2 py-1 rounded-lg text-[10px] border border-fuchsia-500/50 animate-pulse">✨ 確定レシピあり！</span>
                ) : mapDetail.recipes.filter(r => !unlockedRecipes.includes(r)).length > 0 && (
                  <span className="bg-amber-900/40 text-amber-200 px-2 py-1 rounded-lg text-[10px] border border-amber-500/50">📜 未知のレシピ ({mapDetail.id === 'forest' ? '低〜中確率' : '低確率'})</span>
                )}
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