<template>
  <section class="Feature2">
    <div class="Feature2_Inner">
      <div class="Feature2_Data">
        <h3
          v-if="data.titleCopy"
          class="Feature2_Title"
          v-html="data.titleCopy"
        ></h3>
        <p v-if="data.text" class="Feature2_Text" v-html="data.text"></p>
      </div>
      <div v-if="data.image && data.image.src" class="Feature2_Image">
        <img :src="data.image.src" width="407" height="248" alt="" />
      </div>
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
          text: '',
          image: null,
        }
      },
    },
  },
}
</script>

<style scoped>
.Feature2 {
  margin: 0 auto 60px auto;
  padding: 0 24px;
  max-width: 1024px;
}
.Feature2_Inner {
  display: flex;
  flex-direction: column;
}
.Feature2_Title {
  font-size: 1.8rem;
  line-height: 1.6;
  margin: 0 0 8px 0;
  padding: 0;
  text-align: center;
}
.Feature2_Text {
  font-size: 1.4rem;
  color: #888;
  text-align: center;
  margin: 0 0 20px 0;
}
.Feature2_Image {
  width: 80%;
  margin: 0 auto;
}
.Feature2_Image > img {
  width: 100%;
  height: auto;
  display: block;
}
@media (min-width: 600px) {
  .Feature2 {
    margin: 0 auto 100px auto;
    padding: 0 40px;
  }
  .Feature2_Inner {
    flex-direction: row;
    align-items: center;
    align-items: center;
  }
  .Feature2_Image {
    width: 52%;
  }
  .Feature2_Data {
    padding: 0 48px 0 0;
    width: 48%;
  }
  .Feature2_Title {
    font-size: 2rem;
    text-align: left;
  }
  .Feature2_Text {
    font-size: 1.6rem;
    text-align: left;
    margin: 0;
  }
}
@media (min-width: 960px) {
  .Feature2_Inner {
    padding: 0 60px;
  }
}
</style>
