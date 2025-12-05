<template>
    <div class="bazi-chart-wrapper">
      <div class="bazi-chart-professional">
      <!-- 基本信息栏 -->
        <div class="basic-info-bar">
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <div class="user-details">
              <div class="user-name">命主</div>
              <div class="user-gender">{{ chartData.birthInfo.gender === 'male' ? '元男' : '元女' }}</div>
        </div>
      </div>
      <div class="birth-info">
        <div class="solar-date">阳历：{{ formatSolarDate() }}</div>
        <div class="lunar-date" v-if="showLunar">阴历：{{ formatLunarDate() }}</div>
      </div>
      <div class="info-controls">
        <el-switch
          v-model="showLunar"
          active-text="显示农历"
          inactive-text="隐藏农历"
          size="small"
        />
      </div>
    </div>

    <!-- 四柱核心排盘表 -->
    <div class="sichu-main-table">
      <table class="professional-chart-table">
        <thead>
          <tr>
            <th class="row-label">日期</th>
            <th class="pillar-header">年柱</th>
            <th class="pillar-header">月柱</th>
            <th class="pillar-header">日柱</th>
            <th class="pillar-header">时柱</th>
          </tr>
        </thead>
        <tbody>
          <!-- 十神行 -->
          <tr class="shishen-row">
            <td class="row-label">主星</td>
            <td class="shishen-cell" :style="{ color: getWuXingColor(chartData.siZhu.year.gan) }">{{ chartData.shiShen.year }}</td>
            <td class="shishen-cell" :style="{ color: getWuXingColor(chartData.siZhu.month.gan) }">{{ chartData.shiShen.month }}</td>
            <td class="shishen-cell day-master">{{ chartData.birthInfo.gender === 'male' ? '元男' : '元女' }}</td>
            <td class="shishen-cell" :style="{ color: getWuXingColor(chartData.siZhu.hour.gan) }">{{ chartData.shiShen.hour }}</td>
          </tr>
          
          <!-- 天干行 -->
          <tr class="tiangan-row">
            <td class="row-label">天干</td>
            <td class="gan-cell" :style="{ color: getWuXingColor(chartData.siZhu.year.gan) }">{{ chartData.siZhu.year.gan }}</td>
            <td class="gan-cell" :style="{ color: getWuXingColor(chartData.siZhu.month.gan) }">{{ chartData.siZhu.month.gan }}</td>
            <td class="gan-cell day-master" :style="{ color: getWuXingColor(chartData.siZhu.day.gan) }">{{ chartData.siZhu.day.gan }}</td>
            <td class="gan-cell" :style="{ color: getWuXingColor(chartData.siZhu.hour.gan) }">{{ chartData.siZhu.hour.gan }}</td>
          </tr>
          
          <!-- 地支行 -->
          <tr class="dizhi-row">
            <td class="row-label">地支</td>
            <td class="zhi-cell" :style="{ color: getWuXingColor(chartData.siZhu.year.zhi) }">{{ chartData.siZhu.year.zhi }}</td>
            <td class="zhi-cell" :style="{ color: getWuXingColor(chartData.siZhu.month.zhi) }">{{ chartData.siZhu.month.zhi }}</td>
            <td class="zhi-cell" :style="{ color: getWuXingColor(chartData.siZhu.day.zhi) }">{{ chartData.siZhu.day.zhi }}</td>
            <td class="zhi-cell" :style="{ color: getWuXingColor(chartData.siZhu.hour.zhi) }">{{ chartData.siZhu.hour.zhi }}</td>
          </tr>
          
          <!-- 藏干行 -->
          <tr class="canggan-row">
            <td class="row-label">藏干</td>
            <td class="canggan-cell">
              <div v-for="(cg, index) in getCangGan('year')" :key="index" class="canggan-item">
                <span class="canggan-text" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.shiShen }}</span>
                <span class="canggan-gan" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.gan }}</span>
              </div>
            </td>
            <td class="canggan-cell">
              <div v-for="(cg, index) in getCangGan('month')" :key="index" class="canggan-item">
                <span class="canggan-text" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.shiShen }}</span>
                <span class="canggan-gan" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.gan }}</span>
              </div>
            </td>
            <td class="canggan-cell">
              <div v-for="(cg, index) in getCangGan('day')" :key="index" class="canggan-item">
                <span class="canggan-text" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.shiShen }}</span>
                <span class="canggan-gan" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.gan }}</span>
              </div>
            </td>
            <td class="canggan-cell">
              <div v-for="(cg, index) in getCangGan('hour')" :key="index" class="canggan-item">
                <span class="canggan-text" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.shiShen }}</span>
                <span class="canggan-gan" :style="{ color: getWuXingColor(cg.gan) }">{{ cg.gan }}</span>
              </div>
            </td>
          </tr>
          
          <!-- 长生十二宫行 -->
          <tr class="zhangsheng-row">
            <td class="row-label">星运</td>
            <td class="zhangsheng-cell">{{ getZhangSheng('year') }}</td>
            <td class="zhangsheng-cell">{{ getZhangSheng('month') }}</td>
            <td class="zhangsheng-cell">{{ getZhangSheng('day') }}</td>
            <td class="zhangsheng-cell">{{ getZhangSheng('hour') }}</td>
          </tr>
          
          <!-- 纳音行 -->
          <tr class="nayin-row">
            <td class="row-label">纳音</td>
            <td class="nayin-cell">{{ getNaYin('year') }}</td>
            <td class="nayin-cell">{{ getNaYin('month') }}</td>
            <td class="nayin-cell">{{ getNaYin('day') }}</td>
            <td class="nayin-cell">{{ getNaYin('hour') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 大运流年区域 -->
    <div class="dayun-liuNian-section">
      <div class="dayun-info">
        <div class="qiyun-info">
          <span>起运：出生后{{ chartData.dayunStart }}年起运</span>
          <span class="current-age">{{ getCurrentAge() }}岁</span>
        </div>
        <div class="jiaoyun-info">
          <span>交运：{{ getJiaoYunInfo() }}</span>
          <span class="current-siling">司令：{{ getCurrentSiLing() }}</span>
        </div>
      </div>

      <div class="dayun-table">
        <div class="dayun-timeline">
          <div v-for="(dayun, index) in chartData.dayun.slice(0, 9)" :key="index" 
               class="dayun-column" 
               :class="{ 'current': isCurrentDayun(index) }">
            <div class="dayun-year">{{ dayun.startYear }}</div>
            <div class="dayun-age">{{ dayun.startAge }}-{{ dayun.startAge + 9 }}</div>
            <div class="dayun-ganzhi">
              <span class="dayun-gan" :style="{ color: getWuXingColor(dayun.ganZhi.gan) }">{{ dayun.ganZhi.gan }}</span>
              <span class="dayun-zhi" :style="{ color: getWuXingColor(dayun.ganZhi.zhi) }">{{ dayun.ganZhi.zhi }}</span>
            </div>
            <div class="dayun-shishen-split">
              <span class="gan-shishen">{{ getShortShiShen(dayun.ganShiShen) }}</span>
              <span class="zhi-shishen">{{ getShortShiShen(dayun.zhiShiShen) }}</span>
            </div>
            
            <!-- 竖列显示流年干支 -->
            <div class="liunian-vertical">
              <div v-for="ln in dayun.liuNian" :key="ln.year" 
                   class="liunian-ganzhi-item"
                   :class="{ 'current-year': ln.year === new Date().getFullYear() }">
                <span class="ln-gan" :style="{ color: getWuXingColor(ln.ganZhi.gan) }">{{ ln.ganZhi.gan }}</span><span class="ln-zhi" :style="{ color: getWuXingColor(ln.ganZhi.zhi) }">{{ ln.ganZhi.zhi }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { BaziChart } from '../core/types';
import { solar2lunar } from 'solar2lunar';
import { getWuXingColor } from '../utils/wuxing';

const props = defineProps<{
  chartData: BaziChart;
}>();

// 控制农历显示
const showLunar = ref(true);

// 格式化公历日期
const formatSolarDate = () => {
  const info = props.chartData.birthInfo;
  return `${info.year}年${String(info.month).padStart(2, '0')}月${String(info.day).padStart(2, '0')}日 ${String(info.hour).padStart(2, '0')}:${String(info.minute).padStart(2, '0')}`;
};

// 格式化农历日期
const formatLunarDate = () => {
  const info = props.chartData.birthInfo;
  if (info.isLunar) {
    return `${info.year}年${info.month}月${info.day}日 ${info.hour}:${info.minute}`;
  }
  try {
    const lunar = solar2lunar(info.year, info.month, info.day);
    return `${lunar.lYear}年${lunar.IMonthCn}${lunar.IDayCn} ${info.hour}:${info.minute}`;
  } catch (error) {
    return '转换失败';
  }
};

// 简化十神名称
const getShortShiShen = (shiShen: string) => {
  const shortMap: Record<string, string> = {
    '正官': '官',
    '偏官': '杀',
    '七杀': '杀',
    '正财': '财',
    '偏财': '才',
    '食神': '食',
    '伤官': '伤',
    '正印': '印',
    '偏印': '枭',
    '比肩': '比',
    '劫财': '劫'
  };
  return shortMap[shiShen] || shiShen;
};

// 获取藏干信息（简化版本）
const getCangGan = (pillar: string) => {
  const cangganMap: Record<string, Array<{gan: string, shiShen: string}>> = {
    '子': [{gan: '癸', shiShen: '正印'}],
    '丑': [{gan: '己', shiShen: '伤官'}, {gan: '癸', shiShen: '正印'}, {gan: '辛', shiShen: '食神'}],
    '寅': [{gan: '甲', shiShen: '比肩'}, {gan: '丙', shiShen: '偏财'}, {gan: '戊', shiShen: '七杀'}],
    '卯': [{gan: '乙', shiShen: '劫财'}],
    '辰': [{gan: '戊', shiShen: '七杀'}, {gan: '乙', shiShen: '劫财'}, {gan: '癸', shiShen: '正印'}],
    '巳': [{gan: '丙', shiShen: '偏财'}, {gan: '戊', shiShen: '七杀'}, {gan: '庚', shiShen: '偏官'}],
    '午': [{gan: '丁', shiShen: '正财'}, {gan: '己', shiShen: '伤官'}],
    '未': [{gan: '己', shiShen: '伤官'}, {gan: '丁', shiShen: '正财'}, {gan: '乙', shiShen: '劫财'}],
    '申': [{gan: '庚', shiShen: '偏官'}, {gan: '壬', shiShen: '偏印'}, {gan: '戊', shiShen: '七杀'}],
    '酉': [{gan: '辛', shiShen: '食神'}],
    '戌': [{gan: '戊', shiShen: '七杀'}, {gan: '辛', shiShen: '食神'}, {gan: '丁', shiShen: '正财'}],
    '亥': [{gan: '壬', shiShen: '偏印'}, {gan: '甲', shiShen: '比肩'}]
  };
  
  const zhi = props.chartData.siZhu[pillar as keyof typeof props.chartData.siZhu].zhi;
  return cangganMap[zhi] || [];
};

// 获取长生十二宫（使用真实算法）
const getZhangSheng = (pillar: string) => {
  console.log('🔍 调试 - chartData:', props.chartData);
  console.log('🔍 调试 - zhangSheng:', props.chartData.zhangSheng);
  console.log('🔍 调试 - pillar:', pillar);
  
  if (!props.chartData.zhangSheng) {
    console.warn('⚠️ zhangSheng 数据不存在');
    return '-';
  }
  const result = props.chartData.zhangSheng[pillar as keyof typeof props.chartData.zhangSheng];
  console.log('🔍 调试 - result:', result);
  return result || '-';
};

// 获取纳音（使用真实算法）
const getNaYin = (pillar: string) => {
  console.log('🔍 调试纳音 - naYin:', props.chartData.naYin);
  if (!props.chartData.naYin) {
    console.warn('⚠️ naYin 数据不存在');
    return '-';
  }
  return props.chartData.naYin[pillar as keyof typeof props.chartData.naYin] || '-';
};

// 获取当前年龄
const getCurrentAge = () => {
  const currentYear = new Date().getFullYear();
  return currentYear - props.chartData.birthInfo.year;
};

// 获取交运信息
const getJiaoYunInfo = () => {
  return `逢戊、癸年立冬后0天交大运`;
};

// 获取当前司令
const getCurrentSiLing = () => {
  return '戊';
};

// 判断是否为当前大运
const isCurrentDayun = (index: number) => {
  const dayun = props.chartData.dayun[index];
  if (!dayun) return false;
  const currentAge = getCurrentAge();
  return currentAge >= dayun.startAge && currentAge < dayun.startAge + 10;
};

</script>

<style scoped>
/* 外层包装容器，居中显示 */
.bazi-chart-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.bazi-chart-professional {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background-color: #ffffff;
  color: #333333;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  width: 100%;
}

/* 基本信息栏 */
.basic-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  color: white;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  font-size: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.user-name {
  font-size: 14px;
  font-weight: bold;
}

.user-gender {
  font-size: 12px;
  opacity: 0.9;
}

.birth-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: center;
}

.solar-date, .lunar-date {
  font-size: 13px;
  white-space: nowrap;
}

.info-controls {
  display: flex;
  align-items: center;
}

/* 四柱核心排盘表 */
.sichu-main-table {
  margin-bottom: 20px;
}

.professional-chart-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
}

.professional-chart-table th,
.professional-chart-table td {
  border: 1px solid #e1e8ed;
  text-align: center;
  padding: 6px 10px;
  font-size: 13px;
}

.professional-chart-table thead th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
  font-size: 14px;
}

