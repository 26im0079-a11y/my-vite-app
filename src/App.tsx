import { useState, useEffect } from 'react';

type LangMode = 'ja' | 'en' | 'zh_tw' | 'zh_cn';
type TabMode = 'omikuji' | 'shop' | 'inventory' | 'goshuin'; // 📱 4タブ構成へ拡張

type ShopItem = { id: string; nameJa: string; nameEn: string; nameTw: string; nameCn: string; price: number; type: 'talisman' | 'skin' };

// 🛒 増量された授与所データ（絵文字・「背景：」接頭辞を削除、全10種類）
const SHOP_ITEMS: ShopItem[] = [
  // 御守・護符（5種類）
  { id: 'talisman_bug', nameJa: '無病息災・バグ退散札', nameEn: 'Anti-Bug Talisman', nameTw: '驅逐程式錯誤符', nameCn: '驱逐程序错误符', price: 150, type: 'talisman' },
  { id: 'talisman_match', nameJa: '良縁成就・同期安定守', nameEn: 'Sync Harmony Amulet', nameTw: '同步安定緣結守', nameCn: '同步安定缘结守', price: 200, type: 'talisman' },
  { id: 'talisman_spec', nameJa: '急な仕様変更魔除守', nameEn: 'Spec-Change Ward', nameTw: '規格變更魔除守', nameCn: '规格变更魔除守', price: 300, type: 'talisman' },
  { id: 'talisman_overtime', nameJa: '定時退社・健康祈願符', nameEn: 'Leave-on-Time Rune', nameTw: '準時下班祈願符', nameCn: '准时下班祈愿符', price: 350, type: 'talisman' },
  { id: 'talisman_infra', nameJa: '高可用性・インフラ安定護符', nameEn: 'Infra Stability Charm', nameTw: '雲端架構安定符', nameCn: '云端架构安定符', price: 500, type: 'talisman' },
  
  // 背景スキン（5種類）
  { id: 'wallpaper_gold', nameJa: '黄金金運仕様', nameEn: 'Golden Fortune', nameTw: '黃金金運仕様', nameCn: '黄金金运仕様', price: 400, type: 'skin' },
  { id: 'wallpaper_neon', nameJa: '電脳ネオン鳥居', nameEn: 'Cyber Neon Torii', nameTw: '電腦霓虹鳥居', nameCn: '电脑霓虹鸟居', price: 500, type: 'skin' },
  { id: 'wallpaper_dark', nameJa: '漆黒ダークモード', nameEn: 'Jet Dark Mode', nameTw: '漆黑深色模式', nameCn: '漆黑深色模式', price: 250, type: 'skin' },
  { id: 'wallpaper_washi', nameJa: '和紙風伝統仕様', nameEn: 'Traditional Washi', nameTw: '傳統和紙風貌', nameCn: '传统和纸风貌', price: 300, type: 'skin' },
  { id: 'wallpaper_sakura', nameJa: '桜満開合格仕様', nameEn: 'Sakura in Full Bloom', nameTw: '櫻花滿開合格樣式', nameCn: '樱花满开合格样式', price: 600, type: 'skin' }
];

