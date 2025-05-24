<template>
  <div class="profile-container">
    <!-- 顶部：用户名 + 退出登录 -->
    <div class="profile-top">
      <div class="profile-title">
        <span class="username">{{ userInfo.username || '未填写' }}</span>
        <img
          v-if="userInfo.avatar_url"
          :src="getAvatarUrl(userInfo.avatar_url)"
          class="avatar-top"
        />
      </div>
      <el-button type="danger" class="logout-btn" @click="logout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
    <div class="wallet-address">
      <el-tag type="info" size="small" effect="plain">
        {{ userInfo.wallet_address || '未绑定' }}
      </el-tag>
    </div>

    <!-- 用户基础信息 -->
    <el-card class="user-info-card">
      <div class="user-info">
        <div class="user-detail">
          <div>性别：{{ genderText(userInfo.gender) }}</div>
          <div>简介：{{ userInfo.bio || '未填写' }}</div>
        </div>
      </div>
    </el-card>

    <!-- 只在未创建名片时显示按钮 -->
    <div v-if="showCreateCardBtn" class="create-card-btn">
      <el-button
        type="primary"
        icon="Plus"
        @click="router.push(`/create/${userId}`)"
      >
        创建web3数字名片
      </el-button>
    </div>

    <!-- 只在已创建名片时显示名片内容和icon -->
    <template v-else>
      <el-card class="card-info-card">
        <div class="card-info-flex">
          <img
            v-if="cardData.business_card_base_info[0]?.portfolio_url"
            :src="getImageUrl(cardData.business_card_base_info[0].portfolio_url)"
            class="profile-photo"
            style="margin-right: 24px;"
          />
          <div>
            <div class="card-title">{{ cardData.business_card_base_info[0].display_name }}</div>
            <div>公司：{{ cardData.business_card_base_info[0].company }}</div>
            <div>职位：{{ cardData.business_card_base_info[0].job_title }}</div>
            <div>Debox账户：{{ cardData.business_card_base_info[0].debox_account }}</div>
            <div>邮箱：{{ cardData.business_card_base_info[0].email }}</div>
            <div>电话：{{ cardData.business_card_base_info[0].phone }}</div>
            <div v-if="cardData.business_card_base_info[0].website_url">
              个人网页：
              <a :href="cardData.business_card_base_info[0].website_url" target="_blank">
                {{ cardData.business_card_base_info[0].website_url }}
              </a>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 先渲染社交媒体和数字资产 -->
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
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3>数字资产</h3>
          </div>
        </template>
        <div class="assets-grid">
          <el-card
            v-for="asset in displayedAssets"
            :key="asset.token_address + (asset.token_id ? '_' + asset.token_id : '')"
            class="asset-card"
          >
            <template #header>
              <div class="asset-header">
                {{ asset.name }}
              </div>
            </template>
            <div class="asset-content">
              <template v-if="asset.contract_type === 'ERC721'">
                <p>编号: #{{ asset.token_id }}</p>
                <p v-if="asset.normalized_metadata?.image">
                  <img :src="getIpfsUrl(asset.normalized_metadata.image)" class="asset-image" />
                </p>
                <p v-if="asset.normalized_metadata?.attributes?.length">
                  <span v-for="attr in asset.normalized_metadata.attributes" :key="attr.trait_type">
                    {{ attr.trait_type }}: {{ attr.value }}
                  </span>
                </p>
              </template>
              <template v-else>
                <p>数量: {{ asset.amount || asset.balance_formatted || asset.balance }}</p>
              </template>
            </div>
          </el-card>
        </div>
      </el-card>
      <!-- 再渲染底部按钮 -->
      <div class="bottom-actions">
        <el-button type="primary" @click="showShareDialog">分享名片</el-button>
        <el-button type="primary" @click="router.push(`/edit/${userId}`)">编辑名片</el-button>
        <el-button @click="showFeedbackDialog">反馈</el-button>
      </div>
    </template>

    <!-- 分享对话框 -->
    <el-dialog
      v-model="shareDialogVisible"
      title="分享名片"
      width="30%"
    >
      <div style="margin-bottom: 16px;">
        <el-radio-group v-model="shareType">
          <el-radio-button label="link">生成链接</el-radio-button>
          <el-radio-button label="qrcode">生成二维码</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="shareType === 'link'">
        <el-input v-model="shareUrl" readonly>
          <template #append>
            <el-button @click="copyShareUrl">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      <div v-else>
        <qrcode-vue :value="shareUrl" :size="200" level="H" ref="qrcodeRef" />
        <div style="text-align:center;margin-top:10px;">
          <el-button icon="Download" @click="saveQrcode">保存二维码</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 反馈对话框 -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="提交反馈"
      width="30%"
    >
      <el-form :model="feedbackForm" ref="feedbackFormRef">
        <el-form-item label="反馈内容">
          <el-input
            v-model="feedbackForm.feedback_content"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入您的反馈（可选）"
          />
        </el-form-item>
        <el-form-item
          label="满意度"
          :required="true"
          :rules="[{ required: true, message: '请打分', trigger: 'change' }]"
          prop="satisfaction"
        >
          <el-rate
            v-model="feedbackForm.satisfaction"
            :max="5"
            :low-threshold="1"
            :high-threshold="5"
            :allow-half="false"
            show-score
            score-template="{value} 分"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feedbackDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserBaseInfo } from '@/api/user'
