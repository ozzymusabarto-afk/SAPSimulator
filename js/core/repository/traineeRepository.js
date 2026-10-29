/**
 * Nexus ERP Lab • SD Practice Environment
 * Repositório de Persistência do Aluno (Trainee Repository)
 * Módulo: js/core/repository/traineeRepository.js
 * 
 * Abstração que isola o armazenamento local (localStorage) das regras de negócio
 * e engines pedagógicas. Prepara o sistema para sincronização em nuvem sem alterar
 * os consumidores no núcleo operacional.
 */

import {
  PhaseId,
  createUserJourney,
  createDefaultEntitlements,
  createDefaultCompetencies
} from '../models/journey.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore, firebaseConfigured } from '../firebase/firebaseClient.js';

const STORAGE_KEYS = Object.freeze({
  PROFILE_V3: 'nexustech_trainee_profile_v3',
  PROFILE_V2: 'nexustech_trainee_profile_v2',
  ATTEMPTS: 'nexustech_mission_attempts_v1',
  ENTITLEMENTS: 'nexustech_user_entitlements_v1',
  COMPETENCIES: 'nexustech_user_competencies_v1',
  ACTIVE_STATE: 'nexustech_active_scenario_state_v1',
  DIAGNOSTICS: 'nexustech_diagnostic_evaluations_v1'
});

class TraineeRepository {
  constructor() {
    this._memoryStore = new Map();
    this._currentUserId = 'TRAINEE_01';
    this._cloudWriteChain = Promise.resolve();
  }

  setSessionUserId(userId) {
    this._currentUserId = userId || 'TRAINEE_01';
  }

  getCurrentUserId() {
    return this._currentUserId || 'TRAINEE_01';
  }

