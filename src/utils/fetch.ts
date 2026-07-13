// fetch.ts
import { generateSign, generateUa } from '@/utils/util';
import { appConfig } from '@/config/appConfig';

// console.log('appConfig',appConfig)

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Options {
  method?: Method;
  body?: any;
  params?: object;
  // headers?: object;
  // signal?: AbortSignal;
}
const baseURL = appConfig.baseUrl;
// const FIXED_TOKEN = 'your_fixed_token_here';

// 对象转查询字符串
const objToQueryString = (obj = {}) => {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&');
};

const request = async (url: string, options: Options = {}) => {
  try {

    // 获取sign
    const { expectedSign, timestamp } = generateSign();
    const { uaString } = generateUa();
    // console.log('expectedSign--',expectedSign); // 输出签名结果

    let fullUrl = url;
    
    // 处理GET参数
    if (options.params && options.method === 'GET') {
      fullUrl += `?${objToQueryString(options.params)}`;
    }

    fullUrl += `${fullUrl.includes('?') ? '&' : '?'}sign=${expectedSign}&timestamp=${timestamp}`
    
    const config = {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'Kika-User-Agent': `${uaString}`,
        'User-Key': '{{userKey}}',
        'Request-Time': Date.now().toString(),
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Host': 'backend-wallpaper.kika-backend.com',
        'Connection': 'keep-alive',
        // 'Authorization': `Bearer ${FIXED_TOKEN}`,
      },
      body: options.body ? JSON.stringify(options.body) : null
    };
    
    const response = await fetch(`${baseURL}${fullUrl}`, config);
    
    // 处理不同状态码
    if (!response.ok) {
      const errorMessage = `HTTP错误: ${response.status}`;
      
      switch (response.status) {
        case 400: throw new Error(`前端语法错误: ${errorMessage}`);
        case 401: throw new Error(`未授权: ${errorMessage}`);
        case 403: throw new Error(`访问权限不足: ${errorMessage}`);
        case 404: throw new Error(`请求路径错误: ${errorMessage}`);
        case 500: throw new Error(`服务器错误: ${errorMessage}`);
        default: throw new Error(errorMessage);
      }
    }

    // console.log(response)

    // 判断是否为 SSE 响应
    const contentType = response.headers.get('Content-Type') || '';
    const isSse = contentType.includes('text/event-stream');

    return isSse ? response : response.json(); // // json() => 将JSON字符串解析成JSON对象，SSE的数据不需要json()解析
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};

// opt => {headers:{}}   fetchData => {}
export const get = (url: string, fetchData?: object) => 
  request(url, { params: fetchData, method: 'GET' });

// opt => {headers:{}}   fetchData => {}
export const post = (url: string, fetchData?: object) => 
  request(url, { body: fetchData, method: 'POST' });