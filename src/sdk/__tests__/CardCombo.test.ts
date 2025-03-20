import { CardCombo, ComboType } from '../CardCombo';
import { Card, Suit, Rank, SpecialCardType } from '../Card';

describe('CardCombo', () => {
  describe('基本牌型识别', () => {
    it('应该识别空牌型', () => {
      const combo = new CardCombo([]);
      expect(combo.type).toBe(ComboType.PASS);
      expect(combo.isEmpty()).toBe(true);
    });

    it('应该识别单张牌', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.ACE)
      ]);
      expect(combo.type).toBe(ComboType.SINGLE);
      expect(combo.mainValue).toBe(Rank.ACE);
    });

    it('应该识别对子', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.JACK),
        new Card(Suit.SPADE, Rank.JACK)
      ]);
      expect(combo.type).toBe(ComboType.PAIR);
      expect(combo.mainValue).toBe(Rank.JACK);
    });

    it('应该识别三张', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.SEVEN),
        new Card(Suit.SPADE, Rank.SEVEN),
        new Card(Suit.CLUB, Rank.SEVEN)
      ]);
      expect(combo.type).toBe(ComboType.TRIO);
      expect(combo.mainValue).toBe(Rank.SEVEN);
    });

    it('应该识别三带一', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.EIGHT),
        new Card(Suit.DIAMOND, Rank.EIGHT),
        new Card(Suit.CLUB, Rank.EIGHT),
        new Card(Suit.SPADE, Rank.THREE)
      ]);
      expect(combo.type).toBe(ComboType.TRIO_WITH_SINGLE);
      expect(combo.mainValue).toBe(Rank.EIGHT);
    });

    it('应该识别炸弹', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.NINE),
        new Card(Suit.DIAMOND, Rank.NINE),
        new Card(Suit.CLUB, Rank.NINE),
        new Card(Suit.SPADE, Rank.NINE)
      ]);
      expect(combo.type).toBe(ComboType.BOMB);
      expect(combo.mainValue).toBe(Rank.NINE);
    });

    it('应该识别王炸', () => {
      const combo = new CardCombo([
        new Card(SpecialCardType.BLACK_JOKER),
        new Card(SpecialCardType.RED_JOKER)
      ]);
      expect(combo.type).toBe(ComboType.ROCKET);
    });
  });

  describe('高级牌型识别', () => {
    it('应该识别顺子', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.THREE),
        new Card(Suit.DIAMOND, Rank.FOUR),
        new Card(Suit.CLUB, Rank.FIVE),
        new Card(Suit.SPADE, Rank.SIX),
        new Card(Suit.HEART, Rank.SEVEN)
      ]);
      expect(combo.type).toBe(ComboType.STRAIGHT);
      expect(combo.mainValue).toBe(Rank.SEVEN); // 最大的牌值
    });

    it('应该识别连对', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.THREE),
        new Card(Suit.DIAMOND, Rank.THREE),
        new Card(Suit.CLUB, Rank.FOUR),
        new Card(Suit.SPADE, Rank.FOUR),
        new Card(Suit.HEART, Rank.FIVE),
        new Card(Suit.DIAMOND, Rank.FIVE)
      ]);
      expect(combo.type).toBe(ComboType.STRAIGHT_PAIR);
      expect(combo.mainValue).toBe(Rank.FIVE); // 最大的对子
    });

    it('应该识别飞机(不带牌)', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.SEVEN),
        new Card(Suit.DIAMOND, Rank.SEVEN),
        new Card(Suit.CLUB, Rank.SEVEN),
        new Card(Suit.HEART, Rank.EIGHT),
        new Card(Suit.DIAMOND, Rank.EIGHT),
        new Card(Suit.CLUB, Rank.EIGHT)
      ]);
      expect(combo.type).toBe(ComboType.AIRPLANE);
      expect(combo.mainValue).toBe(Rank.EIGHT); // 最大的三张
    });

    it('应该识别飞机带单牌', () => {
      const combo = new CardCombo([
        new Card(Suit.HEART, Rank.SEVEN),
        new Card(Suit.DIAMOND, Rank.SEVEN),
        new Card(Suit.CLUB, Rank.SEVEN),
        new Card(Suit.HEART, Rank.EIGHT),
        new Card(Suit.DIAMOND, Rank.EIGHT),
        new Card(Suit.CLUB, Rank.EIGHT),
        new Card(Suit.HEART, Rank.THREE),
        new Card(Suit.DIAMOND, Rank.FOUR)
      ]);
      expect(combo.type).toBe(ComboType.AIRPLANE_WITH_SINGLE);
      expect(combo.mainValue).toBe(Rank.EIGHT);
    });
  });

  describe('牌型比较', () => {
    it('王炸应该能压过任何牌型', () => {
      const rocket = new CardCombo([
        new Card(SpecialCardType.BLACK_JOKER),
        new Card(SpecialCardType.RED_JOKER)
      ]);
      
      const bomb = new CardCombo([
        new Card(Suit.HEART, Rank.ACE),
        new Card(Suit.DIAMOND, Rank.ACE),
        new Card(Suit.CLUB, Rank.ACE),
        new Card(Suit.SPADE, Rank.ACE)
      ]);
      
      expect(rocket.canBeat(bomb)).toBe(true);
    });

    it('炸弹应该能压过普通牌型', () => {
      const bomb = new CardCombo([
        new Card(Suit.HEART, Rank.NINE),
        new Card(Suit.DIAMOND, Rank.NINE),
        new Card(Suit.CLUB, Rank.NINE),
        new Card(Suit.SPADE, Rank.NINE)
      ]);
      
      const straight = new CardCombo([
        new Card(Suit.HEART, Rank.THREE),
        new Card(Suit.DIAMOND, Rank.FOUR),
        new Card(Suit.CLUB, Rank.FIVE),
        new Card(Suit.SPADE, Rank.SIX),
        new Card(Suit.HEART, Rank.SEVEN)
      ]);
      
      expect(bomb.canBeat(straight)).toBe(true);
    });

    it('同类型牌应该按大小比较', () => {
      const smallSingle = new CardCombo([
        new Card(Suit.HEART, Rank.SEVEN)
      ]);
      
      const bigSingle = new CardCombo([
        new Card(Suit.HEART, Rank.ACE)
      ]);
      
      expect(bigSingle.canBeat(smallSingle)).toBe(true);
      expect(smallSingle.canBeat(bigSingle)).toBe(false);
    });

    it('不同类型的普通牌不能互相比较', () => {
      const single = new CardCombo([
        new Card(Suit.HEART, Rank.ACE)
      ]);
      
      const pair = new CardCombo([
        new Card(Suit.HEART, Rank.THREE),
        new Card(Suit.DIAMOND, Rank.THREE)
      ]);
      
      expect(single.canBeat(pair)).toBe(false);
      expect(pair.canBeat(single)).toBe(false);
    });
  });
}); 