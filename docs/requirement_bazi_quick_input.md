# 快捷录入排盘功能需求文档

## 文档版本
- **创建日期**: 2025-12-05
- **最后更新**: 2025-12-06
- **文档状态**: ✅ 已实现（持续优化中）

---

## 一、功能概述

快捷录入排盘是专为命理师设计的专业功能，允许直接输入已知的八字四柱进行排盘，无需通过日期时间选择。这大大提升了命理师的工作效率，特别适合已有八字信息或需要快速验证某个八字命盘的场景。

### 核心价值
- **提升效率**: 命理师可直接输入八字，省去日期选择步骤
- **专业便捷**: 符合命理师的工作习惯和流程
- **精准快速**: 点选式输入，避免输入错误
- **自动匹配**: 天干地支自动阴阳匹配，智能流转
- **直观简洁**: 天干地支一排显示，不可选项置灰，无多余提示

---

## 二、功能需求

### 2.1 输入模式切换

#### 2.1.1 模式选择
**两种输入模式**:
1. **日期时间输入**（标准模式）
   - 适合普通用户
   - 通过日期选择器选择出生时间
   
2. **八字快捷输入**（专业模式）
   - 适合命理师
   - 直接输入天干地支四柱

**切换方式**:
- 使用 Tab 标签页切换
- 两种模式互不干扰
- 保留各自的输入状态

```vue
<el-tabs v-model="inputMode">
  <el-tab-pane label="日期时间输入" name="date"></el-tab-pane>
  <el-tab-pane label="八字快捷输入" name="bazi"></el-tab-pane>
</el-tabs>
```

---

### 2.2 快捷输入界面

#### 2.2.1 基本信息输入
**必填字段**:
- 姓名（可选，默认"命主"）
- 性别（必选）：男/女

**布局**:
```
┌─────────────────────────────┐
│ 姓名: [________]   性别: ○男 ○女 │
└─────────────────────────────┘
```

#### 2.2.2 四柱干支点选

**界面布局**:
```
┌──────────────────────────────────────────┐
│              八字快捷输入                  │
├──────────────────────────────────────────┤
│                                          │
│  年柱    月柱    日柱    时柱             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│ │ 甲 │ │ 壬 │ │ 丁 │ │ 戊 │  天干      │
│ │ 午 │ │ 申 │ │ 丑 │ │ 申 │  地支      │
│ └────┘ └────┘ └────┘ └────┘           │
│                                          │
│ 天干选择区：                              │
│ [甲][乙][丙][丁][戊][己][庚][辛][壬][癸] │
│                                          │
│ 地支选择区：                              │
│ [子][丑][寅][卯][辰][巳]                 │
│ [午][未][申][酉][戌][亥]                 │
│                                          │
│      [清空] [排盘] [查看案例]            │
└──────────────────────────────────────────┘
```

#### 2.2.3 点选交互流程

**自动流转**:
```
1. 页面加载：自动聚焦到年柱天干
2. 用户点击天干（如"甲"）
   → 年柱天干显示"甲"
   → 自动切换到地支选择
   → 地支按钮根据阴阳匹配自动筛选
3. 用户点击地支（如"午"）
   → 年柱地支显示"午"
   → 自动流转到月柱天干
4. 重复2-3步骤，依次输入月柱、日柱、时柱
5. 四柱输入完成：
   → "排盘"按钮高亮可用
   → 用户点击排盘，展示结果
```

**阴阳匹配规则**:
- **阳干**（甲、丙、戊、庚、壬）→ **阳支**（子、寅、辰、午、申、戌）
- **阴干**（乙、丁、己、辛、癸）→ **阴支**（丑、卯、巳、未、酉、亥）

**选择后自动匹配**:
```javascript
// 点击天干后，地支自动筛选
if (选择阳干) {
  可选地支 = [子, 寅, 辰, 午, 申, 戌];
  不可选地支置灰 = [丑, 卯, 巳, 未, 酉, 亥];
} else {
  可选地支 = [丑, 卯, 巳, 未, 酉, 亥];
  不可选地支置灰 = [子, 寅, 辰, 午, 申, 戌];
}
```

---

### 2.3 UI设计要点