// 運勢データ
const LUCK_DATA = [
  { fortuneJa: '超大吉', fortuneEn: 'Hyper Grand Luck', fortuneTw: '超大吉', fortuneCn: '超大吉', weight: 1, btnJa: '天命を全うする', btnEn: 'Claim Absolute Destiny', btnTw: '承接天命', btnCn: '承接天命', commentsJa: ['【確率0.1%の奇跡】全サーバーの全ログがあなたを祝福せり。全自動で莫大な福徳（1000両）がウォレットにデポジットされました。'], commentsEn: ['【0.1% Miracle】All core logs celebrate your presence. A massive blessing (1000 Ryo) has been deposited into your wallet automatically.'], commentsTw: ['【機率0.1%的奇蹟】全伺服器的所有日誌皆在為您祝福。無上福德（1000兩）已自動匯入您的加密錢包。'], commentsCn: ['【机率0.1%的奇迹】全服务器的所有日志皆在为您祝福。无上福德（1000两）已自动汇入您的加密钱包。'] },
  { fortuneJa: 'システム大破', fortuneEn: 'CRITICAL SYSTEM CRASH', fortuneTw: '系統大破', fortuneCn: '系统大破', weight: 5, btnJa: '強制パッチ適用', btnEn: 'Apply Hotfix Forcefully', btnTw: '強制修復系統', btnCn: '强制修复系统', commentsJa: ['【致命的エラー：大凶】不穏な例外コードを検知。ペナルティとしてセッション内の資産（所持金）に重大なパケットロス（減少）が発生せり。'], commentsEn: ['【FATAL ERROR】Malicious exception detected. A severe packet loss (money reduction) has occurred in your session assets.'], commentsTw: ['【致命錯誤：大凶】偵測到不穩定的異常代碼。作為懲罰，您在本會話中的資產（所持金）遭遇了嚴重的封包遺失。'], commentsCn: ['【致命错误：大凶】侦测到不稳定的异常代码。作为惩罚，您在本会话中的资产（所含金）遭遇了严重的封包遗失。'] },
  { fortuneJa: '大吉', fortuneEn: 'Great Good Luck', fortuneTw: '大吉', fortuneCn: '大吉', weight: 50, btnJa: '福を重ねる', btnEn: 'Multiply Blessings', btnTw: '重溫福氣', btnCn: '重温福气', commentsJa: ['運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。'], commentsEn: ['Your luck is at its peak; it is the perfect time for anything. Gratitude brings more blessings.'], commentsTw: ['運勢大吉大利，做任何事都是大好時機。切記常懷感恩之心，福報自會加倍而至。'], commentsCn: ['运势大吉大利，做任何事都是大好时机。切记常怀感恩之心，福报自会加倍而至。'] },
  { fortuneJa: '吉', fortuneEn: 'Good Luck', fortuneTw: '吉', fortuneCn: '吉', weight: 150, btnJa: '吉を広げる', btnEn: 'Expand Good Fortune', btnTw: '展延吉兆', btnCn: '展延吉兆', commentsJa: ['誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。'], commentsEn: ['Act with a sincere heart, and your path will open naturally. Wait patiently without rushing.'], commentsTw: ['若以誠懇之心待人處事，前路自會豁然開朗。切勿焦躁，靜待時機。'], commentsCn: ['若以诚恳之心待人处事，前路自会豁然开朗。切勿焦躁，静待时机。'] },
  { fortuneJa: '中吉', fortuneEn: 'Middle Luck', fortuneTw: '中吉', fortuneCn: '中吉', weight: 120, btnJa: '縁を結ぶ', btnEn: 'Nurture Harmony', btnTw: '廣結善緣', btnCn: '广结善缘', commentsJa: ['平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。'], commentsEn: ['Signs of peaceful happiness. Value harmony and show kindness to those around you.'], commentsTw: ['此乃獲得平穩幸福之兆。當注重身心調和，多加關懷身邊之人。'], commentsCn: ['此乃获得平稳幸福之兆。当注重身心调和，多加关怀身边之人。'] },
  { fortuneJa: '小吉', fortuneEn: 'Small Luck', fortuneTw: '小吉', fortuneCn: '小吉', weight: 100, btnJa: '歩みを進める', btnEn: 'Step Forward', btnTw: '漫步向前', btnCn: '漫步向前', commentsJa: ['小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。'], commentsEn: ['Small joys accumulate today. Stay alert and tread carefully to avoid minor mistakes.'], commentsTw: ['小驚喜接連不斷的一天。但切記不可掉以輕心，凡事穩紮穩打為上。'], commentsCn: ['小惊喜接连不断的一天。但切记不可掉以轻心，凡事稳扎稳打为上。'] },
  { fortuneJa: '末吉', fortuneEn: 'Future Luck', fortuneTw: '末吉', fortuneCn: '末吉', weight: 80, btnJa: '時を待つ', btnEn: 'Await the Hour', btnTw: '靜候時機', btnCn: '静候时机', commentsJa: ['今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。'], commentsEn: ['Now is the time to build your strength. Stay calm, drink warm tea, and rest well.'], commentsTw: ['當下為蓄精儲銳之時。宜靜心沉著，品一盞溫茶，好好休養生息。'], commentsCn: ['当下为蓄精储锐之时。宜静心沉著，品一盏温茶，好好休养生息。'] },
  { fortuneJa: '接続大吉', fortuneEn: 'Max Connection Luck', fortuneTw: '連線大吉', fortuneCn: '连线大吉', weight: 60, btnJa: '帯域を広げる', btnEn: 'Maximize Bandwidth', btnTw: '拓寬頻寬', btnCn: '拓宽带宽', commentsJa: ['通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。'], commentsEn: ['Network speed is soaring; videos load instantly. All connections and relationships thrive.'], commentsTw: ['網路速度大幅提升，影片載入僅在瞬間。今日所連結之一切緣分皆順暢無阻。'], commentsCn: ['网络速度大幅提升，视频加载仅在瞬间。今日所连结之一切缘分皆顺畅无阻。'] },
  { fortuneJa: '通信吉', fortuneEn: 'Stable Connection Luck', fortuneTw: '通訊吉', fortuneCn: '通讯吉', weight: 150, btnJa: '同期を保つ', btnEn: 'Stay Synchronized', btnTw: '保持同步', btnCn: '保持同步', commentsJa: ['電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。'], commentsEn: ['Excellent signal strength. An unexpected, heartwarming message may pop up on your screen.'], commentsTw: ['訊號通暢無比。近期似乎會有久未聯絡的舊友，突然傳來令人欣喜的訊息。'], commentsCn: ['信号通畅无比。近期似乎会有久未联络的旧友，突然传来令人欣喜的讯息。'] },
  { fortuneJa: '再起動', fortuneEn: 'System Reboot', fortuneTw: '系統重啟', fortuneCn: '系统重启', weight: 70, btnJa: '新たに紡ぐ', btnEn: 'Reboot Anew', btnTw: '重新啟航', btnCn: '重新启航', commentsJa: ['頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。'], commentsEn: ['If your mind feels heavy, take a long sleep. Refresh your body and soul to reboot your luck.'], commentsTw: ['若感到思緒沉重，切勿硬撐，早些入眠為妙。身心徹底重整後，運勢將大幅好轉。'], commentsCn: ['若感到思绪沉重，切勿硬撑，早些入眠为妙。身心彻底重整后，运势将大幅好转。'] },
  { fortuneJa: '大吉持', fortuneEn: 'Loading Great Luck', fortuneTw: '大吉載入中', fortuneCn: '大吉载入中', weight: 50, btnJa: '読込を待つ', btnEn: 'Complete Loading', btnTw: '靜待載入', btnCn: '静待载入', commentsJa: ['今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。'], commentsEn: ['Current luck is average, but it is loading a massive blessing. A late-bloomer sign.'], commentsTw: ['當前運勢雖看似平凡，但此乃大器晚成之兆，往後將迎來令人驚嘆的巨大福運。'], commentsCn: ['当前运势虽看似平凡，但此乃大器晚成之兆，往后将迎来令人惊叹的巨大福运。'] },
  { fortuneJa: '平', fortuneEn: 'Status Quo', fortuneTw: '平', fortuneCn: '平', weight: 50, btnJa: '平穏を保つ', btnEn: 'Maintain Balance', btnTw: '守持中庸', btnCn: '守持中庸', commentsJa: ['良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。'], commentsEn: ['Neither good nor bad, just a peaceful day. Appreciate the comfort of an ordinary day.'], commentsTw: ['無好亦無壞，波瀾不驚。當細細品味這份平凡安穩帶來的難得福氣。'], commentsCn: ['无好亦无坏，波澜不惊。当细细品味这份平凡安稳带来的难得福气。'] },
  { fortuneJa: '大器晩成', fortuneEn: 'Late Bloomer', fortuneTw: '大器晚成', fortuneCn: '大器晚成', weight: 10, btnJa: '牙を研ぐ', btnEn: 'Sharpen Your Mind', btnTw: '磨礪心志', btnCn: '磨砺心志', commentsJa: ['今はシステムデバッグ中（凶）の如く苦戦するも、これより先、全てのバグは綺麗に解消され、驚くべき大躍進を遂げる運気なり。'], commentsEn: ['Though you struggle now like a system under debugging, all errors will soon clear away, leading to a massive leap forward.'], commentsTw: ['當前雖如系統偵錯（凶）般陷入苦戰，但此後所有阻礙將煙消雲散，迎來驚人的大躍進。'], commentsCn: ['当前虽如系统侦错（凶）般陷入苦战，但此后所有阻碍将烟消云散，迎来惊人的大跃进。'] },
  { fortuneJa: '恐', fortuneEn: 'System Error', fortuneTw: '恐', fortuneCn: '恐', weight: 20, btnJa: '慎重に進む', btnEn: 'Proceed with Caution', btnTw: '履步涉冰', btnCn: '履步涉冰', commentsJa: ['少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。'], commentsEn: ['A day to tread with caution. Avoid starting new things and stick to your usual routine.'], commentsTw: ['今日行事宜多加謹慎。切勿盲目開展新計畫，安守既有常規方為上策。'], commentsCn: ['今日行事宜多加谨慎。切勿盲目开展新计划，安守既有常规方为上策。'] }
];

