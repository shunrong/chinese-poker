import { useGameStore } from '../GameStore';
import { GameState, PlayerRole } from '../../sdk';
import { jest } from '@jest/globals';

// 使用fake timers避免随机性
jest.useFakeTimers();

describe('GameStore', () => {
  // 重置store状态
  beforeEach(() => {
    const store = useGameStore.getState();
    // 清理现有状态
    useGameStore.setState({
      ...store,
      gameState: GameState.WAITING,
      selectedCards: [],
      errorMessage: null
    });
  });
  
  describe('初始状态', () => {
    it('游戏状态应为WAITING', () => {
      const { gameState } = useGameStore.getState();
      expect(gameState).toBe(GameState.WAITING);
    });
    
    it('应该有3名玩家', () => {
      const { players } = useGameStore.getState();
      expect(players.length).toBe(3);
    });
    
    it('当前玩家应为null', () => {
      const { currentPlayer } = useGameStore.getState();
      expect(currentPlayer).toBeNull();
    });
    
    it('选中的牌应为空数组', () => {
      const { selectedCards } = useGameStore.getState();
      expect(selectedCards).toEqual([]);
    });
  });
  
  describe('游戏流程', () => {
    it('startGame应该开始游戏', () => {
      const { startGame } = useGameStore.getState();
      startGame();
      
      const newState = useGameStore.getState();
      expect(newState.gameState).toBe(GameState.BIDDING);
      expect(newState.currentPlayer).not.toBeNull();
    });
    
    it('bidLandlord应该处理叫地主逻辑', () => {
      const { startGame, bidLandlord } = useGameStore.getState();
      startGame();
      
      const { currentPlayer } = useGameStore.getState();
      bidLandlord(currentPlayer!.id, true);
      
      const newState = useGameStore.getState();
      expect(newState.gameState).toBe(GameState.PLAYING);
      expect(newState.currentPlayer!.role).toBe(PlayerRole.LANDLORD);
    });
    
    it('selectCard应该改变卡片选中状态', () => {
      const { startGame, selectCard } = useGameStore.getState();
      startGame();
      
      // 获取当前玩家的第一张牌
      const { currentPlayer } = useGameStore.getState();
      const firstCard = currentPlayer!.cards[0];
      
      // 选中该牌
      selectCard(firstCard);
      
      const { selectedCards } = useGameStore.getState();
      expect(selectedCards).toContain(firstCard);
      expect(firstCard.selected).toBe(true);
      
      // 再次选中应取消选择
      selectCard(firstCard);
      
      const { selectedCards: updatedSelectedCards } = useGameStore.getState();
      expect(updatedSelectedCards).not.toContain(firstCard);
      expect(firstCard.selected).toBe(false);
    });
    
    it('playSelectedCards应该出牌', () => {
      const { startGame, bidLandlord, selectCard, playSelectedCards } = useGameStore.getState();
      startGame();
      
      // 当前玩家叫地主
      const { currentPlayer } = useGameStore.getState();
      bidLandlord(currentPlayer!.id, true);
      
      // 获取当前玩家的第一张牌
      const { currentPlayer: updatedPlayer } = useGameStore.getState();
      const cardToPlay = updatedPlayer!.cards[0];
      
      // 选中该牌
      selectCard(cardToPlay);
      
      // 出牌
      playSelectedCards(updatedPlayer!.id);
      
      const newState = useGameStore.getState();
      expect(newState.lastPlayedCards).toContain(cardToPlay);
      expect(newState.selectedCards).toEqual([]);
    });
    
    it('pass应该实现不出牌', () => {
      const { startGame, bidLandlord, pass } = useGameStore.getState();
      startGame();
      
      // 当前玩家叫地主
      const { currentPlayer } = useGameStore.getState();
      bidLandlord(currentPlayer!.id, true);
      
      const landlordId = currentPlayer!.id;
      
      // 轮到下一个玩家
      const { currentPlayer: nextPlayer } = useGameStore.getState();
      
      // 下一个玩家选择不出
      pass(nextPlayer!.id);
      
      // 检查是否轮到第三个玩家
      const { currentPlayer: thirdPlayer } = useGameStore.getState();
      expect(thirdPlayer!.id).not.toBe(landlordId);
      expect(thirdPlayer!.id).not.toBe(nextPlayer!.id);
    });
    
    it('restartGame应该重新开始游戏', () => {
      const { startGame, restartGame } = useGameStore.getState();
      startGame();
      
      // 重启游戏
      restartGame();
      
      const newState = useGameStore.getState();
      expect(newState.gameState).toBe(GameState.BIDDING);
      expect(newState.selectedCards).toEqual([]);
      expect(newState.lastPlayedCards).toEqual([]);
    });
  });
  
  describe('辅助方法', () => {
    it('getPlayerRoleDisplay应该返回正确的角色显示', () => {
      const { getPlayerRoleDisplay, players } = useGameStore.getState();
      
      const farmer = players[0]; // 默认为农民
      expect(getPlayerRoleDisplay(farmer)).toBe('农民');
      
      farmer.role = PlayerRole.LANDLORD;
      expect(getPlayerRoleDisplay(farmer)).toBe('地主');
    });
  });
}); 