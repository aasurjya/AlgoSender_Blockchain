import mongoose from 'mongoose';

// Global is used here to maintain a cached connection across hot reloads in development
interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algosender';

let cached = (global as unknown as GlobalWithMongoose).mongoose;

if (!cached) {
  cached = (global as unknown as GlobalWithMongoose).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
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

// Transaction Model
const transactionSchema = new mongoose.Schema(
  {
    txId: { type: String, required: true, unique: true, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    note: { type: String, maxlength: 1000 },
    confirmedRound: { type: Number },
  },
  { timestamps: true }
);

export const Transaction = mongoose.models.Transaction || 
  mongoose.model('Transaction', transactionSchema);