const SPECIAL_LUCK: { [key: string]: { [key: string]: string } } = {
  '11:11': { ja: '星連大吉', en: 'Synchronicity Luck', zh_tw: '星連大吉', zh_cn: '星连大吉', commentJa: '【11:11の奇跡】時計の数字が美しく一直線に並ぶ瞬間。全てのノイズが消え去り、願いが最速で宇宙に届く大吉兆なり！', commentEn: '【11:11 Miracle】The numbers line up perfectly. All noise vanishes, and your wishes reach the universe at lightspeed!', commentTw: '【11:11的奇蹟】時鐘數字完美排成一線的神聖瞬間。萬般雜音盡除，心中所願將以最快速度傳遞至宇宙核心！', commentCn: '【11:11的奇迹】时钟数字完美排成一线的神圣瞬间。万般杂音尽除，心中所愿将以最快速度传递至宇宙核心！' }
};

const HOLIDAY_FORTUNES: { [key: string]: { [key: string]: string } } = {
  '1/1': { fortuneJa: '歳旦大吉', fortuneEn: 'New Year Milestone', fortuneTw: '歲旦大吉', fortuneCn: '岁旦大吉', commentJa: '【謹賀新年】新しいログの1行目なり。過去のキャッシュは綺麗さっぱりクリアされ、壮大なる新規セッションがここに開始された！', commentEn: '【Happy New Year】The first row of your new log. All old cache is cleared; a grand new session has initialized!', commentTw: '【恭賀新禧】新日誌的第一行。舊有快取已被悉數清除，一場無比壯麗的新連線已於此刻正式啟動！', commentCn: '【恭贺新禧】新日志的第一行。旧有缓存已被悉数清除，一场无比壮丽的新连线已于此刻正式启动！' }
};

