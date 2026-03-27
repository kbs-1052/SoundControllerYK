<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h2>{{ editing ? '✏️ 예약 수정' : '➕ 예약 등록' }}</h2>

      <div class="form-group">
        <label>제목</label>
        <input class="form-control" v-model="form.title" placeholder="예약 제목을 입력하세요">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>시작 시간</label>
          <div class="time-group">
            <input class="form-control" v-model.number="form.startHour" type="number" min="0" max="23" placeholder="시">
            <span class="time-sep">:</span>
            <input class="form-control" v-model.number="form.startMinute" type="number" min="0" max="59" placeholder="분">
          </div>
        </div>
        <div class="form-group">
          <label>종료 시간</label>
          <div class="time-group">
            <input class="form-control" v-model.number="form.endHour" type="number" min="0" max="23" placeholder="시">
            <span class="time-sep">:</span>
            <input class="form-control" v-model.number="form.endMinute" type="number" min="0" max="59" placeholder="분">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>플레이 요일</label>
        <div class="day-selector">
          <span
            v-for="day in allDays"
            :key="day"
            class="day-badge"
            :class="{ selected: selectedDays.includes(day) }"
            @click="toggleDay(day)"
          >{{ day }}</span>
        </div>
      </div>

      <div class="form-group">
        <label>미디어 내용 (유튜브 URL 또는 음악 경로)</label>
        <div class="media-input-wrapper">
          <input class="form-control" v-model="form.mediaContent" placeholder="예: https://youtube.com/... 또는 /music/song.mp3 / .wav">
          <label class="btn btn-icon btn-file" title="음악 파일 이름 가져오기">
            <input type="file" @change="onLocalFileChange" style="display:none" accept="audio/*">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </label>
        </div>
        <p class="input-hint">💡 로컬 파일 선택 시 브라우저 내장 저장소에 안전하게 저장되어 Java 서버 없이도 재생됩니다.</p>
      </div>

      <div class="form-group">
        <label>예약 시작 시 시스템 볼륨 (0~100)</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="range" style="width: 200px" v-model.number="form.volume" min="0" max="100">
          <span style="font-weight: bold; width: 40px">{{ form.volume }}%</span>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-ghost" @click="$emit('close')">취소</button>
        <button class="btn btn-primary" @click="save">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { saveMusicFile } from '../utils/db.js'

const props = defineProps(['editing'])
const emit = defineEmits(['close', 'save'])

const allDays = ['월', '화', '수', '목', '금', '토', '일']
const selectedDays = ref([])

const form = reactive({
  title: '',
  startHour: 9,
  startMinute: 0,
  endHour: 10,
  endMinute: 0,
  mediaContent: '',
  status: '대기',
  playDays: '',
  volume: 50
})

onMounted(() => {
  if (props.editing) {
    Object.assign(form, props.editing)
    selectedDays.value = props.editing.playDays
      ? props.editing.playDays.split(',').map(s => s.trim()).filter(Boolean)
      : []
  } else {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      if (settings.defaultVolume !== undefined) {
        form.volume = settings.defaultVolume
      }
    }
  }
})

const toggleDay = (day) => {
  const idx = selectedDays.value.indexOf(day)
  if (idx >= 0) selectedDays.value.splice(idx, 1)
  else selectedDays.value.push(day)
}

const onLocalFileChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    try {
      // IndexedDB에 파일 저장
      await saveMusicFile(file.name, file);
      form.mediaContent = `db://${file.name}`
    } catch (err) {
      console.error('File save error:', err);
      alert('파일 저장 중 오류가 발생했습니다.');
    }
  }
}

const save = () => {
  if (!form.title || !form.mediaContent) {
    alert('제목과 미디어 내용을 입력해주세요.');
    return;
  }
  form.playDays = selectedDays.value.join(',')
  emit('save', { ...form })
  emit('close')
}
</script>

<style scoped>
.media-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.media-input-wrapper .form-control {
  flex: 1;
}

.btn-file {
  width: 42px;
  height: 42px;
  padding: 0;
  background-color: var(--bg-hover);
  color: #000;
  font-weight: 800;
  border: 2px solid #6c5ce7;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(108, 92, 231, 0.15);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-file:hover {
  background-color: var(--border-color);
}

.input-hint {
  font-size: 0.8rem;
  color: var(--text-medium);
  margin-top: 6px;
  background: var(--bg-hover);
  padding: 6px 10px;
  border-radius: 6px;
}
</style>
