"use client";
import React, { useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import type { RoleUser } from "@/types/RoleUser";
import { roleService } from "@/services/roleService";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: RoleUser | null;
}

const allPermissions = [
  "manage_users",
  "manage_exams",
  "manage_questions",
  "view_results",
  "take_exams",
  "view_own_results",
];

export default function EditRoleModal({ isOpen, onClose, onSuccess, role }: EditRoleModalProps) {
  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (role) {
      setForm({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);
    try {
      await roleService.updateRole(role._id, form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-5  border border-gray-200 dark:border-gray-800">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Edit Role</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white/90">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white/90">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-black dark:text-white bg-white dark:bg-gray-800"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white/90">Permissions</label>
          <div className="flex flex-wrap gap-2">
            {allPermissions.map((perm) => (
              <label key={perm} className="flex items-center gap-1 text-xs text-gray-700 dark:text-white/90">
                <input
                  type="checkbox"
                  checked={form.permissions.includes(perm)}
                  onChange={() => handlePermissionChange(perm)}
                  className="accent-primary"
                />
                {perm.replace(/_/g, " ")}
              </label>
            ))}
          </div>
        </div>
        {error && <div className="text-error-500 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 