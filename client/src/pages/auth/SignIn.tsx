import React from 'react';
import FormContainer from '../../components/FormContainer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { trpc } from '../..//trpcClient';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export default function SignIn() {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
  const signIn = trpc.auth.signIn.useMutation();

  async function onSubmit(data: any) {
    try {
      const res = await signIn.mutateAsync(data);
      console.log('signed in', res);
      // TODO: store token, redirect
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <FormContainer title="Entrar" subtitle="Use sua conta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} placeholder="Email" className="w-full p-2 border rounded" />
        <input {...register('password')} type="password" placeholder="Senha" className="w-full p-2 border rounded" />
        <button className="w-full bg-sky-600 text-white py-2 rounded">Entrar</button>
      </form>
    </FormContainer>
  );
}
