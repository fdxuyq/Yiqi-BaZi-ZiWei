<template>
  <div class="ziwei-chart-container">
    <div class="chart-grid">
      <div 
        v-for="gong in orderedGongs" 
        :key="gong.dizhi" 
        :class="['gong-cell', `grid-pos-${gong.pos}`]"
      >          <div 
          class="gong-inner"
          :class="{ 
            'feihua-active': feiHuaActiveGong === gong.gong
          }"
          @click="handleGongClick(gong)"
        >
          <!-- 自化箭头指示器 - 根据宫位方向定位 -->
          <div :class="['self-sihua-indicators', `position-${getGongPosition(gong.dizhi).position}`]">
            <span v-if="hasSelfSiHua(gong).lu" class="self-sihua-arrow arrow-lu" title="自化禄">{{ getGongPosition(gong.dizhi).arrow }}</span>
            <span v-if="hasSelfSiHua(gong).quan" class="self-sihua-arrow arrow-quan" title="自化权">{{ getGongPosition(gong.dizhi).arrow }}</span>
            <span v-if="hasSelfSiHua(gong).ke" class="self-sihua-arrow arrow-ke" title="自化科">{{ getGongPosition(gong.dizhi).arrow }}</span>
            <span v-if="hasSelfSiHua(gong).ji" class="self-sihua-arrow arrow-ji" title="自化忌">{{ getGongPosition(gong.dizhi).arrow }}</span>
          </div>
          <!-- 顶部：天干地支 - 所有宫位竖排 -->
          <div class="gong-ganzhi-top vertical">
            <span class="tiangan">{{ gong.tiangan }}</span>
            <span class="dizhi">{{ gong.dizhi }}</span>
          </div>
          
          <!-- 主要内容区 -->
          <div class="gong-main-area">
            <!-- 顶部：宫位名称（居中） + 身宫标签 -->
            <div class="gong-header">
              <span class="gong-name">{{ gong.gong }}</span>
              <span v-if="isShenGong(gong.gong)" class="shen-gong-label">身</span>
            </div>
            
            <!-- 中间：星曜区域 -->
            <div class="gong-content">
              <!-- 主星列表 -->
              <div class="stars-section main-stars-section">
                <span 
                  v-for="star in gong.mainStars" 
                  :key="star" 
                  class="star-wrapper"
                >
                  <span
                    :class="[
                      'star-item', 
                      'main-star', 
                      getStarLevelClass(star),
                      getSiHuaBgClass(gong, star),
                      getFeiHuaBgClass(gong, star)
                    ]"
                  >
                    {{ star }}
                  </span>
                  <span v-if="getSiHuaText(gong, star)" :class="['sihua-text', getSiHuaTextClass(gong, star)]">
                    {{ getSiHuaText(gong, star) }}
                  </span>
                  <span v-if="getLiuNianSiHuaText(star)" :class="['liunian-sihua-text', getLiuNianSiHuaTextClass(star)]">
                    {{ getLiuNianSiHuaText(star) }}
                  </span>
                </span>
              </div>
              
              <!-- 辅星列表 - 支持四化标记 -->
              <div v-if="gong.auxStars && gong.auxStars.length > 0" class="stars-section aux-stars-section">
                <span 
                  v-for="star in gong.auxStars" 
                  :key="star" 
                  class="star-wrapper"
                >
                  <span
                    :class="[
                      'star-item', 
                      'aux-star',
                      getSiHuaBgClass(gong, star),
                      getFeiHuaBgClass(gong, star)
                    ]"
                  >
                    {{ star }}
                  </span>
                  <span v-if="getSiHuaText(gong, star)" :class="['sihua-text', getSiHuaTextClass(gong, star)]">
                    {{ getSiHuaText(gong, star) }}
                  </span>
                  <span v-if="getLiuNianSiHuaText(star)" :class="['liunian-sihua-text', getLiuNianSiHuaTextClass(star)]">
                    {{ getLiuNianSiHuaText(star) }}
                  </span>
                </span>
              </div>
            </div>
            
            <!-- 底部：流年/大运信息（位置调换） -->
            <div class="gong-footer">
              <!-- 流年信息（按地支固定位置）- 现在在上面，显示岁数+年份 -->
              <div 
                v-if="gong.liuNianYear" 
                class="liunian-info"
                :class="{ 'liunian-selected': props.selectedYear === gong.liuNianYear }"
                @click.stop="handleLiunianClick(gong.liuNianYear)"
              >
                <span class="liunian-age">{{ getLiuNianAge(gong.liuNianYear) }}岁</span>
                <span class="liunian-year">{{ gong.liuNianYear }}</span>
              </div>
              
              <!-- 大运信息 - 可点击选择，右对齐显示年龄范围 -->
              <div 
                v-if="gong.daXian" 
                class="daxian-info" 
                :class="{ 
                  'current-daxian': gong.daXian.isCurrent,
                  'selected-daxian': selectedDaXian?.startAge === gong.daXian.startAge
                }"
                @click.stop="handleDaXianClick(gong.daXian)"
              >
                <span class="age-range">{{ gong.daXian.startAge }}~{{ gong.daXian.endAge }}</span>
              </div>
              
              <!-- 大限宫位名 - 显示在宫位左下角 -->
              <div v-if="gong.daXian?.daXianGongName" class="daxian-gong-label">
                {{ gong.daXian.daXianGongName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 中央区域留空，由八字盘占据 -->
      <div class="center-info grid-pos-center">
        <!-- 中央区域不显示文字，由八字盘填充 -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref, watch } from 'vue';
import type { ZiweiChart } from '../core/types';
import { calculateFeiHua, getSiHuaByGan } from '../core/sihua';

const props = defineProps<{
  chartData: ZiweiChart;
  selectedYear?: number | null;
  selectedDaxianStartAge?: number | null;
}>();

const emit = defineEmits<{
  yearSelect: [year: number | null];
}>();

// 飞化状态管理
const feiHuaActiveGong = ref<string | null>(null);
const feiHuaResult = ref<any>(null);

// 选中的大限
const selectedDaXian = ref<any>(null);

const gridOrder: { [key: string]: number } = {
  '巳': 0, '午': 1, '未': 2, '申': 3,
  '辰': 11, '酉': 4,
  '卯': 10, '戌': 5,
  '寅': 9, '丑': 8, '子': 7, '亥': 6,
};

// 获取宫位的方向信息（用于自化箭头定位）
const getGongPosition = (dizhi: string): { position: string; arrow: string; rotation: number } => {
  const pos = gridOrder[dizhi];
  const positionMap: { [key: number]: { position: string; arrow: string; rotation: number } } = {
    0: { position: 'top-left', arrow: '↖', rotation: -45 },      // 巳 - 左上
    1: { position: 'top', arrow: '↑', rotation: 0 },            // 午 - 上
    2: { position: 'top', arrow: '↑', rotation: 0 },            // 未 - 上
    3: { position: 'top-right', arrow: '↗', rotation: 45 },     // 申 - 右上
    4: { position: 'right', arrow: '→', rotation: 90 },         // 酉 - 右
    5: { position: 'right', arrow: '→', rotation: 90 },         // 戌 - 右
    6: { position: 'bottom-right', arrow: '↘', rotation: 135 }, // 亥 - 右下
    7: { position: 'bottom', arrow: '↓', rotation: 180 },       // 子 - 下
    8: { position: 'bottom', arrow: '↓', rotation: 180 },       // 丑 - 下
    9: { position: 'bottom-left', arrow: '↙', rotation: -135 }, // 寅 - 左下
    10: { position: 'left', arrow: '←', rotation: -90 },        // 卯 - 左
    11: { position: 'left', arrow: '←', rotation: -90 },        // 辰 - 左
  };
  return positionMap[pos] || { position: 'top', arrow: '↑', rotation: 0 };
};

const orderedGongs = computed(() => {
  const gongsWithUpdatedLiunian = props.chartData.gongs.map(gong => {
    // 如果选中了大限，重新计算流年分布
    let liuNianYear = gong.liuNianYear;
    
    if (selectedDaXian.value) {
      const birthYear = props.chartData.birthInfo.year;
      const liunianYearStart = birthYear + selectedDaXian.value.startAge - 1;
      const liunianYearEnd = birthYear + selectedDaXian.value.endAge - 1;
      
      // 地支索引
      const dizhiOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const dizhiIndex = dizhiOrder.indexOf(gong.dizhi);
      
      // 找到匹配的年份
      liuNianYear = undefined;
      for (let year = liunianYearStart; year <= liunianYearEnd; year++) {
        const yearZhiIndex = (year - 4) % 12;
        if (yearZhiIndex === dizhiIndex) {
          liuNianYear = year;
          break;
        }
      }
    }
    
    return {
      ...gong,
      liuNianYear,
      pos: gridOrder[gong.dizhi],
    };
  });
  
  return gongsWithUpdatedLiunian.sort((a, b) => a.pos - b.pos);
});

const shenGongName = computed(() => {
  const shenGongIndex = props.chartData.shenGongIndex;
  return props.chartData.gongs.find(g => {
    const dizhiOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return dizhiOrder.indexOf(g.dizhi) === shenGongIndex;
  })?.gong;
});

const isShenGong = (gongName: string) => {
  return gongName === shenGongName.value;
};

// 处理宫位点击事件（飞化交互）
const handleGongClick = (gong: any) => {
  // 如果点击的是已激活的宫位，则取消飞化
  if (feiHuaActiveGong.value === gong.gong) {
    feiHuaActiveGong.value = null;
    feiHuaResult.value = null;
    return;
  }
  
  // 激活新宫位，计算飞化
  feiHuaActiveGong.value = gong.gong;
  feiHuaResult.value = calculateFeiHua(gong.tiangan, props.chartData.gongs);
};

// 计算流年对应的岁数
const getLiuNianAge = (year: number): number => {
  const birthYear = props.chartData.birthInfo.year;
  return year - birthYear + 1;
};

// 获取年份对应的天干
const getYearGan = (year: number): '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸' => {
  const tianGan: ('甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸')[] = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
  return tianGan[year % 10];
};

// 获取流年飞化（根据选中的流年）
const liuNianSiHua = computed(() => {
  if (!props.selectedYear) return null;
  const gan = getYearGan(props.selectedYear);
  return getSiHuaByGan(gan);
});

// 处理流年点击
const handleLiunianClick = (year: number) => {
  // 如果点击的是已选中的年份，取消选择
  if (props.selectedYear === year) {
    emit('yearSelect', null);
  } else {
    emit('yearSelect', year);
  }
};

// 处理大限点击
const handleDaXianClick = (daXian: any) => {
  // 如果点击的是已选中的大限，取消选择
  if (selectedDaXian.value?.startAge === daXian.startAge) {
    selectedDaXian.value = null;
  } else {
    selectedDaXian.value = daXian;
  }
};

// 监听外部传入的大限起始年龄，自动选中对应的大限
watch(() => props.selectedDaxianStartAge, (newStartAge) => {
  if (newStartAge !== null && newStartAge !== undefined) {
    // 在所有宫位中查找对应的大限
    const gongWithDaxian = props.chartData.gongs.find(g => g.daXian?.startAge === newStartAge);
    if (gongWithDaxian?.daXian) {
      selectedDaXian.value = gongWithDaxian.daXian;
    }
  } else {
    selectedDaXian.value = null;
  }
});

// 监听选中年份变化，自动计算并选中对应的大限
watch(() => props.selectedYear, (newYear) => {
  if (newYear) {
    const birthYear = props.chartData.birthInfo.year;
    const age = newYear - birthYear + 1;
    
    // 找到包含该岁数的大限
    const gongWithDaxian = props.chartData.gongs.find(g => {
      return g.daXian && age >= g.daXian.startAge && age <= g.daXian.endAge;
    });
    
    if (gongWithDaxian?.daXian) {
      selectedDaXian.value = gongWithDaxian.daXian;
    }
  } else if (props.selectedDaxianStartAge === null || props.selectedDaxianStartAge === undefined) {
    // 只有在外部没有指定大限时才清空
    selectedDaXian.value = null;
  }
});

// 检测宫位是否有自化（宫内的星与该宫天干四化出的星相同）
const hasSelfSiHua = (gong: any): { lu: boolean; quan: boolean; ke: boolean; ji: boolean } => {
  const result = { lu: false, quan: false, ke: false, ji: false };
  
  // 获取该宫天干的四化
  const gongSihua = getSiHuaByGan(gong.tiangan);
  
  // 获取该宫所有星曜（主星+辅星）
  const allStars = [...(gong.mainStars || []), ...(gong.auxStars || [])];
  
  // 检查宫天干四化出的星是否在本宫内（自化）
  if (allStars.includes(gongSihua.lu)) {
    result.lu = true;
  }
  if (allStars.includes(gongSihua.quan)) {
    result.quan = true;
  }
  if (allStars.includes(gongSihua.ke)) {
    result.ke = true;
  }
  if (allStars.includes(gongSihua.ji)) {
    result.ji = true;
  }
  
  return result;
};

// 星曜分级：甲级主星
const LEVEL_A_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];

