export type ItemType = "board" | "dice" | "token" | "frame" | "trail" | "emoji";

export interface BoardTheme {
  bg: string;
  gridStroke: string;
  gridStrokeWidth: number;
  colors?: {
    red: string;
    green: string;
    yellow: string;
    blue: string;
  };
}

export interface DiceTheme {
  face: string;
  dot: string;
}

export interface TokenTheme {
  shape: "circle" | "crown" | "gem" | "star" | "pin";
}

export interface FrameTheme {
  cssClass: string;
}

export interface TrailTheme {
  cssClass: string;
}

export interface EmojiTheme {
  emojis: string[];
}

export interface StoreItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  price: number;
  icon: string;
  boardTheme?: BoardTheme;
  diceTheme?: DiceTheme;
  tokenTheme?: TokenTheme;
  frameTheme?: FrameTheme;
  trailTheme?: TrailTheme;
  emojiTheme?: EmojiTheme;
}

export const STORE_ITEMS: StoreItem[] = [
  // Boards
  {
    id: "board_default",
    type: "board",
    name: "الكلاسيكية",
    description: "الرقعة السوداء الأصلية للعبة.",
    price: 0,
    icon: "⬛",
    boardTheme: { bg: "#111827", gridStroke: "#1f2937", gridStrokeWidth: 1 },
  },
  {
    id: "board_wood",
    type: "board",
    name: "الخشبية",
    description: "رقعة كلاسيكية من خشب البلوط.",
    price: 1000,
    icon: "🪵",
    boardTheme: { 
      bg: "#8B5A2B", 
      gridStroke: "#5C3A21", 
      gridStrokeWidth: 2,
      colors: { red: "#8b0000", green: "#006400", yellow: "#b8860b", blue: "#00008b" }
    },
  },
  {
    id: "board_neon",
    type: "board",
    name: "نيون سيتي",
    description: "رقعة ليلية بخطوط مشعة.",
    price: 1500,
    icon: "🌃",
    boardTheme: { 
      bg: "#000000", 
      gridStroke: "#39ff14", 
      gridStrokeWidth: 2,
      colors: { red: "#ff003c", green: "#39ff14", yellow: "#ffea00", blue: "#00f0ff" }
    },
  },
  {
    id: "board_desert",
    type: "board",
    name: "الصحراء",
    description: "رمال وغموض الواحة.",
    price: 2000,
    icon: "🏜️",
    boardTheme: { 
      bg: "#EDC9af", 
      gridStroke: "#8B5A2B", 
      gridStrokeWidth: 2,
      colors: { red: "#cd5c5c", green: "#556b2f", yellow: "#f4a460", blue: "#4682b4" }
    },
  },
  {
    id: "board_royal",
    type: "board",
    name: "البلاط الملكي",
    description: "رقعة فاخرة باللون الأرجواني الداكن.",
    price: 2500,
    icon: "👑",
    boardTheme: { 
      bg: "#2E0854", 
      gridStroke: "#FFD700", 
      gridStrokeWidth: 1.5,
      colors: { red: "#800020", green: "#228B22", yellow: "#FFD700", blue: "#483D8B" }
    },
  },
  {
    id: "board_ocean",
    type: "board",
    name: "موج البحر",
    description: "رقعة مائية بألوان المحيط الهادئة.",
    price: 3000,
    icon: "🌊",
    boardTheme: { 
      bg: "#006994", 
      gridStroke: "#7FFFD4", 
      gridStrokeWidth: 1.5,
      colors: { red: "#FF7F50", green: "#20B2AA", yellow: "#FFE4B5", blue: "#00008B" }
    },
  },
  
  // Dice
  {
    id: "dice_default",
    type: "dice",
    name: "النرد الأبيض",
    description: "النرد الكلاسيكي المعتاد.",
    price: 0,
    icon: "🎲",
    diceTheme: { face: "#ffffff", dot: "#000000" },
  },
  {
    id: "dice_gold",
    type: "dice",
    name: "النرد الذهبي",
    description: "نرد الأثرياء بلمعان ذهبي.",
    price: 1500,
    icon: "🏅",
    diceTheme: { face: "#FFD700", dot: "#000000" },
  },
  {
    id: "dice_neon",
    type: "dice",
    name: "نرد النيون",
    description: "نرد أسود بنقاط خضراء مشعة.",
    price: 800,
    icon: "🔋",
    diceTheme: { face: "#111111", dot: "#39ff14" },
  },
  {
    id: "dice_bloody",
    type: "dice",
    name: "نرد السفاح",
    description: "نرد أحمر غامق بنقاط بيضاء.",
    price: 1200,
    icon: "🩸",
    diceTheme: { face: "#8b0000", dot: "#ffffff" },
  },
  {
    id: "dice_ocean",
    type: "dice",
    name: "نرد المحيط",
    description: "نرد بلون أزرق مائي شفاف.",
    price: 1000,
    icon: "🌊",
    diceTheme: { face: "#00ced1", dot: "#00008b" },
  },
  {
    id: "dice_black",
    type: "dice",
    name: "النرد الأسود",
    description: "نرد أسود كلاسيكي بنقاط بيضاء.",
    price: 900,
    icon: "⬛",
    diceTheme: { face: "#000000", dot: "#ffffff" },
  },
  
  // Tokens
  {
    id: "token_default",
    type: "token",
    name: "بيدق دائري",
    description: "البيدق الكلاسيكي الأصلي.",
    price: 0,
    icon: "⚪",
    tokenTheme: { shape: "circle" },
  },
  {
    id: "token_crown",
    type: "token",
    name: "التاج الملكي",
    description: "بيدق فاخر على شكل تاج.",
    price: 300,
    icon: "👑",
    tokenTheme: { shape: "crown" },
  },
  {
    id: "token_gem",
    type: "token",
    name: "الجوهرة",
    description: "بيدق ماسي لامع.",
    price: 500,
    icon: "💎",
    tokenTheme: { shape: "gem" },
  },
  {
    id: "token_star",
    type: "token",
    name: "النجمة",
    description: "بيدق على شكل نجمة ساطعة.",
    price: 400,
    icon: "⭐",
    tokenTheme: { shape: "star" },
  },
  {
    id: "token_pin",
    type: "token",
    name: "دبوس الخريطة",
    description: "بيدق على شكل دبوس الخرائط.",
    price: 600,
    icon: "📍",
    tokenTheme: { shape: "pin" },
  },

  // Frames
  {
    id: "frame_default",
    type: "frame",
    name: "بدون إطار",
    description: "الصورة الشخصية العادية.",
    price: 0,
    icon: "🖼️",
    frameTheme: { cssClass: "" },
  },
  {
    id: "frame_fire",
    type: "frame",
    name: "النار المشتعلة",
    description: "إطار ناري متحرك حول صورتك.",
    price: 800,
    icon: "🔥",
    frameTheme: { cssClass: "ring-4 ring-orange-500 shadow-[0_0_15px_#f97316] animate-pulse" },
  },
  {
    id: "frame_neon",
    type: "frame",
    name: "نيون سايبربانك",
    description: "إطار فسفوري مشع.",
    price: 1000,
    icon: "⚡",
    frameTheme: { cssClass: "ring-4 ring-[#39ff14] shadow-[0_0_20px_#39ff14]" },
  },
  {
    id: "frame_golden_wreath",
    type: "frame",
    name: "الإكليل الذهبي",
    description: "إطار راقي بأوراق الذهب المتلألئة.",
    price: 1200,
    icon: "🌿",
    frameTheme: { cssClass: "ring-4 ring-[#FFD700] shadow-[0_0_15px_#FFD700] border-[2px] border-dashed border-[#B8860B]" },
  },
  {
    id: "frame_roses",
    type: "frame",
    name: "إطار الورود",
    description: "إطار مزين بألوان الورود الزاهية.",
    price: 700,
    icon: "🌹",
    frameTheme: { cssClass: "ring-4 ring-[#FF1493] shadow-[0_0_15px_#FF69B4]" },
  },

  // Trails
  {
    id: "trail_default",
    type: "trail",
    name: "بدون تأثير",
    description: "الحركة الكلاسيكية العادية.",
    price: 0,
    icon: "🚶",
    trailTheme: { cssClass: "" },
  },
  {
    id: "trail_glow",
    type: "trail",
    name: "البريق السحري",
    description: "يترك الحجر توهجاً سحرياً.",
    price: 600,
    icon: "✨",
    trailTheme: { cssClass: "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" },
  },

  // Emojis
  {
    id: "emoji_pack_1",
    type: "emoji",
    name: "حزمة الاستفزاز",
    description: "مجموعة مشاعر استفزازية.",
    price: 500,
    icon: "😏",
    emojiTheme: { emojis: ["😏", "🥱", "👎", "🤡", "EZ"] },
  },
  {
    id: "emoji_pack_2",
    type: "emoji",
    name: "حزمة الوحوش",
    description: "مشاعر الرعب والوحوش.",
    price: 400,
    icon: "👻",
    emojiTheme: { emojis: ["👻", "👽", "👹", "💀", "🦇"] },
  },
  {
    id: "emoji_pack_cats",
    type: "emoji",
    name: "حزمة القطط",
    description: "مشاعر قطط لطيفة ومضحكة.",
    price: 450,
    icon: "🐱",
    emojiTheme: { emojis: ["😺", "😹", "😻", "😼", "🙀", "😿", "😾"] },
  },
];
