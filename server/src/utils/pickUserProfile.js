function pickUserProfile(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    profile: {
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      birthDate: user.birth_date
    }
  };
}

module.exports = pickUserProfile;
