import React, { useState } from 'react';

type Product = { id?: string; name: string; price: number };

export const ProductForm: React.FC = () => {
  const [product, setProduct] = useState<Product>({ name: '', price: 0 });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'price' ? parseFloat(e.target.value) || 0 : e.target.value;
    setProduct({ ...product, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) setMessage('Produto cadastrado!');
    else setMessage('Erro ao cadastrar.');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={product.name} onChange={handleChange} placeholder="Nome" />
      <input name="price" type="number" value={product.price} onChange={handleChange} placeholder="Preço" />
      <button type="submit">Cadastrar</button>
      {message && <div>{message}</div>}
    </form>
  );
};
