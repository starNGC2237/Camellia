import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'node:path'
const Logger = require('electron-log')
const liveServer = require('live-server')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
let httpServer: any
let socketServer: any

function createWindow() {
  Logger.log('创建窗口')
  win = new BrowserWindow({
    width: 800,
    height: 90,
    resizable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  // 隐藏菜单栏
  win.setMenu(null)
  // 创建Socket.IO服务器
  if (!httpServer) httpServer = require('http').createServer()
  //将HTTP服务器注入到WebSocket服务器
  if (!socketServer) {
    socketServer = require('socket.io')(httpServer, {
      cors: {
        origin: '*',
      },
    })
    //指定HTTP的监听端口
    socketServer.listen(5000)
  }

  // 启动本地服务
  liveServer.start({
    port: 9999, // Set the server port. Defaults to 8080.
    host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    // root: './dist-frontend',
    root: app.isPackaged ? './resources/dist-frontend' : './dist-frontend', // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
  })

  // 监听渲染层消息
  ipcMain.handle('text_message', (_, text) => {
    socketServer.emit('socket_message', text)
    return 'got it'
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('second-instance', () => {
  // 如果主窗口存在，恢复并聚焦它
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
  // 处理第二个实例的命令行参数，例如打开一个文件
  // 省略具体的处理逻辑
})
app.whenReady().then(() => {
  // 尝试获取单实例锁
  const gotTheLock = app.requestSingleInstanceLock()
  // 如果获取失败，说明已经有一个实例在运行，直接退出
  if (!gotTheLock) {
    app.quit()
  } else {
    // 如果获取成功，创建主窗口
    createWindow()
  }
})
// 当第二个实例启动时
