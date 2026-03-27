<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-icon">📺</span>
      </div>
      <h2>월드메르디앙 Sound Controller</h2>
      <p class="subtitle">시스템 보안을 위해 비밀번호를 입력해 주세요.</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input 
            type="password" 
            v-model="password" 
            placeholder="비밀번호 입력" 
            class="login-input"
            autofocus
          >
          <div v-if="error" class="error-msg">{{ error }}</div>
        </div>
        <button type="submit" class="btn-login">로그인</button>
      </form>
      
      <div class="login-footer">
        <p>© 2026 World Meridian Sound Control</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['login-success'])
const password = ref('')
const error = ref('')

const handleLogin = () => {
  const savedPassword = localStorage.getItem('appPassword') || '1234'
  
  if (password.value === savedPassword) {
    emit('login-success')
  } else {
    error.value = '비밀번호가 올바르지 않습니다.'
    password.value = ''
  }
}

onMounted(() => {
  // 초기 비밀번호 설정 (저장된 값이 없으면 1234 사용)
  if (!localStorage.getItem('appPassword')) {
    localStorage.setItem('appPassword', '1234')
  }
})
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%);
  z-index: 10000;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: slideUp 0.5s ease;
}

.login-logo {
  font-size: 3rem;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 10px;
  color: #1a1a1a;
  font-size: 1.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 1.1rem;
  text-align: center;
  transition: border-color 0.3s;
}

.login-input:focus {
  outline: none;
  border-color: #4361ee;
}

.error-msg {
  color: #f72585;
  font-size: 0.85rem;
  margin-top: 8px;
}

.btn-login {
  padding: 12px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-login:hover {
  background: #3651d1;
}

.login-footer {
  margin-top: 30px;
  font-size: 0.8rem;
  color: #aaa;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
