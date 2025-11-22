import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const LoadingSpinner: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
        tip="Carregando..."
        size="large"
      />
    </div>
  );
};
