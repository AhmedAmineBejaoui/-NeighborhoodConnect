import { UserModel, UserDocument } from "./models/User";
import { PostModel } from "./models/Post";
import { CommentModel } from "./models/Comment";
import { CommunityModel } from "./models/Community";
import { NotificationModel } from "./models/Notification";
import { ReportModel } from "./models/Report";
import { VoteModel } from "./models/Vote";
import type { User, InsertUser } from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return undefined;
      
      return {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        roles: user.roles && user.roles.length ? user.roles : ['resident'],
        communityIds: user.communityIds?.map(id => id.toString()) || [],
        createdAt: user.createdAt || new Date(),
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
      if (!user) return undefined;
      
      return {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        roles: user.roles && user.roles.length ? user.roles : ['resident'],
        communityIds: user.communityIds?.map(id => id.toString()) || [],
        createdAt: user.createdAt || new Date(),
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      const user = new UserModel({
        email: userData.email.toLowerCase(),
        name: userData.name,
        passwordHash,
        roles: userData.roles || ['resident'],
        communityIds: userData.communityIds || [],
      });

      const savedUser = await user.save();
      
      return {
        id: (savedUser._id as any).toString(),
        email: savedUser.email,
        name: savedUser.name,
        roles: savedUser.roles && savedUser.roles.length ? savedUser.roles : ['resident'],
        communityIds: savedUser.communityIds?.map(id => id.toString()) || [],
        createdAt: savedUser.createdAt || new Date(),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) return null;

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return null;

      return {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        roles: user.roles && user.roles.length ? user.roles : ['resident'],
        communityIds: user.communityIds?.map(id => id.toString()) || [],
        createdAt: user.createdAt || new Date(),
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }
}

export const storage = new MongoStorage();
