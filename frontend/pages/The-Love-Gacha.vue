<template>
  <v-container class="fill-height d-flex justify-center align-center bg-pink-lighten-5" fluid>
    
    <v-card 
      width="100%" 
      max-width="450" 
      class="rounded-xl pa-6 text-center position-relative overflow-visible"
      elevation="10"
      border
    >
      <div class="heart-bg-1"><v-icon icon="mdi-heart" color="red-lighten-4" size="80"></v-icon></div>
      <div class="heart-bg-2"><v-icon icon="mdi-heart" color="pink-lighten-4" size="60"></v-icon></div>

      <v-card-item>
        <v-card-title class="text-h4 font-weight-bold text-pink-darken-2 mb-2">
          Happy Valentine's Day
        </v-card-title>
        <v-card-subtitle class="text-body-1 text-grey-darken-1">
          เสี่ยงดวงกันหน่อย! วันนี้เธอจะได้อะไรนะ? 🎁
        </v-card-subtitle>
      </v-card-item>

      <v-divider class="my-4 border-opacity-25 color-pink"></v-divider>

      <div class="py-8 box-container">
        <v-scale-transition mode="out-in">
            <v-icon 
              v-if="!currentReward"
              :class="{'shake-animation': isShaking}"
              icon="mdi-gift-outline" 
              size="150" 
              color="red-accent-2"
            ></v-icon>
        </v-scale-transition>
      </div>

      <v-btn 
        @click="spinGacha" 
        :disabled="isShaking"
        color="pink-accent-3" 
        size="x-large" 
        rounded="pill" 
        elevation="6"
        class="font-weight-bold text-white px-8 mb-4 pulse-btn"
      >
        <v-icon start icon="mdi-heart-flash"></v-icon>
        กดเพื่อสุ่มของขวัญ
      </v-btn>

      <div class="text-caption text-grey mt-2">
        *คูปองนี้ใช้ได้กับเค้าแค่คนเดียวนะ*
      </div>

    </v-card>

    <v-dialog v-model="showResult" max-width="350" persistent>
      <v-card class="rounded-xl text-center pa-6" :color="resultColor">
        <v-icon icon="mdi-party-popper" size="60" color="white" class="mb-4"></v-icon>
        <h2 class="text-h4 font-weight-black text-white mb-2">ยินดีด้วย!</h2>
        <p class="text-white text-h6 mb-6 font-weight-light">เธอได้รับ...</p>
        
        <v-card class="mx-auto pa-4 mb-6 rounded-lg" elevation="0" color="white">
            <v-icon :icon="currentReward?.icon" :color="currentReward?.color" size="50" class="mb-2"></v-icon>
            <h3 class="text-h5 font-weight-bold" :class="`text-${currentReward?.color}`">
                {{ currentReward?.title }}
            </h3>
            <div class="mt-1 text-caption text-grey">ระดับความแรร์: {{ currentReward?.rarity }}</div>
        </v-card>

        <v-btn variant="tonal" color="white" block size="large" @click="resetGame">
          เก็บใส่กระเป๋า ❤️
        </v-btn>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

// State ต่างๆ
const isShaking = ref(false)
const showResult = ref(false)
const currentReward = ref(null)

// --- ส่วนกำหนดของรางวัล (แก้ตรงนี้ได้เลย) ---
const rewards = [
  { 
    id: 1, 
    title: 'ตามใจ 1 วัน', 
    icon: 'mdi-crown', 
    color: 'purple', 
    rarity: 'SSR (หายากสุดๆ!)', 
    weight: 10 // โอกาสออกน้อย
  },
  { 
    id: 2, 
    title: 'พาไปกินบุฟเฟต์', 
    icon: 'mdi-silverware-variant', 
    color: 'orange-darken-2', 
    rarity: 'SR (อร่อยแน่)', 
    weight: 30 
  },
  { 
    id: 3, 
    title: 'นวดหลัง 30 นาที', 
    icon: 'mdi-hand-heart', 
    color: 'blue', 
    rarity: 'R (สบายตัว)', 
    weight: 40 
  },
  { 
    id: 4, 
    title: 'หอมแก้มฟรี 10 ที', 
    icon: 'mdi-emoticon-kiss-outline', 
    color: 'pink', 
    rarity: 'Common (น่ารัก)', 
    weight: 50 
  },
  { 
    id: 5, 
    title: 'การ์ด "ห้ามบ่น" 1 ครั้ง', 
    icon: 'mdi-shield-star', 
    color: 'green', 
    rarity: 'SR (ของดีต้องเก็บไว้)', 
    weight: 20 
  },
]

// สีพื้นหลัง Dialog ตามรางวัลที่ได้
const resultColor = computed(() => {
    if(!currentReward.value) return 'pink'
    return currentReward.value.color
})

// ฟังก์ชันสุ่มแบบถ่วงน้ำหนัก (Weighted Random)
const getRandomReward = () => {
    let totalWeight = rewards.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const item of rewards) {
        if (random < item.weight) {
            return item
        }
        random -= item.weight
    }
    return rewards[0]
}

const spinGacha = () => {
  if (isShaking.value) return
  
  // เริ่มอนิเมชั่นสั่น
  isShaking.value = true
  
  // หน่วงเวลา 2 วินาทีเพื่อให้ลุ้น
  setTimeout(() => {
    currentReward.value = getRandomReward()
    isShaking.value = false
    showResult.value = true
  }, 2000)
}

const resetGame = () => {
  showResult.value = false
  currentReward.value = null
}
</script>

<style scoped>
/* Animation เขย่ากล่อง */
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

.shake-animation {
  animation: shake 0.5s;
  animation-iteration-count: infinite;
}

/* ปุ่มเต้นตุบๆ */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 64, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0); }
}

.pulse-btn {
  animation: pulse 2s infinite;
}

/* Background Decor Absolute Positioning */
.heart-bg-1 {
    position: absolute;
    top: -30px;
    left: -30px;
    opacity: 0.5;
    transform: rotate(-30deg);
}
.heart-bg-2 {
    position: absolute;
    bottom: -20px;
    right: -20px;
    opacity: 0.5;
    transform: rotate(20deg);
}
</style>