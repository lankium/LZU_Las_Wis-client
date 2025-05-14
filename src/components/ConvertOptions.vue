<template>
  <div class="convert-actions">
    <el-button type="primary" size="large" @click="startConversion">全部转换</el-button>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import axios from "@/api/index.js";
import { ElMessage } from "element-plus";

const props = defineProps({
  fileList: Array
});

async function startConversion() {
  for (const file of props.fileList) {
    if (file.status !== "上传成功" || file.downloadUrl) {
      continue; // 忽略未上传成功或已转换的文件
    }

    file.status = "转换中";

    // 直接传递 JSON 数据
    const data = {
      file_path: file.filePath,
      target_format: file.name.endsWith(".las") ? "las-to-wis" : "wis-to-las"
    };

    try {
      const response = await axios.post("/convert/manual", data);
      if (response.data.code === 200) {
        file.status = "转换成功";
        file.downloadUrl = response.data.data.download_url;
        ElMessage.success("转换成功");
      } else {
        file.status = "转换失败";
        ElMessage.error(response.data.msg || "转换失败,文件格式不匹配");
      }
    } catch (error) {
      file.status = "转换失败";
      ElMessage.error("转换失败，文件错误");
    }
  }
}
</script>

<style scoped>
.convert-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
</style>
