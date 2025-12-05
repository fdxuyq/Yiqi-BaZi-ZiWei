/**
 * 十神简化映射工具
 * 将完整的十神名称转换为单字简称
 */

/**
 * 十神完整名称到简化单字的映射表
 * 正财=财，偏财=才，正印=印，偏印=枭
 */
export const SHISHEN_SHORT_MAP: Record<string, string> = {
  '比肩': '比',
  '劫财': '劫',
  '食神': '食',
  '伤官': '伤',
  '偏财': '才',
  '正财': '财',
  '七杀': '杀',
  '正官': '官',
  '偏印': '枭',
  '正印': '印'
};

/**
 * 获取十神的简化单字
 * @param shishen 完整十神名称
 * @returns 简化单字
 */
export function getShortShishen(shishen: string): string {
  return SHISHEN_SHORT_MAP[shishen] || shishen;
}

/**
 * 获取十神的完整名称（从简化单字）
 * @param shortShishen 简化单字
 * @returns 完整十神名称
 */
export function getFullShishen(shortShishen: string): string {
  const reverseMap: Record<string, string> = {};
  for (const [full, short] of Object.entries(SHISHEN_SHORT_MAP)) {
    reverseMap[short] = full;
  }
  return reverseMap[shortShishen] || shortShishen;
}

/**
 * 十神分类配色（用于UI显示）
 */
export const SHISHEN_COLOR_MAP: Record<string, string> = {
  '比肩': '#16a34a',  // 绿色（比劫）
  '劫财': '#15803d',
  '食神': '#ea580c',  // 橙色（食伤）
  '伤官': '#c2410c',
  '偏财': '#eab308',  // 黄色（财）
  '正财': '#ca8a04',
  '七杀': '#dc2626',  // 红色（官杀）
  '正官': '#b91c1c',
  '偏印': '#2563eb',  // 蓝色（印）
  '正印': '#1e40af'
};

/**
 * 获取十神的配色
 * @param shishen 完整十神名称
 * @returns 颜色值
 */
export function getShishenColor(shishen: string): string {
  return SHISHEN_COLOR_MAP[shishen] || '#6b7280';
}
