<template>
  <iframe
    :src="data.sorce"
    class="w-100"
    style="height: calc(100vh - 50px);z-index: 1;border: 0px;margin-top: 50px;"
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
