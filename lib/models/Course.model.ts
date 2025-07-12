// Fájl: lib/models/Course.model.ts

import { Schema, model, models } from 'mongoose';
import { ICourse, IModule, IChapter } from '@/lib/types';

const ChapterSchema = new Schema<IChapter>({
  title: { type: String, required: true },
  type: { type: String, enum: ['lesson', 'quiz'], required: true, default: 'lesson' },
  content: { type: String, required: true },
  points: { type: Number, required: true, default: 10 },
});

const ModuleSchema = new Schema<IModule>({
    title: { type: String, required: true },
    chapters: [ChapterSchema],
});

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  modules: [ModuleSchema],
  createdAt: { type: Date, default: Date.now },
});

const Course = models.Course || model<ICourse>('Course', CourseSchema);

export default Course;