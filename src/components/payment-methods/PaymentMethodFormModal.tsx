import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';

interface PaymentMethodFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  method?: { _id?: string; name: string; code?: string; keterangan?: string } | null;
}

const PaymentMethodFormModal: React.FC<PaymentMethodFormModalProps> = ({ open, onClose, onSuccess, method }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (method) {
      setName(method.name);
      setCode(method.code || '');
      setKeterangan(method.keterangan || '');
    } else {
      setName('');
      setCode('');
      setKeterangan('');
    }
    setError('');
  }, [method, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const url = '/api/payment_methods';
    const payload = { name, code, keterangan };
    try {
      let res;
      if (method && method._id) {
        res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: method._id, name, code, keterangan }),
        });
      } else {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Gagal menyimpan data');
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {method ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Nama Metode</label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Kode</label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={loading}
              placeholder="Contoh: 002, QRIS, dll"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Keterangan</label>
            <input
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              disabled={loading}
              placeholder="Contoh: No. Rekening, Bank, dsb"
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button>
              {method ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodFormModal;
