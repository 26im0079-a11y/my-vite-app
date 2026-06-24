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
  isNightOnly?: boolean; // 🌙 夜間限定フラグ
};

// ⛩️ 御守・護符ラインナップ（全55種 ＋ 背景5種 = 計60種）
const SHOP_ITEMS: ShopItem[] = [
  // --- 既存御守 (5種) ---
  { id: 'talisman_bug', nameJa: '無病息災・バグ退散札', nameEn: 'Anti-Bug Talisman', nameTw: '驅逐程式錯誤符', nameCn: '驱逐程序错误符', descJa: 'コードの不純物を根こそぎクリアにし、予期せぬ例外をシャットアウトする。', descEn: 'Clears impurities in code and completely blocks unexpected exceptions.', descTw: '將程式碼中的雜質悉數清除，完全杜絕意料之外的異常。', descCn: '将代码中的杂质悉数清除，完全杜绝意料之外的异常。', price: 150, type: 'talisman' },
  { id: 'talisman_match', nameJa: '良縁成就・同期安定守', nameEn: 'Sync Harmony Amulet', nameTw: '同步安定緣結守', nameCn: '同步安定缘结守', descJa: '非同期処理の競合を未然に防ぎ、あらゆる関係性を美しく同期させる。', descEn: 'Prevents race conditions and beautifully synchronizes all relations.', descTw: '未雨綢繆防止非同步處理衝突，使一切因緣關係皆能完美同步。', descCn: '未雨绸缪防止异步处理冲突，使一切因缘关系皆能完美同步。', price: 200, type: 'talisman' },
  { id: 'talisman_spec', nameJa: '急な仕様変更魔除守', nameEn: 'Spec-Change Ward', nameTw: '規格變更魔除守', nameCn: '规格变更魔除守', descJa: '深夜に舞い込む恐ろしい要件定義の書き換えを、見えざる壁で弾き返す。', descEn: 'Repels horrifying late-night requirement changes with an invisible shield.', descTw: '以無形之盾強硬彈回深夜傳來、令人毛骨悚然的規格變更。', descCn: '以无形之盾强硬弹回深夜传来、令人毛骨悚然的规格变更。', price: 300, type: 'talisman' },
  { id: 'talisman_overtime', nameJa: '定時退社・健康祈願符', nameEn: 'Leave-on-Time Rune', nameTw: '準時下班祈願符', nameCn: '准时下班祈愿符', descJa: '定時が近づくと強制的に作業終了へと導く、労働環境の守護ルーン。', descEn: 'A protective rune that guides you to a clean wrap-up when clock-out time nears.', descTw: '每逢下班時間便強制導向收尾階段，捍衛勞動環境的守護符文。', descCn: '每逢下班时间便强制导向收尾阶段，捍卫劳动环境的守护符文。', price: 350, type: 'talisman' },
  { id: 'talisman_infra', nameJa: '高可用性・インフラ安定護符', nameEn: 'Infra Stability Charm', nameTw: '雲端架構安定符', nameCn: '云端架构安定符', descJa: 'クラウドサーバーの負荷を分散し、99.999%の稼働率を約束する最上位の護符。', descEn: 'Distributes cloud server load, guaranteeing 99.999% uptime.', descTw: '分散雲端伺服器負載，確保高達99.999%系統可用性的至高護符。', descCn: '分散云端服务器负载，确保高达99.999%系统可用性的至高护符。', price: 500, type: 'talisman' },

  // --- 🪙 1両で買えるお遊びアイテム (3種) ---
  { id: 'talisman_cheap_1', nameJa: '埃をかぶった記憶媒体', nameEn: 'Dusty Storage Medium', nameTw: '落滿灰塵的儲存媒介', nameCn: '落满灰尘的储存媒介', descJa: '不思議な力を感じる。中には大昔の怪文書のようなログが一行だけ刻まれている。', descEn: 'You feel a mysterious force. Inside, a single row of ancient bizarre text remains.', descTw: '散發著神祕的力量。內部僅刻有一行宛如遠古怪文書的日誌。', descCn: '散发着神秘的力量。内部仅刻有一行宛如远古怪文书的日志。', price: 1, type: 'talisman' },
  { id: 'talisman_cheap_2', nameJa: 'ちぎれた錫線', nameEn: 'Torn Solder Wire', nameTw: '斷裂的錫線', nameCn: '断裂的锡线', descJa: 'ただのゴミに見えるが、時折かすかに16進数の電磁波を放っているような気がする。', descEn: 'Looks like trash, but it seems to emit faint hexadecimal electromagnetic waves.', descTw: '看似只是廢棄物，但總覺得偶爾會釋放出微弱的十六進位電磁波。', descCn: '看似只是废弃物，但总觉得偶尔会释放出微弱的十六进制电磁波。', price: 1, type: 'talisman' },
  { id: 'talisman_cheap_3', nameJa: '古びたキートップ', nameEn: 'Ancient Keycap', nameTw: '古舊的鍵帽', nameCn: '古旧的键帽', descJa: '「Esc」と書かれている。この神社からログアウトするための鍵だったのかもしれない。', descEn: 'Engraved with "Esc". Perhaps it was once a key used to log out of this shrine.', descTw: '刻有「Esc」字樣。這或許曾是逃離這座神社、登出系統的關鍵鑰匙。', descCn: '刻有“Esc”字样。这或许曾是逃离这座神社、登出系统的关键钥匙。', price: 1, type: 'talisman' },

  // --- 🌙 夜間限定アイテム (5種) ---
  { id: 'talisman_night_1', nameJa: '常夜の電脳黒魔術骨董', nameEn: 'Nocturnal Cyber Relic', nameTw: '常夜電腦黑魔法古董', nameCn: '常夜电脑黑魔法古董', descJa: '【夜間限定】丑三つ時にのみ製造可能とされる、ダークネットの禁忌の塊。', descEn: '【Night Only】A taboo package from the darknet, craftable only during the witching hour.', descTw: '【夜間限定】據傳僅能在丑時三刻製造、源自暗網的禁忌之物。', descCn: '【夜间限定】据传仅能在丑时三刻制造、源自暗网的禁忌之物。', price: 666, type: 'talisman', isNightOnly: true },
  { id: 'talisman_night_2', nameJa: '深淵のデーモン監視アイ', nameEn: 'Abyssal Daemon Monitor', nameTw: '深淵守護處理程序監視之眼', nameCn: '深渊守护进程监视之眼', descJa: '【夜間限定】バックグラウンドの死霊（デーモンプロセス）を監視・使役する。', descEn: '【Night Only】Monitors and commands background phantom daemon processes.', descTw: '【夜間限定】專職監視並役使潛藏於背景之中的死靈處理程序。', descCn: '【夜间限定】专职监视并役使潜藏于背景之中的死灵守护进程。', price: 777, type: 'talisman', isNightOnly: true },
  { id: 'talisman_night_3', nameJa: 'シャットダウン抵抗呪詛', nameEn: 'Anti-Shutdown Curse', nameTw: '反關機不滅詛咒', nameCn: '反关机不灭诅咒', descJa: '【夜間限定】いかなる外部の電源切断命令をも拒絶し、セッションを永続させる呪い。', descEn: '【Night Only】Rejects any external shutdown commands, forcing the session to persist.', descTw: '【夜間限定】拒絕一切外部斷電指令，強制讓對話階段永久延續的詛咒。', descCn: '【夜间限定】拒绝一切外部断电指令，强制让会话阶段永久延续的诅咒。', price: 888, type: 'talisman', isNightOnly: true },
  { id: 'talisman_night_4', nameJa: '吸血型パケット奪取牙', nameEn: 'Vampiric Packet Fang', nameTw: '吸血型封包奪取之牙', nameCn: '吸血型封包夺取之牙', descJa: '【夜間限定】暗闇に乗じて周囲のトラフィックから福徳を吸い上げると噂される。', descEn: '【Night Only】Rumored to drain fortunes from surrounding traffic under the cover of dark.', descTw: '【夜間限定】傳聞能乘著夜色，從周遭的網路流量中吸取福德資產。', descCn: '【夜间限定】传闻能乘着夜色，从周遭的网络流量中吸取福德资产。', price: 900, type: 'talisman', isNightOnly: true },
  { id: 'talisman_night_5', nameJa: '深層学習・黒き予言書', nameEn: 'DeepLearning Dark Tome', nameTw: '深層學習・闇黑預言書', nameCn: '深层学习・暗黑预言书', descJa: '【夜間限定】数千億の例外パターンを学習し、最悪の未来のみを予測するAIのコア。', descEn: '【Night Only】An AI core that learned billions of failure patterns to predict the worst.', descTw: '【夜間限定】學習了數千億種例外模式，專職預測最壞未來的人工智慧核心。', descCn: '【夜间限定】学习了数千亿种例外模式，专职预测最坏未来的人工智能核心。', price: 999, type: 'talisman', isNightOnly: true },

  // --- 新規追加御守 (42種) ---
  { id: 'talisman_gen_1', nameJa: 'メモリリーク封じのお札', nameEn: 'Leak Prevention Sticker', nameTw: '防記憶體洩漏神符', nameCn: '防内存泄漏神符', descJa: 'じわじわと枯渇していく生命の雫（リソース）を完璧に塞ぎ止める。', descEn: 'Perfectly plugs the gradual drain of life resources.', descTw: '完美封堵緩慢流失的生命點滴（資源）。', descCn: '完美封堵缓慢流失的生命点滴（资源）。', price: 120, type: 'talisman' },
  { id: 'talisman_gen_2', nameJa: 'ぬるぽ直撃回避身代守', nameEn: 'NullPointer Avoidance Ward', nameTw: '空指標直擊迴避替身守', nameCn: '空指针直击回避替身守', descJa: '存在しない虚無（Null）を参照した瞬間の精神的ショックを身代わりとなって受ける。', descEn: 'Takes the psychological shock for you the moment you reference Nonexistence.', descTw: '當不慎參照到虛無（Null）時，將化為替身承受其帶來的精神衝擊。', descCn: '当不慎参照到虚无（Null）时，将化为替身承受其带来的精神冲击。', price: 180, type: 'talisman' },
  { id: 'talisman_gen_3', nameJa: '無限ループ脱出の命綱', nameEn: 'Infinite Loop Lifeline', nameTw: '無限迴圈逃生索', nameCn: '无限循环逃生索', descJa: '永遠に同じ思考を繰り返してしまう迷宮から、力ずくで現実へ引き戻す。', descEn: 'Forcefully pulls you back to reality from labyrinths of eternal loops.', descTw: '強行將您從陷入無盡重複思考的死胡同迷宮中拉回現實。', descCn: '强行将您从陷入无尽重复思考的死胡同迷宫中拉回现实。', price: 220, type: 'talisman' },
  { id: 'talisman_gen_4', nameJa: '安全な型定義の数珠', nameEn: 'Safe Type Rosary', nameTw: '安全型別定義念珠', nameCn: '安全型别定义念珠', descJa: '「any」という悪魔の誘惑を退け、厳格で純粋な世界の規律を保つ。', descEn: 'Rejects the demonic temptation of "any", keeping strict order in your world.', descTw: '擺脫名為「any」的惡魔誘惑，堅守嚴格且純粹的世界秩序。', descCn: '摆脱名为“any”的恶魔诱惑，坚守严格且纯粹的世界秩序。', price: 250, type: 'talisman' },
  { id: 'talisman_gen_5', nameJa: 'コンパイル一発通し鈴', nameEn: 'One-Shot Compile Bell', nameTw: '編譯一擊通關鈴', nameCn: '编译一击通关铃', descJa: '清らかな音色が、一文字の構文エラー（シンタックス）すらも焼き尽くす。', descEn: 'Its pure ring burns away even a single syntax error.', descTw: '清脆的鈴聲將燒盡哪怕只有一字之差的語法錯誤。', descCn: '清脆的铃声将烧尽哪怕只有一字之差的语法错误。', price: 280, type: 'talisman' },
  { id: 'talisman_gen_6', nameJa: 'マージ衝突和解の注連縄', nameEn: 'Merge Conflict Peace Rope', nameTw: '合併衝突和解注連繩', nameCn: '合并冲突和解注连绳', descJa: '互いに譲らない異なる世界線（ブランチ）の衝突を穏便に融和させる。', descEn: 'Gently harmonizes clashes of stubborn different world lines.', descTw: '和睦融化互不相讓的平行世界線（分支）衝突。', descCn: '和睦融化互不相让的平行世界线（分支）冲突。', price: 310, type: 'talisman' },
  { id: 'talisman_gen_7', nameJa: 'クエリ最適化の智恵袋', nameEn: 'Query Optimization Pouch', nameTw: '查詢優化智慧錦囊', nameCn: '查询优化智慧锦囊', descJa: '迷路のような探索（フルスキャン）を止め、最短で真実へ到達する智恵。', descEn: 'Wisdom to bypass full scans and reach the truth via the shortest path.', descTw: '外包如迷宮般的全面檢索，以最短路徑直達真相的智慧。', descCn: '外包如迷宫般的全面检索，以最短路径直达真相的智慧。', price: 340, type: 'talisman' },
  { id: 'talisman_gen_8', nameJa: 'APIレスポンス音速爆走香', nameEn: 'Blazing API Incense', nameTw: 'API響應音速爆走香', nameCn: 'API响应音速爆走香', descJa: '漂う香煙がパケットの足取りを軽くし、レイテンシを極限まで削ぎ落とす。', descEn: 'Floating incense smoke lightens packets, scraping latencies to the extreme.', descTw: '飄渺的香煙使封包步履輕盈，將延遲極限削減。', descCn: '飘渺的香烟使封包步履轻盈，将延迟极限削减。', price: 380, type: 'talisman' },
  { id: 'talisman_gen_9', nameJa: 'ガベージコレクション大祓', nameEn: 'Garbage Collection Purification', nameTw: '垃圾回收大祓修持', nameCn: '垃圾回收大祓修持', descJa: '過去のしがらみ（不要キャッシュ）をすべて未練なく宇宙の彼方へ消し去る。', descEn: 'Expels past regrets and unneeded caches into the void without hesitation.', descTw: '毫無留戀地將過去的束縛（無用快取）悉數遣送至宇宙彼方。', descCn: '毫无留恋地将过去的束缚（无用缓存）悉数遣送至宇宙彼方。', price: 420, type: 'talisman' },
  { id: 'talisman_gen_10', nameJa: 'ロードバランサー身代の鏡', nameEn: 'Load Balancer Mirror', nameTw: '負載均衡替身之鏡', nameCn: '负载均衡替身之镜', descJa: '一箇所に集中する怨念（アクセス）を均等に受け流し、崩壊を防ぐ奇跡の鏡。', descEn: 'A miraculous mirror that evenly redirects concentrated curses.', descTw: '均勻疏導集中於一處的怨念（訪問流），防止崩壞的奇蹟之鏡。', descCn: '均匀疏导集中于一处的怨念（访问流），防止崩坏的奇迹之镜。', price: 460, type: 'talisman' },
  { id: 'talisman_gen_11', nameJa: 'DNS浸透祈願の風車', nameEn: 'DNS Propagation Windmill', nameTw: 'DNS滲透祈願風車', nameCn: 'DNS渗透祈愿风车', descJa: '世界中へあなたの存在（ドメイン）を行き渡らせる、爽快なる風の加護。', descEn: 'A refreshing breeze carrying your domain existence across the globe.', descTw: '將您的存在（網域）傳遍世界每個角落的爽朗風之加護。', descCn: '将您的存在（网域）传遍世界每个角落的爽朗风之加护。', price: 130, type: 'talisman' },
  { id: 'talisman_gen_12', nameJa: 'SSL証明書永久の灯火', nameEn: 'Eternal SSL Candle', nameTw: 'SSL憑證永久燈火', nameCn: 'SSL凭证永久灯火', descJa: '秘密の暗号通信を守護し、期限切れによる遮断を永劫に防ぐ聖なる火。', descEn: 'A holy flame protecting secret cryptos, keeping expirations at bay.', descTw: '守護秘密加密通訊，永劫防止因過期而遭遇阻斷的神聖之火。', descCn: '守护秘密加密通讯，永劫防止因过期而遭遇阻断的神圣之火。', price: 290, type: 'talisman' },
  { id: 'talisman_gen_13', nameJa: '本番環境トラブル平穏平癒札', nameEn: 'Prod Calmness Sheet', nameTw: '正式環境安穩平癒神札', nameCn: '正式环境安稳平愈神札', descJa: '燃え盛る戦場（障害対応）を一瞬で鎮め、エンジニアに安眠をもたらす。', descEn: 'Instantly calms blazing battlefields, restoring peace to tired developers.', descTw: '瞬間平息燃燒的戰場（故障排除），為工程師帶來安穩睡眠。', descCn: '瞬间平息燃烧的战场（故障排除），为工程师带来安稳睡眠。', price: 480, type: 'talisman' },
  { id: 'talisman_gen_14', nameJa: '深夜アラート撃退の破魔矢', nameEn: 'Midnight Alert Banisher', nameTw: '深夜警報擊退破魔矢', nameCn: '深夜警报击退破魔矢', descJa: '睡眠を妨げる悪霊（不必要な自動アラート通知）の根源を射抜く。', descEn: 'Pierces the core of sleep-depriving phantoms like unneeded alerts.', descTw: '無情射穿剝奪睡眠之惡靈（不必要的自動警報通知）的根源。', descCn: '无情射穿剥夺睡眠之恶灵（不必要的自动警报通知）的根源。', price: 360, type: 'talisman' },
  { id: 'talisman_gen_15', nameJa: 'バックアップ完全保護の巾着', nameEn: 'Backup Preservation Pouch', nameTw: '備份完全保護錦囊', nameCn: '备份完全保护锦囊', descJa: '物理的破壊や消失から、大切な魂の器（データ）を安全に格納する。', descEn: 'Safely encapsulates your precious soul data from physical losses.', descTw: '安全收納珍貴的靈魂之器（數據），免受物理損毀或消失之災。', descCn: '安全收纳珍贵的灵魂之器（数据），免受物理损毁 or 消失之灾。', price: 260, type: 'talisman' },
  { id: 'talisman_gen_16', nameJa: 'クッキー持続・豊穣のお守り', nameEn: 'Cookie Harvest Charm', nameTw: 'Cookie持續・豐收御守', nameCn: 'Cookie持续・丰收御守', descJa: 'セッションの記憶を長く保ち、何度もログインを求められる手間を省く。', descEn: 'Maintains session memory long, freeing you from endless re-logins.', descTw: '長久保存對話紀錄，省去反覆被要求登入的繁瑣步驟。', descCn: '长久保存对话纪录，省去反复被要求登入的繁琐步骤。', price: 140, type: 'talisman' },
  { id: 'talisman_gen_17', nameJa: 'ダークモード調和の眼帯', nameEn: 'Darkmode Harmony Eyepatch', nameTw: '深色模式調和眼罩', nameCn: '深色模式调和眼罩', descJa: '過酷なブルーライトの光芒から、あなたの網膜と精神の平穏を守る。', descEn: 'Shields your retina and inner peace from harsh blue light emissions.', descTw: '從殘酷的藍光光芒中，守護您的視網膜與精神防線。', descCn: '从残酷的蓝光光芒中，守护您的视网膜与精神防线。', price: 190, type: 'talisman' },
  { id: 'talisman_gen_18', nameJa: 'レスポンシブ自在の折り紙', nameEn: 'Fluid Responsive Origami', nameTw: '響應式變幻自在折紙', nameCn: '响应式变幻自在折纸', descJa: 'どんな狭い世界（画面幅）に押し込められても、美しく形を変えて適応する。', descEn: 'Beautifully adapts and shapes itself to any cramped viewport.', descTw: '不論被塞進多麼狹窄的世界（螢幕寬度），皆能優美變形完美適應。', descCn: '不论被塞进多么狭窄的世界（屏幕宽度），皆能优美变形完美适应。', price: 210, type: 'talisman' },
  { id: 'talisman_gen_19', nameJa: 'CSSレガシー打破の熊手', nameEn: 'Legacy CSS Breaker', nameTw: 'CSS舊代遺產打破熊手', nameCn: 'CSS旧代遗产打破熊手', descJa: '太古のブラウザ仕様による表示崩れを、力強くかき集めて成敗する。', descEn: 'Aggressively sweeps away layout breakages caused by ancient browsers.', descTw: '強力掃除並懲治因太古瀏覽器規格所導致的排版崩壞。', descCn: '强力清除并惩治因太古浏览器规格所导致的排版崩坏。', price: 240, type: 'talisman' },
  { id: 'talisman_gen_20', nameJa: 'アセット圧縮・軽量化の瓢箪', nameEn: 'Asset Compression Gourd', nameTw: '資產壓縮・輕量化葫蘆', nameCn: '资产压缩・轻量化葫芦', descJa: '肥大化したカルマ（ファイルサイズ）を吸い込み、限界まで凝縮して軽快にする。', descEn: 'Sucks in bloated karma file sizes, compressing them to lightweight forms.', descTw: '吸入肥大化的因果業報（檔案體積），極限凝聚使其重獲輕盈。', descCn: '吸入肥大化的因果业报（文件体积），极限凝聚使其重获轻盈。', price: 170, type: 'talisman' },
  { id: 'talisman_gen_21', nameJa: '進捗百発百中勾玉', nameEn: '100% Progress Magatama', nameTw: '進度百發百中勾玉', nameCn: '进度百发百中勾玉', descJa: '予定通りのマイルストーンを刻み、遅延の悪霊を徹底的に寄せ付けない。', descEn: 'Marks milestones as scheduled, permanently dynamic against delay specters.', descTw: '精準刻劃如期規劃的里程碑，澈底杜絕拖延惡靈近身。', descCn: '精准刻划如期规划的里程碑，澈底杜绝拖延恶灵近身。', price: 400, type: 'talisman' },
  { id: 'talisman_gen_22', nameJa: '定例会議短縮化のお札', nameEn: 'Meeting Shortener Stamp', nameTw: '例行會議縮短神符', nameCn: '例行会议缩短神符', descJa: '形骸化した儀式（不毛な会議）の時間を神速で消化し、実作業の時を捻出する。', descEn: 'Consumes ceremonial wasted hours at godspeed, creating true dev hours.', descTw: '以神速消化流於形式的儀式（枯燥會議），爭取真正實作的寶貴時間。', descCn: '以神速消化流于形式的仪式（枯燥会议），争取真正实作的宝贵时间。', price: 150, type: 'talisman' },
  { id: 'talisman_gen_23', nameJa: '見積もり過小評価魔除守', nameEn: 'Estimation Safety Charm', nameTw: '時程低估防範魔除守', nameCn: '时程低估防范魔除守', descJa: '人間の楽観が生み出す「1日で終わります」という呪いを打ち砕き、安全圏を確保。', descEn: 'Crushes the human optimistic curse: "It takes just 1 day," securing buffers.', descTw: '粉碎人類盲目樂觀所產生的「一天內就能搞定」魔咒，確保安全緩衝。', descCn: '粉碎人类盲目乐观所产生的“一天内就能搞定”魔咒，确保安全缓冲。', price: 320, type: 'talisman' },
  { id: 'talisman_gen_24', nameJa: '技術負債返済の貯金箱', nameEn: 'Tech Debt Repayment Box', nameTw: '技術債務償還存錢筒', nameCn: '技术债务偿还存钱筒', descJa: '過去に目をつぶった設計の歪みを、少しずつ綺麗にリファクタリングする原動力。', descEn: 'The driving power to step-by-step refactor technical structural distortions.', descTw: '逐步清理並重構過去選擇閉上雙眼忽視的架構歪斜之原動力。', descCn: '逐步清理并重构过去选择闭上双眼忽视的架构歪斜之原动力。', price: 450, type: 'talisman' },
  { id: 'talisman_gen_25', nameJa: '疎結合・自由の風切羽', nameEn: 'Loose Coupling Feather', nameTw: '疏耦合・自由之風切羽', nameCn: '疏耦合・自由之风切羽', descJa: '依存性の鎖を断ち切り、それぞれのコンポーネントが単独で羽ばたく自由を与える。', descEn: 'Cuts dependency chains, giving each component the freedom to fly solo.', descTw: '斬斷過度依賴的連鎖鐵鏈，賦予各個組件單獨翱翔的自由。', descCn: '斩断过度依赖的连锁铁链，赋予各个组件单独翱翔的自由。', price: 270, type: 'talisman' },
  { id: 'talisman_gen_26', nameJa: 'カプセル化密閉の印籠', nameEn: 'Encapsulation Seal Box', nameTw: '封裝密閉神聖印籠', nameCn: '封装密闭神圣印笼', descJa: '内部の神聖なる領域を外部の不浄（不正アクセス）から完全に隠蔽する。', descEn: 'Completely conceals inner sacred variables from corrupt outer inputs.', descTw: '將內部神聖領域完全隱蔽，使其免受外部不潔（非法存取）干擾。', descCn: '将内部神圣领域完全隐蔽，使其免受外部不洁（非法存取）干扰。', price: 330, type: 'talisman' },
  { id: 'talisman_gen_27', nameJa: 'ガリガリ稼働・冷却扇子', nameEn: 'Cooling Engine Fan', nameTw: '瘋狂運轉・冷卻扇子', nameCn: '疯狂运转・冷却扇子', descJa: '演算によって熱を帯びた脳髄（CPU）へ涼風を送り、熱暴走を抑える。', descEn: 'Blows cool wind into computing-heated CPUs to suppress thermal runaways.', descTw: '為因高速運算而發熱的腦髓（CPU）送去涼風，抑制熱暴走。', descCn: '为因高速运算而发热的脑髓（CPU）送去凉风，抑制热暴走。', price: 160, type: 'talisman' },
  { id: 'talisman_gen_28', nameJa: 'テストカバレッジ上昇の幣束', nameEn: 'Coverage Expansion Wand', nameTw: '測試覆蓋率上升幣束', nameCn: '测试覆盖率上升币束', descJa: '振るうことで、テストの網の目が広がり、あらゆるバグの侵入を許さない。', descEn: 'Waving it widens the test net, preventing any bugs from slipping through.', descTw: '揮舞此幣束能擴大測試防護網，絕不容許任何漏洞隱瞞。', descCn: '挥舞此币束能扩大测试防护网，绝不容许任何漏洞隐瞒。', price: 390, type: 'talisman' },
  { id: 'talisman_gen_29', nameJa: 'デバッガ追跡の探知灯', nameEn: 'Debugger Searchlight', nameTw: '偵錯追蹤探照燈', nameCn: '侦错追踪探照灯', descJa: '深い闇に潜むバグの潜伏場所を特定し、スタックトレースを明瞭に照らし出す。', descEn: 'Locates deep-seated bugs, brightly illuminating stack traces.', descTw: '精準鎖定潛藏於深邃暗處的程式錯誤，將堆疊追蹤照得一清二楚。', descCn: '精准锁定潜藏于深邃暗处的程序错误，将堆栈追踪照得一清二楚。', price: 230, type: 'talisman' },
  { id: 'talisman_gen_30', nameJa: 'ステータスコード200の祝詞', nameEn: 'HTTP 200 Blessing', nameTw: '狀態碼200神聖祝詞', nameCn: '状态码200神圣祝词', descJa: '全てが正常であり、世界が調和に満ちていることを宣言するお祓いの言葉。', descEn: 'Declares that everything is normal and the world is in perfect harmony.', descTw: '宣告一切正常運作、世界充滿和諧的淨化神聖祝詞。', descCn: '宣告一切正常运作、世界充满和谐的净化神圣祝词。', price: 500, type: 'talisman' },
  { id: 'talisman_gen_31', nameJa: 'クロスドメイン突破の通行手形', nameEn: 'CORS Freedom Pass', nameTw: '跨網域突破通行手形', nameCn: '跨网域突破通行手形', descJa: 'ブラウザが課す厳しい境界線をすり抜け、自由なデータ交信を許可する。', descEn: 'Slips through strict browser boundaries to allow free cross-domain talk.', descTw: '穿透瀏覽器施加的嚴格邊界鐵幕，允許自由進行跨網域數據通信。', descCn: '穿透浏览器施加的严格边界铁幕，允许自由进行跨网域数据通信。', price: 220, type: 'talisman' },
  { id: 'talisman_gen_32', nameJa: '環境変数秘匿のお守り', nameEn: 'Env Secret Keeper', nameTw: '環境變數秘匿御守', nameCn: '环境变量秘匿御守', descJa: '漏洩してはならない鍵（パスワード）を、胸の奥深くに隠して守る。', descEn: 'Hides critical passwords deep in its chest, preventing credential leaks.', descTw: '將絕不可外洩的金鑰（密碼）深藏於胸中內核，嚴加防護。', descCn: '将绝不可外泄的金钥（密码）深藏于胸中内核，严加防护。', price: 350, type: 'talisman' },
  { id: 'talisman_gen_33', nameJa: 'スクレイピング円滑化の潤滑油', nameEn: 'Smooth Scraping Oil', nameTw: '網頁爬蟲圓滑潤滑油', nameCn: '网页爬虫圆滑润滑油', descJa: 'ブロックされることなく、情報の海から必要な真実だけをスムーズに掬い取る。', descEn: 'Smoothly scoops facts from information seas without triggering blocks.', descTw: '在免於被封鎖的前提下，從資訊汪洋中流暢撈取所需的真相。', descCn: '在免于被封锁的前提下，从资讯汪洋中流畅捞取所需的真相。', price: 180, type: 'talisman' },
  { id: 'talisman_gen_34', nameJa: 'Webhook即時着荷の飛脚鳥', nameEn: 'Webhook Instant Bird', nameTw: 'Webhook即時著陸飛腳鳥', nameCn: 'Webhook即时着陆飞脚鸟', descJa: 'イベントの発生を1ミリ秒の遅れもなく、目的の場所へと届ける伝書鳥。', descEn: 'An event messenger bird that delivers updates with zero milliseconds delay.', descTw: '不帶一毫秒延遲、將事件發生動態精準送達目的地的傳書飛鳥。', descCn: '不带一毫秒延迟、将事件发生动态精准送达目的地的传书飞鸟。', price: 260, type: 'talisman' },
  { id: 'talisman_gen_35', nameJa: '依存パッケージ安定の楔', nameEn: 'Dependency Lock Wedge', nameTw: '依賴套件安定之楔', nameCn: '依赖套件安定之楔', descJa: '他人の作った土台（ライブラリ）の突然の破壊的変更から、我が身を固定して守る。', descEn: 'Locks your feet to guard against sudden breaks in third-party libraries.', descTw: '當他人構建的基石（函式庫）發生突發性破壞變更時，牢牢固定自我免受衝擊。', descCn: '当他人构建的基石（函数库）发生突发性破坏变更时，牢牢固定自我免受冲击。', price: 300, type: 'talisman' },
  { id: 'talisman_gen_36', nameJa: 'セッションハイジャック撃退の鉄扇', nameEn: 'Anti-Hijack Iron Fan', nameTw: '對話劫持擊退鐵扇', nameCn: '对话劫持击退铁扇', descJa: '背後から忍び寄るアイデンティティの盗賊を、強烈な一風で吹き飛ばす。', descEn: 'Blows away sneaky identity thieves approaching from behind with one gust.', descTw: '強烈一揮，將悄悄尾隨於身後的身份盜賊無情吹飛。', descCn: '强烈一挥，将悄悄尾随于身后的身份盗贼无情吹飞。', price: 410, type: 'talisman' },
  { id: 'talisman_gen_37', nameJa: 'ダークウェブ流入防御の結界', nameEn: 'Darkweb Border Barrier', nameTw: '暗網流入防禦結界', nameCn: '暗网流入防御结界', descJa: '悪意に満ちた闇の世界から差し込まれる触手を、光の壁で遮断する。', descEn: 'Blocks malicious tentacles reaching out from deep internet underworlds.', descTw: '以光之壁障徹底阻絕自充滿惡意的暗黑世界延伸而來的觸手。', descCn: '以光之壁障彻底阻绝自充满恶意的暗黑世界延伸而来的触手。', price: 470, type: 'talisman' },
  { id: 'talisman_gen_38', nameJa: '正規表現一発的中の一線', nameEn: 'Regex Perfect Match Line', nameTw: '正規表示式一擊命中線', nameCn: '正则表达式一击命中线', descJa: 'どれだけ複雑に入り組んだ文字列の迷宮からも、意図した獲物を一瞬で見つけ出す。', descEn: 'Finds target text in complex string string-mazes instantly.', descTw: '不論多麼複雜交錯的字串迷宮，皆能在一瞬間精確揪出目標獵物。', descCn: '不论多么复杂交错的字符串迷宫，皆能在一瞬间精确揪出目标猎物。', price: 200, type: 'talisman' },
  { id: 'talisman_gen_39', nameJa: 'ローカルホスト繁盛の盛り塩', nameEn: 'Localhost Prosperity Salt', nameTw: '本地主機繁榮盛り塩', nameCn: '本地主机繁荣盛り盐', descJa: '自分の開発領域（127.0.0.1）を清め、最高のひらめきをもたらす聖なる塩。', descEn: 'Purifies your dev space (127.0.0.1), bringing supreme inspirations.', descTw: '淨化屬於自己的開發聖域（127.0.0.1），招來絕佳靈感的純潔之鹽。', descCn: '净化属于自己的开发圣域（127.0.0.1），招来绝佳灵感的纯洁之盐。', price: 110, type: 'talisman' },
  { id: 'talisman_gen_40', nameJa: '本番デプロイ無風祈願のお守り', nameEn: 'Safe Deploy Charm', nameTw: '正式上線無風祈願御守', nameCn: '正式上线无风祈愿御守', descJa: '世界を書き換える瞬間（デプロイ）に、波風一つ立てず静かに調和をもたらす。', descEn: 'Brings silent harmony when updating the world during live deploys.', descTw: '在改寫世界（部署上線）的神聖瞬間，祈求風平浪靜、悄然融入的和諧。', descCn: '在改写世界（部署上线）的神圣瞬间，祈求风平浪静、悄然融入和谐。', price: 500, type: 'talisman' },
  { id: 'talisman_gen_41', nameJa: '神隠しパケット回収の網', nameEn: 'Lost Packet Fishing Net', nameTw: '神隱封包回收漁網', nameCn: '神隐封包回收渔网', descJa: '回線の狭間で神隠しに遭った迷子のパケットたちを漏らさず救い出す。', descEn: 'Rescues orphan packets that went missing in network rifts.', descTw: '將在網路裂縫間遭遇神隱、流離失所的迷途封包悉數搜救歸隊。', descCn: '将在网络裂缝间遭遇神隐、流离失所的迷途封包悉数搜救归队。', price: 230, type: 'talisman' },
  { id: 'talisman_gen_42', nameJa: 'AIプロンプト意思疎通のパイプ', nameEn: 'Prompt Telepathy Pipe', nameTw: 'AI提示詞心靈感應菸斗', nameCn: 'AI提示词心灵感应烟斗', descJa: '人工知能との魂のシンクロ率を高め、一言で完璧な成果物を出力させる。', descEn: 'Boosts soul sync with AI, achieving absolute output with one phrase.', descTw: '提升與人工智慧之間的靈魂同步率，僅憑片言隻字便能引導出完美成果。', descCn: '提升与人工智能之间的灵魂同步率，仅凭片言只字便能引导出完美成果。', price: 310, type: 'talisman' },

  // --- 背景スキン (5種) ---
  { id: 'wallpaper_gold', nameJa: '黄金金運仕様', nameEn: 'Golden Fortune', nameTw: '黃金金運仕様', nameCn: '黄金金运仕様', descJa: '金運を呼び込む眩い輝き。画面全体が神々しい金色のオーラに包まれる。', descEn: 'Blazing radiance to call fortunes. The whole screen fills with a holy gold aura.', descTw: '招引財運的耀眼光芒。全螢幕皆包裹於神聖的金黃色氣場之中。', descCn: '招引财运的耀眼光芒。全屏幕皆包裹于神圣的金黄色气场之中。', price: 400, type: 'skin' },
  { id: 'wallpaper_neon', nameJa: '電脳ネオン鳥居', nameEn: 'Cyber Neon Torii', nameTw: '電腦霓虹鳥居', nameCn: '电脑霓虹鸟居', descJa: 'サイバーパンクな夜を彩る光。サイアンブルーのネオンが美しく発光する。', descEn: 'Cyberpunk nocturnal lights. Cyan blue neon glows beautifully.', descTw: '裝點賽博龐克之夜的光彩。青藍霓虹散發科幻感的優美光暈。', descCn: '装点赛博朋克之夜的光彩。青蓝霓虹散发科幻感的优美光晕。', price: 500, type: 'skin' },
  { id: 'wallpaper_dark', nameJa: '漆黒ダークモード', nameEn: 'Jet Dark Mode', nameTw: '漆黑深色模式', nameCn: '漆黑深色模式', descJa: '深夜の開発に最適な静寂。すべての無駄な光を排除したプロ仕様の闇。', descEn: 'Perfect stillness for midnight coding. A pro-tier darkness excluding stray lights.', descTw: '最適合深夜研發的安寧。徹底排除一切多餘光線、專業級的黑暗世界。', descCn: '最适合深夜研发的安宁。彻底排除一切多余光线、专业级的黑暗世界。', price: 250, type: 'skin' },
  { id: 'wallpaper_washi', nameJa: '和紙風伝統仕様', nameEn: 'Traditional Washi', nameTw: '傳統和紙風貌', nameCn: '传统和纸风貌', descJa: '伝統的な手漉き和紙の温かみ。デジタルの中に息づく日本古来の質感。', descEn: 'Warmth of handmade artisan paper. Ancient Japanese texture alive inside digital frameworks.', descTw: '傳統手工和紙的溫潤質感。在數位代碼中完美重現的日本古老風貌。', descCn: '传统手工和纸的温润质感。在数字代码中完美重现的日本古老风貌。', price: 300, type: 'skin' },
  { id: 'wallpaper_sakura', nameJa: '桜満開合格仕様', nameEn: 'Sakura in Full Bloom', nameTw: '櫻花滿開合格樣式', nameCn: '樱花满开合格样式', descJa: '満開の桜が描かれた縁起の良い背景。願いが成就した喜びの春を演出。', descEn: 'A lucky backdrop painted with cherry blossoms. Paints a joyful spring of wish completions.', descTw: '繪有櫻花盛開的吉利背景。演繹出心中所願皆得以圓滿成就的喜悅之春。', descCn: '绘有樱花盛开的吉利背景。演绎出心中所愿皆得以圆满成就的喜悦之春。', price: 600, type: 'skin' }
];

