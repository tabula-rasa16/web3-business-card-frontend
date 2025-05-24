import request from '../utils/request'

// 创建反馈
export function createFeedback(data) {
  return request({
    url: '/feedback/create',
    method: 'post',
    data
  })
}

// 获取反馈列表
export function getFeedbackList(userId) {
  return request({
    url: '/feedback/list',
    method: 'get',
    params: { user_id: userId }
  })
}

// 获取单条反馈
export function getFeedback(id) {
  return request({
    url: '/feedback/getRecord',
    method: 'get',
    params: { id }
  })
}

// 撤销反馈
export function revokeFeedback(data) {
  return request({
    url: '/feedback/revoke',
    method: 'post',
    data
  })
} 