"use client";
import React, { useState, useEffect, useRef } from "react";
import UserFormModal from "./UserFormModal.new";
import DeleteUserDialog from "./DeleteUserDialog";
import AlertMessage from "../common/AlertMessage";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  createdAt?: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  function showAlert(message: string, type: "success" | "error" = "success") {
    setAlert({ message, type });
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 3000);
  }

  function handleAdd() {
    setEditUser(null);
    setModalOpen(true);
  }

  function handleEdit(user: User) {
    setEditUser(user);
    setModalOpen(true);
  }

  function handleDeleteDialog(user: User) {
    setDeleteTarget(user);
    setDeleteDialogOpen(true);
  }

  async function handleModalSubmit(user: User) {
    setModalLoading(true);
    try {
      if (user._id) {
        // Edit
        const res = await fetch(`/api/users/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (data.success) {
          setUsers((prev) => prev.map((u) => (u._id === user._id ? data.data : u)));
          setModalOpen(false);
          showAlert("User updated successfully", "success");
        } else {
          showAlert(data.message || "Failed to update user", "error");
        }
      } else {
        // Add
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (data.success) {
          setUsers((prev) => [data.data, ...prev]);
          setModalOpen(false);
          showAlert("User added successfully", "success");
        } else {
          showAlert(data.message || "Failed to add user", "error");
        }
      }
    } catch (err) {
      showAlert("Failed to save user", "error");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget?._id) return;
    setDeleteLoadingId(deleteTarget._id);
    try {
      const res = await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
        showAlert("User deleted successfully", "success");
      } else {
        showAlert(data.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showAlert("Failed to delete user", "error");
    } finally {
      setDeleteLoadingId(null);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  return (
    <>
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialUser={editUser}
        loading={modalLoading}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        loading={!!deleteLoadingId}
        userName={deleteTarget?.name}
      />
      {alert && (
        <AlertMessage
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Pengguna</h2>
        <button
          className="py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={handleAdd}
        >
          Tambah Pengguna
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Telepon</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tanggal Daftar</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Aksi</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-500">
                            Tidak ada data pengguna
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.name}</span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.email}</TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.phone}</TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' ?
                                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {user.role === 'admin' ? 'Admin' : 'Pelanggan'}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user.createdAt ? formatDateTime(user.createdAt) : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-end">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="py-1 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs"
                                  onClick={() => handleEdit(user)}
                                  disabled={modalLoading || deleteLoadingId === user._id}
                                >
                                  Edit
                                </button>
                                <button
                                  className="py-1 px-4 rounded bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-xs"
                                  onClick={() => handleDeleteDialog(user)}
                                  disabled={modalLoading || deleteLoadingId === user._id}
                                >
                                  Hapus
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden">
                  {users.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                      Tidak ada data pengguna
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-stroke dark:border-strokedark"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Pelanggan'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {user.phone}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                            Terdaftar: {user.createdAt ? formatDateTime(user.createdAt) : '-'}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="py-1 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs"
                              onClick={() => handleEdit(user)}
                              disabled={modalLoading || deleteLoadingId === user._id}
                            >
                              Edit
                            </button>
                            <button
                              className="py-1 px-4 rounded bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-xs"
                              onClick={() => handleDeleteDialog(user)}
                              disabled={modalLoading || deleteLoadingId === user._id}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
