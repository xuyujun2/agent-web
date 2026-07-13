import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    search: {
      date: 'Sep 12 - 15',
      room: '1 room',
      guests: '2 guests',
    },
    filter: {
      aria: 'Filter',
      all: 'Filter',
      under150: 'Under $150',
      rating48: '4.8+ rating',
      nearMe: 'Near me',
    },
    sort: {
      aria: 'Sort',
      recommended: 'Sort',
      priceAsc: 'Price low',
      priceDesc: 'Price high',
      ratingDesc: 'Top rated',
    },
    language: {
      aria: 'Language',
    },
    results: {
      count: '{count} results',
    },
    listing: {
      name: 'Location name',
      reviews: '{rating} ({count} reviews)',
      distance: '{distance} miles',
      perNight: '/ night',
      select: 'Select',
    },
  },
  zh: {
    search: {
      date: '9月12日 - 15日',
      room: '1间房',
      guests: '2位住客',
    },
    filter: {
      aria: '筛选',
      all: '筛选',
      under150: '$150以下',
      rating48: '4.8分以上',
      nearMe: '附近',
    },
    sort: {
      aria: '排序',
      recommended: '排序',
      priceAsc: '价格低到高',
      priceDesc: '价格高到低',
      ratingDesc: '评分最高',
    },
    language: {
      aria: '语言',
    },
    results: {
      count: '{count}个结果',
    },
    listing: {
      name: '地点名称',
      reviews: '{rating}（{count}条评价）',
      distance: '{distance}英里',
      perNight: '/ 晚',
      select: '选择',
    },
  },
} as const;

const locale = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages,
});
