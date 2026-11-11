import { getDictDataBatch } from '../api/dict';

let cache = Object.create(null);

/**
 * 批量加载并缓存字典数据，返回 { dictType: [{label, value}, ...] }。
 * 已缓存的类型不会重复请求。
 */
export async function loadDictCache(types, forceRefresh) {
  if (forceRefresh) types.forEach(t => delete cache[t]);
  const missed = types.filter(t => !cache[t]);
  if (missed.length === 0) return types.reduce((m, t) => { m[t] = cache[t]; return m; }, Object.create(null));
  try {
    const res = await getDictDataBatch(missed.join(','));
    const data = res.daoResult || {};
    missed.forEach(t => {
      const list = data[t] || [];
      cache[t] = list.map(d => ({ label: d.dictLabel, value: d.dictValue }));
    });
  } catch (e) {
    missed.forEach(t => { if (!cache[t]) cache[t] = []; });
  }
  return types.reduce((m, t) => { m[t] = cache[t] || []; return m; }, Object.create(null));
}

/**
 * 获取指定字典类型的选项列表（同步，需先 loadDictCache）。
 */
export function getDictOptions(dictType) {
  return cache[dictType] || [];
}

/** 清除缓存 */
export function clearDictCache() {
  cache = Object.create(null);
}