import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export interface BlogAttributes {
  id?: number;
  title: string;
  slug: string;
  description: string;
  author: number;
  content: string;
  image?: string;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class BlogModel extends Model<BlogAttributes> implements BlogAttributes {
  public id!: number;
  public title!: string;
  public slug!: string;
  public description!: string;
  public author!: number;
  public content!: string;
  public image!: string;
  public isPublished!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;
}

BlogModel.init(
  {
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.STRING,
    author: { type: DataTypes.INTEGER, allowNull: false },
    content: DataTypes.TEXT,
    image: { type: DataTypes.STRING, defaultValue: null },
    isPublished: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deletedAt: { type: DataTypes.DATE, defaultValue: null },
  },
  {
    sequelize,
    modelName: 'Blog',
    tableName: 'blogs',
    timestamps: false,
  }
);

// Associations will be set up after all models are defined
export const associateModels = (models: any) => {
  BlogModel.belongsTo(models.UserModel, { foreignKey: 'author', targetKey: 'id' });
  BlogModel.hasMany(models.CommentModel, { foreignKey: 'blog', sourceKey: 'id' });
  BlogModel.hasMany(models.LikeModel, { foreignKey: 'blog', sourceKey: 'id' });
};
