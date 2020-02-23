<template>
  <div id="tags-view-container" class="tags-view-container">
    <router-link
      v-for="tag in visitedViews"
      ref="tag"
      :key="tag.path"
      :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
      class="tag-item"
    >
      <el-tag
        v-if="tag.path === $route.path"
        size="small"
        effect="dark"
        closable
        type="success"
        @close.prevent="closeTag(tag)"
      >
        {{ generateTitle(tag.title) }}
      </el-tag>
      <el-tag
        v-else
        size="small"
        effect="plain"
        closable
        type="info"
        @close.prevent="closeTag(tag)"
      >
        {{ generateTitle(tag.title) }}
      </el-tag>
    </router-link>
  </div>
</template>

<script>
import path from 'path'
import { mapGetters } from 'vuex'

export default {
  name: 'TagsView',
  data() {
    return {
      affixTags: []
    }
  },
  computed: {
    routes() {
      return this.$store.getters.permission_routes
    },
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    ...mapGetters([
      'addRoutes'
    ])
  },
  watch: {
    $route() {
      this.addTag()
    }
  },
  mounted() {
    // this.initTags()
    this.addTag()
  },
  methods: {
    addTag() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    generateTitle(title) {
      return this.$t('route.' + title)
    },
    closeTag(view) {
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.$route.path === view.path) {
          this.toLastView(visitedViews)
        }
      })
    },
    toLastView(visitedViews) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else if (this.$route.path !== '/dashboard') {
        this.$router.replace({
          path: '/redirect' + this.addRoutes[2].redirect || this.addRoutes[2].path
        })
      } else {
        this.$router.replace({ path: '/redirect/dashboard' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .tags-view-container {
    height: 34px;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #d8dce5;
    padding: 0 10px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
    .tag-item {
      line-height: 30px;
      display: inline-block;
      +.tag-item {
        margin-left: 5px;
      }
      .el-tag--info {
        color: #303133;
      }
      .el-tag--dark.el-tag--success {
        background-color: #42B983;
        border-color: #42B983;
      }
    }
  }
</style>
