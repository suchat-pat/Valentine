// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify,{transformAssetUrls} from "vite-plugin-vuetify";
export default defineNuxtConfig({
  app: {
    head: {
      title: 'สื่อการเรียน รายวิชาคณิตศาสตร์คอมพิวเตอร์',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  build: {
    transpile: ['vuetify']
  },
  vite: {
    plugins: [vuetify({autoImport:true})],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
