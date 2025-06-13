App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-6gjgm10q993af29b', // 实际的环境ID
        traceUser: true,
      })
    }

    // 检查更新
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },

  onShow() {
    // 记录启动时间
    this.globalData.launchTime = Date.now()
  },

  globalData: {
    userInfo: null,
    launchTime: 0,
    currentSession: null
  }
})