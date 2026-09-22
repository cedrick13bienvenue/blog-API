import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel, Gender } from '../models/user-model';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Guarantee googleId is always a string
    const googleId: string = profile.id ? profile.id : '';
    // Find or create user in PostgreSQL
    let user = await UserModel.findOne({ where: { googleId } });
    if (!user) {
      // If user with this email exists, link Google account
      user = await UserModel.findOne({ where: { email: profile.emails?.[0].value || '' } });
      if (user) {
        user.googleId = googleId;
        user.photo = profile.photos?.[0].value || '';
        await user.save();
      } else {
        // Create new user
        user = await UserModel.create({
          googleId,
          name: profile.displayName || '',
          email: profile.emails?.[0].value || '',
          password: '', // Google users don't have a password
          gender: Gender.Other, // Use enum value
          photo: profile.photos?.[0].value || '',
          isActive: true,
        });
      }
    }
    return done(null, user);
  } catch (err) {
    return done(err, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await UserModel.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, undefined);
  }
}); 