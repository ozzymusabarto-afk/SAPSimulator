/**
 * Nexus ERP Lab • Authentication Service & Mock Provider
 * Módulo: js/core/auth/authService.js
 * 
 * Interface desacoplada de autenticação preparada para futuros provedores (Firebase, Supabase, OAuth).
 * Implementa o DevMockAuthProvider isolado para ambiente de desenvolvimento local.
 * 
 * SEGURANÇA:
 * - Não armazena senhas em texto puro.
 * - Explicitamente marcado como AMBIENTE DE DESENVOLVIMENTO LOCAL • AUTH MOCK.
 * - Role ADMIN não pode ser concedida pelo mock do frontend.
 */

import { NexusUser, UserRole, UserStatus, createDefaultDevUser } from './nexusUser.js';

// Sinalização programática obrigatória de ambiente de desenvolvimento
if (typeof window !== 'undefined') {
  window.__NEXUS_DEV_MODE__ = true;
}

export const AUTH_DEV_ENV_BANNER = 'AMBIENTE DE DESENVOLVIMENTO • AUTH MOCK • NÃO USAR PARA DADOS REAIS';

const STORAGE_KEYS = Object.freeze({
  SESSION: 'nexustech_auth_session_dev_v1',
  MOCK_USERS: 'nexustech_auth_users_dev_v1'
});

/**
 * Função utilitária de hashing simulado (evita texto puro no localStorage de dev)
 */
function devSimulatedHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'dev_hash_' + (hash >>> 0).toString(16);
}

export class AuthService {
  constructor() {
    this._listeners = new Set();
    this._currentUser = null;
    this._initSession();
  }

