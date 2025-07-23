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

// A Client interfész
export interface IClient extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  adminUser: Schema.Types.ObjectId;
  subscribedCourses: Schema.Types.ObjectId[];
  licenseCount: number;
  createdAt: Date;
}

// MÓDOSÍTOTT: Az IUser interfész 'client' mezőjének típusa
export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  email: string;
  password?: string;
  role: UserRole;
  // JAVÍTVA: A 'client' mező most már lehet ObjectId VAGY a populált IClient objektum.
  client?: Schema.Types.ObjectId | IClient; 
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
// ÚJ: A Fizetés (Payment) interfésze
export interface IPayment extends Document {
  _id: Schema.Types.ObjectId;
  client: Schema.Types.ObjectId; // Melyik kliens fizetett
  user: Schema.Types.ObjectId;   // Melyik felhasználó (CLIENT_ADMIN) kezdeményezte
  amount: number;                // A fizetett összeg (szimulált)
  licensesAdded: number;         // Hány licenszt adtak hozzá
  packageType: '5_LICENSES' | '10_LICENSES' | '15_LICENSES' | '20_LICENSES' | 'CUSTOM'; // Vásárolt csomag típusa
  status: 'pending' | 'completed' | 'failed'; // Fizetés státusza
  transactionId?: string;        // Külső tranzakció ID (pl. Stripe ID, ha lenne)
  createdAt: Date;
}

// ÚJ: A Beállítás (Setting) interfésze
export interface ISetting extends Document {
  _id: Schema.Types.ObjectId;
  key: string; // Pl. 'siteTitle', 'sendgridApiKey', 'defaultLicenseCount'
  value: any; // A beállítás értéke (string, number, boolean, object)
  description?: string; // Rövid leírás a beállításról
  type: 'string' | 'number' | 'boolean' | 'json'; // A beállítás típusának segítése a UI-n
  createdAt: Date;
  updatedAt: Date;
}