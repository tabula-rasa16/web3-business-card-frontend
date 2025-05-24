<template>
  <div class="card-display-container">
    <!-- 名片基本信息 -->
    <el-card class="card-info-card">
      <div class="card-info-flex">
        <img
          v-if="cardData.business_card_base_info.portfolio_url"
          :src="getImageUrl(cardData.business_card_base_info.portfolio_url)"
          class="profile-photo"
          style="margin-right: 24px;"
        />
        <div>
          <div class="card-title">{{ cardData.business_card_base_info.display_name }}</div>
          <div>公司：{{ cardData.business_card_base_info.company }}</div>
          <div>职位：{{ cardData.business_card_base_info.job_title }}</div>
          <div>Debox账户：{{ cardData.business_card_base_info.debox_account }}</div>
          <div>邮箱：{{ cardData.business_card_base_info.email }}</div>
          <div>电话：{{ cardData.business_card_base_info.phone }}</div>
          <div v-if="cardData.business_card_base_info.website_url">
            个人网页：
            <a :href="cardData.business_card_base_info.website_url" target="_blank">
              {{ cardData.business_card_base_info.website_url }}
            </a>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 社交媒体 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>社交媒体</h3>
        </div>
      </template>
      <div class="social-links">
        <div
          v-for="account in cardData.social_accounts"
          :key="account.id"
          class="social-link-row"
        >
          <span class="platform"><b>平台：</b>{{ account.platform }}</span>
          <span class="account-handle"><b>平台用户名：</b>{{ account.account_handle }}</span>
          <span class="profile-link">
            <b>平台个人主页链接：</b>
            <a
              v-if="account.profile_url"
              :href="account.profile_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ account.profile_url }}
            </a>
            <span v-else>无</span>
          </span>
        </div>
      </div>
    </el-card>

    <!-- 数字资产 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>数字资产</h3>
        </div>
      </template>
      <div class="assets-grid">
        <el-card
          v-for="asset in cardData.digital_assets"
          :key="asset.id"
          class="asset-card"
        >
          <template #header>
            <div class="asset-header">
              {{ asset.name }}
            </div>
          </template>
          <div class="asset-content">
            <template v-if="asset.asset_type === 'NFT'">
              <p>编号: #{{ asset.token_id }}</p>
              <div v-if="asset.asset_metadata" class="asset-metadata">
                <img 
                  v-if="getMetadataImage(asset.asset_metadata)"
                  :src="getMetadataImage(asset.asset_metadata)"
                  class="nft-image"
                />
              </div>
            </template>
            <template v-else>
              <p>
                数量: 
                {{
                  asset.amount !== undefined && asset.amount !== null && asset.amount !== ''
                    ? asset.amount
                    : asset.balance_formatted !== undefined && asset.balance_formatted !== null && asset.balance_formatted !== ''
                      ? asset.balance_formatted
                      : asset.balance !== undefined && asset.balance !== null && asset.balance !== ''
                        ? asset.balance
                        : '0'
                }}
              </p>
            </template>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSharedCard } from '../api/businessCard'
import { getDigitalAssets } from '../api/digitalAsset'

const route = useRoute()
const shareToken = route.query.share_token
const cardData = ref({
  business_card_base_info: {},
  social_accounts: [],
  digital_assets: []
})

const loadSharedCard = async () => {
  try {
    if (!shareToken) {
      ElMessage.error('分享链接无效')
      return
    }
    
    const res = await getSharedCard(shareToken)
    if (res.code === 200) {
      cardData.value = res.data
      // 获取数字资产
      if (res.data.business_card_base_info?.user_id) {
        await loadDigitalAssets(res.data.business_card_base_info.user_id)
      }
    }
  } catch (error) {
    console.error('获取名片信息失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('获取名片信息失败')
    }
  }
}

const loadDigitalAssets = async (userId) => {
  try {
    const res = await getDigitalAssets({ user_id: userId })
    if (res.code === 200) {
      // 处理数字资产数据
      const assets = []
      if (Array.isArray(res.data)) {
        res.data.forEach(chainData => {
          if (chainData.nft_list?.result) {
            assets.push(...chainData.nft_list.result.map(nft => ({
              ...nft,
              asset_type: 'NFT'
            })))
          }
          if (chainData.token_list?.result) {
            assets.push(...chainData.token_list.result.map(token => ({
              ...token,
              asset_type: 'TOKEN',
              amount: token.amount ?? token.balance_formatted ?? token.balance ?? '0'
            })))
          }
        })
      }
      cardData.value.digital_assets = assets
    }
  } catch (error) {
    console.error('加载数字资产失败:', error)
    ElMessage.error('加载数字资产失败')
  }
}

const getMetadataImage = (metadata) => {
  try {
    const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
    return parsed.image
  } catch {
    return null
  }
}

const getAvatarUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return 'http://127.0.0.1:5000/download' + url.replace(/\\/g, '/')
}

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return 'http://127.0.0.1:5000/download/' + url.replace(/\\/g, '/')
}

onMounted(() => {
  loadSharedCard()
})
</script>

<style scoped>
.card-display-container {
  max-width: 600px;
  margin: 2rem auto;
  position: relative;
}

.profile-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-size: 1.5em;
  font-weight: bold;
}

.card-info-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 10px;
}

.info-card {
  margin-bottom: 2rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.platform, .account-handle, .profile-link {
  font-size: 15px;
}

.profile-link a {
  color: #409eff;
  text-decoration: underline;
  word-break: break-all;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.asset-card {
  height: 100%;
}

.nft-image {
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
}

.asset-metadata {
  margin-top: 1rem;
}

.profile-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.avatar-top {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-info-flex {
  display: flex;
  align-items: flex-start;
}
</style> 