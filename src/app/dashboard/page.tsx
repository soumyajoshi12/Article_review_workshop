"use client";

import { useEffect, useState } from "react";
import ArticlesTable from "~/components/articles/ArticlesTable";
import ExcelUpload from "~/components/articles/ExcelUpload";
import LogoutButton from "~/components/auth/LogoutButton";
import WorkspaceDialog from "~/components/dashboard/WorkspaceDialog";
import EditIcon from "@mui/icons-material/Edit";

const WORKSPACE_KEY = "workspace";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [organization, setOrganization] = useState<any>(null);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(WORKSPACE_KEY); // ← changed

    if (saved) {
      const { organization, project } = JSON.parse(saved);
      setOrganization(organization);
      setProject(project);
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, []);

  const handleWorkspaceSelect = (org: any, proj: any) => {
    setOrganization(org);
    setProject(proj);
    setOpen(false);

    sessionStorage.setItem( // ← changed
      WORKSPACE_KEY,
      JSON.stringify({ organization: org, project: proj })
    );
  };

  const handleEditWorkspace = () => {
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1F2937] p-2 md:p-6">

      <WorkspaceDialog
        open={open}
        onContinue={handleWorkspaceSelect}
      />

      <div className="mb-2 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#0F766E] p-3 text-white">
        <div>
          <h1 className="text-4xl font-bold">
            Article Review Workshop
          </h1>
          <p className="mt-0.5 text-base opacity-90">
            Review, organize and manage research articles efficiently.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>

      {organization && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#D1FAE5] p-3">
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A8A]">
              {organization.name}
            </h2>

            <p className="mt-1 text-gray-600">
              Current Project: <strong>{project?.name}</strong>
            </p>
          </div>

          <button
            onClick={handleEditWorkspace}
            className="text-sm font-medium text-black-700"
          >
            <EditIcon fontSize="small" />
          </button>
        </div>
      )}

      {project && (
        <div className="mb-3 rounded-xl border border-[#E5E7EB] bg-[#ECFDF5] p-3">
          <h3 className="mb-2 text-xl font-semibold">
            Import Articles
          </h3>

          <ExcelUpload
            projectId={project.id}
            onUploadSuccess={() =>
              setRefreshKey((prev) => prev + 1)
            }
          />
        </div>
      )}

      {project && (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#ECFDF5] p-3">
          <ArticlesTable
            projectId={project.id}
            refreshKey={refreshKey}
          />
        </div>
      )}
    </div>
  );
}