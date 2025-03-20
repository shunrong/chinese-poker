import { create } from 'zustand';
import { Card, CardCombo, ComboType, Game, GameState, PlayResult, Player, PlayerRole } from '../sdk';


/**
 * 游戏Store接口
 */
interface GameStore {
  // 领域模型
  game: Game;
  
  // 游戏状态
  gameState: GameState;
  players: Player[];
  currentPlayer: Player | null;
  landlordCards: Card[];
  lastPlayedCards: Card[];
  lastPlayedByName: string | null;
  lastPlayedCombo: CardCombo;
  
  // 用户交互状态
  selectedCards: Card[];
  errorMessage: string | null;
  
  // 用户交互操作
  startGame: () => void;
  restartGame: () => void;
  bidLandlord: (playerId: string, bid: boolean) => void;
  selectCard: (card: Card) => void;
  playSelectedCards: (playerId: string) => void;
  pass: (playerId: string) => void;

  // 辅助方法
  getLastPlayedCardsDisplay: () => string;
  getPlayerRoleDisplay: (player: Player) => string;
  getComboTypeDisplay: (combo: CardCombo) => string;
  getComboTypeColor: (combo: CardCombo) => string;
}

/**
 * 创建游戏状态管理Store
 */
export const useGameStore = create<GameStore>((set, get) => {
  // 创建游戏实例
  const game = new Game();
  
  return {
    // 领域模型
    game,
    
    // 游戏状态
    gameState: game.state,
    players: game.players,
    currentPlayer: game.state !== GameState.WAITING ? game.currentPlayer : null,
    landlordCards: game.landlordCards,
    lastPlayedCards: game.lastPlayedCombo.cards,
    lastPlayedCombo: game.lastPlayedCombo,
    lastPlayedByName: game.lastPlayedBy?.name || null,
    
    // 用户交互状态
    selectedCards: [],
    errorMessage: null,
    
    /**
     * 开始游戏
     */
    startGame: () => {
      const { game } = get();
      
      try {
        game.start();
        
        set({
          gameState: game.state,
          players: game.players,
          currentPlayer: game.currentPlayer,
          landlordCards: game.landlordCards,
          lastPlayedCards: [],
          lastPlayedCombo: new CardCombo(),
          lastPlayedByName: null,
          errorMessage: null
        });
      } catch (error) {
        set({ errorMessage: (error as Error).message });
      }
    },
    
    /**
     * 重新开始游戏
     */
    restartGame: () => {
      const { game } = get();
      
      try {
        game.restart();
        
        set({
          gameState: game.state,
          players: game.players,
          currentPlayer: game.currentPlayer,
          landlordCards: game.landlordCards,
          lastPlayedCards: [],
          lastPlayedCombo: new CardCombo(),
          lastPlayedByName: null,
          selectedCards: [],
          errorMessage: null
        });
      } catch (error) {
        set({ errorMessage: (error as Error).message });
      }
    },
    
    /**
     * 叫地主
     */
    bidLandlord: (playerId: string, bid: boolean) => {
      const { game } = get();
      
      const success = game.bid(playerId, bid);
      if (success) {
        // 记录当前状态，用于检测是否发生了重新发牌
        const prevState = game.state;
        
        set({
          gameState: game.state,
          players: game.players,
          currentPlayer: game.currentPlayer,
          landlordCards: game.landlordCards,
          errorMessage: null
        });
        
        // 检测是否由于没人叫地主而重新发牌
        if (!bid && prevState === GameState.BIDDING && game.state === GameState.BIDDING) {
          // 设置提示消息，但延迟一点清除，以便用户能看到
          set({ errorMessage: '没有人叫地主，重新发牌' });
          setTimeout(() => {
            set({ errorMessage: null });
          }, 2000);
        }
      } else {
        set({ 
          errorMessage: bid ? '无法叫地主' : '无法放弃叫地主'
        });
      }
    },
    
    /**
     * 选择卡牌
     */
    selectCard: (card: Card) => {
      card.toggleSelected();
      
      const { players } = get();
      const selectedCards = players
        .flatMap(player => player.cards)
        .filter(card => card.selected);
      
      set({ selectedCards });
    },
    
    /**
     * 出牌
     */
    playSelectedCards: (playerId: string) => {
      const { game, selectedCards } = get();
      
      const result = game.play(playerId, selectedCards);
      let errorMessage: string | null = null;
      
      switch (result) {
        case PlayResult.SUCCESS:
          // 成功出牌
          break;
        case PlayResult.INVALID_COMBO:
          errorMessage = '无效的牌型组合';
          break;
        case PlayResult.CANNOT_BEAT:
          errorMessage = '无法压过上家的牌';
          break;
        case PlayResult.NOT_YOUR_TURN:
          errorMessage = '还没轮到你出牌';
          break;
        case PlayResult.GAME_NOT_STARTED:
          errorMessage = '游戏尚未开始';
          break;
      }
      
      // 清除所有玩家的选中状态
      game.players.forEach(player => player.clearSelection());
      
      set({
        gameState: game.state,
        players: game.players,
        currentPlayer: game.state !== GameState.GAME_OVER ? game.currentPlayer : null,
        lastPlayedCards: game.lastPlayedCombo.cards,
        lastPlayedByName: game.lastPlayedBy?.name || null,
        lastPlayedCombo: game.lastPlayedCombo,
        selectedCards: [],
        errorMessage
      });
    },
    
    /**
     * 不出牌
     */
    pass: (playerId: string) => {
      const { game } = get();
      
      const result = game.pass(playerId);
      let errorMessage: string | null = null;
      
      switch (result) {
        case PlayResult.SUCCESS:
          // 成功不出
          break;
        case PlayResult.INVALID_COMBO:
          errorMessage = '当前必须出牌';
          break;
        case PlayResult.NOT_YOUR_TURN:
          errorMessage = '还没轮到你出牌';
          break;
        case PlayResult.GAME_NOT_STARTED:
          errorMessage = '游戏尚未开始';
          break;
        default:
          errorMessage = '未知错误';
      }
      
      // 清除所有玩家的选中状态
      game.players.forEach(player => player.clearSelection());
      
      set({
        gameState: game.state,
        players: game.players,
        currentPlayer: game.state !== GameState.GAME_OVER ? game.currentPlayer : null,
        lastPlayedCards: game.lastPlayedCombo.cards,
        lastPlayedByName: game.lastPlayedBy?.name || null,
        lastPlayedCombo: game.lastPlayedCombo,
        selectedCards: [],
        errorMessage
      });
    },
    
    /**
     * 获取上次出牌的显示文本
     */
    getLastPlayedCardsDisplay: () => {
      const { lastPlayedCards, lastPlayedByName } = get();
      
      if (!lastPlayedCards.length || !lastPlayedByName) {
        return '';
      }
      
      const cardsText = lastPlayedCards.map(card => card.display).join(', ');
      return `${lastPlayedByName}: ${cardsText}`;
    },
    
    /**
     * 获取玩家角色显示文本
     */
    getPlayerRoleDisplay: (player: Player) => {
      return player.role === PlayerRole.LANDLORD ? '地主' : '农民';
    },

    /**
     * 获取牌型的显示文本
     */
    getComboTypeDisplay: (combo: CardCombo) => {
      if (!combo || combo.isEmpty()) return '';
      
      switch (combo.type) {
        case ComboType.SINGLE:
          return '单张';
        case ComboType.PAIR:
          return '对子';
        case ComboType.TRIO:
          return '三张';
        case ComboType.TRIO_WITH_SINGLE:
          return '三带一';
        case ComboType.TRIO_WITH_PAIR:
          return '三带二';
        case ComboType.STRAIGHT:
          return '顺子';
        case ComboType.STRAIGHT_PAIR:
          return '连对';
        case ComboType.AIRPLANE:
          return '飞机';
        case ComboType.AIRPLANE_WITH_SINGLE:
          return '飞机带单牌';
        case ComboType.AIRPLANE_WITH_PAIR:
          return '飞机带对子';
        case ComboType.FOUR_WITH_TWO_SINGLE:
          return '四带二';
        case ComboType.FOUR_WITH_TWO_PAIR:
          return '四带两对';
        case ComboType.BOMB:
          return '炸弹';
        case ComboType.ROCKET:
          return '火箭';
        default:
          return '';
      }
    },
    
    /**
     * 获取牌型的颜色
     */
    getComboTypeColor: (combo: CardCombo) => {
      if (!combo || combo.isEmpty()) return 'default';
      
      switch (combo.type) {
        case ComboType.SINGLE:
          return 'blue';
        case ComboType.PAIR:
          return 'cyan';
        case ComboType.TRIO:
        case ComboType.TRIO_WITH_SINGLE:
        case ComboType.TRIO_WITH_PAIR:
          return 'geekblue';
        case ComboType.STRAIGHT:
        case ComboType.STRAIGHT_PAIR:
          return 'purple';
        case ComboType.AIRPLANE:
        case ComboType.AIRPLANE_WITH_SINGLE:
        case ComboType.AIRPLANE_WITH_PAIR:
          return 'magenta';
        case ComboType.FOUR_WITH_TWO_SINGLE:
        case ComboType.FOUR_WITH_TWO_PAIR:
          return 'orange';
        case ComboType.BOMB:
          return 'volcano';
        case ComboType.ROCKET:
          return 'red';
        default:
          return 'default';
      }
    }
  };
}); 