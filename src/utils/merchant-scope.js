import { getUser } from './auth';
import { U_TYPE_MERCHANT } from '../router/menuConfig';

/** 商家角色下给列表/统计类请求附加 merchantId，后端据此按本店过滤；其他角色原样透传 */
export function withMerchantScope(params) {
  const u = getUser();
  const isMerchant = u && Number(u.uType) === U_TYPE_MERCHANT && u.uId;
  return isMerchant ? { ...(params || {}), merchantId: u.uId } : (params || {});
}
