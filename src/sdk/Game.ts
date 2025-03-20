import { Card } from './Card';
import { CardCombo } from './CardCombo';
import { Deck } from './Deck';
import { Player, PlayerRole } from './Player';

/**
 * 游戏状态枚举
 */
export enum GameState {
  WAITING = 'WAITING',        // 等待开始
  DEALING = 'DEALING',        // 发牌中
  BIDDING = 'BIDDING',        // 叫地主
  PLAYING = 'PLAYING',        // 游戏中
  GAME_OVER = 'GAME_OVER',    // 游戏结束
}

/**
 * 玩家出牌结果
 */
export enum PlayResult {
  SUCCESS = 'SUCCESS',          // 成功出牌
  INVALID_COMBO = 'INVALID_COMBO',  // 无效牌型
  CANNOT_BEAT = 'CANNOT_BEAT',      // 无法压过上家
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',  // 不是你的回合
  GAME_NOT_STARTED = 'GAME_NOT_STARTED', // 游戏未开始
}

/**
 * 游戏类
 */
export class Game {
  private _players: Player[] = [];
  private _deck: Deck = new Deck();
  private _state: GameState = GameState.WAITING;
  private _currentPlayerIndex: number = 0;
  private _lastPlayedCombo: CardCombo = new CardCombo();
  private _lastPlayedBy: Player | null = null;
  private _landlordCards: Card[] = []; // 底牌
  private _passCount: number = 0; // 连续不出的次数
  private _biddingCount: number = 0; // 已经询问过叫地主的玩家数量
  
  /**
   * 创建游戏实例
   */
  constructor() {
    // 初始化三个玩家
    this._players = [
      new Player('1', '玩家1'),
      new Player('2', '玩家2'),
      new Player('3', '玩家3')
    ];
  }

  /**
   * 获取游戏状态
   */
  get state(): GameState {
    return this._state;
  }

  /**
   * 获取玩家列表
   */
  get players(): Player[] {
    return [...this._players];
  }

  /**
   * 获取当前玩家
   */
  get currentPlayer(): Player {
    return this._players[this._currentPlayerIndex];
  }

  /**
   * 获取底牌
   */
  get landlordCards(): Card[] {
    return [...this._landlordCards];
  }

  /**
   * 获取上一次出的牌
   */
  get lastPlayedCombo(): CardCombo {
    return this._lastPlayedCombo;
  }

  /**
   * 获取上一次出牌的玩家
   */
  get lastPlayedBy(): Player | null {
    return this._lastPlayedBy;
  }

  /**
   * 开始游戏
   */
  start(): void {
    if (this._state !== GameState.WAITING) {
      throw new Error('游戏已经开始');
    }

    // 重置玩家状态
    this._players.forEach(player => player.reset());
    
    // 重置游戏状态
    this._lastPlayedCombo = new CardCombo();
    this._lastPlayedBy = null;
    this._passCount = 0;
    this._biddingCount = 0;
    
    // 准备牌组
    this._deck.reset();
    this._deck.shuffle();
    
    // 设置游戏状态为发牌
    this._state = GameState.DEALING;
    
    // 发牌：每人17张
    this._players.forEach(player => {
      player.addCards(this._deck.deal(17));
    });
    
    // 保留3张底牌
    this._landlordCards = this._deck.deal(3);
    
    // 进入叫地主阶段
    this._state = GameState.BIDDING;
    
    // 随机选择一个玩家开始叫地主
    this._currentPlayerIndex = Math.floor(Math.random() * 3);
    this._players[this._currentPlayerIndex].isActive = true;
  }

  /**
   * 叫地主
   * @param playerId 玩家ID
   * @param bid 是否叫地主
   */
  bid(playerId: string, bid: boolean): boolean {
    if (this._state !== GameState.BIDDING) {
      return false;
    }

    const currentPlayer = this.currentPlayer;
    if (currentPlayer.id !== playerId) {
      return false;
    }

    // 增加已询问的玩家计数
    this._biddingCount++;

    if (bid) {
      // 如果叫地主，设置角色并给底牌
      currentPlayer.role = PlayerRole.LANDLORD;
      currentPlayer.addCards([...this._landlordCards]);
      
      // 其他玩家设为农民
      this._players.forEach(player => {
        if (player.id !== playerId) {
          player.role = PlayerRole.FARMER;
        }
      });
      
      // 进入游戏阶段
      this._state = GameState.PLAYING;
      return true;
    } else {
      // 设置当前玩家为农民角色（明确标记不叫）
      currentPlayer.role = PlayerRole.FARMER;
      
      // 如果所有玩家都不叫地主时才重新开始游戏
      if (this._biddingCount >= this._players.length && 
          this._players.every(player => player.role === PlayerRole.FARMER)) {
        this.restart();
        return true;
      }
      
      // 否则轮到下一个玩家
      this.nextTurn();
      return true;
    }
  }

