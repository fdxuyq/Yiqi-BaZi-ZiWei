<template>
  <div class="chart-page">
    <el-container>
      <el-main>
        <!-- 生辰信息输入表单 -->
        <div v-show="!chartResult" class="form-page">
          <div class="form-title-header">
            <h2>易奇排盘系统</h2>
          </div>
          <el-card class="birth-info-card">
            <!-- 快捷输入标签页切换 -->
            <el-tabs v-model="inputMode" class="input-mode-tabs">
              <el-tab-pane label="日期时间输入" name="date"></el-tab-pane>
              <el-tab-pane label="八字快捷输入" name="bazi"></el-tab-pane>
            </el-tabs>

            <!-- 八字快捷输入模式 -->
            <BaziQuickInput
              v-if="inputMode === 'bazi'"
              ref="baziInputRef"
              :loading="loading"
              @submit="handleBaziSubmit"
              @reset="handleBaziReset"
              @show-cases="showCaseDialog = true"
            />

            <!-- 日期时间输入模式 -->
            <DateTimeInput
              v-else
              ref="dateTimeInputRef"
              :loading="loading"
              @submit="handleDateTimeSubmit"
              @reset="handleDateTimeReset"
              @show-cases="showCaseDialog = true"
            />
          </el-card>
        </div>

        <!-- 排盘结果展示 -->
        <div v-if="chartResult" class="chart-result">
          <div class="chart-result-container">
            <!-- 左侧菜单区域 -->
            <div class="left-sidebar">
              <!-- 标题 -->
              <div class="sidebar-title">
                <h2>易奇排盘系统</h2>
              </div>
              
              <!-- 标签页导航 -->
              <el-tabs v-model="activeTab" tab-position="left" class="chart-tabs">
                <!-- 八字紫微融合视图 -->
                <el-tab-pane label="八字紫微同参" name="integrated">
                  <div class="tab-header">
                    <el-button @click="backToForm" type="primary" size="small">返回输入</el-button>
                    <el-button @click="saveCurrentCase" type="success" size="small">保存案例</el-button>
                  </div>
                  <ChartIntegratedView 
                    v-if="chartResult" 
                    :bazi-chart-data="chartResult.bazi"
                    :ziwei-chart-data="chartResult.ziwei"
                    :owner-name="currentName"
                  />
                </el-tab-pane>
                
                <!-- 八字排盘 -->
                <el-tab-pane label="八字排盘" name="bazi">
                  <div class="tab-header">
                    <el-button @click="backToForm" type="primary" size="small">返回输入</el-button>
                    <el-button @click="saveCurrentCase" type="success" size="small">保存案例</el-button>
                  </div>
                  <BaziChart v-if="chartResult" :chart-data="chartResult.bazi" />
                </el-tab-pane>
                
                <!-- 紫微斗数 -->
                <el-tab-pane label="紫微斗数" name="ziwei">
                  <div class="tab-header">
                    <el-button @click="backToForm" type="primary" size="small">返回输入</el-button>
                    <el-button @click="saveCurrentCase" type="success" size="small">保存案例</el-button>
                  </div>
                  <ZiweiChart v-if="chartResult" :chart-data="chartResult.ziwei" />
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>

        <!-- 案例管理对话框 -->
        <CaseManager
          ref="caseManagerRef"
          v-model="showCaseDialog"
          @load="handleLoadCase"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { createChart } from '../core';
import type { ChartResult, BirthInfo } from '../core/types';
import dayjs from 'dayjs';
import BaziChart from '../components/BaziChart.vue';
import ZiweiChart from '../components/ZiweiChart.vue';
import ChartIntegratedView from '../components/ChartIntegratedView.vue';
import BaziQuickInput, { type BaziQuickFormData } from '../components/BaziQuickInput.vue';
import DateTimeInput, { type DateTimeFormData } from '../components/DateTimeInput.vue';
import CaseManager from '../components/CaseManager.vue';
import type { SavedCase } from '../core/types';
import { getTianganIndex, getDizhiIndex } from '../core/ganzhi';
import { Solar } from 'lunar-javascript';

// 输入模式
const inputMode = ref<'date' | 'bazi'>('date');

