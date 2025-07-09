import { getPaymentByReference } from './utils';

interface ReturnURLPageProps {
  params: {
    merchant_ref: string;
  };
}

export default async function ReturnURLPage({ params }: ReturnURLPageProps) {
  const { merchant_ref } = params;
  let redirectUrl = '/member';
  let paymentInfo: { status: string; reservation: null; error: null; payment?: any } = { status: 'unknown', reservation: null, error: null };
  
  try {
    // Log merchant_ref yang diterima
    console.log('Processing return URL for merchant_ref:', merchant_ref);
    
    // Cari payment berdasarkan merchant_ref
    const paymentResponse = await getPaymentByReference(merchant_ref);
    console.log('Payment response:', JSON.stringify(paymentResponse, null, 2));
    
    if (paymentResponse.success && paymentResponse.data) {
      const payment = paymentResponse.data;
      paymentInfo = { ...paymentInfo, status: 'payment_found', payment };
      
      // Dapatkan id reservasi dari payment
      const reservation_id = payment.reservation?._id || payment.reservationId;
      console.log('Found reservation_id:', reservation_id);
      
      if (reservation_id) {
        // Set redirect URL ke halaman booking dengan ID reservasi
        redirectUrl = `/member/booking/${reservation_id}`;
        paymentInfo.status = 'has_reservation';
      } else {
        // Jika tidak ada reservation_id, set redirect ke halaman pembayaran
        redirectUrl = '/member/bookings';
        paymentInfo.status = 'no_reservation';
      }
    } else {
      // Jika payment tidak ditemukan
      console.log('Payment not found for merchant_ref:', merchant_ref);
      paymentInfo = { ...paymentInfo, status: 'payment_not_found', error: paymentResponse.message };
    }
  } catch (error: any) {
    console.error('Error handling return URL:', error);
    paymentInfo = { ...paymentInfo, status: 'error', error: error.message };
  }
  
  // Tampilkan halaman dengan informasi pembayaran dan script redirect
  return (
    <html>
      <head>
        <title>Redirecting...</title>
        <meta httpEquiv="refresh" content={`3;url=${redirectUrl}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('Payment info:', ${JSON.stringify(paymentInfo)});
              window.location.href = '${redirectUrl}';
            `
          }}
        />
      </head>
      <body>
        <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '2rem' }}>
          <h1>Memproses Pembayaran</h1>
          <p>Mengalihkan ke halaman pembayaran...</p>
          <p>Status: {paymentInfo.status}</p>
          {paymentInfo.error && <p style={{ color: 'red' }}>Error: {paymentInfo.error}</p>}
          <p>Redirect URL: {redirectUrl}</p>
          <p>Merchant Ref: {merchant_ref}</p>
        </div>
      </body>
    </html>
  );
}
