#! /usr/bin/env node

import {
    APP_ROOT_DIR
} from './constants.js'

import webpack from 'webpack'
import webpackConfig from '../webpack.config.js'
import childProcess from 'child_process'
import electron from 'electron'
import WebpackDevServer from 'webpack-dev-server'

(async function start() {

    // starts webpack dev-server
    let devServer = new WebpackDevServer(webpackConfig.devServer, webpack(webpackConfig))
    await devServer.start()

    // starts electron
    let electronProcess = childProcess.spawn(electron,[APP_ROOT_DIR],{ stdio: 'inherit', windowsHide: false })
    electronProcess.on('exit', () => devServer.stop())

})()