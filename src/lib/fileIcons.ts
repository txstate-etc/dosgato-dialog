import type { IconifyIcon } from '@iconify/svelte'
import archive from '@iconify-icons/ph/archive.js'
import fileCode from '@iconify-icons/ph/file-code.js'
import fileText from '@iconify-icons/ph/file-text.js'
import fileAudio from '@iconify-icons/ph/file-audio.js'
import filePdf from '@iconify-icons/ph/file-pdf'
import fileIcon from '@iconify-icons/ph/file.js'
import fileCsv from '@iconify-icons/ph/file-csv.js'
import fileVideo from '@iconify-icons/ph/file-video.js'
import fileImage from '@iconify-icons/ph/file-image.js'
import microsoftExcel from '@iconify-icons/ph/file-xls.js'
import microsoftWord from '@iconify-icons/ph/file-doc.js'

const fileIconsByMime: Record<string, IconifyIcon> = {
  'application/vnd.ms-excel': microsoftExcel,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': microsoftExcel,
  'application/vnd.oasis.opendocument.spreadsheet': microsoftExcel,
  'text/csv': fileCsv,
  'application/msword': microsoftWord,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': microsoftWord,
  'application/vnd.oasis.opendocument.text': microsoftWord,
  'application/rtf': microsoftWord,
  'application/pdf': filePdf,
  'application/json': fileCode,
  'application/x-httpd-php': fileCode,
  'application/x-sh': fileCode,
  'application/xml': fileCode,
  'text/css': fileCode,
  'text/html': fileCode,
  'text/javascript': fileCode,
  'application/gzip': archive,
  'application/java-archive': archive,
  'application/zip': archive,
  'application/vnd.apple.installer+xml': archive,
  'application/vnd.rar': archive,
  'application/x-7z-compressed': archive,
  'application/x-bzip': archive,
  'application/x-bzip2': archive,
  'application/x-tar': archive
}
const prefixes: Record<string, IconifyIcon> = {
  image: fileImage,
  text: fileText,
  video: fileVideo,
  audio: fileAudio
}

export function iconForMime (mime: string) {
  return fileIconsByMime[mime] ?? prefixes[mime.split('/', 2)[0]] ?? fileIcon
}
