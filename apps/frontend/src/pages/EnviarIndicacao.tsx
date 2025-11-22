import React from 'react';
import { Layout, Row, Col, Card, Typography, Button } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { IndicacaoForm } from '../components/indicacoes/IndicacaoForm';

const { Title, Text } = Typography;
const { Content } = Layout;

export const EnviarIndicacao: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();

  const handleSuccess = () => {
    navigate(`/indicacoes/${leadId}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: 24 }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} xl={16}>
            <Title level={2} style={{ textAlign: 'center' }}>
              <UserAddOutlined /> Enviar Nova Indicação
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
              Compartilhe o benefício com seus amigos e ganhe recompensas!
            </Text>
          </Col>
        </Row>

        <Row justify="center">
          <Col xs={24} md={16} lg={12}>
            <IndicacaoForm
              leadId={leadId || ''}
              nomeIndicador="Você"
              onSuccess={handleSuccess}
            />
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 24 }}>
          <Col xs={24} md={16} lg={12} style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate(`/indicacoes/${leadId}`)}>
              ← Voltar para Minhas Indicações
            </Button>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
