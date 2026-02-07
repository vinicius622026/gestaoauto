import React from 'react';
import FormContainer from '../../components/FormContainer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { trpc } from '../..//trpcClient';
import { useSearchParams } from 'wouter';

const verifySchema = z.object({ token: z.string() });

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { register, handleSubmit } = useForm({ resolver: zodResolver(verifySchema), defaultValues: { token } });
  const verify = trpc.auth.verifyEmail.useMutation();

  async function onSubmit(data: any) {
    await verify.mutateAsync(data);
    alert('Email verificado');
  }

  return (
    <FormContainer title="Verificar e-mail" subtitle="Confirme seu e-mail">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('token')} type="hidden" />
        <button className="w-full bg-emerald-600 text-white py-2 rounded">Verificar</button>
      </form>
    </FormContainer>
  );
}
