import { OrderDetailClient } from '@/components/p2p/OrderDetailClient';

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  return <OrderDetailClient orderId={params.orderId} />;
}
