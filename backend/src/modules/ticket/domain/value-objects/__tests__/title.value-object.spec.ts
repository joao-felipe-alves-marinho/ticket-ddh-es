import { Title } from '../title.value-object';

describe('Title Value Object', () => {
  describe('Given a valid title', () => {
    it('When creating a title with valid text, Then should create successfully', () => {
      const validTitle = 'Fix login bug in auth module';

      const title = Title.create(validTitle);

      expect(title.value).toBe(validTitle);
    });

    it('When creating a title with leading/trailing spaces, Then should trim and create successfully', () => {
      const titleWithSpaces = '  Fix critical bug  ';
      const expectedTitle = 'Fix critical bug';

      const title = Title.create(titleWithSpaces);

      expect(title.value).toBe(expectedTitle);
    });

    it('When creating a title with special characters, Then should create successfully', () => {
      const specialCharTitle = 'Urgent: Fix [BUG] #123 - User login fails!';

      const title = Title.create(specialCharTitle);

      expect(title.value).toBe(specialCharTitle);
    });

    it('When creating a title with numbers, Then should create successfully', () => {
      const numberTitle = 'Implement API v2.0 endpoint with 3 new features';

      const title = Title.create(numberTitle);

      expect(title.value).toBe(numberTitle);
    });

    it('When creating a title with minimum valid length (3 chars), Then should create successfully', () => {
      const minTitle = 'Bug';

      const title = Title.create(minTitle);

      expect(title.value).toBe(minTitle);
    });

    it('When creating a title with maximum valid length (150 chars), Then should create successfully', () => {
      const maxTitle = 'A'.repeat(150);

      const title = Title.create(maxTitle);

      expect(title.value).toBe(maxTitle);
    });

    it('When creating a title with mixed case, Then should create successfully', () => {
      const mixedCaseTitle = 'CrItIcAl BuG FiX fOr UsEr LoGiN';

      const title = Title.create(mixedCaseTitle);

      expect(title.value).toBe(mixedCaseTitle);
    });

    it('When creating a title with consecutive spaces inside, Then should preserve and create successfully', () => {
      const titleWithInternalSpaces = 'Fix   multiple   spaces';

      const title = Title.create(titleWithInternalSpaces);

      expect(title.value).toBe(titleWithInternalSpaces);
    });

    it('When creating a title with single character repeated, Then should create successfully', () => {
      const repeatedTitle = 'A'.repeat(150);

      const title = Title.create(repeatedTitle);

      expect(title.value).toBe(repeatedTitle);
    });

    it('When creating a title with unicode characters, Then should create successfully', () => {
      const unicodeTitle = 'Fix bug: émojis 🐛 and accênts';

      const title = Title.create(unicodeTitle);

      expect(title.value).toBe(unicodeTitle);
    });
  });

  describe('Given an invalid title', () => {
    it('When creating a title shorter than 3 characters, Then should throw ArgumentOutOfRangeException', () => {
      const shortTitle = 'Hi';

      expect(() => Title.create(shortTitle)).toThrow(
        'Ticket title must be between 3 and 150 characters',
      );
    });

    it('When creating a title longer than 150 characters, Then should throw ArgumentOutOfRangeException', () => {
      const longTitle = 'A'.repeat(151);

      expect(() => Title.create(longTitle)).toThrow(
        'Ticket title must be between 3 and 150 characters',
      );
    });

    it('When creating an empty title, Then should throw ArgumentNotProvidedException', () => {
      const emptyTitle = '';

      expect(() => Title.create(emptyTitle)).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a title with only spaces, Then should throw ArgumentNotProvidedException', () => {
      const spacesOnlyTitle = '   ';

      expect(() => Title.create(spacesOnlyTitle)).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a title with only one character, Then should throw ArgumentOutOfRangeException', () => {
      const singleCharTitle = 'A';

      expect(() => Title.create(singleCharTitle)).toThrow(
        'Ticket title must be between 3 and 150 characters',
      );
    });

    it('When creating a title with only two characters, Then should throw ArgumentOutOfRangeException', () => {
      const twoCharTitle = 'AB';

      expect(() => Title.create(twoCharTitle)).toThrow(
        'Ticket title must be between 3 and 150 characters',
      );
    });

    it('When creating a title that exceeds 150 chars by one, Then should throw ArgumentOutOfRangeException', () => {
      const almostTooLongTitle = 'A'.repeat(151);

      expect(() => Title.create(almostTooLongTitle)).toThrow(
        'Ticket title must be between 3 and 150 characters',
      );
    });
  });

  describe('Given two title instances', () => {
    it('When comparing two titles with same value, Then should be equal', () => {
      const title1 = Title.create('Fix login bug');
      const title2 = Title.create('Fix login bug');

      expect(title1).toEqual(title2);
    });

    it('When comparing two titles with different values, Then should not be equal', () => {
      const title1 = Title.create('Fix login bug');
      const title2 = Title.create('Fix logout bug');

      expect(title1).not.toEqual(title2);
    });

    it('When comparing titles with different spacing, Then should not be equal', () => {
      const title1 = Title.create('Fix  bug'); // double space
      const title2 = Title.create('Fix bug'); // single space

      expect(title1).not.toEqual(title2);
    });

    it('When comparing titles with different case, Then should not be equal', () => {
      const title1 = Title.create('Fix login bug');
      const title2 = Title.create('FIX LOGIN BUG');

      expect(title1).not.toEqual(title2);
    });

    it('When accessing value property multiple times, Then should return consistent value', () => {
      const title = Title.create('Fix critical bug');

      const firstAccess = title.value;
      const secondAccess = title.value;

      expect(firstAccess).toBe(secondAccess);
      expect(firstAccess).toBe('Fix critical bug');
    });
  });

  describe('Given title edge cases', () => {
    it('When creating a title with tabs and newlines, Then should create successfully', () => {
      const titleWithWhitespace = 'Fix\tbug\nquickly';

      const title = Title.create(titleWithWhitespace);

      expect(title.value).toBe(titleWithWhitespace);
    });

    it('When creating a title with punctuation, Then should create successfully', () => {
      const punctuatedTitle = 'Fix: Critical bug! Urgent...';

      const title = Title.create(punctuatedTitle);

      expect(title.value).toBe(punctuatedTitle);
    });

    it('When creating a title with math symbols, Then should create successfully', () => {
      const mathTitle = 'Calculate (a + b) * c = result';

      const title = Title.create(mathTitle);

      expect(title.value).toBe(mathTitle);
    });
  });
});
