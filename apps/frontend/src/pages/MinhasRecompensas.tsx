import React from 'react';
import { Layout, Row, Col, Typography, Card, Space, Button, Divider } from 'antd';
import { useQuery } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { GiftOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons';
import { indicacoesApi, leadsApi } from '../services/api';
import { RecompensaCard } from '../components/indicacoes/RecompensaCard';
import { ProgressoGamificacao } from '../components/indicacoes/ProgressoGamificacao';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

const { Title, Text } = Typography;
const { Content } = Layout;

export const MinhasRecompensas: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  // Buscar recompensa
  const { data: recompensa, isLoading: loadingRecompensa } = useQuery(
    ['recompensa', leadId],
    async () => {
      if (!leadId) return null;
      const { data } = await indicacoesApi.getRecompensa(leadId);
      return data;
    }
  );

  // Buscar lead
  const { data: lead, isLoading: loadingLead } = useQuery(
    ['lead', leadId],
    async () => {
      if (!leadId) return null;
      const { data } = await leadsApi.getLeadById(leadId);
      return data;
    }
  );

  // Buscar indicações para estatísticas
  const { data: indicacoes } = useQuery(
    ['indicacoes', leadId],
    async () => {
      if (!leadId) return [];
      const { data } = await indicacoesApi.getIndicacoes(leadId);
      return data;
    }
  );

  if (loadingRecompensa || loadingLead) {
    return <LoadingSpinner />;
  }

  if (!recompensa || !lead) {
    return <div>Dados não encontrados</div>;
  }

  const indicacoesCompareceram = indicacoes?.filter((i: any) => i.status === 'compareceu').length || 0;
  const totalPontosGanhos = indicacoes?.reduce((sum: number, i: any) => sum + i.pontosGanhos, 0) || 0;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: 24 }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} xl={20}>
            <Title level={2} style={{ textAlign: 'center' }}>
              <TrophyOutlined /> Minhas Recompensas
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
              Acompanhe seus pontos e sessões grátis disponíveis
            </Text>
          </Col>
        </Row>

        <Row gutter={[24, 24]} justify="center">
          {/* Progresso Gamificação */}
          <Col xs={24} md={12} lg={10}>
            <ProgressoGamificacao
              pontosAcumulados={recompensa.pontosAcumulados}
              sessoesGratis={recompensa.sessoesGratisDisponiveis}
            />
          </Col>

          {/* Recompensa Card */}
          <Col xs={24} md={12} lg={10}>
            <RecompensaCard recompensa={recompensa} leadId={leadId!} />
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} xl={20}>
            <Title level={4} style={{ textAlign: 'center' }}>
              📊 Suas Estatísticas
            </Title>
          </Col>
        </Row>

        <Row gutter={[16, 16]} justify="center" style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                <TeamOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                <Text type="secondary">Total de Indicações</Text>
                <Title level={2} style={{ margin: 0 }}>{indicacoes?.length || 0}</Title>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card>
              <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                <GiftOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                <Text type="secondary">Compareceram</Text>
                <Title level={2} style={{ margin: 0 }}>{indicacoesCompareceram}</Title>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card>
              <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                <Text type="secondary">Total Pontos Ganhos</Text>
                <Title level={2} style={{ margin: 0 }}>{totalPontosGanhos}</Title>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 32 }}>
          <Col xs={24} md={16} lg={12} style={{ textAlign: 'center' }}>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate(`/indicacoes/${leadId}`)}
              >
                Ver Minhas Indicações
              </Button>
              <Button
                size="large"
                onClick={() => navigate(`/indicacoes/${leadId}?tab=nova`)}
              >
                Nova Indicação
              </Button>
            </Space>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 48 }}>
          <Col xs={24} md={16}>
            <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Title level={5} style={{ color: '#52c41a', margin: 0 }}>
                  💡 Dica para Ganhar Mais Pontos
                </Title>
                <Text>
                  Incentive seus amigos indicados a comparecerem na primeira consulta! 
                  Quando eles comparecem, você ganha +2 pontos bônus além do ponto inicial da indicação.
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Total por indicado que comparece: 3 pontos (1 pela indicação + 2 bônus)
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
