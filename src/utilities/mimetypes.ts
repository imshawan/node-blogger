/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export class MimeTypeResolver {
    private readonly mimeTypeMap: { [mimeType: string]: string };
    private readonly extensionMap: { [extension: string]: string };
  
    constructor() {
      this.mimeTypeMap = {
        // Video
        'video/mp4': '.mp4',
        'video/mpeg': '.mpeg',
        'video/quicktime': '.mov',
        'video/x-msvideo': '.avi',
        'video/x-ms-wmv': '.wmv',
        'video/webm': '.webm',
        'video/x-flv': '.flv',
        'video/3gpp': '.3gp',
        // Audio
        'audio/mpeg': '.mp3',
        'audio/wav': '.wav',
        'audio/x-ms-wma': '.wma',
        'audio/x-flac': '.flac',
        'audio/aac': '.aac',
        'audio/midi': '.mid',
        'audio/ogg': '.ogg',
        // Document
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/rtf': '.rtf',
        'application/json': '.json',
        'application/vnd.oasis.opendocument.text': '.odt',
        // Image
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/svg+xml': '.svg',
        'image/bmp': '.bmp',
        'image/tiff': '.tiff',
        'image/webp': '.webp',
        // Archive
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'application/x-tar': '.tar',
        'application/x-7z-compressed': '.7z',
        'application/x-gzip': '.gz',
        'application/x-bzip2': '.bz2',
        // Text
        'text/plain': '.txt',
        'text/html': '.html',
        'text/css': '.css',
        'text/javascript': '.js',
        'application/xml': '.xml',
        // Application
        'application/octet-stream': '.bin',
        'application/x-shockwave-flash': '.swf',
        // Add more MIME type mappings here
      };

      this.extensionMap = {};

      this.generateExtensionMap = this.generateExtensionMap.bind(this);
      this.getFileExtensionByMimeType = this.getFileExtensionByMimeType.bind(this);
      this.getMimeTypeByExtension = this.getMimeTypeByExtension.bind(this);

      this.generateExtensionMap();
    }
  
    private generateExtensionMap () {
        for (const mimeType in this.mimeTypeMap) {
          const extension = this.mimeTypeMap[mimeType];
          this.extensionMap[extension] = mimeType;
        }
    }

    public getFileExtensionByMimeType(mimeType: string): string {
      if (!mimeType) return '.bin';
      return this.mimeTypeMap[mimeType.toLowerCase()];
    }

    public getMimeTypeByExtension(extension: string=''): string {
        if (!extension) return 'application/octet-stream';
        return this.extensionMap[extension.toLowerCase()];
    }    
  }
  