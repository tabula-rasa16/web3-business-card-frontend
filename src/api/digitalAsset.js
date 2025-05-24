import request from '../utils/request'

// 获取支持的链列表
export function getSupportedChains() {
  return request({
    url: '/digitalAsset/getSupportedChains',
    method: 'get'
  })
}

// 获取钱包Token资产
export function getWalletTokens(data) {
  return request({
    url: '/digitalAsset/getWalletTokens',
    method: 'post',
    data
  })
}

// 获取钱包NFT资产
export function getWalletNfts(data) {
  return request({
    url: '/digitalAsset/getWalletNfts',
    method: 'post',
    data
  })
}

// 批量创建数字资产
export function batchCreateAssets(data) {
  return request({
    url: '/digitalAsset/batchCreate',
    method: 'post',
    data
  })
}

// 批量更新数字资产
export function batchUpdateAssets(data) {
  return request({
    url: '/digitalAsset/batchUpdate',
    method: 'post',
    data
  })
}

// 删除用户的所有数字资产
export function deleteAssets(data) {
  return request({
    url: '/digitalAsset/delete',
    method: 'post',
    data
  })
}

// 获取数字资产
export function getDigitalAssets(params) {
  return request({
    url: '/digitalAsset/get',
    method: 'get',
    params
  })
} 