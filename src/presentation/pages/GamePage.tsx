import { Alert, Button, Layout, Space, Typography, Tag, Steps, Result } from 'antd';
import { createStyles } from 'antd-style';
import { useGameStore } from '../../application/GameStore';
import { GameState } from '../../domain/models/Game';
import { PlayerRole } from '../../domain/models/Player';
import { PlayerComponent, PlayerPosition } from '../components/PlayerComponent';
import { CardComponent } from '../components/CardComponent';
import { TrophyOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

const { Title, Text, Paragraph } = Typography;
const { Content, Header } = Layout;
const { Step } = Steps;

const useStyles = createStyles(({ css, token }) => ({
  layout: css`
    min-height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,
  
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    background-color: ${token.colorBgContainer};
    position: relative;
  `,
  
  headerLeft: css`
    display: flex;
    align-items: center;
    gap: 16px;
  `,

  headerRight: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,

  gameStatus: css`
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  `,

  gameStatusDetails: css`
    position: absolute;
    top: 100%;
    left: 0;
    width: 300px;
    padding: 12px;
    background-color: ${token.colorBgContainer};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    display: none;
    margin-top: 8px;
  `,

  gameStatusWrapper: css`
    position: relative;
    
    &:hover .status-details {
      display: block;
    }
  `,
  
  content: css`
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
  `,
  
  gameArea: css`
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  `,
  
  gameInfo: css`
    margin-bottom: 24px;
    width: 100%;
    transition: all 0.3s ease;
  `,

  gameInfoCollapsed: css`
    background-color: ${token.colorBgContainer};
    padding: 10px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  `,
  
  collapseToggle: css`
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 5;
  `,
  
  tableArea: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 50%;
    background-color: ${token.colorSuccessBg};
    border: 1px solid ${token.colorBorder};
    margin: 0 auto;
    width: 100%;
    max-width: 1600px;
    min-height: 800px;
  `,
  
  playedCardsArea: css`
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    min-height: 360px;
    padding: 10px;
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 5;
  `,
  
  cardsContainer: css`
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 8px;
    width: 100%;
    justify-content: center;
  `,
  
  landlordCards: css`
    position: absolute;
    top: 0;
    left: 20%;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 5;
  `,

  activePlayerNote: css`
    padding: 12px 16px;
    margin-top: 16px;
    margin-bottom: 16px;
    background-color: ${token.colorPrimaryBg};
    border-radius: 8px;
    text-align: center;
    border: 1px solid ${token.colorPrimary};
  `,

  gameGuide: css`
    margin-bottom: 24px;
    padding: 16px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    border: 1px dashed ${token.colorBorder};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    max-width: 80%;
    width: 600px;
  `,
  
  comboTypeTag: css`
    margin-left: 16px;
    font-size: 16px;
    padding: 4px 12px;
    border-radius: 16px;
    font-weight: bold;
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(24, 144, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
      }
    }
  `,

  playerBottom: css`
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 800px;
    z-index: 10;
  `,
  
  playerLeft: css`
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 35%;
    height: 80%;
    max-width: 200px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  
  playerRight: css`
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 35%;
    height: 80%;
    max-width: 200px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  gameResult: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 20px;
    width: 80%;
    max-width: 600px;
  `,

  playerLabel: css`
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${token.colorPrimary};
    color: white;
    padding: 2px 10px;
    border-radius: 4px;
    font-weight: bold;
  `,

  errorAlert: css`
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    width: auto;
  `,
}));

