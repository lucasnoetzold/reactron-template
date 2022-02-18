#! /usr/bin/env node

const { rmSync, readdirSync, mkdirSync, renameSync, writeFileSync, readFileSync, existsSync } = require('fs')
const { resolve, join } = require('path')

const APP_ROOT_DIR = resolve(__dirname, '..'),
    OUTPUT_DIR = join(APP_ROOT_DIR, 'dist'),
    ELECTRON_SOURCE_DIR = join(OUTPUT_DIR, 'esrc'),
    PACKAGE_JSON_FILE = join(APP_ROOT_DIR, 'package.json'),
    PACKAGE_JSON = require(PACKAGE_JSON_FILE)

function rmDir(dir) {
    rmSync(dir, { recursive: true, force: true })
}

async function webpack() {

    // initiate webpack with reacts 'production' configuration
    await new Promise(function (resolve, reject) {
        require('webpack')(
            {
                mode: 'production',
                entry: {
                    main: './src/main.ts',
                    index: './src/index.tsx'
                },
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
                            options: { presets: [["@babel/preset-react", { "runtime": "automatic" }]] }
                        }
                    ],
                },
                resolve: {
                    extensions: ['.jsx', '.ts', '.tsx', '...']
                },
                plugins: [
                    new (require('html-webpack-plugin'))({
                        template: 'src/index.ejs',
                        chunks: ['index'],
                        hash: true,
                        templateParameters: PACKAGE_JSON
                    })
                ],
                externals: { electron: 'require("electron")' }, // yeah I know..
                ignoreWarnings: [
                    /^asset\ size\ limit/,
                    /^entrypoint\ size\ limit/,
                    /\nYou\ can\ limit\ the\ size\ of\ your\ bundles/
                ]
            },

            // -------------------------------------------------------------

            function (err, stats) {
                if (err)
                    reject(err)
                else if (stats.hasErrors())
                    reject(stats.toJson().errors)
                else {
                    if (stats.hasWarnings)
                        console.warn(stats.toJson().warnings)
                    resolve()
                }
            })
    })
}

function processPackageJson(packageFile) {
    const result = {}
    for (let key in packageFile)
        if ([
            'name',
            'description',
            'version',
            'keywords',
            'license',
            'author',
            'contributors',
            'repository'
        ].includes(key))
            result[key] = packageFile[key]

    result.main = 'main.js'

    // electron needs itself to show up in devDependencies, so he can figure out the version
    result.devDependencies = { electron: packageFile.devDependencies.electron }

    return result
}

async function electronBuild() {

    // copy a reduced version of package.json to the output dir
    writeFileSync(
        join(ELECTRON_SOURCE_DIR, 'package.json'),
        JSON.stringify(
            processPackageJson(PACKAGE_JSON)))

    // temp dir for electron build
    const outputDir = join(OUTPUT_DIR, 'build')
    mkdirSync(outputDir)
    try {

        // renames the original package.json
        // otherwise electron will crawl up the directory tree and use it anyway
        renameSync(PACKAGE_JSON_FILE, PACKAGE_JSON_FILE + '.bkp')
        try {

            // run electron build
            await require('@electron-forge/core')
                .api.package({ dir: ELECTRON_SOURCE_DIR, outDir: outputDir })

        } finally {
            // put package.json back to its place
            renameSync(PACKAGE_JSON_FILE + '.bkp', PACKAGE_JSON_FILE)
        }

        // put files in the OUTPUT_DIR
        readdirSync(outputDir).forEach(file =>
            renameSync(join(outputDir, file), join(OUTPUT_DIR, file)))
    } finally {
        // remove temporary dirs
        rmDir(ELECTRON_SOURCE_DIR)
        rmDir(outputDir)
    }
}

(async function compile() {

    // clean
    rmDir(OUTPUT_DIR)
    mkdirSync(OUTPUT_DIR)
    mkdirSync(ELECTRON_SOURCE_DIR)

    await webpack()
    await electronBuild()

})()
    .catch(console.error)