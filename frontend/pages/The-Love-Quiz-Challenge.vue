<template>
  <v-container class="fill-height bg-indigo-lighten-5 d-flex justify-center align-center" fluid>

    <v-card 
      width="100%" 
      max-width="500" 
      class="rounded-xl overflow-hidden elevation-10"
    >
      <v-progress-linear
        :model-value="(currentQuestion + 1) / questions.length * 100"
        color="pink-accent-3"
        height="12"
        striped
      ></v-progress-linear>

      <v-card-text class="pa-6 text-center" style="min-height: 400px;">
        
        <v-window v-model="step">
          
          <v-window-item :value="0">
            <div class="py-8">
              <v-avatar color="indigo-lighten-4" size="120" class="mb-6 elevation-3">
                <v-icon icon="mdi-head-heart" size="70" color="indigo-darken-2"></v-icon>
              </v-avatar>
              <h2 class="text-h4 font-weight-black text-indigo-darken-3 mb-2">แฟนพันธุ์แท้!</h2>
              <p class="text-body-1 text-grey-darken-1 px-4">
                มั่นใจแค่ไหนว่ารู้ใจเค้า? <br>
                ตอบถูกให้หมด ถ้าตอบผิด... <br>
                เตรียมโดนงอนได้เลย! 😤
              </p>
              <v-btn 
                color="indigo-accent-3" 
                size="x-large" 
                rounded="pill" 
                class="mt-8 px-8 font-weight-bold pulse-btn"
                @click="step = 1"
              >
                เริ่มทดสอบ
              </v-btn>
            </div>
          </v-window-item>

          <v-window-item :value="1">
            <div v-if="questions[currentQuestion]" class="py-4">
              
              <v-chip color="pink-lighten-4" text-color="pink-darken-2" class="mb-4 font-weight-bold">
                Question {{ currentQuestion + 1 }} / {{ questions.length }}
              </v-chip>

              <h3 class="text-h5 font-weight-bold text-grey-darken-3 mb-6 px-2" style="line-height: 1.6;">
                {{ questions[currentQuestion].text }}
              </h3>

              <v-row dense>
                <v-col cols="12" v-for="(option, index) in questions[currentQuestion].options" :key="index">
                  <v-btn
                    block
                    size="x-large"
                    variant="outlined"
                    class="mb-3 rounded-lg text-body-1"
                    :color="getBtnColor(index)"
                    :class="{'shake-wrong': answered && selectedIndex === index && !option.correct}"
                    @click="answer(index, option.correct)"
                    :disabled="answered"
                    style="height: auto; min-height: 56px; white-space: normal;"
                  >
                    <v-icon 
                        start 
                        v-if="answered && option.correct" 
                        icon="mdi-check-circle" 
                        color="green"
                    ></v-icon>
                    <v-icon 
                        start 
                        v-if="answered && selectedIndex === index && !option.correct" 
                        icon="mdi-close-circle" 
                        color="red"
                    ></v-icon>
                    
                    {{ option.text }}
                  </v-btn>
                </v-col>
              </v-row>
              
              <v-expand-transition>
                <div v-if="answered" class="mt-4 pa-4 bg-grey-lighten-4 rounded-lg">
                    <p class="font-weight-bold" :class="isCorrect ? 'text-green' : 'text-red'">
                        {{ isCorrect ? 'ถูกต้องนะคร้าบ! 🎉' : 'ผิดได้ไงเนี่ย! 😭' }}
                    </p>
                    <p class="text-caption text-grey-darken-1 mt-1">
                        {{ questions[currentQuestion].explanation }}
                    </p>
                    <v-btn class="mt-2" color="indigo" variant="flat" @click="nextQuestion">
                        {{ currentQuestion < questions.length - 1 ? 'ข้อต่อไป' : 'ดูคะแนน' }}
                    </v-btn>
                </div>
              </v-expand-transition>

            </div>
          </v-window-item>

          <v-window-item :value="2">
            <div class="py-8">
              <v-icon 
                :icon="score > questions.length / 2 ? 'mdi-trophy' : 'mdi-emoticon-cry'" 
                size="100" 
                :color="score > questions.length / 2 ? 'amber' : 'grey'"
                class="mb-4"
              ></v-icon>
              
              <h2 class="text-h4 font-weight-black mb-2">
                คะแนน: {{ score }} / {{ questions.length }}
              </h2>
              
              <p class="text-h6 font-weight-bold text-pink my-4">
                {{ resultMessage }}
              </p>

              <v-btn color="indigo" variant="tonal" rounded="pill" @click="restart" class="mt-4">
                ขอแก้ตัวใหม่
              </v-btn>
            </div>
          </v-window-item>

        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- State ---
const step = ref(0)
const currentQuestion = ref(0)
const answered = ref(false)
const selectedIndex = ref(null)
const isCorrect = ref(false)
const score = ref(0)

