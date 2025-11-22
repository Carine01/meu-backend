import React from 'react';
import { Progress, Card, Typography, Space } from 'antd';
import { TrophyOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProgressoGamificacaoProps {
  pontosAcumulados: number;
  sessoesGratis: number;
}

export const ProgressoGamificacao: React.FC<ProgressoGamificacaoProps> = ({
  pontosAcumulados,
  sessoesGratis,
}) => {
  const pontosParaProxima = 3 - (pontosAcumulados % 3);
  const progresso = ((pontosAcumulados % 3) / 3) * 100;

  return (
    <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <TrophyOutlined style={{ fontSize: '48px', color: '#ffd700' }} />
          <Title level={3} style={{ color: 'white', marginTop: 16 }}>
            Sistema de Recompensas
          </Title>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '8px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: '16px' }}>
                <StarOutlined /> {pontosAcumulados} pontos
              </Text>
              <Text style={{ color: 'white', fontSize: '16px' }}>
                🎁 {sessoesGratis} sessões grátis
              </Text>
            </div>
            
            <Progress
              percent={progresso}
              strokeColor="#ffd700"
              trailColor="rgba(255,255,255,0.3)"
              showInfo={false}
            />
            
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              {pontosParaProxima === 3
                ? 'Comece a indicar amigos!'
                : `Faltam ${pontosParaProxima} pontos para próxima sessão grátis`}
            </Text>
          </Space>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
          <Text style={{ color: 'white', fontSize: '12px', display: 'block', marginBottom: 8 }}>
            📋 Como funciona:
          </Text>
          <ul style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginLeft: '16px' }}>
            <li>Indique 1 amigo = Ganhe 1 ponto</li>
            <li>Amigo agenda = +2 pontos bônus</li>
            <li>3 pontos = 1 sessão grátis</li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};