  _resolveKey(baseKey) {
    if (!this._currentUserId || this._currentUserId === 'TRAINEE_01' || this._currentUserId === 'trainee_default') {
      return baseKey;
    }
    return `${baseKey}_${this._currentUserId}`;
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

  _isLocalStorageAvailable() {
    const storage = this._getStorage();
    if (!storage) return false;
    try {
      const testKey = '__nexus_ls_test__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  _getItem(key) {
    const targetKey = this._resolveKey(key);
    const storage = this._getStorage();
    if (storage) {
      try {
        return storage.getItem(targetKey);
      } catch (e) {
        console.warn(`[TraineeRepository] Falha ao ler ${targetKey}:`, e);
      }
    }
    return this._memoryStore.get(targetKey) || null;
  }

  _setItem(key, value) {
    const targetKey = this._resolveKey(key);
    const storage = this._getStorage();
    if (storage) {
      try {
        storage.setItem(targetKey, value);
        return;
      } catch (e) {
        // F1-B: Tratamento de QuotaExceededError (localStorage cheio)
        const isQuotaError = e instanceof DOMException && (
          e.code === 22 || // Chrome/Safari legacy
          e.code === 1014 || // Firefox legacy
          e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        );

        if (isQuotaError) {
          console.warn('[TraineeRepository] localStorage cheio. Tentando rotacionar dados antigos...');
          try {
            // Estratégia de recuperação: remove os logs de tentativas mais antigos
            // que são os dados com maior volume e menor criticidade
            const attemptsKey = this._resolveKey(STORAGE_KEYS.ATTEMPTS);
            const rawAttempts = storage.getItem(attemptsKey);
            if (rawAttempts) {
              const attempts = JSON.parse(rawAttempts);
              // Mantém apenas os 50 mais recentes (eram até 500)
              const trimmed = attempts.slice(0, 50);
              storage.setItem(attemptsKey, JSON.stringify(trimmed));
              // Tenta gravar novamente após liberar espaço
              storage.setItem(targetKey, value);
              console.warn('[TraineeRepository] Espaço liberado por rotação de tentativas. Dados salvos com sucesso.');
              return;
            }
          } catch (retryError) {
            console.error('[TraineeRepository] Falha na recuperação de espaço. Dados serão mantidos apenas em memória.', retryError);
          }
        } else {
          console.warn(`[TraineeRepository] Falha ao gravar ${targetKey}:`, e);
        }
      }
    }
    // Fallback: mantém em memória (evita crash do app)
    this._memoryStore.set(targetKey, value);
  }

  _removeItem(key) {
    const targetKey = this._resolveKey(key);
    const storage = this._getStorage();
    if (storage) {
      try {
        storage.removeItem(targetKey);
        return;
      } catch (e) {
        console.warn(`[TraineeRepository] Falha ao remover ${targetKey}:`, e);
      }
    }
    this._memoryStore.delete(targetKey);
  }

  // ==========================================
  // 1. PERFIL DO ALUNO & RETROCOMPATIBILIDADE
  // ==========================================

  getRawProfile() {
    try {
      const rawV3 = this._getItem(STORAGE_KEYS.PROFILE_V3);
      if (rawV3) return JSON.parse(rawV3);

      const rawV2 = this._getItem(STORAGE_KEYS.PROFILE_V2);
      if (rawV2) return JSON.parse(rawV2);
    } catch (e) {
      console.warn('[TraineeRepository] Erro ao parsear perfil armazenado:', e);
    }
    return null;
  }

  saveProfile(profile) {
    if (!profile) return;
    try {
      // Garante timestamp de atualização
      profile.updatedAt = new Date().toISOString();
      this._setItem(STORAGE_KEYS.PROFILE_V3, JSON.stringify(profile));
      this._queueCloudProfileWrite(profile);
    } catch (e) {
      console.error('[TraineeRepository] Erro ao salvar perfil:', e);
    }
  }

  _queueCloudProfileWrite(profile) {
    const userId = this.getCurrentUserId();
    if (!firebaseConfigured || !userId || userId === 'TRAINEE_01' || userId === 'trainee_default') return;

    const snapshot = JSON.parse(JSON.stringify(profile));
    this._cloudWriteChain = this._cloudWriteChain
      .then(() => setDoc(doc(firestore, 'users', userId), {
        profile: snapshot,
        updatedAt: serverTimestamp()
      }, { merge: true }))
      .catch(error => console.error('[TraineeRepository] Falha ao sincronizar perfil:', error));
  }

  /**
   * Carrega o perfil remoto antes de o TraineeEngine iniciar a jornada.
   * O cache local continua sendo usado como fallback quando o documento ainda não existe.
   */
  async hydrateProfileFromCloud(userId = this.getCurrentUserId()) {
    if (!firebaseConfigured || !userId || userId === 'TRAINEE_01' || userId === 'trainee_default') return null;
    try {
      const remote = await getDoc(doc(firestore, 'users', userId));
      const remoteProfile = remote.exists() ? remote.data()?.profile : null;
      if (remoteProfile) {
        this._setItem(STORAGE_KEYS.PROFILE_V3, JSON.stringify(remoteProfile));
        return remoteProfile;
      }
    } catch (error) {
      console.error('[TraineeRepository] Falha ao carregar perfil remoto:', error);
    }
    return null;
  }

  // ==========================================
  // 2. JORNADA DO USUÁRIO (USER JOURNEY)
  // ==========================================

  getJourney(userId = 'trainee_default') {
    const profile = this.getRawProfile();
    if (profile && profile.journey) {
      return profile.journey;
    }
    return createUserJourney(userId, PhaseId.TRAINEE);
  }

  saveJourney(journey) {
    if (!journey) return;
    const profile = this.getRawProfile();
    if (profile) {
      profile.journey = journey;
      this.saveProfile(profile);
    }
  }

  // ==========================================
  // 3. REGISTRO DE TENTATIVAS (MISSION ATTEMPTS)
  // ==========================================

  getAllAttempts() {
    try {
      const raw = this._getItem(STORAGE_KEYS.ATTEMPTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('[TraineeRepository] Erro ao parsear tentativas:', e);
    }
    return [];
  }

  getAttemptsForScenario(scenarioId) {
    if (!scenarioId) return [];
    return this.getAllAttempts().filter(a => a.scenarioId === scenarioId);
  }

  getAttemptCount(scenarioId) {
    if (!scenarioId) return 0;
    return this.getAttemptsForScenario(scenarioId).length;
  }

  saveAttempt(attempt) {
    if (!attempt || !attempt.scenarioId) return;
    try {
      const attempts = this.getAllAttempts();
      attempts.unshift(attempt);
      
      // Limita a 500 registros mais recentes para conter uso de memória local
      if (attempts.length > 500) {
        attempts.length = 500;
      }
      this._setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.error('[TraineeRepository] Erro ao gravar tentativa:', e);
    }
  }

  // ==========================================
  // 4. ENTITLEMENTS (CONTROLE DE ACESSO)
  // ==========================================

  getEntitlements(userId = 'trainee_default') {
    try {
      const raw = this._getItem(STORAGE_KEYS.ENTITLEMENTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[TraineeRepository] Erro ao parsear entitlements:', e);
    }
    const def = createDefaultEntitlements(userId);
    this.saveEntitlements(def);
    return def;
  }

  saveEntitlements(entitlements) {
    if (!entitlements) return;
    try {
      this._setItem(STORAGE_KEYS.ENTITLEMENTS, JSON.stringify(entitlements));
    } catch (e) {
      console.error('[TraineeRepository] Erro ao gravar entitlements:', e);
    }
  }

  // ==========================================
  // 5. RESUME / ESTADO DA MISSÃO ATIVA
  // ==========================================

  getActiveScenarioState() {
    try {
      const raw = this._getItem(STORAGE_KEYS.ACTIVE_STATE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[TraineeRepository] Erro ao parsear estado da missão ativa:', e);
    }
    return null;
  }

  saveActiveScenarioState(state) {
    if (!state) return;
    try {
      state.savedAt = new Date().toISOString();
      this._setItem(STORAGE_KEYS.ACTIVE_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('[TraineeRepository] Erro ao salvar estado da missão ativa:', e);
    }
  }

  clearActiveScenarioState() {
    this._removeItem(STORAGE_KEYS.ACTIVE_STATE);
  }

  // ==========================================
  // 6. MATRIZ DE COMPETÊNCIAS
  // ==========================================

  getCompetencies(userId = 'trainee_default') {
    try {
      const raw = this._getItem(STORAGE_KEYS.COMPETENCIES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[TraineeRepository] Erro ao parsear competências:', e);
    }
    const def = createDefaultCompetencies(userId);
    this.saveCompetencies(def);
    return def;
  }

  saveCompetencies(competencies) {
    if (!competencies) return;
    try {
      this._setItem(STORAGE_KEYS.COMPETENCIES, JSON.stringify(competencies));
    } catch (e) {
      console.error('[TraineeRepository] Erro ao salvar competências:', e);
    }
  }

  // ==========================================
  // 7. AVALIAÇÕES DIAGNÓSTICAS (CHEFE WILSON)
  // ==========================================

  getDiagnosticEvaluation(userId = 'trainee_default') {
    const list = this.getAllDiagnosticEvaluations();
    return list.find(d => d.userId === userId) || null;
  }

  getAllDiagnosticEvaluations() {
    try {
      const raw = this._getItem(STORAGE_KEYS.DIAGNOSTICS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('[TraineeRepository] Erro ao parsear avaliações diagnósticas:', e);
    }
    return [];
  }

  saveDiagnosticEvaluation(evaluation) {
    if (!evaluation || !evaluation.evaluationId) return;
    try {
      const list = this.getAllDiagnosticEvaluations();
      const existingIdx = list.findIndex(e => e.evaluationId === evaluation.evaluationId);
      if (existingIdx >= 0) {
        list[existingIdx] = evaluation;
      } else {
        list.unshift(evaluation);
      }
      this._setItem(STORAGE_KEYS.DIAGNOSTICS, JSON.stringify(list));
    } catch (e) {
      console.error('[TraineeRepository] Erro ao salvar avaliação diagnóstica:', e);
    }
  }

  // ==========================================
  // MÉTODOS ASSÍNCRONOS PREPARADOS PARA NUVEM
  // ==========================================

  async getProfileAsync() {
    return this.getRawProfile();
  }

  async saveProfileAsync(profile) {
    this.saveProfile(profile);
  }

  async saveAttemptAsync(attempt) {
    this.saveAttempt(attempt);
  }
}

export const traineeRepository = new TraineeRepository();
