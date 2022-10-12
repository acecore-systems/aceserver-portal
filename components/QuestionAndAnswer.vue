<template>
  <dl class="Faq_Item">
    <dt @click="isOpen = !isOpen">
      <em>Q.</em>
      <span>{{ item.question }}</span>
      <svg
        v-if="isOpen"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="#333333"
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="#333333"
      >
        <path d="M24 24H0V0h24v24z" fill="none" opacity=".87" />
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" />
      </svg>
    </dt>
    <dd v-if="isOpen">
      <em>A.</em>
      <span>{{ item.answer }}</span>
    </dd>
  </dl>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default() {
        return {
          question: '',
          answer: '',
        }
      },
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },
}
</script>

<style scoped>
.Faq_Item {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  margin: 0 0 16px 0;
  padding: 0;
  overflow: hidden;
}
.Faq_Item > dt {
  margin: 0;
  padding: 16px 20px;
  display: flex;
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1.4;
}
.Faq_Item > dt > em {
  width: 30px;
  font-style: normal;
  font-size: 2rem;
  flex-shrink: 0;
  font-weight: normal;
}
.Faq_Item > dt > span {
  margin: 4px 16px 0 0;
}
.Faq_Item > dt > svg {
  margin: 0 0 0 auto;
  flex-shrink: 0;
}
.Faq_Item > dd {
  margin: 0;
  padding: 8px 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  background: #f8f8f8;
}
.Faq_Item > dd > em {
  width: 30px;
  font-style: normal;
  font-size: 2rem;
  flex-shrink: 0;
}
.Faq_Item > dd > span {
  margin: 6px 0;
}
@media (min-width: 600px) {
  .Faq_Item > dt {
    font-size: 1.6rem;
    padding: 24px 28px;
  }
  .Faq_Item > dd {
    padding: 16px 28px;
  }
}
</style>
