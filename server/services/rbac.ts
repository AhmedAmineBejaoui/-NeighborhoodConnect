import { User } from '@shared/schema';

export const PERMISSIONS = {
  READ_POSTS: 'read:posts',
  CREATE_POSTS: 'create:posts',
  EDIT_OWN_POSTS: 'edit:own_posts',
  DELETE_OWN_POSTS: 'delete:own_posts',
  MODERATE_POSTS: 'moderate:posts',
  READ_REPORTS: 'read:reports',
  RESOLVE_REPORTS: 'resolve:reports',
  MANAGE_COMMUNITY: 'manage:community',
  MANAGE_USERS: 'manage:users',
} as const;

export const ROLE_PERMISSIONS = {
  resident: [
    PERMISSIONS.READ_POSTS,
    PERMISSIONS.CREATE_POSTS,
    PERMISSIONS.EDIT_OWN_POSTS,
    PERMISSIONS.DELETE_OWN_POSTS,
  ],
  moderator: [
    PERMISSIONS.READ_POSTS,
    PERMISSIONS.CREATE_POSTS,
    PERMISSIONS.EDIT_OWN_POSTS,
    PERMISSIONS.DELETE_OWN_POSTS,
    PERMISSIONS.MODERATE_POSTS,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.RESOLVE_REPORTS,
  ],
  admin: [
    PERMISSIONS.READ_POSTS,
    PERMISSIONS.CREATE_POSTS,
    PERMISSIONS.EDIT_OWN_POSTS,
    PERMISSIONS.DELETE_OWN_POSTS,
    PERMISSIONS.MODERATE_POSTS,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.RESOLVE_REPORTS,
    PERMISSIONS.MANAGE_COMMUNITY,
    PERMISSIONS.MANAGE_USERS,
  ],
} as const;

export class RBACService {
  static hasPermission(user: User, permission: string): boolean {
    for (const role of user.roles) {
      if (ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.includes(permission as any)) {
        return true;
      }
    }
    return false;
  }

  static hasRole(user: User, role: string): boolean {
    return user.roles.includes(role as any);
  }

  static hasAnyRole(user: User, roles: string[]): boolean {
    return roles.some(role => user.roles.includes(role as any));
  }

  static canModerate(user: User): boolean {
    return this.hasAnyRole(user, ['admin', 'moderator']);
  }

  static canManageCommunity(user: User): boolean {
    return this.hasRole(user, 'admin');
  }
}
