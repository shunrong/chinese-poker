import { Button, Space, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { Player } from '../../domain/models/Player';
import { useGameStore } from '../../application/GameStore';
import { CardComponent } from './CardComponent';
import { GameState } from '../../domain/models/Game';
import { CardCombo, ComboType } from '../../domain/models/CardCombo';
import { BulbOutlined } from '@ant-design/icons';
import { Card } from '../../domain/models/Card';

const useStyles = createStyles(({ css, token }) => ({
  playerArea: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;
    background-color: ${token.colorBgContainer};
    min-height: 120px;
    transition: all 0.3s ease;
    width: 100%;
  `,
  
  playerBottom: css`
    padding: 8px;
    min-height: 100px;
  `,
  
  playerSide: css`
    padding: 6px;
    min-height: 100px;
  `,
  
  active: css`
    border: 2px solid ${token.colorPrimary};
    box-shadow: 0 0 12px ${token.colorPrimary};
    background-color: ${token.colorPrimaryBg};
    transform: translateY(-5px);
  `,
  
  playerInfo: css`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    margin-bottom: 10px;
  `,
  
  playerInfoSide: css`
    margin-bottom: 5px;
  `,
  
  cardsContainer: css`
    display: flex;
    flex-wrap: nowrap;
    padding: 5px;
    overflow-x: auto;
    width: 100%;
    min-height: 120px;
    justify-content: center;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: ${token.colorBorder};
      border-radius: 20px;
      border: 3px solid #f1f1f1;
    }
  `,
  
  verticalCardsContainer: css`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 5px;
    // overflow-y: auto;
    // height: 400px;
    justify-content: flex-start;
    align-items: center;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: ${token.colorBorder};
      border-radius: 20px;
      border: 3px solid #f1f1f1;
    }
  `,
  
  verticalCardsContainerLeft: css`
    transform: rotate(0deg);
  `,
  
  verticalCardsContainerRight: css`
    transform: rotate(180deg);
  `,
  
  actions: css`
    margin-top: 10px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  `,

  activeIndicator: css`
    color: ${token.colorPrimary};
    font-weight: bold;
    margin-left: 8px;
    font-size: 12px;
  `,

  hintButton: css`
    margin-left: 6px;
  `,
  
  compactTitle: css`
    font-size: 14px !important;
    margin-bottom: 0 !important;
    line-height: 1.2 !important;
  `,
  
  sideTitle: css`
    font-size: 12px !important;
    margin-bottom: 0 !important;
    line-height: 1 !important;
  `,
}));

export enum PlayerPosition {
  BOTTOM,  // 底部玩家（当前玩家）
  LEFT,    // 左侧玩家
  RIGHT,   // 右侧玩家
}

interface PlayerProps {
  player: Player;
  position?: PlayerPosition; // 玩家位置
}

export const PlayerComponent: React.FC<PlayerProps> = ({ 
  player,
  position = PlayerPosition.BOTTOM  // 默认为底部玩家
}) => {
  const { styles } = useStyles();
  const { 
    gameState, 
    selectCard, 
    playSelectedCards, 
    pass, 
    bidLandlord,
    getPlayerRoleDisplay,
    selectedCards,
    lastPlayedCombo
  } = useGameStore();
  
  // 判断选中的牌是否可以出
  const canPlaySelected = () => {
    // 如果没有选中牌，不能出
    if (selectedCards.length === 0) return false;
    
    // 创建选中牌的组合
    const selectedCombo = new CardCombo(selectedCards);
    
    // 检查是否是有效的牌型
    if (!selectedCombo.isValid()) return false;
    
    // 如果上一手是空的，或者是自己出的牌，可以出任意有效牌型
    if (lastPlayedCombo.isEmpty()) return true;
    
    // 否则，检查是否能压过上家的牌
    return selectedCombo.canBeat(lastPlayedCombo);
  };
  
  // 处理选择卡牌
  const handleCardClick = (card: Card) => {
    if (player.isActive) {
      selectCard(card);
    }
  };

  // 判断是否可以与牌交互
  const canInteract = player.isActive;

  // 处理出牌
  const handlePlay = () => {
    playSelectedCards(player.id);
  };

  // 处理不出（跳过）
  const handlePass = () => {
    pass(player.id);
  };

  // 处理叫地主
  const handleBid = (bid: boolean) => {
    bidLandlord(player.id, bid);
  };
  
  // 判断是否可以出牌的按钮状态
  const playButtonDisabled = !canPlaySelected();
  
  // 判断是否可以跳过
  const canPass = !lastPlayedCombo.isEmpty();
  
  // 处理提示按钮点击
  const handleHint = () => {
    // 检查是否已有选中的牌
    const hasSelectedCards = player.cards.some(card => card.selected);
    
    // 如果已有选中的牌，取消所有选中状态
    if (hasSelectedCards) {
      player.cards.forEach(card => {
        if (card.selected) {
          card.selected = false;
          selectCard(card); // 通知状态更新
        }
      });
      return;
    }
    
    // 如果是新的一轮，提示最小的单牌
    if (lastPlayedCombo.isEmpty()) {
      const smallestCard = [...player.cards].sort((a, b) => a.value - b.value)[0];
      if (smallestCard) {
        smallestCard.selected = true;
        selectCard(smallestCard);
      }
      return;
    }
    
    // 根据上一手牌型，找出可以压过的牌型
    const cards = player.cards;
    let suggestedCards: Card[] = [];
    
    // 根据不同的牌型给出建议
    switch(lastPlayedCombo.type) {
      case ComboType.SINGLE:
        // 找出大于上家的单牌
        suggestedCards = findLargerSingle(cards, lastPlayedCombo.mainValue);
        break;
      case ComboType.PAIR:
        // 找出大于上家的对子
        suggestedCards = findLargerPair(cards, lastPlayedCombo.mainValue);
        break;
      case ComboType.BOMB:
        // 找出大于上家的炸弹
        suggestedCards = findLargerBomb(cards, lastPlayedCombo.mainValue);
        break;
      default:
        // 对于其他牌型，尝试出炸弹
        suggestedCards = findAnyBomb(cards);
        break;
    }
    
    // 如果找到了建议牌，选中它们
    if (suggestedCards.length > 0) {
      suggestedCards.forEach(card => {
        card.selected = true;
        selectCard(card);
      });
    }
  };
  
  // 查找大于指定值的单牌
  const findLargerSingle = (cards: Card[], value: number): Card[] => {
    const larger = cards.filter(card => card.value > value);
    if (larger.length === 0) return [];
    return [larger.sort((a, b) => a.value - b.value)[0]];
  };
  
  // 查找大于指定值的对子
  const findLargerPair = (cards: Card[], value: number): Card[] => {
    // 按点数对牌进行分组
    const groups = groupCardsByValue(cards);
    
    // 找出所有能组成对子的点数
    const pairGroups = Array.from(groups.entries())
      .filter(([cardValue, groupCards]) => groupCards.length >= 2 && cardValue > value)
      .sort(([a], [b]) => a - b);
    
    if (pairGroups.length === 0) return [];
    
    // 取最小的对子
    const [, groupCards] = pairGroups[0];
    return groupCards.slice(0, 2);
  };
  
  // 查找大于指定值的炸弹
  const findLargerBomb = (cards: Card[], value: number): Card[] => {
    const groups = groupCardsByValue(cards);
    
    const bombGroups = Array.from(groups.entries())
      .filter(([cardValue, groupCards]) => groupCards.length >= 4 && cardValue > value)
      .sort(([a], [b]) => a - b);
    
    if (bombGroups.length === 0) return [];
    
    const [, groupCards] = bombGroups[0];
    return groupCards.slice(0, 4);
  };
  
  // 查找任意炸弹
  const findAnyBomb = (cards: Card[]): Card[] => {
    const groups = groupCardsByValue(cards);
    
    const bombGroups = Array.from(groups.entries())
      .filter(([, groupCards]) => groupCards.length >= 4)
      .sort(([a], [b]) => a - b);
    
    if (bombGroups.length === 0) return [];
    
    const [, groupCards] = bombGroups[0];
    return groupCards.slice(0, 4);
  };
  
  // 按点数对牌进行分组
  const groupCardsByValue = (cards: Card[]): Map<number, Card[]> => {
    const groups = new Map<number, Card[]>();
    
    for (const card of cards) {
      const value = card.value;
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(card);
    }
    
    return groups;
  };
  
  // 获取玩家区域样式
  const getPlayerAreaClassName = () => {
    const classNames = [styles.playerArea];

    if (position === PlayerPosition.BOTTOM) {
      classNames.push(styles.playerBottom);
    } else {
      classNames.push(styles.playerSide);
    }
    
    if (player.isActive) {
      classNames.push(styles.active);
    }
    
    return classNames.join(' ');
  };
  
  // 获取玩家信息样式
  const getInfoClassName = () => {
    return position === PlayerPosition.BOTTOM 
      ? styles.playerInfo 
      : `${styles.playerInfo} ${styles.playerInfoSide}`;
  };
  
  // 修改 renderCards 函数，为左右侧玩家使用垂直布局
  const renderCards = () => {
    // 如果是左边或右边的玩家，垂直排列卡片
    const isVerticalLayout = position === PlayerPosition.LEFT || position === PlayerPosition.RIGHT;
    
    if (isVerticalLayout) {
      // 基础容器类名
      let containerClassName = styles.verticalCardsContainer;
      
      // 添加旋转类
      if (position === PlayerPosition.LEFT) {
        containerClassName += ' ' + styles.verticalCardsContainerLeft;
      } else {
        containerClassName += ' ' + styles.verticalCardsContainerRight;
      }
      
      // 对右侧玩家，反转卡片顺序，保证叠放正确
      const cardsToRender = [...player.cards];
      if (position === PlayerPosition.RIGHT) {
        cardsToRender.reverse();
      }
      
      return (
        <div className={containerClassName}>
          {cardsToRender.map((card) => (
            <CardComponent
              key={card.display}
              card={card}
              isInteractive={canInteract}
              onClick={handleCardClick}
              isSidePosition={true}
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className={styles.cardsContainer}>
        {player.cards.map((card) => (
          <CardComponent
            key={card.display}
            card={card}
            isInteractive={canInteract}
            onClick={handleCardClick}
            isSidePosition={position !== PlayerPosition.BOTTOM}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className={getPlayerAreaClassName()}>
      <div className={getInfoClassName()}>
        <Space size="small">
          <span>角色: {getPlayerRoleDisplay(player)}</span>
          <span>剩余: {player.remainingCardCount}张</span>
        </Space>
      </div>
      
      {renderCards()}
      
      {player.isActive && (
        <div className={styles.actions}>
          {gameState === GameState.BIDDING && (
            <>
              <Button type="primary" size="small" onClick={() => handleBid(true)}>叫地主</Button>
              <Button size="small" onClick={() => handleBid(false)}>不叫</Button>
            </>
          )}
          
          {gameState === GameState.PLAYING && (
            <>
              <Button 
                type="primary" 
                size="small" 
                onClick={handlePlay}
                disabled={playButtonDisabled}
              >
                出牌
              </Button>
              <Button 
                size="small" 
                onClick={handlePass}
                disabled={!canPass}
                danger
              >
                跳过
              </Button>
              <Tooltip title="智能提示">
                <Button
                  type="dashed"
                  icon={<BulbOutlined />}
                  onClick={handleHint}
                  className={styles.hintButton}
                  size="small"
                />
              </Tooltip>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 