import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

if (/\/(build\.js)$/.exec(process.argv[1]))
    global.mode = 'production'
if (/\/(start\.js)$/.exec(process.argv[1]))
    global.mode = 'development'

export const
    APP_ROOT_DIR = resolve(fileURLToPath(import.meta.url), '..', '..')
    , OUTPUT_DIR = join(APP_ROOT_DIR, 'dist')
    , ELECTRON_SOURCE_DIR = join(OUTPUT_DIR, 'esrc')
    , SOURCE_DIR = join(APP_ROOT_DIR, 'src')
    , PACKAGE_JSON_FILE = join(APP_ROOT_DIR, 'package.json')

    , packageJson = createRequire(import.meta.url)(PACKAGE_JSON_FILE)