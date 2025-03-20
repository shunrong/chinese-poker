import { Card } from './Card';

/**
 * 牌型枚举
 */
export enum ComboType {
  PASS = 'PASS',                 // 不出牌
  SINGLE = 'SINGLE',             // 单张
  PAIR = 'PAIR',                 // 对子
  TRIO = 'TRIO',                 // 三张
  TRIO_WITH_SINGLE = 'TRIO_WITH_SINGLE', // 三带一
  TRIO_WITH_PAIR = 'TRIO_WITH_PAIR',     // 三带二
  STRAIGHT = 'STRAIGHT',         // 顺子（五张或更多连续单牌）
  STRAIGHT_PAIR = 'STRAIGHT_PAIR', // 连对（三对或更多连续对牌）
  AIRPLANE = 'AIRPLANE',         // 飞机（两组或更多连续三张）
  AIRPLANE_WITH_SINGLE = 'AIRPLANE_WITH_SINGLE', // 飞机带单牌
  AIRPLANE_WITH_PAIR = 'AIRPLANE_WITH_PAIR',     // 飞机带对子
  FOUR_WITH_TWO_SINGLE = 'FOUR_WITH_TWO_SINGLE', // 四带二单
  FOUR_WITH_TWO_PAIR = 'FOUR_WITH_TWO_PAIR',     // 四带二对
  BOMB = 'BOMB',                 // 炸弹（四张相同点数）
  ROCKET = 'ROCKET',             // 火箭（双王）
  INVALID = 'INVALID',           // 无效牌型
}

/**
 * 牌型组合类
 */
export class CardCombo {
  private _cards: Card[] = [];
  private _type: ComboType = ComboType.INVALID;
  private _mainValue: number = 0;  // 主牌值（用于比较大小）

  constructor(cards: Card[] = []) {
    this._cards = [...cards];
    if (this._cards.length === 0) {
      this._type = ComboType.PASS;
    } else {
      this.analyzeComboType();
    }
  }

  /**
   * 设置牌组并分析牌型
   */
  setCards(cards: Card[]): void {
    this._cards = [...cards];
    if (this._cards.length === 0) {
      this._type = ComboType.PASS;
    } else {
      this.analyzeComboType();
    }
  }

  /**
   * 获取牌组
   */
  get cards(): Card[] {
    return [...this._cards];
  }

  /**
   * 获取牌型
   */
  get type(): ComboType {
    return this._type;
  }

  /**
   * 获取主牌值
   */
  get mainValue(): number {
    return this._mainValue;
  }

  /**
   * 判断是否为有效牌型
   */
  isValid(): boolean {
    return this._type !== ComboType.INVALID;
  }

  /**
   * 判断是否为空（不出牌）
   */
  isEmpty(): boolean {
    return this._cards.length === 0;
  }

  /**
   * 分析牌组的牌型
   */
  private analyzeComboType(): void {
    // 对于空牌组，在构造函数和setCards中已经设置为PASS
    if (this._cards.length === 0) {
      return;
    }

    // 将牌按点数分组并排序
    const cardGroups = this.groupCardsByRank();
    
    // 分析牌型
    if (this.isRocket()) {
      this._type = ComboType.ROCKET;
      this._mainValue = 100; // 火箭最大
    } else if (this.isBomb(cardGroups)) {
      this._type = ComboType.BOMB;
      this._mainValue = this._cards[0].value; // 炸弹的牌值
    } else if (this.isSingle()) {
      this._type = ComboType.SINGLE;
      this._mainValue = this._cards[0].value;
    } else if (this.isPair(cardGroups)) {
      this._type = ComboType.PAIR;
      this._mainValue = this._cards[0].value;
    } else if (this.isTrio(cardGroups)) {
      this._type = ComboType.TRIO;
      this._mainValue = this.findGroupOfSize(cardGroups, 3)[0].value;
    } else if (this.isTrioWithSingle(cardGroups)) {
      this._type = ComboType.TRIO_WITH_SINGLE;
      this._mainValue = this.findGroupOfSize(cardGroups, 3)[0].value;
    } else if (this.isTrioWithPair(cardGroups)) {
      this._type = ComboType.TRIO_WITH_PAIR;
      this._mainValue = this.findGroupOfSize(cardGroups, 3)[0].value;
    } else if (this.isStraight()) {
      this._type = ComboType.STRAIGHT;
      this._mainValue = Math.max(...this._cards.map(card => card.value));
    } else if (this.isStraightPair(cardGroups)) {
      this._type = ComboType.STRAIGHT_PAIR;
      this._mainValue = Math.max(...this._cards.map(card => card.value));
    } else if (this.isAirplane(cardGroups)) {
      this._type = ComboType.AIRPLANE;
      // 找出所有的三张牌组
      const trioGroups = this.findAllGroupsOfSize(cardGroups, 3);
      this._mainValue = Math.max(...trioGroups.map(card => card.value));
    } else if (this.isAirplaneWithSingle(cardGroups)) {
      this._type = ComboType.AIRPLANE_WITH_SINGLE;
      const trioGroups = this.findAllGroupsOfSize(cardGroups, 3);
      this._mainValue = Math.max(...trioGroups.map(card => card.value));
    } else if (this.isAirplaneWithPair(cardGroups)) {
      this._type = ComboType.AIRPLANE_WITH_PAIR;
      const trioGroups = this.findAllGroupsOfSize(cardGroups, 3);
      this._mainValue = Math.max(...trioGroups.map(card => card.value));
    } else if (this.isFourWithTwoSingle(cardGroups)) {
      this._type = ComboType.FOUR_WITH_TWO_SINGLE;
      this._mainValue = this.findGroupOfSize(cardGroups, 4)[0].value;
    } else if (this.isFourWithTwoPair(cardGroups)) {
      this._type = ComboType.FOUR_WITH_TWO_PAIR;
      this._mainValue = this.findGroupOfSize(cardGroups, 4)[0].value;
    } else {
      this._type = ComboType.INVALID;
      this._mainValue = 0;
    }
  }