// --- ข้อมูลคำถาม (แก้ตรงนี้เลย!) ---
// text: คำถาม
// options: ตัวเลือก (ต้องมี 1 ข้อที่ correct: true)
// explanation: ข้อความแซวตอนเฉลย
const questions = [
  {
    text: "เดทแรกของเรา เราไปกินอะไรกัน?",
    options: [
      { text: "ชาบู ชาบู", correct: false },
      { text: "ร้านอาหารญี่ปุ่น", correct: true }, // แก้เป็นความจริง
      { text: "ก๋วยเตี๋ยวเรือ", correct: false },
      { text: "ไม่ได้กิน เดินสวนสาธารณะ", correct: false },
    ],
    explanation: "จำไม่ได้เหรอ? เราไปกินซูชิร้านโปรดเธอไง!"
  },
  {
    text: "เวลาเค้างอน วิธีง้อที่ได้ผลที่สุดคือ?",
    options: [
      { text: "จุ๊บๆๆ", correct: true },
      { text: "ห้อมแก้มมม!", correct: false },
      { text: "กอด!", correct: false },
      { text: "ทุกอย่างเลยย", correct: false },
    ],
    explanation: "จริงๆแค่ จุ๊บๆ! ก็หายงอน55555😘"
  },
  {
    text: "วันเกิดเค้าปีล่าสุด เธอให้อะไรเป็นของขวัญ?",
    options: [
      { text: "รองเท้า", correct: false },
      { text: "กระเป๋าตังค์", correct: true },
      { text: "นาฬิกา", correct: false },
      { text: "ไม่ได้ให้ (ลืม!!)", correct: false },
    ],
    explanation: "กระเป๋าตังค์ใบนั้นเค้าใช้อยู่ทุกวันนะ ^^"
  },
  {
    text: "ถ้าเราหลงทาง เธอจะทำยังไง?",
    options: [
      { text: "เปิด Google Maps ทันที", correct: false },
      { text: "บ่นเค้าตลอดทาง", correct: false },
      { text: "เดินมั่วไปเรื่อยๆ", correct: false },
      { text: "โทษ GPS ไว้ก่อน", correct: true }, // ข้อกวนๆ
    ],
    explanation: "GPS พาไปผิดตลอด ไม่ใช่ความผิดเค้าซะหน่อย!"
  },
  {
    text: "บอกรักเค้าหน่อยสิ?",
    options: [
      { text: "รักนะจุ๊บๆ", correct: true },
      { text: "Love You 3000", correct: true },
      { text: "รักที่สุดในโลก", correct: true },
      { text: "รักเท่าฟ้า", correct: true },
    ],
    explanation: "ข้อนี้ตอบอะไรก็ถูกหมดแหละ เขินจัง >///<"
  }
]

// --- Logic ---

const getBtnColor = (index) => {
    if (!answered.value) return 'grey-darken-1' // สีปกติ
    if (questions[currentQuestion.value].options[index].correct) return 'green' // เฉลยข้อถูก
    if (selectedIndex.value === index) return 'red' // ข้อที่เราตอบผิด
    return 'grey-lighten-1' // ข้ออื่นๆ จางลง
}

const answer = (index, correct) => {
    if(answered.value) return
    
    selectedIndex.value = index
    answered.value = true
    isCorrect.value = correct
    
    if (correct) score.value++
}

const nextQuestion = () => {
    if (currentQuestion.value < questions.length - 1) {
        currentQuestion.value++
        answered.value = false
        selectedIndex.value = null
        isCorrect.value = false
    } else {
        step.value = 2 // ไปหน้า Result
    }
}

const restart = () => {
    score.value = 0
    currentQuestion.value = 0
    answered.value = false
    selectedIndex.value = null
    step.value = 0
}

// ข้อความตามคะแนน
const resultMessage = computed(() => {
    const percentage = (score.value / questions.length) * 100
    if (percentage === 100) return "สุดยอด! นี่แหละแฟนตัวจริง ❤️"
    if (percentage >= 80) return "เก่งมาก! จำได้เกือบหมดเลย 🥰"
    if (percentage >= 50) return "ก็พอใช้ได้... แต่ต้องใส่ใจกว่านี้นะ 🤔"
    return "แย่แล้ว! จำอะไรไม่ได้เลย เตรียมโดนลงโทษ! 🔨"
})
</script>

<style scoped>
/* Animation ปุ่มสั่นตอนตอบผิด */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

.shake-wrong {
  animation: shake 0.4s ease-in-out;
  border-color: red !important;
  color: red !important;
}

.pulse-btn {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(63, 81, 181, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(63, 81, 181, 0); }
  100% { box-shadow: 0 0 0 0 rgba(63, 81, 181, 0); }
}
</style>