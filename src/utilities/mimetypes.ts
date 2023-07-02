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

    public getFileExtensionByMimeType(mimeType: string): string | undefined {
      return this.mimeTypeMap[mimeType.toLowerCase()];
    }

    public getMimeTypeByExtension(extension: string): string | undefined {
        return this.extensionMap[extension.toLowerCase()];
    }    
  }
  