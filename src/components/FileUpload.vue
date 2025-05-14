<template>
  <el-upload class="upload-area" drag action="" :before-upload="handleFileSelect" multiple accept=".wis,.las">
    <!-- 只允许选择 .wis 和 .las 文件 -->
    <div class="upload-text">
      <p>拖拽文件到这里，或点击选择文件</p>
    </div>
  </el-upload>
</template>

<script setup>
import { defineEmits } from "vue";
import axios from "@/api/index.js";
import { ElMessage } from "element-plus";

const emit = defineEmits(["add:files", "update:file"]);

// 处理文件选择
function handleFileSelect(file) {
  const newFile = {
    name: file.name,
    size: formatFileSize(file.size),
    status: "上传中",
    progress: 0,
    raw: file,
    filePath: null, // 上传成功后保存的文件路径
  };
  // 立即将文件添加到文件列表中
  emit("add:files", [newFile]);
  uploadFile(newFile); // 自动上传
  return false; // 阻止默认上传
}

// 自动上传函数
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file.raw); // 确保这里的字段名是 "file"

  try {
    const response = await axios.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data" // 明确指定 multipart
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          file.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        }
        emit("update:file", file); // 更新进度
      },
    });

    if (response.data.code === 200) {
      file.status = "上传成功";
      file.filePath = response.data.data.file_path;
      ElMessage.success("上传成功");
    } else {
      file.status = "上传失败";
      ElMessage.error(response.data.msg || "上传失败,文件格式错误");
    }
  } catch (error) {
    file.status = "上传失败";
    ElMessage.error(response.data.msg || "上传失败,文件格式错误");
  }

  file.progress = 100;
  emit("update:file", file);
  // console.log("文件上传完成：", file);
}
// 格式化文件大小
function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #d9d9d9;
  padding: 40px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 20px;
}
</style>
