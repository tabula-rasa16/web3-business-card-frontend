import request from '../utils/request'

// 获取Nonce
export function getNonce(address) {
  return request({
    url: `/auth/getNonce`,
    method: 'get',
    params: { address }
  })
}

// 验证签名
export function verifySignature(data) {
  return request({
    url: '/auth/verifySignature',
    method: 'post',
    data
  })
} 