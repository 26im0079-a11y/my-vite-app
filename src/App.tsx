import { useState, useEffect } from 'react';

// 🌐 4モード対応：言語設定の型
type LangMode = 'ja' | 'en' | 'zh_tw' | 'zh_cn';

// 運勢データ（全15種類 ＋ 4言語対応）
const LUCK_DATA = [
  { fortuneJa: '大吉', fortuneEn: 'Great Good Luck', fortuneTw: '大吉', fortuneCn: '大吉', weight: 5, btnJa: '福を重ねる', btnEn: 'Multiply Blessings', btnTw: '重溫福氣', btnCn: '重温福气', commentsJa: ['運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。'], commentsEn: ['Your luck is at its peak; it is the perfect time for anything. Gratitude brings more blessings.'], commentsTw: ['運勢大吉大利，做任何事都是大好時機。切記常懷感恩之心，福報自會加倍而至。'], commentsCn: ['运势大吉大利，做任何事都是大好时机。切记常怀感恩之心，福报自会加倍而至。'] },
  { fortuneJa: '吉', fortuneEn: 'Good Luck', fortuneTw: '吉', fortuneCn: '吉', weight: 15, btnJa: '吉を広げる', btnEn: 'Expand Good Fortune', btnTw: '展延吉兆', btnCn: '展延吉兆', commentsJa: ['誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。'], commentsEn: ['Act with a sincere heart, and your path will open naturally. Wait patiently without rushing.'], commentsTw: ['若以誠懇之心待人處事，前路自會豁然開朗。切勿焦躁，靜待時機。'], commentsCn: ['若以诚恳之心待人处事，前路自会豁然开朗。切勿焦躁，静待时机。'] },
  { fortuneJa: '中吉', fortuneEn: 'Middle Luck', fortuneTw: '中吉', fortuneCn: '中吉', weight: 12, btnJa: '縁を結ぶ', btnEn: 'Nurture Harmony', btnTw: '廣結善緣', btnCn: '广结善缘', commentsJa: ['平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。'], commentsEn: ['Signs of peaceful happiness. Value harmony and show kindness to those around you.'], commentsTw: ['此乃獲得平穩幸福之兆。當注重身心調和，多加關懷身邊之人。'], commentsCn: ['此乃获得平稳幸福之兆。当注重身心调和，多加关怀身边之人。'] },
  { fortuneJa: '小吉', fortuneEn: 'Small Luck', fortuneTw: '小吉', fortuneCn: '小吉', weight: 10, btnJa: '歩みを進める', btnEn: 'Step Forward', btnTw: '漫步向前', btnCn: '漫步向前', commentsJa: ['小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。'], commentsEn: ['Small joys accumulate today. Stay alert and tread carefully to avoid minor mistakes.'], commentsTw: ['小驚喜接連不斷的一天。但切記不可掉以輕心，凡事穩紮穩打為上。'], commentsCn: ['小惊喜接连不断的一天。但切记不可掉以轻心，凡事稳扎稳打为上。'] },
  { fortuneJa: '末吉', fortuneEn: 'Future Luck', fortuneTw: '末吉', fortuneCn: '末吉', weight: 8, btnJa: '時を待つ', btnEn: 'Await the Hour', btnTw: '靜候時機', btnCn: '静候时机', commentsJa: ['今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。'], commentsEn: ['Now is the time to build your strength. Stay calm, drink warm tea, and rest well.'], commentsTw: ['當下為蓄精儲銳之時。宜靜心沉著，品一盞溫茶，好好休養生息。'], commentsCn: ['当下为蓄精储锐之时。宜静心沉著，品一盏温茶，好好休养生息。'] },
  { fortuneJa: '接続大吉', fortuneEn: 'Max Connection Luck', fortuneTw: '連線大吉', fortuneCn: '连线大吉', weight: 6, btnJa: '帯域を広げる', btnEn: 'Maximize Bandwidth', btnTw: '拓寬頻寬', btnCn: '拓宽带宽', commentsJa: ['通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。'], commentsEn: ['Network speed is soaring; videos load instantly. All connections and relationships thrive.'], commentsTw: ['網路速度大幅提升，影片載入僅在瞬間。今日所連結之一切緣分皆順暢無阻。'], commentsCn: ['网络速度大幅提升，视频加载仅在瞬间。今日所连结之一切缘分皆顺畅无阻。'] },
  { fortuneJa: '通信吉', fortuneEn: 'Stable Connection Luck', fortuneTw: '通訊吉', fortuneCn: '通讯吉', weight: 15, btnJa: '同期を保つ', btnEn: 'Stay Synchronized', btnTw: '保持同步', btnCn: '保持同步', commentsJa: ['電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。'], commentsEn: ['Excellent signal strength. An unexpected, heartwarming message may pop up on your screen.'], commentsTw: ['訊號通暢無比。近期似乎會有久未聯絡的舊友，突然傳來令人欣喜的訊息。'], commentsCn: ['信号通畅无比。近期似乎会有久未联络的旧友，突然传来令人讯息。'] },
  { fortuneJa: '再起動', fortuneEn: 'System Reboot', fortuneTw: '系統重啟', fortuneCn: '系统重启', weight: 7, btnJa: '新たに紡ぐ', btnEn: 'Reboot Anew', btnTw: '重新啟航', btnCn: '重新启航', commentsJa: ['頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。'], commentsEn: ['If your mind feels heavy, take a long sleep. Refresh your body and soul to reboot your luck.'], commentsTw: ['若感到思緒沉重，切勿硬撐，早些入眠為妙。身心徹底重整後，運勢將大幅好轉。'], commentsCn: ['若感到思绪沉重，切勿硬撑，早些入眠为妙。身心彻底重整后，运势将大幅好转。'] },
  { fortuneJa: '大吉持', fortuneEn: 'Loading Great Luck', fortuneTw: '大吉載入中', fortuneCn: '大吉载入中', weight: 5, btnJa: '読込を待つ', btnEn: 'Complete Loading', btnTw: '靜待載入', btnCn: '静待载入', commentsJa: ['今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。'], commentsEn: ['Current luck is average, but it is loading a massive blessing. A late-bloomer sign.'], commentsTw: ['當前運勢雖看似平凡，但此乃大器晚成之兆，往後將迎來令人驚嘆的巨大福運。'], commentsCn: ['当前运势虽看似平凡，但此乃大器晚成之兆，往后将迎来令人惊叹的巨大福运。'] },
  { fortuneJa: '平', fortuneEn: 'Status Quo', fortuneTw: '平', fortuneCn: '平', weight: 5, btnJa: '平穏を保つ', btnEn: 'Maintain Balance', btnTw: '守持中庸', btnCn: '守持中庸', commentsJa: ['良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。'], commentsEn: ['Neither good nor bad, just a peaceful day. Appreciate the comfort of an ordinary day.'], commentsTw: ['無好亦無壞，波瀾不驚。當細細品味這份平凡安穩帶來的難得福氣。'], commentsCn: ['无好亦无坏，波澜不惊。当细细品味这份平凡安稳带来的难得福气。'] },
  { fortuneJa: '大器晩成', fortuneEn: 'Late Bloomer', fortuneTw: '大器晚成', fortuneCn: '大器晚成', weight: 1, btnJa: '牙を研ぐ', btnEn: 'Sharpen Your Mind', btnTw: '磨礪心志', btnCn: '磨砺心志', commentsJa: ['今はシステムデバッグ中（凶）の如く苦戦するも、これより先、全てのバグは綺麗に解消され、驚くべき大躍進を遂げる運気なり。'], commentsEn: ['Though you struggle now like a system under debugging, all errors will soon clear away, leading to a massive leap forward.'], commentsTw: ['當前雖如系統偵錯（凶）般陷入苦戰，但此後所有阻礙將煙消雲散，迎來驚人的大躍進。'], commentsCn: ['当前虽如系统侦错（凶）般陷入苦战，但此后所有阻碍将烟消云散，迎来惊人的大跃进。'] },
  { fortuneJa: '恐', fortuneEn: 'System Error', fortuneTw: '恐', fortuneCn: '恐', weight: 2, btnJa: '慎重に進む', btnEn: 'Proceed with Caution', btnTw: '履步涉冰', btnCn: '履步涉冰', commentsJa: ['少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。'], commentsEn: ['A day to tread with caution. Avoid starting new things and stick to your usual routine.'], commentsTw: ['今日行事宜多加謹慎。切勿盲目開展新計畫，安守既有常規方為上策。'], commentsCn: ['今日行事宜多加谨慎。切勿盲目开展新计划，安守既有常规方为上策。'] }
];

