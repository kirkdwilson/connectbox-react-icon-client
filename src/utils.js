export function mediaTypes (file) {
  if (file.icon_class) {
    return file.icon_class
  } else if (file.type === 'directory') {
    return 'fa-folder-o'
  }

  let picto
  let ext = file.ext
  switch (ext) {
    case 'txt':
    case 'pdf':
    case 'epub':
    case 'mobi':
      picto = 'fa-file-text-o'
      break
    case 'mov':
    case 'mp4':
    case 'flv':
    case 'mkv':
    case 'avi':
    case 'wmv':
    case 'mpeg':
    case 'mpg':
    case '3gp':
    case 'm4v':
      picto = 'fa-file-video-o'
      break
    case 'mp3':
    case 'ogg':
    case 'ra':
    case 'wav':
      picto = 'fa-file-sound-o'
      break
    case 'jpeg':
    case 'jpg':
    case 'gif':
    case 'png':
    case 'tiff':
      picto = 'fa-file-photo-o'
      break
    default:
      picto = 'fa-file-text-o'
  }
  if (!picto) {
    picto = 'fa-file-text-o'
  }
  return picto
}

export function topLevelCategory (file, iconMetadata) {
  if (file.type !== 'directory' || !file.isTopLevel) {
    return ''
  }
  if (file.icon_class) {
    return file.icon_class + ' fa-5x'
  }

  let picto = ''
  if (iconMetadata.ids.indexOf(file.name) !== -1) {
    picto = file.name
  } else if (iconMetadata.names[file.name.toLowerCase()]) {
    picto = iconMetadata.names[file.name.toLowerCase()]
  } else {
    picto = 'folder'
  }
  return 'fa-' + picto + ' fa-5x'
}
