<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="form.gender" placeholder="请选择">
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          action="/api/upload/image"
          name="image"
          :before-upload="beforeAvatarUpload"
          :on-success="handleAvatarSuccess"
          :on-error="handleAvatarError"
          accept="image/*"
        >
          <el-button type="primary">上传</el-button>
          <img v-if="form.avatar_url" :src="getAvatarUrl(form.avatar_url)" class="avatar" style="display:block;margin-top:10px;max-width:100px;max-height:100px;" />
        </el-upload>
      </el-form-item>
      <el-form-item label="简介">
        <el-input v-model="form.bio" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { createUser, getUserIdByAddress } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const form = ref({
  wallet_address: userStore.address,
  username: '',
  gender: '',
  avatar_url: '',
  bio: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}
const uploadUrl = '/api/upload/image'

// 头像上传
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片')
  }
  return isImage
}

const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    form.value.avatar_url = response.data.url.replace(/\\/g, '/')
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const handleAvatarError = () => {
  ElMessage.error('上传失败')
}

// 注册
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const res = await createUser(form.value)
      if (res.code === 200 && res.data && res.data.user_id) {
        userStore.setUserId(res.data.user_id)
        ElMessage.success('注册成功')
        router.push(`/profile/${res.data.user_id}`)
      } else {
        // 如果没有user_id，尝试用钱包地址查
        const idRes = await getUserIdByAddress({ wallet_address: form.value.wallet_address })
        if (idRes.code === 200 && idRes.data && idRes.data.id) {
          userStore.setUserId(idRes.data.id)
          router.push('/profile')
          ElMessage.success('注册成功')
        } else {
          ElMessage.error('注册失败，无法获取用户ID')
        }
      }
    } catch (e) {
      ElMessage.error('注册失败')
    }
  })
}

const getAvatarUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // 只要不是http开头，都拼接成/download/xxx
  return 'http://127.0.0.1:5000/download' + url.replace(/\\/g, '/')
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
}
.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
</style> 