// 获取星曜等级样式类
const getStarLevelClass = (star: string): string => {
  if (LEVEL_A_STARS.includes(star)) return 'level-a';
  return 'level-b';
};

// 获取本命四化背景样式类（实心背景+白色字）
const getSiHuaBgClass = (gong: any, star: string): string => {
  const sihuaItem = gong.sihua?.find((s: any) => s.star === star);
  if (sihuaItem) {
    switch (sihuaItem.hua) {
      case '化禄': return 'sihua-bg-lu';
      case '化权': return 'sihua-bg-quan';
      case '化科': return 'sihua-bg-ke';
      case '化忌': return 'sihua-bg-ji';
      default: return '';
    }
  }
  return '';
};

// 获取生年四化文字（禄权科忌）
const getSiHuaText = (gong: any, star: string): string => {
  const sihuaItem = gong.sihua?.find((s: any) => s.star === star);
  if (sihuaItem) {
    const huaText = sihuaItem.hua.replace('化', '');
    return huaText;
  }
  return '';
};

// 获取生年四化文字样式类
const getSiHuaTextClass = (gong: any, star: string): string => {
  const sihuaItem = gong.sihua?.find((s: any) => s.star === star);
  if (sihuaItem) {
    switch (sihuaItem.hua) {
      case '化禄': return 'sihua-text-lu';
      case '化权': return 'sihua-text-quan';
      case '化科': return 'sihua-text-ke';
      case '化忌': return 'sihua-text-ji';
      default: return '';
    }
  }
  return '';
};

