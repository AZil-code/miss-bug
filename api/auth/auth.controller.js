import { authService } from './auth.service.js';
import { loggerService } from '../../services/logger.service.js';

export async function login(req, res) {
   const { username, password } = req.body;

   try {
      const user = await authService.login(username, password);
      loggerService.info('User login: ', user);

      const loginToken = authService.getLoginToken(user);
      res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true });

      res.json(user);
   } catch (err) {
      loggerService.error('Failed login:', err);
      res.status(401).send({ err: 'Failed to Login' });
   }
}
export async function signup(req, res) {
   const credentials = req.body;
   try {
      const account = await authService.signup(credentials);
      loggerService.debug(`auth.route - new account created: ` + JSON.stringify(account));

      const user = await authService.login(credentials.username, credentials.password);
      loggerService.info('User signup:', user);

      const loginToken = await authService.getLoginToken(user);
      res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true });

      res.json(user);
   } catch (err) {
      loggerService.error('Failed singup ' + err);
      res.status(400).send({ err: 'Error on signup' });
   }
}

export async function logout(req, res) {
   try {
      res.clearCookie('loginToken');
      res.send('Logged out successfully');
   } catch (err) {
      res.status(400).send({ err: 'Logout failed' });
   }
}
