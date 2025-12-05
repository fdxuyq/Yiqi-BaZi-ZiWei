<template>
  <div class="chart-integrated-view">
    <!-- 紫微盘外围框架 -->
    <div class="ziwei-outer-frame">
      <ZiweiChart 
        :chart-data="ziweiChartData"
        :selected-year="selectedYear"
        :selected-daxian-start-age="selectedDaxianStartAge"
        @year-select="handleYearSelect"
      />
    </div>
    
    <!-- 八字信息嵌入中央（包含盘主信息） -->
    <div class="bazi-center-overlay">
      <!-- 盘主信息头部 -->
      <div class="chart-owner-info">
        <div class="owner-name">{{ ownerName }}</div>
        <div class="owner-birth-info">
          <span>{{ formatBirthDate() }}</span>
          <span class="gender-tag">{{ ziweiChartData.yinYang }}</span>
        </div>
        <div class="owner-lunar-info" v-if="ziweiChartData.lunarDate">{{ ziweiChartData.lunarDate.year }}年农历{{ ziweiChartData.lunarDate.monthCn }}月{{ ziweiChartData.lunarDate.dayCn }}</div>
      </div>
      
      <!-- 八字盘 -->
      <BaziEmbedded 
        :chart-data="baziChartData"
        :selected-year="selectedYear"
        :selected-dayun-index="selectedDayunIndex"
        @year-select="handleYearSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaziEmbedded from './BaziEmbedded.vue';
import ZiweiChart from './ZiweiChart.vue';
import type { BaziChart, ZiweiChart as ZiweiChartType } from '../core/types';

interface Props {
  baziChartData: BaziChart;
  ziweiChartData: ZiweiChartType;
  ownerName?: string;
}

const props = defineProps<Props>();

const ownerName = computed(() => props.ownerName || '未知');

// 格式化出生日期
const formatBirthDate = () => {
  const birth = props.ziweiChartData.birthInfo;
  return `${birth.year}年${birth.month}月${birth.day}日 ${String(birth.hour).padStart(2, '0')}:${String(birth.minute || 0).padStart(2, '0')}`;
};

// 当前选中的年份（用于八字与紫微的联动高亮）
const selectedYear = ref<number | null>(null);

// 当前选中的大运索引（用于联动八字大运）
const selectedDayunIndex = ref<number | null>(null);

// 当前选中的大限起始年龄（用于联动紫微大限）
const selectedDaxianStartAge = ref<number | null>(null);

/**
 * 处理年份选择（八字或紫微盘点击事件）
 * @param year - 选中的年份，null表示取消选择
 */
const handleYearSelect = (year: number | null) => {
  selectedYear.value = year;
  
  // 如果选中了年份，找到对应的大运索引和大限起始年龄
  if (year) {
    const birthYear = props.baziChartData.birthInfo.year;
    const age = year - birthYear + 1;
    
    // 找到包含该岁数的大运（八字）
    const dayunIdx = props.baziChartData.dayun.findIndex(dy => {
      return age >= dy.startAge && age <= dy.startAge + 9;
    });
    
    if (dayunIdx !== -1) {
      selectedDayunIndex.value = dayunIdx;
    }
    
    // 找到包含该岁数的大限（紫微）
    const gongWithDaxian = props.ziweiChartData.gongs.find(g => {
      return g.daXian && age >= g.daXian.startAge && age <= g.daXian.endAge;
    });
    
    if (gongWithDaxian?.daXian) {
      selectedDaxianStartAge.value = gongWithDaxian.daXian.startAge;
    }
  } else {
    selectedDayunIndex.value = null;
    selectedDaxianStartAge.value = null;
  }
  
  console.log('Year selected:', year, 'Dayun index:', selectedDayunIndex.value, 'Daxian start age:', selectedDaxianStartAge.value);
};
</script>

<style scoped>
.chart-integrated-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 20px;
  box-sizing: border-box;
}

/* 紫微盘外围框架 */
.ziwei-outer-frame {
  position: relative;
  width: 100%;
  max-width: 1400px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 八字信息嵌入中央 */
.bazi-center-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: clamp(300px, 24vw, 380px);
  max-height: 60vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 4px;
  /* 移除突兀的边框和阴影，融合到整体中 */
  border: none;
  box-shadow: none;
  backdrop-filter: none;
}

/* 盘主信息头部 */
.chart-owner-info {
  padding: 12px 16px;
  background: rgba(248, 250, 252, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  text-align: center;
}

.owner-name {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 6px;
}

.owner-birth-info {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.gender-tag {
  display: inline-block;
  padding: 2px 6px;
  background-color: #3b82f6;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 3px;
}

.owner-lunar-info {
  font-size: 11px;
  color: #94a3b8;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .bazi-center-overlay {
    max-width: 700px;
    width: 85%;
  }
}

@media (max-width: 768px) {
  .chart-integrated-view {
    padding: 10px;
  }
  
  .bazi-center-overlay {
    max-width: 95%;
    width: 95%;
  }
}
</style>
