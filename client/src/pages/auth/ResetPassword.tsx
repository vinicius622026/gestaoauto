import React from 'react';
import FormContainer from '../../components/FormContainer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { trpc } from '../../lib/trpc';
import { useSearchParams } from 'wouter';

const requestSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string(), newPassword: z.string().min(6) });

export function RequestReset() {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(requestSchema) });
  const req = trpc.auth.requestPasswordReset.useMutation();

  async function onSubmit(data: any) {
    await req.mutateAsync(data);
    alert('Verifique seu e-mail (logs).');
  }

  return (
    <FormContainer title="Solicitar reset" subtitle="Informe seu e-mail">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} placeholder="Email" className="w-full p-2 border rounded" />
        <button className="w-full bg-sky-600 text-white py-2 rounded">Enviar</button>
      </form>
    </FormContainer>
  );
}

export function ResetForm() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { register, handleSubmit } = useForm({ resolver: zodResolver(resetSchema), defaultValues: { token } });
  const reset = trpc.auth.resetPassword.useMutation();

  async function onSubmit(data: any) {
    await reset.mutateAsync(data);
    alert('Senha atualizada');
  }

  return (
    <FormContainer title="Resetar senha" subtitle="Nova senha">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('token')} type="hidden" />
        <input {...register('newPassword')} type="password" placeholder="Nova senha" className="w-full p-2 border rounded" />
        <button className="w-full bg-emerald-600 text-white py-2 rounded">Trocar senha</button>
      </form>
    </FormContainer>
  );
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  return token ? <ResetForm /> : <RequestReset />;
}