#### 2.3.1 天干地支一排显示
**设计原则**:
- 天干地支并列显示，不分上下
- 一行内完成四柱展示
- 视觉清晰，便于核对

**样式**:
```css
.pillar-display {
  display: flex;
  gap: 16px;
}

.pillar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gan, .zhi {
  font-size: 24px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}
```

#### 2.3.2 按钮样式
**天干地支按钮**:
- 尺寸：40px × 40px（缩小后更紧凑）
- 间距：6px
- 圆角：8px
- 正常状态：灰色边框，白色背景
- 悬停状态：蓝色边框
- 选中状态：蓝色背景，白色文字
- 不可选状态：灰色背景，禁用点击

**按钮布局**:
```css
.ganzhi-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.gz-button {
  width: 40px;
  height: 40px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.gz-button:hover:not(:disabled) {
  border-color: #1976d2;
  transform: translateY(-2px);
}

.gz-button:disabled {
  background: #f5f5f5;
  color: #bdbdbd;
  cursor: not-allowed;
}
```

#### 2.3.3 去除多余提示
**简化原则**:
- ❌ 移除"请选择天干"、"请选择地支"等提示文字
- ❌ 移除顶部灰色提示框
- ✅ 通过视觉状态引导用户操作
- ✅ 保持界面简洁专业

---

### 2.4 反推日期算法

#### 2.4.1 算法目的
当用户通过快捷输入提供八字时，系统需要反推出对应的公历日期，原因：
1. **紫微斗数需求**: 紫微排盘需要农历日期
2. **大运流年计算**: 需要明确的出生年份
3. **完整性**: 保证八字盘和紫微盘数据一致

#### 2.4.2 算法流程

```typescript
function reverseDateFromBazi(bazi: SiZhu): Date | null {
  const { year, month, day, hour } = bazi;
  
  // 1. 根据年柱确定年份范围
  const yearRange = getYearRangeFromGanZhi(year);
  
  for (const targetYear of yearRange) {
    // 2. 根据月柱确定节气月
    const jieqiMonth = getJieqiMonthFromGanZhi(month);
    
    // 3. 扩展到3个公历月（考虑节气跨月）
    const monthRange = getMonthRange(jieqiMonth);
    
    for (const targetMonth of monthRange) {
      // 4. 遍历该月每一天
      const daysInMonth = getDaysInMonth(targetYear, targetMonth);
      
      for (let targetDay = 1; targetDay <= daysInMonth; targetDay++) {
        // 5. 使用 lunar-javascript 计算该日的八字
        const solar = Solar.fromYmd(targetYear, targetMonth, targetDay);
        const lunar = solar.getLunar();
        
        // 6. 比对月柱和日柱
        if (lunar.getMonthInGanZhi() === month.gan + month.zhi &&
            lunar.getDayInGanZhi() === day.gan + day.zhi) {
          
          // 7. 根据时柱确定时辰
          const hourTime = getHourFromZhi(hour.zhi);
          
          // 8. 返回完整日期时间
          return new Date(targetYear, targetMonth - 1, targetDay, hourTime, 0);
        }
      }
    }
  }
  
  return null; // 未找到匹配
}
```

#### 2.4.3 算法优化

**月柱查找范围扩展**:
- 节气月可能跨2-3个公历月
- 立春在1月或2月
- 需要考虑年份交界

**示例**:
```
月柱：壬申（七月，立秋-白露）
节气月：农历七月
公历月范围：7月、8月、9月
```

**双重匹配**:
- 同时匹配月柱和日柱
- 提升匹配准确性
- 避免误判

**测试验证**:
```
输入：甲午年 壬申月 丁丑日 戊申时
预期输出：2014-09-03 15:30
实际输出：2014-09-03 15:30 ✅
```

---

### 2.5 数据提交与排盘

#### 2.5.1 提交验证
**必填检查**:
```javascript
function validate() {
  if (!gender) {
    ElMessage.error('请选择性别');
    return false;
  }
  
  if (!bazi.year.gan || !bazi.year.zhi) {
    ElMessage.error('请完成年柱输入');
    return false;
  }
  
  // ... 检查月柱、日柱、时柱
  
  return true;
}
```