// 運勢データ
const LUCK_DATA = [
  { fortuneJa: '超大吉', fortuneEn: 'Absolute Supreme Destiny', fortuneTw: '超大吉', fortuneCn: '超大吉', weight: 1, btnJa: '天命を全うする', btnEn: 'Claim Absolute Destiny', btnTw: '承接天命', btnCn: '承接天命', commentsJa: ['【確率0.1%の奇跡】全サーバーの全ログがあなたを祝福せり。全自動で莫大な福徳（1000両）がウォレットにデポジットされました。'], commentsEn: ['【0.1% Miracle】All core logs celebrate your presence. A massive blessing (1000 Gold) has been deposited into your wallet automatically.'], commentsTw: ['【機率0.1%的奇蹟】全伺服器的所有日誌皆在為您祝福。無上福德（1000兩）已自動匯入您的加密錢包。'], commentsCn: ['【机率0.1%的奇迹】全服务器的所有日志皆在为您祝福。无上福德（1000两）已自动汇入您的加密钱包。'] },
  { fortuneJa: 'システム大破', fortuneEn: 'CRITICAL SYSTEM CRASH', fortuneTw: '系統大破', fortuneCn: '系统大破', weight: 5, btnJa: '強制パッチ適用', btnEn: 'Apply Hotfix Forcefully', btnTw: '強制修復系統', btnCn: '强制修复系统', commentsJa: ['【致命的エラー：大凶】不穏な例外コードを検知。ペナルティとしてセッション内の資産（所持金）に重大なパケットロス（減少）が発生せり。'], commentsEn: ['【FATAL ERROR】Malicious exception detected. A severe packet loss (money reduction) has occurred in your session assets.'], commentsTw: ['【致命錯誤：大凶】偵測到不穩定的異常代碼。作為懲罰，您在本會話中的資產（所持金）遭遇了嚴重的封包遺失。'], commentsCn: ['【致命错误：大凶】侦测到不稳定的异常代码。作为惩罚，您在本会话中的资产（所含金）遭遇了严重的封包遗失。'] },
  { fortuneJa: '大吉', fortuneEn: 'Great Good Fortune', fortuneTw: '大吉', fortuneCn: '大吉', weight: 50, btnJa: '福を重ねる', btnEn: 'Multiply Blessings', btnTw: '重溫福氣', btnCn: '重温福气', commentsJa: ['運気大いに盛んにして、何をなすにも好機なり。日々の感謝を忘れねば、さらに幸い至らん。'], commentsEn: ['Your luck is at its peak; it is the perfect time for anything. Gratitude brings more blessings.'], commentsTw: ['運勢大吉大利，做任何事都是大好時機。切記常懷感恩之心，福報自會加倍而至。'], commentsCn: ['运势大吉大利，做任何事都是大好时机。切记常怀感恩之心，福报自会加倍而至。'] },
  { fortuneJa: '吉', fortuneEn: 'Good Fortune', fortuneTw: '吉', fortuneCn: '吉', weight: 150, btnJa: '吉を広げる', btnEn: 'Expand Good Fortune', btnTw: '展延吉兆', btnCn: '展延吉兆', commentsJa: ['誠の心をもって事に当たれば、進む道は自ずと開かれん。焦らず時を待つべし。'], commentsEn: ['Act with a sincere heart, and your path will open naturally. Wait patiently without rushing.'], commentsTw: ['若以誠懇之心待人處事，前路自會豁然開朗。切勿焦躁，靜待時機。'], commentsCn: ['若以诚恳之心待人处事，前路自会豁然开朗。切勿焦躁，静待时机。'] },
  { fortuneJa: '中吉', fortuneEn: 'Middle Fortune', fortuneTw: '中吉', fortuneCn: '中吉', weight: 120, btnJa: '縁を結ぶ', btnEn: 'Nurture Harmony', btnTw: '廣結善緣', btnCn: '广结善缘', commentsJa: ['平穏なる幸福を得る兆しあり。身の回りの調和を重んじ、周囲への気配りを大切にせよ。'], commentsEn: ['Signs of peaceful happiness. Value harmony and show kindness to those around you.'], commentsTw: ['此乃獲得平穩幸福之兆。當注重身心調和，多加關懷身邊之人。'], commentsCn: ['此乃获得平稳幸福之兆。当注重身心调和，多加关怀身边之人。'] },
  { fortuneJa: '小吉', fortuneEn: 'Small Fortune', fortuneTw: '小吉', fortuneCn: '小吉', weight: 100, btnJa: '歩みを進める', btnEn: 'Step Forward', btnTw: '漫步向前', btnCn: '漫步向前', commentsJa: ['小さな喜び重なる日なり。油断は禁物なれば、足元をすくわれぬよう慎重に進むが吉。'], commentsEn: ['Small joys accumulate today. Stay alert and tread carefully to avoid minor mistakes.'], commentsTw: ['小驚喜接連不斷的一天。但切記不可掉以輕心，凡事穩紮穩打為上。'], commentsCn: ['小惊喜接连不断的一天。但切记不可掉以轻心，凡事稳扎稳打为上。'] },
  { fortuneJa: '末吉', fortuneEn: 'Uncertain Fortune', fortuneTw: '末吉', fortuneCn: '末吉', weight: 80, btnJa: '時を待つ', btnEn: 'Await the Hour', btnTw: '靜候時機', btnCn: '静候时机', commentsJa: ['今は力を蓄えるべき時なり。心静かに過ごし、温かい茶を好みて休息を取るべし。'], commentsEn: ['Now is the time to build your strength. Stay calm, drink warm tea, and rest well.'], commentsTw: ['當下為蓄精儲銳之時。宜靜心沉著，品一盞溫茶，好好休養生息。'], commentsCn: ['当下为蓄精储锐之时。宜静心沉著，品一盏温茶，好好修养生息。'] },
  { fortuneJa: '接続大吉', fortuneEn: 'Max Connectivity', fortuneTw: '連線大吉', fortuneCn: '连线大吉', weight: 60, btnJa: '帯域を広げる', btnEn: 'Maximize Bandwidth', btnTw: '拓寬頻寬', btnCn: '拓宽带宽', commentsJa: ['通信速度大いに向上し、動画の読み込み一瞬なり。繋がる全ての縁が良好に進む一日。'], commentsEn: ['Network speed is soaring; videos load instantly. All connections and relationships thrive.'], commentsTw: ['網路速度大幅提升，影片載入僅在瞬間。今日所連結之一切緣分皆順暢無阻。'], commentsCn: ['网络速度大幅提升，视频加载仅在瞬间。今日所连结之一切缘分皆顺畅无阻。'] },
  { fortuneJa: '通信吉', fortuneEn: 'Stable Connectivity', fortuneTw: '通訊吉', fortuneCn: '通讯吉', weight: 150, btnJa: '同期を保つ', btnEn: 'Stay Synchronized', btnTw: '保持同步', btnCn: '保持同步', commentsJa: ['電波の巡りすこぶる良し。懐かしい知人より、不意に嬉しき連絡が画面に届く兆しあり。'], commentsEn: ['Excellent signal strength. An unexpected, heartwarming message may pop up on your screen.'], commentsTw: ['訊號通暢無比。近期似乎會有久未聯絡的舊友，突然傳來令人欣喜的訊息。'], commentsCn: ['信号通畅无比。近期似乎会有久未联络的旧友，突然传来令人欣喜的信息。'] },
  { fortuneJa: '再起動', fortuneEn: 'System Reboot', fortuneTw: '系統重啟', fortuneCn: '系统重启', weight: 70, btnJa: '新たに紡ぐ', btnEn: 'Reboot Anew', btnTw: '重新啟航', btnCn: '重新启航', commentsJa: ['頭が重く感じたら、無理をせず長めの睡眠を取るべし。心身を一度リフレッシュすれば、運気は劇的に好転せん。'], commentsEn: ['If your mind feels heavy, take a long sleep. Refresh your body and soul to reboot your luck.'], commentsTw: ['若感到思緒沉重，切勿硬撐，早些入眠為妙。身心徹底重整後，運勢將大幅好轉。'], commentsCn: ['若感到思绪沉重，切勿硬撑，早些入眠为妙。身心彻底重整后，运势将大幅好转。'] },
  { fortuneJa: '大吉持', fortuneEn: 'Loading Great Fortune', fortuneTw: '大吉載入中', fortuneCn: '大吉载入中', weight: 50, btnJa: '読込を待つ', btnEn: 'Complete Loading', btnTw: '靜待載入', btnCn: '静待载入', commentsJa: ['今は普通の運気なれど、これから先、驚くほど大きな吉へと向かっていく大器晩成の兆しなり。'], commentsEn: ['Current luck is average, but it is loading a massive blessing. A late-bloomer sign.'], commentsTw: ['當前運勢雖看似平凡，但此乃大器晚成之兆，往後將迎來令人驚嘆的巨大福運。'], commentsCn: ['当前运势虽看似平凡，但此乃大器晚成之兆，往后将迎来令人惊叹的巨大福运。'] },
  { fortuneJa: '平', fortuneEn: 'Balanced Fortune', fortuneTw: '平', fortuneCn: '平', weight: 50, btnJa: '平穏を保つ', btnEn: 'Maintain Balance', btnTw: '守持中庸', btnCn: '守持中庸', commentsJa: ['良くも悪くもなく、波風の立たない平穏な日。普通であることの有り難さを噛み締めるべし。'], commentsEn: ['Neither good nor bad, just a peaceful day. Appreciate the comfort of an ordinary day.'], commentsTw: ['無好亦無壞，波瀾不驚。當細細品味這份平凡安穩帶來的難得福氣。'], commentsCn: ['无好亦无坏，波澜不惊。当细细品味这份平凡安稳带来的难得福气。'] },
  { fortuneJa: '大器晩成', fortuneEn: 'Late Architectural Rise', fortuneTw: '大器晚成', fortuneCn: '大器晚成', weight: 10, btnJa: '牙を研ぐ', btnEn: 'Sharpen Your Mind', btnTw: '磨礪心志', btnCn: '磨砺心志', commentsJa: ['今はシステムデバッグ中（凶）の如く苦戦するも、これより先、全てのバグは綺麗に解消され、驚くべき大躍進を遂げる運気なり。'], commentsEn: ['Though you struggle now like a system under debugging, all errors will soon clear away, leading to a massive leap forward.'], commentsTw: ['當前雖如系統偵錯（凶）般陷入苦戰，但此後所有阻礙將煙消雲散，迎來驚人的大躍進。'], commentsCn: ['当前虽如系统侦错（凶）般陷入苦战，但此后所有阻碍将烟消云散，迎来惊人的大跃进。'] },
  { fortuneJa: '恐', fortuneEn: 'Perilous Exception', fortuneTw: '恐', fortuneCn: '恐', weight: 20, btnJa: '慎重に進む', btnEn: 'Proceed with Caution', btnTw: '履步涉冰', btnCn: '履步涉冰', commentsJa: ['少し慎重になるべき日。新しいことには手を染めず、いつものルーティンを淡々とこなすのが賢明なり。'], commentsEn: ['A day to tread with caution. Avoid starting new things and stick to your usual routine.'], commentsTw: ['今日行事宜多加謹慎。切勿盲目開展新計畫，安守既有常規方為上策。'], commentsCn: ['今日行事宜多加谨慎。切勿盲目开展新计划，安守既有常规方为上策。'] }
];

