import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import db from "./config/connection.js";
import { ApolloServer } from "@apollo/server"; // Note: Import from @apollo/server-express
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./services/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  await db();

  const PORT = process.env.PORT || 3001;
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server as any, {
      context: authenticateToken as any,
    })
  );

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "productionTest") {
    console.log("Running in production!");
    console.log(path.join(__dirname, "../../client/dist"));
    app.use(express.static(path.join(__dirname, "../../client/dist")));
  }

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();
