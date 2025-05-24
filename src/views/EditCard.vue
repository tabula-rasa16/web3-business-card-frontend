<template>
  <div class="create-card-container">
    <h2>编辑电子名片</h2>
    <el-form 
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="card-form"
    >
      <!-- 基本信息 -->
      <el-form-item label="显示名称" prop="display_name">
        <el-input v-model="formData.display_name" />
      </el-form-item>
      
      <el-form-item label="Debox账户" prop="debox_account">
        <el-input v-model="formData.debox_account" />
      </el-form-item>

      <el-form-item label="照片">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          action="http://127.0.0.1:5000/upload/image"
          name="image"
          :before-upload="beforeImageUpload"
          :on-success="handleImageSuccess"
          :on-error="handleImageError"
          accept="image/*"
        >
          <el-button type="primary">上传照片</el-button>
          <img v-if="formData.portfolio_url" :src="getImageUrl(formData.portfolio_url)" class="avatar" style="display:block;margin-top:10px;max-width:100px;max-height:100px;" />
        </el-upload>
      </el-form-item>

      <el-form-item label="公司">
        <el-input v-model="formData.company" />
      </el-form-item>

      <el-form-item label="职位">
        <el-input v-model="formData.job_title" />
      </el-form-item>

      <el-form-item label="个人网站">
        <el-input v-model="formData.website_url" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="formData.email" />
      </el-form-item>

      <el-form-item label="电话">
        <el-input v-model="formData.phone" />
      </el-form-item>

      <!-- 社交媒体账号 -->
      <el-divider>社交媒体账号</el-divider>
      
      <div v-for="(account, index) in formData.social_account_list" :key="index" class="social-account-item">
        <el-form-item :label="`平台${index + 1}`">
          <el-select v-model="account.platform" placeholder="Select" @change="handlePlatformChange(account)">
            <el-option label="Twitter" value="twitter" />
            <el-option label="GitHub" value="github" />
            <el-option label="Telegram" value="telegram" />
            <el-option label="LinkedIn" value="linkedin" />
            <el-option label="WeChat" value="wechat" />
            <el-option label="Facebook" value="facebook" />
            <el-option label="Instagram" value="instagram" />
            <el-option label="Other" value="other" />
          </el-select>
          <!-- 选择"其他"时显示输入框 -->
          <el-input
            v-if="account.platform === 'other'"
            v-model="account.customPlatform"
            placeholder="请输入平台名称"
            style="margin-top: 8px;"
          />
        </el-form-item>

        <el-form-item :label="'账号 ' + (index + 1)">
          <el-input v-model="account.account_handle" />
        </el-form-item>

        <el-form-item :label="'链接 ' + (index + 1)">
          <el-input v-model="account.profile_url" />
        </el-form-item>

        <el-button type="danger" @click="removeSocialAccount(index)">删除</el-button>
      </div>

      <el-button type="primary" @click="addSocialAccount">添加社交账号</el-button>

      <!-- 数字资产 -->
      <el-divider>数字资产</el-divider>
      
      <div class="chain-select">
        <el-select v-model="selectedChain" placeholder="选择链" @change="fetchWalletAssets">
          <el-option 
            v-for="chain in chains"
            :key="chain.key"
            :label="chain.descrption"
            :value="chain.key"
          />
        </el-select>
      </div>

      <div v-if="assets.length" class="assets-list">
        <div class="assets-header">
          <el-button type="primary" size="small" @click="selectAllAssets">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </el-button>
        </div>
        
        <el-checkbox-group v-model="selectedNftKeys">
          <div v-for="asset in assets" :key="`${asset.symbol}_${asset.token_id}`" class="asset-item">
            <el-checkbox :label="`${asset.symbol}_${asset.token_id}`">
              {{ asset.name }} ({{ asset.symbol }}) #{{ asset.token_id }}
              <span v-if="asset.amount" class="asset-amount">
                数量: {{ formatAmount(asset.amount) }}
              </span>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">完成编辑</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { getBusinessCard, updateBusinessCard, getSocialMedia } from '../api/businessCard'
import { getSupportedChains, getWalletTokens, getWalletNfts, batchCreateAssets, batchUpdateAssets, getDigitalAssets } from '../api/digitalAsset'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref()

// 表单数据
const userId = computed(() => route.params.user_id)
const formData = reactive({
  id: null,
  user_id: userId.value,
  display_name: '',
  company: '',
  job_title: '',
  website_url: '',
  portfolio_url: '',
  debox_account: '',
  email: '',
  phone: '',
  social_account_list: []
})

// 表单验证规则
const rules = {
  display_name: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  debox_account: [{ required: true, message: '请输入Debox账户', trigger: 'blur' }]
}

// 社交平台列表
const socialPlatforms = ref([])
const getSocialPlatforms = async () => {
  try {
    const res = await getSocialMedia()
    socialPlatforms.value = res.data
  } catch (error) {
    ElMessage.error('获取社交平台列表失败')
  }
}

// 添加/删除社交账号
const addSocialAccount = () => {
  formData.social_account_list.push({
    platform: '',
    customPlatform: '',
    account_handle: '',
    profile_url: ''
  })
}

const removeSocialAccount = (index) => {
  formData.social_account_list.splice(index, 1)
}

// 数字资产相关
const chains = ref([])
const selectedChain = ref('')
const assets = ref([])
const selectedNftKeys = ref([])

const getChains = async () => {
  try {
    const res = await getSupportedChains()
    chains.value = res.data
    if (chains.value.length > 0) {
      selectedChain.value = chains.value[0].key
      fetchWalletAssets()
    }
  } catch (error) {
    ElMessage.error('获取链列表失败')
  }
}

