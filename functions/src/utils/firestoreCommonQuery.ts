import { DocumentData, Query } from "firebase-admin/firestore";
import { db } from "./firebase";

export type TGetDocsByIdsOpt<T> = {
  field?: string;
  addQuery?: (
    query: Query<DocumentData, DocumentData>,
  ) => Query<DocumentData, DocumentData>;
  construct?: new (...args: any[]) => T;
};

export async function getDocsByIds<T>(
  collectionName: string,
  docIds: string[],
  { addQuery, construct, field = "id" }: TGetDocsByIdsOpt<T> = {},
): Promise<T[]> {
  if (docIds.length === 0) {
    return [];
  }

  let q = db.collection(collectionName).where(field, "in", docIds);

  if (addQuery) {
    q = addQuery(q);
  }

  const result = await q.get();

  return result.docs.map((doc) => {
    if (construct) {
      return new construct(doc.data());
    }
    return doc.data() as T;
  });
}
