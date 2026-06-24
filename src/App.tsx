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
  availableMonths?: number[]; // 📅 季節限定フラグ（例: [4] なら4月のみ出現）
};

// ⛩️ 御守・護符・背景ラインナップ（季節限定を追加した全62種）
const SHOP_ITEMS: ShopItem[] = [
  // --- 既存御守 (5種) ---
  { id: 'talisman_bug', nameJa: '無病息災・バグ退散札', nameEn: 'Anti-Bug Talisman', nameTw: '驅逐程式錯誤符', nameCn: '驱逐程序错误符', descJa: 'コードの不純物を根こそぎクリアにし、予期せぬ例外をシャットアウトする。', descEn: 'Clears impurities in code and completely blocks unexpected exceptions.', descTw: '將程式碼中的雜質悉數清除，完全杜絕意料之外的異常。', descCn: '将代码中的杂质悉数清除，完全杜绝意料之外的异常。', price: 150, type: 'talisman' },
  { id: 'talisman_match', nameJa: '良縁成就・同期安定守', nameEn: 'Sync Harmony Amulet', nameTw: '同步安定緣結守', nameCn: '同步安定缘结守', descJa: '非同期処理の競合を未然に防ぎ、あらゆる関係性を美しく同期させる。', descEn: 'Prevents race conditions and beautifully synchronizes all relations.', descTw: '未雨綢繆防止非同步處理衝突，使一切因緣關係皆能完美同步。', descCn: '未雨绸缪防止异步处理冲突，使一切因缘关系皆能完美同步。', price: 200, type: 'talisman' },
  { id: 'talisman_spec', nameJa: '急な仕様変更魔除守', nameEn: 'Spec-Change Ward', nameTw: '規格變更魔除守', nameCn: '规格变更魔除守', descJa: '深夜に舞い込む恐ろしい要件定義の書き換えを、見えざる壁で弾き返す。', descEn: 'Repels horrifying late-night requirement changes with an invisible shield.', descTw: '以無形之盾強硬彈回深夜傳來、令人毛骨悚然的規格變更。', descCn: '以无形之盾强硬弹回深夜传来、令人毛骨悚然的规格变更。', price: 300, type: 'talisman' },
  { id: 'talisman_overtime', nameJa: '定時退社・健康祈願符', nameEn: 'Leave-on-Time Rune', nameTw: '準時下班祈願符', nameCn: '准时下班祈愿符', descJa: '定時が近づくと強制的に作業終了へと導く、労働環境の守護ルーン。', descEn: 'A protective rune that guides you to a clean wrap-up when clock-out time nears.', descTw: '每逢下班時間便強制導向收尾階段，捍衛勞動環境的守護符文。', descCn: '每逢下班时间便强制导向收尾阶段，捍卫劳动环境守护符文。', price: 350, type: 'talisman' },
  { id: 'talisman_infra', nameJa: '高可用性・インフラ安定護符', nameEn: 'Infra Stability Charm', nameTw: '雲端架構安定符', nameCn: '云端架构安定符', descJa: 'クラウドサーバーの負荷を分散し、99.999%の稼働率を約束する最上位の護符。', descEn: 'Distributes cloud server load, guaranteeing 99.999% uptime.', descTw: '分散雲端伺服器負載，確保高達99.999%系統可用性的至高護符。', descCn: '分散云端服务器负载，确保高达99.999%系统可用性的至高护符。', price: 500, type: 'talisman' },

  // --- 📅 季節限定・期間限定の御守 (2種追加) ---
  { id: 'talisman_season_spring', nameJa: '【4月限定】新卒研修生存御守', nameEn: '【April Only】Newbie Survival Ribbon', nameTw: '【4月限定】新卒研修生存御守', nameCn: '【4月限定】新卒研修生存御守', descJa: '環境構築の迷宮や未知の専門用語の嵐を切り抜け、無事に現場（配属先）に生還する力を与える。', descEn: 'Helps navigate the maze of environment setup and terminology to survive training.', descTw: '安然渡過環境建置迷宮與未知術語風暴，賜予順利分發分局生還的神祕力量。', descCn: '安然渡过环境建置迷宫与未知术语风暴，赐予顺利分发分局生还的神秘力量。', price: 240, type: 'talisman', availableMonths: [4] },
  { id: 'talisman_season_winter', nameJa: '【12月限定】年末リリース無事通過祈願札', nameEn: '【December Only】Year-End Release Peace Stamp', nameTw: '【12月限定】年末釋出無事通過祈願札', nameCn: '【12月限定】年末释放无事通过祈愿札', descJa: '御用納め直前のデスマーチ及び恐怖の本番デプロイを奇跡的に無風で通過させるお守り。', descEn: 'Miraculously secures a calm end-of-year live deploy right before the winter holidays.', descTw: '在工作結束前的死線狂奔及恐怖正式上線中，創造奇蹟般平靜通過的無風守護。', descCn: '在工作结束前的死线狂奔及恐怖正式上线中，创造奇迹般平静通过的无风守护。', price: 490, type: 'talisman', availableMonths: [12] },

  // --- 🪙 1両で買えるお遊びアイテム (3種) ---
  { id: 'talisman_cheap_1', nameJa: '埃をかぶった記憶媒体', nameEn: 'Dusty Storage Medium', nameTw: '落滿灰塵的儲存媒介', nameCn: '落满灰尘的储存媒介', descJa: '不思議な力を感じる。中には大昔の怪文書のようなログが一行だけ刻まれている。', descEn: 'You feel a mysterious force. Inside, a single row of ancient bizarre text remains.', descTw: '散發著神祕的力量。內部僅刻有一行宛如遠古怪文書的日誌。', descCn: '散发着神秘的力量。内部仅刻有一行宛如远古怪文书的日志。', price: 1, type: 'talisman' },
  { id: 'talisman_cheap_2', nameJa: 'ちぎれた錫線', nameEn: 'Torn Solder Wire', nameTw: '斷裂的錫線', nameCn: '断裂的锡线', descJa: 'ただのゴミに見えるが、時折かすかに16進数の電磁波を放っているような気がする。', descEn: 'Looks like trash, but it seems to emit faint hexadecimal electromagnetic waves.', descTw: '看似只是廢棄物，但總覺得偶爾會釋放出微弱的十六進位電磁波。', descCn: '看似只是废弃物，总觉得偶尔会释放出微弱的十六进制电磁波。', price: 1, type: 'talisman' },
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
  { id: 'talisman_gen_17', nameJa: 'ダークモード調和の眼帯', nameEn: 'Darkmode Harmony Eyepatch', nameTw: '深色模式調和眼罩', nameCn: '深色模式调和眼罩', descJa: '過酷なブルーライトの光芒から、あなたの網膜と精神 of 平穏を守る。', descEn: 'Shields your retina and inner peace from harsh blue light emissions.', descTw: '從殘酷的藍光光芒中，守護您的視網膜與精神防線。', descCn: '从残酷的蓝光光芒中，守护您的视网膜与精神防线。', price: 190, type: 'talisman' },
  { id: 'talisman_gen_18', nameJa: 'レスポンシブ自在の折り紙', nameEn: 'Fluid Responsive Origami', nameTw: '響應式變幻自在折紙', nameCn: '响应式变幻自在折纸', descJa: 'どんな狭い世界（画面幅）に押し込められても、美しく形を変えて適応する。', descEn: 'Beautifully adapts and shapes itself to any cramped viewport.', descTw: '不論被塞進多麼狹窄的世界（螢幕寬度），皆能優美變形完美適應。', descCn: '不论被塞进多么狭窄的世界（屏幕宽度），皆能优美变形完美适应。', price: 210, type: 'talisman' },
  { id: 'talisman_gen_19', nameJa: 'CSSレガシー打破の熊手', nameEn: 'Legacy CSS Breaker', nameTw: 'CSS舊代遺產打破熊手', nameCn: 'CSS旧代遗产打破熊手', descJa: '太古のブラウザ仕様による表示崩れを、力強くかき集めて成敗する。', descEn: 'Aggressively sweeps away layout breakages caused by ancient browsers.', descTw: '強力掃除並懲治因太古瀏覽器規格所導致的排版崩壞。', descCn: '强力清除并惩治因太古浏览器规格所导致的排版崩坏。', price: 240, type: 'talisman' },
  { id: 'talisman_gen_20', nameJa: 'アセット圧縮・軽量化の瓢箪', nameEn: 'Asset Compression Gourd', nameTw: '資產壓縮・輕量化葫蘆', nameCn: '资产压缩・轻量化葫芦', descJa: '肥大化したカルマ（ファイルサイズ）を吸い込み、限界まで凝縮して軽快にする。', descEn: 'Sucks in bloated karma file sizes, compressing them to lightweight forms.', descTw: '吸入肥大化的因果業報（檔案體積），極限凝聚使其重獲輕盈。', descCn: '吸入肥大化的因果业报（文件体积），极限凝聚使其重获轻盈。', price: 170, type: 'talisman' },
  { id: 'talisman_gen_21', nameJa: '進捗百発百中勾玉', nameEn: '100% Progress Magatama', nameTw: '進度百發百中勾玉', nameCn: '进度百发百中勾玉', descJa: '予定通りのマイルストーンを刻み、遅延の悪霊を徹底的に寄せ付けない。', descEn: 'Marks milestones as scheduled, permanently dynamic against delay specters.', descTw: '精準刻劃如期規劃的里程碑，澈底杜絕拖延惡靈近身。', descCn: '精准刻划如期规划 the 里程碑，澈底杜绝拖延恶灵近身。', price: 400, type: 'talisman' },
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
  { id: 'talisman_gen_32', nameJa: '環境変数秘匿のお守り', nameEn: 'Env Secret Keeper', nameTw: '環境變數秘匿御守', nameCn: '环境变量秘匿御守', descJa: '漏洩してはならない鍵（パスワード）を、胸の奥深くに隠して守る。', descEn: 'Hides critical passwords deep in its chest, preventing credential leaks.', descTw: '將端不可外洩的金鑰（密碼）深藏於胸中內核，嚴加防護。', descCn: '将绝不可外泄的金钥（密码）深藏于胸中内核，严加防护。', price: 350, type: 'talisman' },
  { id: 'talisman_gen_33', nameJa: 'スクレイピング円滑化の潤滑油', nameEn: 'Smooth Scraping Oil', nameTw: '網頁爬蟲圓滑潤滑油', nameCn: '网页爬虫圆滑润滑油', descJa: 'ブロックされることなく、情報の海から必要な真実だけをスムーズに掬い取る。', descEn: 'Smoothly scoops facts from information seas without triggering blocks.', descTw: '在免於被封鎖的前提下，從資訊汪洋中流暢撈取所需的真相。', descCn: '在免于被封锁的前提下，从资讯汪洋中流畅捞取所需的真相。', price: 180, type: 'talisman' },
  { id: 'talisman_gen_34', nameJa: 'Webhook即時着荷の飛脚鳥', nameEn: 'Webhook Instant Bird', nameTw: 'Webhook即時著陸飛腳鳥', nameCn: 'Webhook即时着陆飞脚鸟', descJa: 'イベントの発生を1ミリ秒の遅れもなく、目的の場所へと届ける伝書鳥。', descEn: 'An event messenger bird that delivers updates with zero milliseconds delay.', descTw: '不帶一毫秒延遲、將事件發生動態精準送達目的地的傳書飛鳥。', descCn: '不带一毫秒延迟、将事件发生动态精准送达目的地的传书飞鸟。', price: 260, type: 'talisman' },
  { id: 'talisman_gen_35', nameJa: '依存パッケージ安定の楔', nameEn: 'Dependency Lock Wedge', nameTw: '依賴套件安定之楔', nameCn: '依赖套件安定之楔', descJa: '他人の作った土台（ライブラリ）の突然の破壊的変更から、我が身を固定して守る。', descEn: 'Locks your feet to guard against sudden breaks in third-party libraries.', descTw: '當他人構建的基石（函式庫）發生突發性破壞變更時，牢牢固定自我免受衝擊。', descCn: '当他人构建的基石（函数库）发生突发性破坏变更时，牢牢固定自我免受冲击。', price: 300, type: 'talisman' },
  { id: 'talisman_gen_36', nameJa: 'セッションハイジャック撃退の鉄扇', nameEn: 'Anti-Hijack Iron Fan', nameTw: '對話劫持擊退鐵扇', nameCn: '对话劫持击退铁扇', descJa: '背後から忍び寄るアイデンティティの盗賊を、強烈な一風で吹き飛ばす。', descEn: 'Blows away sneaky identity thieves approaching from behind with one gust.', descTw: '強烈一揮，將悄悄尾隨於身後的身份盜賊無情吹飛。', descCn: '强烈一挥，将悄悄尾随于身后的身份盗贼无情吹飞。', price: 410, type: 'talisman' },
  { id: 'talisman_gen_37', nameJa: 'ダークウェブ流入防御の結界', nameEn: 'Darkweb Border Barrier', nameTw: '暗網流入防禦結界', nameCn: '暗网流入防御结界', descJa: '悪意に満ちた闇の世界から差し込まれる触手を、光の壁で遮断する。', descEn: 'Blocks malicious tentacles reaching out from deep internet underworlds.', descTw: '以光之壁障徹底阻絕自充滿惡意的暗黑世界延伸而來的觸手。', descCn: '以光之壁障彻底阻绝自充满恶意的暗黑世界延伸而来的触手。', price: 470, type: 'talisman' },
  { id: 'talisman_gen_38', nameJa: '正規表現一発的中の一線', nameEn: 'Regex Perfect Match Line', nameTw: '正規表示式一擊命中線', nameCn: '正则表达式一击命中线', descJa: 'どれだけ複雑に入り組んだ文字列の迷宮からも、意図した獲物を一瞬で見つけ出す。', descEn: 'Finds target text in complex string string-mazes instantly.', descTw: '不論多麼複雜交錯的字串迷宮，皆能在一瞬間精確揪出目標獵物。', descCn: '不论多么复杂交错的字符串迷宫，皆能在一瞬间精确揪出目标猎物。', price: 200, type: 'talisman' },
  { id: 'talisman_gen_39', nameJa: 'ローカルホスト繁盛の盛り塩', nameEn: 'Localhost Prosperity Salt', nameTw: '本地主機繁榮盛り塩', nameCn: '本地主机繁荣盛り盐', descJa: '自分の開発領域（127.0.0.1）を清め、最高のひらめきをもたらす聖なる塩。', descEn: 'Purifies your dev space (127.0.0.1), bringing supreme inspirations.', descTw: '淨化屬於自己的開發聖域（127.0.0.1），招來絕佳靈感的純潔之鹽。', descCn: '净化属于自己的开发圣域（127.0.0.1），招来绝佳灵感的纯洁之盐。', price: 110, type: 'talisman' },
  { id: 'talisman_gen_40', nameJa: '本番デプロイ無風祈願のお守り', nameEn: 'Safe Deploy Charm', nameTw: '正式上線無風祈願御守', nameCn: '正式上线无风祈愿御守', descJa: '世界を書き換える瞬間（デプロイ）に、波風一つ立てず静かに調和をもたらす。', descEn: 'Brings silent harmony when updating the world during live deploys.', descTw: '在改寫世界（部署上線）的神聖瞬間，祈求風平浪靜、悄然融入的和諧。', descCn: '在改写世界（部署上线）的神圣瞬间，祈求风平静、悄然融入和谐。', price: 500, type: 'talisman' },
  { id: 'talisman_gen_41', nameJa: '神隠しパケット回収の網', nameEn: 'Lost Packet Fishing Net', nameTw: '神隱封包回收漁網', nameCn: '神隐封包回收渔网', descJa: '回線の狭間で神隠しに遭った迷子のパケットたちを漏らさず救い出す。', descEn: 'Rescues orphan packets that went missing in network rifts.', descTw: '將在網路裂縫間遭遇神隱、流離失所的迷途封包悉數搜救歸隊。', descCn: '将在网络裂缝间遭遇神隐、流离失所的迷途封包悉数搜救归队。', price: 230, type: 'talisman' },
  { id: 'talisman_gen_42', nameJa: 'AIプロンプト意思疎通のパイプ', nameEn: 'Prompt Telepathy Pipe', nameTw: 'AI提示詞心靈感應菸斗', nameCn: 'AI提示词心灵感应烟斗', descJa: '人工知能との魂のシンクロ率を高め、一言で完璧な成果物を出力させる。', descEn: 'Boosts soul sync with AI, achieving absolute output with one phrase.', descTw: '提升與人工智慧的心靈契合度，僅憑隻言片語便能使其產出完美成品。', descCn: '提升与人工智能的心灵契合度，仅凭只言片语便能使其产出完美成品。', price: 330, type: 'talisman' },

  // --- 背景仕様スキン (5種) ---
  { id: 'skin_default', nameJa: '通常仕様（漆黒の闇）', nameEn: 'Default (Pitch Black)', nameTw: '通常款式（漆黑之闇）', nameCn: '通常款式（漆黑之暗）', descJa: 'デフォルト。深淵なる電子の夜空。何の色にも染まらない静寂の黒。', descEn: 'The default state. An abyssal cyber sky wrapped in absolute serene black.', descTw: '預設款式。深邃的電子夜空，不著痕跡的寂靜之黑。', descCn: '默认款式。深邃的电子夜空，不着痕迹的寂静之黑。', price: 100, type: 'skin' },
  { id: 'skin_neon', nameJa: '背景：電脳ネオン鳥居', nameEn: 'Skin: Cyber Neon Torii', nameTw: '背景：電腦霓虹鳥居', nameCn: '背景：电脑霓虹鸟居', descJa: 'サイバーパンクの神髄。極彩色のネオンが優しくまたたき、結界を妖しく彩る。', descEn: 'Cyberpunk essence. Multi-colored neon gently pulses, framing a mysterious barrier.', descTw: '賽博龐克的精髓。五彩斑斕的霓虹溫柔閃爍，將結界染上妖異迷人的色彩。', descCn: '赛博朋克的精髓。五彩斑斓的霓虹温柔闪烁，将结界染上妖异迷人的色彩。', price: 250, type: 'skin' },
  { id: 'skin_matrix', nameJa: '背景：電子コードの雨', nameEn: 'Skin: Digital Code Rain', nameTw: '背景：電子代碼瀑布', nameCn: '背景：电子代码瀑布', descJa: '上空から果てしなく降り注ぐ緑の16進数パケット。ハッカーの精神安寧。', descEn: 'Endless streams of cascading green hex packets. True tranquility for a hacker.', descTw: '從天而降、綿延不絕的綠色十六進位代碼封包。駭客的心靈綠洲。', descCn: '从天而降、绵延不绝的绿色十六进制代码封包。客的心灵绿洲。', price: 300, type: 'skin' },
  { id: 'skin_sakura', nameJa: '背景：桜満開・電脳春嵐', nameEn: 'Skin: Cherry Blossom Storm', nameTw: '背景：櫻花滿開・電腦春嵐', nameCn: '背景：樱花满开・电脑春岚', descJa: '和風サイバーの新境地。画面の奥底で淡いピンクのデジタル桜吹雪が美しく舞い落ちる。', descEn: 'Neo-traditional fusion. Pale pink digital petals cascade elegantly through the depths.', descTw: '和風賽博新境界。粉嫩的數位櫻花雨在畫面深處優雅飛舞飄落。', descCn: '和风赛博新境界。粉嫩的数码樱花雨在画面深处优雅飞舞飘落。', price: 400, type: 'skin' },
  { id: 'skin_gold', nameJa: '背景：黄金郷・成金仕様', nameEn: 'Skin: El Dorado Luxury', nameTw: '背景：黃金鄉・暴發戶款式', nameCn: '背景：黄金乡・暴发户款式', descJa: '拝金主義の極み。眩いゴールドのグリッド線が脈動し、圧倒的な富のオーラを放つ。', descEn: 'The peak of luxury. Blinding gold grids pulse, projecting massive wealth energy.', descTw: '拜金主義的極致。炫目的金色網格脈動閃耀，釋放出壓倒性的財富氣場。', descCn: '拜金主义的极致。炫目的金色网格脉动闪耀，释放出压倒性的财富气场。', price: 888, type: 'skin' }
];

