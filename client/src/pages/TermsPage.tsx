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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TermsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-800 to-slate-900 text-white shadow-lg">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold w-fit mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Official Campus Community Policy • Version 1.0</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Terms & Conditions and Community Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-teal-100/80 mt-2 max-w-2xl leading-relaxed">
          College Connect is an exclusive, private campus network. All registered members agree to uphold academic integrity, respectful discourse, and student welfare.
        </p>
      </div>

      {/* Acceptance Status Box */}
      {user && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Signed in as <strong>{user.full_name}</strong> ({user.email}). Terms accepted on registration (Version 1.0).
            </span>
          </div>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
            Status: Compliant
          </span>
        </div>
      )}

      {/* Terms Sections */}
      <div className="space-y-5 text-sm">
        {/* 1. Eligibility */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Mail className="w-4 h-4 text-teal-600" />
            <h3>1. Eligibility & College Email Whitelist</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Registration on College Connect is exclusively restricted to active, enrolled students, faculty members, and authorized administrative representatives possessing an authenticated college email address belonging to approved campus domains (e.g., <code className="text-teal-600">@iiitbh.ac.in</code>, <code className="text-teal-600">@college.edu</code>). Accounts registered using unauthorized third-party providers (Gmail, Yahoo) are prohibited and rejected by server firewalls.
          </p>
        </section>

        {/* 2. Anonymous Communication Rules */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Lock className="w-4 h-4 text-teal-600" />
            <h3>2. Anonymous Discourse & Identity Protection</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            In Career Path Rooms, Student Connect discussions, and public forums, your full name, student ID, and college email are never revealed to peer students. Pseudonyms (such as <em>Anonymous Student #1042</em>) are automatically generated. The platform maintains an internal privacy-preserving linkage accessible only to authorized administrators for anti-abuse and moderation purposes.
          </p>
        </section>

        {/* 3. Strict Daily Message Limits */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3>3. Strict Daily Limits & Membership Caps</h3>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1.5">
            <p>To preserve high-signal conversations and prevent spam, server-enforced quotas apply:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Career Path Rooms:</strong> Maximum of <strong>2 rooms joined simultaneously</strong>. Leave one before joining another.</li>
              <li><strong>Career Rooms Messaging:</strong> Maximum of <strong>10 messages per day</strong>. Resets at 00:00 campus time.</li>
              <li><strong>Student Connect:</strong> Maximum of <strong>10 messages per day</strong> across all threads.</li>
              <li><strong>Student Issues:</strong> Maximum of <strong>2 private concern submissions per day</strong> to ensure thorough review.</li>
            </ul>
          </div>
        </section>

        {/* 4. Academic Materials & Copyright */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <h3>4. Academic Resource Sharing & Copyright</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Students are permitted to share personal lecture summaries, previous year question papers (PYQs), open-source code, and educational references. Uploading confidential examination questions prior to scheduled exam slots, proprietary non-licensed textbooks, or malicious files will result in immediate file removal, account suspension, and referral to the academic disciplinary committee.
          </p>
        </section>

        {/* 5. Facility Bookings & Anti-Double-Booking */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <AlertTriangle className="w-4 h-4 text-teal-600" />
            <h3>5. Facility Reservations & Booking Conduct</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            College facilities (Robotics Lab, Auditorium, Sports Complex, Seminar Halls) are booked on an approval basis. Double-booking and overlapping reservations are strictly prevented by transactional database constraints. Any club failing to utilize approved slots without prior cancellation may forfeit booking privileges for the semester.
          </p>
        </section>

        {/* 6. Harassment & Prohibited Conduct */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Shield className="w-4 h-4 text-teal-600" />
            <h3>6. Zero Tolerance Policy for Harassment & Misuse</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The anonymity provided by the platform is a privilege to encourage safe academic discourse and constructive welfare reporting. Hate speech, targeted harassment, cyberbullying, defamation of faculty or peers, and doxxing are strictly prohibited. The administration reserves all rights to suspend offending accounts and pursue institutional disciplinary proceedings.
          </p>
        </section>
      </div>
    </div>
  );
};
