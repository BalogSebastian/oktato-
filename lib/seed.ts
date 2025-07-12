// Fájl: lib/seed.ts

import dbConnect from "./dbConnect";
import User from "./models/User.model";
import Course from "./models/Course.model";
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

  // JAVÍTÁS: Példa tanfolyam létrehozása az új, moduláris struktúrával
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
}