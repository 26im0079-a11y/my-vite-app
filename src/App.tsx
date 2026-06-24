import { useState, useEffect } from 'react';

type LangMode = 'ja' | 'en' | 'zh_tw' | 'zh_cn';
type TabMode = 'omikuji' | 'shop' | 'inventory' | 'goshuin';
type CategoryMode = 'talisman' | 'skin';

type ShopItem = {
  id: string;
  nameJa: string; nameEn: string; nameTw: string; nameCn: string;
  descJa: string; descEn: string; descTw: string; descCn: string;
  price: number;
  type: CategoryMode;
  isNightOnly?: boolean;
  availableMonths?: number[]; // 📅 季節限定用
};

const SHOP_ITEMS: ShopItem[] = [
  // --- 既存御守 (5種) ---
  { id: 'talisman_bug', nameJa: '無病息災・バグ退散札', nameEn: 'Anti-Bug Talisman', nameTw: '驅逐程式錯誤符', nameCn: '驱逐程序错误符', descJa: 'コードの不純物を根こそぎクリアにし、予期せぬ例外をシャットアウトする。', descEn: 'Clears impurities in code and completely blocks unexpected exceptions.', descTw: '將程式碼中的雜質悉數清除，完全杜絕意料之外的異常。', descCn: '将代码中的杂质悉数清除，完全杜绝意料之外的异常。', price: 150, type: 'talisman' },
  { id: 'talisman_match', nameJa: '良縁成就・同期安定守', nameEn: 'Sync Harmony Amulet', nameTw: '同步安定緣結守', nameCn: '同步安定缘结守', descJa: '非同期処理の競合を未然に防ぎ、あらゆる関係性を美しく同期させる。', descEn: 'Prevents race conditions and beautifully synchronizes all relations.', descTw: '未雨綢繆防止非同步處理衝突，使一切因緣關係皆能完美同步。', descCn: '未雨绸缪防止异步处理冲突，使一切因缘关系皆能完美同步。', price: 200, type: 'talisman' },
  { id: 'talisman_spec', nameJa: '急な仕様変更魔除守', nameEn: 'Spec-Change Ward', nameTw: '規格變更魔除守', nameCn: '规格变更魔除守', descJa: '深夜に舞い込む恐ろしい要件定義の書き換えを、見えざる壁で弾き返す。', descEn: 'Repels horrifying late-night requirement changes with an invisible shield.', descTw: '以無形之盾強硬彈回深夜傳來、令人毛骨悚然的規格變更。', descCn: '以无形之盾强硬弹回深夜传来、令人毛骨悚然的规格变更。', price: 300, type: 'talisman' },
  { id: 'talisman_overtime', nameJa: '定時退社・健康祈願符', nameEn: 'Leave-on-Time Rune', nameTw: '準時下班祈願符', nameCn: '准时下班祈愿符', descJa: '定時が近づくと強制的に作業終了へと導く、労働環境の守護ルーン。', descEn: 'A protective rune that guides you to a clean wrap-up when clock-out time nears.', descTw: '每逢下班時間便強制導向收尾階段，捍衛勞動環境的守護符文。', descCn: '每逢下班时间便强制导向收尾阶段，捍卫劳动环境守护符文。', price: 350, type: 'talisman' },
  { id: 'talisman_infra', nameJa: '高可用性・インフラ安定護符', nameEn: 'Infra Stability Charm', nameTw: '雲端架構安定符', nameCn: '云端架构安定符', descJa: 'クラウドサーバーの負荷を分散し、99.999%の稼働率を約束する最上位の護符。', descEn: 'Distributes cloud server load, guaranteeing 99.999% uptime.', descTw: '分散雲端伺服器負載，確保高達99.999%系統可用性的至高護符。', descCn: '分散云端服务器负载，确保高达99.999%系统可用性的至高护符。', price: 500, type: 'talisman' },

  // --- 📅 3. 季節限定の御守 (2種) ---
  { id: 'talisman_season_spring', nameJa: '【4月限定】新卒研修生存御守', nameEn: '【April Only】Newbie Survival Ribbon', nameTw: '【4月限定】新卒研修生存御守', nameCn: '【4月限定】新卒研修生存御守', descJa: '環境構築の迷宮や未知の専門用語の嵐を切り抜け、無事に現場（配属先）に生還する力を与える。', descEn: 'Helps navigate the maze of environment setup and terminology to survive training.', descTw: '安然渡過環境建置迷宮與未知術語風暴，賜予順利分發分局生還的神祕力量。', descCn: '安然渡过环境建置迷宫与未知术语风暴，赐予顺利分发分局生还的神秘力量。', price: 240, type: 'talisman', availableMonths: [4] },
  { id: 'talisman_season_winter', nameJa: '【12月限定】年末リリース無事通過祈願札', nameEn: '【December Only】Year-End Release Peace Stamp', nameTw: '【12月限定】年末釋出無事通過祈願札', nameCn: '【12月限定】年末释放无事通过祈愿札', descJa: '御用納め直前のデスマーチ及び恐怖の本番デプロイを奇跡的に無風で通過させるお守り。', descEn: 'Miraculously secures a calm end-of-year live deploy right before the winter holidays.', descTw: '在工作結束前的死線狂奔及恐怖正式上線中，創造奇蹟般平靜通過的無風守護。', descCn: '在工作结束前的死线狂奔及恐怖正式上线中，创造奇迹般平静通过的无风守护。', price: 490, type: 'talisman', availableMonths: [12] },

  // --- スキン仕様 (4種) ---
  { id: 'skin_default', nameJa: '通常仕様（漆黒の闇）', nameEn: 'Default (Pitch Black)', nameTw: '通常款式（漆黑之闇）', nameCn: '通常款式（漆黑之暗）', descJa: 'デフォルト。深淵なる電子の夜空。何の色にも染まらない静寂の黒。', descEn: 'The default state. An abyssal cyber sky wrapped in absolute serene black.', descTw: '預設款式。深邃的電子夜空，不著痕跡的寂靜之黑。', descCn: '默认款式。深邃的电子夜空，不着痕迹的寂静之黑。', price: 100, type: 'skin' },
  { id: 'skin_neon', nameJa: '背景：電脳ネオン鳥居', nameEn: 'Skin: Cyber Neon Torii', nameTw: '背景：電腦霓虹鳥居', nameCn: '背景：电脑霓虹鸟居', descJa: 'サイバーパンクの神髄。極彩色のネオンが優しくまたたき、結界を妖しく彩る。', descEn: 'Cyberpunk essence. Multi-colored neon gently pulses, framing a mysterious barrier.', descTw: '賽博龐克的精髓。五彩斑斕的霓虹溫柔閃爍，將結界染上妖異迷人的色彩。', descCn: '赛博朋克的精髓。五彩斑斓的霓虹温柔闪烁，将结界染上妖异迷人的色彩。', price: 250, type: 'skin' },
  { id: 'skin_matrix', nameJa: '背景：電子コードの雨', nameEn: 'Skin: Digital Code Rain', nameTw: '背景：電子代碼瀑布', nameCn: '背景：电子代码瀑布', descJa: '上空から果てしなく降り注ぐ緑の16進数パケット。ハッカーの精神安寧。', descEn: 'Endless streams of cascading green hex packets. True tranquility for a hacker.', descTw: '從天而降、綿延不絕的綠色十六進位代碼封包。駭客的心靈綠洲。', descCn: '从天而降、绵延不绝的绿色十六进制代码封包。客的心灵绿洲。', price: 300, type: 'skin' },
  { id: 'skin_sakura', nameJa: '背景：桜満開・電脳春嵐', nameEn: 'Skin: Cherry Blossom Storm', nameTw: '背景：櫻花滿開・電腦春嵐', nameCn: '背景：樱花满开・电脑春岚', descJa: '和風サイバーの新境地。画面の奥底で淡いピンクのデジタル桜吹雪が美しく舞い落ちる。', descEn: 'Neo-traditional fusion. Pale pink digital petals cascade elegantly through the depths.', descTw: '和風賽博新境界。粉嫩的數位櫻花雨在畫面深處優雅飛舞飄落。', descCn: '和风赛博新境界。粉嫩的数码樱花雨在画面变深处优雅飞舞飘落。', price: 400, type: 'skin' }
];

