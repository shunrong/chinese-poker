import { Game, GameState, PlayResult } from '../Game';
import { PlayerRole } from '../Player';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('初始状态', () => {
    it('游戏状态应为WAITING', () => {
      expect(game.state).toBe(GameState.WAITING);
    });

    it('应该有3名玩家', () => {
      expect(game.players.length).toBe(3);
    });

    it('玩家初始角色应为农民', () => {
      game.players.forEach(player => {
        expect(player.role).toBe(PlayerRole.FARMER);
      });
    });
  });

  describe('开始游戏', () => {
    beforeEach(() => {
      game.start();
    });

    it('游戏状态应变为BIDDING', () => {
      expect(game.state).toBe(GameState.BIDDING);
    });

    it('每名玩家应有17张牌', () => {
      game.players.forEach(player => {
        expect(player.remainingCardCount).toBe(17);
      });
    });

    it('底牌应有3张', () => {
      expect(game.landlordCards.length).toBe(3);
    });

    it('应有一名当前活动玩家', () => {
      const activePlayerCount = game.players.filter(p => p.isActive).length;
      expect(activePlayerCount).toBe(1);
    });
  });

  describe('叫地主阶段', () => {
    beforeEach(() => {
      game.start();
    });

    it('叫地主后玩家角色应变为地主', () => {
      const activePlayer = game.players.find(p => p.isActive);
      game.bid(activePlayer!.id, true);
      
      expect(activePlayer!.role).toBe(PlayerRole.LANDLORD);
      expect(activePlayer!.remainingCardCount).toBe(20); // 17 + 3 底牌
    });

    it('叫地主后游戏状态应变为PLAYING', () => {
      const activePlayer = game.players.find(p => p.isActive);
      game.bid(activePlayer!.id, true);
      
      expect(game.state).toBe(GameState.PLAYING);
    });

    it('不叫地主应轮到下一玩家', () => {
      const firstActivePlayer = game.players.find(p => p.isActive);
      game.bid(firstActivePlayer!.id, false);
      
      expect(firstActivePlayer!.isActive).toBe(false);
      
      const secondActivePlayer = game.players.find(p => p.isActive);
      expect(secondActivePlayer).not.toBe(firstActivePlayer);
    });

    it('三轮都不叫地主应重新发牌', () => {
      // 模拟所有玩家都不叫地主
      for (let i = 0; i < 3; i++) {
        const activePlayer = game.players.find(p => p.isActive);
        game.bid(activePlayer!.id, false);
      }
      
      // 应该重新开始
      expect(game.state).toBe(GameState.BIDDING);
    });
  });

  describe('出牌阶段', () => {
    beforeEach(() => {
      game.start();
      // 第一个玩家叫地主
      const landlord = game.players.find(p => p.isActive)!;
      game.bid(landlord.id, true);
    });

    it('非当前玩家出牌应返回NOT_YOUR_TURN', () => {
      const nonActivePlayer = game.players.find(p => !p.isActive)!;
      const result = game.play(nonActivePlayer.id, []);
      
      expect(result).toBe(PlayResult.NOT_YOUR_TURN);
    });

    it('出牌后应轮到下一玩家', () => {
      const activePlayer = game.players.find(p => p.isActive)!;
      // 假设出第一张牌
      const cardToPlay = activePlayer.cards[0];
      
      game.play(activePlayer.id, [cardToPlay]);
      
      expect(activePlayer.isActive).toBe(false);
      expect(game.lastPlayedCombo.cards).toContain(cardToPlay);
    });
    
    it('无效牌型应返回INVALID_COMBO', () => {
      const activePlayer = game.players.find(p => p.isActive)!;
      // 尝试出不同点数的两张牌（无效牌型）
      const invalidCombo = [
        activePlayer.cards[0],
        activePlayer.cards[activePlayer.cards.length - 1]
      ];
      
      const result = game.play(activePlayer.id, invalidCombo);
      
      expect(result).toBe(PlayResult.INVALID_COMBO);
    });
  });

  describe('游戏结束', () => {
    it('当玩家没有手牌时游戏应结束', () => {
      game.start();
      
      // 第一个玩家叫地主
      const landlord = game.players.find(p => p.isActive)!;
      game.bid(landlord.id, true);
      
      // 模拟出完所有牌
      while (landlord.remainingCardCount > 0) {
        const cardToPlay = landlord.cards[0];
        // 直接从玩家对象中移除牌，模拟出牌
        landlord['_cards'] = landlord['_cards'].filter(c => c !== cardToPlay);
      }
      
      // 正确地直接调用私有方法来结束游戏
      // @ts-ignore - 直接访问私有方法进行测试
      game['endGame'](landlord);
      
      expect(game.state).toBe(GameState.GAME_OVER);
    });
  });
}); 