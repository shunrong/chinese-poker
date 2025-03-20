import { Card } from './Card';

/**
 * 玩家角色
 */
export enum PlayerRole {
  LANDLORD = 'LANDLORD',  // 地主
  FARMER = 'FARMER',      // 农民
}

/**
 * 玩家类
 */
export class Player {
  private _id: string;
  private _name: string;
  private _role: PlayerRole = PlayerRole.FARMER;  // 默认为农民
  private _cards: Card[] = [];
  private _isActive: boolean = false;
  private _isWinner: boolean = false;  // 新增获胜状态属性
  
  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
  }

  /**
   * 获取玩家ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * 获取玩家名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 设置玩家名称
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * 获取玩家角色
   */
  get role(): PlayerRole {
    return this._role;
  }

  /**
   * 设置玩家角色
   */
  set role(value: PlayerRole) {
    this._role = value;
  }

  /**
   * 获取玩家手牌
   */
  get cards(): Card[] {
    return [...this._cards];
  }

  /**
   * 获取已选中的牌
   */
  get selectedCards(): Card[] {
    return this._cards.filter(card => card.selected);
  }

  /**
   * 获取是否是当前活跃玩家
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * 设置是否是当前活跃玩家
   */
  set isActive(value: boolean) {
    this._isActive = value;
  }

  /**
   * 获取玩家是否获胜
   */
  get isWinner(): boolean {
    return this._isWinner;
  }

  /**
   * 设置玩家获胜状态
   */
  set isWinner(value: boolean) {
    this._isWinner = value;
  }

  /**
   * 添加手牌
   */
  addCards(cards: Card[]): void {
    this._cards.push(...cards);
    this.sortCards();
  }

  /**
   * 出牌
   * @returns 出的牌
   */
  playCards(cards: Card[]): Card[] {
    // 验证所有牌都在玩家手中
    if (!cards.every(card => this._cards.includes(card))) {
      throw new Error('尝试打出不在手中的牌');
    }
    
    // 从手牌中移除这些牌
    this._cards = this._cards.filter(card => !cards.includes(card));
    
    return cards;
  }

  /**
   * 打出所有选中的牌
   */
  playSelectedCards(): Card[] {
    const selectedCards = this.selectedCards;
    if (selectedCards.length === 0) {
      throw new Error('没有选中任何牌');
    }
    return this.playCards(selectedCards);
  }

  /**
   * 清除所有选中状态
   */
  clearSelection(): void {
    this._cards.forEach(card => card.selected = false);
  }

  /**
   * 排序手牌（按点数从大到小）
   */
  sortCards(): void {
    this._cards.sort((a, b) => b.value - a.value);
  }

  /**
   * 重置玩家状态
   */
  reset(): void {
    this._cards = [];
    this._role = PlayerRole.FARMER;
    this._isActive = false;
  }

  /**
   * 获取剩余手牌数量
   */
  get remainingCardCount(): number {
    return this._cards.length;
  }
} 