// 获取流年飞化文字（禄权科忌）
const getLiuNianSiHuaText = (star: string): string => {
  if (!liuNianSiHua.value) return '';
  if (star === liuNianSiHua.value.lu) return '禄';
  if (star === liuNianSiHua.value.quan) return '权';
  if (star === liuNianSiHua.value.ke) return '科';
  if (star === liuNianSiHua.value.ji) return '忌';
  return '';
};

// 获取流年飞化文字样式类
const getLiuNianSiHuaTextClass = (star: string): string => {
  if (!liuNianSiHua.value) return '';
  if (star === liuNianSiHua.value.lu) return 'liunian-sihua-text-lu';
  if (star === liuNianSiHua.value.quan) return 'liunian-sihua-text-quan';
  if (star === liuNianSiHua.value.ke) return 'liunian-sihua-text-ke';
  if (star === liuNianSiHua.value.ji) return 'liunian-sihua-text-ji';
  return '';
};

// 获取飞化背景样式类（彩色背景，不显示文字）
const getFeiHuaBgClass = (gong: any, star: string): string => {
  // 检查飞化
  if (feiHuaResult.value) {
    if (feiHuaResult.value.lu?.star === star && feiHuaResult.value.lu?.targetGong === gong.gong) {
      return 'feihua-bg-lu';
    }
    if (feiHuaResult.value.quan?.star === star && feiHuaResult.value.quan?.targetGong === gong.gong) {
      return 'feihua-bg-quan';
    }
    if (feiHuaResult.value.ke?.star === star && feiHuaResult.value.ke?.targetGong === gong.gong) {
      return 'feihua-bg-ke';
    }
    if (feiHuaResult.value.ji?.star === star && feiHuaResult.value.ji?.targetGong === gong.gong) {
      return 'feihua-bg-ji';
    }
  }
  return '';
};



