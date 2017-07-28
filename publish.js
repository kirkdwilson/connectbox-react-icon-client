const fs = require('fs')

function mkdirAsync (path) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(path, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

function statAsync (path) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

function readdirAsync (path) {
  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

function copyFileAsync (source, target) {
  return new Promise(function (resolve, reject) {
    var rd = fs.createReadStream(source)
    rd.on('error', rejectCleanup)
    var wr = fs.createWriteStream(target)
    wr.on('error', rejectCleanup)
    function rejectCleanup (err) {
      rd.destroy()
      wr.end()
      reject(err)
    }
    wr.on('finish', resolve)
    rd.pipe(wr)
  })
}

function readFileAsync (path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

function writeFileAsync (path, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

const JS_KEY_REGEX = /main.(.*).js/g
const CSS_KEY_REGEX = /main.(.*).css/g

function getUniqueKey (names, regex) {
  let key = null
  names.forEach(name => {
    const match = regex.exec(name)
    if (match) {
      key = match[1]
    }
  })
  return key
}

async function createDirIfNotExists (dir) {
  let stat = null
  try {
    stat = await statAsync(dir)
  } catch (e1) {
    if (e1.code === 'ENOENT') {
      try {
        await mkdirAsync(dir)
        stat = await statAsync(dir)
      } catch (e2) {
        throw e2
      }
    }
  }
  return stat
}

async function main (publishDir) {
  const jsNames = await readdirAsync('build/static/js')
  const cssNames = await readdirAsync('build/static/css')

  const jsKey = getUniqueKey(jsNames, JS_KEY_REGEX)
  if (!jsKey) {
    throw Error('Unable to find generated js files')
  }

  const cssKey = getUniqueKey(cssNames, CSS_KEY_REGEX)
  if (!cssKey) {
    throw Error('Unable to find generated css files')
  }

  const root = `./${publishDir}`
  createDirIfNotExists(root)
  const staticDir = `${root}/static`
  createDirIfNotExists(staticDir)
  const staticCss = `${staticDir}/css`
  createDirIfNotExists(staticCss)
  const staticJs = `${staticDir}/js`
  createDirIfNotExists(staticJs)
  const jsDir = `${root}/js`
  createDirIfNotExists(jsDir)
  const cssDir = `${root}/css`
  createDirIfNotExists(cssDir)
  const fontsDir = `${root}/fonts`
  createDirIfNotExists(fontsDir)
  const configDir = `${root}/config`
  createDirIfNotExists(configDir)

  await copyFileAsync(`build/static/css/main.${cssKey}.css`, `${staticCss}/main.css`)
  await copyFileAsync(`build/static/css/main.${cssKey}.css.map`, `${staticCss}/main.css.map`)
  await copyFileAsync(`build/static/js/main.${jsKey}.js`, `${staticJs}/main.js`)
  await copyFileAsync(`build/static/js/main.${jsKey}.js.map`, `${staticJs}/main.js.map`)

  await copyFileAsync('build/config/default.json', `${configDir}/default.json`)
  await copyFileAsync('build/js/fa-icon-metadata.js', `${jsDir}/fa-icon-metadata.js`)
  await copyFileAsync('build/css/bootstrap.min.css', `${cssDir}/bootstrap.min.css`)
  await copyFileAsync('build/css/font-awesome.min.css', `${cssDir}/font-awesome.min.css`)
  await copyFileAsync('build/fonts/FontAwesome.otf', `${fontsDir}/FontAwesome.otf`)
  await copyFileAsync('build/fonts/fontawesome-webfont.eot', `${fontsDir}/fontawesome-webfont.eot`)
  await copyFileAsync('build/fonts/fontawesome-webfont.svg', `${fontsDir}/fontawesome-webfont.svg`)
  await copyFileAsync('build/fonts/fontawesome-webfont.woff', `${fontsDir}/fontawesome-webfont.woff`)
  await copyFileAsync('build/fonts/fontawesome-webfont.woff2', `${fontsDir}/fontawesome-webfont.woff2`)
  await copyFileAsync('build/fonts/glyphicons-halflings-regular.eot', `${fontsDir}/glyphicons-halflings-regular.eot`)
  await copyFileAsync('build/fonts/glyphicons-halflings-regular.svg', `${fontsDir}/glyphicons-halflings-regular.svg`)
  await copyFileAsync('build/fonts/glyphicons-halflings-regular.ttf', `${fontsDir}/glyphicons-halflings-regular.ttf`)
  await copyFileAsync('build/fonts/glyphicons-halflings-regular.woff', `${fontsDir}/glyphicons-halflings-regular.woff`)
  await copyFileAsync('build/fonts/glyphicons-halflings-regular.woff2', `${fontsDir}/glyphicons-halflings-regular.woff2`)

  // Remove the unique keys
  await writeFileAsync(`${root}/index.html`, (await readFileAsync('build/index.html')).toString().replace(new RegExp(`.${jsKey}`, 'g'), '').replace(new RegExp(`.${cssKey}`, 'g'), ''))
}

main(process.argv[2])
