<template>
  <v-container fluid class="fill-height overflow-hidden position-relative pa-0 birthday-bg">
    
    <v-row justify="center" align="center" class="fill-height z-index-1">
      <v-col cols="12" sm="8" md="6" class="text-center">
        
        <v-card elevation="10" rounded="xl" class="pa-6 glass-card" v-if="revealedCount > 5">
          <v-icon color="pink-lighten-2" size="60" class="mb-4 animate-bounce">mdi-cake-variant</v-icon>
          
          <h1 class="text-h4 text-md-h3 font-weight-bold text-pink-darken-2 mb-4">
            Happy Birthday Day! 🎂
          </h1>

          <v-carousel 
            cycle 
            height="auto" 
            hide-delimiter-background
            show-arrows="hover"
            class="rounded-lg mb-6 shadow-lg"
          >
            <v-carousel-item
              v-for="(slide, i) in slides"
              :key="i"
              :src="slide.src"
              cover
            >
            </v-carousel-item>
          </v-carousel>

          <p class="text-body-1 text-grey-darken-2 mb-6">
            วันเกิดปีนี้ขอให้มีความสุขมากๆนะ มีสุขภายร่างกายแข็งไม่ มีแต่รอยยิ้มและเสียงหัวเราะตลอดปีนี้ <br> ขอให้ปีนี้เป็นปีที่ดีที่สุดของแกนะ <br>#รักแฟนที่สุด ❤️
          </p>

          <v-fade-transition>
            <v-btn
              v-if="progress >= 80"
              color="pink-accent-3"
              size="x-large"
              rounded="pill"
              elevation="6"
              @click="dialog = true"
              class="animate-pulse"
            >
              <v-icon start>mdi-gift-open</v-icon>
              กดรับของขวัญ
            </v-btn>
          </v-fade-transition>
        </v-card>

        <div v-else class="text-white text-h5 font-weight-bold drop-shadow">
          <v-icon class="animate-shake" color="white" size="40">mdi-gesture-tap</v-icon>
          <br>
          จิ้มลูกโป่งให้แตกสิ!
        </div>

      </v-col>
    </v-row>

    <div 
      v-for="(balloon, index) in balloons" 
      :key="index"
      class="balloon-wrapper"
      :style="{ 
        top: balloon.top + '%', 
        left: balloon.left + '%',
        animationDuration: balloon.speed + 's',
        zIndex: 2000 
      }"
    >
      <v-icon
        v-if="!balloon.popped"
        :color="balloon.color"
        :size="balloon.size"
        class="balloon-item"
        @click.stop="popBalloon(index)" 
      >
        mdi-balloon
      </v-icon>
      
      <v-icon
        v-if="balloon.popped && balloon.showPop"
        color="pink-accent-2"
        size="50"
        class="pop-effect"
      >
        mdi-star-four-points
      </v-icon>
    </div>

    <v-dialog v-model="dialog" width="auto">
      <v-card max-width="400" rounded="xl" class="pa-4 text-center">
        <v-card-text>
          <v-img 
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExajIxeGZ5NXF6eXJtY3J6Z3J6Z3J6Z3J6Z3J6Z3J6Z3J6Z3J6/L05M4y1e8gI43z4/giphy.gif" 
            height="200" 
            cover 
            class="rounded-lg mb-4"
          ></v-img>
          <h2 class="text-h5 text-pink font-weight-bold">🎁 ตั๋วตามใจ 1 วัน! 🎁</h2>
          <p class="mt-2 text-grey-darken-1">
            ตามใจแฟนหนึ่งวันเต็มๆ เลยนะ จะไปช้อปปิ้ง ดูหนัง กินข้าว หรือทำอะไรก็ได้ที่อยากทำ! <br>
            ขอให้วันนี้เป็นวันที่มีความสุขมากๆนะ รักที่สุดเลย ❤️ <br> (อย่าลืมใช้ตั๋วนี้นะ!)
          </p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="pink" variant="flat" @click="dialog = false">แบร่~~</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      icon
      color="white"
      variant="text"
      class="position-absolute top-0 right-0 ma-4 z-index-top"
      @click="toggleMusic"
    >
      <v-icon>{{ isPlaying ? 'mdi-music' : 'mdi-music-off' }}</v-icon>
    </v-btn>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// --- State ---
