import {
    formatDate,
    formatNumber,
    truncateText,
    getInitials,
    isValidEmail,
    generateSlug,
} from '../format'

describe('format.ts utility functions', () => {
    describe('formatDate', () => {
        beforeEach(() => {
            // Mock current date to Jan 1, 2024 12:00:00 for consistent testing
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should return "Just now" for dates less than 1 minute ago', () => {
            const date = new Date('2024-01-01T11:59:30Z').toISOString()
            expect(formatDate(date)).toBe('Just now')
        })

        it('should return minutes for dates less than 1 hour ago', () => {
            const date = new Date('2024-01-01T11:45:00Z').toISOString()
            expect(formatDate(date)).toBe('15 minutes ago')
        })

        it('should return singular "minute" for 1 minute ago', () => {
            const date = new Date('2024-01-01T11:59:00Z').toISOString()
            expect(formatDate(date)).toBe('1 minute ago')
        })

        it('should return hours for dates less than 1 day ago', () => {
            const date = new Date('2024-01-01T09:00:00Z').toISOString()
            expect(formatDate(date)).toBe('3 hours ago')
        })

        it('should return singular "hour" for 1 hour ago', () => {
            const date = new Date('2024-01-01T11:00:00Z').toISOString()
            expect(formatDate(date)).toBe('1 hour ago')
        })

        it('should return days for dates less than 1 week ago', () => {
            const date = new Date('2023-12-30T12:00:00Z').toISOString()
            expect(formatDate(date)).toBe('2 days ago')
        })

        it('should return singular "day" for 1 day ago', () => {
            const date = new Date('2023-12-31T12:00:00Z').toISOString()
            expect(formatDate(date)).toBe('1 day ago')
        })

        it('should return formatted date for dates more than 1 week ago (same year)', () => {
            const date = new Date('2023-12-15T12:00:00Z').toISOString()
            const result = formatDate(date)
            expect(result).toMatch(/Dec 15/)
            // Since mock "now" is Jan 1, 2024 and date is Dec 15, 2023, they are different years
            // so the year WILL be included in the formatted date
            expect(result).toMatch(/2023/) // Should include year for different year
        })

        it('should return formatted date with year for dates in different year', () => {
            const date = new Date('2022-12-15T12:00:00Z').toISOString()
            const result = formatDate(date)
            expect(result).toMatch(/Dec 15, 2022/)
        })
    })

    describe('formatNumber', () => {
        it('should return number as string for numbers less than 1000', () => {
            expect(formatNumber(0)).toBe('0')
            expect(formatNumber(1)).toBe('1')
            expect(formatNumber(50)).toBe('50')
            expect(formatNumber(999)).toBe('999')
        })

        it('should format thousands with K suffix', () => {
            expect(formatNumber(1000)).toBe('1K')
            expect(formatNumber(1500)).toBe('1.5K')
            expect(formatNumber(2400)).toBe('2.4K')
            expect(formatNumber(10000)).toBe('10K')
            expect(formatNumber(50000)).toBe('50K')
            expect(formatNumber(999999)).toBe('1000K')
        })

        it('should format millions with M suffix', () => {
            expect(formatNumber(1000000)).toBe('1M')
            expect(formatNumber(1500000)).toBe('1.5M')
            expect(formatNumber(2400000)).toBe('2.4M')
            expect(formatNumber(10000000)).toBe('10M')
        })

        it('should remove trailing .0 from formatted numbers', () => {
            expect(formatNumber(1000)).toBe('1K')
            expect(formatNumber(2000000)).toBe('2M')
        })
    })

    describe('truncateText', () => {
        it('should return original text if length is less than maxLength', () => {
            const text = 'Short text'
            expect(truncateText(text, 20)).toBe(text)
        })

        it('should return original text if length equals maxLength', () => {
            const text = 'Exact length'
            expect(truncateText(text, 12)).toBe(text)
        })

        it('should truncate text and add ellipsis if length exceeds maxLength', () => {
            const text = 'This is a very long text that needs to be truncated'
            expect(truncateText(text, 20)).toBe('This is a very long ...')
        })

        it('should handle empty string', () => {
            expect(truncateText('', 10)).toBe('')
        })

        it('should handle maxLength of 0', () => {
            expect(truncateText('Hello', 0)).toBe('...')
        })
    })

    describe('getInitials', () => {
        it('should return uppercase initials from first and last name', () => {
            expect(getInitials('John', 'Doe')).toBe('JD')
            expect(getInitials('Jane', 'Smith')).toBe('JS')
        })

        it('should handle lowercase names', () => {
            expect(getInitials('alice', 'johnson')).toBe('AJ')
        })

        it('should handle names with spaces', () => {
            expect(getInitials('Mary Jane', 'Watson')).toBe('MW')
        })

        it('should handle single character names', () => {
            expect(getInitials('A', 'B')).toBe('AB')
        })
    })

    describe('isValidEmail', () => {
        it('should return true for valid email addresses', () => {
            expect(isValidEmail('test@example.com')).toBe(true)
            expect(isValidEmail('user@domain.co')).toBe(true)
            expect(isValidEmail('name.surname@company.org')).toBe(true)
            expect(isValidEmail('email+tag@domain.com')).toBe(true)
        })

        it('should return false for invalid email addresses', () => {
            expect(isValidEmail('notanemail')).toBe(false)
            expect(isValidEmail('@example.com')).toBe(false)
            expect(isValidEmail('test@')).toBe(false)
            expect(isValidEmail('test @example.com')).toBe(false)
            expect(isValidEmail('test@.com')).toBe(false)
            expect(isValidEmail('')).toBe(false)
        })

        it('should return false for email without domain extension', () => {
            expect(isValidEmail('test@example')).toBe(false)
        })
    })

    describe('generateSlug', () => {
        it('should convert text to lowercase slug', () => {
            expect(generateSlug('Hello World')).toBe('hello-world')
            expect(generateSlug('UPPERCASE TEXT')).toBe('uppercase-text')
        })

        it('should replace spaces with hyphens', () => {
            expect(generateSlug('multiple word slug')).toBe('multiple-word-slug')
        })

        it('should remove special characters', () => {
            expect(generateSlug('Text with @#$% symbols!')).toBe('text-with-symbols')
        })

        it('should handle consecutive spaces/hyphens', () => {
            expect(generateSlug('text   with    spaces')).toBe('text-with-spaces')
            expect(generateSlug('text---with---hyphens')).toBe('text-with-hyphens')
        })

        it('should trim leading/trailing hyphens', () => {
            expect(generateSlug('  leading and trailing  ')).toBe('leading-and-trailing')
        })

        it('should handle underscores', () => {
            expect(generateSlug('text_with_underscores')).toBe('text-with-underscores')
        })

        it('should return empty string for text with only special characters', () => {
            expect(generateSlug('!@#$%^&*()')).toBe('')
        })
    })
})
