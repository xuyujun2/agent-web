// userApi.ts
import { post, get } from '@/utils/fetch';
import { appConfig } from '@/config/appConfig';

// // 获取首页数据 包含tab
export const fetchHomeData = (params: object) => {
  return get(`/aiAssistant/page/${appConfig.fetchMainId}`,params);
  // return get('/aiAssistant/page/ai_category_chat', params);
};

// 获取首页top10数据
export const fetchToptenData = (params: object) => {
  return get(`/aiAssistant/page/${appConfig.fetchRankId}`, params);
};

// 获取分类数据内容 
export const fetchClassifyContent = (params: object, dynamicSegment: string) => {
  return get(`/aiAssistant/category/${dynamicSegment}`, params);
};

// 获取聊天页面数据
export const fetchChatPageData = (params: object, dynamicSegment: string) => {
  return get(`/aiAssistant/resource/${dynamicSegment}`, params);
};

// 获取AI流数据
export const fetchAiChatStream = (fetchData: object) => {
  return post('/aiAssistant/chat', fetchData);
};

// 获取快捷语
export const fetchAiQuickLanguage = (fetchData: object) => {
  return post('/aiAssistant/chat', fetchData);
};

// 获取排行榜页面数据
export const fetchRankData = (params: object, dynamicSegment: string) => {
  return get(`/aiAssistant/category/${dynamicSegment}`, params);
};















// // userApi.ts
// import { post, get } from '@/utils/fetch';

// // 获取首页数据 包含tab
// export const fetchHomeData = (params: object, opts: Object = {}) => {
//   return get('/aiAssistant/page/ai_category_chat', params, opts);
// };

// // 获取首页top10数据
// export const fetchToptenData = (params: object, opts: Object) => {
//   return get('/aiAssistant/page/ai_top_ten', params, opts);
// };

// // 获取分类数据内容 
// export const fetchClassifyContent = (params: object, opts: Object, dynamicSegment?: string) => {
//   return get(`/aiAssistant/category/${dynamicSegment}`, params, opts);
// };

// // 获取聊天页面数据
// export const fetchChatPageData = (params: object, opts: Object, dynamicSegment?: string) => {
//   return get(`/aiAssistant/resource/${dynamicSegment}`, params, opts);
// };

// // 获取AI流数据
// export const fetchAiChatStream = (fetchData: object, opts: Object) => {
//   return post('/aiAssistant/chat', fetchData, opts);
// };

// // 获取快捷语
// export const fetchAiQuickLanguage = (fetchData: object, opts: Object) => {
//   return post('/aiAssistant/chat', fetchData, opts);
// };

// // 获取排行榜页面数据
// export const fetchRankData = (params: object, opts: Object, dynamicSegment?: string) => {
//   return get(`/aiAssistant/category/${dynamicSegment}`, params, opts);
// };


