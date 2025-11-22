import React from 'react';
import { Card, Statistic, Button, Progress, Space, Typography, Tag } from 'antd';
import { TrophyOutlined, GiftOutlined, StarOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from 'react-query';
import { indicacoesApi } from '../../services/api';

const { Title, Text } = Typography;

interface RecompensaCardProps {
  recompensa: any;
  leadId: string;
}

export const RecompensaCard: React.FC<RecompensaCardProps> = ({ recompensa, leadId }) => {
  const queryClient = useQueryClient();
  
  const pontosProximaSessao = 3 - (recompensa.pontosAcumulados % 3);
  const progresso = ((recompensa.pontosAcumulados % 3) / 3) * 100;

  const resgatarMutation = useMutation(
    () => indicacoesApi.resgatarSessao(leadId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recompensa', leadId]);
      },
    }
  );

  return (
    <Card
      style={{ maxWidth: 400, margin: '0 auto' }}
      cover={
        <div style={{ background: '#f0f2f5', padding: '20px', textAlign: 'center' }}>
          <TrophyOutlined style={{ fontSize: '48px', color: '#faad14' }} />
        </div>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Statistic
          title="Pontos Acumulados"
          value={recompensa.pontosAcumulados}
          prefix={<StarOutlined />}
          valueStyle={{ color: '#faad14', fontSize: '32px' }}
        />

        <div>
          <Text type="secondary">Progresso para próxima sessão grátis:</Text>
          <Progress
            percent={progresso}
            showInfo={false}
            strokeColor="#faad14"
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            {pontosProximaSessao === 3 
              ? 'Comece a indicar para ganhar pontos!' 
              : `Faltam ${pontosProximaSessao} pontos para sua próxima sessão grátis!`}
          </Text>
        </div>

        <Space size="middle" align="center" style={{ justifyContent: 'center', width: '100%' }}>
          <Tag color="green" icon={<GiftOutlined />} style={{ padding: '10px 20px', fontSize: '16px' }}>
            {recompensa.sessoesGratisDisponiveis} Sessões Grátis
          </Tag>
        </Space>

        <Button
          type="primary"
          icon={<GiftOutlined />}
          size="large"
          block
          disabled={recompensa.sessoesGratisDisponiveis === 0}
          loading={resgatarMutation.isLoading}
          onClick={() => resgatarMutation.mutate()}
        >
          {recompensa.sessoesGratisDisponiveis > 0 
            ? `Resgatar Sessão Grátis (${recompensa.sessoesGratisDisponiveis} disponível)` 
            : 'Nenhuma sessão disponível'}
        </Button>

        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>📋 Regras:</Text>
          <ul style={{ fontSize: '12px', color: '#8c8c8c', paddingLeft: '20px' }}>
            <li>1 indicação = 1 ponto</li>
            <li>3 pontos = 1 sessão grátis</li>
            <li>Indicado comparece = +2 pontos bônus</li>
          </ul>
        </Space>
      </Space>
    </Card>
  );
};
