import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function workerSafePreloadHelper() {
  const helperCode = `const h=(function(){if(typeof document==="undefined")return"modulepreload";const s=document.createElement("link").relList;return s&&s.supports&&s.supports("modulepreload")?"modulepreload":"preload"})(),v=function(l){return"/"+l},d={},y=function(s,i){let E=Promise.resolve();if(typeof document==="undefined"||!(i&&i.length>0))return E.then(()=>s());const a=function(e){return Promise.all(e.map(o=>Promise.resolve(o).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))},f=document.querySelector("meta[property=csp-nonce]"),r=f?.nonce||f?.getAttribute("nonce");function t(e){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=e,window.dispatchEvent(o),!o.defaultPrevented)throw e}return E=a(i.map(e=>{if(e=v(e),e in d)return;d[e]=!0;const o=e.endsWith(".css"),c=o?'[rel="stylesheet"]':"";if(document.querySelector(\`link[href="\${e}"]\${c}\`))return;const n=document.createElement("link");if(n.rel=o?"stylesheet":h,o||(n.as="script"),n.crossOrigin="",n.href=e,r&&n.setAttribute("nonce",r),document.head.appendChild(n),o)return new Promise((u,l)=>{n.addEventListener("load",u),n.addEventListener("error",()=>l(new Error(\`Unable to preload CSS for \${e}\`)))})})),E.then(e=>{for(const o of e||[])o.status==="rejected"&&t(o.reason);return s().catch(t)})};export{y as _};`;

  return {
    name: 'worker-safe-preload-helper',
    generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'chunk' && asset.fileName.includes('preload-helper')) {
          asset.code = helperCode;
        }
      }
    },
  };
}

export default defineConfig({
  build: {
    modulePreload: false,
  },
  plugins: [
    workerSafePreloadHelper(),
    VitePWA({
      injectRegister: false,
      manifest: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,js,webmanifest}'],
        globIgnores: [
          '**/assets/puzzles-dynamic-4x4x4-*.js',
          '**/assets/puzzles-dynamic-megaminx-*.js',
          '**/assets/puzzles-dynamic-side-events-*.js',
          '**/assets/puzzles-dynamic-unofficial-*.js',
          '**/assets/search-dynamic-solve-4x4x4-*.js',
          '**/assets/search-dynamic-solve-fto-*.js',
          '**/assets/search-dynamic-solve-master_tetraminx-*.js',
          '**/assets/search-dynamic-sgs-side-events-*.js',
          '**/assets/search-dynamic-sgs-unofficial-*.js',
          '**/assets/twips*.js',
        ],
      },
    }),
  ],
});
