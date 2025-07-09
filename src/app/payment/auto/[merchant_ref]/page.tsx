import { notFound } from 'next/navigation';
import AutoPaymentClient from './AutoPaymentClient';

interface AutoPaymentPageProps {
  params: { merchant_ref: string };
  searchParams: { amount?: string };
}

export default async function AutoPaymentPage({ params, searchParams }: AutoPaymentPageProps) {
  const { merchant_ref } = params;
  const amount = Number(searchParams?.amount || 0);
  if (!merchant_ref || !amount) return null;
  return <AutoPaymentClient merchant_ref={merchant_ref} amount={amount} />;
}
