import { PaymentPage } from '@/components/p2p/PaymentPage';

export default function TradePage({ params }: { params: { id: string } }) {
  return <PaymentPage tradeId={params.id} />;
}
