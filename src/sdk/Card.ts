/**
 * 扑克牌花色枚举
 */
export enum Suit {
  HEART = '♥',    // 红桃
  DIAMOND = '♦',  // 方块
  CLUB = '♣',     // 梅花
  SPADE = '♠',    // 黑桃
}

/**
 * 扑克牌点数枚举
 */
export enum Rank {
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
  ACE = 14,
  TWO = 15,
}

/**
 * 牌面显示映射
 */
export const RankDisplay: Record<Rank, string> = {
  [Rank.THREE]: '3',
  [Rank.FOUR]: '4',
  [Rank.FIVE]: '5',
  [Rank.SIX]: '6',
  [Rank.SEVEN]: '7',
  [Rank.EIGHT]: '8',
  [Rank.NINE]: '9',
  [Rank.TEN]: '10',
  [Rank.JACK]: 'J',
  [Rank.QUEEN]: 'Q',
  [Rank.KING]: 'K',
  [Rank.ACE]: 'A',
  [Rank.TWO]: '2',
};

/**
 * 特殊牌类型
 */
export enum SpecialCardType {
  BLACK_JOKER = 'BLACK_JOKER',
  RED_JOKER = 'RED_JOKER',
}

/**
 * 扑克牌类
 */
export class Card {
  private readonly _suit?: Suit;
  private readonly _rank?: Rank;
  private readonly _specialType?: SpecialCardType;
  private _selected: boolean = false;

  /**
   * 构造常规扑克牌
   */
  constructor(suit: Suit, rank: Rank);
  /**
   * 构造王牌
   */
  constructor(specialType: SpecialCardType);
  constructor(suitOrSpecialType: Suit | SpecialCardType, rank?: Rank) {
    if (rank !== undefined) {
      this._suit = suitOrSpecialType as Suit;
      this._rank = rank;
    } else {
      this._specialType = suitOrSpecialType as SpecialCardType;
    }
  }

  /**
   * 获取牌的点数值
   */
  get value(): number {
    if (this.isJoker()) {
      return this._specialType === SpecialCardType.RED_JOKER ? 17 : 16;
    }
    return this._rank!;
  }

  /**
   * 判断是否为王牌
   */
  isJoker(): boolean {
    return this._specialType !== undefined;
  }

  /**
   * 获取花色
   */
  get suit(): Suit | undefined {
    return this._suit;
  }

  /**
   * 获取点数
   */
  get rank(): Rank | undefined {
    return this._rank;
  }

  /**
   * 获取特殊牌类型
   */
  get specialType(): SpecialCardType | undefined {
    return this._specialType;
  }

  /**
   * 获取牌面显示文本
   */
  get display(): string {
    if (this.isJoker()) {
      return this._specialType === SpecialCardType.RED_JOKER ? '大王' : '小王';
    }
    return `${this._suit}${RankDisplay[this._rank!]}`;
  }

  /**
   * 设置选中状态
   */
  set selected(value: boolean) {
    this._selected = value;
  }

  /**
   * 获取选中状态
   */
  get selected(): boolean {
    return this._selected;
  }

  /**
   * 切换选中状态
   */
  toggleSelected(): void {
    this._selected = !this._selected;
  }
} 