// 计算是否全选
const isAllSelected = computed(() => {
  return assets.value.length > 0 && selectedNftKeys.value.length === assets.value.length
})

// 全选/取消全选
const selectAllAssets = () => {
  if (isAllSelected.value) {
    selectedNftKeys.value = []
  } else {
    selectedNftKeys.value = assets.value.map(asset => `${asset.symbol}_${asset.token_id}`)
  }
}

// 格式化数量显示
const formatAmount = (amount) => {
  if (!amount) return '0'
  // 如果是科学计数法表示的数字，转换为普通数字
  const num = Number(amount)
  if (num < 0.000001) {
    return num.toExponential(6)
  }
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 6
  })
}

// 获取钱包资产
const fetchWalletAssets = async () => {
  if (!userStore.address || !selectedChain.value) {
    assets.value = []
    return
  }
  try {
    // 1. 拉取链上资产
    const [tokensRes, nftsRes] = await Promise.all([
      getWalletTokens({
        address: userStore.address,
        chain: selectedChain.value
      }),
      getWalletNfts({
        address: userStore.address,
        chain: selectedChain.value
      })
    ])
    const chainAssets = [
      ...tokensRes.data.result,
      ...nftsRes.data.result
    ]
    assets.value = chainAssets

    // 2. 拉取数据库已有资产
    const dbRes = await getDigitalAssets({ user_id: userId.value, chain: selectedChain.value })
    const dbAssets = dbRes.code === 200 && Array.isArray(dbRes.data) ? dbRes.data : []

    // 3. 自动勾选数据库已有资产
    const dbAssetKeys = dbAssets.map(a => `${a.symbol}_${a.token_id}`)
    selectedNftKeys.value = chainAssets
      .filter(asset => dbAssetKeys.includes(`${asset.symbol}_${asset.token_id}`))
      .map(asset => `${asset.symbol}_${asset.token_id}`)
  } catch (error) {
    ElMessage.error('获取资产失败')
  }
}

// 提交表单时获取选中的资产详情
const getSelectedAssets = () => {
  return assets.value.filter(asset => 
    selectedNftKeys.value.includes(`${asset.symbol}_${asset.token_id}`)
  )
}

// 获取名片信息并初始化表单
const loadCardInfo = async () => {
  try {
    const res = await getBusinessCard(userId.value)
    if (res.code === 200 && res.data && res.data.business_card_base_info.length > 0) {
      const base = res.data.business_card_base_info[0]
      formData.id = base.id
      formData.display_name = base.display_name
      formData.company = base.company
      formData.job_title = base.job_title
      formData.website_url = base.website_url
      formData.portfolio_url = base.portfolio_url
      formData.debox_account = base.debox_account
      formData.email = base.email
      formData.phone = base.phone
      // 社交账号
      formData.social_account_list = (res.data.social_accounts || []).map(acc => ({
        platform: acc.platform,
        account_handle: acc.account_handle,
        profile_url: acc.profile_url
      }))
    }
  } catch (e) {
    ElMessage.error('获取名片信息失败')
  }
}

// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        // 处理社交平台"其他"选项
        formData.social_account_list = formData.social_account_list.map(acc => ({
          platform: acc.platform,
          custom_platform: acc.platform === 'other' ? acc.customPlatform : '',
          account_handle: acc.account_handle,
          profile_url: acc.profile_url
        }))
        // 1. 更新名片
        await updateBusinessCard(formData)

        // 2. 更新数字资产
        const selectedAssets = getSelectedAssets()
        if (selectedAssets.length) {
          const assetList = selectedAssets.map(asset => ({
            user_id: userId.value,
            asset_type: asset.contract_type === 'ERC1155' || asset.contract_type === 'ERC721' ? 'NFT' : 'TOKEN',
            name: asset.name,
            contract_address: asset.token_address,
            token_id: asset.token_id,
            amount: asset.amount || asset.balance,
            asset_metadata: asset.metadata || asset.normalized_metadata,
            is_display: 1,
            chain: selectedChain.value,
            chain_key: selectedChain.value
          }))
          await batchUpdateAssets({ asset_list: assetList })
        } else {
          // 如果没有选中资产，也要清空数据库
          await batchUpdateAssets({ asset_list: [] })
        }

        ElMessage.success('编辑成功')
        router.push(`/profile/${userId.value}`)
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '编辑失败')
      }
    }
  })
}

function handlePlatformChange(account) {
  if (account.platform !== 'other') {
    account.customPlatform = ''
  }
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片')
  }
  return isImage
}

const handleImageSuccess = (response) => {
  if (response.code === 200) {
    formData.portfolio_url = response.data.url.replace(/\\/g, '/')
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const handleImageError = () => {
  ElMessage.error('上传失败')
}

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return 'http://127.0.0.1:5000/download/' + url.replace(/\\/g, '/')
}

onMounted(() => {
  getSocialPlatforms()
  getChains()
  loadCardInfo()
  fetchWalletAssets()
})

const selectedNfts = computed(() =>
  assets.value.filter(asset => selectedNftKeys.value.includes(`${asset.symbol}_${asset.token_id}`))
)
</script>

<style scoped>
.create-card-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.card-form {
  margin-top: 2rem;
}

.social-account-item {
  border: 1px solid #eee;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.chain-select {
  margin-bottom: 1rem;
}

.assets-list {
  margin: 1rem 0;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}

.assets-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.asset-item {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.asset-item:hover {
  background-color: #f5f7fa;
}

.asset-amount {
  margin-left: 1rem;
  color: #909399;
  font-size: 0.9em;
}
</style> 