import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';
import { userService } from '../user/user.service.js';
import { loggerService } from '../../services/logger.service.js';

const cryptr = new Cryptr(process.env.SECRET || 'Secret');

export const authService = { getLoginToken, validateToken, login, signup };

function getLoginToken(user) {
   const str = JSON.stringify(user);
   return cryptr.encrypt(str);
}

function validateToken(token) {
   try {
      const json = cryptr.decrypt(token);
      const loggedInUser = JSON.parse(json);
      return loggedInUser;
   } catch (err) {
      console.error('Could not parse login token');
   }
}

async function login(username, password) {
   var user = await userService.getByUsername(username);
   if (!user) throw 'Unkown username';

   //  un-comment for real login
   // const match = await bcrypt.compare(password, user.password)
   // if (!match) throw 'Invalid username or password'

   // Removing passwords and personal data
   const miniUser = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      isAdmin: user.isAdmin,
   };
   return miniUser;
}

async function signup({ username, password, fullname }) {
   const saltRounds = 10;

   loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`);
   if (!username || !password || !fullname) throw 'Missing required signup information';

   const userExist = await userService.getByUsername(username);
   if (userExist) throw 'Username already taken';

   const hash = await bcrypt.hash(password, saltRounds);
   return userService.save({ username, password: hash, fullname });
}
