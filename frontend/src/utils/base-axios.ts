import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

export const domain = HOST_API;

const baseAxios = axios.create({
    baseURL: `${domain}/api/v1/`,
});

baseAxios.interceptors.request.use(
    (config) => {
        
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

baseAxios.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default baseAxios;

export async function request(options: AxiosRequestConfig, isPublic = false) {
    const lang = localStorage.getItem('language') || 'uz';
    const params = { ...options.params, lang };

    const config: AxiosRequestConfig = {
        ...options,
        params,
    };

    
    if (isPublic && config.headers) {
        delete config.headers.Authorization;
    }

    const { data } = await baseAxios(config);
    return data;
}
