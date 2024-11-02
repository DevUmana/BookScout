import User, { IUserDocument } from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js";

interface Context {
  user?: IUserDocument | null;
}

interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginUserArgs {
  input: {
    email: string;
    password: string;
  };
}

interface SaveBookArgs {
  input: {
    authors: string[];
    description: string;
    title: string;
    bookId: string;
    image: string;
    link: string;
  };
}

interface RemoveBookArgs {
  bookId: string;
}

const resolvers = {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ): Promise<IUserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("Not logged in.");
      }

      try {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      } catch (err) {
        console.error("Error retrieving user data:", err);
        throw new Error("Failed to retrieve user data.");
      }
    },
  },
  Mutation: {
    addUser: async (
      _parent: unknown,
      { input }: AddUserArgs
    ): Promise<{
      token: string;
      user: IUserDocument;
    }> => {
      try {
        const user = await User.create({ ...input });
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (err) {
        console.error("Error creating user:", err);
        throw new Error("Failed to create user.");
      }
    },
    login: async (
      _parent: unknown,
      { input }: LoginUserArgs
    ): Promise<{
      token: string;
      user: IUserDocument;
    }> => {
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new AuthenticationError("Couldn't find user with this email!");
        }

        const correctPw = await user.isCorrectPassword(input.password);
        if (!correctPw) {
          throw new AuthenticationError("Incorrect password!");
        }

        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (err) {
        console.error("Error logging in user:", err);
        throw new Error("Login failed. Please try again.");
      }
    },
    saveBook: async (
      _parent: unknown,
      { input }: SaveBookArgs,
      context: Context
    ): Promise<IUserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error("User not found.");
        }

        return updatedUser;
      } catch (err) {
        console.error("Error saving book:", err);
        throw new Error("Failed to save book.");
      }
    },
    removeBook: async (
      _parent: unknown,
      args: RemoveBookArgs,
      context: Context
    ): Promise<IUserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("User not found.");
        }

        return updatedUser;
      } catch (err) {
        console.error("Error deleting book:", err);
        throw new Error("Failed to delete book.");
      }
    },
  },
};

export default resolvers;
