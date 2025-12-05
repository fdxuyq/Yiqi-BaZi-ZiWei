<template>
  <div class="bazi-embedded">
    <!-- 四柱核心信息 -->
    <div class="sichu-compact">
      <div class="sichu-header">
        <div class="header-label">四柱</div>
        <div class="pillar-header">年柱</div>
        <div class="pillar-header">月柱</div>
        <div class="pillar-header day-pillar">日柱</div>
        <div class="pillar-header">时柱</div>
      </div>
      
      <!-- 天干十神行 -->
      <div class="sichu-row tiangan-row">
        <div class="row-label">天干</div>
        <div class="pillar-cell">
          <div class="gan" :style="{ color: getWuXingColor(chartData.siZhu.year.gan) }">
            {{ chartData.siZhu.year.gan }}
          </div>
          <div class="shishen" :style="{ color: getShishenColor(chartData.shiShen.year) }">
            {{ getShortShishen(chartData.shiShen.year) }}
          </div>
        </div>
        <div class="pillar-cell">
          <div class="gan" :style="{ color: getWuXingColor(chartData.siZhu.month.gan) }">
            {{ chartData.siZhu.month.gan }}
          </div>
          <div class="shishen" :style="{ color: getShishenColor(chartData.shiShen.month) }">
            {{ getShortShishen(chartData.shiShen.month) }}
          </div>
        </div>
        <div class="pillar-cell day-master">
          <div class="gan" :style="{ color: getWuXingColor(chartData.siZhu.day.gan) }">
            {{ chartData.siZhu.day.gan }}
          </div>
          <div class="shishen master-mark">{{ chartData.birthInfo.gender === 'male' ? '元男' : '元女' }}</div>
        </div>
        <div class="pillar-cell">
          <div class="gan" :style="{ color: getWuXingColor(chartData.siZhu.hour.gan) }">
            {{ chartData.siZhu.hour.gan }}
          </div>
          <div class="shishen" :style="{ color: getShishenColor(chartData.shiShen.hour) }">
            {{ getShortShishen(chartData.shiShen.hour) }}
          </div>
        </div>
      </div>
      
      <!-- 地支藏干行 -->
      <div class="sichu-row dizhi-row">
        <div class="row-label">地支</div>
        <div class="pillar-cell">
          <div class="zhi" :style="{ color: getWuXingColor(chartData.siZhu.year.zhi) }">
            {{ chartData.siZhu.year.zhi }}
          </div>
          <div class="canggan-wrapper">
            <div class="canggan-gans">
              <div 
                v-for="(cg, idx) in getCangGanFull('year')" 
                :key="idx" 
                class="canggan-gan"
                :style="{ color: getWuXingColor(cg.gan) }"
              >{{ cg.gan }}</div>
            </div>
            <div class="canggan-shishens">
              <div 
                v-for="(cg, idx) in getCangGanFull('year')" 
                :key="idx" 
                class="canggan-shishen"
                :style="{ color: getShishenColor(cg.shiShen) }"
              >{{ getShortShishen(cg.shiShen) }}</div>
            </div>
          </div>
        </div>
        <div class="pillar-cell">
          <div class="zhi" :style="{ color: getWuXingColor(chartData.siZhu.month.zhi) }">
            {{ chartData.siZhu.month.zhi }}
          </div>
          <div class="canggan-wrapper">
            <div class="canggan-gans">
              <div 
                v-for="(cg, idx) in getCangGanFull('month')" 
                :key="idx" 
                class="canggan-gan"
                :style="{ color: getWuXingColor(cg.gan) }"
              >{{ cg.gan }}</div>
            </div>
            <div class="canggan-shishens">
              <div 
                v-for="(cg, idx) in getCangGanFull('month')" 
                :key="idx" 
                class="canggan-shishen"
                :style="{ color: getShishenColor(cg.shiShen) }"
              >{{ getShortShishen(cg.shiShen) }}</div>
            </div>
          </div>
        </div>
        <div class="pillar-cell day-master">
          <div class="zhi" :style="{ color: getWuXingColor(chartData.siZhu.day.zhi) }">
            {{ chartData.siZhu.day.zhi }}
          </div>
          <div class="canggan-wrapper">
            <div class="canggan-gans">
              <div 
                v-for="(cg, idx) in getCangGanFull('day')" 
                :key="idx" 
                class="canggan-gan"
                :style="{ color: getWuXingColor(cg.gan) }"
              >{{ cg.gan }}</div>
            </div>
            <div class="canggan-shishens">
              <div 
                v-for="(cg, idx) in getCangGanFull('day')" 
                :key="idx" 
                class="canggan-shishen"
                :style="{ color: getShishenColor(cg.shiShen) }"
              >{{ getShortShishen(cg.shiShen) }}</div>
            </div>
          </div>
        </div>
        <div class="pillar-cell">
          <div class="zhi" :style="{ color: getWuXingColor(chartData.siZhu.hour.zhi) }">
            {{ chartData.siZhu.hour.zhi }}
          </div>
          <div class="canggan-wrapper">
            <div class="canggan-gans">
              <div 
                v-for="(cg, idx) in getCangGanFull('hour')" 
                :key="idx" 
                class="canggan-gan"
                :style="{ color: getWuXingColor(cg.gan) }"
              >{{ cg.gan }}</div>
            </div>
            <div class="canggan-shishens">
              <div 
                v-for="(cg, idx) in getCangGanFull('hour')" 
                :key="idx" 
                class="canggan-shishen"
                :style="{ color: getShishenColor(cg.shiShen) }"
              >{{ getShortShishen(cg.shiShen) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 大运区域 -->
    <div class="dayun-section">
      <div class="section-title">大运</div>
      <div class="dayun-list">
        <div 
          v-for="(dy, index) in chartData.dayun.slice(0, 10)" 
          :key="index"
          class="dayun-item"
          :class="{ 
            'active': activeDayunIndex === index,
            'current': isCurrentDayun(dy)
          }"
          @click="toggleDayun(index)"
        >
          <div class="dayun-ganzhi-vertical">
            <div class="gan" :style="{ color: getWuXingColor(dy.ganZhi.gan) }">{{ dy.ganZhi.gan }}</div>
            <div class="zhi" :style="{ color: getWuXingColor(dy.ganZhi.zhi) }">{{ dy.ganZhi.zhi }}</div>
          </div>
          <div class="dayun-age">{{ dy.startAge }}-{{ dy.startAge + 9 }}</div>
          <div class="dayun-shishen-vertical">
            <div :style="{ color: getShishenColor(dy.ganShiShen) }">{{ getShortShishen(dy.ganShiShen) }}</div>
            <div :style="{ color: getShishenColor(dy.zhiShiShen) }">{{ getShortShishen(dy.zhiShiShen) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 流年区域（默认显示当前大运的流年） -->
    <div v-if="activeDayunIndex !== null" class="liunian-section">
      <div class="section-title">流年（{{ chartData.dayun[activeDayunIndex].startAge }}-{{ chartData.dayun[activeDayunIndex].startAge + 9 }}岁）</div>
      <div class="liunian-grid">
        <div 
          v-for="ln in chartData.dayun[activeDayunIndex].liuNian" 
          :key="ln.year"
          class="liunian-item"
          :class="{ 
            'selected': selectedYear === ln.year,
            'current-year': ln.year === currentYear
          }"
          @click="handleYearClick(ln.year)"
        >
          <div class="liunian-year">{{ ln.year }}</div>
          <div class="liunian-ganzhi-vertical">
            <div class="gan" :style="{ color: getWuXingColor(ln.ganZhi.gan) }">{{ ln.ganZhi.gan }}</div>
            <div class="zhi" :style="{ color: getWuXingColor(ln.ganZhi.zhi) }">{{ ln.ganZhi.zhi }}</div>
          </div>
          <div class="liunian-age">{{ ln.age }}岁</div>
          <div v-if="ln.year === currentYear" class="current-year-mark">今年</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { BaziChart, DayunDetail } from '../core/types';
import { getShortShishen } from '../utils/shishen-short';
import { getZhiCangGanFull } from '../core/bazi';
import { getWuXingColor } from '../utils/wuxing';

interface Props {
  chartData: BaziChart;
  selectedYear?: number | null;
  selectedDayunIndex?: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'year-select': [year: number | null]
}>();

// 当前展开的大运索引
const activeDayunIndex = ref<number | null>(null);

// 当前年份
const currentYear = new Date().getFullYear();

// 初始化时自动展开当前大运
onMounted(() => {
  // 如果外部传入了 selectedDayunIndex，使用外部值
  if (props.selectedDayunIndex !== null && props.selectedDayunIndex !== undefined) {
    activeDayunIndex.value = props.selectedDayunIndex;
  } else {
    // 否则找到当前大运的索引
    const currentDayunIdx = props.chartData.dayun.findIndex(dy => isCurrentDayun(dy));
    if (currentDayunIdx !== -1) {
      activeDayunIndex.value = currentDayunIdx;
    }
  }
});

// 监听外部传入的 selectedDayunIndex 变化
watch(() => props.selectedDayunIndex, (newIndex) => {
  if (newIndex !== null && newIndex !== undefined) {
    activeDayunIndex.value = newIndex;
  }
});

/**
 * 获取十神颜色（根据十神对应的五行）
 * 比劫=日主五行, 食伤=日主生, 财=日主克, 官杀=克日主, 印=生日主
 */
function getShishenColor(shishen: string): string {
  const dayMaster = props.chartData.dayMaster;
  
  // 十神对应的天干关系
  const shishenGanMap: Record<string, string> = {
    '比肩': dayMaster,
    '劫财': dayMaster,
    '食神': getShengGan(dayMaster),
    '伤官': getShengGan(dayMaster),
    '偏财': getKeGan(dayMaster),
    '正财': getKeGan(dayMaster),
    '七杀': getKeWoGan(dayMaster),
    '正官': getKeWoGan(dayMaster),
    '偏印': getShengWoGan(dayMaster),
    '正印': getShengWoGan(dayMaster)
  };
  
  const gan = shishenGanMap[shishen];
  return gan ? getWuXingColor(gan) : '#666';
}

// 辅助函数：获取日主所生的天干（食伤）
function getShengGan(dayMaster: string): string {
  const shengMap: Record<string, string> = {
    '甲': '丙', '乙': '丙', // 木生火
    '丙': '戊', '丁': '戊', // 火生土
    '戊': '庚', '己': '庚', // 土生金
    '庚': '壬', '辛': '壬', // 金生水
    '壬': '甲', '癸': '甲'  // 水生木
  };
  return shengMap[dayMaster] || dayMaster;
}

// 辅助函数：获取日主所克的天干（财）
function getKeGan(dayMaster: string): string {
  const keMap: Record<string, string> = {
    '甲': '戊', '乙': '戊', // 木克土
    '丙': '庚', '丁': '庚', // 火克金
    '戊': '壬', '己': '壬', // 土克水
    '庚': '甲', '辛': '甲', // 金克木
    '壬': '丙', '癸': '丙'  // 水克火
  };
  return keMap[dayMaster] || dayMaster;
}

// 辅助函数：获取克日主的天干（官杀）
function getKeWoGan(dayMaster: string): string {
  const keWoMap: Record<string, string> = {
    '甲': '庚', '乙': '庚', // 金克木
    '丙': '壬', '丁': '壬', // 水克火
    '戊': '甲', '己': '甲', // 木克土
    '庚': '丙', '辛': '丙', // 火克金
    '壬': '戊', '癸': '戊'  // 土克水
  };
  return keWoMap[dayMaster] || dayMaster;
}

// 辅助函数：获取生日主的天干（印）
function getShengWoGan(dayMaster: string): string {
  const shengWoMap: Record<string, string> = {
    '甲': '壬', '乙': '壬', // 水生木
    '丙': '甲', '丁': '甲', // 木生火
    '戊': '丙', '己': '丙', // 火生土
    '庚': '戊', '辛': '戊', // 土生金
    '壬': '庚', '癸': '庚'  // 金生水
  };
  return shengWoMap[dayMaster] || dayMaster;
}

/**
 * 获取地支完整藏干
 */
function getCangGanFull(pillar: 'year' | 'month' | 'day' | 'hour') {
  const zhi = props.chartData.siZhu[pillar].zhi;
  return getZhiCangGanFull(zhi, props.chartData.dayMaster);
}

/**
 * 判断是否为当前大运
 */
function isCurrentDayun(dayun: DayunDetail): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  return currentYear >= dayun.startYear && currentYear < dayun.endYear;
}

/**
 * 切换大运展开/收起
 */
function toggleDayun(index: number) {
  if (activeDayunIndex.value === index) {
    activeDayunIndex.value = null;
  } else {
    activeDayunIndex.value = index;
  }
}

/**
 * 处理流年点击
 */
function handleYearClick(year: number) {
  if (props.selectedYear === year) {
    emit('year-select', null);
  } else {
    emit('year-select', year);
  }
}
</script>

<style scoped>
.bazi-embedded {
  background: transparent;
  padding: 2px;
  margin: 0;
  font-size: 11px;
}

/* 四柱区域 */
.sichu-compact {
  margin-bottom: 6px;
}

.sichu-header {
  display: flex;
  gap: 6px;
  padding: 2px 0;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
  font-size: 10px;
  color: #555;
  margin-bottom: 3px;
}

.header-label {
  width: 32px;
  text-align: center;
  color: #888;
  font-size: 9px;
  flex-shrink: 0;
}

.pillar-header {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.pillar-header.day-pillar {
  color: #dc2626;
  font-weight: 700;
}

.sichu-row {
  display: flex;
  gap: 6px;
  padding: 3px 0;
  align-items: flex-start;
}

.row-label {
  width: 32px;
  text-align: center;
  font-size: 9px;
  color: #888;
  font-weight: 500;
  padding-top: 4px;
  flex-shrink: 0;
}

.pillar-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 0;
}

.pillar-cell.day-master {
  background: #fff5f5;
  border-radius: 3px;
  padding: 2px 1px;
}

/* 天干地支样式 */
.gan, .zhi {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.shishen {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.master-mark {

  font-size: 10px;
  line-height: 1;
  border-bottom: 1px solid #888;
}

/* 藏干区域 - 天干竖排，十神在旁边 */
.canggan-wrapper {
  display: flex;
  gap: 3px;
  justify-content: center;
  margin-top: 2px;
  align-items: center;
}

.canggan-gans {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
}

.canggan-shishens {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
}

.canggan-gan {
  font-weight: 600;
  font-size: 10px;
  line-height: 1.2;
}

.canggan-shishen {
  font-weight: 600;
  font-size: 10px;
  line-height: 1.2;
}

/* 大运区域 */
.dayun-section {
  margin-bottom: 5px;
}

.section-title {
  font-size: 10px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  padding-bottom: 2px;
  border-bottom: 1px solid #ddd;
}

.dayun-list {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  padding: 3px 0;
  flex-wrap: wrap;
}

.dayun-item {
  flex: 0 0 auto;
  padding: 3px 5px;
  border-radius: 3px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.dayun-item:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.dayun-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.dayun-item.current {
  background: #fff9c4;
  border-color: #fbc02d;
}

.dayun-ganzhi-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.dayun-ganzhi-vertical .gan,
.dayun-ganzhi-vertical .zhi {
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.dayun-age {
  font-size: 8px;
  color: #888;
  margin: 2px 0 1px 0;
  line-height: 1;
  white-space: nowrap;
}

.dayun-shishen-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
}

/* 流年区域 */
.liunian-section {
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #ddd;
}

.liunian-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.liunian-item {
  padding: 2px 4px;
  background: #f8f8f8;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  flex: 0 0 auto;
}

.liunian-item:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.liunian-item.selected {
  background: #e8f5e9;
  border-color: #4caf50;
}

/* 当前年份标记 */
.liunian-item.current-year {
  background: #fff3e0;
  border-color: #ff9800;
  font-weight: bold;
}

.liunian-item.current-year .liunian-year {
  color: #f57c00;
}

.current-year-mark {
  font-size: 8px;
  color: #f57c00;
  font-weight: bold;
  margin-top: 1px;
  line-height: 1;
}

.liunian-year {
  font-size: 9px;
  font-weight: 600;
  color: #555;
  line-height: 1;
}

.liunian-ganzhi-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin: 2px 0;
}

.liunian-ganzhi-vertical .gan,
.liunian-ganzhi-vertical .zhi {
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.liunian-age {
  font-size: 8px;
  color: #888;
  line-height: 1;
}
</style>
