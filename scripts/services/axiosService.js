// axiosService.js
const backendApi = 'https://backendv3.tech1solutions.uk/api';
const apiCredentials = {
    api_key: 'cpul47tu91fbr6kles1v560lvfwtig',
    api_secret: 'ylx7wiblk6fqpvsh2qxmh26kss4hajk9kj8jrlt4t14qh94wwnob1ctszgvnoenkenv7tc99u0h5woc9joobpr232b11pvxd9',
    domain: 'abubakr.co.uk'
};

// Create an Axios instance with baseURL and default headers
const axiosServices = axios.create({
    baseURL: backendApi,
    headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;

let failedQueue = [];



const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a request interceptor to handle token refresh
const fetchToken = async () => {
    try {
        const response = await axios.post(`${backendApi}/auth/token`, apiCredentials, {
            headers: { 'Content-Type': 'application/json' }
        });
        const accessToken = response.data.data.token;
        localStorage.setItem('token', accessToken);
        axiosServices.defaults.headers['Authorization'] = `${accessToken}`;
        return accessToken;
    } catch (error) {
        throw error;
    }
};



// Request interceptor
axiosServices.interceptors.request.use(
    async function (config) {
        let token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        }

        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const newToken = await fetchToken();
                processQueue(null, newToken);
                return { ...config, headers: { ...config.headers, 'Authorization': `Bearer ${newToken}` } };
            } catch (err) {
                processQueue(err, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return new Promise((resolve, reject) => {
            failedQueue.push({
                resolve: (token) => {
                    config.headers['Authorization'] = token;
                    resolve(config);
                },
                reject: (err) => {
                    reject(err);
                }
            });
        });
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosServices.interceptors.response.use(
    function (response) {
        return response.data;
    },
    async function (error) {
        const originalRequest = error.config;

        if (error.response && error.response.status === 426 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers['Authorization'] = token;
                            resolve(axiosServices(originalRequest));
                        },
                        reject: (err) => {
                            reject(err);
                        }
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise(function (resolve, reject) {
                fetchToken()
                    .then(newToken => {
                        originalRequest.headers['Authorization'] = `${newToken}`;
                        processQueue(null, newToken);
                        resolve(axiosServices(originalRequest));
                    })
                    .catch(err => {
                        processQueue(err, null);
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject((error.response && error.response.data) || 'Unknown Error');
    }
);

// Initialize token on load
const setTokenOnLoad = () => {
    const token = localStorage.getItem('token');
    if (token) {
        axiosServices.defaults.headers['Authorization'] = token;
    }
};

setTokenOnLoad();

export default axiosServices;
