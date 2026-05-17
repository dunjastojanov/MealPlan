import type { User as AuthUser } from '@supabase/supabase-js'
import type { AuthResult, LoginInput, RegisterInput, User } from '../types'
import { supabase } from '../lib/supabase'

const PROFILE_NOT_FOUND_MESSAGE =
  'Profil naloga nije pronađen. Registrujte se ponovo ili kontaktirajte podršku.'

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Pogrešan email ili lozinka.'
  }
  if (lower.includes('user already registered')) {
    return 'Nalog sa ovim emailom već postoji.'
  }
  if (
    lower.includes('cannot coerce') ||
    lower.includes('json object') ||
    lower.includes('0 rows')
  ) {
    return PROFILE_NOT_FOUND_MESSAGE
  }
  return message
}

type ProfileFields = {
  firstName: string
  lastName: string
  calorieGoal: number
  proteinGoal: number
}

function signUpMetadata(input: RegisterInput): Record<string, string | number> {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    calorie_goal: input.calorieGoal,
    protein_goal: input.proteinGoal,
  }
}

function profileFieldsFromMetadata(
  metadata: Record<string, unknown> | undefined,
): ProfileFields | null {
  if (!metadata) {
    return null
  }

  const firstName = metadata.first_name
  const lastName = metadata.last_name
  const calorieGoal = Number(metadata.calorie_goal)
  const proteinGoal = Number(metadata.protein_goal)

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    !Number.isFinite(calorieGoal) ||
    !Number.isFinite(proteinGoal) ||
    calorieGoal <= 0 ||
    proteinGoal <= 0
  ) {
    return null
  }

  return { firstName, lastName, calorieGoal, proteinGoal }
}

async function fetchUserProfileById(userId: string): Promise<User | null> {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw new Error(mapAuthError(profileError.message))
  }

  return profile as User | null
}

async function createUserProfile(
  userId: string,
  fields: ProfileFields,
): Promise<User> {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert({
      id: userId,
      first_name: fields.firstName,
      last_name: fields.lastName,
      calorie_goal: fields.calorieGoal,
      protein_goal: fields.proteinGoal,
    })
    .select()
    .single()

  if (profileError) {
    throw new Error(mapAuthError(profileError.message))
  }

  return profile as User
}

async function resolveUserProfile(authUser: AuthUser): Promise<User> {
  const existing = await fetchUserProfileById(authUser.id)
  if (existing) {
    return existing
  }

  const fields = profileFieldsFromMetadata(authUser.user_metadata)
  if (fields) {
    return createUserProfile(authUser.id, fields)
  }

  throw new Error(PROFILE_NOT_FOUND_MESSAGE)
}

function assertPositiveGoals(calorieGoal: number, proteinGoal: number): void {
  if (calorieGoal <= 0 || proteinGoal <= 0) {
    throw new Error('Ciljevi za kalorije i proteine moraju biti veći od nule.')
  }
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { email, password, calorieGoal, proteinGoal } = input

  assertPositiveGoals(calorieGoal, proteinGoal)

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: signUpMetadata(input),
    },
  })

  if (signUpError) {
    throw new Error(mapAuthError(signUpError.message))
  }

  const authUser = authData.user
  if (!authUser) {
    throw new Error('Registracija nije uspela. Pokušajte ponovo.')
  }

  let profile: User
  try {
    profile = await resolveUserProfile(authUser)
  } catch (err) {
    if (authData.session) {
      await supabase.auth.signOut()
    }
    throw err
  }

  if (!authData.session) {
    throw new Error(
      'Proverite email da potvrdite nalog, zatim se prijavite.',
    )
  }

  return {
    session: authData.session,
    user: profile,
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input

  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    throw new Error(mapAuthError(signInError.message))
  }

  const authUser = authData.user
  const session = authData.session
  if (!authUser || !session) {
    throw new Error('Prijava nije uspela. Pokušajte ponovo.')
  }

  const profile = await resolveUserProfile(authUser)

  return {
    session,
    user: profile,
  }
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(mapAuthError(error.message))
  }
}

export async function fetchUserProfile(userId: string): Promise<User> {
  const profile = await fetchUserProfileById(userId)
  if (!profile) {
    throw new Error(PROFILE_NOT_FOUND_MESSAGE)
  }

  return profile
}

export async function getSession(): Promise<AuthResult | null> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(mapAuthError(sessionError.message))
  }

  const session = sessionData.session
  if (!session) {
    return null
  }

  const user = await fetchUserProfile(session.user.id)

  return {
    session,
    user,
  }
}
