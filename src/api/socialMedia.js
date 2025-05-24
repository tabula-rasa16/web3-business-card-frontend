import request from '@/utils/request'

// 获取社交媒体平台列表
export function getSocialMediaList() {
  return request({
    url: '/businessCard/getSocialMedia',
    method: 'get'
  })
} 