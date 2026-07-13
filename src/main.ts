import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'; 
import './style.css'
import router from './router';
import vant from 'vant';
import { i18n } from './i18n';
// import 'vant/lib/index.css';
import { lazy, appearlog } from '@/utils/util';


// // 动态设置 html 元素的 font-size
(function (doc, win) {
    const docEl = doc.documentElement
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
    const recalc = () => {
      const clientWidth = docEl.clientWidth
      console.log(clientWidth)
      if (!clientWidth) return
      docEl.style.fontSize = 100 * (clientWidth / 750) + 'px'
    }
    recalc()
    win.addEventListener(resizeEvt, recalc, false)
  })(document, window)



// 仅在开发环境和测试环境启用 vConsole
if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test') {
  import('vconsole').then((module) => {
    const VConsole = module.default;
    new VConsole();
  });
}


const app = createApp(App);
const pinia = createPinia();

// 全局注册指令，名称为 'lazy'
app.directive('lazy', lazy);
app.directive('appearlog', appearlog);

app.use(pinia)
app.use(vant);
app.use(router)
app.use(i18n)


app.mount('#app')
