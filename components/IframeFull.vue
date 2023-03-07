<template>
  <iframe
    :src="data.sorce"
    class="w-100 h-100"
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
