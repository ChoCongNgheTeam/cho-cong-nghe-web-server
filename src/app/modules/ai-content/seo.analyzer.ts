import { SEOScore } from "./ai-content.types";

// ============================================================
// SEO ANALYZER
// Phân tích nội dung thuần JavaScript — không cần 3rd party
// Đủ dùng cho admin cơ bản, không cần Ahrefs/SEMrush giai đoạn này
// ============================================================

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countWords = (text: string): number => text.split(/\s+/).filter((w) => w.length > 0).length;

// Tính keyword density (%) — tính cả n-gram
const calcKeywordDensity = (text: string, keyword: string): number => {
  const normalizedText = text.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();
  const words = countWords(normalizedText);
  if (words === 0) return 0;

  // Count occurrences
  let count = 0;
  let pos = 0;
  while ((pos = normalizedText.indexOf(normalizedKeyword, pos)) !== -1) {
    count++;
    pos += normalizedKeyword.length;
  }

  // Keyword density tính theo số lần xuất hiện / tổng từ * 100
  const keywordWordCount = countWords(normalizedKeyword);
  return parseFloat((((count * keywordWordCount) / words) * 100).toFixed(2));
};

// Readability score: dựa trên độ dài câu và đoạn văn
const calcReadabilityScore = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return 50;

  const avgWordsPerSentence = sentences.reduce((acc, s) => acc + countWords(s), 0) / sentences.length;

  // Lý tưởng: 15-20 từ/câu
  // > 25 từ/câu → khó đọc
  // < 8 từ/câu → quá ngắn
  let score = 100;
  if (avgWordsPerSentence > 30) score -= 30;
  else if (avgWordsPerSentence > 25) score -= 20;
  else if (avgWordsPerSentence > 20) score -= 10;
  else if (avgWordsPerSentence < 8) score -= 15;

  return Math.max(0, Math.min(100, score));
};

// Score cho title
const calcTitleScore = (title: string, keyword: string): number => {
  let score = 0;
  const titleLower = title.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // Keyword trong title: +40
  if (titleLower.includes(keywordLower)) score += 40;

  // Keyword ở đầu title: thêm +20
  if (titleLower.startsWith(keywordLower)) score += 20;

  // Độ dài title: 50-60 ký tự là lý tưởng cho SEO
  const len = title.length;
  if (len >= 50 && len <= 60) score += 40;
  else if (len >= 40 && len < 50) score += 25;
  else if (len > 60 && len <= 70) score += 25;
  else if (len >= 30 && len < 40) score += 15;
  else score += 5;

  return Math.min(100, score);
};

// Score cho độ dài nội dung
const calcLengthScore = (wordCount: number, contentType: "product" | "blog"): number => {
  if (contentType === "product") {
    // Product description: 150-500 từ là tốt
    if (wordCount >= 200 && wordCount <= 400) return 100;
    if (wordCount >= 150 && wordCount < 200) return 80;
    if (wordCount > 400 && wordCount <= 600) return 80;
    if (wordCount < 150) return 50;
    return 60;
  } else {
    // Blog post: 600-1500 từ là tốt
    if (wordCount >= 800 && wordCount <= 1500) return 100;
    if (wordCount >= 600 && wordCount < 800) return 80;
    if (wordCount > 1500 && wordCount <= 2000) return 80;
    if (wordCount < 400) return 40;
    return 65;
  }
};

// Suggestions cụ thể dựa trên kết quả
const buildSuggestions = (titleScore: number, keywordDensity: number, readabilityScore: number, wordCount: number, keyword: string, title: string, contentType: "product" | "blog"): string[] => {
  const suggestions: string[] = [];

  if (!title.toLowerCase().includes(keyword.toLowerCase())) {
    suggestions.push(`Thêm từ khóa "${keyword}" vào tiêu đề`);
  } else if (!title.toLowerCase().startsWith(keyword.toLowerCase())) {
    suggestions.push(`Đặt từ khóa "${keyword}" ở đầu tiêu đề để tăng điểm SEO`);
  }

  if (title.length < 40) {
    suggestions.push(`Tiêu đề quá ngắn (${title.length} ký tự). Nên viết 50-60 ký tự`);
  } else if (title.length > 70) {
    suggestions.push(`Tiêu đề quá dài (${title.length} ký tự). Google hiển thị tối đa ~60 ký tự`);
  }

  if (keywordDensity < 0.5) {
    suggestions.push(`Từ khóa "${keyword}" xuất hiện quá ít (${keywordDensity}%). Nên đạt 1-2%`);
  } else if (keywordDensity > 3) {
    suggestions.push(`Từ khóa "${keyword}" xuất hiện quá nhiều (${keywordDensity}%). Có thể bị phạt "keyword stuffing"`);
  }

  if (readabilityScore < 70) {
    suggestions.push("Câu văn quá dài. Nên chia nhỏ thành câu 15-20 từ để dễ đọc hơn");
  }

  const minWords = contentType === "product" ? 150 : 600;
  if (wordCount < minWords) {
    suggestions.push(`Nội dung quá ngắn (${wordCount} từ). ${contentType === "product" ? "Mô tả sản phẩm nên có ít nhất 150 từ" : "Bài blog nên có ít nhất 600 từ"}`);
  }

  if (suggestions.length === 0) {
    suggestions.push("Nội dung đạt tiêu chuẩn SEO tốt! Có thể thêm internal links để tăng điểm.");
  }

  return suggestions;
};

// ─── MAIN: analyzeSEO ───────────────────────────────────────
export const analyzeSEO = (content: string, title: string, keyword: string, contentType: "product" | "blog" = "product"): SEOScore => {
  const plainText = stripHtml(content);
  const wordCount = countWords(plainText);
  const keywordDensity = calcKeywordDensity(plainText, keyword);
  const keywordCount = Math.round((keywordDensity / 100) * wordCount);
  const titleScore = calcTitleScore(title, keyword);
  const readabilityScore = calcReadabilityScore(plainText);
  const lengthScore = calcLengthScore(wordCount, contentType);

  // Tính keyword density score: 0.5-2% → 100, ngoài khoảng → giảm
  let densityScore = 0;
  if (keywordDensity >= 0.5 && keywordDensity <= 2) densityScore = 100;
  else if (keywordDensity >= 0.3 && keywordDensity < 0.5) densityScore = 70;
  else if (keywordDensity > 2 && keywordDensity <= 3) densityScore = 70;
  else if (keywordDensity > 3) densityScore = 30;
  else densityScore = 40;

  // Overall score: weighted average
  const overall = Math.round(titleScore * 0.3 + densityScore * 0.25 + readabilityScore * 0.25 + lengthScore * 0.2);

  const suggestions = buildSuggestions(titleScore, keywordDensity, readabilityScore, wordCount, keyword, title, contentType);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    details: {
      titleScore,
      keywordDensity,
      readabilityScore,
      lengthScore,
    },
    suggestions,
    keywordCount,
    wordCount,
  };
};