</script>

<style scoped>
.ziwei-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Microsoft YaHei', sans-serif;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  width: min(98vw, 98vh);
  height: min(98vw, 98vh);
  max-width: 1800px;
  max-height: 1800px;
  aspect-ratio: 1;
  border: 3px solid #333;
  background: #fff;
}

.gong-cell {
  border: 1px solid #ccc;
  position: relative;
}

.gong-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

/* 自化箭头指示器 - 贴边显示，根据宫位方向定位 */
.self-sihua-indicators {
  position: absolute;
  display: flex;
  gap: 3px;
  z-index: 20;
}

/* 根据宫位方向定位箭头 - 完全在边缘外部 */
/* 左上角 - 斜角排布（左右） */
.self-sihua-indicators.position-top-left {
  top: -12px;
  left: -12px;
  flex-direction: row;
}

/* 上方宫位 - 左右排布 */
.self-sihua-indicators.position-top {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
}

/* 右上角 - 斜角排布（左右） */
.self-sihua-indicators.position-top-right {
  top: -12px;
  right: -12px;
  flex-direction: row;
}

/* 右侧宫位 - 上下排布 */
.self-sihua-indicators.position-right {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

/* 右下角 - 斜角排布（左右） */
.self-sihua-indicators.position-bottom-right {
  bottom: -12px;
  right: -12px;
  flex-direction: row;
}

/* 下方宫位 - 左右排布 */
.self-sihua-indicators.position-bottom {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
}

/* 左下角 - 斜角排布（左右） */
.self-sihua-indicators.position-bottom-left {
  bottom: -12px;
  left: -12px;
  flex-direction: row;
}

/* 左侧宫位 - 上下排布 */
.self-sihua-indicators.position-left {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.self-sihua-arrow {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  opacity: 1;
  text-shadow: 
    0 0 3px rgba(255, 255, 255, 0.9),
    0 0 5px rgba(255, 255, 255, 0.7);
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}

.arrow-lu {
  color: #16a34a; /* 绿色 - 化禄 */
}

.arrow-quan {
  color: #9333ea; /* 紫色 - 化权 */
}

.arrow-ke {
  color: #2563eb; /* 蓝色 - 化科 */
}

.arrow-ji {
  color: #dc2626; /* 红色 - 化忌 */
}

.gong-inner:hover {
  background-color: #f9fafb;
}

.gong-inner.feihua-active {
  background-color: #fef3c7;
  box-shadow: inset 0 0 0 2px #f59e0b;
}

/* 顶部天干地支横排 */
.gong-ganzhi-top {
  position: absolute;
  top: 3px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 1px;
  font-family: 'SimSun', '宋体', serif;
  font-size: 13px;
  color: #1e40af;
  font-weight: bold;
  z-index: 10;
  letter-spacing: 1px;
}

/* 右上角宫位干支竖排 */
.gong-ganzhi-top.vertical {
  flex-direction: column;
  gap: 2px;
}

.gong-ganzhi-top .tiangan,
.gong-ganzhi-top .dizhi {
  line-height: 1;
}

/* 主要内容区 */
.gong-main-area {
  display: flex;
  flex-direction: column;
  padding: 18px 6px 4px 6px;
  overflow: hidden;
  flex: 1;
}

.gong-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid #e5e7eb;
  min-height: 18px;
}

.gong-name { 
  color: #4b5563;
  font-weight: 600;
  font-size: 13px;
  font-family: 'Microsoft YaHei', '黑体', sans-serif;
}

.gong-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

/* 星曜区域 */
.stars-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-stars-section .star-item {
  font-size: 13px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 3px;
}

.aux-stars-section {
  flex-direction: column;
  gap: 2px;
}

.aux-stars-section .star-item {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.gong-footer {
  margin-top: auto;
  padding-top: 4px;
  font-size: 10px;
  position: relative;
  min-height: 40px; /* 确保有足够空间容纳流年和大运 */
}

.daxian-info {
  position: absolute;
  right: 4px;
  bottom: 4px;
  font-size: 10px;
  line-height: 1.3;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 3px;
  z-index: 5;
}

.daxian-info:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.age-range {
  color: #666;
  font-weight: 500;
}

/* 大限宫位标签 - 显示在宫位左下角，普通黑色 */
.daxian-gong-label {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 1px 4px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #555555;
  font-size: 10px;
  font-weight: 500;
  border-radius: 2px;
  z-index: 10;
  pointer-events: none; /* 不阻挡点击事件 */
}

.liunian-more {
  color: #888;
  margin-left: 2px;
}

.year-current {
  color: #16a34a;
  font-weight: bold;
  font-size: 10px;
}

.daxian-mark {
  color: #dc2626;
  font-weight: bold;
  font-size: 9px;
}

/* 当前大限只高亮岁数文字区域 - 仅包裹文字内容 */
.current-daxian .age-range {
  background-color: #fef3c7;
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid #fbbf24;
  color: #f59e0b;
  font-weight: 600;
  display: inline-block;
}

.current-daxian .age-current,
.current-daxian .year-current {
  color: #f59e0b;
}

/* 选中的大限样式 - 只给岁数文字加样式 */
.selected-daxian .age-range {
  background-color: #3b82f6;
  color: #ffffff;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid #2563eb;
  display: inline-block;
}

/* 如果既是当前大限又被选中，优先使用选中样式（蓝色） */
.current-daxian.selected-daxian .age-range {
  background-color: #3b82f6;
  border-color: #2563eb;
  color: #ffffff;
}

.selected-daxian .daxian-mark {
  color: #3b82f6;
  font-weight: bold;
}

/* 流年信息样式 - 显示岁数+年份，居中显示在大运上方 */
.liunian-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 2px auto;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
}

.liunian-info:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.liunian-info.liunian-selected {
  background-color: #3b82f6;
  border: 1px solid #2563eb;
}

.liunian-age {
  color: #888;
  font-size: 9px;
}

.liunian-year {
  color: #2563eb;
  font-weight: 600;
}

.liunian-info.liunian-selected .liunian-age,
.liunian-info.liunian-selected .liunian-year {
  color: #ffffff;
  font-weight: 700;
}

.star-item {
  display: inline-block;
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 生年四化文字标记（实心背景+白字） */
.sihua-text {
  display: inline-block;
  padding: 1px 3px;
  font-size: 9px;
  font-weight: bold;
  border-radius: 2px;
  color: #ffffff;
}

.sihua-text-lu {
  background-color: #16a34a;
}

.sihua-text-quan {
  background-color: #9333ea;
}

.sihua-text-ke {
  background-color: #2563eb;
}

.sihua-text-ji {
  background-color: #dc2626;
}

/* 流年飞化文字标记（虚线边框+实心背景，区别于生年四化） */
.liunian-sihua-text {
  display: inline-block;
  padding: 1px 3px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.7);
}

.liunian-sihua-text-lu {
  color: #22c55e;
  border: 1px dashed #22c55e;
}

.liunian-sihua-text-quan {
  color: #a855f7;
  border: 1px dashed #a855f7;
}

.liunian-sihua-text-ke {
  color: #3b82f6;
  border: 1px dashed #3b82f6;
}

.liunian-sihua-text-ji {
  color: #ef4444;
  border: 1px dashed #ef4444;
}

/* 主星等级样式 - 统一大小 */
.star-item.level-a {
  color: #dc2626;
  font-weight: bold;
  font-size: 13px;
}

.star-item.level-b {
  color: #9333ea;
  font-weight: 500;
  font-size: 13px;
}

.star-item.level-c {
  color: #2563eb;
  font-size: 13px;
}

/* 辅星样式 - 与主星大小一致（13px），仅用颜色区分 */
.star-item.aux-star {
  color: #16a34a;
  font-size: 13px;
  font-weight: 500;
}

/* 四化标记样式 - 方框标记 */
.sihua-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 3px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 2px;
  margin-left: 2px;
  border: 1px solid;
}