const SPECIAL_LUCK: { [key: string]: { [key: string]: string } } = {
  '11:11': { ja: '星連大吉', en: 'Synchronicity Luck', zh_tw: '星連大吉', zh_cn: '星连大吉', commentJa: '【11:11の奇跡】時計の数字が美しく一直線に並ぶ瞬間。全てのノイズが消え去り、願いが最速で宇宙に届く大吉兆なり！', commentEn: '【11:11 Miracle】The numbers line up perfectly. All noise vanishes, and your wishes reach the universe at lightspeed!', commentTw: '【11:11的奇蹟】時鐘數字完美排成一線的神聖瞬間。萬般雜音盡除，心中所願將以最快速度傳遞至宇宙核心！', commentCn: '【11:11的奇迹】时钟数字完美排成一线的神圣瞬间。万般杂音尽除，心中所愿将以最快速度传递至宇宙核心！' }
};

// リアルカレンダー連動：年中行事お告げデータ
const HOLIDAY_FORTUNES: { [key: string]: { [key: string]: string } } = {
  '1/1': { fortuneJa: '歳旦大吉', fortuneEn: 'New Year Milestone', fortuneTw: '歲旦大吉', fortuneCn: '岁旦大吉', commentJa: '【謹賀新年】新しいログの1行目なり。過去のキャッシュは綺麗さっぱりクリアされ、壮大なる新規セッションがここに開始された！', commentEn: '【Happy New Year】The first row of your new log. All old cache is cleared; a grand new session has initialized!', commentTw: '【恭賀新禧】新日誌的第一行。舊有快取已被悉數清除，一場無比壯麗的新連線已於此刻正式啟動！', commentCn: '【恭贺新禧】新日志的第一行。旧有缓存已被悉数清除，一场无比壮丽的新连线已于此刻正式启动！' },
  '2/14': { fortuneJa: '良縁良縁', fortuneEn: 'Chocolate Overflow', fortuneTw: '良緣結縛', fortuneCn: '良缘结缚', commentJa: '【聖バレンタイン】甘きカカオの香りがパケットを満たす日。義理や本命の判定ロジックに迷うなかれ、感謝の気持ちをストレートに送信せよ。', commentEn: '【Valentine\'s Day】Sweet cacao flavors fill the packets. Don\'t overthink the obligation vs. love logic; just send your gratitude.', commentTw: '【西洋情人節】甜蜜的可可香氣充溢著封包。不必糾結於人情或真心的判斷邏輯，將感謝之情直接發送便得吉兆。', commentCn: '【西洋情人节】甜蜜的可可香气充溢着封包。不必纠结于人情或真心的判断逻辑，将感谢之情直接发送便得吉兆。' },
  '4/1': { fortuneJa: '虚妄大吉', fortuneEn: 'April Fool OK', fortuneTw: '虛妄大吉', fortuneCn: '虚妄大吉', commentJa: '【万愚節】嘘偽りのパケットが飛び交う日なれど、このおみくじの「大吉」だけは偽りなし。バグのような嘘を笑い飛ばして進め！', commentEn: '【April Fool\'s】Fake packets fly around today, but this "Great Luck" is 100% valid. Laugh off the buggy jokes and move forward!', commentTw: '【愚人節】今日雖有眾多虛妄封包交錯，但此籤所現之「大吉」絕無虛假。將那些如程式錯誤般的謊言付之一笑吧！', commentCn: '【愚人节】今日虽有众多虚妄封包交错，但此签所现之“大吉”绝无虚假。将那些如程序错误般的谎言付之一笑吧！' },
  '10/31': { fortuneJa: '南瓜大吉', fortuneEn: 'Pumpkin Daemon', fortuneTw: '南瓜萬聖', fortuneCn: '南瓜万圣', commentJa: '【ハロウィン】常夜灯が怪しく揺れ、仮装のデーモン（悪霊）が彷彿とする夜。お菓子（Cookie）を適切に受け入れれば、災いは回避されん。', commentEn: '【Halloween】The lanterns flicker as dressed-up daemons awaken. Accept the treats (Cookies) properly to avoid any malicious scripts.', commentTw: '【萬聖節】常夜燈詭譎閃爍，喬裝的守護進程（惡靈）徘徊之夜。只要適當接受餅乾（Cookies），便可化解一切災厄。', commentCn: '【万圣节】常夜灯诡谲闪烁，乔装的守护进程（恶灵）徘徊之夜。只要适当接受饼干（Cookies），便可化解一切灾厄。' },
  '12/25': { fortuneJa: '聖夜大吉', fortuneEn: 'SSL Holy Night', fortuneTw: '聖夜大吉', fortuneCn: '圣夜大吉', commentJa: '【降誕祭】赤き衣の老人が高速配送プロトコルで福を届ける日。聖なる夜の暗号化（SSL）は強固なれば、あなたのプライバシーと幸福は守られたり。', commentEn: '【Christmas】The red-suited elder delivers blessings via high-speed routing. Holy night encryption is solid; your happiness is fully secured.', commentTw: '【聖誕節】紅衣老人正透過高速傳輸協定配送福氣。今夜的安全加密（SSL）極其堅固，您的隱私與幸福皆受神聖守護。', commentCn: '【圣诞节】红衣老人正透过高速传输协定配送福气。今夜的安全加密（SSL）极其坚固，您的隐私与幸福皆受神圣守护。' }
};