const FORTUNE_ORDER = ['超大吉', '星連大吉', '歳旦大吉', '大吉', '吉', '中吉', '小吉', '末吉', '接続大吉', '通信吉', '再起動', '大吉持', '平', '大器晩成', '恐', 'システム大破'];
const LUCKY_COLORS_JA = ['漆黒', '朱赤', '瑠璃色', '黄金色', '白', '琥珀色'];
const LUCKY_COLORS_EN = ['Jet Black', 'Vermilion Red', 'Lapis Lazuli', 'Pure Gold', 'White', 'Amber'];
const LUCKY_COLORS_TW = ['漆黑', '朱赤', '瑠璃色', '黃臨色', '純白', '琥珀色'];
const LUCKY_COLORS_CN = ['漆黑', '朱赤', '瑠璃色', '黄金色', '纯白', '琥珀色'];

const LUCKY_ITEMS_JA = ['LANケーブル', '温かい緑茶', 'ハンカチ', '最新のガジェット'];
const LUCKY_ITEMS_EN = ['LAN Cable', 'Warm Matcha Tea', 'Pocket Square', 'Latest Gadget'];
const LUCKY_ITEMS_TW = ['網路線', '熱綠茶', '手帕', '最新智慧裝置'];
const LUCKY_ITEMS_CN = ['网线', '热绿茶', '手帕', '最新智能设备'];

const CRYPTO_SALT = 'cyber_shrine_secret_2026_v2';
const encodeData = (data: any): string => {
  const str = JSON.stringify(data);
  const hash = btoa(encodeURIComponent(str));
  return `${hash}.${btoa(CRYPTO_SALT)}`;
};
const decodeData = (cipher: string | null): any => {
  if (!cipher) return null;
  try {
    const parts = cipher.split('.');
    if (parts.length !== 2 || atob(parts[1]) !== CRYPTO_SALT) return null;
    return JSON.parse(decodeURIComponent(atob(parts[0])));
  } catch (e) { return null; }
};

