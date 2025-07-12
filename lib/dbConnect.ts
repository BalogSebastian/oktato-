// Fájl: lib/dbConnect.ts

import mongoose from 'mongoose';

// JAVÍTÁS: Importáljuk az összes modellt, hogy biztosan regisztrálva legyenek
// a Mongoose-ban, mielőtt bármilyen műveletet végeznénk velük.
// Ez a legbiztosabb módszer a "MissingSchemaError" elkerülésére.
import './models/User.model';
import './models/Client.model';
import './models/Course.model';


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;