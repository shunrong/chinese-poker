import { Deck } from '../Deck';
import { Suit, Rank, SpecialCardType } from '../Card';

describe('Deck', () => {
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
  });

  describe('构造函数', () => {
    it('应该创建一副完整的54张牌', () => {
      expect(deck.remainingCount).toBe(54);
    });

    it('应该包含所有花色和点数的组合', () => {
      // 检查牌组中是否有特定的牌
      const hasHeartAce = deck['_cards'].some(card => 
        card.suit === Suit.HEART && card.rank === Rank.ACE
      );
      const hasSpadeTwo = deck['_cards'].some(card => 
        card.suit === Suit.SPADE && card.rank === Rank.TWO
      );
      const hasBlackJoker = deck['_cards'].some(card => 
        card.specialType === SpecialCardType.BLACK_JOKER
      );
      const hasRedJoker = deck['_cards'].some(card => 
        card.specialType === SpecialCardType.RED_JOKER
      );

      expect(hasHeartAce).toBe(true);
      expect(hasSpadeTwo).toBe(true);
      expect(hasBlackJoker).toBe(true);
      expect(hasRedJoker).toBe(true);
    });
  });

  describe('reset方法', () => {
    it('应该重置牌组到初始状态', () => {
      // 先抽一些牌
      deck.deal(10);
      expect(deck.remainingCount).toBe(44);
      
      // 重置牌组
      deck.reset();
      expect(deck.remainingCount).toBe(54);
    });
  });

  describe('shuffle方法', () => {
    it('应该改变牌的顺序', () => {
      // 保存洗牌前的顺序
      const originalOrder = [...deck['_cards']];
      
      // 洗牌
      deck.shuffle();
      
      // 检查是否发生了变化
      let orderChanged = false;
      for (let i = 0; i < originalOrder.length; i++) {
        if (originalOrder[i] !== deck['_cards'][i]) {
          orderChanged = true;
          break;
        }
      }
      
      expect(orderChanged).toBe(true);
    });
  });

  describe('deal方法', () => {
    it('应该返回指定数量的牌', () => {
      const cards = deck.deal(5);
      expect(cards.length).toBe(5);
      expect(deck.remainingCount).toBe(49);
    });

    it('当剩余牌不足时应返回所有剩余的牌', () => {
      deck.deal(50); // 牌组中还剩4张
      const remainingCards = deck.deal(10);
      expect(remainingCards.length).toBe(4);
      expect(deck.remainingCount).toBe(0);
    });

    it('当牌组为空时应返回空数组', () => {
      deck.deal(54); // 抽完所有牌
      const emptyDeal = deck.deal(1);
      expect(emptyDeal.length).toBe(0);
    });
  });
}); 