  /**
   * 将牌按点数分组
   */
  private groupCardsByRank(): Map<number, Card[]> {
    const groups = new Map<number, Card[]>();
    
    for (const card of this._cards) {
      const value = card.value;
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(card);
    }
    
    return groups;
  }

  /**
   * 判断是否为火箭（大小王）
   */
  private isRocket(): boolean {
    return this._cards.length === 2 &&
           this._cards.every(card => card.isJoker()) &&
           this._cards[0].value !== this._cards[1].value;
  }

  /**
   * 判断是否为炸弹（四张相同点数）
   */
  private isBomb(groups: Map<number, Card[]>): boolean {
    return groups.size === 1 && this._cards.length === 4;
  }

  /**
   * 判断是否为单张
   */
  private isSingle(): boolean {
    return this._cards.length === 1;
  }

  /**
   * 判断是否为对子
   */
  private isPair(groups: Map<number, Card[]>): boolean {
    return groups.size === 1 && this._cards.length === 2;
  }

  /**
   * 判断是否为三张
   */
  private isTrio(groups: Map<number, Card[]>): boolean {
    return groups.size === 1 && this._cards.length === 3;
  }

  /**
   * 判断是否为三带一
   */
  private isTrioWithSingle(groups: Map<number, Card[]>): boolean {
    return this._cards.length === 4 && 
           groups.size === 2 && 
           this.hasGroupOfSize(groups, 3);
  }

  /**
   * 判断是否为三带二
   */
  private isTrioWithPair(groups: Map<number, Card[]>): boolean {
    return this._cards.length === 5 && 
           groups.size === 2 && 
           this.hasGroupOfSize(groups, 3) &&
           this.hasGroupOfSize(groups, 2);
  }

