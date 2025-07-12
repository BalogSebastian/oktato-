// Fájl: lib/models/Progress.model.ts

import { Schema, model, models } from 'mongoose';
import { IProgress } from '@/lib/types';

const ProgressSchema = new Schema<IProgress>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, default: 0 }, // <-- ÚJ MEZŐ
    completedChapters: [{ type: Schema.Types.ObjectId }],
    isCompleted: { type: Boolean, default: false },
}, { 
    timestamps: true 
});

ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = models.Progress || model<IProgress>('Progress', ProgressSchema);

export default Progress;