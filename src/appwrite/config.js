import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Appwrite endpoint
  .setProject("6956479a002cb6075a9d");              // 🔴 replace with your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const BUCKET_ID = "6957d9df0019e749a227";
export const DATABASE_ID = "6956ba3a003ab5b4406a";
export const COLLECTION_ID = "files";

export { client };
