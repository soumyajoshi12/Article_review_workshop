
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

type ExcelUploadProps = {
  projectId: string;
  onUploadSuccess?: () => void;
};

export default function ExcelUpload({
  projectId,
  onUploadSuccess,
}: ExcelUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setLoading(true);

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data);

      const worksheet =
        workbook.Sheets[workbook.SheetNames[0]!];

      const rows = XLSX.utils.sheet_to_json(worksheet!);

      console.log("Excel Rows:", rows);

      const response = await fetch("/api/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          articles: rows,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to import articles");
      }

      alert("Articles imported successfully!");

      onUploadSuccess?.();
    } catch (error) {
      console.error(error);

      alert("Error importing Excel file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label
        className={`inline-flex items-center rounded-md px-4 py-2 text-white transition ${
          loading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:opacity-90"
        }`}
        style={{ backgroundColor: "#115E59" }}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.25"
              />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            Uploading...
          </>
        ) : (
          "Upload Excel File"
        )}

        <input
          hidden
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </label>
    </div>
  );
}