.row-label {
  background-color: #f1f3f4;
  font-weight: bold;
  color: #5f6368;
  width: 70px;
  font-size: 12px;
}

.pillar-header {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.pillar-header.day-pillar {
  background-color: #fffaf7;
  color: #e65100;
}

/* 十神行 */
.shishen-row td {
  font-weight: 600;
  font-size: 14px;
}

.day-master {
  background-color: #fffaf7 !important;
  color: #e65100 !important;
  font-weight: bold !important;
}

/* 天干地支行 */
.tiangan-row td,
.dizhi-row td {
  font-size: 16px;
  font-weight: bold;
  padding: 10px;
}

.gan-cell, .zhi-cell {
  position: relative;
}

/* 藏干行 */
.canggan-row td {
  padding: 5px;
  vertical-align: top;
}

.canggan-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 1px 0;
  font-size: 11px;
}

.canggan-text {
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 2px;
  background-color: #f0f2f5;
}

.canggan-gan {
  font-weight: bold;
  font-size: 12px;
}

/* 其他信息行 */
.zhangsheng-row td,
.changsheng-row td,
.shensha-row td,
.kongwang-row td,
.nayin-row td {
  font-size: 11px;
  color: #6c757d;
  padding: 6px;
}

/* 大运流年区域 */
.dayun-liuNian-section {
  border-top: 2px solid #e1e8ed;
  padding-top: 20px;
}