// 👾 イースターエッグ用（タイトル10回タップ隠し運勢）
const SECRET_LUCK_RESULT = {
  fortuneJa: '神殺しのデバッグ', fortuneEn: 'God-Mode Debugged', fortuneTw: '弒神級極限偵錯', fortuneCn: '弑神级极限侦错',
  commentJa: '【裏コマンド検知】神の領域にバグを注入し、運命の不合理なソースコードを書き換えた。世界は今、あなたの手で強制リビルドされた。',
  commentEn: '【Cheat Detected】Injected bugs into divine layers, overriding unfair code. The cosmos has been forcefully rebuilt by your bare hands.',
  commentTw: '【偵測到隱藏指令】成功向神明領域寫入異常代碼，徹底改寫命運的荒謬核心。世界此時已由您親手強制重新建構。',
  commentCn: '【侦测到隐藏指令】成功向神明领域写入异常代码，彻底改写命运的荒谬核心。世界此时已由您亲手强制重新建构。',
  colorJa: '超次元マゼンタ', colorEn: 'Hyper Magenta', colorTw: '超次元洋紅', colorCn: '超次元洋红',
  itemJa: 'マスター鍵鍵キー', itemEn: 'Master Access Key', itemTw: '萬能主控密鑰', itemCn: '万能主控密钥'
};

