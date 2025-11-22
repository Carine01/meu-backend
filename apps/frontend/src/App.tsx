import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, UserOutlined, TeamOutlined, CalendarOutlined, GiftOutlined } from '@ant-design/icons';
import { Indicacoes } from './pages/Indicacoes';
import { EnviarIndicacao } from './pages/EnviarIndicacao';
import { MinhasRecompensas } from './pages/MinhasRecompensas';
import { Login } from './pages/Login';
import { AuthGuard } from './components/auth/AuthGuard';
import { authService } from './services/auth';

const { Header, Sider, Content } = Layout;

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Placeholder components for routes not yet implemented
const Dashboard: React.FC = () => <div>Dashboard (Coming Soon)</div>;
const Leads: React.FC = () => <div>Leads (Coming Soon)</div>;
const Agendamentos: React.FC = () => <div>Agendamentos (Coming Soon)</div>;

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rota de Login Pública */}
          <Route 
            path="/login" 
            element={authService.isAuthenticated() ? <Navigate to="/indicacoes" /> : <Login />} 
          />

          {/* Rotas Protegidas */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout style={{ minHeight: '100vh' }}>
                  <Sider collapsible>
            <div 
              style={{ 
                height: 32, 
                margin: 16, 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              IARA
            </div>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['indicacoes']}>
              <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                <Link to="/">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="leads" icon={<UserOutlined />}>
                <Link to="/leads">Leads</Link>
              </Menu.Item>
              <Menu.Item key="agendamentos" icon={<CalendarOutlined />}>
                <Link to="/agendamentos">Agendamentos</Link>
              </Menu.Item>
              <Menu.SubMenu key="indicacoes-menu" icon={<TeamOutlined />} title="Indicações">
                <Menu.Item key="indicacoes">
                  <Link to="/indicacoes/:leadId">Dashboard</Link>
                </Menu.Item>
                <Menu.Item key="enviar">
                  <Link to="/indicacoes/:leadId/enviar">Nova Indicação</Link>
                </Menu.Item>
                <Menu.Item key="recompensas" icon={<GiftOutlined />}>
                  <Link to="/indicacoes/:leadId/recompensas">Recompensas</Link>
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: '#fff', paddingLeft: 24 }}>
              <h2 style={{ margin: 0 }}>Sistema Elevare IARA</h2>
            </Header>
            <Content style={{ margin: '24px 16px 0' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/indicacoes" />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/agendamentos" element={<Agendamentos />} />
                <Route path="/indicacoes" element={<Navigate to="/indicacoes/LEAD001" />} />
                <Route path="/indicacoes/:leadId" element={<Indicacoes />} />
                <Route path="/indicacoes/:leadId/enviar" element={<EnviarIndicacao />} />
                <Route path="/indicacoes/:leadId/recompensas" element={<MinhasRecompensas />} />
              </Routes>
            </Content>
          </Layout>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
