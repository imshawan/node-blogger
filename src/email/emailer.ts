import services from "nodemailer/lib/well-known/services.json"

export const getWellknownServices = (): string[] => Object.keys(services);