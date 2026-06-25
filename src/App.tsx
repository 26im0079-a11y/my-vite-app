import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';

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
  { id: 'talisman_overtime', nameJa: '定時退社・健康祈願符', nameEn: 'Leave-on-Time Rune', nameTw: '準時下班祈願符', nameCn: '准时下班祈愿符', descJa: '定時が近づくと強制的に作業終了へと導く、労働環境の守護ルーン。', descEn: 'A protective rune that guides you to a clean wrap-up when clock-out time nears.', descTw: '每逢下班時間便強制導向收尾階段，捍衛勞動環境的守護符文。', descCn: '每逢下班时间便强制导向收尾阶段，捍卫劳动环境守护符文。', price: 350, type: 'talisman' },
  { id: 'talisman_infra', nameJa: '高可用性・インフラ安定護符', nameEn: 'Infra Stability Charm', nameTw: '雲端架構安定符', nameCn: '雲端架構安定符', descJa: 'クラウドサーバーの負荷を分散し、99.999%の稼働率を約束する最上位の護符。', descEn: 'Distributes cloud server load, guaranteeing 99.999% uptime.', descTw: '分散雲端伺服器負載，確保高達99.999%系統可用性的至高護符。', descCn: '分散云端服务器负载，确保高达99.999%系统可用性的至高护符。', price: 500, type: 'talisman' },

  // --- 追加御守 (50種) ---
  { id: 'talisman_gen_1', nameJa: '新機能安全祈願守', nameEn: 'Feature Safety Charm', nameTw: '新功能安全祈願守', nameCn: '新功能安全祈愿守', descJa: '新規にマージされたコードが、既存のシステムと摩擦を起こさず馴染む。', descEn: 'Ensures newly merged code integrates smoothly with zero friction.', descTw: '確保新合併的程式碼與現有系統完美融合、不生摩擦。', descCn: '确保新合并的代码与现有系统完美融合、不生摩擦。', price: 180, type: 'talisman' },
  { id: 'talisman_gen_2', nameJa: 'メモリリーク即封じ札', nameEn: 'Memory Leak Sealing Seal', nameTw: '記憶體洩漏即封札', nameCn: '内存泄漏即封札', descJa: 'じわじわとヒープを蝕む目に見えぬリソース流出の結界を即座に塞ぐ。', descEn: 'Instantly patches unseen heap erosions and resource leakages.', descTw: '立即封堵蠶食堆積記憶體、肉眼難視的資源流失漏洞。', descCn: '立即封堵蚕食堆栈内存、肉眼难视的资源流失漏洞。', price: 220, type: 'talisman' },
  { id: 'talisman_gen_3', nameJa: '深夜アラート除け守', nameEn: 'Midnight Alert Ward', nameTw: '深夜警告除守', nameCn: '深夜警告除守', descJa: '午前2時のPagerDutyやSlack通知を沈黙させ、深い睡眠を約束する。', descEn: 'Silences 2 AM PagerDuty or Slack pings for a deep, restful sleep.', descTw: '靜音凌晨兩點的 PagerDuty 與 Slack 通知，守護深度睡眠。', descCn: '静音凌晨两点的 PagerDuty 与 Slack 通知，守护深度睡眠。', price: 400, type: 'talisman', isNightOnly: true },
  { id: 'talisman_gen_4', nameJa: 'APIレスポンス爆速符', nameEn: 'Turbo API Response Stamp', nameTw: 'API回應爆速符', nameCn: 'API回应爆速符', descJa: 'ミリ秒単位の遅延を極限まで削り、電光石火の返信を可能にする。', descEn: 'Shaves off millisecond latency for lightning-fast responses.', descTw: '將毫秒級延遲削平至極限，實現電光石火般的響應。', descCn: '将毫秒级延迟削平至极限，实现电光石火般的响应。', price: 280, type: 'talisman' },
  { id: 'talisman_gen_5', nameJa: 'タイポ自動看破の眼', nameEn: 'Typo Detection Eye', nameTw: '錯字自動看破之眼', nameCn: '错字自动看破之眼', descJa: '識別子の綴り間違いや、全角スペースという邪気を瞬時に検知する。', descEn: 'Instantly identifies misspelled identifiers and rogue full-width spaces.', descTw: '瞬間偵測標識符拼寫錯誤以及全形空格等不祥邪氣。', descCn: '瞬间侦测标识符拼写错误以及全角空格等不祥邪气。', price: 120, type: 'talisman' },
  { id: 'talisman_gen_6', nameJa: '型定義完全調和守', nameEn: 'Type Harmony Ribbon', nameTw: '型態定義完全調和守', nameCn: '型态定义完全调和守', descJa: '「any型」の呪縛を解き放ち、厳格で美しい型安全の世界を構築する。', descEn: 'Breaks the curse of "any" types, building a beautiful type-safe world.', descTw: '解除「any型態」的詛咒，構建嚴格且優美的型態安全世界。', descCn: '解除“any类型”的诅咒，构建严格且优美的类型安全世界。', price: 260, type: 'talisman' },
  { id: 'talisman_gen_7', nameJa: 'Wi-Fi電波増幅護符', nameEn: 'Wi-Fi Signal Booster', nameTw: 'Wi-Fi訊號增幅護符', nameCn: 'Wi-Fi信号增幅护符', descJa: '電波の混雑をスマートにいなし、リモートワークの接続を維持する。', descEn: 'Smartly navigates signal congestion to maintain remote connections.', descTw: '智慧化解訊號擁堵，穩固維持遠距工作時的連線。', descCn: '智慧化解信号拥堵，稳固维持远距工作时的连线。', price: 160, type: 'talisman' },
  { id: 'talisman_gen_8', nameJa: 'コンパイル一発通過符', nameEn: 'One-Shot Compile Rune', nameTw: '編譯一擊通過符', nameCn: '编译一击通过符', descJa: '何百行もの変更であっても、最初の挑戦でグリーンビルドへと導く。', descEn: 'Guides even hundreds of lines of changes to a green build on the first try.', descTw: '縱使變更數百行原始碼，初次挑戰即可導向綠燈編譯成功。', descCn: '纵使变更数百行源码，初次挑战即可导向绿灯编译成功。', price: 320, type: 'talisman' },
  { id: 'talisman_gen_9', nameJa: 'クリーンアーキテクチャ守', nameEn: 'Clean Architecture Charm', nameTw: '潔淨架構守', nameCn: '洁净架构守', descJa: '依存関係の絡まりを綺麗にほぐし、いつまでも穢れなき設計を保つ。', descEn: 'Untangles complex dependencies, preserving a spotless, clean design.', descTw: '將糾纏的相依關係解得乾淨俐落，令架構永保無瑕。', descCn: '将纠缠的相依关系解得干净利落，令架构永保无瑕。', price: 380, type: 'talisman' },
  { id: 'talisman_gen_10', nameJa: 'git merge無衝突守', nameEn: 'Conflict-Free Merge Ward', nameTw: 'Git合併無衝突守', nameCn: 'Git合并无冲突守', descJa: '巨大なブランチ同士の合流時にも、競合（コンフリクト）の発生を防ぐ。', descEn: 'Prevents merge conflicts even when joining massive branch forks.', descTw: '即便在巨大分支合流之際，亦能嚴防發生衝突。', descCn: '即便在巨大分支合流之际，亦能严防发生冲突。', price: 300, type: 'talisman' },
  { id: 'talisman_gen_11', nameJa: '正規表現一発的中符', nameEn: 'Regex Master Scroll', nameTw: '正規表示式一擊命中符', nameCn: '正则表达式一击命中符', descJa: '暗号のような複雑なパターンマッチングを、迷うことなく一発で通す。', descEn: 'Passes complex, cryptic pattern matching on the first try without doubt.', descTw: '如暗號般複雜的模式匹配，毫無迷惘地一擊通關。', descCn: '如暗号般复杂的模式匹配，毫无迷惘地一击通关。', price: 190, type: 'talisman' },
  { id: 'talisman_gen_12', nameJa: '無限ループ即断の斧', nameEn: 'Infinite Loop Cleaver', nameTw: '無限迴圈即斷之斧', nameCn: '无限循环即断之斧', descJa: '条件式のバグによるCPU100%の暴走を感知し、冷徹にプロセスを遮断する。', descEn: 'Detects 100% CPU spikes from bad conditions and coldly severs the process.', descTw: '感應因條件式錯誤導致CPU100%的暴走，冷徹地切斷該程序。', descCn: '感应因条件式错误导致CPU100%的暴走，冷彻地切断该程序。', price: 240, type: 'talisman' },
  { id: 'talisman_gen_13', nameJa: 'DNS反映最速護符', nameEn: 'Express DNS Propagator', nameTw: 'DNS反映最速護符', nameCn: 'DNS反映最速护符', descJa: '世界中のキャッシュサーバーを説得し、レコード変更を数秒で伝播させる。', descEn: 'Convinces global cache servers to propagate record changes in seconds.', descTw: '說服全球快取伺服器，使記錄變更在數秒內傳播完成。', descCn: '说服全球缓存服务器，使记录变更在数秒内传播完成。', price: 210, type: 'talisman' },
  { id: 'talisman_gen_14', nameJa: 'レガシーコード解読香', nameEn: 'Legacy Code Incense', nameTw: '遺留程式碼解讀香', nameCn: '遗留代码解读香', descJa: '数年前に書かれた作者不明の秘伝ソースを読み解く、ひらめきを与える。', descEn: 'Grants divine inspiration to decipher ancient, authorless source code.', descTw: '賜予看透數年前由不明原作者所寫之秘傳原始碼的靈感。', descCn: '赐予看透数年前由不明原作者所写之秘传源码的灵感。', price: 270, type: 'talisman' },
  { id: 'talisman_gen_15', nameJa: '不要ログ自動昇華札', nameEn: 'Log Purge Talisman', nameTw: '無用日誌自動昇華札', nameCn: '无用日志自动升华札', descJa: 'ストレージを圧迫するデバッグ用のコンソール出力を、本番環境で消滅させる。', descEn: 'Purges storage-hogging debug console logs automatically in production.', descTw: '在正式環境中自動消滅擠壓儲存空間的除錯專用主控台輸出。', descCn: '在正式环境中自动消灭挤压储存空间的除错专用控制台输出。', price: 140, type: 'talisman' },
  { id: 'talisman_gen_16', nameJa: 'ガベージコレクション調和守', nameEn: 'GC Harmony Medallion', nameTw: '記憶體回收調和守', nameCn: '内存回收调和守', descJa: 'メモリ解放の周期を最適化し、一瞬の処理スタック（Stop the World）を防ぐ。', descEn: 'Optimizes memory reclamation cycles to prevent "Stop the World" stutters.', descTw: '最佳化記憶體釋放週期，嚴防發生瞬間的暫停（Stop the World）。', descCn: '优化内存释放周期，严防发生瞬间的暂停（Stop the World）。', price: 310, type: 'talisman' },
  { id: 'talisman_gen_17', nameJa: '環境構築一気開通符', nameEn: 'Easy Setup Scroll', nameTw: '環境建置一氣開通符', nameCn: '环境建置一气开通符', descJa: 'Dockerやパッケージのバージョン競合に悩まされず、一発で起動する。', descEn: 'Launches local stacks instantly without Docker or package version conflicts.', descTw: '免受 Docker 或套件版本衝突之苦，一鍵順利啟動。', descCn: '免受 Docker 或套件版本冲突之苦，一键顺利启动。', price: 250, type: 'talisman' },
  { id: 'talisman_gen_18', nameJa: '神の進捗管理お守り', nameEn: 'Divine Schedule Keeper', nameTw: '神級進度管理守', nameCn: '神级进度管理守', descJa: '見積もりの甘さを神の見えざる手で補正し、納期を絶対に死守させる。', descEn: 'Corrects overly optimistic estimates with an invisible hand to save deadlines.', descTw: '以神之無形之手修正過於樂觀的時程預估，絕對死守交期。', descCn: '以神之无形之手修正过于乐观的时程预估，绝对死守交期。', price: 340, type: 'talisman' },
  { id: 'talisman_gen_19', nameJa: '安全本番デプロイ符', nameEn: 'Safe Production Deploy Seal', nameTw: '安全正式環境部署符', nameCn: '安全正式环境部署符', descJa: '金曜日の夕方に本番反映を行っても、何一つ問題が起きない大いなる加護。', descEn: 'Provides immense protection so nothing breaks even during Friday evening deploys.', descTw: '即使在週五傍晚進行正式上線，亦能確保無事發生的巨大加護。', descCn: '即使在周五傍晚进行正式上线，亦能确保无事发生的巨大加护。', price: 450, type: 'talisman' },
  { id: 'talisman_gen_20', nameJa: 'ダークモード調和の眼帯', nameEn: 'Dark Mode Eyepatch', nameTw: '暗黑模式調和眼罩', nameCn: '暗黑模式调和眼罩', descJa: 'ブルーライトの刺激を遮断し、24時間漆黒の画面を見続けるエンジニアの瞳を保護する。', descEn: 'Blocks blue-light strain, protecting eyes glued to black screens 24/7.', descTw: '阻絕藍光刺激，保護24小時緊盯漆黑螢幕的工程師雙眼。', descCn: '阻绝蓝光刺激，保护24小时紧盯漆黑屏幕的工程师双眼。', price: 150, type: 'talisman' },
  { id: 'talisman_gen_21', nameJa: 'ポート競合回避のお守り', nameEn: 'Port Conflict Ward', nameTw: '通訊埠衝突迴避守', nameCn: '端口冲突回避守', descJa: '「Address already in use」という無情のエラーからポート3000を解放する。', descEn: 'Frees port 3000 from the cold "Address already in use" exceptions.', descTw: '從「Address already in use」的無情錯誤中解放連接埠 3000。', descCn: '从“Address already in use”的无情错误中解放端口 3000。', price: 130, type: 'talisman' },
  { id: 'talisman_gen_22', nameJa: '進捗百倍の御幣', nameEn: '100x Progress Wand', nameTw: '進度百倍之御幣', nameCn: '进度百倍之御币', descJa: 'ゾーンに入った圧倒的集中力を引き出し、1日で1週間分のコードを錬成する。', descEn: 'Triggers absolute flow state, forging a week\'s worth of code in a single day.', descTw: '引導出進入極限專注狀態的爆發力，一日內煉成一週份的程式碼。', descCn: '引导出进入极限专注状态的爆发力，一日内炼成一周份的代码。', price: 500, type: 'talisman' },
  { id: 'talisman_gen_23', nameJa: 'シェルスクリプト一発安定札', nameEn: 'Shell Script Stability Rune', nameTw: 'Shell腳本一擊安定札', nameCn: 'Shell脚本一击安定札', descJa: '空白の有無やパイプの挙動による、制御不能な予期せぬ挙動を完全に鎮める。', descEn: 'Completely tames wild script behaviors caused by spaces or piping quirks.', descTw: '完全鎮壓因空格有無或管線行為所導致、難以控制的預期外舉動。', descCn: '完全镇压因空格有無或管线行为所导致、难以控制的预期外举动。', price: 180, type: 'talisman' },
  { id: 'talisman_gen_24', nameJa: 'Cookie永続・セッション守', nameEn: 'Cookie & Session Keeper', nameTw: 'Cookie永續・會期守', nameCn: 'Cookie永续・会期守', descJa: '開発中の意図せぬセッション切れを防ぎ、ログインの手間を最小限に抑える。', descEn: 'Prevents annoying session expirations during dev, minimizing re-login fatigue.', descTw: '防止開發過程中非預期的會期中斷，將重新登入的勞頓降至最低。', descCn: '防止开发过程中非预期的会期中断，将重新登录的劳顿降至最低。', price: 170, type: 'talisman' },
  { id: 'talisman_gen_25', nameJa: '神聖バックアップ護符', nameEn: 'Sacred Backup Ribbon', nameTw: '神聖備份護符', nameCn: '神圣备份护符', descJa: '不慮の操作ミスやディスククラッシュから、大切なソースコードを霊的に保護する。', descEn: 'Spiritually shields precious source code from accidental human errors or crashes.', descTw: '在靈性層面上保護珍貴的原始碼，免受不慎誤操作或硬碟損壞之災。', descCn: '在灵性层面上保护珍贵的源码，免受不慎误操作或硬盘损坏之灾。', price: 290, type: 'talisman' },
  { id: 'talisman_gen_26', nameJa: 'AIプロンプト大開運札', nameEn: 'AI Prompt Prosperity Seal', nameTw: 'AI提示詞大開運札', nameCn: 'AI提示词大开运札', descJa: 'AIアシスタントに一度指示するだけで、意図通りの完璧なコードを吐き出させる。', descEn: 'Ensures AI assistants output perfect, intended code on the very first prompt.', descTw: '只需對 AI 助手下達一次指示，便能使其吐出完全符合意圖的完美程式碼。', descCn: '只需对 AI 助手下达一次指示，便能使其吐出完全符合意图的完美代码。', price: 220, type: 'talisman' },
  { id: 'talisman_gen_27', nameJa: 'SQLインジェクション防壁守', nameEn: 'Anti-SQL Injection Aegis', nameTw: 'SQL注入防護守', nameCn: 'SQL注入防护守', descJa: '不正な入力パラメータを自動で浄化し、データベースの深淵を守護する。', descEn: 'Automatically sanitizes malicious parameters to shield the database core.', descTw: '自動淨化惡意輸入參數，堅守資料庫的深邃核心。', descCn: '自动净化恶意输入参数，坚守数据库的深邃核心。', price: 330, type: 'talisman' },
  { id: 'talisman_gen_28', nameJa: 'CORSエラー霧散の笛', nameEn: 'CORS Error Dissolving Flute', nameTw: 'CORS錯誤霧散之笛', nameCn: 'CORS错误雾散之笛', descJa: 'ブラウザの冷酷な同一オリジンポリシーを優しく宥め、通信を円滑にする。', descEn: 'Gently soothes strict origin policies to smoothen cross-origin requests.', descTw: '溫柔安撫瀏覽器冷酷的同源政策，使跨網域通訊圓滿流暢。', descCn: '温柔安抚浏览器冷酷的同源政策，使跨网域通讯圆满流畅。', price: 200, type: 'talisman' },
  { id: 'talisman_gen_29', nameJa: 'npm audit無脆弱性符', nameEn: 'Vulnerability-Free Module Rune', nameTw: 'npm稽核無脆弱性符', nameCn: 'npm稽核无脆弱性符', descJa: '依存パッケージのセキュリティ警告をゼロに抑え、監査の審査を無風で乗り切る。', descEn: 'Suppresses package security alerts to glide through rigorous audits cleanly.', descTw: '將相依套件的安全警告降至零，平靜無風地度過嚴格的資安稽核。', descCn: '将相依套件的安全警告降至零，平静无风地度过严格的资安稽核。', price: 360, type: 'talisman' },
  { id: 'talisman_gen_30', nameJa: 'スタックオーバーフロー回避守', nameEn: 'Stack Overflow Prevention Ward', nameTw: '堆疊溢位迴避守', nameCn: '堆栈溢出回避守', descJa: '再帰関数の果てしない深淵を制御し、コールスタックの爆発を未然に防ぐ。', descEn: 'Controls infinite recursive depths to prevent call-stack explosions.', descTw: '控制遞迴函數的無底深淵，未雨綢繆防止呼叫堆疊爆炸。', descCn: '控制递归函数的无底深渊，未雨绸缪防止呼叫堆栈爆炸。', price: 240, type: 'talisman' },
  { id: 'talisman_gen_31', nameJa: 'JSONパース完全整合符', nameEn: 'Flawless JSON Parser Stamp', nameTw: 'JSON剖析完全整合符', nameCn: 'JSON剖析完全整合符', descJa: '不正な形式や予期せぬぬるぽ（Null）が含まれるテキストも、慈悲深く処理する。', descEn: 'Mercifully handles invalid structures or unexpected nulls inside text strings.', descTw: '即便文字內含不正規格式或意料之外的空值，亦能慈悲為懷地包容處理。', descCn: '即便文字内含不常规格式或意料之外的空值，亦能慈悲为怀地包容处理。', price: 160, type: 'talisman' },
  { id: 'talisman_gen_32', nameJa: 'CSSレイアウト調和守', nameEn: 'CSS Flexbox Harmony Emblem', nameTw: 'CSS排版調和守', nameCn: 'CSS排版调和守', descJa: 'FlexboxやGridの謎のズレを解消し、あらゆる画面で意図通りの等幅配置を実現する。', descEn: 'Resolves mysterious Flexbox offsets for perfect alignments on any screen.', descTw: '化解 Flexbox 或 Grid 的神秘位移，在全畫面上實現如願的對齊。', descCn: '化解 Flexbox 或 Grid 的神秘位移，在全画面上实现如愿的对齐。', price: 190, type: 'talisman' },
  { id: 'talisman_gen_33', nameJa: 'Gitコンミット忘れ除け守', nameEn: 'Anti-Forgotten-Commit Charm', nameTw: 'Git忘記提交除守', nameCn: 'Git忘记提交除守', descJa: '金曜日の帰宅直前に、未コミットのコードを残したままPCを閉じる過ちを防ぐ。', descEn: 'Prevents closing your laptop with uncommitted code right before the weekend.', descTw: '嚴防在週五下班前，留下未提交的程式碼便蓋上電腦的過失。', descCn: '严防在周五下班前，留下未提交的代码便盖上电脑的过失。', price: 140, type: 'talisman' },
  { id: 'talisman_gen_34', nameJa: '深夜コーヒー覚醒符', nameEn: 'Midnight Coffee Awakening Rune', nameTw: '深夜咖啡覺醒符', nameCn: '深夜咖啡觉醒符', descJa: '睡魔の誘惑を退け、障害対応中のエンジニアの集中力を極限まで高める。', descEn: 'Repels drowsiness, maxing concentration during emergency live incidents.', descTw: '驅退睡魔誘惑，將處於故障排除中工程師的專注力提振至極限。', descCn: '驱退睡魔诱惑，将处于故障排除中工程师的专注力提振至极限。', price: 220, type: 'talisman', isNightOnly: true },
  { id: 'talisman_gen_35', nameJa: '本番DB誤操作防止柵', nameEn: 'Prod DB Protection Rail', nameTw: '正式環境DB誤操作防止柵', nameCn: '正式环境DB误操作防止栅', descJa: '「WHERE句のないUPDATE」などの破滅的なコマンド入力を、見えざる壁で防ぐ。', descEn: 'Blocks catastrophic commands like WHERE-less UPDATEs with an invisible wall.', descTw: '以無形鐵柵強阻「遺漏 WHERE 子句的 UPDATE」等毀滅性指令輸入。', descCn: '以无形铁栅强阻“遗漏 WHERE 子句的 UPDATE”等毁灭性指令输入。', price: 490, type: 'talisman' },
  { id: 'talisman_gen_36', nameJa: 'ブラウザ互換性円満符', nameEn: 'Cross-Browser Peace Scroll', nameTw: '瀏覽器相容性圓滿符', nameCn: '浏览器兼容性圆满符', descJa: '特定の古いブラウザでのみ発生する原因不明のCSS崩れや挙動バグを平定する。', descEn: 'Subdues mysterious layout breaks unique to specific legacy browsers.', descTw: '平定僅在特定舊型瀏覽器上發生、原因不明的 CSS 破圖與行為錯誤。', descCn: '平定仅在特定旧型浏览器上发生、原因不明的 CSS 破图与行为错误。', price: 260, type: 'talisman' },
  { id: 'talisman_gen_37', nameJa: '進捗報告円滑守', nameEn: 'Smooth Progress Report Charm', nameTw: '進度報告圓滑守', nameCn: '进度报告圆滑守', descJa: '進捗が芳しくない時でも、マネージャーへの報告がなぜか穏便に済む不思議なお守り。', descEn: 'Ensures status reports go over smoothly even when things are behind schedule.', descTw: '即便進度不盡人意，向主管匯報時不知為何總能安然過關的神奇御守。', descCn: '即便进度不尽人意，向主管汇报时不知为何总能安然过关的神奇御守。', price: 230, type: 'talisman' },
  { id: 'talisman_gen_38', nameJa: '非推奨API延命符', nameEn: 'Deprecated API Lifespan Seal', nameTw: '非推薦API延命符', nameCn: '非推荐API延命符', descJa: 'すでに廃止されたはずの外部サービスが、自システムのためだけに奇跡的に動き続ける。', descEn: 'Miraculously keeps deprecated third-party services alive just for your system.', descTw: '使本應廢止的外部服務發生奇蹟，唯獨為自家系統繼續運作。', descCn: '使本应废止的外部服务发生奇迹，唯独为自家系统继续运作。', price: 350, type: 'talisman' },
  { id: 'talisman_gen_39', nameJa: 'ハードウェア冷却の涼風', nameEn: 'Hardware Cooling Breeze', nameTw: '硬體冷卻之涼風', nameCn: '硬件冷却之凉风', descJa: '重いコンパイル処理で悲鳴を上げるCPUの熱を奪い、ファンの爆音を静める。', descEn: 'Absorbs CPU heat during heavy compiles, silencing roaring fans.', descTw: '奪走因沉重編譯處理而哀鳴的 CPU 熱量，撫平風扇的暴烈轟鳴。', descCn: '夺走因沉重编译处理而哀鸣的 CPU 热量，抚平风扇的暴烈轰鸣。', price: 180, type: 'talisman' },
  { id: 'talisman_gen_40', nameJa: '依存関係クリーン符', nameEn: 'Clean Dependency Ribbon', nameTw: '相依關係潔淨符', nameCn: '相依关系洁净符', descJa: '「node_modules」の肥大化を抑え、迷宮のようなライブラリの絡まりを整理する。', descEn: 'Suppresses node_modules bloat and structures the library labyrinth cleanly.', descTw: '抑制「node_modules」無度肥大，整頓如迷宮般糾結的套件。', descCn: '抑制“node_modules”无度肥大，整顿如迷宫般纠结的套件。', price: 270, type: 'talisman' },
  { id: 'talisman_gen_41', nameJa: '高速タイピングの腕輪', nameEn: 'Bracer of Swift Typing', nameTw: '高速打字手環', nameCn: '高速打字手环', descJa: '打鍵ミスを極限まで減らし、脳内の思考スピードのままにコードを画面に刻む。', descEn: 'Minimizes mistypes, engraving code at the exact speed of your thoughts.', descTw: '將打字失誤降至極限，將腦中思緒的速度原封不動地在螢幕上刻下。', descCn: '将打字失误降至极限，将脑中思绪的速度原封不动地在屏幕上刻下。', price: 210, type: 'talisman' },
  { id: 'talisman_gen_42', nameJa: 'リファクタリング大成符', nameEn: 'Great Refactoring Success Seal', nameTw: '重構大成符', nameCn: '重构大成符', descJa: 'スパゲッティコードの大手術を敢行しても、既存機能への先祖返り（デグレード）を起こさない。', descEn: 'Guarantees large legacy refactors won\'t trigger unexpected regressions.', descTw: '大刀闊斧重構陳年舊碼，亦絕不引發任何功能倒退（Regression）。', descCn: '大刀阔斧重构陈年旧码，亦绝不引发任何功能倒退（Regression）。', price: 420, type: 'talisman' },
  { id: 'talisman_gen_43', nameJa: '休日緊急呼出無風守', nameEn: 'Weekend Peace Talisman', nameTw: '假日緊急呼叫無風守', nameCn: '假日紧急呼叫无风守', descJa: '週末のスマホが鳴る恐怖から解放され、心穏やかなプライベートを約束する。', descEn: 'Liberates you from the dread of weekend on-call alerts for true relaxation.', descTw: '從週末手機響起的恐懼中解放，確保心境祥和的私人生活。', descCn: '从周末手机响起的恐惧中解放，确保心境祥和的私人生活。', price: 440, type: 'talisman' },
  { id: 'talisman_gen_44', nameJa: 'Dockerコンテナ調律符', nameEn: 'Docker Container Harmony Rune', nameTw: 'Docker貨櫃調律符', nameCn: 'Docker容器调律符', descJa: '原因不明のコンテナ終了（Exit Code 137）を防ぎ、安定駆動を続ける。', descEn: 'Prevents mysterious container deaths like Exit Code 137 for smooth runs.', descTw: '嚴防原因不明的容器異常結束（Exit Code 137），使其持續穩定驅動。', descCn: '严防原因不明的容器异常结束（Exit Code 137），使其持续稳定驱动。', price: 290, type: 'talisman' },
  { id: 'talisman_gen_45', nameJa: 'ロードバランサ円滑の扇', nameEn: 'Smooth Load Balancer Fan', nameTw: '負載平衡器圓滑之扇', nameCn: '负载平衡器圆滑之扇', descJa: '突発的なアクセススパイクを各サーバーへ美しく分散し、墜落を防ぐ。', descEn: 'Distributes sudden traffic spikes beautifully across servers to avert a crash.', descTw: '將突發的流量高峰優美地分散至各伺服器，防止系統潰堤。', descCn: '将突发的流量高峰优美地分散至各服务器，防止系统溃堤。', price: 390, type: 'talisman' },
  { id: 'talisman_gen_46', nameJa: 'ダークテーマ調和の灯籠', nameEn: 'Dark Theme Lantern', nameTw: '暗黑主題調和燈籠', nameCn: '暗黑主题调和灯笼', descJa: '漆黒のコード画面に最適なコントラストを与え、視認性と情緒を両立させる。', descEn: 'Injects perfect contrast into dark IDE screens, blending readability and mood.', descTw: '為漆黑的程式碼畫面注入最佳對比度，兼顧視覺辨識度与文雅情懷。', descCn: '为漆黑的代码画面注入最佳对比度，兼顾视觉辨识度与文雅情怀。', price: 160, type: 'talisman' },
  { id: 'talisman_gen_47', nameJa: 'ドキュメント自動生成符', nameEn: 'Auto-Doc Generation Charm', nameTw: '文件自動生成符', nameCn: '文件自动生成符', descJa: 'コードの意図を汲み取り、常に最新の美しい仕様書を自動で維持する。', descEn: 'Reads code intent, auto-maintaining pristine, up-to-date documentation.', descTw: '汲取程式碼意圖，始終自動維持最新且精美的文件說明書。', descCn: '汲取代码意图，始终自动维持最新且精美的文件说明书。', price: 320, type: 'talisman' },
  { id: 'talisman_gen_48', nameJa: 'Webhook確実疎通札', nameEn: 'Reliable Webhook Delivery Seal', nameTw: 'Webhook確實疏通札', nameCn: 'Webhook确实疏通札', descJa: '外部サービスとのイベント通知が途切れることなく、100%の疎通を約束する。', descEn: 'Guarantees 100% delivery for event notifications from third-party links.', descTw: '與外部服務之間的事件通知永不中斷，確保100%順暢互通。', descCn: '与外部服务之间的事件通知永不中断，确保100%顺畅互通。', price: 200, type: 'talisman' },
  { id: 'talisman_gen_49', nameJa: 'ブレイクポイント看破札', nameEn: 'Breakpoint Spotter Talisman', nameTw: '中斷點看破札', nameCn: '中断点看破札', descJa: 'バグの原因となっている真のステップを霊的に暴き出し、デバッグ時間を1/10にする。', descEn: 'Spiritually exposes the exact buggy step, cutting debugging times to 1/10.', descTw: '以靈性看穿導致錯誤的真正步驟，將除錯時間縮減為十分之一。', descCn: '以灵性看穿导致错误的真正步骤，将除错时间缩减为十分之一。', price: 280, type: 'talisman' },
  { id: 'talisman_gen_50', nameJa: '定時退社無風の大結界', nameEn: 'Great Shield of Leaving On Time', nameTw: '準時下班無風大結界', nameCn: '准时下班无风大结界', descJa: '終業10分前の突発トラブルや追加依頼を強力に弾き返す最高峰の防御結界。', descEn: 'A pinnacle barrier that strongly repels last-minute issues 10 mins before clock-out.', descTw: '強力彈回下班前十分鐘突發狀況與追加需求的最高峰防禦結界。', descCn: '強力弹回下班前十分钟突发状况与追加需求的最高峰防御结界。', price: 500, type: 'talisman' },

  // --- 背景仕様 (5種) ---
  { id: 'skin_default', nameJa: '通常仕様（漆黒の闇）', nameEn: 'Default (Pitch Black)', nameTw: '通常款式（漆黑之路）', nameCn: '通常款式（漆黑之路）', descJa: 'デフォルト。深淵なる電子の夜空。何の色にも染まらない静寂の黒。', descEn: 'The default state. An abyssal cyber sky wrapped in absolute serene black.', descTw: '預設款式。深邃的電子夜空，不著痕跡的寂靜之黑。', descCn: '默认款式。深邃的电子夜空，不着痕迹的寂静之黑。', price: 100, type: 'skin' },
  { id: 'skin_neon', nameJa: '背景：電脳ネオン鳥居', nameEn: 'Skin: Cyber Neon Torii', nameTw: '背景：電腦霓虹鳥居', nameCn: '背景：电脑霓虹鸟居', descJa: 'サイバーパンクの神髄。極彩色のネオンが優しくまたたき、結界を妖しく彩る。', descEn: 'Cyberpunk essence. Multi-colored neon gently pulses, framing a mysterious barrier.', descTw: '賽博龐克的精髓。五彩斑斕的霓虹溫柔閃爍，將結界染上妖異迷人的色彩。', descCn: '赛博朋克的精髓。五彩斑斓的霓虹温柔闪烁，将结界染上妖异迷人的色彩。', price: 250, type: 'skin' },
  { id: 'skin_matrix', nameJa: '背景：電子コードの雨', nameEn: 'Skin: Digital Code Rain', nameTw: '背景：電子代碼瀑布', nameCn: '背景：电子代码瀑布', descJa: '上空から果てしなく降り注ぐ緑の16進数パケット。ハッカーの精神安寧。', descEn: 'Endless streams of cascading green hex packets. True tranquility for a hacker.', descTw: '從天而降、綿延不絕的綠色十六進位代碼封包。駭客的心靈綠洲。', descCn: '从天而降、绵延不绝的绿色十六进制代码封包。客的心灵绿洲。', price: 300, type: 'skin' },
  { id: 'skin_sakura', nameJa: '背景：桜満開・電脳春嵐', nameEn: 'Skin: Cherry Blossom Storm', nameTw: '背景：櫻花滿開・電腦春嵐', nameCn: '背景：樱花满开・电脑春岚', descJa: '和風サイバーの新境地。画面の奥底で淡いピンクのデジタル桜吹雪が美しく舞い落ちる。', descEn: 'Neo-traditional fusion. Pale pink digital petals cascade elegantly through the depths.', descTw: '和風賽博新境界。粉嫩的數位櫻花雨在畫面深處優雅飛舞飄落。', descCn: '和风赛博新境界。粉嫩的数码樱花雨在画面变深处优雅飞舞飘落。', price: 400, type: 'skin' },
  { id: 'skin_gold', nameJa: '背景：純金箔・分散型回路紋', nameEn: 'Skin: Golden Circuit Leaf', nameTw: '背景：純金箔・分散型回路紋', nameCn: '背景：纯金箔・分散型回路纹', descJa: '豪奢極まる黄金の意匠。伝統的な金箔貼りのテクスチャに、最先端の集積回路が走る。', descEn: 'Extravagant gold leaf texture laced with state-of-the-art integrated circuits.', descTw: '豪奢至極的黃金設計。在傳統金箔質地之上，縱橫交錯著最尖端的積體電路紋理。', descCn: '豪奢至极的黄金设计。在传统金箔质地之上，纵横交错着最尖端的集成电路纹理。', price: 500, type: 'skin' }
];

