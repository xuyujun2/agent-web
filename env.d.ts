declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// crypto-js.d.ts
declare module 'crypto-js' {
  const CryptoJS: any; // 或根据需要定义更具体的类型
  export = CryptoJS;
}


declare module 'vconsole' {
  const VConsole: any
  export default VConsole
}