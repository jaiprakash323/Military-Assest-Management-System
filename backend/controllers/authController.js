import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { base: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base?.name || 'All Bases',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

/**
 * POST /api/auth/register
 * Admin-only user creation
 */
export const register = async (req, res) => {
  try {
    const { username, password, role, baseId } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required.' });
    }

    const validRoles = ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, passwordHash, role, baseId: baseId || null },
      include: { base: true },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base?.name || 'All Bases',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

/**
 * GET /api/auth/me
 * Return current user profile
 */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { base: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.baseId,
      baseName: user.base?.name || 'All Bases',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: error.message });
  }
};