type OmikujiResult = {
  fortune: string;
  detail: string;
  luckyItem: string;
  luckyLang: string;
  points: string;
  change: number;
  type: 'plus' | 'minus' | 'jackpot' | 'hacker';
};

const OMIKUJI_POOL: { [key in LangMode]: OmikujiResult[] } = {
  ja: [
    { fortune: '超大吉', detail: '奇跡が連鎖します！本番デプロイが自動で完全成功し、技術負債がすべてガベージコレクトされました。所持金が大幅に増えます。', luckyItem: '虹色に輝くLANケーブル', luckyLang: 'TypeScript', points: '▲━●━▼', change: 100, type: 'plus' },
    { fortune: '大吉', detail: '最高にクリーンな1日。コードレビューは一発通過、インフラは完全に安定。想定外の臨時報酬を受け取るでしょう。', luckyItem: '無水エタノール', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: '吉', detail: '安定した運気。エラーログの解読が驚くほどスムーズに進みます。自販機で当たりが出るような小さな幸運があります。', luckyItem: 'Escキーの予備', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: '中吉', detail: 'まずまずの発展運。他人の書いたスパゲッティコードの中に、とても便利な共通関数を発見できそうです。', luckyItem: 'ノイズキャンセリングヘッドホン', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: '小吉', detail: '小さな進歩あり。数時間悩んだバグが、タイポ（一文字の間違い）だったことに気付いてスッキリ解決します。', luckyItem: 'ブルーライトカット眼鏡', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: '末吉', detail: '現状維持の運勢。大きな成果はありませんが、障害も起きません。定時退社を最優先にすると吉。', luckyItem: 'ドリップコーヒー', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: '凶', detail: 'やや波乱の予感。コンパイルエラーが多発し、財布から「両」がバグのように勝手に流出する恐れがあります。', luckyItem: 'リセットボタン', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: '大凶', detail: 'システム大破の危機！「ぬるぽ」が直撃し、思わぬ例外処理の連鎖でウォレットに大きな損害（ロスト）が発生します。', luckyItem: 'お祓い済みのUSBメモリ', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ],
  en: [
    { fortune: 'Super Great Blessing', detail: 'Miracles cascade! Production deploy completely succeeds with zero errors, and all tech debt is purged.', luckyItem: 'Rainbow LAN Cable', luckyLang: 'TypeScript', points: '▲━●━▼', change: 100, type: 'plus' },
    { fortune: 'Great Blessing', detail: 'Ultra clean day. Code review passes in one shot. Uptime is 100%. An unexpected bonus lands in your wallet.', luckyItem: 'Anhydrous Ethanol', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: 'Blessing', detail: 'Stable luck. Deciphering error logs is smoother than ever. A small profit finds its way to you.', luckyItem: 'Spare Esc Keycap', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: 'Middle Blessing', detail: 'Decent growth. You will discover a hidden, highly reusable function inside legacy code spaghetti.', luckyItem: 'ANC Headphones', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: 'Small Blessing', detail: 'Minor progress. A bug bothering you for hours is solved instantly after spotting a tiny typo.', luckyItem: 'Blue-light Glasses', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: 'Future Blessing', detail: 'Status quo. No big breakthroughs, but no downtime either. Prioritize clocking out on time.', luckyItem: 'Drip Coffee', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: 'Curse', detail: 'Turbulent currents. Compilation errors spike, causing an unexpected leakage of coins from your wallet.', luckyItem: 'Physical Reset Button', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: 'Great Curse', detail: 'System Breakdown! NullPointer exception hits hard, causing massive damage and draining funds.', luckyItem: 'Blessed USB Drive', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ],
  zh_tw: [
    { fortune: '超大吉', detail: '奇蹟連鎖發生！正式環境部署自動完美成功，技術債務全數被自動回收，錢包容量大幅擴增。', luckyItem: '彩虹光芒網路線', luckyLang: 'TypeScript', points: '▲━●━▼', change: 100, type: 'plus' },
    { fortune: '大吉', detail: '極致純淨的一天。程式碼審查一擊通關，雲端架構穩如泰山。將會獲得意料之外的電子福德。', luckyItem: '無水酒精', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: '吉', detail: '運勢平穩和順。解讀錯誤日誌異常順暢，能避開大部分的地雷。會遇到一些微小的幸運。', luckyItem: '備用 Esc 鍵帽', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: '中吉', detail: '穩定成長之運。在他人留下的陳年面條程式碼中，能驚喜挖掘到極具價值的共通函數。', luckyItem: '主動降噪耳機', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: '小吉', detail: '略有進步。困擾數小時的異常突然發現只是打錯字（Typo），修正後迎刃而解、通體舒暢。', luckyItem: '抗藍光眼鏡', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: '末吉', detail: '維持現狀。雖無亮眼突破但好在四海無事、系統安穩。今日宜將「準時下班」視為最高指導原則。', luckyItem: '濾掛式咖啡', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: '凶', detail: '略有波折之兆。編譯錯誤頻發，資產有如遭遇幽靈漏洞般，發生不明原因的些微流失。', luckyItem: '硬體重設按鈕', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: '大凶', detail: '系統崩潰崩壞危機！遭到「空指標 Null」正面突擊，引發例外處理連鎖效應，導致ウォレット嚴重虧損。', luckyItem: '受過法會淨化的隨身碟', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ],
  zh_cn: [
    { fortune: '超大吉', detail: '奇迹连锁发生！生产环境部署自动完美成功，技术债务全数被自动回收，钱包容量大幅扩增。', luckyItem: '彩虹光芒网线', luckyLang: 'TypeScript', points: '▲━●━▼', change: 100, type: 'plus' },
    { fortune: '大吉', detail: '极致纯净的一天。代码审查一击通关，云端架构稳如泰山。将会获得意料之外的电子福德。', luckyItem: '无水酒精', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: '吉', detail: '运势平稳和顺。解读错误日志异常顺畅，能避开大部分的地雷。会遇到一些微小的幸运。', luckyItem: '备用 Esc 键帽', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: '中吉', detail: '稳定成长之运。在他人留下的陈年面条代码中，能惊喜挖掘到极具价值的共通函数。', luckyItem: '主动降噪耳机', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: '小吉', detail: '略有进步。困扰数小时的异常突然发现只是打错字（Typo），修正后迎刃而解、通体舒畅。', luckyItem: '抗蓝光眼镜', luckyLang: 'JavaScript', points: '▲━●━图', change: 10, type: 'plus' },
    { fortune: '末吉', detail: '维持现状。虽无亮眼突破但好在四海无事、系统安稳。今日宜将“准时下班”视为最高指导原则。', luckyItem: '挂耳式咖啡', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: '凶', detail: '略有波折之兆。编译错误频发，资产有如遭遇幽灵漏洞般，发生不明原因的些微流失。', luckyItem: '硬件重置按钮', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: '大凶', detail: '系统崩溃崩坏危机！遭到“空指针 Null”正面突击，引发异常处理连锁效应，导致钱包严重亏损。', luckyItem: '受过法会净化的闪存盘', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ]
};

export default function CyberShrine() {
  const [lang, setLang] = useState<LangMode>('ja');
  const [tab, setTab] = useState<TabMode>('omikuji');
  const [wallet, setWallet] = useState<number>(300);
  const [inventory, setInventory] = useState<ShopItem[]>([]);
  const [logs, setLogs] = useState<{ id: string; date: string; fortune: string }[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>('skin_default');

  // ⭐️ 新設機能のステート群
  const [equippedIds, setEquippedIds] = useState<string[]>([]); // 2. 装備システム (最大3つ)
  const [searchQuery, setSearchQuery] = useState<string>(''); // 6. 検索キーワード
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date'); // 6. ソート方法
  const [surpriseMessage, setSurpriseMessage] = useState<string>(''); // 1. サプライズ通知用

  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  // 時間チェック
  useEffect(() => {
    const checkTime = () => {
      const hours = new Date().getHours();
      setIsNight(hours >= 18 || hours < 6);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // 🛡️ 7. 開発者ツール（F12）検知イースターエッグ
  useEffect(() => {
    const triggerHackerCurse = () => {
      setResult({
        fortune: 'ハッカー大凶',
        detail: '【警告：不正パケット検知】ブラウザの開発者ツールが展開されました。神罰（デバッグ）が下り、ウォレットに深刻なエラーが発生します。',
        luckyItem: 'F12をそっと閉じること',
        luckyLang: 'Assembly',
        points: '▼━▼━▼',
        change: -50,
        type: 'hacker'
      });
      setWallet(prev => Math.max(0, prev - 50));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        triggerHackerCurse();
      }
    };

    const handleResize = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        triggerHackerCurse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ローカルストレージ連携
  useEffect(() => {
    const savedWallet = localStorage.getItem('cyber_wallet');
    const savedInv = localStorage.getItem('cyber_inventory');
    const savedLogs = localStorage.getItem('cyber_logs');
    const savedSkin = localStorage.getItem('cyber_skin');
    const savedEquips = localStorage.getItem('cyber_equipped');

    if (savedWallet) setWallet(Number(savedWallet));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedSkin) setActiveSkin(savedSkin);
    if (savedEquips) setEquippedIds(JSON.parse(savedEquips));
  }, []);

  const saveToStorage = (newWallet: number, newInv: ShopItem[], newLogs: any[], newSkin: string, newEquips: string[]) => {
    localStorage.setItem('cyber_wallet', newWallet.toString());
    localStorage.setItem('cyber_inventory', JSON.stringify(newInv));
    localStorage.setItem('cyber_logs', JSON.stringify(newLogs));
    localStorage.setItem('cyber_skin', newSkin);
    localStorage.setItem('cyber_equipped', JSON.stringify(newEquips));
  };

  // おみくじを引く
  const handleOmikuji = () => {
    if (isRolling) return;
    setIsRolling(true);
    setSurpriseMessage('');

    setTimeout(() => {
      const pool = OMIKUJI_POOL[lang] || OMIKUJI_POOL['ja'];
      const idx = Math.floor(Math.random() * pool.length);
      let baseResult = { ...pool[idx] };

      // 🎒 2. 御守装備システムバフ計算
      let walletChange = baseResult.change;
      if (baseResult.type === 'plus') {
        walletChange += (equippedIds.length * 10); // 装備中の御守1つにつき最低獲得両+10
      }

      // 🪙 1. ウォレットの一攫千金要素 (超低確率サプライズ)
      const rollEvent = Math.random();
      if (rollEvent < 0.006) { // 0.6%で分散型埋蔵金発掘
        const jackpot = 2000;
        walletChange += jackpot;
        baseResult.fortune = '分散型埋蔵金発掘';
        setSurpriseMessage('✨【超希イベント】分散型埋蔵金を発掘！お財布の桁が変わるサプライズ！(+2000両)');
        baseResult.type = 'jackpot';
      } else if (rollEvent > 0.994) { // 0.6%でシステム大破
        const loss = Math.floor(wallet * 0.4);
        walletChange = -loss;
        baseResult.fortune = 'システム大破';
        setSurpriseMessage(`🚨【致命的エラー】システム大破により、ウォレットの財貨が虚無へと消滅しました...(-${loss}両)`);
        baseResult.type = 'minus';
      }

      const nextWallet = Math.max(0, wallet + walletChange);
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleTimeString(),
        fortune: baseResult.fortune
      };
      const nextLogs = [newLog, ...logs].slice(0, 20);

      setWallet(nextWallet);
      setResult(baseResult);
      setLogs(nextLogs);
      setIsRolling(false);

      saveToStorage(nextWallet, inventory, nextLogs, activeSkin, equippedIds);
    }, 800);
  };

  // ショップ購入
  const handleBuy = (item: ShopItem) => {
    if (wallet < item.price) {
      alert(lang === 'ja' ? 'ウォレットの「両」が不足しています。' : 'Insufficient ryo.');
      return;
    }
    if (inventory.some(i => i.id === item.id)) {
      alert(lang === 'ja' ? '既に所持しています。' : 'Already owned.');
      return;
    }

    const nextWallet = wallet - item.price;
    const nextInv = [...inventory, item];
    let nextSkin = activeSkin;

    if (item.type === 'skin') {
      nextSkin = item.id;
      setActiveSkin(nextSkin);
    }

    setWallet(nextWallet);
    setInventory(nextInv);
    saveToStorage(nextWallet, nextInv, logs, nextSkin, equippedIds);
  };

  // 🎒 2. 装備切り替え
  const toggleEquip = (id: string) => {
    let next = [...equippedIds];
    if (next.includes(id)) {
      next = next.filter(eId => eId !== id);
    } else {
      if (next.length >= 3) {
        alert(lang === 'ja' ? '御守は3つまでしか装備できません！' : 'Max 3 items.');
        return;
      }
      next.push(id);
    }
    setEquippedIds(next);
    saveToStorage(wallet, inventory, logs, activeSkin, next);
  };

  // お焚き上げ
  const handleClear = () => {
    setIsBurning(true);
    setTimeout(() => {
      localStorage.clear();
      setWallet(300);
      setInventory([]);
      setLogs([]);
      setResult(null);
      setActiveSkin('skin_default');
      setEquippedIds([]);
      setSurpriseMessage('');
      setIsBurning(false);
      setShowModal(false);
    }, 1000);
  };

  // 📅 3. 季節限定フィルター用の現在の月
  const currentMonth = new Date().getMonth() + 1;
  const filteredShopItems = SHOP_ITEMS.filter(item => {
    if (item.isNightOnly && !isNight) return false;
    if (item.availableMonths && !item.availableMonths.includes(currentMonth)) return false;
    return true;
  });

  // 🔍 6. インベントリのソート・検索
  const processedInventory = inventory
    .filter(item => {
      const name = lang === 'ja' ? item.nameJa : item.nameEn;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.nameJa.localeCompare(b.nameJa);
      if (sortBy === 'price') return b.price - a.price;
      return 0; // 'date' はそのまま
    });

  // 📊 5. バイオリズムを簡易パースしてグラフ化するためのロジック
  const getBiorhythmHeights = (symbolStr: string) => {
    if (symbolStr === '▼━▼━▼') return [15, 15, 15];
    if (symbolStr === '▲━●━▼') return [85, 50, 15];
    return [50, 50, 50];
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-serif relative overflow-hidden flex flex-col items-center justify-start p-4 sm:p-6 select-none">
      
      {/* 🌸 4. 背景仕様（スキン）のアニメーション化 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {activeSkin === 'skin_default' && (
          <div className="absolute inset-0 bg-radial-[at_center_center] from-stone-900 via-stone-950 to-black opacity-80" />
        )}
        
        {/* 電脳ネオン鳥居（ネオンが優しくまたたく） */}
        {activeSkin === 'skin_neon' && (
          <div className="absolute inset-0 bg-stone-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a1330_1px,transparent_1px),linear-gradient(to_bottom,#2a1330_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-t-4 border-x-2 border-fuchsia-500 rounded-t shadow-[0_0_20px_rgba(217,70,239,0.6)] opacity-70 animate-pulse" style={{ animationDuration: '2.5s' }} />
          </div>
        )}

        {/* 電子コードの雨 */}
        {activeSkin === 'skin_matrix' && (
          <div className="absolute inset-0 bg-stone-950 opacity-40 overflow-hidden text-emerald-500 font-mono text-[9px] p-2 break-all leading-none animate-pulse">
            {Array.from({ length: 30 }).map(() => "014FDE20FFBC8A9023CCCC").join(" ")}
          </div>
        )}

        {/* 桜満開（桜吹雪のパーティクルが画面裏でゆっくり舞い落ちる） */}
        {activeSkin === 'skin_sakura' && (
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950">
            <div className="absolute top-[-10%] left-[20%] w-2 h-3 bg-rose-300 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '6s' }} />
            <div className="absolute top-[-5%] left-[50%] w-3 h-3 bg-pink-400 rounded-sm opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-[-12%] left-[80%] w-2 h-4 bg-rose-400 rounded-full opacity-50 animate-bounce" style={{ animationDuration: '5s' }} />
          </div>
        )}
      </div>

      {/* ⛩️ メイン筐体 */}
      <div className="w-full max-w-md bg-stone-900/95 border border-stone-800 rounded shadow-2xl p-4 sm:p-5 z-10 backdrop-blur-sm">
        
        {/* ヘッダー */}
        <div className="border-b border-stone-800 pb-2 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold tracking-widest text-red-700 flex items-center gap-1.5">
              <span>⛩️</span> 電脳授与御神籤
            </h1>
            <p className="text-[9px] font-sans text-stone-500 mt-0.5">
              {isNight ? '🌙 結界深度：夜間限定仕様適用中' : '☀️ 結界深度：通常稼働中'}
            </p>
          </div>

          {/* 言語選択 */}
          <div className="flex gap-1 bg-stone-950 p-0.5 rounded border border-stone-800 text-[10px] font-sans">
            {(['ja', 'en', 'zh_tw', 'zh_cn'] as LangMode[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-1.5 py-0.5 rounded transition-all uppercase ${lang === l ? 'bg-red-900 text-stone-100 font-bold' : 'text-stone-500 hover:text-stone-300'}`}
              >
                {l === 'zh_tw' ? '繁' : l === 'zh_cn' ? '简' : l}
              </button>
            ))}
          </div>
        </div>

        {/* ウォレット残高 */}
        <div className="bg-stone-950 p-2 rounded border border-stone-800 flex justify-between items-center mb-4 font-sans text-xs">
          <span className="text-stone-400">🪙 {lang === 'ja' ? '現在の所持金' : 'Wallet'}</span>
          <span className="text-base font-mono font-bold text-amber-500">
            {wallet} <span className="text-[11px] font-serif text-stone-400">両</span>
          </span>
        </div>

        {/* タブ */}
        <div className="flex bg-stone-950 rounded p-0.5 border border-stone-800 mb-4 text-xs font-sans">
          {(['omikuji', 'shop', 'inventory', 'goshuin'] as TabMode[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1 rounded transition-all text-center ${tab === t ? 'bg-stone-800 text-red-500 font-bold border border-stone-700' : 'text-stone-400 hover:text-stone-200'}`}
            >
              {t === 'omikuji' && (lang === 'ja' ? '🔮 抽籤' : '🔮 Fortune')}
              {t === 'shop' && (lang === 'ja' ? '⛩️ 授与所' : '⛩️ Shop')}
              {t === 'inventory' && (lang === 'ja' ? '🎒 懐中袋' : '🎒 Bag')}
              {t === 'goshuin' && (lang === 'ja' ? '📜 履歴' : '📜 Logs')}
            </button>
          ))}
        </div>

        {/* 🔮 おみくじタブ */}
        {tab === 'omikuji' && (
          <div className="text-center py-1">
            {/* 一攫千金・システム大破時のサプライズ通知 */}
            {surpriseMessage && (
              <div className="mb-3 p-2 bg-amber-950/40 border border-amber-800/60 rounded text-[11px] text-amber-400 font-sans text-left leading-relaxed">
                {surpriseMessage}
              </div>
            )}

            <div className="bg-stone-950 border border-stone-800 rounded p-5 mb-4 min-h-[140px] flex flex-col items-center justify-center relative">
              {isRolling ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[11px] text-stone-400 font-sans tracking-widest animate-pulse">神速乱数調律中...</p>
                </div>
              ) : result ? (
                <div className="w-full text-center">
                  <div className={`text-xl font-bold tracking-widest mb-2 ${result.type === 'plus' || result.type === 'jackpot' ? 'text-red-600' : 'text-stone-400'}`}>
                    【{result.fortune}】
                  </div>
                  <p className="text-xs text-stone-300 px-2 leading-relaxed mb-4 font-sans text-left border-t border-b border-stone-900 py-2">
                    {result.detail}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-left text-[10px] font-sans bg-stone-900 p-2 rounded border border-stone-800/40">
                    <div>
                      <span className="text-stone-500 block">💻 有縁の電脳物品</span>
                      <span className="text-stone-300">{result.luckyItem}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">🔣 相性の良い言語</span>
                      <span className="text-red-400 font-mono font-bold">{result.luckyLang}</span>
                    </div>
                  </div>

                  {/* 📊 5. 運気バイオリズムのグラフ視覚化 */}
                  <div className="mt-3 pt-2 text-left">
                    <span className="text-[9px] text-stone-500 font-sans block mb-1">📈 運気バイオリズムグラフ</span>
                    <div className="flex items-end justify-center gap-3 h-8 bg-stone-900 p-1 rounded border border-stone-800/60">
                      {getBiorhythmHeights(result.points).map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                          <div 
                            className={`w-3 rounded-t-xs transition-all duration-300 ${h > 60 ? 'bg-emerald-600' : h < 30 ? 'bg-red-700' : 'bg-amber-500'}`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-stone-500 text-xs py-4 font-sans">
                  おみくじを引いて電子の宣託を受信してください。
                </div>
              )}
            </div>

            <button
              onClick={handleOmikuji}
              disabled={isRolling}
              className="w-full bg-red-800 hover:bg-red-900 text-stone-100 font-bold py-2.5 px-4 rounded text-xs tracking-widest transition-colors disabled:opacity-50"
            >
              {isRolling ? '通信中...' : '御神籤を引く'}
            </button>
          </div>
        )}

        {/* ⛩️ 授与所（ショップ）タブ */}
        {tab === 'shop' && (
          <div className="space-y-2">
            <div className="text-[10px] text-stone-400 font-sans flex justify-between">
              <span>授与品ラインナップ (月条件: {currentMonth}月)</span>
              {equippedIds.length > 0 && <span className="text-emerald-400">装備バフ適用中 ({equippedIds.length}/3)</span>}
            </div>
            <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {filteredShopItems.map((item) => {
                const isOwned = inventory.some(i => i.id === item.id);
                const name = lang === 'ja' ? item.nameJa : item.nameEn;
                return (
                  <div key={item.id} className="p-2 bg-stone-950/60 border border-stone-800 rounded flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold truncate text-stone-200">{name}</span>
                        {item.availableMonths && <span className="text-[8px] bg-red-950 text-red-400 px-1 rounded">季節限定</span>}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate font-sans">
                        {lang === 'ja' ? item.descJa : item.descEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-amber-500 font-bold">{item.price}両</span>
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={isOwned}
                        className={`px-2 py-0.5 rounded text-[10px] font-sans ${isOwned ? 'bg-stone-800 text-stone-600' : 'bg-red-900 text-stone-100 hover:bg-red-800'}`}
                      >
                        {isOwned ? '拝受済' : '拝受'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🎒 懐中袋（インベントリ）タブ */}
        {tab === 'inventory' && (
          <div className="space-y-2">
            
            {/* 🔍 6. インベントリのソート・検索機能ツールバー */}
            <div className="flex gap-1.5 font-sans text-[10px]">
              <input
                type="text"
                placeholder="名称で絞り込み..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-300 focus:outline-none focus:border-red-800"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-950 border border-stone-800 rounded px-1.5 py-1 text-stone-400"
              >
                <option value="date">拝受順</option>
                <option value="name">五十音順</option>
                <option value="price">価格順</option>
              </select>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {processedInventory.length === 0 ? (
                <div className="text-center text-stone-600 py-6 font-sans text-[11px]">該当するアイテムがありません。</div>
              ) : (
                processedInventory.map((item) => {
                  const name = lang === 'ja' ? item.nameJa : item.nameEn;
                  const isEquipped = equippedIds.includes(item.id);
                  return (
                    <div key={item.id} className="p-2 bg-stone-950/60 border border-stone-800 rounded flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-stone-200 truncate block">{name}</span>
                        <span className="text-[9px] text-stone-500 block truncate font-sans">{lang === 'ja' ? item.descJa : item.descEn}</span>
                      </div>
                      
                      <div className="flex gap-1 shrink-0 font-sans text-[10px] ml-2">
                        {item.type === 'talisman' && (
                          <button
                            onClick={() => toggleEquip(item.id)}
                            className={`px-2 py-0.5 rounded border ${isEquipped ? 'bg-emerald-950 border-emerald-700 text-emerald-400 font-bold' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
                          >
                            {isEquipped ? '装備中' : '装備'}
                          </button>
                        )}
                        {item.type === 'skin' && (
                          <button
                            onClick={() => {
                              setActiveSkin(item.id);
                              saveToStorage(wallet, inventory, logs, item.id, equippedIds);
                            }}
                            disabled={activeSkin === item.id}
                            className={`px-2 py-0.5 rounded border ${activeSkin === item.id ? 'bg-amber-950 border-amber-800 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
                          >
                            {activeSkin === item.id ? '適用中' : '適用'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 📜 履歴タブ */}
        {tab === 'goshuin' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
              <span>神託受信パケットログ</span>
              <button onClick={() => setShowModal(true)} className="text-red-700 hover:underline">お焚き上げする</button>
            </div>
            <div className="max-h-[220px] overflow-y-auto space-y-1 bg-stone-950 p-2 rounded border border-stone-900 font-mono text-[11px] text-stone-400">
              {logs.length === 0 ? (
                <div className="text-center text-stone-700 py-6 font-serif">記録がありません。</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex justify-between border-b border-stone-900 pb-0.5">
                    <span>[{log.date}] recv:</span>
                    <span className="text-red-800 font-serif font-bold">{log.fortune}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-stone-100 border border-red-800 max-w-xs w-full rounded p-5 text-stone-900 text-center">
            <h4 className="font-bold text-red-800 mb-2">お焚き上げの確認</h4>
            <p className="text-xs text-stone-600 font-sans leading-relaxed mb-4">
              これまでのデータ（所持金・懐中袋・履歴）がすべて消去されます。よろしいですか？
            </p>
            <div className="flex gap-2 justify-center font-sans text-xs">
              <button onClick={handleClear} disabled={isBurning} className="bg-red-800 text-white px-3 py-1.5 rounded font-bold">
                {isBurning ? '消滅中...' : '実行'}
              </button>
              <button onClick={() => setShowModal(false)} disabled={isBurning} className="bg-stone-300 text-stone-700 px-3 py-1.5 rounded font-bold">
                中止
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}