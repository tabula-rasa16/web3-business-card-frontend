import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    address: '',
    userId: null,
    token: '',
    businessCard: null
  }),
  
  actions: {
    setWalletAddress(address) {
      this.address = address
    },
    setUserId(id) {
      this.userId = id
    },
    setToken(token) {
      this.token = token
    },
    setBusinessCard(card) {
      this.businessCard = card
    },
    clear() {
      this.address = ''
      this.userId = null
      this.token = ''
      this.businessCard = null
    }
  }
}) 