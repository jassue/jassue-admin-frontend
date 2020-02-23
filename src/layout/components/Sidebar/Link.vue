<template>
  <a v-if="isExternalLink(to)" :href="to" target="_blank" rel="noopener">
    <slot />
  </a>
  <a v-else @click.prevent="clickLink">
    <slot />
  </a>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    isExternalLink(routePath) {
      return isExternal(routePath)
    },
    clickLink() {
      const url = this.to
      if (this.$route.path === url) {
        // this.$router.push({ url, query: { t: new Date().getTime() }})
        this.$router.replace({
          path: '/redirect' + url
        })
      } else {
        this.$router.push(url)
      }
    }
  }
}
</script>
