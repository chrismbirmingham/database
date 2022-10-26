import Author from 'database-model/Author';
import Selector from 'database-model/Selector';
import { DecodedIdToken } from 'firebase-admin/auth';
import Db from './db';

export namespace AuthorizeResult {
  export enum Type {
    NotAuthorized = 'not-authorized',
    Authorized = 'authorized'
  }

  export interface NotAuthorized {
    type: Type.NotAuthorized;
  }

  export const NOT_AUTHORIZED: NotAuthorized = { type: Type.NotAuthorized };

  export interface Authorized {
    type: Type.Authorized;
    value: object;
  }

  export const authorized = (value: object): Authorized => ({ type: Type.Authorized, value });
}

export type AuthorizeResult = AuthorizeResult.NotAuthorized | AuthorizeResult.Authorized;

export default async (recordSelector: Selector, userId: string, db: Db): Promise<AuthorizeResult> => {
  const res = await db.get({ selector: recordSelector });
  if (res.type === 'error') return AuthorizeResult.NOT_AUTHORIZED;
  const { value } = res;
  if (!value || typeof value !== 'object') return AuthorizeResult.NOT_AUTHORIZED;

  if (!('author' in value)) return AuthorizeResult.NOT_AUTHORIZED;

  const author = value['author'] as Author;
  // Organizations aren't yet supported.
  if (author.type === Author.Type.Organization) return AuthorizeResult.NOT_AUTHORIZED;
  
  return author.id === userId
    ? AuthorizeResult.authorized(value)
    : AuthorizeResult.NOT_AUTHORIZED;
};