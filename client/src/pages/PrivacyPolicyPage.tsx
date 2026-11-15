import React, { useEffect } from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle, Database, Bell, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Privacy Policy — IIIT Bhagalpur MITRA';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 px-4 sm:px-6 animate-fadeIn">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          Last Updated: November 15, 2026 • Policy Version 2.1
        </span>
      </div>

      {/* Formal Academic Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Institutional Privacy Charter • DPDP Act 2023 Compliant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Data Privacy & Student Confidentiality Policy
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
          The Indian Institute of Information Technology Bhagalpur (IIITBH) is dedicated to safeguarding student confidentiality, academic data integrity, and digital rights across the MITRA intranet community.
        </p>
      </div>

      {/* Compliance / Status Badge */}
      {user && (
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Authenticated Profile: <strong>{user.full_name}</strong> ({user.email})
            </span>
          </div>
          <span className="font-mono text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md text-[11px] border border-emerald-300 dark:border-emerald-800">
            Intranet Encryption: Active (TLS 1.3)
          </span>
        </div>
      )}

      {/* Policy Articles */}
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Section 1 */}
        <section className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-sm">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2>1. Information We Collect and Process</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            MITRA processes personal data solely to provide verified campus services, prevent unauthorized access, and facilitate student governance:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li><strong>Institutional Identity:</strong> Official institute email address (<code className="font-mono text-blue-700 dark:text-blue-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">@iiitbh.ac.in</code>), student full name, roll number, department, and academic year.</li>
            <li><strong>Authentication Credentials:</strong> Passwords hashed cryptographically using bcrypt with 12 salt rounds. Plaintext passwords are never stored, logged, or visible to system administrators.</li>
            <li><strong>Intranet Activities:</strong> Booking timestamps for campus facilities, peer support discussions, and course study material contributions.</li>
            <li><strong>Grievance & Issue Data:</strong> Student reports filed through the private concerns channel are masked with anonymous tracking tokens (<code className="font-mono text-blue-700 dark:text-blue-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ISSUE-XXXXX</code>) to guarantee non-retaliation.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-sm">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2>2. Cryptographic Protection & Data Security</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            All data in transit is protected using Strict Transport Security (HSTS) and mandatory TLS/HTTPS encryption. Modern security headers (Content Security Policy, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, and Referrer-Policy) are enforced across every HTTP response. Database connections utilize prepared statements and parameterized queries via Knex.js, eliminating SQL injection vectors.
          </p>
        </section>

        {/* Section 3 */}
        <section className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-sm">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h2>3. Anonymous Discourse & Pseudonymity</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            To foster honest academic exchange and mentorship, student names are masked in Student Connect and Town Hall discussions. However, pursuant to the Digital Personal Data Protection (DPDP) Act of 2023 and statutory institute guidelines, internal audit logs maintain cryptographic associations to deter cyber harassment, defamation, or security breaches. Unmasking requires formal approval from the Institute Proctorial Committee.
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-sm">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2>4. Cookies & Client-Side Storage</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            MITRA does not use advertising, marketing, or third-party commercial trackers. We only store strictly necessary technical state:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li><strong>Authentication Token:</strong> Ephemeral JWT token stored locally to maintain your verified session.</li>
            <li><strong>Interface Theme:</strong> User visual preference (Light mode / Dark mode).</li>
            <li><strong>Cookie Preference:</strong> Acknowledgement timestamp for statutory regulatory consent.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-sm">
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <h2>5. Your Rights as a Data Principal</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Under India's Digital Personal Data Protection Act (DPDP) 2023, every student and faculty member possesses the right to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Right of Access</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Inspect your profile data and historical activity logs at any time via Profile Settings.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Right to Correction</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Request updates or rectifications of outdated contact or departmental records.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Right to Erasure</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Request account decommissioning upon graduation or completion of institutional tenure.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Right to Grievance Redressal</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">File formal inquiries with the Institute Data Privacy Officer for expedited review.</span>
            </div>
          </div>
        </section>

        {/* Section 6 - Contact */}
        <section className="p-5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Mail className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
            <h2>6. Data Protection Officer & Institutional Enquiries</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            For questions regarding privacy, grievance escalation, or data records requests, contact:
          </p>
          <div className="pt-1 text-slate-800 dark:text-slate-200 font-medium">
            <p><strong>Chief Data Governance Officer & IT Administration</strong></p>
            <p className="text-slate-600 dark:text-slate-400">Indian Institute of Information Technology Bhagalpur</p>
            <p className="text-slate-600 dark:text-slate-400">Permanent Campus, Sabour, Bhagalpur, Bihar — 813210</p>
            <p className="mt-1">
              Official Email:{' '}
              <a href="mailto:mitra@iiitbh.ac.in" className="text-blue-600 dark:text-blue-400 underline font-semibold">
                mitra@iiitbh.ac.in
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          View Regulations & Terms of Service &rarr;
        </Link>
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Back to Portal Home
        </Link>
      </div>
    </div>
  );
};
