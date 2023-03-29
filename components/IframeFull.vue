<template>
  <iframe
    :src="data.sorce"
    class="w-100"
    style="height: calc(100vh - 10vh);position: fixed;z-index: 1;"
  ></iframe>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default() {
        return {
          titleCopy: '',
          text: '',
          image: null,
        }
      },
    },
  },
}
</script>
