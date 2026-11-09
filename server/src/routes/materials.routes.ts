import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { authenticate, requireVerified } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate, requireVerified);

// 1. GET ALL STUDY MATERIALS WITH SEARCH & FILTERS
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, subject, semester, department, category, sort } = req.query;

    let query = db('study_materials')
      .where({ is_flagged: false })
      .select(
        'id',
        'title',
        'subject',
        'department',
        'academic_year',
        'semester',
        'category',
        'description',
        'tags',
        'original_filename',
        'file_size',
        'file_type',
        'downloads_count',
        'created_at',
        'uploader_id'
      );

    if (search && typeof search === 'string') {
      const s = `%${search}%`;
      query = query.where(function () {
        this.where('title', 'like', s)
          .orWhere('subject', 'like', s)
          .orWhere('description', 'like', s)
          .orWhere('tags', 'like', s);
      });
    }

    if (subject && typeof subject === 'string') {
      query = query.where({ subject });
    }

    if (semester && typeof semester === 'string' && semester !== 'all') {
      query = query.where({ semester });
    }

    if (department && typeof department === 'string' && department !== 'all') {
      query = query.where({ department });
    }

    if (category && typeof category === 'string' && category !== 'all') {
      query = query.where({ category });
    }

    if (sort === 'downloads') {
      query = query.orderBy('downloads_count', 'desc');
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    const materials = await query;
    const userId = req.user!.id;

    // Secure anonymity: Do not reveal uploader's real identity to normal students
    const safeMaterials = materials.map((m) => ({
      ...m,
      is_owner: m.uploader_id === userId,
      uploader_id: undefined, // Hide private database ID from public responses
    }));

    res.status(200).json(safeMaterials);
  } catch (err) {
    next(err);
  }
});

// 2. UPLOAD STUDY MATERIAL
router.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Please select a document or resource file to upload.' });
        return;
      }

      const schema = z.object({
        title: z.string().min(3, 'Title must be at least 3 characters'),
        subject: z.string().min(2, 'Subject is required'),
        department: z.string().min(1, 'Department is required'),
        academic_year: z.string().min(1, 'Academic year is required'),
        semester: z.string().min(1, 'Semester is required'),
        category: z.string().min(1, 'Category is required'),
        description: z.string().optional().default(''),
        tags: z.string().optional().default(''),
      });

      const data = schema.parse(req.body);
      const materialId = uuidv4();
      const ext = path.extname(req.file.originalname).toLowerCase();

      const newMaterial = {
        id: materialId,
        title: data.title.trim(),
        subject: data.subject.trim(),
        department: data.department.trim(),
        academic_year: data.academic_year.trim(),
        semester: data.semester.trim(),
        category: data.category.trim(),
        description: data.description.trim(),
        tags: data.tags.trim(),
        file_path: req.file.filename,
        original_filename: req.file.originalname,
        file_size: req.file.size,
        file_type: ext.replace('.', '').toUpperCase(),
        uploader_id: req.user!.id,
        downloads_count: 0,
        is_flagged: false,
        created_at: new Date(),
      };

      await db('study_materials').insert(newMaterial);

      res.status(201).json({
        message: 'Study material uploaded successfully!',
        material: {
          id: materialId,
          title: newMaterial.title,
          subject: newMaterial.subject,
          category: newMaterial.category,
          original_filename: newMaterial.original_filename,
          file_size: newMaterial.file_size,
          file_type: newMaterial.file_type,
          created_at: newMaterial.created_at,
          is_owner: true,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. DOWNLOAD STUDY MATERIAL
router.get('/:id/download', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const material = await db('study_materials').where({ id }).first();

    if (!material) {
      res.status(404).json({ error: 'Study material not found.' });
      return;
    }

    const fullPath = path.join(ENV.UPLOAD_DIR, material.file_path);
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'Physical file not found on server.' });
      return;
    }

    // Increment download counter
    await db('study_materials').where({ id }).increment('downloads_count', 1);

    res.download(fullPath, material.original_filename);
  } catch (err) {
    next(err);
  }
});

// 4. REPORT INAPPROPRIATE MATERIAL
router.post('/:id/report', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = z.object({ reason: z.string().min(5) }).parse(req.body);

    const material = await db('study_materials').where({ id }).first();
    if (!material) {
      res.status(404).json({ error: 'Study material not found.' });
      return;
    }

    const existing = await db('reports')
      .where({ target_type: 'material', target_id: id, reporter_id: userId })
      .first();

    if (existing) {
      res.status(400).json({ error: 'You have already reported this resource.' });
      return;
    }

    await db('reports').insert({
      id: uuidv4(),
      target_type: 'material',
      target_id: id,
      reporter_id: userId,
      reason: reason.trim(),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Thank you. The resource has been reported for administrative review.' });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE MATERIAL (OWNER OR ADMIN)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = ['super_admin', 'admin'].includes(req.user!.role);

    const material = await db('study_materials').where({ id }).first();
    if (!material) {
      res.status(404).json({ error: 'Study material not found.' });
      return;
    }

    if (material.uploader_id !== userId && !isAdmin) {
      res.status(403).json({ error: 'You do not have permission to delete this file.' });
      return;
    }

    // Remove file from disk
    const filePath = path.join(ENV.UPLOAD_DIR, material.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to delete file from disk:', err);
      }
    }

    await db('study_materials').where({ id }).del();

    res.status(200).json({ message: 'Study material deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
