<template>
  <div class="bazi-panel-simple">
    <!-- 四柱信息 -->
    <div class="sizhu-section">
      <div class="sizhu-grid">
        <!-- 当前大运 -->
        <div class="current-zhu-item">
          <div class="zhu-label">大运</div>
          <div class="zhu-shishen-top" style="visibility: hidden;">占位</div>
          <div class="zhu-gan" style="color: #dc2626;">{{ currentDayunGanzhi.gan }}</div>
          <div class="zhu-zhi" style="color: #dc2626;">{{ currentDayunGanzhi.zhi }}</div>
          <div class="zhu-canggan">{{ currentDayunAge }}</div>
        </div>
        
        <!-- 当前流年 -->
        <div class="current-zhu-item">
          <div class="zhu-label">流年</div>
          <div class="zhu-shishen-top" style="visibility: hidden;">占位</div>
          <div class="zhu-gan" style="color: #dc2626;">{{ currentLiunianGanzhi.gan }}</div>
          <div class="zhu-zhi" style="color: #dc2626;">{{ currentLiunianGanzhi.zhi }}</div>
          <div class="zhu-canggan">{{ currentYear }}年</div>
        </div>
        
        <!-- 四柱 -->
          <!-- 年柱 -->
          <div class="sizhu-item">
            <div class="zhu-label">年</div>
            <div class="zhu-shishen-top" :style="{ color: getShishenColor(chartData.shiShen.year) }">
              {{ getShortShishen(chartData.shiShen.year) }}
            </div>
            <div class="zhu-gan" :style="{ color: getWuXingColor(chartData.siZhu.year.gan) }">
              {{ chartData.siZhu.year.gan }}
            </div>
            <div class="zhu-zhi" :style="{ color: getWuXingColor(chartData.siZhu.year.zhi) }">
              {{ chartData.siZhu.year.zhi }}
            </div>
            <div class="zhu-canggan" :style="{ color: getWuXingColor(getCangGan(chartData.siZhu.year.zhi)) }">
              {{ getCangGan(chartData.siZhu.year.zhi) }}
            </div>
          </div>
          
          <!-- 月柱 -->
          <div class="sizhu-item">
            <div class="zhu-label">月</div>
            <div class="zhu-shishen-top" :style="{ color: getShishenColor(chartData.shiShen.month) }">
              {{ getShortShishen(chartData.shiShen.month) }}
            </div>
            <div class="zhu-gan" :style="{ color: getWuXingColor(chartData.siZhu.month.gan) }">
              {{ chartData.siZhu.month.gan }}
            </div>
            <div class="zhu-zhi" :style="{ color: getWuXingColor(chartData.siZhu.month.zhi) }">
              {{ chartData.siZhu.month.zhi }}
            </div>
            <div class="zhu-canggan" :style="{ color: getWuXingColor(getCangGan(chartData.siZhu.month.zhi)) }">
              {{ getCangGan(chartData.siZhu.month.zhi) }}
            </div>
          </div>
          
          <!-- 日柱（日主） -->
          <div class="sizhu-item day-master">
            <div class="zhu-label">日</div>
            <div class="zhu-shishen-top master-mark">日主</div>
            <div class="zhu-gan" :style="{ color: getWuXingColor(chartData.siZhu.day.gan) }">
              {{ chartData.siZhu.day.gan }}
            </div>
            <div class="zhu-zhi" :style="{ color: getWuXingColor(chartData.siZhu.day.zhi) }">
              {{ chartData.siZhu.day.zhi }}
            </div>
            <div class="zhu-canggan" :style="{ color: getWuXingColor(getCangGan(chartData.siZhu.day.zhi)) }">
              {{ getCangGan(chartData.siZhu.day.zhi) }}
            </div>
          </div>
          
          <!-- 时柱 -->
          <div class="sizhu-item">
            <div class="zhu-label">时</div>
            <div class="zhu-shishen-top" :style="{ color: getShishenColor(chartData.shiShen.hour) }">
              {{ getShortShishen(chartData.shiShen.hour) }}
            </div>
            <div class="zhu-gan" :style="{ color: getWuXingColor(chartData.siZhu.hour.gan) }">
              {{ chartData.siZhu.hour.gan }}
            </div>
            <div class="zhu-zhi" :style="{ color: getWuXingColor(chartData.siZhu.hour.zhi) }">
              {{ chartData.siZhu.hour.zhi }}
            </div>
            <div class="zhu-canggan" :style="{ color: getWuXingColor(getCangGan(chartData.siZhu.hour.zhi)) }">
              {{ getCangGan(chartData.siZhu.hour.zhi) }}
            </div>
          </div>
      </div>
    </div>
    
    <!-- 大运流年表格（横向平铺） -->
    <div class="dayun-liunian-table">
      <div class="table-wrapper">
        <div class="table-scroll">
          <div class="dayun-columns">
            <div 
              v-for="(dayun, index) in chartData.dayun" 
              :key="index"
              class="dayun-column"
              :class="{ 'current-dayun': isCurrentDayun(dayun) }"
            >
              <!-- 大运干支 + 起运信息 -->
              <div class="dayun-header">
                <div class="dayun-ganzhi">{{ dayun.ganZhi.gan }}{{ dayun.ganZhi.zhi }}</div>
                <div class="dayun-start-info">
                  <span class="start-year">{{ dayun.startYear }}年</span>
                  <span class="start-age">{{ dayun.startAge }}岁</span>
                </div>
              </div>
              
              <!-- 流年列表（一列显示所有干支） -->
              <div class="liunian-list">
                <span 
                  v-for="ln in dayun.liuNian" 
                  :key="ln.year"
                  class="liunian-ganzhi-inline"
                  :class="{ 
                    'selected': ln.year === props.selectedYear,
                    'current': ln.year === currentYear
                  }"
                  @click="onLiunianClick(ln.year)"
                  :title="`${ln.year}年 ${ln.age}岁`"
                >{{ ln.ganZhi.gan }}{{ ln.ganZhi.zhi }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaziChart, DayunDetail } from '../core/types';
