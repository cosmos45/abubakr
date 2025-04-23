(function () {
  const backendApi = "https://abubakr.flowpos.co.uk/api/";

  // Generate and store a UID if it doesn't exist
  function getOrCreateUID() {
    let uid = localStorage.getItem("uid");

    if (!uid) {
      if (window.crypto && crypto.randomUUID) {
        uid = crypto.randomUUID();
      } else {
        // Basic fallback using timestamp and random values
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        uid = `uid-${timestamp}-${random}`;
      }
      localStorage.setItem("uid", uid);
    }

    return uid;
  }

  // Ensure UID is available
  const uid = getOrCreateUID();

  // Create an Axios instance
  const axiosServices = axios.create({
    baseURL: backendApi,
    headers: { "Content-Type": "application/json" },
  });

  // Request interceptor to set Authorization and UID headers
  axiosServices.interceptors.request.use(
    function (config) {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      if (uid) {
        config.headers["X-UID"] = uid; // Custom header for UID
      }

      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // Response interceptor to unwrap data
  axiosServices.interceptors.response.use(function (response) {
    return response.data;
  });

  // Expose axiosServices globally
  window.axiosServices = axiosServices;
})();