const FORTUNE_ORDER = ['星連大吉', '歳旦大吉', '良縁良縁', '虚妄大吉', '南瓜大吉', '聖夜大吉', '大吉', '吉', '中吉', '小吉', '末吉', '接続大吉', '通信吉', '再起動', '大吉持', '平', '大器晩成', '恐'];

// 🎨 吉兆の色・物
const LUCKY_COLORS_JA = ['漆黒', '朱赤', '瑠璃色', '黄金色', '白', '琥珀色'];
const LUCKY_COLORS_EN = ['Jet Black', 'Vermilion Red', 'Lapis Lazuli', 'Pure Gold', 'White', 'Amber'];
const LUCKY_COLORS_TW = ['漆黑', '朱赤', '瑠璃色', '黃金色', '純白', '琥珀色'];
const LUCKY_COLORS_CN = ['漆黑', '朱赤', '瑠璃色', '黄金色', '纯白', '琥珀色'];

const LUCKY_ITEMS_JA = ['LANケーブル', '温かい緑茶', 'ハンカチ', '最新のガジェット'];
const LUCKY_ITEMS_EN = ['LAN Cable', 'Warm Matcha Tea', 'Pocket Square', 'Latest Gadget'];
const LUCKY_ITEMS_TW = ['網路線', '熱綠茶', '手帕', '最新智慧裝置'];
const LUCKY_ITEMS_CN = ['网线', '热绿茶', '手帕', '最新智能设备'];

