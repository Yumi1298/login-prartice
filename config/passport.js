const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");

passport.use(
  new GoogleStrategy(
    {
      // GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET 可自命名
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入google strategy 的區域");
      console.log(profile);
      console.log("====================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已經註冊過了，無須存入資料庫內");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶。需將資料存入資料庫");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功創建新用戶");
        // done第一個參數是passport規定的，寫null即可
        done(null, savedUser);
      }
    }
  )
);