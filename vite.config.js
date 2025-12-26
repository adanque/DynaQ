

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})


// import { fileURLToPath, URL } from 'node:url'
// import { defineConfig, loadEnv } from 'vite'
// import vue from '@vitejs/plugin-react'

// export default defineConfig(({ command, mode }) => {
//   const env = loadEnv(mode, process.cwd(), '');

//   return {
//     plugins: [
//       vue(),
//     ],
//     define: {
//       __APP_ENV__: JSON.stringify(env.APP_ENV),
//     },
//     resolve: {
//       alias: {
//         '@': fileURLToPath(new URL('./src', import.meta.url))
//       }
//     }
//   }
// });

// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// export default defineConfig(({ command, mode }) => {
//   // Load env file based on `mode` in the current working directory.
//   // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
//   plugins: [
//     react({
//       babel: {
//         plugins: [['babel-plugin-react-compiler']],
//       },
//     }),
//   ]
//   const env = loadEnv(mode, process.cwd(), '')
//   return {
//     // vite config
//     define: {
//       __APP_ENV__: JSON.stringify(env.APP_ENV),
//     },
//   }
// })



