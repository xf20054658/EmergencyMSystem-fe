import { defineConfig, type UserConfigExport } from '@tarojs/cli';

const config: UserConfigExport<'weapp'> = defineConfig<'weapp'>(() => {
  const baseConfig = {
    projectName: 'emergency-msystem-miniapp',
    date: '2026-7-11',
    designWidth: 375,
    deviceRatio: {
      375: 2 / 1,
      640: 2 / 2.34,
      750: 1,
      828: 2 / 1.81,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-platform-weapp'],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: { enable: false },
    },
    cache: { enable: false },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: { limit: 1024 },
        },
        cssModules: {
          enable: false,
          config: {},
        },
      },
    },
    alias: {
      '@': require('path').resolve(__dirname, '..', 'src'),
    },
  };

  return baseConfig;
});

export default config;
