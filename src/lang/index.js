import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import zhLocale from './zh'
import enLocale from './en'
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'
import elementEnLocale from 'element-ui/lib/locale/lang/en'

Vue.use(VueI18n)

const messages = {
  'zh': {
    ...zhLocale,
    ...elementZhLocale
  },
  'en': {
    ...enLocale,
    ...elementEnLocale
  }
}

export function getLanguage() {
  const cookieLang = Cookies.get('language')
  if (cookieLang) {
    return cookieLang
  }
  const language = navigator.language.substr(0, 2)
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'en'
}

const i18n = new VueI18n({
  locale: getLanguage(),
  messages: messages
})

export default i18n
