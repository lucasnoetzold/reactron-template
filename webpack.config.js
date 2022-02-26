import HtmlWebpackPlugin from 'html-webpack-plugin'
import { join } from 'path'

import {
    ELECTRON_SOURCE_DIR,
    SOURCE_DIR,
    packageJson
} from './scripts/constants.js'

const config = {
    mode: global.mode,
    entry: { index: join(SOURCE_DIR, 'index.tsx') },
    target: 'node',
    output: {
        path: ELECTRON_SOURCE_DIR,
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.[tj]sx$/,
                exclude: /(node_modules)/,
                loader: "babel-loader",
                options: { presets: [
                    "@babel/preset-env",
                    ["@babel/preset-react", { "runtime": "automatic" }],
                    "@babel/preset-typescript",
                ] }
            }
        ],
    },
    resolve: {
        extensions: ['.jsx', '.ts', '.tsx', '...']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: join(SOURCE_DIR, 'index.ejs'),
            chunks: ['index'],
            hash: true,
            templateParameters: packageJson
        })
    ],
    externals: { electron: 'require("electron")' }, // yeah, I know..
    ignoreWarnings: [
        /^asset\ size\ limit/,
        /^entrypoint\ size\ limit/,
        /\nYou\ can\ limit\ the\ size\ of\ your\ bundles/
    ]
}

if (global.mode === 'production') {
    config.entry.main = join(SOURCE_DIR, 'main.ts')
}

if (global.mode === 'development') {
    config.devtool = 'inline-source-map'
    config.devServer = {
        client: {
            overlay: true,
        },
    }
}

export default config