import { createStyles } from 'antd-style';
import { Card as CardModel, Suit, SpecialCardType } from '../../domain/models/Card';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 70px;
    height: 100px;
    border-radius: 8px;
    background-color: white;
    border: 1px solid ${token.colorBorder};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    position: relative;
    user-select: none;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-right: -25px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:last-child {
      margin-right: 0;
    }
  `,

  sideCard: css`
    transform: rotate(90deg);
    margin-bottom: -70px;
    
    &:last-child {
      // margin-right: 0;
    }
  `,
  
  interactiveCard: css`
    cursor: pointer;
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transform: translateY(-5px);
      z-index: 3;
    }
  `,
  
  staticCard: css`
    cursor: default;
    margin-right: -15px;
    
    &:last-child {
      margin-right: 0;
    }
  `,
  
  playedCard: css`
    transform: scale(0.95);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    margin-right: -10px;
    
    &:last-child {
      margin-right: 0;
    }
  `,
  
  redCard: css`
    color: ${token.colorError};
  `,
  
  blackCard: css`
    color: ${token.colorText};
  `,
  
  selected: css`
    transform: translateY(-15px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 4;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(24, 144, 255, 0.2);
      border-radius: 8px;
    }
  `,
  
  rank: css`
    position: absolute;
    top: 5px;
    left: 5px;
    font-size: 16px;
  `,
  
  suit: css`
    font-size: 28px;
  `,
  
  joker: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  `,

  cardBack: css`
    background: linear-gradient(135deg, #ff6b6b, #f53b57);
    color: white;
    font-size: 16px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::after {
      content: '🎴';
      font-size: 30px;
    }
  `,
}));

interface CardProps {
  card: CardModel;
  onClick?: (card: CardModel) => void;
  isInteractive?: boolean; // 是否可交互（手牌可交互，底牌和打出的牌不可交互）
  isPlayed?: boolean; // 是否是已打出的牌
  isSidePosition?: boolean; // 是否是侧边位置的牌
  showBack?: boolean; // 是否显示牌背面
}

export const CardComponent: React.FC<CardProps> = ({ 
  card, 
  onClick,
  isInteractive = true, // 默认为可交互
  isPlayed = false, // 默认不是已打出的牌
  isSidePosition = false, // 默认不是侧边位置
  showBack = false, // 默认显示正面
}) => {
  const { styles } = useStyles();
  
  // 判断是否为红色牌（红桃或方块）
  const isRed = card.suit === Suit.HEART || card.suit === Suit.DIAMOND;
  
  // 处理点击事件
  const handleClick = () => {
    if (isInteractive && onClick) {
      onClick(card);
    }
  };
  
  // 安全获取牌面
  const getSafeRank = () => {
    try {
      if (card.isJoker() || !card.rank) return '';
      const display = card.display;
      return display.length > 1 ? display.slice(1) : display;
    } catch (error) {
      console.error('Error displaying rank:', error);
      return '?';
    }
  };
  
  // 获取卡片样式类名
  const getCardClassName = () => {
    const classNames = [];
    
    // 基础样式
    classNames.push(styles.card);
    
    // 添加颜色样式
    classNames.push(isRed ? styles.redCard : styles.blackCard);
    
    // 水平卡片样式
    if (isSidePosition) {
      classNames.push(styles.sideCard);
    }
    if (isPlayed) {
      classNames.push(styles.playedCard);
    }
    if (isInteractive) {
      classNames.push(styles.interactiveCard);
    }
    
    // 添加选中样式
    if (card.selected) {
      classNames.push(styles.selected);
    }
    
    return classNames.join(' ');
  };
  
  // 如果显示牌背面
  if (showBack) {
    return <div className={getCardClassName()} onClick={handleClick}><div className={styles.cardBack}></div></div>;
  }
  
  return (
    <div 
      className={getCardClassName()}
      onClick={handleClick}
    >
      {card.isJoker() ? (
        <div className={styles.joker}>
          {card.specialType === SpecialCardType.RED_JOKER ? '大王' : '小王'}
        </div>
      ) : (
        <>
          <div className={styles.rank}>{getSafeRank()}</div>
          <div className={styles.suit}>{card.suit}</div>
        </>
      )}
    </div>
  );
}; 