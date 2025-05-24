import Web3 from 'web3'

export const getWeb3 = () => {
  if (window.ethereum) {
    return new Web3(window.ethereum)
  }
  throw new Error('请安装MetaMask钱包')
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('请安装MetaMask钱包')
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return accounts[0]
  } catch (error) {
    throw new Error('连接钱包失败')
  }
}

export const signMessage = async (message, address) => {
  const web3 = getWeb3()
  try {
    return await web3.eth.personal.sign(message, address, '')
  } catch (error) {
    throw new Error('签名失败')
  }
} 