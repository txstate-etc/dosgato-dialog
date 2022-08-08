import type { IconifyIcon } from '@iconify/svelte'
import archiveOutline from '@iconify-icons/mdi/archive-outline.js'
import fileCodeOutline from '@iconify-icons/mdi/file-code-outline.js'
import fileDocumentOutline from '@iconify-icons/mdi/file-document-outline.js'
import fileMusicOutline from '@iconify-icons/mdi/file-music-outline.js'
import fileOutline from '@iconify-icons/mdi/file-outline.js'
import fileTableOutline from '@iconify-icons/mdi/file-table-outline.js'
import fileVideoOutline from '@iconify-icons/mdi/file-video-outline.js'
import fileImageOutline from '@iconify-icons/mdi/file-image-outline.js'
import microsoftExcel from '@iconify-icons/mdi/microsoft-excel.js'
import microsoftWord from '@iconify-icons/mdi/microsoft-word.js'
import noteTextOutline from '@iconify-icons/mdi/note-text-outline.js'

const fileIconsByMime: Record<string, IconifyIcon> = {
  'application/vnd.ms-excel': microsoftExcel,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': microsoftExcel,
  'application/vnd.oasis.opendocument.spreadsheet': microsoftExcel,
  'text/csv': fileTableOutline,
  'application/msword': microsoftWord,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': microsoftWord,
  'application/vnd.oasis.opendocument.text': microsoftWord,
  'application/rtf': microsoftWord,
  'application/pdf': fileDocumentOutline,
  'application/json': fileCodeOutline,
  'application/x-httpd-php': fileCodeOutline,
  'application/x-sh': fileCodeOutline,
  'application/xml': fileCodeOutline,
  'text/css': fileCodeOutline,
  'text/html': fileCodeOutline,
  'text/javascript': fileCodeOutline,
  'application/gzip': archiveOutline,
  'application/java-archive': archiveOutline,
  'application/zip': archiveOutline,
  'application/vnd.apple.installer+xml': archiveOutline,
  'application/vnd.rar': archiveOutline,
  'application/x-7z-compressed': archiveOutline,
  'application/x-bzip': archiveOutline,
  'application/x-bzip2': archiveOutline,
  'application/x-tar': archiveOutline
}
const prefixes: Record<string, IconifyIcon> = {
  image: fileImageOutline,
  text: noteTextOutline,
  video: fileVideoOutline,
  audio: fileMusicOutline
}

export function iconForMime (mime: string) {
  return fileIconsByMime[mime] ?? prefixes[mime.split('/', 2)[0]] ?? fileOutline
}