type OmikujiResult = {
  fortune: string;
  detail: string;
  luckyItem: string;
  luckyLang: string;
  points: string;
  change: number;
  type: 'plus' | 'minus';
};

const OMIKUJI_POOL: { [key in LangMode]: OmikujiResult[] } = {
  ja: [
    { fortune: '大吉', detail: '最高にクリーンな1日。コードレビューは一発通過、インフラは完全に安定。想定外の臨時報酬を受け取るでしょう。', luckyItem: '無水エタノール', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: '吉', detail: '安定した運気。エラーログの解読が驚くほどスムーズに進みます。自販機で当たりが出るような小さな幸運があります。', luckyItem: 'Escキーの予備', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: '中吉', detail: 'まずまずの発展運。他人の書いたスパゲッティコードの中に、とても便利な共通関数を発見できそうです。', luckyItem: 'ノイズキャンセリングヘッドホン', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: '小吉', detail: '小さな進歩あり。数時間悩んだバグが、タイポ（一文字の間違い）だったことに気付いてスッキリ解決します。', luckyItem: 'ブルーライトカット眼鏡', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: '末吉', detail: '現状維持の運勢。大きな成果はありませんが、障害も起きません。定時退社を最優先にすると吉。', luckyItem: 'ドリップコーヒー', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: '凶', detail: 'やや波乱の予感。コンパイルエラーが多発し、財布から「両」がバグのように勝手に流出する恐れがあります。', luckyItem: 'リセットボタン', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: '大凶', detail: 'システム大破の危機！「ぬるぽ」が直撃し、思わぬ例外処理の連鎖でウォレットに大きな損害（ロスト）が発生します。', luckyItem: 'お祓い済みのUSBメモリ', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ],
  en: [
    { fortune: 'Great Blessing', detail: 'Ultra clean day. Code review passes in one shot. Uptime is 100%. An unexpected bonus lands in your wallet.', luckyItem: 'Anhydrous Ethanol', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: 'Blessing', detail: 'Stable luck. Deciphering error logs is smoother than ever. A small profit finds its way to you.', luckyItem: 'Spare Esc Keycap', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: 'Middle Blessing', detail: 'Decent growth. You will discover a hidden, highly reusable function inside legacy code spaghetti.', luckyItem: 'ANC Headphones', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: 'Small Blessing', detail: 'Minor progress. A bug bothering you for hours is solved instantly after spotting a tiny typo.', luckyItem: 'Blue-light Glasses', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: 'Future Blessing', detail: 'Status quo. No big breakthroughs, but no downtime either. Prioritize clocking out on time.', luckyItem: 'Drip Coffee', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: 'Curse', detail: 'Turbulent currents. Compilation errors spike, causing an unexpected leakage of coins from your wallet.', luckyItem: 'Physical Reset Button', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: 'Great Curse', detail: 'System Breakdown! NullPointer exception hits hard, causing massive damage and draining funds.', luckyItem: 'Blessed USB Drive', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ],
  zh_tw: [
    { fortune: '大吉', detail: '極致純淨的一天。程式碼審查一擊通關，雲端架構穩如泰山。將會獲得意料之外的電子福德。', luckyItem: '無水酒精', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: '吉', detail: '運勢平穩和順。解讀錯誤日誌異常順暢，能避開大部分的地雷。會遇到一些微小的幸運。', luckyItem: '備用 Esc 鍵帽', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: '中吉', detail: '穩定成長之運。在他人留下的陳年面條程式碼中，能驚喜挖掘到極具價值的共通函數。', luckyItem: '主動降噪耳機', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: '小吉', detail: '略有進步。困擾數小時的異常突然發現只是打錯字（Typo），修正後迎刃而解、通體舒暢。', luckyItem: '抗藍光眼鏡', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: '末吉', detail: '維持現狀。雖無亮眼突破但好在四海無事、系統安穩。今日宜將「準時下班」視為最高指導原則。', luckyItem: '濾掛式咖啡', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: '凶', detail: '略有波折之兆。編譯錯誤頻發，資產有如遭遇幽靈漏洞般，發生不明原因的些微流失。', luckyItem: '硬體重設按鈕', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: '大凶', detail: '系統崩潰崩壞危機！遭到「空指標 Null」正面突擊，引發例外處理連鎖效應，導致ウォレット嚴重虧損。', luckyItem: '受過法會淨化的隨身碟', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ],
  zh_cn: [
    { fortune: '大吉', detail: '极致纯净的一天。代码审查一击通关，云端架构稳如泰山。将会获得意料之外的电子福德。', luckyItem: '无水酒精', luckyLang: 'Rust', points: '▲━●━▼', change: 50, type: 'plus' },
    { fortune: '吉', detail: '运势平稳和顺。解读错误日志异常顺畅，能避开大部分的地雷。会遇到一些微小的幸运。', luckyItem: '备用 Esc 键帽', luckyLang: 'Go', points: '▲━●━▼', change: 20, type: 'plus' },
    { fortune: '中吉', detail: '稳定成长之运。在他人留下的陈年面条代码中，能惊喜挖掘到极具价值的共通函数。', luckyItem: '主动降噪耳机', luckyLang: 'Python', points: '▲━●━▼', change: 15, type: 'plus' },
    { fortune: '小吉', detail: '略有进步。困扰数小时的异常突然发现只是打错字（Typo），修正后迎刃而解、通体舒畅。', luckyItem: '抗蓝光眼镜', luckyLang: 'JavaScript', points: '▲━●━▼', change: 10, type: 'plus' },
    { fortune: '末吉', detail: '维持现状。虽无亮眼突破但好在四海无事、系统安稳。今日宜将“准时下班”视为最高指导原则。', luckyItem: '挂耳式咖啡', luckyLang: 'HTML / CSS', points: '▲━●━▼', change: 5, type: 'plus' },
    { fortune: '凶', detail: '略有波折之兆。编译错误频发，资产有如遭遇幽灵漏洞般，发生不明原因的些微流失。', luckyItem: '硬件重置按钮', luckyLang: 'C++', points: '▲━●━▼', change: -15, type: 'minus' },
    { fortune: '大凶', detail: '系统崩溃崩坏危机！遭到“空指针 Null”正面突击，引发异常处理连锁效应，导致钱包严重亏损。', luckyItem: '受过法会净化的闪存盘', luckyLang: 'Java', points: '▲━●━▼', change: -40, type: 'minus' }
  ]
};

// ⛩️ 1. 世界観に合わせた Error Boundary の定義
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }
class CyberShrineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  public static getDerivedStateFromError(_: Error): ErrorBoundaryState { return { hasError: true }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("結界破損:", error, errorInfo); }
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-200 font-serif flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-full max-w-md bg-stone-900 border-2 border-red-800 rounded p-6 shadow-2xl">
            <h1 className="text-2xl font-bold tracking-widest text-red-600 mb-4">🚨 警告：神社の結界が破れました</h1>
            <p className="text-xs text-stone-400 font-sans leading-relaxed mb-6">
              未定義の電脳パケットを受信したか、セーブデータに致命的な破損が検知されました。
              一度リロードするか、以下のお祓い（データ初期化）を実行してください。
            </p>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="bg-red-800 hover:bg-red-900 text-stone-100 font-bold py-2 px-6 rounded text-xs tracking-widest transition-colors font-sans"
            >
              初期化してお祓いする
            </button>
          </div>
        </div>
      );
    }
    return this.children;
  }
}

