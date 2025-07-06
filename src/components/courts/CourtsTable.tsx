"use client";
import React, { useState, useEffect } from "react";
import CourtFormModal from "./CourtFormModal";
import PricingRulesDialog from "./PricingRulesDialog";
import CourtsAccordionMobile from "./CourtsAccordionMobile";
import DeleteCourtDialog from "./DeleteCourtDialog";
import AlertMessage from "../common/AlertMessage";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Court {
  _id?: string;
  name: string;
  openTime: string;
  closeTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CourtsTable() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editCourt, setEditCourt] = useState<Court | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState<string | undefined>(undefined);

  function handleAturHarga(courtId?: string) {
    setSelectedCourtId(courtId);
    setPricingDialogOpen(true);
  }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Court | null>(null);
  const [alert, setAlert] = useState<{ message: string; type?: "success" | "error" } | null>(null);
  const alertTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  function showAlert(message: string, type: "success" | "error" = "success") {
    setAlert({ message, type });
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
  }

  useEffect(() => {
    fetchCourts();
  }, []);

  async function fetchCourts() {
    try {
      setLoading(true);
      const res = await fetch("/api/courts");
      const data = await res.json();
      if (data.success) {
        setCourts(data.data);
      } else {
        setError(data.message || "Failed to fetch courts");
      }
    } catch (err) {
      setError("Failed to fetch courts");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditCourt(null);
    setModalOpen(true);
  }

  function handleEdit(court: Court) {
    setEditCourt(court);
    setModalOpen(true);
  }

  function handleDeleteDialog(court: Court) {
    setDeleteTarget(court);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget?._id) return;
    setDeleteLoadingId(deleteTarget._id);
    try {
      const res = await fetch(`/api/courts/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCourts((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        showAlert("Court deleted successfully", "success");
      } else {
        showAlert(data.message || "Failed to delete court", "error");
      }
    } catch (err) {
      showAlert("Failed to delete court", "error");
    } finally {
      setDeleteLoadingId(null);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }

  async function handleModalSubmit(court: Court) {
    setModalLoading(true);
    try {
      if (court._id) {
        // Edit
        const res = await fetch(`/api/courts/${court._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(court),
        });
        const data = await res.json();
        if (data.success) {
          setCourts((prev) => prev.map((c) => (c._id === court._id ? data.data : c)));
          setModalOpen(false);
          showAlert("Court updated successfully", "success");
        } else {
          showAlert(data.message || "Failed to update court", "error");
        }
      } else {
        // Add
        const res = await fetch("/api/courts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(court),
        });
        const data = await res.json();
        if (data.success) {
          setCourts((prev) => [data.data, ...prev]);
          setModalOpen(false);
          showAlert("Court added successfully", "success");
        } else {
          showAlert(data.message || "Failed to add court", "error");
        }
      }
    } catch (err) {
      showAlert("Failed to save court", "error");
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <CourtFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialCourt={editCourt}
        loading={modalLoading}
      />
      <DeleteCourtDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        loading={!!deleteLoadingId}
        courtName={deleteTarget?.name}
      />
      {alert && (
        <AlertMessage
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Lapangan</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow text-sm"
          onClick={handleAdd}
        >
          + Tambah Lapangan
        </button>
      </div>
      {/* Mobile Accordion */}
      <div className="block md:hidden">
        <CourtsAccordionMobile
          courts={courts}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDeleteDialog}
          onAturHarga={handleAturHarga}
          deleteLoadingId={deleteLoadingId}
          modalLoading={modalLoading}
        />
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.01]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jam Buka</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jam Tutup</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Aksi</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] bg-white dark:bg-white/[0.03]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-400 dark:text-gray-500">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-red-500 text-center py-4 bg-white dark:bg-white/[0.01]">{error}</TableCell>
              </TableRow>
            ) : courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500 bg-white dark:bg-white/[0.01]">Tidak ada data lapangan.</TableCell>
              </TableRow>
            ) : (
              courts.map((court) => (
                <TableRow key={court._id} className="bg-white dark:bg-white/[0.01]">
                  <TableCell className="px-5 py-4 text-start text-gray-700 dark:text-white/90">{court.name}</TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-700 dark:text-white/90">{court.openTime}</TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-700 dark:text-white/90">{court.closeTime}</TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <button
                      className="py-1 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs"
                      onClick={() => handleEdit(court)}
                      disabled={modalLoading || deleteLoadingId === court._id}
                    >
                      Edit
                    </button>
                    <button
                      className="py-1 px-4 rounded bg-green-600 text-white font-semibold hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-xs ml-2"
                      onClick={() => handleAturHarga(court._id)}
                      disabled={modalLoading || deleteLoadingId === court._id}
                    >
                      Atur Harga
                    </button>
                    <button
                      className="py-1 px-4 rounded bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-xs ml-2"
                      onClick={() => handleDeleteDialog(court)}
                      disabled={modalLoading || deleteLoadingId === court._id}
                    >
                      {deleteLoadingId === court._id ? "Menghapus..." : "Hapus"}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    {/* Pricing Rules Dialog */}
    <PricingRulesDialog
      open={pricingDialogOpen}
      onClose={() => setPricingDialogOpen(false)}
      courtId={selectedCourtId}
    />
    </div>
  );
}
