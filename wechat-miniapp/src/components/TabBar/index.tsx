// ============================================================
// 底部 TabBar 组件 — 用于非 TabBar 页面
// ============================================================
import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface TabItem {
  pagePath: string;
  text: string;
  iconPath: string;
  selectedIconPath: string;
}

const TAB_LIST: TabItem[] = [
  { pagePath: '/pages/index/index', text: '首页', iconPath: '/assets/tabbar/home.png', selectedIconPath: '/assets/tabbar/home-active.png' },
  { pagePath: '/pages/map/map', text: '灾情地图', iconPath: '/assets/tabbar/map.png', selectedIconPath: '/assets/tabbar/map-active.png' },
  { pagePath: '/pages/report/report', text: '求助', iconPath: '/assets/tabbar/report.png', selectedIconPath: '/assets/tabbar/report-active.png' },
  { pagePath: '/pages/help/help', text: '帮忙', iconPath: '/assets/tabbar/help.png', selectedIconPath: '/assets/tabbar/help-active.png' },
  { pagePath: '/pages/profile/profile', text: '我的', iconPath: '/assets/tabbar/profile.png', selectedIconPath: '/assets/tabbar/profile-active.png' },
];

export default function TabBar() {
  const pages = Taro.getCurrentPages();
  const currentPath = pages.length > 0 ? '/' + pages[pages.length - 1].route : '';
  const selected = TAB_LIST.findIndex(t => t.pagePath === currentPath);

  const switchTab = (item: TabItem) => {
    Taro.switchTab({ url: item.pagePath });
  };

  return (
    <View className="tab-bar-fixed">
      {TAB_LIST.map((item, index) => (
        <View
          key={item.pagePath}
          className="tab-bar-item"
          onClick={() => switchTab(item)}
        >
          <Image
            className="tab-bar-icon"
            src={selected === index ? item.selectedIconPath : item.iconPath}
            mode="aspectFit"
          />
          <Text
            className="tab-bar-text"
            style={{ color: selected === index ? '#007AFF' : '#8E8E93' }}
          >
            {item.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