// 🌍 時候の挨拶（海外の季節感への最適化対応）
const MONTHLY_GREETINGS: { [key: number]: { ja: string; en: string; zh_tw: string; zh_cn: string } } = {
  1: { ja: '新春の清らかな光がシステムを照らす如く、', en: 'As the pure crystalline light of the New Year illuminates the system, ', zh_tw: '猶如新春清朗之光照耀系統架構，', zh_cn: '犹如新春清朗之光照耀系统架构，' },
  2: { ja: '厳しい寒さの中で梅が静かに芽吹く如く、', en: 'As red plum blossoms quietly bud amidst the severe winter chill, ', zh_tw: '正似寒梅於嚴冬之中靜靜吐蕊，', zh_cn: '正似寒梅于严冬之中静静吐蕊，' },
  3: { ja: '春の柔らかな風が滞るデータを融かす如く、', en: 'As the gentle southern breeze thaws all frozen data flows, ', zh_tw: '宛如和煦春風融化滯留之數據流，', zh_cn: '宛如和煦春风融化滞留之数据流，' },
  4: { ja: '爛漫たる桜の如く新たな回線が開通する時、', en: 'As new connection lines open like cherry blossoms in full bloom, ', zh_tw: '恰逢櫻花爛漫、全新網路節點開通之時，', zh_cn: '恰逢樱花烂漫、全新网络节点开通之时，' },
  5: { ja: '新緑の葉がバグのない美しさを湛える如く、', en: 'As fresh spring leaves display a vibrant beauty free of any bugs, ', zh_tw: '如新綠翠葉展現毫無瑕疵的完美結構，', zh_cn: '如新绿翠叶展现毫无瑕疵的完美结构，' },
  6: { ja: '梅雨の合間の澄み渡る電波の如く、', en: 'Under the serene June sky with a fresh early summer breeze, ', zh_tw: '宛如梅雨驟停、初夏放晴時那澄澈的電波，', zh_cn: '宛如梅雨骤停、初夏放晴时那澄澈的电波，' },
  7: { ja: '夏の夜空を彩る大輪の花火が如く、', en: 'Like majestic fireworks beautifully lighting up the midsummer night, ', zh_tw: '若仲夏夜空中絢麗綻放的巨大煙火，', zh_cn: '若仲夏夜空中绚丽绽放的巨大烟火，' },
  8: { ja: '清涼なる滝の水が熱きサーバーを冷ます如く、', en: 'As cool waterfall streams soothe and refresh a heated server array, ', zh_tw: '猶如清涼瀑布沖刷、冷卻過熱的伺服器，', zh_cn: '犹如清凉瀑布冲刷、冷却过热的服务器，' },
  9: { ja: '中秋の名月が夜道を優しく導く如く、', en: 'As the harvest moon gently guides your packets through the dark, ', zh_tw: '正似中秋明月溫柔照亮漫漫夜路，', zh_cn: '正似中秋明月温柔照亮漫漫夜路，' },
  10: { ja: '実りの秋が豊かなリソースをもたらす如く、', en: 'As the golden autumn harvest brings an abundance of rich resources, ', zh_tw: '如豐收之秋為系統注入充沛的資源庫，', zh_cn: '如丰收之秋为系统注入充沛的资源库，' },
  11: { ja: '鮮やかな紅葉が画面を美しく彩る如く、', en: 'As brilliant crimson maple leaves beautifully color the display, ', zh_tw: '宛若層林盡染的紅葉將螢幕妝點得無比絢麗，', zh_cn: '宛若层林尽染的红叶将屏幕妆点得无比绚丽，' },
  12: { ja: '寒風に耐え忍びてサーバーが強固に稼働する如く、', en: 'As core systems stand resilient and strong against the biting winter wind, ', zh_tw: '正如伺服器頂著凜冽寒風依然堅固運作，', zh_cn: '正如服务器顶着凛冽寒风依然坚固运作，' }
};

