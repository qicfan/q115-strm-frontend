<template>
  <div class="cover-gen-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Picture /></el-icon>
            媒体封面生成
          </h1>
          <p class="page-subtitle">自动生成媒体库封面并同步到Emby</p>
        </div>
      </div>
    </div>

    <div class="page-content">
      <el-card class="operation-card" shadow="hover">
        <template #header>
          <div class="card-header-wrapper">
            <div class="card-header-icon operation-icon">
              <el-icon :size="24"><Operation /></el-icon>
            </div>
            <div class="card-header-content">
              <h3 class="card-title">操作区</h3>
              <p class="card-subtitle">选择样式和媒体库，生成封面</p>
            </div>
          </div>
        </template>

        <el-form :model="formData" label-position="top" class="operation-form">
          <el-form-item label="封面样式">
            <el-radio-group v-model="formData.style" class="style-selector">
              <el-radio-button value="single">
                <div class="style-option">
                  <el-icon><PictureFilled /></el-icon>
                  <span>单图模糊背景</span>
                </div>
              </el-radio-button>
              <el-radio-button value="grid">
                <div class="style-option">
                  <el-icon><Grid /></el-icon>
                  <span>九宫格拼图</span>
                </div>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="目标媒体库">
            <el-select
              v-model="formData.library_ids"
              multiple
              filterable
              placeholder="请选择要生成封面的媒体库"
              class="library-select"
              :loading="librariesLoading"
            >
              <el-option
                v-for="lib in libraries"
                :key="lib.library_id"
                :label="lib.name"
                :value="lib.library_id"
              />
            </el-select>
          </el-form-item>

          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              :loading="generating"
              :disabled="formData.library_ids.length === 0"
              @click="handleGenerate"
            >
              <el-icon><MagicStick /></el-icon>
              生成并同步
            </el-button>
            <el-button
              v-if="formData.library_ids.length === 1"
              size="large"
              :loading="previewing"
              @click="handlePreview"
            >
              <el-icon><View /></el-icon>
              预览封面
            </el-button>
          </div>
        </el-form>
      </el-card>

      <el-collapse v-model="activeCollapseNames" class="config-collapse">
        <el-collapse-item name="config" title="配置参数">
          <el-form :model="configData" label-position="top" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="中文标题字号">
                  <el-input-number
                    v-model="configData.zh_font_size"
                    :min="100"
                    :max="300"
                    :step="10"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="英文标题字号">
                  <el-input-number
                    v-model="configData.en_font_size"
                    :min="50"
                    :max="150"
                    :step="5"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标题间距">
                  <el-input-number
                    v-model="configData.title_spacing"
                    :min="20"
                    :max="100"
                    :step="10"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模糊半径">
                  <el-input-number v-model="configData.blur_size" :min="10" :max="100" :step="5" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="颜色混合比">
                  <el-slider v-model="configData.color_ratio" :min="0" :max="1" :step="0.1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="图片排序">
                  <el-select v-model="configData.sort_by">
                    <el-option label="随机" value="random" />
                    <el-option label="最新入库" value="date_created" />
                    <el-option label="最新发行" value="premiere_date" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="优先使用海报">
                  <el-switch
                    v-model="configData.use_primary"
                    active-color="#67c23a"
                    inactive-color="#dcdfe6"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="九宫格模糊背景">
                  <el-switch
                    v-model="configData.multi_blur"
                    active-color="#67c23a"
                    inactive-color="#dcdfe6"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="输出分辨率">
              <el-radio-group v-model="configData.resolution">
                <el-radio-button label="1080p">1080p</el-radio-button>
                <el-radio-button label="720p">720p</el-radio-button>
                <el-radio-button label="480p">480p</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="标题配置 (YAML)">
              <el-input
                v-model="configData.title_config"
                type="textarea"
                :rows="10"
                placeholder="按媒体库名称配置主副标题，例如：
华语电影:
  - 华语电影
  - CHINESE MOVIES"
                class="yaml-editor"
              />
            </el-form-item>

            <div class="config-actions">
              <el-button type="primary" @click="handleSaveConfig" :loading="savingConfig">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
              <el-button @click="handleResetConfig">
                <el-icon><RefreshLeft /></el-icon>
                重置配置
              </el-button>
            </div>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <el-card class="results-card" shadow="hover">
        <template #header>
          <div class="card-header-wrapper">
            <div class="card-header-icon results-icon">
              <el-icon :size="24"><List /></el-icon>
            </div>
            <div class="card-header-content">
              <h3 class="card-title">生成记录</h3>
              <p class="card-subtitle">最近封面生成任务结果</p>
            </div>
          </div>
        </template>

        <div v-if="lastResults.length > 0" class="results-list">
          <div
            v-for="(result, index) in lastResults"
            :key="index"
            class="result-item"
            :class="{ 'is-success': result.success, 'is-failed': !result.success }"
          >
            <div class="result-icon">
              <el-icon v-if="result.success"><CircleCheck /></el-icon>
              <el-icon v-else><CircleClose /></el-icon>
            </div>
            <div class="result-content">
              <div class="result-library">{{ result.library_name }}</div>
              <div class="result-message">{{ result.message }}</div>
            </div>
            <div class="result-time">
              <el-icon><Clock /></el-icon>
              <span>{{ (result.duration_ms / 1000).toFixed(2) }}s</span>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无生成记录" :image-size="80" />
      </el-card>
    </div>

    <el-dialog v-model="previewDialogVisible" title="封面预览" width="600px">
      <div class="preview-content">
        <el-image v-if="previewImageUrl" :src="previewImageUrl" fit="contain" class="preview-image">
          <template #error>
            <div class="image-error">
              <el-icon><PictureFilled /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
        </el-image>
        <el-empty v-else description="暂无预览" :image-size="120" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { AxiosStatic } from 'axios'
