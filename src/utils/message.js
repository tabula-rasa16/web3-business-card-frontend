import { ElMessage } from 'element-plus'

export const showMessage = {
  success(message) {
    ElMessage.success(message)
  },
  error(message) {
    ElMessage.error(message)
  },
  warning(message) {
    ElMessage.warning(message)
  },
  info(message) {
    ElMessage.info(message)
  }
} 