// 🔒 安全な難読化セキュリティロジック（チート対策）
const CRYPTO_SALT = 'cyber_shrine_secret_2026';
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
  } catch (e) {
    return null;
  }
};

export default function App() {
  const [lang, setLang] = useState<LangMode>('ja');
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

  useEffect(() => {
    const savedHistory = decodeData(localStorage.getItem('shrine_history_secure'));
    const savedDates = decodeData(localStorage.getItem('shrine_dates_secure'));
    const savedScores = localStorage.getItem('shrine_scores');
    if (savedHistory) setHistory(savedHistory);
    if (savedDates) setLastDates(savedDates);
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

  const getFortuneScore = (fort: string): number => {
    if (fort.includes('大吉')) return 5;
    if (fort.includes('吉')) return 4;
    if (fort.includes('中吉') || fort.includes('平')) return 3;
    if (fort.includes('小吉') || fort.includes('末吉')) return 2;
    return 1;
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
        fortune = spec[lang]; comment = spec[`comment${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any] || spec.commentJa;
        historyKey = spec.ja;
      } 
      else if (HOLIDAY_FORTUNES[holidayKey]) {
        const hol = HOLIDAY_FORTUNES[holidayKey];
        fortune = hol[`fortune${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any] || hol.fortuneJa;
        comment = hol[`comment${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any] || hol.commentJa;
        historyKey = hol.fortuneJa;
      }
      else {
        let selectedGroup = LUCK_DATA[0];
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

        const greeting = MONTHLY_GREETINGS[month] ? MONTHLY_GREETINGS[month][lang] : '';
        const baseComment = lang === 'ja' ? selectedGroup.commentsJa[0] : lang === 'en' ? selectedGroup.commentsEn[0] : lang === 'zh_tw' ? selectedGroup.commentsTw[0] : selectedGroup.commentsCn[0];
        comment = greeting + baseComment;
      }

      const idx = Math.floor(Math.random() * 4);
      const color = lang === 'ja' ? LUCKY_COLORS_JA[idx] : lang === 'en' ? LUCKY_COLORS_EN[idx] : lang === 'zh_tw' ? LUCKY_COLORS_TW[idx] : LUCKY_COLORS_CN[idx];
      const item = lang === 'ja' ? LUCKY_ITEMS_JA[idx] : lang === 'en' ? LUCKY_ITEMS_EN[idx] : lang === 'zh_tw' ? LUCKY_ITEMS_TW[idx] : LUCKY_ITEMS_CN[idx];

      setResult({ fortune, comment, color, item, currentBtn });
      setIsRolling(false); setLastFortune(historyKey);

      const newScore = getFortuneScore(historyKey);
      const updatedScores = [newScore, ...recentScores].slice(0, 5);
      setRecentScores(updatedScores);
      localStorage.setItem('shrine_scores', JSON.stringify(updatedScores));

      const newHistory = { ...history, [historyKey]: (history[historyKey] || 0) + 1 };
      const newDates = { ...lastDates, [historyKey]: `${month}/${date}` };
      setHistory(newHistory); setLastDates(newDates);
      localStorage.setItem('shrine_history_secure', encodeData(newHistory));
      localStorage.setItem('shrine_dates_secure', encodeData(newDates));
    }, 600);
  };

  const handleClear = () => {
    setIsBurning(true);
    setTimeout(() => {
      localStorage.clear();
      setHistory({}); setLastDates({}); setRecentScores([]); setResult(null); setLastFortune(''); setVisitDays(1);
      setIsBurning(false); setShowModal(false);
    }, 1800);
  };

  const getBiorhythm = () => {
    if (recentScores.length === 0) return { graph: '●', status: lang === 'ja' ? '未知の運気' : 'Unknown' };
    const symbols = recentScores.map(s => (s >= 4 ? '▲' : s === 3 ? '●' : '▼')).reverse();
    const graphStr = symbols.join('━');
    const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    let status = lang === 'ja' ? '平穏無事' : 'Stable';
    if (avg >= 4.2) status = lang === 'ja' ? '昇龍（大上昇気流）' : 'Dragon Ascending';
    else if (avg >= 3.5) status = lang === 'ja' ? '上昇気流' : 'Rising Wave';
    else if (avg <= 2.0) status = lang === 'ja' ? '充電期（英気を養え）' : 'Charging Period';
    return { graph: graphStr, status };
  };

  const unlockedCount = FORTUNE_ORDER.filter(luck => history[luck] > 0).length;
  const completionRate = Math.round((unlockedCount / FORTUNE_ORDER.length) * 100);
  const bio = getBiorhythm();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 text-stone-900 select-none font-serif relative overflow-x-hidden">
      
      <style>{`
        @keyframes burnUp {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-250px) scale(0.3) rotate(360deg); opacity: 0; filter: blur(1px); }
        }
        .particle { position: absolute; background: radial-gradient(#f97316, #ef4444); border-radius: 50%; pointer-events: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 10px; }
      `}</style>

      {/* 🌐 4カ国語切り替えバー */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-1 z-20">
        {(['ja', 'en', 'zh_tw', 'zh_cn'] as LangMode[]).map(m => (
          <button key={m} onClick={() => setLang(m)} className={`text-[10px] px-2 py-1 rounded border shadow-sm transition-all focus:ring-1 focus:ring-red-700 ${lang === m ? 'bg-red-800 text-stone-100 border-red-900 font-bold' : 'bg-stone-200 border-stone-400 text-stone-700 hover:bg-stone-300'}`}>
            {m === 'ja' ? '日本語' : m === 'en' ? 'English' : m === 'zh_tw' ? '繁體中文' : '简体中文'}
          </button>
        ))}
      </div>

      {/* ⛩️ おみくじ本体 */}
      <div className="max-w-md w-full bg-stone-50 rounded-lg shadow-2xl p-8 border-4 border-red-700 text-center relative mt-12">
        <div className="absolute top-0 left-0 w-full h-3 bg-red-700"></div>
        {visitDate && <div className="text-[10px] text-stone-500 font-sans tracking-widest absolute top-5 right-6">{visitDate}</div>}

        <h1 className="text-4xl font-bold text-red-800 my-4 tracking-widest">{lang === 'ja' ? '御神籤' : lang === 'en' ? 'OMIKUJI' : '電子靈籤'}</h1>

        <div className="min-h-[230px] flex flex-col items-center justify-center bg-stone-100 rounded border border-stone-300 p-5 mb-5 shadow-inner">
          {isRolling ? (
            <div className="text-sm font-bold text-red-700 animate-pulse tracking-widest">
              {lang === 'ja' ? '御神意を伺っております...' : lang === 'en' ? 'Consulting the digital horizon...' : '正在祈求神明降旨...'}
            </div>
          ) : result ? (
            <div className="w-full text-sm animate-fade-in">
              <div className="text-3xl font-black text-red-700 mb-4 tracking-widest border-b-2 border-red-700/10 pb-2 inline-block">
                {result.fortune}
              </div>
              <p className="text-stone-700 leading-relaxed text-left px-2 mb-4 font-sans text-xs sm:text-sm">
                {result.comment}
              </p>
              <div className="border-t border-dashed border-stone-300 pt-3 text-xs text-stone-600 bg-stone-50/70 py-2.5 rounded flex flex-col gap-1 px-4 text-left">
                <div><span className="text-red-700 font-bold">{lang === 'ja' ? '吉兆の色：' : lang === 'en' ? 'Lucky Color: ' : '幸運色：'}</span>{result.color}</div>
                <div><span className="text-red-700 font-bold">{lang === 'ja' ? '吉兆の物：' : lang === 'en' ? 'Lucky Item: ' : '幸運物：'}</span>{result.item}</div>
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-xs tracking-wider">
              {lang === 'ja' ? '心静かに下の釦をお押しください' : lang === 'en' ? 'Quiet your mind and tap below' : '請淨化心思，點擊下方按鈕'}
            </div>
          )}
        </div>

        <button onClick={drawOmikuji} disabled={isRolling} className={`w-full py-3.5 px-6 text-base font-bold text-stone-100 rounded shadow-md transition-all active:scale-95 tracking-widest focus:outline-none focus:ring-2 focus:ring-red-700 ${isRolling ? 'bg-stone-400' : 'bg-red-800 hover:bg-red-900'}`}>
          {result ? result.currentBtn : (lang === 'ja' ? 'おみくじを引く' : lang === 'en' ? 'Draw Fortune' : '求取靈籤')}
        </button>
      </div>

      {/* 📊 バイオリズム ＆ 御朱印帳ログエリア */}
      <div className="max-w-md w-full mt-4 bg-stone-50 rounded border border-stone-300 p-4 shadow-md relative">
        <div className="mb-3.5 pb-2.5 border-b border-stone-200 text-left">
          <h4 className="text-[11px] font-bold text-stone-500 tracking-wider mb-1 flex justify-between">
            <span>{lang === 'ja' ? '📈 運気バイオリズム' : lang === 'en' ? '📈 Fortune Biorhythm' : '📈 運勢波動圖'}</span>
            <span className="text-red-700 text-[10px] font-sans font-bold">{bio.status}</span>
          </h4>
          <div className="text-xs font-sans tracking-widest bg-stone-100 py-1.5 px-3 rounded text-center text-stone-600 border border-stone-200/50">
            {bio.graph}
          </div>
        </div>

        <h3 className="text-[11px] font-bold text-stone-500 tracking-wider border-b border-stone-200 pb-1.5 mb-2 flex justify-between">
          <span>{lang === 'ja' ? '仮想御朱印帳' : lang === 'en' ? 'Sacred Goshuin Log' : '虛擬御朱印帳'}</span>
          <span className="font-sans text-[10px] font-normal text-stone-400">
            {lang === 'ja' ? `成就：${completionRate}% / 参拝：${visitDays}日` : `Progress: ${completionRate}% / ${visitDays} Days`}
          </span>
        </h3>

        {Object.keys(history).length === 0 ? (
          <p className="text-[10px] text-stone-400 italic py-1 text-center">{lang === 'ja' ? '履歴なし' : 'No entries yet'}</p>
        ) : (
          <div className="relative">
            {isBurning && Array.from({ length: 45 }).map((_, i) => (
              <div key={i} className="particle" style={{
                width: `${Math.random() * 8 + 4}px`, height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 40 + 20}%`,
                animation: `burnUp ${Math.random() * 0.8 + 0.8}s ease-in-out forwards`,
                animationDelay: `${Math.random() * 0.4}s`
              }} />
            ))}

            {/* 🔢 拝受回数を通常の「数字」で分かりやすく表示 */}
            <div className={`flex flex-wrap justify-center gap-1.5 text-[10px] mb-2.5 transition-opacity duration-500 ${isBurning ? 'opacity-20 pointer-events-none' : ''}`}>
              {FORTUNE_ORDER.map(luckKey => {
                const count = history[luckKey]; const lastDate = lastDates[luckKey];
                if (!count) return null;
                return (
                  <span key={luckKey} title={`Last: ${lastDate}`} className="bg-red-50/60 text-red-800 border border-red-200/60 rounded px-2 py-0.5 shadow-sm font-sans text-[10px] font-medium">
                    <span className="font-serif font-bold">{luckKey}</span> : {count}{lang === 'ja' ? '回' : ''}
                  </span>
                );
              })}
            </div>

            <button onClick={() => setShowModal(true)} disabled={isBurning} className="text-[9px] text-stone-400 hover:text-red-700 underline block mx-auto focus:outline-none focus:ring-1 focus:ring-red-700 px-1 font-sans">
              {lang === 'ja' ? '御神籤をお焚き上げする' : lang === 'en' ? 'Perform Sacred Disposal' : '將靈籤送返化寶'}
            </button>
          </div>
        )}
      </div>

      {/* ⛩️ お焚き上げ確認モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 border-2 border-red-800 max-w-xs w-full rounded p-6 shadow-2xl text-center animate-fade-in">
            <h4 className="text-base font-bold text-red-800 mb-2">{lang === 'ja' ? '御神籤お焚き上げ' : lang === 'en' ? 'Sacred Disposal' : '靈籤化寶'}</h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-5 font-sans">
              {lang === 'ja' ? 'これまでの参拝履歴、ならびに仮想御朱印をすべてお焚き上げ（消去）いたします。よろしいですか？' : lang === 'en' ? 'This will securely clear and incinerate your fortune logs. Proceed?' : '這將會把您所有的參拜紀錄與御朱印付之一炬（重設），確定執行嗎？'}
            </p>
            <div className="flex gap-3 justify-center text-xs font-sans">
              <button onClick={handleClear} disabled={isBurning} className="bg-red-800 text-stone-100 font-bold px-4 py-2 rounded hover:bg-red-900 focus:ring-2 focus:ring-red-700 transition-colors">
                {isBurning ? (lang === 'ja' ? '昇華中...' : 'Burning...') : (lang === 'ja' ? 'お焚き上げする' : lang === 'en' ? 'Burn Records' : '確認化寶')}
              </button>
              <button onClick={() => setShowModal(false)} disabled={isBurning} className="bg-stone-200 text-stone-700 font-bold px-4 py-2 rounded hover:bg-stone-300">
                {lang === 'ja' ? '取りやめる' : lang === 'en' ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-6 text-[10px] text-stone-400 tracking-widest">
        謹製 仮想空間神社 / Cyber Shrine 2026
      </footer>
    </div>
  );
}