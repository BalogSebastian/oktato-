// lib/seed.ts (Módosítás - Add hozzá a seedSuperAdmin funkció végéhez, vagy egy új seed funkcióba)

import dbConnect from "./dbConnect";
import User from "./models/User.model";
import Course from "./models/Course.model";
import Setting from "./models/Setting.model"; // <-- ÚJ IMPORT
import * as bcrypt from "bcrypt";

export async function seedSuperAdmin() {
  await dbConnect();

  // Super Admin létrehozása (változatlan)
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (email && password) {
    const existingAdmin = await User.findOne({ email, role: 'SUPER_ADMIN' });
    if (!existingAdmin) {
      console.log("Super Admin nem található, létrehozás...");
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword, role: 'SUPER_ADMIN' });
      console.log(`Super Admin létrehozva: ${email}`);
    }
  }

  // Példa tanfolyam létrehozása (változatlan)
  const existingCourse = await Course.findOne({ title: "HACCP Mesterkurzus" });
  if (!existingCourse) {
    console.log("Nincs HACCP Mesterkurzus, létrehozom a példa adatot...");
    await Course.create({
      title: "HACCP Mesterkurzus",
      description: "Interaktív képzés az élelmiszerbiztonsági rendszerek profi szintű elsajátításához.",
      modules: [
        {
          title: "1. Modul: Az Alapok",
          chapters: [
            { title: "1.1 Bevezetés", type: 'lesson', content: "Üdv a HACCP Mesterkurzuson! Ebben a modulban megismerkedünk a rendszer alapjaival és fontosságával...", points: 10 },
            { title: "1.2 Kulcsfogalmak", type: 'lesson', content: "Tisztázzuk a legfontosabb fogalmakat: veszély, kockázat, CCP, CP...", points: 10 },
            { title: "1.3 Modulzáró Kvíz", type: 'quiz', content: `{ "questions": [{ "q": "Mi a HACCP?", "a": ["Egy autómodell", "Élelmiszerbiztonsági rendszer", "Egy szoftver"], "correct": 1 }] }`, points: 30 },
          ]
        },
        {
          title: "2. Modul: A Gyakorlat",
          chapters: [
            { title: "2.1 Veszélyelemzés a gyakorlatban", type: 'lesson', content: "Nézzünk egy valós példát egy étterem konyháján keresztül...", points: 10 },
            { title: "2.2 CCP-k Kijelölése", type: 'lesson', content: "Hogyan döntjük el, mi számít kritikus szabályozási pontnak?...", points: 10 },
            { title: "2.3 Modulzáró Kvíz", type: 'quiz', content: `{ "questions": [...] }`, points: 30 },
          ]
        },
      ]
    });
    console.log("HACCP Mesterkurzus példa adatokkal létrehozva.");
  }

  // ÚJ: Alapértelmezett beállítások seedelése
  const defaultSettings = [
    { key: 'siteTitle', value: 'Oktatási Platform', description: 'Az oldal fő címe', type: 'string' },
    { key: 'siteDescription', value: 'Online oktatási és képzési rendszer', description: 'Az oldal leírása', type: 'string' },
    { key: 'contactEmail', value: 'info@platform.hu', description: 'Általános kapcsolattartó e-mail cím', type: 'string' },
    { key: 'sendgridApiKey', value: process.env.SENDGRID_API_KEY || 'SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', description: 'SendGrid API kulcs e-mail küldéshez', type: 'string' },
    { key: 'sendgridFromEmail', value: process.env.SENDGRID_FROM_EMAIL || 'noreply@platform.hu', description: 'E-mailek feladója', type: 'string' },
    { key: 'sendgridFromName', value: process.env.SENDGRID_FROM_NAME || 'Oktatási Platform', description: 'E-mailek feladójának neve', type: 'string' },
    { key: 'defaultUserRole', value: 'USER', description: 'Alapértelmezett szerepkör új felhasználóknak', type: 'string' },
    { key: 'licensePackage5Price', value: 50, description: '5 licenszes csomag ára (Ft)', type: 'number' },
    { key: 'licensePackage10Price', value: 90, description: '10 licenszes csomag ára (Ft)', type: 'number' },
    { key: 'licensePackage15Price', value: 120, description: '15 licenszes csomag ára (Ft)', type: 'number' },
    { key: 'licensePackage20Price', value: 150, description: '20 licenszes csomag ára (Ft)', type: 'number' },
  ];

  for (const setting of defaultSettings) {
    const existingSetting = await Setting.findOne({ key: setting.key });
    if (!existingSetting) {
      await Setting.create(setting);
      console.log(`Beállítás hozzáadva: ${setting.key}`);
    }
  }
}