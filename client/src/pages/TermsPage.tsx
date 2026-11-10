import React from 'react';
import {
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Mail,
  Clock,
  BookOpen,
  Calendar,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TermsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Formal Academic Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Institutional Charter • Document Ref: REG-2026-v1</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Community Regulations & Code of Conduct
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          College Connect is an authenticated intranet community operated exclusively for students, researchers, and faculty of the institute. All members are bound by institute conduct rules, academic honesty tenets, and the community terms below.
        </p>
      </div>

      {/* Acceptance Status Box */}
      {user && (
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Signed in as <strong>{user.full_name}</strong> ({user.email}). Terms accepted upon verified registration (Policy v1.0).
            </span>
          </div>
          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
            Status: Fully Compliant
          </span>
        </div>
      )}

      {/* Structured Policy Articles */}
      <div className="space-y-4">
        {/* Article 1 */}
        <section className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Mail className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
            <h3>Article 1: Institutional Whitelist & Account Authorization</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Access is strictly governed by institutional email verification. Only email addresses bearing approved institute domain designations (including <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-700 dark:text-brand-300">@iiitbh.ac.in</code> and <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-700 dark:text-brand-300">@college.edu</code>) can complete registration. Third-party personal accounts (Gmail, Yahoo, Outlook) are automatically blocked. Sharing, renting, or transferring credentials violates institute IT policy.
          </p>
        </section>

        {/* Article 2 */}
        <section className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Lock className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
            <h3>Article 2: Anonymous Discourse & Internal Privacy Architecture</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            To encourage candid academic discussions, mentorship across batches, and fearless reporting of concerns, student identities are masked with pseudonyms across Career Path Rooms, Student Connect discussions, and Grievance tickets. However, an encrypted internal mapping is maintained in accordance with cybersecurity regulations to ensure accountability in cases of harassment, defamation, or security threats.
          </p>
        </section>

        {/* Article 3 */}
        <section className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Clock className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
            <h3>Article 3: Rate Limiting & Room Membership Quotas</h3>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 font-sans">
            <p>To preserve high academic signal, combat spam, and encourage focused preparation, strict server-side quotas apply:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Career Path Membership:</strong> Each student may concurrently join a maximum of <strong>2 career rooms</strong>. Students must depart one room before enrolling in another.</li>
              <li><strong>Career Discussion Quota:</strong> Each student may publish up to <strong>10 messages per calendar day</strong> across Career Path Rooms (resetting daily at 00:00 IST).</li>
              <li><strong>Student Connect Quota:</strong> Limited to <strong>10 messages/replies per calendar day</strong>.</li>
              <li><strong>Grievance Submissions:</strong> Maximum of <strong>2 private concern tickets per day</strong> to ensure every incident is investigated with administrative rigor.</li>
            </ul>
          </div>
        </section>

        {/* Article 4 */}
        <section className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <BookOpen className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
            <h3>Article 4: Academic Resources & Copyright Integrity</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            The Study Materials repository is intended for lecture notes, past exam question papers (PYQs), lab manuals, and educational summaries. Uploading leaked or ongoing examination question papers, unapproved proprietary software, copyrighted textbooks without license, or malicious executables will lead to immediate file removal and referral to the Proctorial Board.
          </p>
        </section>

        {/* Article 5 */}
        <section className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Building2 className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
            <h3>Article 5: Facility & Slot Booking Governance</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Campus resources (Auditoriums, Seminar Halls, Robotics Lab, Sports Courts) are subject to automated transactional anti-double-booking checks. Submissions must specify legitimate student club or academic purposes. Reservations remain provisional until reviewed and sanctioned by the respective facility officer.
          </p>
        </section>

        {/* Article 6 */}
        <section className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <h3>Article 6: Proctorial Sanctions & Compliance Action</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Violations of these regulations will result in temporary suspension of messaging quotas, revoking of booking rights, or permanent expulsion from the digital community, without prejudice to statutory disciplinary proceedings instituted under institute statutes.
          </p>
        </section>
      </div>
    </div>
  );
};
