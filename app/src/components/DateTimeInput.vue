<template>
  <div class="datetime-input">
    <el-form :model="localForm" :rules="rules" ref="formRef" label-width="100px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="快捷输入">
            <el-input 
              v-model="quickInputDate" 
              placeholder="输入8-12位生日数字串，如 202301010830" 
              @blur="parseQuickInput"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input v-model="localForm.name" placeholder="非必填，留空将自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="localForm.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="出生日期时间" prop="birthDateTime">
            <el-date-picker
              v-model="birthDateTime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY年MM月DD日 HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              @change="handleDateTimeChange"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="12">
          <el-form-item label="历法类型">
            <el-radio-group v-model="localForm.isLunar">
              <el-radio :value="false">公历</el-radio>
              <el-radio :value="true">农历</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          开始排盘
        </el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="$emit('show-cases')" type="success">加载案例</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import type { BirthInfo } from '../core/types';

// Props
interface Props {
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

// Emits
const emit = defineEmits<{
  submit: [formData: DateTimeFormData];
  reset: [];
  'show-cases': [];
}>();

// 扩展的表单接口，包含姓名
export interface DateTimeFormData extends BirthInfo {
  name: string;
}

// 获取当前日期时间
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();
const currentHour = now.getHours();
const currentMinute = now.getMinutes();

// 表单数据
const localForm = reactive<DateTimeFormData>({
  name: '',
  gender: 'male',
  year: currentYear,
  month: currentMonth,
  day: currentDay,
  hour: currentHour,
  minute: currentMinute,
  isLunar: false,
  timeZone: 8,
});

// 日期时间选择器的值
const birthDateTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));

// 快捷输入
const quickInputDate = ref('');

// 表单引用
const formRef = ref<FormInstance>();

// 表单验证规则
const rules = reactive<FormRules>({
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
  day: [{ required: true, message: '请输入日期', trigger: 'blur' }],
  hour: [{ required: true, message: '请输入小时', trigger: 'blur' }],
});

// 处理日期时间变化
const handleDateTimeChange = (value: string) => {
  if (value) {
    const date = new Date(value);
    localForm.year = date.getFullYear();
    localForm.month = date.getMonth() + 1;
    localForm.day = date.getDate();
    localForm.hour = date.getHours();
    localForm.minute = date.getMinutes();
  }
};

// 解析快捷输入的日期字符串
const parseQuickInput = () => {
  const input = quickInputDate.value.replace(/\D/g, '');
  if (!input || (input.length !== 8 && input.length !== 10 && input.length !== 12)) {
    if (quickInputDate.value) {
      ElMessage.warning('快捷输入格式不正确，请输入8、10或12位数字。');
    }
    return;
  }

  localForm.year = parseInt(input.substring(0, 4), 10);
  localForm.month = parseInt(input.substring(4, 6), 10);
  localForm.day = parseInt(input.substring(6, 8), 10);
  localForm.hour = input.length >= 10 ? parseInt(input.substring(8, 10), 10) : 12;
  localForm.minute = input.length === 12 ? parseInt(input.substring(10, 12), 10) : 0;

  birthDateTime.value = dayjs(
    `${localForm.year}-${String(localForm.month).padStart(2, '0')}-${String(localForm.day).padStart(2, '0')} ${String(localForm.hour).padStart(2, '0')}:${String(localForm.minute).padStart(2, '0')}:00`
  ).format('YYYY-MM-DD HH:mm:ss');

  ElMessage.success('生日信息已自动填充！');
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...localForm });
    }
  });
};

// 重置表单
const handleReset = () => {
  localForm.name = '';
  localForm.gender = 'male';
  localForm.year = currentYear;
  localForm.month = currentMonth;
  localForm.day = currentDay;
  localForm.hour = currentHour;
  localForm.minute = currentMinute;
  localForm.isLunar = false;
  localForm.timeZone = 8;
  
  birthDateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
  quickInputDate.value = '';
  
  formRef.value?.resetFields();
  emit('reset');
};

// 暴露方法供外部调用
defineExpose({
  reset: handleReset,
  getFormData: () => ({ ...localForm }),
  setFormData: (data: Partial<DateTimeFormData>) => {
    Object.assign(localForm, data);
    
    // 同步更新日期时间选择器
    birthDateTime.value = dayjs(
      `${localForm.year}-${String(localForm.month).padStart(2, '0')}-${String(localForm.day).padStart(2, '0')} ${String(localForm.hour).padStart(2, '0')}:${String(localForm.minute).padStart(2, '0')}:00`
    ).format('YYYY-MM-DD HH:mm:ss');
  },
  getBirthDateTime: () => birthDateTime.value,
  setBirthDateTime: (value: string) => {
    birthDateTime.value = value;
    handleDateTimeChange(value);
  },
});
</script>

<style scoped>
.datetime-input {
  width: 100%;
}
</style>