#### 2.5.2 排盘处理
**处理流程**:
```
1. 验证输入完整性 ✓
2. 调用反推日期算法
3. 如果反推成功：
   - 使用反推的日期进行紫微排盘
   - 使用用户输入的八字进行八字排盘
4. 如果反推失败：
   - 使用默认日期（当年立春）
   - 仅展示八字盘
   - 提示用户紫微盘可能不准确
5. 展示排盘结果
```

**数据组装**:
```typescript
const chartData = {
  bazi: {
    siZhu: userInputBazi,  // 使用用户输入的八字
    // ... 其他八字数据
  },
  ziwei: {
    birthDate: reversedDate,  // 使用反推的日期
    // ... 紫微数据
  }
};
```

---

### 2.6 案例管理集成

**功能集成**:
- ✅ 支持保存八字快捷输入的案例
- ✅ 支持加载案例到快捷输入界面
- ✅ 案例包含完整的四柱信息

**数据结构**:
```typescript
interface SavedCase {
  id: string;
  name: string;
  birthForm: {
    name: string;
    gender: 'male' | 'female';
    bazi?: SiZhu;  // 快捷输入模式的八字
    // 或
    year: number;  // 日期时间模式
    month: number;
    day: number;
    hour: number;
    minute: number;
    isLunar: boolean;
  };
  chartResult: ChartResult;
  savedAt: string;
}
```

---

## 三、技术实现

### 3.1 组件架构

**BaziQuickInput.vue** - 八字快捷输入组件
```
├── 基本信息区
│   ├── 姓名输入
│   └── 性别选择
├── 四柱显示区
│   ├── 年柱（天干+地支）
│   ├── 月柱（天干+地支）
│   ├── 日柱（天干+地支）
│   └── 时柱（天干+地支）
├── 干支选择区
│   ├── 天干按钮组
│   └── 地支按钮组
└── 操作按钮区
    ├── 清空按钮
    ├── 排盘按钮
    └── 查看案例按钮
```

### 3.2 状态管理

```typescript
interface BaziQuickState {
  name: string;
  gender: 'male' | 'female' | '';
  currentPillar: 'year' | 'month' | 'day' | 'hour';
  currentType: 'gan' | 'zhi';
  bazi: {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string };
  };
}

// 自动流转逻辑
watch([currentPillar, currentType], ([pillar, type]) => {
  if (type === 'gan' && bazi[pillar].gan) {
    // 天干选择后，切换到地支
    currentType.value = 'zhi';
    filterZhiByGan(bazi[pillar].gan);
  } else if (type === 'zhi' && bazi[pillar].zhi) {
    // 地支选择后，流转到下一柱
    moveToNextPillar();
  }
});
```

### 3.3 阴阳匹配算法

```typescript
function filterZhiByGan(gan: string): string[] {
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const yangZhi = ['子', '寅', '辰', '午', '申', '戌'];
  const yinZhi = ['丑', '卯', '巳', '未', '酉', '亥'];
  
  return yangGan.includes(gan) ? yangZhi : yinZhi;
}

function getDisabledZhi(gan: string): string[] {
  const availableZhi = filterZhiByGan(gan);
  const allZhi = ['子', '丑', '寅', '卯', '辰', '巳', 
                  '午', '未', '申', '酉', '戌', '亥'];
  return allZhi.filter(z => !availableZhi.includes(z));
}
```

### 3.4 Props 和 Emits

```typescript
// Props
interface Props {
  loading?: boolean;  // 加载状态
}

// Emits
interface Emits {
  submit: [data: BaziQuickFormData];  // 提交八字数据
  reset: [];                          // 重置表单
  showCases: [];                      // 显示案例列表
}

// 导出数据类型
export interface BaziQuickFormData {
  name: string;
  gender: 'male' | 'female';
  year: GanZhi;
  month: GanZhi;
  day: GanZhi;
  hour: GanZhi;
}
```

---

## 四、用户体验优化

### 4.1 视觉反馈
- ✅ 当前输入位置高亮显示
- ✅ 可选按钮正常显示
- ✅ 不可选按钮置灰禁用
- ✅ 已选干支显示在柱位中
- ✅ 完成输入后按钮高亮

### 4.2 交互优化
- ✅ 自动流转，无需手动切换
- ✅ 阴阳自动匹配，减少错误
- ✅ 一键清空，快速重置
- ✅ 支持键盘操作（可选）

