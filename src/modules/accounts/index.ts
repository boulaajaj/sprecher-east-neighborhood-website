// Types and pure rules only, so client components and scripts can import it without pulling in
// React or Payload. Use cases and the components pages render are in server.ts; the server
// actions are in actions.ts; the users collection is in cms.ts.
export { ACCOUNT_PATH } from './domain/paths'
export { parseLinkToken } from './domain/linkToken'
export type {
  AccountSummary,
  ActionResult,
  CurrentUser,
  ForgotPasswordFailure,
  PasswordFailure,
  ResetPasswordFailure,
  SignInFailure,
  SignUpFailure,
  VerifyAccountFailure,
} from './domain/types'
