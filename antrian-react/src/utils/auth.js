export const PETUGAS_KEY = 'petugas_auth_user'
export const NURSE_KEY = 'nurse_auth_user'
export const ADMIN_KEY = 'admin_auth_user'
export const COUNTER_KEY = 'petugas_counter_id'

function readUser(key) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch {
        localStorage.removeItem(key)
        return null
    }
}

const roleOf = (user) => String(user?.role || '').toLowerCase()

// ===== PETUGAS =====
export const getPetugas = () => readUser(PETUGAS_KEY)

export const isPetugasLoggedIn = () => roleOf(getPetugas()) === 'petugas'

export const savePetugas = (user) =>
    localStorage.setItem(PETUGAS_KEY, JSON.stringify(user))

export function logoutPetugas() {
    localStorage.removeItem(PETUGAS_KEY)
    localStorage.removeItem(COUNTER_KEY)
}

// ===== NURSE =====
export const getNurse = () => readUser(NURSE_KEY)

export const getNurseIzin = () => getNurse()?.hak_akses || {}

export const isNurseLoggedIn = () => roleOf(getNurse()) === 'nurse'

export const saveNurse = (user) =>
    localStorage.setItem(NURSE_KEY, JSON.stringify(user))

export function logoutNurse() {
    localStorage.removeItem(NURSE_KEY)
}

// ===== ADMIN / IT =====
export const isAdminLoggedIn = () => roleOf(readUser(ADMIN_KEY)) === 'admin'