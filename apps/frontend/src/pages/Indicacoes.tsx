import React, { useState } from 'react';
import { Layout, Row, Col, Tabs, Typography, message, Card, Statistic, Avatar, Space, Tag, Empty } from 'antd';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { UserOutlined, UserAddOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { indicacoesApi, leadsApi } from '../services/api';
import { IndicacaoCard } from '../components/indicacoes/IndicacaoCard';
import { RecompensaCard } from '../components/indicacoes/RecompensaCard';
import { IndicacaoForm } from '../components/indicacoes/IndicacaoForm';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

export const Indicacoes: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [activeTab, setActiveTab] = useState('minhas');

  // Buscar dados do lead
  const { data: lead, isLoading: loadingLead } = useQuery(
    ['lead', leadId],
    async () => {
      if (!leadId) return null;
      const { data } = await leadsApi.getLeadById(leadId);
      return data;
    }
  );

  // Buscar indicações
  const { data: indicacoes, isLoading: loadingIndicacoes } = useQuery(
    ['indicacoes', leadId],
    async () => {
      if (!leadId) return [];
      const { data } = await indicacoesApi.getIndicacoes(leadId);
      return data;
    }
  );

  // Buscar recompensa
  const { data: recompensa, isLoading: loadingRecompensa } = useQuery(
    ['recompensa', leadId],
    async () => {
      if (!leadId) return null;
      const { data } = await indicacoesApi.getRecompensa(leadId);
      return data;
    }
  );

  if (loadingLead || loadingIndicacoes || loadingRecompensa) {
    return <LoadingSpinner />;
  }

  if (!lead) {
    return <div>Lead não encontrado</div>;
  }

  const handleAtualizarStatus = async (indicacaoId: string, status: string) => {
    try {
      // Atualização seria feita via webhook ou manual
      message.success(`Status atualizado: ${status}`);
    } catch (error) {
      message.error('Erro ao atualizar status');
    }
  };

  const contarPorStatus = (status: string) => 
    indicacoes?.filter((i: any) => i.status === status).length || 0;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: 24 }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} xl={20}>
            <Title level={2} style={{ textAlign: 'center' }}>
              🏆 Programa de Indicações
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
              Indique amigos e ganhe sessões grátis!
            </Text>
          </Col>
        </Row>

        <Row gutter={[24, 24]} justify="center">
          {/* Card do Indicador */}
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                <Title level={4}>{lead.nome}</Title>
                <Text type="secondary">Você já indicou:</Text>
                <Statistic value={indicacoes?.length || 0} suffix="amigos" />
              </Space>
            </Card>
          </Col>

          {/* Recompensa */}
          <Col xs={24} md={16}>
            {recompensa && <RecompensaCard recompensa={recompensa} leadId={leadId!} />}
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    📤 Minhas Indicações
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {indicacoes?.length || 0}
                    </Tag>
                  </span>
                }
                key="minhas"
              >
                <Row gutter={[16, 16]}>
                  {indicacoes?.map((indicacao: any) => (
                    <Col xs={24} md={12} xl={8} key={indicacao.id}>
                      <IndicacaoCard
                        indicacao={indicacao}
                        onAtualizarStatus={handleAtualizarStatus}
                      />
                    </Col>
                  ))}
                </Row>

                {!indicacoes?.length && (
                  <Empty
                    description="Você ainda não fez indicações"
                    style={{ marginTop: 48 }}
                  />
                )}
              </TabPane>

              <TabPane
                tab="📊 Estatísticas"
                key="stats"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card>
                      <Statistic
                        title="Indicações Enviadas"
                        value={indicacoes?.length || 0}
                        prefix={<UserAddOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card>
                      <Statistic
                        title="Compareceram"
                        value={contarPorStatus('compareceu')}
                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card>
                      <Statistic
                        title="Pontos Totais"
                        value={recompensa?.pontosAcumulados || 0}
                        prefix={<StarOutlined style={{ color: '#faad14' }} />}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    ➕ Nova Indicação
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      +1 Ponto
                    </Tag>
                  </span>
                }
                key="nova"
              >
                <Row justify="center">
                  <Col xs={24} md={16} lg={12}>
                    <IndicacaoForm
                      leadId={leadId!}
                      nomeIndicador={lead.nome}
                      onSuccess={() => setActiveTab('minhas')}
                    />
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