// 📜 おみくじの基本結果データ
type OmikujiResult = {
  fortune: string;
  detail: string;
  luckyItem: string;
  luckyLang: string;
  points: string;
  change: number;
  type: 'plus' | 'minus' | 'jackpot' | 'hacker_curse';
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
    { fortune: '小吉', detail: '略有进步。困扰数小时的异常突然发现只是打错字（Typo），修正后迎刃而解、通体舒畅。', luckyItem: '抗蓝光眼镜', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
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
  const [logs, setLogs] = useState<{ id: string; date: string; fortune: string; langMode: LangMode }[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>('skin_default');

  // ⭐️ 新規追加State群
  const [equippedIds, setEquippedIds] = useState<string[]>([]); // 最大3つのアクティブ装備ID
  const [searchQuery, setSearchQuery] = useState<string>(''); // インベントリ検索窓
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date'); // インベントリソート順
  const [isHackerCursed, setIsHackerCursed] = useState<boolean>(false); // F12検知フラグ
  const [jackpotMessage, setJackpotMessage] = useState<string>(''); // 一攫千金/大破通知
  const [randomBiorhythm, setRandomBiorhythm] = useState<number[]>([50, 50, 50, 50, 50]); // 5日分の運気数値

  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [activeInfoItem, setActiveInfoItem] = useState<ShopItem | null>(null);

  // ⏰ 時間監視＆夜間判定
  useEffect(() => {
    const checkTime = () => {
      const hours = new Date().getHours();
      setIsNight(hours >= 18 || hours < 6);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // 📊 運気バイオリズムのモック生成
  useEffect(() => {
    const generateBiorhythm = () => {
      const vals = Array.from({ length: 5 }, () => Math.floor(Math.random() * 85) + 15);
      setRandomBiorhythm(vals);
    };
    generateBiorhythm();
  }, [result]);

  // 🛡️ 開発者ツール（F12）検知イースターエッグ
  useEffect(() => {
    const triggerHackerCurse = () => {
      if (!isHackerCursed) {
        setIsHackerCursed(true);
        setResult({
          fortune: 'ハッカー大凶',
          detail: '【電脳結界警報】不正なデバッグ用パケット（F12/Ctrl+Shift+I）の展開を検知！電脳神罰が下り、全パケットの暗号整合性が強制破棄されました。',
          luckyItem: 'Wi-Fiルーターのコンセントを抜くこと',
          luckyLang: 'Assembly',
          points: '▼━▼━▼',
          change: -50,
          type: 'hacker_curse'
        });
        setWallet(prev => Math.max(0, prev - 50));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
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
  }, [isHackerCursed]);

  // 🕋 ローカルストレージ連動
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

  // 🥠 おみくじを引く
  const handleOmikuji = () => {
    if (isRolling) return;
    setIsRolling(true);
    setJackpotMessage('');
    setIsHackerCursed(false);

    setTimeout(() => {
      const pool = OMIKUJI_POOL[lang] || OMIKUJI_POOL['ja'];
      const idx = Math.floor(Math.random() * pool.length);
      let baseResult = { ...pool[idx] };

      // 🎒 装備バフの適用ロジック
      let walletModifier = baseResult.change;
      if (baseResult.type === 'plus') {
        // 装備アイテム1つにつきボーナス+10両
        walletModifier += (equippedIds.length * 10);
      } else if (baseResult.type === 'minus') {
        // 装備アイテムがある場合、マイナス損失を20%軽減
        if (equippedIds.length > 0) {
          walletModifier = Math.floor(walletModifier * 0.8);
        }
      }

      // 🪙 ウォレットの一攫千金（超低確率サプライズイベント）判定
      const rollEvent = Math.random();
      if (rollEvent < 0.007) { // 0.7%の確率で分散型埋蔵金発掘 (一攫千金)
        const jackpot = 1500 + Math.floor(Math.random() * 3500);
        walletModifier += jackpot;
        baseResult.fortune = lang === 'ja' ? '【電脳奇跡】超一攫千金' : '【Cyber Miracle】Jackpot';
        setJackpotMessage(lang === 'ja' ? `✨ 【分散型埋蔵金を発掘】暗号化された太古の金庫が解凍され、口座に ${jackpot}両 が直接着金しました！` : `✨ [Decentralized Treasure Found] ${jackpot} ryo has been transferred!`);
        baseResult.type = 'jackpot';
      } else if (rollEvent > 0.992) { // 0.8%の確率でシステム大破（ロストイベント）
        const loss = Math.floor(wallet * 0.35); // 所持金の35%を消失
        walletModifier = -loss;
        baseResult.fortune = lang === 'ja' ? '【警告】システム大破' : '【Warning】System Crash';
        setJackpotMessage(lang === 'ja' ? `🚨 【クリティカルエラー】大規模なバグの連鎖共振により、ウォレットから ${loss}両 が電子の藻屑に消えました...` : `🚨 [Critical Breakdown] Cascade error wiped out ${loss} ryo...`);
        baseResult.type = 'minus';
      }

      const nextWallet = Math.max(0, wallet + walletModifier);
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleTimeString(),
        fortune: baseResult.fortune,
        langMode: lang
      };

      const nextLogs = [newLog, ...logs].slice(0, 20);

      setWallet(nextWallet);
      setResult(baseResult);
      setLogs(nextLogs);
      setIsRolling(false);

      saveToStorage(nextWallet, inventory, nextLogs, activeSkin, equippedIds);
    }, 900);
  };

  // 🛍️ アイテム購入
  const handleBuy = (item: ShopItem) => {
    if (wallet < item.price) {
      alert(lang === 'ja' ? 'ウォレットの「両」が不足しています。' : 'Insufficient ryo in wallet.');
      return;
    }
    if (inventory.some(i => i.id === item.id)) {
      alert(lang === 'ja' ? '既に拝受（所持）しています。' : 'You already own this item.');
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

  // 🎒 御守の装備・解除切り替え
  const toggleEquip = (id: string) => {
    let nextEquips = [...equippedIds];
    if (nextEquips.includes(id)) {
      nextEquips = nextEquips.filter(eId => eId !== id);
    } else {
      if (nextEquips.length >= 3) {
        alert(lang === 'ja' ? '同時にアクティブにできる御守は最大3つまでです。' : 'Max 3 amulets can be active simultaneously.');
        return;
      }
      nextEquips.push(id);
    }
    setEquippedIds(nextEquips);
    saveToStorage(wallet, inventory, logs, activeSkin, nextEquips);
  };

  // 🏮 お焚き上げ実行
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
      setJackpotMessage('');
      setIsHackerCursed(false);
      setIsBurning(false);
      setShowModal(false);
    }, 1500);
  };

  // 📅 現在の月を取得してショップをフィルタリング（季節限定の制御用）
  const currentMonth = new Date().getMonth() + 1;
  const filteredShopItems = SHOP_ITEMS.filter(item => {
    if (item.isNightOnly && !isNight) return false;
    if (item.availableMonths && !item.availableMonths.includes(currentMonth)) return false;
    return true;
  });

  // 🔍 インベントリの検索＆ソート適用
  const processedInventory = inventory
    .filter(item => {
      const name = lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : lang === 'zh_tw' ? item.nameTw : item.nameCn;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.nameJa.localeCompare(b.nameJa);
      }
      if (sortBy === 'price') {
        return b.price - a.price; // 高い順
      }
      return 0; // 'date' はデフォルトのインデックス配列順
    });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-serif relative overflow-hidden flex flex-col items-center justify-start p-3 sm:p-6 antialiased selection:bg-red-800 selection:text-white">
      
      {/* 🔮 背景レイヤー（スキン＆アニメーション対応） */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {activeSkin === 'skin_default' && (
          <div className="absolute inset-0 bg-radial-[at_center_center] from-stone-900 via-stone-950 to-black opacity-90" />
        )}

        {/* ⛩️ 電脳ネオン鳥居スキン（脈動アニメーション） */}
        {activeSkin === 'skin_neon' && (
          <div className="absolute inset-0 bg-stone-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1224_1px,transparent_1px),linear-gradient(to_bottom,#1f1224_1px,transparent_1px)] bg-[size:30px_30px] opacity-40" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-64 border-t-8 border-x-4 border-pink-500 rounded-t-sm shadow-[0_0_30px_#ff007f] opacity-80 animate-pulse" style={{ animationDuration: '3s' }}>
              <div className="w-full h-8 border-b-4 border-pink-500 mt-8 shadow-[0_0_15px_#ff007f]" />
              <div className="w-12 h-24 bg-pink-500/20 border border-pink-500 mx-auto mt-2 flex items-center justify-center text-pink-400 font-sans font-bold text-xs shadow-[0_0_10px_#ff007f]">⛩️</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent" />
          </div>
        )}

        {/* 🟢 電子コードの雨スキン */}
        {activeSkin === 'skin_matrix' && (
          <div className="absolute inset-0 bg-stone-950 opacity-90 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,30,0,0.1)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px]" />
            <div className="text-emerald-500/15 font-sans text-[10px] whitespace-pre-wrap leading-none p-4 break-all animate-pulse">
              {Array.from({ length: 25 }).map(() => Math.random().toString(16).toUpperCase() + " ").join(new Date().toISOString())}
              {Array.from({ length: 40 }).map(() => " 01 4F DE 20 FF BC 8A 90 23 CC CC ").join("\n")}
            </div>
          </div>
        )}

        {/* 🌸 桜満開・電脳春嵐（パーティクル流下アニメーション） */}
        {activeSkin === 'skin_sakura' && (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-rose-950/10 to-stone-950">
            <div className="absolute inset-0 overflow-hidden">
              {/* 桜のプチパーティクル群をCSSアニメーションでシミュレート */}
              <div className="absolute top-[-10%] left-[15%] w-3 h-3 bg-rose-300 rounded-full blur-xs opacity-60 animate-bounce" style={{ animationDuration: '6s', transform: 'scale(0.8)' }} />
              <div className="absolute top-[-5%] left-[45%] w-2 h-4 bg-rose-400 rounded-lg opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute top-[-12%] left-[75%] w-4 h-3 bg-pink-300 rounded-full opacity-50 animate-bounce" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-rose-300 rounded-full opacity-40 animate-pulse" style={{ animationDuration: '7s' }} />
              <div className="absolute top-[60%] left-[80%] w-2 h-3 bg-pink-200 rounded-sm opacity-50 animate-bounce" style={{ animationDuration: '4s' }} />
            </div>
            <div className="absolute bottom-4 left-4 text-xs text-rose-300/20 font-sans">🌸 SAKURA_BURST_ACTIVE</div>
          </div>
        )}

        {/* 🪙 黄金郷スキン */}
        {activeSkin === 'skin_gold' && (
          <div className="absolute inset-0 bg-stone-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3a3012_1px,transparent_1px),linear-gradient(to_bottom,#3a3012_1px,transparent_1px)] bg-[size:40px_40px] opacity-60" />
            <div className="absolute inset-0 bg-radial-[at_top_right] from-amber-500/10 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-900/10" />
          </div>
        )}
      </div>

      {/* ⛩️ 全体コンテナ */}
      <div className="w-full max-w-xl bg-stone-900/90 border-2 border-stone-800 rounded shadow-2xl p-4 sm:p-5 z-10 backdrop-blur-md relative">
        
        {/* 🏮 ヘッダー構造 */}
        <div className="border-b border-stone-800 pb-3 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-red-700 flex items-center gap-2">
              <span>⛩️</span> 電脳授与御神籤 <span className="text-[10px] font-mono border border-red-900 px-1 text-red-500 rounded bg-red-950/40">v3.0-Core</span>
            </h1>
            <p className="text-[10px] font-sans text-stone-500 tracking-wider mt-0.5">
              {isNight ? '🌙 結界深度：夜間巡回モード起動中' : '☀️ 結界深度：常時安全稼働中'}
            </p>
          </div>

          {/* 🌐 言語セレクター */}
          <div className="flex gap-1 bg-stone-950 p-1 rounded border border-stone-800 text-[11px] font-sans">
            {(['ja', 'en', 'zh_tw', 'zh_cn'] as LangMode[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded transition-all uppercase ${lang === l ? 'bg-red-800 text-stone-100 font-bold shadow' : 'text-stone-500 hover:text-stone-300'}`}
              >
                {l === 'zh_tw' ? '繁' : l === 'zh_cn' ? '简' : l}
              </button>
            ))}
          </div>
        </div>

        {/* 💴 霊的ウォレット残高 ＆ アクティブ装備スロット */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <div className="bg-stone-950 p-2.5 rounded border border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-400 font-sans">🪙 {lang === 'ja' ? '霊的残高（ウォレット）' : 'Spiritual Wallet'}</span>
            <span className="text-xl font-mono font-bold text-amber-500 tracking-tight">
              {wallet} <span className="text-xs font-serif text-stone-400">両</span>
            </span>
          </div>

          {/* 🎒 アクティブスロット表示 */}
          <div className="bg-stone-950 p-2.5 rounded border border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-400 font-sans">🎒 {lang === 'ja' ? 'アクティブ御守（バフ発動）' : 'Active Slots'}</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((idx) => {
                const eqId = equippedIds[idx];
                const item = SHOP_ITEMS.find(i => i.id === eqId);
                return (
                  <div
                    key={idx}
                    title={item ? (lang === 'ja' ? item.nameJa : item.nameEn) : (lang === 'ja' ? '空きスロット' : 'Empty')}
                    className={`w-7 h-7 rounded border flex items-center justify-center text-xs transition-all ${item ? 'border-red-700 bg-red-950/40 text-red-400 font-bold animate-pulse' : 'border-stone-800 bg-stone-900 text-stone-600'}`}
                  >
                    {item ? '🏮' : '•'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📑 タブ切り替え構造 */}
        <div className="flex bg-stone-950 rounded p-1 border border-stone-800 mb-4 text-xs font-sans">
          {(['omikuji', 'shop', 'inventory', 'goshuin'] as TabMode[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded transition-all text-center font-bold ${tab === t ? 'bg-stone-800 text-red-500 border border-stone-700' : 'text-stone-400 hover:text-stone-200'}`}
            >
              {t === 'omikuji' && (lang === 'ja' ? '🔮 抽籤箱' : '🔮 Fortune')}
              {t === 'shop' && (lang === 'ja' ? '⛩️ 授与所' : '⛩️ Shrine Shop')}
              {t === 'inventory' && (lang === 'ja' ? '🎒 懐中袋' : '🎒 Bag')}
              {t === 'goshuin' && (lang === 'ja' ? '📜 参拝歴' : '📜 History')}
            </button>
          ))}
        </div>

        {/* 🔮 1. おみくじタブ */}
        {tab === 'omikuji' && (
          <div className="text-center py-2 relative">
            
            {/* サプライズイベント通知 */}
            {jackpotMessage && (
              <div className="mb-4 p-3 bg-amber-950/60 border border-amber-600/50 rounded text-left text-xs leading-relaxed text-amber-300 font-sans shadow-lg animate-fade-in">
                {jackpotMessage}
              </div>
            )}

            <div className="bg-stone-950 border border-stone-800 rounded p-6 mb-4 flex flex-col items-center justify-center min-h-[160px] relative">
              {isRolling ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-red-800 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-stone-400 font-sans tracking-widest animate-pulse">
                    {lang === 'ja' ? '神速乱数演算中・パケット精製...' : 'Computing divine cryptos...'}
                  </p>
                </div>
              ) : result ? (
                <div className="w-full animate-fade-in">
                  <div className="text-xs text-stone-500 font-mono tracking-wider mb-1">
                    [HASH: {Math.random().toString(16).substring(2, 10).toUpperCase()}]
                  </div>
                  <div className={`text-2xl font-bold tracking-widest mb-3 ${result.type === 'plus' || result.type === 'jackpot' ? 'text-red-500 scale-105' : result.type === 'hacker_curse' ? 'text-purple-400 font-mono' : 'text-stone-400'}`}>
                    ✨ 【{result.fortune}】 ✨
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 px-2 leading-relaxed mb-4 border-t border-b border-stone-800/60 py-3 font-sans">
                    {result.detail}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-sans bg-stone-900/70 p-2.5 rounded border border-stone-800/50">
                    <div>
                      <span className="text-stone-500 block">{lang === 'ja' ? '💻 有縁の電脳物品' : 'Lucky Tech Item'}</span>
                      <span className="text-stone-300 font-medium">{result.luckyItem}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">{lang === 'ja' ? '🔣 相性の良い言語' : 'Lucky Language'}</span>
                      <span className="text-red-400 font-mono font-bold">{result.luckyLang}</span>
                    </div>
                  </div>

                  {/* 📊 運気バイオリズムのミニバーチャート視覚化 */}
                  <div className="mt-4 pt-3 border-t border-stone-800/40 text-left">
                    <span className="text-[10px] text-stone-500 font-sans block mb-1.5">📈 {lang === 'ja' ? '近五日電脳運気バイオリズム' : '5-Day Cyber Biorhythm Chart'}</span>
                    <div className="flex items-end justify-between px-4 h-12 bg-stone-900/80 p-1.5 rounded border border-stone-800">
                      {randomBiorhythm.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-0.5 flex-1">
                          <div 
                            className={`w-3.5 rounded-t-xs transition-all duration-700 ${val > 70 ? 'bg-emerald-600 shadow-[0_0_6px_#059669]' : val < 45 ? 'bg-red-700 shadow-[0_0_6px_#b91c1c]' : 'bg-amber-500'}`}
                            style={{ height: `${val}%`, minHeight: '4px' }}
                          />
                          <span className="text-[8px] font-mono text-stone-600">D{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center text-stone-500 py-4">
                  <div className="text-3xl mb-2">🔮</div>
                  <p className="text-xs font-sans">
                    {lang === 'ja' ? 'おみくじ箱を振って、今日の運勢（パケット）を受信してください。' : 'Shake the box to receive your digital fortune packet.'}
                  </p>
                  {equippedIds.length > 0 && (
                    <p className="text-[10px] text-red-400/80 mt-2 font-sans">
                      ※ {lang === 'ja' ? `現在 ${equippedIds.length}個 の御守がアクティブです（バフ適用中）` : `${equippedIds.length} amulets active`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleOmikuji}
              disabled={isRolling}
              className="w-full bg-red-800 hover:bg-red-900 active:bg-red-950 text-stone-100 font-bold py-3 px-4 rounded transition-all text-xs tracking-widest shadow-lg border border-red-700 disabled:opacity-50"
            >
              {isRolling ? (lang === 'ja' ? '神託受信中...' : 'Receiving...') : (lang === 'ja' ? '御神籤を引く（一回参拝）' : 'Draw Digital Fortune')}
            </button>
          </div>
        )}

        {/* ⛩️ 2. 授与所（ショップ）タブ */}
        {tab === 'shop' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">
                {lang === 'ja' ? `⛩️ 電脳護符授与一覧（今月：${currentMonth}月ラインナップ）` : `⛩️ Sacred Lineup (Month ${currentMonth})`}
              </h3>
              {isNight && <span className="text-[9px] text-purple-400 bg-purple-950 border border-purple-800 px-1 rounded font-sans animate-pulse">🌙 夜間限定品 開放中</span>}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto border border-stone-800 rounded bg-stone-950 p-1.5 space-y-1.5 custom-scrollbar">
              {filteredShopItems.map((item) => {
                const isOwned = inventory.some(i => i.id === item.id);
                const name = lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : lang === 'zh_tw' ? item.nameTw : item.nameCn;
                
                return (
                  <div key={item.id} className={`p-2 rounded border text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all bg-stone-900/80 ${isOwned ? 'border-stone-800 opacity-60' : 'border-stone-800 hover:border-stone-700'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold truncate ${item.type === 'skin' ? 'text-amber-400' : 'text-stone-200'}`}>
                          {name}
                        </span>
                        {item.availableMonths && (
                          <span className="text-[8px] bg-red-950 text-red-400 border border-red-800 px-1 rounded font-sans">季節限定</span>
                        )}
                        {item.isNightOnly && (
                          <span className="text-[8px] bg-purple-950 text-purple-400 border border-purple-800 px-1 rounded font-sans">夜間</span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 font-sans mt-0.5 truncate sm:whitespace-normal sm:line-clamp-2">
                        {lang === 'ja' ? item.descJa : lang === 'en' ? item.descEn : lang === 'zh_tw' ? item.descTw : item.descCn}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-stone-800 pt-1.5 sm:pt-0">
                      <span className="font-mono font-bold text-amber-500 text-xs">{item.price} 両</span>
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={isOwned}
                        className={`px-3 py-1 rounded text-[10px] font-sans font-bold transition-all ${isOwned ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-red-900 text-stone-100 hover:bg-red-800'}`}
                      >
                        {isOwned ? (lang === 'ja' ? '拝受済' : 'Owned') : (lang === 'ja' ? '拝受する' : 'Buy')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🎒 3. 懐中袋（インベントリ）タブ */}
        {tab === 'inventory' && (
          <div>
            {/* 🔍 検索 ＆ 📊 ソートツールバー */}
            <div className="mb-3 flex flex-col sm:flex-row gap-2 font-sans text-xs">
              <input
                type="text"
                placeholder={lang === 'ja' ? '御守を名称検索...' : 'Search items...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-300 focus:outline-none focus:border-red-700 text-[11px]"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-400 text-[11px]"
              >
                <option value="date">{lang === 'ja' ? '拝受順' : 'Acquired Date'}</option>
                <option value="name">{lang === 'ja' ? '名称順' : 'Alphabetical'}</option>
                <option value="price">{lang === 'ja' ? '高額順' : 'Highest Price'}</option>
              </select>
            </div>

            <div className="max-h-[280px] overflow-y-auto border border-stone-800 rounded bg-stone-950 p-1.5 space-y-1.5 custom-scrollbar">
              {processedInventory.length === 0 ? (
                <div className="text-center text-stone-600 py-8 text-xs font-sans">
                  {searchQuery ? (lang === 'ja' ? '条件に合致する所有品がありません。' : 'No items match your search.') : (lang === 'ja' ? '懐中袋は空です。授与所で御守を拝受してください。' : 'Your bag is empty.')}
                </div>
              ) : (
                processedInventory.map((item) => {
                  const name = lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : lang === 'zh_tw' ? item.nameTw : item.nameCn;
                  const isEquipped = equippedIds.includes(item.id);

                  return (
                    <div key={item.id} className="p-2 bg-stone-900 border border-stone-800 rounded text-xs flex justify-between items-center transition-all hover:border-stone-700">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-200 truncate">{name}</span>
                          {isEquipped && (
                            <span className="text-[8px] font-sans font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 rounded animate-pulse">ACTIVE</span>
                          )}
                          {item.type === 'skin' && (
                            <span className="text-[8px] font-sans bg-amber-950 text-amber-500 border border-amber-800 px-1 rounded">SKIN</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-sans text-[10px]">
                        <button
                          onClick={() => setActiveInfoItem(item)}
                          className="px-2 py-1 bg-stone-800 text-stone-400 rounded hover:text-stone-200 border border-stone-700"
                        >
                          {lang === 'ja' ? '霊視' : 'Inspect'}
                        </button>

                        {item.type === 'talisman' && (
                          <button
                            onClick={() => toggleEquip(item.id)}
                            className={`px-2.5 py-1 rounded font-bold border transition-all ${isEquipped ? 'bg-emerald-900 border-emerald-700 text-stone-100' : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'}`}
                          >
                            {isEquipped ? (lang === 'ja' ? '解除' : 'Unequip') : (lang === 'ja' ? '装備' : 'Equip')}
                          </button>
                        )}

                        {item.type === 'skin' && (
                          <button
                            onClick={() => {
                              setActiveSkin(item.id);
                              saveToStorage(wallet, inventory, logs, item.id, equippedIds);
                            }}
                            disabled={activeSkin === item.id}
                            className={`px-2 py-1 rounded font-bold border ${activeSkin === item.id ? 'bg-amber-950 border-amber-800 text-amber-400 cursor-not-allowed' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
                          >
                            {activeSkin === item.id ? (lang === 'ja' ? '適用中' : 'Active') : (lang === 'ja' ? '適用' : 'Apply')}
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

        {/* 📜 4. 参拝履歴タブ */}
        {tab === 'goshuin' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">
                {lang === 'ja' ? '📜 直近の電子参拝記録（ログ）' : '📜 Recent Divine Logs'}
              </h3>
              <button
                onClick={() => setShowModal(true)}
                className="text-[10px] bg-red-950/40 text-red-500 border border-red-900/60 hover:bg-red-950 px-2 py-0.5 rounded font-sans"
              >
                {lang === 'ja' ? '🏮 神社お焚き上げ' : 'Disposal'}
              </button>
            </div>

            <div className="max-h-[260px] overflow-y-auto border border-stone-800 rounded bg-stone-950 p-2 font-mono text-[11px] space-y-1 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center text-stone-700 py-8 font-serif text-xs">
                  {lang === 'ja' ? '参拝データが存在しません。' : 'No records found.'}
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-b border-stone-900 pb-1 flex justify-between text-stone-400">
                    <span>[{log.date}] fortune_packet_recv:</span>
                    <span className="text-red-700 font-bold font-serif">{log.fortune}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* 🔮 霊視（詳細ダイアログ）モーダル */}
      {activeInfoItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-stone-900 border-2 border-stone-700 max-w-xs w-full rounded p-5 shadow-2xl text-stone-200">
            <h4 className="text-sm font-bold text-red-500 border-b border-stone-800 pb-1.5 mb-2">
              🔮 {lang === 'ja' ? activeInfoItem.nameJa : activeInfoItem.nameEn}
            </h4>
            <p className="text-xs text-stone-400 font-sans leading-relaxed mb-4">
              {lang === 'ja' ? activeInfoItem.descJa : activeInfoItem.descEn}
            </p>
            <div className="text-[10px] text-stone-500 font-sans space-y-0.5 border-t border-stone-800/60 pt-2 mb-4">
              <div>ID: <span className="font-mono text-stone-400">{activeInfoItem.id}</span></div>
              <div>VAL: <span className="font-mono text-amber-500">{activeInfoItem.price} 両</span></div>
              <div>TYPE: <span className="font-mono text-stone-400 uppercase">{activeInfoItem.type}</span></div>
            </div>
            <button
              onClick={() => setActiveInfoItem(null)}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-sans text-xs py-1.5 rounded transition-colors"
            >
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
                {isBurning ? '昇華中...' : (lang === 'ja' ? 'お焚き上げする' : 'Purge All')}
              </button>
              <button onClick={() => setShowModal(false)} disabled={isBurning} className="bg-stone-300 text-stone-700 font-bold px-4 py-2 rounded hover:bg-stone-400 transition-colors">
                {lang === 'ja' ? '中止' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}