// test/insertResearcher.test.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

describe("MongoDB Insert Test", () => {
  let client;

  beforeAll(async () => {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  it("should insert a researcher into the collection", async () => {
    const db = client.db("research_news");
    const collection = db.collection("researchers");

    const testDoc = {
      name: "Angel Sun",
      email: "angel.sun@prudenceinv.com",
      department: "Fixed Income Research",
      createdAt: new Date("2024-05-14T00:00:00Z"),
    };

    const result = await collection.insertOne(testDoc);
    expect(result.insertedId).toBeDefined();

    // Cleanup (optional)
    // await collection.deleteOne({ _id: result.insertedId });
  });
});