.dayun-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #495057;
}

.qiyun-info, .jiaoyun-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.current-age, .current-siling {
  font-weight: bold;
  color: #e65100;
}

.dayun-table {
  overflow-x: auto;
}

.dayun-timeline {
  display: flex;
  gap: 3px;
  min-width: 100%;
  overflow-x: auto;
}

.dayun-column {
  flex: 1;
  min-width: 90px;
  max-width: 110px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  background-color: #fff;
  transition: all 0.3s ease;
  cursor: default;
}

.dayun-column.current {
  background-color: #fff3e0;
  border-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

.dayun-year {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 3px;
}

.dayun-age {
  font-size: 10px;
  color: #6c757d;
  margin-bottom: 6px;
}

.dayun-ganzhi {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-bottom: 5px;
}

.dayun-gan, .dayun-zhi {
  font-size: 15px;
  font-weight: bold;
}

.dayun-shishen {
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 4px;
  font-weight: 500;
}

.dayun-shishen-split {
  display: flex;
  justify-content: space-around;
  gap: 3px;
  margin-top: 3px;
}

.gan-shishen, .zhi-shishen {
  font-size: 10px;
  font-weight: 400;
  color: #666;
  flex: 1;
}

/* 流年竖列显示 */
.liunian-vertical {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 300px;
  overflow-y: auto;
}

.liunian-ganzhi-item {
  font-size: 12px;
  font-weight: 500;
  padding: 1px 0;
  cursor: default;
  text-align: center;
  line-height: 1.4;
}

.liunian-ganzhi-item.current-year {
  font-weight: bold;
  background-color: #e9ecef;
  border: 1px solid #adb5bd;
  border-radius: 4px;
}

/* 流年展开区域样式 */
.liunian-expansion {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #2196f3;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.liunian-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e1e8ed;
}

.liunian-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.liunian-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}

.liunian-item {
  background-color: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.liunian-item:hover {
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
  transform: translateY(-2px);
}

.liunian-item.current-year {
  background-color: #fff3e0;
  border-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

.liunian-year {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.liunian-age {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
}

.liunian-ganzhi {
  display: flex;
  justify-content: center;
  gap: 3px;
}

.ln-gan, .ln-zhi {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .basic-info-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .birth-info {
    text-align: center;
  }
  
  .professional-chart-table {
    font-size: 12px;
  }
  
  .tiangan-row td,
  .dizhi-row td {
    font-size: 16px;
    padding: 8px;
  }
  
  .dayun-timeline {
    flex-wrap: wrap;
  }
  
  .dayun-column {
    min-width: 80px;
  }
  
  .dayun-info {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .bazi-chart-professional {
    padding: 12px;
  }
  
  .professional-chart-table th,
  .professional-chart-table td {
    padding: 4px 6px;
    font-size: 11px;
  }
  
  .tiangan-row td,
  .dizhi-row td {
    font-size: 14px;
    padding: 6px;
  }
}
</style>
