import axios from "axios";


axios.defaults.baseURL = "http://localhost:8001"
axios.defaults.headers.post["Content-Type"] = "application/json"; // 响应

// 响应拦截
axios.interceptors.response.use(response => {
  if (response.status === 200) {
    return response;
  }

})

export default axios;