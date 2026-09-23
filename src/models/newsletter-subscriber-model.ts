import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export interface NewsletterSubscriberAttributes {
  id?: number;
  email: string;
  isActive?: boolean;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NewsletterSubscriberModel extends Model<NewsletterSubscriberAttributes> implements NewsletterSubscriberAttributes {
  public id!: number;
  public email!: string;
  public isActive!: boolean;
  public subscribedAt!: Date;
  public unsubscribedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSubscriberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    subscribedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'subscribed_at',
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'unsubscribed_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'NewsletterSubscriber',
    tableName: 'newsletter_subscribers',
    timestamps: false, // We're using custom timestamp fields
  }
);

// Associations will be set up after all models are defined
export const associateModels = (models: any) => {
  // No associations needed for newsletter subscribers
  // They are independent entities
}; 