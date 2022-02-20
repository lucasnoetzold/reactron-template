#! /usr/bin/env node

import {
    OUTPUT_DIR,
    ELECTRON_SOURCE_DIR,
    PACKAGE_JSON_FILE,
    packageJson
} from './constants.js'

import { rmSync, readdirSync, mkdirSync, renameSync, writeFileSync } from 'fs'
import { join } from 'path'
import { api as electron } from '@electron-forge/core'
import webpack from 'webpack'
import webpackConfig from '../webpack.config.js'

function rmDir(dir) {
    rmSync(dir, { recursive: true, force: true })
}

async function runWebpack() {
    await new Promise(function (resolve, reject) {
        webpack(webpackConfig, function (err, stats) {
            if (err)
                reject(err)
            else if (stats.hasErrors())
                reject(stats.toJson().errors)
            else {
                if (stats.hasWarnings)
                    console.warn(stats.toJson().warnings)
                resolve(void 0)
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

async function electronPackage() {

    // copy a reduced version of package.json to the output dir
    writeFileSync(
        join(ELECTRON_SOURCE_DIR, 'package.json'),
        JSON.stringify(
            processPackageJson(packageJson)))

    // temp dir for electron build
    const outputDir = join(OUTPUT_DIR, 'electron-build')
    mkdirSync(outputDir)
    try {

        // renames the original package.json
        // otherwise electron will crawl up the directory tree and use it anyway
        renameSync(PACKAGE_JSON_FILE, PACKAGE_JSON_FILE + '.bkp')
        try {

            // run electron build
            await electron.package({ dir: ELECTRON_SOURCE_DIR, outDir: outputDir })

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

    await runWebpack()
    await electronPackage()

})()
    .catch(console.error)