import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export interface LikeAttributes {
  id?: number;
  blog: number;
  user: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LikeModel extends Model<LikeAttributes> implements LikeAttributes {
  public id!: number;
  public blog!: number;
  public user!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

LikeModel.init(
  {
    blog: { type: DataTypes.INTEGER, allowNull: false }, // Will be associated later
    user: { type: DataTypes.INTEGER, allowNull: false }, // Will be associated later
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true,
  }
);

// Associations will be set up after all models are defined
export const associateModels = (models: any) => {
  LikeModel.belongsTo(models.BlogModel, { foreignKey: 'blog', targetKey: 'id' });
  LikeModel.belongsTo(models.UserModel, { foreignKey: 'user', targetKey: 'id' });
};
