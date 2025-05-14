<template>
  <NavBar />
  <div class="container">
    <FileUpload @add:files="addFiles" @update:file="updateFile" />
    <FileList :fileList="fileList" @delete:file="deleteFile" />
    <ConvertOptions :fileList="fileList" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "@/components/NavBar.vue";
import FileUpload from "@/components/FileUpload.vue";
import FileList from "@/components/FileList.vue";
import ConvertOptions from "@/components/ConvertOptions.vue";

// 响应式文件列表
const fileList = ref([]);

// 添加文件
function addFiles(files) {
  fileList.value.push(...files);
}

// 更新文件
function updateFile(file) {
  const index = fileList.value.findIndex(f => f.name === file.name);
  if (index !== -1) {
    fileList.value[index] = { ...file };
  }
}
//  删除文件
function deleteFile(file) {
  const index = fileList.value.findIndex(f => f.name === file.name);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