  /**
   * 出牌
   * @param playerId 玩家ID
   * @param cards 要出的牌
   */
  play(playerId: string, cards: Card[]): PlayResult {
    if (this._state !== GameState.PLAYING) {
      return PlayResult.GAME_NOT_STARTED;
    }

    const currentPlayer = this.currentPlayer;
    if (currentPlayer.id !== playerId) {
      return PlayResult.NOT_YOUR_TURN;
    }

    // 如果没有选择牌，视为不出（PASS）
    if (cards.length === 0) {
      return this.pass(playerId);
    }

    // 验证牌型
    const combo = new CardCombo(cards);
    if (!combo.isValid()) {
      return PlayResult.INVALID_COMBO;
    }

    // 如果不是首家出牌，需要验证是否能压过上家
    if (!this._lastPlayedCombo.isEmpty() && this._lastPlayedBy !== currentPlayer && !combo.canBeat(this._lastPlayedCombo)) {
      return PlayResult.CANNOT_BEAT;
    }

    try {
      // 出牌
      currentPlayer.playCards(cards);
      
      // 更新最后出的牌
      this._lastPlayedCombo = combo;
      this._lastPlayedBy = currentPlayer;
      this._passCount = 0;
      
      // 检查是否获胜
      if (currentPlayer.remainingCardCount === 0) {
        this.endGame(currentPlayer);
        return PlayResult.SUCCESS;
      }
      
      // 轮到下一个玩家
      this.nextTurn();
      
      return PlayResult.SUCCESS;
    } catch {
      return PlayResult.INVALID_COMBO;
    }
  }

  /**
   * 不出牌（PASS）
   * @param playerId 玩家ID
   */
  pass(playerId: string): PlayResult {
    if (this._state !== GameState.PLAYING) {
      return PlayResult.GAME_NOT_STARTED;
    }

    const currentPlayer = this.currentPlayer;
    if (currentPlayer.id !== playerId) {
      return PlayResult.NOT_YOUR_TURN;
    }

    // 如果是首家出牌，不能PASS
    if (this._lastPlayedCombo.isEmpty() || this._lastPlayedBy === currentPlayer) {
      return PlayResult.INVALID_COMBO;
    }

    // 增加不出计数
    this._passCount++;
    
    // 如果所有其他玩家都不出，由最后出牌的玩家继续出牌
    if (this._passCount >= this._players.length - 1) {
      // 找到最后出牌的玩家并设置为当前玩家
      const lastPlayedIndex = this._players.findIndex(p => p === this._lastPlayedBy);
      if (lastPlayedIndex !== -1) {
        this._players.forEach((p, i) => p.isActive = i === lastPlayedIndex);
        this._currentPlayerIndex = lastPlayedIndex;
      }
      
      // 清空最后出的牌，开始新的一轮
      this._lastPlayedCombo = new CardCombo();
      this._lastPlayedBy = null;
      this._passCount = 0;
    } else {
      // 轮到下一个玩家
      this.nextTurn();
    }
    
    return PlayResult.SUCCESS;
  }

  /**
   * 轮到下一个玩家
   */
  private nextTurn(): void {
    this.currentPlayer.isActive = false;
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;
    this.currentPlayer.isActive = true;
  }

  /**
   * 游戏结束
   */
  private endGame(winner: Player): void {
    this._state = GameState.GAME_OVER;
    
    // 根据角色判断输赢
    const isLandlordWin = winner.role === PlayerRole.LANDLORD;
    
    // 设置玩家状态
    this._players.forEach(player => {
      player.isActive = false;
      // 可以在这里添加更多逻辑，例如设置玩家获胜状态
      // 如果地主赢了，设置地主获胜；否则，设置农民获胜
      player.isWinner = (isLandlordWin && player.role === PlayerRole.LANDLORD) || 
                         (!isLandlordWin && player.role === PlayerRole.FARMER);
    });
  }

  /**
   * 重启游戏
   */
  restart(): void {
    this._state = GameState.WAITING;
    this.start();
  }
} 