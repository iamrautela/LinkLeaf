import { query } from '../database/connection.js';

// @desc    Get all contacts for a user
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search, tag, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE c.user_id = $1';
    let queryParams = [userId];
    let paramCount = 1;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (
        c.name ILIKE $${paramCount} OR 
        c.email ILIKE $${paramCount} OR 
        c.company ILIKE $${paramCount} OR 
        c.notes ILIKE $${paramCount}
      )`;
      queryParams.push(`%${search}%`);
    }

    // Add tag filter
    if (tag) {
      paramCount++;
      whereClause += ` AND EXISTS (
        SELECT 1 FROM contact_tags ct 
        JOIN tags t ON ct.tag_id = t.id 
        WHERE ct.contact_id = c.id AND t.name = $${paramCount}
      )`;
      queryParams.push(tag);
    }

    // Validate sortBy and sortOrder
    const allowedSortFields = ['name', 'email', 'company', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get contacts with tags
    const contactsQuery = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.job_title,
        c.avatar_url,
        c.notes,
        c.website,
        c.address,
        c.birthday,
        c.is_favorite,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'name', t.name,
              'color', t.color
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.${sortField} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const contactsResult = await query(contactsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        contacts: contactsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.job_title,
        c.avatar_url,
        c.notes,
        c.website,
        c.address,
        c.birthday,
        c.is_favorite,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'name', t.name,
              'color', t.color
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = $1 AND c.user_id = $2
      GROUP BY c.id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: {
        contact: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
export const createContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      company,
      jobTitle,
      avatarUrl,
      notes,
      website,
      address,
      birthday,
      isFavorite = false,
      tags = []
    } = req.body;

    // Start transaction
    const client = await query.getClient();
    await client.query('BEGIN');

    try {
      // Create contact
      const contactResult = await client.query(
        `INSERT INTO contacts (
          user_id, name, email, phone, company, job_title, 
          avatar_url, notes, website, address, birthday, is_favorite
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [userId, name, email, phone, company, jobTitle, avatarUrl, notes, website, address, birthday, isFavorite]
      );

      const contact = contactResult.rows[0];

      // Add tags if provided
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Get or create tag
          let tagResult = await client.query(
            'SELECT id FROM tags WHERE name = $1',
            [tagName]
          );

          let tagId;
          if (tagResult.rows.length === 0) {
            // Create new tag
            const newTagResult = await client.query(
              'INSERT INTO tags (name) VALUES ($1) RETURNING id',
              [tagName]
            );
            tagId = newTagResult.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }

          // Link tag to contact
          await client.query(
            'INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)',
            [contact.id, tagId]
          );
        }
      }

      await client.query('COMMIT');

      // Get the complete contact with tags
      const completeContactResult = await query(
        `SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.company,
          c.job_title,
          c.avatar_url,
          c.notes,
          c.website,
          c.address,
          c.birthday,
          c.is_favorite,
          c.created_at,
          c.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', t.id,
                'name', t.name,
                'color', t.color
              )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'
          ) as tags
        FROM contacts c
        LEFT JOIN contact_tags ct ON c.id = ct.contact_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = $1
        GROUP BY c.id`,
        [contact.id]
      );

      res.status(201).json({
        success: true,
        data: {
          contact: completeContactResult.rows[0]
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      company,
      jobTitle,
      avatarUrl,
      notes,
      website,
      address,
      birthday,
      isFavorite,
      tags
    } = req.body;

    // Check if contact exists and belongs to user
    const existingContact = await query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingContact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Start transaction
    const client = await query.getClient();
    await client.query('BEGIN');

    try {
      // Update contact
      const updateFields = [];
      const updateValues = [];
      let paramCount = 0;

      const fieldsToUpdate = {
        name,
        email,
        phone,
        company,
        job_title: jobTitle,
        avatar_url: avatarUrl,
        notes,
        website,
        address,
        birthday,
        is_favorite: isFavorite
      };

      Object.entries(fieldsToUpdate).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          updateValues.push(value);
        }
      });

      if (updateFields.length > 0) {
        paramCount++;
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        await client.query(
          `UPDATE contacts SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
          updateValues
        );
      }

      // Update tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        await client.query(
          'DELETE FROM contact_tags WHERE contact_id = $1',
          [id]
        );

        // Add new tags
        if (tags.length > 0) {
          for (const tagName of tags) {
            // Get or create tag
            let tagResult = await client.query(
              'SELECT id FROM tags WHERE name = $1',
              [tagName]
            );

            let tagId;
            if (tagResult.rows.length === 0) {
              // Create new tag
              const newTagResult = await client.query(
                'INSERT INTO tags (name) VALUES ($1) RETURNING id',
                [tagName]
              );
              tagId = newTagResult.rows[0].id;
            } else {
              tagId = tagResult.rows[0].id;
            }

            // Link tag to contact
            await client.query(
              'INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)',
              [id, tagId]
            );
          }
        }
      }

      await client.query('COMMIT');

      // Get updated contact with tags
      const updatedContactResult = await query(
        `SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.company,
          c.job_title,
          c.avatar_url,
          c.notes,
          c.website,
          c.address,
          c.birthday,
          c.is_favorite,
          c.created_at,
          c.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', t.id,
                'name', t.name,
                'color', t.color
              )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'
          ) as tags
        FROM contacts c
        LEFT JOIN contact_tags ct ON c.id = ct.contact_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = $1
        GROUP BY c.id`,
        [id]
      );

      res.json({
        success: true,
        data: {
          contact: updatedContactResult.rows[0]
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if contact exists and belongs to user
    const existingContact = await query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingContact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Delete contact (cascade will handle related records)
    await query('DELETE FROM contacts WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private
export const getContactStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_contacts,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_contacts,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week_contacts
      FROM contacts 
      WHERE user_id = $1`,
      [userId]
    );

    const tagStatsResult = await query(
      `SELECT 
        t.name,
        COUNT(ct.contact_id) as contact_count
      FROM tags t
      LEFT JOIN contact_tags ct ON t.id = ct.tag_id
      LEFT JOIN contacts c ON ct.contact_id = c.id AND c.user_id = $1
      GROUP BY t.id, t.name
      ORDER BY contact_count DESC
      LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        topTags: tagStatsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};
