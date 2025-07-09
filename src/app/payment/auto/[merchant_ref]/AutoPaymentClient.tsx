"use client";
import { fetchTripayChannels } from '@/utils/tripaySignature';
import React, { useEffect, useState } from 'react';
import { ClientOnlyNumber } from './ClientOnlyNumber';
import { StatusBadge } from './StatusBadge';

interface Channel {
  code: string;
  name: string;
  type: string;
  group: string;
  icon_url?: string;
  active: boolean;
  description?: string;
}

interface AutoPaymentClientProps {
  merchant_ref: string;
  amount: number;
}

const AutoPaymentClient = ({ merchant_ref, amount }: AutoPaymentClientProps) => {
  const [paymentDetail, setPaymentDetail] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [feeDetail, setFeeDetail] = useState<any>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [bayarLoading, setBayarLoading] = useState(false);
  const [bayarSuccess, setBayarSuccess] = useState<any>(null);
  const [bayarError, setBayarError] = useState<string | null>(null);

  // Handler tombol Bayar
  const handleBayar = async () => {
    if (selectedChannel && paymentDetail && feeDetail && !bayarLoading) {
      setBayarLoading(true);
      setBayarError(null);
      setBayarSuccess(null);
      try {
        const response = await fetch('/api/tripay/create-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: selectedChannel?.code,
            merchant_ref: paymentDetail?.reference,
            amount: paymentDetail?.amount,
            customer_name: paymentDetail?.reservation?.userId?.name || 'Customer',
            customer_email: paymentDetail?.reservation?.userId?.email || 'customer@email.com',
            customer_phone: paymentDetail?.reservation?.userId?.phone || '081234567890',
            order_items: [
              {
                sku: paymentDetail?.reservation?.courtId?._id || paymentDetail?.reservation?.courtId || 'COURT',
                name: paymentDetail?.reservation?.courtId?.name || paymentDetail?.reservation?.courtId || 'Court',
                price: paymentDetail?.amount,
                quantity: 1,
                product_url: '',
                image_url: ''
              }
            ],
            return_url: window.location.href
          })
        });
        const data = await response.json();
        if (data.success) {
          const checkoutUrl = data.data?.checkout_url || data.checkout_url;
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
            return;
          }
          setBayarSuccess(data.data || data);
        } else {
          setBayarError(data.message || 'Gagal membuat transaksi');
        }
      } catch (err: any) {
        setBayarError('Gagal membuat transaksi');
      } finally {
        setBayarLoading(false);
      }
    }
  };


  useEffect(() => {
    setLoading(true);
    fetch(`/api/payment/detail-by-reference?reference=${merchant_ref}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Not Found');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setPaymentDetail(data.data);
          setPaymentError(null);
        } else {
          setPaymentError(data.message || 'Gagal mengambil detail pembayaran');
        }
      })
      .catch(() => {
        setPaymentError('Gagal mengambil detail pembayaran');
      })
      .finally(() => setLoading(false));
  }, [merchant_ref]);

  useEffect(() => {
    setChannelsLoading(true);
    fetch('/api/tripay/channels')
      .then(res => res.json())
      .then((channelRes) => {
        if (channelRes.success && Array.isArray(channelRes.data)) {
          setChannels(channelRes.data.filter((c: Channel) => c.active));
        } else {
          setChannels([]);
        }
      })
      .catch(() => setChannels([]))
      .finally(() => setChannelsLoading(false));
  }, [merchant_ref]);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
        <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10V6a2 2 0 012-2h3m10 6V6a2 2 0 00-2-2h-3m-4 0h4m-9 8v4a2 2 0 002 2h3m10-6v4a2 2 0 01-2 2h-3m-4 0h4" /></svg>
        Pembayaran Otomatis (Tripay)
      </h2>
      <div className="mb-4">
        <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-900 dark:via-gray-900 dark:to-green-900 rounded-xl p-6 flex flex-col gap-3 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Merchant Ref</div>
              <div className="font-mono text-sm text-blue-700 dark:text-blue-300 break-all">{merchant_ref || <span className='text-gray-400'>-</span>}</div>
            </div>
            <div className="hidden md:block h-8 border-l border-gray-200 dark:border-gray-700 mx-6"></div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Nominal</div>
              <div className="inline-block px-4 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xl font-bold tracking-wide shadow-sm">
                Rp<ClientOnlyNumber value={amount} />
              </div>
            </div>
            <div className="hidden md:block h-8 border-l border-gray-200 dark:border-gray-700 mx-6"></div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
              {paymentDetail ? (
                <StatusBadge status={paymentDetail.status || paymentDetail.paymentData?.status} />
              ) : (
                <span className="text-xs text-gray-400 italic">Belum tersedia</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Detail Reservasi</h3>
        {bayarLoading && (
          <div className="text-gray-400 dark:text-gray-500">Memproses...</div>
        )}
        {bayarError && <div className="mt-2 text-red-600 dark:text-red-400">{bayarError}</div>}
        {loading ? (
          <div className="text-gray-400 dark:text-gray-500">Memuat detail pembayaran...</div>
        ) : paymentError ? (
          <div className="text-red-600 dark:text-red-400">{paymentError}</div>
        ) : paymentDetail ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Reference:</span> 
              <span className="font-mono text-blue-700 dark:text-blue-300 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">{paymentDetail.reference || paymentDetail.paymentData?.reference}</span>
            </div>
            {paymentDetail.reservation?.courtId && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Court:</span> 
                <span className="font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">{paymentDetail.reservation.courtId.name || paymentDetail.reservation.courtId}</span>
              </div>
            )}
            {paymentDetail.reservation?.date && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Tanggal:</span> 
                <span className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">{new Date(paymentDetail.reservation.date).toLocaleDateString('id-ID')}</span>
              </div>
            )}
            {paymentDetail.reservation?.slots && Array.isArray(paymentDetail.reservation.slots) && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Jam:</span> 
                <span className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">{paymentDetail.reservation.slots.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Status:</span> 
              <span className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">{paymentDetail.status || paymentDetail.paymentData?.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Nominal:</span> 
              <span className="text-green-600 dark:text-green-400 font-bold bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">Rp{(paymentDetail.amount || paymentDetail.paymentData?.amount)?.toLocaleString('id-ID')}</span>
            </div>
          </div>
        ) : null}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Pilih Channel Pembayaran</h3>
        {channelsLoading ? (
          <div className="text-gray-400 dark:text-gray-500">Memuat channel Tripay...</div>
        ) : channels.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">Tidak dapat mengambil channel Tripay. Coba refresh halaman.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((c) => (
              <React.Fragment key={c.code}>
                <li
                  className={`flex items-center gap-4 p-4 rounded-xl border transition cursor-pointer group shadow hover:shadow-md bg-white dark:bg-gray-800 ${selectedChannel?.code === c.code ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={async () => {
                    setSelectedChannel(c);
                    setFeeDetail(null);
                    setFeeError(null);
                    setFeeLoading(true);
                    try {
                      const res = await fetch(`/api/tripay/fee?code=${c.code}&amount=${amount}`);
                      const data = await res.json();
                      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        setFeeDetail(data.data[0]);
                      } else {
                        setFeeDetail(null);
                        setFeeError('Gagal mengambil detail fee.');
                      }
                    } catch (e) {
                      setFeeDetail(null);
                      setFeeError('Gagal mengambil detail fee.');
                    } finally {
                      setFeeLoading(false);
                    }
                  }}
                >
                  {c.icon_url && <img src={c.icon_url} alt={c.name} className="w-12 h-12 object-contain rounded bg-gray-50 dark:bg-gray-900 p-1 border border-gray-100 dark:border-gray-700" />}
                  <div className="flex-1">
                    <div className={`font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition ${selectedChannel?.code === c.code ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>{c.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.group} &middot; <span className="font-mono">{c.code}</span></div>
                    {c.description && <div className="text-xs mt-1 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{__html: c.description}} />}
                  </div>
                </li>
                {/* Fee detail tampil di bawah channel yang dipilih */}
                {selectedChannel?.code === c.code && (
                  <li className="col-span-full">
                    <div className="mt-2 mb-4 p-4 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 text-sm text-gray-900 dark:text-blue-100">
                      {feeLoading || feeError || feeDetail ? (
                        <div>
                          {feeLoading && <div className="text-gray-400 dark:text-gray-500">Mengambil fee channel...</div>}
                          {feeError && <div className="text-red-600 dark:text-red-400">{feeError}</div>}
                          {feeDetail && (
                            <>
                              <div className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Rincian Biaya Channel</div>
                              <div className="flex flex-col gap-2">
                                <div><span className="text-gray-500 dark:text-blue-300">Fee Customer:</span> <span className="text-green-700 dark:text-green-300 font-bold dark:bg-blue-900 px-2 py-0.5 rounded">Rp<ClientOnlyNumber value={feeDetail.total_fee.customer || 0} /></span></div>
                              </div>
                              <div className="mt-3 font-bold text-lg text-blue-800 dark:text-blue-200 dark:bg-blue-900 px-3 py-2 rounded">Total Dibayar: Rp<ClientOnlyNumber value={Number(amount) + Number(feeDetail.total_fee.customer || 0)} /></div>
                              <button
                                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50"
                                onClick={handleBayar}
                                disabled={bayarLoading}
                              >
                                {bayarLoading ? 'Memproses...' : 'Bayar'}
                              </button>
                              {bayarLoading && (
                                <div className="text-gray-400 dark:text-gray-500 mt-2">Memproses redirect ke Tripay...</div>
                              )}
                              {bayarError && <div className="mt-2 text-red-600 dark:text-red-400">{bayarError}</div>}
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AutoPaymentClient;