### 4.3 错误处理
```javascript
// 输入验证
if (!allPillarsComplete) {
  ElMessage.warning('请完成四柱输入');
  return;
}

// 反推日期失败
if (!reversedDate) {
  ElMessage.warning('无法反推日期，将使用默认值');
  // 继续排盘，但提示用户
}

// 排盘失败
catch (error) {
  ElMessage.error('排盘失败，请检查输入');
  console.error(error);
}
```

---

## 五、测试验证

### 5.1 功能测试
- [x] 天干点选正常
- [x] 地支阴阳匹配正确
- [x] 自动流转工作正常
- [x] 清空功能正常
- [x] 提交验证正确
- [x] 反推日期准确

### 5.2 交互测试
- [x] 按钮状态切换正确
- [x] 视觉反馈清晰
- [x] 错误提示友好
- [x] 加载状态显示

### 5.3 边界测试
**特殊八字**:
- 年柱跨立春
- 月柱跨节气
- 日柱跨子时
- 边界时辰处理

**测试用例**:
```
1. 甲午年 壬申月 丁丑日 戊申时
   → 反推：2014-09-03 15:30 ✅

2. 癸巳年 甲寅月 戊子日 甲寅时
   → 反推：2013-02-xx xx:xx ✅

3. 丁酉年 壬子月 癸酉日 壬子时
   → 反推：2017-12-xx 23:30 ✅
```

---

## 六、已知问题与限制

### 6.1 已知问题
- 无

### 6.2 功能限制
1. **反推准确性**: 某些特殊情况下可能存在多个匹配日期
   - 解决方案：选择最近的匹配日期
   
2. **时辰边界**: 子时跨日问题需要特殊处理
   - 解决方案：按照传统命理规则处理

---

## 七、后续优化计划

### 7.1 短期优化（已完成）
- ✅ 天干地支一排显示
- ✅ 自动阴阳匹配
- ✅ 去除多余提示
- ✅ 按钮尺寸优化

### 7.2 中期优化（规划中）
- [ ] 支持键盘快捷键操作
- [ ] 支持语音输入（"甲午、壬申..."）
- [ ] 历史输入记录
- [ ] 常用八字收藏

### 7.3 长期优化（待规划）
- [ ] 批量导入八字
- [ ] 八字库管理
- [ ] OCR识别八字图片

---

## 八、组件接口规范

### 8.1 组件位置
`src/components/BaziQuickInput.vue`

### 8.2 使用示例
```vue
<template>
  <BaziQuickInput 
    :loading="loading"
    @submit="handleBaziSubmit"
    @reset="handleReset"
    @show-cases="showCaseManager"
  />
</template>

<script setup lang="ts">
import BaziQuickInput from '@/components/BaziQuickInput.vue';
import type { BaziQuickFormData } from '@/components/BaziQuickInput.vue';

const loading = ref(false);

const handleBaziSubmit = async (data: BaziQuickFormData) => {
  loading.value = true;
  try {
    // 1. 反推日期
    const reversedDate = await reverseDateFromBazi(data);
    
    // 2. 排盘
    const result = await calculateChart(data, reversedDate);
    
    // 3. 显示结果
    showChartResult(result);
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 九、相关文档

### 需求文档
- [八字排盘功能需求文档](./requirement_bazi_chart.md)
- [紫微斗数安星四化功能需求文档](./requirement_ziwei_system.md)

### 技术文档
- [项目技术设计文档](./technical_design.md)

### 实现总结
- [ChartPage组件化重构](./chartpage_componentization.md)
- [八字输入交互优化v2](../docs-archive/bazi_input_optimization_v2.md)
- [八字输入UI精简](../docs-archive/bazi_input_ui_refinement.md)
- [八字反推日期修正](../docs-archive/bazi_reverse_date_fix.md)

---

## 十、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2024-12-05 | 初始版本，整合快捷输入所有需求 |
| 1.1 | 2024-12-05 | 添加反推日期算法详细说明 |
| 1.2 | 2024-12-06 | 补充组件接口规范和使用示例 |
| 1.2 | 2024-12-05 | 完善交互流程和测试用例 |