export const GamePage: React.FC = () => {
  const { styles } = useStyles();
  const { 
    gameState, 
    players, 
    currentPlayer,
    lastPlayedCards,
    lastPlayedByName,
    lastPlayedCombo,
    landlordCards,
    errorMessage,
    startGame,
    restartGame,
    getComboTypeDisplay,
    getComboTypeColor
  } = useGameStore();
  
  // 判断游戏是否已开始
  const isGameStarted = gameState !== GameState.WAITING;
  
  // 获取游戏状态显示文本
  const getGameStateText = () => {
    switch (gameState) {
      case GameState.WAITING:
        return <Tag color="default">等待开始</Tag>;
      case GameState.DEALING:
        return <Tag color="processing">发牌中</Tag>;
      case GameState.BIDDING:
        return <Tag color="warning">叫地主阶段</Tag>;
      case GameState.PLAYING:
        return <Tag color="success">游戏进行中</Tag>;
      case GameState.GAME_OVER:
        return <Tag color="error">游戏结束</Tag>;
      default:
        return null;
    }
  };
  
  // 获取当前游戏阶段
  const getCurrentStep = () => {
    switch (gameState) {
      case GameState.WAITING:
        return 0;
      case GameState.DEALING:
      case GameState.BIDDING:
        return 1;
      case GameState.PLAYING:
        return 2;
      case GameState.GAME_OVER:
        return 3;
      default:
        return 0;
    }
  };

  // 按座位顺序排列玩家（当前玩家在底部，其他玩家顺时针排列）
  const arrangedPlayers = useMemo(() => {
    if (!players.length || !currentPlayer) return [];

    // 找到当前玩家的索引
    const currentIndex = players.findIndex(p => p.id === currentPlayer.id);
    if (currentIndex === -1) return players;

    // 重新排列玩家顺序，当前玩家在底部，其他玩家顺时针排列
    const result = [];
    
    // 底部玩家（当前玩家）
    result[0] = players[currentIndex];
    
    // 左侧玩家（前一位）
    const leftIndex = (currentIndex - 1 + players.length) % players.length;
    result[1] = players[leftIndex];
    
    // 右侧玩家（后一位）
    const rightIndex = (currentIndex + 1) % players.length;
    result[2] = players[rightIndex];
    
    return result;
  }, [players, currentPlayer]);
  
  // 底牌区域
  const renderLandlordCards = () => {
    if (gameState === GameState.BIDDING || gameState === GameState.PLAYING || gameState === GameState.GAME_OVER) {
      return (
        <div className={styles.landlordCards}>
          <Space direction="vertical" align="center" size="small">
            <Title level={5} style={{ margin: 0 }}>底牌</Title>
            <div style={{ display: 'flex', gap: '2px' }}>
              {landlordCards.map((card, index) => (
                <CardComponent 
                  key={index} 
                  card={card} 
                  isInteractive={false}
                />
              ))}
            </div>
          </Space>
        </div>
      );
    }
    return null;
  };
  
  // 出牌区域
  const renderPlayedCards = () => {
    if (lastPlayedCards.length > 0 && lastPlayedByName) {
      const comboType = getComboTypeDisplay(lastPlayedCombo);
      const comboColor = getComboTypeColor(lastPlayedCombo);
      
      return (
        <div className={styles.playedCardsArea}>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>
              {lastPlayedByName} 出牌: 
              {comboType && (
                <Tag className={styles.comboTypeTag} color={comboColor}>
                  {comboType}
                </Tag>
              )}
            </Title>
            <div className={styles.cardsContainer}>
              {lastPlayedCards.map((card, index) => (
                <CardComponent 
                  key={index} 
                  card={card} 
                  isInteractive={false}
                  isPlayed={true}
                />
              ))}
            </div>
          </Space>
        </div>
      );
    }
    
    if (isGameStarted) {
      return (
        <div className={styles.playedCardsArea}>
          <Title level={4} style={{ margin: 0 }}>出牌区域</Title>
        </div>
      );
    }
    
    return null;
  };
  
  // 渲染游戏结果
  const renderGameResult = () => {
    if (gameState !== GameState.GAME_OVER) return null;
    
    // 找出获胜者
    const winner = players.find(player => player.remainingCardCount === 0);
    if (!winner) return null;
    
    const isLandlordWin = winner.role === PlayerRole.LANDLORD;
    const title = isLandlordWin ? '地主胜利!' : '农民胜利!';
    const description = `${winner.name} 最先出完了所有手牌`;
    
    return (
      <div className={styles.gameResult}>
        <Result
          icon={<TrophyOutlined />}
          status="success"
          title={title}
          subTitle={description}
          extra={
            <Button type="primary" onClick={restartGame}>
              再来一局
            </Button>
          }
        />
      </div>
    );
  };

  // 渲染游戏指南
  const renderGameGuide = () => {
    if (isGameStarted) return null;
    
    return (
      <div className={styles.gameGuide}>
        <Title level={4}>游戏说明</Title>
        <Paragraph>
          这是一个演示版斗地主，你将同时扮演全部3名玩家。游戏流程如下：
        </Paragraph>
        <ol>
          <li>点击"开始游戏"按钮，系统会发牌并随机选择一名玩家开始叫地主</li>
          <li>当轮到某名玩家时，扮演该玩家决定是否叫地主</li>
          <li>如果一轮下来没有人叫地主，系统会自动重新发牌</li>
          <li>确定地主后，地主会获得3张底牌</li>
          <li>游戏开始，轮流出牌，需要遵循牌型规则</li>
          <li>谁先出完所有手牌，谁就获胜</li>
        </ol>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" size="large" onClick={startGame}>开始游戏</Button>
        </div>
      </div>
    );
  };
  
  // 渲染游戏头部状态
  const renderHeaderStatus = () => {
    return (
      <div className={styles.gameStatusWrapper}>
        <div className={styles.gameStatus}>
          <div>{getGameStateText()}</div>
          {currentPlayer && (
            <div>
              <Text strong>{currentPlayer.name}</Text> 
              {currentPlayer.isActive && <Tag color="processing" style={{ marginLeft: 4 }}>回合中</Tag>}
            </div>
          )}
        </div>
        <div className={`${styles.gameStatusDetails} status-details`}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Steps current={getCurrentStep()} size="small" direction="vertical">
              <Step title="准备" description="点击开始游戏" />
              <Step title="叫地主" description="选择角色" />
              <Step title="游戏中" description="轮流出牌" />
              <Step title="结束" description="分出胜负" />
            </Steps>
            
            {gameState === GameState.BIDDING && (
              <Text type="warning">请扮演当前回合玩家选择是否当地主</Text>
            )}
            {gameState === GameState.PLAYING && (
              <Text type="success">轮到谁的回合就扮演谁出牌</Text>
            )}
          </Space>
        </div>
      </div>
    );
  };
  
  // 渲染玩家
  const renderPlayers = () => {
    if (!arrangedPlayers.length || gameState === GameState.WAITING) return null;
    
    return (
      <>
        {/* 底部玩家（当前回合玩家） */}
        <div className={styles.playerBottom}>
          <div className={styles.playerLabel}>{arrangedPlayers[0].name}</div>
          <PlayerComponent player={arrangedPlayers[0]} position={PlayerPosition.BOTTOM} />
        </div>
        
        {/* 左侧玩家 */}
        <div className={styles.playerLeft}>
          <div className={styles.playerLabel}>{arrangedPlayers[1].name}</div>
          <PlayerComponent player={arrangedPlayers[1]} position={PlayerPosition.LEFT} />
        </div>
        
        {/* 右侧玩家 */}
        <div className={styles.playerRight}>
          <div className={styles.playerLabel}>{arrangedPlayers[2].name}</div>
          <PlayerComponent player={arrangedPlayers[2]} position={PlayerPosition.RIGHT} />
        </div>
      </>
    );
  };
  
  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={2} style={{ margin: 0 }}>斗地主</Title>
          {isGameStarted && renderHeaderStatus()}
        </div>
        <div className={styles.headerRight}>
          {(gameState === GameState.GAME_OVER) && (
            <Button type="primary" onClick={restartGame}>重新开始</Button>
          )}
        </div>
      </Header>
      
      <Content className={styles.content}>
        {errorMessage && (
          <Alert 
            message={errorMessage} 
            type="error" 
            showIcon 
            className={styles.errorAlert}
          />
        )}

        <div className={styles.tableArea}>
          {renderGameGuide()}
          {renderGameResult()}
          {renderLandlordCards()}
          {renderPlayedCards()}
          {renderPlayers()}
        </div>
      </Content>
    </Layout>
  );
}; 