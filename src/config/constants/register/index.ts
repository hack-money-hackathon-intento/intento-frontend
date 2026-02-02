import { ensureEnvVar } from "@/helpers/ensure-env.helper"

export const register = {
  octav: {
    apiKey: ensureEnvVar(process.env.NEXT_PUBLIC_OCTAV_API_KEY, 'NEXT_PUBLIC_OCTAV_API_KEY')
  },
  oneInch: {
    apiKey: ensureEnvVar(process.env.NEXT_PUBLIC_ONE_INCH_API_KEY, 'NEXT_PUBLIC_ONE_INCH_API_KEY')
  }
}