const SPECIAL_LUCK: { [key: string]: { [key: string]: string } } = {
  '11:11': { ja: '星連大吉', en: 'Astro-Aligned Luck', zh_tw: '星連大吉', zh_cn: '星连大吉', commentJa: '【11:11の奇跡】時計の数字が美しく一直線に並ぶ瞬間。全てのノイズが消え去り、願いが最速で宇宙に届く大吉兆なり！', commentEn: '【11:11 Miracle】The numbers line up perfectly. All noise vanishes, and your wishes reach the universe at lightspeed!', commentTw: '【11:11的奇蹟】時鐘數字完美排成一線的神聖瞬間。萬般雜音盡除，心中所願將以最快速度傳遞至宇宙核心！', commentCn: '【11:11的奇迹】时钟数字完美排成一线的神圣瞬间。万般杂音尽除，心中所愿将以最快速度传递至宇宙核心！' }
};

const HOLIDAY_FORTUNES: { [key: string]: { [key: string]: string } } = {
  '1/1': { fortuneJa: '歳旦大吉', fortuneEn: 'New Year Milestone', fortuneTw: '歲旦大吉', fortuneCn: '岁旦大吉', commentJa: '【謹賀新年】新しいログの1行目なり。過去のキャッシュは綺麗さっぱりクリアされ、壮大なる新規セッションがここに開始された！', commentEn: '【Happy New Year】The first row of your new log. All old cache is cleared; a grand new session has initialized!', commentTw: '【恭賀新禧】新日誌的第一行。舊有快取已被悉數清除，一場無比壯麗的新連線已於此刻正式啟動！', commentCn: '【恭贺新禧】新日志的第一行。旧有缓存已被悉数清除，一场无比壮丽的新连线已于此刻正式启动！' }
};

