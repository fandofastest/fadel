"use client";
import React from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[400px] p-5"
    >
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        {title}
      </h4>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {description}
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          size="sm"
          variant="primary"
          className="bg-error-500 hover:bg-error-600"
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
} 