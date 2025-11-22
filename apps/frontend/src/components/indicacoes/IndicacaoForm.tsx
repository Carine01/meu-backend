import React from 'react';
import { Form, Input, Button, message, Space, Typography, Card, Alert } from 'antd';
import { UserAddOutlined, PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from 'react-query';
import { indicacoesApi } from '../../services/api';

const { Title, Text } = Typography;

interface IndicacaoFormProps {
  leadId: string;
  nomeIndicador: string;
  onSuccess?: () => void;
}

export const IndicacaoForm: React.FC<IndicacaoFormProps> = ({ leadId, nomeIndicador, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    (values: any) => indicacoesApi.enviarIndicacao(leadId, values),
    {
      onSuccess: () => {
        message.success(`✅ Indicação enviada! Você ganhou 1 ponto.`);
        form.resetFields();
        queryClient.invalidateQueries(['indicacoes', leadId]);
        queryClient.invalidateQueries(['recompensa', leadId]);
        onSuccess?.();
      },
      onError: (error: any) => {
        message.error(`❌ Erro: ${error.response?.data?.message || error.message}`);
      },
    }
  );

  const onFinish = (values: any) => {
    mutate(values);
  };

  return (
    <Card style={{ maxWidth: 500 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ padding: '20px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <UserAddOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <Title level={4}>Indique 3 Amigos</Title>
            <Text type="secondary">Ganhe 1 sessão grátis!</Text>
          </div>

          <Form.Item
            name="nome"
            label="Nome do Amigo"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ex: Ana Maria"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="telefone"
            label="WhatsApp"
            rules={[
              { required: true, message: 'Telefone é obrigatório' },
              {
                pattern: /^55\d{11}$/,
                message: 'Formato: 5511999999999',
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="5511999999999"
              size="large"
              addonBefore="+"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email (opcional)"
            rules={[{ type: 'email', message: 'Email inválido' }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="exemplo@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              block
              icon={<UserAddOutlined />}
            >
              Enviar Indicação
            </Button>
          </Form.Item>

          <Alert
            message="⚡ Dica: Indicados que agendam dão +2 pontos bônus!"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Space>
      </Form>
    </Card>
  );
};
