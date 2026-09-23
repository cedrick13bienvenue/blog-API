import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export interface CommentAttributes {
  id?: number;
  blog: number;
  user: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CommentModel extends Model<CommentAttributes> implements CommentAttributes {
  public id!: number;
  public blog!: number;
  public user!: number;
  public content!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CommentModel.init(
  {
    blog: { type: DataTypes.INTEGER, allowNull: false }, // Will be associated later
    user: { type: DataTypes.INTEGER, allowNull: false }, // Will be associated later
    content: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
  }
);

// Associations will be set up after all models are defined
export const associateModels = (models: any) => {
  CommentModel.belongsTo(models.BlogModel, { foreignKey: 'blog', targetKey: 'id' });
  CommentModel.belongsTo(models.UserModel, { foreignKey: 'user', targetKey: 'id' });
};
