
export type AppKeysArray = Array<keyof IApplication>;

export interface IApplication {
    _id: string
    _key: string
    siteName: string
    siteNameUrl: string
    siteShortName: string
    description: string
    keywords: Array<string>
    logo: string
    favicon: string
    altLogoText: string
    logoRedirectionUrl: string
    session: Session
    cookie: Cookie
    cors: CorsOptions
    manifest: Manifest
    robots: Robots
    xPoweredByHeaders: string
    maximumRequestBodySize: string
    allowTags: boolean
    allowLike: boolean
    allowDislike: boolean
    allowComments: boolean
    allowGuestComments: boolean
    allowUsernameChange: boolean
    allowEmailChange: boolean
    allowAccountDeletion: boolean
    allowSelfSuspension: boolean
    gdprConsent: true
    storeUsernameHistory: boolean
    automaticLogoutDuration: Number
    accountLockDuration: Number
    sessionExpiryDuration: Number
    maxLoginPerHour: Number
    maxPasswordResetRequests: Number
    minPostTitleLength: number
    maxPostTitleLength: number
    minPostLength: number
    maxPostLength: number
    minTagsPerPost: number
    maxTagsPerPost: number
    maxPostThumbnailSize: number
    allowedFileTypes: string[]
    maxFileSize: number
    maxFileSizeUnit: string
    maxImageFileSize: number
    maxImageFileSizeUnit: string
    maxImageWidth: number
    minImageWidth: number
    maxProfileImageSize: number
    maxProfileImageSizeUnit: string
    profileImageDimension: number
    maxCoverImageSize: number
    maxCoverImageSizeUnit: string
    enableFileCompression: boolean
    enableImageResize: boolean
    resizedImageHeight: number
    resizedImageWidth: number
    resizedImageQuality: number
    stripFileMetadata: boolean
    keepOldProfilePictures: boolean
    externalLinks: string
    registerationType: string
    maxPasswordLength: number
    maxUsernameLength: number
    maxEmailLength: number
    maxCategoryNameLength: number
    maxCategoryDescriptionLength: number
    maxCategoryBlurbLength: number
    minPasswordLength: number
    minUsernameLength: number
    minEmailLength: number
    minPasswordStrength: number
    maxFullnameLength: number
    minFullnameLength: number
    maxLocationLength: number
    minLocationLength: number
    maxBioLength: number
    minBioLength: number
    maxAboutLength: number
    minAboutLength: number
    maxTagLength: number
    minTagLength: number
    sorting: string
    registrationType: string
}

export interface IRegistrationTypes {
    default: string
    inviteOnly: string
    adminInviteOnly: string
    disabled: string
}
export interface Session {
    name: string
    saveUninitialized: boolean
    resave: boolean
}

export interface Cookie {
    maxTTLDays: number
}

export interface CorsOptions {
    allowedHeaders: string | string[] | undefined
    whitelistOrigins?: string | undefined
    credentials?: boolean | undefined
}

export interface Manifest {
    backgroundColor: string
    themeColor: string
}

export interface Robots {
    allowed: Array<string>
    disallowed: Array<string>
    userAgents: Array<string>
}