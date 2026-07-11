export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/map/map',
    'pages/report/report',
    'pages/help/help',
    'pages/profile/profile',
    'pages/notifications/notifications',
    'pages/myreports/myreports',
    'pages/shelters/shelters',
    'pages/preferences/preferences',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '洪涝应急',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F2F2F7',
  },
  tabBar: {
    color: '#8E8E93',
    selectedColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png',
      },
      {
        pagePath: 'pages/map/map',
        text: '灾情地图',
        iconPath: 'assets/tabbar/map.png',
        selectedIconPath: 'assets/tabbar/map-active.png',
      },
      {
        pagePath: 'pages/report/report',
        text: '求助',
        iconPath: 'assets/tabbar/report.png',
        selectedIconPath: 'assets/tabbar/report-active.png',
      },
      {
        pagePath: 'pages/help/help',
        text: '帮忙',
        iconPath: 'assets/tabbar/help.png',
        selectedIconPath: 'assets/tabbar/help-active.png',
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png',
      },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '需要获取您的位置信息用于紧急求助定位',
    },
  },
  requiredPrivateInfos: ['getLocation'],
});
