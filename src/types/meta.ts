export interface IMeta {
  siteName: string
  description: string
  session: Session
  cookie: Cookie
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
}

export interface Session {
  name: string
  saveUninitialized: boolean
  resave: boolean
}

export interface Cookie {
  maxTTLDays: number
}
