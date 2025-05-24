import request from '../utils/request'

// 获取社交媒体列表
export function getSocialMedia() {
  return request({
    url: '/businessCard/getSocialMedia',
    method: 'get'
  })
}

// 创建名片
export function createBusinessCard(data) {
  return request({
    url: '/businessCard/create',
    method: 'post',
    data
  })
}

// 获取名片信息
export function getBusinessCard(userId) {
  return request({
    url: '/businessCard/getcard',
    method: 'get',
    params: { user_id: userId }
  })
}

// 更新名片
export function updateBusinessCard(data) {
  return request({
    url: '/businessCard/update',
    method: 'post',
    data
  })
}

// 分享名片
export function shareBusinessCard(data) {
  return request({
    url: '/businessCard/share',
    method: 'post',
    data
  })
}

// 获取分享的名片信息
export function getSharedCard(shareToken) {
  return request({
    url: `/businessCard/shared_card?share_token=${shareToken}`,
    method: 'get'
  })
} 