import { getBusinessCard } from '@/api/businessCard'
import { ElMessage } from 'element-plus'
import { SwitchButton, CopyDocument, Download } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { getDigitalAssets } from '@/api/digitalAsset'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const userId = computed(() => route.params.user_id)

const userInfo = ref({})
const cardData = ref({ business_card_base_info: [] })
const showCreateCardBtn = ref(true)
const displayedAssets = ref([])

const feedbackDialogVisible = ref(false)
const feedbackForm = ref({
  feedback_content: '',
  satisfaction: null, // 必须强制选择
})
const feedbackFormRef = ref(null)

const shareDialogVisible = ref(false)
const shareType = ref('link')
const shareUrl = ref('')
const qrcodeRef = ref(null)

const genderText = (gender) => {
  if (gender === 'male') return '男'
  if (gender === 'female') return '女'
  if (gender === 'other') return '其他'
  return '未填写'
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

const getIpfsUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('ipfs://')) {
    // 兼容 ipfs://CID/xxx.png 和 ipfs://CID
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

const loadProfile = async () => {
  // 获取用户基础信息
  const res = await getUserBaseInfo(userId.value)
  if (res.code === 200 && res.data) {
    userInfo.value = res.data
  }

  // 获取名片信息
  try {
    const cardRes = await getBusinessCard(userId.value)
    if (
      cardRes.data &&
      cardRes.data.business_card_base_info &&
      cardRes.data.business_card_base_info.length > 0
    ) {
      cardData.value = cardRes.data
      showCreateCardBtn.value = false
    } else {
      showCreateCardBtn.value = true
    }
  } catch (e) {
    // 只要是404，不弹窗，只显示创建按钮
    if (e.response && e.response.status === 404) {
      showCreateCardBtn.value = true
    } else {
      // 其他错误才弹窗
      ElMessage.error(e.message || '获取名片信息失败')
      showCreateCardBtn.value = true
    }
  }
}

const logout = () => {
  userStore.clear()
  localStorage.removeItem('token')
  router.push('/')
  ElMessage.success('已退出登录')
}

const loadAssets = async () => {
  try {
    const res = await getDigitalAssets({ user_id: userId.value, is_display: 1 })
    if (res.code === 200) {
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
              asset_type: 'TOKEN'
            })))
          }
        })
      }
      displayedAssets.value = assets
    }
  } catch (error) {
    console.error('加载数字资产失败:', error)
    ElMessage.error('加载数字资产失败')
  }
}

const submitFeedback = async () => {
  // 校验满意度
  if (!feedbackForm.value.satisfaction) {
    ElMessage.error('请为满意度打分')
    return
  }
  try {
    await axios.post('http://127.0.0.1:5000/feedback/create', {
      user_id: Number(userId.value),
      feedback_content: feedbackForm.value.feedback_content,
      satisfaction: feedbackForm.value.satisfaction
    })
    ElMessage.success('提交成功')
    feedbackDialogVisible.value = false
    // 清空表单
    feedbackForm.value.feedback_content = ''
    feedbackForm.value.satisfaction = null
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

const showFeedbackDialog = () => {
  feedbackDialogVisible.value = true
}

const showShareDialog = async () => {
  const cardId = cardData.value.business_card_base_info[0]?.id
  if (!cardId) {
    ElMessage.error('未找到名片ID')
    return
  }
  try {
    const res = await axios.post('http://127.0.0.1:5000/businessCard/share', { id: cardId })
    if (res.data && res.data.data && res.data.data.share_url) {
      // 修改：将后端返回的URL转换为前端路由
      const backendUrl = res.data.data.share_url
      const shareToken = new URL(backendUrl).searchParams.get('share_token')
      const frontendBaseUrl = window.location.origin
      shareUrl.value = `${frontendBaseUrl}/card/shared?share_token=${shareToken}`
      shareType.value = 'link'
      shareDialogVisible.value = true
    } else {
      ElMessage.error('获取分享链接失败')
    }
  } catch (e) {
    console.error('获取分享链接失败:', e)
    ElMessage.error('获取分享链接失败')
  }
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const saveQrcode = () => {
  const canvas = qrcodeRef.value.$el.querySelector('canvas')
  if (!canvas) {
    ElMessage.error('未找到二维码')
    return
  }
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'business_card_qrcode.png'
  a.click()
}

onMounted(() => {
  if (!userId.value) {
    router.push('/')
    return
  }
  loadProfile()
  loadAssets()
})
</script>

<style scoped>
.profile-container {
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

.wallet-address {
  margin-top: 4px;
  font-size: 0.95em;
  color: #888;
  word-break: break-all;
}

.logout-btn {
  display: flex;
  align-items: center;
}

.user-info-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
  background: #f5f5f5;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-card-btn {
  text-align: center;
  margin-bottom: 20px;
}

.card-info-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 10px;
}

.bottom-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
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

.share-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-actions {
  margin-top: 40px;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

.profile-name {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 8px;
}

.asset-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 8px;
}

.asset-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-content span {
  display: block;
  font-size: 14px;
  color: #666;
}

.profile-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.avatar, .profile-photo {
  max-width: 100px;
  max-height: 100px;
  border-radius: 8px;
}

.card-info-flex {
  display: flex;
  align-items: flex-start;
}

.avatar-top {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

</style> 