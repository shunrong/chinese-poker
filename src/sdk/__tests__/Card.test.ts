import { Card, Suit, Rank, SpecialCardType } from '../Card';

describe('Card', () => {
  describe('构造函数', () => {
    it('应该正确创建常规扑克牌', () => {
      const card = new Card(Suit.HEART, Rank.ACE);
      expect(card.suit).toBe(Suit.HEART);
      expect(card.rank).toBe(Rank.ACE);
      expect(card.specialType).toBeUndefined();
      expect(card.isJoker()).toBe(false);
    });

    it('应该正确创建小王', () => {
      const card = new Card(SpecialCardType.BLACK_JOKER);
      expect(card.suit).toBeUndefined();
      expect(card.rank).toBeUndefined();
      expect(card.specialType).toBe(SpecialCardType.BLACK_JOKER);
      expect(card.isJoker()).toBe(true);
    });

    it('应该正确创建大王', () => {
      const card = new Card(SpecialCardType.RED_JOKER);
      expect(card.suit).toBeUndefined();
      expect(card.rank).toBeUndefined();
      expect(card.specialType).toBe(SpecialCardType.RED_JOKER);
      expect(card.isJoker()).toBe(true);
    });
  });

  describe('value属性', () => {
    it('常规牌应该返回正确的点数值', () => {
      const card = new Card(Suit.CLUB, Rank.SEVEN);
      expect(card.value).toBe(Rank.SEVEN);
    });

    it('小王应该返回16', () => {
      const card = new Card(SpecialCardType.BLACK_JOKER);
      expect(card.value).toBe(16);
    });

    it('大王应该返回17', () => {
      const card = new Card(SpecialCardType.RED_JOKER);
      expect(card.value).toBe(17);
    });
  });

  describe('display属性', () => {
    it('常规牌应该返回正确的显示文本', () => {
      const card = new Card(Suit.HEART, Rank.JACK);
      expect(card.display).toBe('♥J');
    });

    it('小王应该显示为"小王"', () => {
      const card = new Card(SpecialCardType.BLACK_JOKER);
      expect(card.display).toBe('小王');
    });

    it('大王应该显示为"大王"', () => {
      const card = new Card(SpecialCardType.RED_JOKER);
      expect(card.display).toBe('大王');
    });
  });

  describe('selected属性和toggleSelected方法', () => {
    it('初始selected状态应为false', () => {
      const card = new Card(Suit.SPADE, Rank.TEN);
      expect(card.selected).toBe(false);
    });

    it('应该能正确设置selected状态', () => {
      const card = new Card(Suit.SPADE, Rank.TEN);
      card.selected = true;
      expect(card.selected).toBe(true);
    });

    it('toggleSelected应该切换selected状态', () => {
      const card = new Card(Suit.SPADE, Rank.TEN);
      expect(card.selected).toBe(false);
      card.toggleSelected();
      expect(card.selected).toBe(true);
      card.toggleSelected();
      expect(card.selected).toBe(false);
    });
  });
}); 