import { getShortShishen, getShishenColor as getShishenColorUtil } from '../utils/shishen-short';

const props = defineProps<{
  chartData: BaziChart;
  selectedYear?: number | null;
}>();

const emit = defineEmits<{
  yearSelect: [year: number | null];
  dayunChange: [dayun: DayunDetail];
}>();

const currentYear = new Date().getFullYear();

// 当前大运
const currentDayun = props.chartData.dayun.find(d => 
  currentYear >= d.startYear && currentYear <= d.endYear
);

// 当前大运干支
const currentDayunGanzhi = currentDayun ? currentDayun.ganZhi : { gan: '?', zhi: '?' };

// 当前大运年龄段
const currentDayunAge = currentDayun 
  ? `${currentDayun.startAge}-${currentDayun.endYear - currentDayun.startYear + currentDayun.startAge}岁`
  : '';

// 当前流年干支（根据当前年份计算）
const currentLiunianGanzhi = (() => {
  const gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][(currentYear - 4) % 10];
  const zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(currentYear - 4) % 12];
  return { gan, zhi };
})();

// 判断是否为当前大运
const isCurrentDayun = (dayun: DayunDetail) => {
  return currentYear >= dayun.startYear && currentYear <= dayun.endYear;
};



// 点击流年
const onLiunianClick = (year: number) => {
  // 如果点击的是已选中的年份，取消选择
  if (props.selectedYear === year) {
    emit('yearSelect', null);
  } else {
    emit('yearSelect', year);
  }
};

// 五行配色
const wuxingColors: Record<string, string> = {
  '甲': '#16a34a', '乙': '#22c55e', // 木 - 绿色
  '丙': '#dc2626', '丁': '#ef4444', // 火 - 红色
  '戊': '#eab308', '己': '#facc15', // 土 - 黄色
  '庚': '#f8f9fa', '辛': '#e5e7eb', // 金 - 白色
  '壬': '#2563eb', '癸': '#3b82f6', // 水 - 蓝色
  '子': '#2563eb', '亥': '#3b82f6', // 水
  '寅': '#16a34a', '卯': '#22c55e', // 木
  '巳': '#dc2626', '午': '#ef4444', // 火
  '申': '#9ca3af', '酉': '#d1d5db', // 金
  '辰': '#eab308', '戌': '#facc15', '丑': '#fbbf24', '未': '#fde047' // 土
};

const getWuXingColor = (char: string): string => {
  return wuxingColors[char] || '#6b7280';
};

const getShishenColor = (shishen: string): string => {
  return getShishenColorUtil(shishen);
};

