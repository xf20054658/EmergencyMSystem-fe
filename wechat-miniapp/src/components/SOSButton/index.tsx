import { Component } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface SOSButtonState {
  phase: 'idle' | 'confirming' | 'countdown';
  countdown: number;
}

export default class SOSButton extends Component<
  { onConfirm: (lat: number, lng: number) => void },
  SOSButtonState
> {
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  state: SOSButtonState = { phase: 'idle', countdown: 3 };

  componentWillUnmount() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
    if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
  }

  // 长按开始
  handleTouchStart = () => {
    this.longPressTimer = setTimeout(() => {
      this.setState({ phase: 'confirming' });
    }, 1500);
  };

  // 长按取消
  handleTouchEnd = () => {
    if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
  };

  // 开始倒计时
  handleStartCountdown = () => {
    this.setState({ phase: 'countdown', countdown: 3 });
    this.countdownTimer = setInterval(() => {
      this.setState(prev => {
        if (prev.countdown <= 1) {
          if (this.countdownTimer) clearInterval(this.countdownTimer);
          this.setState({ phase: 'idle', countdown: 3 });
          this.triggerSOS();
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  // 取消
  handleCancel = () => {
    this.clearTimers();
    this.setState({ phase: 'idle', countdown: 3 });
  };

  // 触发 SOS
  private triggerSOS() {
    Taro.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: (res) => {
        this.props.onConfirm(res.latitude, res.longitude);
      },
      fail: () => {
        const lat = Taro.getStorageSync('last_known_lat');
        const lng = Taro.getStorageSync('last_known_lng');
        if (lat && lng) {
          this.props.onConfirm(Number(lat), Number(lng));
        } else {
          Taro.showToast({ title: '无法获取位置，请手动输入地址', icon: 'none' });
        }
      },
    });
  }

  render() {
    const { phase, countdown } = this.state;
    const isIdle = phase === 'idle';
    const isConfirming = phase === 'confirming';
    const isCountdown = phase === 'countdown';

    return (
      <View className="sos-container">
        {/* SOS 按钮 */}
        <View
          className={`sos-btn ${!isIdle ? 'sos-btn--active' : ''}`}
          onTouchStart={this.handleTouchStart}
          onTouchEnd={this.handleTouchEnd}
          onTouchCancel={this.handleTouchEnd}
        >
          <Text className="sos-btn__text">{isCountdown ? `${countdown}` : 'SOS'}</Text>
        </View>

        {/* 确认弹窗 */}
        {isConfirming && (
          <View className="sos-dialog">
            <View className="sos-dialog__content">
              <Text className="sos-dialog__icon">⚠️</Text>
              <Text className="sos-dialog__title">确认紧急求助？</Text>
              <Text className="sos-dialog__desc">系统将立即通知附近救援力量</Text>
              <View className="sos-dialog__actions">
                <Button className="btn-cancel" onClick={this.handleCancel}>取消</Button>
                <Button className="btn-confirm" onClick={this.handleStartCountdown}>确认求助</Button>
              </View>
            </View>
          </View>
        )}

        {/* 倒计时遮罩 */}
        {isCountdown && (
          <View className="sos-overlay">
            <Text className="sos-overlay__count">{countdown}</Text>
            <Text className="sos-overlay__label">秒后发出紧急求助</Text>
            <Button className="sos-overlay__cancel" onClick={this.handleCancel}>取消</Button>
          </View>
        )}
      </View>
    );
  }
}
