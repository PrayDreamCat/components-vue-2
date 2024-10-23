<template>
  <el-dialog
    class="dialog-preview-zip"
    :visible.sync="visible"
    title="查看"
    width="70%"
    destroy-on-close
    :before-close="handleBeforeCloseDialog"
    @close="handleDialogClosed"
  >
    <div v-loading="loading" style="height: 620px">
      <div class="box-tabs">
        <div
          v-for="(item, index) in files"
          :key="'file-tab' + index"
          :class="{ active: currentIndex === index }"
          @click="handleSwitchFile(index, item.type)"
        >
          {{ item.name }}
        </div>
      </div>
      <div v-loading="fileLoading">
        <iframe
          v-if="pdfPath"
          :src="pdfPath"
          style="width: 100%; height: 600px"
        />
        <div v-if="excelSheetNames.length > 0">
          <div class="box-excel-sheets">
            <div
              v-for="(item, index) in excelSheetNames"
              :key="'sheet' + index"
              :class="{ active: currentSheet === index }"
              @click="handleSwitchExcelSheet(index)"
            >
              {{ item }}
            </div>
          </div>
          <div
            class="box-excel"
            style="width: 100%; height: 550px; overflow: auto"
            v-html="excelInfo"
          />
        </div>
        <video
          v-if="videoPath"
          :src="videoPath"
          controls
          style="width: 100%; height: 600px"
        />
        <div
          v-if="showDoc"
          ref="docPreview"
          style="width: 100%; height: 600px; overflow: auto"
        />
        <img
          v-if="imgPath"
          :src="imgPath"
          style="width: 100%; height: 600px; object-fit: contain"
        />
        <div
          v-if="audioPath"
          style="width: 100%; height: 600px"
          class="box-audio"
        >
          <audio
            ref="audioRef"
            controls
            class="audio"
            hidden="true"
            @ended="handleAudioEnded"
          >
            <source :src="audioPath" />
          </audio>
          <div class="audio-control" @click="handlePlayAudio">
            <img
              v-if="isAudioPlay"
              src="../../../../assets/file/audio_pause.png"
            />
            <img v-else src="../../../../assets/file/audio_play.png" />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import JSZip from "jszip";
import * as XLSX from "xlsx/xlsx.mjs";
import { renderAsync } from "docx-preview";

