import { Card, Rank, SpecialCardType, Suit } from './Card';

/**
 * 扑克牌组类
 */
export class Deck {
  private _cards: Card[] = [];

  /**
   * 初始化一副完整的扑克牌（54张）
   */
  constructor() {
    this.initialize();
  }

  /**
   * 初始化牌组
   */
  private initialize(): void {
    // 清空当前牌组
    this._cards = [];
    
    // 添加常规牌（四种花色，从3到2）
    const suits = [Suit.HEART, Suit.DIAMOND, Suit.CLUB, Suit.SPADE];
    const ranks = [
      Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
      Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN,
      Rank.KING, Rank.ACE, Rank.TWO
    ];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        this._cards.push(new Card(suit, rank));
      });
    });
    
    // 添加大小王
    this._cards.push(new Card(SpecialCardType.BLACK_JOKER));
    this._cards.push(new Card(SpecialCardType.RED_JOKER));
  }

  /**
   * 洗牌
   */
  shuffle(): void {
    for (let i = this._cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
    }
  }

  /**
   * 发牌
   * @param count 要发的牌数量
   * @returns 发出的牌
   */
  deal(count: number): Card[] {
    if (count > this._cards.length) {
      // 当剩余牌不足时，返回所有剩余的牌
      return this._cards.splice(0, this._cards.length);
    }
    return this._cards.splice(0, count);
  }

  /**
   * 获取剩余牌数
   */
  get remainingCount(): number {
    return this._cards.length;
  }

  /**
   * 获取所有牌
   */
  get cards(): Card[] {
    return [...this._cards];
  }

  /**
   * 重置牌组
   */
  reset(): void {
    this.initialize();
    this.shuffle();
  }
} 