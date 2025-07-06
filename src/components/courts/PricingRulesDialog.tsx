"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../ui/table";
import { twMerge } from "tailwind-merge";
import PricingRuleEditor from "./PricingRuleEditor";
import PricingVisualizer from "./PricingVisualizer";

// Create dialog components using the Modal component
const DialogContainer = ({ children, ...props }: React.ComponentProps<typeof Modal>) => (
  <Modal {...props} className="max-w-4xl mx-auto w-full">
    {children}
  </Modal>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-white dark:text-white px-6 pt-4">{children}</h2>
);

const DialogContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={twMerge(`px-6 py-4`, className)}>{children}</div>
);

const DialogActions = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={twMerge(`px-6 py-4 flex justify-end gap-3 border-t border-gray-700 dark:border-gray-700`, className)}>{children}</div>
);

function getDayName(day: number) {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[day] ?? day;
}

export default function PricingRulesDialog({ open, onClose, courtId }: {
  open: boolean;
  onClose: () => void;
  courtId: string | undefined;
}) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'table' | 'add'>('visual');
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Log courtId for debugging
  React.useEffect(() => {
    if (open) {
      console.log("PricingRulesDialog courtId:", courtId);
    }
  }, [open, courtId]);

  const fetchRules = async () => {
    if (!courtId) {
      console.error("No courtId provided");
      setErrorMessage('ID lapangan tidak tersedia');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetch(`/api/pricing_rules?courtId=${courtId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pricing rules');
      }
      
      const data = await response.json();
      console.log("Fetched pricing rules:", data);
      setRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setErrorMessage('Gagal memuat data harga');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && courtId) {
      fetchRules();
    } else {
      setRules([]);
    }
  }, [open, courtId]);
  
  const handleDeleteRule = async (ruleId: string) => {
    if (!courtId) return;
    
    try {
      setDeleteInProgress(ruleId);
      setErrorMessage(null);
      
      const response = await fetch(`/api/pricing_rules/${ruleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete pricing rule');
      }
      
      // Refresh rules list
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      setErrorMessage('Gagal menghapus data harga');
    } finally {
      setDeleteInProgress(null);
    }
  };

  return (
    <DialogContainer isOpen={open} onClose={onClose}>
      <div className="bg-gray-900 text-white">
        <DialogTitle>Pengaturan Harga & Waktu</DialogTitle>
        
        <DialogContent>
          <div className="mb-4">
            <div className="flex border-b border-gray-700 mb-4">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'visual' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('visual')}
              >
                Visualisasi
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'table' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('table')}
              >
                Tabel Harga
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'add' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('add')}
              >
                Tambah Harga
              </button>
            </div>
          </div>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Memuat data...</span>
          </div>
        )}
        
        {/* Content Area */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-gray-700 dark:text-gray-300">Memuat data...</span>
            </div>
          ) : rules.length === 0 && activeTab !== 'add' ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Belum ada data harga yang tersedia.</p>
              <Button 
                onClick={() => setActiveTab('add')} 
                variant="outline" 
                size="sm"
                className="mt-2 text-white dark:text-white border-gray-600 dark:border-gray-600 hover:bg-gray-800 dark:hover:bg-gray-800"
              >
                Tambah Harga Baru
              </Button>
            </div>
          ) : activeTab === 'visual' ? (
            <PricingVisualizer rules={rules} />
          ) : activeTab === 'table' ? (
            <div className="overflow-auto max-h-[60vh] border border-gray-700 dark:border-gray-700 rounded-md w-full max-w-[800px] mx-auto">
              <Table className="w-full table-fixed">
                <TableHeader className="bg-gray-800 dark:bg-gray-900 sticky top-0">
                  <TableRow>
                    <TableCell className="px-3 py-3 text-sm font-medium text-white dark:text-white text-left w-1/6">Hari Mulai</TableCell>
                    <TableCell className="px-3 py-3 text-sm font-medium text-white dark:text-white text-left w-1/6">Hari Selesai</TableCell>
                    <TableCell className="px-3 py-3 text-sm font-medium text-white dark:text-white text-center w-1/6">Jam Mulai</TableCell>
                    <TableCell className="px-3 py-3 text-sm font-medium text-white dark:text-white text-center w-1/6">Jam Selesai</TableCell>
                    <TableCell className="px-3 py-3 text-sm font-medium text-white dark:text-white text-right w-1/6">Harga</TableCell>
                    <TableCell className="px-3 py-3 text-sm font-medium text-white dark:text-white text-center w-1/6">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-3 py-6 text-gray-400 dark:text-gray-500 text-center">
                        Tidak ada aturan harga yang ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                  {rules.map((rule, index) => (
                    <TableRow 
                      key={rule._id} 
                      className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'} hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <TableCell className="px-3 py-3 text-sm text-gray-300 dark:text-gray-400 text-left">{getDayName(rule.startDayOfWeek)}</TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-300 dark:text-gray-400 text-left">{getDayName(rule.endDayOfWeek)}</TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-300 dark:text-gray-400 text-center font-medium">{rule.startHour}:00</TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-300 dark:text-gray-400 text-center font-medium">{rule.endHour}:00</TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-100 dark:text-gray-200 text-right font-semibold">Rp {rule.rate.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleDeleteRule(rule._id)}
                          disabled={deleteInProgress === rule._id}
                          className="text-red-400 hover:text-red-300 disabled:text-gray-600 dark:text-red-500 dark:hover:text-red-400 text-sm font-medium"
                        >
                          {deleteInProgress === rule._id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              <PricingRuleEditor 
                courtId={courtId || ''} 
                onRuleCreated={() => {
                  fetchRules();
                  setActiveTab('table');
                }} 
              />
              {(!courtId || courtId === '') && (
                <div className="mt-4 bg-yellow-900 border-l-4 border-yellow-500 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-300">
                        ID lapangan tidak tersedia. Aturan harga tidak dapat ditambahkan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          variant="outline" 
          size="md"
          className="text-white border-gray-600 hover:bg-gray-800 dark:hover:bg-gray-800"
        >
          Tutup
        </Button>
        {activeTab !== 'add' && (
          <Button 
            onClick={() => setActiveTab('add')} 
            variant="primary" 
            size="md"
            className="text-white dark:text-white"
          >
            Tambah Harga
          </Button>
        )}
      </DialogActions>
      </div>
    </DialogContainer>
  );
}
