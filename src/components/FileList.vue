<template>
  <el-table :data="fileList" class="file-table">
    <el-table-column prop="name" label="文件名称" />
    <el-table-column label="文件状态">
      <template #default="scope">
        <div v-if="scope.row.status === '上传中'">
          <el-progress :percentage="scope.row.progress || 0" status="success" />
        </div>
        <div v-else-if="scope.row.status === '转换中'" class="converting-status">
          <el-icon class="rotating-icon" style="color: red;">
            <Loading class="rotating" />
          </el-icon>

          正在转换...
        </div>
        <div v-else>{{ scope.row.status }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="size" label="文件大小" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="primary" v-if="scope.row.status === '上传成功'" @click="convertFile(scope.row)">
          转换
        </el-button>
        <el-button type="primary" v-if="scope.row.downloadUrl" @click="downloadFile(scope.row)">
          下载
        </el-button>
        <el-button type="danger" @click="removeFile(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import axios from "@/api/index.js";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

const props = defineProps({
  fileList: Array
});
const emit = defineEmits(["update:file", "delete:file"]);

// 删除文件
function removeFile(file) {
  emit("delete:file", file);
}

// 手动转换文件
async function convertFile(file) {
  if (file.status !== "上传成功" || !file.filePath) return;

  file.status = "转换中";
  emit("update:file", file);

  try {
    // 直接传递 JSON 数据
    const data = {
      file_path: file.filePath,
      target_format: file.name.endsWith(".las") ? "las-to-wis" : "wis-to-las"
    };

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
    // console.error("转换失败：", error);
  }

  emit("update:file", file);
}

// 下载文件
async function downloadFile(file) {
  if (!file.downloadUrl) return;

  try {
    const response = await axios.get(file.downloadUrl, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.replace(/(\.\w+)?$/, file.downloadUrl.endsWith(".las") ? ".las" : ".wis");
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载失败：", error);
  }
}
</script>

<style scoped>
.file-table {
  margin-bottom: 20px;
}

.converting-status {
  display: flex;
  align-items: center;
}

.rotating {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
