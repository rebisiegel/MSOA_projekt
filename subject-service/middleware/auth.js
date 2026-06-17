import jwt from 'jsonwebtoken';

const secret = 'secretkey';

export function authenticateToken(req, res, next) {
  if (!req.cookies || !req.cookies.auth) {
    res.locals.user = null;
    return next();
  }

  try {
    const token = req.cookies.auth;
    const user = jwt.verify(token, secret);
    req.user = user;
    res.locals.user = user;
  } catch (error) {
    console.log('hiba a cookienal');
    res.clearCookie('auth');
    res.locals.user = null;
  }
  return next();
}

export function requireAuth(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Bejelentkezés szükséges' });
    }
    res.locals.user = req.user;
    return next();
  } catch (error) {
    console.error('Hiba a requireAuth middlewarenel:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export function requireAdmin(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Csak adminok vegezthetik az adott feladatot' });
    }

    res.locals.user = req.user;
    return next();
  } catch (error) {
    console.error('Hiba a requireAdmin middlewarenel:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export function requireTeacher(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Csak tanárok vegezthetik az adott feladatot' });
    }

    res.locals.user = req.user;
    return next();
  } catch (error) {
    console.error('Hiba a requireTeacher middlewarenel:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}


export function requireStudent(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Csak diákok vegezthetik az adott feladatot' });
    }

    res.locals.user = req.user;
    return next();
  } catch (error) {
    console.error('Hiba a requireStudent middlewarenel:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}