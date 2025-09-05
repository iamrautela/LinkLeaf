import { query } from '../database/connection.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        id, email, first_name, last_name, avatar_url, 
        is_active, is_verified, last_login, created_at, updated_at
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          isActive: user.is_active,
          isVerified: user.is_verified,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, avatarUrl } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, avatar_url, updated_at`,
      [firstName, lastName, avatarUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