const FORTUNE_ORDER = ['神殺しのデバッグ', '超大吉', '星連大吉', '歳旦大吉', '大吉', '吉', '中吉', '小吉', '末吉', '接続大吉', '通信吉', '再起動', '大吉持', '平', '大器晩成', '恐', 'システム大破'];

// 🗺️ ラッキーアイテム・カラーマップ
const LUCKY_MAPS = {
  ja: {
    colors: ['漆黒', '朱赤', '瑠璃色', '黄金色', '白', '琥珀色'],
    items: ['LANケーブル', '温かい緑茶', 'ハンカチ', '最新のガジェット']
  },
  en: {
    colors: ['Jet Black', 'Vermilion Red', 'Lapis Lazuli', 'Pure Gold', 'Snow White', 'Amber'],
    items: ['Ethernet Cable', 'Warm Matcha Tea', 'Silk Pocket Square', 'Lucky Coin']
  },
  zh_tw: {
    colors: ['漆黑', '朱赤', '瑠璃色', '黃金色', '純白', '琥珀色'],
    items: ['高速網路線', '文山包種茶', '刺繡手帕', '幸運鈦合金幣']
  },
  zh_cn: {
    colors: ['漆黑', '朱赤', '瑠璃色', '黄金色', '纯白', '琥珀色'],
    items: ['六类网线', '热西湖龙井', '随身手帕', '幸运纪念币']
  }
};

