<template>
  <section class="Feature3">
    <div class="Feature3_Inner">
      <div v-if="data.image && data.image.src" class="Feature3_Image">
        <img
          :src="data.image.src"
          width="407"
          height="248"
          alt=""
          class="Feature3_Image"
        />
      </div>
      <div class="Feature3_Data">
        <h3
          v-if="data.titleCopy"
          class="Feature3_Title"
          v-html="data.titleCopy"
        ></h3>
        <p v-if="data.text" class="Feature3_Text" v-html="data.text"></p>
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
.Feature3 {
  margin: 0 auto 60px auto;
  padding: 0 24px;
  max-width: 1024px;
}
.Feature3_Inner {
  display: flex;
  flex-direction: column;
}
.Feature3_Image {
  width: 80%;
  order: 2;
  margin: 0 auto;
}
.Feature3_Image > img {
  width: 100%;
  height: auto;
  display: block;
}
.Feature3_Data {
  order: 1;
}
.Feature3_Title {
  font-size: 1.8rem;
  line-height: 1.6;
  margin: 0 0 8px 0;
  padding: 0;
  text-align: center;
}
.Feature3_Text {
  font-size: 1.4rem;
  margin: 0 0 20px 0;
  text-align: center;
  color: #888;
}
@media (min-width: 600px) {
  .Feature3 {
    margin: 0 auto 100px auto;
    padding: 0 40px;
  }
  .Feature3_Inner {
    flex-direction: row;
    align-items: center;
  }
  .Feature3_Image {
    order: 1;
    width: 52%;
  }
  .Feature3_Data {
    order: 2;
    padding: 0 0 0 48px;
    width: 48%;
  }
  .Feature3_Title {
    font-size: 2rem;
    text-align: left;
  }
  .Feature3_Text {
    font-size: 1.6rem;
    text-align: left;
    margin: 0;
  }
}
@media (min-width: 960px) {
  .Feature3_Inner {
    padding: 0 60px;
  }
}
</style>
