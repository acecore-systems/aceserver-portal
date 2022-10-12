<template>
  <section class="Feature4">
    <div class="Feature4_Inner">
      <div
        v-for="feature in data.features"
        :key="feature._id"
        class="Feature4_Item"
      >
        <img
          v-if="feature.iconImage && feature.iconImage.src"
          :src="feature.iconImage.src"
          width="41"
          height="41"
          alt=""
          class="Feature4_Icon"
        />
        <div class="Feature4_Data">
          <h3
            v-if="feature.titleCopy"
            class="Feature4_Title"
            v-html="feature.titleCopy"
          ></h3>
          <p
            v-if="feature.text"
            class="Feature4_Text"
            v-html="feature.text"
          ></p>
        </div>
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
          features: [],
        }
      },
    },
  },
}
</script>

<style scoped>
.Feature4 {
  margin: 0 auto 60px auto;
  padding: 0 24px;
  max-width: 1024px;
}
.Feature4_Inner {
}
.Feature4_Item {
  display: flex;
  flex-direction: row;
  margin: 0 0 24px 0;
}
.Feature4_Icon {
  display: block;
  margin: 0 16px 0 0;
}
.Feature4_Title {
  font-size: 1.4rem;
  margin: 0 0 4px 0;
  padding: 0;
  line-height: 1.5;
}
.Feature4_Text {
  font-size: 1.4rem;
  margin: 0;
  padding: 0;
  color: #888;
}
@media (min-width: 600px) {
  .Feature4 {
    margin: 0 auto 100px auto;
    padding: 0 40px;
  }
  .Feature4_Inner {
    margin: 0 0 -40px 0;
    display: flex;
    flex-wrap: wrap;
  }
  .Feature4_Item {
    width: calc(33.333% - 27px);
    margin: 0 40px 40px 0;
    flex-direction: column;
  }
  .Feature4_Item:nth-child(3n) {
    margin: 0 0 40px 0;
  }
  .Feature4_Icon {
    margin: 0 0 20px 0;
  }
  .Feature4_Title {
    font-size: 1.6rem;
    margin: 0 0 16px 0;
  }
}
@media (min-width: 960px) {
  .Feature4_Inner {
    padding: 0 60px;
  }
}
</style>
