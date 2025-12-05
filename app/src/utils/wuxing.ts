/**
 * 五行配色工具
 * 统一管理五行颜色，供各组件使用
 */

// 五行颜色常量（与合盘保持一致）
export const WUXING_COLORS = {
  wood: '#22c55e',   // 木：绿色
  fire: '#ef4444',   // 火：红色
  earth: '#81710f',  // 土：褐色
  metal: '#d97706',  // 金：金色/橙金色
  water: '#1f2937',  // 水：黑色
} as const;

// 天干地支与五行的映射关系
const GANZHI_WUXING_MAP: Record<string, keyof typeof WUXING_COLORS> = {
  // 天干
  '甲': 'wood',
  '乙': 'wood',
  '丙': 'fire',
  '丁': 'fire',
  '戊': 'earth',
  '己': 'earth',
  '庚': 'metal',
  '辛': 'metal',
  '壬': 'water',
  '癸': 'water',
  // 地支
  '子': 'water',
  '丑': 'earth',
  '寅': 'wood',
  '卯': 'wood',
  '辰': 'earth',
  '巳': 'fire',
  '午': 'fire',
  '未': 'earth',
  '申': 'metal',
  '酉': 'metal',
  '戌': 'earth',
  '亥': 'water',
};

/**
 * 获取干支对应的五行颜色
 * @param ganZhi 天干或地支
 * @returns 对应的颜色值（十六进制）
 */
export function getWuXingColor(ganZhi: string): string {
  const wuxing = GANZHI_WUXING_MAP[ganZhi];
  return wuxing ? WUXING_COLORS[wuxing] : '#666666';
}

/**
 * 获取五行名称
 * @param ganZhi 天干或地支
 * @returns 五行名称
 */
export function getWuXingName(ganZhi: string): string {
  const wuxing = GANZHI_WUXING_MAP[ganZhi];
  const nameMap = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  };
  return wuxing ? nameMap[wuxing] : '未知';
}

/**
 * 批量获取干支颜色
 * @param ganzhiList 干支数组
 * @returns 颜色数组
 */
export function getWuXingColors(ganzhiList: string[]): string[] {
  return ganzhiList.map(getWuXingColor);
}
