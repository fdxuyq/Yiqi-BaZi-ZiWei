<template>
  <el-dialog v-model="visible" title="已保存的案例" width="70%" @close="handleClose">
    <div class="case-list-container">
      <div v-if="cases.length === 0" class="empty-case">
        <el-empty description="暂无保存的案例" />
      </div>
      <div v-else>
        <el-table :data="cases" style="width: 100%" max-height="500">
          <el-table-column prop="name" label="姓名" width="150" />
          <el-table-column label="生辰信息" width="280">
            <template #default="scope">
              {{ scope.row.birthForm.year }}年{{ scope.row.birthForm.month }}月{{ scope.row.birthForm.day }}日 
              {{ scope.row.birthForm.hour }}:{{ String(scope.row.birthForm.minute).padStart(2, '0') }}
              ({{ scope.row.birthForm.isLunar ? '农历' : '公历' }})
            </template>
          </el-table-column>
          <el-table-column prop="savedAt" label="保存时间" width="180" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleLoad(scope.row)">加载</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="case-actions" style="margin-top: 20px; display: flex; gap: 10px;">
        <el-button type="success" @click="handleExport">导出备份</el-button>
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          accept=".json"
          :on-change="handleImport"
        >
          <el-button type="warning">导入备份</el-button>
        </el-upload>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import type { SavedCase } from '../core/types';

// Props
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  load: [caseData: SavedCase];
  delete: [caseId: string];
  export: [];
  import: [cases: SavedCase[]];
}>();

const STORAGE_KEY = 'ziwei_saved_cases';

// 内部可见性状态
const visible = ref(props.modelValue);

// 案例列表
const cases = ref<SavedCase[]>([]);

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    loadCases();
  }
});

// 监听内部 visible 变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

// 从 localStorage 加载案例列表
const loadCases = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      cases.value = JSON.parse(savedData);
    }
  } catch (error) {
    console.error('加载案例列表失败:', error);
    ElMessage.error('加载案例列表失败');
  }
};

// 加载选中的案例
const handleLoad = (caseData: SavedCase) => {
  emit('load', caseData);
  visible.value = false;
  ElMessage.success(`已加载案例"${caseData.name}"！`);
};

// 删除案例
const handleDelete = (caseId: string) => {
  try {
    cases.value = cases.value.filter(c => c.id !== caseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.value));
    emit('delete', caseId);
    ElMessage.success('案例已删除！');
  } catch (error) {
    console.error('删除案例失败:', error);
    ElMessage.error('删除案例失败');
  }
};

// 导出案例备份
const handleExport = () => {
  try {
    const dataStr = JSON.stringify(cases.value, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ziwei_cases_backup_${dayjs().format('YYYYMMDD_HHmmss')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    emit('export');
    ElMessage.success('案例备份已导出！');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

// 导入案例备份
const handleImport = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedCases = JSON.parse(e.target?.result as string);
      if (Array.isArray(importedCases)) {
        const existingIds = new Set(cases.value.map(c => c.id));
        const newCases = importedCases.filter(c => !existingIds.has(c.id));
        cases.value = [...cases.value, ...newCases];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.value));
        emit('import', newCases);
        ElMessage.success(`成功导入 ${newCases.length} 个案例！`);
      } else {
        ElMessage.error('文件格式不正确');
      }
    } catch (error) {
      console.error('导入失败:', error);
      ElMessage.error('导入失败，请检查文件格式');
    }
  };
  reader.readAsText(file.raw);
};

// 关闭对话框
const handleClose = () => {
  visible.value = false;
};

// 保存案例到 localStorage
const saveCase = (caseData: SavedCase) => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const existingCases = savedData ? JSON.parse(savedData) : [];
    existingCases.push(caseData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCases));
    return true;
  } catch (error) {
    console.error('保存案例失败:', error);
    return false;
  }
};

// 暴露方法供外部调用
defineExpose({
  loadCases,
  saveCase,
});
</script>

<style scoped>
.case-list-container {
  padding: 10px 0;
}

.empty-case {
  padding: 40px 0;
}

.case-actions {
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}
</style>

