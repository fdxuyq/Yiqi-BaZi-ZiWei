// 节气计算模块

// 24节气名称
export const JIEQI_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 节气对应的地支月（立春开始为寅月）
export const JIEQI_MONTHS = [
  11, 11, 0, 0, 1, 1,  // 小寒(子月), 大寒(子月), 立春(寅月), 雨水(寅月), 惊蛰(卯月), 春分(卯月)
  2, 2, 3, 3, 4, 4,    // 清明(辰月), 谷雨(辰月), 立夏(巳月), 小满(巳月), 芒种(午月), 夏至(午月)
  5, 5, 6, 6, 7, 7,    // 小暑(未月), 大暑(未月), 立秋(申月), 处暑(申月), 白露(酉月), 秋分(酉月)
  8, 8, 9, 9, 10, 10   // 寒露(戌月), 霜降(戌月), 立冬(亥月), 小雪(亥月), 大雪(子月), 冬至(子月)
];

/**
 * 计算指定年份的节气时刻（简化算法）
 * 注：这是一个简化版本，实际应用中需要更精确的天文算法
 * @param year 年份
 * @returns 24个节气的儒略日时刻
 */
export function calculateJieqi(year: number): number[] {
  const jieqiTimes: number[] = [];
  
  // 基础数据：2000年各节气的大致日期（儒略日）
  const base2000 = [
    2451549.5, 2451564.5, 2451579.5, 2451594.5, 2451609.5, 2451624.5, // 1-6
    2451639.5, 2451654.5, 2451670.5, 2451685.5, 2451700.5, 2451715.5, // 7-12
    2451730.5, 2451745.5, 2451761.5, 2451776.5, 2451791.5, 2451806.5, // 13-18
    2451821.5, 2451836.5, 2451852.5, 2451867.5, 2451882.5, 2451897.5  // 19-24
  ];
  
  const yearDiff = year - 2000;
  
  for (let i = 0; i < 24; i++) {
    // 简化计算：每年节气时间的平均变化
    const dayOffset = yearDiff * 365.2422 - Math.floor(yearDiff / 4) + Math.floor(yearDiff / 100) - Math.floor(yearDiff / 400);
    jieqiTimes.push(base2000[i] + dayOffset);
  }
  
  return jieqiTimes;
}

/**
 * 根据公历日期确定节气月（干支月）
 * @param year 年
 * @param month 月
 * @param day 日
 * @returns 地支月份的索引（0-11对应寅-丑）
 */
export function getJieqiMonth(year: number, month: number, day: number): number {
  const jieqiTimes = calculateJieqi(year);
  
  // 计算当前日期的儒略日
  const a = Math.floor((14 - month) / 12);
  const y = year - a;
  const m = month + 12 * a - 3;
  const currentJD = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
                   Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
  
  // 找到当前日期所在的节气区间
  for (let i = 0; i < 24; i += 2) { // 只检查节气（奇数索引是中气）
    const jieqi = jieqiTimes[i];
    const nextJieqi = i + 2 < 24 ? jieqiTimes[i + 2] : jieqiTimes[2] + 365.25; // 下一个节气或明年立春
    
    if (currentJD >= jieqi && currentJD < nextJieqi) {
      return JIEQI_MONTHS[i];
    }
  }
  
  // 默认返回子月
  return 11;
}

/**
 * 获取月干支
 * @param year 年
 * @param month 月
 * @param day 日
 * @returns 月干支
 */
export function getMonthGanZhi(year: number, month: number, day: number) {
  const jieqiMonth = getJieqiMonth(year, month, day);
  const yearGanIndex = (year - 4) % 10; // 使用修正后的年干算法
  
  // 月干推算：甲己之年丙作首（正月为丙寅）
  const monthGanBaseMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 甲年丙寅，乙年戊寅...
  const monthGanBase = monthGanBaseMap[yearGanIndex];
  const monthGanIndex = (monthGanBase + jieqiMonth) % 10;
  
  return {
    gan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][monthGanIndex] as any,
    zhi: ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][jieqiMonth] as any
  };
}
