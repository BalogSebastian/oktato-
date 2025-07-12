// Fájl: lib/types.ts

import { Document, Schema } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'USER';

// ÚJ: A Fejezet (Chapter) interfésze, most már típussal és pontértékkel
export interface IChapter {
  _id: Schema.Types.ObjectId;
  title: string;
  type: 'lesson' | 'quiz'; // Lehet tananyag vagy kvíz
  content: string; // A tananyag szövege vagy a kvíz kérdéseinek JSON-je
  points: number; // Hány pontot ér a teljesítése
}

// ÚJ: A Modul interfésze, ami fejezeteket csoportosít
export interface IModule {
    _id: Schema.Types.ObjectId;
    title: string;
    chapters: IChapter[];
}

// MÓDOSÍTOTT: Az Oktatás (Course) most már modulokból áll
export interface ICourse extends Document {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  modules: IModule[]; // A 'chapters' helyett most 'modules' van
  createdAt: Date;
}

// MÓDOSÍTOTT: A Haladás (Progress) most már a pontszámot is követi
export interface IProgress extends Document {
    user: Schema.Types.ObjectId;
    course: Schema.Types.ObjectId;
    score: number; // Összegyűjtött pontszám
    completedChapters: Schema.Types.ObjectId[];
    isCompleted: boolean;
}

// A Client és User interfészek változatlanok, de a teljesség kedvéért itt vannak
export interface IClient extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  adminUser: Schema.Types.ObjectId;
  subscribedCourses: Schema.Types.ObjectId[];
  licenseCount: number;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  email: string;
  password?: string;
  role: UserRole;
  client?: Schema.Types.ObjectId;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}