/* 本命四化背景 - 不使用，改用文字标记 */

/* 飞化标记 - 彩色背景+白色字体，与生年四化样式一致 */
.feihua-bg-lu {
  background-color: #16a34a;
  color: #ffffff !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.feihua-bg-quan {
  background-color: #9333ea;
  color: #ffffff !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.feihua-bg-ke {
  background-color: #2563eb;
  color: #ffffff !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.feihua-bg-ji {
  background-color: #dc2626;
  color: #ffffff !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

/* 身宫样式 - 仅用文字标签，不再使用整宫高亮 */
.shen-gong-label {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 4px;
  background-color: #f59e0b;
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  border-radius: 2px;
  vertical-align: middle;
}

/* 大限命宫标签样式 */
.daxian-ming-label {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 4px;
  background-color: #dc2626;
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  border-radius: 2px;
  vertical-align: middle;
}

/* Grid positioning */
.grid-pos-0 { grid-area: 1 / 1; }
.grid-pos-1 { grid-area: 1 / 2; }
.grid-pos-2 { grid-area: 1 / 3; }
.grid-pos-3 { grid-area: 1 / 4; }
.grid-pos-4 { grid-area: 2 / 4; }
.grid-pos-5 { grid-area: 3 / 4; }
.grid-pos-6 { grid-area: 4 / 4; }
.grid-pos-7 { grid-area: 4 / 3; }
.grid-pos-8 { grid-area: 4 / 2; }
.grid-pos-9 { grid-area: 4 / 1; }
.grid-pos-10 { grid-area: 3 / 1; }
.grid-pos-11 { grid-area: 2 / 1; }

.center-info {
  grid-area: 2 / 2 / span 2 / span 2;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 1px solid transparent;
  background-color: transparent;
  pointer-events: none;
}

.center-content {
  line-height: 1.6;
}

.center-content h3 {
  margin: 0 0 10px 0;
  color: #d33682;
  font-size: 1.2em;
}

.yinyang-info {
  color: #268bd2;
  font-weight: bold;
  font-size: 1.1em;
  margin: 5px 0;
}

.wuxing-info {
  color: #859900;
  font-weight: bold;
  margin: 5px 0;
}

.birth-date, .lunar-date {
  font-size: 0.85em;
  color: #666;
  margin: 3px 0;
}

.sizhu-info {
  margin-top: 10px;
  font-size: 0.9em;
}

.palace-info {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
  font-size: 0.85em;
}

.palace-info p {
  margin: 3px 0;
  color: #555;
}

.sizhu-row {
  display: flex;
  align-items: center;
  margin: 3px 0;
}

.sizhu-label {
  font-weight: bold;
  margin-right: 5px;
  color: #666;
}

.sizhu-value {
  color: #333;
  font-family: 'KaiTi', 'SimKai', serif;
}

/* 飞化提示样式 */
.feihua-tip {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8em;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.feihua-tip.inactive {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border: 1px solid #818cf8;
}

.feihua-title {
  font-weight: bold;
  color: #92400e;
  margin-bottom: 4px;
  font-size: 1.1em;
}

.feihua-desc {
  color: #78350f;
  line-height: 1.4;
  font-size: 0.9em;
}

.feihua-tip.inactive .feihua-desc {
  color: #3730a3;
  text-align: center;
}

/* 星曜包装器 */
.star-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star-item {
  display: inline-flex;
  align-items: center;
  font-family: 'Microsoft YaHei', sans-serif;
}
</style>
