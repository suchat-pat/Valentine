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
import { fa } from 'vuetify/locale'

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
    text: "ใครเป็นคนเริ่มจีบก่อนนะ จำได้เปล่า?",
    options: [
      { text: "จำไม่ได้อ่าา", correct: false },
      { text: "เค้า (ผช) จีบเธอก่อน", correct: true }, // *แก้ตามความจริง*
      { text: "เธอ (ผญ) แอบชอบเค้าก่อน", correct: false }, 
      { text: "หมอดูบอกให้รักกัน", correct: false },
    ],
    explanation: "เค้าจีบเธอก่อนไง ก็เธอน่ารักขนาดนี้! 😘"
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
    text: "อาหารที่ 'เค้า' ชอบกินที่สุด คือเมนูไหน?",
    options: [
      { text: "ส้มตำปูปลาร้า", correct: false },
      { text: "ชาบู/สุกี้", correct: false },
      { text: "ข้าวกระเพราหมูกรอบ", correct: true }, // *แก้ตามความจริง*
      { text: "อะไรก็ได้ที่เธอทำ", correct: false },
    ],
    explanation: "หมูกรอบคือที่สุด! แต่ฝีมือเธอก็ชอบนะ ^^"
  },
  {
    text: "ถ้าเค้าหลงทาง แกจะทำยังไง?",
    options: [
      { text: "เปิด Google Maps ทันที", correct: false },
      { text: "บ่นเค้าตลอดทาง", correct: false },
      { text: "เดินมั่วไปเรื่อยๆ", correct: false },
      { text: "โทษ GPS ไว้ก่อน", correct: true }, // ข้อกวนๆ
    ],
    explanation: "GPS พาไปผิดตลอด ไม่ใช่ความผิดเค้าซะหน่อย!"
  },
  {
    text: "สีโปรดของ 'เค้า' คือสีอะไร?",
    options: [
      { text: "ขาว", correct: false },
      { text: "แดง", correct: false },
      { text: "ส้ม", correct: false },
      { text: "ดำ", correct: true }, // ข้อกวนๆ
    ],
    explanation: "สีดำเท่ๆ คูลๆ เหมาะกับแฟนเธอที่สุดแล้ว 😎"
  },
  {
    text: "นิสัยเสียของ 'เค้า' ที่เธอต้องบ่นทุกวันคือ?",
    options: [
      { text: "ตดเหม็น", correct: false },
      { text: "ตื่นสาย", correct: true }, // แซวน่ารักๆ
      { text: "ขี้ลืม", correct: false },
      { text: "ติดเกม", correct: false },
    ],
    explanation: "ก็ตัวเธออุ่นนี่นา ขอนอนกอดหน่อยไม่ได้หรอ 🛏️"
  },
  {
    text: "งานอดิเรกที่ชอบมากที่สุด?",
    options: [
      { text: "นอน", correct: true },
      { text: "เล่นเกม", correct: false },
      { text: "ดูหนัง", correct: false },
      { text: "ทำงาน", correct: false }, // ข้อกวนๆ
    ],
    explanation: "การนอนคืองานหลัก การรักเธอคืองานรอง... เอ้ย! กลับกันๆ 😴"
  },
  {
    text: "เรารู้จักกันครั้งแรก ตอนไหน?",
    options: [
      { text: "จำไม่ได้", correct: false },
      { text: "เพื่อนแนะนำให้", correct: false }, 
      { text: "ฉันทักจีบแกก่อนน", correct: true }, 
      { text: "แกทักจีบฉันก่อนน", correct: false },
    ],
    explanation: "นานมากกกแล้ว จำได้โคตรเก่ง!"
  },
  {
    text: "เค้าชอบแอบมองเธอ... ตอนไหนมากที่สุด?",
    options: [
      { text: "ตอนเธอแต่งหน้าสวยๆ", correct: false },
      { text: "ตอนเธอกินข้าวแก้มตุ่ย", correct: false }, 
      { text: "ตอนเธอหลับ", correct: true },// ข้อเอ็นดู
      { text: "ไม่เคยมองเลย", correct: false },
    ],
    explanation: "ก็ตอนกินเธอดูมีความสุขที่สุดนี่นา แก้มป่องน่ารักจะตาย 🥰"
  },
  {
    text: "ถ้าเค้าถูกหวยรางวัลที่ 1 เค้าจะทำอะไรให้เธออย่างแรก?",
    options: [
      { text: "ซื้อบ้านหลังใหญ่ๆ", correct: false },
      { text: "พาไปรอบโลก", correct: false },
      { text: "ขอเธอแต่งงาน 💍", correct: true }, // ข้อหวานปิดท้าย
      { text: "หนีไปบวช", correct: false },
    ],
    explanation: "รอก่อนนะ เดี๋ยวรางวัลที่ 1 มาเมื่อไหร่ เตรียมตัวไว้เลย! 💖"
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
  },

  // --- เพิ่มใหม่ 8-12 (กวนๆ น่ารักๆ) ---
  {
    text: "ถ้าวันนึงตื่นมา แล้วเค้ากลายเป็น 'แมลงสาบ' แกจะทำไง?",
    options: [
      { text: "หยิบรองเท้าตี!", correct: false },
      { text: "กรี๊ดดดดด!", correct: false },
      { text: "เลี้ยงไว้ในขวดโหล", correct: true }, // ข้อวัดใจ
      { text: "ฉีดไบกอนใส่", correct: false },
    ],
    explanation: "ต้องเลี้ยงเค้าสิ! ห้ามตีนะ! 🪳"
  },
  {
    text: "คิดว่าใคร 'คลั่งรัก' มากกว่ากัน?",
    options: [
      { text: "เค้าเอง (Me)", correct: false },
      { text: "แกนั่นแหละ (You)", correct: false }, 
      { text: "พอๆ กัน", correct: true },
      { text: "ไม่มีใครคลั่งรักเลย", correct: false },
    ],
    explanation: "ต้องรักพอๆกันอยู่แล้ววว ดูออกนะ! 🤪"
  },
  {
    text: "ของขวัญวาเลนไทน์ปีนี้ คิดว่าเค้าอยากได้อะไรที่สุด?",
    options: [
      { text: "กระเป๋าโน๊ตบุ๊บใบใหม่", correct: false },
      { text: "คอมเครื่องใหม่สเป็กแรงๆ!", correct: false },
      { text: "แฟนนน 🎀", correct: true }, 
      { text: "เงินกินหนม", correct: false },
    ],
    explanation: "จะเอาแกนี้แหละ จะผูกโบว์ให้ด้วย! 🎁"
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