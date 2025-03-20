import { ConfigProvider, theme } from 'antd';
import { StyleProvider } from 'antd-style';
import zhCN from 'antd/locale/zh_CN';
import { GamePage } from './pages/Game';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#ff4d4f', // 红色主题，符合斗地主的喜庆主题
          borderRadius: 8,
        },
      }}
    >
      <StyleProvider>
        <GamePage />
      </StyleProvider>
    </ConfigProvider>
  );
};

export default App;
