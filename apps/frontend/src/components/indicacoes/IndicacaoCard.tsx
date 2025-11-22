import React from 'react';
import { Card, Tag, Button, Space, Avatar } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface IndicacaoCardProps {
  indicacao: any;
  onAtualizarStatus?: (id: string, status: string) => void;
}

const STATUS_CONFIG = {
  pendente: { color: 'default', icon: <ClockCircleOutlined />, text: 'Pendente' },
  contatado: { color: 'processing', icon: <UserOutlined />, text: 'Contatado' },
  agendado: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Agendado' },
  compareceu: { color: 'success', icon: <CheckCircleOutlined />, text: 'Compareceu' },
  cancelado: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
};

export const IndicacaoCard: React.FC<IndicacaoCardProps> = ({ indicacao, onAtualizarStatus }) => {
  const config = STATUS_CONFIG[indicacao.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendente;

  return (
    <Card
      hoverable
      actions={onAtualizarStatus && [
        <Button type="link" size="small" onClick={() => onAtualizarStatus(indicacao.id, 'contatado')}>
          Contatado
        </Button>,
        <Button type="link" size="small" onClick={() => onAtualizarStatus(indicacao.id, 'agendado')}>
          Agendado
        </Button>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title={indicacao.nomeIndicado}
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>📱 {indicacao.telefoneIndicado}</div>
            <div>📅 {new Date(indicacao.createdAt).toLocaleDateString('pt-BR')}</div>
            <Tag icon={config.icon} color={config.color as any}>
              {config.text}
            </Tag>
            {indicacao.pontosGanhos > 0 && (
              <Tag color="gold">+{indicacao.pontosGanhos} pontos</Tag>
            )}
          </Space>
        }
      />
    </Card>
  );
};
