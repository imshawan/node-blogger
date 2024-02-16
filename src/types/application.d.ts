import { ObjectId } from "mongodb";

export type AppKeysArray = Array<keyof IApplication>;

export interface IApplication {
    /**
     * Unique identifier for the application (MongoDb ObjectId).
     */
    _id: string | ObjectId;

    /**
     * Unique key associated with the application.
     */
    _key: string;

    /**
     * Scheme of how _key is declared
     */
    _scheme?: string

    /**
     * Name of the site.
     */
    siteName: string;

    /**
     * URL associated with the site name.
     */
    siteNameUrl: string;

    /**
     * Shortened version of the site name.
     */
    siteShortName: string;

    /**
     * Text for the hero section
     */
    heroSection: string

    /**
     * Whether to capitalize the hero section content. Default: true
     */
    capitalizeHeroSection: boolean;

    /**
     * Description of the application/site.
     */
    description: string;

    /**
     * Array of keywords associated with the site.
     */
    keywords: Array<string>;

    /**
     * URL or path to the application's logo.
     */
    logo: string;

    /**
     * URL or path to the application's favicon.
     */
    favicon: string;

    /**
     * Alternative text for the logo.
     */
    altLogoText: string;

    /**
     * URL to redirect when the logo is clicked.
     */
    logoRedirectionUrl: string;

    /**
     * Configuration for session management.
     */
    session: Session;

    /**
     * Configuration for cookie settings.
     */
    cookie: Cookie;

    /**
     * Cross-origin resource sharing options.
     */
    cors: CorsOptions;

    /**
     * Configuration for the web app manifest.
     */
    manifest: Manifest;

    /**
     * Configuration for robots.txt file.
     */
    robots: Robots;

    /**
     * Value for X-Powered-By headers.
     */
    xPoweredByHeaders: string;

    /**
     * Maximum size of the request body.
     */
    maximumRequestBodySize: string;

    /**
     * Flag for allowing tags.
     */
    allowTags: boolean;

    /**
     * Flag for allowing likes.
     */
    allowLike: boolean;

    /**
     * Flag for allowing dislikes.
     */
    allowDislike: boolean;

    /**
     * Flag for allowing comments.
     */
    allowComments: boolean;

    /**
     * Flag for allowing guest comments.
     */
    allowGuestComments: boolean;

    /**
     * Flag for allowing username changes.
     */
    allowUsernameChange: boolean;

    /**
     * Flag for allowing email changes.
     */
    allowEmailChange: boolean;

    /**
     * Flag for allowing account deletion.
     */
    allowAccountDeletion: boolean;

    /**
     * Flag for allowing self-suspension.
     */
    allowSelfSuspension: boolean;

    /**
     * Flag indicating GDPR consent.
     */
    gdprConsent: boolean;

    /**
     * Flag to store username history.
     */
    storeUsernameHistory: boolean;

    /**
     * Duration for automatic logout.
     */
    automaticLogoutDuration: Number;

    /**
     * Duration for account lock.
     */
    accountLockDuration: Number;

    /**
     * Duration for session expiry.
     */
    sessionExpiryDuration: Number;

    /**
     * Maximum login attempts per hour.
     */
    maxLoginPerHour: Number;

    /**
     * Maximum password reset requests.
     */
    maxPasswordResetRequests: Number;

    /**
     * Minimum length for post titles.
     */
    minPostTitleLength: number;

    /**
     * Maximum length for post titles.
     */
    maxPostTitleLength: number;

    /**
     * Minimum length for posts.
     */
    minPostLength: number;

    /**
     * Maximum length for posts.
     */
    maxPostLength: number;

    /**
     * Minimum number of tags per post.
     */
    minTagsPerPost: number;

    /**
     * Maximum number of tags per post.
     */
    maxTagsPerPost: number;

    /**
     * Maximum length of the blurb size in each posts (the short description beneath each post)
     */
    maxPostBlurbSize: number

    /**
     * Maximum size for post thumbnails.
     */
    maxPostThumbnailSize: number;

    /**
     * Array of allowed file types.
     */
    allowedFileTypes: string[];

    /**
     * Maximum file size.
     */
    maxFileSize: number;

    /**
     * Unit for maximum file size.
     */
    maxFileSizeUnit: string;

    /**
     * Maximum image file size.
     */
    maxImageFileSize: number;

    /**
     * Unit for maximum image file size.
     */
    maxImageFileSizeUnit: string;

    /**
     * Maximum image width.
     */
    maxImageWidth: number;

    /**
     * Minimum image width.
     */
    minImageWidth: number;

    /**
     * Maximum profile image size.
     */
    maxProfileImageSize: number;

    /**
     * Unit for maximum profile image size.
     */
    maxProfileImageSizeUnit: string;

    /**
     * Dimension for profile images.
     */
    profileImageDimension: number;

    /**
     * Maximum cover image size.
     */
    maxCoverImageSize: number;

    /**
     * Unit for maximum cover image size.
     */
    maxCoverImageSizeUnit: string;

