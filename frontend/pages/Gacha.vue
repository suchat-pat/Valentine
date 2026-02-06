<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center bg-deep-purple-lighten-5" fluid>

    <div class="text-center mb-6">
      <v-chip color="deep-purple-accent-3" variant="flat" size="large" class="mb-2 font-weight-bold">
        Game 2: Memory of Love
      </v-chip>
      <h1 class="text-h4 font-weight-black text-deep-purple-darken-3">
        ความทรงจำสีจาง...จำได้ไหม?
      </h1>
      <p class="text-body-1 text-grey-darken-1 mt-2">
        จับคู่สิ่งที่พวกเราชอบทำด้วยกันให้ครบนะ! 👇
      </p>
    </div>

    <v-sheet 
      width="100%" 
      max-width="500" 
      class="bg-transparent"
    >
      <v-row dense>
        <v-col 
          v-for="(card, index) in cards" 
          :key="index" 
          cols="3" 
          class="pa-2"
        >
          <div 
            class="scene" 
            @click="flipCard(index)"
            :class="{ 'disabled-card': card.isMatched || card.isFlipped || isChecking }"
          >
            <div class="card" :class="{ 'is-flipped': card.isFlipped }">
              
              <div class="card-face card-front shadow-lg">
                <v-icon icon="mdi-heart-question" color="white" size="32"></v-icon>
              </div>

              <div class="card-face card-back shadow-lg">
                <v-icon :icon="card.icon" :color="card.color" size="36"></v-icon>
              </div>

            </div>
          </div>
        </v-col>
      </v-row>
    </v-sheet>

    <v-btn 
      @click="resetGame" 
      color="deep-purple" 
      variant="tonal" 
      class="mt-8 rounded-pill px-6"
      prepend-icon="mdi-refresh"
    >
      เล่นใหม่อีกรอบ
    </v-btn>

    <v-dialog v-model="isWin" max-width="400" persistent>
      <v-card class="rounded-xl text-center pa-8 pt-10 position-relative overflow-visible">
        <div class="absolute-top-icon">
            <v-avatar color="green-accent-3" size="80" class="elevation-6">
                <v-icon icon="mdi-check-bold" color="white" size="40"></v-icon>
            </v-avatar>
        </div>

        <h2 class="text-h4 font-weight-black text-green-darken-2 mt-4">เก่งมาก! 🎉</h2>
        <p class="text-body-1 my-4 text-grey-darken-2">
          จำเก่งขนาดนี้ แสดงว่าใส่ใจกันจริงๆ สินะเนี่ย <br>
          รักนะจุ๊บๆ 😘
        </p>

        <v-btn color="deep-purple-accent-3" block size="large" rounded="xl" @click="isWin = false">
          เขินจัง (ปิดหน้าต่าง)
        </v-btn>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// --- ข้อมูลไอคอนที่จะใช้จับคู่ (เปลี่ยน icon ตรงนี้ได้) ---
// แนะนำให้เลือก icon ที่สื่อถึงกิจกรรมที่ทำร่วมกัน
const items = [
  { name: 'movie', icon: 'mdi-movie-open-heart', color: 'red' },
  { name: 'food', icon: 'mdi-food-turkey', color: 'orange' },
  { name: 'travel', icon: 'mdi-airplane-takeoff', color: 'blue' },
  { name: 'music', icon: 'mdi-music-note-eighth', color: 'purple' },
  { name: 'game', icon: 'mdi-controller', color: 'green' },
  { name: 'cat', icon: 'mdi-cat', color: 'brown' },
]

const cards = ref([])
const flippedCards = ref([]) // เก็บ index ของการ์ดที่กำลังเปิดอยู่
const isChecking = ref(false) // กันไม่ให้กดรัวตอนกำลังเช็คคู่
const isWin = ref(false)

// ฟังก์ชันเริ่มเกม
const initGame = () => {
  // 1. สร้างคู่การ์ด (Duplicate items)
  const deck = [...items, ...items]
  
  // 2. สับการ์ด (Shuffle)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // 3. Map เข้า State
  cards.value = deck.map((item, id) => ({
    ...item,
    id,
    isFlipped: false,
    isMatched: false
  }))
  
  flippedCards.value = []
  isWin.value = false
  isChecking.value = false
}

// ฟังก์ชันพลิกการ์ด
const flipCard = (index) => {
  if (isChecking.value) return // ห้ามกดถ้ากำลังตรวจสอบ
  if (cards.value[index].isMatched) return // ห้ามกดถ้าจับคู่ได้แล้ว
  if (cards.value[index].isFlipped) return // ห้ามกดใบเดิม

  // พลิกการ์ด
  cards.value[index].isFlipped = true
  flippedCards.value.push(index)

  // ถ้าเปิดครบ 2 ใบ ให้เช็ค
  if (flippedCards.value.length === 2) {
    checkMatch()
  }
}

// ฟังก์ชันเช็คคู่
const checkMatch = () => {
  isChecking.value = true
  const [index1, index2] = flippedCards.value
  const card1 = cards.value[index1]
  const card2 = cards.value[index2]

  if (card1.name === card2.name) {
    // กรณีจับคู่ถูก
    cards.value[index1].isMatched = true
    cards.value[index2].isMatched = true
    flippedCards.value = []
    isChecking.value = false
    
    // เช็คว่าชนะหรือยัง (ทุกใบ Matched หมด)
    if (cards.value.every(c => c.isMatched)) {
      setTimeout(() => isWin.value = true, 500)
    }

  } else {
    // กรณีจับคู่ผิด (รอ 1 วิ แล้วพลิกกลับ)
    setTimeout(() => {
      cards.value[index1].isFlipped = false
      cards.value[index2].isFlipped = false
      flippedCards.value = []
      isChecking.value = false
    }, 1000)
  }
}

const resetGame = () => {
  // พลิกการ์ดกลับให้หมดก่อนรีเซ็ต (เพื่อความสวยงาม)
  cards.value.forEach(c => c.isFlipped = false)
  setTimeout(() => {
    initGame()
  }, 300)
}

onMounted(() => {
  initGame()
})
</script>

<style scoped>
/* --- 3D Card Flip CSS --- */

.scene {
  width: 100%;
  aspect-ratio: 1 / 1.2; /* สัดส่วนการ์ดแนวตั้งนิดๆ */
  perspective: 600px;
  cursor: pointer;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

/* หน้าการ์ด (สีม่วง) */
.card-front {
  background: linear-gradient(135deg, #6200ea, #b388ff);
  color: white;
}

/* หลังการ์ด (สีขาว) - ต้องหมุน 180 องศาไว้รอ */
.card-back {
  background-color: white;
  transform: rotateY(180deg);
  border: 2px solid #6200ea;
}

/* ห้ามกดการ์ด */
.disabled-card {
  pointer-events: none;
}

/* แต่งเงา */
.shadow-lg {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
}

/* Icon ลอยเหนือ Dialog */
.absolute-top-icon {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
}
</style>