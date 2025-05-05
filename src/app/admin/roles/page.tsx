import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleTable from "@/components/tables/RoleTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Roles | CAT System",
  description: "Manage roles in the CAT system",
};

export default function RolesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Roles" />
        {/* Tambahkan tombol AddRoleButton di sini jika sudah ada */}
      </div>
      <div className="space-y-6">
        <ComponentCard title="Role List">
          <RoleTable />
        </ComponentCard>
      </div>
    </div>
  );
} 