  _getStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch {
      return null;
    }
    return null;
  }

  _initSession() {
    const storage = this._getStorage();
    if (!storage) {
      this._currentUser = createDefaultDevUser();
      return;
    }

    try {
      const rawSession = storage.getItem(STORAGE_KEYS.SESSION);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        this._currentUser = NexusUser.fromJSON(parsed);
      } else {
        this._currentUser = null;
      }
    } catch (e) {
      console.warn('[AuthService] Falha ao restaurar sessão:', e);
      this._currentUser = null;
    }
  }

  _getUsersDb() {
    const storage = this._getStorage();
    if (!storage) return [];
    let users = [];
    try {
      const raw = storage.getItem(STORAGE_KEYS.MOCK_USERS);
      if (raw) users = JSON.parse(raw);
    } catch {}

    if (!Array.isArray(users)) {
      users = [];
    }

    // Seed/upsert com o usuário dev padrão para garantir presença e integridade
    const defaultUser = createDefaultDevUser();
    const defaultEmail = defaultUser.email.toLowerCase().trim();
    const existingIndex = users.findIndex(u => (u.email || '').toLowerCase().trim() === defaultEmail);

    if (existingIndex === -1) {
      users.push({
        uid: defaultUser.uid,
        name: defaultUser.name,
        email: defaultUser.email,
        passwordHash: devSimulatedHash('TraineeDev2026!'),
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: defaultUser.createdAt
      });
      try {
        storage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(users));
      } catch {}
    } else {
      // Garante que o trainee dev oficial sempre possua a senha padrão 'TraineeDev2026!' sincronizada
      const currentHash = users[existingIndex].passwordHash;
      const expectedHash = devSimulatedHash('TraineeDev2026!');
      if (currentHash !== expectedHash) {
        users[existingIndex].passwordHash = expectedHash;
        users[existingIndex].uid = defaultUser.uid;
        try {
          storage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(users));
        } catch {}
      }
    }

    return users;
  }

  _saveUsersDb(users) {
    const storage = this._getStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(users));
      } catch (e) {
        console.warn('[AuthService] Falha ao persistir mock users:', e);
      }
    }
  }

  _saveSession(user) {
    this._currentUser = user;
    const storage = this._getStorage();
    if (storage) {
      try {
        if (user) {
          storage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user.toJSON()));
        } else {
          storage.removeItem(STORAGE_KEYS.SESSION);
        }
      } catch (e) {
        console.warn('[AuthService] Falha ao persistir sessão:', e);
      }
    }
    this._notifyListeners();
  }

  _notifyListeners() {
    for (const cb of this._listeners) {
      try {
        cb(this._currentUser);
      } catch (e) {
        console.error('[AuthService] Erro no listener de auth:', e);
      }
    }
  }

  /**
   * Retorna o usuário autenticado atualmente
   * @returns {NexusUser|null}
   */
  getCurrentUser() {
    return this._currentUser;
  }

  /**
   * Registra um ouvinte para mudanças de estado de autenticação
   * @param {Function} callback 
   * @returns {Function} Unsubscribe
   */
  onAuthStateChanged(callback) {
    if (typeof callback !== 'function') return () => {};
    this._listeners.add(callback);
    // Dispara imediatamente o estado atual
    try {
      callback(this._currentUser);
    } catch (e) {
      console.error('[AuthService] Erro na invocação inicial do listener:', e);
    }
    return () => this._listeners.delete(callback);
  }

  /**
   * Autenticação com e-mail e senha
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ user: NexusUser }>}
   */
  async loginWithEmail(email, password) {
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPass = String(password || '').trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const users = this._getUsersDb();
    const targetHash = devSimulatedHash(cleanPass);
    const found = users.find(u => u.email === cleanEmail);

    if (!found) {
      throw new Error('Credenciais inválidas ou usuário não encontrado no ambiente de desenvolvimento.');
    }

    if (found.passwordHash !== targetHash) {
      throw new Error('Senha incorreta para o usuário informado.');
    }

    const nexusUser = new NexusUser({
      uid: found.uid,
      name: found.name,
      email: found.email,
      role: found.role || UserRole.USER,
      status: found.status || UserStatus.ACTIVE,
      createdAt: found.createdAt,
      lastAccessAt: new Date().toISOString()
    });

    this._saveSession(nexusUser);
    return { user: nexusUser };
  }

  /**
   * Autenticação via Google (estrutura de mock e placeholder)
   * @returns {Promise<{ user: NexusUser }>}
   */
  async loginWithGoogle() {
    // Placeholder com simulação de fluxo seguro em ambiente dev
    const defaultDev = createDefaultDevUser();
    defaultDev.lastAccessAt = new Date().toISOString();
    this._saveSession(defaultDev);
    return { user: defaultDev };
  }

  /**
   * Cadastro de nova conta no ambiente de desenvolvimento
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} [params.passwordConfirm]
   * @returns {Promise<{ user: NexusUser }>}
   */
  async register({ name, email, password, passwordConfirm }) {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPass = String(password || '').trim();

    if (!cleanName || cleanName.length < 3) {
      throw new Error('O nome completo deve ter no mínimo 3 caracteres.');
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Informe um endereço de e-mail válido.');
    }

    if (!cleanPass || cleanPass.length < 12) {
      throw new Error('A senha deve ter no mínimo 12 caracteres.');
    }

    if (!/[A-Z]/.test(cleanPass) || !/[a-z]/.test(cleanPass) || !/[0-9]/.test(cleanPass)) {
      throw new Error('A senha deve conter maiúscula, minúscula e número.');
    }

    if (passwordConfirm !== undefined && cleanPass !== String(passwordConfirm).trim()) {
      throw new Error('As senhas informadas não coincidem.');
    }

    const users = this._getUsersDb();
    if (users.some(u => u.email === cleanEmail)) {
      throw new Error('Este e-mail já está cadastrado no sistema.');
    }

    // Gera UID único para o novo usuário
    const newUid = 'USER_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    
    // Regra estrita: Novos usuários recebem estritamente a role USER (ADMIN bloqueado)
    const newUserRecord = {
      uid: newUid,
      name: cleanName,
      email: cleanEmail,
      passwordHash: devSimulatedHash(cleanPass),
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date().toISOString()
    };

    users.push(newUserRecord);
    this._saveUsersDb(users);

    const nexusUser = new NexusUser({
      uid: newUserRecord.uid,
      name: newUserRecord.name,
      email: newUserRecord.email,
      role: newUserRecord.role,
      status: newUserRecord.status,
      createdAt: newUserRecord.createdAt
    });

    this._saveSession(nexusUser);
    return { user: nexusUser };
  }

  /**
   * Envio de link de recuperação de senha
   * @param {string} email 
   * @returns {Promise<{ sent: boolean, message: string }>}
   */
  async sendPasswordReset(email) {
    const cleanEmail = String(email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Informe um e-mail válido para recuperação.');
    }

    // Não finge envio real; deixa explicitamente indicado que o recurso está preparado
    return {
      sent: true,
      email: cleanEmail,
      message: `[MOCK DEV] Solicitação de redefinição registrada para ${cleanEmail}. Em ambiente de produção com backend integrado, um link seguro com token temporário será despachado via SMTP/SendGrid.`
    };
  }

  /**
   * Encerramento de sessão
   */
  async logout() {
    this._saveSession(null);
  }

  /**
   * Helper para alternar rapidamente para o Trainee SD padrão
   */
  async switchToDefaultTrainee() {
    const defaultUser = createDefaultDevUser();
    this._saveSession(defaultUser);
    return { user: defaultUser };
  }
}

export const authService = new AuthService();
