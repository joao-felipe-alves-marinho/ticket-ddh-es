import { BlockReason } from '../block-reason.value-object';

describe('BlockReason Value Object', () => {
  describe('Given a valid block reason', () => {
    it('When creating a block reason with leading and trailing spaces, Then should trim and create successfully', () => {
      const reason = BlockReason.create(
        '  Waiting for third-party API response  ',
      );

      expect(reason.value).toBe('Waiting for third-party API response');
    });

    it('When creating a block reason with 500 characters, Then should create successfully', () => {
      const maxReason = 'A'.repeat(500);

      const reason = BlockReason.create(maxReason);

      expect(reason.value).toBe(maxReason);
    });
  });

  describe('Given an invalid block reason', () => {
    it('When creating an empty block reason, Then should throw ArgumentNotProvidedException', () => {
      expect(() => BlockReason.create('')).toThrow(
        'Value object props must be provided',
      );
    });

    it('When creating a block reason shorter than 3 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => BlockReason.create('ab')).toThrow(
        'Block reason must be between 3 and 500 characters',
      );
    });

    it('When creating a block reason longer than 500 characters, Then should throw ArgumentOutOfRangeException', () => {
      expect(() => BlockReason.create('A'.repeat(501))).toThrow(
        'Block reason must be between 3 and 500 characters',
      );
    });

    it('When creating a block reason with only spaces, Then should throw ArgumentNotProvidedException', () => {
      expect(() => BlockReason.create('   ')).toThrow(
        'Value object props must be provided',
      );
    });
  });

  describe('Given two block reason instances', () => {
    it('When comparing equal reasons, Then should be equal', () => {
      const firstReason = BlockReason.create('Waiting for approval');
      const secondReason = BlockReason.create('Waiting for approval');

      expect(firstReason).toEqual(secondReason);
    });

    it('When comparing different reasons, Then should not be equal', () => {
      expect(BlockReason.create('Reason one')).not.toEqual(
        BlockReason.create('Reason two'),
      );
    });
  });
});
