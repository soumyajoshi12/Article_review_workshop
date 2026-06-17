"use client";

import { useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
};

type Organization = {
  id: string;
  name: string;
  projects: Project[];
};

type WorkspaceDialogProps = {
  open: boolean;
  onContinue: (
    organization: Organization,
    project: Project
  ) => void;
};

const PRIMARY = "#0F766E";

export default function WorkspaceDialog({
  open,
  onContinue,
}: WorkspaceDialogProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await fetch("/api/workspace");
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  const selectedOrganization = useMemo(() => {
    return organizations.find((org) => org.id === organizationId);
  }, [organizationId, organizations]);

  const availableProjects = selectedOrganization?.projects ?? [];

  const handleContinue = () => {
    if (!selectedOrganization) return;

    const selectedProject = availableProjects.find(
      (project) => project.id === projectId
    );

    if (!selectedProject) return;

    onContinue(selectedOrganization, selectedProject);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg overflow-hidden rounded-[16px] bg-[#F8FAFC] shadow-2xl">
        {/* Header */}
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          <h2 className="text-2xl font-bold">Select Workspace</h2>
          <p className="mt-1 text-sm opacity-90">
            Choose your organization and project to continue.
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#F8FAFC] px-8 py-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent"
                style={{ borderTopColor: PRIMARY }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Organization */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <select
                  value={organizationId}
                  onChange={(e) => {
                    setOrganizationId(e.target.value);
                    setProjectId("");
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-teal-700"
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project
                </label>
                <select
                  value={projectId}
                  disabled={!organizationId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:bg-gray-100 focus:border-teal-700"
                >
                  <option value="">Select Project</option>
                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end bg-[#F8FAFC] px-6 py-4">
          <button
            onClick={handleContinue}
            disabled={!organizationId || !projectId || loading}
            className="rounded-lg px-8 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: PRIMARY }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#115E59";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = PRIMARY;
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}