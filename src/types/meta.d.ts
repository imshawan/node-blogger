export interface IMeta {
  siteName: string
  description: string
  session: Session
  cookie: Cookie
  cors: CorsOptions
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