const dialog = ref(false)
const isPlaying = ref(false)
const revealedCount = ref(0) // นับจำนวนลูกโป่งที่แตก
const balloons = ref([])

// --- รูปใน Carousel (เปลี่ยน URL รูปตรงนี้) ---
const slides = [
  { src: 'img/11.jpg' }, // เปลี่ยนเป็นรูปคู่ของคุณ
  { src: 'img/22.jpg' },
  { src: 'img/33.jpg' },
]

// --- Logic สร้างลูกโป่ง ---
const colors = ['red-lighten-2', 'pink-lighten-3', 'purple-lighten-3', 'blue-lighten-3', 'teal-lighten-3', 'amber-lighten-3']

const initBalloons = () => {
  // สร้างลูกโป่ง 30 ลูก กระจายตำแหน่ง
  for (let i = 0; i < 30; i++) {
    balloons.value.push({
      top: Math.random() * 90,     // ตำแหน่งแนวตั้ง 0-90%
      left: Math.random() * 90,    // ตำแหน่งแนวนอน 0-90%
      size: Math.random() * 60 + 80, // ขนาด 80-140px
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2, // ความเร็วลอย
      popped: false,
      showPop: false
    })
  }
}

// --- Logic เจาะลูกโป่ง ---
const popBalloon = (index) => {
  if (balloons.value[index].popped) return
  
  // สั่งให้แตก
  balloons.value[index].popped = true
  balloons.value[index].showPop = true
  revealedCount.value++

  // ซ่อน effect แตกหลังจาก 0.5 วิ
  setTimeout(() => {
    balloons.value[index].showPop = false
  }, 500)
}

// คำนวณ % ความคืบหน้า
const progress = computed(() => {
  return (revealedCount.value / balloons.value.length) * 100
})

// --- เพลง (Optional) ---
// Browser สมัยใหม่ห้าม Auto-play ต้องให้ user กดก่อน
const toggleMusic = () => {
  isPlaying.value = !isPlaying.value
  // ตรงนี้คุณสามารถใส่ new Audio('file.mp3').play() ได้ถ้ามีไฟล์เพลง
}

onMounted(() => {
  initBalloons()
})
</script>

<style scoped>
/* พื้นหลัง Gradient หวานๆ */
.birthday-bg {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  /* หรือถ้าชอบสีสัน: background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%); */
  background: radial-gradient(circle at center, #ffe6fa, #e3f2fd);
}

.z-index-1 { z-index: 1; }
.z-index-top { z-index: 100; }

/* การ์ดแบบกระจกฝ้า */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Animation ลูกโป่งลอย */
/* แก้ไขตรงนี้ครับ */
.balloon-item {
  position: absolute;
  z-index: 2000; /* <--- เพิ่มบรรทัดนี้ครับ (เพื่อให้ลูกโป่งอยู่บนสุดเสมอ) */
  transition: transform 0.2s;
  animation: floatBalloon 3s ease-in-out infinite alternate;
  cursor: pointer; /* เพิ่มเพื่อให้เมาส์เปลี่ยนรูปเป็นมือนิ้วชี้ */
}

.balloon-item:hover {
  transform: scale(1.1);
}

@keyframes floatBalloon {
  from { transform: translateY(0); }
  to { transform: translateY(-20px); }
}

/* Animation ตอนแตก */
.pop-effect {
  position: absolute;
  animation: popScale 0.3s ease-out forwards;
}

@keyframes popScale {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Animation ปุ่มเด้ง */
.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 64, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0); }
}

/* Text Shadow */
.drop-shadow {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.animate-shake {
  animation: shake 2s infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
.balloon-wrapper {
  position: absolute;
  /* จัดการให้ Animation อยู่ที่ตัว Wrapper แทน */
  animation: floatBalloon 3s ease-in-out infinite alternate; 
  cursor: pointer;
}

/* ลบ animation ออกจาก .balloon-item ตัวเดิม เพื่อไม่ให้ซ้อนกัน */
.balloon-item {
  /* เหลือแค่ transition ไว้ */
  transition: transform 0.1s; 
}

.balloon-item:active {
  transform: scale(0.9); /* กดแล้วยุบนิดนึงให้รู้ว่ากดโดน */
}
</style>