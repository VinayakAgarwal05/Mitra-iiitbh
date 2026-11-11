import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { initializeSchema } from './schema';
import adhyayeMaterials from './adhyayeMaterials.json';
import adhyayeMentors from './adhyayeMentors.json';

export async function seedDatabase() {
  await initializeSchema();

  // 1. Seed Whitelisted Domains
  const domainCount = await db('verified_domains').count('id as count').first();
  if (parseInt((domainCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding whitelisted email domains...');
    await db('verified_domains').insert([
      { id: uuidv4(), domain: 'iiitbh.ac.in', is_active: true, created_at: new Date() },
      { id: uuidv4(), domain: 'college.edu', is_active: true, created_at: new Date() },
    ]);
  }

  // 2. Seed Users
  const userCount = await db('users').count('id as count').first();
  if (parseInt((userCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding initial users...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const studentPass = await bcrypt.hash('Student@123', salt);
    const wardenPass = await bcrypt.hash('Warden@123', salt);

    const adminId = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const wardenId = uuidv4();

    await db('users').insert([
      {
        id: adminId,
        full_name: 'System Administrator',
        email: 'admin@iiitbh.ac.in',
        roll_number: 'ADMIN-001',
        academic_year: 'Faculty / Staff',
        department: 'Administration',
        password_hash: adminPass,
        role: 'super_admin',
        is_verified: true,
        terms_accepted: true,
        terms_version: '1.0',
        terms_accepted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: wardenId,
        full_name: 'Dr. K. Raman',
        email: 'warden@iiitbh.ac.in',
        roll_number: 'WARDEN-001',
        academic_year: 'Faculty Staff',
        department: 'Hostel Administration',
        password_hash: wardenPass,
        role: 'representative',
        is_verified: true,
        terms_accepted: true,
        terms_version: '1.0',
        terms_accepted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: student1Id,
        full_name: 'Aarav Sharma',
        email: 'student1@college.edu',
        roll_number: '2301CS01',
        academic_year: '3rd Year',
        department: 'Computer Science and Engineering',
        password_hash: studentPass,
        role: 'student',
        is_verified: true,
        terms_accepted: true,
        terms_version: '1.0',
        terms_accepted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: student2Id,
        full_name: 'Priya Verma',
        email: 'student2@college.edu',
        roll_number: '2401EC15',
        academic_year: '2nd Year',
        department: 'Electronics and Communication',
        password_hash: studentPass,
        role: 'student',
        is_verified: true,
        terms_accepted: true,
        terms_version: '1.0',
        terms_accepted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  }

  // 3. Seed Career Rooms
  const roomCount = await db('career_rooms').count('id as count').first();
  if (parseInt((roomCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding career path rooms...');
    const careerRooms = [
      {
        id: 'room-placement-prep',
        name: 'Placement Preparation',
        category: 'Corporate & Tech',
        description: 'Mock interviews, resume peer-reviews, coding assessment discussions, OA questions, and compensation insights.',
        guidelines: 'Focus strictly on placement prep. Share vetted resources and practice test questions. Be respectful and supportive.',
        icon: 'Briefcase',
      },
      {
        id: 'room-software-dev',
        name: 'Software Development',
        category: 'Engineering',
        description: 'System design, full-stack architectures, algorithms, open-source contributions, Git workflows, and competitive coding.',
        guidelines: 'Maintain constructive technical discussions. Avoid flaming technologies or personal attacks.',
        icon: 'Code',
      },
      {
        id: 'room-ai-ml-data',
        name: 'Data Science and AI/ML',
        category: 'Engineering',
        description: 'Machine learning algorithms, deep learning papers, PyTorch/TensorFlow, NLP, Computer Vision, and Kaggle competitions.',
        guidelines: 'Share papers, code repos, and dataset resources. Keep discussions mathematically and practically grounded.',
        icon: 'Brain',
      },
      {
        id: 'room-gate-prep',
        name: 'GATE Preparation',
        category: 'Higher Studies & PSU',
        description: 'Comprehensive GATE CS & EC preparation, standard textbook discussions, previous year solutions, and mock test analysis.',
        guidelines: 'Post subject-wise doubts and discuss PYQs with complete explanations.',
        icon: 'GraduationCap',
      },
      {
        id: 'room-upsc-prep',
        name: 'UPSC Preparation',
        category: 'Civil Services',
        description: 'Civil services exam strategies, answer writing practice, current affairs analysis, and optional subjects review.',
        guidelines: 'Focus strictly on syllabus and exam preparation. Strictly non-partisan discussion.',
        icon: 'BookOpen',
      },
      {
        id: 'room-ssc-govt',
        name: 'SSC and Government Exams',
        category: 'Government Services',
        description: 'SSC CGL, CHSL, state engineering services, and national recruitment tests preparation materials and timelines.',
        guidelines: 'Share official notification updates, syllabus breakdowns, and quantitative practice tricks.',
        icon: 'Landmark',
      },
      {
        id: 'room-banking-exams',
        name: 'Banking Exams',
        category: 'Finance & Banking',
        description: 'IBPS PO, SBI PO, RBI Grade B discussions, reasoning ability tests, and general awareness materials.',
        guidelines: 'Collaborate on sectional speed tests and financial aptitude questions.',
        icon: 'Building2',
      },
      {
        id: 'room-mba-cat',
        name: 'MBA and CAT Preparation',
        category: 'Management',
        description: 'CAT, XAT, GMAT preparations, VARC practice, DILR puzzles, Quant revision, and B-school profile evaluations.',
        guidelines: 'Share mock scores, sectional strategies, and GD/PI preparation experiences.',
        icon: 'TrendingUp',
      },
      {
        id: 'room-trading-finance',
        name: 'Trading and Financial Markets',
        category: 'Finance',
        description: 'Stock markets, algorithmic trading, quantitative finance, fundamental analysis, macroeconomics, and personal finance.',
        guidelines: 'Educational discussions only. No commercial tip-selling or pump-and-dump solicitations.',
        icon: 'LineChart',
      },
      {
        id: 'room-entrepreneurship',
        name: 'Entrepreneurship and Startups',
        category: 'Startups & Business',
        description: 'Brainstorming startup ideas, finding co-founders, pitching to angel investors, MVP development, and incubator programs.',
        guidelines: 'Encourage collaboration and mutual feedback on early-stage student projects.',
        icon: 'Rocket',
      },
      {
        id: 'room-higher-studies',
        name: 'Higher Studies and Research',
        category: 'Academia',
        description: 'MS / PhD applications, GRE, TOEFL, IELTS, research internships, writing academic papers, and contacting professors.',
        guidelines: 'Discuss Statement of Purpose (SOP) strategies, university shortlists, and funding opportunities.',
        icon: 'Search',
      },
      {
        id: 'room-other-paths',
        name: 'Other Career Paths',
        category: 'Alternative Careers',
        description: 'UI/UX Design, Product Management, Technical Writing, Developer Relations, Consulting, and creative pursuits.',
        guidelines: 'Share non-traditional career resources, portfolio guides, and industry transitions.',
        icon: 'Compass',
      },
    ];

    for (const r of careerRooms) {
      await db('career_rooms').insert({
        ...r,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  // 4. Seed College Contacts
  const contactsCount = await db('contacts').count('id as count').first();
  if (parseInt((contactsCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding official college contacts directory...');
    const contacts = [
      {
        id: uuidv4(),
        category: 'Hostel Warden',
        name: 'Dr. K. Raman',
        designation: 'Chief Hostel Warden',
        department_or_hostel: 'Boys Hostel 1 & 2',
        contact_number: '+91 94310 12345',
        email: 'warden@iiitbh.ac.in',
        availability: 'Mon - Fri: 5:00 PM - 7:00 PM (Hostel Office)',
        is_authorized: true,
      },
      {
        id: uuidv4(),
        category: 'Hostel Representative',
        name: 'Aryan Singhania',
        designation: 'Hostel General Secretary',
        department_or_hostel: 'Hostel Block B',
        contact_number: '+91 98765 43210',
        email: 'hr.hostel@college.edu',
        availability: 'Daily: 7:00 PM - 9:00 PM (Common Room)',
        is_authorized: true,
      },
      {
        id: uuidv4(),
        category: 'Student Representative',
        name: 'Tanvi Deshmukh',
        designation: 'Student Council President',
        department_or_hostel: 'Student Senate Body',
        contact_number: '+91 97654 32109',
        email: 'president.council@college.edu',
        availability: 'Wed & Fri: 4:00 PM - 6:00 PM (Council Hall)',
        is_authorized: true,
      },
      {
        id: uuidv4(),
        category: 'Class Representative',
        name: 'Rohan Mehra',
        designation: 'Class Representative (3rd Year CSE)',
        department_or_hostel: 'CSE Dept - Section A',
        contact_number: '+91 96543 21098',
        email: 'cr.cse3@college.edu',
        availability: 'Available after lecture hours',
        is_authorized: true,
      },
      {
        id: uuidv4(),
        category: 'Faculty Advisor',
        name: 'Prof. S. N. Roy',
        designation: 'Dean of Student Affairs',
        department_or_hostel: 'Deanery Office, Admin Block',
        contact_number: '+91 612 222 3456',
        email: 'dean.students@iiitbh.ac.in',
        availability: 'Mon & Thu: 2:30 PM - 4:30 PM (By prior appointment)',
        is_authorized: true,
      },
    ];

    for (const c of contacts) {
      await db('contacts').insert({
        ...c,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  // Seed verified senior peer mentors from ADHYAAY directory
  const existingContactIds = new Set((await db('contacts').select('id')).map((r: any) => r.id));
  const mentorsToInsert = adhyayeMentors
    .filter((m: any) => !existingContactIds.has(m.id))
    .map((m: any) => ({
      id: m.id,
      category: m.category,
      name: m.name,
      designation: m.designation,
      department_or_hostel: m.department_or_hostel,
      contact_number: m.contact_number,
      email: m.email,
      availability: m.availability,
      linkedin: m.linkedin,
      is_authorized: true,
      created_at: new Date(),
      updated_at: new Date(),
    }));

  if (mentorsToInsert.length > 0) {
    console.log(`Seeding ${mentorsToInsert.length} senior peer mentors from verified academic directory...`);
    await db.batchInsert('contacts', mentorsToInsert, 50);
  }

  // 5. Seed Events
  const eventsCount = await db('events').count('id as count').first();
  if (parseInt((eventsCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding interactive calendar events...');
    const now = new Date();
    const event1Start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days later
    const event1End = new Date(event1Start.getTime() + 4 * 60 * 60 * 1000);

    const event2Start = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days later
    const event2End = new Date(event2Start.getTime() + 48 * 60 * 60 * 1000);

    const event3Start = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days later
    const event3End = new Date(event3Start.getTime() + 3 * 60 * 60 * 1000);

    const events = [
      {
        id: uuidv4(),
        title: 'Workshop on Generative AI & Autonomous Agentic Systems',
        category: 'workshop',
        description: 'Hands-on intensive masterclass on LLMs, Retrieval Augmented Generation (RAG), and building multi-agent architectures using open frameworks.',
        start_time: event1Start,
        end_time: event1End,
        venue: 'Auditorium Hall 1 & Virtual Live Stream',
        organizer: 'Google Developer Student Club & ACM Chapter',
        coordinator_name: 'Dr. R. K. Sen',
        coordinator_contact: 'ai-workshop@iiitbh.ac.in',
        registration_link: 'https://forms.college.edu/ai-workshop',
        registration_deadline: new Date(event1Start.getTime() - 24 * 60 * 60 * 1000),
        eligibility: 'Open to all engineering students with basic Python knowledge',
        preparation_notes: 'Please install Python 3.10+, VSCode, and bring your laptop with battery charged. Pre-configured Google Colab links will be provided.',
        faqs: JSON.stringify([
          { question: 'Will participation certificates be issued?', answer: 'Yes, verified digital certificates will be issued to all participants who complete the hands-on lab.' },
          { question: 'Is prior experience in Deep Learning mandatory?', answer: 'No, fundamental concepts will be explained from scratch.' },
        ]),
        status: 'upcoming',
      },
      {
        id: uuidv4(),
        title: 'HackMatrix 2026: 36-Hour National Hackathon',
        category: 'tech',
        description: 'Annual flagship software and hardware hackathon. Build innovative solutions across Smart Education, FinTech, Healthcare, and Sustainable Tech.',
        start_time: event2Start,
        end_time: event2End,
        venue: 'Campus Innovation Center & Computing Labs',
        organizer: 'Technical Council & Entrepreneurship Cell',
        coordinator_name: 'Aditya Raj',
        coordinator_contact: '+91 99887 76655',
        registration_link: 'https://hackmatrix.college.edu',
        registration_deadline: new Date(event2Start.getTime() - 48 * 60 * 60 * 1000),
        eligibility: 'Teams of 2-4 undergraduate and postgraduate students',
        preparation_notes: 'Draft your problem statements early. GitHub repos must be initialized after kickoff ceremony.',
        faqs: JSON.stringify([
          { question: 'Is food and accommodation provided for the 36 hours?', answer: 'Yes, complimentary meals and rest spaces are arranged on campus.' },
          { question: 'What are the cash prizes?', answer: 'Cash prize pool of INR 1,50,000 along with internship interviews for top 5 teams.' },
        ]),
        status: 'upcoming',
      },
      {
        id: uuidv4(),
        title: 'Campus Placement & Core Engineering Mock Drive',
        category: 'placement',
        description: 'Simulated online assessment test followed by technical and HR interview rounds with alumni working at top tech firms.',
        start_time: event3Start,
        end_time: event3End,
        venue: 'Seminar Complex & Training Placement Center',
        organizer: 'Training & Placement Cell (T&P)',
        coordinator_name: 'Prof. V. Sharma',
        coordinator_contact: 'placements@iiitbh.ac.in',
        registration_link: 'https://portal.college.edu/tp-mock',
        registration_deadline: new Date(event3Start.getTime() - 24 * 60 * 60 * 1000),
        eligibility: 'Exclusively for pre-final and final year registered students',
        preparation_notes: 'Carry two printed copies of your updated resume in standard single-page format and college ID card.',
        faqs: JSON.stringify([
          { question: 'What is the dress code?', answer: 'Strictly formal western attire or smart formal wear.' },
        ]),
        status: 'upcoming',
      },
    ];

    for (const e of events) {
      await db('events').insert({
        ...e,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  // 6. Seed Booking Slots
  const slotCount = await db('booking_slots').count('id as count').first();
  if (parseInt((slotCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding booking slots for clubs and facilities...');
    const facilities = [
      'Robotics & IoT Innovation Lab',
      'Main Campus Auditorium',
      'Computer Centre Lab 1 (High Performance Lab)',
      'Computer Centre Lab 2 (Software Development Lab)',
      'High Performance Computing & AI Cluster Lab',
      'VLSI & Embedded Systems Design Lab',
      'Seminar Hall 1 (Administrative Complex)',
      'Seminar Hall 2 (Academic Block)',
      'Music & Cultural Society Room (Tarang)',
      'Basketball & Volleyball Sports Court',
      'Badminton & Table Tennis Indoor Pavilion',
      'Sports Ground & Cricket Pavilion',
      'Open Air Amphitheatre & Student Quadrangle',
      'Central Library Discussion & Study Vault Room',
      'Conference Room A (Senate & Faculty Hall)',
    ];

    const slotTimes = [
      ['09:00', '12:00'],
      ['14:00', '17:00'],
      ['17:30', '20:30'],
    ];

    const today = new Date();
    for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
      const d = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];

      for (const facName of facilities) {
        for (const t of slotTimes) {
          const cleanFac = facName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
          const cleanStart = t[0].replace(':', '');
          await db('booking_slots').insert({
            id: `slot-${cleanFac}-${dateStr}-${cleanStart}`,
            facility_or_club: facName,
            slot_date: dateStr,
            start_time: t[0],
            end_time: t[1],
            is_available: true,
            max_capacity: 1,
            notes: 'Equipped with presentation screen, Gigabit LAN, and climate control.',
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
  }

  // 7. Seed Sample Study Material
  const materialCount = await db('study_materials').count('id as count').first();
  const adminUser = await db('users').where({ role: 'super_admin' }).first();

  if (parseInt((materialCount as any)?.count || '0', 10) === 0) {
    console.log('Seeding sample study resources...');
    if (adminUser) {
      await db('study_materials').insert([
        {
          id: uuidv4(),
          title: 'Data Structures & Algorithms Comprehensive Lecture Notes',
          subject: 'Data Structures (CS201)',
          department: 'Computer Science and Engineering',
          academic_year: '2nd Year',
          semester: 'Semester 3',
          category: 'notes',
          description: 'Detailed derivations and implementations of Trees, Heaps, Graphs, Dynamic Programming, and Amortized Time Analysis.',
          tags: 'DSA, Algorithms, Trees, Graphs, DP',
          file_path: 'sample_dsa_notes.pdf',
          original_filename: 'DSA_Comprehensive_Guide_2026.pdf',
          file_size: 4200000,
          file_type: 'PDF',
          uploader_id: adminUser.id,
          downloads_count: 142,
          is_flagged: false,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          title: 'Operating Systems End-Term Question Papers (2022-2025)',
          subject: 'Operating Systems (CS302)',
          department: 'Computer Science and Engineering',
          academic_year: '3rd Year',
          semester: 'Semester 5',
          category: 'pyq',
          description: 'Official end-term examination papers with handwritten numerical solutions for CPU Scheduling, Banker Algorithm, and Paging.',
          tags: 'OS, PYQ, Solved, Deadlocks, Paging',
          file_path: 'sample_os_pyqs.pdf',
          original_filename: 'OS_Solved_PYQ_Collection.pdf',
          file_size: 2800000,
          file_type: 'PDF',
          uploader_id: adminUser.id,
          downloads_count: 98,
          is_flagged: false,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          title: 'Digital Signal Processing Complete Lab Manual & MATLAB Codes',
          subject: 'Digital Signal Processing (EC304)',
          department: 'Electronics and Communication',
          academic_year: '3rd Year',
          semester: 'Semester 6',
          category: 'practical',
          description: 'Verified lab files with MATLAB implementation scripts for FFT, Butterworth/Chebyshev filter designs, and Z-transform plots.',
          tags: 'DSP, MATLAB, Lab Manual, FFT, Filters',
          file_path: 'sample_dsp_manual.pdf',
          original_filename: 'DSP_Lab_Manual_Verified.pdf',
          file_size: 3100000,
          file_type: 'PDF',
          uploader_id: adminUser.id,
          downloads_count: 76,
          is_flagged: false,
          created_at: new Date(),
        },
      ]);
    }
  }

  // Seed verified ADHYAAY curriculum vault materials (PYQs, Notes, Syllabus)
  if (adminUser) {
    const existingMaterialIds = new Set((await db('study_materials').select('id')).map((r: any) => r.id));
    const materialsToInsert = adhyayeMaterials
      .filter((m: any) => !existingMaterialIds.has(m.id))
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        subject: m.subject,
        department: m.department,
        academic_year: m.academic_year,
        semester: m.semester,
        category: m.category,
        description: m.description,
        tags: m.tags,
        file_path: m.file_path,
        original_filename: m.original_filename,
        file_size: m.file_size,
        file_type: m.file_type,
        uploader_id: adminUser.id,
        downloads_count: m.downloads_count || 0,
        is_flagged: false,
        created_at: new Date(m.created_at || Date.now()),
      }));

    if (materialsToInsert.length > 0) {
      console.log(`Seeding ${materialsToInsert.length} curriculum materials from ADHYAAY academic vault...`);
      await db.batchInsert('study_materials', materialsToInsert, 50);
    }
  }

  // 8. Seed sample Student Connect discussion
  const connectCount = await db('messages').where({ context_type: 'student_connect' }).count('id as count').first();
  if (parseInt((connectCount as any)?.count || '0', 10) === 0) {
    const studentUser = await db('users').where({ role: 'student' }).first();
    if (studentUser) {
      const postId = uuidv4();
      await db('messages').insert({
        id: postId,
        context_type: 'student_connect',
        context_id: 'Academics & Advice',
        parent_id: null,
        user_id: studentUser.id,
        anonymous_alias: 'Anonymous Student #4012',
        content: 'Hi everyone! Any seniors here who can suggest how to best balance semester projects with competitive programming and placement prep? Would really appreciate practical tips on time management.',
        tags: 'advice, seniors, placements, cp',
        is_pinned: true,
        is_flagged: false,
        created_at: new Date(Date.now() - 3600 * 1000),
      });

      await db('messages').insert({
        id: uuidv4(),
        context_type: 'student_connect',
        context_id: 'Academics & Advice',
        parent_id: postId,
        user_id: studentUser.id,
        anonymous_alias: 'Anonymous Student #8821',
        content: 'What worked best for me: Block out 1.5 hours strictly every morning for LeetCode/Codeforces before classes start. Dedicate weekends to your capstone project.',
        tags: null,
        is_pinned: false,
        is_flagged: false,
        created_at: new Date(Date.now() - 1800 * 1000),
      });
    }
  }

  // 9. Seed sample Student Issue (to demonstrate tracking ID ISSUE-10021)
  const issueCount = await db('student_issues').count('id as count').first();
  if (parseInt((issueCount as any)?.count || '0', 10) === 0) {
    const studentUser = await db('users').where({ role: 'student' }).first();
    if (studentUser) {
      const issueId = uuidv4();
      await db('student_issues').insert({
        id: issueId,
        tracking_id: 'ISSUE-10021',
        user_id: studentUser.id,
        category: 'hostel',
        title: 'Water filtration system maintenance required in Block 2 second floor',
        description: 'The RO water dispenser on the 2nd floor of Hostel Block 2 has low pressure and requires cartridge replacement.',
        location: 'Hostel Block 2, 2nd Floor Water Station',
        status: 'under_review',
        created_at: new Date(Date.now() - 24 * 3600 * 1000),
        updated_at: new Date(),
      });

      await db('issue_messages').insert({
        id: uuidv4(),
        issue_id: issueId,
        sender_role: 'admin',
        sender_id: studentUser.id,
        message: 'Hostel maintenance team has logged this request. Technician will inspect tomorrow between 10 AM and 12 PM.',
        created_at: new Date(Date.now() - 12 * 3600 * 1000),
      });
    }
  }

  console.log('Database seeding verified successfully.');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
