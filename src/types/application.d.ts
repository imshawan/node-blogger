
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
  maxPasswordLength: number
  maxUsernameLength: number
  maxEmailLength: number
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