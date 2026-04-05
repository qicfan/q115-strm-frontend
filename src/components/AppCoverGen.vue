<template>
  <div class="main-content-container cover-gen-content">
    <div class="cover-gen-wrapper">
      <el-card class="operation-card" shadow="hover">
        <template #header>
          <div class="card-header-wrapper">
            <div class="card-header-icon">
              <el-icon :size="24"><Picture /></el-icon>
            </div>
            <div class="card-header-content">
              <h3 class="card-title">封面生成操作</h3>
              <p class="card-subtitle">选择样式和媒体库，一键生成并同步封面</p>
            </div>
          </div>
        </template>

        <el-form
          :label-position="isMobile ? 'top' : 'left'"
          :label-width="120"
          class="operation-form"
        >
          <el-form-item label="封面样式">
            <el-radio-group
              v-model="selectedStyle"
              @change="handleStyleChange"
              class="style-radio-group"
            >
              <el-radio label="single" border class="style-radio">
                <div class="style-preview">
                  <div class="style-icon">
                    <el-icon><Grid /></el-icon>
                  </div>
                  <div class="style-info">
                    <div class="style-name">单图模糊背景</div>
                    <div class="style-desc">单张海报 + 模糊背景 + 标题</div>
                  </div>
                </div>
              </el-radio>
              <el-radio label="grid" border class="style-radio">
                <div class="style-preview">
                  <div class="style-icon">
                    <el-icon><Menu /></el-icon>
                  </div>
                  <div class="style-info">
                    <div class="style-name">九宫格拼图</div>
                    <div class="style-desc">3x3 网格布局 + 标题</div>
                  </div>
                </div>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="目标媒体库">
            <el-select
              v-model="selectedLibraryIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              placeholder="请选择媒体库（留空则选择全部）"
              class="full-width-select"
              :disabled="librariesLoading"
              :loading="librariesLoading"
            >
              <el-option
                v-for="lib in libraries"
                :key="lib.library_id"
                :label="lib.name"
                :value="lib.library_id"
              >
                <div class="library-option">
                  <span class="library-name">{{ lib.name }}</span>
                  <span class="library-type">{{ lib.type }}</span>
                </div>
              </el-option>
            </el-select>
            <div class="form-help">
              <el-icon><InfoFilled /></el-icon>
              <span>留空则对所有媒体库生成封面</span>
            </div>
          </el-form-item>

          <el-form-item label="预览效果">
            <div class="preview-wrapper">
              <el-image
                v-if="previewUrl"
                :src="previewUrl"
                fit="contain"
                class="preview-image"
                :preview-src-list="[previewUrl]"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><PictureFilled /></el-icon>
                    <span>预览加载失败</span>
                  </div>
                </template>
              </el-image>
              <el-empty v-else description="选择媒体库后点击预览" :image-size="80" />
              <el-button
                type="primary"
                @click="generatePreview"
                :loading="previewLoading"
                :icon="View"
                :disabled="!selectedLibraryIds || selectedLibraryIds.length === 0"
                class="preview-btn"
              >
                生成预览
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="success"
              @click="generateCovers"
              :loading="generating"
              :icon="MagicStick"
              size="large"
              class="generate-btn"
            >
              {{ generating ? '生成中...' : '生成并同步到Emby' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header-wrapper">
            <div class="card-header-icon">
              <el-icon :size="24"><Setting /></el-icon>
            </div>
            <div class="card-header-content">
              <h3 class="card-title">封面生成配置</h3>
              <p class="card-subtitle">自定义字体、图片和标题设置</p>
            </div>
            <el-button
              type="primary"
              @click="toggleConfigPanel"
              :icon="configPanelVisible ? ArrowUp : ArrowDown"
              text
            >
              {{ configPanelVisible ? '收起配置' : '展开配置' }}
            </el-button>
          </div>
        </template>

        <el-collapse-transition>
          <div v-show="configPanelVisible" class="config-content">
            <el-form :model="config" :label-position="isMobile ? 'top' : 'left'" :label-width="140">
              <el-divider content-position="left">字体配置</el-divider>
              <el-form-item label="中文标题字号">
                <el-slider
                  v-model="config.zh_font_size"
                  :min="100"
                  :max="250"
                  :step="10"
                  show-input
                  :input-size="'small'"
                />
              </el-form-item>
              <el-form-item label="英文标题字号">
                <el-slider
                  v-model="config.en_font_size"
                  :min="50"
                  :max="120"
                  :step="5"
                  show-input
                  :input-size="'small'"
                />
              </el-form-item>
              <el-form-item label="标题间距">
                <el-slider
                  v-model="config.title_spacing"
                  :min="10"
                  :max="80"
                  :step="5"
                  show-input
                  :input-size="'small'"
                />
              </el-form-item>

              <el-divider content-position="left">图片配置</el-divider>
              <el-form-item label="模糊半径">
                <el-slider
                  v-model="config.blur_size"
                  :min="10"
                  :max="100"
                  :step="5"
                  show-input
                  :input-size="'small'"
                />
              </el-form-item>
              <el-form-item label="颜色混合比">
                <el-slider
                  v-model="config.color_ratio"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  show-input
                  :input-size="'small'"
                />
              </el-form-item>
              <el-form-item label="输出分辨率">
                <el-select v-model="config.resolution" class="full-width-select">
                  <el-option label="480p (854x480)" value="480p" />
                  <el-option label="720p (1280x720)" value="720p" />
                  <el-option label="1080p (1920x1080)" value="1080p" />
                </el-select>
              </el-form-item>
              <el-form-item label="优先使用海报">
                <el-switch v-model="config.use_primary" />
              </el-form-item>
              <el-form-item label="九宫格间隔模糊">
                <el-switch v-model="config.multi_blur" />
              </el-form-item>

              <el-divider content-position="left">标题配置</el-divider>
              <el-form-item label="标题排序方式">
                <el-radio-group v-model="config.sort_by">
                  <el-radio label="random">随机</el-radio>
                  <el-radio label="date_created">最新入库</el-radio>
                  <el-radio label="premiere_date">最新发行</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="标题YAML配置">
                <el-input
                  v-model="config.title_config"
                  type="textarea"
                  :rows="8"
                  placeholder="# 配置封面标题（按媒体库名称对应）&#10;# 媒体库名称:&#10;# - 主标题&#10;# - 副标题"
                  class="title-config-textarea"
                />
                <div class="form-help">
                  <el-icon><InfoFilled /></el-icon>
                  <span>按媒体库名称配置主副标题，留空则使用媒体库名称作为主标题</span>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveConfig" :loading="savingConfig" :icon="Check">
                  保存配置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
      </el-card>

      <el-card class="records-card" shadow="hover">
        <template #header>
          <div class="card-header-wrapper">
            <div class="card-header-icon">
              <el-icon :size="24"><List /></el-icon>
            </div>
            <div class="card-header-content">
              <h3 class="card-title">生成记录</h3>
              <p class="card-subtitle">查看最近的封面生成任务结果</p>
            </div>
          </div>
        </template>

        <div v-if="genRecords.length > 0" class="records-list">
          <div
            v-for="(record, index) in genRecords"
            :key="index"
            class="record-item"
            :class="{ 'is-failed': !record.success }"
          >
            <div class="record-icon">
              <el-icon v-if="record.success" :size="24" color="#67c23a"
                ><CircleCheckFilled
              /></el-icon>
              <el-icon v-else :size="24" color="#f56c6c"><CircleCloseFilled /></el-icon>
            </div>
            <div class="record-content">
              <div class="record-title">{{ record.library_name }}</div>
              <div class="record-message">{{ record.message }}</div>
              <div class="record-meta">
                <span class="record-time">{{ formatDuration(record.duration_ms) }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无生成记录" :image-size="80" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { AxiosStatic } from 'axios'
import {
  Picture,
  Grid,
  Menu,
  Setting,
  ArrowUp,
  ArrowDown,
  MagicStick,
  View,
  Check,
  InfoFilled,
  PictureFilled,
  List,
  CircleCheckFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue'
import {
  CoverGenAPI,
  type CoverGenConfig,
  type CoverStyle,
  type EmbyLibrary,
  type CoverGenResult,
} from '@/api/coverGen'
import { isMobile as checkIsMobile } from '@/utils/deviceUtils'

const http: AxiosStatic | undefined = inject('$http')
const api = http ? new CoverGenAPI(http) : null

const isMobile = ref(checkIsMobile())

const selectedStyle = ref<CoverStyle>('single')
const selectedLibraryIds = ref<string[]>([])
const libraries = ref<EmbyLibrary[]>([])
const librariesLoading = ref(false)

const config = reactive<CoverGenConfig>({
  zh_font_size: 170,
  en_font_size: 75,
  title_spacing: 40,
  blur_size: 50,
  color_ratio: 0.8,
  resolution: '480p',
  use_primary: false,
  multi_blur: true,
  title_config: '# 配置封面标题（按媒体库名称对应）\n# 媒体库名称:\n# - 主标题\n# - 副标题\n',
  sort_by: 'random',
})

const configPanelVisible = ref(false)
const savingConfig = ref(false)

const previewUrl = ref<string>('')
const previewLoading = ref(false)

const generating = ref(false)
const genRecords = ref<CoverGenResult[]>([])

const loadLibraries = async () => {
  if (!api) return
  try {
    librariesLoading.value = true
    libraries.value = await api.getLibraries()
  } catch (error) {
    console.error('加载媒体库列表失败:', error)
    ElMessage.error('加载媒体库列表失败')
  } finally {
    librariesLoading.value = false
  }
}

const loadConfig = async () => {
  if (!api) return
  try {
    const loadedConfig = await api.getConfig()
    Object.assign(config, loadedConfig)
  } catch (error) {
    console.error('加载封面生成配置失败:', error)
  }
}

const saveConfig = async () => {
  if (!api) return
  try {
    savingConfig.value = true
    await api.updateConfig(config)
    ElMessage.success('配置已保存')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  } finally {
    savingConfig.value = false
  }
}

const handleStyleChange = () => {
  previewUrl.value = ''
}

const generatePreview = async () => {
  if (!api || !selectedLibraryIds.value || selectedLibraryIds.value.length === 0) {
    ElMessage.warning('请先选择媒体库')
    return
  }

  try {
    previewLoading.value = true
    const libraryId = selectedLibraryIds.value[0]
    const blob = await api.previewCover(libraryId, selectedStyle.value)
    previewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('生成预览失败:', error)
    ElMessage.error('生成预览失败')
    previewUrl.value = ''
  } finally {
    previewLoading.value = false
  }
}

const generateCovers = async () => {
  if (!api) return

  const libraryIds =
    selectedLibraryIds.value.length > 0
      ? selectedLibraryIds.value
      : libraries.value.map((lib) => lib.library_id)

  if (libraryIds.length === 0) {
    ElMessage.warning('没有可用的媒体库')
    return
  }

  try {
    generating.value = true
    genRecords.value = []

    const response = await api.generateCover({
      library_ids: libraryIds,
      style: selectedStyle.value,
      item_ids: [],
    })

    genRecords.value = response.results

    const successCount = response.results.filter((r) => r.success).length
    if (successCount === response.total) {
      ElMessage.success(`封面生成完成，共 ${successCount} 个媒体库`)
    } else {
      ElMessage.warning(`封面生成完成，成功 ${successCount} 个，失败 ${response.failed} 个`)
    }
  } catch (error) {
    console.error('生成封面失败:', error)
    ElMessage.error('生成封面失败')
  } finally {
    generating.value = false
  }
}

const toggleConfigPanel = () => {
  configPanelVisible.value = !configPanelVisible.value
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  const seconds = (ms / 1000).toFixed(2)
  return `${seconds}s`
}

onMounted(() => {
  loadLibraries()
  loadConfig()
})
</script>

<style scoped lang="css">
.cover-gen-content {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.cover-gen-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.operation-card,
.config-card,
.records-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.style-radio-group {
  display: flex;
  gap: 20px;
}

.style-radio {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.style-radio :deep(.el-radio__label) {
  width: 100%;
}

.style-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.style-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 24px;
}

.style-info {
  flex: 1;
}

.style-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.style-desc {
  font-size: 12px;
  color: #909399;
}

.full-width-select {
  width: 100%;
  max-width: 600px;
}

.library-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.library-name {
  flex: 1;
}

.library-type {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  max-width: 600px;
}

.preview-image {
  width: 100%;
  max-height: 340px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 8px;
}

.preview-btn {
  width: 200px;
}

.generate-btn {
  width: 200px;
  height: 48px;
  font-size: 16px;
}

.config-content {
  padding: 8px 0;
}

.title-config-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #f0f2f5;
  transform: translateX(4px);
}

.record-item.is-failed {
  border-left-color: #f56c6c;
  background: #fef6f6;
}

.record-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.record-message {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-time {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 1200px) {
  .style-radio-group {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .cover-gen-content {
    padding: 12px;
  }

  .cover-gen-wrapper {
    gap: 16px;
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

  .style-radio {
    padding: 12px;
  }

  .style-preview {
    gap: 8px;
  }

  .style-icon {
    width: 40px;
    height: 40px;
  }

  .style-name {
    font-size: 13px;
  }

  .style-desc {
    font-size: 11px;
  }

  .full-width-select {
    max-width: 100%;
  }

  .preview-wrapper {
    max-width: 100%;
  }

  .preview-image {
    max-height: 280px;
  }

  .generate-btn {
    width: 100%;
  }

  .record-item {
    padding: 12px;
  }

  .record-title {
    font-size: 13px;
  }

  .record-message {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .cover-gen-content {
    padding: 8px;
  }

  .card-header-icon {
    width: 36px;
    height: 36px;
  }

  .card-header-icon .el-icon {
    font-size: 18px;
  }

  .card-title {
    font-size: 15px;
  }

  .card-subtitle {
    font-size: 11px;
  }
}
</style>