export default {
  data() {
    return {
      visible: false,
      loading: false,
      fileLoading: false,
      excelInfo: null,
      pdfPath: null,
      videoPath: null,
      showDoc: false,
      imgPath: null,
      audioPath: null,
      files: [],
      excelSheetNames: [],
      currentIndex: 0,
      isAudioPlay: false,
      currentSheet: 0,
      excelWorkBook: null,
    };
  },
  methods: {
    // 解压缩文件
    unzip(zipPath) {
      return new Promise((resolve, reject) => {
        const zip = new JSZip();
        fetch(zipPath)
          .then((response) => {
            if (response.status === 200 || response.status === 0) {
              return Promise.resolve(response.blob());
            } else {
              return Promise.reject("获取压缩包失败");
            }
          })
          .then((data) => zip.loadAsync(data))
          .then((res) => {
            const results = [];
            res.forEach(async (path, file) => {
              const index = file.name.lastIndexOf("/");
              const index2 = file.name.lastIndexOf(".");
              const name = file.name.slice(index + 1);
              const type = file.name.slice(index2 + 1).toLocaleLowerCase();
              results.push({
                name: name,
                type: type,
                file: file,
              });
            });
            resolve(results);
          })
          .catch((res) => {
            reject(typeof res === "string" ? res : "解压缩失败");
          });
      });
    },
    async loadFile(file) {
      this.fileLoading = true;
      try {
        if (file.type === "pdf") {
          const blob = new Blob([await file.file.async("blob")], {
            type: "application/pdf",
          });

          this.pdfPath = window.URL.createObjectURL(blob);
        } else if (file.type === "xlsx" || file.type === "xls") {
          var fr = new FileReader();
          fr.readAsArrayBuffer(await file.file.async("blob"));
          fr.addEventListener(
            "loadend",
            (e) => {
              var buf = e.target.result; // 读取完毕后的buffer数组
              const workbook = XLSX.read(buf, { type: "array" });
              this.excelSheetNames = workbook.SheetNames;
              this.excelWorkBook = workbook;
              // 假设我们只读取第一个工作表
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const htmlData = XLSX.utils.sheet_to_html(worksheet);

              this.excelInfo = htmlData; // 渲染
            },
            false
          );
        } else if (file.type === "mp4") {
          const blob = new Blob([await file.file.async("blob")], {
            type: "video/mpeg4",
          });

          this.videoPath = window.URL.createObjectURL(blob);
        } else if (file.type === "doc" || file.type === "docx") {
          this.showDoc = true;
          const data = await file.file.async("blob");
          this.$nextTick(() => {
            renderAsync(data, this.$refs.docPreview);
          });
        } else if (["jpg", "jpeg", "png", "gif"].includes(file.type)) {
          const type = file.type === "jpg" ? "jpeg" : file.type;
          const blob = new Blob([await file.file.async("blob")], {
            type: "image/" + type,
          });

          this.imgPath = window.URL.createObjectURL(blob);
        } else if (file.type === "mp3") {
          const blob = new Blob([await file.file.async("blob")], {
            type: "audio/mpeg",
          });

          this.audioPath = window.URL.createObjectURL(blob);
        }
        this.fileLoading = false;
      } catch (error) {
        this.fileLoading = false;
      }
    },
    handleSwitchFile(index, type) {
      if (this.currentIndex === index) return;
      if (!["xlsx", "xls", "pdf", "doc", "docx", "mp3", "mp4"].includes(type)) {
        return this.$message.error("该文件无法预览，请下载查看");
      }
      this.currentIndex = index;
      this.pdfPath = null;
      this.excelInfo = null;
      this.videoPath = null;
      this.showDoc = false;
      this.imgPath = null;
      this.audioPath = null;
      this.isAudioPlay = false;
      this.currentSheet = 0;
      this.excelSheetNames = [];
      this.loadFile(this.files[index]);
    },
    handleSwitchExcelSheet(index) {
      try {
        if (this.currentSheet === index) return;
        this.currentSheet = index;
        const worksheet =
          this.excelWorkBook.Sheets[this.excelSheetNames[index]];
        const htmlData = XLSX.utils.sheet_to_html(worksheet);
        this.excelInfo = htmlData; // 渲染
      } catch (error) {
        this.excelInfo = null;
      }
    },
    handleAudioEnded() {
      this.isAudioPlay = false;
    },
    handlePlayAudio() {
      if (this.isAudioPlay) {
        this.$refs.audioRef.pause();
        this.isAudioPlay = false;
      } else {
        this.$refs.audioRef.play();
        this.isAudioPlay = true;
      }
    },
    handleBeforeCloseDialog(done) {
      if (this.loading) {
        this.$message.error("请等待解压完成");
      } else {
        done();
      }
    },
    handleDialogClosed() {
      this.currentIndex = 0;
      this.pdfPath = null;
      this.excelInfo = null;
      this.videoPath = null;
      this.showDoc = false;
      this.imgPath = null;
      this.audioPath = null;
      this.isAudioPlay = false;
      this.currentSheet = 0;
      this.files = [];
      this.excelSheetNames = [];
    },
    init(zipPath) {
      this.loading = true;
      this.visible = true;
      this.unzip(zipPath)
        .then((res) => {
          console.log("解压成功", res);
          this.loading = false;
          this.files = res
            .filter((item) => item.type === "pdf")
            .concat(res.filter((item) => item.type !== "pdf"));
          if (this.files.length > 0) {
            this.loadFile(this.files[0]);
          }
        })
        .catch((res) => {
          this.loading = false;
          this.$message.error(typeof res === "string" ? res : "解压缩失败");
        });
    },
    previewSingleFile(filePath, fileType) {
      this.fileLoading = true;
      this.visible = true;
      fetch(filePath)
        .then((res) => res.blob())
        .then((blob) => {
          if (fileType === "pdf") {
            this.pdfPath = window.URL.createObjectURL(blob);
          } else if (["xlsx", "xls"].includes(fileType)) {
            var fr = new FileReader();
            fr.readAsArrayBuffer(blob);
            fr.addEventListener(
              "loadend",
              (e) => {
                var buf = e.target.result; // 读取完毕后的buffer数组
                const workbook = XLSX.read(buf, { type: "array" });
                this.excelSheetNames = workbook.SheetNames;
                this.excelWorkBook = workbook;
                // 假设我们只读取第一个工作表
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const htmlData = XLSX.utils.sheet_to_html(worksheet);

                this.excelInfo = htmlData; // 渲染
              },
              false
            );
          } else if (["doc", "docx"].includes(fileType)) {
            this.showDoc = true;
            this.$nextTick(() => {
              renderAsync(blob, this.$refs.docPreview);
            });
          }
          this.fileLoading = false;
        })
        .catch(() => {
          this.fileLoading = false;
        });
    },
  },
};
</script>
<style lang="scss">
.dialog-preview-zip {
  table {
    border-collapse: collapse;
  }
  tr,
  td {
    padding: 10px;
    border: 1px solid #b8b6b6;
  }
}
</style>
<style lang="scss" scoped>
.box-tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid #ebebeb;
  div {
    padding: 10px 30px;
    font-weight: bold;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
  }
  .active {
    color: rgb(80, 162, 233);
  }
}
.audio-control {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    width: 150px;
    height: 150px;
  }
}
.box-excel-sheets {
  display: flex;
  align-items: center;
  height: 50px;
  width: 100%;
  overflow-x: auto;

  div {
    height: 30px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #747272;
    cursor: pointer;
    font-weight: bold;
    &:nth-child(n + 1) {
      border-right: none;
    }
    &:first-child {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
    &:last-child {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
      border-right: 1px solid #747272;
    }
  }
  .active {
    color: #36d33e;
  }
}
</style>
