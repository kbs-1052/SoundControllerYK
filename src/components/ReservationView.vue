<template>
  <div class="reservation-view-container">
    <div class="view-header">
      <div class="header-left">
        <h2>전체 예약 목록</h2>
        <span class="badge">{{ reservations.length }}건</span>
      </div>
      <div class="header-right">
        <!-- Search Input -->
        <div class="search-input-wrapper list-search">
          <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="목록에서 검색 (제목, 미디어)..." 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
          >
        </div>
        <button class="btn btn-primary" @click="$emit('add')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" style="margin-right:8px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          새 예약 등록
        </button>
      </div>
    </div>

    <!-- Grid / List Table Form -->
    <div class="reservation-grid">
      <div 
        v-for="res in filteredReservations" 
        :key="res.id"
        class="res-card-full"
        :style="{ borderTop: '4px solid ' + getColor(res.id) }"
        @dblclick="$emit('edit', res)"
        title="더블클릭하여 수정"
      >
        <div class="card-header">
           <div class="res-title-lg">{{ res.title }}</div>
           <span class="status-badge" :class="`status-${res.status}`">
             {{ statusIcon(res.status) }} {{ res.status }}
           </span>
        </div>
        <div class="card-body">
           <div class="info-row">
             <span class="info-label">미디어 소스</span>
             <span class="info-value text-truncate" :title="res.mediaContent">{{ res.mediaContent }}</span>
           </div>
           <div class="info-row">
             <span class="info-label">재생 요일</span>
             <span class="info-value">{{ res.playDays || '지정 안됨' }}</span>
           </div>
           <div class="info-row">
             <span class="info-label">재생 시간</span>
             <span class="info-value strong-time">
               {{ formatTime(res.startHour, res.startMinute) }} ~ {{ formatTime(res.endHour, res.endMinute) }}
             </span>
           </div>
           <div class="info-row">
             <span class="info-label">예약 볼륨</span>
             <span class="info-value">
               {{ res.volume !== null && res.volume !== undefined ? res.volume + '%' : '기본 (50%)' }}
             </span>
           </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-sm" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; min-width: 32px;" @click.stop="$emit('play', res)" title="수동 재생">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </button>
          <button class="btn btn-ghost btn-sm" @click.stop="$emit('edit', res)">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="margin-right:4px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            수정
          </button>
          <button class="btn btn-ghost btn-sm btn-danger" @click.stop="$emit('delete', res.id)">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            삭제
          </button>
        </div>
      </div>

      <div v-if="filteredReservations.length === 0" class="empty-state wide">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ccc" stroke-width="1.5" fill="none" style="margin-bottom:16px"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>검색 결과가 없습니다</h3>
        <p>조건을 변경하거나 새로운 예약을 등록해보세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  reservations: {
    type: Array,
    required: true,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:searchQuery', 'add', 'edit', 'delete', 'play'])

const filteredReservations = computed(() => {
  if (!props.searchQuery) return props.reservations
  const q = props.searchQuery.toLowerCase()
  return props.reservations.filter(r => 
    r.title.toLowerCase().includes(q) || 
    (r.mediaContent && r.mediaContent.toLowerCase().includes(q))
  )
})

// Utilities mapped from App.vue
const COLORS = ['#4361ee', '#f72585', '#4cc9f0', '#f8961e', '#43a047']
const getColor = (id) => COLORS[(id - 1) % COLORS.length]
const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
const statusIcon = (s) => ({ '대기': '⏳', '플레이중': '▶', '완료': '✅' }[s] || '⚪')

</script>

<style scoped>
.reservation-view-container {
  padding: 0 16px 32px;
  animation: fadeIn 0.3s ease;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.badge {
  background: var(--bg-hover);
  color: var(--text-medium);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.list-search {
  width: 280px;
  background: white;
  margin-bottom: 0; /* Override default search bar margin */
}

.reservation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.res-card-full {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.res-card-full:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.res-title-lg {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark);
  word-break: break-all;
  padding-right: 12px;
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  background: var(--bg-light);
  padding: 16px;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.info-label {
  color: var(--text-medium);
  font-weight: 500;
}

.info-value {
  color: var(--text-dark);
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.strong-time {
  color: var(--primary-color);
  font-size: 0.95rem;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.btn-danger {
  color: #f72585;
}
.btn-danger:hover {
  background: #f7258515;
}

.empty-state.wide {
  grid-column: 1 / -1;
  min-height: 400px;
}
</style>
