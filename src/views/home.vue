<template>
  <div>
    <SignArea ref="signArea" />
    <el-button @click="handleShowSign">签字</el-button>
  </div>
</template>

<script>
import SignArea from "@/components/SignArea";
export default {
  components: { SignArea },
  methods: {
    handleShowSign() {
      this.$refs.signArea.open({ name: "张三" });
    },
  },
};
</script>

<style></style>