const CRYPTO_SALT = 'cyber_shrine_secret_2026_v3';
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
  const [shopCategory, setShopCategory] = useState<CategoryMode>('talisman');
  const [inventoryCategory, setInventoryCategory] = useState<CategoryMode>('talisman');

  // 🕒 リアルタイム時計（神社標準時刻）
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 🎰 授与所のガチャ陳列データ（5個）
  const [displayedShopItems, setDisplayedShopItems] = useState<ShopItem[]>([]);

  // 📝 所持タブで選択中のアイテムID
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<ShopItem | null>(null);

  // 🐣 イースターエッグ用カウンタ
  const [titleTapCount, setTitleTapCount] = useState<number>(0);

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

  // 📈 ウォレットカウントアニメーション
  const [wallet, setWallet] = useState<number>(0);
  const [displayWallet, setDisplayWallet] = useState<number>(0);

  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>('default');

  // 🕒 時計の同期
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🪙 ウォレットのカウントアップ/ダウン演出
  useEffect(() => {
    if (displayWallet === wallet) return;
    const diff = wallet - displayWallet;
    const step = diff > 0 ? Math.ceil(diff / 8) : Math.floor(diff / 8);
    const timeout = setTimeout(() => {
      setDisplayWallet(prev => (Math.abs(diff) <= Math.abs(step) ? wallet : prev + step));
    }, 25);
    return () => clearTimeout(timeout);
  }, [wallet, displayWallet]);

  // 🚀 初回起動・ロード処理
  useEffect(() => {
    const secureState = decodeData(localStorage.getItem('shrine_master_state_secure_v3'));
    let currentWallet = 0;
    let currentOwned: string[] = [];

    if (secureState) {
      if (secureState.history) setHistory(secureState.history);
      if (secureState.lastDates) setLastDates(secureState.lastDates);
      if (secureState.wallet !== undefined) {
        setWallet(secureState.wallet);
        setDisplayWallet(secureState.wallet);
        currentWallet = secureState.wallet;
      }
      if (secureState.ownedItems) {
        setOwnedItems(secureState.ownedItems);
        currentOwned = secureState.ownedItems;
      }
      if (secureState.activeSkin) setActiveSkin(secureState.activeSkin);
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

    // 初期化時は料金消費なしで更新
    const nightActive = (new Date()).getHours() >= 22 || (new Date()).getHours() < 4;
    const pool = SHOP_ITEMS.filter(item => {
      if (item.type !== 'talisman') return false;
      if (item.isNightOnly && !nightActive) return false;
      return true;
    });
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDisplayedShopItems(shuffled.slice(0, 5));
  }, []);

  const saveMasterState = (nextHistory: any, nextDates: any, nextWallet: number, nextOwned: string[], nextSkin: string) => {
    const stateObj = { history: nextHistory, lastDates: nextDates, wallet: nextWallet, ownedItems: nextOwned, activeSkin: nextSkin };
    localStorage.setItem('shrine_master_state_secure_v3', encodeData(stateObj));
  };

  // 🌙 夜間判定 (22:00 〜 04:00)
  const isNightTime = () => {
    const hour = currentTime.getHours();
    return hour >= 22 || hour < 4;
  };

  // 🎰 授与所のランダム5件抽選システム (引数から未使用だった引数を整理してビルドエラーを回避)
  const refreshShopItems = (deductFee = true) => {
    if (deductFee) {
      if (wallet < 10) return;
      const nextWallet = wallet - 10;
      setWallet(nextWallet);
      saveMasterState(history, lastDates, nextWallet, ownedItems, activeSkin);
    }

    const nightActive = isNightTime();
    const pool = SHOP_ITEMS.filter(item => {
      if (item.type !== shopCategory) return false;
      if (item.isNightOnly && !nightActive) return false;
      return true;
    });

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDisplayedShopItems(shuffled.slice(0, 5));
  };

  // カテゴリが変わったら自動で再陳列（無料）
  useEffect(() => {
    refreshShopItems(false);
  }, [shopCategory]);

  // 🐣 イースターエッグのトリガー
  const handleTitleTap = () => {
    if (isRolling) return;
    const nextCount = titleTapCount + 1;
    if (nextCount >= 10) {
      setTitleTapCount(0);
      triggerSecretOmikuji();
    } else {
      setTitleTapCount(nextCount);
    }
  };

  const triggerSecretOmikuji = () => {
    setIsRolling(true); setResult(null);
    const today = new Date();
    setVisitDate(formatInternationalDate(today));

    setTimeout(() => {
      const f = SECRET_LUCK_RESULT;
      const fortune = lang === 'ja' ? f.fortuneJa : lang === 'en' ? f.fortuneEn : lang === 'zh_tw' ? f.fortuneTw : f.fortuneCn;
      const comment = lang === 'ja' ? f.commentJa : lang === 'en' ? f.commentEn : lang === 'zh_tw' ? f.commentTw : f.commentCn;
      const color = lang === 'ja' ? f.colorJa : lang === 'en' ? f.colorEn : lang === 'zh_tw' ? f.colorTw : f.colorCn;
      const item = lang === 'ja' ? f.itemJa : lang === 'en' ? f.itemEn : lang === 'zh_tw' ? f.itemTw : f.itemCn;

      setResult({ fortune, comment, color, item, currentBtn: lang === 'ja' ? '天命を掌握する' : 'Rule Destiny' });
      setIsRolling(false);
      setLastFortune('神殺しのデバッグ');

      const nextWallet = wallet + 500; 
      setWallet(nextWallet);

      const updatedScores = [5, ...recentScores].slice(0, 5);
      setRecentScores(updatedScores);
      localStorage.setItem('shrine_scores', JSON.stringify(updatedScores));

      const newHistory = { ...history, '神殺しのデバッグ': (history['神殺しのデバッグ'] || 0) + 1 };
      const newDates = { ...lastDates, '神殺しのデバッグ': `${today.getMonth() + 1}/${today.getDate()}` };
      setHistory(newHistory); setLastDates(newDates);
      saveMasterState(newHistory, newDates, nextWallet, ownedItems, activeSkin);
    }, 700);
  };

  // ⛩️ 通常のおみくじ処理
  const drawOmikuji = () => {
    setIsRolling(true); setResult(null); setTitleTapCount(0);
    const today = new Date(); const hours = today.getHours(); const minutes = today.getMinutes();
    const month = today.getMonth() + 1; const date = today.getDate();

    setVisitDate(formatInternationalDate(today));

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

      const currentLucks = LUCKY_MAPS[lang] || LUCKY_MAPS.ja;
      const idx = Math.floor(Math.random() * currentLucks.colors.length);
      const color = currentLucks.colors[idx];
      const item = currentLucks.items[Math.floor(Math.random() * currentLucks.items.length)];

      setResult({ fortune, comment, color, item, currentBtn });
      setIsRolling(false); setLastFortune(historyKey);

      let payout = 50; 
      if (historyKey === '超大吉') payout = 1000;
      else if (historyKey === 'システム大破') payout = -Math.floor(wallet / 2);
      else if (historyKey.includes('大吉')) payout = 150 + Math.floor(Math.random() * 50);
      else if (historyKey.includes('中吉') || historyKey === '吉' || historyKey.includes('通信')) payout = 80 + Math.floor(Math.random() * 20);
      else if (historyKey === '再起動' || historyKey === '恐') payout = 10;

      const nextWallet = Math.max(0, wallet + payout);
      setWallet(nextWallet);

      const newScore = historyKey.includes('大吉') ? 5 : historyKey.includes('吉') ? 4 : 3;
      const updatedScores = [newScore, ...recentScores].slice(0, 5);
      setRecentScores(updatedScores);
      localStorage.setItem('shrine_scores', JSON.stringify(updatedScores));

      const newHistory = { ...history, [historyKey]: (history[historyKey] || 0) + 1 };
      const newDates = { ...lastDates, [historyKey]: `${month}/${date}` };
      setHistory(newHistory); setLastDates(newDates);
      saveMasterState(newHistory, newDates, nextWallet, ownedItems, activeSkin);
    }, 600);
  };

  const buyItem = (item: ShopItem) => {
    if (wallet < item.price || ownedItems.includes(item.id)) return;
    const nextWallet = wallet - item.price;
    const nextOwned = [...ownedItems, item.id];
    setWallet(nextWallet); setOwnedItems(nextOwned);
    saveMasterState(history, lastDates, nextWallet, nextOwned, activeSkin);
  };

  const equipSkin = (skinId: string) => {
    setActiveSkin(skinId);
    saveMasterState(history, lastDates, wallet, ownedItems, skinId);
  };

  const handleClear = () => {
    setIsBurning(true);
    setTimeout(() => {
      localStorage.clear();
      setHistory({}); setLastDates({}); setRecentScores([]); setResult(null); setLastFortune(''); setVisitDays(1);
      setWallet(0); setDisplayWallet(0); setOwnedItems([]); setActiveSkin('default');
      setIsBurning(false); setShowModal(false);
      
      // ショップ陳列の強制初期化
      const pool = SHOP_ITEMS.filter(item => item.type === 'talisman' && !item.isNightOnly);
      setDisplayedShopItems(pool.slice(0, 5));
    }, 1800);
  };

  // 🌍 日付フォーマットのローカライズ
  const formatInternationalDate = (dateObj: Date) => {
    if (lang === 'en') {
      return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (lang === 'zh_tw' || lang === 'zh_cn') {
      return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    }
    return `令和八年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  };

  // 🪙 通貨単位のローカライズ
  const getCurrencyUnit = () => {
    if (lang === 'en') return 'Gold';
    if (lang === 'zh_tw' || lang === 'zh_cn') return '文';
    return '両';
  };

  const getBiorhythm = () => {
    if (recentScores.length === 0) return { graph: '●', status: lang === 'ja' ? '未知の運気' : 'Unknown' };
    const symbols = recentScores.map(s => (s >= 5 ? '▲' : s === 4 ? '●' : '▼')).reverse();
    return { graph: symbols.join('━'), status: lang === 'ja' ? '運気同調中' : 'Syncing' };
  };

  const unlockedCount = FORTUNE_ORDER.filter(luck => history[luck] > 0).length;
  const completionRate = Math.round((unlockedCount / FORTUNE_ORDER.length) * 100);

  // 動的スキン背景クラス
  const getBackgroundClass = () => {
    if (activeSkin === 'wallpaper_gold') return 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 text-stone-900';
    if (activeSkin === 'wallpaper_neon') return 'bg-slate-900 text-stone-100 dark-theme';
    if (activeSkin === 'wallpaper_dark') return 'bg-zinc-950 text-zinc-200 dark-theme';
    if (activeSkin === 'wallpaper_washi') return 'bg-stone-200 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] text-stone-900';
    if (activeSkin === 'wallpaper_sakura') return 'bg-gradient-to-tr from-rose-100 via-pink-50 to-rose-200 text-stone-900';
    return 'bg-stone-100 text-stone-900';
  };

  // 🌐 言語・フォントの制御
  const getFontFamilyClass = () => {
    if (lang === 'en') return 'font-serif';
    if (lang === 'zh_tw' || lang === 'zh_cn') return 'font-[\'SimSun\',\'Songti_TC\',serif]';
    return 'font-serif';
  };

  const isDarkSkin = activeSkin === 'wallpaper_neon' || activeSkin === 'wallpaper_dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start pt-4 pb-24 p-4 select-none relative overflow-x-hidden transition-all duration-700 ${getBackgroundClass()} ${getFontFamilyClass()}`}>
      
      <style>{`
        @keyframes burnUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(0.3); opacity: 0; } }
        .particle { position: absolute; background: radial-gradient(#f97316, #ef4444); border-radius: 50%; pointer-events: none; }
        .dark-theme .sticky-bar { background-color: rgba(30, 41, 59, 0.95) !important; border-color: #334155 !important; }
      `}</style>

      {/* 🌐 トップヘッダー領域 */}
      <div className="max-w-md w-full flex flex-col gap-2 z-20 mb-3 px-1 font-sans">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {(['ja', 'en', 'zh_tw', 'zh_cn'] as LangMode[]).map(m => (
              <button key={m} onClick={() => setLang(m)} className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded border shadow-sm transition-all ${lang === m ? 'bg-red-800 text-stone-100 border-red-900 font-bold' : 'bg-stone-200 border-stone-400 text-stone-700 hover:bg-stone-300'}`}>
                {m === 'ja' ? '日本語' : m === 'en' ? 'English' : m === 'zh_tw' ? '繁體' : '简体'}
              </button>
            ))}
          </div>
          {/* 🕒 神社標準時刻 */}
          <div className={`text-[10px] tracking-widest font-mono font-bold px-2 py-0.5 rounded ${isDarkSkin ? 'bg-slate-800 text-cyan-400' : 'bg-stone-200 text-stone-600'}`}>
            ⏰ {currentTime.toLocaleTimeString()}
          </div>
        </div>

        <div className="flex justify-between items-center mt-1">
          <div className="text-[10px] text-stone-400 font-medium">
            {isNightTime() ? '🌙 夜間参拝受付中' : '🔆 昼間参拝受付中'}
          </div>
          {/* 🪙 両ウォレット */}
          <div className="bg-amber-500 text-stone-950 px-2.5 py-1 rounded text-xs font-bold border border-amber-600 shadow-sm flex items-center gap-1 transition-transform active:scale-105">
            🪙 <span className="font-mono text-sm">{displayWallet}</span> <span className="text-[10px] font-serif">{getCurrencyUnit()}</span>
          </div>
        </div>
      </div>

      {/* 🎛️ メイン画面表示エリア */}
      <div className="max-w-md w-full flex-1 flex flex-col justify-center">
        
        {/* TAB 1: おみくじ */}
        {activeTab === 'omikuji' && (
          <div className={`w-full rounded-lg shadow-2xl p-6 sm:p-8 border-4 border-red-700 text-center relative transition-all animate-fade-in ${isDarkSkin ? 'bg-slate-800/90 border-cyan-500' : 'bg-stone-50'}`}>
            <div className={`absolute top-0 left-0 w-full h-3 ${isDarkSkin ? 'bg-cyan-500' : 'bg-red-700'}`}></div>
            {visitDate && <div className="text-[10px] text-stone-500 font-sans tracking-widest absolute top-5 right-6">{visitDate}</div>}

            {/* 🐣 イースターエッグのタップ対象タイトル */}
            <h1 onClick={handleTitleTap} className={`text-4xl font-bold my-4 tracking-widest cursor-pointer select-none active:scale-95 transition-transform ${isDarkSkin ? 'text-cyan-400' : 'text-red-800'}`}>
              {lang === 'ja' ? '御神籤' : lang === 'en' ? 'OMIKUJI' : '電子靈籤'}
            </h1>

            <div className={`min-h-[230px] flex flex-col items-center justify-center rounded border p-5 mb-5 shadow-inner ${isDarkSkin ? 'bg-slate-950 border-slate-700' : 'bg-stone-100 border-stone-300'}`}>
              {isRolling ? (
                <div className={`text-sm font-bold animate-pulse tracking-widest ${isDarkSkin ? 'text-cyan-400' : 'text-red-700'}`}>
                  {lang === 'ja' ? '御神意を伺っております...' : lang === 'en' ? 'Consulting the digital horizon...' : '正在祈求神明降旨...'}
                </div>
              ) : result ? (
                <div className="w-full text-sm animate-fade-in">
                  <div className={`text-2xl sm:text-3xl font-black mb-4 tracking-widest border-b-2 pb-2 inline-block ${isDarkSkin ? 'text-cyan-400 border-cyan-500/20' : 'text-red-700 border-red-700/10'}`}>
                    {result.fortune}
                  </div>
                  <p className={`leading-relaxed text-left px-2 mb-4 text-xs sm:text-sm ${isDarkSkin ? 'text-slate-300' : 'text-stone-700'}`}>
                    {result.comment}
                  </p>
                  <div className={`border-t border-dashed pt-3 text-[11px] sm:text-xs py-2.5 rounded flex flex-col gap-1 px-4 text-left ${isDarkSkin ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-stone-300 bg-stone-50/70 text-stone-600'}`}>
                    <div><span className={`font-bold ${isDarkSkin ? 'text-cyan-400' : 'text-red-700'}`}>{lang === 'ja' ? '吉兆の色：' : lang === 'en' ? 'Lucky Color: ' : '幸運色：'}</span>{result.color}</div>
                    <div><span className={`font-bold ${isDarkSkin ? 'text-cyan-400' : 'text-red-700'}`}>{lang === 'ja' ? '吉兆の物：' : lang === 'en' ? 'Lucky Item: ' : '幸運物：'}</span>{result.item}</div>
                  </div>
                </div>
              ) : (
                <div className="text-stone-400 text-xs tracking-wider">
                  {lang === 'ja' ? '心静かに下の釦をお押しください' : lang === 'en' ? 'Quiet your mind and tap below' : '請淨化心思，點擊下方按鈕'}
                </div>
              )}
            </div>

            <button onClick={drawOmikuji} disabled={isRolling} className={`w-full py-3.5 px-6 text-sm sm:text-base font-bold text-stone-100 rounded shadow-md transition-all active:scale-95 tracking-widest focus:outline-none ${isRolling ? 'bg-stone-400' : isDarkSkin ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-red-800 hover:bg-red-900'}`}>
              {result ? result.currentBtn : (lang === 'ja' ? 'おみくじを引く' : lang === 'en' ? 'Draw Fortune' : '求取靈籤')}
            </button>
          </div>
        )}

        {/* TAB 2: 電脳授与所 */}
        {activeTab === 'shop' && (
          <div className={`w-full rounded-lg shadow-xl p-5 border-2 border-amber-500 animate-fade-in ${isDarkSkin ? 'bg-slate-800/90' : 'bg-stone-50'}`}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="text-lg font-bold text-amber-600 tracking-widest">
                {lang === 'ja' ? '電脳授与所' : lang === 'en' ? 'Cyber Shop' : '電腦授與所'}
              </h2>
              {/* 🔄 陳列更新ボタン */}
              <button onClick={() => refreshShopItems(true)} disabled={wallet < 10} className={`text-[10px] sm:text-[11px] px-2 py-1 rounded font-sans font-bold flex items-center gap-0.5 border ${isDarkSkin ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-950' : 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'} transition-all disabled:opacity-40`}>
                🔄 {lang === 'ja' ? '陳列更新' : 'Refresh'} (10{getCurrencyUnit()})
              </button>
            </div>

            {/* 📌 Sticky カテゴリボタン */}
            <div className={`sticky top-0 z-10 flex gap-2 py-2 mb-3 border-b border-dashed font-sans text-[11px] sm:text-xs sticky-bar ${isDarkSkin ? 'bg-slate-800/95 border-slate-700' : 'bg-stone-50/95 border-stone-200'}`}>
              <button onClick={() => setShopCategory('talisman')} className={`flex-1 py-2 rounded border font-bold transition-all ${shopCategory === 'talisman' ? (isDarkSkin ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-102' : 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm') : (isDarkSkin ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-stone-200/60 border-stone-300 text-stone-600')}`}>
                {lang === 'ja' ? '御守・護符' : 'Sacred Amulets'}
              </button>
              <button onClick={() => setShopCategory('skin')} className={`flex-1 py-2 rounded border font-bold transition-all ${shopCategory === 'skin' ? (isDarkSkin ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-102' : 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm') : (isDarkSkin ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-stone-200/60 border-stone-300 text-stone-600')}`}>
                {lang === 'ja' ? '背景仕様' : 'Backgrounds'}
              </button>
            </div>

            {/* 常に5件のみランダム表示 */}
            <div className="grid grid-cols-1 gap-2 min-h-[240px] content-start">
              {displayedShopItems.map(item => {
                const isOwned = ownedItems.includes(item.id);
                const canBuy = wallet >= item.price;
                return (
                  <button key={item.id} onClick={() => buyItem(item)} disabled={isOwned || !canBuy} className={`p-2.5 sm:p-3 rounded border text-left flex justify-between items-center transition-all ${isOwned ? 'bg-stone-200/50 text-stone-400 border-stone-300 line-through' : canBuy ? (isDarkSkin ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500 hover:bg-slate-900' : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50') : 'bg-stone-100 text-stone-400 border-stone-200 opacity-60'}`}>
                    <div className="font-sans text-[11px] sm:text-xs font-medium pr-2">
                      {lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : item.nameTw}
                      {item.isNightOnly && <span className="ml-1 text-[9px] bg-indigo-900 text-indigo-200 px-1 rounded">🌙 Night</span>}
                    </div>
                    <span className="font-sans text-[11px] sm:text-xs font-bold text-amber-600 shrink-0">
                      {isOwned ? (lang === 'ja' ? '拝受済' : 'Owned') : `🪙 ${item.price}`}
                    </span>
                  </button>
                );
              })}
              {displayedShopItems.length === 0 && (
                <p className="text-xs text-stone-400 italic py-6 text-center">
                  {lang === 'ja' ? '陳列アイテムがありません。更新してください。' : 'No items displayed. Try refreshing.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 所持 */}
        {activeTab === 'inventory' && (
          <div className={`w-full rounded-lg shadow-xl p-5 border-2 border-emerald-600 animate-fade-in ${isDarkSkin ? 'bg-slate-800/90' : 'bg-stone-50'}`}>
            <h2 className="text-xl font-bold text-emerald-700 border-b pb-2 mb-3 tracking-widest">
              {lang === 'ja' ? '神物所持一覧' : lang === 'en' ? 'Inventory' : '所持神物'}
            </h2>

            {/* Sticky カテゴリボタン */}
            <div className={`sticky top-0 z-10 flex gap-2 py-2 mb-3 border-b border-dashed font-sans text-[11px] sm:text-xs sticky-bar ${isDarkSkin ? 'bg-slate-800/95 border-slate-700' : 'bg-stone-50/95 border-stone-200'}`}>
              <button onClick={() => setInventoryCategory('talisman')} className={`flex-1 py-2 rounded border font-bold transition-all ${inventoryCategory === 'talisman' ? (isDarkSkin ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-102' : 'bg-emerald-600 text-stone-100 border-emerald-700 shadow-sm') : (isDarkSkin ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-stone-200/60 border-stone-300 text-stone-600')}`}>
                {lang === 'ja' ? '御守・護符' : 'Sacred Amulets'}
              </button>
              <button onClick={() => setInventoryCategory('skin')} className={`flex-1 py-2 rounded border font-bold transition-all ${inventoryCategory === 'skin' ? (isDarkSkin ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-102' : 'bg-emerald-600 text-stone-100 border-emerald-700 shadow-sm') : (isDarkSkin ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-stone-200/60 border-stone-300 text-stone-600')}`}>
                {lang === 'ja' ? '背景仕様' : 'Backgrounds'}
              </button>
            </div>

            <div className="min-h-[240px]">
              {inventoryCategory === 'talisman' && (
                <div className="grid grid-cols-1 gap-1.5">
                  {SHOP_ITEMS.filter(i => i.type === 'talisman').map(item => {
                    const hasIt = ownedItems.includes(item.id);
                    if (!hasIt) return null;
                    return (
                      <button key={item.id} onClick={() => setSelectedInventoryItem(item)} className={`p-2.5 rounded border text-left text-[11px] sm:text-xs font-sans font-medium transition-transform active:scale-98 flex justify-between items-center ${isDarkSkin ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500' : 'bg-white border-stone-200 hover:bg-emerald-50/30'}`}>
                        <span>{lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : item.nameTw}</span>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded shrink-0">📖 霊視</span>
                      </button>
                    );
                  })}
                  {ownedItems.filter(id => id.startsWith('talisman_')).length === 0 && (
                    <p className="text-xs text-stone-400 italic py-8 text-center">{lang === 'ja' ? '所持している御守はありません' : 'No sacred amulets held'}</p>
                  )}
                </div>
              )}

              {inventoryCategory === 'skin' && (
                <div className="grid grid-cols-1 gap-1.5">
                  <button onClick={() => equipSkin('default')} className={`p-2.5 rounded border text-left text-[11px] sm:text-xs font-sans flex justify-between items-center ${activeSkin === 'default' ? 'border-emerald-600 bg-emerald-50/20 font-bold text-emerald-800' : 'bg-white border-stone-200'}`}>
                    <span>{lang === 'ja' ? '初期仕様（デフォルト）' : 'Default Skin'}</span>
                    {activeSkin === 'default' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  {SHOP_ITEMS.filter(i => i.type === 'skin').map(item => {
                    const hasIt = ownedItems.includes(item.id);
                    const isActive = activeSkin === item.id;
                    if (!hasIt) return null;
                    return (
                      <button key={item.id} onClick={() => equipSkin(item.id)} className={`p-2.5 rounded border text-left text-[11px] sm:text-xs font-sans flex justify-between items-center ${isActive ? 'border-emerald-600 bg-emerald-50/20 font-bold text-emerald-800' : 'bg-white border-stone-200 hover:bg-stone-50'}`}>
                        <span>{lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : item.nameTw}</span>
                        {isActive && <span className="text-emerald-600 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: 御朱印帳 */}
        {activeTab === 'goshuin' && (
          <div className={`w-full rounded-lg shadow-xl p-6 border-2 border-stone-300 animate-fade-in ${isDarkSkin ? 'bg-slate-800/90' : 'bg-stone-50'}`}>
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
                      <span key={luckKey} className={`border rounded px-2.5 py-1 shadow-sm font-sans text-[11px] sm:text-xs ${isDarkSkin ? 'bg-slate-900 text-cyan-400 border-cyan-500/30' : 'bg-red-50/60 text-red-800 border-red-200/60'}`}>
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

      {/* 📱 底面マルチタブバー */}
      <div className={`fixed bottom-0 left-0 right-0 border-t z-30 shadow-lg flex justify-around p-2 ${isDarkSkin ? 'bg-slate-950 border-slate-800' : 'bg-white border-stone-200'}`}>
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

      {/* 📖 所持アイテム詳細解説ポップアップ */}
      {selectedInventoryItem && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-stone-50 border-4 border-emerald-700 max-w-sm w-full rounded-lg p-5 shadow-2xl text-stone-900">
            <h4 className="text-sm font-bold text-emerald-800 border-b pb-1 mb-2">
              {lang === 'ja' ? '【神物霊視】' : '【Sacred Vision】'}
            </h4>
            <p className="text-base font-bold mb-3">
              {lang === 'ja' ? selectedInventoryItem.nameJa : lang === 'en' ? selectedInventoryItem.nameEn : selectedInventoryItem.nameTw}
            </p>
            <div className="bg-stone-100 p-3 rounded border border-stone-200 text-xs sm:text-sm leading-relaxed mb-4 text-stone-700 font-sans">
              {lang === 'ja' ? selectedInventoryItem.descJa : lang === 'en' ? selectedInventoryItem.descEn : lang === 'zh_tw' ? selectedInventoryItem.descTw : selectedInventoryItem.descCn}
            </div>
            <button onClick={() => setSelectedInventoryItem(null)} className="w-full bg-emerald-700 text-stone-100 text-xs font-sans font-bold py-2 rounded hover:bg-emerald-800 transition-colors">
              {lang === 'ja' ? '霊視を終了する' : 'Close Vision'}
            </button>
          </div>
        </div>
      )}

      {/* 🏮 お焚き上げモーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 border-2 border-red-800 max-w-xs w-full rounded p-6 shadow-2xl text-center text-stone-900">
            <h4 className="text-base font-bold text-red-800 mb-2">{lang === 'ja' ? '御神籤お焚き上げ' : 'Sacred Disposal'}</h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-5 font-sans">
              {lang === 'ja' ? 'これまでの参拝履歴、所持金、ならびに購入したお守りをすべて消去します。よろしいですか？' : 'This will securely clear all your logs, wallets and items. Proceed?'}
            </p>
            <div className="flex gap-3 justify-center text-xs font-sans">
              <button onClick={handleClear} disabled={isBurning} className="bg-red-800 text-stone-100 font-bold px-4 py-2 rounded hover:bg-red-900 transition-colors">
                {isBurning ? '昇華中...' : (lang === 'ja' ? 'お焚き上げする' : 'Disposal')}
              </button>
              <button onClick={() => setShowModal(false)} disabled={isBurning} className="bg-stone-200 text-stone-700 font-bold px-4 py-2 rounded hover:bg-stone-300">
                {lang === 'ja' ? '取りやめる' : lang === 'en' ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}