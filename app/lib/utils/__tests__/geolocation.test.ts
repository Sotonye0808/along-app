import {
  getCurrentPosition,
  reverseGeocode,
  getCurrentLocation,
  isGeolocationAvailable,
  requestLocationPermission,
} from '../geolocation'

function ensureNavigator() {
  if (typeof global.navigator === 'undefined') {
    Object.defineProperty(global, 'navigator', { value: {}, configurable: true })
  }
}

function setGeolocationMock(value: any) {
  ensureNavigator()
  Object.defineProperty(global.navigator as any, 'geolocation', { value, configurable: true })
}

describe('geolocation.ts utility functions', () => {
  const mockCoordinates = {
    latitude: 6.5244,
    longitude: 3.3792,
  }

  const mockPosition = {
    coords: {
      latitude: mockCoordinates.latitude,
      longitude: mockCoordinates.longitude,
      accuracy: 100,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn()
    // Ensure navigator exists for geolocation mocks
    setGeolocationMock({
      getCurrentPosition: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentPosition', () => {
    it('should resolve with coordinates when geolocation succeeds', async () => {
      const mockGetCurrentPosition = jest.fn((success) => {
        success(mockPosition)
      })
      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      const result = await getCurrentPosition()

      expect(result).toEqual(mockCoordinates)
      expect(mockGetCurrentPosition).toHaveBeenCalled()
    })

    it('should reject with error when geolocation is not supported', async () => {
      // @ts-ignore
      setGeolocationMock(undefined)

      await expect(getCurrentPosition()).rejects.toThrow(
        'Geolocation is not supported by your browser'
      )
    })

    it('should reject with permission denied error', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      const mockGetCurrentPosition = jest.fn((success, error) => {
        error(mockError)
      })

      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      await expect(getCurrentPosition()).rejects.toThrow(
        'Location access denied. Please enable location permissions.'
      )
    })

    it('should reject with position unavailable error', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      const mockGetCurrentPosition = jest.fn((success, error) => {
        error(mockError)
      })

      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      await expect(getCurrentPosition()).rejects.toThrow(
        'Location information unavailable'
      )
    })

    it('should reject with timeout error', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      const mockGetCurrentPosition = jest.fn((success, error) => {
        error(mockError)
      })

      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      await expect(getCurrentPosition()).rejects.toThrow(
        'Location request timed out'
      )
    })
  })

  describe('reverseGeocode', () => {
    it('should return formatted location with city and state', async () => {
      const mockResponse = {
        address: {
          city: 'Lagos',
          state: 'Lagos State',
          country: 'Nigeria',
        },
      }

        ; (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })

      const result = await reverseGeocode(mockCoordinates)

      expect(result).toEqual({
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
        formatted: 'Lagos, Lagos State',
        coordinates: mockCoordinates,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org'),
        expect.objectContaining({
          headers: {
            'User-Agent': 'Along App',
          },
        })
      )
    })

    it('should format location with city and country if no state', async () => {
      const mockResponse = {
        address: {
          city: 'Lagos',
          country: 'Nigeria',
        },
      }

        ; (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })

      const result = await reverseGeocode(mockCoordinates)

      expect(result.formatted).toBe('Lagos, Nigeria')
    })

    it('should handle town instead of city', async () => {
      const mockResponse = {
        address: {
          town: 'Abuja',
          state: 'FCT',
          country: 'Nigeria',
        },
      }

        ; (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })

      const result = await reverseGeocode(mockCoordinates)

      expect(result.city).toBe('Abuja')
      expect(result.formatted).toBe('Abuja, FCT')
    })

    it('should handle village instead of city', async () => {
      const mockResponse = {
        address: {
          village: 'Small Village',
          state: 'Some State',
          country: 'Nigeria',
        },
      }

        ; (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })

      const result = await reverseGeocode(mockCoordinates)

      expect(result.city).toBe('Small Village')
    })

    it('should fallback to coordinates if geocoding fails', async () => {
      ; (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await reverseGeocode(mockCoordinates)

      expect(result).toEqual({
        formatted: '6.5244, 3.3792',
        coordinates: mockCoordinates,
      })
    })

    it('should fallback to coordinates if response is not ok', async () => {
      ; (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      })

      const result = await reverseGeocode(mockCoordinates)

      expect(result.formatted).toBe('6.5244, 3.3792')
    })

    it('should handle empty address object', async () => {
      const mockResponse = {
        address: {},
      }

        ; (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })

      const result = await reverseGeocode(mockCoordinates)

      expect(result.formatted).toBe('Unknown Location')
    })

  })

  describe('getCurrentLocation', () => {
    it('should combine getCurrentPosition and reverseGeocode', async () => {
      const mockGetCurrentPosition = jest.fn((success) => {
        success(mockPosition)
      })

      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      const mockResponse = {
        address: {
          city: 'Lagos',
          state: 'Lagos State',
          country: 'Nigeria',
        },
      }

        ; (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })

      const result = await getCurrentLocation()

      expect(result).toEqual({
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
        formatted: 'Lagos, Lagos State',
        coordinates: mockCoordinates,
      })
    })

    it('should throw when geolocation is not supported', async () => {
      setGeolocationMock(undefined)

      await expect(getCurrentLocation()).rejects.toThrow(
        'Geolocation is not supported by your browser'
      )
    })
  })

  describe('isGeolocationAvailable', () => {
    it('should return true when geolocation is available', () => {
      setGeolocationMock({
        getCurrentPosition: jest.fn(),
      })

      expect(isGeolocationAvailable()).toBe(true)
    })

    it('should return false when geolocation is not available', () => {
      // Delete the property instead of setting to undefined
      delete (global.navigator as any).geolocation

      expect(isGeolocationAvailable()).toBe(false)

      // Restore it for other tests
      setGeolocationMock({
        getCurrentPosition: jest.fn(),
      })
    })
  })

  describe('requestLocationPermission', () => {
    it('should return true when permission is granted', async () => {
      const mockGetCurrentPosition = jest.fn((success) => {
        success(mockPosition)
      })

      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      const result = await requestLocationPermission()

      expect(result).toBe(true)
    })

    it('should return false when geolocation is not available', async () => {
      setGeolocationMock(undefined)

      const result = await requestLocationPermission()

      expect(result).toBe(false)
    })

    it('should return false when permission is denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      const mockGetCurrentPosition = jest.fn((success, error) => {
        error(mockError)
      })

      setGeolocationMock({
        getCurrentPosition: mockGetCurrentPosition,
      })

      const result = await requestLocationPermission()

      expect(result).toBe(false)
    })
  })
})
