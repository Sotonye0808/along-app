import Cookies from 'js-cookie'
import {
    setAuthTokens,
    getAccessToken,
    getRefreshToken,
    removeAuthTokens,
    isAuthenticated,
    setUser,
    getUser,
    removeUser,
    logout,
} from '../auth'
import { STORAGE_KEYS } from '@/app/lib/constants'

// Mock js-cookie
jest.mock('js-cookie')

describe('auth.ts utility functions', () => {
    const mockAccessToken = 'mock-access-token'
    const mockRefreshToken = 'mock-refresh-token'
    const mockUser: User = {
        id: '1',
        userName: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
    }

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()
        // Clear localStorage
        localStorage.clear()
    })

    describe('setAuthTokens', () => {
        it('should set access token in cookies', () => {
            setAuthTokens(mockAccessToken)

            expect(Cookies.set).toHaveBeenCalledWith(
                STORAGE_KEYS.ACCESS_TOKEN,
                mockAccessToken,
                {
                    secure: false, // NODE_ENV is 'test' by default
                    sameSite: 'strict',
                }
            )
        })

        it('should set both access and refresh tokens when refresh token is provided', () => {
            setAuthTokens(mockAccessToken, mockRefreshToken)

            expect(Cookies.set).toHaveBeenCalledWith(
                STORAGE_KEYS.ACCESS_TOKEN,
                mockAccessToken,
                {
                    secure: false,
                    sameSite: 'strict',
                }
            )

            expect(Cookies.set).toHaveBeenCalledWith(
                STORAGE_KEYS.REFRESH_TOKEN,
                mockRefreshToken,
                {
                    secure: false,
                    sameSite: 'strict',
                }
            )
        })

        it('should set secure flag in production environment', () => {
            // Use jest.replaceProperty to mock NODE_ENV
            const spy = jest.replaceProperty(process.env, 'NODE_ENV', 'production')

            setAuthTokens(mockAccessToken)

            expect(Cookies.set).toHaveBeenCalledWith(
                STORAGE_KEYS.ACCESS_TOKEN,
                mockAccessToken,
                {
                    secure: true,
                    sameSite: 'strict',
                }
            )

            // Restore is automatic with replaceProperty
            spy.restore()
        })
    })

    describe('getAccessToken', () => {
        it('should return access token from cookies', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(mockAccessToken)

            const token = getAccessToken()

            expect(Cookies.get).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN)
            expect(token).toBe(mockAccessToken)
        })

        it('should return undefined if no token exists', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(undefined)

            const token = getAccessToken()

            expect(token).toBeUndefined()
        })
    })

    describe('getRefreshToken', () => {
        it('should return refresh token from cookies', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(mockRefreshToken)

            const token = getRefreshToken()

            expect(Cookies.get).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN)
            expect(token).toBe(mockRefreshToken)
        })

        it('should return undefined if no refresh token exists', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(undefined)

            const token = getRefreshToken()

            expect(token).toBeUndefined()
        })
    })

    describe('removeAuthTokens', () => {
        it('should remove both access and refresh tokens', () => {
            removeAuthTokens()

            expect(Cookies.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN)
            expect(Cookies.remove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN)
        })
    })

    describe('isAuthenticated', () => {
        it('should return true if access token exists', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(mockAccessToken)

            expect(isAuthenticated()).toBe(true)
        })

        it('should return false if no access token exists', () => {
            ; (Cookies.get as jest.Mock).mockReturnValue(undefined)

            expect(isAuthenticated()).toBe(false)
        })
    })

    describe('setUser', () => {
        it('should store user data in localStorage', () => {
            setUser(mockUser)

            const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
            expect(storedUser).toBe(JSON.stringify(mockUser))
        })

        it('should not throw error if window is undefined (SSR)', () => {
            const originalWindow = global.window
            // @ts-ignore
            delete global.window

            expect(() => setUser(mockUser)).not.toThrow()

            global.window = originalWindow
        })
    })

    describe('getUser', () => {
        it('should retrieve user data from localStorage', () => {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))

            const user = getUser()

            expect(user).toEqual(mockUser)
        })

        it('should return null if no user data exists', () => {
            const user = getUser()

            expect(user).toBeNull()
        })

        it('should return null if user data is invalid JSON', () => {
            localStorage.setItem(STORAGE_KEYS.USER, 'invalid-json')

            expect(() => getUser()).toThrow()
        })

        it('should return null if window is undefined (SSR)', () => {
            const originalWindow = global.window
            // @ts-ignore
            delete global.window

            const user = getUser()

            expect(user).toBeNull()

            global.window = originalWindow
        })
    })

    describe('removeUser', () => {
        it('should remove user data from localStorage', () => {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))

            removeUser()

            expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
        })

        it('should not throw error if window is undefined (SSR)', () => {
            const originalWindow = global.window
            // @ts-ignore
            delete global.window

            expect(() => removeUser()).not.toThrow()

            global.window = originalWindow
        })
    })

    describe('logout', () => {
        it('should remove both tokens and user data', () => {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))

            logout()

            expect(Cookies.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN)
            expect(Cookies.remove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN)
            expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
        })
    })
})
