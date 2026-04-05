import { SERVER_URL } from '@/const'
import type { AxiosStatic } from 'axios'
import { ElMessage } from 'element-plus'

let http: AxiosStatic | undefined

export const setHttpInstance = (httpInstance: AxiosStatic | undefined) => {
  http = httpInstance
}

export interface CoverGenConfig {
  zh_font_size: number
  en_font_size: number
  title_spacing: number
  blur_size: number
  color_ratio: number
  resolution: string
  use_primary: boolean
  multi_blur: boolean
  title_config: string
  sort_by: 'random' | 'date_created' | 'premiere_date'
}

export interface CoverGenResult {
  library_id: string
  library_name: string
  success: boolean
  message: string
  duration_ms: number
}

export interface CoverGenResponse {
  total: number
  success: number
  failed: number
  results: CoverGenResult[]
}

export interface CoverGenStatus {
  is_running: boolean
  last_run_time: string
  last_run_results: CoverGenResult[]
}

export interface EmbyLibrary {
  library_id: string
  name: string
}

export const coverGenApi = {
  getConfig: async (): Promise<CoverGenConfig> => {
    try {
      const response = await http?.get(`${SERVER_URL}/cover-gen/config`)
      if (response?.data.code === 0 && response.data.data) {
        return response.data.data
      }
      throw new Error(response?.data.message || '获取配置失败')
    } catch (error) {
      console.error('获取封面生成配置错误:', error)
      throw error
    }
  },

  updateConfig: async (config: Partial<CoverGenConfig>): Promise<void> => {
    try {
      const response = await http?.post(`${SERVER_URL}/cover-gen/config`, config)
      if (response?.data.code === 0) {
        ElMessage.success('配置已保存')
        return
      }
      throw new Error(response?.data.msg || '保存配置失败')
    } catch (error) {
      console.error('更新封面生成配置错误:', error)
      throw error
    }
  },

  generateCovers: async (params: {
    library_ids: string[]
    style: 'single' | 'grid'
    item_ids?: string[]
  }): Promise<CoverGenResponse> => {
    try {
      const response = await http?.post(`${SERVER_URL}/cover-gen/generate`, params)
      if (response?.data.code === 0 && response.data.data) {
        return response.data.data
      }
      throw new Error(response?.data.msg || '封面生成失败')
    } catch (error) {
      console.error('封面生成错误:', error)
      throw error
    }
  },

  previewCover: async (params: {
    library_id: string
    style: 'single' | 'grid'
    title?: string[]
  }): Promise<Blob> => {
    try {
      const response = await http?.post(`${SERVER_URL}/cover-gen/preview`, params, {
        responseType: 'blob',
      })
      if (response?.data) {
        return response.data as Blob
      }
      throw new Error('预览生成失败')
    } catch (error) {
      console.error('生成预览错误:', error)
      throw error
    }
  },

  getStatus: async (): Promise<CoverGenStatus> => {
    try {
      const response = await http?.get(`${SERVER_URL}/cover-gen/status`)
      if (response?.data.code === 0 && response.data.data) {
        return response.data.data
      }
      throw new Error(response?.data.msg || '获取状态失败')
    } catch (error) {
      console.error('获取封面生成状态错误:', error)
      throw error
    }
  },

  getEmbyLibraries: async (): Promise<EmbyLibrary[]> => {
    try {
      const response = await http?.get(`${SERVER_URL}/emby/libraries`)
      if (response?.data.code === 200 && response.data.data) {
        return response.data.data
      }
      throw new Error(response?.data.message || '获取媒体库列表失败')
    } catch (error) {
      console.error('获取Emby媒体库列表错误:', error)
      throw error
    }
  },
}
