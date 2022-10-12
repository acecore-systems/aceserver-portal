<template>
  <section class="Faq">
    <div class="Faq_Inner">
      <h3 v-if="data.titleCopy" class="Faq_Title" v-html="data.titleCopy"></h3>
      <QuestionAndAnswer
        v-for="item in data.items"
        :key="item._id"
        :item="item"
      />
    </div>
  </section>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default() {
        return {
          titleCopy: '',
          items: [],
        }
      },
    },
  },
}
</script>

<style scoped>
.Faq {
  margin: 0 auto 60px auto;
  padding: 0 24px;
  max-width: 1024px;
}
.Faq_Title {
  margin: 0 0 28px 0;
  padding: 0;
  font-size: 2rem;
  line-height: 1.5;
  font-weight: bold;
  text-align: center;
}
@media (min-width: 600px) {
  .Faq {
    margin: 0 auto 100px auto;
    padding: 0 40px;
  }
  .Faq_Title {
    font-size: 2.4rem;
    margin: 0 0 48px 0;
  }
}
@media (min-width: 960px) {
  .Faq_Inner {
    padding: 0 60px;
  }
}
</style>
