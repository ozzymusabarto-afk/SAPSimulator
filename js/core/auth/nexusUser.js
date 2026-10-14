/**
 * Nexus ERP Lab • User Domain Model
 * Módulo: js/core/auth/nexusUser.js
 * 
 * Estrutura formal que representa o usuário do Nexus ERP Lab, seu perfil e progresso.
 * Desacoplada de provedores de autenticação externos (Supabase, Firebase, OAuth).
 */

export const UserRole = Object.freeze({
  USER: 'USER',
  ADMIN: 'ADMIN'
});

export const UserStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
});

export class NexusUser {
  /**
   * @param {Object} data
   * @param {string} data.uid - Identificador único do usuário
   * @param {string} data.name - Nome completo do usuário
   * @param {string} data.email - E-mail corporativo / pessoal
   * @param {string} [data.role] - Perfil de acesso ('USER' por padrão; ADMIN reservado)
   * @param {string} [data.status] - Estado da conta ('ACTIVE' por padrão)
   * @param {string} [data.createdAt] - ISO Date de criação
   * @param {string} [data.lastAccessAt] - ISO Date do último login
   * @param {Object} [data.progress] - Snapshot de progresso formativo
   */
  constructor({
    uid,
    name,
    email,
    role = UserRole.USER,
    status = UserStatus.ACTIVE,
    createdAt = new Date().toISOString(),
    lastAccessAt = new Date().toISOString(),
    progress = {}
  }) {
    if (!uid) throw new Error('NexusUser exige uid');
    if (!email) throw new Error('NexusUser exige email');

    this.uid = String(uid);
    this.name = String(name || 'Trainee SD');
    this.email = String(email).toLowerCase().trim();
    
    // Regra de Governança: Mock de frontend NUNCA pode conceder ADMIN a novos usuários
    this.role = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
    this.status = status;
    this.createdAt = createdAt;
    this.lastAccessAt = lastAccessAt;

    this.progress = {
      xp: progress.xp || 0,
      level: progress.level || 1,
      accuracy: progress.accuracy || 100,
      totalActions: progress.totalActions || 0,
      completedScenarios: Array.isArray(progress.completedScenarios) ? [...progress.completedScenarios] : [],
      badges: Array.isArray(progress.badges) ? [...progress.badges] : []
    };
  }

  get displayName() {
    return this.name;
  }

  toJSON() {
    return {
      uid: this.uid,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      lastAccessAt: this.lastAccessAt,
      progress: { ...this.progress }
    };
  }

  static fromJSON(json) {
    if (!json) return null;
    return new NexusUser(json);
  }
}

/**
 * Usuário oficial padrão de desenvolvimento
 */
export function createDefaultDevUser() {
  return new NexusUser({
    uid: 'TRAINEE_01',
    name: 'Trainee SAP SD',
    email: 'trainee.sd@nexus.lab',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: '2026-09-01T08:00:00.000Z',
    lastAccessAt: new Date().toISOString()
  });
}
