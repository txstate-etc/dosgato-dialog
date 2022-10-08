import type { IconifyIcon } from '@iconify/svelte'
import archiveLight from '@iconify-icons/ph/archive-light.js'
import fileCodeLight from '@iconify-icons/ph/file-code-light.js'
import fileTextLight from '@iconify-icons/ph/file-text-light.js'
import fileAudioLight from '@iconify-icons/ph/file-audio-light.js'
import filePdfLight from '@iconify-icons/ph/file-pdf-light'
import fileLight from '@iconify-icons/ph/file-light.js'
import fileCsvLight from '@iconify-icons/ph/file-csv-light.js'
import fileVideoLight from '@iconify-icons/ph/file-video-light.js'
import fileImageLight from '@iconify-icons/ph/file-image-light.js'
import microsoftExcel from '@iconify-icons/ph/file-xls-light.js'
import microsoftWord from '@iconify-icons/ph/file-doc-light.js'

const fileIconsByMime: Record<string, IconifyIcon> = {
  'application/vnd.ms-excel': microsoftExcel,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': microsoftExcel,
  'application/vnd.oasis.opendocument.spreadsheet': microsoftExcel,
  'text/csv': fileCsvLight,
  'application/msword': microsoftWord,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': microsoftWord,
  'application/vnd.oasis.opendocument.text': microsoftWord,
  'application/rtf': microsoftWord,
  'application/pdf': filePdfLight,
  'application/json': fileCodeLight,
  'application/x-httpd-php': fileCodeLight,
  'application/x-sh': fileCodeLight,
  'application/xml': fileCodeLight,
  'text/css': fileCodeLight,
  'text/html': fileCodeLight,
  'text/javascript': fileCodeLight,
  'application/gzip': archiveLight,
  'application/java-archive': archiveLight,
  'application/zip': archiveLight,
  'application/vnd.apple.installer+xml': archiveLight,
  'application/vnd.rar': archiveLight,
  'application/x-7z-compressed': archiveLight,
  'application/x-bzip': archiveLight,
  'application/x-bzip2': archiveLight,
  'application/x-tar': archiveLight
}
const prefixes: Record<string, IconifyIcon> = {
  image: fileImageLight,
  text: fileTextLight,
  video: fileVideoLight,
  audio: fileAudioLight
}

export function iconForMime (mime: string) {
  return fileIconsByMime[mime] ?? prefixes[mime.split('/', 2)[0]] ?? fileLight
}
