import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  UploadCloud,
  Search,
  Filter,
  Download,
  FileText,
  AlertTriangle,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const StudyMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    department: 'Computer Science and Engineering',
    academic_year: '1st Year',
    semester: 'Semester 1',
    category: 'notes',
    description: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Report modal state
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials', {
        params: {
          search,
          semester: selectedSemester,
          department: selectedDept,
          category: selectedCategory,
          sort: sortBy,
        },
      });
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, selectedSemester, selectedDept, selectedCategory, sortBy]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setNotification({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }

    setUploading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('department', uploadData.department);
    formData.append('academic_year', uploadData.academic_year);
    formData.append('semester', uploadData.semester);
    formData.append('category', uploadData.category);
    formData.append('description', uploadData.description);
    formData.append('tags', uploadData.tags);
    formData.append('file', selectedFile);

    try {
      await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotification({ type: 'success', message: 'Document published successfully.' });
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadData({
        title: '',
        subject: '',
        department: 'Computer Science and Engineering',
        academic_year: '1st Year',
        semester: 'Semester 1',
        category: 'notes',
        description: '',
        tags: '',
      });
      fetchMaterials();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this academic resource from the repository?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setNotification({ type: 'success', message: 'Resource removed.' });
      fetchMaterials();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Delete failed.' });
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId || !reportReason.trim()) return;

    try {
      await api.post(`/materials/${reportTargetId}/report`, { reason: reportReason });
      setNotification({ type: 'success', message: 'Resource reported for academic committee review.' });
      setReportTargetId(null);
      setReportReason('');
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Report failed.' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-700 dark:text-brand-400" />
            Academic Resource Vault & Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental lecture notes, verified PYQs, lab manuals, and course reference guides.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="btn-tactile px-3.5 py-2 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2 text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by subject code, title, or keywords (e.g. Operating Systems, CS201, MATLAB)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Document Types</option>
            <option value="notes">Lecture Notes (PDF)</option>
            <option value="pyq">Question Papers (PYQ)</option>
            <option value="assignment">Assignments & Solutions</option>
            <option value="practical">Practical / Lab Manuals</option>
            <option value="book">Reference Texts</option>
            <option value="guide">Study Guides</option>
            <option value="presentation">Presentation Slides</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={`Semester ${s}`}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science and Engineering">CSE</option>
            <option value="Electronics and Communication">ECE</option>
            <option value="Data Science & Artificial Intelligence">DSAI</option>
            <option value="Mechatronics & Automation">Mechatronics</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="newest">Sort by: Date Added</option>
            <option value="downloads">Sort by: Downloads</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No matching academic resources found
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Select another semester filter or upload course materials for your batch.
            </p>
          </div>
        ) : (
          materials.map((mat) => (
            <div
              key={mat.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {mat.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatFileSize(mat.file_size)} • {mat.file_type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                  {mat.title}
                </h3>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mt-0.5 truncate">
                  {mat.subject}
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {mat.description || 'Verified academic resource uploaded for departmental coursework.'}
                </p>

                {mat.tags && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {(typeof mat.tags === 'string'
                      ? mat.tags.split(',')
                      : Array.isArray(mat.tags)
                      ? mat.tags
                      : []
                    ).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                      >
                        #{typeof tag === 'string' ? tag.trim() : tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{mat.semester} • {mat.department}</span>
                  <span>{mat.downloads_count} downloads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <a
                  href={`/api/materials/${mat.id}/download`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>

                <button
                  onClick={() => setReportTargetId(mat.id)}
                  title="Report Content"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>

                {(mat.is_owner || user?.role === 'super_admin' || user?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(mat.id)}
                    title="Delete File"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                Upload Course Resource
              </h2>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems End-Sem Solved PYQs (2023-2025)"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Course *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures (CS201)"
                    value={uploadData.subject}
                    onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="notes">Lecture Notes (PDF)</option>
                    <option value="pyq">Question Papers (PYQ)</option>
                    <option value="assignment">Assignment Solution</option>
                    <option value="practical">Practical / Lab Manual</option>
                    <option value="book">Reference Text</option>
                    <option value="guide">Study Guide</option>
                    <option value="presentation">Presentation Slides</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={uploadData.semester}
                    onChange={(e) => setUploadData({ ...uploadData, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`Semester ${s}`}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={uploadData.department}
                    onChange={(e) => setUploadData({ ...uploadData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Computer Science and Engineering">CSE</option>
                    <option value="Electronics and Communication">ECE</option>
                    <option value="Data Science & Artificial Intelligence">DSAI</option>
                    <option value="Mechatronics & Automation">Mechatronics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Topics Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline topics, faculty references, or relevant examination modules..."
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File Attachment (PDF, DOCX, PPT, ZIP up to 25MB) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.png,.jpg"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploading ? 'Publishing...' : 'Publish to Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Report Academic Document
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Specify your concern (e.g. copyright infringement, incorrect syllabus, or exam confidentiality violation).
            </p>

            <form onSubmit={handleReport} className="mt-3.5 space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Reason for report..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportTargetId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