export default function App() {
  const [lang, setLang] = useState<LangMode>('ja');
  const [activeTab, setActiveTab] = useState<TabMode>('omikuji');
  const [result, setResult] = useState<{ fortune: string; comment: string; color: string; item: string; currentBtn: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [visitDate, setVisitDate] = useState<string>('');
  const [history, setHistory] = useState<{ [key: string]: number }>({});
  const [lastDates, setLastDates] = useState<{ [key: string]: string }>({});
  const [visitDays, setVisitDays] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [lastFortune, setLastFortune] = useState<string>('');
  const [recentScores, setRecentScores] = useState<number[]>([]);
  const [isBurning, setIsBurning] = useState(false);

  const [wallet, setWallet] = useState<number>(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>('default');

  useEffect(() => {
    const secureState = decodeData(localStorage.getItem('shrine_master_state_secure'));
    if (secureState) {
      if (secureState.history) setHistory(secureState.history);
      if (secureState.lastDates) setLastDates(secureState.lastDates);
      if (secureState.wallet !== undefined) setWallet(secureState.wallet);
      if (secureState.ownedItems) setOwnedItems(secureState.ownedItems);
    }
    const savedScores = localStorage.getItem('shrine_scores');
    if (savedScores) setRecentScores(JSON.parse(savedScores));

    const todayStr = new Date().toDateString();
    const lastVisit = localStorage.getItem('shrine_last_visit');
    let days = parseInt(localStorage.getItem('shrine_visit_days') || '1', 10);

    if (lastVisit && lastVisit !== todayStr) {
      days += 1;
      localStorage.setItem('shrine_visit_days', days.toString());
    }
    localStorage.setItem('shrine_last_visit', todayStr);
    setVisitDays(days);
  }, []);

  const saveMasterState = (nextHistory: any, nextDates: any, nextWallet: number, nextOwned: string[]) => {
    const stateObj = { history: nextHistory, lastDates: nextDates, wallet: nextWallet, ownedItems: nextOwned };
    localStorage.setItem('shrine_master_state_secure', encodeData(stateObj));
  };

  const drawOmikuji = () => {
    setIsRolling(true); setResult(null);
    const today = new Date(); const hours = today.getHours(); const minutes = today.getMinutes();
    const month = today.getMonth() + 1; const date = today.getDate();

    let dateStr = `${today.getFullYear()}/${month}/${date}`;
    if (lang === 'ja') dateStr = `令和八年${month}月${date}日`;
    setVisitDate(dateStr);

    setTimeout(() => {
      let fortune = ''; let comment = ''; let currentBtn = '再び引く'; let historyKey = '吉';
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const holidayKey = `${month}/${date}`;

      if (SPECIAL_LUCK[timeStr]) {
        const spec = SPECIAL_LUCK[timeStr];
        fortune = spec[lang]; comment = spec.commentJa; historyKey = spec.ja;
      } else if (HOLIDAY_FORTUNES[holidayKey]) {
        const hol = HOLIDAY_FORTUNES[holidayKey];
        fortune = hol[`fortune${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any] || hol.fortuneJa;
        comment = hol[`comment${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any] || hol.commentJa;
        historyKey = hol.fortuneJa;
      } else {
        let selectedGroup = LUCK_DATA[2];
        for (let attempt = 0; attempt < 3; attempt++) {
          const totalWeight = LUCK_DATA.reduce((sum, item) => sum + item.weight, 0);
          let randomNum = Math.floor(Math.random() * totalWeight);
          for (const group of LUCK_DATA) {
            if (randomNum < group.weight) { selectedGroup = group; break; }
            randomNum -= group.weight;
          }
          if (selectedGroup.fortuneJa !== lastFortune) break;
        }

        fortune = lang === 'ja' ? selectedGroup.fortuneJa : lang === 'en' ? selectedGroup.fortuneEn : lang === 'zh_tw' ? selectedGroup.fortuneTw : selectedGroup.fortuneCn;
        currentBtn = lang === 'ja' ? selectedGroup.btnJa : lang === 'en' ? selectedGroup.btnEn : lang === 'zh_tw' ? selectedGroup.btnTw : selectedGroup.btnCn;
        historyKey = selectedGroup.fortuneJa;
        comment = lang === 'ja' ? selectedGroup.commentsJa[0] : lang === 'en' ? selectedGroup.commentsEn[0] : lang === 'zh_tw' ? selectedGroup.commentsTw[0] : selectedGroup.commentsCn[0];
      }

      const idx = Math.floor(Math.random() * 4);
      const color = lang === 'ja' ? LUCKY_COLORS_JA[idx] : lang === 'en' ? LUCKY_COLORS_EN[idx] : lang === 'zh_tw' ? LUCKY_COLORS_TW[idx] : LUCKY_COLORS_CN[idx];
      const item = lang === 'ja' ? LUCKY_ITEMS_JA[idx] : lang === 'en' ? LUCKY_ITEMS_EN[idx] : lang === 'zh_tw' ? LUCKY_ITEMS_TW[idx] : LUCKY_ITEMS_CN[idx];

      setResult({ fortune, comment, color, item, currentBtn });
      setIsRolling(false); setLastFortune(historyKey);

      // 🪙 運勢の結果によるスマートな報酬の重み付け変動ロジック
      let payout = 50; 
      if (historyKey === '超大吉') payout = 1000;
      else if (historyKey === 'システム大破') payout = -Math.floor(wallet / 2); // 所持金半減
      else if (historyKey.includes('大吉')) payout = 150 + Math.floor(Math.random() * 50); // 150〜200両
      else if (historyKey.includes('中吉') || historyKey === '吉' || historyKey.includes('通信')) payout = 80 + Math.floor(Math.random() * 20); // 80〜100両
      else if (historyKey === '再起動' || historyKey === '恐') payout = 10; // 低評価エラー枠

      const nextWallet = Math.max(0, wallet + payout);
      setWallet(nextWallet);

      const newScore = historyKey.includes('大吉') ? 5 : historyKey.includes('吉') ? 4 : 3;
      const updatedScores = [newScore, ...recentScores].slice(0, 5);
      setRecentScores(updatedScores);
      localStorage.setItem('shrine_scores', JSON.stringify(updatedScores));

      const newHistory = { ...history, [historyKey]: (history[historyKey] || 0) + 1 };
      const newDates = { ...lastDates, [historyKey]: `${month}/${date}` };
      setHistory(newHistory); setLastDates(newDates);
      saveMasterState(newHistory, newDates, nextWallet, ownedItems);
    }, 600);
  };

  const buyItem = (item: ShopItem) => {
    if (wallet < item.price || ownedItems.includes(item.id)) return;
    const nextWallet = wallet - item.price;
    const nextOwned = [...ownedItems, item.id];
    setWallet(nextWallet); setOwnedItems(nextOwned);
    saveMasterState(history, lastDates, nextWallet, nextOwned);
  };

  const handleClear = () => {
    setIsBurning(true);
    setTimeout(() => {
      localStorage.clear();
      setHistory({}); setLastDates({}); setRecentScores([]); setResult(null); setLastFortune(''); setVisitDays(1);
      setWallet(0); setOwnedItems([]); setActiveSkin('default');
      setIsBurning(false); setShowModal(false);
    }, 1800);
  };

  const getBiorhythm = () => {
    if (recentScores.length === 0) return { graph: '●', status: lang === 'ja' ? '未知の運気' : 'Unknown' };
    const symbols = recentScores.map(s => (s >= 5 ? '▲' : s === 4 ? '●' : '▼')).reverse();
    return { graph: symbols.join('━'), status: lang === 'ja' ? '運気同調中' : 'Syncing' };
  };

  const unlockedCount = FORTUNE_ORDER.filter(luck => history[luck] > 0).length;
  const completionRate = Math.round((unlockedCount / FORTUNE_ORDER.length) * 100);

  // 動的背景スタイルの適用
  const getBackgroundClass = () => {
    if (activeSkin === 'wallpaper_gold') return 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200';
    if (activeSkin === 'wallpaper_neon') return 'bg-slate-900 text-stone-100';
    if (activeSkin === 'wallpaper_dark') return 'bg-zinc-950 text-zinc-200';
    if (activeSkin === 'wallpaper_washi') return 'bg-stone-200 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] text-stone-900';
    if (activeSkin === 'wallpaper_sakura') return 'bg-gradient-to-tr from-rose-100 via-pink-50 to-rose-200';
    return 'bg-stone-100';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start pt-4 pb-24 p-4 select-none font-serif relative overflow-x-hidden transition-all duration-700 ${getBackgroundClass()} ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'text-stone-200' : 'text-stone-900'}`}>
      
      <style>{`
        @keyframes burnUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(0.3); opacity: 0; } }
        .particle { position: absolute; background: radial-gradient(#f97316, #ef4444); border-radius: 50%; pointer-events: none; }
      `}</style>

      {/* 🌐 言語バー ＆ 🪙 ウォレット */}
      <div className="max-w-md w-full flex justify-between items-center z-20 mb-4 px-1">
        <div className="flex gap-1">
          {(['ja', 'en', 'zh_tw', 'zh_cn'] as LangMode[]).map(m => (
            <button key={m} onClick={() => setLang(m)} className={`text-[10px] px-2 py-1 rounded border shadow-sm transition-all ${lang === m ? 'bg-red-800 text-stone-100 border-red-900 font-bold' : 'bg-stone-200 border-stone-400 text-stone-700 hover:bg-stone-300'}`}>
              {m === 'ja' ? '日本語' : m === 'en' ? 'English' : m === 'zh_tw' ? '繁體' : '简体'}
            </button>
          ))}
        </div>
        <div className="bg-amber-500 text-stone-950 px-2.5 py-1 rounded font-sans text-xs font-bold border border-amber-600 shadow-sm flex items-center gap-1">
          🪙 {wallet} <span className="text-[10px] font-serif">{lang === 'ja' ? '両' : 'Ryo'}</span>
        </div>
      </div>

      {/* 🎛️ 画面表示切替エリア */}
      <div className="max-w-md w-full flex-1 flex flex-col justify-center">
        
        {/* TAB 1: おみくじ */}
        {activeTab === 'omikuji' && (
          <div className={`w-full rounded-lg shadow-2xl p-6 sm:p-8 border-4 border-red-700 text-center relative transition-all animate-fade-in ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-800/90 border-cyan-500' : 'bg-stone-50'}`}>
            <div className={`absolute top-0 left-0 w-full h-3 ${activeSkin === 'wallpaper_neon' ? 'bg-cyan-500' : 'bg-red-700'}`}></div>
            {visitDate && <div className="text-[10px] text-stone-500 font-sans tracking-widest absolute top-5 right-6">{visitDate}</div>}

            <h1 className={`text-4xl font-bold my-4 tracking-widest ${activeSkin === 'wallpaper_neon' ? 'text-cyan-400' : 'text-red-800'}`}>{lang === 'ja' ? '御神籤' : lang === 'en' ? 'OMIKUJI' : '電子靈籤'}</h1>

            <div className={`min-h-[230px] flex flex-col items-center justify-center rounded border p-5 mb-5 shadow-inner ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-950 border-slate-700' : 'bg-stone-100 border-stone-300'}`}>
              {isRolling ? (
                <div className={`text-sm font-bold animate-pulse tracking-widest ${activeSkin === 'wallpaper_neon' ? 'text-cyan-400' : 'text-red-700'}`}>
                  {lang === 'ja' ? '御神意を伺っております...' : lang === 'en' ? 'Consulting the digital horizon...' : '正在祈求神明降旨...'}
                </div>
              ) : result ? (
                <div className="w-full text-sm animate-fade-in">
                  <div className={`text-3xl font-black mb-4 tracking-widest border-b-2 pb-2 inline-block ${activeSkin === 'wallpaper_neon' ? 'text-cyan-400 border-cyan-500/20' : 'text-red-700 border-red-700/10'}`}>
                    {result.fortune}
                  </div>
                  <p className={`leading-relaxed text-left px-2 mb-4 font-sans text-xs sm:text-sm ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'text-slate-300' : 'text-stone-700'}`}>
                    {result.comment}
                  </p>
                  <div className={`border-t border-dashed pt-3 text-xs py-2.5 rounded flex flex-col gap-1 px-4 text-left ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-stone-300 bg-stone-50/70 text-stone-600'}`}>
                    <div><span className={`font-bold ${activeSkin === 'wallpaper_neon' ? 'text-cyan-400' : 'text-red-700'}`}>{lang === 'ja' ? '吉兆の色：' : lang === 'en' ? 'Lucky Color: ' : '幸運色：'}</span>{result.color}</div>
                    <div><span className={`font-bold ${activeSkin === 'wallpaper_neon' ? 'text-cyan-400' : 'text-red-700'}`}>{lang === 'ja' ? '吉兆の物：' : lang === 'en' ? 'Lucky Item: ' : '幸運物：'}</span>{result.item}</div>
                  </div>
                </div>
              ) : (
                <div className="text-stone-400 text-xs tracking-wider">
                  {lang === 'ja' ? '心静かに下の釦をお押しください' : lang === 'en' ? 'Quiet your mind and tap below' : '請淨化心思，點擊下方按鈕'}
                </div>
              )}
            </div>

            <button onClick={drawOmikuji} disabled={isRolling} className={`w-full py-3.5 px-6 text-base font-bold text-stone-100 rounded shadow-md transition-all active:scale-95 tracking-widest focus:outline-none ${isRolling ? 'bg-stone-400' : activeSkin === 'wallpaper_neon' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-red-800 hover:bg-red-900'}`}>
              {result ? result.currentBtn : (lang === 'ja' ? 'おみくじを引く' : lang === 'en' ? 'Draw Fortune' : '求取靈籤')}
            </button>
          </div>
        )}

        {/* TAB 2: 電脳授与所（ショップ）アイコンマークを全廃 */}
        {activeTab === 'shop' && (
          <div className={`w-full rounded-lg shadow-xl p-6 border-2 border-amber-500 animate-fade-in ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-800/90' : 'bg-stone-50'}`}>
            <h2 className="text-xl font-bold text-amber-600 border-b pb-2 mb-4 tracking-widest">
              {lang === 'ja' ? '電脳授与所' : lang === 'en' ? 'Cyber Shop' : '電腦授與所'}
            </h2>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-stone-400 tracking-wider mb-2">✦ {lang === 'ja' ? '御守・護符' : 'Sacred Amulets'}</h3>
              <div className="grid grid-cols-1 gap-2">
                {SHOP_ITEMS.filter(i => i.type === 'talisman').map(item => {
                  const isOwned = ownedItems.includes(item.id);
                  const canBuy = wallet >= item.price;
                  return (
                    <button key={item.id} onClick={() => buyItem(item)} disabled={isOwned || !canBuy} className={`p-3 rounded border text-left flex justify-between items-center transition-all ${isOwned ? 'bg-stone-200/50 text-stone-400 border-stone-300' : canBuy ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50' : 'bg-stone-100 text-stone-400 border-stone-200'}`}>
                      <div className="font-sans text-xs font-medium">{lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : item.nameTw}</div>
                      <span className="font-sans text-xs font-bold text-amber-600">{isOwned ? (lang === 'ja' ? '拝受済' : 'Owned') : `🪙 ${item.price}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-stone-400 tracking-wider mb-2">✦ {lang === 'ja' ? '背景仕様' : 'Background Skins'}</h3>
              <div className="grid grid-cols-1 gap-2">
                {SHOP_ITEMS.filter(i => i.type === 'skin').map(item => {
                  const isOwned = ownedItems.includes(item.id);
                  const canBuy = wallet >= item.price;
                  return (
                    <button key={item.id} onClick={() => buyItem(item)} disabled={isOwned || !canBuy} className={`p-3 rounded border text-left flex justify-between items-center transition-all ${isOwned ? 'bg-stone-200/50 text-stone-400 border-stone-300' : canBuy ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50' : 'bg-stone-100 text-stone-400 border-stone-200'}`}>
                      <div className="font-sans text-xs font-medium">{lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : item.nameTw}</div>
                      <span className="font-sans text-xs font-bold text-amber-600">{isOwned ? (lang === 'ja' ? '拝受済' : 'Owned') : `🪙 ${item.price}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ✨ 新設：所持（コレクション管理）タブ */}
        {activeTab === 'inventory' && (
          <div className={`w-full rounded-lg shadow-xl p-6 border-2 border-emerald-600 animate-fade-in ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-800/90' : 'bg-stone-50'}`}>
            <h2 className="text-xl font-bold text-emerald-700 border-b pb-2 mb-4 tracking-widest">
              {lang === 'ja' ? '神物所持一覧' : lang === 'en' ? 'Inventory' : '所持神物'}
            </h2>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-stone-400 tracking-wider mb-2">✦ {lang === 'ja' ? '授かった御守・護符' : 'Your Amulets'}</h3>
              <div className="space-y-1.5">
                {SHOP_ITEMS.filter(i => i.type === 'talisman').map(item => {
                  const hasIt = ownedItems.includes(item.id);
                  if (!hasIt) return null;
                  return (
                    <div key={item.id} className={`p-2.5 rounded border text-xs font-sans font-medium ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'}`}>
                      {lang === 'ja' ? item.nameJa : item.nameEn}
                    </div>
                  );
                })}
                {ownedItems.filter(id => id.startsWith('talisman_')).length === 0 && (
                  <p className="text-xs text-stone-400 italic py-2">{lang === 'ja' ? '所持している御守はありません' : 'No amulets held'}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-stone-400 tracking-wider mb-2">✦ {lang === 'ja' ? '背景仕様の変更' : 'Equipped Background Skin'}</h3>
              <div className="grid grid-cols-1 gap-1.5">
                <button onClick={() => setActiveSkin('default')} className={`p-2.5 rounded border text-left text-xs font-sans ${activeSkin === 'default' ? 'border-emerald-600 bg-emerald-50/20 font-bold text-emerald-800' : 'bg-white border-stone-200'}`}>
                  {lang === 'ja' ? '初期仕様（デフォルト）' : 'Default Skin'} {activeSkin === 'default' && '✓'}
                </button>
                {SHOP_ITEMS.filter(i => i.type === 'skin').map(item => {
                  const hasIt = ownedItems.includes(item.id);
                  const isActive = activeSkin === item.id;
                  if (!hasIt) return null;
                  return (
                    <button key={item.id} onClick={() => setActiveSkin(item.id)} className={`p-2.5 rounded border text-left text-xs font-sans ${isActive ? 'border-emerald-600 bg-emerald-50/20 font-bold text-emerald-800' : 'bg-white border-stone-200 hover:bg-stone-50'}`}>
                      {lang === 'ja' ? item.nameJa : item.nameEn} {isActive && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 御朱印帳（履歴） */}
        {activeTab === 'goshuin' && (
          <div className={`w-full rounded-lg shadow-xl p-6 border-2 border-stone-300 animate-fade-in ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-800/90' : 'bg-stone-50'}`}>
            <div className="mb-4 pb-2 border-b border-stone-200 flex justify-between items-end">
              <h2 className="text-xl font-bold tracking-widest">{lang === 'ja' ? '仮想御朱印帳' : 'Goshuin Book'}</h2>
              <span className="font-sans text-[11px] text-stone-400">
                {lang === 'ja' ? `成就：${completionRate}% / 参拝：${visitDays}日` : `Progress: ${completionRate}% / ${visitDays} Days`}
              </span>
            </div>

            <div className="mb-4 p-3 bg-stone-100/60 rounded border border-stone-200/50 text-left">
              <div className="text-[10px] font-bold text-stone-400 tracking-wider mb-1">📈 {lang === 'ja' ? '最近の運気の流れ' : 'Fortune Wave'}</div>
              <div className="text-sm font-sans tracking-widest text-center py-1">{getBiorhythm().graph}</div>
            </div>

            {Object.keys(history).length === 0 ? (
              <p className="text-xs text-stone-400 italic text-center py-6">{lang === 'ja' ? '履歴なし' : 'No records found'}</p>
            ) : (
              <div className="relative">
                {isBurning && Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="particle" style={{ width: '6px', height: '6px', left: `${Math.random() * 100}%`, top: `${Math.random() * 50 + 20}%`, animation: `burnUp 1s ease-in-out forwards`, animationDelay: `${Math.random() * 0.3}s` }} />
                ))}

                <div className={`flex flex-wrap justify-center gap-1.5 mb-6 transition-opacity duration-500 ${isBurning ? 'opacity-10' : ''}`}>
                  {FORTUNE_ORDER.map(luckKey => {
                    const count = history[luckKey];
                    if (!count) return null;
                    return (
                      <span key={luckKey} className={`border rounded px-2.5 py-1 shadow-sm font-sans text-xs ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-900 text-cyan-400 border-cyan-500/30' : 'bg-red-50/60 text-red-800 border-red-200/60'}`}>
                        <span className="font-serif font-bold">{luckKey}</span> : {count}回
                      </span>
                    );
                  })}
                </div>

                <button onClick={() => setShowModal(true)} disabled={isBurning} className="text-[10px] text-stone-400 hover:text-red-700 underline block mx-auto font-sans focus:outline-none">
                  {lang === 'ja' ? '御神籤をお焚き上げ（データリセット）する' : 'Reset All Sacred Data'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 📱 底面マルチタブバー（全4種へアップデート） */}
      <div className={`fixed bottom-0 left-0 right-0 border-t z-30 shadow-lg flex justify-around p-2 ${activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-stone-200'}`}>
        <button onClick={() => setActiveTab('omikuji')} className={`flex flex-col items-center flex-1 py-1 font-sans text-[11px] transition-all ${activeTab === 'omikuji' ? 'text-red-700 font-bold scale-105' : 'text-stone-400'}`}>
          <span className="text-lg">⛩️</span>
          <span>{lang === 'ja' ? '御神籤' : 'Omikuji'}</span>
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center flex-1 py-1 font-sans text-[11px] transition-all ${activeTab === 'shop' ? 'text-amber-600 font-bold scale-105' : 'text-stone-400'}`}>
          <span className="text-lg">🪙</span>
          <span>{lang === 'ja' ? '授与所' : 'Shop'}</span>
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center flex-1 py-1 font-sans text-[11px] transition-all ${activeTab === 'inventory' ? 'text-emerald-600 font-bold scale-105' : 'text-stone-400'}`}>
          <span className="text-lg">🎒</span>
          <span>{lang === 'ja' ? '所持' : 'Inventory'}</span>
        </button>
        <button onClick={() => setActiveTab('goshuin')} className={`flex flex-col items-center flex-1 py-1 font-sans text-[11px] transition-all ${activeTab === 'goshuin' ? 'text-stone-800 font-bold scale-105' : 'text-stone-400'}`}>
          <span className="text-lg">📖</span>
          <span>{lang === 'ja' ? '御朱印帳' : 'Log'}</span>
        </button>
      </div>

      {/* 🏮 お焚き上げモーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 border-2 border-red-800 max-w-xs w-full rounded p-6 shadow-2xl text-center">
            <h4 className="text-base font-bold text-red-800 mb-2">{lang === 'ja' ? '御神籤お焚き上げ' : 'Sacred Disposal'}</h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-5 font-sans">
              {lang === 'ja' ? 'これまでの参拝履歴、所持金、ならびに購入したお守りをすべて消去します。よろしいですか？' : 'This will securely clear all your logs, wallets and items. Proceed?'}
            </p>
            <div className="flex gap-3 justify-center text-xs font-sans">
              <button onClick={handleClear} disabled={isBurning} className="bg-red-800 text-stone-100 font-bold px-4 py-2 rounded hover:bg-red-900 transition-colors">
                {isBurning ? '昇華中...' : 'お焚き上げする'}
              </button>
              <button onClick={() => setShowModal(false)} disabled={isBurning} className="bg-stone-200 text-stone-700 font-bold px-4 py-2 rounded">
                取りやめる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}