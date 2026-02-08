import React from 'react';
import FormContainer from '../../components/FormContainer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { trpc } from '../../lib/trpc';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';

const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });

export default function SignUp() {
  const { register, handleSubmit, watch } = useForm({ resolver: zodResolver(schema) });
  const signUp = trpc.auth.signUp.useMutation();
  const password = watch('password') || '';

  async function onSubmit(data: any) {
    try {
      const res = await signUp.mutateAsync(data);
      console.log('signed up', res);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <FormContainer title="Criar conta" subtitle="Cadastre-se">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Nome" className="w-full p-2 border rounded" />
        <input {...register('email')} placeholder="Email" className="w-full p-2 border rounded" />
        <input {...register('password')} type="password" placeholder="Senha" className="w-full p-2 border rounded" />
        <PasswordStrengthMeter password={password} />
        <button className="w-full bg-emerald-600 text-white py-2 rounded">Criar conta</button>
      </form>
    </FormContainer>
  );
}
