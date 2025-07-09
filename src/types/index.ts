// Центральный экспорт всех типов проекта
export * from './campaign';
export * from './feedback';
export * from './reactions';

// Переэкспортируем типы из lib для обратной совместимости
export type {
  UserProfile,
  TeamMember,
  Vertical,
  UserRole,
  UserRoleData,
  UserData,
} from '../lib/types';
