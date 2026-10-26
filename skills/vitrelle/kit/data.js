/*
  VITRELLE desk data. This is the only file you edit day to day.
  Everything below is sample content for a fictional person. Replace it with your own.

  profile
    name            shown in the greeting
    lang            "zh" (Traditional Chinese) or "en"
    theme           "dark" or "light"
    accent          any CSS color for title bars, rings and highlights
    background      "aurora" (moving light) or a path to your own photo, e.g. "assets/bg.jpg"
    privacy         true hides every money amount as ＊＊＊＊＊ (press P or the eye chip to toggle)
    upIsRed         true for markets where rising prices are red (Taiwan, Japan, China)
    chips           short status labels at the top right
    reloadMinutes   how often the page re-reads this file (0 turns it off)

  layout   4 to 8 card ids, in reading order. Available ids:
           schedule, todo, mail, sleep, weather, markets, income, habits,
           focus, countdown, goals, note
  cards    one block per card id. Any card can take "title" to rename it,
           "updated" ("08:10") to show when you last refreshed it,
           and "size": "tall" to span both rows.
*/
window.DESK = {
  profile: {
    name: 'Mia',
    lang: 'zh',
    theme: 'dark',
    accent: '#ff5a3c',
    background: 'aurora',
    privacy: true,
    upIsRed: false,
    chips: ['週一 · 專注日'],
    reloadMinutes: 10,
  },

  layout: ['schedule', 'mail', 'sleep', 'weather', 'todo', 'income', 'habits'],

  cards: {
    // time "HH:MM", end optional (defaults to one hour), allDay for holidays and trips
    schedule: {
      updated: '08:10',
      today: [
        { allDay: true, title: '設計週', tag: '提醒' },
        { time: '09:30', end: '10:15', title: '晨間：讀產業新聞', tag: '例行' },
        { time: '11:00', end: '12:00', title: '品牌提案會議', tag: '線上' },
        { time: '14:00', end: '15:30', title: '網站改版設計', tag: '專注' },
        { time: '16:30', end: '17:00', title: '客戶回饋整理', tag: '' },
        { time: '19:30', end: '20:30', title: '健身房', tag: '個人' },
        { time: '22:00', end: '22:30', title: '寫明天的待辦', tag: '例行' },
      ],
      tomorrow: [
        { time: '10:00', title: '牙醫回診', tag: '個人' },
        { time: '14:30', title: '合作夥伴通話', tag: '線上' },
        { time: '19:00', title: '朋友聚餐', tag: '個人' },
      ],
    },

    todo: {
      items: [
        { text: '寄出第二版報價單', done: true },
        { text: '整理品牌色票', due: '今天' },
        { text: '回覆攝影師檔期' },
        { text: '繳信用卡費', due: '週三' },
        { text: '備份作品集' },
      ],
    },

    mail: {
      updated: '08:10',
      items: [
        { from: '王小姐（設計工作室）', tag: '工作', subject: '報價單第二版確認', note: '等你確認交期與尾款', urgent: true },
        { from: '品牌合作窗口', tag: '工作', subject: '社群貼文腳本初稿', note: '對方希望週三前收到修改版' },
        { from: '房東', tag: '個人', subject: '下個月起調整管理費', note: '回覆是否同意' },
      ],
    },

    // minutes asleep, stages in minutes; score 0 to 100 is your own estimate
    sleep: {
      source: 'Apple Health',
      minutes: 412, from: '00:48', to: '08:05',
      stages: { deep: 68, rem: 92, light: 230, awake: 22 },
      score: 78, label: '精神不錯，適合處理難的事',
      vitals: 'HRV 42ms · 靜止心率 61 · 血氧 97%',
    },

    // lat / lon turns on live weather (free, no key). Without them, fill temp, code, hi, lo by hand.
    weather: { city: '台北', lat: 25.033, lon: 121.565 },

    // "coingecko" ids update live; other rows keep the numbers you write here
    markets: {
      updated: '收盤',
      items: [
        { symbol: 'BTC', name: 'Bitcoin', coingecko: 'bitcoin' },
        { symbol: 'ETH', name: 'Ethereum', coingecko: 'ethereum' },
        { symbol: '0050', name: '元大台灣 50', price: 198.35, change: 0.82, spark: [192, 194, 193, 195, 197, 196, 198.35] },
        { symbol: 'QQQ', name: 'Nasdaq 100', price: 704.40, change: -0.01, spark: [699, 703, 706, 702, 705, 704.5, 704.4] },
      ],
    },

    income: {
      currency: 'NT$', period: '10 月', change: '+12.6%',
      items: [
        { name: '接案設計', short: '案', amount: 68000, note: '3 個專案' },
        { name: '線上課程', short: '課', amount: 21400, note: '新增 18 位學員' },
        { name: '模板銷售', short: '模', amount: 9600, note: '售出 32 份' },
      ],
      latest: '最新入帳：模板銷售 1 份',
    },

    // days: the last six days, oldest first (1 = done). Today is tapped on the desk itself.
    habits: {
      items: [
        { name: '喝水 2000ml', days: [1, 1, 1, 0, 1, 1] },
        { name: '運動 30 分', days: [1, 0, 1, 1, 0, 1] },
        { name: '閱讀 20 頁', days: [0, 1, 1, 1, 1, 1] },
        { name: '12 點前睡', days: [0, 0, 1, 0, 1, 1] },
      ],
    },

    focus: { minutes: 25, label: '網站改版設計' },

    countdown: {
      items: [
        { name: '日本旅行', date: '2026-12-18' },
        { name: '作品集截稿', date: '2026-11-15' },
        { name: '跨年', date: '2027-01-01' },
      ],
    },

    goals: {
      items: [
        { name: '今年讀完 24 本書', current: 17, target: 24, unit: '本' },
        { name: 'Instagram 追蹤', current: 8420, target: 10000, unit: '' },
        { name: '旅行基金', current: 42000, target: 60000, unit: '', money: true },
      ],
    },

    note: { text: '先完成，再完美。', by: '貼在螢幕旁的那張便利貼' },
  },
};
