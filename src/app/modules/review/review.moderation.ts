interface ModerationResult {
  approved: boolean;
  reason?: string;
}

const BAD_WORDS = [
  // Chửi thề tiếng Việt
  "đụ",
  "đù",
  "địt",
  "đéo",
  "đ éo",
  "đ.éo",
  "lồn",
  "cặc",
  "buồi",
  "vãi",
  "chó",
  "chó chết",
  "mẹ mày",
  "mẹ m",
  "má mày",
  "cái lon",
  "cái lồn",
  "thằng chó",
  "con chó",
  "đồ chó",
  "ngu",
  "óc chó",
  "đần",
  "khùng",
  "điên",
  "thần kinh",
  "vô học",
  "mất dạy",
  "vô dạy",
  "súc vật",
  "đỉ",
  "điếm",
  "cave",
  "gái gọi",
  "thằng điên",
  "con điên",
  "tiên sư",
  "tiên sư mày",
  "đồ ngu",
  "thằng ngu",
  "con ngu",

  // Bypass phổ biến
  "d.u",
  "d u m",
  "l.o.n",
  "c.a.c",
  "b.u.o.i",

  // Tiếng Anh
  "fuck",
  "f*ck",
  "f**k",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "pussy",
  "cunt",
  "nigger",
  "faggot",
  "retard",
];

const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const moderateReview = async (content: string): Promise<ModerationResult> => {
  const normalized = normalize(content);

  const found = BAD_WORDS.find((word) => {
    const normalizedWord = normalize(word);
    return normalized.includes(normalizedWord);
  });

  if (found) {
    return { approved: false, reason: "Nội dung chứa từ ngữ không phù hợp" };
  }

  return { approved: true };
};
