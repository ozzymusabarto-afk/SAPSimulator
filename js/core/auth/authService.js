import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { firebaseAuth, firebaseConfigured } from '../firebase/firebaseClient.js';
import { NexusUser, UserRole, UserStatus } from './nexusUser.js';

export const AUTH_DEV_ENV_BANNER = 'PILOTO FECHADO • AUTENTICAÇÃO FIREBASE';

function firebaseUserToNexusUser(user) {
  if (!user) return null;
  return new NexusUser({
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Trainee SD',
    email: user.email || '',
    role: UserRole.USER,
    status: user.disabled ? UserStatus.SUSPENDED : UserStatus.ACTIVE,
    createdAt: user.metadata?.creationTime || new Date().toISOString(),
    lastAccessAt: new Date().toISOString()
  });
}

function translateFirebaseError(error) {
  const messages = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Informe um endereço de e-mail válido.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/user-disabled': 'Esta conta está desativada. Entre em contato com o suporte.'
  };
  return messages[error?.code] || 'Não foi possível concluir a operação. Tente novamente.';
}

export class AuthService {
  constructor() {
    this._listeners = new Set();
    this._currentUser = null;
    this._unsubscribe = null;
    this._initialize();
  }

  _initialize() {
    if (!firebaseConfigured) return;
    this._unsubscribe = onAuthStateChanged(firebaseAuth, user => {
      this._currentUser = firebaseUserToNexusUser(user);
      this._notifyListeners();
    });
  }

  getCurrentUser() {
    return this._currentUser;
  }

  onAuthStateChanged(callback) {
    if (typeof callback !== 'function') return () => {};
    this._listeners.add(callback);
    if (this._currentUser) callback(this._currentUser);
    return () => this._listeners.delete(callback);
  }

  _notifyListeners() {
    for (const callback of this._listeners) {
      try {
        callback(this._currentUser);
      } catch (error) {
        console.error('[AuthService] Erro no listener de autenticação:', error);
      }
    }
  }

  _ensureConfigured() {
    if (!firebaseConfigured) {
      throw new Error('O ambiente do piloto ainda não foi configurado.');
    }
  }

  async loginWithEmail(email, password) {
    this._ensureConfigured();
    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        String(email || '').trim().toLowerCase(),
        String(password || '')
      );
      const user = firebaseUserToNexusUser(credential.user);
      this._currentUser = user;
      return { user };
    } catch (error) {
      throw new Error(translateFirebaseError(error));
    }
  }

  async register({ name, email, password, passwordConfirm }) {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    if (cleanName.length < 3) throw new Error('O nome completo deve ter no mínimo 3 caracteres.');
    if (!cleanEmail.includes('@')) throw new Error('Informe um endereço de e-mail válido.');
    if (cleanPass.length < 12) throw new Error('A senha deve ter no mínimo 12 caracteres.');
    if (!/[A-Z]/.test(cleanPass) || !/[a-z]/.test(cleanPass) || !/[0-9]/.test(cleanPass)) {
      throw new Error('A senha deve conter maiúscula, minúscula e número.');
    }
    if (passwordConfirm !== undefined && cleanPass !== String(passwordConfirm)) {
      throw new Error('As senhas informadas não coincidem.');
    }

    this._ensureConfigured();
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, cleanPass);
      await updateProfile(credential.user, { displayName: cleanName });
      const user = firebaseUserToNexusUser(credential.user);
      this._currentUser = user;
      return { user };
    } catch (error) {
      throw new Error(translateFirebaseError(error));
    }
  }

  async sendPasswordReset(email) {
    this._ensureConfigured();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail.includes('@')) throw new Error('Informe um e-mail válido para recuperação.');
    try {
      await sendPasswordResetEmail(firebaseAuth, cleanEmail);
      return { sent: true, email: cleanEmail, message: 'Enviamos as instruções de redefinição para o seu e-mail.' };
    } catch (error) {
      throw new Error(translateFirebaseError(error));
    }
  }

  async changePassword(currentPassword, newPassword) {
    this._ensureConfigured();
    const user = firebaseAuth.currentUser;
    if (!user?.email) throw new Error('Nenhum usuário autenticado.');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error) {
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
        throw new Error('Senha atual incorreta.');
      }
      throw new Error(translateFirebaseError(error));
    }
  }

  async logout() {
    this._ensureConfigured();
    await signOut(firebaseAuth);
    this._currentUser = null;
    this._notifyListeners();
  }

  async loginWithGoogle() {
    throw new Error('O login com Google ainda não faz parte deste piloto. Use e-mail e senha.');
  }

  async switchToDefaultTrainee() {
    throw new Error('O acesso rápido de desenvolvimento foi removido da versão do piloto.');
  }
}

export const authService = new AuthService();
