import React from 'react';
import Button from '@/components/ui/button/Button';

interface DeletePaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  methodName?: string;
  loading?: boolean;
}

const DeletePaymentMethodDialog: React.FC<DeletePaymentMethodDialogProps> = ({ open, onClose, onDelete, methodName, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Konfirmasi Hapus</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Apakah Anda yakin ingin menghapus metode pembayaran <span className="font-bold">{methodName}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={onDelete} disabled={loading} className="!bg-red-600 !text-white hover:!bg-red-700">{loading ? 'Menghapus...' : 'Hapus'}</Button>
        </div>
      </div>
    </div>
  );
};

export default DeletePaymentMethodDialog;
