<template>
  <div class="bazi-quick-input">
    <el-form :model="localForm" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input v-model="localForm.name" placeholder="非必填" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别">
            <el-radio-group v-model="localForm.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 八字输入大框 -->
      <el-form-item label="四柱八字">
        <div class="bazi-input-container">
          <!-- 年柱 -->
          <div 
            class="pillar-box" 
            :class="{ active: currentPillar === 'year' }"
            @click="selectPillar('year')"
          >
            <div class="pillar-label">年柱</div>
            <div class="pillar-value">
              {{ localForm.yearGanZhi || '　' }}
            </div>
          </div>
          
          <!-- 月柱 -->
          <div 
            class="pillar-box" 
            :class="{ active: currentPillar === 'month' }"
            @click="selectPillar('month')"
          >
            <div class="pillar-label">月柱</div>
            <div class="pillar-value">
              {{ localForm.monthGanZhi || '　' }}
            </div>
          </div>
          
          <!-- 日柱 -->
          <div 
            class="pillar-box" 
            :class="{ active: currentPillar === 'day' }"
            @click="selectPillar('day')"
          >
            <div class="pillar-label">日柱</div>
            <div class="pillar-value">
              {{ localForm.dayGanZhi || '　' }}
            </div>
          </div>
          
          <!-- 时柱 -->
          <div 
            class="pillar-box" 
            :class="{ active: currentPillar === 'hour' }"
            @click="selectPillar('hour')"
          >
            <div class="pillar-label">时柱</div>
            <div class="pillar-value">
              {{ localForm.hourGanZhi || '　' }}
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 天干地支选择面板 -->
      <div v-if="currentPillar" class="selection-panel">
        <!-- 天干选择 -->
        <div class="gan-row">
          <div
            v-for="(gan, index) in TIANGAN"
            :key="gan"
            class="gan-item"
            :class="{ 
              yang: index % 2 === 0, 
              yin: index % 2 === 1,
              selected: selectedGan === gan
            }"
            @click="selectGan(gan, index)"
          >
            {{ gan }}
          </div>
        </div>

        <!-- 地支选择（始终显示，根据天干选择禁用不匹配的） -->
        <div class="zhi-row">
          <div
            v-for="(zhi, index) in DIZHI"
            :key="zhi"
            class="zhi-item"
            :class="{ 
              yang: index % 2 === 0, 
              yin: index % 2 === 1,
              disabled: selectedGanIndex !== -1 && !isZhiAvailable(index)
            }"
            @click="selectZhi(zhi, index)"
          >
            {{ zhi }}
          </div>
        </div>
      </div>

      <!-- 甲子周期选择（仅当需要时显示） -->
      <el-row v-if="showJiaziCycleSelector" :gutter="20">
        <el-col :span="24">
          <el-form-item label="甲子周期">
            <el-radio-group v-model="localForm.jiaziCycle">
              <el-radio :value="1924">1924-1983 (上个甲子)</el-radio>
              <el-radio :value="1984">1984-2043 (当前甲子)</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          八字排盘
        </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="$emit('show-cases')" type="success">加载案例</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { TIANGAN, DIZHI, getTianganIndex, getDizhiIndex } from '../core/ganzhi';