// 组件引用
const baziInputRef = ref<InstanceType<typeof BaziQuickInput>>();
const dateTimeInputRef = ref<InstanceType<typeof DateTimeInput>>();
const caseManagerRef = ref<InstanceType<typeof CaseManager>>();

// 排盘状态
const loading = ref(false);
const chartResult = ref<ChartResult | null>(null);
const activeTab = ref('integrated');
const currentName = ref('');

// 案例管理
const showCaseDialog = ref(false);

// 用于生成序号的计数器
const nameSequence = ref(1);

// 处理八字输入提交
const handleBaziSubmit = async (formData: BaziQuickFormData) => {
  loading.value = true;
  
  try {
    const { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi, jiaziCycle } = formData;
    
    // 从八字推算日期
    const estimatedDate = estimateDateFromBazi(
      yearGanZhi, 
      monthGanZhi, 
      dayGanZhi, 
      hourGanZhi,
      jiaziCycle
    );
    
    if (!estimatedDate) {
      ElMessage.error('无法从八字推算日期，请检查八字是否正确！');
      loading.value = false;
      return;
    }
    
    // 生成姓名
    let name = formData.name;
    if (!name) {
      const dateStr = dayjs().format('YYMMDD');
      const seqStr = String(nameSequence.value).padStart(2, '0');
      name = `例${dateStr}${seqStr}`;
      nameSequence.value++;
    }
    currentName.value = name;
    
    // 创建 BirthInfo
    const birthInfo: BirthInfo = {
      year: estimatedDate.year,
      month: estimatedDate.month,
      day: estimatedDate.day,
      hour: estimatedDate.hour,
      minute: estimatedDate.minute,
      isLunar: false,
      gender: formData.gender,
      timeZone: 8,
    };
    
    // 生成排盘
    const result = createChart(birthInfo);
    
    // 用用户输入的八字覆盖自动计算的八字
    result.bazi.siZhu = {
      year: {
        gan: yearGanZhi[0] as any,
        zhi: yearGanZhi[1] as any,
      },
      month: {
        gan: monthGanZhi[0] as any,
        zhi: monthGanZhi[1] as any,
      },
      day: {
        gan: dayGanZhi[0] as any,
        zhi: dayGanZhi[1] as any,
      },
      hour: {
        gan: hourGanZhi[0] as any,
        zhi: hourGanZhi[1] as any,
      },
    };
    
    result.bazi.dayMaster = dayGanZhi[0] as any;
    chartResult.value = result;
    
    ElMessage.success(`八字排盘成功！使用八字：${yearGanZhi} ${monthGanZhi} ${dayGanZhi} ${hourGanZhi}`);
  } catch (error: any) {
    console.error('八字排盘失败:', error);
    ElMessage.error(`排盘失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 处理日期时间输入提交
const handleDateTimeSubmit = async (formData: DateTimeFormData) => {
  loading.value = true;
  
  try {
    // 生成姓名
    let name = formData.name;
    if (!name) {
      const dateStr = dayjs().format('YYMMDD');
      const seqStr = String(nameSequence.value).padStart(2, '0');
      name = `例${dateStr}${seqStr}`;
      nameSequence.value++;
    }
    currentName.value = name;
    
    // 从表单数据中提取BirthInfo
    const birthInfo: BirthInfo = {
      year: formData.year,
      month: formData.month,
      day: formData.day,
      hour: formData.hour,
      minute: formData.minute,
      isLunar: formData.isLunar,
      gender: formData.gender,
      timeZone: formData.timeZone,
    };
    
    const result = createChart(birthInfo);
    chartResult.value = result;
    
    ElMessage.success('排盘成功！');
  } catch (error: any) {
    console.error('排盘失败:', error);
    ElMessage.error(`排盘失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 处理重置
const handleBaziReset = () => {
  chartResult.value = null;
};

const handleDateTimeReset = () => {
  chartResult.value = null;
};

// 返回输入表单
const backToForm = () => {
  chartResult.value = null;
  activeTab.value = 'integrated';
};

// 保存当前排盘案例
const saveCurrentCase = () => {
  if (!chartResult.value) {
    ElMessage.warning('请先完成排盘！');
    return;
  }

  // 获取当前表单数据
  let birthFormData: any;
  if (inputMode.value === 'bazi' && baziInputRef.value) {
    const baziData = baziInputRef.value.getFormData();
    // 从八字推算的日期创建birthForm
    const { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi, jiaziCycle } = baziData;
    const estimatedDate = estimateDateFromBazi(yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi, jiaziCycle);
    if (estimatedDate) {
      birthFormData = {
        name: currentName.value,
        gender: baziData.gender,
        year: estimatedDate.year,
        month: estimatedDate.month,
        day: estimatedDate.day,
        hour: estimatedDate.hour,
        minute: estimatedDate.minute,
        isLunar: false,
        timeZone: 8,
      };
    }
  } else if (dateTimeInputRef.value) {
    birthFormData = dateTimeInputRef.value.getFormData();
    birthFormData.name = currentName.value;
  }

  if (!birthFormData) {
    ElMessage.error('无法获取表单数据');
    return;
  }

  const savedCase: SavedCase = {
    id: Date.now().toString(),
    name: currentName.value || '未命名案例',
    birthForm: birthFormData,
    chartResult: chartResult.value,
    savedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };

  if (caseManagerRef.value?.saveCase(savedCase)) {
    ElMessage.success(`案例"${savedCase.name}"已保存！`);
  } else {
    ElMessage.error('保存失败，请检查浏览器存储是否可用。');
  }
};

// 加载案例
const handleLoadCase = (caseData: SavedCase) => {
  currentName.value = caseData.name;
  chartResult.value = caseData.chartResult;
  
  // 根据案例数据更新输入组件
  if (dateTimeInputRef.value) {
    dateTimeInputRef.value.setFormData(caseData.birthForm);
  }
};

// 从八字推算日期（使用 lunar-javascript 库）
const estimateDateFromBazi = (
  yearGZ: string, 
  monthGZ: string, 
  dayGZ: string, 
  hourGZ: string,
  jiaziCycle: number
): { year: number; month: number; day: number; hour: number; minute: number } | null => {
  try {
    // 1. 从年柱推算具体年份
    const yearGan = yearGZ[0];
    const yearZhi = yearGZ[1];
    const yearGanIndex = getTianganIndex(yearGan as any);
    const yearZhiIndex = getDizhiIndex(yearZhi as any);
    
    let yearJiaziIndex = -1;
    for (let i = 0; i < 60; i++) {
      if (i % 10 === yearGanIndex && i % 12 === yearZhiIndex) {
        yearJiaziIndex = i;
        break;
      }
    }
    
    const estimatedYear = jiaziCycle + yearJiaziIndex;
    
    // 2. 从月柱推算月份范围
    const monthZhi = monthGZ[1];
    const monthRanges: Record<string, number[]> = {
      '寅': [1, 2, 3],
      '卯': [2, 3, 4],
      '辰': [3, 4, 5],
      '巳': [4, 5, 6],
      '午': [5, 6, 7],
      '未': [6, 7, 8],
      '申': [7, 8, 9],
      '酉': [8, 9, 10],
      '戌': [9, 10, 11],
      '亥': [10, 11, 12],
      '子': [11, 12, 1],
      '丑': [12, 1, 2],
    };
    
    const searchMonths = monthRanges[monthZhi] || [6, 7, 8];
    
    // 3. 在月份范围内查找匹配的日期
    let foundDate: { year: number; month: number; day: number } | null = null;
    
    for (const searchMonth of searchMonths) {
      let searchYear = estimatedYear;
      if (monthZhi === '子' && searchMonth === 1) {
        searchYear = estimatedYear + 1;
      } else if (monthZhi === '丑' && searchMonth === 1) {
        searchYear = estimatedYear + 1;
      }
      
      const daysInMonth = new Date(searchYear, searchMonth, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        try {
          const solar = (Solar as any).fromYmdHms(searchYear, searchMonth, day, 12, 0, 0);
          const lunar = solar.getLunar();
          
          const lunarMonthGZ = lunar.getMonthInGanZhi();
          const lunarDayGZ = lunar.getDayInGanZhi();
          
          if (lunarMonthGZ === monthGZ && lunarDayGZ === dayGZ) {
            foundDate = { year: searchYear, month: searchMonth, day };
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (foundDate) break;
    }
    
    if (!foundDate) {
      console.error(`未找到匹配的日期: ${yearGZ} ${monthGZ} ${dayGZ}`);
      return null;
    }
    
    // 4. 从时柱推算时辰
    const hourZhi = hourGZ[1];
    const hourZhiToHour: Record<string, number> = {
      '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
      '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22
    };
    const estimatedHour = hourZhiToHour[hourZhi] || 12;
    
    return {
      year: foundDate.year,
      month: foundDate.month,
      day: foundDate.day,
      hour: estimatedHour,
      minute: 0,
    };
  } catch (error) {
    console.error('推算日期失败:', error);
    return null;
  }
};
</script>

<style scoped>
/* 基础样式 */
.chart-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf9f7 0%, #f0ede8 100%);
}

.el-main {
  padding: 0;
  width: 100%;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

/* 表单页面 */
.form-page {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.form-title-header {
  background: linear-gradient(180deg, #8b6f47 0%, #6d5638 100%);
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid #d4a574;
  position: relative;
}

.form-title-header::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 30%;
  right: 30%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #f0c080, transparent);
}

.form-title-header h2 {
  margin: 0;
  font-size: 32px;
  color: #fef6e8;
  font-weight: 600;
  letter-spacing: 8px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.birth-info-card {
  max-width: 800px;
  margin: 30px auto;
  width: calc(100% - 40px);
  border: 1px solid #d4a574;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(139, 111, 71, 0.15);
}

.birth-info-card :deep(.el-card__body) {
  padding: 30px;
}

.input-mode-tabs {
  margin-bottom: 20px;
}

.input-mode-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.input-mode-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 2px;
  background-color: #d4a574;
}

.input-mode-tabs :deep(.el-tabs__active-bar) {
  background-color: #8b6f47;
}

.input-mode-tabs :deep(.el-tabs__item) {
  color: #6b5d4f;
  font-weight: 500;
}

.input-mode-tabs :deep(.el-tabs__item.is-active) {
  color: #8b6f47;
  font-weight: 600;
}

/* 排盘结果 */
.chart-result {
  width: 100%;
  flex: 1;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.chart-result-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
}

/* 左侧边栏 */
.left-sidebar {
  display: flex;
  flex-direction: column;
  background: #fafaf9;
  border-right: 2px solid #d4a574;
  min-width: 160px;
  max-width: 160px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  background: linear-gradient(180deg, #8b6f47 0%, #6d5638 100%);
  padding: 18px 10px;
  text-align: center;
  border-bottom: 2px solid #d4a574;
  position: relative;
}

.sidebar-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f0c080, transparent);
}

.sidebar-title h2 {
  margin: 0;
  font-size: 18px;
  color: #fef6e8;
  font-weight: 600;
  letter-spacing: 4px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 标签页样式 */
.chart-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-tabs :deep(.el-tabs__header) {
  background: transparent;
  padding: 15px 0 10px 0;
  border: none !important;
  border-right: none !important;
  width: 100%;
}

.chart-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 10px;
  border: none !important;
}

.chart-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none !important;
}

.chart-tabs :deep(.el-tabs__nav-scroll) {
  border: none !important;
}

.chart-tabs :deep(.el-tabs__nav) {
  width: 100%;
  border: none !important;
}

.chart-tabs :deep(.el-tabs__active-bar) {
  display: none !important;
}

.chart-tabs :deep(.el-tabs__item) {
  padding: 14px 12px;
  font-size: 14px;
  color: #6b5d4f;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  margin-bottom: 6px;
  transition: all 0.3s;
  text-align: center;
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  height: auto;
  line-height: 1.4;
}

.chart-tabs :deep(.el-tabs__item:hover) {
  background: rgba(212, 165, 116, 0.1);
  color: #5a4a3a;
  border-color: #d4a574;
}

.chart-tabs :deep(.el-tabs__item.is-active) {
  background: linear-gradient(135deg, #8b6f47 0%, #6d5638 100%);
  color: #fef6e8;
  font-weight: 600;
  border-color: #d4a574;
  box-shadow: 0 2px 8px rgba(139, 111, 71, 0.3);
}

.chart-tabs :deep(.el-tabs__content) {
  position: absolute;
  left: 160px;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  background: #fffefb;
}

.chart-tabs :deep(.el-tab-pane) {
  height: 100%;
  position: relative;
  padding: 0;
}

.tab-header {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .el-main {
    padding: 10px;
  }
}
</style>
