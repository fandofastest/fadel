"use client";
import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button/Button';
import PaymentMethodFormModal from './PaymentMethodFormModal';
import DeletePaymentMethodDialog from './DeletePaymentMethodDialog';

interface PaymentMethod {
  _id: string;
  name: string;
  code?: string;
  keterangan?: string;
  createdAt: string;
}

const PaymentMethodsTable: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMethod, setEditMethod] = useState<PaymentMethod | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/payment_methods');
    const data = await res.json();
    setPaymentMethods(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditMethod(null);
    setModalOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditMethod(method);
    setModalOpen(true);
  };

  const handleDelete = (method: PaymentMethod) => {
    setDeleteTarget(method);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/payment_methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget._id }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        fetchData();
      } else {
        // Optionally handle error
        setDeleteLoading(false);
      }
    } catch {
      setDeleteLoading(false);
    }
  };
  
  const toggleAccordion = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Metode Pembayaran</h2>
        <Button onClick={handleAdd}>Tambah Metode</Button>
      </div>
      {/* Desktop view - Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Nama</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Kode</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Keterangan</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">Loading...</td>
              </tr>
            ) : paymentMethods.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">Belum ada metode pembayaran</td>
              </tr>
            ) : (
              paymentMethods.map((method) => (
                <tr key={method._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{method.name}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{method.code || '-'}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{method.keterangan || '-'}</td>
                  <td className="px-4 py-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(method)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="ml-2 !text-red-600 border-red-600 hover:!bg-red-50" onClick={() => handleDelete(method)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Mobile view - Accordion */}
      <div className="block md:hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Belum ada metode pembayaran</div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Accordion Header - Always visible */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleAccordion(method._id)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{method.name}</h3>
                    {method.code && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Kode: {method.code}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${expandedItems[method._id] ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Accordion Content - Animated */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ${expandedItems[method._id] ? 'max-h-72' : 'max-h-0'}`}
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    {method.keterangan && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Keterangan:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{method.keterangan}</p>
                      </div>
                    )}
                    
                    <div className="pt-2 flex justify-end space-x-2">
                      <button 
                        className="px-3 py-1 text-sm border rounded-md border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(method);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="px-3 py-1 text-sm border rounded-md border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(method);
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modalOpen && (
        <PaymentMethodFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchData();
          }}
          method={editMethod}
        />
      )}
      <DeletePaymentMethodDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
          setDeleteLoading(false);
        }}
        onDelete={confirmDelete}
        methodName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default PaymentMethodsTable;
