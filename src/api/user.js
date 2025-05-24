import request from '@/utils/request'

// 获取用户ID
export function getUserIdByAddress(data) {
  return request({
    url: '/user/getIdByAddress',
    method: 'post',
    data
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

// 获取用户基本信息
export function getUserBaseInfo(user_id) {
  return request({
    url: '/user/baseinfo',
    method: 'get',
    params: { user_id }
  })
}

// 上传图片
export function uploadImage(formData) {
  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
} 