import {
  Picture,
  PictureFilled,
  Operation,
  MagicStick,
  View,
  List,
  CircleCheck,
  CircleClose,
  Clock,
  Check,
  RefreshLeft,
  Grid,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { inject, onMounted, ref, reactive } from 'vue'
import {
  coverGenApi,
  setHttpInstance,
  type CoverGenConfig,
  type CoverGenResult,
  type EmbyLibrary,
} from '@/api/coverGen'

const http: AxiosStatic | undefined = inject('$http')

const libraries = ref<EmbyLibrary[]>([])
const librariesLoading = ref(false)
const generating = ref(false)
const previewing = ref(false)
const savingConfig = ref(false)

const formData = reactive({
  style: 'single' as 'single' | 'grid',
  library_ids: [] as string[],
})

const configData = reactive<CoverGenConfig>({
  zh_font_size: 170,
  en_font_size: 75,
  title_spacing: 40,
  blur_size: 50,
  color_ratio: 0.8,
  resolution: '480p',
  use_primary: false,
  multi_blur: true,
  title_config: '# 配置封面标题（按媒体库名称对应）\n# 媒体库名称:\n#   - 主标题\n#   - 副标题\n',
  sort_by: 'random',
})

const activeCollapseNames = ref<string[]>([])
const lastResults = ref<CoverGenResult[]>([])

const previewDialogVisible = ref(false)
const previewImageUrl = ref('')

const loadLibraries = async () => {
  try {
    librariesLoading.value = true
    libraries.value = await coverGenApi.getEmbyLibraries()
  } catch {
    ElMessage.error('加载媒体库列表失败')
  } finally {
    librariesLoading.value = false
  }
}

const loadConfig = async () => {
  try {
    const config = await coverGenApi.getConfig()
    Object.assign(configData, config)
  } catch {
    ElMessage.error('加载配置失败')
  }
}

const handleGenerate = async () => {
  if (formData.library_ids.length === 0) {
    ElMessage.warning('请选择至少一个媒体库')
    return
  }

  try {
    generating.value = true
    const response = await coverGenApi.generateCovers({
      library_ids: formData.library_ids,
      style: formData.style,
    })

    lastResults.value = response.results

    const successCount = response.results.filter((r) => r.success).length
    const failedCount = response.results.filter((r) => !r.success).length

    if (failedCount === 0) {
      ElMessage.success(`封面生成完成，成功 ${successCount} 个`)
    } else if (successCount === 0) {
      ElMessage.error(`封面生成失败 ${failedCount} 个`)
    } else {
      ElMessage.warning(`封面生成完成，成功 ${successCount} 个，失败 ${failedCount} 个`)
    }
  } catch {
    ElMessage.error('封面生成失败')
  } finally {
    generating.value = false
  }
}

const handlePreview = async () => {
  if (formData.library_ids.length !== 1) {
    ElMessage.warning('预览功能只能选择一个媒体库')
    return
  }

  try {
    previewing.value = true
    const blob = await coverGenApi.previewCover({
      library_id: formData.library_ids[0],
      style: formData.style,
    })
    previewImageUrl.value = URL.createObjectURL(blob)
    previewDialogVisible.value = true
  } catch {
    ElMessage.error('生成预览失败')
  } finally {
    previewing.value = false
  }
}

const handleSaveConfig = async () => {
  try {
    savingConfig.value = true
    await coverGenApi.updateConfig(configData)
  } catch {
    ElMessage.error('保存配置失败')
  } finally {
    savingConfig.value = false
  }
}

const handleResetConfig = async () => {
  await loadConfig()
  ElMessage.success('配置已重置')
}

onMounted(() => {
  setHttpInstance(http)
  loadLibraries()
  loadConfig()
})
</script>

<style scoped lang="css">
.cover-gen-page {
  min-height: 100%;
  background: #f5f7fa;
  padding: 0;
}

.page-header {
  background: #fff;
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  font-size: 28px;
  color: #409eff;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.page-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.operation-card,
.results-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
}

.operation-card:hover,
.results-card:hover {
  transform: translateY(-2px);
}

.card-header-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.operation-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.results-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-header-content {
  flex: 1;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #909399;
}

.operation-form {
  padding: 8px 0;
}

.style-selector {
  display: flex;
  width: 100%;
}

.style-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.library-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.config-collapse {
  border-radius: 12px;
  overflow: hidden;
}

.config-collapse :deep(.el-collapse-item__header) {
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  font-weight: 600;
}

.config-collapse :deep(.el-collapse-item__wrap) {
  background: #fff;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.config-form {
  padding: 20px;
}

.yaml-editor :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.config-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.result-item.is-success {
  border-left: 4px solid #67c23a;
}

.result-item.is-failed {
  border-left: 4px solid #f56c6c;
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-item.is-success .result-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.result-item.is-failed .result-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-library {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.result-message {
  font-size: 13px;
  color: #909399;
}

.result-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.image-error .el-icon {
  font-size: 48px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px;
  }

  .page-content {
    padding: 12px;
    gap: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .title-icon {
    font-size: 24px;
  }

  .card-header-wrapper {
    flex-wrap: wrap;
  }

  .card-header-icon {
    width: 40px;
    height: 40px;
  }

  .card-header-icon .el-icon {
    font-size: 20px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-subtitle {
    font-size: 12px;
  }

  .style-selector {
    flex-direction: column;
  }

  .style-option {
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .config-form :deep(.el-col) {
    width: 100%;
    margin-bottom: 0;
  }

  .config-actions {
    flex-direction: column;
  }

  .config-actions .el-button {
    width: 100%;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .result-time {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
