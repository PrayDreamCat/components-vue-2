<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    title=""
    width="1060px"
    append-to-body
    @open="handleOpen"
    top="90px"
  >
    <div class="box-sign-area">
      <el-row type="flex" justify="end" style="margin-bottom: 30px">
        <img
          src="./close.png"
          style="width: 24px; height: 24px"
          @click="handleClose"
        />
      </el-row>
      <div
        class="box-canvas"
        :style="{ width: width + 'px', height: height + 'px' }"
      >
        <canvas
          ref="canvas"
          id="canvas"
          width="1000"
          height="500"
          @mousedown="handleStart"
          @mousemove="handleMove"
          @mouseup="handleEnd"
          @mouseleave="isStart = false"
        />
        <div class="name" v-if="name && name.length <= 6">{{ name }}</div>
      </div>
      <el-row type="flex" justify="space-between" style="margin-top: 30px">
        <el-button type="primary" class="btn-clear" @click="handleClear">
          重签
        </el-button>
        <el-button
          type="primary"
          @click="handleSave"
          :loading="loading"
          :disabled="loading"
          class="btn-finish"
        >
          完成
        </el-button>
      </el-row>
      <canvas
        ref="canvasHide"
        id="canvasHide"
        width="750"
        height="750"
        style="
          position: fixed;
          right: 100vw;
          bottom: 0;
          background-color: #ebebeb;
          z-index: -1;
        "
      />
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      visible: false,
      name: undefined,
      width: 0,
      height: 0,
      isStart: false,
      canvas: undefined,
      canvasHide: undefined,
      ctx: undefined,
      ctxHide: undefined,
      x: 0,
      y: 0,
      timeout: undefined,
      isSigned: false,
    };
  },
  methods: {
    open({ name }) {
      this.name = name;
      this.visible = true;
    },
    handleClose() {
      this.handleClear();
      this.visible = false;
    },
    handleOpen() {
      this.$nextTick(() => {
        this.width = this.$refs.canvas.clientWidth;
        this.height = this.$refs.canvas.clientHeight;
        const canvas = this.$refs.canvas;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 10;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";

        const canvasHide = this.$refs.canvasHide;
        this.canvasHide = canvasHide;
        this.ctxHide = canvasHide.getContext("2d");
      });
    },
    handleStart(e) {
      this.isStart = true;
      this.x = e.offsetX;
      this.y = e.offsetY;
      this.isSigned = true;
    },
    handleMove(e) {
      if (!this.isStart) return;
      this.drawLine(this.x, this.y, e.offsetX, e.offsetY);
      this.x = e.offsetX;
      this.y = e.offsetY;
    },
    handleEnd() {
      this.isStart = false;
    },
    drawLine(startX, startY, endX, endY) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    },
    handleClear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctxHide.clearRect(
        0,
        0,
        this.$refs.canvasHide.clientWidth,
        this.$refs.canvasHide.clientWidth
      );
      this.isSigned = false;
    },
    handleSave() {
      if (!this.isSigned) {
        return this.$message.warning("请签字");
      }
      this.loading = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        const base64 = this.canvas.toDataURL();
        const img = document.createElement("img");
        const that = this;

        img.src = base64;
        img.onload = function () {
          const imgWidth = 750;
          const imgHeight = (imgWidth * this.height) / this.width;
          that.ctxHide.drawImage(
            img,
            imgWidth * 0.2,
            (imgWidth - imgHeight * 0.6) / 2,
            imgWidth * 0.6,
            imgHeight * 0.6
          );
          // const base64_new = that.canvasHide.toDataURL();
          // const index = base64_new.indexOf(",");
          // signMultiDocument({
          //   sysUserId: that.user.userId,
          //   identityCards: that.user.idCard,
          //   representativeName: that.name,
          //   picFile: base64_new.slice(index + 1),
          // })
          //   .then(() => {
          //     that.$message.success("签名成功");
          //     that.loading = false;
          //     this.isSigned = false;
          //     that.handleClear();
          //     that.visible = false;
          //     that.$emit("success");
          //   })
          //   .catch(() => {
          //     that.loading = false;
          //   });
        };
      }, 200);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  display: none;
}
:deep(.el-dialog__body) {
  padding: 0;
}
.box-sign-area {
  padding: 30px;
}
.btn-clear,
.btn-finish {
  width: 208px;
  height: 64px;
  border-radius: 4px;
  font-family: HarmonyOS Sans SC;
  font-weight: 400;
  font-size: 24px;
  color: #ffffff;
  border: none;
}
.btn-clear {
  background: #b5bece;
}
.btn-finish {
  background: #458bff;
}
.box-canvas {
  background: rgba($color: #000000, $alpha: 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
  .name {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 200px;
    width: 100%;
    text-align: center;
    letter-spacing: 20px;
    color: rgba($color: #dde4ee, $alpha: 0.6);
    z-index: -1;
    font-family: HarmonyOS Sans SC;
    font-weight: 400;
  }
}
#canvas {
  background-color: transparent;
  z-index: 99;
}
</style>
