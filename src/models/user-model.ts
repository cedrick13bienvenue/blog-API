import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
  gender: Gender;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
  googleId?: string;
  photo?: string;
}

export class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public isActive!: boolean;
  public gender!: Gender;
  public role!: Role;
  public googleId!: string;
  public photo!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserModel.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    gender: { type: DataTypes.ENUM(...Object.values(Gender)), allowNull: false },
    role: { type: DataTypes.ENUM(...Object.values(Role)), defaultValue: Role.User },
    googleId: { type: DataTypes.STRING, unique: true, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

// Associations will be set up after all models are defined
export const associateModels = (models: any) => {
  UserModel.hasMany(models.BlogModel, { foreignKey: 'author', sourceKey: 'id' });
  UserModel.hasMany(models.CommentModel, { foreignKey: 'user', sourceKey: 'id' });
  UserModel.hasMany(models.LikeModel, { foreignKey: 'user', sourceKey: 'id' });
};
