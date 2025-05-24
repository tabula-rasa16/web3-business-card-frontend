<template>
  <div class="welcome-container">
    <h1>欢迎使用Web3电子名片</h1>
    <el-button type="primary" size="large" @click="connectWallet" :loading="connecting">
      {{ connecting ? '连接中...' : '连接钱包' }}
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import Web3 from 'web3'
import { getNonce, verifySignature } from '../api/auth'
import { getUserIdByAddress } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const connecting = ref(false)

const connectWallet = async () => {
  if (!window.ethereum) {
    ElMessage.error('请安装MetaMask钱包')
    return
  }

  try {
    connecting.value = true
    const web3 = new Web3(window.ethereum)
    
    // 请求用户授权
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    })
    const address = accounts[0]
    userStore.setWalletAddress(address)

    // 获取nonce
    const nonceRes = await getNonce(address)
    const nonce = nonceRes.data.nonce
    
    // 请求签名
    const signature = await web3.eth.personal.sign(
      nonce,
      address,
      ''
    )

    // 验证签名
    const verifyRes = await verifySignature({
      address,
      signature
    })

    // 保存token
    userStore.setToken(verifyRes.data.token)
    localStorage.setItem('token', verifyRes.data.token)

    // 查询后端是否有该钱包地址的用户
    const res = await getUserIdByAddress({ wallet_address: address })
    if (res.code === 200 && res.data && res.data.id) {
      // 已注册，跳转到个人主页
      userStore.setUserId(res.data.id)
      router.push(`/profile/${res.data.id}`)
    } else {
      // 未注册，跳转注册页
      router.push('/register')
    }

  } catch (error) {
    ElMessage.error('服务器异常，请稍后重试')
  } finally {
    connecting.value = false
  }
}
</script>

<style scoped>
.welcome-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}
</style> 