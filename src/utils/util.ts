import { inject } from 'vue';
import CryptoJS from 'crypto-js';
import { DirectiveBinding } from 'vue';
import { appConfig } from '@/config/appConfig';
const config =  appConfig; 



// 获取系统信息
export const getSystemInfo = () => {
    const ua = navigator.userAgent;
    const info = {
        system: 'Unknown',
        version: 'Unknown'
    };

    // iOS 设备检测（包括 iPad、iPhone、iPod）
    if (/iP(hone|od|ad)/.test(ua)) {
        info.system = 'iOS';
        const match = ua.match(/OS (\d+)_(\d+)(?:_(\d+))?/);
        if (match) {
            console.log('match',match)
            info.version = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
        }
    } 
    // macOS 设备检测
    else if (/Macintosh/.test(ua)) {
        info.system = 'macOS';
        const match = ua.match(/Mac OS X (\d+)_(\d+)(?:_(\d+))?/);
        if (match) {
            info.version = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
        }
    } 
    // Android 设备检测
    else if (/Android|Adr/.test(ua)) {
        info.system = 'Android';
        const match = ua.match(/Android (\d+(?:\.\d+)?)/);
        if (match) {
            info.version = match[1];
        }
    }

    return info;
};



// 生成签名 sign
 
// 传参类型
interface HashParams {
  appKey: string;
  appVersion: number;
  duid: string;
  screen: string;
  timestamp: number;
}


// 返回值
interface HashResult {
  expectedSign: string;
  timestamp: number;
}

const generateInputString = (params: HashParams): string => {
  return (
    "app_key" + params.appKey +
    "app_version" + params.appVersion +
    "duid" + params.duid +
    "screen" + params.screen +
    "time_stamp" + params.timestamp
  );
};

export const generateSign = (): HashResult => {
  const timestamp = Date.now();
  
  const params: HashParams = {
    appKey: config.appKey,
    appVersion: config.appVersion,
    duid: config.duid,
    screen: config.screen,
    timestamp
  };

  const input = generateInputString(params);
  
  // 计算 SHA-256 哈希
  const sha256Hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
  
  // 计算 MD5 哈希
  const expectedSign = CryptoJS.MD5(sha256Hash).toString(CryptoJS.enc.Hex);

  return { expectedSign, timestamp };
};



interface UaResult {
  uaString: string;
}

// 生成ua
export const generateUa = (): UaResult => {
  const uaString = `${config.packageName}/${config.appVersion} (${config.duid}/${config.appKey}) Country/${config.country} Language/${config.language} System/${config.system} Version/${config.version} Screen/${config.screen}`
  return { uaString }
}


// 包名/版本号 (duid/appKey) Country/国家 Language/语言 System/系统 Version/版本 Screen/H5
// com.ChatlyVerse-H5/0 (2c801509fe34bc1292351417e064249c/2c801509fe34bc1292351417e064249c) Country/cn Language/en System/android Version/28 Screen/H5



// 图片懒加载自定义指令
export const lazy = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          // 停止观察，避免重复触发
          observer.unobserve(el);
        }
      });
    });
    
    // 开始观察元素
    observer.observe(el);
  }
};



// 曝光打点
export const appearlog = {
  // el 是元素     binding 是指令绑定的部分
  mounted(el: any, binding: any) {
    console.log("指令初始化，binding.value是：", binding.value); // 这里会立即打印
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // console.log(6,el)
            binding.value?.(el)
            // 可选：曝光后停止监听
            // observer.unobserve(el)
          }
        })
      },
      {
        threshold: 0.5,  // 必须 50% 以上可见才触发
        rootMargin: '0px', // 不扩大检测区域
      }
    )
    observer.observe(el)
    el._observer = observer // 存储引用以便后续清理
  },
  unmounted(el: any) {
    el._observer?.disconnect()
    delete el._observer
  }
}





// 获取查询参数
export const getQueryVariable = (variable: string, query?: string): string => {
    if (!query) {
        query = window.location.search.substring(1);
    }
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return '';
};