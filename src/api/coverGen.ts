import { SERVER_URL } from '@/const'
import type { AxiosStatic } from 'axios'

type CoverStyle = 'single' | 'grid'
type CoverSort = 'random' | 'date_created' | 'premiere_date'

interface CoverGenConfig {
  zh_font_size: number
  en_font_size: number
  title_spacing: number
  blur_size: number
  color_ratio: number
  resolution: string
  use_primary: boolean
  multi_blur: boolean
  title_config: string
  sort_by: CoverSort
}

interface CoverGenRequest {
  library_ids: string[]
  style: CoverStyle
  item_ids: string[]
}

interface CoverGenResult {
  library_id: string
  library_name: string
  success: boolean
  message: string
  duration_ms: number
}

interface CoverGenResponse {
  total: number
  success: number
  failed: number
  results: CoverGenResult[]
}

interface CoverGenStatus {
  is_running: boolean
  last_run_time: string
  last_run_results: CoverGenResult[]
}

interface FontInfo {
  available: boolean
  source: string
  path: string
}

interface FontStatus {
  zh_font: FontInfo
  en_font: FontInfo
}

export interface EmbyLibrary {
  library_id: string
  name: string
  type: string
}

export class CoverGenAPI {
  private http: AxiosStatic

  constructor(http: AxiosStatic) {
    this.http = http
  }

  async getConfig(): Promise<CoverGenConfig> {
    const response = await this.http.get(`${SERVER_URL}/cover-gen/config`)
    if (response?.data.code === 0) {
      return response.data.data
    }
    throw new Error(response?.data.msg || '获取封面生成配置失败')
  }

  async updateConfig(config: Partial<CoverGenConfig>): Promise<void> {
    const response = await this.http.post(`${SERVER_URL}/cover-gen/config`, config)
    if (response?.data.code !== 0) {
      throw new Error(response?.data.msg || '更新封面生成配置失败')
    }
  }

  async generateCover(request: CoverGenRequest): Promise<CoverGenResponse> {
    const response = await this.http.post(`${SERVER_URL}/cover-gen/generate`, request)
    if (response?.data.code === 0) {
      return response.data.data
    }
    throw new Error(response?.data.msg || '生成封面失败')
  }

  async previewCover(library_id: string, style: CoverStyle, title?: string[]): Promise<Blob> {
    const response = await this.http.post(
      `${SERVER_URL}/cover-gen/preview`,
      {
        library_id,
        style,
        title,
      },
      {
        responseType: 'blob',
      },
    )
    return response.data
  }

  async getStatus(): Promise<CoverGenStatus> {
    const response = await this.http.get(`${SERVER_URL}/cover-gen/status`)
    if (response?.data.code === 0) {
      return response.data.data
    }
    throw new Error(response?.data.msg || '获取封面生成状态失败')
  }

  async getFontStatus(): Promise<FontStatus> {
    const response = await this.http.get(`${SERVER_URL}/cover-gen/fonts/status`)
    if (response?.data.code === 0) {
      return response.data.data
    }
    throw new Error(response?.data.msg || '获取字体状态失败')
  }

  async getLibraries(): Promise<EmbyLibrary[]> {
    const response = await this.http.get(`${SERVER_URL}/emby/libraries`)
    if (response?.data.code === 200 && response?.data.data) {
      return response.data.data
    }
    throw new Error(response?.data.message || '获取媒体库列表失败')
  }
}

export type {
  CoverStyle,
  CoverSort,
  CoverGenConfig,
  CoverGenRequest,
  CoverGenResult,
  CoverGenResponse,
  CoverGenStatus,
  FontInfo,
  FontStatus,
}