// Props
interface Props {
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

// Emits
const emit = defineEmits<{
  submit: [formData: BaziQuickFormData];
  reset: [];
  'show-cases': [];
}>();

// 八字快捷输入表单接口
export interface BaziQuickFormData {
  name: string;
  gender: 'male' | 'female';
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  hourGanZhi: string;
  jiaziCycle: number;
}

// 表单数据
const localForm = reactive<BaziQuickFormData>({
  name: '',
  gender: 'male',
  yearGanZhi: '',
  monthGanZhi: '',
  dayGanZhi: '',
  hourGanZhi: '',
  jiaziCycle: 1984,
});

// 八字输入交互状态
type PillarType = 'year' | 'month' | 'day' | 'hour';
const currentPillar = ref<PillarType | null>(null);
const selectedGan = ref('');
const selectedGanIndex = ref(-1);
const showJiaziCycleSelector = ref(false);

// 选择柱位
const selectPillar = (pillar: PillarType) => {
  currentPillar.value = pillar;
  selectedGan.value = '';
  selectedGanIndex.value = -1;
};

// 选择天干
const selectGan = (gan: string, ganIndex: number) => {
  selectedGan.value = gan;
  selectedGanIndex.value = ganIndex;
};

// 判断地支是否可选
const isZhiAvailable = (zhiIndex: number): boolean => {
  if (selectedGanIndex.value === -1) return false;
  const ganYinYang = selectedGanIndex.value % 2;
  const zhiYinYang = zhiIndex % 2;
  return ganYinYang === zhiYinYang;
};

// 选择地支
const selectZhi = (zhi: string, zhiIndex: number) => {
  if (!isZhiAvailable(zhiIndex)) {
    return;
  }
  
  const ganZhi = selectedGan.value + zhi;
  
  if (currentPillar.value === 'year') {
    localForm.yearGanZhi = ganZhi;
    currentPillar.value = 'month';
    selectedGan.value = '';
    selectedGanIndex.value = -1;
  } else if (currentPillar.value === 'month') {
    localForm.monthGanZhi = ganZhi;
    currentPillar.value = 'day';
    selectedGan.value = '';
    selectedGanIndex.value = -1;
  } else if (currentPillar.value === 'day') {
    localForm.dayGanZhi = ganZhi;
    currentPillar.value = 'hour';
    selectedGan.value = '';
    selectedGanIndex.value = -1;
  } else if (currentPillar.value === 'hour') {
    localForm.hourGanZhi = ganZhi;
    currentPillar.value = null;
    selectedGan.value = '';
    selectedGanIndex.value = -1;
    checkJiaziCycle();
  }
};

// 检查是否需要显示甲子周期选择器
const checkJiaziCycle = () => {
  if (!localForm.yearGanZhi) {
    showJiaziCycleSelector.value = false;
    return;
  }
  
  const yearGan = localForm.yearGanZhi[0];
  const yearZhi = localForm.yearGanZhi[1];
  const yearGanIndex = getTianganIndex(yearGan as any);
  const yearZhiIndex = getDizhiIndex(yearZhi as any);
  
  let yearJiaziIndex = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === yearGanIndex && i % 12 === yearZhiIndex) {
      yearJiaziIndex = i;
      break;
    }
  }
  
  if (yearJiaziIndex === -1) {
    showJiaziCycleSelector.value = false;
    return;
  }
  
  const year2 = 1984 + yearJiaziIndex;
  const currentYear = new Date().getFullYear();
  
  if (year2 > currentYear) {
    localForm.jiaziCycle = 1924;
    showJiaziCycleSelector.value = false;
  } else {
    showJiaziCycleSelector.value = true;
  }
};

// 提交表单
const handleSubmit = () => {
  const { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi, jiaziCycle } = localForm;
  
  if (!yearGanZhi || !monthGanZhi || !dayGanZhi || !hourGanZhi) {
    ElMessage.warning('请选择完整的四柱八字！');
    return;
  }
  
  if (!jiaziCycle) {
    ElMessage.warning('请选择甲子周期年代！');
    return;
  }
  
  emit('submit', { ...localForm });
};

// 重置表单
const handleReset = () => {
  localForm.name = '';
  localForm.gender = 'male';
  localForm.yearGanZhi = '';
  localForm.monthGanZhi = '';
  localForm.dayGanZhi = '';
  localForm.hourGanZhi = '';
  localForm.jiaziCycle = 1984;
  
  currentPillar.value = null;
  selectedGan.value = '';
  selectedGanIndex.value = -1;
  showJiaziCycleSelector.value = false;
  
  emit('reset');
};

// 暴露方法供外部调用
defineExpose({
  reset: handleReset,
  getFormData: () => ({ ...localForm }),
  setFormData: (data: Partial<BaziQuickFormData>) => {
    Object.assign(localForm, data);
  },
});
</script>

<style scoped>
.bazi-quick-input {
  width: 100%;
}

.bazi-input-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.pillar-box {
  width: 80px;
  height: 80px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.pillar-box:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.pillar-box.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.pillar-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.pillar-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  letter-spacing: 2px;
}

.selection-panel {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.gan-row,
.zhi-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.gan-row {
  margin-bottom: 15px;
}

.gan-item,
.zhi-item {
  width: 38px;
  height: 38px;
  border: 2px solid #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
}

.gan-item.yang,
.zhi-item.yang {
  color: #e6a23c;
  border-color: #f5dab1;
}

.gan-item.yin,
.zhi-item.yin {
  color: #409eff;
  border-color: #b3d8ff;
}

.gan-item:hover:not(.selected),
.zhi-item:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.gan-item.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.zhi-item.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f5f7fa;
}
</style>
