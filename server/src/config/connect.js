import mongoose from "mongoose";

export default async function connect() {
  try {
    let connect = await mongoose.connect(process.env.MONGO_URI);

    console.log(`\nConnected established successfully.\n\tConnection String :${connect.connection._connectionString},\n\tHost : ${connect.connection.host}`);



  } catch (err) {
    console.error(`Error connecting database: ${err}`);
  }
}
