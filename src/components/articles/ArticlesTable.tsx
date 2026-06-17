"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  TableContainer,
  TablePagination,
  Chip,
  InputAdornment,
  Tooltip,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import SaveIcon from "@mui/icons-material/Save";

type Article = {
  id: string;
  title: string;
  pmid?: string;
  doi?: string;
  status: "INCLUDED" | "EXCLUDED" | "MAYBE";
  notes?: string;
};

const TEAL = "#0F766E";
const TEAL_LIGHT = "#CCFBF1";
const TEAL_MID = "#14B8A6";
const TEAL_DARK = "#0D5E58";

const STATUS_CONFIG: Record<
  Article["status"],
  { label: string; color: "success" | "error" | "warning" }
> = {
  INCLUDED: { label: "Included", color: "success" },
  EXCLUDED: { label: "Excluded", color: "error" },
  MAYBE: { label: "Maybe", color: "warning" },
};

export default function ArticlesTable({ projectId,
  refreshKey,
}: {
  projectId: string;
  refreshKey: number; }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("importedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ── debounce search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  /* ── reset page on filter change ── */
  useEffect(() => { setPage(0); }, [debouncedSearch, statusFilter, sortBy, sortOrder]);

  /* ── fetch ── */
  const fetchArticles = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        projectId,
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error("Failed to fetch articles");
      setArticles(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchArticles();
}, [
  projectId,
  debouncedSearch,
  statusFilter,
  sortBy,
  sortOrder,
  refreshKey,
]);

  /* ── update status ── */
  const updateStatus = async (id: string, status: Article["status"]) => {
    try {
      const res = await fetch(`/api/articles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── save notes ── */
  const saveReview = async (article: Article) => {
    try {
      const res = await fetch(`/api/articles/${article.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: article.notes ?? "" }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      alert("Notes saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save notes.");
    }
  };

  const paginated = articles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ mt: 4 }}>
      {/* ── Header ── */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 60%, ${TEAL_MID} 100%)`,
          borderRadius: "12px 12px 0 0",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: 700, letterSpacing: "-0.3px" }}
          >
            Articles
          </Typography>
          <Typography variant="caption" sx={{ color: alpha("#fff", 0.75) }}>
            {articles.length} {articles.length === 1 ? "result" : "results"}
          </Typography>
        </Box>
      </Paper>

      {/* ── Toolbar ── */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${alpha(TEAL, 0.18)}`,
          borderTop: "none",
          px: 3,
          py: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          backgroundColor: TEAL_LIGHT,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Title, PMID or DOI…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: TEAL }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 220,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fff",
              borderRadius: "8px",
              "&:hover fieldset": { borderColor: TEAL },
              "&.Mui-focused fieldset": { borderColor: TEAL },
            },
          }}
        />

        {/* Status filter */}
        <FormControl size="small" sx={{ minWidth: 155 }}>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            startAdornment={<FilterListIcon sx={{ fontSize: 16, color: TEAL, mr: 0.5 }} />}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
            }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="INCLUDED">Included</MenuItem>
            <MenuItem value="EXCLUDED">Excluded</MenuItem>
            <MenuItem value="MAYBE">Maybe</MenuItem>
          </Select>
        </FormControl>

        {/* Sort by */}
        <FormControl size="small" sx={{ minWidth: 165 }}>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            startAdornment={<SortIcon sx={{ fontSize: 16, color: TEAL, mr: 0.5 }} />}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
            }}
          >
            <MenuItem value="importedAt">Imported Date</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="pmid">PMID</MenuItem>
            <MenuItem value="doi">DOI</MenuItem>
          </Select>
        </FormControl>

        {/* Sort order */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
            }}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* ── Table ── */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
          border: `1px solid ${alpha(TEAL, 0.15)}`,
          borderTop: "none",
          boxShadow: `0 4px 20px ${alpha(TEAL, 0.08)}`,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: TEAL }} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["Title", "PMID", "DOI", "Status", "Notes", "Action"].map(col => (
                      <TableCell
                        key={col}
                        sx={{
                          backgroundColor: TEAL,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          borderBottom: "none",
                          py: 1.5,
                          "&:first-of-type": { pl: 2.5 },
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8, color: "text.secondary" }}>
                        <Typography variant="body2" color="text.secondary">
                          No articles found. Try adjusting your search or filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((article, idx) => (
                      <TableRow
                        key={article.id}
                        sx={{
                          backgroundColor: idx % 2 === 0 ? "#fff" : alpha(TEAL, 0.03),
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            backgroundColor: alpha(TEAL, 0.07),
                          },
                          "&:last-child td": { borderBottom: "none" },
                        }}
                      >
                        {/* Title */}
                        <TableCell
                          sx={{
                            pl: 2.5,
                            maxWidth: 260,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Tooltip title={article.title} placement="top-start" arrow>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight: 500,
                                color: TEAL_DARK,
                                cursor: "default",
                              }}
                            >
                              {article.title}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* PMID */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                            {article.pmid ?? "—"}
                          </Typography>
                        </TableCell>

                        {/* DOI */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                            {article.doi ?? "—"}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={{ minWidth: 145 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={article.status}
                              onChange={e =>
                                updateStatus(article.id, e.target.value as Article["status"])
                              }
                              renderValue={val => (
                                <Chip
                                  label={STATUS_CONFIG[val as Article["status"]].label}
                                  color={STATUS_CONFIG[val as Article["status"]].color}
                                  size="small"
                                  sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22 }}
                                />
                              )}
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: alpha(TEAL, 0.25) },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
                                borderRadius: "8px",
                              }}
                            >
                              <MenuItem value="INCLUDED">
                                <Chip label="Included" color="success" size="small" sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22 }} />
                              </MenuItem>
                              <MenuItem value="EXCLUDED">
                                <Chip label="Excluded" color="error" size="small" sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22 }} />
                              </MenuItem>
                              <MenuItem value="MAYBE">
                                <Chip label="Maybe" color="warning" size="small" sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22 }} />
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* Notes */}
                        <TableCell sx={{ minWidth: 260 }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            maxRows={3}
                            placeholder="Add review notes…"
                            value={article.notes ?? ""}
                            onChange={e => {
                              const value = e.target.value;
                              setArticles(prev =>
                                prev.map(a => a.id === article.id ? { ...a, notes: value } : a)
                              );
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                fontSize: "0.82rem",
                                borderRadius: "8px",
                                backgroundColor: alpha(TEAL, 0.03),
                                "&:hover fieldset": { borderColor: TEAL },
                                "&.Mui-focused fieldset": { borderColor: TEAL },
                              },
                            }}
                          />
                        </TableCell>

                        {/* Action */}
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon sx={{ fontSize: "14px !important" }} />}
                            onClick={() => saveReview(article)}
                            sx={{
                              backgroundColor: TEAL,
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              borderRadius: "8px",
                              textTransform: "none",
                              whiteSpace: "nowrap",
                              boxShadow: "none",
                              px: 1.5,
                              "&:hover": {
                                backgroundColor: TEAL_DARK,
                                boxShadow: `0 2px 8px ${alpha(TEAL, 0.4)}`,
                              },
                              "&:active": { transform: "scale(0.97)" },
                            }}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ── Pagination ── */}
            <TablePagination
              component="div"
              count={articles.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: `1px solid ${alpha(TEAL, 0.12)}`,
                color: TEAL_DARK,
                "& .MuiTablePagination-select": { fontWeight: 600 },
                "& .MuiTablePagination-actions button": {
                  color: TEAL,
                  "&:hover": { backgroundColor: alpha(TEAL, 0.08) },
                  "&.Mui-disabled": { color: alpha(TEAL, 0.3) },
                },
              }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
