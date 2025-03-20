import { Player, PlayerRole } from '../Player';
import { Card, Suit, Rank } from '../Card';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('1', '玩家1');
  });

  describe('构造函数', () => {
    it('应该正确设置ID和名称', () => {
      expect(player.id).toBe('1');
      expect(player.name).toBe('玩家1');
    });

    it('初始角色应该为农民', () => {
      expect(player.role).toBe(PlayerRole.FARMER);
    });

    it('初始牌数应该为0', () => {
      expect(player.remainingCardCount).toBe(0);
    });

    it('初始活动状态应该为false', () => {
      expect(player.isActive).toBe(false);
    });

    it('初始获胜状态应该为false', () => {
      expect(player.isWinner).toBe(false);
    });
  });

  describe('牌操作', () => {
    let cards: Card[];

    beforeEach(() => {
      cards = [
        new Card(Suit.HEART, Rank.ACE),
        new Card(Suit.SPADE, Rank.KING),
        new Card(Suit.DIAMOND, Rank.QUEEN)
      ];
    });

    it('addCards应该正确添加牌', () => {
      player.addCards(cards);
      expect(player.remainingCardCount).toBe(3);
      expect(player.cards.length).toBe(3);
    });

    it('reset应该清空手牌并重置角色', () => {
      player.addCards(cards);
      player.role = PlayerRole.LANDLORD;
      
      player.reset();
      
      expect(player.remainingCardCount).toBe(0);
      expect(player.role).toBe(PlayerRole.FARMER);
    });

    it('playCards应该从手牌中移除指定的牌', () => {
      player.addCards(cards);
      
      const cardToPlay = cards[0];
      player.playCards([cardToPlay]);
      
      expect(player.remainingCardCount).toBe(2);
      expect(player.cards).not.toContain(cardToPlay);
    });

    it('当尝试打出不存在的牌时，playCards应该抛出错误', () => {
      player.addCards(cards);
      
      const nonExistingCard = new Card(Suit.CLUB, Rank.TWO);
      
      expect(() => {
        player.playCards([nonExistingCard]);
      }).toThrow();
    });
  });

  describe('属性和setter', () => {
    it('应该能正确设置和获取名称', () => {
      player.name = '新名称';
      expect(player.name).toBe('新名称');
    });

    it('应该能正确设置和获取角色', () => {
      player.role = PlayerRole.LANDLORD;
      expect(player.role).toBe(PlayerRole.LANDLORD);
    });

    it('应该能正确设置和获取活动状态', () => {
      player.isActive = true;
      expect(player.isActive).toBe(true);
    });

    it('应该能正确设置和获取获胜状态', () => {
      player.isWinner = true;
      expect(player.isWinner).toBe(true);
    });
  });
}); 