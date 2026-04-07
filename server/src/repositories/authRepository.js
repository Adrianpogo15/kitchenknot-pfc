const { pool, query } = require("../config/db");

async function findUserByEmail(email) {
  const result = await query(
    `
      SELECT
        u.id,
        u.email,
        u.username,
        u.password_hash,
        u.is_active,
        u.deleted_at,
        u.created_at,
        u.updated_at,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.bio,
        up.birth_date
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE LOWER(u.email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function findUserByUsername(username) {
  const result = await query(
    `
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
    `,
    [username]
  );

  return result.rows[0] || null;
}

async function findUserById(userId) {
  const result = await query(
    `
      SELECT
        u.id,
        u.email,
        u.username,
        u.is_active,
        u.deleted_at,
        u.created_at,
        u.updated_at,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.bio,
        up.birth_date
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function createUser({ email, username, passwordHash, firstName, lastName, bio, birthDate, avatarUrl }) {
  const result = await query(
    `
      WITH inserted_user AS (
        INSERT INTO users (email, username, password_hash)
        VALUES (LOWER($1), $2, $3)
        RETURNING id, email, username, is_active, created_at, updated_at
      ),
      inserted_profile AS (
        INSERT INTO user_profiles (user_id, first_name, last_name, bio, birth_date, avatar_url)
        SELECT id, $4, $5, $6, $7, $8
        FROM inserted_user
        RETURNING user_id, first_name, last_name, bio, birth_date, avatar_url
      )
      SELECT
        iu.id,
        iu.email,
        iu.username,
        iu.is_active,
        iu.created_at,
        iu.updated_at,
        ip.first_name,
        ip.last_name,
        ip.avatar_url,
        ip.bio,
        ip.birth_date
      FROM inserted_user iu
      JOIN inserted_profile ip ON ip.user_id = iu.id
    `,
    [email, username, passwordHash, firstName, lastName, bio, birthDate, avatarUrl]
  );

  return result.rows[0];
}

async function updateUserProfile(userId, { firstName, lastName, bio, birthDate, avatarUrl, removeAvatar }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        UPDATE users
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [userId]
    );

    await client.query(
      `
        INSERT INTO user_profiles (user_id, first_name, last_name, bio, birth_date, avatar_url, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET
          first_name = $2,
          last_name = $3,
          bio = $4,
          birth_date = $5,
          avatar_url = CASE
            WHEN $7 THEN NULL
            WHEN $6 IS NOT NULL THEN $6
            ELSE user_profiles.avatar_url
          END,
          updated_at = CURRENT_TIMESTAMP
      `,
      [userId, firstName, lastName, bio, birthDate, avatarUrl, removeAvatar]
    );

    const result = await client.query(
      `
        SELECT
          u.id,
          u.email,
          u.username,
          u.is_active,
          u.deleted_at,
          u.created_at,
          u.updated_at,
          up.first_name,
          up.last_name,
          up.avatar_url,
          up.bio,
          up.birth_date
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deactivateUser(userId) {
  await query(
    `
      UPDATE users
      SET
        is_active = FALSE,
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
    [userId]
  );
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateUserProfile,
  deactivateUser
};