    /**
     * Flag for enabling file compression.
     */
    enableFileCompression: boolean;

    /**
     * Flag for enabling image resizing.
     */
    enableImageResize: boolean;

    /**
     * Height for resized images.
     */
    resizedImageHeight: number;

    /**
     * Width for resized images.
     */
    resizedImageWidth: number;

    /**
     * Quality for resized images.
     */
    resizedImageQuality: number;

    /**
     * Flag for stripping file metadata.
     */
    stripFileMetadata: boolean;

    /**
     * Flag for keeping old profile pictures.
     */
    keepOldProfilePictures: boolean;

    /**
     * External links associated with the application.
     */
    externalLinks: string;

    /**
     * Type of registration.
     */
    registerationType: string;

    /**
     * Maximum password length.
     */
    maxPasswordLength: number;

    /**
     * Maximum username length.
     */
    maxUsernameLength: number;

    /**
     * Maximum email length.
     */
    maxEmailLength: number;

    /**
     * Maximum category name length.
     */
    maxCategoryNameLength: number;

    /**
     * Maximum category description length.
     */
    maxCategoryDescriptionLength: number;

    /**
     * Maximum category blurb length.
     */
    maxCategoryBlurbLength: number;

    /**
     * Minimum password length.
     */
    minPasswordLength: number;

    /**
     * Minimum username length.
     */
    minUsernameLength: number;

    /**
     * Minimum email length.
     */
    minEmailLength: number;

    /**
     * Minimum password strength.
     */
    minPasswordStrength: number;

    /**
     * Maximum fullname length.
     */
    maxFullnameLength: number;

    /**
     * Minimum fullname length.
     */
    minFullnameLength: number;

    /**
     * Maximum location length.
     */
    maxLocationLength: number;

    /**
     * Minimum location length.
     */
    minLocationLength: number;

    /**
     * Maximum bio length.
     */
    maxBioLength: number;

    /**
     * Minimum bio length.
     */
    minBioLength: number;

    /**
     * Maximum "about" section length.
     */
    maxAboutLength: number;

    /**
     * Minimum "about" section length.
     */
    minAboutLength: number;

    /**
     * Maximum tag length.
     */
    maxTagLength: number;

    /**
     * Minimum tag length.
     */
    minTagLength: number;

    /**
     * Sorting criteria.
     */
    sorting: string;

    /**
     * Items per page (for pagination)
     */
    maxItemsPerPage: number

    /**
     * Type of registration.
     */
    registrationType: string;

    /**
     * Email address for application-related communication.
     */
    applicationEmail: string;

    /**
     * Sender name for application-related emails.
     */
    applicationEmailFromName: string;

    /**
     * Email service provider.
     */
    emailService: string;

    /**
     * Authentication type for email service.
     */
    emailServiceAuthenticationType: string;

    /**
     * Username for email service.
     */
    emailServiceUsername: string;

    /**
     * Password for email service.
     */
    emailServicePassword: string;

    /**
     * API key for email service.
     */
    emailServiceApiKey: string;

    /**
     * Name of the email service.
     */
    emailServiceName: string;

    /**
     * Hostname for the email service.
     */
    emailServiceHost: string;

    /**
     * Port for the email service.
     */
    emailServicePort: string | number;

    /**
     * Security level for the email service.
     */
    emailServiceSecurity: string;

    /**
     * Flag for email service pooling.
     */
    emailServicePooling: boolean;
}

export interface IRegistrationTypes {
    /**
     * Unique identifier for the registration type.
     */
    default: string;

    /**
     * Registration type for invite-only access.
     */
    inviteOnly: string;

    /**
     * Registration type for admin-invite-only access.
     */
    adminInviteOnly: string;

    /**
     * Registration type indicating disabled registration.
     */
    disabled: string;
}
export interface Session {
    /**
     * Name associated with the session.
     */
    name: string;

    /**
     * Flag indicating whether to save uninitialized sessions.
     */
    saveUninitialized: boolean;

    /**
     * Flag indicating whether to resave sessions.
     */
    resave: boolean;

}

export interface Cookie {
    /**
     * Maximum Time-to-Live (TTL) for cookies.
     */
    maxTTLDays: number
}

/**
 * Defines options for Cross-Origin Resource Sharing (CORS).
 * @interface CorsOptions
 */
export interface CorsOptions {
    /**
     * Allowed headers for CORS.
     */
    allowedHeaders: string | string[] | undefined

    /**
     * Whitelisted origins for CORS.
     */
    whitelistOrigins?: string | undefined

    /**
     * Indicates whether credentials are allowed for CORS.
     */
    credentials?: boolean | undefined
}

/**
 * @interface Manifest
 * @description Defines the structure for a web manifest.
 */
export interface Manifest {
    /**
     * Background color of the web application.
     */
    backgroundColor: string

    /**
     * Theme color of the web application.
     */
    themeColor: string
}

export interface Robots {
    allowed: Array<string>
    disallowed: Array<string>
    userAgents: Array<string>
}