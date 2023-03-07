<template>
  <header class="Header">
    <div class="Header_Inner">
      <NuxtLink to="/" class="Title">
        <span
          v-if="icon && icon.type === 'emoji' && icon.value"
          class="Title_Icon"
          >{{ icon.value }}
        </span>
        <span
          v-else-if="icon && icon.type === 'image' && icon.value"
          class="Title_Icon"
        >
          <img :src="icon.value" />
        </span>
        <div class="Title_Text">{{ title }}</div>
      </NuxtLink>
      <div class="Link text-nowrap">
        <a v-for="link in links" :key="link._id" :href="link.href">{{ link.text }}</a>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    app: {
      type: Object,
      default: null,
    },
    links: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    title() {
      return (this.app && (this.app.name || this.app.uid)) || 'Landing page'
    },
    icon() {
      return (this.app && this.app.icon) || { type: 'emoji', value: '🛬' }
    },
  },
}
</script>

<style scoped>
.Header {
  background: #fff;
  padding: 9px 24px 9px 14px;
  position: sticky;
  top: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 10;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
.Header_Inner {
  min-width: 0;
  display: flex;
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  position: relative;
}
@media (min-width: 600px) {
  .Header {
    padding: 9px 40px;
  }
}
.Title {
  display: flex;
  margin: 0 auto 0 0;
  align-items: center;
  min-width: 0;
  color: #333;
  text-decoration: none;
}
.Title_Icon {
  width: 20px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  margin: 0 10px -2px 0;
}
.Title_Icon img {
  width: 26px;
  height: 26px;
  object-fit: cover;
  font-family: 'object-fit: cover'; /* IE11 */
  border-radius: 4px;
}
.Title_Button {
  width: 34px;
  height: 34px;
  margin: 0 6px 0 0;
  transition: background 0.2s;
  border-radius: 4px;
  position: relative;
  background: none;
  flex-shrink: 0;
}
.Title_Button:hover {
  background: #f0f0f0;
}
.Title_Button:active {
  background: none;
  transition: none;
}
.Title_Button > svg {
  position: absolute;
  left: 13px;
  top: 11px;
}
.Title_Text {
  margin: 0;
  padding: 0;
  font-size: 1.6rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.Link > a {
  color: #888;
  text-decoration: none;
  transition: color 0.2s;
  padding: 3px 12px;
}
.Link > a:hover {
  color: #333;
}
</style>
