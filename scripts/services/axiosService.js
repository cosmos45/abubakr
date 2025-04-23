(function () {
    const backendApi = "https://abubakr.flowpos.co.uk/api/";
    // Create an Axios instance with baseURL and default headers
    const axiosServices = axios.create({
      baseURL: backendApi,
      headers: { "Content-Type": "application/json" },
    });
  
    
    // Request interceptor to set the Authorization header
    axiosServices.interceptors.request.use(
      async function (config) {
        let token = localStorage.getItem("token");
  
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
  


    // Response interceptor to handle token expiration
    axiosServices.interceptors.response.use(function (response) {
      return response.data;
    });
  
    window.axiosServices = axiosServices;
  })();
  