  /**
   * 判断是否为顺子（五张或更多连续单牌）
   */
  private isStraight(): boolean {
    if (this._cards.length < 5) return false;
    
    // 检查是否有2或王（不能包含在顺子中）
    if (this._cards.some(card => card.value >= 15 || card.isJoker())) {
      return false;
    }
    
    // 排序
    const sortedCards = [...this._cards].sort((a, b) => a.value - b.value);
    
    // 检查是否连续且无重复
    for (let i = 1; i < sortedCards.length; i++) {
      if (sortedCards[i].value !== sortedCards[i-1].value + 1) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 判断是否为连对（三对或更多连续对牌）
   */
  private isStraightPair(groups: Map<number, Card[]>): boolean {
    // 必须至少有3对，且总牌数必须是偶数
    if (this._cards.length < 6 || this._cards.length % 2 !== 0 || groups.size < 3) {
      return false;
    }
    
    // 每个点数必须有且仅有2张牌
    if ([...groups.values()].some(group => group.length !== 2)) {
      return false;
    }
    
    // 检查是否有2或王（不能包含在连对中）
    if (this._cards.some(card => card.value >= 15 || card.isJoker())) {
      return false;
    }
    
    // 排序所有点数并检查是否连续
    const values = [...groups.keys()].sort((a, b) => a - b);
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i-1] + 1) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 判断是否为飞机（两组或更多连续三张）
   */
  private isAirplane(groups: Map<number, Card[]>): boolean {
    // 至少需要两组三张，总牌数必须是3的倍数
    if (this._cards.length < 6 || this._cards.length % 3 !== 0) {
      return false;
    }
    
    // 找出所有点数有3张的牌组
    const trioGroups = [...groups.entries()]
      .filter(([, cards]) => cards.length === 3)
      .map(([value]) => value)
      .sort((a, b) => a - b);
    
    // 检查三张牌组的数量是否符合要求
    if (trioGroups.length < 2) {
      return false;
    }
    
    // 检查是否有2或王（不能包含在飞机中）
    if (trioGroups.some(value => value >= 15)) {
      return false;
    }
    
    // 检查三张牌组是否连续
    for (let i = 1; i < trioGroups.length; i++) {
      if (trioGroups[i] !== trioGroups[i-1] + 1) {
        return false;
      }
    }
    
    // 确认只有三张牌组（没有其他牌）
    return trioGroups.length * 3 === this._cards.length;
  }

  /**
   * 判断是否为飞机带单牌
   */
  private isAirplaneWithSingle(groups: Map<number, Card[]>): boolean {
    // 找出所有点数有3张的牌组
    const trioEntries = [...groups.entries()]
      .filter(([, cards]) => cards.length === 3);
    const trioCount = trioEntries.length;
    
    // 至少需要两组三张，总牌数必须是 (3+1) * 飞机数量
    if (trioCount < 2 || this._cards.length !== 4 * trioCount) {
      return false;
    }
    
    // 检查三张牌组是否连续
    const trioValues = trioEntries.map(([value]) => value).sort((a, b) => a - b);
    
    // 检查是否有2或王（不能包含在飞机中）
    if (trioValues.some(value => value >= 15)) {
      return false;
    }
    
    for (let i = 1; i < trioValues.length; i++) {
      if (trioValues[i] !== trioValues[i-1] + 1) {
        return false;
      }
    }
    
    // 确认单牌数量与三张组数量相同
    const singleCount = [...groups.values()].filter(cards => cards.length === 1).length;
    const remainingPairCount = [...groups.values()].filter(cards => cards.length === 2).length;
    
    // 如果有对子，每个对子算两个单牌
    const totalSingles = singleCount + remainingPairCount * 2;
    return totalSingles === trioCount;
  }

  /**
   * 判断是否为飞机带对子
   */
  private isAirplaneWithPair(groups: Map<number, Card[]>): boolean {
    // 找出所有点数有3张的牌组
    const trioEntries = [...groups.entries()]
      .filter(([, cards]) => cards.length === 3);
    const trioCount = trioEntries.length;
    
    // 至少需要两组三张，总牌数必须是 (3+2) * 飞机数量
    if (trioCount < 2 || this._cards.length !== 5 * trioCount) {
      return false;
    }
    
    // 检查三张牌组是否连续
    const trioValues = trioEntries.map(([value]) => value).sort((a, b) => a - b);
    
    // 检查是否有2或王（不能包含在飞机中）
    if (trioValues.some(value => value >= 15)) {
      return false;
    }
    
    for (let i = 1; i < trioValues.length; i++) {
      if (trioValues[i] !== trioValues[i-1] + 1) {
        return false;
      }
    }
    
    // 确认对子数量与三张组数量相同
    return [...groups.values()].filter(cards => cards.length === 2).length === trioCount;
  }

  /**
   * 判断是否为四带二单
   */
  private isFourWithTwoSingle(groups: Map<number, Card[]>): boolean {
    return this._cards.length === 6 && 
           this.hasGroupOfSize(groups, 4) &&
           groups.size >= 2;
  }

  /**
   * 判断是否为四带二对
   */
  private isFourWithTwoPair(groups: Map<number, Card[]>): boolean {
    if (this._cards.length !== 8 || !this.hasGroupOfSize(groups, 4)) {
      return false;
    }
    
    // 除了四张相同点数的牌外，其余的必须是对子
    const pairCount = [...groups.values()].filter(cards => cards.length === 2).length;
    return pairCount === 2;
  }

  /**
   * 判断是否有特定大小的牌组
   */
  private hasGroupOfSize(groups: Map<number, Card[]>, size: number): boolean {
    return [...groups.values()].some(cards => cards.length === size);
  }

  /**
   * 查找特定大小的牌组中的牌
   */
  private findGroupOfSize(groups: Map<number, Card[]>, size: number): Card[] {
    for (const cards of groups.values()) {
      if (cards.length === size) {
        return cards;
      }
    }
    return [];
  }

  /**
   * 查找所有特定大小的牌组
   */
  private findAllGroupsOfSize(groups: Map<number, Card[]>, size: number): Card[] {
    const result: Card[] = [];
    for (const cards of groups.values()) {
      if (cards.length === size) {
        result.push(...cards);
      }
    }
    return result;
  }

  /**
   * 判断此牌型是否能够压制另一个牌型
   */
  canBeat(other: CardCombo): boolean {
    // 如果是不出牌，任何牌型都可以出
    if (other.type === ComboType.PASS) {
      return this.isValid();
    }
    
    // 火箭可以压任何牌型
    if (this.type === ComboType.ROCKET) {
      return true;
    }
    
    // 炸弹可以压除火箭外的任何牌型
    if (this.type === ComboType.BOMB) {
      if (other.type === ComboType.ROCKET) {
        return false;
      }
      if (other.type === ComboType.BOMB) {
        return this.mainValue > other.mainValue;
      }
      return true;
    }
    
    // 对于普通牌型，只有相同牌型且更大的牌值才能压制
    return this.type === other.type && 
           this._cards.length === other.cards.length && 
           this.mainValue > other.mainValue;
  }
} 