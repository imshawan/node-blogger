enum AllowedImageExtensions {
    bmp = 'image/bmp',
    gif = 'image/gif',
    ief = 'image/ief',
    jfif = 'image/pipeg',
    jpeg = 'image/jpeg',
    jpg = 'image/jpeg',
    png = 'image/png',
    svg = 'image/svg+xml',
    tif = 'image/tiff',
    tiff = 'image/tiff',
}

enum IconDensity {
    sdpi = 0.75,
    mdpi = 1,
    hdpi = 1.5,
    xdpi = 2,
    xxhdpi = 3,
    xxxhdpi = 4,
    xxxxhdpi = 10,
}

enum IconDensityWithSizes {
    sdpi = 36,
    mdpi = 48,
    hdpi = 72,
    xdpi = 96,
    xxhdpi = 144,
    xxxhdpi = 192,
    xxxxhdpi = 512
}

export {AllowedImageExtensions, IconDensity, IconDensityWithSizes};