function CyberShrineContent() {
  const [lang, setLang] = useState<LangMode>('ja');
  const [tab, setTab] = useState<TabMode>('omikuji');
  const [wallet, setWallet] = useState<number>(300);
  const [inventory, setInventory] = useState<ShopItem[]>([]);
  const [logs, setLogs] = useState<{ id: string; date: string; fortune: string }[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>('skin_default');

  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [visionItem, setVisionItem] = useState<ShopItem | null>(null);

  // ⛩️ 2. 検索・フィルタリング・ソート用のステート
  const [shopSearch, setShopSearch] = useState('');
  const [shopCategory, setShopCategory] = useState<'all' | 'talisman' | 'skin'>('all');
  const [shopFilterOwned, setShopFilterOwned] = useState<boolean>(false);
  const [shopSort, setShopSort] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');

  // 夜間判定
  useEffect(() => {
    const checkTime = () => {
      const hours = new Date().getHours();
      setIsNight(hours >= 18 || hours < 6);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // ローカルストレージ連携
  useEffect(() => {
    const savedWallet = localStorage.getItem('cyber_wallet');
    const savedInv = localStorage.getItem('cyber_inventory');
    const savedLogs = localStorage.getItem('cyber_logs');
    const savedSkin = localStorage.getItem('cyber_skin');

    if (savedWallet) setWallet(Number(savedWallet));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedSkin) setActiveSkin(savedSkin);
  }, []);

  const saveToStorage = (newWallet: number, newInv: ShopItem[], newLogs: any[], newSkin: string) => {
    localStorage.setItem('cyber_wallet', newWallet.toString());
    localStorage.setItem('cyber_inventory', JSON.stringify(newInv));
    localStorage.setItem('cyber_logs', JSON.stringify(newLogs));
    localStorage.setItem('cyber_skin', newSkin);
  };

  // ⛩️ 3. 所持金のオーバーフロー・アンダーフロー対策対応ウォレット更新関数
  const updateWalletSafely = useCallback((amountChange: number, currentWallet: number) => {
    const MAX_WALLET = 999999;
    let nextWallet = currentWallet + amountChange;
    if (nextWallet < 0) nextWallet = 0;
    if (nextWallet > MAX_WALLET) nextWallet = MAX_WALLET;
    return nextWallet;
  }, []);

  // おみくじを引く
  const handleOmikuji = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      const pool = OMIKUJI_POOL[lang] || OMIKUJI_POOL['ja'];
      const idx = Math.floor(Math.random() * pool.length);
      const res = pool[idx];

      const nextWallet = updateWalletSafely(res.change, wallet);
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleTimeString(),
        fortune: res.fortune
      };
      const nextLogs = [newLog, ...logs].slice(0, 20);

      setWallet(nextWallet);
      setResult(res);
      setLogs(nextLogs);
      setIsRolling(false);

      saveToStorage(nextWallet, inventory, nextLogs, activeSkin);
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

    const nextWallet = updateWalletSafely(-item.price, wallet);
    const nextInv = [...inventory, item];
    let nextSkin = activeSkin;

    if (item.type === 'skin') {
      nextSkin = item.id;
      setActiveSkin(nextSkin);
    }

    setWallet(nextWallet);
    setInventory(nextInv);
    saveToStorage(nextWallet, nextInv, logs, nextSkin);
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
      setIsBurning(false);
      setShowModal(false);
    }, 2000); // 炎のアニメーションをじっくり見せるため2秒に変更
  };

  // ⛩ *A11y モーダルをEscキーで閉じる対応*
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isBurning) setShowModal(false);
        setVisionItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBurning]);

  // ⛩️ 2. 授与所のアイテムの 検索・フィルタリング・ソート処理
  const filteredShopItems = SHOP_ITEMS.filter(item => {
    // 夜間限定フィルタ
    if (item.isNightOnly && !isNight) return false;
    
    // カテゴリフィルタ
    if (shopCategory !== 'all' && item.type !== shopCategory) return false;

    // 未購入のみフィルタ
    const isOwned = inventory.some(i => i.id === item.id);
    if (shopFilterOwned && isOwned) return false;

    // 検索キーワードフィルタ
    const name = lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : lang === 'zh_tw' ? item.nameTw : item.nameCn;
    const desc = lang === 'ja' ? item.descJa : lang === 'en' ? item.descEn : lang === 'zh_tw' ? item.descTw : item.descCn;
    const searchTarget = `${name} ${desc}`.toLowerCase();
    if (shopSearch && !searchTarget.includes(shopSearch.toLowerCase())) return false;

    return true;
  }).sort((a, b) => {
    if (shopSort === 'priceAsc') return a.price - b.price;
    if (shopSort === 'priceDesc') return b.price - a.price;
    return 0; // デフォルト（ID順・配列順）
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-serif relative overflow-hidden flex flex-col items-center justify-start p-4 sm:p-6 select-none">
      
      {/* 背景スキン表示 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {activeSkin === 'skin_default' && (
          <div className="absolute inset-0 bg-[radial-gradient(at_center_center,#1c1917_0%,#0c0a09_100%)] opacity-80" />
        )}
        {activeSkin === 'skin_neon' && (
          <div className="absolute inset-0 bg-stone-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a1330_1px,transparent_1px),linear-gradient(to_bottom,#2a1330_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-t-4 border-x-2 border-fuchsia-500 rounded-t shadow-[0_0_20px_rgba(217,70,239,0.4)] opacity-60" />
          </div>
        )}
        {activeSkin === 'skin_matrix' && (
          <div className="absolute inset-0 bg-stone-950 opacity-20 overflow-hidden text-emerald-500 font-mono text-[10px] p-2 break-all leading-none">
            {Array.from({ length: 24 }).map(() => "014FDE20FFBC8A9023CCCC").join(" ")}
          </div>
        )}
        {activeSkin === 'skin_sakura' && (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 opacity-90">
            <div className="absolute top-12 left-12 w-2 h-2 bg-pink-500 rounded-full blur-xs opacity-40 animate-pulse" />
            <div className="absolute top-32 right-16 w-3 h-2 bg-rose-400 rounded-full blur-xs opacity-50 animate-pulse" />
          </div>
        )}
        {activeSkin === 'skin_gold' && (
          <div className="absolute inset-0 bg-[radial-gradient(at_center_center,#292524_0%,#0c0a09_100%)]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#78350f_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
            <div className="absolute inset-0 border-4 border-amber-500/10 m-4 pointer-events-none" />
          </div>
        )}
      </div>

      {/* ⛩️ メイン筐体 */}
      <div className="w-full max-w-md bg-stone-900/95 border-2 border-stone-800 rounded shadow-2xl p-4 sm:p-5 z-10 backdrop-blur-xs">
        
        {/* ヘッダー */}
        <div className="border-b border-stone-800 pb-2 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold tracking-widest text-red-800 flex items-center gap-1.5">
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
                className={`px-1.5 py-0.5 rounded transition-all uppercase ${lang === l ? 'bg-red-800 text-stone-100 font-bold' : 'text-stone-500 hover:text-stone-300'}`}
              >
                {l === 'zh_tw' ? '繁' : l === 'zh_cn' ? '简' : l}
              </button>
            ))}
          </div>
        </div>

        {/* ウォレット残高 (オーバーフロー対策済表示) */}
        <div className="bg-stone-950 p-2 rounded border border-stone-800 flex justify-between items-center mb-4 font-sans text-xs">
          <span className="text-stone-400">🪙 {lang === 'ja' ? '現在の所持金' : 'Wallet'}</span>
          <span className="text-base font-mono font-bold text-amber-500 tracking-wide">
            {wallet.toLocaleString()} <span className="text-[11px] font-serif text-stone-400">両</span>
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
            <div className="bg-stone-950 border border-stone-800 rounded p-5 mb-4 min-h-[140px] flex flex-col items-center justify-center">
              {isRolling ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[11px] text-stone-400 font-sans tracking-widest animate-pulse">神速乱数調律中...</p>
                </div>
              ) : result ? (
                <div className="w-full text-center">
                  <div className={`text-xl font-bold tracking-widest mb-2 ${result.type === 'plus' ? 'text-red-700' : 'text-stone-500'}`}>
                    【{result.fortune}】
                  </div>
                  <p className="text-xs text-stone-300 px-2 leading-relaxed mb-4 font-sans text-left border-t border-b border-stone-900 py-2">
                    {result.detail}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-left text-[10px] font-sans bg-stone-900 p-2 rounded border border-stone-800/40">
                    <div>
                      <span className="text-stone-500 block">💻 有縁の電脳物品</span>
                      <span className="text-stone-300 truncate block">{result.luckyItem}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">🔣 相性の良い言語</span>
                      <span className="text-red-500 font-mono font-bold">{result.luckyLang}</span>
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

        {/* ⛩️ 授与所（ショップ）タブ（検索・フィルタ・ソート実装済） */}
        {tab === 'shop' && (
          <div className="space-y-2">
            
            {/* ⛩️ 2. 検索・ソート・フィルタコントロールバー */}
            <div className="bg-stone-950 p-2 rounded border border-stone-800 space-y-2 font-sans text-[11px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'ja' ? '授与品を検索...' : 'Search items...'}
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  className="flex-1 bg-stone-900 border border-stone-800 rounded px-2 py-1 text-stone-200 text-xs focus:outline-none focus:border-red-800"
                />
                <select
                  value={shopSort}
                  onChange={(e) => setShopSort(e.target.value as any)}
                  className="bg-stone-900 border border-stone-800 rounded px-1.5 py-1 text-stone-300 focus:outline-none"
                >
                  <option value="default">{lang === 'ja' ? '標準順' : 'Default'}</option>
                  <option value="priceAsc">{lang === 'ja' ? '初穂料が低い順' : 'Price: Low to High'}</option>
                  <option value="priceDesc">{lang === 'ja' ? '初穂料が高い順' : 'Price: High to Low'}</option>
                </select>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <div className="flex gap-1.5">
                  {(['all', 'talisman', 'skin'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setShopCategory(cat)}
                      className={`px-2 py-0.5 rounded border transition-colors ${shopCategory === cat ? 'bg-stone-800 border-stone-700 text-red-400 font-bold' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
                    >
                      {cat === 'all' ? (lang === 'ja' ? '全種' : 'All') : cat === 'talisman' ? (lang === 'ja' ? '御守' : 'Amulet') : (lang === 'ja' ? '背景' : 'Skin')}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-1 cursor-pointer text-stone-400 select-none">
                  <input
                    type="checkbox"
                    checked={shopFilterOwned}
                    onChange={(e) => setShopFilterOwned(e.target.checked)}
                    className="accent-red-800 rounded bg-stone-900 border-stone-800"
                  />
                  <span>{lang === 'ja' ? '未拝受のみ' : 'Unowned'}</span>
                </label>
              </div>
            </div>

            <div className="text-[10px] text-stone-500 font-sans pl-1 flex justify-between">
              <span>{lang === 'ja' ? `授与品ラインナップ (${filteredShopItems.length}件)` : `Lineup (${filteredShopItems.length} items)`}</span>
              <span>{lang === 'ja' ? '※項目クリックで霊視可能' : '*Click to peer details'}</span>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {filteredShopItems.length === 0 ? (
                <div className="text-center text-stone-600 py-8 font-sans text-xs">
                  {lang === 'ja' ? '該当する授与品が見つかりません。' : 'No items match the filters.'}
                </div>
              ) : (
                filteredShopItems.map((item) => {
                  const isOwned = inventory.some(i => i.id === item.id);
                  const name = lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : lang === 'zh_tw' ? item.nameTw : item.nameCn;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => setVisionItem(item)}
                      className="p-2 bg-stone-950/60 border border-stone-800 rounded flex justify-between items-center gap-2 hover:border-stone-700 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold truncate text-stone-200">{name}</span>
                          {item.isNightOnly && <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-1 rounded font-sans">🌙 夜</span>}
                        </div>
                        <p className="text-[10px] text-stone-500 truncate font-sans">
                          {lang === 'ja' ? item.descJa : lang === 'en' ? item.descEn : lang === 'zh_tw' ? item.descTw : item.descCn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="font-mono text-amber-500 font-bold">{item.price}両</span>
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={isOwned}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans transition-colors ${isOwned ? 'bg-stone-800 text-stone-600' : 'bg-red-800 text-stone-100 hover:bg-red-900'}`}
                        >
                          {isOwned ? (lang === 'ja' ? '拝受済' : 'Owned') : (lang === 'ja' ? '拝受' : 'Buy')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 🎒 懐中袋（インベントリ）タブ */}
        {tab === 'inventory' && (
          <div className="space-y-2">
            <div className="text-[10px] text-stone-500 font-sans pl-1">
              {lang === 'ja' ? `所持している懐中物 (${inventory.length}個)` : `Your inventory (${inventory.length} items)`}
            </div>
            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {inventory.length === 0 ? (
                <div className="text-center text-stone-600 py-10 font-sans">
                  {lang === 'ja' ? '懐中袋は空です。授与所で御守をお受けください。' : 'Your bag is empty.'}
                </div>
              ) : (
                inventory.map((item) => {
                  const name = lang === 'ja' ? item.nameJa : lang === 'en' ? item.nameEn : lang === 'zh_tw' ? item.nameTw : item.nameCn;
                  return (
                    <div key={item.id} className="p-2 bg-stone-950/60 border border-stone-800 rounded flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-stone-200 truncate block">{name}</span>
                        <span className="text-[9px] text-stone-500 block truncate font-sans">
                          {lang === 'ja' ? item.descJa : lang === 'en' ? item.descEn : lang === 'zh_tw' ? item.descTw : item.descCn}
                        </span>
                      </div>
                      {item.type === 'skin' && (
                        <button
                          onClick={() => {
                            setActiveSkin(item.id);
                            saveToStorage(wallet, inventory, logs, item.id);
                          }}
                          disabled={activeSkin === item.id}
                          className={`ml-2 shrink-0 px-2 py-0.5 rounded text-[10px] font-sans transition-colors ${activeSkin === item.id ? 'bg-stone-800 text-stone-500 border border-stone-700' : 'bg-amber-800 text-amber-100 hover:bg-amber-900'}`}
                        >
                          {activeSkin === item.id ? (lang === 'ja' ? '適用中' : 'Active') : (lang === 'ja' ? '環境適用' : 'Apply')}
                        </button>
                      )}
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
              <button onClick={() => setShowModal(true)} className="text-red-800 hover:underline font-serif">
                {lang === 'ja' ? 'お焚き上げする' : 'Sacred Disposal'}
              </button>
            </div>
            <div className="max-h-[220px] overflow-y-auto space-y-1 bg-stone-950 p-2 rounded border border-stone-900 font-mono text-[11px] text-stone-400">
              {logs.length === 0 ? (
                <div className="text-center text-stone-700 py-10 font-serif">記録がありません。</div>
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

      {/* 🔮 霊視モーダル (A11y背景閉じ対応) */}
      {visionItem && (
        <div 
          onClick={() => setVisionItem(null)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-950 border-2 border-stone-800 max-w-xs w-full rounded p-5 shadow-2xl text-stone-200"
          >
            <span className="text-[9px] font-sans text-red-500 tracking-widest block mb-1">👁️ 授与品詳細霊視</span>
            <h4 className="text-base font-bold text-stone-100 mb-2 border-b border-stone-900 pb-1">
              {lang === 'ja' ? visionItem.nameJa : lang === 'en' ? visionItem.nameEn : lang === 'zh_tw' ? visionItem.nameTw : visionItem.nameCn}
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed font-sans mb-4">
              {lang === 'ja' ? visionItem.descJa : lang === 'en' ? visionItem.descEn : lang === 'zh_tw' ? visionItem.descTw : visionItem.descCn}
            </p>
            <div className="text-[10px] font-sans text-stone-500 space-y-0.5 bg-stone-900 p-2 rounded mb-4">
              <div>識別コード: <span className="font-mono text-stone-300">{visionItem.id}</span></div>
              <div>分類: <span className="text-stone-300">{visionItem.type === 'talisman' ? '御守護符' : '背景仕様'}</span></div>
              <div>奉納初穂料: <span className="font-mono text-amber-500 font-bold">{visionItem.price}両</span></div>
            </div>
            <button onClick={() => setVisionItem(null)} className="w-full bg-stone-800 text-stone-300 font-sans text-xs py-1.5 rounded hover:bg-stone-700 transition-colors">
              {lang === 'ja' ? '霊視を終了する' : 'Close Vision'}
            </button>
          </div>
        </div>
      )}

      {/* 🏮 お焚き上げモーダル (炎のアニメーション・A11y対応) */}
      {showModal && (
        <div 
          onClick={() => { if (!isBurning) setShowModal(false); }}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-50 border-2 border-red-800 max-w-xs w-full rounded p-6 shadow-2xl text-center text-stone-900 relative overflow-hidden"
          >
            {/* ⛩️ 4. お焚き上げ中のサイバー炎・煙アニメーション演出 */}
            {isBurning && (
              <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center z-10 transition-all duration-500 animate-fade-in">
                <div className="relative w-20 h-24 mb-2 flex items-end justify-center">
                  {/* 煙の粒子 */}
                  <div className="absolute bottom-12 w-6 h-6 bg-stone-500/30 rounded-full blur-md animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute bottom-16 w-4 h-4 bg-stone-600/20 rounded-full blur-xs animate-bounce" style={{ animationDuration: '2s' }} />
                  {/* 炎のレイヤー */}
                  <div className="w-10 h-16 bg-gradient-to-t from-red-600 via-orange-500 to-transparent rounded-full opacity-80 blur-xs animate-pulse" />
                  <div className="absolute bottom-0 w-6 h-12 bg-gradient-to-t from-amber-500 via-yellow-400 to-transparent rounded-full opacity-90 animate-pulse" style={{ animationDuration: '0.6s' }} />
                </div>
                <p className="text-xs text-red-500 font-serif font-bold tracking-widest animate-pulse">
                  {lang === 'ja' ? '因果消滅・データ昇華中...' : 'Purging digital karma...'}
                </p>
              </div>
            )}

            <h4 className="text-base font-bold text-red-800 mb-2">{lang === 'ja' ? '御神籤お焚き上げ' : 'Sacred Disposal'}</h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-5 font-sans">
              {lang === 'ja' ? 'これまでの参拝履歴、所持金、ならびに購入したお守りをすべて消去します。よろしいですか？' : 'This will securely clear all your logs, wallets and items. Proceed?'}
            </p>
            <div className="flex gap-3 justify-center text-xs font-sans">
              <button onClick={handleClear} disabled={isBurning} className="bg-red-800 text-stone-100 font-bold px-4 py-2 rounded hover:bg-red-900 transition-colors">
                {lang === 'ja' ? 'お焚き上げする' : 'Dispose'}
              </button>
              <button onClick={() => setShowModal(false)} disabled={isBurning} className="bg-stone-200 text-stone-700 font-bold px-4 py-2 rounded hover:bg-stone-300 transition-colors">
                {lang === 'ja' ? '中止' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ⛩️ 1. エラーバウンダリでアプリ全体を保護してエクスポート
export default function CyberShrine() {
  return (
    <CyberShrineErrorBoundary>
      <CyberShrineContent />
    </CyberShrineErrorBoundary>
  );
}