// 地支藏干映射
const zhiCangGan: Record<string, string> = {
  '子': '癸', '丑': '己', '寅': '甲', '卯': '乙',
  '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
  '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
};

const getCangGan = (zhi: string): string => {
  return zhiCangGan[zhi] || '';
};
</script>

<style scoped>
.bazi-panel-simple {
  padding: 16px;
  background: #ffffff;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 四柱区域 */
.sizhu-section {
  flex-shrink: 0;
}

/* 四柱网格（包含大运+流年+四柱，共6列） */
.sizhu-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.current-zhu-item,
.sizhu-item {
  background: transparent;
  padding: 8px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sizhu-item.day-master {
  background: rgba(239, 246, 255, 0.5);
}

.zhu-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: normal;
}

.zhu-shishen-top {
  font-size: 14px;
  font-weight: 500;
  min-height: 20px;
}

.master-mark {
  color: #3b82f6;
  font-weight: 600;
}

.zhu-gan,
.zhu-zhi {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
}

.zhu-canggan {
  font-size: 12px;
  color: #6b7280;
  min-height: 16px;
}

/* 大运流年表格（横向平铺） */
.dayun-liunian-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-wrapper {
  background: transparent;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-scroll {
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
}

.dayun-columns {
  display: flex;
  gap: 0;
  min-width: min-content;
}

.dayun-column {
  flex: 0 0 auto;
  min-width: 90px;
  max-width: 130px;
  border-right: 1px solid #e5e7eb;
  background: transparent;
  transition: background-color 0.2s;
}

.dayun-column:last-child {
  border-right: none;
}

.dayun-column.current-dayun {
  background: rgba(239, 246, 255, 0.5);
}

.dayun-header {
  padding: 8px;
  text-align: center;
  background: transparent;
  border-bottom: 1px solid #e5e7eb;
}

.dayun-ganzhi {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.dayun-start-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.start-year,
.start-age {
  font-size: 11px;
  color: #9ca3af;
  font-weight: normal;
}

.liunian-list {
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.4;
}

.liunian-ganzhi-inline {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  display: block;
  text-align: center;
}

.liunian-ganzhi-inline:hover {
  background: rgba(239, 246, 255, 0.8);
}

.liunian-ganzhi-inline.selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.liunian-ganzhi-inline.current {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
}

.dayun-item.current {
  background: rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
  font-weight: bold;
}

.dayun-item.active {
  background: rgba(234, 88, 12, 0.2);
  border-color: #ea580c;
  border-width: 2px;
}

.dayun-ganzhi {
  font-size: 14px;
  font-weight: bold;
  color: #1e40af;
  display: block;
  margin-bottom: 2px;
}

.dayun-age {
  font-size: 10px;
  color: #78350f;
}

/* 四柱区域 */
.sizhu-section {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid #fdba74;
}

.sizhu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.sizhu-item {
  text-align: center;
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #fdba74;
  border-radius: 6px;
  transition: all 0.2s;
}

.sizhu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sizhu-item.day-master {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
  border-width: 3px;
}

.zhu-label {
  font-size: 11px;
  color: #78350f;
  margin-bottom: 6px;
  font-weight: 600;
}

.zhu-gan, .zhu-zhi {
  font-size: 22px;
  font-weight: bold;
  line-height: 1.3;
  font-family: 'SimSun', serif;
}

.zhu-shishen {
  font-size: 14px;
  margin-top: 6px;
  font-weight: 600;
}

.master-mark {
  color: #dc2626;
  font-size: 12px;
}

/* 流年列表 */
.liunian-section {
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid #fdba74;
}

.liunian-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.liunian-item {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #fdba74;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.liunian-item:hover {
  background: rgba(254, 215, 170, 0.5);
  transform: translateX(2px);
}

.liunian-item.current {
  background: rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
  font-weight: bold;
}

.liunian-item.active {
  background: rgba(234, 88, 12, 0.2);
  border-color: #ea580c;
  border-width: 2px;
}

.liunian-year {
  font-size: 13px;
  font-weight: bold;
  color: #1e40af;
}

.liunian-ganzhi {
  font-size: 12px;
  color: #dc2626;
}

.liunian-age {
  font-size: 10px;
  color: #78350f;
}

/* 滚动条样式 */
.table-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
