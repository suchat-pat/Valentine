<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center bg-blue-grey-lighten-5 pa-0" fluid>
    
    <v-card width="100%" max-width="600" class="position-absolute top-0 mt-4 px-4 py-2 rounded-xl z-index-10" elevation="4">
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 font-weight-bold text-pink">Love Score</div>
        <v-progress-linear
          :model-value="score"
          color="pink-accent-3"
          height="20"
          rounded
          striped
          class="mx-4"
          style="width: 200px;"
        >
          <template v-slot:default>
            <strong>{{ Math.min(score, 100) }}%</strong>
          </template>
        </v-progress-linear>
        <v-icon icon="mdi-heart" color="red"></v-icon>
      </div>
    </v-card>

    <div 
      ref="gameArea" 
      class="game-container position-relative overflow-hidden bg-white elevation-5"
      @mousemove="movePlayerMouse"
      @touchmove="movePlayerTouch"
    >
      
      <div class="cloud cloud-1"><v-icon icon="mdi-cloud" size="60" color="blue-lighten-4"></v-icon></div>
      <div class="cloud cloud-2"><v-icon icon="mdi-cloud" size="80" color="blue-lighten-5"></v-icon></div>

      <div v-if="!isPlaying && !isGameOver && !isWin" class="center-overlay text-center">
        <v-icon icon="mdi-gamepad-variant" size="80" color="pink-lighten-2" class="mb-4"></v-icon>
        <h2 class="text-h4 font-weight-black text-blue-grey-darken-3">Rain of Love</h2>
        <p class="text-subtitle-1 text-grey mb-6">เลื่อนน้องหมี 🐻 ไปรับหัวใจให้เต็ม 100% นะ!</p>
        <v-btn size="x-large" color="pink-accent-3" rounded="pill" @click="startGame" class="pulse-btn">
          เริ่มเกมเลย!
        </v-btn>
      </div>

      <div 
        class="player-character text-center"
        :style="{ left: playerX + 'px' }"
      >
        <div style="font-size: 50px; line-height: 1;">🐻</div>
        <v-chip size="x-small" color="pink" variant="flat" class="mt-n2">รับรักหน่อย</v-chip>
      </div>

      <div 
        v-for="item in items" 
        :key="item.id"
        class="falling-item"
        :style="{ top: item.y + 'px', left: item.x + 'px' }"
      >
        <span :style="{ fontSize: item.size + 'px' }">{{ item.emoji }}</span>
      </div>

    </div>

    <v-dialog v-model="isWin" max-width="400" persistent>
      <v-card class="rounded-xl text-center pa-6">
        <v-icon icon="mdi-trophy" size="80" color="amber" class="mb-4"></v-icon>
        <h2 class="text-h4 font-weight-black text-pink">Love 100%</h2>
        <p class="text-body-1 my-4">
          เก่งมาก! รับความรักของเค้าไปหมดเลย <br>
          แบบนี้ต้องให้รางวัลแล้วมั้ง?
        </p>
        <v-btn color="pink" block rounded="lg" @click="resetGame">เล่นอีกรอบ</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isGameOver" max-width="400" persistent>
      <v-card class="rounded-xl text-center pa-6">
        <v-icon icon="mdi-emoticon-sad-outline" size="80" color="grey" class="mb-4"></v-icon>
        <h2 class="text-h5 font-weight-bold">ว้า... พลาดซะแล้ว</h2>
        <p class="text-body-2 my-4">โดนระเบิดเยอะไปหน่อย ลองใหม่นะ!</p>
        <v-btn color="blue-grey" variant="tonal" block rounded="lg" @click="resetGame">ลองใหม่</v-btn>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'

// --- Config เกม ---
const WIN_SCORE = 100
const SPAWN_RATE = 600 // ของตกทุกๆ 0.6 วินาที (เลขน้อย = ตกถี่)
const FALL_SPEED_BASE = 3 // ความเร็วพื้นฐาน

// Emoji ของดี (ได้แต้ม)
const goodItems = [
    { emoji: '❤️', score: 10 },
    { emoji: '💖', score: 15 },
    { emoji: '🌹', score: 10 },
    { emoji: '🍫', score: 5 },
    { emoji: '💌', score: 10 }
]
// Emoji ของเสีย (ลบแต้ม)
const badItems = [
    { emoji: '💣', score: -20 },
    { emoji: '💩', score: -10 },
    { emoji: '💔', score: -15 }
]

// State
const gameArea = ref(null)
const isPlaying = ref(false)
const isWin = ref(false)
const isGameOver = ref(false)
const score = ref(0)
const playerX = ref(0) // ตำแหน่งแนวนอนของ Player
const items = ref([]) // Array เก็บของที่กำลังตก

let gameLoop = null
let spawnInterval = null

// เริ่มเกม
const startGame = async () => {
    // รีเซ็ตค่า
    score.value = 0
    items.value = []
    isWin.value = false
    isGameOver.value = false
    isPlaying.value = true
    
    // ตั้งตำแหน่งผู้เล่นไว้ตรงกลาง
    await nextTick()
    if(gameArea.value) {
        playerX.value = (gameArea.value.clientWidth / 2) - 25
    }

    // เริ่ม Loop
    spawnInterval = setInterval(spawnItem, SPAWN_RATE)
    gameLoop = requestAnimationFrame(updateGame)
}

// สร้างของตกลงมา
const spawnItem = () => {
    if (!gameArea.value) return
    const maxWidth = gameArea.value.clientWidth - 40
    
    // สุ่มว่าจะออกของดี หรือ ของเสีย (ของดี 70% ของเสีย 30%)
    const isGood = Math.random() > 0.3
    const pool = isGood ? goodItems : badItems
    const randomItem = pool[Math.floor(Math.random() * pool.length)]

    items.value.push({
        id: Date.now() + Math.random(),
        x: Math.random() * maxWidth,
        y: -50, // เริ่มต้นเหนือขอบจอ
        speed: FALL_SPEED_BASE + Math.random() * 2, // สุ่มความเร็วให้ไม่เท่ากัน
        size: 30 + Math.random() * 20, // สุ่มขนาด
        ...randomItem
    })
}

// Game Loop หลัก (ทำงานตลอดเวลาเพื่อขยับของและเช็คชน)
const updateGame = () => {
    if (!isPlaying.value) return

    // 1. ขยับของลงมา
    items.value.forEach(item => {
        item.y += item.speed
    })

    // 2. ลบของที่ตกเลยขอบล่างไปแล้ว
    if(gameArea.value) {
        const height = gameArea.value.clientHeight
        items.value = items.value.filter(item => item.y < height)
    }

    // 3. เช็คการชน (Collision)
    checkCollision()

    // 4. เช็คเงื่อนไขชนะ/แพ้
    if (score.value >= WIN_SCORE) {
        endGame(true)
    } else if (score.value < -20) { // ติดลบเยอะเกิน แพ้
        endGame(false)
    } else {
        requestAnimationFrame(updateGame)
    }
}

// ฟังก์ชันเช็คการชน (Hitbox ง่ายๆ)
const checkCollision = () => {
    // Hitbox ผู้เล่น (สมมติว่าเป็นสี่เหลี่ยมรอบตัวหมี)
    const pX = playerX.value
    const pY = gameArea.value.clientHeight - 80 // ตำแหน่ง Y ของหมี (Fixed จาก css bottom)
    const pW = 60 // กว้าง
    const pH = 60 // สูง

    items.value = items.value.filter(item => {
        // Hitbox ของ item
        const iX = item.x
        const iY = item.y
        const iS = item.size // ใช้ขนาดเป็นความกว้าง/สูง

        // สูตรเช็คสี่เหลี่ยมซ้อนทับ (AABB Collision)
        const isHit = (
            pX < iX + iS &&
            pX + pW > iX &&
            pY < iY + iS &&
            pY + pH > iY
        )

        if (isHit) {
            // โดนชน! บวก/ลบ คะแนน
            score.value += item.score
            return false // ลบออกจาก array (หายไป)
        }
        return true // ยังอยู่
    })
}

// จบเกม
const endGame = (win) => {
    isPlaying.value = false
    clearInterval(spawnInterval)
    cancelAnimationFrame(gameLoop)
    if (win) isWin.value = true
    else isGameOver.value = true
}

const resetGame = () => {
    isWin.value = false
    isGameOver.value = false
    // กลับไปหน้า Start
}

// ควบคุม: Mouse
const movePlayerMouse = (e) => {
    if (!isPlaying.value || !gameArea.value) return
    const rect = gameArea.value.getBoundingClientRect()
    // คำนวณตำแหน่งเมาส์เทียบกับกล่องเกม
    let newX = e.clientX - rect.left - 30 // -30 คือครึ่งนึงของตัวหมี
    // จำกัดขอบซ้ายขวา
    if (newX < 0) newX = 0
    if (newX > rect.width - 60) newX = rect.width - 60
    playerX.value = newX
}

// ควบคุม: Touch (มือถือ)
const movePlayerTouch = (e) => {
    if (!isPlaying.value || !gameArea.value) return
    const rect = gameArea.value.getBoundingClientRect()
    const touch = e.touches[0]
    let newX = touch.clientX - rect.left - 30
    if (newX < 0) newX = 0
    if (newX > rect.width - 60) newX = rect.width - 60
    playerX.value = newX
}

onUnmounted(() => {
    clearInterval(spawnInterval)
    cancelAnimationFrame(gameLoop)
})
</script>

<style scoped>
.game-container {
    width: 100%;
    max-width: 600px;
    height: 80vh; /* สูง 80% ของจอ */
    border: 2px solid #F48FB1;
    border-radius: 16px;
    touch-action: none; /* ป้องกันการ Scroll หน้าจอตอนลากนิ้ว */
}

.center-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    z-index: 20;
}

.player-character {
    position: absolute;
    bottom: 20px; /* หมีอยู่ล่างเสมอ */
    width: 60px;
    height: 80px;
    z-index: 10;
    transition: left 0.05s linear; /* ใส่ transition นิดๆ ให้นุ่มนวล */
    cursor: grab;
}

.falling-item {
    position: absolute;
    user-select: none;
    z-index: 5;
}

.z-index-10 {
    z-index: 10;
}

/* อนิเมชั่นก้อนเมฆลอยไปมา */
.cloud {
    position: absolute;
    animation: floatCloud 20s infinite linear;
}
.cloud-1 { top: 40px; left: -20%; animation-duration: 25s; }
.cloud-2 { top: 100px; left: -20%; animation-duration: 18s; animation-delay: 5s; }

@keyframes floatCloud {
    from { transform: translateX(0); left: -20%; }
    to { transform: translateX(0); left: 120%; }
}

.pulse-btn {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>